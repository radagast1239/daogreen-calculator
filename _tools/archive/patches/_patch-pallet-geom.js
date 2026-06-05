const fs = require('fs');
const p = 'calculator-110x55_12.html';
let h = fs.readFileSync(p, 'utf8');

function rep(a, b, label) {
  if (!h.includes(a)) { console.error('MISSING:', label); process.exit(1); }
  h = h.replace(a, b);
}

if (h.includes('palletMount')) { console.log('Already patched geom'); process.exit(0); }

rep('.pallet-cell-btn.on { background: var(--olive-pale);', `.pallet-mount-row { display: flex; gap: 6px; flex-wrap: wrap; grid-column: 2 / 4; }
.pallet-mount-btn { padding: 7px 12px; background: transparent; border: 1px solid var(--rule-strong); border-radius: var(--radius); font-family: inherit; font-size: 13px; color: var(--ink-soft); cursor: pointer; }
.pallet-mount-btn.on { background: var(--olive-pale); border-color: var(--olive); color: var(--olive-text); font-weight: 500; }
.pallet-cell-btn.on { background: var(--olive-pale);`, 'css');

rep(
  `    <p class="sys-pallet-hint sys-pallet-only env-block-hidden">Поддон <strong>1300×650 мм</strong>, <strong>3 кассеты</strong> на поддон. Ячейки в кассете: 8–9, 14, 24 или 54. Длина зоны — вдоль стороны 130 см.</p>

    <motion class="ctrl">
      <span class="ctrl-label" id="length-label">Длина канала</span>
      <input type="range" id="length" min="1" max="12" step="0.5" value="3">
      <span class="ctrl-val"><span id="length-v">3.0</span><span class="unit">м</span></span>
    </motion>`,
  `    <p class="sys-pallet-hint sys-pallet-only env-block-hidden" id="pallet-sys-hint">Стеллаж <strong>130×65 см</strong> на ярус. Поддон — модуль <strong>130×65 см</strong>. Длина и ширина зоны — только целое число поддонов. В режиме кассет: <strong>3 кассеты</strong> на поддон, в кассете <strong>9–54 ячеек</strong> (отверстия уже в кассете).</p>

    <div class="ctrl sys-channel-only" id="ctrl-length-channel">
      <span class="ctrl-label" id="length-label">Длина канала</span>
      <input type="range" id="length" min="1" max="12" step="0.5" value="3">
      <span class="ctrl-val"><span id="length-v">3.0</span><span class="unit">м</span></span>
    </motion>

    <div class="ctrl sys-pallet-only env-block-hidden" id="ctrl-pallets-along">
      <span class="ctrl-label" id="pallets-along-label">Поддонов вдоль стойки (130 см)</span>
      <input type="range" id="palletsAlong" min="1" max="12" step="1" value="3">
      <span class="ctrl-val"><span id="palletsAlong-v">3</span><span class="unit">шт</span> · <span id="pallet-zone-len">3,9</span><span class="unit">м</span></span>
    </motion>`
, 'html length');

// fix motion typo if any
h = h.replace(/<motion class=/g, '<div class=');

rep(
  `    <motion class="ctrl">
      <span class="ctrl-label" id="nch-label">Количество каналов</span>`,
  `    <div class="ctrl">
      <span class="ctrl-label" id="nch-label">Количество каналов</span>`
, 'nch div');

