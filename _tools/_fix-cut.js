const fs = require('fs');
const tag = 'div';
let h = fs.readFileSync('calculator-110x55_12.html', 'utf8');
const old = "$('cut-schedule').innerHTML = '<" + tag + " style=\"color:var(--ink-faint);font-size:13px\">Нет срезов в допустимом окне — увеличьте сут в канале (вегетация) или интервал.</" + tag + ">';";
const neu = "$('cut-schedule').innerHTML = '<" + tag + " style=\"color:var(--ink-faint);font-size:13px\">Нет срезов в допустимом окне — увеличьте сут ' + vegContextLabel() + ' (вегетация) или интервал.</" + tag + ">';";
if (h.includes(old)) {
  h = h.replace(old, neu);
  fs.writeFileSync('calculator-110x55_12.html', h);
  console.log('ok');
} else console.log('not found');
