/**
 * Теплица: пользовательские стандарты сорта, срезки GH, панели режима.
 * DG_createPlantingGhStandards(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  global.DG_GH_STANDARDS_STORAGE = 'calc-gh-user-standards';

  function createPlantingGhStandards(deps) {
    function st() {
      return deps.getState();
    }

    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }

    function storageKey() {
      return deps.storageKey || global.DG_GH_STANDARDS_STORAGE;
    }

    function loadGhStandardsStore() {
      var state = st();
      try {
        var raw = localStorage.getItem(storageKey());
        if (raw) state.ghStandards = JSON.parse(raw) || {};
      } catch (_) {
        state.ghStandards = {};
      }
    }

    function saveGhStandardsStore() {
      var state = st();
      try {
        localStorage.setItem(storageKey(), JSON.stringify(state.ghStandards));
      } catch (_) {}
    }

    function defaultGhCutMasses(cv) {
      if (cv && cv.id === 'rucola-baby') return [16, 15, 14, 13, 12, 11];
      if (cv && cv.id === 'lettuce-baby') {
        return [28, 28, 27, 26, 25, 24, 23, 22, 22, 21, 21, 20];
      }
      var base = Math.round((cv.M_max / 2) * deps.envMultiplier(cv));
      var out = [];
      for (var i = 0; i < 5; i++) {
        out.push(Math.max(5, Math.round(base * (1 - i * 0.08))));
      }
      return out;
    }

    function buildDefaultGhStandards(cv) {
      var state = st();
      cv = cv || deps.getCv();
      var day = Math.max(1, Math.round(deps.harvestChannel(cv)));
      var masses = defaultGhCutMasses(cv);
      var m0 = masses[0];
      return {
        germination: state.germination,
        nursery: state.nursery,
        day: day,
        density: state.density,
        cutInterval: deps.cutIntervalRange(cv).mid,
        canopyPct: 100,
        manualCanopy: Math.round(deps.modelCanopyFromMass(cv, m0)),
        useManualCanopy: true,
        manualMass: m0,
        ghCutCount:
          cv.id === 'rucola-baby' ? 6 : cv.id === 'lettuce-baby' ? 9 : cv.multicut ? 3 : 1,
        ghCutMasses: masses.slice(),
        userSaved: false
      };
    }

    function getGhCvStandards(cv) {
      var state = st();
      cv = cv || deps.getCv();
      if (!state.ghStandards[cv.id]) {
        state.ghStandards[cv.id] = buildDefaultGhStandards(cv);
      }
      var s = state.ghStandards[cv.id];
      if (!s.ghCutMasses || s.ghCutMasses.length < 5) {
        s.ghCutMasses = defaultGhCutMasses(cv);
      }
      return s;
    }

    function readGhStandardsFromState(cv) {
      var state = st();
      return {
        germination: state.germination,
        nursery: state.nursery,
        day: state.day,
        density: state.density,
        cutInterval: state.cutInterval,
        canopyPct: state.canopyPct,
        manualCanopy: state.manualCanopy,
        useManualCanopy: state.useManualCanopy,
        manualMass: state.manualMass,
        ghCutCount: state.ghCutCount,
        ghCutMasses: state.ghCutMasses.slice(),
        userSaved: true
      };
    }

    function applyGhProfileToStateOnly(s, cv) {
      var state = st();
      cv = cv || deps.getCv();
      state.germination = deps.clamp(s.germination, 1, 21);
      state.nursery = deps.clamp(s.nursery, 7, 28);
      state.day = deps.clamp(s.day, 1, 70);
      state.density = deps.clamp(s.density, 15, deps.DENSITY_MAX);
      state.cutInterval = deps.clamp(s.cutInterval, 5, 45);
      state.canopyPct = deps.clamp(s.canopyPct, 100, 130);
      state.manualMass = deps.clamp(s.manualMass, 5, 500);
      state.ghCutCount = deps.clamp(s.ghCutCount, 1, 5);
      state.ghCutMasses = (s.ghCutMasses || []).slice(0, 5);
      while (state.ghCutMasses.length < 5) {
        state.ghCutMasses.push(s.manualMass);
      }
      state.useManualMass = true;
      state.useManualCanopy = s.useManualCanopy != null ? !!s.useManualCanopy : true;
      state.manualCanopy = deps.clamp(
        s.manualCanopy || deps.modelCanopyFromMass(cv, state.manualMass),
        20,
        600
      );
    }

    function applyGhStandardsToState(s) {
      var $ = deps.$;
      applyGhProfileToStateOnly(s);
      $('germination').value = st().germination;
      $('germination-v').textContent = st().germination;
      $('nursery').value = st().nursery;
      $('nursery-v').textContent = st().nursery;
      $('day').value = st().day;
      $('day-v').textContent = st().day;
      $('density').value = st().density;
      $('density-v').textContent = st().density;
      $('cutInterval').value = st().cutInterval;
      $('cutInterval-v').textContent = st().cutInterval;
      deps.syncCanopyUI();
      syncGhCutsUI();
      deps.syncVegPeriodTotal();
    }

    function applyGhStandardFromStore(cv) {
      applyGhStandardsToState(getGhCvStandards(cv));
    }

    function getGhCutMass(i) {
      var state = st();
      return deps.clamp(
        state.ghCutMasses[i] != null ? state.ghCutMasses[i] : state.ghCutMasses[0],
        1,
        500
      );
    }

    function ghCutCountMax(cv) {
      cv = cv || deps.getCv();
      var gm = georgyModeRef();
      if (gm && gm.isGeorgyProfiled(cv)) {
        var p = gm.getGeorgyProfile(cv);
        return p ? p.maxCutsBelowHot : 12;
      }
      return 5;
    }

    function rebuildGhCutCountRow(cv) {
      var row = deps.$('gh-cut-count-row');
      if (!row) return;
      var max = ghCutCountMax(cv);
      var label = row.querySelector('span');
      var labelHtml = label
        ? label.outerHTML
        : '<span style="font-size:12px;color:var(--ink-faint);margin-right:6px">Срезок:</span>';
      var btns = '';
      for (var n = 1; n <= max; n++) {
        btns +=
          '<button type="button" class="cut-count-btn" data-gh-cuts="' + n + '">' + n + '</button>';
      }
      row.innerHTML = labelHtml + btns;
    }

    function syncMulticutBabyUi(cv) {
      cv = cv || deps.getCv();
      var state = st();
      var gm = georgyModeRef();
      var isBaby = gm && gm.isGeorgyProfiled(cv);
      var hideBaby =
        !isBaby ||
        !state.multicut ||
        deps.isVF() ||
        deps.isPalletView() ||
        (gm && gm.isGeorgyGh());
      document.querySelectorAll('.multicut-baby-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', hideBaby);
      });
      if (isBaby && !hideBaby && gm.syncBabyGhCutsAuto) {
        gm.syncBabyGhCutsAuto(cv);
      }
      if (isBaby && !hideBaby) rebuildGhCutCountRow(cv);
    }

    function syncGhCutsUI() {
      var state = st();
      var cv = deps.getCv();
      syncMulticutBabyUi(cv);
      var block = deps.$('gh-cuts-block');
      if (block) {
        block.classList.toggle('env-block-hidden', deps.isVF() || deps.isPalletView() || !state.multicut);
      }
      var max = ghCutCountMax(cv);
      state.ghCutCount = deps.clamp(state.ghCutCount, 1, max);
      document.querySelectorAll('#gh-cut-count-row .cut-count-btn').forEach(function (btn) {
        btn.classList.toggle('on', parseInt(btn.dataset.ghCuts, 10) === state.ghCutCount);
      });
      var grid = deps.$('gh-cut-masses-grid');
      if (!grid) return;
      var html = '';
      for (var i = 0; i < state.ghCutCount; i++) {
        html +=
          '<div class="gh-cut-mass-item"><label>' +
          deps.ui('ui.gh.cutMassLabel', { n: i + 1 }) +
          '</label>' +
          '<input type="number" min="1" max="500" step="1" data-gh-cut-mass="' +
          i +
          '" value="' +
          getGhCutMass(i) +
          '"></div>';
      }
      grid.innerHTML = html;
      grid.querySelectorAll('input[data-gh-cut-mass]').forEach(function (inp) {
        inp.addEventListener('input', function () {
          var idx = parseInt(inp.dataset.ghCutMass, 10);
          st().ghCutMasses[idx] = deps.clamp(parseFloat(inp.value) || 0, 1, 500);
          deps.renderAll();
        });
      });
    }

    function syncGhFacilityPanels() {
      document.querySelectorAll('.gh-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', deps.isVF() || deps.isPalletView());
      });
      document.querySelectorAll('.vf-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', !deps.isVF() && !deps.isPalletView());
      });
      document.querySelectorAll('.plant-yield-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', deps.isVF());
      });
      deps.syncBioMarginVisibility();
    }

    function renderGhStandardsPanel() {
      if (deps.isVF() || deps.isPalletView()) return;
      var cv = deps.getCv();
      var nameEl = deps.$('gh-std-cv-name');
      if (nameEl) nameEl.textContent = cv.name;
      var s = getGhCvStandards(cv);
      var grid = deps.$('gh-standards-grid');
      if (!grid) return;
      var fields = [
        { key: 'germination', label: deps.pt('std.gh.germination'), unit: deps.pm('unit.days'), min: 1, max: 21 },
        { key: 'nursery', label: deps.pt('std.gh.nursery'), unit: deps.pm('unit.days'), min: 7, max: 28 },
        { key: 'day', label: deps.pt('std.gh.day'), unit: deps.pm('unit.days'), min: 1, max: 70 },
        { key: 'density', label: deps.pt('std.gh.density'), unit: deps.pm('u.pcsSqm'), min: 15, max: 220 },
        { key: 'cutInterval', label: deps.pt('std.gh.cutInterval'), unit: deps.pm('unit.days'), min: 5, max: 45 },
        {
          key: 'manualCanopy',
          label: deps.pt('std.gh.canopy'),
          unit: deps.pm('unit.mm'),
          min: 20,
          max: 600,
          step: 1
        },
        { key: 'manualMass', label: deps.pt('std.gh.cutMass'), unit: deps.pm('u.perPot'), min: 5, max: 500 }
      ];
      var html = fields
        .map(function (f) {
          return (
            '<div class="gh-std-field"><label>' +
            f.label +
            '</label>' +
            '<input type="number" data-gh-std="' +
            f.key +
            '" min="' +
            f.min +
            '" max="' +
            f.max +
            '" step="' +
            (f.step || 1) +
            '" value="' +
            s[f.key] +
            '"></div>'
          );
        })
        .join('');
      html +=
        '<div class="gh-std-field"><label>' +
        deps.pt('std.gh.cutCount') +
        '</label><input type="number" data-gh-std="ghCutCount" min="1" max="5" step="1" value="' +
        s.ghCutCount +
        '"></div>';
      for (var i = 0; i < 5; i++) {
        html +=
          '<div class="gh-std-field gh-std-cut-mass" data-cut-idx="' +
          i +
          '"><label>' +
          deps.ptf('std.gh.cutMassN', { n: i + 1 }) +
          '</label>' +
          '<input type="number" data-gh-std-cut="' +
          i +
          '" min="1" max="500" value="' +
          (s.ghCutMasses[i] || 0) +
          '"></div>';
      }
      grid.innerHTML = html;
      grid.querySelectorAll('.gh-std-cut-mass').forEach(function (el) {
        el.classList.toggle('env-block-hidden', parseInt(el.dataset.cutIdx, 10) >= s.ghCutCount);
      });
      if (grid.dataset.ghStdBound) return;
      grid.dataset.ghStdBound = '1';
      grid.addEventListener('change', function (e) {
        var inp = e.target;
        var cv2 = deps.getCv();
        var st2 = getGhCvStandards(cv2);
        if (inp.dataset.ghStd) {
          st2[inp.dataset.ghStd] = parseFloat(inp.value);
          if (inp.dataset.ghStd === 'manualCanopy') st2.useManualCanopy = true;
          if (inp.dataset.ghStd === 'ghCutCount') {
            st2.ghCutCount = deps.clamp(st2.ghCutCount, 1, 5);
            grid.querySelectorAll('.gh-std-cut-mass').forEach(function (el) {
              el.classList.toggle('env-block-hidden', parseInt(el.dataset.cutIdx, 10) >= st2.ghCutCount);
            });
          }
        } else if (inp.dataset.ghStdCut != null) {
          st2.ghCutMasses[parseInt(inp.dataset.ghStdCut, 10)] = parseFloat(inp.value);
        }
        saveGhStandardsStore();
      });
    }

    return {
      loadGhStandardsStore: loadGhStandardsStore,
      saveGhStandardsStore: saveGhStandardsStore,
      defaultGhCutMasses: defaultGhCutMasses,
      buildDefaultGhStandards: buildDefaultGhStandards,
      getGhCvStandards: getGhCvStandards,
      readGhStandardsFromState: readGhStandardsFromState,
      applyGhStandardsToState: applyGhStandardsToState,
      applyGhStandardFromStore: applyGhStandardFromStore,
      applyGhProfileToStateOnly: applyGhProfileToStateOnly,
      getGhCutMass: getGhCutMass,
      ghCutCountMax: ghCutCountMax,
      rebuildGhCutCountRow: rebuildGhCutCountRow,
      syncMulticutBabyUi: syncMulticutBabyUi,
      syncGhCutsUI: syncGhCutsUI,
      syncGhFacilityPanels: syncGhFacilityPanels,
      renderGhStandardsPanel: renderGhStandardsPanel
    };
  }

  global.DG_createPlantingGhStandards = createPlantingGhStandards;
})(typeof window !== 'undefined' ? window : globalThis);
