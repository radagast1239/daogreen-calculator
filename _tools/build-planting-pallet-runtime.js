'use strict';
const fs = require('fs');
const path = require('path');

function extractBody(file) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/var lightSync = false;\s*\n([\s\S]*?)\s*return api;/);
  if (!m) throw new Error('body in ' + file);
  return m[1];
}

const snap = extractBody(path.join(__dirname, '..', 'js/planting-view-snapshot-body.js'));
const geom = extractBody(path.join(__dirname, '..', 'js/planting-pallet-geom-body.js'));

const depsHelpers = `    function ui(k, v) { return deps.ui(k, v); }
    function r1(n) { return deps.r1(n); }
    function round(n) { return deps.round(n); }
    function clamp(v, lo, hi) { return deps.clamp(v, lo, hi); }
    function isVF() { return deps.isVF(); }
    function isPalletView() { return deps.isPalletView(); }
    function allPalletCultivars() { return deps.allPalletCultivars(); }
    function getPalletCv() { return deps.getPalletCv(); }
    function initPalletValuesFromSheet(cv) { return deps.initPalletValuesFromSheet(cv); }
    function setFacility(mode) { return deps.setFacility(mode); }
    function syncManualMassUI() { return deps.syncManualMassUI(); }
    function syncCanopyUI() { return deps.syncCanopyUI(); }
    function modelCanopyFromMass(cv, m) { return deps.modelCanopyFromMass(cv, m); }
    function effectivePalletHoleCount() { return deps.effectivePalletHoleCount(); }
    var VF_CULTIVARS = deps.VF_CULTIVARS || [];
    var CASSETTES_PER_PALLET = deps.CASSETTES_PER_PALLET || 3;
    var CASSETTE_L_MM = deps.CASSETTE_L_MM || 400;
    var CASSETTE_W_MM = deps.CASSETTE_W_MM || 600;
    var PALLET_L_MM = deps.PALLET_L_MM || 1300;
    var PALLET_W_MM = deps.PALLET_W_MM || 650;
    var PALLET_L_M = deps.PALLET_L_M || 1.3;
    var PALLET_W_M = deps.PALLET_W_M || 0.65;
    var PALLET_TIER_ZONE_MM = deps.PALLET_TIER_ZONE_MM || 400;
`;

const syncCell = `  function syncPalletCellButtons(){
    var cells = st().palletCells || 54;
    document.querySelectorAll('.pallet-cell-btn').forEach(function(btn){
      btn.classList.toggle('on', parseInt(btn.dataset.cells, 10) === cells);
    });
    syncPalletPlantsHint();
  }
`;

const out =
  '/**\n * Поддоны: snapshot вида, геометрия ячеек, sync UI.\n * DG_createPlantingPalletRuntime(deps)\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingPalletRuntime(deps) {\n' +
  '    function st() { return deps.getState(); }\n' +
  '    function $(id) { return deps.$(id); }\n' +
  depsHelpers +
  '\n' +
  snap +
  '\n' +
  syncCell +
  '\n' +
  geom +
  '\n  function plantsPerPallet(){ return plantsPerPalletCount(); }\n' +
  '\n    return {\n' +
  '      getSnapshotsStore: function(){ return plantingSnapshots; },\n' +
  '      capturePlantingViewSnapshot: capturePlantingViewSnapshot,\n' +
  '      restorePlantingViewSnapshot: restorePlantingViewSnapshot,\n' +
  '      syncPalletCellButtons: syncPalletCellButtons,\n' +
  '      getActivePlantingCvId: getActivePlantingCvId,\n' +
  '      showAsPalletCalc: showAsPalletCalc,\n' +
  '      vegContextLabel: vegContextLabel,\n' +
  '      vegContextLabelCap: vegContextLabelCap,\n' +
  '      palletMountMode: palletMountMode,\n' +
  '      plantsPerPalletCount: plantsPerPalletCount,\n' +
  '      syncPalletZoneLength: syncPalletZoneLength,\n' +
  '      syncPalletMountButtons: syncPalletMountButtons,\n' +
  '      syncPalletMountUI: syncPalletMountUI,\n' +
  '      syncPalletTierHint: syncPalletTierHint,\n' +
  '      syncPalletPlantsHint: syncPalletPlantsHint,\n' +
  '      schemaCanopyMm: schemaCanopyMm,\n' +
  '      syncSchemaCanopyLegend: syncSchemaCanopyLegend,\n' +
  '      getCellCenters: getCellCenters,\n' +
  '      palletCellGeometry: palletCellGeometry,\n' +
  '      plantsPerPallet: plantsPerPallet\n' +
  '    };\n  }\n\n' +
  '  global.DG_createPlantingPalletRuntime = createPlantingPalletRuntime;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

fs.writeFileSync(path.join(__dirname, '..', 'js/planting-pallet-runtime.js'), out);
console.log('planting-pallet-runtime.js ok');