rep(
  `    <p class="sys-pallet-only env-block-hidden sys-pallet-hint">На поддон: <strong id="pallet-plants-per">162</strong> раст. (3×<span id="pallet-cells-n">54</span>)</p>`,
  `    <motion class="ctrl sys-pallet-only env-block-hidden">
      <span class="ctrl-label">Монтаж на поддоне</span>
      <div class="pallet-mount-row" id="pallet-mount">
        <button type="button" class="pallet-mount-btn on" data-mount="cassette">3 готовые кассеты</button>
        <button type="button" class="pallet-mount-btn" data-mount="lid">Отверстия в крышке 130×65</button>
      </motion>
    </motion>
    <p class="sys-pallet-only env-block-hidden sys-pallet-hint" id="pallet-plants-hint">На поддон: <strong id="pallet-plants-per">162</strong> раст. (<span id="pallet-plants-formula">3×54</span> ячеек)</p>

    <div class="ctrl sys-pallet-only env-block-hidden">
      <span class="ctrl-label">Ярусов в стеллаже</span>
      <input type="range" id="palletTiers" min="1" max="6" step="1" value="5">
      <span class="ctrl-val"><span id="palletTiers-v">5</span><span class="unit">шт</span></span>
    </motion>
    <div class="ctrl sys-pallet-only env-block-hidden">
      <span class="ctrl-label">Расстояние между ярусами</span>
      <input type="range" id="tierGapMm" min="300" max="400" step="10" value="350">
      <span class="ctrl-val"><span id="tierGapMm-v">350</span><span class="unit">мм</span></span>
    </motion>
    <p class="sys-pallet-only env-block-hidden sys-pallet-hint" id="pallet-tier-hint">Высота стеллажа (ориентир): <strong id="pallet-rack-height">—</strong> мм</p>`
, 'mount html');

h = h.replace(/<motion class=/g, '<motion class=').replace(/<\/motion>/g, '</div>');
h = h.replace(/<motion class=/g, '<div class=');

rep(
  `  const CASSETTES_PER_PALLET = 3;`,
  `  const CASSETTES_PER_PALLET = 3;
  const PALLET_L_M = PALLET_L_MM / 1000;
  const PALLET_W_M = PALLET_W_MM / 1000;`
, 'consts');

rep(
  `    palletCells: 54,
    palletCv: 'pl-shiso',`,
  `    palletCells: 54,
    palletsAlong: 3,
    palletMount: 'cassette',
    palletTiers: 5,
    tierGapMm: 350,
    palletCv: 'pl-shiso',`
, 'state');

const PALLET_HELPERS = `
  function palletMountMode(){ return state.palletMount === 'lid' ? 'lid' : 'cassette'; }
  function palletCassettesCount(){ return palletMountMode() === 'lid' ? 1 : CASSETTES_PER_PALLET; }
  function plantsPerPalletCount(){
    const cells = state.palletCells || 54;
    return palletMountMode() === 'lid' ? cells : CASSETTES_PER_PALLET * cells;
  }
  function syncPalletZoneLength(){
    const n = Math.max(1, state.palletsAlong || Math.round(state.length / PALLET_L_M) || 1);
    state.palletsAlong = n;
    state.length = Math.round(n * PALLET_L_M * 10) / 10;
    const v = $('palletsAlong-v');
    const z = $('pallet-zone-len');
    const pa = $('palletsAlong');
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
    const hint = $('pallet-tier-hint');
    if (hint) hint.classList.toggle('env-block-hidden', tiers < 2);
  }
  function syncPalletPlantsHint(){
    const cells = state.palletCells || 54;
    const per = plantsPerPalletCount();
    const form = $('pallet-plants-formula');
    const pEl = $('pallet-plants-per');
    const nEl = $('pallet-cells-n');
    if (pEl) pEl.textContent = String(per);
    if (nEl) nEl.textContent = cells === 9 ? '8–9' : String(cells);
    if (form) form.textContent = palletMountMode() === 'lid' ? String(cells) : ('3×' + (cells === 9 ? '8–9' : cells));
    const hint = $('pallet-plants-hint');
    if (hint){
      hint.innerHTML = palletMountMode() === 'lid'
        ? 'На поддон (крышка): <strong id="pallet-plants-per">' + per + '</strong> отверстий · ячеек <strong id="pallet-cells-n">' + (cells === 9 ? '8–9' : cells) + '</strong>'
        : 'На поддон: <strong id="pallet-plants-per">' + per + '</strong> раст. (<span id="pallet-plants-formula">3×' + (cells === 9 ? '8–9' : cells) + '</span> в кассетах)';
    }
  }
  function palletCellGeometry(cells, mount){
    cells = cells || state.palletCells || 54;
    mount = mount || palletMountMode();
    const cassettes = mount === 'lid' ? 1 : CASSETTES_PER_PALLET;
    const perPallet = cassettes * cells;
    const cassetteL = PALLET_L_MM / cassettes;
    const cassetteW = PALLET_W_MM;
    const areaPerCell = (cassetteL * cassetteW) / cells;
    const cellPitch = Math.sqrt(areaPerCell);
    const cellD = cellPitch * 0.9;
    return { perPallet, cassettes, cells, cassetteL, cassetteW, cellPitch, cellD, areaPerCell };
  }
`;

