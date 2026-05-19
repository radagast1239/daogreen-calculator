'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const tagEcon = '<script src="js/planting-econ-glue.js';
const tagNav = '<script src="js/planting-app-nav.js';
if (!t.includes(tagEcon)) {
  const ins = t.indexOf('<script src="js/planting-event-bindings.js');
  const lineEnd = t.indexOf('\n', ins);
  t =
    t.slice(0, lineEnd + 1) +
    '<script src="js/planting-econ-glue.js?v=2026-05-19-p71-audit-fixes"></script>\n' +
    '<script src="js/planting-app-nav.js?v=2026-05-19-p71-audit-fixes"></script>\n' +
    t.slice(lineEnd + 1);
}

const mStart = t.indexOf('  function econStateFallback(){');
const mEnd = t.indexOf('  /* ---- Date helpers ---- */');
if (mStart < 0 || mEnd < 0) {
  console.error('markers', mStart, mEnd);
  process.exit(1);
}

const replacement =
  '  const CALC_BUILD = \'2026-05-19-p71-audit-fixes\';\n\n' +
  '  function plantingEconDeps(){\n' +
  '    return {\n' +
  '      getState: function(){ return state; },\n' +
  '      $: $, clamp: clamp, mergeLocaleDeps: mergeLocaleDeps,\n' +
  '      ECON_STORAGE: ECON_STORAGE, ECON_EQUIPMENT_GROUPS_FALLBACK: ECON_EQUIPMENT_GROUPS_FALLBACK,\n' +
  '      ECON_MONTH_DAYS: ECON_MONTH_DAYS, ECON_MAX_CULTURES: ECON_MAX_CULTURES,\n' +
  '      ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID, ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,\n' +
  '      ECON_CONSUMABLES_PER_POT_HINT: ECON_CONSUMABLES_PER_POT_HINT,\n' +
  '      VF_CULTIVARS: VF_CULTIVARS, CULTIVARS: CULTIVARS, PALLET_CULTIVARS: PALLET_CULTIVARS,\n' +
  '      HARVEST_MONTH_DAYS: HARVEST_MONTH_DAYS,\n' +
  '      getActivePlantingCvId: getActivePlantingCvId, r1: r1, r2: r2, r3: r3, fmtNum: fmtNum,\n' +
  '      getPlantingSnapshotForCvId: getPlantingSnapshotForCvId, getPlantingSnapshot: getPlantingSnapshot,\n' +
  '      plantingCvIdMatchesLiveState: plantingCvIdMatchesLiveState, findCvById: findCvById,\n' +
  '      isPalletCvId: isPalletCvId, isVfCvId: isVfCvId, allPalletCultivars: allPalletCultivars,\n' +
  '      allVfCultivars: allVfCultivars, allGhCultivars: allGhCultivars, supportsMulticut: supportsMulticut,\n' +
  '      cutIntervalRange: cutIntervalRange, getGhCvStandards: getGhCvStandards,\n' +
  '      buildDefaultVfStandards: buildDefaultVfStandards, parseNumInput: parseNumInput,\n' +
  '      formatInputValue: formatInputValue, decimalsFromStep: decimalsFromStep, round: round\n' +
  '    };\n' +
  '  }\n\n' +
  '  var _econApi = global.DG_createPlantingEconGlue(plantingEconDeps()).install();\n' +
  '  getEquipmentGroups = _econApi.getEquipmentGroups;\n' +
  '  defaultEconEquipment = _econApi.defaultEconEquipment;\n' +
  '  defaultEconCultureRow = _econApi.defaultEconCultureRow;\n' +
  '  defaultEconCultures = _econApi.defaultEconCultures;\n' +
  '  defaultEconState = _econApi.defaultEconState;\n' +
  '  econCvDisplayName = _econApi.econCvDisplayName;\n' +
  '  econGhYieldPerCutFromStd = _econApi.econGhYieldPerCutFromStd;\n' +
  '  econCvTotalCycleDays = _econApi.econCvTotalCycleDays;\n' +
  '  econSheetCutIntervalDays = _econApi.econSheetCutIntervalDays;\n' +
  '  econSheetYieldPerCut = _econApi.econSheetYieldPerCut;\n' +
  '  econYieldParamsForCvId = _econApi.econYieldParamsForCvId;\n' +
  '  econCatalogDefaultsForCvId = _econApi.econCatalogDefaultsForCvId;\n' +
  '  normalizeEconCultureRow = _econApi.normalizeEconCultureRow;\n' +
  '  parsePotHarvestMonthsFromCv = _econApi.parsePotHarvestMonthsFromCv;\n' +
  '  migrateEconCultureRows = _econApi.migrateEconCultureRows;\n' +
  '  econCultureBio = _econApi.econCultureBio;\n' +
  '  formatEconCultureHint = _econApi.formatEconCultureHint;\n' +
  '  calcCultureConsumables = _econApi.calcCultureConsumables;\n' +
  '  econApplyCultureSelect = _econApi.econApplyCultureSelect;\n' +
  '  importEconRowFromPlanting = _econApi.importEconRowFromPlanting;\n' +
  '  importAllEconFromPlanting = _econApi.importAllEconFromPlanting;\n' +
  '  calcOtherElecMonthly = _econApi.calcOtherElecMonthly;\n' +
  '  migrateEconOtherElectricity = _econApi.migrateEconOtherElectricity;\n' +
  '  ensureEconCultures = _econApi.ensureEconCultures;\n' +
  '  econCulturesTotalPct = _econApi.econCulturesTotalPct;\n' +
  '  calcCultureSliceFromRow = _econApi.calcCultureSliceFromRow;\n' +
  '  dedupeEconCultures = _econApi.dedupeEconCultures;\n' +
  '  canAddEconCulture = _econApi.canAddEconCulture;\n' +
  '  findDuplicateCultureIds = _econApi.findDuplicateCultureIds;\n' +
  '  collectEconWarnings = _econApi.collectEconWarnings;\n' +
  '  calcFarmEconomics = _econApi.calcFarmEconomics;\n' +
  '  calcEconomics = _econApi.calcEconomics;\n' +
  '  getEconCultureOptionsHtml = _econApi.getEconCultureOptionsHtml;\n' +
  '  isEconCvIdTaken = _econApi.isEconCvIdTaken;\n' +
  '  renderEconomics = _econApi.renderEconomics;\n' +
  '  syncEconFromPlanting = _econApi.syncEconFromPlanting;\n' +
  '  syncEconInputsFromState = _econApi.syncEconInputsFromState;\n' +
  '  function getDefaultEconState(){ return _econApi.getDefaultEconState(); }\n' +
  '  function getDefaultEconEquipment(){ return _econApi.getDefaultEconEquipment(); }\n' +
  '  function getDefaultEconCultureRow(cvId, opts){ return _econApi.getDefaultEconCultureRow(cvId, opts); }\n' +
  '  function loadEconStore(){ return _econApi.loadEconStore(); }\n' +
  '  function saveEconStore(){ return _econApi.saveEconStore(); }\n' +
  '  function ensureEconEquipment(){ return _econApi.ensureEconEquipment(); }\n' +
  '  function econEquipmentGroups(){ return _econApi.econEquipmentGroups(); }\n' +
  '  function sumEconEquipmentRaw(){ return _econApi.sumEconEquipmentRaw(); }\n' +
  '  function sumEconEquipment(){ return _econApi.sumEconEquipment(); }\n\n' +
  '  function plantingAppNavDeps(){\n' +
  '    return {\n' +
  '      getState: function(){ return state; },\n' +
  '      $: $, CALC_BUILD: CALC_BUILD, FACILITY_KEY: FACILITY_KEY, APP_VIEW_KEY: APP_VIEW_KEY,\n' +
  '      plantingSnapshots: plantingSnapshots,\n' +
  '      calc: calc, ui: ui, pt: pt, showError: showError,\n' +
  '      getActivePlantingCvId: getActivePlantingCvId, importAllEconFromPlanting: importAllEconFromPlanting,\n' +
  '      getPlantingSnapshotForCvId: getPlantingSnapshotForCvId, syncEconFromPlanting: syncEconFromPlanting,\n' +
  '      syncEconInputsFromState: syncEconInputsFromState, renderEconomics: renderEconomics,\n' +
  '      getDefaultEconState: getDefaultEconState, ensureEconCultures: ensureEconCultures,\n' +
  '      migrateEconCultureRows: migrateEconCultureRows, ensureEconEquipment: ensureEconEquipment,\n' +
  '      saveGhStandardsStore: saveGhStandardsStore, saveVfStandardsStore: saveVfStandardsStore,\n' +
  '      saveCustomCultivarsStore: saveCustomCultivarsStore, saveEconStore: saveEconStore,\n' +
  '      saveGhUsefulArea: saveGhUsefulArea,\n' +
  '      capturePlantingViewSnapshot: capturePlantingViewSnapshot,\n' +
  '      restorePlantingViewSnapshot: restorePlantingViewSnapshot,\n' +
  '      allPalletCultivars: allPalletCultivars, initPalletValuesFromSheet: initPalletValuesFromSheet,\n' +
  '      getPalletCv: getPalletCv, syncCycleSlidersFromState: syncCycleSlidersFromState,\n' +
  '      isVF: isVF, isPalletView: isPalletView, updatePlantingGeomUI: updatePlantingGeomUI,\n' +
  '      renderCultivars: renderCultivars, syncVfStdControls: syncVfStdControls, renderAll: renderAll\n' +
  '    };\n' +
  '  }\n\n' +
  '  var _appNav = global.DG_createPlantingAppNav(plantingAppNavDeps());\n' +
  '  function runWithState(t, fn){ return _appNav.runWithState(t, fn); }\n' +
  '  function htmlEsc(s){ return _appNav.htmlEsc(s); }\n' +
  '  function r3(n){ return _appNav.r3(n); }\n' +
  '  function showToast(msg){ return _appNav.showToast(msg); }\n' +
  '  function runPlantingEconImport(opts){ return _appNav.runPlantingEconImport(opts); }\n' +
  '  function applyProjectState(imported){ return _appNav.applyProjectState(imported); }\n' +
  '  function setAppView(view){ return _appNav.setAppView(view); }\n' +
  '  function updateCalcBuildBadge(r){ return _appNav.updateCalcBuildBadge(r); }\n' +
  '  function syncPalletLoadWarn(){ return _appNav.syncPalletLoadWarn(); }\n' +
  '  function updatePageSub(){ return _appNav.updatePageSub(); }\n\n';

t = t.slice(0, mStart) + replacement + t.slice(mEnd);
fs.writeFileSync(p, t, 'utf8');
console.log('ok, removed', mEnd - mStart, 'chars');
