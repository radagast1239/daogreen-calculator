const fs = require('fs');
const root = 'c:/Users/Нико/Desktop/КАЛЬКУЛЯТОР САЛАТОВ ПРОТОЧКА';
const BUILD = '2026-05-17-p19-econ';
const htmlPath = root + '/calculator-110x55_12.html';
let lines = fs.readFileSync(htmlPath, 'utf8').split(/\r?\n/);

lines = lines.map(l => l.replace(/2026-05-17-p18-snap/g, BUILD));

const snapIdx = lines.findIndex(l => l.includes('js/planting-snapshot.js'));
if (snapIdx >= 0 && !lines[snapIdx + 1].includes('econ-core.js')) {
  lines.splice(snapIdx + 1, 0, '<script src="js/econ-core.js?v=' + BUILD + '"></script>');
}

function dropRange(startPat, endPat) {
  const a = lines.findIndex(l => l.includes(startPat));
  const b = lines.findIndex(l => l.includes(endPat));
  if (a < 0 || b < 0 || b <= a) {
    console.error('dropRange fail', startPat, endPat, a, b);
    process.exit(1);
  }
  lines.splice(a, b - a);
  return a;
}

dropRange('function defaultEconEquipment', 'function getActivePlantingCvId');
dropRange('function ensureEconCultures', 'function getEconCultureOptionsHtml');
dropRange('function calcCultureSliceFromRow', 'function renderEconWarnings');
dropRange('function calcFarmEconomics', 'function econToggleHtml');

const cStart = lines.findIndex(l => l.includes('const ECON_DEFAULT_CONSUMABLES'));
const cEnd = lines.findIndex(l => l.includes('function getActivePlantingCvId'));
if (cStart < 0 || cEnd < 0) {
  console.error('constants block');
  process.exit(1);
}

const aliasBlock = [
  '  var DG = window.DG_ECON || {};',
  '  var ECON_DEFAULT_CONSUMABLES_PER_POT = DG.ECON_DEFAULT_CONSUMABLES_PER_POT != null ? DG.ECON_DEFAULT_CONSUMABLES_PER_POT : 4;',
  '  var ECON_CONSUMABLES_PER_POT_HINT = DG.ECON_CONSUMABLES_PER_POT_HINT || \'3–6\';',
  '  var ECON_SALAD_MIX_ID = DG.ECON_SALAD_MIX_ID || \'__salad_mix__\';',
  '  var ECON_SALAD_MIX_CV_IDS = DG.ECON_SALAD_MIX_CV_IDS || [',
  '    \'vf-kale-baby\', \'vf-mizuna-baby\', \'vf-mustard-baby\', \'vf-chard-baby\',',
  '    \'vf-romano-baby\', \'vf-corn\',',
  '    \'vf-pakchoi-baby\', \'vf-tatsoi-baby\', \'vf-komatsuna-baby\'',
  '  ];',
  '  var ECON_MONTH_DAYS = (DG.ECON_MONTH_DAYS != null ? DG.ECON_MONTH_DAYS : HARVEST_MONTH_DAYS);',
  '  var ECON_MAX_CULTURES = DG.ECON_MAX_CULTURES != null ? DG.ECON_MAX_CULTURES : 6;',
  '  var ECON_EQUIPMENT_GROUPS = DG.ECON_EQUIPMENT_GROUPS || [',
  '    { title: \'Оборудование\', items: [',
  '      [\'prodMain\', \'Производственное оборудование\'],',
  '      [\'solutionUnit\', \'Растворный узел\'],',
  '      [\'irrigationModule\', \'Модуль полива\']',
  '    ]},',
  '    { title: \'Дополнительные услуги\', items: [',
  '      [\'marketing\', \'Маркетинг, брендирование, документы\'],',
  '      [\'design\', \'Проектирование объекта\'],',
  '      [\'install\', \'Монтаж оборудования\'],',
  '      [\'commissioning\', \'Пусконаладочные работы\']',
  '    ]},',
  '    { title: \'Дополнительное оборудование\', items: [',
  '      [\'consumables\', \'Расходные материалы\'],',
  '      [\'auxEquip\', \'Вспомогательное оборудование и инвентарь\'],',
  '      [\'extraProd\', \'Дополнительное производственное оборудование\']',
  '    ]},',
  '    { title: \'Подготовка помещения\', items: [',
  '      [\'prepRent\', \'Аренда\'],',
  '      [\'prepClimate\', \'Климатическое оборудование + монтаж\'],',
  '      [\'prepElectric\', \'Электрика\'],',
  '      [\'prepWater\', \'Водоподготовка\'],',
  '      [\'prepRepair\', \'Ремонт в помещении при необходимости\'],',
  '      [\'prepOther\', \'Прочее\']',
  '    ]}',
  '  ];',
  '  var defaultEconEquipment, defaultEconCultureRow, defaultEconCultures, defaultEconState;',
  '  var econCvDisplayName, econGhYieldPerCutFromStd, econCvTotalCycleDays, econSheetCutIntervalDays, econSheetYieldPerCut;',
  '  var econYieldParamsForCvId, econCatalogDefaultsForCvId, normalizeEconCultureRow, parsePotHarvestMonthsFromCv, migrateEconCultureRows;',
  '  var econCultureBio, formatEconCultureHint, calcCultureConsumables, econApplyCultureSelect, importEconRowFromPlanting, importAllEconFromPlanting;',
  '  var calcOtherElecMonthly, migrateEconOtherElectricity, ensureEconCultures, econCulturesTotalPct, calcCultureSliceFromRow;',
  '  var dedupeEconCultures, canAddEconCulture, findDuplicateCultureIds, collectEconWarnings, calcFarmEconomics, calcEconomics;'
];
lines.splice(cStart, cEnd - cStart, ...aliasBlock);

