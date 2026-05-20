'use strict';
/**
 * Сводка по вкладкам: поддоны / VF / теплица — откуда берётся масса урожая.
 * node _tools/verify-planting-tabs.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function load(file, ctx) {
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
}

function midUpper(s) {
  const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
  const nums = [];
  t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => nums.push(parseFloat(n)));
  if (!nums.length) return 0;
  const lo = Math.min.apply(null, nums);
  const hi = Math.max.apply(null, nums);
  const mid = (lo + hi) / 2;
  return (mid + hi) / 2;
}

function hi(s) {
  const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
  const nums = [];
  t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => nums.push(parseFloat(n)));
  return nums.length ? Math.max.apply(null, nums) : 0;
}

function main() {
  const g = vm.createContext({ console });
  g.global = g;
  g.window = g;
  g.globalThis = g;
  load('pallet-cultivars.js', g);
  load('vf-cultivars.js', g);
  load('js/gh-cultivars.js', g);
  load('js/gh-cultivars-extended.js', g);
  load('js/gh-cultivars-user.js', g);

  const pl = g.PALLET_SHEET.PALLET_CULTIVARS;
  const vf = g.VF_SHEET.VF_CULTIVARS;
  const gh = g.DG_GH_CULTIVARS;

  const pairs = [
    ['pl-arugula-dragon-adult', 'vf-arugula-dragon-adult'],
    ['pl-frillice-lollo', 'vf-frillice-lollo'],
    ['pl-romaine-adult', 'vf-romaine-adult'],
    ['pl-romano-baby', 'vf-romano-baby']
  ];

  console.log('CROSS_TAB_SAMPLE (audit vs channels rule):');
  for (const [pid, vid] of pairs) {
    const p = pl.find((c) => c.id === pid);
    const v = vf.find((c) => c.id === vid);
    if (!p || !v) continue;
    console.log(
      `  ${p.name}: поддоны ${p.yieldPerCutG}g (${p.yieldPerCutStd}) | каналы ${v.yieldPerCutG}g (${v.yieldPerCutStd})`
    );
  }

  console.log('\nTAB_RULES:');
  console.log('  Поддоны: mass = yieldPerCutG при palletStd.mass (midUpper аудита)');
  console.log('  Каналы VF: mass = yieldPerCutG при vfStd.mass (hi×1.125 для г)');
  console.log('  Теплица: mass = модель M_max/2×env или ghStandards.manualMass / ручной ввод');

  const ghSample = gh.filter((c) => c.multicut).slice(0, 3);
  console.log('\nGH_MULTICUT_SAMPLE (model base cut ~M_max/2):');
  ghSample.forEach((c) => {
    console.log(`  ${c.id}: M_max=${c.M_max} → ~${Math.round(c.M_max / 2)}g model 1st cut`);
  });

  console.log('\nCOUNTS:', { pallets: pl.length, vf: vf.length, greenhouse: gh.length });
  console.log('Run: node _tools/verify-pallet-sheet-mass.js');
  console.log('Run: node _tools/verify-vf-sheet-mass.js');
}

main();
