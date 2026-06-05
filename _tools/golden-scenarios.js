/** Эталонные сценарии экономики — node _tools/golden-scenarios.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const state = { appView: 'economics', facility: 'greenhouse', econ: null };

const deps = {
  getState: function(){ return state; },
  getActivePlantingCvId: function(){ return ''; },
  findCvById: function(){ return null; },
  getPlantingSnapshot: function(){ return null; },
  getPlantingSnapshotForCvId: function(){ return null; },
  plantingCvIdMatchesLiveState: function(){ return false; },
  isPalletCvId: function(){ return false; },
  isVfCvId: function(){ return false; },
  allPalletCultivars: function(){ return []; },
  allVfCultivars: function(){ return []; },
  allGhCultivars: function(){ return []; },
  supportsMulticut: function(){ return false; },
  cutIntervalRange: function(){ return [10, 20]; },
  getGhCvStandards: function(){ return {}; },
  clamp: function(v, a, b){ return Math.max(a, Math.min(b, v)); },
  round: function(n){ return Math.round(n); },
  r1: function(n){ return Math.round(n * 10) / 10; },
  r2: function(n){ return Math.round(n * 100) / 100; },
  r3: function(n){ return Math.round(n * 1000) / 1000; },
  sumEconEquipment: function(){ return 0; },
  sumEconEquipmentRaw: function(){ return 0; }
};

const sandbox = { window: {}, global: {}, console: console, deps: deps };
sandbox.window = sandbox;
sandbox.global = sandbox;

vm.runInNewContext(fs.readFileSync(path.join(root, 'js/cut-model.js'), 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/econ-core.js'), 'utf8'), sandbox);

var core = sandbox.DG_createEconCore(deps);
state.econ = core.defaultEconState();
core.ensureEconCultures();
core.migrateEconOtherElectricity(state.econ);

state.econ.plantingArea = 150;
state.econ.rentMonth = 50000;
state.econ.salePrice = 900;
state.econ.cultures[0].pct = 100;
state.econ.cultures[0].cvId = 'golden-test';
state.econ.cultures[0].yieldPerCut = 20;
state.econ.cultures[0].salePrice = 900;
state.econ.cultures[0].density = 80;

var farm = core.calcFarmEconomics(state.econ);
var checks = [];
function ok(c, m){ checks.push({ ok: c, msg: m }); }

ok(farm.plantingArea === 150, 'plantingArea 150');
ok(farm.revenue > 0, 'revenue > 0');
ok(farm.monthlyOpex > 0, 'monthlyOpex > 0');
ok(typeof farm.margin === 'number', 'margin defined');
ok(farm.margin < farm.revenue, 'margin < revenue');

var eHi = JSON.parse(JSON.stringify(state.econ));
eHi.salePrice = 990;
var farmHi = core.calcFarmEconomics(eHi);
ok(farmHi.revenue >= farm.revenue, '+10% price → revenue not lower');

var eLo = JSON.parse(JSON.stringify(state.econ));
eLo.cultures[0].yieldPerCut = 10;
var farmLo = core.calcFarmEconomics(eLo);
ok(farmLo.revenue <= farm.revenue || farmLo.sellKg <= farm.sellKg, 'lower yield reduces output');

var failed = checks.filter(function(c){ return !c.ok; });
checks.forEach(function(c){ console.log((c.ok ? 'OK  ' : 'FAIL') + ' ' + c.msg); });
console.log('\n' + (failed.length ? failed.length + ' golden failed' : 'Golden scenarios passed'));
process.exit(failed.length ? 1 : 0);
