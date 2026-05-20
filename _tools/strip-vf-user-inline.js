'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const vfConst = "  const VF_STANDARDS_STORAGE = 'calc-vf-user-standards';";
const vfConstNew =
  "  const VF_STANDARDS_STORAGE = global.DG_VF_STANDARDS_STORAGE || 'calc-vf-user-standards';";
if (!t.includes(vfConst)) {
  console.error('VF_STANDARDS_STORAGE marker missing');
  process.exit(1);
}
t = t.replace(vfConst, vfConstNew);

const vfStart = t.indexOf('  function buildDefaultVfStandards(cv){');
const vfEnd = t.indexOf('  _ghStandards = global.DG_createPlantingGhStandards({');
if (vfStart < 0 || vfEnd < 0 || vfEnd <= vfStart) {
  console.error('vf block markers', vfStart, vfEnd);
  process.exit(1);
}

const vfShim = [
  '  var _vfUserStandards;',
  '  function loadVfStandardsStore(){ return _vfUserStandards.loadVfStandardsStore(); }',
  '  function saveVfStandardsStore(){ return _vfUserStandards.saveVfStandardsStore(); }',
  '  function buildDefaultVfStandards(cv){ return _vfUserStandards.buildDefaultVfStandards(cv); }',
  '  function getVfCvStandards(cv){ return _vfUserStandards.getVfCvStandards(cv); }',
  '  function readVfStandardsFromState(){ return _vfUserStandards.readVfStandardsFromState(); }',
  '  function applyVfProfileToStateOnly(s, cv){ return _vfUserStandards.applyVfProfileToStateOnly(s, cv); }',
  '  function applyVfUserStandardsToState(s){ return _vfUserStandards.applyVfUserStandardsToState(s); }',
  '  function applyVfStandardFromStore(cv){ return _vfUserStandards.applyVfStandardFromStore(cv); }',
  '  function renderVfStandardsPanel(){ return _vfUserStandards.renderVfStandardsPanel(); }',
  ''
].join('\n');

t = t.slice(0, vfStart) + vfShim + t.slice(vfEnd);

const customCvMarker = '\n\n  _customCv = global.DG_createPlantingCustomCv({';
const customCvIdx = t.indexOf(customCvMarker);
if (customCvIdx < 0) {
  console.error('_customCv marker after gh init missing');
  process.exit(1);
}

const vfInit = `  _vfUserStandards = global.DG_createPlantingVfUserStandards({
    getState: function(){ return state; },
    $: $,
    storageKey: VF_STANDARDS_STORAGE,
    clamp: function(v, lo, hi){ return clamp(v, lo, hi); },
    getVfCv: getVfCv,
    VF_CULTIVARS: VF_CULTIVARS,
    cutIntervalRange: function(cv){ return cutIntervalRange(cv); },
    modelCanopyFromMass: modelCanopyFromMass,
    DENSITY_MAX: DENSITY_MAX,
    syncManualMassUI: syncManualMassUI,
    syncCutMassUI: syncCutMassUI,
    syncCanopyUI: syncCanopyUI,
    syncVegPeriodTotal: syncVegPeriodTotal,
    syncVfStdBadges: syncVfStdBadges,
    renderVfStdGrid: renderVfStdGrid,
    isVF: isVF,
    isPalletView: isPalletView,
    ui: ui,
    pt: pt,
    pm: pm
  });

`;

t = t.slice(0, customCvIdx) + '\n' + vfInit + t.slice(customCvIdx);

const vfBodyStart = t.indexOf('  function getVfCvStandards(cv){\r\n    cv = cv || getVfCv();');
const boltStart = t.indexOf('  function boltChannel(cv){');
if (vfBodyStart >= 0 && boltStart > vfBodyStart) {
  t = t.slice(0, vfBodyStart) + t.slice(boltStart);
}

const ghProfDup = t.indexOf('  function applyGhProfileToStateOnly(s, cv){\r\n    cv = cv || getCv();');
const ghProfEnd = t.indexOf('  function boltChannel(cv){');
if (ghProfDup >= 0 && ghProfEnd > ghProfDup) {
  const shimLine = '  function applyGhProfileToStateOnly(s, cv){ return _ghStandards.applyGhProfileToStateOnly(s, cv); }';
  if (t.slice(ghProfDup, ghProfDup + shimLine.length) !== shimLine) {
    t = t.slice(0, ghProfDup) + t.slice(ghProfEnd);
  }
}

const ghRenderDup = t.indexOf('  function renderGhStandardsPanel(){\r\n    if (isVF() || isPalletView()) return;');
const ghRenderEnd = t.indexOf('  function boltChannel(cv){');
if (ghRenderDup >= 0 && ghRenderEnd > ghRenderDup) {
  t = t.slice(0, ghRenderDup) + t.slice(ghRenderEnd);
}

const scriptTag =
  '<script src="js/planting-gh-standards.js?v=2026-05-19-p71-audit-fixes"></script>';
const scriptNew =
  scriptTag +
  '\n<script src="js/planting-vf-user-standards.js?v=2026-05-19-p71-audit-fixes"></script>';
if (!t.includes(scriptNew)) {
  if (!t.includes(scriptTag)) {
    console.error('gh script tag missing');
    process.exit(1);
  }
  t = t.replace(scriptTag, scriptNew);
}

fs.writeFileSync(p, t);
console.log('strip-vf-user-inline ok');
