'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INPUT = path.join(ROOT, 'calculator-110x55_12.html');
const EXTRA_CSS = path.join(ROOT, '_extra.css');
const OUT = INPUT;

const MARK_GH = '<div id="env-greenhouse">';
const MARK_SCRIPTS = '<script src="vf-cultivars.js"></script>';

const nl = s => s.replace(/\r\n/g, '\n');

const raw = fs.readFileSync(INPUT, 'utf8');
const extraCss = fs.readFileSync(EXTRA_CSS, 'utf8');

if (!raw.includes(MARK_GH) || !raw.includes(MARK_SCRIPTS)) {
  throw new Error('Required markers missing in source file');
}

const iStyle = raw.indexOf('<style>');
if (iStyle < 0) throw new Error('<style> not found');
const jGH = raw.indexOf(MARK_GH);
const cssBase = nl(raw.slice(iStyle + '<style>'.length, jGH)).trim();
const headBeforeStyle = raw.slice(0, iStyle);

const scriptIdx = raw.indexOf(MARK_SCRIPTS);
let scriptsBlock = nl(raw.slice(scriptIdx)).replace(/\s*<\/body>\s*<\/html>\s*$/i, '');

let middle = nl(raw.slice(jGH, scriptIdx)).trimEnd();

const envSummaryIdx = middle.indexOf('<div class="env-summary"');
if (envSummaryIdx < 0) throw new Error('env-summary block not found');
const envSummaryClose = middle.indexOf('</div>', envSummaryIdx);
if (envSummaryClose < 0) throw new Error('env-summary closing tag not found');
const afterEnvSummary = envSummaryClose + '</div>'.length;

let tail = middle.slice(afterEnvSummary).replace(/^\s*/, '');
if (tail.startsWith('</section>')) tail = tail.slice('</section>'.length).replace(/^\s*/, '');

const envInner = middle.slice(0, afterEnvSummary).trimEnd();

const footIdx = tail.lastIndexOf('</footer>');
if (footIdx >= 0) {
  const maybe = tail.slice(footIdx + '</footer>'.length).trim();
  if (maybe === '</div>') tail = tail.slice(0, footIdx + '</footer>'.length).trimEnd();
}

const chartNeedle = [
  '    <div class="toggle-wrap" style="margin-bottom: 12px">',
  '      <span class="toggle-label">Сравнить все сорта на одном графике</span>',
  '      <label class="toggle">',
  '        <input type="checkbox" id="compareMode">',
  '        <span class="toggle-switch"></span>',
  '      </label>',
  '    </div>',
  '    <div class="viz-frame">',
].join('\n');

const chartInsert = [
  '    <div class="toggle-wrap" style="margin-bottom: 12px">',
  '      <span class="toggle-label">Сравнить все сорта на одном графике</span>',
  '      <label class="toggle">',
  '        <input type="checkbox" id="compareMode">',
  '        <span class="toggle-switch"></span>',
  '      </label>',
  '    </div>',
  '    <div id="compare-pick-wrap" class="compare-pick-wrap env-block-hidden">',
  '      <div class="compare-pick-actions">',
  '        <button type="button" class="auto-btn" id="compare-pick-all">Все</button>',
  '        <button type="button" class="auto-btn" id="compare-pick-none">Снять все</button>',
  '        <button type="button" class="auto-btn" id="compare-pick-active">Только текущий сорт</button>',
  '      </div>',
  '      <div class="compare-pick-grid" id="compare-pick-grid"></div>',
  '    </div>',
  '    <div class="viz-frame">',
].join('\n');

if (!tail.includes(chartNeedle)) throw new Error('Chart section needle not found — file layout changed');
const tailPatched = tail.replace(chartNeedle, chartInsert);

const titleMatch = nl(headBeforeStyle).match(/<title>([^<]*)<\/title>/i);
const docTitle = (titleMatch && titleMatch[1] && titleMatch[1].trim()) || 'Калькулятор салатов 110×55 мм';

