'use strict';
/** Полный smoke: DG_createPlantingRuntime(deps) без браузера — ловит ReferenceError при init */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const buildM = fs.readFileSync(path.join(root, 'calculator-110x55_12.html'), 'utf8').match(/const CALC_BUILD = '([^']+)'/);
const build = buildM ? buildM[1] : 'unknown';

function load(sandbox, rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox);
}

const state = {
  facility: 'greenhouse',
  germination: 5,
  nursery: 14,
  day: 20,
  density: 80,
  cutInterval: 12,
  palletCells: 54,
  palletMount: 'cassette',
  palletStd: {},
  vfStd: {},
  month: 5,
  lighting: true,
  targetDli: 17,
  targetPhotoperiod: 16,
  temp: 22,
  errorPct: 10
};

const PC = {
  DENSITY_MAX: 220,
  CH_W: 110,
  MAX_WIDTH: 2000,
  CASSETTES_PER_PALLET: 3,
  CASSETTE_L_MM: 400,
  CASSETTE_W_MM: 600,
  PALLET_L_MM: 1300,
  PALLET_W_MM: 650,
  PALLET_TIER_ZONE_MM: 400,
  PALLET_L_M: 1.3,
  PALLET_W_M: 0.65,
  NATURAL_DLI: [{ m: 'май', dli: 22, ph: 14.5 }]
};

const sandbox = {
  window: {},
  global: {},
  console: console,
  document: { getElementById: function () { return null; } },
  DG_PLANTING_CONSTANTS: PC,
  DG_CUT: { HARVEST_MONTH_DAYS: 30.5, CUT_INTERVAL_SLACK: 6 },
  DG_GH_CULTIVARS: [],
  DG_GH_CV_COLORS: {},
  DG_VF_STD_FIELDS: [],
  DG_COLLAPSE_DEFAULTS: {},
  DG_GH_STANDARDS_STORAGE: 't-gh',
  DG_VF_STANDARDS_STORAGE: 't-vf',
  DG_CUSTOM_CULTIVARS_STORAGE: 't-cv',
  localStorage: { _d: {}, getItem: function () { return null; }, setItem: function () {} },
  PALLET_SHEET: { PALLET_CULTIVARS: [], PALLET_SECTIONS: [] }
};
sandbox.window = sandbox;
sandbox.global = sandbox;

const chain = [
  'js/planting-constants.js',
  'js/cultivar-registry.js',
  'js/cut-model.js',
  'js/planting-cut-model-init.js',
  'js/growth-light-model.js',
  'js/planting-dli-light.js',
  'js/planting-growth-core.js',
  'js/planting-ui-helpers.js',
  'js/planting-cut-interval-ui.js',
  'js/planting-vf-standards.js',
  'js/planting-harvest-ui.js',
  'js/planting-pallet-sheet.js',
  'js/planting-custom-cv.js',
  'js/planting-gh-standards.js',
  'js/planting-vf-user-standards.js',
  'js/planting-gh-yield.js',
  'js/planting-layout.js',
  'js/georgy-mode.js',
  'js/planting-pallet-runtime.js',
  'js/planting-geom-ui.js',
  'js/planting-light-energy.js',
  'js/planting-calc-core.js',
  'js/planting-rec-icons.js',
  'js/planting-runtime-init.js'
];

chain.forEach(function (rel) { load(sandbox, rel); });

const georgy = {
  isGeorgyGh: function () { return false; },
  applyGeorgyBeforeCalc: function () {},
  applyCanopyDensityBeforeCalc: function () {}
};
const deps = {
  global: sandbox,
  PC: PC,
  getState: function () { return state; },
  getGeorgyMode: function () { return georgy; },
  getPlantingHarvestYieldParams: function () { return function () {}; },
  getPlantingStateEconSlice: function () { return {}; },
  restorePlantingStateEconSlice: function () {},
  NATURAL_DLI: PC.NATURAL_DLI,
  CULTIVARS: [],
  VF_CULTIVARS: [],
  VF_SECTIONS: [],
  PALLET_CULTIVARS: [],
  PALLET_SECTIONS: [],
  MAX_WIDTH: PC.MAX_WIDTH,
  CH_W: PC.CH_W,
  DENSITY_MAX: PC.DENSITY_MAX,
  $: function () { return null; },
  round: function (n) { return Math.round(n); },
  r1: function (n) { return Math.round(n * 10) / 10; },
  r2: function (n) { return Math.round(n * 100) / 100; },
  ui: function (k) { return k; },
  pt: function (k) { return k; },
  pm: function (k) { return k; },
  pr: function (k) { return k; },
  tr: function (k) { return k; },
  ptf: function (k) { return k; },
  catalogPhrase: function () { return ''; },
  cvSubLine: function () { return ''; },
  fmtNumRu: function (n) { return String(n); },
  parseNumInput: function (s) { return parseFloat(s) || 0; },
  formatInputValue: function (v) { return String(v); },
  decimalsFromStep: function () { return 0; },
  fmtNum: function (n) { return String(n); },
  mergeLocaleDeps: function () {},
  CUSTOM_CULTIVARS_STORAGE: 't-cv'
};

try {
  const rt = sandbox.DG_createPlantingRuntime(deps);
  if (!rt || typeof rt.calc !== 'function') throw new Error('runtime API incomplete');
  console.log('OK   DG_createPlantingRuntime (' + build + ')');
  try {
    rt.calc();
  } catch (calcErr) {
    if (/Cannot access 'st' before initialization/.test(calcErr.message)) throw calcErr;
  }
  console.log('OK   rt.calc() no st TDZ');
} catch (e) {
  console.error('FAIL bootstrap-runtime:', e.message);
  if (e.stack) console.error(e.stack.split('\n').slice(0, 4).join('\n'));
  process.exit(1);
}