rep(
  'function plantsPerPallet(){ return CASSETTES_PER_PALLET * (state.palletCells || 54); }',
  PALLET_HELPERS + 'function plantsPerPallet(){ return plantsPerPalletCount(); }'
, 'helpers');

rep(
  `  function plantLayoutPallet(){
    const cells = state.palletCells || 54;
    const perPallet = CASSETTES_PER_PALLET * cells;
    const Lmm = state.length * 1000;
    const margin = 50;
    const gap = state.extraB || 0;
    const pitchW = PALLET_W_MM + gap;
    const npal = state.nch;
    const along = Math.max(1, Math.floor((Lmm - 2 * margin) / PALLET_L_MM));
    const totalPallets = along * npal;
    const total = totalPallets * perPallet;
    const palletAreaM2 = (PALLET_L_MM / 1000) * (PALLET_W_MM / 1000);
    const sysArea = totalPallets * palletAreaM2;
    const sysWmm = (npal - 1) * pitchW + PALLET_W_MM;
    const rhoA = sysArea > 0 ? total / sysArea : 0;
    const nearest = Math.sqrt((PALLET_L_MM * PALLET_W_MM) / perPallet);
    const maxFit = Math.max(1, Math.floor((MAX_WIDTH - PALLET_W_MM) / pitchW) + 1);
    return {
      palletMode: true,
      alongLength: along,
      acrossPallets: npal,
      totalPallets: totalPallets,
      plantsPerPallet: perPallet,
      cellsPerCassette: cells,
      perChan: perPallet,
      perRow: along,
      total: total,
      rhoA: rhoA,
      rhoT: rhoA,
      sysWmm: sysWmm,
      sysArea: sysArea,
      a: round(nearest),
      b: pitchW,
      nearest: nearest,
      offMm: 0,
      diag: nearest,
      ratio: 1,
      constrained: false,
      vfMode: isVF(),
      maxChannelsFit: maxFit
    };
  }`,
  `  function plantLayoutPallet(){
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
    const cellPitch = geo.cellPitch;
    const cellD = geo.cellD;
    const cassettePitch = geo.cassetteL;
    const maxFit = Math.max(1, Math.floor((MAX_WIDTH - PALLET_W_MM) / pitchW) + 1);
    const tiers = state.palletTiers || 5;
    const tierGap = state.tierGapMm || 350;
  const rackHeightMm = tiers * PALLET_W_MM + Math.max(0, tiers - 1) * tierGap;
    return {
      palletMode: true,
      mountMode: mount,
      alongLength: along,
      acrossPallets: across,
      zoneLenMm: zoneLenMm,
      totalPallets: totalPallets,
      plantsPerPallet: perPallet,
      plantsPerCassette: mount === 'lid' ? cells : cells,
      cellsPerCassette: cells,
      cassettesPerPallet: mount === 'cassette' ? CASSETTES_PER_PALLET : 0,
      cassetteL: geo.cassetteL,
      cassetteW: geo.cassetteW,
      cellPitch: cellPitch,
      cellD: cellD,
      cassettePitch: cassettePitch,
      perChan: perPallet,
      perRow: along,
      total: total,
      rhoA: rhoA,
      rhoT: rhoA,
      sysWmm: sysWmm,
      sysArea: sysArea,
      a: round(cellPitch),
      b: pitchW,
      nearest: cellPitch,
      offMm: 0,
      diag: cellPitch,
      ratio: 1,
      constrained: false,
      vfMode: false,
      maxChannelsFit: maxFit,
      palletTiers: tiers,
      tierGapMm: tierGap,
      rackHeightMm: rackHeightMm,
      totalPlantsAllTiers: total * tiers
    };
  }`
, 'layout');

