'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const partA = fs.readFileSync(path.join(root, 'js/planting-render-part-a.js'), 'utf8');
const partB = fs.readFileSync(path.join(root, 'js/planting-render-part-b.js'), 'utf8');
const extra = fs.readFileSync(path.join(root, 'calculator-110x55_12.html'), 'utf8').split(/\r?\n/).slice(3736, 3770);
const extraBody = extra
  .join('\n')
  .replace(/\bstate\./g, 'st().')
  .replace(/\bstate\b/g, 'st()')
  .replace(/st\(\)\(\)/g, 'st()');

function extractBody(src) {
  const m = src.match(/var lightSync = false;\s*\n([\s\S]*?)\s*return api;/);
  if (!m) throw new Error('body not found in ' + src.slice(0, 80));
  return m[1];
}

let body = extractBody(partA) + '\n' + extraBody + '\n' + extractBody(partB);
body = body.replace(/\bgeorgyMode\b/g, 'georgyModeRef()');
body = body.replace(/georgyModeRef\(\)Ref\(\)/g, 'georgyModeRef()');

const depsHelpers = `    function ui(k, vars) { return deps.ui(k, vars); }
    function pt(k) { return deps.pt(k); }
    function pm(k) { return deps.pm(k); }
    function pr(k, vars) { return deps.pr(k, vars); }
    function tr(k) { return deps.tr(k); }
    function r1(n) { return deps.r1(n); }
    function r2(n) { return deps.r2(n); }
    function round(n) { return deps.round(n); }
    function clamp(v, lo, hi) { return deps.clamp(v, lo, hi); }
    function htmlEsc(s) { return deps.htmlEsc(s); }
    function catalogPhrase(t) { return deps.catalogPhrase(t); }
    function cvSubLine(c) { return deps.cvSubLine(c); }
    function fmtNumRu(n, o) { return deps.fmtNumRu(n, o); }
    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }
    function getCv() { return deps.getCv(); }
    function getActiveCv() { return deps.getActiveCv(); }
    function getVfCv() { return deps.getVfCv(); }
    function getPalletCv() { return deps.getPalletCv(); }
    function isVF() { return deps.isVF(); }
    function isPalletView() { return deps.isPalletView(); }
    function isGreenhousePlanting() { return deps.isGreenhousePlanting(); }
    function isChannelGreenhouse() { return deps.isChannelGreenhouse(); }
    function isVfSheetCv(cv) { return deps.isVfSheetCv(cv); }
    function usePlantingSheet() { return deps.usePlantingSheet(); }
    function calc() { return deps.calc(); }
    function renderAll() { return deps.renderAll(); }
    function getPlantingStd() { return deps.getPlantingStd(); }
    function getGhUsefulAreaM2() { return deps.getGhUsefulAreaM2(); }
    function ghYieldWithMargin(b, d) { return deps.ghYieldWithMargin(b, d); }
    function ghYieldKgSqmYear(r, c) { return deps.ghYieldKgSqmYear(r, c); }
    function calcForGhYieldCompareCv(cv) { return deps.calcForGhYieldCompareCv(cv); }
    function syncGhYieldControls(r) { return deps.syncGhYieldControls(r); }
    function syncGhYieldMarginSliders() { return deps.syncGhYieldMarginSliders(); }
    function syncBioMarginVisibility() { return deps.syncBioMarginVisibility(); }
    function supportsMulticut(cv) { return deps.supportsMulticut(cv); }
    function plantingHarvestYieldParams(cv, r) { return deps.plantingHarvestYieldParams(cv, r); }
    function rangeMass(v) { return deps.rangeMass(v); }
    function rangeCanopy(v) { return deps.rangeCanopy(v); }
    function rangeDay() { return deps.rangeDay(); }
    function getPlantingStateEconSlice() { return deps.getPlantingStateEconSlice(); }
    function restorePlantingStateEconSlice(s) { return deps.restorePlantingStateEconSlice(s); }
    function initPalletValuesFromSheet(cv) { return deps.initPalletValuesFromSheet(cv); }
    function resetVfStdToSheetDefaults() { return deps.resetVfStdToSheetDefaults(); }
    function applyVfStandardsFromSheet() { return deps.applyVfStandardsFromSheet(); }
    function syncVfStdControls() { return deps.syncVfStdControls(); }
    function renderGhStandardsPanel() { return deps.renderGhStandardsPanel(); }
    function renderVfStandardsPanel() { return deps.renderVfStandardsPanel(); }
    function renderVfStdGrid() { return deps.renderVfStdGrid(); }
    function updatePlantingGeomUI() { return deps.updatePlantingGeomUI(); }
    function syncGhFacilityPanels() { return deps.syncGhFacilityPanels(); }
    function syncGhCutsUI() { return deps.syncGhCutsUI(); }
    function syncCanopyUI() { return deps.syncCanopyUI(); }
    function syncManualMassUI() { return deps.syncManualMassUI(); }
    function syncMoneySliderDisplays() { return deps.syncMoneySliderDisplays(); }
    function updatePageSub() { return deps.updatePageSub(); }
    function updateCalcBuildBadge(r) { return deps.updateCalcBuildBadge(r); }
    function showError(stage, err) { return deps.showError(stage, err); }
    function monthLabel(i) { return deps.monthLabel(i); }
    function stageOf(a, b, c, cv) { return deps.stageOf(a, b, c, cv); }
    function holeDiameter(cv) { return deps.holeDiameter(cv); }
    function plantLayout(cv) { return deps.plantLayout(cv); }
    function plantLayoutPallet(c) { return deps.plantLayoutPallet(c); }
    function schemaCanopyMm(r) { return deps.schemaCanopyMm(r); }
    function syncSchemaCanopyLegend(mm) { return deps.syncSchemaCanopyLegend(mm); }
    function palletCellGeometry(c, m) { return deps.palletCellGeometry(c, m); }
    function getCellCenters(n, l, w) { return deps.getCellCenters(n, l, w); }
    function effectiveDLI() { return deps.effectiveDLI(); }
    function naturalDLI() { return deps.naturalDLI(); }
    function supplementDLI() { return deps.supplementDLI(); }
    function effectivePhotoperiod() { return deps.effectivePhotoperiod(); }
    function photoperiod() { return deps.photoperiod(); }
    function eveningHours() { return deps.eveningHours(); }
    function dliFactor() { return deps.dliFactor(); }
    function tempFactor(cv) { return deps.tempFactor(cv); }
    function effectiveTempFactor(cv) { return deps.effectiveTempFactor(cv); }
    function boltShift(cv) { return deps.boltShift(cv); }
    function greenhouseHeatYieldLossPct(t) { return deps.greenhouseHeatYieldLossPct(t); }
    function massAtTotal(cv, t) { return deps.massAtTotal(cv, t); }
    function canopyAtTotal(cv, t) { return deps.canopyAtTotal(cv, t); }
    function harvestChannel(cv) { return deps.harvestChannel(cv); }
    function boltChannel(cv) { return deps.boltChannel(cv); }
    function totalAge(d) { return deps.totalAge(d); }
    function preChannelDays() { return deps.preChannelDays(); }
    function effectiveCutInterval() { return deps.effectiveCutInterval(); }
    function cutMassPerPlant(cv, i) { return deps.cutMassPerPlant(cv, i); }
    function vfMulticutStats(cv) { return deps.vfMulticutStats(cv); }
    var ICON = deps.ICON || {};
    var CV_COLORS = deps.CV_COLORS || {};
    var COLLAPSE_DEFAULTS = deps.COLLAPSE_DEFAULTS || {};
    var CALC_BUILD = deps.CALC_BUILD || '';
    var PALLET_SECTIONS = deps.PALLET_SECTIONS || [];
    var VF_SECTIONS = deps.VF_SECTIONS || [];
    var CULTIVARS = deps.CULTIVARS || [];
    function allGhCultivars() { return deps.allGhCultivars(); }
    function allVfCultivars() { return deps.allVfCultivars(); }
    function allPalletCultivars() { return deps.allPalletCultivars(); }
    function addCustomGhCultivar(n, t) { return deps.addCustomGhCultivar(n, t); }
    function addCustomVfCultivar(n, s, t) { return deps.addCustomVfCultivar(n, s, t); }
    function removeCustomCultivar(id) { return deps.removeCustomCultivar(id); }
    function renderEconomics() { return deps.renderEconomics(); }
`;

const fnNames = [];
body.replace(/function ([a-zA-Z0-9_]+)\(/g, (_, n) => {
  if (fnNames.indexOf(n) < 0) fnNames.push(n);
});

const out =
  '/**\n * UI render: сравнение сортов, метрики, схемы, renderAll.\n * DG_createPlantingRender(deps)\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingRender(deps) {\n' +
  '    function st() { return deps.getState(); }\n' +
  '    function $(id) { return deps.$(id); }\n' +
  depsHelpers +
  '\n' +
  body +
  '\n    return {\n' +
  fnNames.map((n) => '      ' + n + ': ' + n).join(',\n') +
  '\n    };\n  }\n\n' +
  '  global.DG_createPlantingRender = createPlantingRender;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

fs.writeFileSync(path.join(root, 'js/planting-render.js'), out);
console.log('planting-render.js', fnNames.length, 'exports');
