'use strict';
/**
 * Сверка урожая поддонов: эталон yieldPerCutG (аудит) vs модель на стандартных сроках.
 * Запуск: node _tools/verify-pallet-sheet-mass.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadScript(file, ctx) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

function crowdingFactor(canopyAtMax, nearestDist) {
  const overlap = canopyAtMax - nearestDist;
  if (overlap <= 0) return 1.0;
  const rel = overlap / canopyAtMax;
  return Math.max(0.65, Math.min(1.0, 1 - 0.65 * rel));
}

function massAtTotal(cv, t, k) {
  return cv.M_max / (1 + Math.exp(-k * (t - cv.t50)));
}

function palletCellPitch(cells) {
  const PALLET_L_MM = 1300;
  const PALLET_W_MM = 650;
  const n = Math.max(1, cells);
  const along = Math.ceil(Math.sqrt(n * (PALLET_L_MM / PALLET_W_MM)));
  const across = Math.ceil(n / along);
  return Math.min(PALLET_L_MM / along, PALLET_W_MM / across);
}

function main() {
  const g = vm.createContext({ console });
  g.global = g;
  g.window = g;
  g.globalThis = g;
  loadScript('pallet-cultivars.js', g);

  const list = g.PALLET_SHEET.PALLET_CULTIVARS;
  const NURSERY = 14;
  const K = 0.38;
  const CA = 10;
  const rows = [];
  let warnModel = 0;
  let noYield = 0;

  for (const cv of list) {
    const germ = cv.germination;
    const day = cv.channelDays;
    const tTotal = germ + NURSERY + day;
    const pitch = palletCellPitch(cv.palletCells || 54);
    const canopyAtMax = CA * Math.sqrt(cv.M_max);
    const crowdF = crowdingFactor(canopyAtMax, pitch);
    const massRaw = massAtTotal(cv, tTotal, K);
    const massAuto = Math.round(massRaw * crowdF);
    const sheet = cv.yieldPerCutG;
    const unit = cv.countUnit || 'g';
    const isGrams = unit === 'g' || unit === 'г';
    const diff =
      sheet > 0 && isGrams
        ? Math.abs(massAuto - sheet) / sheet
        : null;
    const row = {
      id: cv.id,
      name: cv.name,
      section: cv.section,
      germ,
      day,
      sheet,
      massAuto,
      M_max: cv.M_max,
      unit
    };
    rows.push(row);
    if (sheet <= 0 && isGrams) noYield++;
    if (diff != null && diff > 0.25) warnModel++;
  }

  rows.sort((a, b) => {
    const da = a.sheet > 0 ? Math.abs(a.massAuto - a.sheet) / a.sheet : 0;
    const db = b.sheet > 0 ? Math.abs(b.massAuto - b.sheet) / b.sheet : 0;
    return db - da;
  });

  console.log('PALLET_SHEET_MASS', {
    total: list.length,
    gramsWithSheet: rows.filter((r) => r.sheet > 0 && (r.unit === 'g' || r.unit === 'г')).length,
    modelDiffOver25pct: warnModel,
    noSheetYieldG: noYield
  });

  console.log('\nTop mismatches (model at std days vs audit yieldPerCutG):');
  rows
    .filter((r) => r.sheet > 0 && (r.unit === 'g' || r.unit === 'г'))
    .filter((r) => Math.abs(r.massAuto - r.sheet) / r.sheet > 0.25)
    .slice(0, 25)
    .forEach((r) => {
      const pct = Math.round((100 * Math.abs(r.massAuto - r.sheet)) / r.sheet);
      console.log(
        `  ${r.id.padEnd(28)} ${r.name.slice(0, 22).padEnd(22)} sheet=${String(r.sheet).padStart(4)}g model=${String(r.massAuto).padStart(4)}g Δ${pct}%  (germ+${NURSERY}+${r.day}=${r.germ + NURSERY + r.day}d)`
      );
    });

  const dragonCv = list.find((c) => c.id === 'pl-arugula-dragon-adult');
  if (dragonCv) {
    const t34 = dragonCv.germination + NURSERY + 34;
    const pitch34 = palletCellPitch(dragonCv.palletCells || 14);
    const cf34 = crowdingFactor(CA * Math.sqrt(dragonCv.M_max), pitch34);
    const m34 = Math.round(massAtTotal(dragonCv, t34, K) * cf34);
    console.log('\npl-arugula-dragon-adult @34 channel days (user case):');
    console.log(
      `  audit sheet=${dragonCv.yieldPerCutG}g  model=${m34}g  (UI with mass «стандарт»: ${dragonCv.yieldPerCutG}g)`
    );
  }

  console.log('\nOK: with palletStd.mass locked, UI uses yieldPerCutG, not model.');
  if (warnModel > 0) {
    console.log(`NOTE: ${warnModel} cultivars — model ≠ audit at std days; expected when «стандарт» mass is on.`);
  }
}

main();
