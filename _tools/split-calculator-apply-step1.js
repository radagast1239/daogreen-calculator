'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'calculator-110x55_12.html');
const raw = fs.readFileSync(htmlPath, 'utf8');
const nl = raw.includes('\r\n') ? '\r\n' : '\n';
const lines = raw.split(/\r?\n/);

const build = (raw.match(/const CALC_BUILD = '([^']+)'/) || [])[1] || 'dev';
const scripts = [
  'js/calc-theme.js',
  'js/pallet-load-warn.js',
  'js/gh-cultivars.js',
  'js/gh-cv-colors.js'
];
const tagBlock = scripts.map((s) => '<script src="' + s + '?v=' + build + '"></script>');

function findLine(re) {
  const i = lines.findIndex((l) => re.test(l));
  if (i < 0) throw new Error('line not found: ' + re);
  return i;
}

// 0-based indices: pallet 2851-2859, theme 2860-2894, main starts 2896
const iPalletStart = findLine(/^<script>$/) ;
// first <script> after pwa-register - find by content
const iPwa = findLine(/pwa-register\.js/);
let iPallet = -1;
for (let i = iPwa + 1; i < lines.length; i++) {
  if (lines[i].includes("getElementById('pallet-load-warn')")) {
    iPallet = i - 1;
    break;
  }
}
if (iPallet < 0) throw new Error('pallet block start');
let iPalletEnd = iPallet;
while (iPalletEnd < lines.length && lines[iPalletEnd] !== '</script>') iPalletEnd++;
if (lines[iPalletEnd] !== '</script>') throw new Error('pallet end');
if (lines[iPalletEnd - 1] !== '})();') throw new Error('pallet IIFE close missing before </script>');

let iThemeStart = iPalletEnd + 1;
if (lines[iThemeStart] !== '<script>') throw new Error('theme start expected');
let iThemeEnd = iThemeStart;
while (iThemeEnd < lines.length && lines[iThemeEnd] !== '</script>') iThemeEnd++;

let iMainStart = iThemeEnd + 1;
while (iMainStart < lines.length && lines[iMainStart].trim() === '') iMainStart++;
if (!lines[iMainStart].startsWith('<script>')) throw new Error('main script start');

const out = [];
out.push(...lines.slice(0, iPallet));
out.push(...tagBlock);
out.push(...lines.slice(iThemeEnd + 1));

let text = out.join(nl);

text = text.replace(
  /  const CULTIVARS = \[[\s\S]*?  \];(\r?\n)+  const todayISO/,
  '  const CULTIVARS = global.DG_GH_CULTIVARS || [];' + nl + nl + '  const todayISO'
);

text = text.replace(
  /  const CV_COLORS = \{[\s\S]*?  \};(\r?\n)+  const \$ = id/,
  '  const CV_COLORS = global.DG_GH_CV_COLORS || {};' + nl + nl + '  const $ = id'
);

fs.writeFileSync(htmlPath, text, 'utf8');
console.log(
  'OK removed lines',
  iPallet + 1,
  '-',
  iThemeEnd + 1,
  '; inserted',
  tagBlock.length,
  'scripts'
);
