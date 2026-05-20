'use strict';
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let text = fs.readFileSync(htmlPath, 'utf8');
const nl = text.includes('\r\n') ? '\r\n' : '\n';
const build = (text.match(/const CALC_BUILD = '([^']+)'/) || [])[1] || 'dev';

const tag1 = '<script src="js/planting-pallet-sheet.js?v=' + build + '"></script>';
const tag2 = '<script src="js/planting-custom-cv.js?v=' + build + '"></script>';
const anchor = '<script src="js/planting-cut-interval-ui.js?v=' + build + '"></script>';

if (!text.includes('planting-pallet-sheet.js')) {
  if (!text.includes(anchor)) {
    console.error('planting-cut-interval-ui tag not found');
    process.exit(1);
  }
  text = text.replace(anchor, anchor + nl + tag1 + nl + tag2);
}

function removeBetween(start, end) {
  const a = text.indexOf(start);
  if (a < 0) return false;
  const b = text.indexOf(end, a + start.length);
  if (b < 0) return false;
  text = text.slice(0, a) + text.slice(b);
  return true;
}

if (text.includes('function initPalletValuesFromSheet(cv){')) {
  if (
    !removeBetween(
      '  /** Подставить значения сорта в ползунки без блокировки «стандарт» */',
      '  function newCustomCvId(prefix){'
    )
  ) {
    console.error('pallet block not removed');
    process.exit(1);
  }
  const palletShim =
    '  var _palletSheet;\n' +
    '  function initPalletValuesFromSheet(cv){ return _palletSheet.initPalletValuesFromSheet(cv); }\n' +
    '  function palletEffectiveGermination(cv){ return _palletSheet.palletEffectiveGermination(cv); }\n' +
    '  function palletEffectiveDay(cv){ return _palletSheet.palletEffectiveDay(cv); }\n' +
    '  function palletEffectiveDensity(cv){ return _palletSheet.palletEffectiveDensity(cv); }\n' +
    '  function palletEffectiveMass(cv, massAuto){ return _palletSheet.palletEffectiveMass(cv, massAuto); }\n' +
    '  function resetPalletStdToSheetDefaults(){ return _palletSheet.resetPalletStdToSheetDefaults(); }\n' +
    '  function applyPalletStandardsToStateOnly(cv, opts){ return _palletSheet.applyPalletStandardsToStateOnly(cv, opts); }\n' +
    '  function applyPalletStandardsFromSheet(cv, opts){ return _palletSheet.applyPalletStandardsFromSheet(cv, opts); }\n' +
    '  function effectivePalletHoleCount(){ return _palletSheet.effectivePalletHoleCount(); }\n' +
    '  function palletCellsForLayout(cv){ return _palletSheet.palletCellsForLayout(cv); }\n' +
    '  function calcFromPalletSheet(cv){ return _palletSheet.calcFromPalletSheet(cv); }\n\n';
  const anchorCv = '  function newCustomCvId(prefix){';
  if (!text.includes(anchorCv)) {
    console.error('newCustomCvId anchor missing');
    process.exit(1);
  }
  text = text.replace(anchorCv, palletShim + anchorCv);
}

if (text.includes('function newCustomCvId(prefix){')) {
  if (
    !removeBetween(
      '  function newCustomCvId(prefix){',
      '  if (!window.DG_CUT) window.DG_CUT'
    )
  ) {
    console.error('custom cv block not removed');
    process.exit(1);
  }
  const customShim =
    '  const CUSTOM_CULTIVARS_STORAGE = global.DG_CUSTOM_CULTIVARS_STORAGE || \'calc-custom-cultivars\';\n' +
    '  var _customCv;\n' +
    '  function loadCustomCultivarsStore(){ return _customCv.loadCustomCultivarsStore(); }\n' +
    '  function saveCustomCultivarsStore(){ return _customCv.saveCustomCultivarsStore(); }\n' +
    '  function blankGhCultivarTemplate(){ return _customCv.blankGhCultivarTemplate(); }\n' +
    '  function blankVfCultivarTemplate(section){ return _customCv.blankVfCultivarTemplate(section); }\n' +
    '  function addCustomGhCultivar(name, templateCv){ return _customCv.addCustomGhCultivar(name, templateCv); }\n' +
    '  function addCustomVfCultivar(name, section, templateCv){ return _customCv.addCustomVfCultivar(name, section, templateCv); }\n' +
    '  function removeCustomCultivar(id){ return _customCv.removeCustomCultivar(id); }\n\n';
  text = text.replace('  if (!window.DG_CUT) window.DG_CUT', customShim + '  if (!window.DG_CUT) window.DG_CUT');
}

