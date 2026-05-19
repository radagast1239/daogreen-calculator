'use strict';
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'calculator-110x55_12.html'), 'utf8').split(/\r?\n/);

function prepBody(src) {
  var b = src;
  b = b.replace(/restorePlantingStateEconSlice/g, '__RPE__');
  b = b.replace(/getPlantingStateEconSlice/g, '__GPE__');
  b = b.replace(/plantingStateEconSlice/g, '__PSE__');
  b = b.replace(/\bstate\./g, 'deps.getState().');
  b = b.replace(/return state;/g, 'return deps.getState();');
  b = b.replace(/getState: function\(\)\{ return deps\.getState\(\); \}/g, 'getState: deps.getState');
  b = b.replace(/__RPE__/g, 'restorePlantingStateEconSlice');
  b = b.replace(/__GPE__/g, 'getPlantingStateEconSlice');
  b = b.replace(/__PSE__/g, 'plantingStateEconSlice');
  return b;
}

const body = prepBody(
  html.slice(3644, 3698).join('\n') + '\n\n' + html.slice(3700, 3832).join('\n')
);

const ALIASES = [
  '$', 'clamp', 'HARVEST_MONTH_DAYS', 'ECON_SALAD_MIX_ID', 'ECON_SALAD_MIX_CV_IDS',
  'supportsMulticut', 'effectiveCutInterval', 'cutMassPerPlant', 'getMulticutYieldPerPlant',
  'isVfSheetCv', 'isPalletView', 'isVF', 'lightingMolForEnergy', 'kwhPerSqmPerDayFromDli',
  'effectivePhotoperiod', 'calc', 'calcFromPalletSheet', 'calcFromVfSheet', 'findCvById',
  'isPalletCvId', 'isVfCvId', 'allPalletCultivars', 'allVfCultivars', 'allGhCultivars',
  'applyPalletStandardsFromSheet', 'applyVfProfileToStateOnly', 'applyGhProfileToStateOnly',
  'getGhCvStandards', 'buildDefaultVfStandards', 'getCv', 'plantLayout', 'massAtTotal',
  'harvestCanopy', 'crowdingFactor', 'effectiveCa', 'boltShift', 'boltChannel', 'tempFactor',
  'naturalDLI', 'effectiveDLI', 'setFacility', 'renderAll', 'renderCultivars', 'dliFactor',
  'photoperiodFactor', 'cutIntervalMods', 'syncVegPeriodTotal'
];
const prelude =
  ALIASES.map(function (n) {
    return '    var ' + n + ' = deps.' + n + ';';
  }).join('\n') + '\n\n';

