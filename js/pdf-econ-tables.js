/** Векторные таблицы экономики в PDF (jsPDF + DejaVu, без изменения calc) */
(function(global){
  'use strict';

  var FONT_FILE = 'DejaVuSans.ttf';
  var FONT_NAME = 'DejaVu';
  var PDF_HEADER_BAND_MM = 14;
  var fontLoadPromise = null;

  var PDF_THEME = {
    brand: [39, 109, 92],
    brandLight: [244, 250, 248],
    zebra: [241, 246, 238],
    border: [198, 206, 188],
    headerBorder: [180, 200, 192],
    grid: [214, 220, 204],
    headerGrid: [200, 228, 216],
    inkMuted: [102, 102, 102],
    inkSoft: [70, 75, 65]
  };

  function pdfContentTop(margin){
    return margin + PDF_HEADER_BAND_MM;
  }

  var COMPACT = {
    fontSize: 7.5,
    headerSize: 8,
    pad: 1.2,
    lineHMul: 0.4,
    minRowMm: 4,
    sectionTitleSize: 11,
    sectionTitleGap: 5.5,
    sectionBlockGap: 8,
    tableGap: 3.5,
    subTitleGap: 3.5,
    subTitleBeforeGap: 2,
    subTitleSize: 8.5
  };

  function looksNumericCell(text){
    var t = plainCellText(text);
    if (!t || t === '—') return false;
    if (/[→]/.test(t)) return false;
    if (/[a-zA-Zа-яА-ЯёЁ]/.test(t)) return false;
    return /\d/.test(t);
  }

  function isDashCell(text){
    var t = plainCellText(text);
    return !t || t === '—' || t === '-' || t === '–';
  }

  function cellAlign(ci, cell, cols, tableKind){
    if (ci === 0) return 'left';
    if (cols === 2) return 'right';
    if (tableKind === 'equip'){
      return ci >= 2 ? 'right' : 'left';
    }
    if (tableKind === 'cost-breakdown'){
      if (ci === 1) return isDashCell(cell) ? 'center' : 'right';
      return 'right';
    }
    if (tableKind === 'cultures-breakdown'){
      if (ci === 3) return 'left';
      return 'right';
    }
    if (tableKind === 'yield' || tableKind === 'elec-cost') return 'right';
    if (ci === cols - 1 && looksNumericCell(cell)) return 'right';
    if (ci > 0 && looksNumericCell(cell)) return 'right';
    return 'left';
  }

  function headerAlign(ci, cols, tableKind){
    if (ci === 0) return 'left';
    if (cols === 2) return 'right';
    if (tableKind === 'equip'){
      return ci >= 2 ? 'right' : 'left';
    }
    if (tableKind === 'cost-breakdown'){
      if (ci === 1) return 'center';
      return 'right';
    }
    if (tableKind === 'cultures-breakdown'){
      if (ci === 3) return 'left';
      return 'right';
    }
    if (tableKind === 'yield' || tableKind === 'elec-cost') return 'right';
    if (ci > 0) return 'right';
    return 'left';
  }

  function pdfT(k){
    return (global.DG_t && global.DG_t(k)) || k;
  }

  function pdfTFmt(k, vars){
    if (global.DG_tFmt) return global.DG_tFmt(k, vars || {});
    var s = pdfT(k);
    if (vars){
      Object.keys(vars).forEach(function(key){
        s = s.replace(new RegExp('\\{' + key + '\\}', 'g'), String(vars[key]));
      });
    }
    return s;
  }

  function vectorSections(){
    return {
      'econ-farm-final': [
        { selector: '#econ-results-final-cards .econ-results', mode: 'metric-cards-kpi' }
      ],
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
        { titleKey: 'pdf.vec.electricityInputs', selector: '#econ-elec-cats-inputs .econ-elec-cats-grid', mode: 'elec-cats' },
        { titleKey: 'pdf.vec.electricityCost', selector: 'table.econ-elec-total', mode: 'table' }
      ],
      'econ-payroll': [
        { selector: '#econ-payroll-body', mode: 'payroll-blocks' }
      ],
      'econ-equipment': [
        { selector: '#econ-equipment-groups', mode: 'equip-groups' },
        { selector: '#econ-equipment-total', mode: 'equip-total' }
      ],
      'econ-results': [
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
      ],
      'econ-advanced': [
        { selector: '#econ-advanced-body', mode: 'adv-blocks' }
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

  var PDF_BERRY_CV_IDS = {
    'econ-berry-blueberry': true,
    'econ-berry-raspberry': true,
    'econ-berry-strawberry': true,
    'econ-berry': true
  };

  var PDF_VEGETABLE_CV_IDS = {
    'econ-veg-cucumber': true,
    'econ-veg-tomato': true,
    'econ-veg-pepper': true,
    'econ-vegetables': true
  };

  function pdfKgOutputGroupByCvId(cvId){
    if (!cvId) return '';
    if (PDF_BERRY_CV_IDS[cvId]) return 'berries';
    if (PDF_VEGETABLE_CV_IDS[cvId]) return 'vegetables';
    return '';
  }

  function parseNetOutputCellForKpi(text){
    var t = plainCellText(text);
    if (!t || t === '—') return t || '—';
    var norm = t.replace(/\s*->\s*/g, '→');
    if (norm.indexOf('→') < 0) return norm;
    var parts = norm.split('→');
    var net = plainCellText(parts[parts.length - 1] || '');
    return net || norm;
  }

  function collectPerCultureKgCards(group){
    var table = document.getElementById('econ-cultures-breakdown');
    if (!table) return [];
    var out = [];
    table.querySelectorAll('tr[data-econ-cv-id]').forEach(function(tr){
      var cvId = tr.getAttribute('data-econ-cv-id') || '';
      if (pdfKgOutputGroupByCvId(cvId) !== group) return;
      var cells = tr.querySelectorAll('td, th');
      if (!cells || cells.length < 4) return;
      var name = plainCellText(cells[0]);
      var value = parseNetOutputCellForKpi(cells[3]);
      if (!name || !value || value === '—') return;
      out.push({ label: name, val: value, sub: '' });
    });
    return out;
  }

  function expandKgGroupCardsForPdf(cards){
    if (!cards || !cards.length) return cards;
    var berriesLabel = plainCellText(pdfT('econ.tbl.outBerriesKg'));
    var vegetablesLabel = plainCellText(pdfT('econ.tbl.outVegetablesKg'));
    var expanded = [];
    cards.forEach(function(card){
      var lbl = plainCellText(card && card.label);
      var group = '';
      if (lbl && berriesLabel && lbl === berriesLabel) group = 'berries';
      else if (lbl && vegetablesLabel && lbl === vegetablesLabel) group = 'vegetables';
      if (!group){
        expanded.push(card);
        return;
      }
      var perCulture = collectPerCultureKgCards(group);
      if (perCulture.length) Array.prototype.push.apply(expanded, perCulture);
      else expanded.push(card);
    });
    return expanded;
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

  function domFieldVisible(el){
    while (el){
      if (el.hidden) return false;
      try {
        var cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      } catch (err) { /* ignore */ }
      el = el.parentElement;
    }
    return true;
  }

  function econTaxToggleChecked(id){
    var el = document.getElementById(id);
    return !!(el && el.checked);
  }

  function includeEconGridField(field){
    if (!domFieldVisible(field)) return false;
    var keyInp = field.querySelector('[data-econ-key]');
    if (!keyInp || !keyInp.dataset.econKey) return true;
    if (keyInp.dataset.econKey === 'vatPct') return econTaxToggleChecked('econ-vat-tax');
    if (keyInp.dataset.econKey === 'profitTaxPct') return econTaxToggleChecked('econ-profit-tax');
    return true;
  }

  function parseEconGrid(root){
    if (!root) return null;
    var rows = [];
    root.querySelectorAll('.econ-field, .econ-tax-block .econ-toggle-row').forEach(function(field){
      if (!domFieldVisible(field)) return;
      if (field.classList.contains('econ-toggle-row')){
        var cb = field.querySelector('input[type="checkbox"]');
        var lbl = field.querySelector('.toggle-label');
        if (!lbl) return;
        rows.push([
          plainCellText(lbl),
          cb && cb.checked ? pdfT('pdf.vec.yes') : pdfT('pdf.vec.no')
        ]);
        return;
      }
      if (!includeEconGridField(field)) return;
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
    var hasDayNight = false;
    root.querySelectorAll('.econ-elec-cat-card').forEach(function(card){
      var title = plainCellText(card.querySelector('.econ-elec-cat-title'));
      var dayNightChk = card.querySelector('[data-econ-cat-daynight]');
      var kwDay = card.querySelector('[data-econ-cat-kw-day]');
      var hDay = card.querySelector('[data-econ-cat-h-day]');
      var kwNight = card.querySelector('[data-econ-cat-kw-night]');
      var hNight = card.querySelector('[data-econ-cat-h-night]');
      if (dayNightChk && dayNightChk.checked && (kwDay || kwNight)){
        hasDayNight = true;
        var dayPart = (kwDay ? plainCellText(kwDay.value) : '0') + '×' + (hDay ? plainCellText(hDay.value) : '0');
        var nightPart = (kwNight ? plainCellText(kwNight.value) : '0') + '×' + (hNight ? plainCellText(hNight.value) : '0');
        var totalEl = card.querySelector('.econ-elec-daynight-total');
        var totalStr = totalEl ? plainCellText(totalEl.textContent) : '';
        rows.push([title, dayPart + ' + ' + nightPart, totalStr || '—']);
        return;
      }
      var kw = card.querySelector('[data-econ-cat-kw]');
      var h = card.querySelector('[data-econ-cat-h]');
      rows.push([title, kw ? plainCellText(kw.value) : '—', h ? plainCellText(h.value) : '—']);
    });
    return rows.length ? {
      headers: [
        pdfT('pdf.vec.elecCat'),
        pdfT('pdf.vec.elecKw'),
        hasDayNight ? pdfT('pdf.vec.elecDaily') : pdfT('pdf.vec.elecH')
      ],
      rows: rows
    } : null;
  }

  function filterElecZeroRows(data){
    if (!data || !data.rows) return data;
    var rows = [];
    var flags = [];
    data.rows.forEach(function(r, ri){
      var isTotal = data.rowFlags && data.rowFlags[ri];
      if (isTotal){
        rows.push(r);
        flags.push(true);
        return;
      }
      var kwh = parseFloat(String(r[1] || '').replace(/\s/g, '').replace(',', '.')) || 0;
      var rub = parseFloat(String(r[2] || '').replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
      if (kwh > 0 || rub > 0){
        rows.push(r);
        flags.push(false);
      }
    });
    data.rows = rows;
    data.rowFlags = flags;
    return data;
  }

  function normalizePdfTableHeaders(data, item){
    if (!data || !data.headers || !data.headers.length) return data;
    if (item.selector === 'table.econ-elec-total' || (item.selector && String(item.selector).indexOf('econ-elec-total') >= 0)){
      if (data.headers.length >= 3){
        data.headers = [pdfT('pdf.vec.elecCat'), pdfT('pdf.vec.elecKwhMo'), pdfT('pdf.vec.rubMo')];
        data.tableKind = 'elec-cost';
        filterElecZeroRows(data);
      }
      return data;
    }
    if (item.selector === '#econ-breakdown-table'){
      if (data.headers.length >= 3){
        data.headers = [pdfT('pdf.vec.article'), pdfT('pdf.vec.elecKwhMo'), pdfT('pdf.vec.rubMo')];
        data.tableKind = 'cost-breakdown';
      }
      return data;
    }
    if (item.selector === '#econ-cultures-breakdown' && data.headers.length >= 7){
      data.headers = [
        pdfT('pdf.vec.culture'),
        pdfT('pdf.vec.sharePct'),
        pdfT('pdf.vec.areaSqm'),
        pdfT('pdf.vec.outputMo'),
        pdfT('pdf.vec.unitCost'),
        pdfT('pdf.vec.consPerSqm'),
        pdfT('pdf.vec.revMo'),
        pdfT('pdf.vec.marginMo')
      ].slice(0, data.headers.length);
      data.tableKind = 'cultures-breakdown';
      return data;
    }
    if (item.titleKey === 'pdf.vec.yieldByCult' && data.headers.length >= 8){
      data.headers = [
        pdfT('pdf.vec.culture'),
        pdfT('pdf.vec.outputMo'),
        pdfT('econ.derived.cut'),
        pdfT('econ.derived.interval'),
        pdfT('econ.derived.cutsMo'),
        pdfT('pdf.vec.yieldSqm'),
        pdfT('econ.derived.kwh'),
        pdfT('econ.derived.lightH')
      ];
      data.tableKind = 'yield';
      return data;
    }
    if (item.mode === 'econ-grid' && data.headers.length === 2){
      data.tableKind = 'kv';
    }
    if (data.tableKind === 'adv-season' && data.headers.length >= 5 && !data.colWidths){
      data.colWidths = [0.11, 0.14, 0.14, 0.14, 0.47];
    }
    if (item.selector && String(item.selector).indexOf('econ-sens-table') >= 0 && data.headers.length >= 6){
      data.colWidths = [0.24, 0.15, 0.15, 0.15, 0.09, 0.12];
    }
    return data;
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
      if (block.querySelector('.econ-payroll-row--staff')){
        var staffRows = [];
        block.querySelectorAll('.econ-payroll-row--staff:not(.econ-payroll-row--head)').forEach(function(row){
          var inputs = row.querySelectorAll('input');
          var sel = row.querySelector('select');
          staffRows.push([
            inputs[0] ? plainCellText(inputs[0].value) : '—',
            inputs[1] ? plainCellText(inputs[1].value) : '—',
            sel && sel.options[sel.selectedIndex] ? plainCellText(sel.options[sel.selectedIndex].textContent) : '—'
          ]);
        });
        if (staffRows.length) {
          out.push({
            title: title,
            data: {
              headers: [pdfT('econ.staff.role'), pdfT('econ.staff.salary'), pdfT('econ.staff.roleType')],
              rows: staffRows
            }
          });
        }
        return;
      }
      var rows = [];
      block.querySelectorAll('.econ-payroll-row:not(.econ-payroll-row--head)').forEach(function(row){
        var inputs = row.querySelectorAll('input');
        var sel = row.querySelector('select');
        var k = inputs[0] ? plainCellText(inputs[0].value) : '';
        var v = inputs[1] ? plainCellText(inputs[1].value) : '';
        if (k || v) rows.push([k || '—', v || '—']);
        if (sel && !k && !v){
          rows.push([pdfT('econ.staff.roleType'), plainCellText(sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : sel.value)]);
        }
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

  function parseAdvBlocks(root){
    if (!root) return [];
    var out = [];
    root.querySelectorAll('.adv-block').forEach(function(block){
      var title = plainCellText(block.querySelector('.adv-h'));
      var table = block.querySelector('table');
      if (table){
        var data = parseHtmlTable(table);
        if (data){
          if (table.classList.contains('adv-season')){
            data.tableKind = 'adv-season';
            data.colWidths = [0.11, 0.14, 0.14, 0.14, 0.47];
          }
          var note = block.querySelector('.adv-note');
          if (note) data.footnote = plainCellText(note.textContent);
          out.push({ title: title, data: data });
        }
        return;
      }
      var list = block.querySelector('.adv-sites-list');
      if (list){
        var rows = [];
        list.querySelectorAll('li').forEach(function(li){
          var clone = li.cloneNode(true);
          clone.querySelectorAll('button').forEach(function(b){ b.remove(); });
          var txt = plainCellText(clone.textContent);
          if (txt) rows.push([txt]);
        });
        var noteSites = block.querySelector('.adv-note');
        if (rows.length){
          out.push({
            title: title,
            data: {
              headers: [pdfT('pdf.vec.indicator')],
              rows: rows,
              footnote: noteSites ? plainCellText(noteSites.textContent) : null
            }
          });
        }
      }
    });
    return out;
  }

  function equipRowLabelHint(row){
    var labelEl = row.querySelector('.econ-equip-label-cell label') || row.querySelector('label');
    var hintEl = row.querySelector('.econ-equip-hint');
    return {
      label: labelEl ? plainCellText(labelEl) : '',
      hint: hintEl ? plainCellText(hintEl.textContent) : ''
    };
  }

  function runwayMonthsVal(group, row, eqKey){
    var runwayInp = group ? group.querySelector('[data-econ-startup-runway-months]') : null;
    var moInp = row ? row.querySelector('[data-econ-eq-months]') : null;
    var mo = runwayInp ? parseFloat(plainCellText(runwayInp.value)) : NaN;
    if (isNaN(mo) || mo < 1) mo = moInp ? parseFloat(plainCellText(moInp.value)) : NaN;
    if (isNaN(mo) || mo < 1) mo = eqKey === 'runwayElec' ? 3 : 1;
    return mo;
  }

  function runwayElecRampStrFromGroup(group, mo){
    var months = parseInt(mo, 10);
    if (isNaN(months) || months < 1) months = 3;
    if (global.DG_ECON && global.DG_ECON.runwayElecRampLoads){
      var loads = global.DG_ECON.runwayElecRampLoads(months);
      if (loads && loads.length) {
        return loads.map(function(l){ return Math.round(l * 100) + '%'; }).join('→');
      }
    }
    var inps = group ? group.querySelectorAll('[data-econ-runway-elec-ramp]') : [];
    if (inps.length){
      var cum = 0;
      var parts = [];
      inps.forEach(function(inp){
        var raw = inp.querySelector ? plainCellText(inp.value) : '';
        if (!raw && inp.dataset && inp.dataset.fmtDisplay) raw = plainCellText(inp.dataset.fmtDisplay);
        cum += (parseFloat(raw) || 0) / 100;
        if (cum > 1) cum = 1;
        parts.push(Math.round(cum * 100) + '%');
      });
      if (parts.length) return parts.join('→');
    }
    return String(months);
  }

  function equipPdfColWidths(contentW){
    return [contentW * 0.20, contentW * 0.44, contentW * 0.36];
  }

  function equipHintForPdf(key, domHint){
    var k = 'econ.eq.hintPdf.' + key;
    var t = pdfT(k);
    if (t !== k) return t;
    if (!domHint) return '—';
    return domHint
      .replace(/\s*₽\/мес[^.]*\.?/gi, '')
      .replace(/[«""]Подставить[^.]*\.?/gi, '')
      .replace(/\s*“Fill from calc”[^.]*\.?/gi, '')
      .replace(/\s+/g, ' ')
      .trim() || '—';
  }

  function parseEquipGroups(root, contentW){
    if (!root) return [];
    var out = [];
    var headers = [pdfT('pdf.vec.equipItem'), pdfT('pdf.vec.equipDesc'), pdfT('pdf.vec.value')];
    var colWidths = contentW ? equipPdfColWidths(contentW) : null;
    root.querySelectorAll('.econ-equip-group').forEach(function(group){
      var h4 = group.querySelector('h4');
      var title = h4 ? plainCellText(h4) : '';
      var rows = [];
      var footnote = null;
      if (group.querySelector('.econ-runway-hint')) footnote = pdfT('econ.runway.introPdf');
      group.querySelectorAll('.econ-equip-row:not(.econ-equip-row--head):not(.econ-equip-row--custom)').forEach(function(row){
        var parts = equipRowLabelHint(row);
        var k = parts.label;
        if (!k) return;
        var eqInp = row.querySelector('[data-econ-eq]');
        var eqKey = eqInp && eqInp.dataset.econEq ? eqInp.dataset.econEq : '';
        var desc = eqKey ? equipHintForPdf(eqKey, parts.hint) : (parts.hint || '—');
        if (row.classList.contains('econ-equip-row--monthly')){
          var amtInp = row.querySelector('[data-econ-eq]');
          var moInp = row.querySelector('[data-econ-eq-months]');
          var moLbl = row.querySelector('[data-econ-runway-mo-label]');
          var totalEl = row.querySelector('[data-econ-eq-total]');
          var amt = amtInp ? plainCellText(amtInp.value) : '0';
          var mo = eqKey === 'runwayElec'
            ? runwayMonthsVal(group, row, eqKey)
            : (moLbl ? plainCellText(moLbl.textContent).replace(/[×\s]/g, '').replace(/мес\.?/i, '').trim()
              : (moInp ? plainCellText(moInp.value) : '1'));
          var total = totalEl ? plainCellText(totalEl.textContent) : amt;
          if (eqKey === 'runwayElec'){
            var rampStr = runwayElecRampStrFromGroup(group, mo);
            var rampNote = pdfTFmt('econ.runway.elecRampPdfNote', { amt: amt, loads: rampStr });
            rows.push([k, desc === '—' ? rampNote : (desc + '. ' + rampNote), total]);
          } else {
            rows.push([k, desc, amt + ' ' + pdfT('pdf.vec.perMonth') + ' × ' + mo + ' ' + pdfT('econ.equip.months') + ' = ' + total]);
          }
          return;
        }
        var inp = row.querySelector('input');
        var v = inp ? plainCellText(inp.value) : fieldValue(row);
        rows.push([k, desc, v]);
      });
      group.querySelectorAll('.econ-equip-row--custom').forEach(function(row){
        var inputs = row.querySelectorAll('input');
        var k = inputs[0] ? plainCellText(inputs[0].value) : '';
        var v = inputs[1] ? plainCellText(inputs[1].value) : '';
        if (k || v) rows.push([k || '—', '—', v || '—']);
      });
      if (rows.length){
        out.push({
          title: title,
          data: {
            headers: headers,
            rows: rows,
            tableKind: 'equip',
            colWidths: colWidths,
            footnote: footnote
          }
        });
      }
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

  function tableCellText(cell){
    if (!cell) return '';
    var inp = cell.querySelector('input, select, textarea');
    if (inp){
      if (inp.tagName === 'SELECT'){
        var opt = inp.options[inp.selectedIndex];
        return plainCellText(opt ? opt.textContent : inp.value);
      }
      return plainCellText(inp.value);
    }
    return plainCellText(cell);
  }

  function cellsFromTr(tr){
    var cells = [];
    tr.querySelectorAll('th, td').forEach(function(c){
      var span = parseInt(c.getAttribute('colspan') || '1', 10);
      if (isNaN(span) || span < 1) span = 1;
      cells.push(tableCellText(c));
      for (var i = 1; i < span; i++) cells.push('');
    });
    return cells;
  }

  function padRowToCols(cells, colCount){
    var out = cells.slice();
    while (out.length < colCount) out.push('');
    if (out.length > colCount) out = out.slice(0, colCount);
    return out;
  }

  function parseHtmlTable(table){
    if (!table || table.tagName !== 'TABLE') return null;
    var headers = [];
    var rows = [];
    var rowFlags = [];
    var trs = table.querySelectorAll('tr');
    trs.forEach(function(tr, ri){
      var cells = cellsFromTr(tr);
      if (!cells.length) return;
      if (ri === 0 && tr.querySelector('th')) headers = cells;
      else {
        rows.push(cells);
        rowFlags.push(
          tr.classList.contains('econ-total-row') ||
          tr.classList.contains('econ-row-total') ||
          !!tr.querySelector('strong')
        );
      }
    });
    if (!headers.length && rows.length){
      headers = rows[0].map(function(_, i){ return 'Col ' + (i + 1); });
      rowFlags = rowFlags.slice(1);
      rows = rows.slice(1);
    }
    if (headers.length){
      rows = rows.map(function(r){ return padRowToCols(r, headers.length); });
    }
    return { headers: headers, rows: rows, rowFlags: rowFlags };
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

  function colWidthsForTable(table, contentW, tableKind){
    var cols = table.headers.length;
    var kind = tableKind || table.tableKind;
    if (cols === 1) return [contentW];
    if (cols === 2) return [contentW * 0.58, contentW * 0.42];
    if (cols === 3 && kind === 'cost-breakdown') return [contentW * 0.52, contentW * 0.16, contentW * 0.32];
    if (cols === 3 && kind === 'elec-cost') return [contentW * 0.50, contentW * 0.24, contentW * 0.26];
    if (cols === 3) return [contentW * 0.44, contentW * 0.28, contentW * 0.28];
    if (cols === 8 && kind === 'yield'){
      return [
        contentW * 0.17, contentW * 0.10, contentW * 0.09, contentW * 0.10,
        contentW * 0.11, contentW * 0.16, contentW * 0.12, contentW * 0.15
      ];
    }
    if (kind === 'cultures-breakdown'){
      if (cols === 8) return [0.12, 0.06, 0.06, 0.26, 0.12, 0.10, 0.14, 0.14].map(function(p){ return contentW * p; });
      if (cols === 7) return [0.12, 0.06, 0.06, 0.28, 0.12, 0.16, 0.20].map(function(p){ return contentW * p; });
    }
    if (cols >= 6){
      var first = contentW * 0.22;
      var rest = (contentW - first) / (cols - 1);
      return [first].concat(table.headers.slice(1).map(function(){ return rest; }));
    }
    var w = contentW / cols;
    return table.headers.map(function(){ return w; });
  }

  function colX(margin, colWidths, ci){
    var x = margin;
    for (var j = 0; j < ci; j++) x += colWidths[j];
    return x;
  }

  function drawTableColumnGrid(pdf, margin, y0, h, colWidths, isHeader){
    if (colWidths.length < 2) return;
    var grid = isHeader ? PDF_THEME.headerGrid : PDF_THEME.grid;
    pdf.setDrawColor(grid[0], grid[1], grid[2]);
    pdf.setLineWidth(isHeader ? 0.16 : 0.13);
    var x = margin;
    for (var i = 0; i < colWidths.length - 1; i++){
      x += colWidths[i];
      pdf.line(x, y0, x, y0 + h);
    }
  }

  function compactPdfCultureOutput(cell){
    var t = String(cell || '')
      .replace(/\s*→\s*/g, '→')
      .replace(/\s*->\s*/g, '→')
      .replace(/\s+/g, ' ')
      .trim();
    var sep = t.indexOf(' · ');
    if (sep >= 0) return t.slice(0, sep).trim() + '\n' + t.slice(sep + 3).trim();
    return t;
  }

  function splitLongWord(pdf, word, maxW, fontSize, lines){
    pdf.setFontSize(fontSize);
    if (!word) return '';
    if (pdf.getTextWidth(word) <= maxW) return word;
    var chunk = '';
    for (var i = 0; i < word.length; i++){
      var test = chunk + word.charAt(i);
      if (pdf.getTextWidth(test) <= maxW) chunk = test;
      else {
        if (chunk) lines.push(chunk);
        chunk = word.charAt(i);
      }
    }
    return chunk;
  }

  function splitLines(pdf, text, maxW, fontSize){
    pdf.setFontSize(fontSize);
    var paragraphs = plainCellText(String(text || '—')).split(/\n/);
    var lines = [];
    paragraphs.forEach(function(para, pi){
      var words = para.split(/\s+/).filter(Boolean);
      var line = '';
      words.forEach(function(w){
        w = splitLongWord(pdf, w, maxW, fontSize, lines);
        if (!w) return;
        var test = line ? line + ' ' + w : w;
        if (pdf.getTextWidth(test) <= maxW) line = test;
        else {
          if (line) lines.push(line);
          line = splitLongWord(pdf, w, maxW, fontSize, lines);
        }
      });
      if (line) lines.push(line);
      if (pi < paragraphs.length - 1 && lines.length && lines[lines.length - 1] !== '') lines.push('');
    });
    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    if (!lines.length) lines.push('—');
    return lines;
  }

  function drawPdfCellText(pdf, lines, align, xLeft, xRight, colW, yStart, lineH){
    var xCenter = xLeft + colW / 2;
    lines.forEach(function(ln, li){
      var yLine = yStart + li * lineH;
      if (align === 'right') pdf.text(ln, xRight, yLine, { align: 'right' });
      else if (align === 'center') pdf.text(ln, xCenter, yLine, { align: 'center' });
      else pdf.text(ln, xLeft, yLine);
    });
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
    var top = pdfContentTop(margin);
    return {
      pdf: pdf,
      margin: margin,
      y: top,
      contentTop: top,
      pageW: pdf.internal.pageSize.getWidth(),
      pageH: pdf.internal.pageSize.getHeight(),
      contentW: pdf.internal.pageSize.getWidth() - margin * 2,
      firstContent: true
    };
  }

  function ensureSpace(ctx, needMm){
    if (ctx.y + needMm <= ctx.pageH - ctx.margin) return;
    ctx.pdf.addPage();
    ctx.y = ctx.contentTop != null ? ctx.contentTop : ctx.margin;
    ctx.pdf.setFont(FONT_NAME, 'normal');
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
    var tableKind = table.tableKind || opts.tableKind;
    var colWidths = opts.colWidths || colWidthsForTable(table, contentW, tableKind);

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

    if (opts.footnote){
      ensureSpace(ctx, 8);
      pdf.setFontSize(7.5);
      pdf.setTextColor(70, 75, 65);
      splitLines(pdf, opts.footnote, contentW, 7.5).forEach(function(ln){
        pdf.text(ln, margin, ctx.y);
        ctx.y += 7.5 * COMPACT.lineHMul;
      });
      ctx.y += 2;
      pdf.setTextColor(0, 0, 0);
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

    pdf.setFillColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
    pdf.setDrawColor(PDF_THEME.headerBorder[0], PDF_THEME.headerBorder[1], PDF_THEME.headerBorder[2]);
    pdf.rect(margin, y0, contentW, headerH, 'FD');
    drawTableColumnGrid(pdf, margin, y0, headerH, colWidths, true);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(headerSize);
    table.headers.forEach(function(h, ci){
      var cellW = colWidths[ci] - pad * 2;
      var lines = splitLines(pdf, h, cellW, headerSize);
      var hAlign = headerAlign(ci, cols, tableKind);
      var xLeft = colX(margin, colWidths, ci) + pad;
      var xRight = colX(margin, colWidths, ci) + colWidths[ci] - pad;
      var blockH = lines.length * lineH;
      var yText = y0 + (headerH - blockH) / 2 + lineH * 0.85;
      drawPdfCellText(pdf, lines, hAlign, xLeft, xRight, cellW, yText, lineH);
    });
    ctx.y = y0 + headerH;

    pdf.setTextColor(0, 0, 0);
    table.rows.forEach(function(row, ri){
      var rh = rowHeight(row, false);
      ensureSpace(ctx, rh);
      y0 = ctx.y;
      var isTotal = table.rowFlags && table.rowFlags[ri];
      if (isTotal) pdf.setFillColor(PDF_THEME.brandLight[0], PDF_THEME.brandLight[1], PDF_THEME.brandLight[2]);
      else if (ri % 2 === 0) pdf.setFillColor(PDF_THEME.zebra[0], PDF_THEME.zebra[1], PDF_THEME.zebra[2]);
      else pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, y0, contentW, rh, 'F');
      pdf.setDrawColor(PDF_THEME.border[0], PDF_THEME.border[1], PDF_THEME.border[2]);
      pdf.rect(margin, y0, contentW, rh, 'S');
      drawTableColumnGrid(pdf, margin, y0, rh, colWidths, false);
      pdf.setFontSize(isTotal ? fontSize + 0.3 : fontSize);
      if (isTotal) pdf.setTextColor(20, 55, 45);
      row.forEach(function(cell, ci){
        if (ci >= cols) return;
        var align = cellAlign(ci, cell, cols, tableKind);
        var cellW = colWidths[ci] - pad * 2;
        var lines = splitLines(pdf, cell, cellW, isTotal ? fontSize + 0.3 : fontSize);
        var xLeft = colX(margin, colWidths, ci) + pad;
        var xRight = colX(margin, colWidths, ci) + colWidths[ci] - pad;
        drawPdfCellText(pdf, lines, align, xLeft, xRight, cellW, y0 + pad + 2.8, lineH);
      });
      pdf.setTextColor(0, 0, 0);
      ctx.y = y0 + rh;
    });

    ctx.y += COMPACT.tableGap;
    return ctx.y;
  }

  function drawPdfMetricCardsKpi(pdf, ctx, root){
    if (!root) return ctx.y;
    var cards = [];
    root.querySelectorAll('.m').forEach(function(m){
      var label = m.querySelector('.m-label');
      var val = m.querySelector('.m-val');
      var sub = m.querySelector('.m-sub');
      if (label) cards.push({ label: plainCellText(label), val: plainCellText(val), sub: plainCellText(sub) });
    });
    cards = expandKgGroupCardsForPdf(cards);
    if (!cards.length) return ctx.y;

    var cols = Math.min(3, cards.length);
    var gap = 3.5;
    var cardW = (ctx.contentW - gap * (cols - 1)) / cols;
    var cardH = 24;
    var col = 0;
    var rowY = ctx.y;

    ensureSpace(ctx, cardH + 4);
    cards.forEach(function(card, idx){
      if (idx > 0 && col === 0){
        rowY += cardH + gap;
        ensureSpace(ctx, cardH + gap);
      }
      var x = ctx.margin + col * (cardW + gap);
      pdf.setFillColor(PDF_THEME.brandLight[0], PDF_THEME.brandLight[1], PDF_THEME.brandLight[2]);
      pdf.setDrawColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
      pdf.setLineWidth(0.35);
      pdf.rect(x, rowY, cardW, cardH, 'FD');
      pdf.setFillColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
      pdf.rect(x, rowY, cardW, 1.4, 'F');
      pdf.setFontSize(7);
      pdf.setTextColor(PDF_THEME.inkMuted[0], PDF_THEME.inkMuted[1], PDF_THEME.inkMuted[2]);
      splitLines(pdf, card.label, cardW - 5, 7).slice(0, 2).forEach(function(ln, li){
        pdf.text(ln, x + 2.5, rowY + 5.5 + li * 3.4);
      });
      pdf.setFontSize(15);
      pdf.setTextColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
      var valLines = splitLines(pdf, card.val || '—', cardW - 5, 15);
      pdf.text(valLines[0], x + 2.5, rowY + 15.5);
      if (card.sub){
        pdf.setFontSize(6.5);
        pdf.setTextColor(PDF_THEME.inkSoft[0], PDF_THEME.inkSoft[1], PDF_THEME.inkSoft[2]);
        pdf.text(card.sub, x + 2.5, rowY + 21);
      }
      col++;
      if (col >= cols){ col = 0; }
    });
    ctx.y = rowY + cardH + COMPACT.tableGap + 2;
    return ctx.y;
  }

  function drawSectionTitle(pdf, ctx, title){
    ensureSpace(ctx, 16);
    if (!ctx.firstContent) ctx.y += COMPACT.sectionBlockGap;
    var label = title == null || title === '' ? '—' : String(title);
    var barY = ctx.y - 3.5;
    pdf.setFillColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
    pdf.rect(ctx.margin, barY, 2.8, 7, 'F');
    pdf.setFontSize(COMPACT.sectionTitleSize);
    pdf.setTextColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
    pdf.text(label, ctx.margin + 5, ctx.y);
    ctx.y += 2.5;
    pdf.setDrawColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
    pdf.setLineWidth(0.35);
    pdf.line(ctx.margin, ctx.y, ctx.margin + ctx.contentW * 0.42, ctx.y);
    ctx.y += COMPACT.sectionTitleGap;
    pdf.setTextColor(0, 0, 0);
    ctx.firstContent = false;
  }

  function drawPdfTableOfContents(pdf, margin, entries){
    var pageW = pdf.internal.pageSize.getWidth();
    var contentW = pageW - margin * 2;
    var top = pdfContentTop(margin);
    var y = top + 4;
    pdf.setFont(FONT_NAME, 'normal');
    pdf.setFontSize(13);
    pdf.setTextColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
    pdf.text(pdfT('pdf.toc.title'), margin, y);
    y += 8;
    pdf.setDrawColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
    pdf.setLineWidth(0.35);
    pdf.line(margin, y, margin + contentW * 0.35, y);
    y += 7;

    function drawTocEntry(entry){
      if (y > pdf.internal.pageSize.getHeight() - margin - 8){
        pdf.addPage();
        y = top + 4;
      }
      var title = entry.n + '. ' + entry.title;
      var pageStr = String(entry.page);
      pdf.setFontSize(9);
      pdf.setTextColor(30, 30, 30);
      var titleMax = contentW - pdf.getTextWidth(pageStr) - 6;
      var lines = splitLines(pdf, title, titleMax, 9);
      lines.forEach(function(ln, li){
        pdf.text(ln, margin + (entry.group ? 4 : 0), y + li * 4.2);
      });
      var lineY = y + (lines.length - 1) * 4.2;
      pdf.text(pageStr, pageW - margin, lineY, { align: 'right' });
      y += lines.length * 4.2 + 3.5;
    }

    var groupOrder = ['results', 'inputs', 'analysis'];
    var groupLabels = {
      results: pdfT('pdf.toc.group.results'),
      inputs: pdfT('pdf.toc.group.inputs'),
      analysis: pdfT('pdf.toc.group.analysis')
    };
    var hasGroups = entries.some(function(e){ return e.group; });
    if (hasGroups){
      groupOrder.forEach(function(g){
        var items = entries.filter(function(e){ return e.group === g; });
        if (!items.length) return;
        if (y > pdf.internal.pageSize.getHeight() - margin - 12){
          pdf.addPage();
          y = top + 4;
        }
        pdf.setFontSize(10);
        pdf.setTextColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
        pdf.text(groupLabels[g], margin, y);
        y += 6;
        items.forEach(drawTocEntry);
        y += 2;
      });
      entries.filter(function(e){ return !e.group; }).forEach(drawTocEntry);
    } else {
      entries.forEach(drawTocEntry);
    }
  }

  function drawPdfClosingPage(pdf, margin, opts){
    opts = opts || {};
    var pageW = pdf.internal.pageSize.getWidth();
    var pageH = pdf.internal.pageSize.getHeight();
    var cx = pageW / 2;
    var y = pageH * 0.28;
    pdf.setFont(FONT_NAME, 'normal');
    if (opts.logoDataUrl){
      var logoMm = 28;
      pdf.addImage(opts.logoDataUrl, 'PNG', cx - logoMm / 2, y, logoMm, logoMm, undefined, 'FAST');
      y += logoMm + 10;
    }
    pdf.setFontSize(12);
    pdf.setTextColor(PDF_THEME.brand[0], PDF_THEME.brand[1], PDF_THEME.brand[2]);
    splitLines(pdf, opts.tagline || pdfT('pdf.brand.tagline'), pageW - margin * 2, 12).forEach(function(ln){
      pdf.text(ln, cx, y, { align: 'center' });
      y += 5.5;
    });
    y += 4;
    pdf.setFontSize(9);
    pdf.setTextColor(PDF_THEME.inkMuted[0], PDF_THEME.inkMuted[1], PDF_THEME.inkMuted[2]);
    if (opts.site) pdf.text(opts.site, cx, y, { align: 'center' });
    y += 6;
    if (opts.date) pdf.text(opts.date, cx, y, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setTextColor(PDF_THEME.inkSoft[0], PDF_THEME.inkSoft[1], PDF_THEME.inkSoft[2]);
    pdf.text(pdfT('pdf.closing.note'), cx, pageH - margin - 4, { align: 'center' });
  }

  function collectTablesForSection(sectionId, exportOpts, ctx){
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
      if (item.mode === 'adv-blocks'){
        parseAdvBlocks(el).forEach(function(t){
          out.push({ title: t.title, data: t.data });
        });
        return;
      }
      if (item.mode === 'equip-groups'){
        parseEquipGroups(el, ctx && ctx.contentW).forEach(function(t){
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
      else if (item.mode === 'table' && el.tagName === 'TABLE') data = parseHtmlTable(el);
      else if (el.tagName === 'TABLE') data = parseHtmlTable(el);
      else data = parseHtmlTable(el.querySelector('table'));
      if (data) data = normalizePdfTableHeaders(data, item);
      if (data && item.selector === '#econ-cultures-breakdown') {
        data = dropTableCols(data, [5]);
        if (data.rows && data.rows.length){
          data.rows = data.rows.map(function(r){
            return r.map(function(cell, ci){
              return ci === 3 ? compactPdfCultureOutput(cell) : cell;
            });
          });
        }
        var noteEl = document.getElementById('econ-cultures-breakdown-note');
        if (noteEl && !noteEl.hidden && noteEl.textContent.trim()){
          data.footnote = plainCellText(noteEl.textContent);
        }
      }
      if (data && (data.rows.length || data.headers.length)) out.push({ title: title, data: data });
    });
    return out;
  }

  function renderVectorEconSection(pdf, ctx, sectionId, sectionTitle, exportOpts){
    var spec = vectorSections()[sectionId];
    if (!spec) return Promise.resolve(ctx);
    var hasKpi = spec.some(function(item){ return item.mode === 'metric-cards-kpi'; });
    var tables = collectTablesForSection(sectionId, exportOpts, ctx);
    if (!tables.length && !hasKpi) return Promise.resolve(ctx);
    drawSectionTitle(pdf, ctx, sectionTitle);
    var multi = tables.length > 1;
    spec.forEach(function(item){
      if (item.mode !== 'metric-cards-kpi') return;
      var el = document.querySelector(item.selector);
      if (el) drawPdfMetricCardsKpi(pdf, ctx, el);
    });
    tables.forEach(function(t){
      drawPdfTable(pdf, ctx, t.data, {
        title: multi && t.title ? t.title : null,
        skipTitleIf: sectionTitle,
        footnote: t.data.footnote || null,
        colWidths: t.data.colWidths || null
      });
    });
    return Promise.resolve(ctx);
  }

  function isVectorEconSection(id){
    return !!vectorSections()[id];
  }

  function pdfUsableHeightMm(ctx, margin){
    var pageH = ctx.pdf.internal.pageSize.getHeight();
    var top = ctx.contentTop != null ? ctx.contentTop : margin;
    return pageH - top - margin;
  }

  function appendCanvasAt(pdf, ctx, canvas, margin, contentW, opts){
    opts = opts || {};
    var top = ctx.contentTop != null ? ctx.contentTop : margin;
    var usableH = pdfUsableHeightMm(ctx, margin);
    var pxPerMm = canvas.width / contentW;
    var slicePx = Math.floor(usableH * pxPerMm);
    if (slicePx < 1) slicePx = canvas.height;
    var blockHmm = canvas.height / pxPerMm;

    if (opts.atomic && blockHmm <= usableH + 0.5){
      var spaceLeft = usableH - (ctx.y - top);
      if (blockHmm > spaceLeft + 0.5){
        pdf.addPage();
        ctx.y = top;
      }
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, ctx.y, contentW, blockHmm);
      ctx.y += blockHmm + 1;
      ctx.firstContent = false;
      return ctx;
    }

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

  global.DG_PDF_HEADER_BAND_MM = PDF_HEADER_BAND_MM;
  global.DG_pdfContentTop = pdfContentTop;
  global.DG_PDF_THEME = PDF_THEME;

  global.DG_PDF_VECTOR_ECON = vectorSections;
  global.DG_isVectorEconPdfSection = isVectorEconSection;
  global.DG_ensurePdfCyrillicFont = ensurePdfCyrillicFont;
  global.DG_createPdfCtx = createPdfCtx;
  global.DG_renderVectorEconPdfSection = renderVectorEconSection;
  global.DG_appendCanvasToPdfCtx = appendCanvasAt;
  global.DG_parseHtmlTableForPdf = parseHtmlTable;
  global.DG_drawPdfTableOfContents = drawPdfTableOfContents;
  global.DG_drawPdfClosingPage = drawPdfClosingPage;
})(typeof window !== 'undefined' ? window : this);
