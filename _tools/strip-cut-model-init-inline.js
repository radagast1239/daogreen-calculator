'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const oldVars =
  '  var parseNumsFromStr, vfCutIntervalFromCv, cutIntervalRange, cutIntervalMods, applyCutIntervalHarvestMods;\r\n  var supportsMulticut, effectiveCutInterval, cutMassPerPlant, vfMulticutStats, getMulticutYieldPerPlant;';
const newVars = [
  '  var _cutModel;',
  '  function parseNumsFromStr(s){ return _cutModel.parseNumsFromStr(s); }',
  '  function vfCutIntervalFromCv(cv){ return _cutModel.vfCutIntervalFromCv(cv); }',
  '  function cutIntervalRange(cv){ return _cutModel.cutIntervalRange(cv); }',
  '  function cutIntervalMods(cv){ return _cutModel.cutIntervalMods(cv); }',
  '  function applyCutIntervalHarvestMods(cv, mass, canopy){ return _cutModel.applyCutIntervalHarvestMods(cv, mass, canopy); }',
  '  function supportsMulticut(cv){ return _cutModel.supportsMulticut(cv); }',
  '  function effectiveCutInterval(){ return _cutModel.effectiveCutInterval(); }',
  '  function cutMassPerPlant(cv, cutIndex){ return _cutModel.cutMassPerPlant(cv, cutIndex); }',
  '  function vfMulticutStats(cv){ return _cutModel.vfMulticutStats(cv); }',
  '  function getMulticutYieldPerPlant(cv){ return _cutModel.getMulticutYieldPerPlant(cv); }'
].join('\r\n');

if (!t.includes(oldVars)) {
  console.error('cut model var block missing');
  process.exit(1);
}
t = t.replace(oldVars, newVars);

const initStart = t.indexOf('  function initCutModel(){');
const initEnd = t.indexOf('  initCutModel();\r\n\r\n  function stageOf(t_channel, mass, tBoltCh, cv){');
if (initStart < 0 || initEnd < 0 || initEnd <= initStart) {
  console.error('initCutModel block', initStart, initEnd);
  process.exit(1);
}

const initBlock = `  _cutModel = global.DG_createPlantingCutModelInit({
    getState: function(){ return state; },
    clamp: clamp,
    getActiveCv: getActiveCv,
    isVF: isVF,
    isPalletView: isPalletView,
    isVfSheetCv: isVfSheetCv,
    isPalletSheetCv: isPalletSheetCv,
    isSheetCv: isSheetCv,
    usePlantingSheet: usePlantingSheet,
    getPlantingStd: getPlantingStd,
    getGhCutMass: getGhCutMass,
    envMultiplier: envMultiplier,
    vfEffectiveDay: vfEffectiveDay,
    harvestChannel: harvestChannel,
    boltChannel: boltChannel,
    totalAge: totalAge,
    envBolt: envBolt,
    georgyMode: georgyMode,
    isChannelGreenhouse: isChannelGreenhouse
  });

`;

t = t.slice(0, initStart) + initBlock + t.slice(initEnd + '  initCutModel();\r\n\r\n'.length);

const scriptTag = '<script src="js/cut-model.js?v=2026-05-19-p71-audit-fixes"></script>';
const scriptNew =
  scriptTag +
  '\r\n<script src="js/planting-cut-model-init.js?v=2026-05-19-p71-audit-fixes"></script>';
if (!t.includes(scriptNew)) {
  if (!t.includes(scriptTag)) {
    console.error('cut-model script tag missing');
    process.exit(1);
  }
  t = t.replace(scriptTag, scriptNew);
}

fs.writeFileSync(p, t);
console.log('strip-cut-model-init-inline ok');
