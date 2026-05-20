/** Векторные таблицы экономики в PDF (jsPDF + DejaVu, без изменения calc) */
(function(global){
  'use strict';

  var FONT_FILE = 'DejaVuSans.ttf';
  var FONT_NAME = 'DejaVu';
  var fontLoadPromise = null;

  function pdfT(k){
    return (global.DG_t && global.DG_t(k)) || k;
  }

  function vectorSections(){
    return {
      'econ-yield-summary': [
        { titleKey: 'pdf.vec.yieldByCult', selector: '#econ-derived-panel table.econ-breakdown' }
      ],
      'econ-results': [
        { titleKey: 'pdf.vec.byCult', selector: '#econ-cultures-breakdown' },
        { titleKey: 'pdf.vec.costsMargin', selector: '#econ-breakdown-table' },
        { titleKey: 'pdf.vec.electricity', selector: '#econ-results-metrics table.econ-breakdown' }
      ],
      'econ-sensitivity': [
        { titleKey: 'pdf.vec.scenarios', selector: '#econ-sensitivity-body table.econ-sens-table' }
      ],
      'econ-payback': [
        { titleKey: 'pdf.vec.payback', selector: '#econ-payback-body .econ-pb-grid', mode: 'kv-grid' }
      ]
    };
  }

  function stripHtml(s){
    return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function parseHtmlTable(table){
    if (!table || table.tagName !== 'TABLE') return null;
    var headers = [];
    var rows = [];
    var trs = table.querySelectorAll('tr');
    trs.forEach(function(tr, ri){
      var cells = [];
      tr.querySelectorAll('th, td').forEach(function(c){
        cells.push(stripHtml(c.innerHTML));
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

  function parseKvGrid(root){
    if (!root) return null;
    var rows = [];
    root.querySelectorAll('.econ-pb-row').forEach(function(row){
      var spans = row.querySelectorAll('span, strong');
      var k = spans[0] ? stripHtml(spans[0].textContent) : '';
      var v = spans[1] ? stripHtml(spans[1].textContent) : '';
      if (k) rows.push([k, v]);
    });
    return rows.length ? { headers: [pdfT('pdf.vec.indicator'), pdfT('pdf.vec.value')], rows: rows } : null;
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
    var words = String(text || '—').split(/\s+/);
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
    var fontSize = opts.fontSize || 8;
    var headerSize = opts.headerSize || 8.5;
    var pad = 2;
    var lineH = fontSize * 0.42;
    var cols = table.headers.length;
    var colW = contentW / cols;

    ensureSpace(ctx, 12);
    if (opts.title){
      pdf.setFontSize(10);
      pdf.setTextColor(60, 70, 30);
      pdf.text(opts.title, margin, ctx.y);
      ctx.y += 5;
      pdf.setTextColor(0, 0, 0);
    }

    function rowHeight(cells, isHeader){
      var fs = isHeader ? headerSize : fontSize;
      var maxLines = 1;
      cells.forEach(function(cell){
        var lines = splitLines(pdf, cell, colW - pad * 2, fs);
        maxLines = Math.max(maxLines, lines.length);
      });
      return Math.max(6, maxLines * lineH + pad * 2);
    }

    var headerH = rowHeight(table.headers, true);
    ensureSpace(ctx, headerH);
    var y0 = ctx.y;

    pdf.setFillColor(107, 123, 46);
    pdf.setDrawColor(180, 186, 160);
    pdf.rect(margin, y0, contentW, headerH, 'FD');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(headerSize);
    table.headers.forEach(function(h, ci){
      var x = margin + ci * colW + pad;
      var lines = splitLines(pdf, h, colW - pad * 2, headerSize);
      lines.forEach(function(ln, li){
        pdf.text(ln, x, y0 + pad + 3.5 + li * lineH);
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
        var x = margin + ci * colW + pad;
        var lines = splitLines(pdf, cell, colW - pad * 2, fontSize);
        lines.forEach(function(ln, li){
          pdf.text(ln, x, y0 + pad + 3.2 + li * lineH);
        });
      });
      ctx.y = y0 + rh;
    });

    ctx.y += 4;
    return ctx.y;
  }

  function drawSectionTitle(pdf, ctx, title){
    ensureSpace(ctx, 14);
    if (!ctx.firstContent) ctx.y += 2;
    pdf.setFontSize(13);
    pdf.setTextColor(60, 70, 30);
    pdf.text(title == null || title === '' ? '—' : String(title), ctx.margin, ctx.y);
    ctx.y += 7;
    pdf.setTextColor(0, 0, 0);
    ctx.firstContent = false;
  }

  function collectTablesForSection(sectionId){
    var spec = vectorSections()[sectionId];
    if (!spec) return [];
    var out = [];
    spec.forEach(function(item){
      var el = document.querySelector(item.selector);
      if (!el) return;
      var data = null;
      if (item.mode === 'kv-grid') data = parseKvGrid(el);
      else if (el.tagName === 'TABLE') data = parseHtmlTable(el);
      else data = parseHtmlTable(el.querySelector('table'));
      var title = item.titleKey ? pdfT(item.titleKey) : (item.title || '');
      if (data && (data.rows.length || data.headers.length)) out.push({ title: title, data: data });
    });
    return out;
  }

  function renderVectorEconSection(pdf, ctx, sectionId, sectionTitle){
    var tables = collectTablesForSection(sectionId);
    if (!tables.length) return Promise.resolve(ctx);
    drawSectionTitle(pdf, ctx, sectionTitle);
    tables.forEach(function(t){
      drawPdfTable(pdf, ctx, t.data, { title: tables.length > 1 ? t.title : null });
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
      ctx.y += sliceHmm + 2;
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
