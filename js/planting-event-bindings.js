/**
 * DOM-события и boot калькулятора посадки.
 * DG_createPlantingEventBindings(deps)
 */
(function (global) {
  'use strict';

  function createPlantingEventBindings(deps) {
    var lightSync = false;

    function bindCustomCultivarDialog() {
    var state = deps.getState();
    var $ = deps.$;
    function addCustomGhCultivar() { return deps.addCustomGhCultivar.apply(deps, arguments); }
    function addCustomVfCultivar() { return deps.addCustomVfCultivar.apply(deps, arguments); }
    function blankGhCultivarTemplate() { return deps.blankGhCultivarTemplate.apply(deps, arguments); }
    function blankVfCultivarTemplate() { return deps.blankVfCultivarTemplate.apply(deps, arguments); }
    function getActiveCv() { return deps.getActiveCv.apply(deps, arguments); }
    function isVF() { return deps.isVF.apply(deps, arguments); }
    function renderAll() { return deps.renderAll.apply(deps, arguments); }
    function renderCultivars() { return deps.renderCultivars.apply(deps, arguments); }
    function renderGhStandardsPanel() { return deps.renderGhStandardsPanel.apply(deps, arguments); }
    function renderVfStandardsPanel() { return deps.renderVfStandardsPanel.apply(deps, arguments); }
    function resetVfStdToSheetDefaults() { return deps.resetVfStdToSheetDefaults.apply(deps, arguments); }
    function resetPalletStdToSheetDefaults() { return deps.resetPalletStdToSheetDefaults.apply(deps, arguments); }
const dlg = $('cv-add-dialog');
    const form = $('cv-add-form');
    const addBtn = $('cv-add-custom');
    const cancelBtn = $('cv-add-cancel');
    const nameInp = $('cv-add-name');
    const sectionWrap = $('cv-add-section-wrap');
    const sectionSel = $('cv-add-section');
    const copyChk = $('cv-add-copy');
    const tplName = $('cv-add-template-name');
    if (!dlg || !form || !addBtn) return;

    function openCvAddDialog(){
      const cv = getActiveCv();
      if (tplName) tplName.textContent = cv ? cv.name : '—';
      if (nameInp) nameInp.value = '';
      if (sectionWrap) sectionWrap.classList.toggle('env-block-hidden', !isVF());
      if (sectionSel && cv && cv.section) sectionSel.value = cv.section;
      if (copyChk) copyChk.checked = true;
      dlg.showModal();
      if (nameInp) setTimeout(() => nameInp.focus(), 50);
    }

    addBtn.addEventListener('click', openCvAddDialog);
    if (cancelBtn) cancelBtn.addEventListener('click', () => dlg.close());
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = nameInp ? nameInp.value.trim() : '';
      if (!name){ if (nameInp) nameInp.focus(); return; }
      const useCopy = copyChk ? copyChk.checked : true;
      const sec = sectionSel ? sectionSel.value : 'baby';
      const tpl = useCopy ? getActiveCv() : (isVF() ? blankVfCultivarTemplate(sec) : blankGhCultivarTemplate());
      if (isVF()){
        addCustomVfCultivar(name, sec, tpl);
        resetVfStdToSheetDefaults();
        renderVfStandardsPanel();
      } else {
        addCustomGhCultivar(name, tpl);
        renderGhStandardsPanel();
      }
      dlg.close();
      renderCultivars();
      renderAll();
    });
    }

    function bindEvents() {
    var state = deps.getState();
    var $ = deps.$;
    var VF_CULTIVARS = deps.VF_CULTIVARS;
    var FACILITY_KEY = deps.FACILITY_KEY;
    var CALC_BUILD = deps.CALC_BUILD;
    var ECON_SALAD_MIX_ID = deps.ECON_SALAD_MIX_ID;
    var _lightEnergy = deps.lightEnergy;
    var georgyMode = typeof deps.getGeorgyMode === "function" ? deps.getGeorgyMode() : deps.georgyMode;
    var canopyDensityUi = deps.canopyDensityUi;
    function clamp(v, lo, hi) { return deps.clamp(v, lo, hi); }
    function parseNumInput(s) { return deps.parseNumInput(s); }
    function DG_applyEconPreset() { return deps.DG_applyEconPreset.apply(deps, arguments); }
    function DG_econPresetLabel() { return deps.DG_econPresetLabel.apply(deps, arguments); }
    function DG_exportEconCsv() { return deps.DG_exportEconCsv.apply(deps, arguments); }
    function DG_fmtMoneyPlain() { return deps.DG_fmtMoneyPlain.apply(deps, arguments); }
    function DG_initProjectStore() { return deps.DG_initProjectStore.apply(deps, arguments); }
    function addCustomGhCultivar() { return deps.addCustomGhCultivar.apply(deps, arguments); }
    function addCustomVfCultivar() { return deps.addCustomVfCultivar.apply(deps, arguments); }
    function applyProjectState() { return deps.applyProjectState.apply(deps, arguments); }
    function initPdfExport() { return deps.initPdfExport && deps.initPdfExport.apply(deps, arguments); }
    function applyCanopyStandard() { return deps.applyCanopyStandard.apply(deps, arguments); }
    function applyGhStandardFromStore() { return deps.applyGhStandardFromStore.apply(deps, arguments); }
    function applyVfStandardField() { return deps.applyVfStandardField.apply(deps, arguments); }
    function applyVfStandardFromStore() { return deps.applyVfStandardFromStore.apply(deps, arguments); }
    function blankGhCultivarTemplate() { return deps.blankGhCultivarTemplate.apply(deps, arguments); }
    function blankVfCultivarTemplate() { return deps.blankVfCultivarTemplate.apply(deps, arguments); }
    function buildDefaultGhStandards() { return deps.buildDefaultGhStandards.apply(deps, arguments); }
    function buildDefaultVfStandards() { return deps.buildDefaultVfStandards.apply(deps, arguments); }
    function calc() { return deps.calc.apply(deps, arguments); }
    function calcFarmEconomics() { return deps.calcFarmEconomics.apply(deps, arguments); }
    function canAddEconCulture() { return deps.canAddEconCulture.apply(deps, arguments); }
    function comparePickActiveId() { return deps.comparePickActiveId.apply(deps, arguments); }
    function defaultEconCultureRow() { return deps.defaultEconCultureRow.apply(deps, arguments); }
    function dliFromPpfd() { return deps.dliFromPpfd.apply(deps, arguments); }
    function econApplyCultureSelect() { return deps.econApplyCultureSelect.apply(deps, arguments); }
    function ensureComparePick() { return deps.ensureComparePick.apply(deps, arguments); }
    function ensureEconCultures() { return deps.ensureEconCultures.apply(deps, arguments); }
    function getActiveCv() { return deps.getActiveCv.apply(deps, arguments); }
    function getCompareList() { return deps.getCompareList.apply(deps, arguments); }
    function getCv() { return deps.getCv.apply(deps, arguments); }
    function getDefaultEconState() { return deps.getDefaultEconState.apply(deps, arguments); }
    function getVfCv() { return deps.getVfCv.apply(deps, arguments); }
    function getPalletCv() { return deps.getPalletCv.apply(deps, arguments); }
    function getVfCvStandards() { return deps.getVfCvStandards.apply(deps, arguments); }
    function applyVfUserStandardsToState() { return deps.applyVfUserStandardsToState.apply(deps, arguments); }
    function ghCutCountMax() { return deps.ghCutCountMax.apply(deps, arguments); }
    function harvestChannel() { return deps.harvestChannel.apply(deps, arguments); }
    function isGeorgyProfiled() { return deps.isGeorgyProfiled.apply(deps, arguments); }
    function isPalletView() { return deps.isPalletView.apply(deps, arguments); }
    function isVF() { return deps.isVF.apply(deps, arguments); }
    function loadEconStore() { return deps.loadEconStore.apply(deps, arguments); }
    function loadGhUsefulArea() { return deps.loadGhUsefulArea.apply(deps, arguments); }
    function migrateEconOtherElectricity() { return deps.migrateEconOtherElectricity.apply(deps, arguments); }
    function modelCanopyFromMass() { return deps.modelCanopyFromMass.apply(deps, arguments); }
    function ppfdFromDli() { return deps.ppfdFromDli.apply(deps, arguments); }
    function pr() { return deps.pr.apply(deps, arguments); }
    function r1() { return deps.r1.apply(deps, arguments); }
    function r2() { return deps.r2.apply(deps, arguments); }
    function readGhStandardsFromState() { return deps.readGhStandardsFromState.apply(deps, arguments); }
    function readVfStandardsFromState() { return deps.readVfStandardsFromState.apply(deps, arguments); }
    function renderAll() { return deps.renderAll.apply(deps, arguments); }
    function renderCultivars() { return deps.renderCultivars.apply(deps, arguments); }
    function renderEconomics() { return deps.renderEconomics.apply(deps, arguments); }
    function renderGhStandardsPanel() { return deps.renderGhStandardsPanel.apply(deps, arguments); }
    function renderGhYieldTotals() { return deps.renderGhYieldTotals.apply(deps, arguments); }
    function renderVfStandardsPanel() { return deps.renderVfStandardsPanel.apply(deps, arguments); }
    function resetVfStdToSheetDefaults() { return deps.resetVfStdToSheetDefaults.apply(deps, arguments); }
    function resetPalletStdToSheetDefaults() { return deps.resetPalletStdToSheetDefaults.apply(deps, arguments); }
    function initPalletValuesFromSheet() { return deps.initPalletValuesFromSheet.apply(deps, arguments); }
    function updatePlantingGeomUI() { return deps.updatePlantingGeomUI.apply(deps, arguments); }
    function getPalletCv() { return deps.getPalletCv.apply(deps, arguments); }
    function syncCycleSlidersFromState() { return deps.syncCycleSlidersFromState.apply(deps, arguments); }
    function runPlantingEconImport() { return deps.runPlantingEconImport.apply(deps, arguments); }
    function saveEconStore() { return deps.saveEconStore.apply(deps, arguments); }
    function saveGhStandardsStore() { return deps.saveGhStandardsStore.apply(deps, arguments); }
    function saveGhUsefulArea() { return deps.saveGhUsefulArea.apply(deps, arguments); }
    function saveVfStandardsStore() { return deps.saveVfStandardsStore.apply(deps, arguments); }
    function setAppView() { return deps.setAppView.apply(deps, arguments); }
    function setFacility() { return deps.setFacility.apply(deps, arguments); }
    function showError() { return deps.showError.apply(deps, arguments); }
    function showToast() { return deps.showToast.apply(deps, arguments); }
    function syncBabyGhCutsAuto() { return deps.syncBabyGhCutsAuto.apply(deps, arguments); }
    function syncCanopyUI() { return deps.syncCanopyUI.apply(deps, arguments); }
    function syncCutMassUI() { return deps.syncCutMassUI.apply(deps, arguments); }
    function syncEconInputsFromState() { return deps.syncEconInputsFromState.apply(deps, arguments); }
    function syncGhCutsUI() { return deps.syncGhCutsUI.apply(deps, arguments); }
    function syncGhYieldMarginSliders() { return deps.syncGhYieldMarginSliders.apply(deps, arguments); }
    function syncHarvestBlockUI() { return deps.syncHarvestBlockUI.apply(deps, arguments); }
    function syncManualMassUI() { return deps.syncManualMassUI.apply(deps, arguments); }
    function syncMulticutDetailUI() { return deps.syncMulticutDetailUI.apply(deps, arguments); }
    function syncCutIntervalSlider(cv) { return deps.syncCutIntervalSlider(cv); }
    function syncPalletPlantsHint() { return deps.syncPalletPlantsHint.apply(deps, arguments); }
    function syncPalletZoneLength() { return deps.syncPalletZoneLength.apply(deps, arguments); }
    function syncVfSlidersFromState() { return deps.syncVfSlidersFromState.apply(deps, arguments); }
    function syncVfStdBadges() { return deps.syncVfStdBadges.apply(deps, arguments); }
    function ui() { return deps.ui.apply(deps, arguments); }
    function unlockPlantingStdForControl() { return deps.unlockPlantingStdForControl.apply(deps, arguments); }
/* ---- Event handlers ---- */
  const numericSliders = ['germination','length','palletsAlong','nch','density','offset','extraB','day','nursery','temp','targetDli','targetPhotoperiod','cutInterval','errorPct','canopyPct','temp-B','pricePerKg','pricePerKwh','targetDliVf','targetPhotoperiodVf','ppfd','ledEfficacyVf','rh','targetDliB','targetPhotoperiodB','palletTiers','tierGapMm','palletLidHoles'];
  numericSliders.forEach(id => {
    const sliderEl = $(id);
    if (!sliderEl) return;
    sliderEl.addEventListener('input', e => {
      const v = parseNumInput(e.target.value);
      let key = id;
      if (id === 'temp-B') key = 'tempB';
      else if (id === 'targetDliVf') key = 'targetDli';
      else if (id === 'targetPhotoperiodVf') key = 'targetPhotoperiod';
      if (id === 'canopyPct'){
        state.canopyPct = clamp(v, 100, 130);
        state.useManualCanopy = false;
        syncCanopyUI();
      } else {
        state[key] = v;
      }
      if (id === 'errorPct') state.errorPct = clamp(Math.round(Number(state.errorPct)), 0, 20);
      if (id === 'day'){
        if (georgyMode && georgyMode.onGeorgyDayChanged) georgyMode.onGeorgyDayChanged();
        else if (canopyDensityUi && canopyDensityUi.onDayChanged) canopyDensityUi.onDayChanged();
      }
      if (georgyMode && georgyMode.isGeorgyGh && georgyMode.isGeorgyGh() &&
          georgyMode.isGeorgyHeadSalad && georgyMode.isGeorgyHeadSalad(getCv()) &&
          (id === 'nursery' || id === 'germination') && georgyMode.onGeorgyHeadCycleChanged){
        georgyMode.onGeorgyHeadCycleChanged();
      }
      if (id === 'density' && state.georgyDensityFitted && !(georgyMode && georgyMode.isGeorgyGh())){
        state.georgyTargetDensity = clamp(v, 15, 220);
      }
      if (id === 'errorPct') syncGhYieldMarginSliders();
      if (isPalletView()){
        if (id === 'palletLidHoles') syncPalletPlantsHint();
        unlockPlantingStdForControl(id);
        if (id === 'nursery') unlockPlantingStdForControl('day');
        if (['temp', 'targetDli', 'targetPhotoperiod', 'targetDliVf', 'targetPhotoperiodVf', 'ppfd', 'ledEfficacyVf', 'nursery', 'germination', 'day', 'cutInterval', 'canopyPct'].indexOf(id) >= 0){
          state.palletStd.mass = false;
          if (id !== 'manualMass') state.useManualMass = false;
        }
      } else if (isVF()){
        unlockPlantingStdForControl(id);
      }
      if ((isVF() || isPalletView()) && !lightSync){
        if (id === 'ppfd'){
          state.targetDli = dliFromPpfd(v, state.targetPhotoperiod);
          syncVfSlidersFromState();
        } else if (id === 'targetDliVf' || id === 'targetPhotoperiodVf'){
          state.ppfd = Math.round(ppfdFromDli(state.targetDli, state.targetPhotoperiod));
          syncVfSlidersFromState();
        }
      }
      if (id === 'cutInterval' && state.multicut) syncCutIntervalSlider(getCv());
      if (id === 'palletsAlong') syncPalletZoneLength();
      else {
        const valEl = $(id + '-v');
        if (valEl){
          if (id === 'length') valEl.textContent = v.toFixed(1);
          else if (id === 'pricePerKg' && window.DG_fmtMoneyPlain) valEl.textContent = window.DG_fmtMoneyPlain(v, { decimals: 0 });
          else if (id === 'pricePerKwh' && window.DG_fmtMoneyPlain) valEl.textContent = window.DG_fmtMoneyPlain(v, { decimals: 2 });
          else if (id === 'temp' || id === 'targetDli' || id === 'targetPhotoperiod' || id === 'targetDliVf' || id === 'targetPhotoperiodVf' || id === 'targetDliB' || id === 'targetPhotoperiodB' || id === 'temp-B' || id === 'pricePerKwh' || id === 'ledEfficacyVf') valEl.textContent = r2(v);
          else valEl.textContent = v;
        }
      }
      try { renderAll(); } catch (err) { showError('slider/' + id, err); }
    });
  });

  $('lighting').addEventListener('change', e => {
    state.lighting = e.target.checked;
    renderAll();
  });

  $('multicut').addEventListener('change', e => {
    state.multicut = e.target.checked;
    syncMulticutDetailUI();
    renderAll();
  });

  $('useManualCutMass').addEventListener('change', e => {
    state.useManualCutMass = e.target.checked;
    if (state.useManualCutMass) unlockPlantingStdForControl('cutMass');
    syncCutMassUI();
    syncVfStdBadges();
    renderAll();
  });
  $('manualCutMass').addEventListener('input', e => {
    state.manualCutMass = clamp(parseFloat(e.target.value) || 0, 1, 500);
    unlockPlantingStdForControl('cutMass');
    syncCutMassUI();
    syncVfStdBadges();
    if (state.useManualCutMass) renderAll();
  });
  var autoCutInterval = $('auto-cut-interval');
  if (autoCutInterval) autoCutInterval.addEventListener('click', () => {
    if (!isVF() && !isPalletView()) return;
    applyVfStandardField('cutInterval');
  });
  var autoCutMass = $('auto-cut-mass');
  if (autoCutMass) autoCutMass.addEventListener('click', () => {
    if (!isVF() && !isPalletView()) return;
    applyVfStandardField('cutMass');
  });

  $('useManualMass').addEventListener('change', e => {
    state.useManualMass = e.target.checked;
    if (state.useManualMass) unlockPlantingStdForControl('mass');
    else if (isPalletView()) state.palletStd.mass = false;
    else if (isVF()) state.vfStd.mass = true;
    if (state.useManualMass && !state.useManualCanopy){
      const cv = getActiveCv();
      state.manualCanopy = Math.round(modelCanopyFromMass(cv, state.manualMass));
      if ($('manualCanopy')) $('manualCanopy').value = state.manualCanopy;
    }
    syncManualMassUI();
    syncVfStdBadges();
    renderAll();
  });

  $('useManualCanopy').addEventListener('change', e => {
    state.useManualCanopy = e.target.checked;
    if (state.useManualCanopy) unlockPlantingStdForControl('mass');
    const r = calc();
    if (state.useManualCanopy) state.manualCanopy = Math.round(r.canopy);
    else state.manualCanopy = Math.round(modelCanopyFromMass(r.cv, r.mass));
    syncCanopyUI();
    syncHarvestBlockUI(r);
    renderAll();
  });

  $('manualCanopy').addEventListener('input', e => {
    state.manualCanopy = clamp(parseFloat(e.target.value) || 0, 20, 600);
    if (state.useManualCanopy) unlockPlantingStdForControl('mass');
    syncHarvestBlockUI(calc());
    if (state.useManualCanopy) renderAll();
  });

  $('manualMass').addEventListener('input', e => {
    unlockPlantingStdForControl('mass');
    state.manualMass = clamp(parseFloat(e.target.value) || 0, 5, 500);
    if (!state.useManualCanopy){
      const cv = getActiveCv();
      state.manualCanopy = Math.round(modelCanopyFromMass(cv, state.manualMass));
      const inp = $('manualCanopy');
      if (inp && document.activeElement !== inp) inp.value = state.manualCanopy;
    }
    syncVfStdBadges();
    if (state.useManualMass) renderAll();
  });

  var autoMass = $('auto-mass');
  if (autoMass) autoMass.addEventListener('click', () => {
    const wasManual = state.useManualMass;
    state.useManualMass = false;
    const r = calc();
    state.useManualMass = wasManual;
    state.manualMass = clamp(Math.round(r.massAuto), 5, 500);
    syncManualMassUI();
    renderAll();
  });

  $('showRange').addEventListener('change', e => {
    state.showRange = e.target.checked;
    renderAll();
  });

  const compareShowRangeEl = $('compareShowRange');
  if (compareShowRangeEl){
    compareShowRangeEl.addEventListener('change', e => {
      state.showRange = e.target.checked;
      const main = $('showRange');
      if (main) main.checked = state.showRange;
      renderAll();
    });
  }
  const compareErrorPctEl = $('compareErrorPct');
  if (compareErrorPctEl){
    compareErrorPctEl.addEventListener('input', e => {
      state.errorPct = (function(){
        var n = parseInt(e.target.value, 10);
        return clamp(Number.isFinite(n) ? n : 12, 0, 20);
      })();
      syncGhYieldMarginSliders();
      renderAll();
    });
  }

  $('compareMode').addEventListener('change', e => {
    state.compareMode = e.target.checked;
    if (state.compareMode){
      ensureComparePick();
      const list = getCompareList();
      if (!list.some(c => state.comparePick[c.id])){
        const id = comparePickActiveId();
        list.forEach(c => { state.comparePick[c.id] = c.id === id; });
      }
    }
    renderAll();
  });
  $('compare-pick-all').addEventListener('click', () => {
    getCompareList().forEach(c => { state.comparePick[c.id] = true; });
    renderAll();
  });
  $('compare-pick-none').addEventListener('click', () => {
    const id = comparePickActiveId();
    getCompareList().forEach(c => { state.comparePick[c.id] = c.id === id; });
    renderAll();
  });
  $('compare-pick-active').addEventListener('click', () => {
    const id = comparePickActiveId();
    getCompareList().forEach(c => { state.comparePick[c.id] = c.id === id; });
    renderAll();
  });
  const ghYieldCmpAll = $('gh-yield-cmp-all');
  if (ghYieldCmpAll) ghYieldCmpAll.addEventListener('click', () => {
    ensureComparePick();
    getCompareList().forEach(c => { state.comparePick[c.id] = true; });
    renderAll();
  });
  const ghYieldCmpNone = $('gh-yield-cmp-none');
  if (ghYieldCmpNone) ghYieldCmpNone.addEventListener('click', () => {
    const id = comparePickActiveId();
    getCompareList().forEach(c => { state.comparePick[c.id] = c.id === id; });
    renderAll();
  });
  const ghYieldCmpActive = $('gh-yield-cmp-active');
  if (ghYieldCmpActive) ghYieldCmpActive.addEventListener('click', () => {
    const id = comparePickActiveId();
    getCompareList().forEach(c => { state.comparePick[c.id] = c.id === id; });
    renderAll();
  });
  $('compare-pick-add-active').addEventListener('click', () => {
    state.comparePick[comparePickActiveId()] = true;
    renderAll();
  });

  $('compareScenarios').addEventListener('change', e => {
    state.compareScenarios = e.target.checked;
    renderAll();
  });

  const ghCutRow = $('gh-cut-count-row');
  if (ghCutRow && !ghCutRow.dataset.cutBound){
    ghCutRow.dataset.cutBound = '1';
    ghCutRow.addEventListener('click', function(e){
      const btn = e.target.closest('.cut-count-btn');
      if (!btn) return;
      const cv = getCv();
      const max = ghCutCountMax(cv);
      state.ghCutCount = clamp(parseInt(btn.dataset.ghCuts, 10), 1, max);
      state.useManualGhCutCount = !!(georgyMode && georgyMode.isGeorgyProfiled(cv));
      syncGhCutsUI();
      renderAll();
    });
  }
  const manualGhCuts = $('useManualGhCutCount');
  if (manualGhCuts && !manualGhCuts.dataset.bound){
    manualGhCuts.dataset.bound = '1';
    manualGhCuts.addEventListener('change', function(){
      state.useManualGhCutCount = manualGhCuts.checked;
      if (!state.useManualGhCutCount && georgyMode && georgyMode.syncBabyGhCutsAuto){
        georgyMode.syncBabyGhCutsAuto(getCv());
      }
      syncGhCutsUI();
      renderAll();
    });
  }

  document.addEventListener('click', e => {
    const stdBtn = e.target.closest('.js-canopy-std');
    if (stdBtn){
      const r = calc();
      applyCanopyStandard(r.cv, r.mass);
      if (isPalletView()) state.palletStd.mass = false;
      syncCanopyUI();
      renderAll();
    }
  });

  document.addEventListener('input', e => {
    if (e.target.classList && e.target.classList.contains('canopyPct-sync')){
      state.canopyPct = clamp(parseFloat(e.target.value) || 100, 100, 130);
      state.useManualCanopy = false;
      unlockPlantingStdForControl('mass');
      syncCanopyUI();
      renderAll();
    }
  });

  var ghStdApply = $('gh-std-apply');
  if (ghStdApply) ghStdApply.addEventListener('click', () => {
    applyGhStandardFromStore(getCv());
    renderAll();
  });
  var ghStdSave = $('gh-std-save');
  if (ghStdSave) ghStdSave.addEventListener('click', () => {
    const cv = getCv();
    state.ghStandards[cv.id] = readGhStandardsFromState(cv);
    saveGhStandardsStore();
    renderGhStandardsPanel();
  });
  var ghStdReset = $('gh-std-reset-model');
  if (ghStdReset) ghStdReset.addEventListener('click', () => {
    const cv = getCv();
    state.ghStandards[cv.id] = buildDefaultGhStandards(cv);
    saveGhStandardsStore();
    renderGhStandardsPanel();
  });

  const vfStdApply = $('vf-std-apply');
  if (vfStdApply){
    vfStdApply.addEventListener('click', () => {
      const cv = isPalletView() ? getPalletCv() : getVfCv();
      if (isPalletView()){
        applyVfUserStandardsToState(getVfCvStandards(cv));
        state.palletStd = {
          germination: false, day: false, density: false, mass: false,
          cutInterval: false, cutMass: false, cells: false
        };
        deps.renderVfStdGrid();
      } else {
        applyVfStandardFromStore(cv);
      }
      renderAll();
    });
  }
  const vfStdSave = $('vf-std-save');
  if (vfStdSave){
    vfStdSave.addEventListener('click', () => {
      const cv = isPalletView() ? getPalletCv() : getVfCv();
      state.vfUserStandards[cv.id] = readVfStandardsFromState();
      saveVfStandardsStore();
      renderVfStandardsPanel();
    });
  }
  const vfStdReset = $('vf-std-reset-model');
  if (vfStdReset){
    vfStdReset.addEventListener('click', () => {
      const cv = isPalletView() ? getPalletCv() : getVfCv();
      if (!isPalletView()){
        state.vfUserStandards[cv.id] = buildDefaultVfStandards(cv);
        saveVfStandardsStore();
      }
      if (isPalletView()) resetPalletStdToSheetDefaults();
      else resetVfStdToSheetDefaults();
      renderVfStandardsPanel();
      renderAll();
    });
  }

  $('lighting-B').addEventListener('change', e => {
    state.lightingB = e.target.checked;
    renderAll();
  });

  var sowDateEl = $('sowDate');
  if (sowDateEl){
    sowDateEl.addEventListener('change', e => {
      state.sowDate = e.target.value;
      renderAll();
    });
  }

  $('auto-led-gh').addEventListener('click', () => {
    state.ledEfficacyGh = _lightEnergy.LED_STD_GH;
    if ($('ledEfficacyGh-v')) $('ledEfficacyGh-v').textContent = r1(_lightEnergy.LED_STD_GH);
    renderAll();
  });

  $('auto-nch').addEventListener('click', () => {
    if (isPalletView()) return;
    const r = calc();
    const fit = clamp(r.maxChannelsFit, 2, 20);
    state.nch = fit;
    $('nch').value = fit;
    $('nch-v').textContent = fit;
    renderAll();
  });

  $('auto-day').addEventListener('click', () => {
    if (isVF() && VF_CULTIVARS.length){
      const cv = getVfCv();
      const t = clamp(Math.round(cv.channelDays), 1, 70);
      state.day = t;
      state.vfStd.day = false;
      state.germination = clamp(cv.germination, 1, 21);
      $('germination').value = state.germination;
      $('germination-v').textContent = state.germination;
      $('day').value = t;
      $('day-v').textContent = t;
      renderAll();
      return;
    }
    const cv = getCv();
    const t = clamp(Math.round(harvestChannel(cv)), 1, 40);
    state.day = t;
    $('day').value = t;
    $('day-v').textContent = t;
    renderAll();
  });

  document.querySelectorAll('.pot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pot-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.pot = parseInt(btn.dataset.d);
      renderAll();
    });
  });

  document.querySelectorAll('#facility-bar button').forEach(btn => {
    btn.addEventListener('click', () => setFacility(btn.dataset.facility));
  });

  try {
    const storedFac = localStorage.getItem(FACILITY_KEY);
    if (storedFac === 'vertical' || storedFac === 'greenhouse') state.facility = storedFac;
  } catch(_){}

  loadEconStore();
  loadGhUsefulArea();

  const ghAreaInp = $('gh-useful-area');
  if (ghAreaInp){
    ghAreaInp.addEventListener('input', function(){
      const v = parseFloat(ghAreaInp.value);
      state.ghUsefulArea = (v > 0) ? Math.round(v * 10) / 10 : null;
      saveGhUsefulArea();
      try { renderGhYieldTotals(calc()); } catch (err) { showError('gh-useful-area', err); }
    });
  }
  const ghFromGeomBtn = $('gh-useful-area-from-geom');
  if (ghFromGeomBtn){
    ghFromGeomBtn.addEventListener('click', function(){
      const r = calc();
      if (r.sysArea > 0){
        state.ghUsefulArea = Math.round(r.sysArea * 10) / 10;
        saveGhUsefulArea();
        if (ghAreaInp) ghAreaInp.value = String(state.ghUsefulArea);
        renderAll();
      }
    });
  }

  const ghYieldFarmErrorPctEl = $('ghYieldFarmErrorPct');
  if (ghYieldFarmErrorPctEl){
    ghYieldFarmErrorPctEl.addEventListener('input', function(e){
      state.errorPct = (function(){
        var n = parseInt(e.target.value, 10);
        return clamp(Number.isFinite(n) ? n : 12, 0, 20);
      })();
      syncGhYieldMarginSliders();
      try { renderAll(); } catch (err) { showError('ghYieldFarmErrorPct', err); }
    });
  }

  const errorPctGhEl = $('errorPctGh');
  if (errorPctGhEl){
    errorPctGhEl.addEventListener('input', function(e){
      state.errorPct = (function(){
        var n = parseInt(e.target.value, 10);
        return clamp(Number.isFinite(n) ? n : 12, 0, 20);
      })();
      syncGhYieldMarginSliders();
      try { renderAll(); } catch (err) { showError('errorPctGh', err); }
    });
  }

  if (window.DG_initProjectStore){
    DG_initProjectStore({
      getState: function(){ return state; },
      applyState: applyProjectState,
      getBuild: function(){ return CALC_BUILD; },
      getCvName: function(){ var cv = getActiveCv(); return cv ? cv.name : 'calc'; },
      toast: showToast,
      onApplied: function(){ showToast(ui('ui.toast.projectLoaded')); renderAll(); }
    });
  }

  document.querySelectorAll('.app-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.appView;
      if (view) setAppView(view);
    });
  });

  const econSyncBtn = $('econ-sync-planting');
  if (econSyncBtn){
    econSyncBtn.addEventListener('click', function(){ runPlantingEconImport(); });
  }

  const econFillAreasBtn = $('econ-fill-areas');
  if (econFillAreasBtn){
    econFillAreasBtn.addEventListener('click', () => {
      const r = calc();
      const area = Math.round(r.sysArea * 10) / 10;
      state.econ.plantingArea = area;
      if (!state.econ.floorArea || state.econ.floorArea < area) state.econ.floorArea = area;
      saveEconStore();
      syncEconInputsFromState();
      renderEconomics();
    });
  }

  const econAddCultureBtn = $('econ-add-culture');
  if (econAddCultureBtn){
    econAddCultureBtn.addEventListener('click', () => {
      ensureEconCultures();
      if (!canAddEconCulture()) return;
      const row = defaultEconCultureRow('', { isNew: true, pct: 0 });
      state.econ.cultures.push(row);
      saveEconStore();
      renderEconomics();
    });
  }

  const btnGoEcon = $('btn-go-economics');
  if (btnGoEcon) btnGoEcon.addEventListener('click', function(){ setAppView('economics'); });
  const btnQuickImport = $('btn-import-econ-quick');
  if (btnQuickImport){
    btnQuickImport.addEventListener('click', function(){ runPlantingEconImport({ goEconomics: true }); });
  }

  document.querySelectorAll('.econ-preset-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      if (!window.DG_applyEconPreset || !state.econ) return;
      if (DG_applyEconPreset(state, btn.dataset.econPreset)){
        saveEconStore();
        renderEconomics();
        var presetId = btn.dataset.econPreset;
        var presetName = (typeof DG_econPresetLabel === 'function' && presetId)
          ? DG_econPresetLabel(presetId, btn.textContent.trim())
          : btn.textContent.trim();
        showToast(ui('ui.toast.preset', { name: presetName }));
      }
    });
  });

  const econCsvBtn = $('econ-export-csv');
  if (econCsvBtn){
    econCsvBtn.addEventListener('click', function(){
      try {
        if (!state.econ) state.econ = getDefaultEconState();
        migrateEconOtherElectricity(state.econ);
        const farm = calcFarmEconomics(state.econ);
        const cv = getActiveCv();
        const slug = (cv && cv.name) ? String(cv.name).replace(/[^a-zA-ZЀ-ӿ0-9]+/g, '-').slice(0, 20) : 'econ';
        window.DG_exportEconCsv(farm, {
          build: CALC_BUILD,
          date: new Date().toLocaleDateString('ru-RU'),
          filename: 'daogreen-econ-' + slug + '-' + new Date().toISOString().slice(0, 10)
        });
      } catch (e){
        alert(pr('err.csv', { msg: e.message || e }));
      }
    });
  }

  const econAddSaladMixBtn = $('econ-add-salad-mix');
  if (econAddSaladMixBtn){
    econAddSaladMixBtn.addEventListener('click', () => {
      ensureEconCultures();
      if (!canAddEconCulture()) return;
      if (!state.econ.cultures.some(c => c.cvId === ECON_SALAD_MIX_ID)){
        state.econ.cultures.push(econApplyCultureSelect(defaultEconCultureRow('', { isNew: true, pct: 0 }), ECON_SALAD_MIX_ID, 0, 0));
      }
      saveEconStore();
      renderEconomics();
    });
  }

  var cultivarsEl = $('cultivars');
  if (cultivarsEl && !cultivarsEl.dataset.cvDelegated) {
    cultivarsEl.dataset.cvDelegated = '1';
    cultivarsEl.addEventListener('click', function (e) {
      var delBtn = e.target.closest('.cv-del[data-cv-del]');
      if (delBtn) {
        e.stopPropagation();
        var id = delBtn.dataset.cvDel;
        if (!id || !confirm(ui('ui.cv.delConfirm', { name: (deps.findCvById && deps.findCvById(id) || {}).name || id }))) return;
        if (deps.removeCustomCultivar) deps.removeCustomCultivar(id);
        renderCultivars();
        renderVfStandardsPanel();
        renderGhStandardsPanel();
        renderAll();
        return;
      }
      var btn = e.target.closest('.cv-btn[data-pl-id], .cv-btn[data-vf-id], .cv-btn[data-id]');
      if (!btn) return;
      if (btn.dataset.plId) {
        if (state.appView !== 'pallets') setAppView('pallets');
        state.palletCv = btn.dataset.plId;
        resetPalletStdToSheetDefaults();
        initPalletValuesFromSheet(getPalletCv());
        updatePlantingGeomUI();
        syncCycleSlidersFromState();
      } else if (btn.dataset.vfId) {
        state.vfCv = btn.dataset.vfId;
        if (!state.vfUserStandards[state.vfCv]) state.vfUserStandards[state.vfCv] = buildDefaultVfStandards(getVfCv());
        resetVfStdToSheetDefaults();
      } else if (btn.dataset.id) {
        state.cv = btn.dataset.id;
        if (georgyMode && georgyMode.isGeorgyGh && georgyMode.isGeorgyGh()) state.georgyDensityFitted = false;
        if (!state.ghStandards[state.cv]) state.ghStandards[state.cv] = buildDefaultGhStandards(getCv());
      }
      renderCultivars();
      if (btn.dataset.plId || btn.dataset.vfId) renderVfStandardsPanel();
      else renderGhStandardsPanel();
      renderAll();
    });
  }
    }

    function bootApp() {
      try {
        deps.loadGhStandardsStore();
        deps.loadVfStandardsStore();
        deps.loadCustomCultivarsStore();
        if (global.DG_initLocale){
          global.DG_initLocale({
            parseNumInput: deps.parseNumInput,
            formatInputValue: deps.formatInputValue,
            onChange: function(){
              if (typeof deps.updatePageSub === 'function') deps.updatePageSub();
              var st = deps.getState();
              if (st.appView === 'economics'){
                if (typeof deps.renderEconomics === 'function') deps.renderEconomics();
                try { deps.updateCalcBuildBadge(deps.calc()); } catch(_){}
              } else if (typeof deps.renderAll === 'function') deps.renderAll();
            }
          });
        }
        if (global.DG_initProjectCompare){
          global.DG_initProjectCompare(deps.mergeLocaleDeps({
            getState: function(){ return deps.getState(); },
            getBuild: function(){ return deps.CALC_BUILD; },
            calcFarmEconomics: deps.calcFarmEconomics,
            migrateEconOtherElectricity: deps.migrateEconOtherElectricity,
            sumEconEquipment: deps.sumEconEquipment,
            calcWithState: function(temp, fn){ return deps.runWithState(temp, fn); },
            fmtNum: deps.fmtNum,
            r1: deps.r1,
            esc: deps.htmlEsc,
            summarize: global.DG_summarizeProject
          }));
        }
        if (global.DG_initOnboardingTour) global.DG_initOnboardingTour();
        if (global.DG_initPwaQr) global.DG_initPwaQr();
        if (global.DG_initReadonlyMode) global.DG_initReadonlyMode();
        if (global.DG_initPdfExport) deps.initPdfExport();
        var state = deps.getState();
        var $ = deps.$;
        if ($('sowDate')) $('sowDate').value = state.sowDate;
        if ($('showRange')) $('showRange').checked = !!state.showRange;
        deps.renderCultivars();
        bindCustomCultivarDialog();
        document.querySelectorAll('.pallet-cell-btn').forEach(function(btn){
          btn.addEventListener('click', function(){
            state.palletCells = parseInt(btn.dataset.cells, 10);
            deps.unlockPlantingStdForControl('cells');
            deps.syncPalletCellButtons();
            deps.syncVfStdBadges();
            deps.renderAll();
          });
        });
        document.querySelectorAll('.pallet-mount-btn').forEach(function(btn){
          btn.addEventListener('click', function(){
            state.palletMount = btn.dataset.mount === 'lid' ? 'lid' : 'cassette';
            deps.syncPalletMountButtons();
            deps.renderAll();
          });
        });
        deps.syncPalletZoneLength();
        deps.renderMonths();
        deps.updatePageSub();
        deps.setFacility(state.facility);
        deps.syncManualMassUI();
        deps.syncCutMassUI();
        deps.syncMulticutDetailUI();
        deps.initCollapseBlocks();
        deps.bindVfStdBadges();
        if (deps.VF_CULTIVARS.length){ deps.renderVfStdGrid(); }
        if (deps.VF_CULTIVARS.length && state.facility === 'vertical' && state.appView === 'channels') deps.resetVfStdToSheetDefaults();
        if (deps.PALLET_CULTIVARS && deps.PALLET_CULTIVARS.length && state.appView === 'pallets') deps.resetPalletStdToSheetDefaults();
        deps.renderAll();
        try {
          var savedView = localStorage.getItem(deps.APP_VIEW_KEY);
          if (savedView === 'planting') deps.setAppView('channels');
          else if (savedView === 'channels' || savedView === 'pallets' || savedView === 'economics') deps.setAppView(savedView);
        } catch(_){}
      } catch (err) {
        deps.showError('init', err);
      }
    }

    return { bindEvents: bindEvents, bootApp: bootApp, bindCustomCultivarDialog: bindCustomCultivarDialog };
  }

  global.DG_createPlantingEventBindings = createPlantingEventBindings;
})(typeof window !== 'undefined' ? window : globalThis);