rep(
  `  function holeDiameter(cv){
    if (isPalletView()){
      const n = plantsPerPallet();
      return clamp(Math.sqrt((PALLET_L_MM * PALLET_W_MM) / n / Math.PI) * 2 * 0.88, 22, 75);
    }`,
  `  function holeDiameter(cv){
    if (isPalletView()){
      const geo = palletCellGeometry();
      return clamp(geo.cellD, 18, 80);
    }`
, 'hole');

rep(
  `    const lenLbl = $('length-label');
    if (lenLbl) lenLbl.textContent = pallet ? 'Длина зоны (вдоль 130 см)' : 'Длина канала';
    const nchLbl = $('nch-label');
    if (nchLbl) nchLbl.textContent = pallet ? 'Поддонов поперёк (ширина)' : 'Количество каналов';
    const autoBtn = $('auto-nch');
    if (autoBtn) autoBtn.textContent = pallet ? '→ Максимум поддонов в 2 м ширины' : '→ Максимум каналов в 2 м ширины';
    const extraLbl = $('extraB-label');
    if (extraLbl) extraLbl.textContent = pallet ? 'Зазор между поддонами' : 'Доп. отступ b';`,
  `    const lenCh = $('ctrl-length-channel');
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
    }`
, 'ui');

rep(
  `    const geom = r.palletMode ? [
      { l: 'Поддонов вдоль зоны', v: r.alongLength, u: 'шт' },
      { l: 'Поддонов поперёк', v: r.acrossPallets, u: 'шт' },
      { l: 'Всего поддонов', v: r.totalPallets, u: 'шт' },
      { l: 'Растений на поддон', v: r.plantsPerPallet, u: 'шт (3×' + r.cellsPerCassette + ')' },
      { l: 'Шаг между ячейками', v: round(r.nearest), u: 'мм' },
      { l: 'Зазор ячейка / шапка', v: round(r.edgeGap), u: 'мм' }
    ] : [`,
  `    const geom = r.palletMode ? [
      { l: 'Длина зоны', v: (r.zoneLenMm / 1000).toFixed(1), u: 'м (' + r.alongLength + '×130 см)' },
      { l: 'Поддонов вдоль (130 см)', v: r.alongLength, u: 'шт' },
      { l: 'Поддонов поперёк (65 см)', v: r.acrossPallets, u: 'шт' },
      { l: 'Всего поддонов в зоне', v: r.totalPallets, u: 'шт' },
      { l: r.mountMode === 'lid' ? 'Отверстий на поддон' : 'Кассет × ячеек', v: r.mountMode === 'lid' ? r.cellsPerCassette : (r.cassettesPerPallet + '×' + r.cellsPerCassette), u: r.mountMode === 'lid' ? 'шт' : '' },
      { l: 'Растений на поддон', v: r.plantsPerPallet, u: 'шт' },
      { l: 'Шаг между ячейками', v: round(r.cellPitch), u: 'мм' },
      { l: '⌀ ячейки (ориентир)', v: round(r.cellD), u: 'мм' },
      ...(r.mountMode === 'cassette' ? [{ l: 'Длина кассеты вдоль поддона', v: round(r.cassettePitch), u: 'мм' }] : []),
      { l: 'Зазор между поддонами', v: state.extraB || 0, u: 'мм' }
    ] : [`
, 'metrics geom');

rep(
  `      { l: r.palletMode ? 'Шаг между центрами ячеек' : 'Ближайшие центры отверстий', v: round(r.nearest), u: 'мм' },`,
  `      { l: r.palletMode ? 'Шаг между центрами ячеек' : 'Ближайшие центры отверстий', v: round(r.palletMode ? r.cellPitch : r.nearest), u: 'мм' },`
, 'canopy metric');

