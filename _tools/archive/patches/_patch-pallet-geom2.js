const fs = require('fs');
const p = 'calculator-110x55_12.html';
let h = fs.readFileSync(p, 'utf8');
if (h.includes('palletMount')) { console.log('JS already patched'); process.exit(0); }

function rep(a, b, l) {
  if (!h.includes(a)) { console.error('MISSING', l); process.exit(1); }
  h = h.replace(a, b);
}

rep('  const CASSETTES_PER_PALLET = 3;', `  const CASSETTES_PER_PALLET = 3;
  const PALLET_L_M = PALLET_L_MM / 1000;
  const PALLET_W_M = PALLET_W_MM / 1000;`, 'c');

rep(`    palletCells: 54,
    palletCv: 'pl-shiso',`, `    palletCells: 54,
    palletsAlong: 3,
    palletMount: 'cassette',
    palletTiers: 5,
    tierGapMm: 350,
    palletCv: 'pl-shiso',`, 'st');

const HELP = `
  function palletMountMode(){ return state.palletMount === 'lid' ? 'lid' : 'cassette'; }
  function plantsPerPalletCount(){
    const cells = state.palletCells || 54;
    return palletMountMode() === 'lid' ? cells : CASSETTES_PER_PALLET * cells;
  }
  function syncPalletZoneLength(){
    const n = Math.max(1, state.palletsAlong || Math.round(state.length / PALLET_L_M) || 1);
    state.palletsAlong = n;
    state.length = Math.round(n * PALLET_L_M * 10) / 10;
    const v = $('palletsAlong-v'), z = $('pallet-zone-len'), pa = $('palletsAlong');
    if (v) v.textContent = String(n);
    if (z) z.textContent = state.length.toFixed(1).replace('.', ',');
    if (pa && document.activeElement !== pa) pa.value = n;
    const lv = $('length-v');
    if (lv) lv.textContent = state.length.toFixed(1);
  }
  function syncPalletMountButtons(){
    const m = palletMountMode();
    document.querySelectorAll('.pallet-mount-btn').forEach(btn => {
      btn.classList.toggle('on', btn.dataset.mount === m);
    });
  }
  function syncPalletTierHint(){
    const tiers = state.palletTiers || 5;
    const gap = state.tierGapMm || 350;
    const hMm = tiers * PALLET_W_MM + Math.max(0, tiers - 1) * gap;
    const el = $('pallet-rack-height');
    if (el) el.textContent = String(Math.round(hMm));
  }
  function syncPalletPlantsHint(){
    const cells = state.palletCells || 54;
    const per = plantsPerPalletCount();
    const form = $('pallet-plants-formula');
    if (form) form.textContent = palletMountMode() === 'lid' ? String(cells) : ('3×' + (cells === 9 ? '8–9' : cells));
    const pEl = $('pallet-plants-per');
    if (pEl) pEl.textContent = String(per);
  }
  function palletCellGeometry(cells, mount){
    cells = cells || state.palletCells || 54;
    mount = mount || palletMountMode();
    const cassettes = mount === 'lid' ? 1 : CASSETTES_PER_PALLET;
    const perPallet = cassettes * cells;
    const cassetteL = PALLET_L_MM / cassettes;
    const cassetteW = PALLET_W_MM;
    const cellPitch = Math.sqrt((cassetteL * cassetteW) / cells);
    const cellD = cellPitch * 0.9;
    return { perPallet, cassettes, cells, cassetteL, cassetteW, cellPitch, cellD };
  }
`;

rep('function plantsPerPallet(){ return CASSETTES_PER_PALLET * (state.palletCells || 54); }',
  HELP + 'function plantsPerPallet(){ return plantsPerPalletCount(); }', 'pp');

