/** Быстрая сверка эталонов аудита (без браузера) */
const PALLET_L_M = 1.3, PALLET_W_M = 0.65, CASSETTES = 3, MONTH = 30.5;

function hi(s) {
  if (!s) return 0;
  const nums = [];
  String(s).replace(/(\d+(?:\.\d+)?)/g, (_, n) => nums.push(parseFloat(n)));
  return nums.length ? Math.max(...nums) : 0;
}

const mint = { id: 'pl-mint-baby', multicut: true, yieldPerCutG: 20, cutInterval: 25,
  germination: 7, channelDays: 35, density: 120, cells: 54 };
const batavia = { id: 'pl-batavia', multicut: false, yieldPerCutG: 150,
  germination: 3, channelDays: 40, density: 45, cells: 14 };
const kale = { id: 'pl-kale-baby', multicut: true, yieldPerCutG: 25, cutInterval: 15,
  germination: 5, channelDays: 30, density: 150, cells: 54 };

function layout(along, across, tiers, cells) {
  const perPallet = CASSETTES * cells;
  const footprint = along * across * PALLET_L_M * PALLET_W_M;
  const sysArea = footprint * tiers;
  const total = along * across * perPallet * tiers;
  const rhoA = total / sysArea;
  return { footprint, sysArea, rhoA, perPallet, total };
}

function econBio(yieldPerCut, cutIntervalDays, density, unitIsPieces) {
  const cutsPerMonth = MONTH / cutIntervalDays;
  const yieldPerPotMonth = yieldPerCut * cutsPerMonth;
  const kg = (yieldPerPotMonth / 1000) * density;
  const pcs = yieldPerPotMonth * density;
  return { cutsPerMonth, yieldPerPotMonth, kgPerSqmMonth: kg, pcsPerSqmMonth: pcs };
}

function mintImport() {
  const lay = layout(1, 1, 5, mint.cells);
  const yp = { yieldPerCut: mint.yieldPerCutG, cutIntervalDays: mint.cutInterval };
  const bio = econBio(yp.yieldPerCut, yp.cutIntervalDays, lay.rhoA, false);
  return { lay, yp, bio };
}

function bataviaImport() {
  const lay = layout(1, 1, 5, batavia.cells);
  const cycleDays = batavia.germination + 14 + batavia.channelDays;
  const yp = { yieldPerCut: batavia.yieldPerCutG, cutIntervalDays: cycleDays };
  const potMonths = cycleDays / MONTH;
  const bio = econBio(yp.yieldPerCut, yp.cutIntervalDays, lay.rhoA, false);
  return { lay, yp, bio, cycleDays, potMonths };
}

const m = mintImport();
const b = bataviaImport();

console.log('=== Эталон аудита (после p13-econ) ===\n');
console.log('Поддоны 1×1×5, кассета 54 (мята):');
console.log('  отпечаток', m.lay.footprint.toFixed(3), 'м², посевная', m.lay.sysArea.toFixed(3), 'м²');
console.log('  растений', m.lay.total, ', ρ', Math.round(m.lay.rhoA), 'шт/м²');
console.log('  импорт: срезка', m.yp.yieldPerCut, 'г, интервал', m.yp.cutIntervalDays, 'сут');
console.log('  → срезок/мес', m.bio.cutsPerMonth.toFixed(2), ', кг/м²·мес', m.bio.kgPerSqmMonth.toFixed(2));
console.log('');
console.log('Ботавия однократка:');
console.log('  цикл', b.cycleDays, 'сут, potHarvestMonths', b.potMonths.toFixed(2));
console.log('  интервал', b.yp.cutIntervalDays, 'сут, срезок/мес', b.bio.cutsPerMonth.toFixed(2));
console.log('  кг/м²·мес', b.bio.kgPerSqmMonth.toFixed(2));
console.log('');
console.log('Свет (сценарий F):', (0.08 * 16 * MONTH).toFixed(1), 'кВт·ч/м²·мес');
