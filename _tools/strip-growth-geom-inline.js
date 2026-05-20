'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

if (!/const COLLAPSE_DEFAULTS = global\.DG_COLLAPSE_DEFAULTS/.test(t)) {
  const collapseRe =
    /  const COLLAPSE_DEFAULTS = \{[\s\S]*?    'panel-pallet-guide': true\r?\n  \};/;
  if (!collapseRe.test(t)) {
    console.error('COLLAPSE_DEFAULTS block missing');
    process.exit(1);
  }
  t = t.replace(
    collapseRe,
    '  const COLLAPSE_DEFAULTS = global.DG_COLLAPSE_DEFAULTS || {};'
  );
}

const growthStart = t.indexOf('  /* ---- Environment modulation ---- */');
const growthEnd = t.indexOf('  const GH_STANDARDS_STORAGE = global.DG_GH_STANDARDS_STORAGE');
if (growthStart < 0 || growthEnd < 0 || growthEnd <= growthStart) {
  console.error('growth block', growthStart, growthEnd);
  process.exit(1);
}

const growthShim = [
  '  var _growthCore;',
  '  function dliFactor(){ return _growthCore.dliFactor(); }',
  '  function photoperiodFactor(){ return _growthCore.photoperiodFactor(); }',
  '  function tempFactor(cv){ return _growthCore.tempFactor(cv); }',
  '  function greenhouseHeatYieldFactor(temp){ return _growthCore.greenhouseHeatYieldFactor(temp); }',
  '  function greenhouseHeatYieldLossPct(temp){ return _growthCore.greenhouseHeatYieldLossPct(temp); }',
  '  function isChannelGreenhouse(){ return _growthCore.isChannelGreenhouse(); }',
  '  function isControlledEnv(){ return _growthCore.isControlledEnv(); }',
  '  function isPlantingYieldView(){ return _growthCore.isPlantingYieldView(); }',
  '  function isGreenhousePlanting(){ return _growthCore.isGreenhousePlanting(); }',
  '  function effectiveTempFactor(cv){ return _growthCore.effectiveTempFactor(cv); }',
  '  function boltShift(cv){ return _growthCore.boltShift(cv); }',
  '  function envK(cv){ return _growthCore.envK(cv); }',
  '  function envBolt(cv){ return _growthCore.envBolt(cv); }',
  '  function envMultiplier(cv){ return _growthCore.envMultiplier(cv); }',
  '  function crowdingFactor(canopyAtMax, nearestDist){ return _growthCore.crowdingFactor(canopyAtMax, nearestDist); }',
  '  function effectiveCa(cv){ return _growthCore.effectiveCa(cv); }',
  '  function totalAge(channelDay){ return _growthCore.totalAge(channelDay); }',
  '  function massAtTotal(cv, t){ return _growthCore.massAtTotal(cv, t); }',
  '  function canopyAtTotal(cv, t){ return _growthCore.canopyAtTotal(cv, t); }',
  '  function rgrAtTotal(cv, t){ return _growthCore.rgrAtTotal(cv, t); }',
  '  function harvestTotal(cv){ return _growthCore.harvestTotal(cv); }',
  '  function harvestChannel(cv){ return _growthCore.harvestChannel(cv); }',
  ''
].join('\r\n');

const growthInit = `  _growthCore = global.DG_createPlantingGrowthCore({
    getState: function(){ return state; },
    clamp: clamp,
    getGLM: function(){ return typeof DG_growthLightModel !== 'undefined' ? DG_growthLightModel : null; },
    getCv: getCv,
    getGeorgyMode: function(){ return georgyMode; },
    isVF: isVF,
    isPalletView: isPalletView,
    effectiveDLI: effectiveDLI,
    effectivePhotoperiod: effectivePhotoperiod,
    photoperiod: photoperiod,
    eveningHours: eveningHours,
    preChannelDays: preChannelDays
  });

`;

t = t.slice(0, growthStart) + growthShim + growthInit + t.slice(growthEnd);

const geomStart = t.indexOf('  function stageOf(t_channel, mass, tBoltCh, cv){');
const geomEnd = t.indexOf('  function georgyChannelTwoRows(){');
if (geomStart < 0 || geomEnd < 0 || geomEnd <= geomStart) {
  console.error('geom block', geomStart, geomEnd);
  process.exit(1);
}

const geomShim = [
  '  var _geomUi;',
  '  function stageOf(t_channel, mass, tBoltCh, cv){ return _geomUi.stageOf(t_channel, mass, tBoltCh, cv); }',
  '  function holeDiameter(cv){ return _geomUi.holeDiameter(cv); }',
  '  function updatePlantingGeomUI(){ return _geomUi.updatePlantingGeomUI(); }',
  ''
].join('\r\n');

const geomInit = `  _geomUi = global.DG_createPlantingGeomUi({
    getState: function(){ return state; },
    $: $,
    getCv: getCv,
    isVF: isVF,
    isPalletView: isPalletView,
    pt: pt,
    palletCellGeometry: palletCellGeometry,
    syncPalletZoneLength: syncPalletZoneLength,
    syncPalletMountButtons: syncPalletMountButtons,
    syncPalletPlantsHint: syncPalletPlantsHint,
    syncPalletTierHint: syncPalletTierHint,
    syncPalletCellButtons: syncPalletCellButtons,
    syncBioMarginVisibility: syncBioMarginVisibility
  });

`;

t = t.slice(0, geomStart) + geomShim + geomInit + t.slice(geomEnd);

const tag1 =
  '<script src="js/growth-light-model.js?v=2026-05-19-p71-audit-fixes"></script>';
const tag1n =
  tag1 +
  '\r\n<script src="js/planting-growth-core.js?v=2026-05-19-p71-audit-fixes"></script>';
if (!t.includes(tag1n)) {
  if (!t.includes(tag1)) {
    console.error('growth-light-model tag missing');
    process.exit(1);
  }
  t = t.replace(tag1, tag1n);
}

const tag2 =
  '<script src="js/planting-layout.js?v=2026-05-19-p71-audit-fixes"></script>';
const tag2n =
  tag2 + '\r\n<script src="js/planting-geom-ui.js?v=2026-05-19-p71-audit-fixes"></script>';
if (!t.includes(tag2n)) {
  if (!t.includes(tag2)) {
    console.error('planting-layout tag missing');
    process.exit(1);
  }
  t = t.replace(tag2, tag2n);
}

fs.writeFileSync(p, t);
console.log('strip-growth-geom-inline ok');
