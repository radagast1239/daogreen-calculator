'use strict';
/**
 * Сверка эталонов ВF/поддонов: фиксирует yieldPerCutG и channelDays, падает при drift >5%.
 * node _tools/verify-audit-drift.js
 * node _tools/verify-audit-drift.js --update   # обновить baseline после sync:audit
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(__dirname, 'audit-yield-baseline.json');
const THRESHOLD = 0.05;
const update = process.argv.indexOf('--update') >= 0;

function loadCatalog(file) {
  const g = vm.createContext({ console: console });
  g.global = g;
  g.window = g;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), g);
  return g;
}

function extractVf(g) {
  const list = g.VF_SHEET.VF_CULTIVARS;
  const out = {};
  list.forEach(function (cv) {
    out[cv.id] = {
      yieldPerCutG: cv.yieldPerCutG || 0,
      channelDays: cv.channelDays || 0,
      density: cv.density || 0
    };
  });
  return out;
}

function extractPal(g) {
  const list = g.PALLET_SHEET.PALLET_CULTIVARS;
  const out = {};
  list.forEach(function (cv) {
    out[cv.id] = {
      yieldPerCutG: cv.yieldPerCutG || 0,
      channelDays: cv.channelDays || 0,
      density: cv.density || 0
    };
  });
  return out;
}

function pctChange(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1;
  return Math.abs(b - a) / Math.abs(a);
}

function main() {
  const gVf = loadCatalog('vf-cultivars.js');
  const gPal = loadCatalog('pallet-cultivars.js');
  const current = {
    updatedAt: new Date().toISOString(),
    vf: extractVf(gVf),
    pallet: extractPal(gPal)
  };

  if (update || !fs.existsSync(BASELINE)) {
    fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2), 'utf8');
    console.log('OK baseline written:', BASELINE);
    console.log('  vf cultivars:', Object.keys(current.vf).length);
    console.log('  pallet cultivars:', Object.keys(current.pallet).length);
    return;
  }

  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const drifts = [];

  function compare(section, label) {
    const was = base[section] || {};
    const now = current[section] || {};
    Object.keys(now).forEach(function (id) {
      if (!was[id]) {
        drifts.push({ section: label, id: id, field: 'new', was: '—', now: now[id].yieldPerCutG });
        return;
      }
      ['yieldPerCutG', 'channelDays', 'density'].forEach(function (field) {
        var a = was[id][field];
        var b = now[id][field];
        if (pctChange(a, b) > THRESHOLD) {
          drifts.push({
            section: label, id: id, field: field, was: a, now: b,
            pct: Math.round(pctChange(a, b) * 100)
          });
        }
      });
    });
    Object.keys(was).forEach(function (id) {
      if (!now[id]) drifts.push({ section: label, id: id, field: 'removed', was: was[id].yieldPerCutG, now: '—' });
    });
  }

  compare('vf', 'VF');
  compare('pallet', 'PALLET');

  if (drifts.length) {
    console.log('AUDIT DRIFT >' + Math.round(THRESHOLD * 100) + '% (' + drifts.length + '):');
    drifts.slice(0, 40).forEach(function (d) {
      console.log('  [' + d.section + '] ' + d.id + ' ' + d.field + ': ' + d.was + ' → ' + d.now +
        (d.pct != null ? ' (' + d.pct + '%)' : ''));
    });
    if (drifts.length > 40) console.log('  ... +' + (drifts.length - 40) + ' more');
    console.log('\nRun: node _tools/verify-audit-drift.js --update  (after intentional sync:audit)');
    process.exit(1);
  }
  console.log('OK audit drift: no changes >' + Math.round(THRESHOLD * 100) + '% vs baseline');
}

main();
