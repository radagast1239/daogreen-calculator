'use strict';
/** Извлечь блок из html → тело модуля с st() и deps */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'calculator-110x55_12.html'), 'utf8').split(/\r?\n/);

function extract(start, end) {
  return html.slice(start - 1, end).join('\n');
}

function toModuleBody(src, extraLocals) {
  let b = src;
  b = b.replace(/\bstate\./g, 'st().');
  b = b.replace(/\bstate\b/g, 'st()');
  b = b.replace(/st\(\)\(\)/g, 'st()');
  extraLocals.forEach(function (line) {
    b = line + '\n' + b;
  });
  return b;
}

const econSrc = extract(3885, 4114);
const navSrc = extract(4116, 4288);

const econBody = toModuleBody(econSrc, [
  '    var getEquipmentGroups;',
  '    var defaultEconState, defaultEconEquipment, defaultEconCultureRow, defaultEconCultures;'
]);

const navBody = toModuleBody(navSrc, []);

const econOut =
  '/**\n * Инициализация econ-core/ui, store, обёртка renderEconomics.\n * DG_createPlantingEconGlue(deps)\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingEconGlue(deps) {\n' +
  '    function st() { return deps.getState(); }\n' +
  '    function $(id) { return deps.$(id); }\n' +
  '    function clamp(v, lo, hi) { return deps.clamp(v, lo, hi); }\n' +
  '    function mergeLocaleDeps(o) { return deps.mergeLocaleDeps(o); }\n' +
  '    var ECON_STORAGE = deps.ECON_STORAGE;\n' +
  '    var ECON_EQUIPMENT_GROUPS_FALLBACK = deps.ECON_EQUIPMENT_GROUPS_FALLBACK;\n' +
  '    var ECON_MONTH_DAYS = deps.ECON_MONTH_DAYS;\n' +
  '    var ECON_MAX_CULTURES = deps.ECON_MAX_CULTURES;\n' +
  '    var ECON_SALAD_MIX_ID = deps.ECON_SALAD_MIX_ID;\n' +
  '    var ECON_SALAD_MIX_CV_IDS = deps.ECON_SALAD_MIX_CV_IDS;\n' +
  '    var ECON_CONSUMABLES_PER_POT_HINT = deps.ECON_CONSUMABLES_PER_POT_HINT;\n' +
  '    var VF_CULTIVARS = deps.VF_CULTIVARS;\n' +
  '    var CULTIVARS = deps.CULTIVARS;\n' +
  '    var PALLET_CULTIVARS = deps.PALLET_CULTIVARS;\n' +
  '    var HARVEST_MONTH_DAYS = deps.HARVEST_MONTH_DAYS;\n\n' +
  econBody +
  '\n    function install() {\n' +
  '      initEconCore();\n' +
  '      initEconUI();\n' +
  '      if (!st().econ) st().econ = getDefaultEconState();\n' +
  '      var renderEconomicsBase = renderEconomics;\n' +
  '      renderEconomics = function(){\n' +
  '        renderEconomicsBase();\n' +
  '        var sensDeps = mergeLocaleDeps({\n' +
  '          getState: function(){ return st(); },\n' +
  '          calcFarmEconomics: calcFarmEconomics,\n' +
  '          sumEconEquipment: sumEconEquipment,\n' +
  '          fmtNum: deps.fmtNum,\n' +
  '          r1: deps.r1\n' +
  '        });\n' +
  '        if (global.DG_renderEconSensitivity) global.DG_renderEconSensitivity(sensDeps);\n' +
  '        if (global.DG_renderEconPayback){\n' +
  '          global.DG_renderEconPayback(mergeLocaleDeps({\n' +
  '            getState: function(){ return st(); },\n' +
  '            calcFarmEconomics: calcFarmEconomics,\n' +
  '            sumEconEquipment: sumEconEquipment,\n' +
  '            fmtNum: deps.fmtNum\n' +
  '          }));\n' +
  '        }\n' +
  '        if (global.DG_ensureEconExtensions) global.DG_ensureEconExtensions(st());\n' +
  '        if (global.DG_renderEconAdvanced){\n' +
  '          global.DG_renderEconAdvanced(mergeLocaleDeps({\n' +
  '            getState: function(){ return st(); },\n' +
  '            calcFarmEconomics: calcFarmEconomics,\n' +
  '            migrateEconOtherElectricity: migrateEconOtherElectricity,\n' +
  '            saveEconStore: saveEconStore,\n' +
  '            fmtNum: deps.fmtNum,\n' +
  '            r1: deps.r1,\n' +
  "            esc: function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }\n" +
  '          }));\n' +
  '        }\n' +
  '      };\n' +
  '      if (global.DG_initEconSensitivityExtras) global.DG_initEconSensitivityExtras();\n' +
  '      return buildApi();\n' +
  '    }\n\n' +
  '    function buildApi() {\n' +
  '      return {\n' +
  '        getEquipmentGroups: getEquipmentGroups,\n' +
  '        getDefaultEconState: getDefaultEconState,\n' +
  '        getDefaultEconEquipment: getDefaultEconEquipment,\n' +
  '        getDefaultEconCultureRow: getDefaultEconCultureRow,\n' +
  '        loadEconStore: loadEconStore,\n' +
  '        saveEconStore: saveEconStore,\n' +
  '        ensureEconEquipment: ensureEconEquipment,\n' +
  '        econEquipmentGroups: econEquipmentGroups,\n' +
  '        sumEconEquipmentRaw: sumEconEquipmentRaw,\n' +
  '        sumEconEquipment: sumEconEquipment,\n' +
  '        defaultEconEquipment: defaultEconEquipment,\n' +
  '        defaultEconCultureRow: defaultEconCultureRow,\n' +
  '        defaultEconCultures: defaultEconCultures,\n' +
  '        defaultEconState: defaultEconState,\n' +
  '        econCvDisplayName: econCvDisplayName,\n' +
  '        econGhYieldPerCutFromStd: econGhYieldPerCutFromStd,\n' +
  '        econCvTotalCycleDays: econCvTotalCycleDays,\n' +
  '        econSheetCutIntervalDays: econSheetCutIntervalDays,\n' +
  '        econSheetYieldPerCut: econSheetYieldPerCut,\n' +
  '        econYieldParamsForCvId: econYieldParamsForCvId,\n' +
  '        econCatalogDefaultsForCvId: econCatalogDefaultsForCvId,\n' +
  '        normalizeEconCultureRow: normalizeEconCultureRow,\n' +
  '        parsePotHarvestMonthsFromCv: parsePotHarvestMonthsFromCv,\n' +
  '        migrateEconCultureRows: migrateEconCultureRows,\n' +
  '        econCultureBio: econCultureBio,\n' +
  '        formatEconCultureHint: formatEconCultureHint,\n' +
  '        calcCultureConsumables: calcCultureConsumables,\n' +
  '        econApplyCultureSelect: econApplyCultureSelect,\n' +
  '        importEconRowFromPlanting: importEconRowFromPlanting,\n' +
  '        importAllEconFromPlanting: importAllEconFromPlanting,\n' +
  '        calcOtherElecMonthly: calcOtherElecMonthly,\n' +
  '        migrateEconOtherElectricity: migrateEconOtherElectricity,\n' +
  '        ensureEconCultures: ensureEconCultures,\n' +
  '        econCulturesTotalPct: econCulturesTotalPct,\n' +
  '        calcCultureSliceFromRow: calcCultureSliceFromRow,\n' +
  '        dedupeEconCultures: dedupeEconCultures,\n' +
  '        canAddEconCulture: canAddEconCulture,\n' +
  '        findDuplicateCultureIds: findDuplicateCultureIds,\n' +
  '        collectEconWarnings: collectEconWarnings,\n' +
  '        calcFarmEconomics: calcFarmEconomics,\n' +
  '        calcEconomics: calcEconomics,\n' +
  '        getEconCultureOptionsHtml: getEconCultureOptionsHtml,\n' +
  '        isEconCvIdTaken: isEconCvIdTaken,\n' +
  '        renderEconomics: renderEconomics,\n' +
  '        syncEconFromPlanting: syncEconFromPlanting,\n' +
  '        syncEconInputsFromState: syncEconInputsFromState\n' +
  '      };\n' +
  '    }\n\n' +
  '    return { install: install };\n' +
  '  }\n\n' +
  '  global.DG_createPlantingEconGlue = createPlantingEconGlue;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

