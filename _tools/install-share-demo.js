'use strict';
/** Копирует экспорт JSON в demos/ для ссылки ?share=demos/… */
const fs = require('fs');
const path = require('path');

const src = process.argv[2];
if (!src) {
  console.error('Использование: npm run share:install-demo -- путь\\к\\daogreen-project-….json');
  process.exit(1);
}

const abs = path.isAbsolute(src) ? src : path.join(process.cwd(), src);
const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
if (!data.state && data.v !== 1) {
  console.error('Файл не похож на проект калькулятора (нет state)');
  process.exit(1);
}

const base = path.basename(abs, '.json').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'demo';
const outDir = path.join(__dirname, '..', 'demos');
const out = path.join(outDir, base + '.json');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(out, JSON.stringify(data, null, 2), 'utf8');
console.log('Записано:', path.relative(path.join(__dirname, '..'), out).replace(/\\/g, '/'));
console.log('Ссылка: calculator-110x55_12.html?share=demos/' + base + '.json');
