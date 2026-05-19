/**
 * Сделать js/preview-config.js из скачанного проекта (кнопка JSON в калькуляторе).
 *
 *   node _tools/project-to-preview-config.js путь\к\daogreen-project-....json
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'js', 'preview-config.js');

const PREVIEW_KEYS = [
  'appView', 'facility', 'cv', 'temp', 'month', 'lighting', 'day',
  'germination', 'nursery', 'nch', 'density', 'offset', 'pot',
  'multicut', 'ghUsefulArea', 'palletCv', 'vfCv'
];

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Укажите файл проекта (кнопка JSON в калькуляторе):');
  console.error('  node _tools/project-to-preview-config.js Downloads\\daogreen-project-....json');
  process.exit(1);
}

const abs = path.isAbsolute(jsonPath) ? jsonPath : path.join(process.cwd(), jsonPath);
let data;
try {
  data = JSON.parse(fs.readFileSync(abs, 'utf8'));
} catch (e) {
  console.error('Не удалось прочитать JSON:', e.message);
  process.exit(1);
}

const st = data.state || data;
if (!st || typeof st !== 'object') {
  console.error('В файле нет поля state');
  process.exit(1);
}

const cfg = { georgyMode: false };
PREVIEW_KEYS.forEach(function (k) {
  if (st[k] !== undefined && st[k] !== null) cfg[k] = st[k];
});
cfg.georgyMode = false;

const body =
  '/** Сгенерировано из ' + path.basename(abs) + ' */\n' +
  '(function (g) {\n' +
  '  g.DG_PREVIEW_CONFIG = ' + JSON.stringify(cfg, null, 2) + ';\n' +
  '})(typeof window !== \'undefined\' ? window : global);\n';

fs.writeFileSync(OUT, body, 'utf8');
console.log('Записано: js/preview-config.js');
console.log(JSON.stringify(cfg, null, 2));
