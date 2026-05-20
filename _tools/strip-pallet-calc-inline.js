'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const mSnap = t.indexOf('  const plantingSnapshots = { channels: null, pallets: null };');
const mEcon = t.indexOf('  const ECON_STORAGE =');
const mPallet = t.indexOf('  function getActivePlantingCvId(){');
const mLight = t.indexOf('  function dliFromPpfd(ppfd, ph)');
const mRange = t.indexOf('  /* Biological range factors');
const mCalc = t.indexOf('  /* ---- Scenario calc:');
const mGeorgyVar = t.indexOf('  var georgyMode;');

if ([mSnap, mEcon, mPallet, mLight, mRange, mCalc, mGeorgyVar].some(function (x) {
  return x < 0;
})) {
  console.error('markers', mSnap, mEcon, mPallet, mLight, mRange, mCalc, mGeorgyVar);
  process.exit(1);
}

const shimPallet =
  '  var _palletRuntime, plantingSnapshots;\n' +
  '  function capturePlantingViewSnapshot(v){ return _palletRuntime.capturePlantingViewSnapshot(v); }\n' +
  '  function restorePlantingViewSnapshot(v, s){ return _palletRuntime.restorePlantingViewSnapshot(v, s); }\n' +
  '  function getActivePlantingCvId(){ return _palletRuntime.getActivePlantingCvId(); }\n' +
  '  function showAsPalletCalc(r){ return _palletRuntime.showAsPalletCalc(r); }\n' +
  '  function vegContextLabel(s){ return _palletRuntime.vegContextLabel(s); }\n' +
  '  function vegContextLabelCap(){ return _palletRuntime.vegContextLabelCap(); }\n' +
  '  function palletMountMode(){ return _palletRuntime.palletMountMode(); }\n' +
  '  function plantsPerPalletCount(){ return _palletRuntime.plantsPerPalletCount(); }\n' +
  '  function syncPalletZoneLength(){ return _palletRuntime.syncPalletZoneLength(); }\n' +
  '  function syncPalletMountButtons(){ return _palletRuntime.syncPalletMountButtons(); }\n' +
  '  function syncPalletMountUI(){ return _palletRuntime.syncPalletMountUI(); }\n' +
  '  function syncPalletTierHint(){ return _palletRuntime.syncPalletTierHint(); }\n' +
  '  function syncPalletPlantsHint(){ return _palletRuntime.syncPalletPlantsHint(); }\n' +
  '  function schemaCanopyMm(r){ return _palletRuntime.schemaCanopyMm(r); }\n' +
  '  function syncSchemaCanopyLegend(mm){ return _palletRuntime.syncSchemaCanopyLegend(mm); }\n' +
  '  function getCellCenters(n, l, w){ return _palletRuntime.getCellCenters(n, l, w); }\n' +
  '  function palletCellGeometry(c, m){ return _palletRuntime.palletCellGeometry(c, m); }\n' +
  '  function plantsPerPallet(){ return _palletRuntime.plantsPerPallet(); }\n' +
  '\n';

const shimLight =
  '  var _lightEnergy;\n' +
  '  function dliFromPpfd(ppfd, ph){ return _lightEnergy.dliFromPpfd(ppfd, ph); }\n' +
  '  function ppfdFromDli(dli, ph){ return _lightEnergy.ppfdFromDli(dli, ph); }\n' +
  '  function ledEfficacy(){ return _lightEnergy.ledEfficacy(); }\n' +
  '  function kwhPerSqmPerDayFromDli(dli){ return _lightEnergy.kwhPerSqmPerDayFromDli(dli); }\n' +
  '\n';

const shimCalc =
  '  var _calcCore;\n' +
  '  function calcScenario(opts){ return _calcCore.calcScenario(opts); }\n' +
  '  function calcScenarioVf(id, opts){ return _calcCore.calcScenarioVf(id, opts); }\n' +
  '  function calcScenarioPallet(id, opts){ return _calcCore.calcScenarioPallet(id, opts); }\n' +
  '  function calc(){ return _calcCore.calc(); }\n' +
  '\n';

t = t.slice(0, mSnap) + shimPallet + t.slice(mEcon);
t = t.replace('  function getActivePlantingCvId(){', shimLight + '  /* getActivePlantingCvId moved */ function __removed_getActivePlantingCvId(){');

const mp2 = t.indexOf('  /* getActivePlantingCvId moved */');
const ml2 = t.indexOf('  function dliFromPpfd(ppfd, ph)');
const mr2 = t.indexOf('  /* Biological range factors');
if (mp2 < 0) {
  console.error('pallet marker');
  process.exit(1);
}
t = t.slice(0, mp2) + t.slice(ml2, mLight) + t.slice(mr2);

const mc2 = t.indexOf('  /* ---- Scenario calc:');
const mg2 = t.indexOf('  var georgyMode;');
t = t.slice(0, mc2) + shimCalc + t.slice(mg2);

const initLight =
  '\n  _lightEnergy = global.DG_createPlantingLightEnergy({\n' +
  '    getState: function(){ return state; },\n' +
  '    isVF: isVF, isPalletView: isPalletView\n' +
  '  });\n';

const geomUi = t.indexOf('  var _geomUi;');
t = t.slice(0, geomUi) + initLight + t.slice(geomUi);

