const fs = require('fs');
const f = __dirname + '/calculator-110x55_12.html';
let s = fs.readFileSync(f, 'utf8');
const old = `        const consUc = p.slice.consumablesUnitCost > 0 ? fmtNum(p.slice.consumablesUnitCost, {decimals: u === 'кг' ? 1 : 0}) : '—';
        metrics += '<motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><div class="econ-culture-metric"><div class="name">' + p.name + '</div>' +
          '<div class="line"><span>Себест.</span><strong>' + (uc > 0 ? fmtNum(uc) : '—') + ' ' + unitLbl + '</strong></div>' +
          '<div class="line"><span>Расходн.</span><strong>' + consUc + ' ' + unitLbl + '</strong></div>' +
          '<div class="line"><span>Выпуск</span><strong>' + outVal + ' ' + outLbl + '</strong></div>' +
          '<div class="line"><span>Доля</span><strong>' + r1(p.pct) + '% · ' + r1(p.slice.area) + ' м²</strong></div></div>';`.replace(/<motion>/g, '');
const neu = `        const consSqm = p.slice.consumablesPerSqm > 0 ? fmtNum(p.slice.consumablesPerSqm) : '—';
        const consMo = p.slice.consumablesCost > 0 ? fmtNum(p.slice.consumablesCost) : '—';
        metrics += '<div class="econ-culture-metric"><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><div class="name">' + p.name + '</div>' +
          '<div class="line"><span>Себест.</span><strong>' + (uc > 0 ? fmtNum(uc) : '—') + ' ' + unitLbl + '</strong></div>' +
          '<motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><motion><div class="line"><span>Расходн. посев</span><strong>' + consSqm + ' ₽/м²·мес</strong></div>' +
          '<div class="line"><span>Расходн. всего</span><strong>' + consMo + ' ₽/мес</strong></div>' +
          '<div class="line"><span>Выпуск</span><strong>' + outVal + ' ' + outLbl + '</strong></div>' +
          '<div class="line"><span>Доля</span><strong>' + r1(p.pct) + '% · ' + r1(p.slice.area) + ' м²</strong></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div></div>';`.replace(/<\/motion>|<motion>/g, '');
if (!s.includes('const consUc = p.slice.consumablesUnitCost')) throw new Error('not found');
s = s.replace(
  `        const consUc = p.slice.consumablesUnitCost > 0 ? fmtNum(p.slice.consumablesUnitCost, {decimals: u === 'кг' ? 1 : 0}) : '—';
        metrics += '<div class="econ-culture-metric"><div class="name">' + p.name + '</motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>' +
          '<div class="line"><span>Себест.</span><strong>' + (uc > 0 ? fmtNum(uc) : '—') + ' ' + unitLbl + '</strong></div>' +
          '<div class="line"><span>Расходн.</span><strong>' + consUc + ' ' + unitLbl + '</strong></div>' +
          '<div class="line"><span>Выпуск</span><strong>' + outVal + ' ' + outLbl + '</strong></div>' +
          '<div class="line"><span>Доля</span><strong>' + r1(p.pct) + '% · ' + r1(p.slice.area) + ' м²</strong></div></div>';`.replace(/<\/motion>|<motion>/g, ''),
  `        const consSqm = p.slice.consumablesPerSqm > 0 ? fmtNum(p.slice.consumablesPerSqm) : '—';
        const consMo = p.slice.consumablesCost > 0 ? fmtNum(p.slice.consumablesCost) : '—';
        metrics += '<div class="econ-culture-metric"><div class="name">' + p.name + '</div>' +
          '<div class="line"><span>Себест.</span><strong>' + (uc > 0 ? fmtNum(uc) : '—') + ' ' + unitLbl + '</strong></div>' +
          '<div class="line"><span>Расходн. посев</span><strong>' + consSqm + ' ₽/м²·мес</strong></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></motion></div>' +
          '<div class="line"><span>Расходн. всего</span><strong>' + consMo + ' ₽/мес</strong></div>' +
          '<div class="line"><span>Выпуск</span><strong>' + outVal + ' ' + outLbl + '</strong></div>' +
          '<div class="line"><span>Доля</span><strong>' + r1(p.pct) + '% · ' + r1(p.slice.area) + ' м²</strong></div></div>';`.replace(/<\/motion>|<motion>/g, '')
);
fs.writeFileSync(f, s);
console.log('ok', s.includes('consumablesPerSqm'));
