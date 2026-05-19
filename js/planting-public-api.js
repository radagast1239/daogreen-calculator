/**
 * Preview-режим и window.DaoGreenCalc.
 * DG_installPlantingPublicApi(deps)
 */
(function (global) {
  'use strict';

  function installPlantingPublicApi(deps) {
    function syncPreviewSlidersToState() {
      var st = deps.getState();
      var pairs = [
        ['temp', 'temp-v', st.temp, deps.r1],
        ['day', 'day-v', st.day, String],
        ['density', 'density-v', st.density, String],
        ['nch', 'nch-v', st.nch, String],
        ['offset', 'offset-v', st.offset, String],
        ['germination', 'germination-v', st.germination, String],
        ['nursery', 'nursery-v', st.nursery, String]
      ];
      pairs.forEach(function (row) {
        var id = row[0];
        var vid = row[1];
        var val = row[2];
        var fmt = row[3];
        var el = deps.$(id);
        var vel = deps.$(vid);
        if (el) el.value = val;
        if (vel) vel.textContent = typeof fmt === 'function' ? fmt(val) : val;
      });
      document.querySelectorAll('.month-btn').forEach(function (btn) {
        var on = parseInt(btn.dataset.month, 10) === st.month;
        btn.classList.toggle('on', on);
      });
      var lightChk = deps.$('lighting');
      if (lightChk) lightChk.checked = !!st.lighting;
      var mc = deps.$('multicut');
      if (mc) mc.checked = !!st.multicut;
      var ghArea = deps.$('gh-useful-area');
      if (ghArea && st.ghUsefulArea != null) ghArea.value = String(st.ghUsefulArea);
    }

    global.DG_applyPreviewDefaults = function () {
      if (!global.DG_isPreviewMode || !global.DG_isPreviewMode()) return;
      var cfg = global.DG_PREVIEW_CONFIG || {};
      var st = deps.getState();
      st.georgyMode = false;
      st.georgyRestore = null;
      st.georgyDensityFitted = false;
      document.documentElement.classList.remove('georgy-active');
      var gBtn = deps.$('btn-georgy-mode');
      if (gBtn) gBtn.classList.remove('on');
      var scalarKeys = [
        'cv', 'temp', 'lighting', 'day', 'nch', 'density', 'offset', 'pot',
        'multicut', 'germination', 'nursery', 'ghUsefulArea', 'palletCv', 'vfCv'
      ];
      scalarKeys.forEach(function (k) {
        if (cfg[k] != null) st[k] = cfg[k];
      });
      if (cfg.month != null) st.month = cfg.month;
      if (cfg.facility) deps.setFacility(cfg.facility);
      deps.setAppView(cfg.appView || st.appView || 'channels');
      syncPreviewSlidersToState();
      deps.renderCultivars();
      if (st.appView === 'economics') deps.renderEconomics();
      else deps.renderAll();
    };

    global.addEventListener('daogreen-preview-enter', function () {
      if (global.DG_applyPreviewDefaults) global.DG_applyPreviewDefaults();
    });

    global.DaoGreenCalc = {
      BUILD: deps.CALC_BUILD,
      setAppView: deps.setAppView,
      renderAll: deps.renderAll,
      calc: deps.calc,
      getState: deps.getState,
      applyPreviewDefaults: global.DG_applyPreviewDefaults,
      applyProject: deps.applyProjectState,
      exportEconCsv: function () {
        var st = deps.getState();
        if (!st.econ) return;
        deps.migrateEconOtherElectricity(st.econ);
        global.DG_exportEconCsv(deps.calcFarmEconomics(st.econ), { build: deps.CALC_BUILD });
      },
      diagnose: function () {
        var st = deps.getState();
        return {
          build: deps.CALC_BUILD,
          file: 'calculator-110x55_12.html',
          appView: st.appView,
          facility: st.facility,
          palletCultivars: deps.allPalletCultivars().length,
          vfCultivars: deps.allVfCultivars().length,
          nch: st.nch,
          palletsAlong: st.palletsAlong,
          palletCells: st.palletCells,
          day: st.day,
          germination: st.germination
        };
      }
    };

    return { syncPreviewSlidersToState: syncPreviewSlidersToState };
  }

  global.DG_installPlantingPublicApi = installPlantingPublicApi;
})(typeof window !== 'undefined' ? window : globalThis);