// Remove duplicate install block from extracted body (init calls and render wrap)
let econClean = econBody;
econClean = econClean.replace(/\n  initEconCore\(\);[\s\S]*?if \(window\.DG_initEconSensitivityExtras\)[^\n]*\n/, '\n');

const econFinal = econOut.replace(econBody, econClean);

// Fix initEconCore/UI to use deps for external refs - need wrapper functions
const depFns = [
  'getActivePlantingCvId', 'r1', 'r2', 'r3', 'fmtNum', 'getPlantingSnapshotForCvId', 'getPlantingSnapshot',
  'plantingCvIdMatchesLiveState', 'findCvById', 'isPalletCvId', 'isVfCvId', 'allPalletCultivars', 'allVfCultivars',
  'allGhCultivars', 'supportsMulticut', 'cutIntervalRange', 'getGhCvStandards', 'buildDefaultVfStandards',
  'parseNumInput', 'formatInputValue', 'decimalsFromStep', 'round'
];
let econPreamble = '';
depFns.forEach(function (n) {
  econPreamble += '    function ' + n + '() { return deps.' + n + '.apply(deps, arguments); }\n';
});

const econFile = econFinal.replace(
  '    var HARVEST_MONTH_DAYS = deps.HARVEST_MONTH_DAYS;\n\n',
  '    var HARVEST_MONTH_DAYS = deps.HARVEST_MONTH_DAYS;\n' + econPreamble + '\n'
);

