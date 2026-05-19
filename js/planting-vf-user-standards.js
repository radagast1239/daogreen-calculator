/**
 * VF: пользовательские стандарты сорта (localStorage), панель vf-standards-grid.
 * DG_createPlantingVfUserStandards(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  global.DG_VF_STANDARDS_STORAGE = 'calc-vf-user-standards';

  function createPlantingVfUserStandards(deps) {
    function st() {
      return deps.getState();
    }

    function storageKey() {
      return deps.storageKey || global.DG_VF_STANDARDS_STORAGE;
    }

    function loadVfStandardsStore() {
      var state = st();
      try {
        var raw = localStorage.getItem(storageKey());
        if (raw) state.vfUserStandards = JSON.parse(raw) || {};
      } catch (_) {
        state.vfUserStandards = {};
      }
    }

    function saveVfStandardsStore() {
      var state = st();
      try {
        localStorage.setItem(storageKey(), JSON.stringify(state.vfUserStandards));
      } catch (_) {}
    }

    function buildDefaultVfStandards(cv) {
      cv = cv || deps.getVfCv();
      if (!cv) return {};
      var y = Math.round(cv.yieldPerCutG) || 10;
      var canopy = Math.round(deps.modelCanopyFromMass(cv, y));
      var state = st();
      return {
        germination: cv.germination,
        nursery: cv.nursery || state.nursery,
        day: cv.channelDays,
        density: cv.density,
        cutInterval: deps.cutIntervalRange(cv).mid,
        canopyPct: 100,
        manualCanopy: canopy,
        useManualCanopy: true,
        manualMass: y,
        manualCutMass: y,
        userSaved: false
      };
    }

    function getVfCvStandards(cv) {
      var state = st();
      cv = cv || deps.getVfCv();
      if (!cv) return buildDefaultVfStandards(cv);
      if (!state.vfUserStandards[cv.id]) {
        state.vfUserStandards[cv.id] = buildDefaultVfStandards(cv);
      }
      return state.vfUserStandards[cv.id];
    }

    function readVfStandardsFromState() {
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
        manualCutMass: state.manualCutMass,
        userSaved: true
      };
    }

    function applyVfProfileToStateOnly(s, cv) {
      var state = st();
      cv = cv || deps.getVfCv();
      state.germination = deps.clamp(s.germination, 1, 21);
      state.nursery = deps.clamp(s.nursery, 7, 28);
      state.day = deps.clamp(s.day, 1, 70);
      state.density = deps.clamp(s.density, 15, deps.DENSITY_MAX);
      state.cutInterval = deps.clamp(s.cutInterval, 5, 45);
      state.canopyPct = deps.clamp(s.canopyPct, 100, 130);
      state.manualMass = deps.clamp(s.manualMass, 5, 500);
      state.manualCutMass = deps.clamp(s.manualCutMass || s.manualMass, 1, 500);
      state.useManualMass = true;
      state.useManualCanopy = s.useManualCanopy != null ? !!s.useManualCanopy : true;
      state.manualCanopy = deps.clamp(
        s.manualCanopy || deps.modelCanopyFromMass(cv, state.manualMass),
        20,
        600
      );
      state.vfStd.germination = false;
      state.vfStd.day = false;
      state.vfStd.density = false;
      state.vfStd.mass = false;
      state.vfStd.cutInterval = false;
      state.vfStd.cutMass = false;
    }

    function applyVfUserStandardsToState(s) {
      var $ = deps.$;
      applyVfProfileToStateOnly(s);
      var state = st();
      $('germination').value = state.germination;
      $('germination-v').textContent = state.germination;
      $('nursery').value = state.nursery;
      $('nursery-v').textContent = state.nursery;
      $('day').value = state.day;
      $('day-v').textContent = state.day;
      $('density').value = state.density;
      $('density-v').textContent = state.density;
      $('cutInterval').value = state.cutInterval;
      $('cutInterval-v').textContent = state.cutInterval;
      deps.syncManualMassUI();
      deps.syncCutMassUI();
      deps.syncCanopyUI();
      deps.syncVegPeriodTotal();
      deps.syncVfStdBadges();
      deps.renderVfStdGrid();
    }

    function applyVfStandardFromStore(cv) {
      applyVfUserStandardsToState(getVfCvStandards(cv));
    }

    function renderVfStandardsPanel() {
      if (deps.isPalletView()) return;
      if (!deps.isVF() || !deps.VF_CULTIVARS.length) return;
      var cv = deps.getVfCv();
      var s = getVfCvStandards(cv);
      var grid = deps.$('vf-standards-grid');
      if (!grid) return;
      var fields = [
        { key: 'germination', label: deps.pt('std.gh.germination'), min: 1, max: 21 },
        { key: 'nursery', label: deps.pt('std.gh.nursery'), min: 7, max: 28 },
        { key: 'day', label: deps.pt('std.gh.day'), min: 1, max: 70 },
        { key: 'density', label: deps.pt('std.gh.density'), min: 15, max: 220 },
        { key: 'cutInterval', label: deps.pt('std.gh.cutInterval'), min: 5, max: 45 },
        {
          key: 'manualCanopy',
          label: deps.pt('std.gh.canopy') + ', ' + deps.pm('unit.mm'),
          min: 20,
          max: 600,
          step: 1
        },
        { key: 'manualMass', label: deps.ui('ui.vf.std.harvest'), min: 5, max: 500 },
        { key: 'manualCutMass', label: deps.ui('ui.vf.std.cutMassField'), min: 1, max: 500 }
      ];
      grid.innerHTML = fields
        .map(function (f) {
          return (
            '<div class="gh-std-field"><label>' +
            f.label +
            '</label>' +
            '<input type="number" data-vf-std-field="' +
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
      if (grid.dataset.vfStdBound) return;
      grid.dataset.vfStdBound = '1';
      grid.addEventListener('change', function (e) {
        var inp = e.target;
        if (!inp.dataset.vfStdField) return;
        var cv2 = deps.getVfCv();
        var st2 = getVfCvStandards(cv2);
        st2[inp.dataset.vfStdField] = parseFloat(inp.value);
        if (inp.dataset.vfStdField === 'manualCanopy') st2.useManualCanopy = true;
        saveVfStandardsStore();
      });
    }

    return {
      loadVfStandardsStore: loadVfStandardsStore,
      saveVfStandardsStore: saveVfStandardsStore,
      buildDefaultVfStandards: buildDefaultVfStandards,
      getVfCvStandards: getVfCvStandards,
      readVfStandardsFromState: readVfStandardsFromState,
      applyVfProfileToStateOnly: applyVfProfileToStateOnly,
      applyVfUserStandardsToState: applyVfUserStandardsToState,
      applyVfStandardFromStore: applyVfStandardFromStore,
      renderVfStandardsPanel: renderVfStandardsPanel
    };
  }

  global.DG_createPlantingVfUserStandards = createPlantingVfUserStandards;
})(typeof window !== 'undefined' ? window : globalThis);