// plantLayoutPallet - read current and replace
const plStart = h.indexOf('  function plantLayoutPallet(){');
const plEnd = h.indexOf('  function manualHarvestMass', plStart);
if (plStart < 0) { console.error('no plantLayoutPallet'); process.exit(1); }
const newPl = `  function plantLayoutPallet(){
    syncPalletZoneLength();
    const mount = palletMountMode();
    const geo = palletCellGeometry(state.palletCells, mount);
    const cells = geo.cells;
    const perPallet = geo.perPallet;
    const along = Math.max(1, state.palletsAlong || 1);
    const across = Math.max(1, state.nch);
    const gap = state.extraB || 0;
    const pitchW = PALLET_W_MM + gap;
    const zoneLenMm = along * PALLET_L_MM;
    const totalPallets = along * across;
    const total = totalPallets * perPallet;
    const palletAreaM2 = PALLET_L_M * PALLET_W_M;
    const sysArea = totalPallets * palletAreaM2;
    const sysWmm = (across - 1) * pitchW + PALLET_W_MM;
    const rhoA = sysArea > 0 ? total / sysArea : 0;
    const tiers = state.palletTiers || 5;
    const tierGap = state.tierGapMm || 350;
    const rackHeightMm = tiers * PALLET_W_MM + Math.max(0, tiers - 1) * tierGap;
    const maxFit = Math.max(1, Math.floor((MAX_WIDTH - PALLET_W_MM) / pitchW) + 1);
    return {
      palletMode: true,
      mountMode: mount,
      alongLength: along,
      acrossPallets: across,
      zoneLenMm: zoneLenMm,
      totalPallets: totalPallets,
      plantsPerPallet: perPallet,
      cellsPerCassette: cells,
      cassettesPerPallet: mount === 'cassette' ? CASSETTES_PER_PALLET : 0,
      cassetteL: geo.cassetteL,
      cassetteW: geo.cassetteW,
      cellPitch: geo.cellPitch,
      cellD: geo.cellD,
      cassettePitch: geo.cassetteL,
      perChan: perPallet,
      perRow: along,
      total: total,
      rhoA: rhoA,
      rhoT: rhoA,
      sysWmm: sysWmm,
      sysArea: sysArea,
      a: round(geo.cellPitch),
      b: pitchW,
      nearest: geo.cellPitch,
      offMm: 0,
      diag: geo.cellPitch,
      ratio: 1,
      constrained: false,
      vfMode: false,
      maxChannelsFit: maxFit,
      palletTiers: tiers,
      tierGapMm: tierGap,
      rackHeightMm: rackHeightMm,
      totalPlantsAllTiers: total * tiers
    };
  }

`;
h = h.slice(0, plStart) + newPl + h.slice(plEnd);

rep(`  function holeDiameter(cv){
    if (isPalletView()){
      const n = plantsPerPallet();
      return clamp(Math.sqrt((PALLET_L_MM * PALLET_W_MM) / n / Math.PI) * 2 * 0.88, 22, 75);
    }`, `  function holeDiameter(cv){
    if (isPalletView()){
      return clamp(palletCellGeometry().cellD, 18, 80);
    }`, 'hole');

rep(`    const lenLbl = $('length-label');
    if (lenLbl) lenLbl.textContent = pallet ? 'Длина зоны (вдоль 130 см)' : 'Длина канала';
    const nchLbl = $('nch-label');
    if (nchLbl) nchLbl.textContent = pallet ? 'Поддонов поперёк (ширина)' : 'Количество каналов';
    const autoBtn = $('auto-nch');
    if (autoBtn) autoBtn.textContent = pallet ? '→ Максимум поддонов в 2 м ширины' : '→ Максимум каналов в 2 м ширины';
    const extraLbl = $('extraB-label');
    if (extraLbl) extraLbl.textContent = pallet ? 'Зазор между поддонами' : 'Доп. отступ b';`, `    const lenCh = $('ctrl-length-channel');
    const lenPal = $('ctrl-pallets-along');
    if (lenCh) lenCh.classList.toggle('env-block-hidden', pallet);
    if (lenPal) lenPal.classList.toggle('env-block-hidden', !pallet);
    const nchLbl = $('nch-label');
    if (nchLbl) nchLbl.textContent = pallet ? 'Поддонов поперёк (×65 см)' : 'Количество каналов';
    const autoBtn = $('auto-nch');
    if (autoBtn) autoBtn.textContent = pallet ? '→ Максимум поддонов в 2 м (по 65 см)' : '→ Максимум каналов в 2 м ширины';
    const extraLbl = $('extraB-label');
    if (extraLbl) extraLbl.textContent = pallet ? 'Зазор между поддонами (поперёк)' : 'Доп. отступ b';
    if (pallet){
      syncPalletZoneLength();
      syncPalletMountButtons();
      syncPalletPlantsHint();
      syncPalletTierHint();
    }`, 'ui');

