/** Векторные таблицы экономики в PDF (jsPDF + DejaVu, без изменения calc) */
(function(global){
  'use strict';

  var FONT_FILE = 'DejaVuSans.ttf';
  var FONT_NAME = 'DejaVu';
  var fontLoadPromise = null;

  var COMPACT = {
    fontSize: 7,
    headerSize: 7.5,
    pad: 1.1,
    lineHMul: 0.38,
    minRowMm: 3.8,
    sectionTitleSize: 10.5,
    sectionTitleGap: 5,
    sectionBlockGap: 8,
    tableGap: 3,
    subTitleGap: 3.5,
    subTitleBeforeGap: 2,
    subTitleSize: 8
  };

  function pdfT(k){
    return (global.DG_t && global.DG_t(k)) || k;
  }

  function vectorSections(){
    return {
      'econ-yield-summary': [
        { titleKey: 'pdf.vec.yieldByCult', selector: '#econ-derived-panel table.econ-breakdown' }
      ],
      'econ-general': [
        { selector: '#econ-inputs-general', mode: 'econ-grid' }
      ],
      'econ-costs': [
        { selector: '#econ-inputs-costs', mode: 'econ-grid' }
      ],
      'econ-elec': [
        { titleKey: 'pdf.vec.electricity', selector: '#econ-elec-cats-inputs .econ-elec-cats-grid', mode: 'elec-cats' }
      ],
      'econ-payroll': [
        { selector: '#econ-payroll-body', mode: 'payroll-blocks' }
      ],
      'econ-equipment': [
        { selector: '#econ-equipment-groups', mode: 'equip-groups' },
        { selector: '#econ-equipment-total', mode: 'equip-total' }
      ],
      'econ-results': [
        { titleKey: 'pdf.vec.farmTotals', selector: '#econ-results-final-cards .econ-results', mode: 'metric-cards' },
        { titleKey: 'pdf.vec.byCult', selector: '#econ-cultures-breakdown' },
        { titleKey: 'pdf.vec.costsMargin', selector: '#econ-breakdown-table' }
      ],
      'econ-sensitivity': [
        { titleKey: 'pdf.vec.scenarios', selector: '#econ-sensitivity-body table.econ-sens-table' }
      ],
      'econ-payback': [
        { selector: '#econ-payback-body .econ-pb-callout', mode: 'payback-callout' },
        { titleKey: 'pdf.vec.payback', selector: '#econ-payback-body .econ-pb-grid', mode: 'kv-grid' },
        { selector: '#econ-payback-body .econ-pb-list', mode: 'pb-list' }
      ]
    };
  }

  function plainCellText(nodeOrStr){
    if (nodeOrStr == null) return '';
    var t;
    if (typeof nodeOrStr === 'string') {
      t = nodeOrStr;
      if (/<|&(?:#|amp;|nbsp;|lt;|gt;)/i.test(t)) {
        var box = document.createElement('div');
        box.innerHTML = t;
        t = box.textContent || '';
      }
    } else {
      t = nodeOrStr.textContent || '';
    }
    return String(t).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function fieldValue(field){
    var cb = field.querySelector('input[type="checkbox"]');
    if (cb) return cb.checked ? pdfT('pdf.vec.yes') : pdfT('pdf.vec.no');
    var inp = field.querySelector('input, select, textarea');
    if (inp && inp.value != null && String(inp.value).trim() !== '') return plainCellText(inp.value);
    var span = field.querySelector('.pdf-static-val');
    if (span) return plainCellText(span);
    return '—';
  }

  function parseEconGrid(root){
    if (!root) return null;
    var rows = [];
    root.querySelectorAll('.econ-field').forEach(function(field){
      var label = field.querySelector('label');
      if (!label) return;
      var k = plainCellText(label);
      if (!k) return;
      rows.push([k, fieldValue(field)]);
    });
    return rows.length ? { headers: [pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')], rows: rows } : null;
  }

  function parseElecCats(root){
    if (!root) return null;
    var rows = [];
    root.querySelectorAll('.econ-elec-cat-card').forEach(function(card){
      var title = plainCellText(card.querySelector('.econ-elec-cat-title'));
      var kw = card.querySelector('[data-econ-cat-kw]');
      var h = card.querySelector('[data-econ-cat-h]');
      rows.push([title, kw ? plainCellText(kw.value) : '—', h ? plainCellText(h.value) : '—']);
    });
    return rows.length ? {
      headers: [pdfT('pdf.vec.elecCat'), pdfT('pdf.vec.elecKw'), pdfT('pdf.vec.elecH')],
      rows: rows
    } : null;
  }

  function parsePayrollBlocks(root){
    if (!root) return [];
    var out = [];
    root.querySelectorAll('.econ-payroll-block').forEach(function(block){
      var h4 = block.querySelector('h4');
      var title = h4 ? plainCellText(h4) : '';
      var grid = block.querySelector('.econ-grid');
      if (grid){
        var data = parseEconGrid(grid);
        if (data) out.push({ title: title, data: data });
        return;
      }
      var rows = [];
      block.querySelectorAll('.econ-payroll-row:not(.econ-payroll-row--head)').forEach(function(row){
        var inputs = row.querySelectorAll('input');
        var k = inputs[0] ? plainCellText(inputs[0].value) : '';
        var v = inputs[1] ? plainCellText(inputs[1].value) : '';
        if (k || v) rows.push([k || '—', v || '—']);
      });
      if (rows.length) {
        out.push({
          title: title,
          data: { headers: [pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')], rows: rows }
        });
      }
    });
    return out;
  }

  function parseEquipGroups(root){
    if (!root) return [];
    var out = [];
    root.querySelectorAll('.econ-equip-group').forEach(function(group){
      var h4 = group.querySelector('h4');
      var title = h4 ? plainCellText(h4) : '';
      var rows = [];
      group.querySelectorAll('.econ-equip-row:not(.econ-equip-row--head):not(.econ-equip-row--custom)').forEach(function(row){
        var label = row.querySelector('label');
        var inp = row.querySelector('input');
        var k = label ? plainCellText(label) : '';
        var v = inp ? plainCellText(inp.value) : fieldValue(row);
        if (k) rows.push([k, v]);
      });
      group.querySelectorAll('.econ-equip-row--custom').forEach(function(row){
        var inputs = row.querySelectorAll('input');
        var k = inputs[0] ? plainCellText(inputs[0].value) : '';
        var v = inputs[1] ? plainCellText(inputs[1].value) : '';
        if (k || v) rows.push([k || '—', v || '—']);
      });
      if (rows.length) out.push({ title: title, data: { headers: [pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')], rows: rows } });
    });
    return out;
  }

  function parseEquipTotal(root){
    if (!root) return null;
    var label = plainCellText(root.querySelector('.econ-equip-total-label'));
    var val = plainCellText(root.querySelector('.econ-equip-total-val'));
    var hint = plainCellText(root.querySelector('.econ-equip-total-hint'));
    if (!label && !val) return null;
    return {
      headers: [pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')],
      rows: [[label || pdfT('pdf.vec.total'), val || '—']].concat(hint ? [['', hint]] : [])
    };
  }

  function parseCultureMetrics(root){
    if (!root) return null;
    var rows = [];
    root.querySelectorAll('.econ-culture-metric').forEach(function(card){
      var name = plainCellText(card.querySelector('.name'));
      card.querySelectorAll('.line:not(.econ-metric-line--share)').forEach(function(line){
        var spans = line.querySelectorAll('span, strong');
        var k = spans[0] ? plainCellText(spans[0]) : '';
        var v = spans[1] ? plainCellText(spans[1]) : '';
        if (k) rows.push([name, k, v]);
      });
    });
    return rows.length ? {
      headers: [pdfT('pdf.vec.culture'), pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')],
      rows: rows
    } : null;
  }

  function parseMetricCards(root){
    if (!root) return null;
    var rows = [];
    root.querySelectorAll('.m').forEach(function(m){
      var k = m.querySelector('.m-label');
      var v = m.querySelector('.m-val');
      if (k) rows.push([plainCellText(k), plainCellText(v)]);
    });
    return rows.length ? { headers: [pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')], rows: rows } : null;
  }

  function parseHtmlTable(table){
    if (!table || table.tagName !== 'TABLE') return null;
    var headers = [];
    var rows = [];
    var trs = table.querySelectorAll('tr');
    trs.forEach(function(tr, ri){
      var cells = [];
      tr.querySelectorAll('th, td').forEach(function(c){
        cells.push(plainCellText(c));
      });
      if (!cells.length) return;
      if (ri === 0 && tr.querySelector('th')) headers = cells;
      else rows.push(cells);
    });
    if (!headers.length && rows.length){
      headers = rows[0].map(function(_, i){ return 'Col ' + (i + 1); });
      rows = rows.slice(1);
    }
    return { headers: headers, rows: rows };
  }

  function sliceTableCols(data, fromCol){
    if (!data || !fromCol) return data;
    return {
      headers: data.headers.slice(fromCol),
      rows: data.rows.map(function(r){ return r.slice(fromCol); })
    };
  }

  function dropTableCols(data, dropIndices){
    if (!data || !dropIndices || !dropIndices.length) return data;
    var drop = {};
    dropIndices.forEach(function(i){ drop[i] = true; });
    return {
      headers: data.headers.filter(function(_, i){ return !drop[i]; }),
      rows: data.rows.map(function(r){ return r.filter(function(_, i){ return !drop[i]; }); })
    };
  }

  function parseKvGrid(root){
    if (!root) return null;
    var rows = [];
    root.querySelectorAll('.econ-pb-row').forEach(function(row){
      var spans = row.querySelectorAll('span, strong');
      var k = spans[0] ? plainCellText(spans[0]) : '';
      var v = spans[1] ? plainCellText(spans[1]) : '';
      if (k) rows.push([k, v]);
    });
    return rows.length ? { headers: [pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')], rows: rows } : null;
  }

  function parsePaybackCallout(root){
    if (!root) return null;
    var parts = [];
    root.querySelectorAll('.econ-pb-callout-main, .econ-pb-callout-sub, .econ-pb-callout-note').forEach(function(el){
      var t = plainCellText(el);
      if (t) parts.push(t);
    });
    if (!parts.length) return null;
    return {
      headers: [pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')],
      rows: parts.map(function(line, i){ return [i === 0 ? pdfT('pdf.vec.paybackGuide') : '', line]; })
    };
  }

  function parsePbList(root){
    if (!root) return null;
    var rows = [];
    root.querySelectorAll('li').forEach(function(li){
      var t = plainCellText(li);
      if (t) rows.push([t]);
    });
    return rows.length ? { headers: [pdfT('pdf.vec.note')], rows: rows } : null;
  }

  function colWidthsForTable(table, contentW){
    var cols = table.headers.length;
    if (cols === 1) return [contentW];
    if (cols === 2) return [contentW * 0.56, contentW * 0.44];
    if (cols === 3) return [contentW * 0.2, contentW * 0.38, contentW * 0.42];
    var w = contentW / cols;
    return table.headers.map(function(){ return w; });
  }

  function colX(margin, colWidths, ci){
    var x = margin;
    for (var j = 0; j < ci; j++) x += colWidths[j];
    return x;
  }

  function loadFontBinary(){
    if (fontLoadPromise) return fontLoadPromise;
    fontLoadPromise = fetch('js/vendor/' + FONT_FILE).then(function(res){
      if (!res.ok) throw new Error((global.DG_tFmt ? global.DG_tFmt('pdf.fontMissing', { file: FONT_FILE }) : 'PDF font missing: ' + FONT_FILE));
      return res.arrayBuffer();
    }).then(function(buf){
      var bytes = new Uint8Array(buf);
      var bin = '';
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return bin;
    });
    return fontLoadPromise;
  }

  function registerFontOnDoc(pdf, fontBinary){
    if (pdf.__dgDejaVu) return;
    pdf.addFileToVFS(FONT_FILE, fontBinary);
    pdf.addFont(FONT_FILE, FONT_NAME, 'normal');
    pdf.__dgDejaVu = true;
    pdf.setFont(FONT_NAME, 'normal');
  }

  function ensurePdfCyrillicFont(pdf){
    return loadFontBinary().then(function(bin){
      registerFontOnDoc(pdf, bin);
    });
  }

  function createPdfCtx(pdf, margin){
    return {
      pdf: pdf,
      margin: margin,
      y: margin,
      pageW: pdf.internal.pageSize.getWidth(),
      pageH: pdf.internal.pageSize.getHeight(),
      contentW: pdf.internal.pageSize.getWidth() - margin * 2,
      firstContent: true
    };
  }

  function ensureSpace(ctx, needMm){
    if (ctx.y + needMm <= ctx.pageH - ctx.margin) return;
    ctx.pdf.addPage();
    ctx.y = ctx.margin;
    ctx.pdf.setFont(FONT_NAME, 'normal');
  }

  function splitLines(pdf, text, maxW, fontSize){
    pdf.setFontSize(fontSize);
    var words = plainCellText(String(text || '—')).split(/\s+/).filter(Boolean);
    var lines = [];
    var line = '';
    words.forEach(function(w){
      var test = line ? line + ' ' + w : w;
      if (pdf.getTextWidth(test) <= maxW) line = test;
      else {
        if (line) lines.push(line);
        line = w;
      }
    });
    if (line) lines.push(line);
    if (!lines.length) lines.push('—');
    return lines;
  }

  function drawPdfTable(pdf, ctx, table, opts){
    if (!table || !table.headers.length) return ctx.y;
    opts = opts || {};
    var margin = ctx.margin;
    var contentW = ctx.contentW;
    var cols = table.headers.length;
    var fontSize = opts.fontSize || (cols > 6 ? 6 : cols > 4 ? 6.5 : COMPACT.fontSize);
    var headerSize = opts.headerSize || (cols > 6 ? 6.5 : COMPACT.headerSize);
    var pad = opts.pad != null ? opts.pad : COMPACT.pad;
    var lineH = fontSize * COMPACT.lineHMul;
    var colWidths = opts.colWidths || colWidthsForTable(table, contentW);

    ensureSpace(ctx, 8);
    if (opts.title){
      var subTitle = plainCellText(opts.title);
      if (opts.skipTitleIf && subTitle === plainCellText(opts.skipTitleIf)) subTitle = '';
      if (subTitle){
        ctx.y += COMPACT.subTitleBeforeGap;
        pdf.setFontSize(COMPACT.subTitleSize || 8);
        pdf.setTextColor(60, 70, 30);
        pdf.text(subTitle, margin, ctx.y);
        ctx.y += COMPACT.subTitleGap;
        pdf.setTextColor(0, 0, 0);
      }
    }

    function rowHeight(cells, isHeader){
      var fs = isHeader ? headerSize : fontSize;
      var maxLines = 1;
      cells.forEach(function(cell, ci){
        var lines = splitLines(pdf, cell, colWidths[ci] - pad * 2, fs);
        maxLines = Math.max(maxLines, lines.length);
      });
      return Math.max(COMPACT.minRowMm, maxLines * lineH + pad * 2);
    }

    var headerH = rowHeight(table.headers, true);
    ensureSpace(ctx, headerH);
    var y0 = ctx.y;

    pdf.setFillColor(39, 109, 92);
    pdf.setDrawColor(180, 200, 192);
    pdf.rect(margin, y0, contentW, headerH, 'FD');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(headerSize);
    table.headers.forEach(function(h, ci){
      var x = colX(margin, colWidths, ci) + pad;
      var lines = splitLines(pdf, h, colWidths[ci] - pad * 2, headerSize);
      lines.forEach(function(ln, li){
        pdf.text(ln, x, y0 + pad + 3 + li * lineH);
      });
    });
    ctx.y = y0 + headerH;

    pdf.setTextColor(0, 0, 0);
    table.rows.forEach(function(row, ri){
      var rh = rowHeight(row, false);
      ensureSpace(ctx, rh);
      y0 = ctx.y;
      if (ri % 2 === 0) pdf.setFillColor(248, 249, 244);
      else pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, y0, contentW, rh, 'F');
      pdf.setDrawColor(220, 224, 210);
      pdf.rect(margin, y0, contentW, rh, 'S');
      pdf.setFontSize(fontSize);
      row.forEach(function(cell, ci){
        var x = colX(margin, colWidths, ci) + pad;
        var lines = splitLines(pdf, cell, colWidths[ci] - pad * 2, fontSize);
        lines.forEach(function(ln, li){
          pdf.text(ln, x, y0 + pad + 2.8 + li * lineH);
        });
      });
      ctx.y = y0 + rh;
    });

    ctx.y += COMPACT.tableGap;
    return ctx.y;
  }

  function drawSectionTitle(pdf, ctx, title){
    ensureSpace(ctx, 14);
    if (!ctx.firstContent) ctx.y += COMPACT.sectionBlockGap;
    pdf.setFontSize(COMPACT.sectionTitleSize);
    pdf.setTextColor(39, 109, 92);
    pdf.text(title == null || title === '' ? '—' : String(title), ctx.margin, ctx.y);
    ctx.y += COMPACT.sectionTitleGap;
    pdf.setTextColor(0, 0, 0);
    ctx.firstContent = false;
  }

  function collectTablesForSection(sectionId, exportOpts){
    var spec = vectorSections()[sectionId];
    if (!spec) return [];
    var out = [];
    spec.forEach(function(item){
      var el = document.querySelector(item.selector);
      if (!el) return;
      var title = item.titleKey ? pdfT(item.titleKey) : (item.title || '');
      if (item.mode === 'payroll-blocks'){
        parsePayrollBlocks(el).forEach(function(t){
          out.push({ title: t.title, data: t.data });
        });
        return;
      }
      if (item.mode === 'equip-groups'){
        parseEquipGroups(el).forEach(function(t){
          out.push({ title: t.title, data: t.data });
        });
        return;
      }
      var data = null;
      if (item.mode === 'kv-grid') data = parseKvGrid(el);
      else if (item.mode === 'payback-callout') data = parsePaybackCallout(el);
      else if (item.mode === 'pb-list') data = parsePbList(el);
      else if (item.mode === 'econ-grid') data = parseEconGrid(el);
      else if (item.mode === 'elec-cats') data = parseElecCats(el);
      else if (item.mode === 'culture-metrics') data = parseCultureMetrics(el);
      else if (item.mode === 'metric-cards') data = parseMetricCards(el);
      else if (item.mode === 'equip-total') data = parseEquipTotal(el);
      else if (el.tagName === 'TABLE') data = parseHtmlTable(el);
      else data = parseHtmlTable(el.querySelector('table'));
      if (data && item.selector === '#econ-cultures-breakdown') data = dropTableCols(data, [5]);
      if (data && (data.rows.length || data.headers.length)) out.push({ title: title, data: data });
    });
    return out;
  }

  function renderVectorEconSection(pdf, ctx, sectionId, sectionTitle, exportOpts){
    var tables = collectTablesForSection(sectionId, exportOpts);
    if (!tables.length) return Promise.resolve(ctx);
    drawSectionTitle(pdf, ctx, sectionTitle);
    var multi = tables.length > 1;
    tables.forEach(function(t){
      drawPdfTable(pdf, ctx, t.data, {
        title: multi && t.title ? t.title : null,
        skipTitleIf: sectionTitle
      });
    });
    return Promise.resolve(ctx);
  }

  function isVectorEconSection(id){
    return !!vectorSections()[id];
  }

  function appendCanvasAt(pdf, ctx, canvas, margin, contentW){
    var pageH = pdf.internal.pageSize.getHeight();
    var usableH = pageH - margin * 2;
    var pxPerMm = canvas.width / contentW;
    var slicePx = Math.floor(usableH * pxPerMm);
    if (slicePx < 1) slicePx = canvas.height;

    var yPx = 0;
    while (yPx < canvas.height){
      var h = Math.min(slicePx, canvas.height - yPx);
      var sliceHmm = h / pxPerMm;
      ensureSpace(ctx, sliceHmm);
      var slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = h;
      var ctx2d = slice.getContext('2d');
      ctx2d.fillStyle = '#ffffff';
      ctx2d.fillRect(0, 0, slice.width, slice.height);
      ctx2d.drawImage(canvas, 0, yPx, canvas.width, h, 0, 0, canvas.width, h);
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, ctx.y, contentW, sliceHmm);
      ctx.y += sliceHmm + 1;
      yPx += h;
    }
    ctx.firstContent = false;
    return ctx;
  }

  global.DG_PDF_VECTOR_ECON = vectorSections;
  global.DG_isVectorEconPdfSection = isVectorEconSection;
  global.DG_ensurePdfCyrillicFont = ensurePdfCyrillicFont;
  global.DG_createPdfCtx = createPdfCtx;
  global.DG_renderVectorEconPdfSection = renderVectorEconSection;
  global.DG_appendCanvasToPdfCtx = appendCanvasAt;
  global.DG_parseHtmlTableForPdf = parseHtmlTable;
})(typeof window !== 'undefined' ? window : this);
