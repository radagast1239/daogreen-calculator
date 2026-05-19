const fs = require('fs');
const h = fs.readFileSync('calculator-110x55_12.html', 'utf8');
const scripts = [...h.matchAll(/<script(?:\s+src="[^"]+")?\s*>([\s\S]*?)<\/script>/gi)];
let n = 0;
for (const m of scripts) {
  if (m[0].includes('src=')) continue;
  n++;
  try { new Function(m[1]); console.log('inline script OK, len', m[1].length); }
  catch (e) { console.error('FAIL:', e.message); process.exit(1); }
}
console.log('scripts checked:', n);
