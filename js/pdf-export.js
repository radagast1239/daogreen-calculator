/** Выгрузка PDF с выбором разделов — DG_initPdfExport */
(function(global){
  'use strict';

  function pdfT(k){ return (global.DG_t && global.DG_t(k)) || k; }
  function pdfBrandTagline(){
    var key = 'pdf.brand.tagline';
    var t = pdfT(key);
    return t !== key ? t : PDF_BRAND_TAGLINE;
  }
  function secLabel(id){ return pdfT('pdf.sec.' + id); }
  function grpLabel(g){ return pdfT('pdf.grp.' + g); }

  var SECTIONS = [
    { id: 'cover', group: 'general', kind: 'cover' },
    { id: 'planting-facility-env', group: 'planting', selector: '#facility-env-wrap' },
    { id: 'panel-cultivars', group: 'planting', selector: '#panel-cultivars' },
    { id: 'planting-hero', group: 'planting', selector: '#planting-hero' },
    { id: 'panel-georgy-simple', group: 'planting', selector: '#panel-georgy-simple', georgyOnly: true },
    { id: 'panel-culture', group: 'planting', selector: '#panel-culture' },
    { id: 'env-panel', group: 'planting', selector: '#env-panel' },
    { id: 'panel-bio-margin', group: 'planting', selector: '#panel-bio-margin' },
    { id: 'block-panel-growth', group: 'planting', selector: '#block-panel-growth' },
    { id: 'block-panel-multicut', group: 'planting', selector: '#block-panel-multicut' },
    { id: 'block-panel-geom', group: 'planting', selector: '#block-panel-geom' },
    { id: 'panel-system', group: 'planting', selector: '#panel-system' },
    { id: 'panel-pallet-geom', group: 'planting', selector: '#panel-pallet-geom' },
    { id: 'panel-gh-yield', group: 'planting', selector: '#panel-gh-yield-totals' },
    { id: 'panel-cv-compare', group: 'planting', selector: '#panel-cv-compare' },
    { id: 'panel-metrics', group: 'planting', selector: '#panel-metrics' },
    { id: 'panel-scenarios', group: 'planting', selector: '#panel-scenarios' },
    { id: 'panel-schema', group: 'planting', selector: '#panel-schema' },
    { id: 'panel-planting-advanced', group: 'planting', selector: '#panel-planting-advanced' },
    { id: 'block-panel-recs', group: 'planting', selector: '#block-panel-recs' },
    { id: 'panel-channel-guide', group: 'planting', selector: '#panel-channel-guide' },
    { id: 'panel-pallet-guide', group: 'planting', selector: '#panel-pallet-guide' },
    { id: 'block-panel-standards', group: 'planting', selector: '#block-panel-standards' },
    { id: 'econ-cult-unit-cost', group: 'economics', kind: 'econ-cult-unit-cost', skipPdfWrapTitle: true },
    { id: 'econ-farm-final', group: 'economics', selector: '#econ-results-final', vectorId: 'econ-farm-final', skipPdfWrapTitle: true },
    { id: 'econ-warnings', group: 'economics', selector: '#econ-warnings' },
    { id: 'econ-general', group: 'economics', selector: '#econ-panel-general', vectorId: 'econ-general' },
    { id: 'econ-cultures', group: 'economics', selector: '#econ-panel-cultures' },
    { id: 'econ-yield', group: 'economics', selector: '#econ-panel-yield-summary', vectorId: 'econ-yield-summary' },
    { id: 'econ-elec', group: 'economics', selector: '#econ-panel-elec', vectorId: 'econ-elec' },
    { id: 'econ-payroll', group: 'economics', selector: '#econ-panel-payroll', vectorId: 'econ-payroll' },
    { id: 'econ-costs', group: 'economics', selector: '#econ-panel-costs', vectorId: 'econ-costs' },
    { id: 'econ-equipment', group: 'economics', selector: '#econ-panel-equipment', vectorId: 'econ-equipment' },
    { id: 'econ-results', group: 'economics', selector: '#econ-panel-results', vectorId: 'econ-results' },
    { id: 'econ-advanced', group: 'economics', selector: '#econ-panel-advanced', vectorId: 'econ-advanced' },
    { id: 'econ-sensitivity', group: 'economics', selector: '#econ-panel-sensitivity', vectorId: 'econ-sensitivity' },
    { id: 'econ-payback', group: 'economics', selector: '#econ-panel-payback', vectorId: 'econ-payback' }
  ];

  var CULT_PDF_PER_PAGE = 3;

  var DEFAULT_SELECTED = [
    'cover', 'planting-facility-env', 'panel-cultivars', 'planting-hero', 'panel-culture', 'env-panel', 'block-panel-geom', 'panel-metrics',
    'panel-gh-yield', 'panel-schema', 'econ-general', 'econ-cultures', 'econ-results'
  ];

  var PDF_W_PX = 794;
  var PDF_SCALE = 2.5;
  var PDF_MARGIN_MM = 12;
  var PDF_LOGO_PATH = 'assets/dao-logo.png';
  var PDF_LOGO_SMALL_MM = 9;
  var PDF_BRAND_TAGLINE = 'DAOGREEN проектирование и запуск вертикальных ферм';
  var PDF_SITE_LABEL = 'daogreen.ru';

  var PDF_ECON_TOC_GROUPS = {
    results: ['econ-farm-final', 'econ-warnings', 'econ-yield', 'econ-cult-unit-cost', 'econ-results'],
    inputs: ['econ-general', 'econ-cultures', 'econ-elec', 'econ-payroll', 'econ-costs', 'econ-equipment'],
    analysis: ['econ-advanced', 'econ-sensitivity', 'econ-payback']
  };

  function econTocGroupForId(id){
    var g;
    for (g in PDF_ECON_TOC_GROUPS){
      if (PDF_ECON_TOC_GROUPS[g].indexOf(id) >= 0) return g;
    }
    return null;
  }

  var PDF_PRESETS = {
    planting: [
      'cover', 'planting-facility-env', 'panel-cultivars', 'planting-hero', 'panel-culture', 'env-panel', 'panel-bio-margin',
      'block-panel-geom', 'panel-gh-yield',
      'panel-metrics', 'panel-schema', 'panel-planting-advanced', 'block-panel-recs',
      'econ-cult-unit-cost', 'econ-farm-final'
    ],
    econBrief: [
      'cover', 'econ-farm-final', 'econ-warnings', 'econ-yield', 'econ-cult-unit-cost', 'econ-results'
    ],
    econ: [
      'cover', 'econ-farm-final', 'econ-warnings', 'econ-yield', 'econ-cult-unit-cost', 'econ-results',
      'econ-general', 'econ-cultures', 'econ-elec', 'econ-payroll', 'econ-costs', 'econ-equipment',
      'econ-advanced', 'econ-sensitivity', 'econ-payback'
    ],
    econClient: [
      'cover', 'econ-farm-final', 'econ-yield', 'econ-cult-unit-cost', 'econ-results', 'econ-payback'
    ],
    full: null
  };

  function vectorSectionKey(sec){
    return (sec && sec.vectorId) || (sec && sec.id) || '';
  }

  function sortSelectedIds(ids){
    var order = {};
    SECTIONS.forEach(function(s, i){ order[s.id] = i; });
    return ids.slice().sort(function(a, b){
      return (order[a] != null ? order[a] : 999) - (order[b] != null ? order[b] : 999);
    });
  }

  var PDF_LIB_LOCAL = {
    html2canvas: 'js/vendor/html2canvas.min.js',
    jspdf: 'js/vendor/jspdf.umd.min.js'
  };
  var PDF_LIB_CDN = {
    html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  };

  function loadPdfLibPair(urls){
    return loadScriptOnce(urls.html2canvas).then(function(){
      return loadScriptOnce(urls.jspdf);
    });
  }

  function hasPdfLibs(){
    var jsPDF = (global.jspdf && global.jspdf.jsPDF) || global.jsPDF;
    return !!(global.html2canvas && jsPDF);
  }

  function loadScriptOnce(src){
    return new Promise(function(resolve, reject){
      var sel = 'script[data-pdf-lib="' + src + '"]';
      var existing = document.querySelector(sel);
      if (existing){
        if (existing.dataset.loaded === '1') return resolve();
        existing.addEventListener('load', function(){ resolve(); });
        existing.addEventListener('error', function(){ reject(new Error((global.DG_t && global.DG_t('pdf.err.lib')) || 'PDF lib')); });
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.dataset.pdfLib = src;
      s.crossOrigin = 'anonymous';
      s.onload = function(){ s.dataset.loaded = '1'; resolve(); };
      s.onerror = function(){ reject(new Error((global.DG_t && global.DG_t('pdf.err.libNet')) || 'PDF lib net')); };
      document.head.appendChild(s);
    });
  }

  function loadPdfLibs(){
    if (hasPdfLibs()) return Promise.resolve();
    return loadPdfLibPair(PDF_LIB_LOCAL).catch(function(){
      return loadPdfLibPair(PDF_LIB_CDN);
    }).then(function(){
      if (!hasPdfLibs()){
        throw new Error((global.DG_t && global.DG_t('pdf.err.unavail')) || 'PDF unavailable');
      }
    });
  }

  function pdfApis(){
    var jsPDF = (global.jspdf && global.jspdf.jsPDF) || global.jsPDF;
    var html2canvas = global.html2canvas;
    if (!jsPDF || !html2canvas){
      throw new Error((global.DG_t && global.DG_t('pdf.err.noload')) || 'PDF not loaded');
    }
    return { jsPDF: jsPDF, html2canvas: html2canvas };
  }

  function initPdfExport(deps){
    var pdfExportCtx = null;
    deps = deps || {};
    deps.getPdfExportContext = function(){ return pdfExportCtx; };
    deps.setPdfExportContext = function(ctx){ pdfExportCtx = ctx || null; };
    deps.clearPdfExportContext = function(){ pdfExportCtx = null; };

    var dialog = document.getElementById('pdf-export-dialog');
    var checklist = document.getElementById('pdf-export-checklist');
    var btnOpen = document.getElementById('btn-export-pdf');
    if (!dialog || !checklist || !btnOpen){
      console.warn('PDF: не найдены элементы диалога (pdf-export-dialog / checklist / btn-export-pdf)');
      return;
    }
    if (btnOpen.dataset.pdfExportBound) return;
    btnOpen.dataset.pdfExportBound = '1';

    function renderChecklist(){
      var groups = {};
      SECTIONS.forEach(function(sec){
        if (!groups[sec.group]) groups[sec.group] = [];
        groups[sec.group].push(sec);
      });
      var html = '';
      Object.keys(groups).forEach(function(g){
        html += '<fieldset class="pdf-export-group"><legend>' + grpLabel(g) + '</legend>';
        groups[g].forEach(function(sec){
          var checked = DEFAULT_SELECTED.indexOf(sec.id) >= 0 ? ' checked' : '';
          html += '<label class="pdf-export-item"><input type="checkbox" name="pdf-sec" value="' + sec.id + '"' + checked + '> ' + secLabel(sec.id) + '</label>';
        });
        html += '</fieldset>';
      });
      checklist.innerHTML = html;
    }

    renderChecklist();

    function applyPreset(ids){
      var set = {};
      (ids || []).forEach(function(id){ set[id] = true; });
      checklist.querySelectorAll('input[name="pdf-sec"]').forEach(function(cb){
        cb.checked = !!set[cb.value];
      });
    }

    var selAll = document.getElementById('pdf-select-all');
    var selNone = document.getElementById('pdf-select-none');
    var presetPlanting = document.getElementById('pdf-preset-planting');
    var presetEcon = document.getElementById('pdf-preset-econ');
    var presetFull = document.getElementById('pdf-preset-full');
    if (selAll) selAll.addEventListener('click', function(){
      checklist.querySelectorAll('input[name="pdf-sec"]').forEach(function(cb){ cb.checked = true; });
    });
    if (selNone) selNone.addEventListener('click', function(){
      checklist.querySelectorAll('input[name="pdf-sec"]').forEach(function(cb){ cb.checked = false; });
    });
    if (presetPlanting) presetPlanting.addEventListener('click', function(){ applyPreset(PDF_PRESETS.planting); });
    if (presetEcon) presetEcon.addEventListener('click', function(){ applyPreset(PDF_PRESETS.econ); });
    var presetEconBrief = document.getElementById('pdf-preset-econ-brief');
    var presetEconClient = document.getElementById('pdf-preset-econ-client');
    if (presetEconBrief) presetEconBrief.addEventListener('click', function(){ applyPreset(PDF_PRESETS.econBrief); });
    if (presetEconClient) presetEconClient.addEventListener('click', function(){ applyPreset(PDF_PRESETS.econClient); });
    if (presetFull) presetFull.addEventListener('click', function(){
      applyPreset(SECTIONS.map(function(s){ return s.id; }));
    });

    btnOpen.addEventListener('click', function(){
      renderChecklist();
      if (deps.getState && deps.getState().appView === 'economics'){
        applyPreset(PDF_PRESETS.econBrief);
      }
      dialog.returnValue = '';
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });

    dialog.addEventListener('close', function(){
      if (dialog.returnValue !== 'export') return;
      var ids = [];
      checklist.querySelectorAll('input[name="pdf-sec"]:checked').forEach(function(cb){ ids.push(cb.value); });
      if (!ids.length){
        alert(pdfT('pdf.pickOne'));
        return;
      }
      runExport(ids).catch(function(err){
        console.error(err);
        alert((global.DG_tFmt ? global.DG_tFmt('pdf.err.export', { msg: (err && err.message ? err.message : String(err)) }) : 'PDF: ' + err));
      });
    });

    dialog.querySelectorAll('[data-pdf-cancel]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        if (typeof dialog.close === 'function') dialog.close('cancel');
      });
    });

    function htmlEsc(s){
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    var pdfLogoDataUrl = null;

    function pdfLogoSrc(){
      return pdfLogoDataUrl || PDF_LOGO_PATH;
    }

    function loadPdfLogoDataUrl(){
      if (pdfLogoDataUrl) return Promise.resolve(pdfLogoDataUrl);
      return fetch(PDF_LOGO_PATH).then(function(r){
        if (!r.ok) throw new Error('logo');
        return r.blob();
      }).then(function(blob){
        return new Promise(function(resolve, reject){
          var reader = new FileReader();
          reader.onload = function(){
            pdfLogoDataUrl = reader.result;
            resolve(pdfLogoDataUrl);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }).catch(function(){
        return null;
      });
    }

    function preloadPdfLogoImage(){
      return loadPdfLogoDataUrl().then(function(dataUrl){
        if (!dataUrl) return;
        return new Promise(function(resolve){
          var img = new Image();
          img.onload = img.onerror = resolve;
          img.src = dataUrl;
        });
      });
    }

    function coverLogoLargeHtml(){
      return '<div class="pdf-cover-logo-lg"><img src="' + htmlEsc(pdfLogoSrc()) + '" alt="Daogreen" crossorigin="anonymous"></div>';
    }

    function coverTaglineHtml(){
      return '<p class="pdf-cover-tagline">' + htmlEsc(pdfBrandTagline()) + '</p>';
    }

    function buildCover(){
      var meta = deps.getExportMeta ? deps.getExportMeta() : {};
      var brand = !!meta.brandCover;
      var kpis = meta.kpiCards || [];
      var lines = meta.lines || [];
      var wrap = document.createElement('div');
      wrap.className = 'pdf-page-block pdf-cover-block' + (brand ? ' pdf-cover-brand-page' : '');

      if (brand){
        var title = meta.projectTitle || meta.title || pdfT('pdf.cover');
        var client = meta.client ? String(meta.client).trim() : '';
        var city = meta.city ? String(meta.city).trim() : '';
        var note = meta.projectNote ? String(meta.projectNote).trim() : '';
        wrap.innerHTML =
          '<div class="pdf-cover-topbar"></div>' +
          coverLogoLargeHtml() +
          coverTaglineHtml() +
          '<h1 class="pdf-cover-title">' + htmlEsc(title) + '</h1>' +
          (client ? '<p class="pdf-cover-client"><span class="pdf-cover-client-lbl">' + htmlEsc(pdfT('pdf.cover.forClient')) + '</span> ' + htmlEsc(client) + '</p>' : '') +
          (city ? '<p class="pdf-cover-city">' + htmlEsc(city) + '</p>' : '') +
          (meta.subtitle ? '<p class="pdf-cover-sub">' + htmlEsc(meta.subtitle) + '</p>' : '') +
          '<p class="pdf-cover-date">' + htmlEsc(meta.date || '') + '</p>' +
          (kpis.length ? ('<div class="pdf-cover-kpi-grid">' + kpis.map(function(k, idx){
            var wide = idx === 0 && kpis.length > 2 ? ' pdf-cover-kpi--wide' : '';
            return '<div class="pdf-cover-kpi' + wide + '">' +
              '<div class="pdf-cover-kpi-l">' + htmlEsc(k.label) + '</div>' +
              '<div class="pdf-cover-kpi-v">' + htmlEsc(k.value) +
              (k.unit ? ' <span class="pdf-cover-kpi-u">' + htmlEsc(k.unit) + '</span>' : '') +
              '</div></div>';
          }).join('') + '</div>') : '') +
          (note ? '<p class="pdf-cover-note">' + htmlEsc(note) + '</p>' : '') +
          '<p class="pdf-cover-disclaimer">' + htmlEsc(pdfT('pdf.cover.disclaimer')) + '</p>';
        return wrap;
      }

      wrap.innerHTML =
        coverLogoLargeHtml() +
        coverTaglineHtml() +
        '<h1 class="pdf-cover-title">' + htmlEsc(meta.title || pdfT('pdf.cover')) + '</h1>' +
        '<p class="pdf-cover-sub">' + htmlEsc(meta.subtitle || '') + '</p>' +
        '<p class="pdf-cover-date">' + htmlEsc(meta.date || '') + '</p>' +
        '<div class="pdf-cover-metrics">' + lines.map(function(l){
          return '<div class="pdf-cover-metric"><span class="pdf-cover-m-l">' + htmlEsc(l.label) + '</span><span class="pdf-cover-m-v">' + htmlEsc(l.value) + (l.unit ? ' <span class="pdf-cover-m-u">' + htmlEsc(l.unit) + '</span>' : '') + '</span></div>';
        }).join('') + '</div>';
      return wrap;
    }

    function wrapWithSectionTitle(block, title){
      if (!title || block.classList.contains('pdf-cover-block')) return block;
      var wrap = document.createElement('div');
      wrap.className = 'pdf-export-wrap pdf-page-block';
      var h = document.createElement('h2');
      h.className = 'pdf-section-title';
      h.textContent = title;
      block.classList.remove('pdf-page-block');
      wrap.appendChild(h);
      wrap.appendChild(block);
      return wrap;
    }

    function copyCanvasesFromSource(source, clone){
      var srcList = source.querySelectorAll('canvas');
      var dstList = clone.querySelectorAll('canvas');
      for (var i = 0; i < dstList.length && i < srcList.length; i++){
        var src = srcList[i];
        var dst = dstList[i];
        if (!src.width || !src.height) continue;
        dst.width = src.width;
        dst.height = src.height;
        var ctx = dst.getContext('2d');
        if (ctx) ctx.drawImage(src, 0, 0);
      }
    }

    function maskEconDomForPdf(root){
      root.querySelectorAll('#block-econ-mix, .econ-mix-fold, .econ-mix-hint, .econ-mix-bd-hint, .econ-mix-inline').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('#econ-panel-cultures, .econ-cultures-intro, .econ-cultures-total').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.econ-metric-line--share').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.econ-results-per-culture, .econ-results-farm, .econ-elec-charts-wrap').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.econ-results-metrics .econ-results-section').forEach(function(sec){
        if (sec.querySelector('.econ-results-per-culture, .econ-results-farm')) sec.style.display = 'none';
      });
      var waterOff = root.querySelector('#econ-water-enabled');
      if (waterOff && !waterOff.checked){
        var waterOpt = root.querySelector('#econ-water-opt');
        if (waterOpt) waterOpt.style.display = 'none';
      }
      var wasteOff = root.querySelector('#econ-waste-enabled');
      if (wasteOff && !wasteOff.checked){
        var wasteOpt = root.querySelector('#econ-waste-opt');
        if (wasteOpt) wasteOpt.style.display = 'none';
      }
    }

    function maskEconTaxDomForPdf(root){
      var vatTog = root.querySelector('#econ-vat-tax');
      if (vatTog && !vatTog.checked){
        var vatGroup = vatTog.closest('.econ-tax-group');
        if (vatGroup){
          vatGroup.querySelectorAll('.econ-tax-nested, .econ-tax-hint').forEach(function(el){
            el.style.display = 'none';
          });
          var vatInc = vatGroup.querySelector('#econ-vat-inclusive');
          var vatIncRow = vatInc && vatInc.closest('.econ-toggle-row');
          if (vatIncRow) vatIncRow.style.display = 'none';
        }
      }
      var profitTog = root.querySelector('#econ-profit-tax');
      if (profitTog && !profitTog.checked){
        var profitGroup = profitTog.closest('.econ-tax-group');
        if (profitGroup){
          var nested = profitGroup.querySelector('.econ-tax-nested');
          if (nested) nested.style.display = 'none';
        }
      }
    }

    function prepareClone(root, sec){
      var isPlanting = sec && sec.group === 'planting';
      maskEconTaxDomForPdf(root);
      root.style.background = isPlanting ? 'transparent' : '#fff';
      root.style.color = isPlanting ? '' : '#111';
      root.querySelectorAll('#block-econ-mix, .econ-mix-fold').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.collapse-body').forEach(function(b){
        b.classList.remove('is-collapsed');
        b.style.display = 'block';
        b.style.visibility = 'visible';
        b.style.height = 'auto';
        b.style.overflow = 'visible';
      });
      root.querySelectorAll('input[type="range"]').forEach(function(inp){ inp.style.display = 'none'; });
      var hideBtns = '.toggle, .auto-btn, .econ-actions, .pallet-cell-btn, .pallet-mount-btn, .pot-btn, .month-btn, .facility-btn, .cut-count-btn, button.vf-sheet-badge, .canopy-schema-bar .auto-btn';
      if (isPlanting){
        hideBtns = '.toggle, .auto-btn, .econ-actions, .month-btn, .cut-count-btn, button.vf-sheet-badge, .canopy-schema-bar .auto-btn';
      }
      root.querySelectorAll(hideBtns).forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.cv-btn:not(.on)').forEach(function(el){ el.style.display = 'none'; });
      root.querySelectorAll('.econ-num-fmt').forEach(function(inp){
        var v = inp.value;
        if (document.activeElement !== inp && inp.dataset.fmtDisplay){
          v = inp.dataset.fmtDisplay;
        } else if (inp.type === 'text' && inp.value){
          v = inp.value;
        }
        var span = document.createElement('span');
        span.className = 'pdf-static-val';
        span.textContent = v || '0';
        inp.replaceWith(span);
      });
      root.querySelectorAll('select').forEach(function(sel){
        var row = sel.closest('.ctrl, .econ-field, .econ-culture-card');
        if (!row) return;
        var label = sel.options[sel.selectedIndex];
        var span = document.createElement('span');
        span.className = 'pdf-static-val';
        span.textContent = label ? label.textContent.trim() : (sel.value || '—');
        sel.replaceWith(span);
      });
      root.querySelectorAll('input[type="date"], input[type="number"], input[type="text"]').forEach(function(inp){
        if (inp.classList.contains('pdf-static-val')) return;
        var row = inp.closest('.ctrl, .econ-field');
        if (row){
          var val = inp.value || inp.textContent;
          var span = document.createElement('span');
          span.className = 'pdf-static-val';
          span.textContent = val;
          inp.replaceWith(span);
        }
      });
      root.querySelectorAll('img').forEach(function(img){
        if (img.complete && img.naturalWidth) return;
        img.style.display = 'none';
      });
      root.querySelectorAll('[hidden]').forEach(function(el){
        if (el.id === 'econ-warnings' && el.innerHTML.trim()) el.hidden = false;
      });
      if (root.closest && root.closest('.pdf-export-wrap')){
        root.querySelectorAll('.section-h').forEach(function(h){ h.style.display = 'none'; });
      }
      root.querySelectorAll('.econ-preset-bar, .econ-intro, .econ-elec-cats-intro, .planting-econ-bridge').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('#econ-area-mode-wrap').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('#econ-panel-cultures > p[style]').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.econ-elec-charts-wrap').forEach(function(el){
        el.style.display = 'none';
      });
      if (isPlanting){
        root.classList.add('pdf-planting-block');
        root.classList.remove('env-block-hidden');
        root.querySelectorAll('.collapse-chev').forEach(function(el){ el.style.display = 'none'; });
        root.querySelectorAll('.facility-btn, .pot-btn, .pallet-cell-btn, .pallet-mount-btn').forEach(function(el){
          el.style.pointerEvents = 'none';
        });
      }
      if (!root.getAttribute('data-pdf-econ-cult-detail') &&
          root.querySelector('#econ-cultures-breakdown, #econ-results-metrics, .econ-culture-card, #econ-panel-cultures')){
        maskEconDomForPdf(root);
      }
    }

    function isEconSectionId(id){
      return id && id.indexOf('econ-') === 0;
    }

    function econUiLabel(key){
      var t = global.DG_t && global.DG_t(key);
      return t && t !== key ? t : key;
    }

    function createEconCultPdfWrap(){
      var wrap = document.createElement('div');
      wrap.className = 'pdf-page-block pdf-econ-cult-detail pdf-staging--econ panel econ-panel econ-panel--highlight';
      wrap.setAttribute('data-pdf-econ-cult-detail', '1');
      wrap.setAttribute('data-pdf-atomic', '1');
      wrap.style.cssText = 'display:block;visibility:visible;opacity:1;background:#fff;color:#111;width:' + PDF_W_PX + 'px;max-width:' + PDF_W_PX + 'px;box-sizing:border-box;padding:8px 10px;';
      return wrap;
    }

    function appendEconCultSectionHeader(wrap, isFirst){
      if (!isFirst) return;
      var zone = document.createElement('h2');
      zone.className = 'econ-zone-label';
      zone.textContent = econUiLabel('econ.zone.results');
      wrap.appendChild(zone);
      var head = document.createElement('div');
      head.className = 'section-h';
      head.textContent = econUiLabel('econ.section.results');
      wrap.appendChild(head);
    }

    function fmtSaladPotPdfMoney(n){
      if (!(n > 0)) return '—';
      if (global.DG_formatMoneyInput) return global.DG_formatMoneyInput(n, 1);
      if (global.DG_fmtMoney) return global.DG_fmtMoney(n, { decimals: 1 });
      return String(n);
    }

    function collectSaladPotConsumablesRows(){
      if (!deps.getState) return [];
      var st = deps.getState();
      if (!st || !st.econ || !Array.isArray(st.econ.cultures)) return [];
      var normalize = deps.normalizeEconCultureRow;
      var nameFn = deps.econCvDisplayName;
      var rows = [];
      st.econ.cultures.forEach(function(row){
        if (!row || !row.cvId) return;
        var cv = deps.findCvById && deps.findCvById(row.cvId);
        if (!cv || !(cv.econLotSale && cv.econLotSalePot)) return;
        var norm = normalize ? normalize(row) : row;
        var parts = {
          seeds: Math.max(0, parseFloat(norm.consPotSeeds) || 0),
          vermiculite: Math.max(0, parseFloat(norm.consPotVermiculite) || 0),
          pot: Math.max(0, parseFloat(norm.consPotPot) || 0),
          rockwool: Math.max(0, parseFloat(norm.consPotRockwool) || 0)
        };
        var hasParts = parts.seeds > 0 || parts.vermiculite > 0 || parts.pot > 0 || parts.rockwool > 0;
        var breakdown = !!(norm.consPotBreakdown && hasParts);
        var total = hasParts
          ? Math.round((parts.seeds + parts.vermiculite + parts.pot + parts.rockwool) * 100) / 100
          : Math.max(0, parseFloat(norm.consumablesPerPot) || 0);
        if (!(total > 0)) return;
        rows.push({
          name: nameFn ? nameFn(norm.cvId) : (norm.cvId || '—'),
          parts: parts,
          total: total,
          breakdown: breakdown
        });
      });
      return rows;
    }

    function buildSaladPotPdfBlock(){
      var dataRows = collectSaladPotConsumablesRows();
      if (!dataRows.length) return null;

      var wrap = createEconCultPdfWrap();
      wrap.classList.add('pdf-econ-salad-pot');
      appendEconCultSectionHeader(wrap, true);

      var sub = document.createElement('p');
      sub.className = 'econ-results-sub';
      var subKey = 'pdf.cult.saladPotBreakdown';
      var subTitle = pdfT(subKey);
      sub.textContent = subTitle !== subKey ? subTitle : econUiLabel('econ.cult.consPot');
      wrap.appendChild(sub);

      var hint = document.createElement('p');
      hint.className = 'econ-breakdown-note';
      hint.textContent = econUiLabel('econ.cult.consPot.lotHint');
      wrap.appendChild(hint);

      var scroll = document.createElement('div');
      scroll.className = 'econ-table-scroll';
      var tbl = document.createElement('table');
      tbl.className = 'econ-breakdown econ-salad-pot-breakdown';

      var thead = document.createElement('thead');
      var headTr = document.createElement('tr');
      [
        econUiLabel('econ.cult.culture'),
        econUiLabel('econ.cult.consPot.seeds'),
        econUiLabel('econ.cult.consPot.vermiculite'),
        econUiLabel('econ.cult.consPot.pot'),
        econUiLabel('econ.cult.consPot.rockwool'),
        econUiLabel('econ.cult.consPot.total')
      ].forEach(function(label){
        var th = document.createElement('th');
        th.textContent = label;
        headTr.appendChild(th);
      });
      thead.appendChild(headTr);
      tbl.appendChild(thead);

      var tbody = document.createElement('tbody');
      dataRows.forEach(function(r){
        var tr = document.createElement('tr');
        function partCell(v){ return r.breakdown ? fmtSaladPotPdfMoney(v) : '—'; }
        [
          r.name,
          partCell(r.parts.seeds),
          partCell(r.parts.vermiculite),
          partCell(r.parts.pot),
          partCell(r.parts.rockwool),
          fmtSaladPotPdfMoney(r.total)
        ].forEach(function(cell){
          var td = document.createElement('td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      tbl.appendChild(tbody);
      scroll.appendChild(tbl);
      wrap.appendChild(scroll);
      prepareClone(wrap, { group: 'economics' });
      return wrap;
    }

    function buildEconCultUnitCostBlocks(){
      var metricsEl = document.getElementById('econ-results-metrics');
      var breakdownTbl = document.getElementById('econ-cultures-breakdown');
      var cultSection = null;
      if (metricsEl){
        metricsEl.querySelectorAll('.econ-results-section').forEach(function(sec){
          if (sec.querySelector('.econ-results-per-culture')) cultSection = sec;
        });
      }
      var cards = cultSection
        ? Array.prototype.slice.call(cultSection.querySelectorAll('.econ-culture-metric'))
        : [];
      var hasTable = !!(breakdownTbl && breakdownTbl.querySelector('tr'));
      var saladBlock = buildSaladPotPdfBlock();
      if (!cards.length && !hasTable && !saladBlock) return [];

      var blocks = [];
      if (saladBlock) blocks.push(saladBlock);
      for (var i = 0; i < cards.length; i += CULT_PDF_PER_PAGE){
        var wrap = createEconCultPdfWrap();
        appendEconCultSectionHeader(wrap, i === 0 && !saladBlock);
        var sub = document.createElement('p');
        sub.className = 'econ-results-sub';
        sub.textContent = i === 0
          ? econUiLabel('econ.metrics.byCult')
          : (function(){
            var k = 'pdf.cult.continued';
            var t = pdfT(k);
            return t !== k ? t : econUiLabel('econ.metrics.byCult');
          })();
        wrap.appendChild(sub);
        var grid = document.createElement('div');
        grid.className = 'econ-results-per-culture pdf-econ-cult-page-grid';
        cards.slice(i, i + CULT_PDF_PER_PAGE).forEach(function(card){
          grid.appendChild(card.cloneNode(true));
        });
        var hintText = '';
        grid.querySelectorAll('.econ-uc-breakdown-hint').forEach(function(el){
          if (!hintText) hintText = el.textContent.trim();
          el.remove();
        });
        if (hintText){
          var hintP = document.createElement('p');
          hintP.className = 'econ-uc-breakdown-hint econ-uc-breakdown-hint--pdf';
          hintP.textContent = hintText;
          wrap.appendChild(hintP);
        }
        wrap.appendChild(grid);
        prepareClone(wrap, { group: 'economics' });
        blocks.push(wrap);
      }

      if (hasTable){
        var tblWrap = createEconCultPdfWrap();
        var tblSub = document.createElement('p');
        tblSub.className = 'econ-results-sub';
        var tblKey = 'pdf.cult.tableSummary';
        var tblTitle = pdfT(tblKey);
        tblSub.textContent = tblTitle !== tblKey ? tblTitle : econUiLabel('econ.metrics.byCult');
        tblWrap.appendChild(tblSub);
        var noteEl = document.getElementById('econ-cultures-breakdown-note');
        var scroll = document.createElement('div');
        scroll.className = 'econ-table-scroll';
        if (noteEl && !noteEl.hidden && noteEl.textContent.trim()){
          var note = document.createElement('p');
          note.className = 'econ-breakdown-note';
          note.textContent = noteEl.textContent.trim();
          scroll.appendChild(note);
        }
        scroll.appendChild(breakdownTbl.cloneNode(true));
        tblWrap.appendChild(scroll);
        prepareClone(tblWrap, { group: 'economics' });
        blocks.push(tblWrap);
      }
      return blocks;
    }

    function cloneSection(el, sec){
      if (!el) return null;
      if (el.classList.contains('env-block-hidden')) return null;
      var isPlanting = sec && sec.group === 'planting';
      var clone = el.cloneNode(true);
      clone.classList.add('pdf-page-block');
      clone.classList.remove('app-view-hidden');
      clone.style.cssText = 'display:block;visibility:visible;opacity:1;width:100%;max-width:' + PDF_W_PX + 'px;box-sizing:border-box;' +
        (isPlanting ? 'background:transparent;color:inherit;' : 'background:#fff;color:#111;');
      copyCanvasesFromSource(el, clone);
      prepareClone(clone, sec);
      return clone;
    }

    function blocksForSection(sec){
      if (sec.kind === 'econ-cult-unit-cost') return buildEconCultUnitCostBlocks();
      var block = blockForSection(sec);
      if (!block) return [];
      if (sec.group === 'economics' && !sec.vectorId && sec.kind !== 'cover'){
        block.setAttribute('data-pdf-atomic', '1');
      }
      return [block];
    }

    function blockForSection(sec){
      if (sec.kind === 'cover') return buildCover();
      if (sec.georgyOnly && !document.documentElement.classList.contains('georgy-active')) return null;
      var el = sec.selector ? document.querySelector(sec.selector) : null;
      if (!el) return null;
      if (el.classList.contains('env-block-hidden')) return null;
      if (sec.id === 'econ-warnings'){
        var w = document.getElementById('econ-warnings');
        if (!w || w.hidden || !w.innerHTML.trim()) return null;
      }
      if (sec.id === 'panel-scenarios'){
        var cfg = document.getElementById('scenario-config');
        if (cfg && cfg.style.display === 'none'){
          var note = document.createElement('div');
          note.className = 'pdf-page-block';
          note.style.cssText = 'background:#fff;color:#111;padding:16px;';
          note.innerHTML = '<p class="pdf-note">' + pdfT('pdf.scenB') + '</p>';
          return note;
        }
      }
      if (sec.id === 'panel-cv-compare'){
        var cmp = document.getElementById('compareMode');
        if (!cmp || !cmp.checked){
          var noteCmp = document.createElement('div');
          noteCmp.className = 'pdf-page-block';
          noteCmp.style.cssText = 'background:#fff;color:#111;padding:16px;';
          noteCmp.innerHTML = '<p class="pdf-note">' + pdfT('pdf.cvCompareOff') + '</p>';
          return noteCmp;
        }
      }
      return cloneSection(el, sec);
    }

    function applyStagingLayout(staging, opts){
      opts = opts || {};
      var bg = opts.planting ? '#FAF6EC' : '#fff';
      staging.removeAttribute('aria-hidden');
      staging.style.cssText = [
        'position:fixed', 'left:0', 'top:0', 'width:' + PDF_W_PX + 'px', 'max-width:calc(100vw - 16px)',
        'background:' + bg, 'color:#111', 'z-index:2147483000', 'pointer-events:none',
        'opacity:1', 'visibility:visible', 'display:block', 'box-sizing:border-box', 'padding:8px 12px',
        'overflow:visible', 'height:auto', 'min-height:1px'
      ].join(';');
    }

    function waitForBlockImages(block, timeoutMs){
      var imgs = block ? block.querySelectorAll('img') : [];
      if (!imgs.length) return Promise.resolve();
      timeoutMs = timeoutMs || 8000;
      var pending = [];
      for (var i = 0; i < imgs.length; i++){
        var img = imgs[i];
        if (!(img.complete && img.naturalWidth)) pending.push(img);
      }
      if (!pending.length) return Promise.resolve();
      return Promise.race([
        Promise.all(pending.map(function(img){
          return new Promise(function(resolve){
            img.onload = img.onerror = resolve;
          });
        })),
        new Promise(function(resolve){ setTimeout(resolve, timeoutMs); })
      ]);
    }

    function waitForPaint(ms){
      return new Promise(function(resolve){
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            setTimeout(resolve, ms || 120);
          });
        });
      });
    }

    function measureBlock(block){
      var w = Math.max(block.scrollWidth, block.offsetWidth, 200);
      var h = Math.max(block.scrollHeight, block.offsetHeight, 40);
      block.style.width = w + 'px';
      block.style.minHeight = h + 'px';
      return { w: w, h: h };
    }

    async function captureBlock(html2canvas, block, opts){
      opts = opts || {};
      var size = measureBlock(block);
      return html2canvas(block, {
        scale: PDF_SCALE,
        backgroundColor: opts.planting ? '#FAF6EC' : '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: size.w,
        height: size.h,
        windowWidth: size.w,
        windowHeight: size.h,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false,
        imageTimeout: 15000
      });
    }

    function pdfUsableHeightMmFromCtx(pdfCtx){
      if (global.DG_pdfContentTop && pdfCtx && pdfCtx.pdf){
        var pageH = pdfCtx.pdf.internal.pageSize.getHeight();
        var top = pdfCtx.contentTop != null ? pdfCtx.contentTop : pdfCtx.margin;
        return pageH - top - pdfCtx.margin;
      }
      return 250;
    }

    async function captureRasterInStaging(wrapped, rasterOpts, apis){
      rasterOpts = rasterOpts || {};
      var stagingOne = document.createElement('div');
      stagingOne.className = 'pdf-staging' +
        (rasterOpts.econ ? ' pdf-staging--econ' : '') +
        (rasterOpts.planting ? ' pdf-staging--planting' : '');
      applyStagingLayout(stagingOne, { planting: rasterOpts.planting });
      stagingOne.appendChild(wrapped);
      document.body.appendChild(stagingOne);
      await waitForBlockImages(stagingOne);
      await waitForPaint(120);
      try {
        return await captureBlock(apis.html2canvas, stagingOne, { planting: rasterOpts.planting });
      } finally {
        stagingOne.remove();
      }
    }

    function cultCardsRoot(el){
      if (!el) return null;
      return el.querySelector('[data-pdf-econ-cult-detail]') || el;
    }

    function beginCultChunkPage(pdf, pdfCtx, rasterOpts){
      if (!rasterOpts.cultChunk || !pdfCtx) return;
      pdf.addPage();
      pdfCtx.y = pdfCtx.contentTop != null ? pdfCtx.contentTop : pdfCtx.margin;
    }

    async function appendRasterWrapped(pdf, pdfCtx, apis, wrapped, margin, contentW, rasterOpts){
      rasterOpts = rasterOpts || {};
      var cultRoot = cultCardsRoot(wrapped);
      var atomic = wrapped.getAttribute('data-pdf-atomic') === '1' ||
        !!(cultRoot && cultRoot.getAttribute('data-pdf-atomic') === '1');
      var canvas = await captureRasterInStaging(wrapped, rasterOpts, apis);
      if (!canvas || canvas.width < 2 || canvas.height < 2) return false;

      var pxPerMm = canvas.width / contentW;
      var blockHmm = canvas.height / pxPerMm;
      var maxHmm = pdfUsableHeightMmFromCtx(pdfCtx);

      if (atomic && blockHmm > maxHmm + 0.5){
        var cards = cultRoot ? cultRoot.querySelectorAll('.econ-culture-metric') : [];
        if (cards.length > 1){
          for (var ci = 0; ci < cards.length; ci++){
            beginCultChunkPage(pdf, pdfCtx, rasterOpts);
            var solo = document.createElement('div');
            solo.setAttribute('data-pdf-atomic', '1');
            solo.className = 'pdf-page-block pdf-econ-cult-detail pdf-staging--econ panel econ-panel econ-panel--highlight';
            solo.style.cssText = 'display:block;visibility:visible;opacity:1;background:#fff;color:#111;width:' + PDF_W_PX + 'px;max-width:' + PDF_W_PX + 'px;box-sizing:border-box;padding:8px 10px;';
            if (ci === 0){
              cultRoot.querySelectorAll('.econ-zone-label, .section-h, .econ-results-sub').forEach(function(el){
                solo.appendChild(el.cloneNode(true));
              });
            }
            var soloGrid = document.createElement('div');
            soloGrid.className = 'econ-results-per-culture pdf-econ-cult-page-grid';
            soloGrid.appendChild(cards[ci].cloneNode(true));
            solo.appendChild(soloGrid);
            prepareClone(solo, { group: 'economics' });
            var soloCanvas = await captureRasterInStaging(solo, rasterOpts, apis);
            if (soloCanvas && soloCanvas.width >= 2 && soloCanvas.height >= 2){
              if (pdfCtx && global.DG_appendCanvasToPdfCtx){
                DG_appendCanvasToPdfCtx(pdf, pdfCtx, soloCanvas, margin, contentW, { atomic: true });
              }
            }
          }
          return true;
        }
      }

      beginCultChunkPage(pdf, pdfCtx, rasterOpts);

      if (pdfCtx && global.DG_appendCanvasToPdfCtx){
        DG_appendCanvasToPdfCtx(pdf, pdfCtx, canvas, margin, contentW, { atomic: atomic });
      } else {
        appendCanvasSlicesToPdf(pdf, canvas, margin, contentW, false);
      }
      return true;
    }

    function appendCanvasSlicesToPdf(pdf, canvas, margin, contentW, firstPage){
      var contentTop = global.DG_pdfContentTop ? DG_pdfContentTop(margin) : margin + 14;
      var ctx = global.DG_createPdfCtx ? DG_createPdfCtx(pdf, margin) : { pdf: pdf, margin: margin, y: contentTop, contentTop: contentTop, pageH: pdf.internal.pageSize.getHeight(), contentW: contentW, firstContent: firstPage };
      if (global.DG_appendCanvasToPdfCtx){
        DG_appendCanvasToPdfCtx(pdf, ctx, canvas, margin, contentW);
        return ctx.y > contentTop ? 1 : 0;
      }
      var pageH = pdf.internal.pageSize.getHeight();
      var usableH = pageH - contentTop - margin;
      var pxPerMm = canvas.width / contentW;
      var slicePx = Math.floor(usableH * pxPerMm);
      if (slicePx < 1) slicePx = canvas.height;
      var y = 0;
      var pages = 0;
      var sliceY = contentTop;
      while (y < canvas.height){
        var h = Math.min(slicePx, canvas.height - y);
        var slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = h;
        var ctx2d = slice.getContext('2d');
        if (!ctx2d) break;
        ctx2d.fillStyle = '#ffffff';
        ctx2d.fillRect(0, 0, slice.width, slice.height);
        ctx2d.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
        var sliceHmm = h / pxPerMm;
        if (!firstPage || pages > 0) pdf.addPage();
        firstPage = false;
        pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, sliceY, contentW, sliceHmm);
        y += h;
        pages++;
        sliceY = contentTop;
      }
      return pages;
    }

    async function appendPaybackChartRaster(pdf, pdfCtx, apis){
      var host = document.querySelector('#econ-payback-body');
      if (!host) return;
      var svg = host.querySelector('.econ-cf-svg');
      if (!svg) return;
      var wrap = document.createElement('div');
      wrap.style.cssText = 'background:#fff;padding:8px;width:' + PDF_W_PX + 'px;';
      wrap.appendChild(svg.cloneNode(true));
      document.body.appendChild(wrap);
      try {
        var canvas = await captureBlock(apis.html2canvas, wrap);
        if (canvas && canvas.height > 2) DG_appendCanvasToPdfCtx(pdf, pdfCtx, canvas, pdfCtx.margin, pdfCtx.contentW);
      } finally {
        wrap.remove();
      }
    }

    function pdfTextArg(v){
      if (v == null || v === '') return '—';
      return String(v);
    }

    function splitPdfTagline(pdf, text, maxW, fontSize){
      pdf.setFontSize(fontSize);
      var words = String(text || '').split(/\s+/).filter(Boolean);
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
      return lines.length ? lines : [''];
    }

    function insertPdfPageAt(pdf, beforePage){
      var target = Math.max(1, Math.min(beforePage, pdf.internal.getNumberOfPages() + 1));
      pdf.addPage();
      var newPage = pdf.internal.getNumberOfPages();
      if (newPage !== target && typeof pdf.movePage === 'function'){
        pdf.movePage(newPage, target);
      }
      return target;
    }

    function insertPdfTableOfContents(pdf, margin, tocEntries, insertAt){
      if (!global.DG_drawPdfTableOfContents || !tocEntries.length) return;
      try {
        insertPdfPageAt(pdf, insertAt);
        tocEntries.forEach(function(e){
          if (e.page >= insertAt) e.page++;
        });
        pdf.setPage(insertAt);
        DG_drawPdfTableOfContents(pdf, margin, tocEntries);
      } catch (err){
        console.warn('PDF TOC skipped:', err);
      }
    }

    function addPdfPageDecorations(pdf, metaTitle, logoDataUrl, opts){
      opts = opts || {};
      var coverPage = opts.coverPage || 0;
      var closingPage = opts.closingPage || 0;
      var pageCount = pdf.internal.getNumberOfPages();
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();
      var footer = pdfTextArg(metaTitle) + ' · Daogreen';
      var logoSize = PDF_LOGO_SMALL_MM;
      var logoY = PDF_MARGIN_MM - 2;
      var logoX = pageW - PDF_MARGIN_MM - logoSize;
      var tagSize = 6.5;
      var tagLineH = tagSize * 1.25;
      var tagMaxW = logoX - PDF_MARGIN_MM - 3;
      var contentTop = global.DG_pdfContentTop ? DG_pdfContentTop(PDF_MARGIN_MM) : PDF_MARGIN_MM + 14;
      var siteLabel = pdfT('pdf.closing.site');
      if (siteLabel === 'pdf.closing.site') siteLabel = PDF_SITE_LABEL;
      if (pdf.__dgDejaVu) pdf.setFont('DejaVu', 'normal');
      for (var p = 1; p <= pageCount; p++){
        pdf.setPage(p);
        var isCover = coverPage > 0 && p === coverPage;
        var isClosing = closingPage > 0 && p === closingPage;
        if (logoDataUrl && !isCover && !isClosing){
          var tagLines = splitPdfTagline(pdf, pdfBrandTagline(), tagMaxW, tagSize);
          var tagBlockH = tagLines.length * tagLineH;
          var tagStartY = logoY + (logoSize - tagBlockH) / 2 + tagSize * 0.85;
          pdf.setFontSize(tagSize);
          pdf.setTextColor(39, 109, 92);
          tagLines.forEach(function(ln, idx){
            pdf.text(ln, logoX - 2, tagStartY + idx * tagLineH, { align: 'right' });
          });
          pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoSize, logoSize, undefined, 'FAST');
          pdf.setDrawColor(39, 109, 92);
          pdf.setLineWidth(0.25);
          pdf.line(PDF_MARGIN_MM, contentTop - 2.5, pageW - PDF_MARGIN_MM, contentTop - 2.5);
        }
        pdf.setFontSize(8);
        pdf.setTextColor(130);
        pdf.text(footer, PDF_MARGIN_MM, pageH - 5);
        pdf.text(siteLabel, pageW / 2, pageH - 5, { align: 'center' });
        pdf.text(pdfTextArg(global.DG_tFmt ? global.DG_tFmt('pdf.page', { p: p, total: pageCount }) : ('p. ' + p + ' / ' + pageCount)), pageW - PDF_MARGIN_MM, pageH - 5, { align: 'right' });
      }
    }

    async function buildPdfFromSections(orderedIds, secMap, filename, metaTitle, exportMeta){
      exportMeta = exportMeta || {};
      var logoDataUrl = await loadPdfLogoDataUrl();
      var apis = pdfApis();
      var pdf = new apis.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      var margin = PDF_MARGIN_MM;
      var contentW = pdf.internal.pageSize.getWidth() - margin * 2;
      var useVector = !!(global.DG_isVectorEconPdfSection && global.DG_ensurePdfCyrillicFont &&
        orderedIds.some(function(id){
          var sec = secMap[id];
          return DG_isVectorEconPdfSection(vectorSectionKey(sec));
        }));
      var pdfCtx = global.DG_createPdfCtx ? DG_createPdfCtx(pdf, margin) : null;
      var hasContent = false;
      var hasCover = orderedIds.indexOf('cover') >= 0;
      var tocEntries = [];
      var secNum = 0;
      var pendingToc = null;

      if (useVector) await DG_ensurePdfCyrillicFont(pdf);

      function sectionDisplayTitle(id){
        if (id === 'cover') return secLabel(id);
        return secNum + '. ' + secLabel(id);
      }

      function beginSectionToc(id){
        if (id === 'cover') return;
        flushSectionToc();
        secNum++;
        pendingToc = {
          n: secNum,
          title: secLabel(id),
          page: 0,
          group: econTocGroupForId(id)
        };
      }

      function pinSectionTocPage(){
        if (pendingToc && !pendingToc.page){
          pendingToc.page = pdf.internal.getNumberOfPages();
        }
      }

      function flushSectionToc(){
        if (pendingToc){
          if (!pendingToc.page) pendingToc.page = pdf.internal.getNumberOfPages();
          tocEntries.push(pendingToc);
          pendingToc = null;
        }
      }

      for (var i = 0; i < orderedIds.length; i++){
        var id = orderedIds[i];
        var sec = secMap[id];
        if (!sec) continue;

        if (useVector && DG_isVectorEconPdfSection(vectorSectionKey(sec))){
          beginSectionToc(id);
          pinSectionTocPage();
          var exportCtx = deps.getPdfExportContext ? deps.getPdfExportContext() : null;
          await DG_renderVectorEconPdfSection(pdf, pdfCtx, vectorSectionKey(sec), sectionDisplayTitle(id), exportCtx);
          if (id === 'econ-payback') await appendPaybackChartRaster(pdf, pdfCtx, apis);
          flushSectionToc();
          hasContent = true;
          continue;
        }

        var blocks = blocksForSection(sec);
        if (!blocks.length) continue;
        beginSectionToc(id);
        var isPlantingPdf = sec.group === 'planting';
        var sectionPinned = false;
        for (var bi = 0; bi < blocks.length; bi++){
          var block = blocks[bi];
          var wrapped = sec.skipPdfWrapTitle ? block : wrapWithSectionTitle(block, sectionDisplayTitle(id));
          if (await appendRasterWrapped(pdf, pdfCtx, apis, wrapped, margin, contentW, {
            planting: isPlantingPdf,
            econ: isEconSectionId(id),
            cultChunk: sec.kind === 'econ-cult-unit-cost' && (bi > 0 || hasContent)
          })){
            if (!sectionPinned){
              pinSectionTocPage();
              sectionPinned = true;
            }
            hasContent = true;
          }
        }
        flushSectionToc();
      }
      flushSectionToc();

      if (!hasContent){
        throw new Error(pdfT('pdf.err.empty'));
      }

      var tocInsertAt = hasCover ? 2 : 1;
      var needsCyrillic = tocEntries.length >= 2 || !!global.DG_drawPdfClosingPage;
      if (needsCyrillic && global.DG_ensurePdfCyrillicFont && !pdf.__dgDejaVu){
        await DG_ensurePdfCyrillicFont(pdf);
      }
      if (tocEntries.length >= 2){
        insertPdfTableOfContents(pdf, margin, tocEntries, tocInsertAt);
      }

      if (global.DG_drawPdfClosingPage){
        try {
          pdf.addPage();
          DG_drawPdfClosingPage(pdf, margin, {
            logoDataUrl: logoDataUrl,
            tagline: pdfBrandTagline(),
            site: pdfT('pdf.closing.site') !== 'pdf.closing.site' ? pdfT('pdf.closing.site') : PDF_SITE_LABEL,
            date: exportMeta.date || ''
          });
        } catch (err){
          console.warn('PDF closing page skipped:', err);
        }
      }

      if (global.DG_ensurePdfCyrillicFont && !pdf.__dgDejaVu) await DG_ensurePdfCyrillicFont(pdf);
      addPdfPageDecorations(pdf, metaTitle, logoDataUrl, {
        coverPage: hasCover ? 1 : 0,
        closingPage: global.DG_drawPdfClosingPage ? pdf.internal.getNumberOfPages() : 0
      });
      pdf.save(filename);
    }

    async function runExport(selectedIds){
      var btn = document.getElementById('pdf-export-go');
      var prevText = btn ? btn.textContent : '';
      if (btn){ btn.disabled = true; btn.textContent = pdfT('pdf.btn.exporting'); }

      var pdfPlantingToken = null;
      try {
        if (deps.setPdfExportContext) deps.setPdfExportContext({ sectionIds: selectedIds.slice() });
        var needEcon = selectedIds.some(function(id){ return id.indexOf('econ-') === 0; });
        var needPlanting = selectedIds.some(function(id){ return id.indexOf('econ-') !== 0 && id !== 'cover'; });
        if (needPlanting && deps.preparePlantingForPdfExport){
          pdfPlantingToken = deps.preparePlantingForPdfExport(selectedIds);
        }
        if (needPlanting && deps.renderAll) deps.renderAll();
        if (needEcon && deps.renderEconomics) deps.renderEconomics();

        if (needEcon && global.DG_collectCalcIssues && deps.getState && deps.calcFarmEconomics){
          var st = deps.getState();
          var farm = deps.calcFarmEconomics(st.econ);
          var issues = global.DG_collectCalcIssues({
            state: st,
            farm: farm,
            parts: farm.parts,
            econWarnings: farm.warnings || [],
            calcResult: deps.calc ? deps.calc() : null,
            deps: deps
          });
          if (global.DG_hasCriticalCalcIssues(issues)){
            var crit = global.DG_mergeIssueTexts(issues, ['critical']).join('\n');
            throw new Error(pdfT('pdf.err.critical') + '\n' + crit);
          }
        }

        await loadPdfLibs();
        await preloadPdfLogoImage();

        var badge = document.getElementById('calc-build-badge');
        if (badge) badge.style.visibility = 'hidden';

        var secMap = {};
        SECTIONS.forEach(function(s){ secMap[s.id] = s; });

        var orderedIds = sortSelectedIds(selectedIds);
        if (!orderedIds.length){
          throw new Error(pdfT('pdf.err.noVisible'));
        }

        var hasCharts = orderedIds.some(function(id){
          return id === 'block-panel-growth' || id === 'panel-schema' || id === 'panel-cv-compare';
        });
        await waitForPaint(hasCharts ? 350 : 200);

        var meta = deps.getExportMeta ? deps.getExportMeta() : {};
        var ctx = deps.getPdfExportContext ? deps.getPdfExportContext() : null;
        var fnameBase = (deps.pdfFilename ? deps.pdfFilename(ctx) : 'daogreen-calc');
        var fname = fnameBase + (String(fnameBase).slice(-4) === '.pdf' ? '' : '.pdf');
        var docTitle = meta.projectTitle || meta.client || meta.title || pdfT('pdf.cover');
        await buildPdfFromSections(orderedIds, secMap, fname, docTitle, meta);
      } finally {
        if (deps.restorePlantingAfterPdfExport && pdfPlantingToken){
          deps.restorePlantingAfterPdfExport(pdfPlantingToken);
        }
        if (deps.clearPdfExportContext) deps.clearPdfExportContext();
        var badge2 = document.getElementById('calc-build-badge');
        if (badge2) badge2.style.visibility = '';
        if (btn){ btn.disabled = false; btn.textContent = prevText || pdfT('pdf.btn.download'); }
      }
    }

  }

  global.DG_initPdfExport = initPdfExport;
})(typeof window !== 'undefined' ? window : this);
