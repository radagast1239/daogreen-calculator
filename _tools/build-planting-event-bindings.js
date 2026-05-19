'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'calculator-110x55_12.html');
const outPath = path.join(root, 'js/planting-event-bindings.js');

const lines = fs.readFileSync(htmlPath, 'utf8').split(/\r?\n/);
const fullBody = lines.slice(4302, 4987).join('\n'); // 4303..4987

const bindEnd = fullBody.indexOf('\n  function bindCustomCultivarDialog');
const bindMain = bindEnd >= 0 ? fullBody.slice(0, bindEnd) : fullBody;
let dialogPart = bindEnd >= 0 ? fullBody.slice(bindEnd + 1, fullBody.indexOf('\n  /* Init */')) : '';
dialogPart = dialogPart
  .replace(/^\s*function bindCustomCultivarDialog\(\)\s*\{\r?\n/, '')
  .replace(/\r?\n  \}\s*$/, '');

function buildPrelude(scope) {
  const skip = new Set([
    'if',
    'for',
    'while',
    'switch',
    'catch',
    'return',
    'function',
    'const',
    'let',
    'var',
    'new',
    'typeof',
    'else',
    'try',
    'finally',
    'throw',
    'openCvAddDialog'
  ]);
  const noProxy = new Set([
    'trim',
    'round',
    'clamp',
    'max',
    'min',
    'contains',
    'replace',
    'toFixed',
    'toISOString',
    'toLocaleDateString',
    'slice',
    'isGeorgyGh',
    'onDayChanged',
    'onGeorgyDayChanged'
  ]);
  const builtins = new Set([
    'parseInt',
    'parseFloat',
    'Math',
    'String',
    'Object',
    'Array',
    'document',
    'window',
    'localStorage',
    'setTimeout',
    'alert',
    'console',
    'Date',
    'JSON',
    'addEventListener',
    'forEach',
    'querySelectorAll',
    'getElementById',
    'closest',
    'toggle',
    'push',
    'some',
    'find',
    'indexOf',
    'slice',
    'keys',
    'setItem',
    'getItem',
    'preventDefault',
    'focus',
    'showModal',
    'close',
    'add',
    'remove',
    'assign',
    'parseNumInput',
    'mergeLocaleDeps'
  ]);
  const localDecl = new Set();
  scope.replace(/\bfunction\s+([a-zA-Z_$][\w$]*)\s*\(/g, (_, n) => localDecl.add(n));
  scope.replace(/\b(const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=/g, (_, _t, n) => localDecl.add(n));
  const used = new Set();
  scope.replace(/\b([a-zA-Z_$][\w$]*)\s*\(/g, (_, n) => {
    if (!skip.has(n) && !localDecl.has(n) && !builtins.has(n) && !noProxy.has(n)) used.add(n);
  });
  const constKeys = [
    'VF_CULTIVARS',
    'FACILITY_KEY',
    'APP_VIEW_KEY',
    'CALC_BUILD',
    'ECON_SALAD_MIX_ID'
  ];
  let p = '    var state = deps.getState();\n    var $ = deps.$;\n';
  constKeys.forEach(function (k) {
    if (scope.includes(k)) p += '    var ' + k + ' = deps.' + k + ';\n';
  });
  if (scope.includes('_lightEnergy')) p += '    var _lightEnergy = deps.lightEnergy;\n';
  if (scope.includes('georgyMode')) {
    p +=
      '    var georgyMode = typeof deps.getGeorgyMode === "function" ? deps.getGeorgyMode() : deps.georgyMode;\n';
  }
  if (scope.includes('canopyDensityUi')) p += '    var canopyDensityUi = deps.canopyDensityUi;\n';
  if (scope.includes('clamp')) p += '    function clamp(v, lo, hi) { return deps.clamp(v, lo, hi); }\n';
  Array.from(used)
    .sort()
    .forEach(function (name) {
      if (name === 'getState' || name === '$' || constKeys.includes(name) || name === 'clamp') return;
      p += '    function ' + name + '() { return deps.' + name + '.apply(deps, arguments); }\n';
    });
  return p;
}

const bindPrelude = buildPrelude(bindMain + dialogPart);
const dialogPrelude = buildPrelude(dialogPart);

const out =
  '/**\n * DOM-события и boot калькулятора посадки.\n * DG_createPlantingEventBindings(deps)\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingEventBindings(deps) {\n' +
  '    var lightSync = false;\n\n' +
  '    function bindCustomCultivarDialog() {\n' +
  dialogPrelude +
  dialogPart.trim() +
  '\n    }\n\n' +
  '    function bindEvents() {\n' +
  bindPrelude +
  bindMain.trim() +
  '\n    }\n\n' +
  '    function bootApp() {\n' +
  '      try {\n' +
  '        deps.loadGhStandardsStore();\n' +
  '        deps.loadVfStandardsStore();\n' +
  '        deps.loadCustomCultivarsStore();\n' +
  '        if (global.DG_initLocale){\n' +
  '          global.DG_initLocale({\n' +
  '            parseNumInput: deps.parseNumInput,\n' +
  '            formatInputValue: deps.formatInputValue,\n' +
  '            onChange: function(){\n' +
  "              if (typeof deps.updatePageSub === 'function') deps.updatePageSub();\n" +
  '              var st = deps.getState();\n' +
  "              if (st.appView === 'economics'){\n" +
  "                if (typeof deps.renderEconomics === 'function') deps.renderEconomics();\n" +
  "                try { deps.updateCalcBuildBadge(deps.calc()); } catch(_){}\n" +
  "              } else if (typeof deps.renderAll === 'function') deps.renderAll();\n" +
  '            }\n' +
  '          });\n' +
  '        }\n' +
  '        if (global.DG_initProjectCompare){\n' +
  '          global.DG_initProjectCompare(deps.mergeLocaleDeps({\n' +
  '            getState: function(){ return deps.getState(); },\n' +
  '            getBuild: function(){ return deps.CALC_BUILD; },\n' +
  '            calcFarmEconomics: deps.calcFarmEconomics,\n' +
  '            migrateEconOtherElectricity: deps.migrateEconOtherElectricity,\n' +
  '            sumEconEquipment: deps.sumEconEquipment,\n' +
  '            calcWithState: function(temp, fn){ return deps.runWithState(temp, fn); },\n' +
  '            fmtNum: deps.fmtNum,\n' +
  '            r1: deps.r1,\n' +
  '            esc: deps.htmlEsc,\n' +
  '            summarize: global.DG_summarizeProject\n' +
  '          }));\n' +
  '        }\n' +
  '        if (global.DG_initOnboardingTour) global.DG_initOnboardingTour();\n' +
  '        if (global.DG_initPwaQr) global.DG_initPwaQr();\n' +
  '        if (global.DG_initReadonlyMode) global.DG_initReadonlyMode();\n' +
  '        if (global.DG_initPdfExport) deps.initPdfExport();\n' +
  '        var state = deps.getState();\n' +
  '        var $ = deps.$;\n' +
  "        if ($('sowDate')) $('sowDate').value = state.sowDate;\n" +
  "        if ($('showRange')) $('showRange').checked = !!state.showRange;\n" +
  '        deps.renderCultivars();\n' +
  '        bindCustomCultivarDialog();\n' +
  "        document.querySelectorAll('.pallet-cell-btn').forEach(function(btn){\n" +
  "          btn.addEventListener('click', function(){\n" +
  '            state.palletCells = parseInt(btn.dataset.cells, 10);\n' +
  "            deps.unlockPlantingStdForControl('cells');\n" +
  '            deps.syncPalletCellButtons();\n' +
  '            deps.syncVfStdBadges();\n' +
  '            deps.renderAll();\n' +
  '          });\n' +
  '        });\n' +
  "        document.querySelectorAll('.pallet-mount-btn').forEach(function(btn){\n" +
  "          btn.addEventListener('click', function(){\n" +
  "            state.palletMount = btn.dataset.mount === 'lid' ? 'lid' : 'cassette';\n" +
  '            deps.syncPalletMountButtons();\n' +
  '            deps.renderAll();\n' +
  '          });\n' +
  '        });\n' +
  '        deps.syncPalletZoneLength();\n' +
  '        deps.renderMonths();\n' +
  '        deps.updatePageSub();\n' +
  '        deps.setFacility(state.facility);\n' +
  '        deps.syncManualMassUI();\n' +
  '        deps.syncCutMassUI();\n' +
  '        deps.syncMulticutDetailUI();\n' +
  '        deps.initCollapseBlocks();\n' +
  '        deps.bindVfStdBadges();\n' +
  '        if (deps.VF_CULTIVARS.length){ deps.renderVfStdGrid(); }\n' +
  "        if (deps.VF_CULTIVARS.length && state.facility === 'vertical' && state.appView === 'channels') deps.resetVfStdToSheetDefaults();\n" +
  '        deps.renderAll();\n' +
  '        try {\n' +
  '          var savedView = localStorage.getItem(deps.APP_VIEW_KEY);\n' +
  "          if (savedView === 'planting') deps.setAppView('channels');\n" +
  "          else if (savedView === 'channels' || savedView === 'pallets' || savedView === 'economics') deps.setAppView(savedView);\n" +
  '        } catch(_){}\n' +
  '      } catch (err) {\n' +
  "        deps.showError('init', err);\n" +
  '      }\n' +
  '    }\n\n' +
  '    return { bindEvents: bindEvents, bootApp: bootApp, bindCustomCultivarDialog: bindCustomCultivarDialog };\n' +
  '  }\n\n' +
  '  global.DG_createPlantingEventBindings = createPlantingEventBindings;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

fs.writeFileSync(outPath, out, 'utf8');
try {
  new Function(out);
  console.log('syntax ok', outPath);
} catch (e) {
  console.error('syntax fail:', e.message);
  process.exit(1);
}
