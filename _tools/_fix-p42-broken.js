const fs = require('fs');
const p = require('path').join(__dirname, '..', 'calculator-110x55_12.html');
let h = fs.readFileSync(p, 'utf8');

h = h.replace(
  "font-size:13px\">ui('ui.cut.noCutsHint', { dUnit: pm('unit.days'), ctx: vegContextLabel() })</div>",
  "font-size:13px\">' + ui('ui.cut.noCutsHint', { dUnit: pm('unit.days'), ctx: vegContextLabel() }) + '</motion.div>"
);
h = h.replace("font-size:13px\">' + ui('ui.cut.noCutsHint'", "font-size:13px\">' + ui('ui.cut.noCutsHint'");
h = h.replace(/\+ '<\/motion\.div>';$/, "+ '</motion.div>';");
h = h.replace(
  "font-size:13px\">' + ui('ui.cut.noCutsHint', { dUnit: pm('unit.days'), ctx: vegContextLabel() }) + '</motion.div>",
  "font-size:13px\">' + ui('ui.cut.noCutsHint', { dUnit: pm('unit.days'), ctx: vegContextLabel() }) + '</div>"
);

h = h.replace(
  'font-size:9">ui(\'ui.schema.lidCraft\', { cells: cells })</text>',
  "font-size:9\">' + ui('ui.schema.lidCraft', { cells: cells }) + '</text>"
);

h = h.replace(
  'text-anchor="middle">a = \' + round(r.a) + \' мм</text>',
  'text-anchor="middle">\' + ui(\'ui.schema.dimA\', { a: round(r.a) }) + \'</text>'
);
h = h.replace(
  'text-anchor="end">b = \' + round(r.b) + \' мм</text>',
  'text-anchor="end">\' + ui(\'ui.schema.dimB\', { b: round(r.b) }) + \'</text>'
);
h = h.replace(
  'text-anchor="start">⤬ \' + round(r.nearest) + \' мм</text>',
  'text-anchor="start">\' + ui(\'ui.schema.dimNearest\', { d: round(r.nearest) }) + \'</text>'
);

h = h.replace(
  "font-size:9\">кассета ' + (c + 1) + ' · 400×600 · ' + cells + ' яч.</text>",
  "font-size:9\">' + ui('ui.schema.cassetteN', { n: c + 1, cells: cells }) + '</text>"
);

fs.writeFileSync(p, h, 'utf8');
console.log('done');
