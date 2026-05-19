/**
 * Цепочка init*: registry → calc-core.
 * DG_createPlantingRuntime(deps) → API для inline-обёрток
 */
(function (global) {
  'use strict';

  function createPlantingRuntime(deps) {
    var global = deps.global;
    var PC = deps.PC;
    var NATURAL_DLI = deps.NATURAL_DLI;
    var CULTIVARS = deps.CULTIVARS;
    var VF_CULTIVARS = deps.VF_CULTIVARS;
    var VF_SECTIONS = deps.VF_SECTIONS;
    var PALLET_CULTIVARS = deps.PALLET_CULTIVARS;
    var PALLET_SECTIONS = deps.PALLET_SECTIONS;
    var MAX_WIDTH = deps.MAX_WIDTH;
    var CH_W = deps.CH_W;
    var DENSITY_MAX = deps.DENSITY_MAX;
    var $ = deps.$;
    var round = deps.round;
    var r1 = deps.r1;
    var r2 = deps.r2;
    var ui = deps.ui;
    var pt = deps.pt;
    var pm = deps.pm;
    var pr = deps.pr;
    var tr = deps.tr;
    var ptf = deps.ptf;
    var catalogPhrase = deps.catalogPhrase;
    var cvSubLine = deps.cvSubLine;
    var fmtNumRu = deps.fmtNumRu;
    var parseNumInput = deps.parseNumInput;
    var formatInputValue = deps.formatInputValue;
    var decimalsFromStep = deps.decimalsFromStep;
    var fmtNum = deps.fmtNum;
    var mergeLocaleDeps = deps.mergeLocaleDeps;
    var _plantLayoutApi = null;
    var _plantUi;

  var getCv, isPalletView, isVF, isVfCvId, allGhCultivars, allVfCultivars, isPalletCvId, allPalletCultivars;
  var isPalletSheetCv, getPalletCv, getVfCv, getActiveCv, getSheetCv, isSheetCv, usePlantingSheet, findCvById;

  function initCultivarRegistry(){
    if (!window.DG_createCultivarRegistry){
      console.warn('cultivar-registry.js не загружен');
      return;
    }
    var cr = window.DG_createCultivarRegistry({
      getState: deps.getState,
      CULTIVARS: CULTIVARS,
      VF_CULTIVARS: VF_CULTIVARS,
      PALLET_CULTIVARS: PALLET_CULTIVARS,
      isVfSheetCv: isVfSheetCv
    });
    isPalletView = cr.isPalletView;
    isVF = cr.isVF;
    isVfCvId = cr.isVfCvId;
    allGhCultivars = cr.allGhCultivars;
    allVfCultivars = cr.allVfCultivars;
    isPalletCvId = cr.isPalletCvId;
    allPalletCultivars = cr.allPalletCultivars;
    isPalletSheetCv = cr.isPalletSheetCv;
    getCv = cr.getCv;
    getPalletCv = cr.getPalletCv;
    getVfCv = cr.getVfCv;
    getActiveCv = cr.getActiveCv;
    getSheetCv = cr.getSheetCv;
    isSheetCv = cr.isSheetCv;
    usePlantingSheet = cr.usePlantingSheet;
    findCvById = cr.findCvById;
  }
  initCultivarRegistry();
  var createPlantUi = window.DG_createPlantingUiHelpers;
  if (!createPlantUi){
    throw new Error('planting-ui-helpers.js не загружен — подключите js/planting-ui-helpers.js перед planting-runtime-init.js');
  }
  _plantUi = createPlantUi({
    getState: deps.getState,
    $: $,
    isPalletView: function(){ return isPalletView(); },
    naturalDli: NATURAL_DLI
  });

  var _palletSheet;
  function initPalletValuesFromSheet(cv){ return _palletSheet.initPalletValuesFromSheet(cv); }
  function palletEffectiveGermination(cv){ return _palletSheet.palletEffectiveGermination(cv); }
  function palletEffectiveDay(cv){ return _palletSheet.palletEffectiveDay(cv); }
  function palletEffectiveDensity(cv){ return _palletSheet.palletEffectiveDensity(cv); }
  function palletEffectiveMass(cv, massAuto){ return _palletSheet.palletEffectiveMass(cv, massAuto); }
  function resetPalletStdToSheetDefaults(){ return _palletSheet.resetPalletStdToSheetDefaults(); }
  function applyPalletStandardsToStateOnly(cv, opts){ return _palletSheet.applyPalletStandardsToStateOnly(cv, opts); }
  function applyPalletStandardsFromSheet(cv, opts){ return _palletSheet.applyPalletStandardsFromSheet(cv, opts); }
  function effectivePalletHoleCount(){ return _palletSheet.effectivePalletHoleCount(); }
  function palletCellsForLayout(cv){ return _palletSheet.palletCellsForLayout(cv); }
  function calcFromPalletSheet(cv){ return _palletSheet.calcFromPalletSheet(cv); }

  const CUSTOM_CULTIVARS_STORAGE = global.DG_CUSTOM_CULTIVARS_STORAGE || 'calc-custom-cultivars';
  var _customCv;
  function loadCustomCultivarsStore(){ return _customCv.loadCustomCultivarsStore(); }
  function saveCustomCultivarsStore(){ return _customCv.saveCustomCultivarsStore(); }
  function blankGhCultivarTemplate(){ return _customCv.blankGhCultivarTemplate(); }
  function blankVfCultivarTemplate(section){ return _customCv.blankVfCultivarTemplate(section); }
  function addCustomGhCultivar(name, templateCv){ return _customCv.addCustomGhCultivar(name, templateCv); }
  function addCustomVfCultivar(name, section, templateCv){ return _customCv.addCustomVfCultivar(name, section, templateCv); }
  function removeCustomCultivar(id){ return _customCv.removeCustomCultivar(id); }

  if (!window.DG_CUT) window.DG_CUT = { HARVEST_MONTH_DAYS: 30.5, CUT_INTERVAL_SLACK: 6 };
  const HARVEST_MONTH_DAYS = window.DG_CUT.HARVEST_MONTH_DAYS;
  const CUT_INTERVAL_SLACK = window.DG_CUT.CUT_INTERVAL_SLACK;
  var _cutModel;
  function cutModelFallbackRange(cv){
    var mid = (cv && cv.cutInterval > 0) ? Math.round(cv.cutInterval) : 12;
    return { mid: mid, sliderMin: Math.max(5, mid - CUT_INTERVAL_SLACK), sliderMax: Math.min(45, mid + CUT_INTERVAL_SLACK) };
  }
  function parseNumsFromStr(s){ return _cutModel ? _cutModel.parseNumsFromStr(s) : []; }
  function vfCutIntervalFromCv(cv){ return _cutModel ? _cutModel.vfCutIntervalFromCv(cv) : 0; }
  function cutIntervalRange(cv){ return _cutModel ? _cutModel.cutIntervalRange(cv) : cutModelFallbackRange(cv); }
  function cutIntervalMods(cv){ return _cutModel ? _cutModel.cutIntervalMods(cv) : { range: cutModelFallbackRange(cv), rec: 12, delta: 0, massF: 1, canopyF: 1, massPct: 0, canopyPct: 0 }; }
  function applyCutIntervalHarvestMods(cv, mass, canopy){ return _cutModel ? _cutModel.applyCutIntervalHarvestMods(cv, mass, canopy) : { mass: mass, canopy: canopy }; }
  function supportsMulticut(cv){ return _cutModel ? _cutModel.supportsMulticut(cv) : false; }
  function effectiveCutInterval(){ return _cutModel ? _cutModel.effectiveCutInterval() : deps.getState().cutInterval; }
  function cutMassPerPlant(cv, cutIndex){ return _cutModel ? _cutModel.cutMassPerPlant(cv, cutIndex) : { val: 0, unit: 'г' }; }
  function vfMulticutStats(cv){ return _cutModel ? _cutModel.vfMulticutStats(cv) : { cutsPerMonth: 0, cutsInCycle: 1, monthsToReplace: 0, interval: 12 }; }
  function getMulticutYieldPerPlant(cv){ return _cutModel ? _cutModel.getMulticutYieldPerPlant(cv) : null; }

  const VF_STD_FIELDS = global.DG_VF_STD_FIELDS || [];
  var _cutIntervalUi = global.DG_createPlantingCutIntervalUi({
    getState: deps.getState,
    $: $,
    getActiveCv: function(){ return getActiveCv(); },
    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },
    cutIntervalMods: function(cv){ return cutIntervalMods(cv); },
    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },
    pm: pm,
    ui: ui
  });
  function syncCutIntervalSlider(cv){ return _cutIntervalUi.syncCutIntervalSlider(cv); }

  var _vfStandards;
  function getVfFieldStandard(cv, key){ return _vfStandards.getVfFieldStandard(cv, key); }
  function getVfFieldCurrent(key){ return _vfStandards.getVfFieldCurrent(key); }
  function isVfFieldAtStandard(key, cv){ return _vfStandards.isVfFieldAtStandard(key, cv); }
  function applyVfStandardField(key){ return _vfStandards.applyVfStandardField(key); }
  function syncVegPeriodTotal(){ return _vfStandards.syncVegPeriodTotal(); }
  function syncVfStdBadges(){ return _vfStandards.syncVfStdBadges(); }
  function bindVfStdBadges(){ return _vfStandards.bindVfStdBadges(); }
  function isVfSheetCv(cv){ return _vfStandards ? _vfStandards.isVfSheetCv(cv) : !!(cv && cv.vfSheet); }
  function preChannelDays(){ return _vfStandards.preChannelDays(); }
  function vfEffectiveGermination(cv){ return _vfStandards.vfEffectiveGermination(cv); }
  function vfEffectiveDay(cv){ return _vfStandards.vfEffectiveDay(cv); }
  function vfEffectiveDensity(cv){ return _vfStandards.vfEffectiveDensity(cv); }
  function vfEffectiveMass(cv, massAuto){ return _vfStandards.vfEffectiveMass(cv, massAuto); }
  function syncCutMassUI(){ return _vfStandards.syncCutMassUI(); }
  function syncMulticutDetailUI(){ return _vfStandards.syncMulticutDetailUI(); }
  function applyCutStandardsFromSheet(cv){ return _vfStandards.applyCutStandardsFromSheet(cv); }
  function syncVfStdControls(){ return _vfStandards.syncVfStdControls(); }
  function updateVfCvHint(){ return _vfStandards.updateVfCvHint(); }
  function renderVfStdGrid(){ return _vfStandards.renderVfStdGrid(); }
  function resetVfStdToSheetDefaults(){ return _vfStandards.resetVfStdToSheetDefaults(); }
  function applyVfStandardsFromSheet(cv){ return _vfStandards.applyVfStandardsFromSheet(cv); }
  function calcFromVfSheet(cv){ return _vfStandards.calcFromVfSheet(cv); }
  var _harvestUi;
  function manualHarvestMass(massAuto){ return _harvestUi.manualHarvestMass(massAuto); }
  function modelCanopyFromMass(cv, mass){ return _harvestUi.modelCanopyFromMass(cv, mass); }
  function standardCanopyMm(cv, mass){ return _harvestUi.standardCanopyMm(cv, mass); }
  function harvestCanopy(cv, mass){ return _harvestUi.harvestCanopy(cv, mass); }
  function applyCanopyStandard(cv, mass){ return _harvestUi.applyCanopyStandard(cv, mass); }
  function formatHarvestCtrlVal(val, rangeFn){ return _harvestUi.formatHarvestCtrlVal(val, rangeFn); }
  function syncManualMassUI(){ return _harvestUi.syncManualMassUI(); }
  function syncCanopyUI(){ return _harvestUi.syncCanopyUI(); }
  function syncManualCanopyUI(){ return _harvestUi.syncManualCanopyUI(); }
  function syncHarvestBlockUI(r){ return _harvestUi.syncHarvestBlockUI(r); }
  function updateMassModelHint(massAuto, mass, canopyAuto, canopy){ return _harvestUi.updateMassModelHint(massAuto, mass, canopyAuto, canopy); }
  function rangeMass(v){ return _harvestUi.rangeMass(v); }
  function rangeCanopy(v){ return _harvestUi.rangeCanopy(v); }
  var _palletRuntime;
  function syncPalletCellButtons(){ return _palletRuntime.syncPalletCellButtons(); }

  function plantLayoutPallet(cellsOverride){
    if (!_plantLayoutApi) initPlantingLayoutApi();
    return _plantLayoutApi.plantLayoutPallet(cellsOverride);
  }

  _harvestUi = global.DG_createPlantingHarvestUi({
    getState: deps.getState,
    $: $,
    clamp: function(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); },
    effectiveCa: effectiveCa,
    getActiveCv: getActiveCv,
    isPalletView: isPalletView,
    isVF: isVF,
    calc: calc,
    round: round,
    pm: pm,
    ui: ui,
    isVfSheetCv: isVfSheetCv,
    vfCutIntervalFromCv: function(cv){ return vfCutIntervalFromCv(cv); },
    getVfCv: getVfCv
  });

  _vfStandards = global.DG_createPlantingVfStandards({
    getState: deps.getState,
    $: $,
    constants: PC,
    MAX_WIDTH: MAX_WIDTH,
    CH_W: CH_W,
    vfStdFields: VF_STD_FIELDS,
    georgyMode: deps.getGeorgyMode(),
    getGeorgyMode: function(){ return deps.getGeorgyMode(); },
    ui: ui,
    pt: pt,
    pm: pm,
    r1: r1,
    isSheetCv: isSheetCv,
    isPalletSheetCv: isPalletSheetCv,
    getSheetCv: getSheetCv,
    getPlantingStd: getPlantingStd,
    usePlantingSheet: usePlantingSheet,
    isPalletView: isPalletView,
    isVF: isVF,
    getVfCv: getVfCv,
    getActiveCv: getActiveCv,
    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },
    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },
    vfCutIntervalFromCv: function(cv){ return vfCutIntervalFromCv(cv); },
    syncPalletCellButtons: syncPalletCellButtons,
    syncCutIntervalSlider: syncCutIntervalSlider,
    syncManualMassUI: syncManualMassUI,
    modelCanopyFromMass: modelCanopyFromMass,
    renderAll: renderAll,
    applyPalletStandardsFromSheet: function(cv, opts){ return _palletSheet.applyPalletStandardsFromSheet(cv, opts); },
    manualHarvestMass: manualHarvestMass,
    supportsMulticut: function(cv){ return supportsMulticut(cv); },
    vfMulticutStats: function(cv){ return vfMulticutStats(cv); },
    catalogPhrase: catalogPhrase,
    plantLayout: plantLayout,
    massAtTotal: massAtTotal,
    effectiveCa: effectiveCa,
    crowdingFactor: crowdingFactor,
    harvestCanopy: harvestCanopy,
    applyCutIntervalHarvestMods: applyCutIntervalHarvestMods,
    rgrAtTotal: rgrAtTotal,
    boltChannel: boltChannel,
    stageOf: stageOf,
    holeDiameter: holeDiameter
  });

  _palletSheet = global.DG_createPlantingPalletSheet({
    getState: deps.getState,
    $: $,
    constants: PC,
    getPalletCv: getPalletCv,
    isPalletView: isPalletView,
    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },
    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },
    syncCycleSlidersFromState: syncCycleSlidersFromState,
    syncPalletCellButtons: syncPalletCellButtons,
    syncCutIntervalSlider: syncCutIntervalSlider,
    syncManualMassUI: syncManualMassUI,
    syncCanopyUI: syncCanopyUI,
    syncMulticutDetailUI: syncMulticutDetailUI,
    manualHarvestMass: manualHarvestMass,
    modelCanopyFromMass: modelCanopyFromMass,
    applyCutStandardsFromSheet: applyCutStandardsFromSheet,
    syncVfStdControls: syncVfStdControls,
    renderVfStdGrid: renderVfStdGrid,
    palletMountMode: palletMountMode,
    plantLayoutPallet: plantLayoutPallet,
    massAtTotal: massAtTotal,
    effectiveCa: effectiveCa,
    crowdingFactor: crowdingFactor,
    harvestCanopy: harvestCanopy,
    applyCutIntervalHarvestMods: applyCutIntervalHarvestMods,
    rgrAtTotal: rgrAtTotal,
    harvestChannel: harvestChannel,
    boltChannel: boltChannel,
    stageOf: stageOf
  });

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const FACILITY_KEY = 'calc-110x55-facility';
  const APP_VIEW_KEY = 'calc-app-view';
  var plantingSnapshots;
  function capturePlantingViewSnapshot(v){ return _palletRuntime.capturePlantingViewSnapshot(v); }
  function restorePlantingViewSnapshot(v, s){ return _palletRuntime.restorePlantingViewSnapshot(v, s); }
  function getActivePlantingCvId(){ return _palletRuntime.getActivePlantingCvId(); }
  var _lightEnergy;
  function dliFromPpfd(ppfd, ph){ return _lightEnergy.dliFromPpfd(ppfd, ph); }
  function ppfdFromDli(dli, ph){ return _lightEnergy.ppfdFromDli(dli, ph); }
  function ledEfficacy(){ return _lightEnergy.ledEfficacy(); }
  function kwhPerSqmPerDayFromDli(dli){ return _lightEnergy.kwhPerSqmPerDayFromDli(dli); }

  function showAsPalletCalc(r){ return _palletRuntime.showAsPalletCalc(r); }
  function vegContextLabel(s){ return _palletRuntime.vegContextLabel(s); }
  function vegContextLabelCap(){ return _palletRuntime.vegContextLabelCap(); }
  function palletMountMode(){ return _palletRuntime.palletMountMode(); }
  function plantsPerPalletCount(){ return _palletRuntime.plantsPerPalletCount(); }
  function syncPalletZoneLength(){ return _palletRuntime.syncPalletZoneLength(); }
  function syncPalletMountButtons(){ return _palletRuntime.syncPalletMountButtons(); }
  function syncPalletMountUI(){ return _palletRuntime.syncPalletMountUI(); }
  function syncPalletTierHint(){ return _palletRuntime.syncPalletTierHint(); }
  function syncPalletPlantsHint(){ return _palletRuntime.syncPalletPlantsHint(); }
  function schemaCanopyMm(r){ return _palletRuntime.schemaCanopyMm(r); }
  function syncSchemaCanopyLegend(mm){ return _palletRuntime.syncSchemaCanopyLegend(mm); }
  function getCellCenters(n, l, w){ return _palletRuntime.getCellCenters(n, l, w); }
  function palletCellGeometry(c, m){ return _palletRuntime.palletCellGeometry(c, m); }
  function plantsPerPallet(){ return _palletRuntime.plantsPerPallet(); }

  const ECON_STORAGE = 'calc-econ-v3';
  /** Семена + горшок + субстрат на одно растение/ячейку (ориентир Daogreen) */
  var DG = window.DG_ECON || {};
  var ECON_DEFAULT_CONSUMABLES_PER_POT = DG.ECON_DEFAULT_CONSUMABLES_PER_POT != null ? DG.ECON_DEFAULT_CONSUMABLES_PER_POT : 4;
  var ECON_CONSUMABLES_PER_POT_HINT = DG.ECON_CONSUMABLES_PER_POT_HINT || '3–6';
  var ECON_SALAD_MIX_ID = DG.ECON_SALAD_MIX_ID || '__salad_mix__';
  var ECON_SALAD_MIX_CV_IDS = DG.ECON_SALAD_MIX_CV_IDS || [
    'vf-kale-baby', 'vf-mizuna-baby', 'vf-mustard-baby', 'vf-chard-baby',
    'vf-romano-baby', 'vf-corn',
    'vf-pakchoi-baby', 'vf-tatsoi-baby', 'vf-komatsuna-baby'
  ];
  var ECON_MONTH_DAYS = (DG.ECON_MONTH_DAYS != null ? DG.ECON_MONTH_DAYS : HARVEST_MONTH_DAYS);
  var ECON_MAX_CULTURES = DG.ECON_MAX_CULTURES != null ? DG.ECON_MAX_CULTURES : 6;
  var getEquipmentGroups;
  var ECON_EQUIPMENT_GROUPS_FALLBACK = [
    { title: 'Оборудование', items: [
      ['prodMain', 'Производственное оборудование'],
      ['solutionUnit', 'Растворный узел'],
      ['irrigationModule', 'Модуль полива']
    ]},
    { title: 'Дополнительные услуги', items: [
      ['marketing', 'Маркетинг, брендирование, документы'],
      ['design', 'Проектирование объекта'],
      ['install', 'Монтаж оборудования'],
      ['commissioning', 'Пусконаладочные работы']
    ]},
    { title: 'Дополнительное оборудование', items: [
      ['consumables', 'Расходные материалы'],
      ['auxEquip', 'Вспомогательное оборудование и инвентарь'],
      ['extraProd', 'Дополнительное производственное оборудование']
    ]},
    { title: 'Подготовка помещения', items: [
      ['prepRent', 'Аренда'],
      ['prepClimate', 'Климатическое оборудование + монтаж'],
      ['prepElectric', 'Электрика'],
      ['prepWater', 'Водоподготовка'],
      ['prepRepair', 'Ремонт в помещении при необходимости'],
      ['prepOther', 'Прочее']
    ]}
  ];
  var defaultEconEquipment, defaultEconCultureRow, defaultEconCultures, defaultEconState;
  var econCvDisplayName, econGhYieldPerCutFromStd, econCvTotalCycleDays, econSheetCutIntervalDays, econSheetYieldPerCut;
  var econYieldParamsForCvId, econCatalogDefaultsForCvId, normalizeEconCultureRow, parsePotHarvestMonthsFromCv, migrateEconCultureRows;
  var econCultureBio, formatEconCultureHint, calcCultureConsumables, econApplyCultureSelect, importEconRowFromPlanting, importAllEconFromPlanting;
  var calcOtherElecMonthly, migrateEconOtherElectricity, ensureEconCultures, econCulturesTotalPct, calcCultureSliceFromRow;
  var dedupeEconCultures, canAddEconCulture, findDuplicateCultureIds, collectEconWarnings, calcFarmEconomics, calcEconomics;
  var getEconCultureOptionsHtml, isEconCvIdTaken, renderEconomics, syncEconFromPlanting, syncEconInputsFromState;
  let lightSync = false;

  /* Biological range factors: mass full, canopy scales as √M so half, day shifts ~errorPct/8 */
  function rangeDay(){ return deps.getState().errorPct / 8; }

  var _ghYield;
  function loadGhUsefulArea(){ return _ghYield.loadGhUsefulArea(); }
  function saveGhUsefulArea(){ return _ghYield.saveGhUsefulArea(); }
  function getGhUsefulAreaM2(){ return _ghYield.getGhUsefulAreaM2(); }
  function ghYieldWithMargin(base, digits){ return _ghYield.ghYieldWithMargin(base, digits); }
  function ghYieldKgSqmYear(rc, cv){ return _ghYield.ghYieldKgSqmYear(rc, cv); }
  function computeGhYieldTotals(r){ return _ghYield.computeGhYieldTotals(r); }
  function syncGhYieldMarginSliders(){ return _ghYield.syncGhYieldMarginSliders(); }
  function syncBioMarginVisibility(){ return _ghYield.syncBioMarginVisibility(); }
  function updateGhYieldPanelCopy(r){ return _ghYield.updateGhYieldPanelCopy(r); }
  function syncGhYieldControls(r){ return _ghYield.syncGhYieldControls(r); }


  var _dliLight;
  function naturalDLI(){ return _dliLight.naturalDLI(); }
  function photoperiod(){ return _dliLight.photoperiod(); }
  function eveningHours(){ return _dliLight.eveningHours(); }
  function eveningSupplement(){ return _dliLight.eveningSupplement(); }
  function daySupplement(){ return _dliLight.daySupplement(); }
  function supplementDLI(){ return _dliLight.supplementDLI(); }
  function effectiveDLI(){ return _dliLight.effectiveDLI(); }
  function effectivePhotoperiod(){ return _dliLight.effectivePhotoperiod(); }
  function lightingMolForEnergy(){ return _dliLight.lightingMolForEnergy(); }
  _dliLight = global.DG_createPlantingDliLight({
    getState: deps.getState,
    naturalDli: NATURAL_DLI,
    isVF: isVF,
    isPalletView: isPalletView,
    getGLM: function(){ return typeof DG_growthLightModel !== 'undefined' ? DG_growthLightModel : null; }
  });

  var _growthCore;
  function dliFactor(){ return _growthCore.dliFactor(); }
  function photoperiodFactor(){ return _growthCore.photoperiodFactor(); }
  function tempFactor(cv){ return _growthCore.tempFactor(cv); }
  function greenhouseHeatYieldFactor(temp){ return _growthCore.greenhouseHeatYieldFactor(temp); }
  function greenhouseHeatYieldLossPct(temp){ return _growthCore.greenhouseHeatYieldLossPct(temp); }
  function isChannelGreenhouse(){ return _growthCore.isChannelGreenhouse(); }
  function isControlledEnv(){ return _growthCore.isControlledEnv(); }
  function isPlantingYieldView(){ return _growthCore.isPlantingYieldView(); }
  function isGreenhousePlanting(){ return _growthCore.isGreenhousePlanting(); }
  function effectiveTempFactor(cv){ return _growthCore.effectiveTempFactor(cv); }
  function boltShift(cv){ return _growthCore.boltShift(cv); }
  function envK(cv){ return _growthCore.envK(cv); }
  function envBolt(cv){ return _growthCore.envBolt(cv); }
  function envMultiplier(cv){ return _growthCore.envMultiplier(cv); }
  function crowdingFactor(canopyAtMax, nearestDist){ return _growthCore.crowdingFactor(canopyAtMax, nearestDist); }
  function effectiveCa(cv){ return _growthCore.effectiveCa(cv); }
  function totalAge(channelDay){ return _growthCore.totalAge(channelDay); }
  function massAtTotal(cv, t){ return _growthCore.massAtTotal(cv, t); }
  function canopyAtTotal(cv, t){ return _growthCore.canopyAtTotal(cv, t); }
  function rgrAtTotal(cv, t){ return _growthCore.rgrAtTotal(cv, t); }
  function harvestTotal(cv){ return _growthCore.harvestTotal(cv); }
  function harvestChannel(cv){ return _growthCore.harvestChannel(cv); }
  _growthCore = global.DG_createPlantingGrowthCore({
    getState: deps.getState,
    clamp: clamp,
    getGLM: function(){ return typeof DG_growthLightModel !== 'undefined' ? DG_growthLightModel : null; },
    getCv: getCv,
    getGeorgyMode: function(){ return deps.getGeorgyMode(); },
    isVF: isVF,
    isPalletView: isPalletView,
    effectiveDLI: effectiveDLI,
    effectivePhotoperiod: effectivePhotoperiod,
    photoperiod: photoperiod,
    eveningHours: eveningHours,
    preChannelDays: preChannelDays
  });

  _ghYield = global.DG_createPlantingGhYield({
    getState: deps.getState,
    $: $,
    ui: ui, r1: r1, r2: r2, clamp: clamp, getCv: getCv,
    isVF: isVF, isPalletView: isPalletView,
    isGreenhousePlanting: isGreenhousePlanting, isChannelGreenhouse: isChannelGreenhouse,
    supportsMulticut: supportsMulticut,
    plantingHarvestYieldParams: function(cv, r){ return typeof plantingHarvestYieldParams === "function" ? plantingHarvestYieldParams(cv, r) : null; }
  });

  const GH_STANDARDS_STORAGE = global.DG_GH_STANDARDS_STORAGE || 'calc-gh-user-standards';
  const VF_STANDARDS_STORAGE = global.DG_VF_STANDARDS_STORAGE || 'calc-vf-user-standards';

  const COLLAPSE_DEFAULTS = global.DG_COLLAPSE_DEFAULTS || {};

  var _ghStandards;
  function loadGhStandardsStore(){ return _ghStandards.loadGhStandardsStore(); }
  function saveGhStandardsStore(){ return _ghStandards.saveGhStandardsStore(); }
  function defaultGhCutMasses(cv){ return _ghStandards.defaultGhCutMasses(cv); }
  function buildDefaultGhStandards(cv){ return _ghStandards.buildDefaultGhStandards(cv); }
  function getGhCvStandards(cv){ return _ghStandards.getGhCvStandards(cv); }
  function readGhStandardsFromState(cv){ return _ghStandards.readGhStandardsFromState(cv); }
  function applyGhStandardsToState(s){ return _ghStandards.applyGhStandardsToState(s); }
  function applyGhStandardFromStore(cv){ return _ghStandards.applyGhStandardFromStore(cv); }
  function getGhCutMass(i){ return _ghStandards.getGhCutMass(i); }
  function ghCutCountMax(cv){ return _ghStandards.ghCutCountMax(cv); }
  function rebuildGhCutCountRow(cv){ return _ghStandards.rebuildGhCutCountRow(cv); }
  function syncMulticutBabyUi(cv){ return _ghStandards.syncMulticutBabyUi(cv); }
  function syncGhCutsUI(){ return _ghStandards.syncGhCutsUI(); }
  function syncGhFacilityPanels(){ return _ghStandards.syncGhFacilityPanels(); }
  function applyGhProfileToStateOnly(s, cv){ return _ghStandards.applyGhProfileToStateOnly(s, cv); }
  function renderGhStandardsPanel(){ return _ghStandards.renderGhStandardsPanel(); }
  var _vfUserStandards;
  function loadVfStandardsStore(){ return _vfUserStandards.loadVfStandardsStore(); }
  function saveVfStandardsStore(){ return _vfUserStandards.saveVfStandardsStore(); }
  function buildDefaultVfStandards(cv){ return _vfUserStandards.buildDefaultVfStandards(cv); }
  function getVfCvStandards(cv){ return _vfUserStandards.getVfCvStandards(cv); }
  function readVfStandardsFromState(){ return _vfUserStandards.readVfStandardsFromState(); }
  function applyVfProfileToStateOnly(s, cv){ return _vfUserStandards.applyVfProfileToStateOnly(s, cv); }
  function applyVfUserStandardsToState(s){ return _vfUserStandards.applyVfUserStandardsToState(s); }
  function applyVfStandardFromStore(cv){ return _vfUserStandards.applyVfStandardFromStore(cv); }
  function renderVfStandardsPanel(){ return _vfUserStandards.renderVfStandardsPanel(); }
  _ghStandards = global.DG_createPlantingGhStandards({
    getState: deps.getState,
    $: $,
    storageKey: GH_STANDARDS_STORAGE,
    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },
    getCv: getCv,
    ui: ui,
    pt: pt,
    pm: pm,
    ptf: ptf,
    DENSITY_MAX: DENSITY_MAX,
    envMultiplier: envMultiplier,
    harvestChannel: harvestChannel,
    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },
    modelCanopyFromMass: modelCanopyFromMass,
    syncCanopyUI: syncCanopyUI,
    syncVegPeriodTotal: syncVegPeriodTotal,
    syncBioMarginVisibility: syncBioMarginVisibility,
    isVF: isVF,
    isPalletView: isPalletView,
    georgyMode: deps.getGeorgyMode(),
    getGeorgyMode: function(){ return deps.getGeorgyMode(); },
    renderAll: renderAll
  });
  _vfUserStandards = global.DG_createPlantingVfUserStandards({
    getState: deps.getState,
    $: $,
    storageKey: VF_STANDARDS_STORAGE,
    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },
    getVfCv: getVfCv,
    VF_CULTIVARS: VF_CULTIVARS,
    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },
    modelCanopyFromMass: modelCanopyFromMass,
    DENSITY_MAX: DENSITY_MAX,
    syncManualMassUI: syncManualMassUI,
    syncCutMassUI: syncCutMassUI,
    syncCanopyUI: syncCanopyUI,
    syncVegPeriodTotal: syncVegPeriodTotal,
    syncVfStdBadges: syncVfStdBadges,
    renderVfStdGrid: renderVfStdGrid,
    isVF: isVF,
    isPalletView: isPalletView,
    ui: ui,
    pt: pt,
    pm: pm
  });



  _customCv = global.DG_createPlantingCustomCv({
    getState: deps.getState,
    pt: pt,
    getCv: getCv,
    getVfCv: getVfCv,
    CULTIVARS: CULTIVARS,
    VF_CULTIVARS: VF_CULTIVARS,
    buildDefaultGhStandards: buildDefaultGhStandards,
    buildDefaultVfStandards: buildDefaultVfStandards
  });

  function boltChannel(cv){ return envBolt(cv) - preChannelDays(); }

  _cutModel = global.DG_createPlantingCutModelInit({
    getState: deps.getState,
    clamp: clamp,
    getActiveCv: getActiveCv,
    isVF: isVF,
    isPalletView: isPalletView,
    isVfSheetCv: isVfSheetCv,
    isPalletSheetCv: isPalletSheetCv,
    isSheetCv: isSheetCv,
    usePlantingSheet: usePlantingSheet,
    getPlantingStd: getPlantingStd,
    getGhCutMass: getGhCutMass,
    envMultiplier: envMultiplier,
    vfEffectiveDay: vfEffectiveDay,
    harvestChannel: harvestChannel,
    boltChannel: boltChannel,
    totalAge: totalAge,
    envBolt: envBolt,
    georgyMode: deps.getGeorgyMode(),
    getGeorgyMode: function(){ return deps.getGeorgyMode(); },
    isChannelGreenhouse: isChannelGreenhouse
  });


  _lightEnergy = global.DG_createPlantingLightEnergy({
    getState: deps.getState,
    isVF: isVF, isPalletView: isPalletView
  });

  _palletRuntime = global.DG_createPlantingPalletRuntime({
    getState: deps.getState,
    $: $, ui: ui, r1: r1, round: round, clamp: clamp,
    isVF: isVF, isPalletView: isPalletView, allPalletCultivars: allPalletCultivars,
    getPalletCv: getPalletCv, initPalletValuesFromSheet: initPalletValuesFromSheet,
    setFacility: setFacility, syncManualMassUI: syncManualMassUI, syncCanopyUI: syncCanopyUI,
    modelCanopyFromMass: modelCanopyFromMass, effectivePalletHoleCount: effectivePalletHoleCount,
    VF_CULTIVARS: VF_CULTIVARS,
    CASSETTES_PER_PALLET: CASSETTES_PER_PALLET, CASSETTE_L_MM: CASSETTE_L_MM, CASSETTE_W_MM: CASSETTE_W_MM,
    PALLET_L_MM: PALLET_L_MM, PALLET_W_MM: PALLET_W_MM, PALLET_L_M: PALLET_L_M, PALLET_W_M: PALLET_W_M,
    PALLET_TIER_ZONE_MM: PALLET_TIER_ZONE_MM
  });
  plantingSnapshots = _palletRuntime.getSnapshotsStore();
  var _geomUi;
  function stageOf(t_channel, mass, tBoltCh, cv){ return _geomUi.stageOf(t_channel, mass, tBoltCh, cv); }
  function holeDiameter(cv){ return _geomUi.holeDiameter(cv); }
  function updatePlantingGeomUI(){ return _geomUi.updatePlantingGeomUI(); }
  _geomUi = global.DG_createPlantingGeomUi({
    getState: deps.getState,
    $: $,
    getCv: getCv,
    isVF: isVF,
    isPalletView: isPalletView,
    pt: pt,
    palletCellGeometry: palletCellGeometry,
    syncPalletZoneLength: syncPalletZoneLength,
    syncPalletMountButtons: syncPalletMountButtons,
    syncPalletPlantsHint: syncPalletPlantsHint,
    syncPalletTierHint: syncPalletTierHint,
    syncPalletCellButtons: syncPalletCellButtons,
    syncBioMarginVisibility: syncBioMarginVisibility
  });

  function georgyChannelTwoRows(){
    return deps.getGeorgyMode() && deps.getGeorgyMode().isGeorgyGh() && deps.getGeorgyMode().usesGeorgyChannel2Rows && deps.getGeorgyMode().usesGeorgyChannel2Rows(getCv());
  }

  function initPlantingLayoutApi(){
    _plantLayoutApi = DG_createPlantingLayout({
      constants: PC,
      getState: deps.getState,
      getCv: getCv,
      isPalletView: isPalletView,
      georgyChannelTwoRows: georgyChannelTwoRows,
      syncPalletZoneLength: syncPalletZoneLength,
      palletMountMode: palletMountMode,
      effectivePalletHoleCount: effectivePalletHoleCount,
      palletCellGeometry: palletCellGeometry,
      round: round
    });
  }

  function plantLayout(cv){
    if (!_plantLayoutApi) initPlantingLayoutApi();
    return _plantLayoutApi.plantLayout(cv);
  }

  var _calcCore;
  function calcScenario(opts){ return _calcCore.calcScenario(opts); }
  function calcScenarioVf(id, opts){ return _calcCore.calcScenarioVf(id, opts); }
  function calcScenarioPallet(id, opts){ return _calcCore.calcScenarioPallet(id, opts); }
  function calc(){ return _calcCore.calc(); }


  _calcCore = global.DG_createPlantingCalcCore({
    getState: deps.getState,
    getGeorgyMode: function(){ return deps.getGeorgyMode(); }, georgyMode: deps.getGeorgyMode(),
    findCvById: findCvById, getCv: getCv, getVfCv: getVfCv, getPalletCv: getPalletCv,
    isPalletView: isPalletView, isVF: isVF, allPalletCultivars: allPalletCultivars, allVfCultivars: allVfCultivars,
    harvestChannel: harvestChannel, totalAge: totalAge, massAtTotal: massAtTotal, plantLayout: plantLayout,
    plantLayoutPallet: plantLayoutPallet, effectiveCa: effectiveCa, crowdingFactor: crowdingFactor,
    manualHarvestMass: manualHarvestMass, preChannelDays: preChannelDays,
    lightingMolForEnergy: lightingMolForEnergy, kwhPerSqmPerDayFromDli: kwhPerSqmPerDayFromDli,
    dliFactor: dliFactor, effectiveTempFactor: effectiveTempFactor, tempFactor: tempFactor,
    naturalDLI: naturalDLI, effectiveDLI: effectiveDLI, boltShift: boltShift,
    calcFromVfSheet: calcFromVfSheet, calcFromPalletSheet: calcFromPalletSheet,
    applyPalletStandardsFromSheet: applyPalletStandardsFromSheet,
    getPlantingStateEconSlice: getPlantingStateEconSlice, restorePlantingStateEconSlice: restorePlantingStateEconSlice,
    canopyAtTotal: canopyAtTotal, applyCutIntervalHarvestMods: applyCutIntervalHarvestMods,
    rgrAtTotal: rgrAtTotal, boltChannel: boltChannel, stageOf: stageOf, holeDiameter: holeDiameter,
    harvestCanopy: harvestCanopy, MAX_WIDTH: MAX_WIDTH, CH_W: CH_W
  });

    return {
      initCultivarRegistry: initCultivarRegistry,
      initPalletValuesFromSheet: initPalletValuesFromSheet,
      palletEffectiveGermination: palletEffectiveGermination,
      palletEffectiveDay: palletEffectiveDay,
      palletEffectiveDensity: palletEffectiveDensity,
      palletEffectiveMass: palletEffectiveMass,
      resetPalletStdToSheetDefaults: resetPalletStdToSheetDefaults,
      applyPalletStandardsToStateOnly: applyPalletStandardsToStateOnly,
      applyPalletStandardsFromSheet: applyPalletStandardsFromSheet,
      effectivePalletHoleCount: effectivePalletHoleCount,
      palletCellsForLayout: palletCellsForLayout,
      calcFromPalletSheet: calcFromPalletSheet,
      loadCustomCultivarsStore: loadCustomCultivarsStore,
      saveCustomCultivarsStore: saveCustomCultivarsStore,
      blankGhCultivarTemplate: blankGhCultivarTemplate,
      blankVfCultivarTemplate: blankVfCultivarTemplate,
      addCustomGhCultivar: addCustomGhCultivar,
      addCustomVfCultivar: addCustomVfCultivar,
      removeCustomCultivar: removeCustomCultivar,
      cutModelFallbackRange: cutModelFallbackRange,
      parseNumsFromStr: parseNumsFromStr,
      vfCutIntervalFromCv: vfCutIntervalFromCv,
      cutIntervalRange: cutIntervalRange,
      cutIntervalMods: cutIntervalMods,
      applyCutIntervalHarvestMods: applyCutIntervalHarvestMods,
      supportsMulticut: supportsMulticut,
      effectiveCutInterval: effectiveCutInterval,
      cutMassPerPlant: cutMassPerPlant,
      vfMulticutStats: vfMulticutStats,
      getMulticutYieldPerPlant: getMulticutYieldPerPlant,
      syncCutIntervalSlider: syncCutIntervalSlider,
      getVfFieldStandard: getVfFieldStandard,
      getVfFieldCurrent: getVfFieldCurrent,
      isVfFieldAtStandard: isVfFieldAtStandard,
      applyVfStandardField: applyVfStandardField,
      syncVegPeriodTotal: syncVegPeriodTotal,
      syncVfStdBadges: syncVfStdBadges,
      bindVfStdBadges: bindVfStdBadges,
      isVfSheetCv: isVfSheetCv,
      preChannelDays: preChannelDays,
      vfEffectiveGermination: vfEffectiveGermination,
      vfEffectiveDay: vfEffectiveDay,
      vfEffectiveDensity: vfEffectiveDensity,
      vfEffectiveMass: vfEffectiveMass,
      syncCutMassUI: syncCutMassUI,
      syncMulticutDetailUI: syncMulticutDetailUI,
      applyCutStandardsFromSheet: applyCutStandardsFromSheet,
      syncVfStdControls: syncVfStdControls,
      updateVfCvHint: updateVfCvHint,
      renderVfStdGrid: renderVfStdGrid,
      resetVfStdToSheetDefaults: resetVfStdToSheetDefaults,
      applyVfStandardsFromSheet: applyVfStandardsFromSheet,
      calcFromVfSheet: calcFromVfSheet,
      manualHarvestMass: manualHarvestMass,
      modelCanopyFromMass: modelCanopyFromMass,
      standardCanopyMm: standardCanopyMm,
      harvestCanopy: harvestCanopy,
      applyCanopyStandard: applyCanopyStandard,
      formatHarvestCtrlVal: formatHarvestCtrlVal,
      syncManualMassUI: syncManualMassUI,
      syncCanopyUI: syncCanopyUI,
      syncManualCanopyUI: syncManualCanopyUI,
      syncHarvestBlockUI: syncHarvestBlockUI,
      updateMassModelHint: updateMassModelHint,
      rangeMass: rangeMass,
      rangeCanopy: rangeCanopy,
      syncPalletCellButtons: syncPalletCellButtons,
      plantLayoutPallet: plantLayoutPallet,
      capturePlantingViewSnapshot: capturePlantingViewSnapshot,
      restorePlantingViewSnapshot: restorePlantingViewSnapshot,
      getActivePlantingCvId: getActivePlantingCvId,
      dliFromPpfd: dliFromPpfd,
      ppfdFromDli: ppfdFromDli,
      ledEfficacy: ledEfficacy,
      kwhPerSqmPerDayFromDli: kwhPerSqmPerDayFromDli,
      showAsPalletCalc: showAsPalletCalc,
      vegContextLabel: vegContextLabel,
      vegContextLabelCap: vegContextLabelCap,
      palletMountMode: palletMountMode,
      plantsPerPalletCount: plantsPerPalletCount,
      syncPalletZoneLength: syncPalletZoneLength,
      syncPalletMountButtons: syncPalletMountButtons,
      syncPalletMountUI: syncPalletMountUI,
      syncPalletTierHint: syncPalletTierHint,
      syncPalletPlantsHint: syncPalletPlantsHint,
      schemaCanopyMm: schemaCanopyMm,
      syncSchemaCanopyLegend: syncSchemaCanopyLegend,
      getCellCenters: getCellCenters,
      palletCellGeometry: palletCellGeometry,
      plantsPerPallet: plantsPerPallet,
      rangeDay: rangeDay,
      loadGhUsefulArea: loadGhUsefulArea,
      saveGhUsefulArea: saveGhUsefulArea,
      getGhUsefulAreaM2: getGhUsefulAreaM2,
      ghYieldWithMargin: ghYieldWithMargin,
      ghYieldKgSqmYear: ghYieldKgSqmYear,
      computeGhYieldTotals: computeGhYieldTotals,
      syncGhYieldMarginSliders: syncGhYieldMarginSliders,
      syncBioMarginVisibility: syncBioMarginVisibility,
      updateGhYieldPanelCopy: updateGhYieldPanelCopy,
      syncGhYieldControls: syncGhYieldControls,
      naturalDLI: naturalDLI,
      photoperiod: photoperiod,
      eveningHours: eveningHours,
      eveningSupplement: eveningSupplement,
      daySupplement: daySupplement,
      supplementDLI: supplementDLI,
      effectiveDLI: effectiveDLI,
      effectivePhotoperiod: effectivePhotoperiod,
      lightingMolForEnergy: lightingMolForEnergy,
      dliFactor: dliFactor,
      photoperiodFactor: photoperiodFactor,
      tempFactor: tempFactor,
      greenhouseHeatYieldFactor: greenhouseHeatYieldFactor,
      greenhouseHeatYieldLossPct: greenhouseHeatYieldLossPct,
      isChannelGreenhouse: isChannelGreenhouse,
      isControlledEnv: isControlledEnv,
      isPlantingYieldView: isPlantingYieldView,
      isGreenhousePlanting: isGreenhousePlanting,
      effectiveTempFactor: effectiveTempFactor,
      boltShift: boltShift,
      envK: envK,
      envBolt: envBolt,
      envMultiplier: envMultiplier,
      crowdingFactor: crowdingFactor,
      effectiveCa: effectiveCa,
      totalAge: totalAge,
      massAtTotal: massAtTotal,
      canopyAtTotal: canopyAtTotal,
      rgrAtTotal: rgrAtTotal,
      harvestTotal: harvestTotal,
      harvestChannel: harvestChannel,
      loadGhStandardsStore: loadGhStandardsStore,
      saveGhStandardsStore: saveGhStandardsStore,
      defaultGhCutMasses: defaultGhCutMasses,
      buildDefaultGhStandards: buildDefaultGhStandards,
      getGhCvStandards: getGhCvStandards,
      readGhStandardsFromState: readGhStandardsFromState,
      applyGhStandardsToState: applyGhStandardsToState,
      applyGhStandardFromStore: applyGhStandardFromStore,
      getGhCutMass: getGhCutMass,
      ghCutCountMax: ghCutCountMax,
      rebuildGhCutCountRow: rebuildGhCutCountRow,
      syncMulticutBabyUi: syncMulticutBabyUi,
      syncGhCutsUI: syncGhCutsUI,
      syncGhFacilityPanels: syncGhFacilityPanels,
      applyGhProfileToStateOnly: applyGhProfileToStateOnly,
      renderGhStandardsPanel: renderGhStandardsPanel,
      loadVfStandardsStore: loadVfStandardsStore,
      saveVfStandardsStore: saveVfStandardsStore,
      buildDefaultVfStandards: buildDefaultVfStandards,
      getVfCvStandards: getVfCvStandards,
      readVfStandardsFromState: readVfStandardsFromState,
      applyVfProfileToStateOnly: applyVfProfileToStateOnly,
      applyVfUserStandardsToState: applyVfUserStandardsToState,
      applyVfStandardFromStore: applyVfStandardFromStore,
      renderVfStandardsPanel: renderVfStandardsPanel,
      boltChannel: boltChannel,
      stageOf: stageOf,
      holeDiameter: holeDiameter,
      updatePlantingGeomUI: updatePlantingGeomUI,
      georgyChannelTwoRows: georgyChannelTwoRows,
      initPlantingLayoutApi: initPlantingLayoutApi,
      plantLayout: plantLayout,
      calcScenario: calcScenario,
      calcScenarioVf: calcScenarioVf,
      calcScenarioPallet: calcScenarioPallet,
      calc: calc,
      clamp: clamp,
      FACILITY_KEY: FACILITY_KEY,
      APP_VIEW_KEY: APP_VIEW_KEY,
      ICON: ICON,
      COLLAPSE_DEFAULTS: COLLAPSE_DEFAULTS,
      lightSync: lightSync,
      plantingSnapshots: plantingSnapshots,
      HARVEST_MONTH_DAYS: HARVEST_MONTH_DAYS,
      CUT_INTERVAL_SLACK: CUT_INTERVAL_SLACK,
      CUSTOM_CULTIVARS_STORAGE: CUSTOM_CULTIVARS_STORAGE,
      GH_STANDARDS_STORAGE: GH_STANDARDS_STORAGE,
      VF_STANDARDS_STORAGE: VF_STANDARDS_STORAGE,
      ECON_STORAGE: ECON_STORAGE,
      ECON_DEFAULT_CONSUMABLES_PER_POT: ECON_DEFAULT_CONSUMABLES_PER_POT,
      ECON_CONSUMABLES_PER_POT_HINT: ECON_CONSUMABLES_PER_POT_HINT,
      ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,
      ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,
      ECON_MONTH_DAYS: ECON_MONTH_DAYS,
      ECON_MAX_CULTURES: ECON_MAX_CULTURES,
      ECON_EQUIPMENT_GROUPS_FALLBACK: ECON_EQUIPMENT_GROUPS_FALLBACK,
      _lightEnergy: _lightEnergy,
      _palletRuntime: _palletRuntime,
      _dliLight: _dliLight,
      _growthCore: _growthCore,
      _ghYield: _ghYield,
      _calcCore: _calcCore,
      _cutModel: _cutModel,
      _cutIntervalUi: _cutIntervalUi,
      _plantUi: _plantUi,
      getCv: getCv,
      isPalletView: isPalletView,
      isVF: isVF,
      isVfCvId: isVfCvId,
      allGhCultivars: allGhCultivars,
      allVfCultivars: allVfCultivars,
      isPalletCvId: isPalletCvId,
      allPalletCultivars: allPalletCultivars,
      isPalletSheetCv: isPalletSheetCv,
      getPalletCv: getPalletCv,
      getVfCv: getVfCv,
      getActiveCv: getActiveCv,
      getSheetCv: getSheetCv,
      isSheetCv: isSheetCv,
      usePlantingSheet: usePlantingSheet,
      findCvById: findCvById
    };
  }

  global.DG_createPlantingRuntime = createPlantingRuntime;
})(typeof window !== 'undefined' ? window : globalThis);