const stateEconIdx = lines.findIndex(l => l.trim() === 'state.econ = defaultEconState();');
if (stateEconIdx >= 0) lines.splice(stateEconIdx, 1);

const sumIdx = lines.findIndex(l => l.trim() === 'function sumEconEquipment(){');
if (sumIdx < 0) {
  console.error('sumEconEquipment');
  process.exit(1);
}
let i = sumIdx;
let depth = 0;
let sumEnd = -1;
for (; i < lines.length; i++) {
  for (const ch of lines[i]) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
  if (i > sumIdx && depth === 0) {
    sumEnd = i + 1;
    break;
  }
}

const initBlock = [
  '',
  '  function initEconCore(){',
  '    if (!window.DG_createEconCore){',
  '      console.warn(\'econ-core.js не загружен — экономика недоступна\');',
  '      return;',
  '    }',
  '    var ec = window.DG_createEconCore({',
  '      getState: function(){ return state; },',
  '      getActivePlantingCvId: getActivePlantingCvId,',
  '      clamp: clamp,',
  '      round: function(n){ return Math.round(n); },',
  '      r1: r1, r2: r2, r3: r3,',
  '      fmtNum: fmtNum,',
  '      getPlantingSnapshotForCvId: getPlantingSnapshotForCvId,',
  '      getPlantingSnapshot: getPlantingSnapshot,',
  '      plantingCvIdMatchesLiveState: plantingCvIdMatchesLiveState,',
  '      findCvById: findCvById,',
  '      isPalletCvId: isPalletCvId,',
  '      isVfCvId: isVfCvId,',
  '      allPalletCultivars: allPalletCultivars,',
  '      allVfCultivars: allVfCultivars,',
  '      allGhCultivars: allGhCultivars,',
  '      supportsMulticut: supportsMulticut,',
  '      cutIntervalRange: cutIntervalRange,',
  '      getGhCvStandards: getGhCvStandards,',
  '      buildDefaultVfStandards: buildDefaultVfStandards,',
  '      saveEconStore: saveEconStore,',
  '      sumEconEquipment: sumEconEquipment',
  '    });',
  '    defaultEconEquipment = ec.defaultEconEquipment;',
  '    defaultEconCultureRow = ec.defaultEconCultureRow;',
  '    defaultEconCultures = ec.defaultEconCultures;',
  '    defaultEconState = ec.defaultEconState;',
  '    econCvDisplayName = ec.econCvDisplayName;',
  '    econGhYieldPerCutFromStd = ec.econGhYieldPerCutFromStd;',
  '    econCvTotalCycleDays = ec.econCvTotalCycleDays;',
  '    econSheetCutIntervalDays = ec.econSheetCutIntervalDays;',
  '    econSheetYieldPerCut = ec.econSheetYieldPerCut;',
  '    econYieldParamsForCvId = ec.econYieldParamsForCvId;',
  '    econCatalogDefaultsForCvId = ec.econCatalogDefaultsForCvId;',
  '    normalizeEconCultureRow = ec.normalizeEconCultureRow;',
  '    parsePotHarvestMonthsFromCv = ec.parsePotHarvestMonthsFromCv;',
  '    migrateEconCultureRows = ec.migrateEconCultureRows;',
  '    econCultureBio = ec.econCultureBio;',
  '    formatEconCultureHint = ec.formatEconCultureHint;',
  '    calcCultureConsumables = ec.calcCultureConsumables;',
  '    econApplyCultureSelect = ec.econApplyCultureSelect;',
  '    importEconRowFromPlanting = ec.importEconRowFromPlanting;',
  '    importAllEconFromPlanting = ec.importAllEconFromPlanting;',
  '    calcOtherElecMonthly = ec.calcOtherElecMonthly;',
  '    migrateEconOtherElectricity = ec.migrateEconOtherElectricity;',
  '    ensureEconCultures = ec.ensureEconCultures;',
  '    econCulturesTotalPct = ec.econCulturesTotalPct;',
  '    calcCultureSliceFromRow = ec.calcCultureSliceFromRow;',
  '    dedupeEconCultures = ec.dedupeEconCultures;',
  '    canAddEconCulture = ec.canAddEconCulture;',
  '    findDuplicateCultureIds = ec.findDuplicateCultureIds;',
  '    collectEconWarnings = ec.collectEconWarnings;',
  '    calcFarmEconomics = ec.calcFarmEconomics;',
  '    calcEconomics = ec.calcEconomics;',
  '  }',
  '  initEconCore();',
  '  if (!state.econ) state.econ = defaultEconState();'
];
lines.splice(sumEnd, 0, ...initBlock);

const calIdx = lines.findIndex(l => l.includes("const CALC_BUILD = '"));
if (calIdx >= 0) lines[calIdx] = "  const CALC_BUILD = '" + BUILD + "';";

fs.writeFileSync(htmlPath, lines.join('\n'), 'utf8');
console.log('wired', lines.length, 'lines');
