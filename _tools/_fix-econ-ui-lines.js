const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'js', 'econ-ui.js');
const lines = fs.readFileSync(p, 'utf8').split('\n');
const rub = '\u20BD';
const fix680 = "          '<div class=\"line\"><span>\u041f\u043e\u0441\u0435\u0432 (\u0440\u0430\u0437\u043e\u0432\u043e)</span><strong>' + consOnceSqm + ' ' + moneySym() + L('econ.perSqm') + '</strong> \u00b7 ' + consOnceArea + ' ' + moneySym() + '</motion>' +";
const fix681 = "          '<div class=\"line\"><span>\u041f\u043e\u0441\u0435\u0432 \u0432 \u043c\u0435\u0441\u044f\u0446</span><strong>' + consSqm + ' ' + moneySym() + L('econ.perSqmMonth') + '</strong></div>' +";
const fix682 = "          '<div class=\"line\"><span>\u0420\u0430\u0441\u0445\u043e\u0434\u043d. \u043d\u0430 \u0443\u0447\u0430\u0441\u0442\u043e\u043a</span><strong>' + consMo + ' ' + moneySym() + L('econ.perMonth') + '</strong></div>' +";
fix680.replace('</motion>', '</motion>');
const f680 = "          '<div class=\"line\"><span>\u041f\u043e\u0441\u0435\u0432 (\u0440\u0430\u0437\u043e\u0432\u043e)</span><strong>' + consOnceSqm + ' ' + moneySym() + L('econ.perSqm') + '</strong> \u00b7 ' + consOnceArea + ' ' + moneySym() + '</div>' +";
if (lines[679] && lines[679].includes('\u041f\u043e\u0441\u0435\u0432 (\u0440\u0430\u0437\u043e\u0432\u043e)')) {
  lines[679] = f680;
  lines[680] = fix681;
  lines[681] = fix682;
  fs.writeFileSync(p, lines.join('\n'));
  console.log('fixed lines 680-682');
} else {
  console.log('line 680:', lines[679]);
  process.exit(1);
}