rep(`    const geom = r.palletMode ? [
      { l: 'Поддонов вдоль зоны', v: r.alongLength, u: 'шт' },
      { l: 'Поддонов поперёк', v: r.acrossPallets, u: 'шт' },
      { l: 'Всего поддонов', v: r.totalPallets, u: 'шт' },
      { l: 'Растений на поддон', v: r.plantsPerPallet, u: 'шт (3×' + r.cellsPerCassette + ')' },
      { l: 'Шаг между ячейками', v: round(r.nearest), u: 'мм' },
      { l: 'Зазор ячейка / шапка', v: round(r.edgeGap), u: 'мм' }
    ] : [`, `    const geom = r.palletMode ? [
      { l: 'Длина зоны', v: (r.zoneLenMm / 1000).toFixed(1), u: 'м (' + r.alongLength + '×130 см)' },
      { l: 'Поддонов вдоль (130 см)', v: r.alongLength, u: 'шт' },
      { l: 'Поддонов поперёк (65 см)', v: r.acrossPallets, u: 'шт' },
      { l: 'Всего поддонов', v: r.totalPallets, u: 'шт' },
      { l: r.mountMode === 'lid' ? 'Отверстий на поддон' : 'Кассет × ячеек', v: r.mountMode === 'lid' ? r.cellsPerCassette : (r.cassettesPerPallet + '×' + r.cellsPerCassette), u: '' },
      { l: 'Растений на поддон', v: r.plantsPerPallet, u: 'шт' },
      { l: 'Шаг между ячейками', v: round(r.cellPitch), u: 'мм' },
      { l: '⌀ ячейки (ориентир)', v: round(r.cellD), u: 'мм' },
      ...(r.mountMode === 'cassette' ? [{ l: 'Длина кассеты на поддоне', v: round(r.cassettePitch), u: 'мм' }] : []),
      { l: 'Зазор между поддонами', v: state.extraB || 0, u: 'мм' }
    ] : [`, 'geom');

rep(`      { l: r.palletMode ? 'Шаг между центрами ячеек' : 'Ближайшие центры отверстий', v: round(r.nearest), u: 'мм' },`,
  `      { l: r.palletMode ? 'Шаг между центрами ячеек' : 'Ближайшие центры отверстий', v: round(r.palletMode ? r.cellPitch : r.nearest), u: 'мм' },`, 'can');

rep(`      { l: r.palletMode ? 'Растений на поддон' : 'Растений в канале', v: r.perChan, u: 'шт' },
      { l: 'Всего растений', v: r.total, u: 'шт' },`,
  `      { l: r.palletMode ? 'Растений на поддон' : 'Растений в канале', v: r.perChan, u: 'шт' },
      ...(r.palletMode && r.palletTiers > 1 ? [
        { l: 'Ярусов в стеллаже', v: r.palletTiers, u: 'шт' },
        { l: 'Растений на всех ярусах', v: r.totalPlantsAllTiers, u: 'шт' },
        { l: 'Высота стеллажа (ориентир)', v: round(r.rackHeightMm), u: 'мм' }
      ] : []),
      { l: 'Всего растений', v: r.total, u: 'шт' },`, 'sys');

