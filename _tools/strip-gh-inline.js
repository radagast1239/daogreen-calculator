'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const ghConst = "  const GH_STANDARDS_STORAGE = 'calc-gh-user-standards';";
const ghConstNew =
  "  const GH_STANDARDS_STORAGE = global.DG_GH_STANDARDS_STORAGE || 'calc-gh-user-standards';";
if (!t.includes(ghConst)) {
  console.error('GH_STANDARDS_STORAGE marker missing');
  process.exit(1);
}
t = t.replace(ghConst, ghConstNew);

const start = t.indexOf('  function loadGhStandardsStore(){');
const end = t.indexOf('  function buildDefaultVfStandards(cv){');
if (start < 0 || end < 0 || end <= start) {
  console.error('block markers', start, end);
  process.exit(1);
}

const shim = [
  '  var _ghStandards;',
  '  function loadGhStandardsStore(){ return _ghStandards.loadGhStandardsStore(); }',
  '  function saveGhStandardsStore(){ return _ghStandards.saveGhStandardsStore(); }',
  '  function defaultGhCutMasses(cv){ return _ghStandards.defaultGhCutMasses(cv); }',
  '  function buildDefaultGhStandards(cv){ return _ghStandards.buildDefaultGhStandards(cv); }',
  '  function getGhCvStandards(cv){ return _ghStandards.getGhCvStandards(cv); }',
  '  function readGhStandardsFromState(cv){ return _ghStandards.readGhStandardsFromState(cv); }',
  '  function applyGhStandardsToState(s){ return _ghStandards.applyGhStandardsToState(s); }',
  '  function applyGhStandardFromStore(cv){ return _ghStandards.applyGhStandardFromStore(cv); }',
  '  function getGhCutMass(i){ return _ghStandards.getGhCutMass(i); }',
  '  function ghCutCountMax(cv){ return _ghStandards.ghCutCountMax(cv); }',
  '  function rebuildGhCutCountRow(cv){ return _ghStandards.rebuildGhCutCountRow(cv); }',
  '  function syncMulticutBabyUi(cv){ return _ghStandards.syncMulticutBabyUi(cv); }',
  '  function syncGhCutsUI(){ return _ghStandards.syncGhCutsUI(); }',
  '  function syncGhFacilityPanels(){ return _ghStandards.syncGhFacilityPanels(); }',
  '  function applyGhProfileToStateOnly(s, cv){ return _ghStandards.applyGhProfileToStateOnly(s, cv); }',
  '  function renderGhStandardsPanel(){ return _ghStandards.renderGhStandardsPanel(); }',
  ''
].join('\n');

t = t.slice(0, start) + shim + t.slice(end);

const profStart = t.indexOf('  function applyGhProfileToStateOnly(s, cv){\n    cv = cv || getCv();');
const profEnd = t.indexOf('  function applyVfUserStandardsToState(s){');
if (profStart >= 0 && profEnd > profStart) {
  t = t.slice(0, profStart) + t.slice(profEnd);
}

const renderStart = t.indexOf('  function renderGhStandardsPanel(){\n    if (isVF() || isPalletView()) return;');
const renderEnd = t.indexOf('  function boltChannel(cv){');
if (renderStart >= 0 && renderEnd > renderStart) {
  t = t.slice(0, renderStart) + t.slice(renderEnd);
}

const initMarker = '  _customCv = global.DG_createPlantingCustomCv({';
const initIdx = t.indexOf(initMarker);
if (initIdx < 0) {
  console.error('customCv init missing');
  process.exit(1);
}

const initBlock = `  _ghStandards = global.DG_createPlantingGhStandards({
    getState: function(){ return state; },
    $: $,
    storageKey: GH_STANDARDS_STORAGE,
    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },
    getCv: getCv,
    ui: ui,
    pt: pt,
    pm: pm,
    ptf: ptf,
    DENSITY_MAX: DENSITY_MAX,
    envMultiplier: envMultiplier,
    harvestChannel: harvestChannel,
    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },
    modelCanopyFromMass: modelCanopyFromMass,
    syncCanopyUI: syncCanopyUI,
    syncVegPeriodTotal: syncVegPeriodTotal,
    syncBioMarginVisibility: syncBioMarginVisibility,
    isVF: isVF,
    isPalletView: isPalletView,
    georgyMode: georgyMode,
    renderAll: renderAll
  });

`;
t = t.slice(0, initIdx) + initBlock + t.slice(initIdx);

const scriptTag =
  '<script src="js/planting-harvest-ui.js?v=2026-05-19-p71-audit-fixes"></script>';
const scriptNew =
  scriptTag +
  '\n<script src="js/planting-gh-standards.js?v=2026-05-19-p71-audit-fixes"></script>';
if (!t.includes(scriptNew)) {
  if (!t.includes(scriptTag)) {
    console.error('harvest script tag missing');
    process.exit(1);
  }
  t = t.replace(scriptTag, scriptNew);
}

fs.writeFileSync(p, t);
console.log('strip-gh-inline ok');
