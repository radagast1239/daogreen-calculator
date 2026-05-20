'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const start = t.indexOf('  function getVfCvStandards(cv){\r\n    cv = cv || getVfCv();');
const end = t.indexOf('  function boltChannel(cv){');
if (start < 0 || end < 0 || end <= start) {
  console.error('dup block', start, end);
  process.exit(1);
}
t = t.slice(0, start) + t.slice(end);
fs.writeFileSync(p, t);
console.log('removed', end - start, 'chars');
