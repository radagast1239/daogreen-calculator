'use strict';
/**
 * Интеграционный аудит вынесенных planting-модулей (node vm).
 * node _tools/planting-modules-audit.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const checks = [];
function ok(m) {
  checks.push({ ok: true, msg: m });
}
function fail(m) {
  checks.push({ ok: false, msg: m });
}

function loadScript(sandbox, rel) {
  vm.runInNewContext(fs.readFileSync(path.join(root, rel), 'utf8'), sandbox);
}

const state = {
  germination: 5,
  nursery: 14,
  day: 20,
  density: 80,
  cutInterval: 12,
  canopyPct: 100,
  manualCanopy: 50,
  useManualCanopy: true,
  manualMass: 25,
  manualCutMass: 25,
  useManualMass: true,
  multicut: false,
  ghStandards: {},
  vfUserStandards: {},
  vfStd: {},
  ghCutCount: 3,
  ghCutMasses: [25, 24, 23, 22, 21],
  errorPct: 10,
  month: 5,
  lighting: true,
  targetDli: 17,
  targetPhotoperiod: 16,
  temp: 20,
  facility: 'greenhouse'
};

const cv = {
  id: 'test',
  name: 'Test',
  M_max: 120,
  multicut: true,
  cutInterval: 12,
  yieldPerCutG: 20,
  channelDays: 18,
  germination: 5,
  density: 80,
  t_opt: 22,
  heatSigma: 90,
  heatBolt: 1.3,
  k: 0.4,
  t50: 22,
  ca: 13,
  bolt: 35
};

const sandbox = {
  window: {},
  global: {},
  console: console,
  DG_PLANTING_CONSTANTS: { DENSITY_MAX: 220 },
  DG_CUT: { HARVEST_MONTH_DAYS: 30.5, CUT_INTERVAL_SLACK: 6 },
  DG_GH_STANDARDS_STORAGE: 'test-gh',
  DG_VF_STANDARDS_STORAGE: 'test-vf',
  DG_CUSTOM_CULTIVARS_STORAGE: 'test-cv',
  localStorage: {
    _d: {},
    getItem(k) {
      return this._d[k] || null;
    },
    setItem(k, v) {
      this._d[k] = v;
    }
  }
};
sandbox.window = sandbox;
sandbox.global = sandbox;

const scripts = [
  'js/growth-light-model.js',
  'js/planting-constants.js',
  'js/planting-dli-light.js',
  'js/planting-growth-core.js',
  'js/cut-model.js',
  'js/planting-cut-model-init.js',
  'js/planting-gh-standards.js',
  'js/planting-vf-user-standards.js',
  'js/planting-vf-standards.js',
  'js/planting-harvest-ui.js',
  'js/planting-custom-cv.js'
];

scripts.forEach(function (s) {
  try {
    loadScript(sandbox, s);
    ok('load ' + s);
  } catch (e) {
    fail('load ' + s + ': ' + e.message);
  }
});

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

var georgyLate = null;

const cutModel = sandbox.DG_createPlantingCutModelInit({
  getState: function () {
    return state;
  },
  getGeorgyMode: function () {
    return georgyLate;
  },
  clamp: clamp,
  getActiveCv: function () {
    return cv;
  },
  isVF: function () {
    return false;
  },
  isPalletView: function () {
    return false;
  },
  isVfSheetCv: function () {
    return false;
  },
  isPalletSheetCv: function () {
    return false;
  },
  isSheetCv: function () {
    return false;
  },
  usePlantingSheet: function () {
    return false;
  },
  getPlantingStd: function () {
    return {};
  },
  getGhCutMass: function (i) {
    return state.ghCutMasses[i] || 25;
  },
  envMultiplier: function () {
    return 1;
  },
  vfEffectiveDay: function () {
    return state.day;
  },
  harvestChannel: function () {
    return 15;
  },
  boltChannel: function () {
    return 80;
  },
  totalAge: function (d) {
    return d + 19;
  },
  envBolt: function () {
    return 90;
  },
  georgyMode: null,
  isChannelGreenhouse: function () {
    return true;
  }
});

if (!cutModel) fail('cutModel init null');
else {
  ok('cutModel init');
  var range = cutModel.cutIntervalRange(cv);
  if (range && range.mid > 0) ok('cutIntervalRange.mid');
  else fail('cutIntervalRange');
  if (typeof cutModel.supportsMulticut(cv) === 'boolean') ok('supportsMulticut');
  else fail('supportsMulticut');
}

georgyLate = {
  isGeorgyProfiled: function () {
    return true;
  },
  getGeorgyProfile: function () {
    return { maxCutsBelowHot: 6, firstCutCh: 10 };
  },
  isGeorgyGh: function () {
    return true;
  },
  syncBabyGhCutsAuto: function () {},
  resolveGeorgyMaxCuts: function () {
    return 4;
  }
};

var gh = sandbox.DG_createPlantingGhStandards({
  getState: function () {
    return state;
  },
  getGeorgyMode: function () {
    return georgyLate;
  },
  $: function () {
    return null;
  },
  clamp: clamp,
  getCv: function () {
    return cv;
  },
  ui: function (k) {
    return k;
  },
  pt: function (k) {
    return k;
  },
  pm: function (k) {
    return k;
  },
  ptf: function (k) {
    return k;
  },
  DENSITY_MAX: 220,
  envMultiplier: function () {
    return 1;
  },
  harvestChannel: function () {
    return 15;
  },
  cutIntervalRange: function () {
    return cutModel.cutIntervalRange(cv);
  },
  modelCanopyFromMass: function () {
    return 50;
  },
  syncCanopyUI: function () {},
  syncVegPeriodTotal: function () {},
  syncBioMarginVisibility: function () {},
  isVF: function () {
    return false;
  },
  isPalletView: function () {
    return false;
  },
  georgyMode: null,
  renderAll: function () {}
});

gh.loadGhStandardsStore();
var ghs = gh.buildDefaultGhStandards(cv);
if (ghs && ghs.day > 0) ok('buildDefaultGhStandards');
else fail('buildDefaultGhStandards');

if (gh.ghCutCountMax({ id: 'baby', multicut: true }) === 6) ok('georgyMode late bind ghCutCountMax');
else fail('georgyMode late bind ghCutCountMax');

var vf = sandbox.DG_createPlantingVfUserStandards({
  getState: function () {
    return state;
  },
  $: function () {
    return null;
  },
  storageKey: 'test-vf',
  clamp: clamp,
  getVfCv: function () {
    return cv;
  },
  VF_CULTIVARS: [cv],
  cutIntervalRange: function () {
    return cutModel.cutIntervalRange(cv);
  },
  modelCanopyFromMass: function () {
    return 50;
  },
  DENSITY_MAX: 220,
  syncManualMassUI: function () {},
  syncCutMassUI: function () {},
  syncCanopyUI: function () {},
  syncVegPeriodTotal: function () {},
  syncVfStdBadges: function () {},
  renderVfStdGrid: function () {},
  isVF: function () {
    return true;
  },
  isPalletView: function () {
    return false;
  },
  ui: function (k) {
    return k;
  },
  pt: function (k) {
    return k;
  },
  pm: function (k) {
    return k;
  }
});

vf.loadVfStandardsStore();
var vfs = vf.buildDefaultVfStandards(cv);
if (vfs && vfs.manualMass > 0) ok('buildDefaultVfStandards');
else fail('buildDefaultVfStandards');

vf.applyVfProfileToStateOnly(vfs, cv);
if (state.vfStd.mass === false) ok('applyVfProfileToStateOnly vfStd flags');
else fail('applyVfProfileToStateOnly');

var palCv = {
  id: 'pl-test',
  name: 'Pal',
  palletSheet: true,
  yieldPerCutG: 40,
  germination: 5,
  channelDays: 20,
  density: 80,
  cutInterval: 12
};
state.appView = 'pallets';
state.facility = 'vertical';
state.palletStd = { germination: true, day: true, density: true, mass: false, cutInterval: true, cutMass: true, cells: true };
state.useManualMass = true;
state.manualMass = 5;
if (!sandbox.document) {
  sandbox.document = {
    querySelectorAll: function () { return []; },
    querySelector: function () { return null; }
  };
}
var vfStdMod = sandbox.DG_createPlantingVfStandards({
  getState: function () { return state; },
  $: function () { return null; },
  constants: sandbox.DG_PLANTING_CONSTANTS,
  vfStdFields: sandbox.DG_VF_STD_FIELDS || [],
  getGeorgyMode: function () { return null; },
  isSheetCv: function (c) { return !!(c && c.palletSheet); },
  isPalletSheetCv: function (c) { return !!(c && c.palletSheet); },
  getSheetCv: function () { return palCv; },
  getPlantingStd: function () { return state.palletStd; },
  usePlantingSheet: function () { return true; },
  isPalletView: function () { return true; },
  isVF: function () { return false; },
  clamp: clamp,
  cutIntervalRange: function () { return cutModel.cutIntervalRange(palCv); },
  vfCutIntervalFromCv: function () { return 12; },
  syncPalletCellButtons: function () {},
  syncCutIntervalSlider: function () {},
  syncManualMassUI: function () {},
  modelCanopyFromMass: function () { return 50; },
  renderAll: function () {},
  manualHarvestMass: function (m) { return m; },
  supportsMulticut: function () { return false; },
  ui: function (k) { return k; },
  pt: function (k) { return k; },
  pm: function (k) { return k; }
});
vfStdMod.applyVfStandardField('mass');
if (!state.useManualMass && state.manualMass === 40 && state.palletStd.mass === true) {
  ok('applyVfStandardField mass pallet uses sheet mode');
} else {
  fail('applyVfStandardField mass pallet: useManualMass=' + state.useManualMass + ' mass=' + state.manualMass);
}
state.appView = 'channels';
state.facility = 'greenhouse';

var natDli = sandbox.DG_PLANTING_CONSTANTS.NATURAL_DLI;
var dliLight = sandbox.DG_createPlantingDliLight({
  getState: function () {
    return state;
  },
  naturalDli: natDli,
  isVF: function () {
    return false;
  },
  isPalletView: function () {
    return false;
  },
  getGLM: function () {
    return sandbox.DG_growthLightModel;
  }
});
if (!dliLight) fail('dliLight init null');
else {
  ok('dliLight init');
  var nat = dliLight.naturalDLI();
  if (nat > 15 && nat < 30) ok('naturalDLI may');
  else fail('naturalDLI may got ' + nat);
  var eff = dliLight.effectiveDLI();
  if (eff >= state.targetDli - 0.01) ok('effectiveDLI lighting');
  else fail('effectiveDLI expected >= targetDli');
}

var growthCore = sandbox.DG_createPlantingGrowthCore({
  getState: function () {
    return state;
  },
  clamp: clamp,
  getGLM: function () {
    return sandbox.DG_growthLightModel;
  },
  getCv: function () {
    return cv;
  },
  getGeorgyMode: function () {
    return null;
  },
  isVF: function () {
    return false;
  },
  isPalletView: function () {
    return false;
  },
  effectiveDLI: function () {
    return dliLight.effectiveDLI();
  },
  effectivePhotoperiod: function () {
    return dliLight.effectivePhotoperiod();
  },
  photoperiod: function () {
    return dliLight.photoperiod();
  },
  eveningHours: function () {
    return dliLight.eveningHours();
  },
  preChannelDays: function () {
    return state.germination + state.nursery;
  }
});
if (!growthCore) fail('growthCore init null');
else {
  ok('growthCore init');
  var em = growthCore.envMultiplier(cv);
  if (em > 0.2 && em < 2) ok('envMultiplier');
  else fail('envMultiplier ' + em);
  var tTotal = growthCore.totalAge(state.day);
  var mass = growthCore.massAtTotal(cv, tTotal);
  if (mass > 1 && mass <= cv.M_max) ok('massAtTotal');
  else fail('massAtTotal ' + mass);
  var hc = growthCore.harvestChannel(cv);
  if (hc > 0 && hc < 80) ok('harvestChannel');
  else fail('harvestChannel ' + hc);
}

const html = fs.readFileSync(path.join(root, 'calculator-110x55_12.html'), 'utf8');
const rtInit = fs.readFileSync(path.join(root, 'js/planting-runtime-init.js'), 'utf8');
const eventBindingsSrc = fs.readFileSync(path.join(root, 'js/planting-event-bindings.js'), 'utf8');
const initSrc = html + rtInit;
const dupPatterns = [
  /function renderGhStandardsPanel\(\)\{\s*\n\s*if \(isVF\(\)/,
  /function applyGhProfileToStateOnly\(s, cv\)\{\s*\n\s*cv = cv \|\| getCv\(\)/,
  /function getVfCvStandards\(cv\)\{\s*\n\s*cv = cv \|\| getVfCv\(\)/
];
dupPatterns.forEach(function (re, i) {
  if (re.test(html)) fail('inline duplicate block still in html #' + (i + 1));
  else ok('no inline dup #' + (i + 1));
});

if (!initSrc.includes('DG_createPlantingGhStandards')) fail('gh standards factory call missing');
else ok('gh init wired');

if (!initSrc.includes('DG_createPlantingVfUserStandards')) fail('vf user standards factory missing');
else ok('vf user init wired');

if (!initSrc.includes('DG_createPlantingCutModelInit')) fail('cut model init factory missing');
else ok('cut model init wired');

if (!initSrc.includes('DG_createPlantingDliLight')) fail('dli light factory missing');
else ok('dli light init wired');

if (!initSrc.includes('DG_createPlantingGrowthCore')) fail('growth core factory missing');
else ok('growth core init wired');

if (!html.includes('getGeorgyMode: function(){ return georgyMode; }')) fail('getGeorgyMode late bind missing');
else ok('getGeorgyMode wired in html');

if (!initSrc.includes('DG_COLLAPSE_DEFAULTS')) fail('DG_COLLAPSE_DEFAULTS missing');
else ok('collapse defaults from constants');

if (!initSrc.includes('DG_createPlantingGhYield')) fail('gh yield factory missing');
else ok('gh yield init wired');

if (!html.includes('DG_createPlantingRuntime')) fail('runtime init factory missing');
else ok('runtime init wired');
if (!initSrc.includes('function renderAll(){') || !initSrc.includes('DG_plantingRender')) {
  fail('renderAll shim missing in planting-runtime-init.js');
} else ok('renderAll runtime shim');
if (!/var CASSETTES_PER_PALLET = PC\.CASSETTES_PER_PALLET/.test(initSrc)) {
  fail('pallet constants missing in planting-runtime-init.js');
} else ok('pallet constants from PC');
if (!/function plantsPerPallet\(\)\{ return plantsPerPalletCount\(\)/.test(
  fs.readFileSync(path.join(root, 'js/planting-pallet-runtime.js'), 'utf8')
)) {
  fail('plantsPerPallet missing in planting-pallet-runtime.js');
} else ok('plantsPerPallet in pallet runtime');
if (!fs.readFileSync(path.join(root, 'js/planting-late-init.js'), 'utf8').includes('DG_plantingRender')) {
  fail('DG_plantingRender not set in planting-late-init.js');
} else ok('render module late bind');
var lateInitSrc = fs.readFileSync(path.join(root, 'js/planting-late-init.js'), 'utf8');
if (!/var isChannelGreenhouse = deps\.isChannelGreenhouse/.test(lateInitSrc)) {
  fail('isChannelGreenhouse missing in planting-late-init.js');
} else ok('isChannelGreenhouse in late init');
var renderSrc = fs.readFileSync(path.join(root, 'js/planting-render.js'), 'utf8');
if (/cvDelBtn:\s*cvDelBtn/.test(renderSrc)) {
  fail('cvDelBtn exported from render factory but scoped inside renderCultivars');
} else ok('render export scope ok');
if (/pillClass:\s*pillClass/.test(renderSrc)) {
  fail('pillClass exported from render factory but scoped inside renderEnvSummary');
} else ok('render nested helpers not exported');
var calcCoreSrc = fs.readFileSync(path.join(root, 'js/planting-calc-core.js'), 'utf8');
if (/function st\(\)/.test(calcCoreSrc) && /const st = stageOf/.test(calcCoreSrc)) {
  fail('calc() shadows st() with const st (TDZ)');
} else ok('calc st() not shadowed');
if (!/function daySupplement\(\) \{ return deps\.daySupplement/.test(renderSrc)) {
  fail('daySupplement missing in planting-render.js deps');
} else ok('render dli deps wired');
if (!/function syncHarvestBlockUI\(r\) \{ return deps\.syncHarvestBlockUI/.test(renderSrc)) {
  fail('syncHarvestBlockUI missing in planting-render.js deps');
} else ok('render harvest deps wired');
if (/st\(\)\.georgyModeRef/.test(renderSrc)) {
  fail('st().georgyModeRef in planting-render.js — use georgyModeRef() helper');
} else ok('render georgyModeRef not on state');
if (!/function showToast\(msg\) \{ return deps\.showToast/.test(renderSrc)) {
  fail('showToast missing in planting-render.js deps');
} else ok('render setFacility deps wired');
var vfStdSrc = fs.readFileSync(path.join(root, 'js/planting-vf-standards.js'), 'utf8');
if (/deps\.syncCutMassUI/.test(vfStdSrc)) {
  fail('planting-vf-standards.js calls deps.syncCutMassUI — use local syncCutMassUI()');
} else ok('vf-standards syncCutMassUI local');
if (!/function vfEffectiveDay\(cv\) \{ return deps\.vfEffectiveDay/.test(renderSrc)) {
  fail('vfEffectiveDay missing in planting-render.js deps');
} else ok('render vfEffectiveDay wired');
if (!/var CUT_INTERVAL_SLACK = deps\.CUT_INTERVAL_SLACK/.test(renderSrc)) {
  fail('CUT_INTERVAL_SLACK missing in planting-render.js deps');
} else ok('render CUT_INTERVAL_SLACK wired');
if (!/var CH_W = deps\.CH_W/.test(renderSrc)) {
  fail('CH_W missing in planting-render.js deps');
} else ok('render geom constants wired');
var econCoreSrc = fs.readFileSync(path.join(root, 'js/econ-core.js'), 'utf8');
if (/Math\.round\(snap\.yieldPerPotCycle/.test(econCoreSrc)) {
  fail('econ-core.js reads snap.yieldPerPotCycle without null guard');
} else ok('econ yield null-safe');
if (!/function snapDensity\(snap, fallback\)/.test(econCoreSrc)) {
  fail('snapDensity helper missing in econ-core.js');
} else ok('econ snap density null-safe');
if (!/function parseNumInput\(s\) \{ return deps\.parseNumInput/.test(eventBindingsSrc)) {
  fail('parseNumInput missing in planting-event-bindings.js bindEvents');
} else ok('event bindings parseNumInput wired');
if (!/function palletCellsForLayout\(cv\) \{ return deps\.palletCellsForLayout/.test(renderSrc)) {
  fail('palletCellsForLayout missing in planting-render.js deps');
} else ok('render palletCellsForLayout wired');
var pdfExportSrc = fs.readFileSync(path.join(root, 'js/pdf-export.js'), 'utf8');
if (/sec\.label/.test(pdfExportSrc)) {
  fail('pdf-export.js uses undefined sec.label — use secLabel(sec.id)');
} else ok('pdf export section labels ok');
if (!/function applyProjectState\(\) \{ return deps\.applyProjectState/.test(eventBindingsSrc)) {
  fail('applyProjectState missing in planting-event-bindings.js');
} else ok('event bindings project store wired');
var appNavSrc = fs.readFileSync(path.join(root, 'js/planting-app-nav.js'), 'utf8');
if (/palletStd\s*=\s*\{\s*germination:\s*false/.test(appNavSrc)) {
  fail('setAppView pallets unlocks all palletStd — use resetPalletStdToSheetDefaults');
} else ok('app nav pallet std reset');
if (!/function resetPalletStdToSheetDefaults/.test(eventBindingsSrc)) {
  fail('resetPalletStdToSheetDefaults missing in event-bindings');
} else ok('event bindings resetPalletStd wired');
if (!/applyVfStandardField\('cutMass'\)/.test(eventBindingsSrc)) {
  fail('auto-cut-mass should call applyVfStandardField(cutMass)');
} else ok('auto-cut-mass uses applyVfStandardField');
if (!/function resetPalletStdToSheetDefaults/.test(renderSrc)) {
  fail('resetPalletStdToSheetDefaults missing in planting-render.js');
} else ok('render resetPalletStd wired');
if (/deps\.\$\('germination'\)\.value/.test(vfStdSrc)) {
  fail('applyVfStandardsFromSheet unsafe DOM — use null checks');
} else ok('vf-standards applyVfStandards DOM safe');
if (!html.includes('DG_createPlantingLateInit')) fail('late init factory missing');
else ok('late init wired');
if (/function initCultivarRegistry\(\)\{[\s\S]{0,80}window\.DG_createCultivarRegistry/.test(html)) {
  fail('initCultivarRegistry body still inline');
} else ok('cultivar registry init delegated');
if (!html.includes('DG_createDefaultPlantingState')) fail('planting state factory missing');
else ok('planting state wired');
if (!html.includes('DG_installPlantingPublicApi')) fail('public api install missing');
else ok('public api wired');
if (/function initGeorgyMode\(\)/.test(html)) fail('initGeorgyMode still inline');
else ok('georgy init delegated');
if (/function syncPreviewSlidersToState\(\)/.test(html)) fail('preview sync still inline');
else ok('preview api delegated');

if (/function renderAll\(\)\{\s*\n\s*let r;/.test(html)) fail('renderAll body still inline');
else ok('renderAll delegated');

if (!initSrc.includes('DG_createPlantingCalcCore')) fail('calc core factory missing');
else ok('calc core init wired');

if (!initSrc.includes('DG_createPlantingPalletRuntime')) fail('pallet runtime factory missing');
else ok('pallet runtime init wired');

if (/function calc\(\)\{\s*\n\s*if \(georgyMode\)/.test(html)) fail('calc body still inline');
else ok('calc delegated');

if (!initSrc.includes('DG_createPlantingLightEnergy')) fail('light energy factory missing');
else ok('light energy init wired');

if (/function getActivePlantingCvId\(\)\{\s*\n\s*if \(isPalletView/.test(html))
  fail('getActivePlantingCvId inline dup');
else ok('getActivePlantingCvId delegated');

if (/function palletCellGeometry\(cells, mount\)/.test(html)) fail('palletCellGeometry inline dup');
else ok('palletCellGeometry delegated');

if (/function dliFromPpfd\(ppfd, ph\)\{ return ppfd \* ph/.test(html)) fail('dliFromPpfd inline dup');
else ok('dliFromPpfd delegated');

if (html.includes('stroke-linejoin="rou  /*')) fail('corrupt ICON svg in html');
else ok('ICON block intact');

if ((html.match(/var _render;/g) || []).length !== 1) fail('_render declared ' + (html.match(/var _render;/g) || []).length + ' times');
else ok('single _render declaration');

if (!html.includes('DG_createPlantingEventBindings')) fail('event bindings factory missing');
else ok('event bindings init wired');

if (!html.includes('DG_createPlantingEconGlue')) fail('econ glue factory missing');
else ok('econ glue init wired');

if (!html.includes('DG_createPlantingAppNav')) fail('app nav factory missing');
else ok('app nav init wired');

if (/function econStateFallback\(\)\{/.test(html)) fail('econStateFallback still inline');
else ok('econ glue delegated');

if (/function setAppView\(view\)\{\s*\n\s*if \(view === 'planting'\)/.test(html)) fail('setAppView body still inline');
else ok('app nav delegated');

if (/  \/\* ---- Event handlers ---- \*\//.test(html)) fail('event handlers block still inline');
else ok('event handlers delegated');

if (!eventBindingsSrc.includes('loadGhStandardsStore();') || !eventBindingsSrc.includes('loadVfStandardsStore();'))
  fail('standards store load on boot missing');
else ok('standards store load on boot');

const scriptM = html.match(/<script>\s*\r?\n([\s\S]*?)\r?\n<\/script>/);
if (!scriptM) fail('main inline script block missing');
else {
  try {
    new Function(scriptM[1]);
    ok('inline script parses');
  } catch (e) {
    fail('inline script syntax: ' + e.message);
  }
}

[
  'js/planting-state.js',
  'js/planting-runtime-init.js',
  'js/planting-render.js',
  'js/planting-late-init.js',
  'js/planting-public-api.js',
  'js/planting-pallet-runtime.js',
  'js/planting-light-energy.js',
  'js/planting-calc-core.js',
  'js/planting-event-bindings.js',
  'js/planting-econ-glue.js',
  'js/planting-app-nav.js'
].forEach(function (rel) {
  try {
    loadScript(sandbox, rel);
    ok('load ' + rel);
  } catch (e) {
    fail('load ' + rel + ': ' + e.message);
  }
});

const failed = checks.filter(function (c) {
  return !c.ok;
});
checks.forEach(function (c) {
  console.log((c.ok ? 'OK  ' : 'FAIL') + ' ' + c.msg);
});
console.log('\n' + (failed.length ? failed.length + ' audit failed' : 'Planting modules audit passed'));
process.exit(failed.length ? 1 : 0);
