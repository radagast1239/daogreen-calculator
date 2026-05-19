const fs = require('fs');
const root = 'c:/Users/Нико/Desktop/КАЛЬКУЛЯТОР САЛАТОВ ПРОТОЧКА';
const lines = fs.readFileSync(root + '/calculator-110x55_12.html', 'utf8').split(/\r?\n/);

const cStart = lines.findIndex(l => l.includes('const ECON_DEFAULT_CONSUMABLES'));
const cEnd = lines.findIndex(l => l.includes('function defaultEconEquipment'));

const slices = [
  [lines.findIndex(l => l.includes('function defaultEconEquipment')), lines.findIndex(l => l.includes('function getActivePlantingCvId'))],
  [lines.findIndex(l => l.includes('function ensureEconCultures')), lines.findIndex(l => l.includes('function getEconCultureOptionsHtml'))],
  [lines.findIndex(l => l.includes('function calcCultureSliceFromRow')), lines.findIndex(l => l.includes('function renderEconWarnings'))],
  [lines.findIndex(l => l.includes('function calcFarmEconomics')), lines.findIndex(l => l.trim() === 'function econToggleHtml(id, label, checked){')]
];

for (const [a, b] of slices) {
  if (a < 0 || b < 0 || b <= a) {
    console.error('bad slice', slices);
    process.exit(1);
  }
}

let fnLines = [];
for (const [a, b] of slices) fnLines = fnLines.concat(lines.slice(a, b));

const constBlock = lines.slice(cStart, cEnd).join('\n');
let body = fnLines.join('\n');

body = body.replace(/\bstate\./g, 'st().');
body = body.replace(/\bgetPlantingSnapshotForCvId\(/g, 'deps.getPlantingSnapshotForCvId(');
body = body.replace(/\bgetPlantingSnapshot\(/g, 'deps.getPlantingSnapshot(');
body = body.replace(/\bplantingCvIdMatchesLiveState\(/g, 'deps.plantingCvIdMatchesLiveState(');
body = body.replace(/\bfindCvById\(/g, 'deps.findCvById(');
body = body.replace(/\bisPalletCvId\(/g, 'deps.isPalletCvId(');
body = body.replace(/\bisVfCvId\(/g, 'deps.isVfCvId(');
body = body.replace(/\ballPalletCultivars\(/g, 'deps.allPalletCultivars(');
body = body.replace(/\ballVfCultivars\(/g, 'deps.allVfCultivars(');
body = body.replace(/\ballGhCultivars\(/g, 'deps.allGhCultivars(');
body = body.replace(/\bsupportsMulticut\(/g, 'deps.supportsMulticut(');
body = body.replace(/\bcutIntervalRange\(/g, 'deps.cutIntervalRange(');
body = body.replace(/\bgetGhCvStandards\(/g, 'deps.getGhCvStandards(');
body = body.replace(/\bbuildDefaultVfStandards\(/g, 'deps.buildDefaultVfStandards(');
body = body.replace(/\bsaveEconStore\(/g, 'deps.saveEconStore(');
body = body.replace(/\bsumEconEquipment\(/g, 'deps.sumEconEquipment(');
body = body.replace(/\bclamp\(/g, 'deps.clamp(');
body = body.replace(/\br1\(/g, 'deps.r1(');
body = body.replace(/\br2\(/g, 'deps.r2(');
body = body.replace(/\br3\(/g, 'deps.r3(');
body = body.replace(/\bfmtNum\(/g, 'deps.fmtNum(');
body = body.replace(/(?<!\.)\bround\(/g, 'deps.round(');
body = body.replace(/function deps\.([a-zA-Z0-9_]+)/g, 'function $1');

const header = `/** Расчёт экономики — DG_createEconCore */
(function(global){
  'use strict';

${constBlock.replace('const ECON_MONTH_DAYS = HARVEST_MONTH_DAYS;', 'var ECON_MONTH_DAYS = (global.DG_CUT && global.DG_CUT.HARVEST_MONTH_DAYS) || 30.5;')}

  global.DG_ECON = {
    ECON_DEFAULT_CONSUMABLES_PER_POT: ECON_DEFAULT_CONSUMABLES_PER_POT,
    ECON_CONSUMABLES_PER_POT_HINT: ECON_CONSUMABLES_PER_POT_HINT,
    ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,
    ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,
    ECON_MONTH_DAYS: ECON_MONTH_DAYS,
    ECON_MAX_CULTURES: ECON_MAX_CULTURES,
    ECON_EQUIPMENT_GROUPS: ECON_EQUIPMENT_GROUPS
  };

  function createEconCore(deps){
    function st(){ return deps.getState(); }

  function getActivePlantingCvId(){
    return deps.getActivePlantingCvId ? deps.getActivePlantingCvId() : '';
  }

${body}

    return {
      defaultEconEquipment: defaultEconEquipment,
      defaultEconCultureRow: defaultEconCultureRow,
      defaultEconCultures: defaultEconCultures,
      defaultEconState: defaultEconState,
      econCvDisplayName: econCvDisplayName,
      econGhYieldPerCutFromStd: econGhYieldPerCutFromStd,
      econCvTotalCycleDays: econCvTotalCycleDays,
      econSheetCutIntervalDays: econSheetCutIntervalDays,
      econSheetYieldPerCut: econSheetYieldPerCut,
      econYieldParamsForCvId: econYieldParamsForCvId,
      econCatalogDefaultsForCvId: econCatalogDefaultsForCvId,
      normalizeEconCultureRow: normalizeEconCultureRow,
      parsePotHarvestMonthsFromCv: parsePotHarvestMonthsFromCv,
      migrateEconCultureRows: migrateEconCultureRows,
      econCultureBio: econCultureBio,
      formatEconCultureHint: formatEconCultureHint,
      calcCultureConsumables: calcCultureConsumables,
      econApplyCultureSelect: econApplyCultureSelect,
      importEconRowFromPlanting: importEconRowFromPlanting,
      importAllEconFromPlanting: importAllEconFromPlanting,
      calcOtherElecMonthly: calcOtherElecMonthly,
      migrateEconOtherElectricity: migrateEconOtherElectricity,
      ensureEconCultures: ensureEconCultures,
      econCulturesTotalPct: econCulturesTotalPct,
      calcCultureSliceFromRow: calcCultureSliceFromRow,
      dedupeEconCultures: dedupeEconCultures,
      canAddEconCulture: canAddEconCulture,
      findDuplicateCultureIds: findDuplicateCultureIds,
      collectEconWarnings: collectEconWarnings,
      calcFarmEconomics: calcFarmEconomics,
      calcEconomics: calcEconomics
    };
  }

  global.DG_createEconCore = createEconCore;
})(typeof window !== 'undefined' ? window : this);
`;

fs.writeFileSync(root + '/js/econ-core.js', header, 'utf8');
console.log('ok', (header.match(/\n/g) || []).length + 1, 'lines');
