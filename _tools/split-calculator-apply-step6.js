'use strict';
const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let text = fs.readFileSync(htmlPath, 'utf8');
const nl = text.includes('\r\n') ? '\r\n' : '\n';
const build = (text.match(/const CALC_BUILD = '([^']+)'/) || [])[1] || 'dev';

const tag = '<script src="js/planting-vf-standards.js?v=' + build + '"></script>';
const anchor = '<script src="js/planting-custom-cv.js?v=' + build + '"></script>';
if (!text.includes('planting-vf-standards.js')) {
  text = text.replace(anchor, anchor + nl + tag);
}

const start = '  function getVfFieldStandard(cv, key){';
const end = '  function syncPalletCellButtons(){';
const a = text.indexOf(start);
const b = text.indexOf(end, a);
if (a >= 0 && b > a) {
  const shim =
    '  var _vfStandards;\n' +
    '  function getVfFieldStandard(cv, key){ return _vfStandards.getVfFieldStandard(cv, key); }\n' +
    '  function getVfFieldCurrent(key){ return _vfStandards.getVfFieldCurrent(key); }\n' +
    '  function isVfFieldAtStandard(key, cv){ return _vfStandards.isVfFieldAtStandard(key, cv); }\n' +
    '  function applyVfStandardField(key){ return _vfStandards.applyVfStandardField(key); }\n' +
    '  function syncVegPeriodTotal(){ return _vfStandards.syncVegPeriodTotal(); }\n' +
    '  function syncVfStdBadges(){ return _vfStandards.syncVfStdBadges(); }\n' +
    '  function bindVfStdBadges(){ return _vfStandards.bindVfStdBadges(); }\n' +
    '  function isVfSheetCv(cv){ return _vfStandards.isVfSheetCv(cv); }\n' +
    '  function preChannelDays(){ return _vfStandards.preChannelDays(); }\n' +
    '  function vfEffectiveGermination(cv){ return _vfStandards.vfEffectiveGermination(cv); }\n' +
    '  function vfEffectiveDay(cv){ return _vfStandards.vfEffectiveDay(cv); }\n' +
    '  function vfEffectiveDensity(cv){ return _vfStandards.vfEffectiveDensity(cv); }\n' +
    '  function vfEffectiveMass(cv, massAuto){ return _vfStandards.vfEffectiveMass(cv, massAuto); }\n' +
    '  function syncCutMassUI(){ return _vfStandards.syncCutMassUI(); }\n' +
    '  function syncMulticutDetailUI(){ return _vfStandards.syncMulticutDetailUI(); }\n' +
    '  function applyCutStandardsFromSheet(cv){ return _vfStandards.applyCutStandardsFromSheet(cv); }\n' +
    '  function syncVfStdControls(){ return _vfStandards.syncVfStdControls(); }\n' +
    '  function updateVfCvHint(){ return _vfStandards.updateVfCvHint(); }\n' +
    '  function renderVfStdGrid(){ return _vfStandards.renderVfStdGrid(); }\n' +
    '  function resetVfStdToSheetDefaults(){ return _vfStandards.resetVfStdToSheetDefaults(); }\n' +
    '  function applyVfStandardsFromSheet(cv){ return _vfStandards.applyVfStandardsFromSheet(cv); }\n' +
    '  function calcFromVfSheet(cv){ return _vfStandards.calcFromVfSheet(cv); }\n\n';
  text = text.slice(0, a) + shim + text.slice(b);
}

const initNeedle = '  });\n\n  function manualHarvestMass(massAuto){';
const initBlock =
  '  });\n\n' +
  '  _vfStandards = global.DG_createPlantingVfStandards({\n' +
  '    getState: function(){ return state; },\n' +
  '    $: $,\n' +
  '    constants: PC,\n' +
  '    MAX_WIDTH: MAX_WIDTH,\n' +
  '    CH_W: CH_W,\n' +
  '    vfStdFields: VF_STD_FIELDS,\n' +
  '    georgyMode: georgyMode,\n' +
  '    ui: ui,\n' +
  '    pt: pt,\n' +
  '    pm: pm,\n' +
  '    r1: r1,\n' +
  '    isSheetCv: isSheetCv,\n' +
  '    isPalletSheetCv: isPalletSheetCv,\n' +
  '    getSheetCv: getSheetCv,\n' +
  '    getPlantingStd: getPlantingStd,\n' +
  '    usePlantingSheet: usePlantingSheet,\n' +
  '    isPalletView: isPalletView,\n' +
  '    isVF: isVF,\n' +
  '    getVfCv: getVfCv,\n' +
  '    getActiveCv: getActiveCv,\n' +
  '    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },\n' +
  '    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },\n' +
  '    vfCutIntervalFromCv: function(cv){ return vfCutIntervalFromCv(cv); },\n' +
  '    syncPalletCellButtons: syncPalletCellButtons,\n' +
  '    syncCutIntervalSlider: syncCutIntervalSlider,\n' +
  '    syncManualMassUI: syncManualMassUI,\n' +
  '    modelCanopyFromMass: modelCanopyFromMass,\n' +
  '    renderAll: renderAll,\n' +
  '    applyPalletStandardsFromSheet: applyPalletStandardsFromSheet,\n' +
  '    manualHarvestMass: manualHarvestMass,\n' +
  '    supportsMulticut: function(cv){ return supportsMulticut(cv); },\n' +
  '    vfMulticutStats: function(cv){ return vfMulticutStats(cv); },\n' +
  '    catalogPhrase: catalogPhrase,\n' +
  '    plantLayout: plantLayout,\n' +
  '    massAtTotal: massAtTotal,\n' +
  '    effectiveCa: effectiveCa,\n' +
  '    crowdingFactor: crowdingFactor,\n' +
  '    harvestCanopy: harvestCanopy,\n' +
  '    applyCutIntervalHarvestMods: applyCutIntervalHarvestMods,\n' +
  '    rgrAtTotal: rgrAtTotal,\n' +
  '    boltChannel: boltChannel,\n' +
  '    stageOf: stageOf,\n' +
  '    holeDiameter: holeDiameter\n' +
  '  });\n\n' +
  '  function manualHarvestMass(massAuto){';

if (!text.includes('_vfStandards = global.DG_createPlantingVfStandards')) {
  if (!text.includes(initNeedle)) {
    console.error('pallet init anchor not found');
    process.exit(1);
  }
  text = text.replace(initNeedle, initBlock);
}

fs.writeFileSync(htmlPath, text, 'utf8');
console.log('step6 applied');
