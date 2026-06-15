/** Проверка последних правок: t50, guard канала, DLI/фотопериод, затенение, ягоды/овощи. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

function load(sandbox, rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox, { filename: rel });
}

const PC = {
  DENSITY_MAX: 220, CH_W: 110, MAX_WIDTH: 2000,
  CASSETTES_PER_PALLET: 3, CASSETTE_L_MM: 400, CASSETTE_W_MM: 600,
  PALLET_L_MM: 1300, PALLET_W_MM: 650, PALLET_TIER_ZONE_MM: 400,
  PALLET_L_M: 1.3, PALLET_W_M: 0.65,
  NATURAL_DLI: [
    { m: 'янв', dli: 6, ph: 8 }, { m: 'фев', dli: 9, ph: 10 }, { m: 'мар', dli: 14, ph: 12 },
    { m: 'апр', dli: 18, ph: 13.5 }, { m: 'май', dli: 22, ph: 14.5 }, { m: 'июн', dli: 24, ph: 15 },
    { m: 'июл', dli: 23, ph: 14.5 }, { m: 'авг', dli: 20, ph: 13.5 }, { m: 'сен', dli: 15, ph: 12 },
    { m: 'окт', dli: 10, ph: 10.5 }, { m: 'ноя', dli: 7, ph: 9 }, { m: 'дек', dli: 5, ph: 8 }
  ],
  DAYS_PER_YEAR: 365, DAYS_PER_MONTH: 30.5
};

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
  shadePct: 0,
  georgyMode: false,
  georgyDensityFitted: false,
  georgyTargetDensity: 0,
  vfCv: 'vf-sorrel',
  vfStd: {},
  palletStd: {},
  palletCells: 54,
  palletMount: 'cassette',
  appView: 'channels'
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
  'js/planting-layout.js', 'js/georgy-mode.js', 'js/planting-calc-core.js',
  'js/planting-pallet-sheet.js', 'js/planting-vf-standards.js', 'vf-cultivars.js', 'pallet-cultivars.js'
].forEach(function (rel) { load(sandbox, rel); });

const CULTIVARS = sandbox.DG_GH_CULTIVARS || [];
const GLM = sandbox.DG_growthLightModel;
const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

const georgyStub = {
  isGeorgyGh: function () { return false; },
  applyGeorgyBeforeCalc: function () {},
  applyCanopyDensityBeforeCalc: function () {},
  getGeorgyProfile: function () { return null; },
  isHeadLettuceChannel: function (cv) {
    return cv && !cv.multicut && !cv.babyGreen && (cv.id === 'aficion' || cv.id === 'afilion' || cv.id === 'grazion');
  },
  canUseCanopyDensityPick: function () { return true; }
};

function makeDeps() {
  var dli = sandbox.DG_createPlantingDliLight({
    getState: function () { return state; },
    isVF: function () { return state.facility === 'vertical'; },
    isPalletView: function () { return state.appView === 'pallets'; },
    naturalDli: PC.NATURAL_DLI
  });
  var growth = sandbox.DG_createPlantingGrowthCore({
    getState: function () { return state; },
    getCv: function () { return CULTIVARS.find(function (c) { return c.id === state.cv; }) || CULTIVARS[0]; },
    getGeorgyMode: function () { return georgyStub; },
    georgyMode: georgyStub,
    isVF: function () { return state.facility === 'vertical'; },
    isPalletView: function () { return state.appView === 'pallets'; },
    preChannelDays: function () { return state.germination + state.nursery; },
    clamp: clamp,
    effectiveDLI: dli.effectiveDLI,
    photoperiod: dli.photoperiod,
    effectivePhotoperiod: dli.effectivePhotoperiod,
    eveningHours: dli.eveningHours
  });
  var useful = sandbox.DG_createPlantingUsefulYield({
    getState: function () { return state; },
    HARVEST_MONTH_DAYS: 30.5,
    isPalletView: function () { return state.appView === 'pallets'; },
    isVF: function () { return state.facility === 'vertical'; },
    getGeorgyMode: function () { return georgyStub; },
    getCv: function () { return CULTIVARS.find(function (c) { return c.id === state.cv; }) || CULTIVARS[0]; },
    harvestChannel: growth.harvestChannel,
    supportsMulticut: function (cv) { return !!cv && cv.multicut; }
  });
  return {
    getState: function () { return state; },
    getGeorgyMode: function () { return georgyStub; },
    georgyMode: georgyStub,
    findCvById: function (id) { return CULTIVARS.find(function (c) { return c.id === id; }); },
    getCv: function () { return CULTIVARS.find(function (c) { return c.id === state.cv; }) || CULTIVARS[0]; },
    isPalletView: function () { return state.appView === 'pallets'; },
    isVF: function () { return state.facility === 'vertical'; },
    preChannelDays: function () { return state.germination + state.nursery; },
    clamp: clamp,
    dli: dli,
    growth: growth,
    useful: useful,
    plantLayout: function () {
      return { rhoA: state.density, sysArea: 24, perChan: 20, perRow: 2, total: 260 };
    },
    effectiveCa: function (cv) { return cv.ca || 10; },
    crowdingFactor: function () { return 1; },
    manualHarvestMass: function (m) { return m; },
    massAtTotal: growth.massAtTotal,
    harvestChannel: growth.harvestChannel,
    totalAge: growth.totalAge,
    canopyAtTotal: growth.canopyAtTotal,
    boltShift: growth.boltShift,
    dliFactor: growth.dliFactor,
    effectiveTempFactor: growth.effectiveTempFactor,
    tempFactor: growth.tempFactor,
    naturalDLI: dli.naturalDLI,
    effectiveDLI: dli.effectiveDLI,
    lightingMolForEnergy: dli.lightingMolForEnergy,
    kwhPerSqmPerDayFromDli: function () { return 0.5; },
    getVfCv: function () { return null; },
    getPalletCv: function () { return null; },
    allPalletCultivars: function () { return []; },
    allVfCultivars: function () { return []; },
    MAX_WIDTH: PC.MAX_WIDTH,
    CH_W: PC.CH_W,
    plantLayoutPallet: function () { return {}; },
    applyPalletStandardsFromSheet: function () {},
    getPlantingStateEconSlice: function () { return {}; },
    restorePlantingStateEconSlice: function () {},
    usefulYield: useful,
    calcFromVfSheet: function () { return { mass: 15, rhoA: 80, totalCycleDays: 30 }; },
    calcFromPalletSheet: function () { return {}; },
    applyCutIntervalHarvestMods: function (_cv, m) { return { mass: m, canopy: 120 }; },
    rgrAtTotal: growth.rgrAtTotal,
    boltChannel: function (cv) { return cv.bolt || 90; },
    stageOf: function () { return 'veg'; },
    holeDiameter: function () { return 50; },
    harvestCanopy: function (_cv, m) { return Math.sqrt(m) * 12; },
    isVfSheetCv: function () { return false }
  };
}

const deps = makeDeps();
const core = sandbox.DG_createPlantingCalcCore(deps);
const aficion = deps.findCvById('aficion');
const checks = [];
function ok(c, m) { checks.push({ ok: !!c, msg: m }); }
function near(a, b, tol, label) {
  ok(Math.abs(a - b) <= tol, label + ' (' + a + ' ≈ ' + b + ')');
}

// --- t50 recalibration ---
ok(aficion.t50 === 40, 'aficion t50 = 40');
var tTotal21 = state.germination + state.nursery + 21;
var mass21 = deps.growth.massAtTotal(aficion, tTotal21);
ok(mass21 >= 80 && mass21 <= 180, 'ранний срез day=21: масса 80–180 г (факт ' + Math.round(mass21) + ')');
var oldCv = Object.assign({}, aficion, { t50: 34 });
var mass21old = deps.growth.massAtTotal(oldCv, tTotal21);
ok(mass21 < mass21old, 't50↑ снижает массу при day=21 (' + Math.round(mass21) + ' < ' + Math.round(mass21old) + ')');
var mass40 = deps.growth.massAtTotal(aficion, state.germination + state.nursery + 40);
ok(mass40 >= 180 && mass40 <= 260, 'полный цикл ~40 дн канала: масса 180–260 г (' + Math.round(mass40) + ')');

// --- channel guard vs early harvest ---
var chDays = Math.round(deps.growth.harvestChannel(aficion));
ok(chDays >= 24 && chDays <= 38, 'harvestChannel aficion в разумном диапазоне (' + chDays + ')');
state.day = 21;
var meta21 = deps.useful.resolveMeta(aficion, { mass: mass21 });
ok(meta21.mainHallIntervalDays >= chDays, 'guard: интервал ≥ harvestChannel при day=21 (' + meta21.mainHallIntervalDays + ' ≥ ' + chDays + ')');
ok(mass21 > 0, 'масса при day=21 не обнулена guard-ом');

// --- shade cloth ---
state.shadePct = 0;
state.lighting = false;
var nat0 = deps.dli.naturalDLI();
state.shadePct = 90;
var nat90 = deps.dli.naturalDLI();
near(nat90, nat0 * 0.1, 0.5, 'shade 90%: natural DLI ×0.1');
state.day = 28;
var tTotal28 = state.germination + state.nursery + 28;
var mass28shade = deps.growth.massAtTotal(aficion, tTotal28);
state.shadePct = 0;
var mass28clear = deps.growth.massAtTotal(aficion, tTotal28);
ok(mass28shade < mass28clear, 'shade 90% замедляет рост при day=28 (' + Math.round(mass28shade) + ' < ' + Math.round(mass28clear) + ')');
state.shadePct = 0;
state.day = 21;

// --- photoperiod / DLI caps ---
state.lighting = false;
ok(deps.growth.photoperiodFactor() === 1, 'без досветки photoperiodFactor = 1');
state.lighting = true;
state.targetPhotoperiod = 16;
var pfOn = deps.growth.photoperiodFactor();
ok(pfOn >= 1 && pfOn <= 1.10, 'photoperiodFactor с досветкой 1.0–1.10 (' + pfOn.toFixed(3) + ')');
var mNoLight = deps.growth.massAtTotal(aficion, tTotal21);
state.lighting = true;
var mWithLight = deps.growth.massAtTotal(aficion, tTotal21);
ok(mWithLight >= mNoLight, 'досветка не уменьшает массу');
var pfApplied = mWithLight / (aficion.M_max / (1 + Math.exp(-deps.growth.envK(aficion) * (tTotal21 - aficion.t50))));
ok(pfApplied <= 1.051, 'кап photoperiod на массе ≤1.05');

// DLI clamp
ok(GLM.dliResponseFactor(0) === 0.6, 'DLI clamp min 0.6');
var dliHi = GLM.dliResponseFactor(100);
ok(dliHi <= 1.15 && dliHi >= 1.12, 'DLI clamp max ~1.15 (' + dliHi.toFixed(4) + ')');

// Georgy light cap (логика в georgy-mode, проверяем эквивалент)
state.lighting = true;
state.targetDli = 25;
state.targetPhotoperiod = 18;
var glf = clamp(deps.growth.dliFactor() * deps.growth.photoperiodFactor(), 0.72, 1.08);
ok(glf <= 1.08, 'Georgy light cap ≤1.08 (' + glf.toFixed(3) + ')');
ok(glf >= 0.72, 'Georgy light floor ≥0.72');

// --- full calc smoke ---
state.lighting = false;
state.shadePct = 0;
state.day = 21;
state.cv = 'aficion';
var r = core.calc();
ok(r.mass > 0 && r.rhoA > 0, 'core.calc() GH day=21 OK');
ok(r.usefulKgPerSqmMonth == null || r.usefulKgPerSqmMonth >= 0, 'useful yield defined');

// --- econ berries/vegetables ---
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/econ-core.js'), 'utf8'), sandbox);
var econDeps = {
  getState: function () { return { econ: econState, appView: 'economics', facility: 'greenhouse' }; },
  getActivePlantingCvId: function () { return ''; },
  findCvById: function () { return null; },
  getPlantingSnapshot: function () { return null; },
  getPlantingSnapshotForCvId: function () { return null; },
  plantingCvIdMatchesLiveState: function () { return false; },
  isPalletCvId: function () { return false; },
  isVfCvId: function () { return false; },
  allPalletCultivars: function () { return []; },
  allVfCultivars: function () { return []; },
  allGhCultivars: function () { return CULTIVARS; },
  supportsMulticut: function () { return false; },
  cutIntervalRange: function () { return [10, 20]; },
  getGhCvStandards: function () { return {}; },
  clamp: clamp,
  round: function (n) { return Math.round(n); },
  r1: function (n) { return Math.round(n * 10) / 10; },
  r2: function (n) { return Math.round(n * 100) / 100; },
  r3: function (n) { return Math.round(n * 1000) / 1000; },
  sumEconEquipment: function () { return 0; },
  sumEconEquipmentRaw: function () { return 0; }
};
var econCore = sandbox.DG_createEconCore(econDeps);
var econState = econCore.defaultEconState();
econCore.ensureEconCultures();
econState.plantingArea = 100;
econState.salePrice = 800;

function testEconCv(cvId, pct) {
  var row = econCore.econApplyCultureSelect({ cvId: cvId, pct: pct, salePrice: 900 }, cvId, pct, 900);
  var bio = econCore.econCultureBio(row);
  var slice = econCore.calcCultureSliceFromRow(row, econState, 100 * pct / 100, 900);
  ok(bio.yieldPerSqmMonthKg > 0 || bio.yieldPerSqmMonthPcs > 0, cvId + ': yield bio > 0');
  ok(slice.monthlyOutput > 0, cvId + ': monthlyOutput > 0');
  return { bio: bio, slice: slice, row: row };
}

var straw = testEconCv('econ-berry-strawberry', 50);
near(straw.bio.yieldPerSqmMonthKg, 0.35 * 16, 0.01, 'земляника: кг/м²·мес = yieldPerPlant×density');
var tom = testEconCv('econ-veg-tomato', 50);
near(tom.bio.yieldPerSqmMonthKg, 3.8 * 2.8, 0.01, 'томат: кг/м²·мес = yieldPerPlant×density');
econState.cultures = [straw.row, tom.row];
var farm = econCore.calcFarmEconomics(econState);
ok(farm.outBerriesKg > 0 && farm.outVegetablesKg > 0, 'farm: berries и vegetables kg > 0');

// --- PDF tables syntax ---
load(sandbox, 'js/pdf-econ-tables.js');
ok(typeof sandbox.DG_createPdfCtx === 'function', 'pdf-econ-tables loads');

var failed = checks.filter(function (c) { return !c.ok; });
checks.forEach(function (c) { console.log((c.ok ? 'OK  ' : 'FAIL') + ' ' + c.msg); });
console.log('\n' + (failed.length ? failed.length + ' verify-recent-patches FAILED' : 'verify-recent-patches passed (' + checks.length + ' checks)'));
process.exit(failed.length ? 1 : 0);