const renderInstall =
  '    function createRenderModule() {\n' +
  '      return global.DG_createPlantingRender({\n' +
  '        getState: deps.getState,\n' +
  '        $: deps.$,\n' +
  '        ui: deps.ui, pt: deps.pt, pm: deps.pm, pr: deps.pr, tr: deps.tr,\n' +
  '        fmtNumRu: deps.fmtNumRu, catalogPhrase: deps.catalogPhrase, cvSubLine: deps.cvSubLine,\n' +
  '        r1: deps.r1, r2: deps.r2, round: deps.round, clamp: deps.clamp, htmlEsc: deps.htmlEsc,\n' +
  '        getGeorgyMode: function(){ return georgyMode; }, georgyMode: georgyMode,\n' +
  '        calc: deps.calc, renderAll: function(){ return _render.renderAll(); },\n' +
  '        getCv: deps.getCv, getActiveCv: deps.getActiveCv, getVfCv: deps.getVfCv, getPalletCv: deps.getPalletCv,\n' +
  '        isVF: deps.isVF, isPalletView: deps.isPalletView, isGreenhousePlanting: deps.isGreenhousePlanting,\n' +
  '        isChannelGreenhouse: deps.isChannelGreenhouse, isVfSheetCv: deps.isVfSheetCv,\n' +
  '        usePlantingSheet: deps.usePlantingSheet, getPlantingStd: deps.getPlantingStd,\n' +
  '        getGhUsefulAreaM2: deps.getGhUsefulAreaM2, ghYieldWithMargin: deps.ghYieldWithMargin,\n' +
  '        ghYieldKgSqmYear: deps.ghYieldKgSqmYear, calcForGhYieldCompareCv: function(cv){ return _render.calcForGhYieldCompareCv(cv); },\n' +
  '        syncGhYieldControls: deps.syncGhYieldControls, syncGhYieldMarginSliders: deps.syncGhYieldMarginSliders,\n' +
  '        syncBioMarginVisibility: deps.syncBioMarginVisibility,\n' +
  '        supportsMulticut: deps.supportsMulticut,\n' +
  '        plantingHarvestYieldParams: function(cv, r){ return plantingHarvestYieldParams(cv, r); },\n' +
  '        rangeMass: deps.rangeMass, rangeCanopy: deps.rangeCanopy, rangeDay: deps.rangeDay,\n' +
  '        getPlantingStateEconSlice: getPlantingStateEconSlice,\n' +
  '        restorePlantingStateEconSlice: restorePlantingStateEconSlice,\n' +
  '        initPalletValuesFromSheet: deps.initPalletValuesFromSheet,\n' +
  '        resetVfStdToSheetDefaults: deps.resetVfStdToSheetDefaults,\n' +
  '        applyVfStandardsFromSheet: deps.applyVfStandardsFromSheet,\n' +
  '        syncVfStdControls: deps.syncVfStdControls,\n' +
  '        renderGhStandardsPanel: deps.renderGhStandardsPanel, renderVfStandardsPanel: deps.renderVfStandardsPanel,\n' +
  '        renderVfStdGrid: deps.renderVfStdGrid, updatePlantingGeomUI: deps.updatePlantingGeomUI,\n' +
  '        syncGhFacilityPanels: deps.syncGhFacilityPanels, syncGhCutsUI: deps.syncGhCutsUI,\n' +
  '        syncCanopyUI: deps.syncCanopyUI, syncManualMassUI: deps.syncManualMassUI,\n' +
  '        syncMoneySliderDisplays: deps.syncMoneySliderDisplays, updatePageSub: deps.updatePageSub,\n' +
  '        updateCalcBuildBadge: deps.updateCalcBuildBadge, showError: deps.showError,\n' +
  '        monthLabel: deps.monthLabel, stageOf: deps.stageOf, holeDiameter: deps.holeDiameter,\n' +
  '        plantLayout: deps.plantLayout, plantLayoutPallet: deps.plantLayoutPallet,\n' +
  '        schemaCanopyMm: deps.schemaCanopyMm, syncSchemaCanopyLegend: deps.syncSchemaCanopyLegend,\n' +
  '        palletCellGeometry: deps.palletCellGeometry, getCellCenters: deps.getCellCenters,\n' +
  '        effectiveDLI: deps.effectiveDLI, naturalDLI: deps.naturalDLI, supplementDLI: deps.supplementDLI,\n' +
  '        effectivePhotoperiod: deps.effectivePhotoperiod, photoperiod: deps.photoperiod, eveningHours: deps.eveningHours,\n' +
  '        dliFactor: deps.dliFactor, tempFactor: deps.tempFactor, effectiveTempFactor: deps.effectiveTempFactor,\n' +
  '        boltShift: deps.boltShift, greenhouseHeatYieldLossPct: deps.greenhouseHeatYieldLossPct,\n' +
  '        massAtTotal: deps.massAtTotal, canopyAtTotal: deps.canopyAtTotal, harvestChannel: deps.harvestChannel,\n' +
  '        boltChannel: deps.boltChannel, totalAge: deps.totalAge, preChannelDays: deps.preChannelDays,\n' +
  '        effectiveCutInterval: deps.effectiveCutInterval, cutMassPerPlant: deps.cutMassPerPlant,\n' +
  '        vfMulticutStats: deps.vfMulticutStats,\n' +
  '        ICON: deps.ICON, CV_COLORS: deps.CV_COLORS, COLLAPSE_DEFAULTS: deps.COLLAPSE_DEFAULTS,\n' +
  '        CALC_BUILD: deps.CALC_BUILD, PALLET_SECTIONS: deps.PALLET_SECTIONS, VF_SECTIONS: deps.VF_SECTIONS,\n' +
  '        CULTIVARS: deps.CULTIVARS, allGhCultivars: deps.allGhCultivars, allVfCultivars: deps.allVfCultivars,\n' +
  '        allPalletCultivars: deps.allPalletCultivars, addCustomGhCultivar: deps.addCustomGhCultivar,\n' +
  '        addCustomVfCultivar: deps.addCustomVfCultivar, removeCustomCultivar: deps.removeCustomCultivar,\n' +
  '        renderEconomics: deps.renderEconomics,\n' +
  '        canopyDensityUi: canopyDensityUi, plantingGuides: plantingGuides, simpleUiMode: simpleUiMode\n' +
  '      });\n' +
  '    }\n';

