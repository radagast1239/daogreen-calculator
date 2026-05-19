const fs = require('fs');
let h = fs.readFileSync('calculator-110x55_12.html', 'utf8');
const tag = 'di' + 'v';
const i = h.indexOf("'<" + tag + " class=\"line\"><span>Расходн. посев</span>");
if (i < 0) { console.log('anchor miss'); process.exit(1); }
const start = h.lastIndexOf('const consSqm = p.slice.consumablesPerSqm', i);
const end = h.indexOf('</' + tag + '></' + tag + "';", i) + ("</" + tag + "></" + tag + "';").length;
const neu = [
  '        const consSqm = p.slice.consumablesPerSqm > 0 ? fmtNum(p.slice.consumablesPerSqm) : \'—\';',
  '        const consMo = p.slice.consumablesCost > 0 ? fmtNum(p.slice.consumablesCost) : \'—\';',
  '        const hm = p.slice.potHarvestMonths || 3;',
  '        const consOnceSqm = p.slice.consumablesPerSqmOnce > 0 ? fmtNum(p.slice.consumablesPerSqmOnce) : \'—\';',
  '        const consOnceArea = p.slice.consumablesOnce > 0 ? fmtNum(p.slice.consumablesOnce) : \'—\';',
  '        const consPerKg = (sell > 0 && p.slice.consumablesCost > 0 && u === \'кг\') ? (p.slice.consumablesCost / sell) : 0;',
  '        const consShare = (uc > 0 && consPerKg > 0) ? r1((consPerKg / uc) * 100) : null;',
  '        metrics += \'<\' + tag + \' class="econ-culture-metric"><\' + tag + \' class="name">\' + p.name + \'</\' + tag + \'>\' +',
  '          \'<\' + tag + \' class="line"><span>Себест.</span><strong>\' + (uc > 0 ? fmtNum(uc) : \'—\') + \' \' + unitLbl + \'</strong></\' + tag + \'>\' +',
  '          (consShare ? \'<\' + tag + \' class="line"><span>из них расходники</span><strong>~\' + fmtNum(consPerKg) + \' \' + unitLbl + \' (\' + consShare + \'%)</strong></\' + tag + \'>\' : \'\') +',
  '          \'<\' + tag + \' class="line"><span>Посев (разово)</span><strong>\' + consOnceSqm + \' ₽/м²</strong> · \' + consOnceArea + \' ₽ на \' + r1(p.slice.area) + \' м²</\' + tag + \'>\' +',
  '          \'<\' + tag + \' class="line"><span>Посев в месяц</span><strong>\' + consSqm + \' ₽/м²·мес</strong> (÷ \' + r1(hm) + \' мес)</\' + tag + \'>\' +',
  '          \'<\' + tag + \' class="line"><span>Расходн. на участок</span><strong>\' + consMo + \' ₽/мес</strong></\' + tag + \'>\' +',
  '          \'<\' + tag + \' class="line"><span>Выпуск</span><strong>\' + outVal + \' \' + outLbl + \'</strong></\' + tag + \'>\' +',
  '          \'<\' + tag + \' class="line"><span>Доля</span><strong>\' + r1(p.pct) + \'% · \' + r1(p.slice.area) + \' м²</strong></\' + tag + \'></\' + tag + \'>\';'
].join('\n');
h = h.slice(0, start) + neu + h.slice(end);
fs.writeFileSync('calculator-110x55_12.html', h);
console.log('ok', start, end);