rep(
  `      { l: r.palletMode ? 'Растений на поддон' : 'Растений в канале', v: r.perChan, u: 'шт' },`,
  `      { l: r.palletMode ? 'Растений на поддон' : 'Растений в канале', v: r.perChan, u: 'шт' },
      ...(r.palletMode && r.palletTiers > 1 ? [
        { l: 'Ярусов в стеллаже', v: r.palletTiers, u: 'шт' },
        { l: 'Растений на всех ярусах', v: r.totalPlantsAllTiers, u: 'шт' },
        { l: 'Высота стеллажа (ориентир)', v: round(r.rackHeightMm), u: 'мм' }
      ] : []),`
, 'sys metrics');

// renderSchemaPallet - replace entire function
const schemaOld = `  function renderSchemaPallet(r){
    const W = 640, H = 340;
    const padL = 50, padR = 30, padT = 30, padB = 40;
    const dW = W - padL - padR, dH = H - padT - padB;
    const showAlong = Math.min(r.alongLength, 4);
    const showAcross = Math.min(r.acrossPallets, 5);
    const fragL = showAlong * PALLET_L_MM;
    const fragW = showAcross * (PALLET_W_MM + (state.extraB || 0));
    const sc = Math.min(dW / fragL, dH / fragW);
    const oX = padL + (dW - fragL * sc) / 2;
    const oY = padT + (dH - fragW * sc) / 2;
    const gap = (state.extraB || 0) * sc;
    const cR = (r.canopy / 2) * sc;
    let svg = '';
    for (let i = 0; i < showAcross; i++){
      for (let j = 0; j < showAlong; j++){
        const x = oX + j * PALLET_L_MM * sc;
        const y = oY + i * (PALLET_W_MM * sc + gap);
        svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (PALLET_L_MM*sc).toFixed(1) + '" height="' + (PALLET_W_MM*sc).toFixed(1) + '" class="svg-channel" rx="4"/>';
        svg += '<circle cx="' + (x + PALLET_L_MM*sc/2).toFixed(1) + '" cy="' + (y + PALLET_W_MM*sc/2).toFixed(1) + '" r="' + cR.toFixed(1) + '" class="' + (r.leafGap < 0 ? 'svg-canopy-over' : 'svg-canopy') + '"/>';
      }
    }
    $('schema').innerHTML = svg;
    $('viz-caption').textContent = 'Поддоны ' + r.alongLength + '×' + r.acrossPallets + ' = ' + r.totalPallets + ' шт, ' + r.total + ' раст. ' + r.cv.name;
  }`;

const schemaNew = `  function renderSchemaPallet(r){
    const W = 640, H = 340;
    const padL = 52, padR = 28, padT = 28, padB = 42;
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
        const pw = PALLET_L_MM * sc;
        const ph = PALLET_W_MM * sc;
        svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + pw.toFixed(1) + '" height="' + ph.toFixed(1) + '" class="svg-channel" rx="3"/>';
        for (let c = 0; c < nCas; c++){
          const cx0 = x + c * (pw / nCas);
          const cw = pw / nCas;
          if (mount === 'cassette'){
            svg += '<rect x="' + cx0.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + ph.toFixed(1) + '" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.35" rx="2"/>';
          }
          const stepX = cw / Math.max(cols, 1);
          const stepY = ph / Math.max(rows, 1);
          let drawn = 0;
          for (let row = 0; row < rows && drawn < r.cellsPerCassette; row++){
            for (let col = 0; col < cols && drawn < r.cellsPerCassette; col++){
              const hx = cx0 + (col + 0.5) * stepX;
              const hy = y + (row + 0.5) * stepY;
              svg += '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="' + holeR.toFixed(1) + '" class="svg-pot"/>';
              if (drawn === 0 || (j === showAlong - 1 && i === 0 && drawn === Math.min(2, r.cellsPerCassette - 1))){
                svg += '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="' + canopyR.toFixed(1) + '" class="' + (r.leafGap < 0 ? 'svg-canopy-over' : 'svg-canopy') + '" opacity="0.85"/>';
              }
              drawn++;
            }
          }
        }
        if (j === 0 && i === 0){
          svg += '<text x="' + (x + pw/2).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" class="svg-dim-t" text-anchor="middle" font-size="9">1300</text>';
          svg += '<text x="' + (x - 6).toFixed(1) + '" y="' + (y + ph/2).toFixed(1) + '" class="svg-dim-t" text-anchor="end" font-size="9" transform="rotate(-90 ' + (x-6) + ' ' + (y+ph/2) + ')">650</text>';
        }
      }
    }
    if (showAlong < r.alongLength) svg += '<text x="' + (oX + fragL * sc + 6) + '" y="' + (oY + fragW * sc / 2) + '" class="svg-ellipsis" font-size="16">…</text>';
    const dimY = oY - 10;
    if (showAlong >= 2){
      const x1 = oX;
      const x2 = oX + PALLET_L_MM * sc;
      svg += '<line x1="' + x1 + '" y1="' + dimY + '" x2="' + x2 + '" y2="' + dimY + '" class="svg-dim" marker-start="url(#arrP)" marker-end="url(#arrP)"/>';
      svg += '<text x="' + ((x1+x2)/2) + '" y="' + (dimY - 4) + '" class="svg-dim-t" text-anchor="middle" font-size="9">130 см</text>';
    }
    $('schema').innerHTML = svg;
    const schemaVal = $('schema-canopy-val');
    if (schemaVal) schemaVal.textContent = round(r.canopy);
    const mountLbl = mount === 'lid' ? 'отверстия в крышке' : ('3 кассеты × ' + r.cellsPerCassette + ' яч.');
    $('viz-caption').textContent = r.alongLength + '×' + r.acrossPallets + ' поддонов = ' + r.totalPallets + ' шт · ' + mountLbl + ' · ' + r.total + ' раст. · ' + r.cv.name +
      (r.palletTiers > 1 ? ' · стеллаж ' + r.palletTiers + ' яр.' : '');
  }`;

