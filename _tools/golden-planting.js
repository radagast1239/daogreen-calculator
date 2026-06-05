/** Golden-тесты посадки — node _tools/golden-planting.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

function load(sandbox, rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox, { filename: rel });
}

const state = {
  facility: 'greenhouse',
  cv: 'aficion',
  germination: 5,
  nursery: 14,
  day: 21,
  density: 40,
  cutInterval: 12,
  nch: 13,
  month: 5,
  lighting: false,
  temp: 22,
  multicut: false,
  targetDli: 17,
  targetPhotoperiod: 16,
  errorPct: 12,
  vfCv: 'vf-sorrel',
  vfStd: {},
  palletStd: {},
  palletCells: 54,
  palletMount: 'cassette',
  appView: 'channels'
};

const PC = {
  DENSITY_MAX: 220, CH_W: 110, MAX_WIDTH: 2000,
  CASSETTES_PER_PALLET: 3, CASSETTE_L_MM: 400, CASSETTE_W_MM: 600,
  PALLET_L_MM: 1300, PALLET_W_MM: 650, PALLET_TIER_ZONE_MM: 400,
  PALLET_L_M: 1.3, PALLET_W_M: 0.65,
  NATURAL_DLI: [{ m: 'май', dli: 22, ph: 14.5 }],
  DAYS_PER_YEAR: 365, DAYS_PER_MONTH: 30.5
};

const sandbox = {
  window: {}, global: {}, console: console,
  document: { getElementById: function () { return null; } },
  DG_PLANTING_CONSTANTS: PC,
  DG_CUT: { HARVEST_MONTH_DAYS: 30.5, CUT_INTERVAL_SLACK: 6 },
  DG_GH_CULTIVARS: [],
  PALLET_SHEET: { PALLET_CULTIVARS: [], PALLET_SECTIONS: [] },
  localStorage: { getItem: function () { return null; }, setItem: function () {} }
};
sandbox.window = sandbox;
sandbox.global = sandbox;

[
  'js/gh-cultivars.js', 'js/gh-cultivars-extended.js', 'js/growth-light-model.js',
  'js/planting-constants.js', 'js/cut-model.js', 'js/planting-cut-model-init.js',
  'js/planting-dli-light.js', 'js/planting-growth-core.js', 'js/planting-useful-yield.js',
  'js/planting-layout.js', 'js/planting-calc-core.js', 'js/planting-pallet-sheet.js',
  'js/planting-vf-standards.js', 'vf-cultivars.js', 'pallet-cultivars.js'
].forEach(function (rel) { load(sandbox, rel); });

const CULTIVARS = sandbox.DG_GH_CULTIVARS || [];
const VF = sandbox.VF_SHEET ? sandbox.VF_SHEET.VF_CULTIVARS : [];
const georgy = {
  isGeorgyGh: function () { return false; },
  applyGeorgyBeforeCalc: function () {},
  applyCanopyDensityBeforeCalc: function () {},
  getGeorgyProfile: function () { return null; },
  isHeadLettuceChannel: function () { return false; }
};

function makeDeps() {
  return {
    getState: function () { return state; },
    getGeorgyMode: function () { return georgy; },
    georgyMode: georgy,
    findCvById: function (id) {
      return CULTIVARS.find(function (c) { return c.id === id; }) ||
        VF.find(function (c) { return c.id === id; }) || null;
    },
    getCv: function () { return CULTIVARS.find(function (c) { return c.id === state.cv; }) || CULTIVARS[0]; },
    getVfCv: function () { return VF.find(function (c) { return c.id === state.vfCv; }) || VF[0]; },
    getPalletCv: function () { return null; },
    isPalletView: function () { return state.appView === 'pallets'; },
    isVF: function () { return state.facility === 'vertical'; },
    allPalletCultivars: function () { return []; },
    allVfCultivars: function () { return VF; },
    CULTIVARS: CULTIVARS, VF_CULTIVARS: VF, PALLET_CULTIVARS: [],
    MAX_WIDTH: PC.MAX_WIDTH, CH_W: PC.CH_W,
    usefulYield: sandbox.DG_createPlantingUsefulYield({
      getState: function () { return state; },
      HARVEST_MONTH_DAYS: 30.5,
      isPalletView: function () { return false; },
      isVF: function () { return state.facility === 'vertical'; },
      getGeorgyMode: function () { return georgy; }
    }),
    harvestChannel: function (cv) { return state.day; },
    totalAge: function (d) { return state.germination + state.nursery + d; },
    massAtTotal: sandbox.DG_massAtTotal || function () { return 100; },
    plantLayout: function () {
      return { a: 0.25, b: 0.11, offMm: 0, diag: 0.156, nearest: 0.28, rhoA: state.density,
        perChan: 20, perRow: 2, total: 260, sysWmm: 1200, sysArea: 24, constrained: false, vfMode: false };
    },
    plantLayoutPallet: function () { return {}; },
    effectiveCa: function (cv) { return cv.ca || 10; },
    crowdingFactor: function () { return 1; },
    manualHarvestMass: function (m) { return m; },
    preChannelDays: function () { return state.germination + state.nursery; },
    lightingMolForEnergy: function () { return 0; },
    kwhPerSqmPerDayFromDli: function () { return 0.5; },
    dliFactor: function () { return 1; },
    effectiveTempFactor: function () { return 1; },
    tempFactor: function () { return 1; },
    naturalDLI: function () { return PC.NATURAL_DLI[0]; },
    effectiveDLI: function () { return 15; },
    boltShift: function () { return 0; },
    calcFromVfSheet: function () { return { mass: 15, canopy: 120, rhoA: 80, totalCycleDays: 30, sysArea: 10, cv: VF[0] }; },
    calcFromPalletSheet: function () { return {}; },
    applyPalletStandardsFromSheet: function () {},
    getPlantingStateEconSlice: function () { return {}; },
    restorePlantingStateEconSlice: function () {},
    canopyAtTotal: function () { return 150; },
    applyCutIntervalHarvestMods: function (_cv, m, c) { return { mass: m, canopy: c }; },
    rgrAtTotal: function () { return 3; },
    boltChannel: function (cv) { return cv.bolt || 90; },
    stageOf: function () { return 'veg'; },
    holeDiameter: function () { return 50; },
    harvestCanopy: function (_cv, m) { return Math.sqrt(m) * 12; },
    isVfSheetCv: function () { return false }
  };
}

const deps = makeDeps();
if (sandbox.DG_growthLightModel) {
  deps.massAtTotal = function (cv, t) {
    return sandbox.DG_growthLightModel.logisticMass(cv, t, cv.k || 0.4);
  };
}

const core = sandbox.DG_createPlantingCalcCore(deps);
const checks = [];
function ok(c, m) { checks.push({ ok: c, msg: m }); }

state.facility = 'greenhouse';
state.appView = 'channels';
state.cv = 'aficion';
var rGh = core.calc();
ok(rGh.mass > 0, 'GH mass > 0');
ok(rGh.rhoA > 0, 'GH rhoA > 0');
ok(rGh.totalCycleDays > 0, 'GH cycle days > 0');

var rTemp = core.calcScenario({ cv: 'aficion', temp: state.temp + 2, facility: 'greenhouse' });
ok(typeof rTemp.mass === 'number', 'calcScenario temp+2 mass defined');

state.facility = 'vertical';
state.appView = 'channels';
state.vfCv = VF[0] && VF[0].id;
deps.calcFromVfSheet = sandbox.DG_createPlantingVfStandards
  ? sandbox.DG_createPlantingVfStandards(Object.assign({}, deps, {
    calc: function () { return core.calc(); },
    getVfCv: deps.getVfCv,
    vfEffectiveDay: function () { return state.day; },
    vfEffectiveGermination: function (cv) { return cv.germination; },
    vfEffectiveDensity: function (cv) { return cv.density; },
    vfEffectiveMass: function (_cv, m) { return m; },
    massAtTotal: deps.massAtTotal,
    plantLayout: deps.plantLayout,
    effectiveCa: deps.effectiveCa,
    crowdingFactor: deps.crowdingFactor,
    harvestCanopy: deps.harvestCanopy,
    applyCutIntervalHarvestMods: deps.applyCutIntervalHarvestMods,
    rgrAtTotal: deps.rgrAtTotal,
    boltChannel: deps.boltChannel,
    stageOf: deps.stageOf,
    holeDiameter: deps.holeDiameter,
    MAX_WIDTH: PC.MAX_WIDTH,
    CH_W: PC.CH_W
  })).calcFromVfSheet
  : deps.calcFromVfSheet;

if (VF.length && deps.calcFromVfSheet) {
  var rVf = deps.calcFromVfSheet(VF[0]);
  ok(rVf && rVf.mass > 0, 'VF sheet mass > 0');
}

var failed = checks.filter(function (c) { return !c.ok; });
checks.forEach(function (c) { console.log((c.ok ? 'OK  ' : 'FAIL') + ' ' + c.msg); });
console.log('\n' + (failed.length ? failed.length + ' golden planting failed' : 'Golden planting passed'));
process.exit(failed.length ? 1 : 0);
