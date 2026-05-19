'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

function excelSerialToDM(n) {
  const d = new Date(Math.round((n - 25569) * 86400000));
  return d.getUTCDate() + '-' + (d.getUTCMonth() + 1);
}

function readXlsx(file, maxR, maxC) {
  const dir = path.join(__dirname, '_audit_tmp');
  const zip = path.join(__dirname, '_audit.zip');
  const full = path.isAbsolute(file) ? file : path.join(root, file);
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
  const ssPath = path.join(dir, 'xl', 'sharedStrings.xml');
  const strings = [];
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
  const sheetsDir = path.join(dir, 'xl', 'worksheets');
  const sheet = fs.readdirSync(sheetsDir).filter((f) => f.endsWith('.xml')).sort()[0];
  const sxml = fs.readFileSync(path.join(sheetsDir, sheet), 'utf8');
  const rows = {};
  const re2 = /<c r="([A-Z]+)(\d+)"([^>]*)>(?:<v>([^<]*)<\/v>)?(?:<is><t>([^<]*)<\/t><\/is>)?/g;
  let m;
  while ((m = re2.exec(sxml))) {
    const col = colToIndex(m[1]);
    const row = parseInt(m[2], 10);
    let val = m[4] || m[5] || '';
    if (m[3].includes('t="s"')) val = strings[parseInt(val, 10)] || val;
    if (!rows[row]) rows[row] = {};
    rows[row][col] = val;
  }
  const maxRow = Math.min(maxR, Math.max(...Object.keys(rows).map(Number), 0));
  for (let r = 1; r <= maxRow; r++) {
    const line = [];
    for (let c = 0; c < maxC; c++) {
      let v = rows[r] && rows[r][c] ? String(rows[r][c]) : '';
      const n = parseFloat(v);
      if (!isNaN(n) && n > 40000 && n < 50000) v = excelSerialToDM(n) + ' (was ' + n + ')';
      line.push(v.slice(0, 55));
    }
    if (line.some((x) => x)) console.log('R' + r + '\t' + line.join('|'));
  }
}

const f = process.argv[2] || 'АУДИТ/ПОДДОНЫ.xlsx';
const maxR = parseInt(process.argv[3], 10) || 80;
console.log('\n######## ' + f + ' ########');
readXlsx(f, maxR, 12);
