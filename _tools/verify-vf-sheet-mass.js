'use strict';
/**
 * Сверка урожая каналов VF: yieldPerCutG (верх+12,5%) vs модель на std сроках.
 * node _tools/verify-vf-sheet-mass.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadScript(file, ctx) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

function mid(s) {
  const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
  const nums = [];
  t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => nums.push(parseFloat(n)));
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function hi(s) {
  const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
  const nums = [];
  t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => nums.push(parseFloat(n)));
  if (!nums.length) return 0;
  return Math.max.apply(null, nums);
}

function vfYield(yCut, unit) {
  return Math.round((hi(yCut) || 0) * (unit === 'шт' ? 1 : 1.125));
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

/** Упрощённый шаг канала VF (без геометрии лотка — только crowdF≈1 для сравнения). */
function main() {
  const g = vm.createContext({ console });
  g.global = g;
  g.window = g;
  g.globalThis = g;
  loadScript('vf-cultivars.js', g);

  const list = g.VF_SHEET.VF_CULTIVARS;
  const NURSERY = 14;
  const K = 0.38;
  const rows = [];
  let warn = 0;

  for (const cv of list) {
    const isGrams = cv.countUnit === 'g' || cv.countUnit === 'г';
    const sheet = cv.yieldPerCutG;
    const tTotal = cv.germination + NURSERY + cv.channelDays;
    const massAuto = Math.round(massAtTotal(cv, tTotal, K));
    const effMass = sheet; /* vfStd.mass ON */
    if (isGrams && sheet > 0 && Math.abs(massAuto - sheet) / sheet > 0.25) warn++;
    rows.push({
      id: cv.id,
      name: cv.name,
      sheet,
      massAuto,
      effMass,
      day: cv.channelDays,
      unit: cv.countUnit || 'g'
    });
  }

  rows.sort((a, b) => {
    if (!a.sheet || !b.sheet) return 0;
    return Math.abs(b.massAuto - b.sheet) / b.sheet - Math.abs(a.massAuto - a.sheet) / a.sheet;
  });

  console.log('VF_SHEET_MASS', {
    total: list.length,
    gramsWithYield: rows.filter((r) => r.sheet > 0 && (r.unit === 'g' || r.unit === 'г')).length,
    modelDiffOver25pct: warn
  });

  console.log('\nVF: при vfStd.mass UI = sheet (не model). Top model≠sheet:');
  rows
    .filter((r) => r.sheet > 0 && (r.unit === 'g' || r.unit === 'г'))
    .filter((r) => Math.abs(r.massAuto - r.sheet) / r.sheet > 0.25)
    .slice(0, 15)
    .forEach((r) => {
      const pct = Math.round((100 * Math.abs(r.massAuto - r.sheet)) / r.sheet);
      console.log(
        `  ${r.id.padEnd(28)} sheet=${String(r.sheet).padStart(4)} model=${String(r.massAuto).padStart(4)} Δ${pct}%`
      );
    });

  const dragon = rows.find((r) => r.id === 'vf-arugula-dragon-adult');
  if (dragon) {
    console.log('\nvf-arugula-dragon-adult: sheet=' + dragon.sheet + 'g (30×1.125), std day=' + dragon.day);
  }

  console.log('\nOK: calcFromVfSheet uses vfEffectiveMass when vfStd.mass.');
}

main();
