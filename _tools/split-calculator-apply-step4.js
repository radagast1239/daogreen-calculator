'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'calculator-110x55_12.html');
let text = fs.readFileSync(htmlPath, 'utf8');
const nl = text.includes('\r\n') ? '\r\n' : '\n';
const build = (text.match(/const CALC_BUILD = '([^']+)'/) || [])[1] || 'dev';

const tag1 = '<script src="js/planting-ui-helpers.js?v=' + build + '"></script>';
const tag2 = '<script src="js/planting-cut-interval-ui.js?v=' + build + '"></script>';
const anchor = '<script src="js/calc-error.js?v=' + build + '"></script>';

if (!text.includes('planting-ui-helpers.js')) {
  if (!text.includes(anchor)) {
    console.error('calc-error script tag not found');
    process.exit(1);
  }
  text =
    text.replace(anchor, anchor + nl + tag1 + nl + tag2);
}

function removeBlock(startMarker, endMarker) {
  const a = text.indexOf(startMarker);
  if (a < 0) return false;
  const b = text.indexOf(endMarker, a + startMarker.length);
  if (b < 0) return false;
  text = text.slice(0, a) + text.slice(b);
  return true;
}

if (text.includes('const MONTH_EN = [')) {
  if (
    !removeBlock(
      '  const MONTH_EN = [',
      '  const VF_CULTIVARS = (window.VF_SHEET'
    )
  ) {
    console.error('MONTH_EN block not removed');
    process.exit(1);
  }
  const monthShim =
    '  var _plantUi;\n' +
    '  function monthLabel(i){ return _plantUi.monthLabel(i); }\n' +
    '  function syncMoneySliderDisplays(){ return _plantUi.syncMoneySliderDisplays(); }\n' +
    '  function getPlantingStd(){ return _plantUi.getPlantingStd(); }\n' +
    '  function unlockPlantingStdForControl(idOrKey){ return _plantUi.unlockPlantingStdForControl(idOrKey); }\n' +
    '  function syncCycleSlidersFromState(){ return _plantUi.syncCycleSlidersFromState(); }\n\n';
  const vf = '  const VF_CULTIVARS = (window.VF_SHEET';
  if (!text.includes(vf)) {
    console.error('VF_CULTIVARS anchor missing after MONTH_EN removal');
    process.exit(1);
  }
  text = text.replace(vf, monthShim + vf);

  const regInit = '  initCultivarRegistry();';
  const plantUiInit =
    '  _plantUi = global.DG_createPlantingUiHelpers({\n' +
    '    getState: function(){ return state; },\n' +
    '    $: $,\n' +
    '    isPalletView: function(){ return isPalletView(); },\n' +
    '    naturalDli: NATURAL_DLI\n' +
    '  });\n';
  if (!text.includes(regInit)) {
    console.error('initCultivarRegistry not found');
    process.exit(1);
  }
  text = text.replace(regInit, regInit + '\n' + plantUiInit);
}

if (text.includes('function getPlantingStd(){ return isPalletView()')) {
  text = text.replace(
    /\r?\n  function getPlantingStd\(\)\{ return isPalletView\(\) \? state\.palletStd : state\.vfStd; \}\r?\n  function unlockPlantingStdForControl[\s\S]*?  function syncCycleSlidersFromState\(\)\{[\s\S]*?    \}\);\r?\n  \}\r?\n\r?\n/,
    '\n'
  );
}

if (text.includes('const VF_STD_FIELDS = [')) {
  if (
    !removeBlock(
      '  const VF_STD_FIELDS = [',
      '  function getVfFieldStandard(cv, key){'
    )
  ) {
    console.error('VF_STD_FIELDS block not removed');
    process.exit(1);
  }
  const cutInit =
    '  if (!window.DG_CUT) window.DG_CUT = { HARVEST_MONTH_DAYS: 30.5, CUT_INTERVAL_SLACK: 6 };\n' +
    '  const HARVEST_MONTH_DAYS = window.DG_CUT.HARVEST_MONTH_DAYS;\n' +
    '  const CUT_INTERVAL_SLACK = window.DG_CUT.CUT_INTERVAL_SLACK;\n' +
    '  var parseNumsFromStr, vfCutIntervalFromCv, cutIntervalRange, cutIntervalMods, applyCutIntervalHarvestMods;\n' +
    '  var supportsMulticut, effectiveCutInterval, cutMassPerPlant, vfMulticutStats, getMulticutYieldPerPlant;\n\n' +
    '  const VF_STD_FIELDS = global.DG_VF_STD_FIELDS || [];\n' +
    '  var _cutIntervalUi = global.DG_createPlantingCutIntervalUi({\n' +
    '    getState: function(){ return state; },\n' +
    '    $: $,\n' +
    '    getActiveCv: function(){ return getActiveCv(); },\n' +
    '    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },\n' +
    '    cutIntervalMods: function(cv){ return cutIntervalMods(cv); },\n' +
    '    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },\n' +
    '    pm: pm,\n' +
    '    ui: ui\n' +
    '  });\n' +
    '  function syncCutIntervalSlider(cv){ return _cutIntervalUi.syncCutIntervalSlider(cv); }\n\n';
  const anchorFn = '  function getVfFieldStandard(cv, key){';
  if (!text.includes(anchorFn)) {
    console.error('getVfFieldStandard anchor missing');
    process.exit(1);
  }
  text = text.replace(anchorFn, cutInit + anchorFn);
}

if (text.includes('function syncCutIntervalSlider(cv){\n    const inp = $(\'cutInterval\')')) {
  text = text.replace(
    /\r?\n  function syncCutIntervalSlider\(cv\)\{[\s\S]*?    hint\.innerHTML = txt;\r?\n  \}\r?\n\r?\n/,
    '\n'
  );
}

fs.writeFileSync(htmlPath, text, 'utf8');
console.log('step4 applied');
