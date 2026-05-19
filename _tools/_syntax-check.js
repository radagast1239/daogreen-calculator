const fs = require('fs');
const h = fs.readFileSync('calculator-110x55_12.html', 'utf8');
const scripts = [];
let pos = 0;
while (pos < h.length) {
  const s = h.indexOf('<script', pos);
  if (s < 0) break;
  const srcM = h.slice(s).match(/^<script[^>]*src=/);
  if (srcM) { pos = h.indexOf('>', s) + 1; continue; }
  const start = h.indexOf('>', s) + 1;
  const end = h.indexOf('</script>', start);
  if (end < 0) break;
  scripts.push({ start, end, len: end - start });
  pos = end + 9;
}
let ok = true;
scripts.forEach((sc, i) => {
  try {
    new Function(h.slice(sc.start, sc.end));
  } catch (e) {
    console.error('Script block', i, e.message);
    ok = false;
  }
});
console.log('script blocks:', scripts.length, ok ? 'all OK' : 'ERRORS');
console.log('DOCTYPE count:', (h.match(/<!DOCTYPE/g) || []).length);
console.log('renderEconomics count:', (h.match(/function renderEconomics\(/g) || []).length);
