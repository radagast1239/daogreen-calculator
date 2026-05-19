const fs = require('fs');
const path = require('path');
const root = 'c:/Users/Нико/Desktop/КАЛЬКУЛЯТОР САЛАТОВ ПРОТОЧКА';
const htmlPath = path.join(root, 'calculator-110x55_12.html');
let html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('id="pdf-export-dialog"')) {
  const dlg = [
    '  <dialog id="pdf-export-dialog" class="pdf-export-dialog">',
    '    <form method="dialog" class="pdf-export-form">',
    '      <h2 class="pdf-export-title">Выгрузка в PDF</h2>',
    '      <p class="pdf-export-lead">Отметьте разделы для файла. Печать не используется.</p>',
    '      <div class="pdf-export-toolbar">',
    '        <button type="button" class="auto-btn" id="pdf-select-all">Все</button>',
    '        <button type="button" class="auto-btn" id="pdf-select-none">Снять</button>',
    '      </div>',
    '      <div id="pdf-export-checklist" class="pdf-export-checklist"></div>',
    '      <div class="pdf-export-actions">',
    '        <button type="button" class="auto-btn" data-pdf-cancel>Отмена</button>',
    '        <button type="submit" class="auto-btn" id="pdf-export-go" value="export">Скачать PDF</button>',
    '      </div>',
    '    </form>',
    '  </dialog>'
  ].join('\n');
  html = html.replace('<dialog id="cv-add-dialog"', dlg + '\n  <dialog id="cv-add-dialog"');
}

function rep(from, to, flag) {
  if (html.includes(flag)) return;
  if (html.includes(from)) html = html.replace(from, to);
}

rep(
  '  <section class="panel">\n    <div class="section-h" id="geom-section-title">',
  '  <section class="panel" id="panel-metrics">\n    <div class="section-h" id="geom-section-title">',
  'panel-metrics'
);
rep(
  '  <section class="panel">\n    <div class="section-h">Сравнение сценариев и экономика</div>',
  '  <section class="panel" id="panel-scenarios">\n    <div class="section-h">Сравнение сценариев и экономика</div>',
  'panel-scenarios'
);
rep(
  '  <section class="panel">\n    <div class="section-h" id="schema-section-title">',
  '  <section class="panel" id="panel-schema">\n    <div class="section-h" id="schema-section-title">',
  'panel-schema'
);
rep(
  '    <section class="panel">\n      <div class="section-h">Общие параметры</div>',
  '    <section class="panel" id="econ-panel-general">\n      <div class="section-h">Общие параметры</div>',
  'econ-panel-general'
);
rep(
  '    <section class="panel">\n      <div class="section-h">Состав фермы по культурам</div>',
  '    <section class="panel" id="econ-panel-cultures">\n      <div class="section-h">Состав фермы по культурам</motion>',
  'econ-panel-cultures'
);
html = html.replace(
  '    <section class="panel" id="econ-panel-cultures">\n      <div class="section-h">Состав фермы по культурам</motion>',
  '    <section class="panel" id="econ-panel-cultures">\n      <div class="section-h">Состав фермы по культурам</div>'
);
rep(
  '    <section class="panel">\n      <div class="section-h">Затраты (в месяц)</div>',
  '    <section class="panel" id="econ-panel-costs">\n      <div class="section-h">Затраты (в месяц)</div>',
  'econ-panel-costs'
);
rep(
  '    <section class="panel">\n      <div class="section-h">Итог</div>\n      <div class="econ-results-stack"',
  '    <section class="panel" id="econ-panel-results">\n      <div class="section-h">Итог</div>\n      <div class="econ-results-stack"',
  'econ-panel-results'
);

const initOld = "    const printBtn = $('btn-print-pdf');\n    if (printBtn) printBtn.addEventListener('click', () => window.print());";
const initNew = `    if (window.DG_initPdfExport){
      DG_initPdfExport({
        renderEconomics: typeof renderEconomics === 'function' ? renderEconomics : null,
        getExportMeta: function(){
          var r = calc();
          var cv = getActiveCv();
          var lines = [];
          if (cv) lines.push({ label: 'Сорт', value: cv.name, unit: '' });
          if (r && r.mass != null) lines.push({ label: 'Масса урожая', value: r1(r.mass), unit: 'г' });
          if (r && r.canopy != null) lines.push({ label: 'Шапка', value: r1(r.canopy), unit: 'мм' });
          if (r && r.total != null) lines.push({ label: 'Растений', value: fmtNum(r.total), unit: 'шт' });
          if (r && r.sysArea != null) lines.push({ label: 'Посевная площадь', value: r2(r.sysArea), unit: 'м²' });
          var mode = state.appView === 'pallets' ? 'Поддоны' : (state.facility === 'vertical' ? 'VF' : 'Теплица');
          if (state.appView === 'economics') mode = 'Экономика';
          lines.push({ label: 'Режим', value: mode, unit: '' });
          var t = $('page-title');
          var s = $('page-sub');
          return {
            title: t ? t.textContent : 'Калькулятор Daogreen',
            subtitle: s ? s.textContent : '',
            date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
            build: CALC_BUILD,
            lines: lines
          };
        },
        pdfFilename: function(){
          var cv = getActiveCv();
          var slug = (cv && cv.name) ? String(cv.name).replace(/[^a-zA-Z\u0400-\u04FF0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) : 'calc';
          return 'daogreen-' + (slug || 'calc') + '-' + new Date().toISOString().slice(0, 10);
        }
      });
    }`;

if (html.includes(initOld)) html = html.replace(initOld, initNew);
else if (!html.includes('DG_initPdfExport')) {
  html = html.replace('    loadCustomCultivarsStore();', '    loadCustomCultivarsStore();\n' + initNew);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(JSON.stringify({
  dialog: html.includes('pdf-export-dialog'),
  init: html.includes('DG_initPdfExport'),
  metrics: html.includes('panel-metrics'),
  scenarios: html.includes('panel-scenarios'),
  econ: html.includes('econ-panel-results')
}));
