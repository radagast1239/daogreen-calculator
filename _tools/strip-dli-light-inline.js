'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const start = t.indexOf('  /* ---- Effective DLI calculation (см. js/growth-light-model.js) ---- */');
const end = t.indexOf('  var _growthCore;');
if (start < 0 || end < 0 || end <= start) {
  console.error('dli block', start, end);
  process.exit(1);
}

const shim = [
  '  var _dliLight;',
  '  function naturalDLI(){ return _dliLight.naturalDLI(); }',
  '  function photoperiod(){ return _dliLight.photoperiod(); }',
  '  function eveningHours(){ return _dliLight.eveningHours(); }',
  '  function eveningSupplement(){ return _dliLight.eveningSupplement(); }',
  '  function daySupplement(){ return _dliLight.daySupplement(); }',
  '  function supplementDLI(){ return _dliLight.supplementDLI(); }',
  '  function effectiveDLI(){ return _dliLight.effectiveDLI(); }',
  '  function effectivePhotoperiod(){ return _dliLight.effectivePhotoperiod(); }',
  '  function lightingMolForEnergy(){ return _dliLight.lightingMolForEnergy(); }',
  ''
].join('\r\n');

const init = `  _dliLight = global.DG_createPlantingDliLight({
    getState: function(){ return state; },
    naturalDli: NATURAL_DLI,
    isVF: isVF,
    isPalletView: isPalletView,
    getGLM: function(){ return typeof DG_growthLightModel !== 'undefined' ? DG_growthLightModel : null; }
  });

`;

t = t.slice(0, start) + shim + init + t.slice(end);

const tag =
  '<script src="js/growth-light-model.js?v=2026-05-19-p71-audit-fixes"></script>\r\n<script src="js/planting-growth-core.js?v=2026-05-19-p71-audit-fixes"></script>';
const tagNew =
  '<script src="js/growth-light-model.js?v=2026-05-19-p71-audit-fixes"></script>\r\n<script src="js/planting-dli-light.js?v=2026-05-19-p71-audit-fixes"></script>\r\n<script src="js/planting-growth-core.js?v=2026-05-19-p71-audit-fixes"></script>';
if (!t.includes('planting-dli-light.js')) {
  if (!t.includes(tag)) {
    console.error('script anchor missing');
    process.exit(1);
  }
  t = t.replace(tag, tagNew);
}

fs.writeFileSync(p, t);
console.log('strip-dli-light-inline ok');
