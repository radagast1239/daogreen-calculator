const fs = require('fs');
let h = fs.readFileSync('calculator-110x55_12.html', 'utf8');
const ci = h.indexOf("';ml>");
if (ci < 0) { console.log('no corrupt'); process.exit(1); }
const dupStart = h.indexOf('<html lang="ru">', ci);
let tailFrom = h.indexOf("      });\n      metrics += '</motion.div></motion.div>';", dupStart);
if (tailFrom < 0) tailFrom = h.indexOf("      });\n      metrics += '</div></div>';", dupStart);
if (tailFrom < 0) { console.log('no tail'); process.exit(1); }

const headEnd = h.lastIndexOf('const outVal = u ===', ci);
const head = h.slice(0, h.indexOf('\n', headEnd) + 1);

const metrics = `        const consSqm = p.slice.consumablesPerSqm > 0 ? fmtNum(p.slice.consumablesPerSqm) : '—';
        const consMo = p.slice.consumablesCost > 0 ? fmtNum(p.slice.consumablesCost) : '—';
        const hm = p.slice.potHarvestMonths || 3;
        const consOnceSqm = p.slice.consumablesPerSqmOnce > 0 ? fmtNum(p.slice.consumablesPerSqmOnce) : '—';
        const consOnceArea = p.slice.consumablesOnce > 0 ? fmtNum(p.slice.consumablesOnce) : '—';
        const consPerKg = (sell > 0 && p.slice.consumablesCost > 0 && u === 'кг') ? (p.slice.consumablesCost / sell) : 0;
        const consShare = (uc > 0 && consPerKg > 0) ? r1((consPerKg / uc) * 100) : null;
        metrics += '<div class="econ-culture-metric"><div class="name">' + p.name + '</motion.div>' +
          '<div class="line"><span>Себест.</span><strong>' + (uc > 0 ? fmtNum(uc) : '—') + ' ' + unitLbl + '</strong></div>' +
          (consShare ? '<div class="line"><span>из них расходники</span><strong>~' + fmtNum(consPerKg) + ' ' + unitLbl + ' (' + consShare + '%)</strong></div>' : '') +
          '<div class="line"><span>Посев (разово)</span><strong>' + consOnceSqm + ' ₽/м²</strong> · ' + consOnceArea + ' ₽ на ' + r1(p.slice.area) + ' м²</div>' +
          '<div class="line"><span>Посев в месяц</span><strong>' + consSqm + ' ₽/м²·мес</strong> (÷ ' + r1(hm) + ' мес)</div>' +
          '<div class="line"><span>Расходн. на участок</span><strong>' + consMo + ' ₽/мес</strong></div>' +
          '<div class="line"><span>Выпуск</span><strong>' + outVal + ' ' + outLbl + '</strong></div>' +
          '<div class="line"><span>Доля</span><strong>' + r1(p.pct) + '% · ' + r1(p.slice.area) + ' м²</strong></div></div>';
`.replace(/<\/motion\.div>/g, '</div>').replace(/<motion\.motion\.div/g, '<div');

const out = head + metrics + '\n' + h.slice(tailFrom);
fs.writeFileSync('calculator-110x55_12.html', out);
console.log('ok lines', out.split('\n').length);
