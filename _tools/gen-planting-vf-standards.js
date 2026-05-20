'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const lines = fs.readFileSync(path.join(root, 'calculator-110x55_12.html'), 'utf8').split(/\r?\n/);
let body = lines.slice(3082, 3506).join('\n');
body = body.split('\n').map((l) => l.replace(/^  /, '')).join('\n');

const header =
  '/**\n' +
  ' * VF / каналы: стандарты сорта, бейджи, calcFromVfSheet.\n' +
  ' * DG_createPlantingVfStandards(deps) — из основного калькулятора.\n' +
  ' */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingVfStandards(deps) {\n' +
  '    function st() { return deps.getState(); }\n' +
  '    function densityMax(cv) {\n' +
  '      var C = deps.constants || global.DG_PLANTING_CONSTANTS || {};\n' +
  '      var dMax = C.DENSITY_MAX || 220;\n' +
  '      return Math.max(dMax, Math.ceil(cv.density * 1.2));\n' +
  '    }\n' +
  '    var VF_STD_FIELDS = deps.vfStdFields || global.DG_VF_STD_FIELDS || [];\n\n';

const footer =
  '\n    return {\n' +
  '      getVfFieldStandard: getVfFieldStandard,\n' +
  '      getVfFieldCurrent: getVfFieldCurrent,\n' +
  '      isVfFieldAtStandard: isVfFieldAtStandard,\n' +
  '      applyVfStandardField: applyVfStandardField,\n' +
  '      syncVegPeriodTotal: syncVegPeriodTotal,\n' +
  '      syncVfStdBadges: syncVfStdBadges,\n' +
  '      bindVfStdBadges: bindVfStdBadges,\n' +
  '      isVfSheetCv: isVfSheetCv,\n' +
  '      preChannelDays: preChannelDays,\n' +
  '      vfEffectiveGermination: vfEffectiveGermination,\n' +
  '      vfEffectiveDay: vfEffectiveDay,\n' +
  '      vfEffectiveDensity: vfEffectiveDensity,\n' +
  '      vfEffectiveMass: vfEffectiveMass,\n' +
  '      syncCutMassUI: syncCutMassUI,\n' +
  '      syncMulticutDetailUI: syncMulticutDetailUI,\n' +
  '      applyCutStandardsFromSheet: applyCutStandardsFromSheet,\n' +
  '      syncVfStdControls: syncVfStdControls,\n' +
  '      updateVfCvHint: updateVfCvHint,\n' +
  '      renderVfStdGrid: renderVfStdGrid,\n' +
  '      resetVfStdToSheetDefaults: resetVfStdToSheetDefaults,\n' +
  '      applyVfStandardsFromSheet: applyVfStandardsFromSheet,\n' +
  '      calcFromVfSheet: calcFromVfSheet\n' +
  '    };\n' +
  '  }\n\n' +
  '  global.DG_createPlantingVfStandards = createPlantingVfStandards;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

let b = body;
b = b.replace(/\bstate\./g, 'stateRef().');
b = b.replace(/\$\(/g, 'deps.$(');

const depFns = [
  'isSheetCv',
  'isPalletSheetCv',
  'getSheetCv',
  'getPlantingStd',
  'usePlantingSheet',
  'isPalletView',
  'isVF',
  'getVfCv',
  'getActiveCv',
  'clamp',
  'cutIntervalRange',
  'vfCutIntervalFromCv',
  'syncPalletCellButtons',
  'syncCutIntervalSlider',
  'syncManualMassUI',
  'modelCanopyFromMass',
  'syncCutMassUI',
  'renderAll',
  'applyPalletStandardsFromSheet',
  'manualHarvestMass',
  'supportsMulticut',
  'vfMulticutStats',
  'catalogPhrase',
  'plantLayout',
  'massAtTotal',
  'effectiveCa',
  'crowdingFactor',
  'harvestCanopy',
  'applyCutIntervalHarvestMods',
  'rgrAtTotal',
  'boltChannel',
  'stageOf',
  'holeDiameter'
];
depFns.forEach((fn) => {
  b = b.replace(new RegExp('([^\\w.])' + fn + '\\(', 'g'), '$1deps.' + fn + '(');
});
b = b.replace(/deps\.deps\./g, 'deps.');

['georgyMode', 'ui', 'pt', 'pm', 'r1'].forEach((n) => {
  b = b.replace(new RegExp('([^\\w.])' + n + '\\(', 'g'), '$1deps.' + n + '(');
  b = b.replace(new RegExp('&& ' + n + '\\.', 'g'), '&& deps.' + n + '.');
});

b = b.replace(/Math\.max\(DENSITY_MAX, Math\.ceil\(cv\.density \* 1\.2\)\)/g, 'densityMax(cv)');
b = b.replace(/\bMAX_WIDTH\b/g, 'deps.MAX_WIDTH');
b = b.replace(/\bCH_W\b/g, 'deps.CH_W');

b =
  '    function stateRef() { return st(); }\n' +
  b.replace(
    /function calcFromVfSheet\(cv\)\{/,
    'function calcFromVfSheet(cv){\n    var state = st();'
  );

b = b.replace(/stateRef\(\)\.density = savedDensity/g, 'state.density = savedDensity');
b = b.replace(/stateRef\(\)\.germination = savedGerm/g, 'state.germination = savedGerm');
b = b.replace(/stateRef\(\)\.nursery = savedNursery/g, 'state.nursery = savedNursery');
b = b.replace(/stateRef\(\)\.day = savedDay/g, 'state.day = savedDay');
b = b.replace(/const nursery = stateRef\(\)\.nursery/g, 'const nursery = state.nursery');
b = b.replace(/stateRef\(\)\.density = rhoT/g, 'state.density = rhoT');
b = b.replace(/stateRef\(\)\.germination = germ/g, 'state.germination = germ');
b = b.replace(/stateRef\(\)\.day = t_ch/g, 'state.day = t_ch');

const withState = [
  'getVfFieldCurrent',
  'isVfFieldAtStandard',
  'applyVfStandardField',
  'syncVegPeriodTotal',
  'preChannelDays',
  'vfEffectiveGermination',
  'vfEffectiveDay',
  'vfEffectiveDensity',
  'vfEffectiveMass',
  'syncCutMassUI',
  'syncMulticutDetailUI',
  'applyCutStandardsFromSheet',
  'resetVfStdToSheetDefaults',
  'applyVfStandardsFromSheet'
];
withState.forEach((fn) => {
  b = b.replace(new RegExp('function ' + fn + '\\('), 'function ' + fn + '(\n    var state = st();\n    ');
  b = b.replace('function ' + fn + '(\n    var state = st();\n    key)', 'function ' + fn + '(key)');
  b = b.replace('function ' + fn + '(\n    var state = st();\n    cv)', 'function ' + fn + '(cv');
  b = b.replace('function ' + fn + '(\n    var state = st();\n    )', 'function ' + fn + '()');
});

fs.writeFileSync(path.join(root, 'js', 'planting-vf-standards.js'), header + b + footer, 'utf8');
console.log('ok');
