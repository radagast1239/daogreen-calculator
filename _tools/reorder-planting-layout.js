/**
 * One-shot: reorder planting panels in calculator-110x55_12.html
 * Run: node _tools/reorder-planting-layout.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const viewStart = html.indexOf('<div id="view-planting"');
const viewEnd = html.indexOf('<footer class="colophon">', viewStart);
if (viewStart < 0 || viewEnd < 0) {
  console.error('view-planting or colophon not found');
  process.exit(1);
}

const before = html.slice(0, viewStart);
const viewChunk = html.slice(viewStart, viewEnd);
const after = html.slice(viewEnd);

function grab(chunk, id, tag) {
  const re = new RegExp(
    '[ \\t]*<' + tag + '[^>]*\\bid="' + id + '"[\\s\\S]*?</' + tag + '>[ \\t]*\\n?',
    'm'
  );
  const m = chunk.match(re);
  if (!m) {
    console.error('Missing block:', id);
    process.exit(1);
  }
  return m[0];
}

function grabDiv(chunk, id) {
  const re = new RegExp('[ \\t]*<div id="' + id + '"[\\s\\S]*?</div>[ \\t]*\\n?', 'm');
  const m = chunk.match(re);
  return m ? m[0] : '';
}

const blocks = {
  'facility-env-wrap': grabDiv(viewChunk, 'facility-env-wrap'),
  'planting-active-cv-bar': grabDiv(viewChunk, 'planting-active-cv-bar'),
  'panel-cultivars': grab(viewChunk, 'panel-cultivars', 'section'),
  'planting-hero': grab(viewChunk, 'planting-hero', 'section'),
  'panel-georgy-simple': grab(viewChunk, 'panel-georgy-simple', 'section'),
  'env-panel': grab(viewChunk, 'env-panel', 'section'),
  'panel-culture': grab(viewChunk, 'panel-culture', 'section'),
  'panel-system': grab(viewChunk, 'panel-system', 'section'),
  'panel-pallet-geom': grab(viewChunk, 'panel-pallet-geom', 'section'),
  'panel-metrics': grab(viewChunk, 'panel-metrics', 'section'),
  'panel-schema': grab(viewChunk, 'panel-schema', 'section'),
  'block-panel-recs': grab(viewChunk, 'block-panel-recs', 'section'),
  'panel-gh-yield-totals': grab(viewChunk, 'panel-gh-yield-totals', 'section'),
  'panel-bio-margin': grab(viewChunk, 'panel-bio-margin', 'section'),
  'block-panel-standards': grab(viewChunk, 'block-panel-standards', 'section'),
  'block-panel-growth': grab(viewChunk, 'block-panel-growth', 'section'),
  'panel-cv-compare': grab(viewChunk, 'panel-cv-compare', 'section'),
  'panel-scenarios': grab(viewChunk, 'panel-scenarios', 'section'),
  'farm-cal-nudge': grabDiv(viewChunk, 'farm-cal-nudge'),
  'block-panel-farm-calibration': grab(viewChunk, 'block-panel-farm-calibration', 'section'),
  'panel-channel-guide': grab(viewChunk, 'panel-channel-guide', 'section'),
  'panel-pallet-guide': grab(viewChunk, 'panel-pallet-guide', 'section')
};

const stageRe = /[ \t]*<div class="collapse-block" id="block-stage"[\s\S]*?<\/div>[ \t]*\n/m;
const stageM = blocks['panel-culture'].match(stageRe);
if (!stageM) {
  console.error('block-stage not found');
  process.exit(1);
}
blocks['block-stage'] = stageM[0];
blocks['panel-culture'] = blocks['panel-culture'].replace(stageRe, '\n');

function wrapCollapse(panelId, i18nKey, titleRu, inner) {
  return (
    '  <section class="panel collapse-block" id="' + panelId + '">\n' +
    '    <div class="collapse-head" data-collapse-target="' + panelId + '">\n' +
    '      <span data-i18n="' + i18nKey + '">' + titleRu + '</span>\n' +
    '      <span class="collapse-chev" aria-hidden="true">▼</span>\n' +
    '    </div>\n' +
    '    <div class="collapse-body" id="' + panelId + '-body">\n' +
    inner.replace(/^/gm, '    ') +
    '    </div>\n' +
    '  </section>\n'
  );
}

function toSubpanel(sectionHtml) {
  return sectionHtml
    .replace(/<section class="([^"]*)" id="([^"]+)">/m, '<div class="planting-subpanel $1" id="$2">')
    .replace(/<\/section>\s*$/m, '</div>\n');
}

function unwrapSection(sectionHtml) {
  return sectionHtml
    .replace(/<section class="[^"]*" id="[^"]+">\s*/m, '')
    .replace(/<\/section>\s*$/m, '');
}

const geomInner =
  toSubpanel(blocks['panel-system']) + toSubpanel(blocks['panel-pallet-geom']);

const metricsInner = blocks['block-stage'] + unwrapSection(blocks['panel-metrics']);

const schemaInner = unwrapSection(blocks['panel-schema']);

const ghYieldInner = unwrapSection(blocks['panel-gh-yield-totals']);

const advancedParts = [
  'panel-bio-margin',
  'block-panel-standards',
  'block-panel-growth',
  'panel-cv-compare',
  'panel-scenarios',
  'farm-cal-nudge',
  'block-panel-farm-calibration',
  'panel-channel-guide',
  'panel-pallet-guide'
]
  .filter(function (k) { return blocks[k]; })
  .map(function (k) {
    var s = blocks[k];
    if (s.trim().startsWith('<div')) return s;
    return toSubpanel(s);
  });

const newView =
  '<div id="view-planting" class="app-view">\n\n' +
  blocks['facility-env-wrap'] +
  blocks['planting-active-cv-bar'] +
  blocks['panel-cultivars'] +
  blocks['planting-hero'] +
  blocks['panel-georgy-simple'] +
  blocks['env-panel'] +
  blocks['panel-culture'] +
  wrapCollapse('block-panel-geom', 'ui.planting.geomTitle', 'Размер системы', geomInner) +
  wrapCollapse('panel-metrics', 'ui.planting.metricsTitle', 'Показатели', metricsInner) +
  wrapCollapse('panel-schema', 'ui.planting.schemaTitle', 'Схема — вид сверху', schemaInner) +
  blocks['block-panel-recs'] +
  wrapCollapse('panel-gh-yield-totals', 'gh.yield.title', 'Урожай с полезной площади теплицы', ghYieldInner) +
  wrapCollapse('panel-planting-advanced', 'ui.planting.advancedTitle', 'Дополнительно', advancedParts.join('\n')) +
  '\n';

html = before + newView + after;
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('OK reorder-planting-layout.js');
