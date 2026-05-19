const fs = require('fs');
const root = 'c:/Users/Нико/Desktop/КАЛЬКУЛЯТОР САЛАТОВ ПРОТОЧКА';
const BUILD = '2026-05-17-p22-pdf';
const htmlPath = root + '/calculator-110x55_12.html';
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/2026-05-17-p21-cv/g, BUILD);

if (!html.includes('pdf-export.js')) {
  html = html.replace(
    '<script src="js/econ-ui.js?v=' + BUILD + '"></script>',
    '<script src="js/econ-ui.js?v=' + BUILD + '"></script>\n<script src="js/pdf-export.js?v=' + BUILD + '"></script>'
  );
}

html = html.replace(
  '<button type="button" class="auto-btn print-keep" id="btn-print-pdf" title="Печать или сохранение в PDF">Печать / PDF</button>',
  '<button type="button" class="auto-btn" id="btn-export-pdf" title="Сохранить выбранные разделы в PDF">Сохранить PDF</button>'
);

if (!html.includes('pdf-export-dialog')) {
  const dialogHtml = `
  <dialog id="pdf-export-dialog" class="pdf-export-dialog">
    <form method="dialog" class="pdf-export-form">
      <h2 class="pdf-export-title">Выгрузка в PDF</h2>
      <p class="pdf-export-lead">Отметьте разделы, которые попадут в файл. Печать не используется — только сохранение PDF.</p>
      <motion class="pdf-export-toolbar">
        <button type="button" class="auto-btn" id="pdf-select-all">Выбрать все</button>
        <button type="button" class="auto-btn" id="pdf-select-none">Снять все</button>
      </motion>
      <motion id="pdf-export-checklist" class="pdf-export-checklist"></motion>
      <motion class="pdf-export-actions">
        <button type="button" class="auto-btn" data-pdf-cancel>Отмена</button>
        <button type="submit" class="auto-btn" id="pdf-export-go" value="export">Скачать PDF</button>
      </motion>
    </form>
  </dialog>
`;
  html = html.replace('<dialog id="cv-add-dialog"', dialogHtml + '\n  <dialog id="cv-add-dialog"');
}

if (!html.includes('.pdf-export-dialog')) {
  const css = `
/* PDF export */
.pdf-export-dialog { border: none; border-radius: var(--radius); padding: 0; max-width: min(520px, 92vw); box-shadow: 0 12px 40px rgba(0,0,0,.2); }
.pdf-export-dialog::backdrop { background: rgba(0,0,0,.45); }
.pdf-export-form { padding: 22px 24px 20px; margin: 0; }
.pdf-export-title { font-family: var(--font-display); font-size: 22px; margin: 0 0 8px; font-weight: 400; }
.pdf-export-lead { font-size: 13px; color: var(--ink-soft); margin: 0 0 14px; line-height: 1.45; }
.pdf-export-toolbar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.pdf-export-checklist { max-height: min(50vh, 420px); overflow: auto; margin-bottom: 16px; padding-right: 4px; }
.pdf-export-group { border: 1px solid var(--rule); border-radius: var(--radius); padding: 10px 12px 8px; margin: 0 0 10px; }
.pdf-export-group legend { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-faint); padding: 0 6px; }
.pdf-export-item { display: block; font-size: 14px; padding: 5px 4px; cursor: pointer; }
.pdf-export-item input { margin-right: 8px; }
.pdf-export-actions { display: flex; justify-content: flex-end; gap: 10px; }
.pdf-staging { position: fixed; left: -12000px; top: 0; width: 720px; background: #fff; color: #111; z-index: -1; pointer-events: none; }
.pdf-page-block { page-break-before: always; break-before: page; margin-bottom: 16px; padding: 12px 0; border-bottom: 1px solid #ddd; }
.pdf-page-block:first-child { page-break-before: auto; break-before: auto; }
.pdf-cover-block { padding: 24px 8px 32px; border: none; }
.pdf-cover-brand { font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: #6B7B2E; margin-bottom: 12px; }
.pdf-cover-title { font-size: 26px; margin: 0 0 8px; font-weight: 400; }
.pdf-cover-sub, .pdf-cover-date { font-size: 14px; color: #444; margin: 0 0 6px; }
.pdf-cover-metrics { margin: 20px 0; display: grid; gap: 8px; }
.pdf-cover-metric { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
.pdf-cover-m-l { color: #666; }
.pdf-cover-m-v { font-weight: 600; }
.pdf-cover-build { font-size: 11px; color: #888; margin-top: 24px; }
.pdf-note { font-size: 13px; color: #666; padding: 12px; }
.pdf-static-val { font-weight: 500; }
`;
  html = html.replace('@media print {', css + '\n@media print {');
}

html = html.replace(
  '<section class="panel">\n    <motion class="section-h" id="geom-section-title">',
  '<section class="panel" id="panel-metrics">\n    <div class="section-h" id="geom-section-title">'
);
html = html.replace(
  '<section class="panel">\n    <div class="section-h">Сравнение сценариев и экономика</motion>',
  '<section class="panel" id="panel-scenarios">\n    <motion class="section-h">Сравнение сценариев и экономика</motion>'
);
// fix typo motion -> div in replacements
html = html.replace(/<motion /g, '<motion '); // noop if wrong

// manual fixes for section ids
html = html.replace(
  '    <motion class="section-h" id="geom-section-title">',
  '    <div class="section-h" id="geom-section-title">'
).replace(
  '    <motion class="section-h">Сравнение сценариев и экономика</motion>',
  '    <motion class="section-h">Сравнение сценариев и экономика</div>'
);
