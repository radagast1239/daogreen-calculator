'use strict';
/** Сверка replaceNote / potHarvestMonths: pallet-cultivars.js ↔ АУДИТ/ПОДДОНЫ.xlsx (+ ЦВЕТЫ) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { readSheetRows, parseSectionRows } = require('./sync-vf-audit-lib');

const ROOT = path.join(__dirname, '..');

function normName(n) {
  return String(n || '')
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/\s+/g, ' ')
    .replace(/пак-чой/g, 'пак чой')
    .trim();
}

function loadPalletSandbox() {
  const sandbox = { window: {}, global: {} };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'pallet-cultivars.js'), 'utf8'), ctx);
  return sandbox;
}

function auditMap(rows, kind) {
  const m = new Map();
  for (const r of rows) {
    const key = normName(r.name) + '@' + r.section;
    m.set(key, r);
  }
  return m;
}

function main() {
  const sandbox = loadPalletSandbox();
  const cultivars = sandbox.PALLET_SHEET.PALLET_CULTIVARS;
  const replaceMonthsFromNote = sandbox.PALLET_SHEET.replaceMonthsFromNote;
  const poddony = auditMap(parseSectionRows(readSheetRows(path.join(ROOT, 'АУДИТ/ПОДДОНЫ.xlsx')), 'pallet'));
  const flowers = auditMap(parseSectionRows(readSheetRows(path.join(ROOT, 'АУДИТ/ЦВЕТЫ.xlsx')), 'flowers'));

  let fail = 0;
  let ok = 0;
  const misses = [];

  for (const cv of cultivars) {
    const key = normName(cv.name) + '@' + cv.section;
    const audit = cv.section === 'flowers' ? flowers.get(key) : poddony.get(key);
    const expectedMonths = replaceMonthsFromNote(audit ? audit.replace : cv.replaceNote, cv.cutNote);
    const got = cv.potHarvestMonths || 0;
    if (!audit) {
      misses.push('нет строки в xlsx: ' + cv.name + ' (' + cv.section + ')');
      continue;
    }
    if (expectedMonths !== got) {
      console.error(
        'FAIL',
        cv.name,
        '| xlsx:',
        audit.replace,
        '→',
        expectedMonths,
        'мес | JS:',
        cv.replaceNote,
        '→',
        got
      );
      fail++;
    } else {
      ok++;
    }
  }

  const chard = cultivars.find((c) => c.id === 'pl-chard-baby');
  if (!chard || chard.potHarvestMonths !== 12) {
    console.error('FAIL мангольд: potHarvestMonths =', chard && chard.potHarvestMonths);
    fail++;
  } else {
    console.log('OK   мангольд pl-chard-baby: 12 мес. (До года)');
    ok++;
  }

  console.log('Сверка сроков жизни: OK', ok, 'FAIL', fail);
  if (misses.length) {
    console.log('Предупреждения (нет пары в xlsx):');
    misses.forEach((m) => console.log('  -', m));
  }
  process.exit(fail > 0 ? 1 : 0);
}

main();
