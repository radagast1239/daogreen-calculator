'use strict';
/**
 * Одноразовый помощник: вырезать фрагменты из calculator-110x55_12.html.
 * node _tools/split-calculator-extract.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'calculator-110x55_12.html');
const lines = fs.readFileSync(htmlPath, 'utf8').split(/\r?\n/);

function slice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

function writeJs(rel, body, header) {
  const p = path.join(root, rel);
  const wrap =
    (header || '') +
    '(function(global){\n' +
    "'use strict';\n" +
    body +
    '\n})(typeof window !== \'undefined\' ? window : globalThis);\n';
  fs.writeFileSync(p, wrap, 'utf8');
  console.log('wrote', rel, body.split('\n').length, 'lines body');
}

// Theme: lines 2862-2894 (inside script)
writeJs(
  'js/calc-theme.js',
  slice(2862, 2894),
  '/** Тема light/dark — раньше inline в calculator HTML */\n'
);

// Pallet warn: 2852-2858
writeJs(
  'js/pallet-load-warn.js',
  slice(2852, 2858),
  '/** Предупреждение, если не загрузился pallet-cultivars.js */\n'
);

// GH cultivars: 2949-2967
const cultivarsBody =
  '  global.DG_GH_CULTIVARS = [\n' +
  slice(2950, 2967) +
  '\n  ];';
writeJs('js/gh-cultivars.js', cultivarsBody, '/** Сорта теплицы (CULTIVARS) — только справочник */\n');

// CV colors: 3028-3047
const colorsBody =
  '  global.DG_GH_CV_COLORS = {\n' +
  slice(3029, 3046) +
  '\n  };';
writeJs('js/gh-cv-colors.js', colorsBody, '/** Палитра сравнения сортов теплицы */\n');

console.log('done — patch HTML manually or run split-calculator-apply.js');
