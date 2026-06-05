'use strict';
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'calculator-110x55_12.html'), 'utf8');
const start = html.indexOf('id="view-planting"');
const end = html.indexOf('<footer class="colophon"');
const view = html.slice(start, end);

const ids = [...view.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];

const required = [
  'facility-env-wrap', 'planting-active-cv-bar', 'panel-cultivars', 'planting-hero',
  'panel-georgy-simple', 'env-panel', 'panel-culture', 'block-panel-geom', 'panel-system',
  'panel-pallet-geom', 'panel-metrics', 'block-stage', 'metrics-growth', 'metrics-geom',
  'metrics-canopy', 'metrics-sys', 'panel-schema', 'block-panel-recs', 'panel-bio-margin',
  'panel-gh-yield-totals', 'panel-planting-advanced', 'block-panel-standards',
  'block-panel-growth', 'panel-cv-compare', 'panel-scenarios', 'farm-cal-nudge',
  'block-panel-farm-calibration', 'recs', 'schema', 'growth-chart'
];

const missing = required.filter((id) => !ids.includes(id));
const order = required
  .filter((id) => ids.includes(id))
  .map((id) => ({ id, pos: view.indexOf('id="' + id + '"') }))
  .sort((a, b) => a.pos - b.pos);

console.log('=== DOM ID audit (view-planting) ===');
console.log('Duplicate IDs:', dup.length ? dup.join(', ') : 'none');
console.log('Missing required IDs:', missing.length ? missing.join(', ') : 'none');
console.log('\nVisual order:');
order.forEach((o, i) => console.log('  ' + (i + 1) + '. ' + o.id));

// grep JS for getElementById / querySelector on planting ids
const jsDir = path.join(__dirname, '..', 'js');
const jsFiles = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));
const idRefs = new Map();
const reGet = /\$\(['"]([#]?)([\w-]+)['"]\)|getElementById\(['"]([\w-]+)['"]\)|querySelector\(['"]#([\w-]+)/g;

for (const file of jsFiles) {
  const src = fs.readFileSync(path.join(jsDir, file), 'utf8');
  let m;
  while ((m = reGet.exec(src)) !== null) {
    const id = m[2] || m[3] || m[4];
    if (!id || id.length < 3) continue;
    if (!idRefs.has(id)) idRefs.set(id, []);
    idRefs.get(id).push(file);
  }
}

const plantingIds = new Set(ids);
const broken = [];
for (const [id, files] of idRefs) {
  if (id.startsWith('view-') || id.startsWith('block-econ')) continue;
  if (/^(app|body|html|main|root)$/.test(id)) continue;
  if (plantingIds.has(id)) continue;
  // only report ids that look like planting panels
  if (/^(panel-|block-|metrics-|env-|planting-|recs|schema|growth-|gh-|vf-|pallet-|facility-|ctrl-|target)/.test(id)) {
    if (!html.includes('id="' + id + '"')) {
      broken.push({ id, files: [...new Set(files)].slice(0, 3) });
    }
  }
}

console.log('\n=== JS refs to missing DOM ids (planting-like) ===');
if (!broken.length) console.log('none');
else broken.slice(0, 30).forEach((b) => console.log('  #' + b.id + ' in ' + b.files.join(', ')));
