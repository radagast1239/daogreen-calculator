'use strict';
/**
 * Генерирует фрагмент для js/gh-cultivars-user.js из листа калибровки Excel.
 *
 * npm run gen:gh-user -- "C:\path\lettuce-cultivars-reference.xlsx"
 *
 * Ожидаемые колонки (регистр не важен): id, M_max, k, t50, ca [, canopyExp]
 * Пустые строки и строки без id пропускаются.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function readAllSheets(xlsxPath) {
  const full = path.isAbsolute(xlsxPath) ? xlsxPath : path.join(ROOT, xlsxPath);
  if (!fs.existsSync(full)) throw new Error('File not found: ' + full);
  const dir = path.join(__dirname, '_calib_tmp');
  const zip = path.join(__dirname, '_calib.zip');
  fs.copyFileSync(full, zip);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
  fs.mkdirSync(dir, { recursive: true });
  execSync(
    'powershell -NoProfile -Command "Expand-Archive -LiteralPath \'' +
      zip.replace(/'/g, "''") +
      "' -DestinationPath '" +
      dir.replace(/'/g, "''") +
      "' -Force\""
  );
  const strings = [];
  const ssPath = path.join(dir, 'xl', 'sharedStrings.xml');
  if (fs.existsSync(ssPath)) {
    const xml = fs.readFileSync(ssPath, 'utf8');
    const re = /<t[^>]*>([^<]*)<\/t>/g;
    let m;
    while ((m = re.exec(xml))) strings.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<'));
  }
  function colToIndex(col) {
    let n = 0;
    for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
    return n - 1;
  }
  function parseSheetXml(sxml) {
    const rows = new Map();
    const re2 = /<c r="([A-Z]+)(\d+)"([^>]*)>(?:<v>([^<]*)<\/v>)?(?:<is><t>([^<]*)<\/t><\/is>)?/g;
    let m;
    while ((m = re2.exec(sxml))) {
      const col = colToIndex(m[1]);
      const row = parseInt(m[2], 10) - 1;
      const attrs = m[3] || '';
      let val = m[5] != null ? m[5] : m[4];
      if (val == null) val = '';
      if (/t="s"/.test(attrs)) val = strings[parseInt(val, 10)] || '';
      if (!rows.has(row)) rows.set(row, []);
      const arr = rows.get(row);
      while (arr.length <= col) arr.push('');
      arr[col] = String(val).trim();
    }
    const maxRow = Math.max(0, ...rows.keys());
    const out = [];
    for (let r = 0; r <= maxRow; r++) out.push(rows.get(r) || []);
    return out;
  }
  const sheetsDir = path.join(dir, 'xl', 'worksheets');
  const names = fs.readdirSync(sheetsDir).filter((f) => f.endsWith('.xml') && f !== 'sheet.xml').sort();
  return names.map((f) => parseSheetXml(fs.readFileSync(path.join(sheetsDir, f), 'utf8')));
}

function normHeader(h) {
  return String(h || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function rowsToPatches(matrix) {
  if (!matrix.length) return [];
  let headerRow = 0;
  for (let r = 0; r < Math.min(5, matrix.length); r++) {
    const line = (matrix[r] || []).map(normHeader).join('|');
    if (line.includes('id') && (line.includes('m_max') || line.includes('mmax'))) {
      headerRow = r;
      break;
    }
  }
  const hdr = (matrix[headerRow] || []).map(normHeader);
  const idx = {};
  hdr.forEach((h, i) => {
    if (h === 'id' || h === 'cultivar_id' || h === 'cv_id') idx.id = i;
    if (h === 'm_max' || h === 'mmax' || h === 'mass_max') idx.M_max = i;
    if (h === 'k') idx.k = i;
    if (h === 't50' || h === 't_50') idx.t50 = i;
    if (h === 'ca') idx.ca = i;
    if (h === 'canopyexp' || h === 'canopy_exp') idx.canopyExp = i;
  });
  if (idx.id == null) throw new Error('No id column in sheet header');
  const patches = [];
  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const id = String(row[idx.id] || '').trim();
    if (!id) continue;
    const patch = { id: id.replace(/\s+/g, '-').toLowerCase(), calibrated: true };
    ['M_max', 'k', 't50', 'ca', 'canopyExp'].forEach(function (key) {
      if (idx[key] == null) return;
      const raw = row[idx[key]];
      if (raw === '' || raw == null) return;
      const n = parseFloat(String(raw).replace(',', '.'));
      if (!isNaN(n)) patch[key] = n;
    });
    if (Object.keys(patch).length > 1) patches.push(patch);
  }
  return patches;
}

function formatJs(patches) {
  const lines = patches.map(function (p) {
    const keys = Object.keys(p);
    const inner = keys
      .map(function (k) {
        const v = p[k];
        if (typeof v === 'string') return k + ": '" + v.replace(/'/g, "\\'") + "'";
        return k + ': ' + v;
      })
      .join(', ');
    return '    { ' + inner + ' }';
  });
  return (
    '  var OVERRIDES = [\n' +
    lines.join(',\n') +
    '\n  ];'
  );
}

function main() {
  const xlsx = process.argv[2];
  const sheetIdx = parseInt(process.argv[3] || '2', 10);
  if (!xlsx) {
    console.error('Usage: node _tools/gen-gh-user-from-xlsx.js <path-to.xlsx> [sheetIndex=2]');
    process.exit(1);
  }
  const sheets = readAllSheets(xlsx);
  if (sheetIdx < 0 || sheetIdx >= sheets.length) {
    console.error('Sheet index ' + sheetIdx + ' out of range (0..' + (sheets.length - 1) + ')');
    process.exit(1);
  }
  const patches = rowsToPatches(sheets[sheetIdx]);
  if (!patches.length) {
    console.error('No calibration rows found on sheet ' + sheetIdx);
    process.exit(1);
  }
  console.log('// Paste into js/gh-cultivars-user.js (' + patches.length + ' cultivars)\n');
  console.log(formatJs(patches));
}

main();