const masthead = [
  '  <header class="masthead">',
  '    <div class="masthead-bar">',
  '      <div class="brand-logo" id="brand">Daogreen</div>',
  '      <button type="button" class="theme-toggle" id="theme-toggle" title="Светлая / тёмная тема" aria-label="Переключить тему">',
  '        <span class="theme-toggle-track" aria-hidden="true"><span class="theme-toggle-knob"></span></span>',
  '        <span class="theme-toggle-label">Тема</span>',
  '      </button>',
  '    </div>',
  '    <p class="kicker">Проточный канал 110 × 55 мм</p>',
  '    <h1 class="page-title">' + docTitle.replace(/</g, '') + '</h1>',
  '    <p class="page-sub" id="page-sub">Теплица (~41° с. ш.): салат и зелень, месяц и досветка. Плотность до 220 шт/м². Габарит — до 2 м × 12 м.</p>',
  '  </header>',
  '',
  '  <div class="facility-bar" id="facility-bar" role="tablist" aria-label="Тип объекта выращивания">',
  '    <button type="button" class="facility-btn on" data-facility="greenhouse" role="tab" aria-selected="true">Теплица</button>',
  '    <button type="button" class="facility-btn" data-facility="vertical" role="tab" aria-selected="false">Вертикаль / закрытый зал</button>',
  '  </div>',
  '',
].join('\n');

