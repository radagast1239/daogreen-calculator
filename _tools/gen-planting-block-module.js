'use strict';
/**
 * Извлечь диапазон строк из calculator inline → тело фабрики DG_create*(deps).
 * node _tools/gen-planting-block-module.js <startLine> <endLine> <outFile> <factoryName>
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'calculator-110x55_12.html');
const startLine = parseInt(process.argv[2], 10);
const endLine = parseInt(process.argv[3], 10);
const outFile = process.argv[4];
const factoryName = process.argv[5] || 'createPlantingBlock';

if (!startLine || !endLine || !outFile) {
  console.error('usage: gen-planting-block-module.js <start> <end> <out> [factoryName]');
  process.exit(1);
}

const lines = fs.readFileSync(htmlPath, 'utf8').split(/\r?\n/);
const slice = lines.slice(startLine - 1, endLine);

function prepBody(src) {
  let b = src.join('\n');
  b = b.replace(/\bstate\./g, 'st().');
  b = b.replace(/\bstate\b/g, 'st()');
  b = b.replace(/st\(\)\(\)/g, 'st()');
  return b;
}

const body = prepBody(slice);

const header =
  '/**\n * Auto-extracted from calculator-110x55_12.html (lines ' +
  startLine +
  '–' +
  endLine +
  ').\n * ' +
  factoryName +
  '(deps)\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function ' +
  factoryName +
  '(deps) {\n' +
  '    function st() { return deps.getState(); }\n' +
  '    function $(id) { return deps.$(id); }\n' +
  '    var lightSync = false;\n\n';

const footer =
  '\n    return api;\n  }\n\n' +
  '  global.DG_' +
  factoryName.replace(/^create/, 'create') +
  ' = ' +
  factoryName +
  ';\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

console.warn('Manual step: add return api = { ... } with exported functions');
fs.writeFileSync(path.join(root, outFile), header + body + footer, 'utf8');
console.log('wrote', outFile, 'lines', slice.length);