if (!h.includes(schemaOld.slice(0, 80))) {
  console.error('schema block mismatch');
  process.exit(1);
}
h = h.replace(schemaOld, schemaNew);

rep(
  `    if (r.palletMode){
      push('check', 'check', 'Поддоны 130×65: ' + r.totalPallets + ' шт, ' + r.plantsPerPallet + ' раст./поддон, ' + round(r.rhoA) + ' шт/м².');
    }`,
  `    if (r.palletMode){
      const mountLbl = r.mountMode === 'lid' ? 'отверстия в крышке' : '3 кассеты';
      push('check', 'check', 'Зона ' + (r.zoneLenMm/1000).toFixed(1) + '×' + round(r.sysWmm/1000) + ' м: ' + r.alongLength + '×' + r.acrossPallets + ' поддонов (' + mountLbl + '), ' + r.total + ' раст., ' + round(r.rhoA) + ' шт/м².');
      if (r.palletTiers > 1) push('info', 'info', 'Стеллаж: ' + r.palletTiers + ' ярусов, шаг ' + r.tierGapMm + ' мм между полками, ориентир высоты ' + round(r.rackHeightMm) + ' мм, всего ' + r.totalPlantsAllTiers + ' посадочных мест.');
    }`
, 'recs');

rep(
  `  function syncPalletCellButtons(){
    const cells = state.palletCells || 54;
    document.querySelectorAll('.pallet-cell-btn').forEach(btn => {
      btn.classList.toggle('on', parseInt(btn.dataset.cells, 10) === cells);
    });
    const nEl = $('pallet-cells-n');
    const pEl = $('pallet-plants-per');
    if (nEl) nEl.textContent = cells === 9 ? '8–9' : String(cells);
    if (pEl) pEl.textContent = String(plantsPerPallet());
  }`,
  `  function syncPalletCellButtons(){
    const cells = state.palletCells || 54;
    document.querySelectorAll('.pallet-cell-btn').forEach(btn => {
      btn.classList.toggle('on', parseInt(btn.dataset.cells, 10) === cells);
    });
    syncPalletPlantsHint();
  }`
, 'sync cells');

rep(
  `      el.textContent = 'Поддоны 130×65 · ' + (pcv ? pcv.name + ' · кассета ' + pcv.palletCellsStd + ' (' + cellsLbl + ' яч.)' : cellsLbl + ' яч./кассета');`,
  `      el.textContent = 'Поддоны 130×65 · ' + (pcv ? pcv.name + ' · ' + (state.palletMount === 'lid' ? 'крышка' : 'кассета') + ' ' + (pcv.palletCellsStd || cellsLbl) + ' яч.' : cellsLbl + ' яч.');`
, 'pagesub');