const culturePanel = [
  '  <section class="panel" id="panel-culture">',
  '    <div class="section-h">Культура и параметры цикла</div>',
  '',
  '    <div class="ctrl">',
  '      <span class="ctrl-label">Сорт / система</span>',
  '      <div class="cultivar-grid" id="cultivars" style="grid-column: 2 / 4"></div>',
  '    </div>',
  '',
  '    <div id="vf-sheet-panel" class="vf-sheet-panel env-block-hidden">',
  '      <div class="section-h" style="margin-top:0">Стандарты культуры (лист VF)</div>',
  '      <p class="vf-cv-std-hint" id="vf-cv-std-hint"></p>',
  '      <div class="vf-std-grid" id="vf-std-grid"></div>',
  '    </div>',
  '',
  '    <div class="collapse-block" id="block-grow-time" data-collapse-vf="germination,day">',
  '      <div class="collapse-head" data-collapse-target="block-grow-time">',
  '        <span>Время выращивания</span>',
  '        <span class="collapse-hint collapse-vf-only env-block-hidden">при сворачивании — стандарты VF</span>',
  '        <span class="collapse-chev" aria-hidden="true">▼</span>',
  '      </div>',
  '      <div class="collapse-body" id="block-grow-time-body">',
  '        <p class="grow-flow-note">Сначала <strong>прорастание</strong>, затем <strong>рассада 7–28 сут</strong> (вручную), затем <strong>доращивание в канале</strong>.</p>',
  '',
  '        <div class="ctrl" id="ctrl-germination" data-vf-param="germination">',
  '          <span class="ctrl-label">Время прорастания<span class="vf-sheet-badge env-block-hidden" id="vf-badge-germination">стандарт</span></span>',
  '          <input type="range" id="germination" min="1" max="21" step="1" value="5">',
  '          <span class="ctrl-val"><span id="germination-v">5</span><span class="unit">сут</span></span>',
  '        </div>',
  '',
  '        <div class="ctrl" id="ctrl-nursery" data-vf-param="nursery">',
  '          <span class="ctrl-label">Рассада<span class="vf-sheet-badge env-block-hidden" id="vf-badge-nursery">стандарт</span></span>',
  '          <input type="range" id="nursery" min="7" max="28" step="1" value="14">',
  '          <span class="ctrl-val"><span id="nursery-v">14</span><span class="unit">сут</span></span>',
  '        </div>',
  '',
  '        <div class="ctrl" id="ctrl-day" data-vf-param="day">',
  '          <span class="ctrl-label">День в канале<span class="vf-sheet-badge env-block-hidden" id="vf-badge-day">стандарт</span></span>',
  '          <input type="range" id="day" min="1" max="40" step="1" value="21">',
  '          <span class="ctrl-val"><span id="day-v">21</span><span class="unit">сут</span></span>',
  '        </div>',
  '        <div class="ctrl-row-extra">',
  '          <button type="button" class="auto-btn" id="auto-day">→ К рекомендованному дню съёма</button>',
  '        </div>',
  '      </div>',
  '    </div>',
  '',
  '    <div class="collapse-block" id="block-mass" data-collapse-vf="mass">',
  '      <div class="collapse-head" data-collapse-target="block-mass">',
  '        <span>Масса на выходе</span>',
  '        <span class="collapse-hint collapse-vf-only env-block-hidden">при сворачивании — стандарт VF</span>',
  '        <span class="collapse-chev" aria-hidden="true">▼</span>',
  '      </div>',
  '      <div class="collapse-body" id="block-mass-body">',
  '        <div class="toggle-wrap" style="margin-bottom: 12px">',
  '          <span class="toggle-label">Задать массу вручную (фиксировать вес партии)</span>',
  '          <label class="toggle">',
  '            <input type="checkbox" id="useManualMass">',
  '            <span class="toggle-switch"></span>',
  '          </label>',
  '        </div>',
  '',
  '        <div id="manual-mass-block" class="env-block-hidden">',
  '          <div class="ctrl">',
  '            <span class="ctrl-label">Масса, г<span class="vf-sheet-badge env-block-hidden" id="vf-badge-mass">стандарт</span></span>',
  '            <input type="range" id="manualMass" min="5" max="500" step="1" value="120">',
  '            <span class="ctrl-val"><span id="manualMass-v">120</span><span class="unit">г</span></span>',
  '          </div>',
  '        </div>',
  '',
  '        <div class="ctrl-row-extra mass-auto-row">',
  '          <button type="button" class="auto-btn" id="auto-mass">→ Взять массу из модели (авто)</button>',
  '        </div>',
  '',
  '        <div id="mass-model-hint" style="font-size:12.5px;color:var(--ink-faint);line-height:1.5;margin:0 0 4px"></div>',
  '      </div>',
  '    </div>',
  '',
  '    <div class="collapse-block" id="block-stage" data-collapse-vf="">',
  '      <div class="collapse-head" data-collapse-target="block-stage">',
  '        <span>Стадия развития</span>',
  '        <span class="collapse-chev" aria-hidden="true">▼</span>',
  '      </div>',
  '      <div class="collapse-body" id="block-stage-body">',
  '        <div id="stage-bar" class="stage-bar" role="list">',
  '          <div class="stage-seg" data-stage="young" role="listitem"><span class="stage-lbl">Молодая</span></div>',
  '          <div class="stage-seg" data-stage="mature" role="listitem"><span class="stage-lbl">Наливается</span></div>',
  '          <div class="stage-seg" data-stage="full" role="listitem"><span class="stage-lbl">Полная</span></div>',
  '          <div class="stage-seg" data-stage="bolt" role="listitem"><span class="stage-lbl">Стрекление</span></div>',
  '        </div>',
  '        <div class="metrics" id="metrics-growth"></div>',
  '      </div>',
  '    </div>',
  '  </section>',
  '',
].join('\n');

const envPanel = [
  '  <section class="panel" id="env-panel">',
  '    <div class="section-h">Среда выращивания</div>',
  envInner,
  '  </section>',
  '',
].join('\n');

const out = [
  nl(headBeforeStyle).trimEnd(),
  '<style>',
  cssBase,
  '',
  nl(extraCss).trim(),
  '</style>',
  '</head>',
  '<body>',
  '<div class="page">',
  masthead,
  culturePanel,
  envPanel,
  tailPatched,
  '</div>',
  '',
  scriptsBlock.trimEnd(),
  '',
  '</body>',
  '</html>',
  '',
].join('\n');

fs.writeFileSync(OUT, out, 'utf8');

const lines = out.split(/\r?\n/).length;
console.log('RESTORE_OK lines=' + lines);
console.log('checks:', {
  styleBeforeBody: out.indexOf('</style>') < out.indexOf('<body>'),
  facilityBar: out.includes('id="facility-bar"'),
  germination: out.includes('id="germination"'),
  blockGrow: out.includes('id="block-grow-time"'),
});