// calcFromPalletSheet return merge lay
rep(`    const lay = plantLayout(cv);
    const { a, b, offMm, diag, nearest, rhoA, perChan, perRow, total, sysWmm, sysArea, constrained, vfMode } = lay;
    const canopyAtMax = effectiveCa(cv) * Math.sqrt(cv.M_max);
    const crowdF = crowdingFactor(canopyAtMax, nearest);
    const massAuto = massRaw * crowdF;
    let mass = palletEffectiveMass(cv, massAuto);
    let canopy = harvestCanopy(cv, mass);
    const intervalMod = applyCutIntervalHarvestMods(cv, mass, canopy);
    mass = intervalMod.mass; canopy = intervalMod.canopy;
    const rgrMass = rgrAtTotal(cv, t_total) * 100;
    const rgrCanopy = rgrMass / 2;
    const tHarvestCh = cv.channelDays;
    const tBoltCh = boltChannel(cv);
    const st = stageOf(t_ch, mass, tBoltCh, cv);
    const edgeGap = nearest - holeDiameter(cv);
    const leafGap = nearest - canopy;
    const widthExceeds = sysWmm > MAX_WIDTH;
    const widthClose = !widthExceeds && sysWmm > MAX_WIDTH - 200;
    const maxChannelsFit = Math.max(2, Math.floor((MAX_WIDTH - PALLET_W_MM) / b) + 1);
    const totalCycleDays = germ + nursery + Math.round(tHarvestCh);
    const cyclesPerYear = totalCycleDays > 0 ? 365 / totalCycleDays : 0;
    const useSheetYield = state.palletStd.mass && state.palletStd.density;
    const yieldPerSqmCycle = useSheetYield ? (cv.yieldPerSqmG / 1000) : (mass * rhoA / 1000);
    const yieldPerCycleKg = useSheetYield ? (cv.yieldPerSqmG / 1000 * sysArea) : (mass * total / 1000);
    const yieldPerSqmYear = yieldPerSqmCycle * cyclesPerYear;
    state.density = savedDensity; state.germination = savedGerm; state.nursery = savedNursery; state.day = savedDay; state.palletCells = savedCells;
    return { cv, t_ch, t_total, mass, massAuto, canopy, massRaw, canopyRaw: canopy, crowdF, rgrMass, rgrCanopy, tHarvestCh, tBoltCh, st,
      a, b, diag, nearest, edgeGap, offMm, constrained, rhoT, rhoA, leafGap, perChan, perRow, total, sysWmm, sysArea, vfMode,
      widthExceeds, widthClose, maxChannelsFit, totalCycleDays, cyclesPerYear, yieldPerCycleKg, yieldPerSqmCycle, yieldPerSqmYear,
      palletSheet: true, countUnit: cv.countUnit };`,
`    const lay = plantLayout(cv);
    const cellPitch = lay.cellPitch || lay.nearest;
    const canopyAtMax = effectiveCa(cv) * Math.sqrt(cv.M_max);
    const crowdF = crowdingFactor(canopyAtMax, cellPitch);
    const massAuto = massRaw * crowdF;
    let mass = palletEffectiveMass(cv, massAuto);
    let canopy = harvestCanopy(cv, mass);
    const intervalMod = applyCutIntervalHarvestMods(cv, mass, canopy);
    mass = intervalMod.mass; canopy = intervalMod.canopy;
    const rgrMass = rgrAtTotal(cv, t_total) * 100;
    const rgrCanopy = rgrMass / 2;
    const tHarvestCh = cv.channelDays;
    const tBoltCh = boltChannel(cv);
    const st = stageOf(t_ch, mass, tBoltCh, cv);
    const edgeGap = cellPitch - (lay.cellD || 0);
    const leafGap = cellPitch - canopy;
    const widthExceeds = lay.sysWmm > MAX_WIDTH;
    const widthClose = !widthExceeds && lay.sysWmm > MAX_WIDTH - 200;
    const totalCycleDays = germ + nursery + Math.round(tHarvestCh);
    const cyclesPerYear = totalCycleDays > 0 ? 365 / totalCycleDays : 0;
    const useSheetYield = state.palletStd.mass && state.palletStd.density;
    const yieldPerSqmCycle = useSheetYield ? (cv.yieldPerSqmG / 1000) : (mass * lay.rhoA / 1000);
    const yieldPerCycleKg = useSheetYield ? (cv.yieldPerSqmG / 1000 * lay.sysArea) : (mass * lay.total / 1000);
    const yieldPerSqmYear = yieldPerSqmCycle * cyclesPerYear;
    state.density = savedDensity; state.germination = savedGerm; state.nursery = savedNursery; state.day = savedDay; state.palletCells = savedCells;
    return Object.assign({ cv, t_ch, t_total, mass, massAuto, canopy, massRaw, canopyRaw: canopy, crowdF, rgrMass, rgrCanopy, tHarvestCh, tBoltCh, st,
      a: cellPitch, b: lay.b, diag: cellPitch, nearest: cellPitch, edgeGap, offMm: 0, constrained: false, rhoT, rhoA: lay.rhoA, leafGap,
      perChan: lay.perChan, perRow: lay.perRow, total: lay.total, sysWmm: lay.sysWmm, sysArea: lay.sysArea, vfMode: false,
      widthExceeds, widthClose, maxChannelsFit: lay.maxChannelsFit, totalCycleDays, cyclesPerYear, yieldPerCycleKg, yieldPerSqmCycle, yieldPerSqmYear,
      palletSheet: true, countUnit: cv.countUnit }, lay);`, 'calc');

