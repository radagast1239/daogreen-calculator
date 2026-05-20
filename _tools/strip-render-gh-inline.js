'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const startGh = t.indexOf('  const GH_USEFUL_AREA_KEY =');
const endGh = t.indexOf('  const ICON = {');
const startRender = t.indexOf('  function stageLabel(st){');
const endRender = t.indexOf('  /* ---- Event handlers ---- */');
const afterGeorgy = t.indexOf('  initGeorgyMode();');

if (startGh < 0 || endGh < 0 || startRender < 0 || endRender < 0 || afterGeorgy < 0) {
  console.error('markers', startGh, endGh, startRender, endRender, afterGeorgy);
  process.exit(1);
}

const shimGh =
  '  var _ghYield;\n' +
  '  function loadGhUsefulArea(){ return _ghYield.loadGhUsefulArea(); }\n' +
  '  function saveGhUsefulArea(){ return _ghYield.saveGhUsefulArea(); }\n' +
  '  function getGhUsefulAreaM2(){ return _ghYield.getGhUsefulAreaM2(); }\n' +
  '  function ghYieldWithMargin(base, digits){ return _ghYield.ghYieldWithMargin(base, digits); }\n' +
  '  function ghYieldKgSqmYear(rc, cv){ return _ghYield.ghYieldKgSqmYear(rc, cv); }\n' +
  '  function computeGhYieldTotals(r){ return _ghYield.computeGhYieldTotals(r); }\n' +
  '  function syncGhYieldMarginSliders(){ return _ghYield.syncGhYieldMarginSliders(); }\n' +
  '  function syncBioMarginVisibility(){ return _ghYield.syncBioMarginVisibility(); }\n' +
  '  function updateGhYieldPanelCopy(r){ return _ghYield.updateGhYieldPanelCopy(r); }\n' +
  '  function syncGhYieldControls(r){ return _ghYield.syncGhYieldControls(r); }\n' +
  '\n';

const shimRender =
  '  var _render;\n' +
  '  function renderAll(){ return _render.renderAll(); }\n' +
  '  function renderCultivars(){ return _render.renderCultivars(); }\n' +
  '  function renderMonths(){ return _render.renderMonths(); }\n' +
  '  function renderCvCompare(){ return _render.renderCvCompare(); }\n' +
  '  function initCollapseBlocks(){ return _render.initCollapseBlocks(); }\n' +
  '  function setFacility(mode){ return _render.setFacility(mode); }\n' +
  '  function withRange(v, hw, u){ return _render.withRange(v, hw, u); }\n' +
  '  function rangeText(v, hw, d){ return _render.rangeText(v, hw, d); }\n' +
  '  function calcForGhYieldCompareCv(cv){ return _render.calcForGhYieldCompareCv(cv); }\n' +
  '  function renderGhYieldTotals(r){ return _render.renderGhYieldTotals(r); }\n' +
  '\n';

const initGh =
  '\n  _ghYield = global.DG_createPlantingGhYield({\n' +
  '    getState: function(){ return state; },\n' +
  '    $: $,\n' +
  '    ui: ui, r1: r1, r2: r2, clamp: clamp, getCv: getCv,\n' +
  '    isVF: isVF, isPalletView: isPalletView,\n' +
  '    isGreenhousePlanting: isGreenhousePlanting, isChannelGreenhouse: isChannelGreenhouse,\n' +
  '    supportsMulticut: supportsMulticut,\n' +
  '    plantingHarvestYieldParams: function(cv, r){ return typeof plantingHarvestYieldParams === "function" ? plantingHarvestYieldParams(cv, r) : null; }\n' +
  '  });\n';

