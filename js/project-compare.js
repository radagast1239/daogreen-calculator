/** Сравнение двух проектов JSON */
(function(global){
  'use strict';

  function ui(k, vars){
    return global.DG_uiT ? global.DG_uiT(k, vars) : k;
  }

  function parseProjectFile(file){
    return new Promise(function(resolve, reject){
      var reader = new FileReader();
      reader.onload = function(){
        try {
          var data = JSON.parse(reader.result);
          if (!data || !data.state) throw new Error(ui('ui.projCompare.noState'));
          resolve({
            label: file.name.replace(/\.json$/i, ''),
            build: data.build || '—',
            exportedAt: data.exportedAt || '—',
            state: data.state
          });
        } catch (e){ reject(e); }
      };
      reader.onerror = function(){ reject(new Error(ui('ui.projCompare.readFail'))); };
      reader.readAsText(file, 'utf-8');
    });
  }

  function pickFile(){
    return new Promise(function(resolve){
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.json,application/json';
      inp.onchange = function(){
        var f = inp.files && inp.files[0];
        resolve(f || null);
      };
      inp.click();
    });
  }

  function fmtCell(v, row, deps){
    if (v == null || v === '') return '—';
    if (row && row.num){
      if (row.money && deps.fmtMoney) return deps.fmtMoney(v);
      if (deps.fmtNum) return deps.fmtNum(v);
      if (deps.r1) return deps.r1(v);
    }
    return String(v);
  }

  function diffNum(a, b){
    if (typeof a !== 'number' || typeof b !== 'number') return null;
    return b - a;
  }

  function renderTable(body, sumA, sumB, deps){
    var keysA = {};
    sumA.rows.forEach(function(r){ keysA[r.k] = r; });
    var keysB = {};
    sumB.rows.forEach(function(r){ keysB[r.k] = r; });
    var keys = [];
    sumA.rows.forEach(function(r){ if (keys.indexOf(r.k) < 0) keys.push(r.k); });
    sumB.rows.forEach(function(r){ if (keys.indexOf(r.k) < 0) keys.push(r.k); });

    var html = '<table class="econ-breakdown project-compare-table"><thead><tr>' +
      '<th>' + ui('ui.projCompare.metric') + '</th><th>' + deps.esc(sumA.label) + '</th><th>' + deps.esc(sumB.label) + '</th><th>' + ui('ui.projCompare.delta') + '</th></tr></thead><tbody>';

    keys.forEach(function(k){
      var ra = keysA[k];
      var rb = keysB[k];
      var va = ra ? ra.a : '—';
      var vb = rb ? rb.a : '—';
      var d = (ra && rb && ra.num && rb.num) ? diffNum(ra.a, rb.a) : null;
      var dCls = d == null ? '' : (d >= 0 ? 'econ-sens-up' : 'econ-sens-down');
      var dTxt = d == null ? '—' : ((d > 0 ? '+' : '') + (ra && ra.money && deps.fmtMoney ? deps.fmtMoney(d) : deps.fmtNum(d)));
      var sym = deps.currencySym ? deps.currencySym() : '₽';
      html += '<tr' + ((ra && ra.highlight) || (rb && rb.highlight) ? ' class="econ-sens-base"' : '') + '>' +
        '<td>' + k + '</td>' +
        '<td>' + fmtCell(va, ra, deps) + (ra && ra.b && ra.b !== sym && ra.b !== '%' && ra.b.indexOf(sym) < 0 ? ' ' + ra.b : (ra && ra.money ? ' ' + ra.b : '')) + '</td>' +
        '<td>' + fmtCell(vb, rb, deps) + (rb && rb.b && rb.b !== sym && rb.b !== '%' && rb.b.indexOf(sym) < 0 ? ' ' + rb.b : (rb && rb.money ? ' ' + rb.b : '')) + '</td>' +
        '<td class="' + dCls + '">' + dTxt + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<p class="compare-meta">' + ui('ui.projCompare.buildMeta', {
      buildA: deps.esc(sumA.build),
      dateA: deps.esc(sumA.exportedAt),
      buildB: deps.esc(sumB.build),
      dateB: deps.esc(sumB.exportedAt)
    }) + '</p>';
    body.innerHTML = html;
  }

  function initProjectCompare(deps){
    var dialog = document.getElementById('project-compare-dialog');
    var body = document.getElementById('project-compare-body');
    var btn = document.getElementById('btn-project-compare');
    if (!dialog || !body || !btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', function(){
      dialog.showModal();
      body.innerHTML = '<p class="compare-lead">' + ui('ui.projCompare.lead') + '</p>' +
        '<div class="compare-actions">' +
        '<button type="button" class="auto-btn" id="compare-run">' + ui('ui.projCompare.run') + '</button>' +
        '<button type="button" class="auto-btn" data-compare-cancel>' + ui('ui.projCompare.close') + '</button></div>';
    });

    dialog.addEventListener('click', function(ev){
      if (ev.target.id === 'compare-run'){
        runCompare(deps, body, dialog);
      }
      if (ev.target.dataset.compareCancel != null){
        dialog.close();
      }
    });
  }

  async function runCompare(deps, body, dialog){
    body.innerHTML = '<p class="compare-lead">' + ui('ui.projCompare.loading') + '</p>';
    try {
      var useCurrent = confirm(ui('ui.projCompare.confirmA'));
      var projA;
      if (useCurrent){
        projA = {
          label: ui('ui.projCompare.current'),
          build: deps.getBuild ? deps.getBuild() : '—',
          exportedAt: ui('ui.projCompare.now'),
          state: JSON.parse(JSON.stringify(deps.getState()))
        };
      } else {
        body.innerHTML = '<p class="compare-lead">' + ui('ui.projCompare.pickA') + '</p>';
        var fA = await pickFile();
        if (!fA) { body.innerHTML = '<p>' + ui('ui.projCompare.cancelled') + '</p>'; return; }
        projA = await parseProjectFile(fA);
      }
      body.innerHTML = '<p class="compare-lead">' + ui('ui.projCompare.pickB') + '</p>';
      var fB = await pickFile();
      if (!fB) { body.innerHTML = '<p>' + ui('ui.projCompare.cancelled') + '</p>'; return; }
      var projB = await parseProjectFile(fB);

      var sumA = global.DG_summarizeProject(projA.state, deps);
      sumA.label = projA.label;
      sumA.build = projA.build;
      sumA.exportedAt = projA.exportedAt;
      var sumB = global.DG_summarizeProject(projB.state, deps);
      sumB.label = projB.label;
      sumB.build = projB.build;
      sumB.exportedAt = projB.exportedAt;

      renderTable(body, sumA, sumB, {
        esc: deps.esc,
        fmtNum: deps.fmtNum,
        fmtMoney: deps.fmtMoney,
        currencySym: deps.currencySym,
        r1: deps.r1
      });
    } catch (e){
      body.innerHTML = '<p style="color:var(--brick-text)">' + ui('ui.projCompare.error', { msg: e.message || e }) + '</p>';
    }
  }

  global.DG_initProjectCompare = initProjectCompare;
})(typeof window !== 'undefined' ? window : this);