const initPallet =
  '\n  _palletRuntime = global.DG_createPlantingPalletRuntime({\n' +
  '    getState: function(){ return state; },\n' +
  '    $: $, ui: ui, r1: r1, round: round, clamp: clamp,\n' +
  '    isVF: isVF, isPalletView: isPalletView, allPalletCultivars: allPalletCultivars,\n' +
  '    getPalletCv: getPalletCv, initPalletValuesFromSheet: initPalletValuesFromSheet,\n' +
  '    setFacility: setFacility, syncManualMassUI: syncManualMassUI, syncCanopyUI: syncCanopyUI,\n' +
  '    modelCanopyFromMass: modelCanopyFromMass, effectivePalletHoleCount: effectivePalletHoleCount,\n' +
  '    VF_CULTIVARS: VF_CULTIVARS,\n' +
  '    CASSETTES_PER_PALLET: CASSETTES_PER_PALLET, CASSETTE_L_MM: CASSETTE_L_MM, CASSETTE_W_MM: CASSETTE_W_MM,\n' +
  '    PALLET_L_MM: PALLET_L_MM, PALLET_W_MM: PALLET_W_MM, PALLET_L_M: PALLET_L_M, PALLET_W_M: PALLET_W_M,\n' +
  '    PALLET_TIER_ZONE_MM: PALLET_TIER_ZONE_MM\n' +
  '  });\n' +
  '  plantingSnapshots = _palletRuntime.getSnapshotsStore();\n';

const geomUi2 = t.indexOf('  var _geomUi;');
t = t.slice(0, geomUi2) + initPallet + t.slice(geomUi2);

const initCalc =
  '\n  _calcCore = global.DG_createPlantingCalcCore({\n' +
  '    getState: function(){ return state; },\n' +
  '    getGeorgyMode: function(){ return georgyMode; }, georgyMode: georgyMode,\n' +
  '    findCvById: findCvById, getCv: getCv, getVfCv: getVfCv, getPalletCv: getPalletCv,\n' +
  '    isPalletView: isPalletView, isVF: isVF, allPalletCultivars: allPalletCultivars, allVfCultivars: allVfCultivars,\n' +
  '    harvestChannel: harvestChannel, totalAge: totalAge, massAtTotal: massAtTotal, plantLayout: plantLayout,\n' +
  '    plantLayoutPallet: plantLayoutPallet, effectiveCa: effectiveCa, crowdingFactor: crowdingFactor,\n' +
  '    manualHarvestMass: manualHarvestMass, preChannelDays: preChannelDays,\n' +
  '    lightingMolForEnergy: lightingMolForEnergy, kwhPerSqmPerDayFromDli: kwhPerSqmPerDayFromDli,\n' +
  '    dliFactor: dliFactor, effectiveTempFactor: effectiveTempFactor, tempFactor: tempFactor,\n' +
  '    naturalDLI: naturalDLI, effectiveDLI: effectiveDLI, boltShift: boltShift,\n' +
  '    calcFromVfSheet: calcFromVfSheet, calcFromPalletSheet: calcFromPalletSheet,\n' +
  '    applyPalletStandardsFromSheet: applyPalletStandardsFromSheet,\n' +
  '    getPlantingStateEconSlice: getPlantingStateEconSlice, restorePlantingStateEconSlice: restorePlantingStateEconSlice,\n' +
  '    canopyAtTotal: canopyAtTotal, applyCutIntervalHarvestMods: applyCutIntervalHarvestMods,\n' +
  '    rgrAtTotal: rgrAtTotal, boltChannel: boltChannel, stageOf: stageOf, holeDiameter: holeDiameter,\n' +
  '    harvestCanopy: harvestCanopy, MAX_WIDTH: MAX_WIDTH, CH_W: CH_W\n' +
  '  });\n';

const plantLayoutEnd = t.indexOf('  function plantLayout(cv){');
const plantLayoutFn = t.indexOf('  }\n\n  var georgyMode;', plantLayoutEnd);
if (plantLayoutFn < 0) {
  const alt = t.indexOf('  var georgyMode;', plantLayoutEnd);
  if (alt < 0) {
    console.error('plantLayout end');
    process.exit(1);
  }
  t = t.slice(0, alt) + initCalc + t.slice(alt);
} else {
  t = t.slice(0, plantLayoutFn + 4) + initCalc + t.slice(plantLayoutFn + 4);
}

const renderTag = '<script src="js/planting-render.js?v=2026-05-19-p71-audit-fixes"></script>';
const newTags =
  '<script src="js/planting-pallet-runtime.js?v=2026-05-19-p71-audit-fixes"></script>\r\n' +
  '<script src="js/planting-light-energy.js?v=2026-05-19-p71-audit-fixes"></script>\r\n' +
  '<script src="js/planting-calc-core.js?v=2026-05-19-p71-audit-fixes"></script>\r\n' +
  renderTag;
if (!t.includes('planting-pallet-runtime.js')) {
  if (!t.includes(renderTag)) {
    console.error('render tag missing');
    process.exit(1);
  }
  t = t.replace(renderTag, newTags);
}

fs.writeFileSync(p, t);
console.log('strip-pallet-calc-inline ok');
