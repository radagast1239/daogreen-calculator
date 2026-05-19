const fs = require('fs');
const p = require('path').join(__dirname, '_patch-i18n-p43.js');
let lines = fs.readFileSync(p, 'utf8').split('\n');
const i0 = lines.findIndex(l => l.includes("html \\+= '<motion.motion.div"));
const i1 = lines.findIndex((l, i) => i > (i0 >= 0 ? i0 : 0) && l.includes('/if (!id'));
if (i0 < 0 || i1 < 0) {
  console.error('range not found', i0, i1);
  process.exit(1);
}
const rep = [
  "h = h.replace(",
  "  /html \\+= '<div class=\"cv-group-h\">\\u041c\\u043e\\u0438 \\u0441\\u043e\\u0440\\u0442\\u0430<\\/div>';/,",
  "  \"html += '<div class=\\\"cv-group-h\\\">' + ui('ui.cv.myCultivars') + '</div>';\"",
  ");",
  ""
];
lines.splice(i0, i1 - i0, ...rep);
fs.writeFileSync(p, lines.join('\n'));
console.log('ok', i0, i1);
