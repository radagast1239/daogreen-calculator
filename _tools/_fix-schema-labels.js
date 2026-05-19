const fs = require('fs');
const p = require('path').join(__dirname, '..', 'calculator-110x55_12.html');
let h = fs.readFileSync(p, 'utf8');
h = h.replace(
  'font-size:9">ui(\'ui.schema.lidCraft\', { cells: cells })</text>',
  "font-size:9\">' + ui('ui.schema.lidCraft', { cells: cells }) + '</text>"
);
const casOld = "font-size:9\">\u043a\u0430\u0441\u0441\u0435\u0442\u0430 ' + (c + 1) + ' \u00b7 400\u00d7600 \u00b7 ' + cells + ' \u044f\u0447.</text>";
const casNew = "font-size:9\">' + ui('ui.schema.cassetteN', { n: c + 1, cells: cells }) + '</text>";
if (h.includes(casOld)) h = h.replace(casOld, casNew);
fs.writeFileSync(p, h, 'utf8');
console.log('lid fixed', !h.includes("ui('ui.schema.lidCraft'"));
