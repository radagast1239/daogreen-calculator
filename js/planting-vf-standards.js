/**
 * VF / каналы: стандарты сорта, бейджи, calcFromVfSheet.
 * DG_createPlantingVfStandards(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  function createPlantingVfStandards(deps) {
    function st() { return deps.getState(); }

    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }
    function densityMax(cv) {
      var C = deps.constants || global.DG_PLANTING_CONSTANTS || {};
      var dMax = C.DENSITY_MAX || 220;
      return Math.max(dMax, Math.ceil(cv.density * 1.2));
    }
    var VF_STD_FIELDS = deps.vfStdFields || global.DG_VF_STD_FIELDS || [];

    function stateRef() { return st(); }
function getVfFieldStandard(cv, key){
  if (!cv || !deps.isSheetCv(cv)) return null;
  if (key === 'cells' && deps.isPalletSheetCv(cv)) return cv.palletCells;
  if (key === 'germination') return cv.germination;
  if (key === 'day') return cv.channelDays;
  if (key === 'density') return cv.density;
  if (key === 'mass' || key === 'cutMass') return cv.yieldPerCutG > 0 ? Math.round(cv.yieldPerCutG) : null;
  if (key === 'cutInterval'){
    const n = deps.vfCutIntervalFromCv(cv);
    return n > 0 ? n : null;
  }
  return null;
}
function getVfFieldCurrent(key){
  if (key === 'cells') return stateRef().palletCells;
  if (key === 'germination') return stateRef().germination;
  if (key === 'day') return stateRef().day;
  if (key === 'density') return stateRef().density;
  if (key === 'mass') return stateRef().manualMass;
  if (key === 'cutInterval') return stateRef().cutInterval;
  if (key === 'cutMass') return stateRef().manualCutMass;
  return null;
}
function isVfFieldAtStandard(key, cv){
  cv = cv || deps.getSheetCv();
  const pStd = deps.getPlantingStd();
  if (!pStd[key]) return false;
  const std = getVfFieldStandard(cv, key);
  if (std == null) return true;
  if (key === 'mass'){
    if (!stateRef().useManualMass) return !!deps.getPlantingStd().mass;
    return Math.round(stateRef().manualMass) === Math.round(std);
  }
  if (key === 'cutMass'){
    if (stateRef().useManualCutMass) return Math.round(stateRef().manualCutMass) === Math.round(std);
    return !stateRef().useManualCutMass;
  }
  return Math.round(getVfFieldCurrent(key)) === Math.round(std);
}
function applyVfStandardField(key){
  const cv = deps.getSheetCv();
  const pStd = deps.getPlantingStd();
  if (!cv || !deps.usePlantingSheet() || !deps.isSheetCv(cv)) return;
  if (!deps.isPalletView() && !deps.isVF()) return;
  if (deps.isPalletView() && key === 'cells'){
    stateRef().palletCells = cv.palletCells;
    pStd.cells = true;
    deps.syncPalletCellButtons();
    syncVfStdBadges();
    deps.renderAll();
    return;
  }
  const std = getVfFieldStandard(cv, key);
  if (std == null) return;
  pStd[key] = true;
  if (key === 'germination'){
    stateRef().germination = deps.clamp(std, 1, 21);
    deps.$('germination').value = stateRef().germination;
    deps.$('germination-v').textContent = stateRef().germination;
  } else if (key === 'day'){
    stateRef().day = deps.clamp(std, 1, 70);
    deps.$('day').value = stateRef().day;
    deps.$('day-v').textContent = stateRef().day;
  } else if (key === 'density'){
    const dMax = densityMax(cv);
    deps.$('density').max = dMax;
    stateRef().density = deps.clamp(std, 15, dMax);
    deps.$('density').value = stateRef().density;
    deps.$('density-v').textContent = stateRef().density;
  } else if (key === 'mass'){
    stateRef().manualMass = std;
    stateRef().useManualMass = true;
    deps.$('manualMass').value = stateRef().manualMass;
    if (!stateRef().useManualCanopy){
      stateRef().manualCanopy = Math.round(deps.modelCanopyFromMass(cv, stateRef().manualMass));
      if (deps.$('manualCanopy')) deps.$('manualCanopy').value = stateRef().manualCanopy;
    }
    deps.syncManualMassUI();
  } else if (key === 'cutInterval'){
    stateRef().cutInterval = deps.cutIntervalRange(cv).mid;
    deps.syncCutIntervalSlider(cv);
  } else if (key === 'cutMass'){
    stateRef().useManualCutMass = false;
    stateRef().manualCutMass = std;
    deps.syncCutMassUI();
  }
  syncVfStdBadges();
  renderVfStdGrid();
  deps.renderAll();
}
function syncVegPeriodTotal(){
  const el = deps.$('veg-period-total');
  if (!el) return;
  var gm = georgyModeRef();
  if (gm && gm.isGeorgyGh()){
    el.textContent = deps.ui('georgy.vegTotal', { day: stateRef().day, dUnit: deps.pt('unit.days') });
    return;
  }
  const sum = stateRef().nursery + stateRef().day;
  el.textContent = deps.ui('ui.veg.periodTotal', { nursery: stateRef().nursery, day: stateRef().day, sum: sum, dUnit: deps.pt('unit.days') });
}
function syncVfStdBadges(){
  const cv = deps.getSheetCv();
  const pStd = deps.getPlantingStd();
  const show = deps.usePlantingSheet() && deps.isSheetCv(cv);
  document.querySelectorAll('.vf-sheet-badge[data-vf-field]').forEach(btn => {
    const key = btn.dataset.vfField;
    if (!show || getVfFieldStandard(cv, key) == null){
      btn.classList.add('env-block-hidden');
      return;
    }
    if (key === 'mass' && deps.$('manual-mass-block') && deps.$('manual-mass-block').classList.contains('env-block-hidden')){
      btn.classList.add('env-block-hidden');
      return;
    }
    btn.classList.remove('env-block-hidden');
    const at = isVfFieldAtStandard(key, cv);
    btn.classList.toggle('at-standard', at);
    btn.classList.toggle('off-standard', !at);
    btn.disabled = at;
    btn.title = at ? deps.ui('ui.badge.atStd') : deps.ui('ui.badge.toStd');
  });
  const grid = deps.$('vf-std-grid');
  if (grid){
    grid.querySelectorAll('input[data-vf-std]').forEach(inp => {
      if (pStd[inp.dataset.vfStd] !== undefined) inp.checked = !!pStd[inp.dataset.vfStd];
    });
  }
  syncVegPeriodTotal();
  const locksTitle = document.querySelector('.vf-std-locks-title');
  if (locksTitle) locksTitle.textContent = deps.isPalletView() ? deps.ui('ui.vf.stdLocksPal') : deps.ui('ui.vf.stdLocksVf');
  const auditIntro = deps.$('vf-audit-standards-intro');
  if (auditIntro){
    const showIntro = (deps.isVF() || deps.isPalletView()) && deps.usePlantingSheet();
    auditIntro.classList.toggle('env-block-hidden', !showIntro);
    if (showIntro) auditIntro.innerHTML = deps.ui('standards.introHtml');
  }
}
function bindVfStdBadges(){
  document.querySelectorAll('.vf-sheet-badge[data-vf-field]').forEach(btn => {
    if (btn.dataset.badgeBound) return;
    btn.dataset.badgeBound = '1';
    btn.addEventListener('click', () => {
      if (btn.disabled || btn.classList.contains('at-standard')) return;
      applyVfStandardField(btn.dataset.vfField);
    });
  });
}

function isVfSheetCv(cv){
  return !!(cv && cv.vfSheet);
}

function preChannelDays(){
  var gm = georgyModeRef();
  if (gm && gm.isGeorgyGh()) return gm.preChannelDaysGeorgy();
  return stateRef().germination + stateRef().nursery;
}
function vfEffectiveGermination(cv){
  cv = cv || deps.getVfCv();
  return stateRef().vfStd.germination ? cv.germination : stateRef().germination;
}
function vfEffectiveDay(cv){
  cv = cv || deps.getVfCv();
  return stateRef().vfStd.day ? cv.channelDays : stateRef().day;
}
function vfEffectiveDensity(cv){
  cv = cv || deps.getVfCv();
  return stateRef().vfStd.density ? cv.density : stateRef().density;
}
function vfEffectiveMass(cv, massAuto){
  cv = cv || deps.getVfCv();
  if (stateRef().vfStd.mass) return cv.yieldPerCutG;
  if (stateRef().useManualMass) return deps.manualHarvestMass(massAuto);
  return massAuto;
}

function syncCutMassUI(){
  const chk = deps.$('useManualCutMass');
  if (chk) chk.checked = !!stateRef().useManualCutMass;
  const block = deps.$('manual-cut-mass-block');
  if (block) block.classList.toggle('env-block-hidden', !stateRef().useManualCutMass);
  const inp = deps.$('manualCutMass');
  if (inp && document.activeElement !== inp) inp.value = stateRef().manualCutMass;
  const vv = deps.$('manualCutMass-v');
  if (vv) vv.textContent = stateRef().manualCutMass;
  const cv = deps.getActiveCv();
  const u = cv && cv.countUnit === 'шт' ? deps.pm('u.pcs') : deps.pm('unit.g');
  const unitEl = deps.$('manualCutMass-unit');
  if (unitEl) unitEl.textContent = u;
  const yhint = deps.$('vf-yield-std-hint');
  if (yhint){
    const showY = deps.usePlantingSheet() && cv && deps.isSheetCv(cv) && stateRef().useManualCutMass;
    yhint.classList.toggle('env-block-hidden', !showY);
    if (showY){
      const rule = deps.isPalletView() ? deps.ui('standards.yieldRulePallets') : deps.ui('standards.yieldRuleChannels');
      yhint.textContent = deps.ui('standards.yieldHint', {
        std: Math.round(cv.yieldPerCutG),
        unit: u,
        raw: cv.yieldPerCutStd,
        rule: rule
      });
    }
  }
}
function syncMulticutDetailUI(){
  const detail = deps.$('multicut-detail');
  if (detail) detail.classList.toggle('env-block-hidden', !stateRef().multicut);
  const cv = deps.getActiveCv();
  if (cv && deps.supportsMulticut(cv)) deps.syncCutIntervalSlider(cv);
  if (cv && (cv.cutInterval > 0 || cv.cutNote)) {
    const hint = deps.$('multicut-sheet-hint');
    if (hint && deps.usePlantingSheet() && deps.isSheetCv(cv)) {
      hint.classList.remove('env-block-hidden');
      const u = cv.countUnit === 'шт' ? deps.pm('u.pcs') : deps.pm('unit.g');
      const ms = deps.vfMulticutStats(cv);
      hint.innerHTML = deps.ui('ui.mc.sheetHint', {
        interval: cv.cutIntervalStd || cv.cutNote || cv.cutInterval,
        yield: cv.yieldPerCutStd, unit: u, perCut: deps.ui('ui.cv.perCut'),
        note: cv.cutNote ? ' · ' + deps.catalogPhrase(cv.cutNote) : ''
      }) + ((deps.isVF() || deps.isPalletView()) ? deps.ui('ui.mc.sheetStats', {
        cpm: deps.r1(ms.cutsPerMonth), cycle: ms.cutsInCycle, months: deps.r1(ms.monthsToReplace)
      }) : '');
    }
  }
}
function applyCutStandardsFromSheet(cv){
  cv = cv || deps.getActiveCv();
  if (!cv || !deps.isSheetCv(cv)) return;
  const pStd = deps.getPlantingStd();
  if (pStd.cutInterval && deps.cutIntervalRange(cv).mid > 0){
    stateRef().cutInterval = deps.cutIntervalRange(cv).mid;
    deps.syncCutIntervalSlider(cv);
  }
  if ((pStd.cutMass || pStd.mass) && cv.yieldPerCutG > 0){
    stateRef().manualCutMass = Math.round(cv.yieldPerCutG) || 1;
    stateRef().useManualCutMass = false;
    deps.syncCutMassUI();
  }
}

function syncVfStdControls(){
  updateVfCvHint();
  syncMulticutDetailUI();
  syncVfStdBadges();
}

function updateVfCvHint(){
  const cv = deps.getSheetCv();
  const unit = cv && cv.countUnit === 'шт' ? deps.pm('u.pcs') : deps.pm('unit.g');
  const dUnit = deps.pm('unit.days');
  const pcsSqm = deps.pm('u.pcsSqm');
  const perCut = deps.ui('ui.cv.perCut');
  let html = '';
  if (cv && deps.isPalletView()){
    html = deps.ui('ui.vf.hintPal', {
      name: cv.name, germ: cv.germinationStd, chStd: cv.channelStd, dUnit: dUnit,
      cellsStd: cv.palletCellsStd, cells: cv.palletCells, cellsUnit: deps.ui('ui.sub.cellsUnit'),
      density: cv.densityStd, pcsSqm: pcsSqm, yield: cv.yieldPerCutStd, unit: unit
    });
  } else if (cv && deps.isVF()){
    html = deps.ui('ui.vf.hintVf', {
      name: cv.name, germ: cv.germinationStd, chStd: cv.channelStd, dUnit: dUnit,
      density: cv.densityStd, pcsSqm: pcsSqm, yield: cv.yieldPerCutStd, unit: unit,
      note: cv.cutNote ? ' · ' + deps.catalogPhrase(cv.cutNote) : ''
    });
  }
  const el = deps.$('vf-cv-std-hint');
  if (el){
    el.classList.toggle('env-block-hidden', !deps.usePlantingSheet() || !cv);
    el.innerHTML = html;
  }
  const nameEl = deps.$('vf-std-cv-name');
  if (nameEl) nameEl.textContent = cv ? cv.name : '—';
}

function renderVfStdGrid(){
  const grid = deps.$('vf-std-grid');
  if (!grid) return;
  const stdFields = deps.isPalletView()
    ? VF_STD_FIELDS.concat([{ key: 'cells', labelKey: 'cells' }])
    : VF_STD_FIELDS;
  const sig = stdFields.map(f => f.key).join(',');
  const pStd = deps.getPlantingStd();
  if (grid.dataset.stdSig !== sig){
    grid.dataset.stdSig = sig;
    grid.innerHTML = stdFields.map(f =>
      '<label class="vf-std-item"><input type="checkbox" data-vf-std="' + f.key + '" ' +
      (pStd[f.key] ? 'checked' : '') + '> ' + deps.ui('vf.std.' + (f.labelKey || f.key)) + '</label>'
    ).join('');
  } else {
    grid.querySelectorAll('input[data-vf-std]').forEach(inp => {
      if (pStd[inp.dataset.vfStd] !== undefined) inp.checked = !!pStd[inp.dataset.vfStd];
    });
  }
  if (!grid.dataset.stdBound){
    grid.dataset.stdBound = '1';
    grid.addEventListener('change', e => {
      const inp = e.target;
      if (!inp.matches || !inp.matches('input[data-vf-std]')) return;
      const std = deps.getPlantingStd();
      std[inp.dataset.vfStd] = inp.checked;
      if (deps.isPalletView()) deps.applyPalletStandardsFromSheet();
      else applyVfStandardsFromSheet();
      syncVfStdControls();
      deps.renderAll();
    });
  }
}

function resetVfStdToSheetDefaults(){
  if (!deps.isVF()) return;
  stateRef().vfStd = {
    germination: true,
    day: true,
    density: true,
    mass: true,
    cutInterval: true,
    cutMass: true
  };
  stateRef().useManualCutMass = false;
  applyVfStandardsFromSheet(deps.getVfCv());
  renderVfStdGrid();
  deps.syncManualMassUI();
  deps.syncCutMassUI();
  syncMulticutDetailUI();
}

function applyVfStandardsFromSheet(cv){
  cv = cv || deps.getVfCv();
  if (!cv || !deps.isVF()) return;
  const dMax = densityMax(cv);
  deps.$('density').max = dMax;
  deps.$('day').max = 70;
  deps.$('nursery').min = 7;
  deps.$('nursery').max = 28;
  if (stateRef().vfStd.germination){
    stateRef().germination = deps.clamp(cv.germination, 1, 21);
    deps.$('germination').value = stateRef().germination;
    deps.$('germination-v').textContent = stateRef().germination;
  }
  if (stateRef().vfStd.day){
    stateRef().day = deps.clamp(cv.channelDays, 1, 70);
    deps.$('day').value = stateRef().day;
    deps.$('day-v').textContent = stateRef().day;
  }
  if (stateRef().vfStd.density){
    stateRef().density = deps.clamp(cv.density, 15, dMax);
    deps.$('density').value = stateRef().density;
    deps.$('density-v').textContent = stateRef().density;
  }
  if (stateRef().vfStd.mass){
    stateRef().manualMass = Math.round(cv.yieldPerCutG) || 10;
    stateRef().useManualMass = true;
    deps.$('manualMass').value = stateRef().manualMass;
    if (!stateRef().useManualCanopy){
      stateRef().manualCanopy = Math.round(deps.modelCanopyFromMass(cv, stateRef().manualMass));
      if (deps.$('manualCanopy')) deps.$('manualCanopy').value = stateRef().manualCanopy;
    }
  }
  applyCutStandardsFromSheet(cv);
  stateRef().multicut = !!cv.multicut;
  deps.$('multicut').checked = stateRef().multicut;
  deps.syncManualMassUI();
  syncVfStdControls();
}

function calcFromVfSheet(cv){
    var state = st();
  cv = cv || deps.getVfCv();
  const germ = vfEffectiveGermination(cv);
  const nursery = state.nursery;
  const t_ch = vfEffectiveDay(cv);
  const rhoT = vfEffectiveDensity(cv);
  const savedDensity = state.density;
  const savedGerm = state.germination;
  const savedNursery = state.nursery;
  const savedDay = state.day;
  state.density = rhoT;
  state.germination = germ;
  state.day = t_ch;

  const t_total = germ + nursery + t_ch;
  const massRaw = deps.massAtTotal(cv, t_total);
  const lay = deps.plantLayout(cv);
  const { a, b, offMm, diag, nearest, rhoA, perChan, perRow, total, sysWmm, sysArea, constrained, vfMode } = lay;

  const canopyAtMax = deps.effectiveCa(cv) * Math.sqrt(cv.M_max);
  const crowdF = deps.crowdingFactor(canopyAtMax, nearest);
  const massAuto = massRaw * crowdF;
  let mass = vfEffectiveMass(cv, massAuto);
  let canopy = deps.harvestCanopy(cv, mass);
  const intervalMod = deps.applyCutIntervalHarvestMods(cv, mass, canopy);
  mass = intervalMod.mass;
  canopy = intervalMod.canopy;
  const rgrMass = deps.rgrAtTotal(cv, t_total) * 100;
  const rgrCanopy = rgrMass / 2;
  const tHarvestCh = cv.channelDays;
  const tBoltCh = deps.boltChannel(cv);
  const stage = deps.stageOf(t_ch, mass, tBoltCh, cv);

  const edgeGap = nearest - deps.holeDiameter(cv);
  const leafGap = nearest - canopy;
  const widthExceeds = sysWmm > deps.MAX_WIDTH;
  const widthClose = !widthExceeds && sysWmm > deps.MAX_WIDTH - 200;
  const maxChannelsFit = Math.max(2, Math.floor((deps.MAX_WIDTH - deps.CH_W) / b) + 1);

  const totalCycleDays = germ + nursery + Math.round(tHarvestCh);
  const cyclesPerYear = totalCycleDays > 0 ? 365 / totalCycleDays : 0;
  const yieldPerSqmCycle = mass * rhoA / 1000;
  const yieldPerCycleKg = mass * total / 1000;
  const yieldPerSqmYear = yieldPerSqmCycle * cyclesPerYear;

  state.density = savedDensity;
  state.germination = savedGerm;
  state.nursery = savedNursery;
  state.day = savedDay;

  return { cv, t_ch, t_total, mass, massAuto, canopy, massRaw, canopyRaw: canopy, crowdF,
           rgrMass, rgrCanopy, tHarvestCh, tBoltCh, st: stage,
           a, b, diag, nearest, edgeGap, offMm, constrained,
           rhoT, rhoA, leafGap,
           perChan, perRow, total, sysWmm, sysArea, vfMode,
           widthExceeds, widthClose, maxChannelsFit,
           totalCycleDays, cyclesPerYear, yieldPerCycleKg, yieldPerSqmCycle, yieldPerSqmYear,
           vfSheet: true, countUnit: cv.countUnit };
}
    return {
      getVfFieldStandard: getVfFieldStandard,
      getVfFieldCurrent: getVfFieldCurrent,
      isVfFieldAtStandard: isVfFieldAtStandard,
      applyVfStandardField: applyVfStandardField,
      syncVegPeriodTotal: syncVegPeriodTotal,
      syncVfStdBadges: syncVfStdBadges,
      bindVfStdBadges: bindVfStdBadges,
      isVfSheetCv: isVfSheetCv,
      preChannelDays: preChannelDays,
      vfEffectiveGermination: vfEffectiveGermination,
      vfEffectiveDay: vfEffectiveDay,
      vfEffectiveDensity: vfEffectiveDensity,
      vfEffectiveMass: vfEffectiveMass,
      syncCutMassUI: syncCutMassUI,
      syncMulticutDetailUI: syncMulticutDetailUI,
      applyCutStandardsFromSheet: applyCutStandardsFromSheet,
      syncVfStdControls: syncVfStdControls,
      updateVfCvHint: updateVfCvHint,
      renderVfStdGrid: renderVfStdGrid,
      resetVfStdToSheetDefaults: resetVfStdToSheetDefaults,
      applyVfStandardsFromSheet: applyVfStandardsFromSheet,
      calcFromVfSheet: calcFromVfSheet
    };
  }

  global.DG_createPlantingVfStandards = createPlantingVfStandards;
})(typeof window !== 'undefined' ? window : globalThis);
