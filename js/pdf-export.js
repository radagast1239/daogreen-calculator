/** Выгрузка PDF с выбором разделов — DG_initPdfExport */
(function(global){
  'use strict';

  function pdfT(k){ return (global.DG_t && global.DG_t(k)) || k; }
  function secLabel(id){ return pdfT('pdf.sec.' + id); }
  function grpLabel(g){ return pdfT('pdf.grp.' + g); }

  var SECTIONS = [
    { id: 'cover', group: 'general', kind: 'cover' },
    { id: 'panel-cultivars', group: 'planting', selector: '#panel-cultivars' },
    { id: 'panel-georgy-simple', group: 'planting', selector: '#panel-georgy-simple', georgyOnly: true },
    { id: 'panel-culture', group: 'planting', selector: '#panel-culture' },
    { id: 'env-panel', group: 'planting', selector: '#env-panel' },
    { id: 'panel-bio-margin', group: 'planting', selector: '#panel-bio-margin' },
    { id: 'block-panel-growth', group: 'planting', selector: '#block-panel-growth' },
    { id: 'block-panel-multicut', group: 'planting', selector: '#block-panel-multicut' },
    { id: 'panel-system', group: 'planting', selector: '#panel-system' },
    { id: 'panel-pallet-geom', group: 'planting', selector: '#panel-pallet-geom' },
    { id: 'panel-gh-yield', group: 'planting', selector: '#panel-gh-yield-totals' },
    { id: 'panel-cv-compare', group: 'planting', selector: '#panel-cv-compare' },
    { id: 'panel-metrics', group: 'planting', selector: '#panel-metrics' },
    { id: 'panel-scenarios', group: 'planting', selector: '#panel-scenarios' },
    { id: 'panel-schema', group: 'planting', selector: '#panel-schema' },
    { id: 'block-panel-recs', group: 'planting', selector: '#block-panel-recs' },
    { id: 'panel-channel-guide', group: 'planting', selector: '#panel-channel-guide' },
    { id: 'panel-pallet-guide', group: 'planting', selector: '#panel-pallet-guide' },
    { id: 'block-panel-standards', group: 'planting', selector: '#block-panel-standards' },
    { id: 'econ-warnings', group: 'economics', selector: '#econ-warnings' },
    { id: 'econ-general', group: 'economics', selector: '#econ-panel-general', vectorId: 'econ-general' },
    { id: 'econ-cultures', group: 'economics', selector: '#econ-panel-cultures' },
    { id: 'econ-yield', group: 'economics', selector: '#econ-panel-yield-summary', vectorId: 'econ-yield-summary' },
    { id: 'econ-elec', group: 'economics', selector: '#econ-panel-elec', vectorId: 'econ-elec' },
    { id: 'econ-payroll', group: 'economics', selector: '#econ-panel-payroll', vectorId: 'econ-payroll' },
    { id: 'econ-costs', group: 'economics', selector: '#econ-panel-costs', vectorId: 'econ-costs' },
    { id: 'econ-equipment', group: 'economics', selector: '#econ-panel-equipment', vectorId: 'econ-equipment' },
    { id: 'econ-results', group: 'economics', selector: '#econ-panel-results', vectorId: 'econ-results' },
    { id: 'econ-advanced', group: 'economics', selector: '#econ-panel-advanced' },
    { id: 'econ-sensitivity', group: 'economics', selector: '#econ-panel-sensitivity', vectorId: 'econ-sensitivity' },
    { id: 'econ-payback', group: 'economics', selector: '#econ-panel-payback', vectorId: 'econ-payback' }
  ];

  var DEFAULT_SELECTED = [
    'cover', 'panel-cultivars', 'panel-culture', 'env-panel', 'panel-system', 'panel-metrics',
    'panel-gh-yield', 'panel-schema', 'econ-general', 'econ-cultures', 'econ-results'
  ];

  var PDF_W_PX = 794;
  var PDF_SCALE = 2.5;
  var PDF_MARGIN_MM = 12;

  var PDF_PRESETS = {
    planting: [
      'cover', 'panel-cultivars', 'panel-culture', 'env-panel', 'panel-bio-margin',
      'block-panel-growth', 'panel-system', 'panel-pallet-geom', 'panel-gh-yield',
      'panel-metrics', 'panel-schema', 'block-panel-recs',
      'panel-channel-guide', 'panel-pallet-guide', 'block-panel-standards'
    ],
    econ: [
      'cover', 'econ-warnings', 'econ-general', 'econ-yield',
      'econ-elec', 'econ-payroll', 'econ-costs', 'econ-equipment', 'econ-results',
      'econ-advanced', 'econ-sensitivity', 'econ-payback'
    ],
    client: ['cover', 'econ-warnings', 'econ-results'],
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
    var btnClient = document.getElementById('btn-export-pdf-client');
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
    var presetClient = document.getElementById('pdf-preset-client');
    var presetFull = document.getElementById('pdf-preset-full');
    if (selAll) selAll.addEventListener('click', function(){
      checklist.querySelectorAll('input[name="pdf-sec"]').forEach(function(cb){ cb.checked = true; });
    });
    if (selNone) selNone.addEventListener('click', function(){
      checklist.querySelectorAll('input[name="pdf-sec"]').forEach(function(cb){ cb.checked = false; });
    });
    if (presetPlanting) presetPlanting.addEventListener('click', function(){ applyPreset(PDF_PRESETS.planting); });
    if (presetEcon) presetEcon.addEventListener('click', function(){ applyPreset(PDF_PRESETS.econ); });
    if (presetClient) presetClient.addEventListener('click', function(){ applyPreset(PDF_PRESETS.client); });
    if (presetFull) presetFull.addEventListener('click', function(){
      applyPreset(SECTIONS.map(function(s){ return s.id; }));
    });

    btnOpen.addEventListener('click', function(){
      renderChecklist();
      if (deps.getState && deps.getState().appView === 'economics'){
        applyPreset(PDF_PRESETS.econ);
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

    function buildCover(){
      var meta = deps.getExportMeta ? deps.getExportMeta() : {};
      var ctx = deps.getPdfExportContext ? deps.getPdfExportContext() : null;
      var brand = !!(ctx && ctx.clientMode) || meta.brandCover;
      var kpis = meta.kpiCards || [];
      var lines = meta.lines || [];
      var wrap = document.createElement('div');
      wrap.className = 'pdf-page-block pdf-cover-block' + (brand ? ' pdf-cover-brand-page' : '');

      if (brand){
        var title = meta.projectTitle || meta.title || pdfT('pdf.cover');
        var client = meta.client ? String(meta.client).trim() : '';
        var note = meta.projectNote ? String(meta.projectNote).trim() : '';
        wrap.innerHTML =
          '<div class="pdf-cover-topbar"></div>' +
          '<div class="pdf-cover-brand">Daogreen</div>' +
          '<h1 class="pdf-cover-title">' + htmlEsc(title) + '</h1>' +
          (client ? '<p class="pdf-cover-client">' + htmlEsc(client) + '</p>' : '') +
          (meta.subtitle ? '<p class="pdf-cover-sub">' + htmlEsc(meta.subtitle) + '</p>' : '') +
          '<p class="pdf-cover-date">' + htmlEsc(meta.date || '') + '</p>' +
          (kpis.length ? ('<div class="pdf-cover-kpi-grid">' + kpis.map(function(k){
            return '<div class="pdf-cover-kpi">' +
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
        '<div class="pdf-cover-brand">Daogreen</div>' +
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

    function stripEconBreakdownTable(tbl){
      if (!tbl) return;
      tbl.querySelectorAll('tr').forEach(function(tr){
        var cells = tr.querySelectorAll('th, td');
        if (cells.length < 3) return;
        if (cells[0]) cells[0].remove();
        if (cells[0]) cells[0].remove();
      });
    }

    function maskEconDomForPdf(root){
      root.querySelectorAll('#econ-panel-cultures, .econ-cultures-intro, .econ-cultures-total').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.econ-mix-inline, .econ-mix-check, .econ-mix-pct-lbl').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.econ-metric-line--share').forEach(function(el){
        el.style.display = 'none';
      });
      stripEconBreakdownTable(root.querySelector('#econ-cultures-breakdown'));
    }

    function prepareClone(root){
      root.style.background = '#fff';
      root.style.color = '#111';
      root.querySelectorAll('.collapse-body').forEach(function(b){
        b.classList.remove('is-collapsed');
        b.style.display = 'block';
        b.style.visibility = 'visible';
        b.style.height = 'auto';
        b.style.overflow = 'visible';
      });
      root.querySelectorAll('input[type="range"]').forEach(function(inp){ inp.style.display = 'none'; });
      root.querySelectorAll('.toggle, .auto-btn, .econ-actions, .pallet-cell-btn, .pallet-mount-btn, .pot-btn, .month-btn, .facility-btn, .cut-count-btn, button.vf-sheet-badge, .canopy-schema-bar .auto-btn').forEach(function(el){
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
      root.querySelectorAll('#econ-panel-cultures > p[style]').forEach(function(el){
        el.style.display = 'none';
      });
      root.querySelectorAll('.econ-elec-charts-wrap').forEach(function(el){
        el.style.display = 'none';
      });
      if (root.querySelector('#econ-cultures-breakdown, #econ-results-metrics, .econ-culture-card, #econ-panel-cultures')){
        maskEconDomForPdf(root);
      }
    }

    function isEconSectionId(id){
      return id && id.indexOf('econ-') === 0;
    }

    function cloneSection(el){
      if (!el) return null;
      if (el.classList.contains('env-block-hidden')) return null;
      var clone = el.cloneNode(true);
      clone.classList.add('pdf-page-block');
      clone.classList.remove('app-view-hidden');
      clone.style.cssText = 'display:block;visibility:visible;opacity:1;background:#fff;color:#111;width:100%;max-width:' + PDF_W_PX + 'px;box-sizing:border-box;';
      copyCanvasesFromSource(el, clone);
      prepareClone(clone);
      return clone;
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
      return cloneSection(el);
    }

    function applyStagingLayout(staging){
      staging.removeAttribute('aria-hidden');
      staging.style.cssText = [
        'position:fixed', 'left:0', 'top:0', 'width:' + PDF_W_PX + 'px', 'max-width:calc(100vw - 16px)',
        'background:#fff', 'color:#111', 'z-index:2147483000', 'pointer-events:none',
        'opacity:1', 'visibility:visible', 'display:block', 'box-sizing:border-box', 'padding:8px 12px',
        'overflow:visible', 'height:auto', 'min-height:1px'
      ].join(';');
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

    async function captureBlock(html2canvas, block){
      var size = measureBlock(block);
      return html2canvas(block, {
        scale: PDF_SCALE,
        backgroundColor: '#ffffff',
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

    function appendCanvasSlicesToPdf(pdf, canvas, margin, contentW, firstPage){
      var ctx = global.DG_createPdfCtx ? DG_createPdfCtx(pdf, margin) : { pdf: pdf, margin: margin, y: margin, pageH: pdf.internal.pageSize.getHeight(), contentW: contentW, firstContent: firstPage };
      if (global.DG_appendCanvasToPdfCtx){
        DG_appendCanvasToPdfCtx(pdf, ctx, canvas, margin, contentW);
        return ctx.y > margin ? 1 : 0;
      }
      var pageH = pdf.internal.pageSize.getHeight();
      var usableH = pageH - margin * 2;
      var pxPerMm = canvas.width / contentW;
      var slicePx = Math.floor(usableH * pxPerMm);
      if (slicePx < 1) slicePx = canvas.height;
      var y = 0;
      var pages = 0;
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
        pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, contentW, sliceHmm);
        y += h;
        pages++;
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

    function addPdfFooters(pdf, metaTitle){
      var pageCount = pdf.internal.getNumberOfPages();
      var pageW = pdf.internal.pageSize.getWidth();
      var pageH = pdf.internal.pageSize.getHeight();
      var footer = pdfTextArg(metaTitle) + ' · Daogreen';
      if (pdf.__dgDejaVu) pdf.setFont('DejaVu', 'normal');
      for (var p = 1; p <= pageCount; p++){
        pdf.setPage(p);
        pdf.setFontSize(8);
        pdf.setTextColor(130);
        pdf.text(footer, PDF_MARGIN_MM, pageH - 5);
        pdf.text(pdfTextArg(global.DG_tFmt ? global.DG_tFmt('pdf.page', { p: p, total: pageCount }) : ('p. ' + p + ' / ' + pageCount)), pageW - PDF_MARGIN_MM, pageH - 5, { align: 'right' });
      }
    }

    async function buildPdfFromSections(orderedIds, secMap, filename, metaTitle){
      var apis = pdfApis();
      var pdf = new apis.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      var margin = PDF_MARGIN_MM;
      var contentW = pdf.internal.pageSize.getWidth() - margin * 2;
      var useVector = !!(global.DG_isVectorEconPdfSection && global.DG_ensurePdfCyrillicFont &&
        orderedIds.some(function(id){
          var sec = secMap[id];
          return DG_isVectorEconPdfSection(vectorSectionKey(sec));
        }));
      var pdfCtx = useVector ? DG_createPdfCtx(pdf, margin) : null;
      var hasContent = false;

      if (useVector) await DG_ensurePdfCyrillicFont(pdf);

      for (var i = 0; i < orderedIds.length; i++){
        var id = orderedIds[i];
        var sec = secMap[id];
        if (!sec) continue;

        if (useVector && DG_isVectorEconPdfSection(vectorSectionKey(sec))){
          await DG_renderVectorEconPdfSection(pdf, pdfCtx, vectorSectionKey(sec), secLabel(sec.id));
          if (id === 'econ-payback') await appendPaybackChartRaster(pdf, pdfCtx, apis);
          hasContent = true;
          continue;
        }

        var block = blockForSection(sec);
        if (!block) continue;
        var wrapped = wrapWithSectionTitle(block, secLabel(sec.id));
        var stagingOne = document.createElement('div');
        stagingOne.className = 'pdf-staging' + (isEconSectionId(id) ? ' pdf-staging--econ' : '');
        applyStagingLayout(stagingOne);
        stagingOne.appendChild(wrapped);
        document.body.appendChild(stagingOne);
        await waitForPaint(80);
        try {
          var canvas = await captureBlock(apis.html2canvas, wrapped);
          if (canvas && canvas.width >= 2 && canvas.height >= 2){
            if (useVector){
              DG_appendCanvasToPdfCtx(pdf, pdfCtx, canvas, margin, contentW);
            } else {
              appendCanvasSlicesToPdf(pdf, canvas, margin, contentW, !hasContent);
            }
            hasContent = true;
          }
        } finally {
          stagingOne.remove();
        }
      }

      if (!hasContent){
        throw new Error(pdfT('pdf.err.empty'));
      }
      if (global.DG_ensurePdfCyrillicFont && !pdf.__dgDejaVu) await DG_ensurePdfCyrillicFont(pdf);
      addPdfFooters(pdf, metaTitle);
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
        var docTitle = meta.projectTitle || meta.title || pdfT('pdf.cover');
        await buildPdfFromSections(orderedIds, secMap, fname, docTitle);
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

    function exportClientPdf(){
      if (deps.setPdfExportContext) deps.setPdfExportContext({ sectionIds: PDF_PRESETS.client.slice(), clientMode: true });
      return runExport(PDF_PRESETS.client).catch(function(err){
        console.error(err);
        alert((global.DG_tFmt ? global.DG_tFmt('pdf.err.export', { msg: (err && err.message ? err.message : String(err)) }) : 'PDF: ' + err));
      });
    }

    if (btnClient && !btnClient.dataset.pdfClientBound){
      btnClient.dataset.pdfClientBound = '1';
      btnClient.addEventListener('click', function(){
        exportClientPdf();
      });
    }
  }

  global.DG_initPdfExport = initPdfExport;
})(typeof window !== 'undefined' ? window : this);
