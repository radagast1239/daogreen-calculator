/**
 * Навигация приложения, импорт в экономику, badge.
 * DG_createPlantingAppNav(deps)
 */
(function (global) {
  'use strict';

  function createPlantingAppNav(deps) {
    function st() { return deps.getState(); }
    function $(id) { return deps.$(id); }
    var FACILITY_KEY = deps.FACILITY_KEY;
    var APP_VIEW_KEY = deps.APP_VIEW_KEY;
    var CALC_BUILD = deps.CALC_BUILD;
    var plantingSnapshots = deps.plantingSnapshots;
    function calc() { return deps.calc.apply(deps, arguments); }
    function ui() { return deps.ui.apply(deps, arguments); }
    function pt() { return deps.pt.apply(deps, arguments); }
    function showError() { return deps.showError.apply(deps, arguments); }
    function getActivePlantingCvId() { return deps.getActivePlantingCvId.apply(deps, arguments); }
    function importAllEconFromPlanting() { return deps.importAllEconFromPlanting.apply(deps, arguments); }
    function getPlantingSnapshotForCvId() { return deps.getPlantingSnapshotForCvId.apply(deps, arguments); }
    function syncEconFromPlanting() { return deps.syncEconFromPlanting.apply(deps, arguments); }
    function syncEconInputsFromState() { return deps.syncEconInputsFromState.apply(deps, arguments); }
    function renderEconomics() { return deps.renderEconomics.apply(deps, arguments); }
    function renderStandardsCatalog() { return deps.renderStandardsCatalog.apply(deps, arguments); }
    function getDefaultEconState() { return deps.getDefaultEconState.apply(deps, arguments); }
    function ensureEconCultures() { return deps.ensureEconCultures.apply(deps, arguments); }
    function migrateEconCultureRows() { return deps.migrateEconCultureRows.apply(deps, arguments); }
    function ensureEconEquipment() { return deps.ensureEconEquipment.apply(deps, arguments); }
    function saveGhStandardsStore() { return deps.saveGhStandardsStore.apply(deps, arguments); }
    function saveVfStandardsStore() { return deps.saveVfStandardsStore.apply(deps, arguments); }
    function saveCustomCultivarsStore() { return deps.saveCustomCultivarsStore.apply(deps, arguments); }
    function saveEconStore() { return deps.saveEconStore.apply(deps, arguments); }
    function saveGhUsefulArea() { return deps.saveGhUsefulArea.apply(deps, arguments); }
    function capturePlantingViewSnapshot() { return deps.capturePlantingViewSnapshot.apply(deps, arguments); }
    function restorePlantingViewSnapshot() { return deps.restorePlantingViewSnapshot.apply(deps, arguments); }
    function allPalletCultivars() { return deps.allPalletCultivars.apply(deps, arguments); }
    function initPalletValuesFromSheet() { return deps.initPalletValuesFromSheet.apply(deps, arguments); }
    function resetPalletStdToSheetDefaults() { return deps.resetPalletStdToSheetDefaults.apply(deps, arguments); }
    function getPalletCv() { return deps.getPalletCv.apply(deps, arguments); }
    function syncCycleSlidersFromState() { return deps.syncCycleSlidersFromState.apply(deps, arguments); }
    function isVF() { return deps.isVF.apply(deps, arguments); }
    function isPalletView() { return deps.isPalletView.apply(deps, arguments); }
    function updatePlantingGeomUI() { return deps.updatePlantingGeomUI.apply(deps, arguments); }
    function updatePageSub() { return deps.updatePageSub.apply(deps, arguments); }
    function renderCultivars() { return deps.renderCultivars.apply(deps, arguments); }
    function syncVfStdControls() { return deps.syncVfStdControls.apply(deps, arguments); }
    function renderAll() { return deps.renderAll.apply(deps, arguments); }

  function runWithState(tempState, fn){
    var snap = {};
    Object.keys(st()).forEach(function(k){ snap[k] = st()[k]; });
    Object.keys(tempState || {}).forEach(function(k){ st()[k] = tempState[k]; });
    try { return fn(); } finally { Object.keys(snap).forEach(function(k){ st()[k] = snap[k]; }); }
  }

  function htmlEsc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function r3(n){ return Math.round(n * 1000) / 1000; }

  function showToast(msg){
    const el = document.getElementById('calc-build-badge');
    if (!el) return;
    const prev = el.textContent;
    el.textContent = msg;
    el.classList.add('calc-build-badge--toast');
    el.classList.remove('calc-build-badge--warn');
    setTimeout(function(){
      el.classList.remove('calc-build-badge--toast');
      try { updateCalcBuildBadge(calc()); } catch(_){ el.textContent = prev; }
    }, 2200);
  }

  function runPlantingEconImport(opts){
    opts = opts || {};
    try {
      if (typeof importAllEconFromPlanting !== 'function'){
        showToast(ui('ui.toast.importEconFail') || 'Импорт недоступен — откройте через start-server.bat');
        return;
      }
      if (typeof getPlantingSnapshotForCvId !== 'function'){
        showToast(ui('ui.toast.importEconFail') || 'Не загружен planting-snapshot.js');
        return;
      }
      var meta = null;
      if (typeof syncEconFromPlanting === 'function') meta = syncEconFromPlanting();
      else if (typeof importAllEconFromPlanting === 'function') meta = importAllEconFromPlanting();
      if (typeof syncEconInputsFromState === 'function') syncEconInputsFromState();
      if (typeof renderEconomics === 'function') renderEconomics();
      if (opts.goEconomics) setAppView('economics');
      var cvName = (meta && meta.cvName) || (meta && meta.snap && meta.snap.cvName) || '';
      var toastKey = cvName ? 'ui.toast.importEconNamed' : 'ui.toast.importEcon';
      if (global.DG_tFmt && cvName) showToast(DG_tFmt(toastKey, { name: cvName }));
      else showToast(ui(toastKey));
    } catch (err){
      showError('import planting → econ', err);
      showToast((ui('ui.toast.importEconFail') || 'Ошибка импорта') + ': ' + (err.message || err));
    }
  }

  function applyProjectState(imported){
    if (!imported || typeof imported !== 'object') return;
    Object.keys(imported).forEach(function(k){ st()[k] = imported[k]; });
    if (!st().econ) st().econ = getDefaultEconState();
    if (window.DG_ensureEconExtensions) DG_ensureEconExtensions(st());
    ensureEconCultures();
    migrateEconCultureRows();
    ensureEconEquipment();
    saveGhStandardsStore();
    saveVfStandardsStore();
    saveCustomCultivarsStore();
    saveEconStore();
    try { localStorage.setItem(FACILITY_KEY, st().facility); } catch(_){}
    try { localStorage.setItem(APP_VIEW_KEY, st().appView); } catch(_){}
    saveGhUsefulArea();
    setAppView(st().appView || 'channels');
  }

  function setAppView(view){
    if (view === 'planting') view = 'channels';
    const prev = st().appView;
    if (prev === view && (view === 'channels' || view === 'pallets')){
      if (view === 'pallets' && allPalletCultivars().length){
        initPalletValuesFromSheet(getPalletCv());
      }
      updatePlantingGeomUI();
      updatePageSub();
      renderCultivars();
      syncVfStdControls();
      renderAll();
      try { localStorage.setItem(APP_VIEW_KEY, view); } catch(_){}
      return;
    }
    if (prev === 'channels' || prev === 'pallets') plantingSnapshots[prev] = capturePlantingViewSnapshot(prev);
    st().appView = view;
    try { localStorage.setItem(APP_VIEW_KEY, view); } catch(_){}
    const planting = $('view-planting');
    const economics = $('view-economics');
    const standards = $('view-standards');
    const isPlanting = view === 'channels' || view === 'pallets';
    if (planting) planting.classList.toggle('app-view-hidden', !isPlanting);
    if (economics) economics.classList.toggle('app-view-hidden', view !== 'economics');
    if (standards) standards.classList.toggle('app-view-hidden', view !== 'standards');
    var pageEl = document.querySelector('.page');
    if (pageEl) pageEl.classList.toggle('page--stdcat', view === 'standards');
    const bridge = $('planting-econ-bridge');
    if (bridge) bridge.style.display = isPlanting ? 'flex' : 'none';
    document.querySelectorAll('.app-tab').forEach(btn => {
      const on = btn.dataset.appView === view;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (isPlanting){
      restorePlantingViewSnapshot(view, plantingSnapshots[view]);
      if (view === 'pallets'){
        if (allPalletCultivars().length){
          var palCv = getPalletCv();
          if (palCv) {
            st().palletCv = palCv.id;
            if (st().comparePick[palCv.id] === undefined) st().comparePick[palCv.id] = true;
          }
          if (!allPalletCultivars().find(c => c.id === st().cvB)) st().cvB = st().palletCv;
          if (!plantingSnapshots.pallets) resetPalletStdToSheetDefaults();
          else syncCycleSlidersFromState();
        }
        syncPalletLoadWarn();
      }
      const culturePanel = $('panel-culture');
      if (culturePanel) {
        const sheetMode = isVF() || isPalletView();
        culturePanel.classList.toggle('is-vf', sheetMode);
        culturePanel.classList.toggle('is-sheet-mode', sheetMode);
      }
      updatePlantingGeomUI();
      updatePageSub();
      renderCultivars();
      syncVfStdControls();
      renderAll();
    }
    if (view === 'economics'){ updatePageSub(); renderEconomics(); }
    if (view === 'standards'){ updatePageSub(); renderStandardsCatalog(); }
    if (global.DG_plantingUx) global.DG_plantingUx.syncProjectMetaBar();
  }

  function updateCalcBuildBadge(r){
    const el = document.getElementById('calc-build-badge');
    if (!el) return;
    var tr = window.DG_t || function(k){ return k; };
    var av = st().appView;
    const view = av === 'pallets' ? tr('badge.pallets') : (av === 'economics' ? tr('badge.economics') : (av === 'standards' ? tr('badge.standards') : tr('badge.channels')));
    const pal = allPalletCultivars().length;
    let extra = '';
    if (st().appView === 'pallets'){
      extra = ' · ' + (pal ? tr('badge.catalog') + ' ' + pal + ' ' + tr('badge.sorts') : tr('badge.noCatalog'));
      if (r && r.total != null) extra += ' · ' + r.total + ' ' + tr('badge.plants');
    }
    var curNote = window.DG_getCurrency && DG_getCurrency() === 'USD' ? ' · ' + tr('currency.note') : '';
    el.textContent = tr('badge.build') + ' ' + CALC_BUILD + ' · ' + view + extra + curNote;
    el.classList.toggle('calc-build-badge--warn', st().appView === 'pallets' && !pal);
    el.classList.remove('calc-build-badge--toast');
  }

  function syncPalletLoadWarn(){
    const w = $('pallet-load-warn');
    if (!w) return;
    if (isPalletView() && !allPalletCultivars().length){
      w.textContent = ui('ui.pal.loadWarn');
      w.classList.remove('env-block-hidden');
    } else {
      w.classList.add('env-block-hidden');
      w.textContent = '';
    }
  }

  function updatePageSub(){
    const el = $('page-sub');
    const kick = $('page-kicker') || document.querySelector('.kicker');
    const title = $('page-title') || document.querySelector('.page-title');
    syncPalletLoadWarn();
    if (st().appView === 'economics'){
      if (kick) kick.textContent = pt('econ.kicker');
      if (title) title.textContent = pt('econ.title');
      if (el) el.textContent = pt('econ.sub');
      return;
    }
    if (st().appView === 'standards'){
      if (kick) kick.textContent = pt('stdcat.kicker');
      if (title) title.textContent = pt('stdcat.title');
      if (el) el.textContent = pt('stdcat.sub');
      return;
    }
    if (isPalletView()){
      const pcv = getPalletCv();
      const cellsLbl = String(st().palletCells);
      const detail = pcv
        ? ui('ui.sub.palCv', {
          name: pcv.name,
          tray: ui('ui.sub.trayPrefix'),
          cellsStd: pcv.palletCellsStd,
          cells: cellsLbl,
          cellsUnit: ui('ui.sub.cellsUnit')
        })
        : ui('ui.sub.palCells', { cells: cellsLbl, cellsUnit: ui('ui.sub.trayUnit') });
      if (el) el.textContent = pt('sub.pal') + ' · ' + detail + ' · ' +
        ui('ui.sub.buildTag', { buildWord: ui('ui.sub.buildWord'), build: CALC_BUILD });
    } else if (isVF()){
      if (el) el.textContent = pt('sub.vf');
    } else {
      if (el) el.textContent = pt('sub.gh');
    }
  }
    return {
      runWithState: runWithState,
      htmlEsc: htmlEsc,
      r3: r3,
      showToast: showToast,
      runPlantingEconImport: runPlantingEconImport,
      applyProjectState: applyProjectState,
      setAppView: setAppView,
      updateCalcBuildBadge: updateCalcBuildBadge,
      syncPalletLoadWarn: syncPalletLoadWarn,
      updatePageSub: updatePageSub
    };
  }

  global.DG_createPlantingAppNav = createPlantingAppNav;
})(typeof window !== 'undefined' ? window : globalThis);