const initRender =
  '\n  _render = global.DG_createPlantingRender({\n' +
  '    getState: function(){ return state; },\n' +
  '    $: $,\n' +
  '    getState: function(){ return state; },\n' +
  '    $: $,\n' +
  '    ui: ui, pt: pt, pm: pm, pr: pr, tr: tr,\n' +
  '    fmtNumRu: fmtNumRu, catalogPhrase: catalogPhrase, cvSubLine: cvSubLine,\n' +
  '    r1: r1, r2: r2, round: round, clamp: clamp, htmlEsc: htmlEsc,\n' +
  '    getGeorgyMode: function(){ return georgyMode; }, georgyMode: georgyMode,\n' +
  '    calc: calc, renderAll: function(){ return renderAll(); },\n' +
  '    getCv: getCv, getActiveCv: getActiveCv, getVfCv: getVfCv, getPalletCv: getPalletCv,\n' +
  '    isVF: isVF, isPalletView: isPalletView, isGreenhousePlanting: isGreenhousePlanting,\n' +
  '    isChannelGreenhouse: isChannelGreenhouse, isVfSheetCv: isVfSheetCv,\n' +
  '    usePlantingSheet: usePlantingSheet, getPlantingStd: getPlantingStd,\n' +
  '    getGhUsefulAreaM2: getGhUsefulAreaM2, ghYieldWithMargin: ghYieldWithMargin,\n' +
  '    ghYieldKgSqmYear: ghYieldKgSqmYear, calcForGhYieldCompareCv: calcForGhYieldCompareCv,\n' +
  '    syncGhYieldControls: syncGhYieldControls, syncGhYieldMarginSliders: syncGhYieldMarginSliders,\n' +
  '    syncBioMarginVisibility: syncBioMarginVisibility,\n' +
  '    supportsMulticut: supportsMulticut,\n' +
  '    plantingHarvestYieldParams: function(cv, r){ return plantingHarvestYieldParams(cv, r); },\n' +
  '    rangeMass: rangeMass, rangeCanopy: rangeCanopy, rangeDay: rangeDay,\n' +
  '    getPlantingStateEconSlice: getPlantingStateEconSlice,\n' +
  '    restorePlantingStateEconSlice: restorePlantingStateEconSlice,\n' +
  '    initPalletValuesFromSheet: initPalletValuesFromSheet,\n' +
  '    resetVfStdToSheetDefaults: resetVfStdToSheetDefaults,\n' +
  '    applyVfStandardsFromSheet: applyVfStandardsFromSheet,\n' +
  '    syncVfStdControls: syncVfStdControls,\n' +
  '    renderGhStandardsPanel: renderGhStandardsPanel, renderVfStandardsPanel: renderVfStandardsPanel,\n' +
  '    renderVfStdGrid: renderVfStdGrid, updatePlantingGeomUI: updatePlantingGeomUI,\n' +
  '    syncGhFacilityPanels: syncGhFacilityPanels, syncGhCutsUI: syncGhCutsUI,\n' +
  '    syncCanopyUI: syncCanopyUI, syncManualMassUI: syncManualMassUI,\n' +
  '    syncMoneySliderDisplays: syncMoneySliderDisplays, updatePageSub: updatePageSub,\n' +
  '    updateCalcBuildBadge: updateCalcBuildBadge, showError: showError,\n' +
  '    monthLabel: monthLabel, stageOf: stageOf, holeDiameter: holeDiameter,\n' +
  '    plantLayout: plantLayout, plantLayoutPallet: plantLayoutPallet,\n' +
  '    schemaCanopyMm: schemaCanopyMm, syncSchemaCanopyLegend: syncSchemaCanopyLegend,\n' +
  '    palletCellGeometry: palletCellGeometry, getCellCenters: getCellCenters,\n' +
  '    effectiveDLI: effectiveDLI, naturalDLI: naturalDLI, supplementDLI: supplementDLI,\n' +
  '    effectivePhotoperiod: effectivePhotoperiod, photoperiod: photoperiod, eveningHours: eveningHours,\n' +
  '    dliFactor: dliFactor, tempFactor: tempFactor, effectiveTempFactor: effectiveTempFactor,\n' +
  '    boltShift: boltShift, greenhouseHeatYieldLossPct: greenhouseHeatYieldLossPct,\n' +
  '    massAtTotal: massAtTotal, canopyAtTotal: canopyAtTotal, harvestChannel: harvestChannel,\n' +
  '    boltChannel: boltChannel, totalAge: totalAge, preChannelDays: preChannelDays,\n' +
  '    effectiveCutInterval: effectiveCutInterval, cutMassPerPlant: cutMassPerPlant,\n' +
  '    vfMulticutStats: vfMulticutStats,\n' +
  '    ICON: ICON, CV_COLORS: CV_COLORS, COLLAPSE_DEFAULTS: COLLAPSE_DEFAULTS, CALC_BUILD: CALC_BUILD,\n' +
  '    PALLET_SECTIONS: PALLET_SECTIONS, VF_SECTIONS: VF_SECTIONS, CULTIVARS: CULTIVARS,\n' +
  '    allGhCultivars: allGhCultivars, allVfCultivars: allVfCultivars, allPalletCultivars: allPalletCultivars,\n' +
  '    addCustomGhCultivar: addCustomGhCultivar, addCustomVfCultivar: addCustomVfCultivar,\n' +
  '    removeCustomCultivar: removeCustomCultivar,\n' +
  '    renderEconomics: function(){ return typeof renderEconomics === "function" ? renderEconomics() : undefined; },\n' +
  '    canopyDensityUi: canopyDensityUi, plantingGuides: plantingGuides, simpleUiMode: simpleUiMode\n' +
  '  });\n';

const geomUiVar = t.indexOf('  var _geomUi;');
if (geomUiVar < 0) {
  console.error('_geomUi marker missing');
  process.exit(1);
}

t = t.slice(0, startGh) + shimGh + t.slice(endGh);
t = t.replace('  const ICON = {', shimRender + '  const ICON = {');

const sr2 = t.indexOf('  function stageLabel(st){');
const er2 = t.indexOf('  /* ---- Event handlers ---- */');
t = t.slice(0, sr2) + t.slice(er2);

const ag = t.indexOf('  initGeorgyMode();');
if (ag < 0) {
  console.error('initGeorgyMode missing');
  process.exit(1);
}
t = t.slice(0, geomUiVar) + initGh + t.slice(geomUiVar);
const insertAt = ag + '  initGeorgyMode();'.length;
t = t.slice(0, insertAt) + initRender + t.slice(insertAt);

const geomTag = '<script src="js/planting-geom-ui.js?v=2026-05-19-p71-audit-fixes"></script>';
const geomTagNew =
  '<script src="js/planting-gh-yield.js?v=2026-05-19-p71-audit-fixes"></script>\r\n' +
  geomTag +
  '\r\n<script src="js/planting-render.js?v=2026-05-19-p71-audit-fixes"></script>';
if (!t.includes('planting-gh-yield.js')) {
  if (!t.includes(geomTag)) {
    console.error('script anchor missing');
    process.exit(1);
  }
  t = t.replace(geomTag, geomTagNew);
}

fs.writeFileSync(p, t);
console.log('strip-render-gh-inline ok');
