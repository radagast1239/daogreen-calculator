'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'calculator-110x55_12.html');
let lines = fs.readFileSync(htmlPath, 'utf8').split(/\r?\n/);

const start = lines.findIndex((l) => /var getCv, isPalletView/.test(l));
const renderBlock = lines.findIndex((l) => /^\s*var _render;\s*$/.test(l));
const calcEnd = lines.findIndex((l, i) => i > start && /^\s*harvestCanopy: harvestCanopy, MAX_WIDTH: MAX_WIDTH, CH_W: CH_W\s*$/.test(l));
if (start < 0 || renderBlock < 0 || calcEnd < 0) throw new Error('markers: ' + [start, renderBlock, calcEnd]);

const renderLines = lines.slice(renderBlock, lines.findIndex((l, i) => i > renderBlock && /^\s*var _dliLight;\s*$/.test(l)));
const shims = fs
  .readFileSync(path.join(__dirname, 'planting-runtime-shims.txt'), 'utf8')
  .split('\n')
  .filter(function (l) {
    return l && !/var ICON = _rt\.ICON/.test(l);
  })
  .join('\n');

const wire =
  `  function plantingRuntimeDeps(){\n` +
  `    return {\n` +
  `      global: global,\n` +
  `      PC: PC,\n` +
  `      getState: function(){ return state; },\n` +
  `      getGeorgyMode: function(){ return georgyMode; },\n` +
  `      getPlantingHarvestYieldParams: function(){ return plantingHarvestYieldParams; },\n` +
  `      getPlantingStateEconSlice: function(){ return getPlantingStateEconSlice; },\n` +
  `      restorePlantingStateEconSlice: function(){ return restorePlantingStateEconSlice; },\n` +
  `      NATURAL_DLI: NATURAL_DLI,\n` +
  `      CULTIVARS: CULTIVARS,\n` +
  `      VF_CULTIVARS: VF_CULTIVARS,\n` +
  `      VF_SECTIONS: VF_SECTIONS,\n` +
  `      PALLET_CULTIVARS: PALLET_CULTIVARS,\n` +
  `      PALLET_SECTIONS: PALLET_SECTIONS,\n` +
  `      MAX_WIDTH: MAX_WIDTH,\n` +
  `      CH_W: CH_W,\n` +
  `      DENSITY_MAX: DENSITY_MAX,\n` +
  `      $: $,\n` +
  `      round: round, r1: r1, r2: r2,\n` +
  `      ui: ui, pt: pt, pm: pm, pr: pr, tr: tr, ptf: ptf,\n` +
  `      catalogPhrase: catalogPhrase, cvSubLine: cvSubLine,\n` +
  `      fmtNumRu: fmtNumRu, fmtNum: fmtNum,\n` +
  `      parseNumInput: parseNumInput, formatInputValue: formatInputValue,\n` +
  `      decimalsFromStep: decimalsFromStep, mergeLocaleDeps: mergeLocaleDeps,\n` +
  `      CUSTOM_CULTIVARS_STORAGE: CUSTOM_CULTIVARS_STORAGE\n` +
  `    };\n` +
  `  }\n\n` +
  `  var georgyMode;\n` +
  `  var plantingHarvestYieldParams, buildPlantingSnapshot, getPlantingSnapshot;\n` +
  `  var getPlantingStateEconSlice, restorePlantingStateEconSlice, plantingCvIdMatchesLiveState;\n` +
  `  var getPlantingSnapshotForCvId, averageSnapshots, getSaladMixSnapshot;\n\n` +
  `  var _rt = global.DG_createPlantingRuntime(plantingRuntimeDeps());\n` +
  shims +
  '\n\n' +
  renderLines.join('\n');

lines.splice(start, calcEnd - start + 1, wire);

const buildId = '2026-05-19-p71-audit-fixes';
let html = lines.join('\n');
if (!html.includes('planting-runtime-init.js')) {
  html = html.replace(
    '<script src="js/planting-state.js?v=' + buildId + '"></script>',
    '<script src="js/planting-state.js?v=' + buildId + '"></script>\n' +
      '<script src="js/planting-runtime-init.js?v=' + buildId + '"></script>'
  );
}
fs.writeFileSync(htmlPath, html);
console.log('runtime stripped, html lines:', lines.length);
