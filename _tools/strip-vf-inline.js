'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');
const a = t.indexOf('  function getVfFieldStandard(cv, key){');
const b = t.indexOf('  function syncPalletCellButtons(){', a);
if (a < 0 || b < 0) {
  console.error('markers', a, b);
  process.exit(1);
}
const shim = [
  '  var _vfStandards;',
  '  function getVfFieldStandard(cv, key){ return _vfStandards.getVfFieldStandard(cv, key); }',
  '  function getVfFieldCurrent(key){ return _vfStandards.getVfFieldCurrent(key); }',
  '  function isVfFieldAtStandard(key, cv){ return _vfStandards.isVfFieldAtStandard(key, cv); }',
  '  function applyVfStandardField(key){ return _vfStandards.applyVfStandardField(key); }',
  '  function syncVegPeriodTotal(){ return _vfStandards.syncVegPeriodTotal(); }',
  '  function syncVfStdBadges(){ return _vfStandards.syncVfStdBadges(); }',
  '  function bindVfStdBadges(){ return _vfStandards.bindVfStdBadges(); }',
  '  function isVfSheetCv(cv){ return _vfStandards.isVfSheetCv(cv); }',
  '  function preChannelDays(){ return _vfStandards.preChannelDays(); }',
  '  function vfEffectiveGermination(cv){ return _vfStandards.vfEffectiveGermination(cv); }',
  '  function vfEffectiveDay(cv){ return _vfStandards.vfEffectiveDay(cv); }',
  '  function vfEffectiveDensity(cv){ return _vfStandards.vfEffectiveDensity(cv); }',
  '  function vfEffectiveMass(cv, massAuto){ return _vfStandards.vfEffectiveMass(cv, massAuto); }',
  '  function syncCutMassUI(){ return _vfStandards.syncCutMassUI(); }',
  '  function syncMulticutDetailUI(){ return _vfStandards.syncMulticutDetailUI(); }',
  '  function applyCutStandardsFromSheet(cv){ return _vfStandards.applyCutStandardsFromSheet(cv); }',
  '  function syncVfStdControls(){ return _vfStandards.syncVfStdControls(); }',
  '  function updateVfCvHint(){ return _vfStandards.updateVfCvHint(); }',
  '  function renderVfStdGrid(){ return _vfStandards.renderVfStdGrid(); }',
  '  function resetVfStdToSheetDefaults(){ return _vfStandards.resetVfStdToSheetDefaults(); }',
  '  function applyVfStandardsFromSheet(cv){ return _vfStandards.applyVfStandardsFromSheet(cv); }',
  '  function calcFromVfSheet(cv){ return _vfStandards.calcFromVfSheet(cv); }',
  ''
].join('\n');
t = t.slice(0, a) + shim + t.slice(b);
fs.writeFileSync(p, t);
console.log('stripped', b - a);
