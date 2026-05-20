'use strict';
/**
 * Spot-check mass/canopy chain after catalog changes (no browser).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function loadScript(file, ctx) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

function findCv(list, id) {
  return list.find((c) => c.id === id);
}

function main() {
  const g = { DG_GH_CULTIVARS: [] };
  g.global = g;
  g.window = g;
  g.globalThis = g;
  loadScript('js/gh-cultivars.js', g);
  loadScript('js/gh-cultivars-extended.js', g);
  loadScript('js/gh-cultivars-user.js', g);
  loadScript('js/growth-light-model.js', g);

  const GLM = g.DG_growthLightModel;
  const list = g.DG_GH_CULTIVARS;
  const n = list.length;
  const est = list.filter((c) => c.calibrated === false).length;
  const cal = list.filter((c) => c.calibrated === true).length;

  console.log('CATALOG', { total: n, estimated: est, calibrated: cal, userOverrides: g.DG_GH_CULTIVAR_USER.overrides.length });

  const base = findCv(list, 'aficion');
  const oak = findCv(list, 'sl-cook');
  const rex = findCv(list, 'rex');
  if (!base || !oak || !rex) throw new Error('missing test cultivars');

  const t = 35;
  const temp = 22;
  const kEff = base.k;

  function snap(cv, label) {
    const m = GLM.logisticMass(cv, t, kEff);
    const dSqrt = GLM.canopyCoeff(cv, temp) * Math.sqrt(m);
    const dExp = GLM.canopyFromMass(cv, m, temp);
    const exp = GLM.canopyMassExponent(cv);
    return { label, id: cv.id, M_max: cv.M_max, ca: cv.ca, canopyExp: cv.canopyExp, expUsed: exp, mass: Math.round(m * 10) / 10, canopy: Math.round(dExp), ratio: Math.round((dExp / dSqrt) * 1000) / 1000 };
  }

  const rows = [snap(base, 'base Daogreen'), snap(rex, 'extended rex'), snap(oak, 'oakleaf cook')];
  console.log('MASS_CANOPY t=' + t + ' k=' + kEff + ' temp=' + temp);
  rows.forEach((r) => console.log(JSON.stringify(r)));

  const m50 = GLM.logisticMass(base, base.t50, kEff);
  if (Math.abs(m50 - base.M_max / 2) > base.M_max * 0.02) {
    throw new Error('t50 mass not ~M_max/2: ' + m50 + ' vs ' + base.M_max / 2);
  }
  console.log('OK t50 half-mass', Math.round(m50));

  const dupStar = list.filter((c) => c.id === 'starfighter');
  const dupGraz = list.filter((c) => c.id === 'grazion');
  if (dupStar.length !== 1 || dupGraz.length !== 1) {
    throw new Error('duplicate ids starfighter=' + dupStar.length + ' grazion=' + dupGraz.length);
  }
  console.log('OK duplicate guard starfighter M_max=' + dupStar[0].M_max);

  if (rows[2].canopy <= rows[1].canopy && oak.ca >= rex.ca * 0.9) {
    console.log('WARN oak canopy vs rex — check ca/exp (informational)');
  }
  if (rows[2].ratio > 1.05) console.log('OK oakleaf wider than sqrt at same mass (canopyExp)');

  console.log('\nAll spot checks passed.');
}

main();
