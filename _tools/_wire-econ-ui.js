const fs = require('fs');
const root = 'c:/Users/Нико/Desktop/КАЛЬКУЛЯТОР САЛАТОВ ПРОТОЧКА';
const BUILD = '2026-05-17-p20-ui';
const htmlPath = root + '/calculator-110x55_12.html';
let lines = fs.readFileSync(htmlPath, 'utf8').split(/\r?\n/);

lines = lines.map(l => l.replace(/2026-05-17-p19-econ/g, BUILD));

const econIdx = lines.findIndex(l => l.includes('js/econ-core.js'));
if (econIdx >= 0 && !lines[econIdx + 1].includes('econ-ui.js')) {
  lines.splice(econIdx + 1, 0, '<script src="js/econ-ui.js?v=' + BUILD + '"></script>');
}

function drop(startPat, endPat) {
  const a = lines.findIndex(l => l.includes(startPat));
  const b = lines.findIndex(l => l.includes(endPat));
  if (a < 0 || b < 0 || b <= a) {
    console.error('drop', startPat, endPat, a, b);
    process.exit(1);
  }
  lines.splice(a, b - a);
}

drop('function getEconCultureOptionsHtml', 'function loadEconStore');
drop('function econEscAttr', 'function sumEconEquipmentRaw');
drop('function fmtEconRub', 'function r3(n)');

const varDecl = [
  '  var getEconCultureOptionsHtml, isEconCvIdTaken, renderEconomics, syncEconFromPlanting;'
];
const insertAfter = lines.findIndex(l => l.includes('calcFarmEconomics, calcEconomics;'));
if (insertAfter >= 0) {
  lines.splice(insertAfter + 1, 0, ...varDecl);
}

const initBlock = [
  '',
  '  function initEconUI(){',
  '    if (!window.DG_createEconUI){',
  '      console.warn(\'econ-ui.js не загружен — интерфейс экономики недоступен\');',
  '      return;',
  '    }',
  '    var eu = window.DG_createEconUI({',
  '      getState: function(){ return state; },',
  '      $: $,',
  '      ECON_MONTH_DAYS: ECON_MONTH_DAYS,',
  '      ECON_MAX_CULTURES: ECON_MAX_CULTURES,',
  '      ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,',
  '      ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,',
  '      ECON_CONSUMABLES_PER_POT_HINT: ECON_CONSUMABLES_PER_POT_HINT,',
  '      ECON_EQUIPMENT_GROUPS: ECON_EQUIPMENT_GROUPS,',
  '      VF_CULTIVARS: VF_CULTIVARS,',
  '      CULTIVARS: CULTIVARS,',
  '      PALLET_CULTIVARS: PALLET_CULTIVARS,',
  '      ensureEconCultures: ensureEconCultures,',
  '      migrateEconCultureRows: migrateEconCultureRows,',
  '      dedupeEconCultures: dedupeEconCultures,',
  '      normalizeEconCultureRow: normalizeEconCultureRow,',
  '      econCultureBio: econCultureBio,',
  '      formatEconCultureHint: formatEconCultureHint,',
  '      econApplyCultureSelect: econApplyCultureSelect,',
  '      calcFarmEconomics: calcFarmEconomics,',
  '      importAllEconFromPlanting: importAllEconFromPlanting,',
  '      getPlantingSnapshot: getPlantingSnapshot,',
  '      saveEconStore: saveEconStore,',
  '      ensureEconEquipment: ensureEconEquipment,',
  '      sumEconEquipmentRaw: sumEconEquipmentRaw,',
  '      sumEconEquipment: sumEconEquipment,',
  '      canAddEconCulture: canAddEconCulture,',
  '      econCulturesTotalPct: econCulturesTotalPct,',
  '      migrateEconOtherElectricity: migrateEconOtherElectricity,',
  '      parseNumInput: parseNumInput,',
  '      formatInputValue: formatInputValue,',
  '      decimalsFromStep: decimalsFromStep,',
  '      fmtNum: fmtNum,',
  '      clamp: clamp,',
  '      round: round,',
  '      r1: r1, r2: r2, r3: r3',
  '    });',
  '    getEconCultureOptionsHtml = eu.getEconCultureOptionsHtml;',
  '    isEconCvIdTaken = eu.isEconCvIdTaken;',
  '    renderEconomics = eu.renderEconomics;',
  '    syncEconFromPlanting = eu.syncEconFromPlanting;',
  '  }'
];

const coreEnd = lines.findIndex(l => l.trim() === 'if (!state.econ) state.econ = defaultEconState();');
if (coreEnd < 0) {
  console.error('coreEnd');
  process.exit(1);
}
lines.splice(coreEnd + 1, 0, '  initEconUI();', ...initBlock);

const calIdx = lines.findIndex(l => l.includes("const CALC_BUILD = '"));
if (calIdx >= 0) lines[calIdx] = "  const CALC_BUILD = '" + BUILD + "';";

fs.writeFileSync(htmlPath, lines.join('\n'), 'utf8');
['index.html', 'start-server.bat'].forEach(f => {
  const p = root + '/' + f;
  if (fs.existsSync(p)) {
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/2026-05-17-p19-econ/g, BUILD), 'utf8');
  }
});
console.log('wired ui', lines.length, 'lines');
