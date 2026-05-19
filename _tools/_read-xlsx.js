const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = __dirname;
const xlsx = fs.readdirSync(dir).find(f => f.endsWith('.xlsx'));
if (!xlsx) { console.error('no xlsx'); process.exit(1); }
const full = path.join(dir, xlsx);
console.log('Reading:', xlsx);

const tmp = path.join(dir, '_xlsx_tmp');
const zipPath = path.join(dir, '_econ.zip');
fs.copyFileSync(full, zipPath);
if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true });
fs.mkdirSync(tmp);
execSync(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${tmp.replace(/'/g, "''")}' -Force"`);

function readSharedStrings(){
  const p = path.join(tmp, 'xl', 'sharedStrings.xml');
  if (!fs.existsSync(p)) return [];
  const xml = fs.readFileSync(p, 'utf8');
  const out = [];
  const re = /<t[^>]*>([^<]*)<\/t>/g;
  let m;
  while ((m = re.exec(xml))) out.push(m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<'));
  return out;
}

function colToIndex(col){ let n=0; for(let i=0;i<col.length;i++) n=n*26+(col.charCodeAt(i)-64); return n-1; }
function parseSheet(sheetPath, strings){
  const xml = fs.readFileSync(sheetPath, 'utf8');
  const rows = {};
  const re = /<c r="([A-Z]+)(\d+)"([^>]*)>(?:<v>([^<]*)<\/v>)?(?:<is><t>([^<]*)<\/t><\/is>)?/g;
  let m;
  while ((m = re.exec(xml))){
    const col = colToIndex(m[1]);
    const row = parseInt(m[2],10);
    const attrs = m[3];
    let val = m[4] || m[5] || '';
    if (attrs.includes('t="s"')) val = strings[parseInt(val,10)] || val;
    if (!rows[row]) rows[row] = {};
    rows[row][col] = val;
  }
  return rows;
}

const strings = readSharedStrings();
const sheetsDir = path.join(tmp, 'xl', 'worksheets');
const sheets = fs.readdirSync(sheetsDir).filter(f => f.endsWith('.xml')).sort();
console.log('Sheets:', sheets.join(', '));
console.log('Shared strings count:', strings.length);

function dumpSheet(name, maxR, maxC){
  const sheetPath = path.join(sheetsDir, name);
  const rows = parseSheet(sheetPath, strings);
  const maxRow = Math.min(maxR, Math.max(...Object.keys(rows).map(Number), 0));
  console.log('\n=== ' + name + ' ===');
  for (let r = 1; r <= maxRow; r++){
    const line = [];
    for (let c = 0; c < maxC; c++){
      line.push((rows[r] && rows[r][c]) ? String(rows[r][c]).replace(/\t/g,' ').slice(0,80) : '');
    }
    if (line.some(x => x)) console.log('R'+r+'\t'+line.join('\t'));
  }
}

dumpSheet('sheet2.xml', 100, 12);
dumpSheet('sheet3.xml', 80, 8);