const out =
  '/**\n * Snapshot, Georgy, render — поздняя инициализация.\n * DG_createPlantingLateInit(deps) → { install, getRender, … }\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingLateInit(deps) {\n' +
  '    var georgyMode;\n' +
  '    var canopyDensityUi;\n' +
  '    var simpleUiMode;\n' +
  '    var plantingGuides;\n' +
  '    var plantingHarvestYieldParams, buildPlantingSnapshot, getPlantingSnapshot;\n' +
  '    var getPlantingStateEconSlice, restorePlantingStateEconSlice, plantingCvIdMatchesLiveState;\n' +
  '    var getPlantingSnapshotForCvId, averageSnapshots, getSaladMixSnapshot;\n' +
  '    var _render;\n\n' +
  prelude +
  body +
  '\n\n' +
  renderInstall +
  '\n' +
  '    function install() {\n' +
  '      initPlantingSnapshot();\n' +
  '      initGeorgyMode();\n' +
  '      _render = createRenderModule();\n' +
  '    }\n\n' +
  '    function api() {\n' +
  '      return {\n' +
  '        install: install,\n' +
  '        getRender: function(){ return _render; },\n' +
  '        getGeorgyMode: function(){ return georgyMode; },\n' +
  '        hasEconSavedProfile: hasEconSavedProfile,\n' +
  '        plantingHarvestYieldParams: plantingHarvestYieldParams,\n' +
  '        buildPlantingSnapshot: buildPlantingSnapshot,\n' +
  '        getPlantingSnapshot: getPlantingSnapshot,\n' +
  '        getPlantingStateEconSlice: getPlantingStateEconSlice,\n' +
  '        restorePlantingStateEconSlice: restorePlantingStateEconSlice,\n' +
  '        plantingCvIdMatchesLiveState: plantingCvIdMatchesLiveState,\n' +
  '        getPlantingSnapshotForCvId: getPlantingSnapshotForCvId,\n' +
  '        averageSnapshots: averageSnapshots,\n' +
  '        getSaladMixSnapshot: getSaladMixSnapshot,\n' +
  '        canopyDensityUi: function(){ return canopyDensityUi; },\n' +
  '        plantingGuides: function(){ return plantingGuides; },\n' +
  '        simpleUiMode: function(){ return simpleUiMode; }\n' +
  '      };\n' +
  '    }\n\n' +
  '    return api();\n' +
  '  }\n\n' +
  '  global.DG_createPlantingLateInit = createPlantingLateInit;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

fs.writeFileSync(path.join(__dirname, '..', 'js', 'planting-late-init.js'), out);
try {
  new Function(out);
  console.log('planting-late-init.js', out.split('\n').length, 'lines ok');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
