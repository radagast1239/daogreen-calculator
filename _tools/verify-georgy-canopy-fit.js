'use strict';
/**
 * Проверка: ромэн — подбор по hi, остальные головные — по mid; «оценка» не меняет правило.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadScript(file, ctx) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

function main() {
  const g = { DG_GH_CULTIVARS: [] };
  g.global = g;
  g.window = g;
  g.globalThis = g;

  loadScript('js/gh-cultivars.js', g);
  loadScript('js/gh-cultivars-extended.js', g);
  loadScript('js/gh-cultivar-catalog.js', g);
  loadScript('js/growth-light-model.js', g);
  loadScript('js/planting-constants.js', g);

  const HEAD_CANOPY_RANGE_HI_MULT_BY_TYPE = {
    butterhead: 1.30, oakleaf: 1.30, lollo: 1.32, batavia: 1.26, romaine: 1.25,
    salanova: 1.26, iceberg: 1.28, mini: 1.25, leaf: 1.24, other: 1.25
  };
  const HEAD_GERM = 3;
  const HEAD_NURSERY = 14;
  const HEAD_DAY = 15;
  const tTotal = HEAD_GERM + HEAD_NURSERY + HEAD_DAY;
  const GLM = g.DG_growthLightModel;
  const CH_W = 110;
  const OFFSET = 50;
  const ratio = Math.sqrt(0.75);

  function ghType(cv) {
    return g.DG_ghCultivarType(cv);
  }

  function headCanopyBaseMm(cv, mass) {
    return Math.round(GLM.canopyFromMass(cv, mass, 22));
  }

  function headCanopyFitRange(cv) {
    const massRaw = GLM.logisticMass(cv, tTotal, cv.k);
    const base = headCanopyBaseMm(cv, massRaw);
    const t = ghType(cv);
    const hiMult = HEAD_CANOPY_RANGE_HI_MULT_BY_TYPE[t] != null
      ? HEAD_CANOPY_RANGE_HI_MULT_BY_TYPE[t] : HEAD_CANOPY_RANGE_HI_MULT_BY_TYPE.other;
    const lo = base;
    const hi = Math.round(base * hiMult);
    const mid = Math.round((lo + hi) / 2);
    return { base, lo, hi, mid, massRaw };
  }

  function usesHi(cv) {
    return ghType(cv) === 'romaine';
  }

  function fitTargetMm(cv) {
    const r = headCanopyFitRange(cv);
    if (usesHi(cv)) return Math.max(r.hi, r.base);
    return r.mid;
  }

  function nearest(rho, extraB) {
    let a = 1000 / Math.sqrt(rho * ratio);
    let b = a * ratio;
    if (b < CH_W) {
      b = CH_W;
      a = 1e6 / (rho * b);
    }
    b += extraB;
    const off = a * 0.5;
    const diag = Math.sqrt(off * off + b * b);
    return Math.min(a, diag);
  }

  function gapAtRho(rho, canopyMm) {
    const lay0 = nearest(rho, 0);
    const deficit = canopyMm - lay0;
    const extra = deficit > 0.5 ? Math.max(0, Math.round(deficit * 0.9)) : 0;
    return nearest(rho, extra) - canopyMm;
  }

  function maxDensity(canopyMm, hiBound) {
    let lo = 15;
    let best = lo;
    let l = lo;
    let h = hiBound;
    while (l <= h) {
      const mid = Math.round((l + h) / 2);
      if (gapAtRho(mid, canopyMm) >= 0) {
        best = mid;
        l = mid + 1;
      } else {
        h = mid - 1;
      }
    }
    while (best > lo && gapAtRho(best, canopyMm) < 0) best--;
    while (best < hiBound && gapAtRho(best + 1, canopyMm) >= 0) best++;
    return best;
  }

  const DENSITY_MAX = {
    butterhead: 55, romaine: 75, batavia: 70, oakleaf: 58, lollo: 52,
    salanova: 78, iceberg: 62, mini: 95, leaf: 85, other: 68
  };

  function densityCap(cv) {
    const t = ghType(cv);
    if (t === 'mini_romaine' || t === 'baby_romaine') return DENSITY_MAX.mini;
    return DENSITY_MAX[t] != null ? DENSITY_MAX[t] : DENSITY_MAX.other;
  }

  const list = g.DG_GH_CULTIVARS.filter(function (cv) {
    if (cv.babyGreen) return false;
    if (cv.id === 'rucola' || cv.id === 'basil') return false;
    return true;
  });

  let fail = 0;
  const rows = [];

  list.forEach(function (cv) {
    const r = headCanopyFitRange(cv);
    const target = fitTargetMm(cv);
    const hiFit = usesHi(cv);
    const est = cv.calibrated === false;
    const wrongTarget = hiFit ? target !== r.hi : target !== r.mid;
    const rho = maxDensity(target, densityCap(cv));
    rows.push({
      id: cv.id,
      name: cv.name,
      type: ghType(cv),
      est: est ? 'оценка' : 'база',
      rule: hiFit ? 'hi' : 'mid',
      baseCm: (r.base / 10).toFixed(1),
      midCm: (r.mid / 10).toFixed(1),
      hiCm: (r.hi / 10).toFixed(1),
      fitCm: (target / 10).toFixed(1),
      rho: rho,
      ok: !wrongTarget
    });
    if (wrongTarget) fail++;
  });

  console.log('Georgy canopy fit check (t=' + tTotal + ' d, T=22°C)\n');
  console.log(
    'id'.padEnd(16) +
    'type'.padEnd(10) +
    'метка'.padEnd(8) +
    'правило'.padEnd(6) +
    'база'.padEnd(6) +
    'mid'.padEnd(6) +
    'hi'.padEnd(6) +
    'подбор'.padEnd(8) +
    'ρ шт/м²'
  );
  rows.forEach(function (row) {
    const mark = row.ok ? 'OK' : 'FAIL';
    console.log(
      mark + ' ' +
      String(row.id).padEnd(14) +
      String(row.type).padEnd(10) +
      String(row.est).padEnd(8) +
      String(row.rule).padEnd(6) +
      String(row.baseCm).padEnd(6) +
      String(row.midCm).padEnd(6) +
      String(row.hiCm).padEnd(6) +
      String(row.fitCm).padEnd(8) +
      String(row.rho)
    );
  });

  const romaine = rows.filter(function (r) { return r.rule === 'hi'; });
  const others = rows.filter(function (r) { return r.rule === 'mid'; });
  console.log('\nРомэн (hi): ' + romaine.length + ', остальные головные (mid): ' + others.length);
  console.log('С «оценка»: ' + rows.filter(function (r) { return r.est === 'оценка'; }).length);

  if (fail > 0) {
    console.error('\nFAIL: ' + fail + ' сортов с неверным диаметром подбора');
    process.exit(1);
  }
  if (romaine.length < 1) {
    console.error('\nFAIL: нет сортов type=romaine в выборке');
    process.exit(1);
  }
  console.log('\nAll checks passed.');
}

main();
