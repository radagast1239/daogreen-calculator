const fs = require('fs');
const root = 'c:/Users/Нико/Desktop/КАЛЬКУЛЯТОР САЛАТОВ ПРОТОЧКА';
const lines = fs.readFileSync(root + '/calculator-110x55_12.html', 'utf8').split(/\r?\n/);

const slices = [
  [lines.findIndex(l => l.includes('function getEconCultureOptionsHtml')), lines.findIndex(l => l.includes('function loadEconStore'))],
  [lines.findIndex(l => l.includes('function econEscAttr')), lines.findIndex(l => l.includes('function sumEconEquipmentRaw'))],
  [lines.findIndex(l => l.includes('function fmtEconRub')), lines.findIndex(l => l.trim() === 'function r3(n){ return Math.round(n * 1000) / 1000; }')]
];

for (const [a, b] of slices) {
  if (a < 0 || b < 0 || b <= a) {
    console.error('slice fail', slices);
    process.exit(1);
  }
}

let body = [];
for (const [a, b] of slices) body = body.concat(lines.slice(a, b));
body = body.join('\n');

const depsFns = [
  'ensureEconCultures', 'migrateEconCultureRows', 'dedupeEconCultures', 'normalizeEconCultureRow',
  'econCultureBio', 'formatEconCultureHint', 'econApplyCultureSelect', 'calcFarmEconomics',
  'importAllEconFromPlanting', 'getPlantingSnapshot', 'saveEconStore', 'ensureEconEquipment',
  'sumEconEquipmentRaw', 'sumEconEquipment', 'canAddEconCulture',
  'econCulturesTotalPct', 'migrateEconOtherElectricity',
  'parseNumInput', 'formatInputValue', 'decimalsFromStep', 'fmtNum', 'clamp', 'round', 'r1', 'r2', 'r3'
];
for (const fn of depsFns) {
  body = body.replace(new RegExp('\\b' + fn + '\\(', 'g'), 'deps.' + fn + '(');
}
body = body.replace(/\bstate\./g, 'st().');
body = body.replace(/\$\(/g, 'deps.$(');
body = body.replace(/Math\.deps\.round/g, 'Math.round');
body = body.replace(/function deps\.([a-zA-Z0-9_]+)/g, 'function $1');

const header = `/** DOM/UI экономики — DG_createEconUI */
(function(global){
  'use strict';

  function createEconUI(deps){
    function st(){ return deps.getState(); }
    var ECON_MONTH_DAYS = deps.ECON_MONTH_DAYS;
    var ECON_MAX_CULTURES = deps.ECON_MAX_CULTURES;
    var ECON_SALAD_MIX_ID = deps.ECON_SALAD_MIX_ID;
    var ECON_SALAD_MIX_CV_IDS = deps.ECON_SALAD_MIX_CV_IDS;
    var ECON_CONSUMABLES_PER_POT_HINT = deps.ECON_CONSUMABLES_PER_POT_HINT;
    var ECON_EQUIPMENT_GROUPS = deps.ECON_EQUIPMENT_GROUPS;
    var VF_CULTIVARS = deps.VF_CULTIVARS || [];
    var CULTIVARS = deps.CULTIVARS || [];
    var PALLET_CULTIVARS = deps.PALLET_CULTIVARS || [];

${body}

    return {
      getEconCultureOptionsHtml: getEconCultureOptionsHtml,
      isEconCvIdTaken: isEconCvIdTaken,
      econEscAttr: econEscAttr,
      fmtEconRub: fmtEconRub,
      refreshFmtDisplayAll: refreshFmtDisplayAll,
      initEconFmtInputs: initEconFmtInputs,
      syncEconEquipmentPanel: syncEconEquipmentPanel,
      updateEconEquipmentTotal: updateEconEquipmentTotal,
      renderEconWarnings: renderEconWarnings,
      econToggleHtml: econToggleHtml,
      renderEconCustomEquipRow: renderEconCustomEquipRow,
      econNumInput: econNumInput,
      renderEconomicsEquipment: renderEconomicsEquipment,
      bindEconomicsInputs: bindEconomicsInputs,
      bindEconomicsEquipment: bindEconomicsEquipment,
      renderEconomicsForm: renderEconomicsForm,
      econCultParamInput: econCultParamInput,
      renderEconomicsCultures: renderEconomicsCultures,
      bindEconomicsCultures: bindEconomicsCultures,
      syncEconInputsFromState: syncEconInputsFromState,
      syncEconFromPlanting: syncEconFromPlanting,
      econSnapDerivedHtml: econSnapDerivedHtml,
      renderEconomics: renderEconomics
    };
  }

  global.DG_createEconUI = createEconUI;
})(typeof window !== 'undefined' ? window : this);
`;

fs.writeFileSync(root + '/js/econ-ui.js', header, 'utf8');
console.log('ok', (header.match(/\n/g) || []).length + 1, 'lines');