// renderSchemaPallet
const rs = h.indexOf('  function renderSchemaPallet(r){');
const re = h.indexOf('  function renderSchema(r){', rs);
const newRs = `  function renderSchemaPallet(r){
    const W = 640, H = 340, padL = 52, padR = 28, padT = 28, padB = 42;
    const dW = W - padL - padR, dH = H - padT - padB;
    const showAlong = Math.min(r.alongLength, 3);
    const showAcross = Math.min(r.acrossPallets, 4);
    const gapMm = state.extraB || 0;
    const fragL = showAlong * PALLET_L_MM;
    const fragW = showAcross * PALLET_W_MM + Math.max(0, showAcross - 1) * gapMm;
    const sc = Math.min(dW / fragL, dH / fragW) * 0.92;
    const oX = padL + (dW - fragL * sc) / 2;
    const oY = padT + (dH - fragW * sc) / 2;
    const gap = gapMm * sc;
    const canopyR = (r.canopy / 2) * sc;
    const holeR = Math.max(1.5, (r.cellD / 2) * sc * 0.45);
    const mount = r.mountMode || 'cassette';
    const nCas = mount === 'cassette' ? CASSETTES_PER_PALLET : 1;
    const cols = Math.ceil(Math.sqrt(r.cellsPerCassette));
    const rows = Math.ceil(r.cellsPerCassette / cols);
    let svg = '<defs><marker id="arrP" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker></defs>';
    for (let i = 0; i < showAcross; i++){
      for (let j = 0; j < showAlong; j++){
        const x = oX + j * PALLET_L_MM * sc;
        const y = oY + i * (PALLET_W_MM * sc + gap);
        const pw = PALLET_L_MM * sc, ph = PALLET_W_MM * sc;
        svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + pw.toFixed(1) + '" height="' + ph.toFixed(1) + '" class="svg-channel" rx="3"/>';
        for (let c = 0; c < nCas; c++){
          const cx0 = x + c * (pw / nCas), cw = pw / nCas;
          if (mount === 'cassette') svg += '<rect x="' + cx0.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ph.toFixed(1) + '" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.35" rx="2"/>';
          const stepX = cw / cols, stepY = ph / rows;
          let drawn = 0;
          for (let row = 0; row < rows && drawn < r.cellsPerCassette; row++){
            for (let col = 0; col < cols && drawn < r.cellsPerCassette; col++){
              const hx = cx0 + (col + 0.5) * stepX, hy = y + (row + 0.5) * stepY;
              svg += '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="' + holeR.toFixed(1) + '" class="svg-pot"/>';
              if (drawn === 0) svg += '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="' + canopyR.toFixed(1) + '" class="' + (r.leafGap < 0 ? 'svg-canopy-over' : 'svg-canopy') + '" opacity="0.85"/>';
              drawn++;
            }
          }
        }
      }
    }
  $('schema').innerHTML = svg;
    const sv = $('schema-canopy-val');
    if (sv) sv.textContent = round(r.canopy);
    const ml = mount === 'lid' ? 'отверстия в крышке' : ('3 кассеты × ' + r.cellsPerCassette + ' яч.');
    $('viz-caption').textContent = r.alongLength + '×' + r.acrossPallets + ' поддонов · ' + ml + ' · ' + r.total + ' раст. · ' + r.cv.name;
  }

`;
h = h.slice(0, rs) + newRs + h.slice(re);

