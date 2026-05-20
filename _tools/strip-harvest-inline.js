'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');
const a = t.indexOf('  function manualHarvestMass(massAuto){');
const b = t.indexOf('  const clamp = (v, lo, hi)');
if (a < 0 || b < 0) {
  console.error('markers', a, b);
  process.exit(1);
}
const shim = [
  '  var _harvestUi;',
  '  function manualHarvestMass(massAuto){ return _harvestUi.manualHarvestMass(massAuto); }',
  '  function modelCanopyFromMass(cv, mass){ return _harvestUi.modelCanopyFromMass(cv, mass); }',
  '  function standardCanopyMm(cv, mass){ return _harvestUi.standardCanopyMm(cv, mass); }',
  '  function harvestCanopy(cv, mass){ return _harvestUi.harvestCanopy(cv, mass); }',
  '  function applyCanopyStandard(cv, mass){ return _harvestUi.applyCanopyStandard(cv, mass); }',
  '  function formatHarvestCtrlVal(val, rangeFn){ return _harvestUi.formatHarvestCtrlVal(val, rangeFn); }',
  '  function syncManualMassUI(){ return _harvestUi.syncManualMassUI(); }',
  '  function syncCanopyUI(){ return _harvestUi.syncCanopyUI(); }',
  '  function syncManualCanopyUI(){ return _harvestUi.syncManualCanopyUI(); }',
  '  function syncHarvestBlockUI(r){ return _harvestUi.syncHarvestBlockUI(r); }',
  '  function updateMassModelHint(massAuto, mass, canopyAuto, canopy){ return _harvestUi.updateMassModelHint(massAuto, mass, canopyAuto, canopy); }',
  '  function rangeMass(v){ return _harvestUi.rangeMass(v); }',
  '  function rangeCanopy(v){ return _harvestUi.rangeCanopy(v); }',
  ''
].join('\n');
t = t.slice(0, a) + shim + t.slice(b);
fs.writeFileSync(p, t);
console.log('stripped', b - a);