if (!text.includes('_palletSheet = global.DG_createPlantingPalletSheet')) {
  const plantPallet =
    '  function plantLayoutPallet(cellsOverride){\n' +
    '    if (!_plantLayoutApi) initPlantingLayoutApi();\n' +
    '    return _plantLayoutApi.plantLayoutPallet(cellsOverride);\n' +
    '  }\n\n';
  const initBlock =
    '  _palletSheet = global.DG_createPlantingPalletSheet({\n' +
    '    getState: function(){ return state; },\n' +
    '    $: $,\n' +
    '    constants: PC,\n' +
    '    getPalletCv: getPalletCv,\n' +
    '    isPalletView: isPalletView,\n' +
    '    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },\n' +
    '    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },\n' +
    '    syncCycleSlidersFromState: syncCycleSlidersFromState,\n' +
    '    syncPalletCellButtons: syncPalletCellButtons,\n' +
    '    syncCutIntervalSlider: syncCutIntervalSlider,\n' +
    '    syncManualMassUI: syncManualMassUI,\n' +
    '    syncCanopyUI: syncCanopyUI,\n' +
    '    syncMulticutDetailUI: syncMulticutDetailUI,\n' +
    '    manualHarvestMass: manualHarvestMass,\n' +
    '    modelCanopyFromMass: modelCanopyFromMass,\n' +
    '    applyCutStandardsFromSheet: applyCutStandardsFromSheet,\n' +
    '    syncVfStdControls: syncVfStdControls,\n' +
    '    renderVfStdGrid: renderVfStdGrid,\n' +
    '    palletMountMode: palletMountMode,\n' +
    '    plantLayoutPallet: plantLayoutPallet,\n' +
    '    massAtTotal: massAtTotal,\n' +
    '    effectiveCa: effectiveCa,\n' +
    '    crowdingFactor: crowdingFactor,\n' +
    '    harvestCanopy: harvestCanopy,\n' +
    '    applyCutIntervalHarvestMods: applyCutIntervalHarvestMods,\n' +
    '    rgrAtTotal: rgrAtTotal,\n' +
    '    harvestChannel: harvestChannel,\n' +
    '    boltChannel: boltChannel,\n' +
    '    stageOf: stageOf\n' +
    '  });\n\n';
  if (!text.includes(plantPallet)) {
    console.error('plantLayoutPallet block not found');
    process.exit(1);
  }
  text = text.replace(plantPallet, plantPallet + initBlock);
}

if (!text.includes('_customCv = global.DG_createPlantingCustomCv')) {
  const vfStdEnd = '  function getVfCvStandards(cv){';
  const customInit =
    '  _customCv = global.DG_createPlantingCustomCv({\n' +
    '    getState: function(){ return state; },\n' +
    '    pt: pt,\n' +
    '    getCv: getCv,\n' +
    '    getVfCv: getVfCv,\n' +
    '    CULTIVARS: CULTIVARS,\n' +
    '    VF_CULTIVARS: VF_CULTIVARS,\n' +
    '    buildDefaultGhStandards: buildDefaultGhStandards,\n' +
    '    buildDefaultVfStandards: buildDefaultVfStandards\n' +
    '  });\n\n';
  if (!text.includes(vfStdEnd)) {
    console.error('getVfCvStandards anchor missing');
    process.exit(1);
  }
  text = text.replace(vfStdEnd, customInit + vfStdEnd);
}

const oldStorage = "  const CUSTOM_CULTIVARS_STORAGE = 'calc-custom-cultivars';\n\n";
if (text.includes(oldStorage)) {
  text = text.replace(oldStorage, '');
}

fs.writeFileSync(htmlPath, text, 'utf8');
console.log('step5 applied');