rep(`    if (r.palletMode){
      push('check', 'check', 'Поддоны 130×65: ' + r.totalPallets + ' шт, ' + r.plantsPerPallet + ' раст./поддон, ' + round(r.rhoA) + ' шт/м².');
    }`, `    if (r.palletMode){
      const ml = r.mountMode === 'lid' ? 'отверстия в крышке' : '3 кассеты';
      push('check', 'check', 'Зона ' + (r.zoneLenMm/1000).toFixed(1) + ' м: ' + r.alongLength + '×' + r.acrossPallets + ' поддонов (' + ml + '), ' + r.total + ' раст., ' + round(r.rhoA) + ' шт/м².');
    }`, 'rec');

rep(`  function syncPalletCellButtons(){
    const cells = state.palletCells || 54;
    document.querySelectorAll('.pallet-cell-btn').forEach(btn => {
      btn.classList.toggle('on', parseInt(btn.dataset.cells, 10) === cells);
    });
    const nEl = $('pallet-cells-n');
    const pEl = $('pallet-plants-per');
    if (nEl) nEl.textContent = cells === 9 ? '8–9' : String(cells);
    if (pEl) pEl.textContent = String(plantsPerPallet());
  }`, `  function syncPalletCellButtons(){
    const cells = state.palletCells || 54;
    document.querySelectorAll('.pallet-cell-btn').forEach(btn => {
      btn.classList.toggle('on', parseInt(btn.dataset.cells, 10) === cells);
    });
    syncPalletPlantsHint();
  }`, 'sync');

rep(`  const numericSliders = ['length','nch','density','offset','extraB','day','nursery','temp','targetDli','targetPhotoperiod','cutInterval','errorPct','canopyPct','temp-B','pricePerKg','pricePerKwh','targetDliVf','targetPhotoperiodVf','ppfd','ledEfficacyVf','rh','targetDliB','targetPhotoperiodB'];`,
  `  const numericSliders = ['length','palletsAlong','nch','density','offset','extraB','day','nursery','temp','targetDli','targetPhotoperiod','cutInterval','errorPct','canopyPct','temp-B','pricePerKg','pricePerKwh','targetDliVf','targetPhotoperiodVf','ppfd','ledEfficacyVf','rh','targetDliB','targetPhotoperiodB','palletTiers','tierGapMm'];`, 'sl');

rep(`      if (id === 'length') valEl.textContent = v.toFixed(1);
      else if (id === 'temp'`, `      if (id === 'length') valEl.textContent = v.toFixed(1);
      else if (id === 'palletsAlong') syncPalletZoneLength();
      else if (id === 'temp'`, 'slv');

rep(`    document.querySelectorAll('.pallet-cell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.palletCells = parseInt(btn.dataset.cells, 10);
        state.palletStd.cells = false;
        syncPalletCellButtons();
        syncVfStdBadges();
        renderAll();
      });
    });
    renderMonths();`, `    document.querySelectorAll('.pallet-cell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.palletCells = parseInt(btn.dataset.cells, 10);
        state.palletStd.cells = false;
        syncPalletCellButtons();
        syncVfStdBadges();
        renderAll();
      });
    });
    document.querySelectorAll('.pallet-mount-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.palletMount = btn.dataset.mount === 'lid' ? 'lid' : 'cassette';
        syncPalletMountButtons();
        syncPalletPlantsHint();
        renderAll();
      });
    });
    syncPalletZoneLength();
    renderMonths();`, 'init');

fs.writeFileSync(p, h, 'utf8');
console.log('geom2 OK');
