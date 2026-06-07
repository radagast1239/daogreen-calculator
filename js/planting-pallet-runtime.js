/**
 * Поддоны: snapshot вида, геометрия ячеек, sync UI.
 * DG_createPlantingPalletRuntime(deps)
 */
(function (global) {
  'use strict';

  function createPlantingPalletRuntime(deps) {
    function st() { return deps.getState(); }
    function $(id) { return deps.$(id); }
    function ui(k, v) { return deps.ui(k, v); }
    function r1(n) { return deps.r1(n); }
    function round(n) { return deps.round(n); }
    function clamp(v, lo, hi) { return deps.clamp(v, lo, hi); }
    function isVF() { return deps.isVF(); }
    function isPalletView() { return deps.isPalletView(); }
    function allPalletCultivars() { return deps.allPalletCultivars(); }
    function getPalletCv() { return deps.getPalletCv(); }
    function initPalletValuesFromSheet(cv) { return deps.initPalletValuesFromSheet(cv); }
    function setFacility(mode) { return deps.setFacility(mode); }
    function syncManualMassUI() { return deps.syncManualMassUI(); }
    function syncCanopyUI() { return deps.syncCanopyUI(); }
    function modelCanopyFromMass(cv, m) { return deps.modelCanopyFromMass(cv, m); }
    function effectivePalletHoleCount() { return deps.effectivePalletHoleCount(); }
    var VF_CULTIVARS = deps.VF_CULTIVARS || [];
    var CASSETTES_PER_PALLET = deps.CASSETTES_PER_PALLET || 3;
    var CASSETTE_L_MM = deps.CASSETTE_L_MM || 400;
    var CASSETTE_W_MM = deps.CASSETTE_W_MM || 600;
    var PALLET_L_MM = deps.PALLET_L_MM || 1300;
    var PALLET_W_MM = deps.PALLET_W_MM || 650;
    var PALLET_L_M = deps.PALLET_L_M || 1.3;
    var PALLET_W_M = deps.PALLET_W_M || 0.65;
    var PALLET_TIER_ZONE_MM = deps.PALLET_TIER_ZONE_MM || 400;

  const plantingSnapshots = { channels: null, pallets: null };

  function capturePlantingViewSnapshot(view){
    if (view === 'pallets'){
      return {
        palletsAlong: st().palletsAlong,
        nch: st().nch,
        extraB: st().extraB,
        palletCells: st().palletCells,
        palletLidHoles: st().palletLidHoles,
        palletMount: st().palletMount,
        palletTiers: st().palletTiers,
        tierGapMm: st().tierGapMm,
        palletCv: st().palletCv,
        germination: st().germination,
        nursery: st().nursery,
        day: st().day,
        density: st().density,
        targetDli: st().targetDli,
        targetPhotoperiod: st().targetPhotoperiod,
        temp: st().temp,
        palletStd: Object.assign({}, st().palletStd),
        useManualMass: st().useManualMass,
        useManualCanopy: st().useManualCanopy,
        manualMass: st().manualMass,
        manualCanopy: st().manualCanopy
      };
    }
    return {
      length: st().length,
      nch: st().nch,
      offset: st().offset,
      extraB: st().extraB,
      pot: st().pot,
      cv: st().cv,
      vfCv: st().vfCv,
      facility: st().facility,
      germination: st().germination,
      nursery: st().nursery,
      day: st().day,
      density: st().density,
      vfStd: Object.assign({}, st().vfStd),
      useManualMass: st().useManualMass,
      useManualCanopy: st().useManualCanopy,
      manualMass: st().manualMass,
      manualCanopy: st().manualCanopy
    };
  }

  function restorePlantingViewSnapshot(view, snap){
    if (!snap){
      if (view === 'pallets' && allPalletCultivars().length) initPalletValuesFromSheet(getPalletCv());
      return;
    }
    if (view === 'pallets'){
      if (snap.palletStd){
        const lockKeys = ['germination', 'day', 'density', 'mass', 'cutInterval', 'cutMass', 'cells'];
        if (lockKeys.every(k => snap.palletStd[k])){
          lockKeys.forEach(k => { snap.palletStd[k] = false; });
        }
      }
      if (snap.palletsAlong != null) st().palletsAlong = snap.palletsAlong;
      if (snap.nch != null) st().nch = snap.nch;
      if (snap.extraB != null) st().extraB = snap.extraB;
      if (snap.palletCells != null) st().palletCells = snap.palletCells;
      if (snap.palletLidHoles != null) st().palletLidHoles = snap.palletLidHoles;
      if (snap.palletMount != null) st().palletMount = snap.palletMount;
      if (snap.palletTiers != null) st().palletTiers = snap.palletTiers;
      if (snap.tierGapMm != null) st().tierGapMm = snap.tierGapMm;
      if (snap.palletCv != null) st().palletCv = snap.palletCv;
      if (snap.palletStd) st().palletStd = Object.assign({}, snap.palletStd);
      syncPalletZoneLength();
      syncPalletCellButtons();
      syncPalletMountButtons();
    } else {
      if (snap.length != null) st().length = snap.length;
      if (snap.nch != null) st().nch = snap.nch;
      if (snap.offset != null) st().offset = snap.offset;
      if (snap.extraB != null) st().extraB = snap.extraB;
      if (snap.pot != null) st().pot = snap.pot;
      if (snap.cv != null) st().cv = snap.cv;
      if (snap.vfCv != null) st().vfCv = snap.vfCv;
      if (snap.facility != null) st().facility = snap.facility;
      if (snap.vfStd) st().vfStd = Object.assign({}, snap.vfStd);
      if (snap.facility != null && snap.facility !== st().facility) setFacility(snap.facility);
    }
    if (snap.germination != null) st().germination = snap.germination;
    if (snap.nursery != null) st().nursery = snap.nursery;
    if (snap.day != null) st().day = snap.day;
    if (snap.density != null) st().density = snap.density;
    if (snap.targetDli != null) st().targetDli = snap.targetDli;
    if (snap.targetPhotoperiod != null) st().targetPhotoperiod = snap.targetPhotoperiod;
    if (snap.temp != null) st().temp = snap.temp;
    if (snap.useManualMass != null) st().useManualMass = snap.useManualMass;
    if (snap.useManualCanopy != null) st().useManualCanopy = snap.useManualCanopy;
    if (snap.manualMass != null) st().manualMass = snap.manualMass;
    if (snap.manualCanopy != null) st().manualCanopy = snap.manualCanopy;
    ['germination', 'nursery', 'day', 'density', 'nch', 'length', 'offset', 'extraB', 'palletsAlong', 'palletTiers', 'tierGapMm', 'palletLidHoles', 'temp', 'targetDli', 'targetPhotoperiod', 'manualMass', 'manualCanopy'].forEach(id => {
      const el = $(id);
      if (el && el.value != null && st()[id] != null) el.value = st()[id];
    });
    [['germination-v', 'germination'], ['nursery-v', 'nursery'], ['day-v', 'day'], ['density-v', 'density'], ['nch-v', 'nch'], ['length-v', 'length'], ['temp-v', 'temp'], ['targetDli-v', 'targetDli'], ['targetDliVf-v', 'targetDli'], ['targetPhotoperiod-v', 'targetPhotoperiod'], ['targetPhotoperiodVf-v', 'targetPhotoperiod']].forEach(pair => {
      const el = $(pair[0]);
      const val = st()[pair[1]];
      if (el && val != null) el.textContent = typeof val === 'number' ? (Number.isInteger(val) ? val : r1(val)) : val;
    });
    syncManualMassUI();
    syncCanopyUI();
  }
  function syncPalletCellButtons(){
    var cells = st().palletCells || 54;
    document.querySelectorAll('.pallet-cell-btn').forEach(function(btn){
      btn.classList.toggle('on', parseInt(btn.dataset.cells, 10) === cells);
    });
    syncPalletPlantsHint();
  }

  function getActivePlantingCvId(){
    if (isPalletView() && allPalletCultivars().length) return st().palletCv || '';
    if (typeof VF_CULTIVARS !== 'undefined' && VF_CULTIVARS.length && st().facility === 'vertical') return st().vfCv || '';
    return st().cv || '';
  }

  function showAsPalletCalc(r){ return isPalletView() || !!(r && r.palletMode); }
  function vegContextLabel(short){
    if (isPalletView()) return short ? ui('ui.veg.pallet') : ui('ui.veg.palletLong');
    if (isVF()) return short ? ui('ui.veg.vf') : ui('ui.veg.vfLong');
    return short ? ui('ui.veg.ch') : ui('ui.veg.chLong');
  }
  function vegContextLabelCap(){
    if (isPalletView()) return ui('ui.veg.palletCap');
    if (isVF()) return ui('ui.veg.vfCap');
    return ui('ui.veg.chCap');
  }
  
  function palletMountMode(){ return st().palletMount === 'lid' ? 'lid' : 'cassette'; }
  function plantsPerPalletCount(){
    const cells = effectivePalletHoleCount();
    return palletMountMode() === 'lid' ? cells : CASSETTES_PER_PALLET * cells;
  }
  function plantsPerPallet(){ return plantsPerPalletCount(); }
  function syncPalletZoneLength(){
    const n = Math.max(1, st().palletsAlong || Math.round(st().length / PALLET_L_M) || 1);
    st().palletsAlong = n;
    st().length = Math.round(n * PALLET_L_M * 10) / 10;
    const v = $('palletsAlong-v'), z = $('pallet-zone-len'), pa = $('palletsAlong');
    if (v) v.textContent = String(n);
    if (z) z.textContent = st().length.toFixed(1).replace('.', ',');
    if (pa && document.activeElement !== pa) pa.value = n;
    const lv = $('length-v');
    if (lv) lv.textContent = st().length.toFixed(1);
    syncPalletTierHint();
  }
  function syncPalletMountButtons(){
    const m = palletMountMode();
    document.querySelectorAll('.pallet-mount-btn').forEach(btn => {
      btn.classList.toggle('on', btn.dataset.mount === m);
    });
    syncPalletMountUI();
  }
  function syncPalletMountUI(){
    const lid = palletMountMode() === 'lid';
    const cellsCtrl = $('ctrl-pallet-cells');
    const lidCtrl = $('ctrl-pallet-lid-holes');
    if (cellsCtrl) cellsCtrl.style.display = lid ? 'none' : '';
    if (lidCtrl) lidCtrl.style.display = lid ? '' : 'none';
    syncPalletPlantsHint();
  }
  function syncPalletTierHint(){
    const tiers = Math.max(1, st().palletTiers || 1);
    const gap = st().tierGapMm || 350;
    const hMm = tiers * gap + PALLET_TIER_ZONE_MM;
    const el = $('pallet-rack-height');
    if (el) el.textContent = String(Math.round(hMm));
    const along = Math.max(1, st().palletsAlong || 1);
    const across = Math.max(1, st().nch || 1);
    const footprint = along * across * PALLET_L_M * PALLET_W_M;
    const useful = footprint * tiers;
    const areaEl = $('pallet-useful-area');
    if (areaEl) areaEl.textContent = r1(useful);
    const footEl = $('pallet-footprint-area');
    if (footEl) footEl.textContent = r1(footprint);
    const tierHint = $('pallet-tier-count-hint');
    if (tierHint) tierHint.textContent = String(tiers);
  }
  function syncPalletPlantsHint(){
    const cv = getPalletCv();
    const trayLot = global.DG_isTrayLotCrop && global.DG_isTrayLotCrop(cv);
    if (trayLot){
      const trayPerPal = global.DG_TRAY_LOT_PER_PALLET || 33;
      const form = $('pallet-plants-formula');
      if (form) form.textContent = ui('ui.pal.formulaTrayLot', { per: trayPerPal });
      const pEl = $('pallet-plants-per');
      if (pEl) pEl.textContent = String(trayPerPal);
      const prefix = $('pallet-plants-prefix');
      if (prefix) prefix.textContent = ui('ui.pal.prefixTray');
      const mid = $('pallet-plants-mid');
      if (mid) mid.textContent = ui('ui.pal.traysSuffix');
      return;
    }
    const cells = effectivePalletHoleCount();
    const per = plantsPerPalletCount();
    const lid = palletMountMode() === 'lid';
    const form = $('pallet-plants-formula');
    if (form) form.textContent = lid ? ui('ui.pal.formulaLid', { cells: cells }) : ui('ui.pal.formulaCas', { cells: cells });
    const pEl = $('pallet-plants-per');
    if (pEl) pEl.textContent = String(per);
    const prefix = $('pallet-plants-prefix');
    if (prefix) prefix.textContent = lid ? ui('ui.pal.prefixLid') : ui('ui.pal.plantsPrefix');
    const mid = $('pallet-plants-mid');
    if (mid) mid.textContent = ui('ui.pal.plantsSuffix');
  }

  function syncTrayLotUI(){
    const cv = getPalletCv();
    const tray = isPalletView() && global.DG_isTrayLotCrop && global.DG_isTrayLotCrop(cv);
    if (typeof document !== 'undefined' && document.documentElement){
      document.documentElement.classList.toggle('tray-lot-active', !!tray);
    }
    if (tray){
      st().nursery = 0;
      st().density = global.DG_TRAY_LOT_DENSITY || 45;
      const nLab = $('nursery-v');
      if (nLab) nLab.textContent = '0';
      const nInp = $('nursery');
      if (nInp) nInp.value = '0';
      const dLab = $('density-v');
      if (dLab) dLab.textContent = String(st().density);
    }
    const flowNote = document.querySelector('#block-grow-time-body .grow-flow-note');
    if (flowNote){
      flowNote.innerHTML = tray ? ui('ui.grow.flowTrayLot') : ui('ui.grow.flowNote');
    }
    const dayLbl = $('ctrl-day') && $('ctrl-day').querySelector('.ctrl-label');
    if (dayLbl){
      const badge = dayLbl.querySelector('.vf-sheet-badge');
      if (tray) dayLbl.textContent = ui('ui.grow.trayHarvestDays');
      else if (isPalletView()) dayLbl.textContent = st().multicut ? ui('vf.day.firstCut') : ui('vf.day.singleCut');
      else if (isVF()) dayLbl.textContent = st().multicut ? ui('vf.day.firstCut') : ui('vf.day.singleCut');
      else dayLbl.textContent = ui('ui.grow.channelDays');
      if (badge) dayLbl.appendChild(badge);
    }
    const sysHint = $('pallet-sys-hint');
    if (sysHint && tray){
      sysHint.innerHTML = ui('ui.pal.sysHintTrayLot', { per: global.DG_TRAY_LOT_PER_PALLET || 33 });
    } else if (sysHint && !tray){
      sysHint.innerHTML = ui('ui.pal.sysHint');
    }
    const mountWrap = $('pallet-mount') && $('pallet-mount').parentElement;
    if (mountWrap) mountWrap.classList.toggle('env-block-hidden', !!tray);
    syncPalletPlantsHint();
  }

  function schemaCanopyMm(r){
    if (!r || !r.cv) return 0;
    if (st().useManualCanopy) return clamp(st().manualCanopy, 20, 600);
    if (r.canopy > 0) return clamp(r.canopy, 20, 600);
    const massBase = r.massAuto != null ? r.massAuto : r.mass;
    const base = modelCanopyFromMass(r.cv, massBase);
    const pct = clamp(st().canopyPct || 100, 100, 130);
    return clamp(base * pct / 100, 20, 600);
  }

  function syncSchemaCanopyLegend(canopyMm){
    const sv = $('schema-canopy-val');
    const val = canopyMm != null ? round(canopyMm) : (sv ? sv.textContent : '—');
    if (sv && canopyMm != null) sv.textContent = val;
    const leg = document.querySelector('.schema-canopy-legend');
    const pct = clamp(st().canopyPct || 100, 100, 130);
    if (leg){
      var manualTag = st().useManualCanopy ? ' <span class="schema-canopy-pct-tag">(' + ui('ui.schema.canopyManual') + ')</span>' : '';
      leg.innerHTML = '<span class="schema-canopy-swatch"></span>' + ui('ui.schema.canopyLegend', { val: val }) +
        manualTag +
        (!st().useManualCanopy && pct !== 100 ? ' <span class="schema-canopy-pct-tag">(' + pct + '%)</span>' : '');
    }
  }
  function cassetteCoordsEven(n, span){
    if (n <= 0) return [];
    if (n === 1) return [span / 2];
    const margin = span * 0.08;
    const step = (span - 2 * margin) / (n - 1);
    const out = [];
    for (let i = 0; i < n; i++) out.push(margin + i * step);
    return out;
  }
  function gridDimsForCount(cellCount, spanL, spanW){
    let best = { cols: 1, rows: cellCount, score: Infinity };
    const marginL = spanL * 0.08, marginW = spanW * 0.08;
    for (let cols = 1; cols <= cellCount; cols++){
      const rows = Math.ceil(cellCount / cols);
      const stepU = cols > 1 ? (spanL - 2 * marginL) / (cols - 1) : spanL;
      const stepV = rows > 1 ? (spanW - 2 * marginW) / (rows - 1) : spanW;
      const score = Math.abs(stepU - stepV);
      if (score < best.score) best = { cols, rows, score };
    }
    return best;
  }
  function cellCentersStaggered(cols, rows, L, W, maxCount){
    const us = cassetteCoordsEven(cols, L);
    const vs = cassetteCoordsEven(rows, W);
    const marginL = L * 0.08;
    const stepU = cols > 1 ? (L - 2 * marginL) / (cols - 1) : 0;
    const stagger = stepU / 2;
    const pts = [];
    vs.forEach((v, ri) => {
      us.forEach(u => {
        if (maxCount != null && pts.length >= maxCount) return;
        let ua = ri % 2 === 1 ? u + stagger : u;
        ua = clamp(ua, marginL, L - marginL);
        pts.push({ u: ua, v });
      });
    });
    return pts;
  }
  function getCellCenters(cellCount, spanL, spanW){
    cellCount = parseInt(cellCount, 10);
    spanL = spanL || CASSETTE_L_MM;
    spanW = spanW || CASSETTE_W_MM;
    if (!cellCount || cellCount < 1) return [];
    if (cellCount === 8){
      const sL = spanL / CASSETTE_L_MM, sW = spanW / CASSETTE_W_MM;
      return [
        { u:80,v:50},{ u:320,v:50},{ u:80,v:550},{ u:320,v:550},
        { u:80,v:300},{ u:320,v:300},{ u:200,v:120},{ u:200,v:480 }
      ].map(p => ({ u: p.u * sL, v: p.v * sW }));
    }
    const g = gridDimsForCount(cellCount, spanL, spanW);
    return cellCentersStaggered(g.cols, g.rows, spanL, spanW, cellCount);
  }
  function getCassetteCellCenters(cellCount){
    return getCellCenters(cellCount, CASSETTE_L_MM, CASSETTE_W_MM);
  }
  function cassetteCellPitch(centers, spanL, spanW){
    let minD = Infinity;
    for (let i = 0; i < centers.length; i++){
      for (let j = i + 1; j < centers.length; j++){
        const d = Math.hypot(centers[i].u - centers[j].u, centers[i].v - centers[j].v);
        if (d > 1 && d < minD) minD = d;
      }
    }
    const area = (spanL || CASSETTE_L_MM) * (spanW || CASSETTE_W_MM);
    return minD < Infinity ? minD : Math.sqrt(area / Math.max(1, centers.length));
  }
  function palletCellGeometry(cells, mount){
    cells = parseInt(cells != null ? cells : effectivePalletHoleCount(), 10);
    mount = mount || palletMountMode();
    const cassettes = mount === 'lid' ? 1 : CASSETTES_PER_PALLET;
    const perPallet = cassettes * cells;
    const cassetteL = mount === 'lid' ? PALLET_L_MM : CASSETTE_L_MM;
    const cassetteW = mount === 'lid' ? PALLET_W_MM : CASSETTE_W_MM;
    const centers = getCellCenters(cells, cassetteL, cassetteW);
    const cellPitch = cassetteCellPitch(centers, cassetteL, cassetteW);
    const cellD = clamp(cellPitch * 0.55, 18, 80);
    return { perPallet, cassettes, cells, cassetteL, cassetteW, cellPitch, cellD, centers };
  }
    return {
      getSnapshotsStore: function(){ return plantingSnapshots; },
      capturePlantingViewSnapshot: capturePlantingViewSnapshot,
      restorePlantingViewSnapshot: restorePlantingViewSnapshot,
      syncPalletCellButtons: syncPalletCellButtons,
      getActivePlantingCvId: getActivePlantingCvId,
      showAsPalletCalc: showAsPalletCalc,
      vegContextLabel: vegContextLabel,
      vegContextLabelCap: vegContextLabelCap,
      palletMountMode: palletMountMode,
      plantsPerPalletCount: plantsPerPalletCount,
      syncPalletZoneLength: syncPalletZoneLength,
      syncPalletMountButtons: syncPalletMountButtons,
      syncPalletMountUI: syncPalletMountUI,
      syncPalletTierHint: syncPalletTierHint,
      syncPalletPlantsHint: syncPalletPlantsHint,
      syncTrayLotUI: syncTrayLotUI,
      schemaCanopyMm: schemaCanopyMm,
      syncSchemaCanopyLegend: syncSchemaCanopyLegend,
      getCellCenters: getCellCenters,
      palletCellGeometry: palletCellGeometry,
      plantsPerPallet: plantsPerPallet
    };
  }

  global.DG_createPlantingPalletRuntime = createPlantingPalletRuntime;
})(typeof window !== 'undefined' ? window : globalThis);