// sliders
rep(
  `  const numericSliders = ['length','nch','density','offset','extraB','day','nursery','temp','targetDli','targetPhotoperiod','cutInterval','errorPct','canopyPct','temp-B','pricePerKg','pricePerKwh','targetDliVf','targetPhotoperiodVf','ppfd','ledEfficacyVf','rh','targetDliB','targetPhotoperiodB'];`,
  `  const numericSliders = ['length','palletsAlong','nch','density','offset','extraB','day','nursery','temp','targetDli','targetPhotoperiod','cutInterval','errorPct','canopyPct','temp-B','pricePerKg','pricePerKwh','targetDliVf','targetPhotoperiodVf','ppfd','ledEfficacyVf','rh','targetDliB','targetPhotoperiodB','palletTiers','tierGapMm'];`
, 'sliders');

rep(
  `      if (id === 'length') valEl.textContent = v.toFixed(1);
      else if (id === 'temp'`,
  `      if (id === 'length') valEl.textContent = v.toFixed(1);
      else if (id === 'palletsAlong'){ syncPalletZoneLength(); }
      else if (id === 'temp'`
, 'slider val');

// init bindings
rep(
  `    document.querySelectorAll('.pallet-cell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.palletCells = parseInt(btn.dataset.cells, 10);
        state.palletStd.cells = false;
        syncPalletCellButtons();
        syncVfStdBadges();
        renderAll();
      });
    });`,
  `    document.querySelectorAll('.pallet-cell-btn').forEach(btn => {
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
    syncPalletZoneLength();`
, 'init bind');

// calcFromPalletSheet edgeGap uses holeDiameter - leafGap uses nearest-canopy; update to cellPitch
rep(
  `    const edgeGap = nearest - holeDiameter(cv);
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
  `    const layP = plantLayoutPallet();
    const cellPitch = layP.cellPitch;
    const edgeGap = cellPitch - layP.cellD;
    const leafGap = cellPitch - canopy;
    const widthExceeds = sysWmm > MAX_WIDTH;
    const widthClose = !widthExceeds && sysWmm > MAX_WIDTH - 200;
    const maxChannelsFit = layP.maxChannelsFit;

    const totalCycleDays = germ + nursery + Math.round(tHarvestCh);
    const cyclesPerYear = totalCycleDays > 0 ? 365 / totalCycleDays : 0;
    const useSheetYield = state.palletStd.mass && state.palletStd.density;
    const yieldPerSqmCycle = useSheetYield ? (cv.yieldPerSqmG / 1000) : (mass * rhoA / 1000);
    const yieldPerCycleKg = useSheetYield ? (cv.yieldPerSqmG / 1000 * sysArea) : (mass * total / 1000);
    const yieldPerSqmYear = yieldPerSqmCycle * cyclesPerYear;
    state.density = savedDensity; state.germination = savedGerm; state.nursery = savedNursery; state.day = savedDay; state.palletCells = savedCells;
    return Object.assign({ cv, t_ch, t_total, mass, massAuto, canopy, massRaw, canopyRaw: canopy, crowdF, rgrMass, rgrCanopy, tHarvestCh, tBoltCh, st,
      a: cellPitch, b: pitchW, diag: cellPitch, nearest: cellPitch, edgeGap, offMm: 0, constrained: false, rhoT, rhoA, leafGap, perChan, perRow, total, sysWmm, sysArea, vfMode: false,
      widthExceeds, widthClose, maxChannelsFit, totalCycleDays, cyclesPerYear, yieldPerCycleKg, yieldPerSqmCycle, yieldPerSqmYear,
      palletSheet: true, countUnit: cv.countUnit }, layP);`
, 'calc pallet edge');

// Fix any broken motion tags
h = h.replace(/<motion /g, '<div ').replace(/<\/motion>/g, '</motion>');

fs.writeFileSync(p, h, 'utf8');
console.log('Pallet geom patched');
