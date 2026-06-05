const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const r = (f) => path.join(root, f);
const read = (f) => fs.readFileSync(r(f), 'utf8');
const write = (f, s) => fs.writeFileSync(r(f), s, 'utf8');

// --- econ-ui.js ---
let eu = read('js/econ-ui.js');
if (!eu.includes('function uKg')){
  eu = eu.replace(
    "function tFmt(k, vars){",
    "function uKg(){ return L('econ.unit.kg'); }\n    function uPcs(){ return L('econ.unit.pcs'); }\n    function uG(){ return L('econ.unit.g'); }\n    function tFmt(k, vars){"
  );
}
eu = eu.replace("txt += ' · не учитывается в себестоимости'", "txt += L('econ.equip.notInCost')");
eu = eu.replace("row.unitIsPieces ? 'шт' : 'г'", "row.unitIsPieces ? uPcs() : uG()");
eu = eu.replace(/\+ ' шт\/м²·мес'/g, "+ ' ' + L('econ.yield.pcsSqm')");
eu = eu.replace(/\+ ' кг\/м²·мес'/g, "+ ' ' + L('econ.yield.kgSqm')");
eu = eu.replace(
  "let msg = 'Сумма долей: <strong>' + deps.r1(total) + '%</strong>';\n      if (total > 100){ cls = 'bad'; msg += ' — превышает 100%, в расчёте доли масштабируются'; }\n      else if (total < 100) { cls = 'warn'; msg += ' — свободно ' + deps.r1(100 - total) + '% площади'; }\n      totalEl.className = 'econ-cultures-total ' + cls;\n      totalEl.innerHTML = msg + ' · строк: ' + st().econ.cultures.length + ' / ' + ECON_MAX_CULTURES;",
  "let msg = '<strong>' + tFmt('econ.share.sum', { total: deps.r1(total) }) + '</strong>';\n      if (total > 100){ cls = 'bad'; msg += L('econ.share.over'); }\n      else if (total < 100) { cls = 'warn'; msg += tFmt('econ.share.free', { free: deps.r1(100 - total) }); }\n      totalEl.className = 'econ-cultures-total ' + cls;\n      totalEl.innerHTML = msg + tFmt('econ.rows', { n: st().econ.cultures.length, max: ECON_MAX_CULTURES });"
);
eu = eu.replace(
  "addBtn.title = addBtn.disabled ? 'Максимум ' + ECON_MAX_CULTURES + ' культур' : 'Добавить строку (0%, выберите сорт)'",
  "addBtn.title = addBtn.disabled ? tFmt('econ.add.max', { max: ECON_MAX_CULTURES }) : L('econ.add.row')"
);
eu = eu.replace("mixBtn.title = 'Уберите отдельные сорта из состава микса'", "mixBtn.title = L('econ.mix.overlap')");
eu = eu.replace(
  "totalEl.innerHTML = 'Сумма долей: <strong>' + deps.r1(total) + '%</strong>' +\n          (total > 100 ? ' — превышает 100%' : (total < 100 ? ' — свободно ' + deps.r1(100 - total) + '%' : ''));",
  "totalEl.innerHTML = '<strong>' + tFmt('econ.share.sum', { total: deps.r1(total) }) + '</strong>' +\n          (total > 100 ? L('econ.share.overShort') : (total < 100 ? tFmt('econ.share.freeShort', { free: deps.r1(100 - total) }) : ''));"
);
eu = eu.replace("const yLabel = snap.unitIsPieces ? 'шт/м²·мес' : 'кг/м²·мес'", "const yLabel = snap.unitIsPieces ? L('econ.yield.pcsSqm') : L('econ.yield.kgSqm')");
eu = eu.replace(
  "const mixNote = snap.isMix ? ' <span style=\"font-weight:400;color:var(--ink-faint)\">(среднее по ' + (snap.mixCount || ECON_SALAD_MIX_CV_IDS.length) + ' культурам)</span>' : ''",
  "const mixNote = snap.isMix ? ' <span style=\"font-weight:400;color:var(--ink-faint)\">' + tFmt('econ.snap.mixAvg', { n: snap.mixCount || ECON_SALAD_MIX_CV_IDS.length }) + '</span>' : ''"
);
eu = eu.replace(
  "const perPotLbl = snap.multicutHarvest ? 'Масса одной срезки' : 'Урожай с 1 горшка за цикл'",
  "const perPotLbl = snap.multicutHarvest ? L('econ.snap.cutMass') : L('econ.snap.yieldPot')"
);
eu = eu.replace(
  "const cycleLbl = snap.multicutHarvest ? 'До первой срезки' : 'Цикл выращивания'",
  "const cycleLbl = snap.multicutHarvest ? L('econ.snap.cycleFirst') : L('econ.snap.cycleGrow')"
);
eu = eu.replace(
  "extra = '<dt>Интервал срезки</dt><dd>' + snap.harvestCutIntervalDays + ' сут · ' + deps.r1(snap.harvestCutsPerMonth) + ' срезок/мес</dd>';",
  "extra = '<dt>' + L('econ.snap.cutInt') + '</dt><dd>' + tFmt('econ.snap.cutRow', { days: snap.harvestCutIntervalDays, cuts: deps.r1(snap.harvestCutsPerMonth) }) + '</dd>';"
);
eu = eu.replace("'<dt>Культура</dt>", "'<dt>' + L('econ.snap.culture') + '</dt>");
eu = eu.replace("'<dt>Горшков / стаканов на 1 м²</dt><dd>' + deps.round(snap.rhoA) + ' шт</dd>'", "'<dt>' + L('econ.snap.pots') + '</dt><dd>' + deps.round(snap.rhoA) + ' ' + uPcs() + '</dd>'");
eu = eu.replace("'<dt>' + cycleLbl + '</dt><dd>' + snap.totalCycleDays + ' сут</dd>'", "'<dt>' + cycleLbl + '</dt><dd>' + snap.totalCycleDays + ' ' + L('econ.unit.days') + '</dd>'");
eu = eu.replace("'<dt>Урожай с 1 горшка в месяц</dt>", "'<dt>' + L('econ.snap.yieldPotMo') + '</dt>");
eu = eu.replace("'<dt>Урожайность</dt>", "'<dt>' + L('econ.snap.yield') + '</dt>");
eu = eu.replace("'<dt>Освещение</dt>", "'<dt>' + L('econ.snap.light') + '</dt>");
eu = eu.replace(/\+ ' шт'/g, "+ ' ' + uPcs()");
eu = eu.replace(/\+ ' кг'/g, "+ ' ' + uKg()");
eu = eu.replace("const yc = b.unitIsPieces ? 'шт' : 'г'", "const yc = b.unitIsPieces ? uPcs() : uG()");
eu = eu.replace(/u === 'кг'/g, "u === 'kg'");
eu = eu.replace(/u === 'шт'/g, "u === 'pcs'");
// revert - internal units are Russian 'кг' and 'шт' from calc - DO NOT change u === comparisons
eu = read('js/econ-ui.js'); // reload - the kg/pcs replace was wrong

// Re-apply safe parts only
if (!eu.includes('function uKg')){
  eu = eu.replace(
    "function tFmt(k, vars){",
    "function uKg(){ return L('econ.unit.kg'); }\n    function uPcs(){ return L('econ.unit.pcs'); }\n    function uG(){ return L('econ.unit.g'); }\n    function tFmt(k, vars){"
  );
}
// Apply file from disk again with careful patches via separate write

write('js/econ-ui.js', eu);
console.log('p40 partial - run manual econ-ui patch');