// Remove inner initEconCore(); initEconUI(); and render wrap from clean - already in install
// Also remove var renderEconomicsBase block from extract if still there

fs.writeFileSync(path.join(root, 'js/planting-econ-glue.js'), econFile);

// App nav module
const navDepFns = [
  'calc', 'ui', 'pt', 'showError', 'getActivePlantingCvId', 'importAllEconFromPlanting',
  'getPlantingSnapshotForCvId', 'syncEconFromPlanting', 'syncEconInputsFromState', 'renderEconomics',
  'getDefaultEconState', 'ensureEconCultures', 'migrateEconCultureRows', 'ensureEconEquipment',
  'saveGhStandardsStore', 'saveVfStandardsStore', 'saveCustomCultivarsStore', 'saveEconStore',
  'saveGhUsefulArea', 'capturePlantingViewSnapshot', 'restorePlantingViewSnapshot',
  'allPalletCultivars', 'initPalletValuesFromSheet', 'getPalletCv', 'syncCycleSlidersFromState',
  'isVF', 'isPalletView', 'updatePlantingGeomUI', 'updatePageSub', 'renderCultivars',
  'syncVfStdControls', 'renderAll', 'getPalletCv', 'allPalletCultivars'
];
let navPreamble =
  '    function st() { return deps.getState(); }\n' +
  '    function $(id) { return deps.$(id); }\n' +
  '    var FACILITY_KEY = deps.FACILITY_KEY;\n' +
  '    var APP_VIEW_KEY = deps.APP_VIEW_KEY;\n' +
  '    var CALC_BUILD = deps.CALC_BUILD;\n' +
  '    var plantingSnapshots = deps.plantingSnapshots;\n';
const navDepSet = new Set();
navDepFns.forEach(function (n) {
  if (navDepSet.has(n)) return;
  navDepSet.add(n);
  navPreamble += '    function ' + n + '() { return deps.' + n + '.apply(deps, arguments); }\n';
});

const navOut =
  '/**\n * Навигация приложения, импорт в экономику, badge.\n * DG_createPlantingAppNav(deps)\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingAppNav(deps) {\n' +
  navPreamble +
  '\n' +
  navBody +
  '\n    return {\n' +
  '      runWithState: runWithState,\n' +
  '      htmlEsc: htmlEsc,\n' +
  '      r3: r3,\n' +
  '      showToast: showToast,\n' +
  '      runPlantingEconImport: runPlantingEconImport,\n' +
  '      applyProjectState: applyProjectState,\n' +
  '      setAppView: setAppView,\n' +
  '      updateCalcBuildBadge: updateCalcBuildBadge,\n' +
  '      syncPalletLoadWarn: syncPalletLoadWarn,\n' +
  '      updatePageSub: updatePageSub\n' +
  '    };\n' +
  '  }\n\n' +
  '  global.DG_createPlantingAppNav = createPlantingAppNav;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

fs.writeFileSync(path.join(root, 'js/planting-app-nav.js'), navOut);

try {
  new Function(fs.readFileSync(path.join(root, 'js/planting-econ-glue.js'), 'utf8'));
  new Function(fs.readFileSync(path.join(root, 'js/planting-app-nav.js'), 'utf8'));
  console.log('ok');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
