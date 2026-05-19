'use strict';
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const dupRe = /  function getActivePlantingCvId\(\)\{\r?\n    if \(isPalletView\(\) && allPalletCultivars\(\)\.length\)/;
const dupM = html.match(dupRe);
if (!dupM) {
  console.error('inline pallet dup not found');
  process.exit(1);
}
const startDup = dupM.index;
const bioMarker =
  '  /* Biological range factors: mass full, canopy scales as √M so half, day shifts ~errorPct/8 */';
const bioIdx = html.indexOf(bioMarker, startDup);
if (bioIdx < 0) {
  console.error('bio marker not found after dup');
  process.exit(1);
}
html = html.slice(0, startDup) + '  let lightSync = false;\r\n\r\n' + html.slice(bioIdx);

const corruptNeedle = 'stroke-linejoin="rou  /* Biological';
const corruptStart = html.indexOf(corruptNeedle);
if (corruptStart < 0) {
  console.error('corrupt ICON not found');
  process.exit(1);
}
const iconStart = html.lastIndexOf('  const ICON = {', corruptStart);
const dliStart = html.indexOf('  var _dliLight;', corruptStart);
if (iconStart < 0 || dliStart < 0) {
  console.error('ICON/_dliLight bounds not found');
  process.exit(1);
}

const iconBlock =
  '  const ICON = {\r\n' +
  "    info:  '<svg class=\"rec-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 8h.01\"/><path d=\"M11 12h1v4h1\"/></svg>',\r\n" +
  "    check: '<svg class=\"rec-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9 12l2 2 4-4\"/></svg>',\r\n" +
  "    warn:  '<svg class=\"rec-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.36 3.59L2.26 17.13a1.91 1.91 0 0 0 1.64 2.87h16.2a1.91 1.91 0 0 0 1.64-2.87L13.64 3.59a1.91 1.91 0 0 0-3.28 0z\"/><path d=\"M12 9v4\"/><path d=\"M12 16h.01\"/></svg>',\r\n" +
  "    bad:   '<svg class=\"rec-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v6\"/><path d=\"M12 16h.01\"/></svg>',\r\n" +
  "    bulb:  '<svg class=\"rec-icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 16a5 5 0 1 1 6 0 3.5 3.5 0 0 0-1 3 2 2 0 0 1-4 0 3.5 3.5 0 0 0-1-3\"/><path d=\"M9.7 17h4.6\"/></svg>'\r\n" +
  '  };\r\n\r\n';

html = html.slice(0, iconStart) + iconBlock + html.slice(dliStart);

const renderCount = (html.match(/var _render;/g) || []).length;
if (renderCount > 1) {
  const firstRender = html.indexOf('  var _render;');
  const secondRender = html.indexOf('  var _render;', firstRender + 12);
  const ghBeforeSecond = html.lastIndexOf('  var _ghYield;', secondRender);
  const firstIcon = html.indexOf('  const ICON = {', firstRender);
  if (secondRender > 0 && ghBeforeSecond > firstRender && ghBeforeSecond < secondRender) {
    html = html.slice(0, ghBeforeSecond) + html.slice(firstIcon);
    console.log('removed duplicate _ghYield/_render block');
  }
}

fs.writeFileSync(htmlPath, html, 'utf8');

const checks = {
  inlineCvId: /function getActivePlantingCvId\(\)\{\r?\n    if \(isPalletView/.test(html),
  corrupt: html.includes(corruptNeedle),
  renderVars: (html.match(/var _render;/g) || []).length,
  inlinePalletGeom: /function palletCellGeometry\(cells, mount\)\{/.test(html),
  inlineDli: /function dliFromPpfd\(ppfd, ph\)\{ return ppfd \* ph/.test(html)
};
console.log('written', htmlPath);
console.log(checks);
