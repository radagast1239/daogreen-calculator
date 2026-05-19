'use strict';
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'calculator-110x55_12.html'), 'utf8').split(/\r?\n/);

function prepBody(src) {
  var b = src;
  var prot = [];
  function p(name) {
    prot.push(name);
    b = b.split(name).join('__' + name + '__');
  }
  p('restorePlantingStateEconSlice');
  p('getPlantingStateEconSlice');
  p('getPlantingSnapshot');
  p('buildPlantingSnapshot');
  p('plantingHarvestYieldParams');
  p('getGeorgyMode');
  p('getPlantingHarvestYieldParams');
  b = b.replace(/\bstate\./g, 'deps.getState().');
  b = b.replace(/getState: function\(\)\{ return deps\.getState\(\); \}/g, 'getState: deps.getState');
  b = b.replace(/getState: function\(\)\{ return state; \}/g, 'getState: deps.getState');
  b = b.replace(/\bstate\b/g, 'deps.getState()');
  b = b.replace(/\bgeorgyMode:\s*deps\.getState\(\)/g, 'georgyMode: deps.getGeorgyMode()');
  b = b.replace(/\bgeorgyMode:\s*georgyMode\b/g, 'georgyMode: deps.getGeorgyMode()');
  b = b.replace(/\bgeorgyMode\b(?!\s*:)/g, 'deps.getGeorgyMode()');
  prot.forEach(function (name) {
    b = b.split('__' + name + '__').join(name);
  });
  return b;
}

const body = prepBody(
  html.slice(2964, 3293).join('\n') +
    '\n\n' +
    html.slice(3313, 3584).join('\n')
);

const fnNames = [];
const fnRe = /^  function ([A-Za-z_][\w]*)\(/gm;
var m;
while ((m = fnRe.exec(body))) fnNames.push(m[1]);
const fnUnique = [...new Set(fnNames)];

const varExports = [
  'clamp',
  'FACILITY_KEY',
  'APP_VIEW_KEY',
  'ICON',
  'COLLAPSE_DEFAULTS',
  'lightSync',
  'plantingSnapshots',
  'HARVEST_MONTH_DAYS',
  'CUT_INTERVAL_SLACK',
  'CUSTOM_CULTIVARS_STORAGE',
  'GH_STANDARDS_STORAGE',
  'VF_STANDARDS_STORAGE',
  'ECON_STORAGE',
  'ECON_DEFAULT_CONSUMABLES_PER_POT',
  'ECON_CONSUMABLES_PER_POT_HINT',
  'ECON_SALAD_MIX_ID',
  'ECON_SALAD_MIX_CV_IDS',
  'ECON_MONTH_DAYS',
  'ECON_MAX_CULTURES',
  'ECON_EQUIPMENT_GROUPS_FALLBACK',
  '_lightEnergy',
  '_palletRuntime',
  '_dliLight',
  '_growthCore',
  '_ghYield',
  '_calcCore',
  '_cutModel',
  '_cutIntervalUi',
  '_plantUi'
];

const assignExports = [
  'getCv',
  'isPalletView',
  'isVF',
  'isVfCvId',
  'allGhCultivars',
  'allVfCultivars',
  'isPalletCvId',
  'allPalletCultivars',
  'isPalletSheetCv',
  'getPalletCv',
  'getVfCv',
  'getActiveCv',
  'getSheetCv',
  'isSheetCv',
  'usePlantingSheet',
  'findCvById'
];

const returnLines = fnUnique
  .map(function (n) {
    return '      ' + n + ': ' + n;
  })
  .concat(
    varExports.map(function (n) {
      return '      ' + n + ': ' + n;
    })
  )
  .concat(
    assignExports.map(function (n) {
      return '      ' + n + ': ' + n;
    })
  );

const prelude =
  '    var global = deps.global;\n' +
  '    var PC = deps.PC;\n' +
  '    var NATURAL_DLI = deps.NATURAL_DLI;\n' +
  '    var CULTIVARS = deps.CULTIVARS;\n' +
  '    var VF_CULTIVARS = deps.VF_CULTIVARS;\n' +
  '    var VF_SECTIONS = deps.VF_SECTIONS;\n' +
  '    var PALLET_CULTIVARS = deps.PALLET_CULTIVARS;\n' +
  '    var PALLET_SECTIONS = deps.PALLET_SECTIONS;\n' +
  '    var MAX_WIDTH = deps.MAX_WIDTH;\n' +
  '    var CH_W = deps.CH_W;\n' +
  '    var DENSITY_MAX = deps.DENSITY_MAX;\n' +
  '    var $ = deps.$;\n' +
  '    var round = deps.round;\n' +
  '    var r1 = deps.r1;\n' +
  '    var r2 = deps.r2;\n' +
  '    var ui = deps.ui;\n' +
  '    var pt = deps.pt;\n' +
  '    var pm = deps.pm;\n' +
  '    var pr = deps.pr;\n' +
  '    var tr = deps.tr;\n' +
  '    var ptf = deps.ptf;\n' +
  '    var catalogPhrase = deps.catalogPhrase;\n' +
  '    var cvSubLine = deps.cvSubLine;\n' +
  '    var fmtNumRu = deps.fmtNumRu;\n' +
  '    var parseNumInput = deps.parseNumInput;\n' +
  '    var formatInputValue = deps.formatInputValue;\n' +
  '    var decimalsFromStep = deps.decimalsFromStep;\n' +
  '    var fmtNum = deps.fmtNum;\n' +
  '    var mergeLocaleDeps = deps.mergeLocaleDeps;\n' +
  '    var _plantLayoutApi = null;\n' +
  '    var _plantUi;\n\n';

const out =
  '/**\n * Цепочка init*: registry → calc-core.\n * DG_createPlantingRuntime(deps) → API для inline-обёрток\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingRuntime(deps) {\n' +
  prelude +
  body +
  '\n\n    return {\n' +
  returnLines.join(',\n') +
  '\n    };\n' +
  '  }\n\n' +
  '  global.DG_createPlantingRuntime = createPlantingRuntime;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

const outPath = path.join(__dirname, '..', 'js', 'planting-runtime-init.js');
fs.writeFileSync(outPath, out);

var runtimeOut = fs.readFileSync(outPath, 'utf8');
var plantUiShims =
  '  function getPlantingStd(){ return _plantUi.getPlantingStd(); }\n' +
  '  function syncCycleSlidersFromState(){ return _plantUi.syncCycleSlidersFromState(); }\n';
if (!runtimeOut.includes('function getPlantingStd(){ return _plantUi')) {
  runtimeOut = runtimeOut.replace(
    /(_plantUi = createPlantUi\(\{[\s\S]*?\}\);)\n/,
    '$1\n' + plantUiShims
  );
  fs.writeFileSync(outPath, runtimeOut);
}

const shims = fnUnique
  .map(function (n) {
    return '  function ' + n + '(){ return _rt.' + n + '.apply(_rt, arguments); }';
  })
  .concat(
    assignExports.map(function (n) {
      return '  var ' + n + ' = _rt.' + n + ';';
    })
  )
  .concat(
    varExports
      .filter(function (n) {
        return !n.startsWith('_');
      })
      .map(function (n) {
        return '  var ' + n + ' = _rt.' + n + ';';
      })
  )
  .join('\n');

fs.writeFileSync(
  path.join(__dirname, 'planting-runtime-shims.txt'),
  shims
);

try {
  new Function(out);
  console.log('planting-runtime-init.js', out.split('\n').length, 'lines,', fnUnique.length, 'functions');
} catch (e) {
  console.error('syntax:', e.message);
  process.exit(1);
}
