'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'calculator-110x55_12.html');
const raw = fs.readFileSync(htmlPath, 'utf8');
const nl = raw.includes('\r\n') ? '\r\n' : '\n';
const lines = raw.split(/\r?\n/);

const build = (raw.match(/const CALC_BUILD = '([^']+)'/) || [])[1] || 'dev';
const scriptTag = '<script src="js/calc-format.js?v=' + build + '"></script>';

let iStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* Outer error catcher')) {
    for (let j = i; j >= 0; j--) {
      if (lines[j] === '<script>') {
        iStart = j;
        break;
      }
    }
    break;
  }
}
if (iStart < 0) throw new Error('main script not found');

let iFmtStart = -1;
for (let i = iStart; i < lines.length; i++) {
  if (lines[i].trim().startsWith('function parseNumInput')) {
    iFmtStart = i;
    break;
  }
}
if (iFmtStart < 0) throw new Error('parseNumInput not found');

let iFmtEnd = -1;
for (let i = iFmtStart; i < lines.length; i++) {
  const t = lines[i].trim();
  if (t.startsWith('const MONTH_EN') && t.includes('[')) {
    iFmtEnd = i;
    break;
  }
}
if (iFmtEnd < 0) throw new Error('MONTH_EN not found');

let iKeepEnd = -1;
for (let i = iFmtEnd; i < lines.length; i++) {
  if (lines[i].trim().startsWith('function mergeLocaleDeps')) {
    iKeepEnd = i;
    break;
  }
}
if (iKeepEnd < 0) throw new Error('mergeLocaleDeps not found');

let iMergeEnd = -1;
for (let i = iKeepEnd; i < lines.length; i++) {
  if (lines[i].trim().startsWith('const VF_CULTIVARS')) {
    iMergeEnd = i;
    break;
  }
}
if (iMergeEnd < 0) throw new Error('VF_CULTIVARS not found');

const shim = [
  '  var CF = window.DG_calcFormat;',
  '  function parseNumInput(str){ return CF.parseNumInput(str); }',
  '  function decimalsFromStep(step){ return CF.decimalsFromStep(step); }',
  '  function fmtNumRu(n, opts){ return CF.fmtNumRu(n, opts); }',
  '  function fmtNum(n, opts){ return CF.fmtNum(n, opts); }',
  '  function pt(k){ return CF.pt(k); }',
  '  function pm(k){ return CF.pm(k); }',
  '  function ptf(k, vars){ return CF.ptf(k, vars); }',
  '  function ui(k, vars){ return CF.ui(k, vars); }',
  '  function cvSubLine(c){ return CF.cvSubLine(c); }',
  '  function catalogPhrase(text){ return CF.catalogPhrase(text); }',
  '  function tr(k){ return CF.tr(k); }',
  '  function pr(k, vars){ return CF.pr(k, vars); }',
  '  function mergeLocaleDeps(deps){ return CF.mergeLocaleDeps(deps); }',
  '  function formatInputValue(n, decimals){ return CF.formatInputValue(n, decimals); }',
  ''
];

// Insert calc-format script before main if missing
let text = lines.join(nl);
if (!text.includes('js/calc-format.js')) {
  const needle = '<script src="js/gh-cv-colors.js?v=';
  const idx = text.indexOf(needle);
  if (idx < 0) throw new Error('gh-cv-colors script not found');
  const lineEnd = text.indexOf(nl, text.indexOf('</script>', idx));
  text = text.slice(0, lineEnd + nl.length) + scriptTag + nl + text.slice(lineEnd + nl.length);
  lines.length = 0;
  lines.push(...text.split(/\r?\n/));
}

const out = [];
out.push(...lines.slice(0, iFmtStart));
out.push(...shim);
out.push(...lines.slice(iFmtEnd, iKeepEnd));
out.push(...lines.slice(iMergeEnd));

fs.writeFileSync(htmlPath, out.join(nl), 'utf8');
console.log('removed lines', iFmtStart + 1, '-', iMergeEnd, '; added shim', shim.length);
