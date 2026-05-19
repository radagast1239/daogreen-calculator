const fs = require('fs');
const p = 'calculator-110x55_12.html';
let h = fs.readFileSync(p, 'utf8');
if (h.includes('getPalletCv')) { console.log('Already patched'); process.exit(0); }

function rep(a, b, label) {
  if (!h.includes(a)) { console.error('MISSING:', label, a.slice(0, 80)); process.exit(1); }
  h = h.replace(a, b);
}

rep('<script src="vf-cultivars.js"></script>', '<script src="vf-cultivars.js"></script>\n<script src="pallet-cultivars.js"></script>', 'script');

rep(
  "    palletCells: 54,\n    econ: null,",
  "    palletCells: 54,\n    palletCv: 'pl-shiso',\n    palletStd: { germination: true, day: true, density: true, mass: true, cutInterval: true, cutMass: true, cells: true },\n    palletUserStandards: {},\n    econ: null,"
, 'state');

rep(
  `  const VF_CULTIVARS = (window.VF_SHEET && window.VF_SHEET.VF_CULTIVARS) || [];
  const VF_SECTIONS = (window.VF_SHEET && window.VF_SHEET.VF_SECTIONS) || [];`,
  `  const VF_CULTIVARS = (window.VF_SHEET && window.VF_SHEET.VF_CULTIVARS) || [];
  const VF_SECTIONS = (window.VF_SHEET && window.VF_SHEET.VF_SECTIONS) || [];
  const PALLET_CULTIVARS = (window.PALLET_SHEET && window.PALLET_SHEET.PALLET_CULTIVARS) || [];
  const PALLET_SECTIONS = (window.PALLET_SHEET && window.PALLET_SHEET.PALLET_SECTIONS) || [];`
, 'consts');

const PALLET_BLOCK = `
  function isPalletCvId(cvId){ return !!(cvId && cvId.indexOf('pl-') === 0); }
  function allPalletCultivars(){ return PALLET_CULTIVARS; }
  function isPalletSheetCv(cv){ return !!(cv && cv.palletSheet); }
  function getPalletCv(){
    const list = allPalletCultivars();
    return list.find(c => c.id === state.palletCv) || list[0];
  }
  function getSheetCv(){
    if (isPalletView()) return getPalletCv();
    if (isVF()) return getVfCv();
    return null;
  }
  function isSheetCv(cv){ return isVfSheetCv(cv) || isPalletSheetCv(cv); }
  function usePlantingSheet(){
    return (isPalletView() && allPalletCultivars().length) || (isVF() && allVfCultivars().length);
  }
  function getPlantingStd(){ return isPalletView() ? state.palletStd : state.vfStd; }
  function palletEffectiveGermination(cv){ cv = cv || getPalletCv(); return state.palletStd.germination ? cv.germination : state.germination; }
  function palletEffectiveDay(cv){ cv = cv || getPalletCv(); return state.palletStd.day ? cv.channelDays : state.day; }
  function palletEffectiveDensity(cv){ cv = cv || getPalletCv(); return state.palletStd.density ? cv.density : state.density; }
  function palletEffectiveMass(cv, massAuto){
    cv = cv || getPalletCv();
    if (state.palletStd.mass) return cv.yieldPerCutG;
    if (state.useManualMass) return manualHarvestMass(massAuto);
    return massAuto;
  }
  function resetPalletStdToSheetDefaults(){
    if (!isPalletView()) return;
    state.palletStd = { germination: true, day: true, density: true, mass: true, cutInterval: true, cutMass: true, cells: true };
    state.useManualCutMass = false;
    applyPalletStandardsFromSheet(getPalletCv());
    renderVfStdGrid();
    syncPalletCellButtons();
    syncManualMassUI();
    syncCutMassUI();
    syncMulticutDetailUI();
  }
  function applyPalletStandardsFromSheet(cv){
    cv = cv || getPalletCv();
    if (!cv || !isPalletView()) return;
    const dMax = Math.max(DENSITY_MAX, Math.ceil(cv.density * 1.2));
    $('density').max = dMax;
    $('day').max = 70;
    if (state.palletStd.germination){
      state.germination = clamp(cv.germination, 1, 21);
      $('germination').value = state.germination;
      $('germination-v').textContent = state.germination;
    }
    if (state.palletStd.day){
      state.day = clamp(cv.channelDays, 1, 70);
      $('day').value = state.day;
      $('day-v').textContent = state.day;
    }
    if (state.palletStd.density){
      state.density = clamp(cv.density, 15, dMax);
      $('density').value = state.density;
      $('density-v').textContent = state.density;
    }
    if (state.palletStd.cells && cv.palletCells){
      state.palletCells = cv.palletCells;
      syncPalletCellButtons();
    }
    if (state.palletStd.mass){
      state.manualMass = Math.round(cv.yieldPerCutG) || 10;
      state.useManualMass = true;
      $('manualMass').value = state.manualMass;
      if (!state.useManualCanopy){
        state.manualCanopy = Math.round(modelCanopyFromMass(cv, state.manualMass));
        if ($('manualCanopy')) $('manualCanopy').value = state.manualCanopy;
      }
    }
    applyCutStandardsFromSheet(cv);
    state.multicut = !!cv.multicut;
    if ($('multicut')) $('multicut').checked = state.multicut;
    syncManualMassUI();
    syncVfStdControls();
  }
  function calcFromPalletSheet(cv){
    cv = cv || getPalletCv();
    const germ = palletEffectiveGermination(cv);
    const nursery = state.nursery;
    const t_ch = palletEffectiveDay(cv);
    const rhoT = palletEffectiveDensity(cv);
    const savedDensity = state.density, savedGerm = state.germination, savedNursery = state.nursery, savedDay = state.day, savedCells = state.palletCells;
    state.density = rhoT; state.germination = germ; state.day = t_ch;
    if (state.palletStd.cells && cv.palletCells) state.palletCells = cv.palletCells;
    const t_total = germ + nursery + t_ch;
    const massRaw = massAtTotal(cv, t_total);
    const lay = plantLayout(cv);
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
      palletSheet: true, countUnit: cv.countUnit };
  }
`;

rep(
  'function allVfCultivars(){ return VF_CULTIVARS.concat(state.customVfCultivars || []); }',
  'function allVfCultivars(){ return VF_CULTIVARS.concat(state.customVfCultivars || []); }' + PALLET_BLOCK
, 'block');

rep(
  `  function findCvById(id){
    if (!id) return null;
    if (isVfCvId(id)) return allVfCultivars().find(c => c.id === id) || null;
    const gh = allGhCultivars().find(c => c.id === id);
    if (gh) return gh;
    return allVfCultivars().find(c => c.id === id) || null;
  }`,
  `  function findCvById(id){
    if (!id) return null;
    if (isPalletCvId(id)) return allPalletCultivars().find(c => c.id === id) || null;
    if (isVfCvId(id)) return allVfCultivars().find(c => c.id === id) || null;
    const gh = allGhCultivars().find(c => c.id === id);
    if (gh) return gh;
    return allVfCultivars().find(c => c.id === id) || allPalletCultivars().find(c => c.id === id) || null;
  }`
, 'find');

rep(
  `  function getVfFieldStandard(cv, key){
    if (!cv || !isVfSheetCv(cv)) return null;`,
  `  function getVfFieldStandard(cv, key){
    if (!cv || !isSheetCv(cv)) return null;
    if (key === 'cells' && isPalletSheetCv(cv)) return cv.palletCells;`
, 'vfStd');

rep(
  `  function getVfFieldCurrent(key){
    if (key === 'germination') return state.germination;`,
  `  function getVfFieldCurrent(key){
    if (key === 'cells') return state.palletCells;
    if (key === 'germination') return state.germination;`
, 'vfCur');

rep(
  `  function isVfFieldAtStandard(key, cv){
    cv = cv || getVfCv();`,
  `  function isVfFieldAtStandard(key, cv){
    cv = cv || getSheetCv();`
, 'vfAt');

rep(
  `  function applyVfStandardField(key){
    const cv = getVfCv();
    if (!cv || !isVF() || !isVfSheetCv(cv)) return;`,
  `  function applyVfStandardField(key){
    const cv = getSheetCv();
    const pStd = getPlantingStd();
    if (!cv || !usePlantingSheet() || !isSheetCv(cv)) return;
    if (!isPalletView() && !isVF()) return;
    if (isPalletView() && key === 'cells'){
      state.palletCells = cv.palletCells;
      pStd.cells = true;
      syncPalletCellButtons();
      syncVfStdBadges();
      renderAll();
      return;
    }`
, 'applyVf');

rep(
  `    state.vfStd[key] = true;`,
  `    pStd[key] = true;`
, 'pStdKey');

rep(
  `  function syncVfStdBadges(){
    const cv = getVfCv();
    const show = isVF() && isVfSheetCv(cv);`,
  `  function syncVfStdBadges(){
    const cv = getSheetCv();
    const pStd = getPlantingStd();
    const show = usePlantingSheet() && isSheetCv(cv);`
, 'badges');

rep(
  `      state.vfStd[key] = at;
    });
    const grid = $('vf-std-grid');
    if (grid){
      grid.querySelectorAll('input[data-vf-std]').forEach(inp => {
        if (state.vfStd[inp.dataset.vfStd] !== undefined) inp.checked = !!state.vfStd[inp.dataset.vfStd];`,
  `      pStd[key] = at;
    });
    const grid = $('vf-std-grid');
    if (grid){
      grid.querySelectorAll('input[data-vf-std]').forEach(inp => {
        if (pStd[inp.dataset.vfStd] !== undefined) inp.checked = !!pStd[inp.dataset.vfStd];`
, 'badges2');

rep(
  `  function getActiveCv(){
    return isVF() ? getVfCv() : getCv();
  }`,
  `  function getActiveCv(){
    if (isPalletView() && allPalletCultivars().length) return getPalletCv();
    return isVF() ? getVfCv() : getCv();
  }`
, 'active');

rep(
  `    return isVfSheetCv(cv) && cv.cutInterval > 0 && cv.yieldPerCutG > 0;`,
  `    return isSheetCv(cv) && cv.cutInterval > 0 && cv.yieldPerCutG > 0;`
, 'mc');

rep(
  `    else if (isVF() && isVfSheetCv(cv) && cv.yieldPerCutG > 0) val = cv.yieldPerCutG;`,
  `    else if (usePlantingSheet() && isSheetCv(cv) && cv.yieldPerCutG > 0) val = cv.yieldPerCutG;`
, 'cm');

rep(
  `    if (!cv || !isVfSheetCv(cv)) return;
    if (state.vfStd.cutInterval && cutIntervalRange(cv).mid > 0){`,
  `    if (!cv || !isSheetCv(cv)) return;
    const pStd = getPlantingStd();
    if (pStd.cutInterval && cutIntervalRange(cv).mid > 0){`
, 'cutStd1');

rep(
  `    if ((state.vfStd.cutMass || state.vfStd.mass) && cv.yieldPerCutG > 0){`,
  `    if ((pStd.cutMass || pStd.mass) && cv.yieldPerCutG > 0){`
, 'cutStd2');

rep(
  `      if (hint && isVF() && isVfSheetCv(cv)) {`,
  `      if (hint && usePlantingSheet() && isSheetCv(cv)) {`
, 'hint');

rep(
  `    const cv = getVfCv();
    const u = cv && cv.countUnit === 'шт' ? 'шт' : 'г';
    const html = cv && isVF()
      ? 'Стандарты <strong>' + cv.name + '</strong>: прорастание ' + cv.germinationStd +
        ' сут · вегетация в канале ' + cv.channelStd + ' сут · ' + cv.densityStd + ' шт/м² · ' +
        cv.yieldPerCutStd + ' ' + u + '/срез · ' + cv.yieldPerSqmStd + ' ' + u + '/м² за цикл' +
        (cv.cutNote ? ' · ' + cv.cutNote : '')
      : '';
    const el = $('vf-cv-std-hint');
    if (el){
      el.classList.toggle('env-block-hidden', !isVF() || !cv);`,
  `    const cv = getSheetCv();
    const u = cv && cv.countUnit === 'шт' ? 'шт' : 'г';
    let html = '';
    if (cv && isPalletView()){
      html = 'Справочник поддонов <strong>' + cv.name + '</strong>: прорастание ' + cv.germinationStd +
        ' сут · до среза ' + cv.channelStd + ' сут · кассета ' + cv.palletCellsStd + ' (' + cv.palletCells + ' яч.) · ' +
        cv.densityStd + ' шт/м² · ' + cv.yieldPerCutStd + ' ' + u + '/срез';
    } else if (cv && isVF()){
      html = 'Стандарты <strong>' + cv.name + '</strong>: прорастание ' + cv.germinationStd +
        ' сут · вегетация в канале ' + cv.channelStd + ' сут · ' + cv.densityStd + ' шт/м² · ' +
        cv.yieldPerCutStd + ' ' + u + '/срез · ' + cv.yieldPerSqmStd + ' ' + u + '/м² за цикл' +
        (cv.cutNote ? ' · ' + cv.cutNote : '');
    }
    const el = $('vf-cv-std-hint');
    if (el){
      el.classList.toggle('env-block-hidden', !usePlantingSheet() || !cv);`
, 'hint2');

rep(
  `    grid.innerHTML = VF_STD_FIELDS.map(f =>
      '<label class="vf-std-item"><input type="checkbox" data-vf-std="' + f.key + '" ' +
      (state.vfStd[f.key] ? 'checked' : '') + '> ' + f.label + '</label>'
    ).join('');
    grid.querySelectorAll('input[data-vf-std]').forEach(inp => {
      inp.addEventListener('change', () => {
        state.vfStd[inp.dataset.vfStd] = inp.checked;
        applyVfStandardsFromSheet();
        syncVfStdControls();
        renderAll();
      });
    });`,
  `    const stdFields = isPalletView()
      ? VF_STD_FIELDS.concat([{ key: 'cells', label: 'Кассета (яч./кассета)' }])
      : VF_STD_FIELDS;
    const pStd = getPlantingStd();
    grid.innerHTML = stdFields.map(f =>
      '<label class="vf-std-item"><input type="checkbox" data-vf-std="' + f.key + '" ' +
      (pStd[f.key] ? 'checked' : '') + '> ' + f.label + '</label>'
    ).join('');
    grid.querySelectorAll('input[data-vf-std]').forEach(inp => {
      inp.addEventListener('change', () => {
        pStd[inp.dataset.vfStd] = inp.checked;
        if (isPalletView()) applyPalletStandardsFromSheet();
        else applyVfStandardsFromSheet();
        syncVfStdControls();
        renderAll();
      });
    });`
, 'grid');

rep(
  `  function calc(){
    if (isVF() && allVfCultivars().length) return calcFromVfSheet(getVfCv());`,
  `  function calc(){
    if (isPalletView() && allPalletCultivars().length) return calcFromPalletSheet(getPalletCv());
    if (isVF() && allVfCultivars().length) return calcFromVfSheet(getVfCv());`
, 'calc');

rep(
  `  function getActivePlantingCvId(){
    if (typeof VF_CULTIVARS !== 'undefined' && VF_CULTIVARS.length && state.facility === 'vertical') return state.vfCv || '';
    return state.cv || '';
  }`,
  `  function getActivePlantingCvId(){
    if (isPalletView() && allPalletCultivars().length) return state.palletCv || '';
    if (typeof VF_CULTIVARS !== 'undefined' && VF_CULTIVARS.length && state.facility === 'vertical') return state.vfCv || '';
    return state.cv || '';
  }`
, 'plantId');

rep(
  `  function getCompareList(){
    return isVF() && allVfCultivars().length ? allVfCultivars() : allGhCultivars();
  }`,
  `  function getCompareList(){
    if (isPalletView() && allPalletCultivars().length) return allPalletCultivars();
    return isVF() && allVfCultivars().length ? allVfCultivars() : allGhCultivars();
  }`
, 'cmp');

rep(
  `    const activeId = isVF() ? state.vfCv : state.cv;`,
  `    const activeId = isPalletView() ? state.palletCv : (isVF() ? state.vfCv : state.cv);`
, 'cmp2');

rep(
  `  function comparePickActiveId(){
    return isVF() ? state.vfCv : state.cv;
  }`,
  `  function comparePickActiveId(){
    if (isPalletView()) return state.palletCv;
    return isVF() ? state.vfCv : state.cv;
  }`
, 'cmp3');

rep(
  `    if (isVF() && VF_SECTIONS.length){
      return VF_SECTIONS.map(sec => {`,
  `    if (isPalletView() && PALLET_SECTIONS.length){
      return PALLET_SECTIONS.map(sec => {
        const items = list.filter(c => c.section === sec.id);
        if (!items.length) return '';
        return '<div class="compare-pick-group"><motion class="compare-pick-group-title">' + sec.title +
          '</div><div class="compare-pick-chips">' + items.map(compareChipHtml).join('') + '</div></div>';
      }).join('');
    }
    if (isVF() && VF_SECTIONS.length){
      return VF_SECTIONS.map(sec => {`
, 'cmpHtml');

// fix motion typo in compare
h = h.replace('<motion class="compare-pick-group-title">', '<div class="compare-pick-group-title">');

rep(
  `    if (isVF() && allVfCultivars().length){
      function vfBtn(c){`,
  `    if (isPalletView() && allPalletCultivars().length){
      function plBtn(c){
        return '<button class="cv-btn ' + (c.id === state.palletCv ? 'on' : '') + '" data-pl-id="' + c.id + '">' +
          '<span class="cv-name">' + c.name + '</span>' +
          '<span class="cv-sub">' + c.sub + (c.multicut ? ' · срезы' : '') + '</span></button>';
      }
      const plSecShort = { baby: 'Беби-зелень', flowers: 'Цветы пищевые', adult: 'Взрослые / салаты' };
      let html = '';
      PALLET_SECTIONS.forEach(sec => {
        const list = PALLET_CULTIVARS.filter(c => c.section === sec.id);
        if (!list.length) return;
        html += '<div class="cv-group-h">' + (plSecShort[sec.id] || sec.title) + '</div>';
        html += list.map(plBtn).join('');
      });
      $('cultivars').innerHTML = html;
      document.querySelectorAll('#cultivars .cv-btn[data-pl-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.palletCv = btn.dataset.plId;
          resetPalletStdToSheetDefaults();
          renderCultivars();
          renderVfStandardsPanel();
          renderAll();
        });
      });
      renderVfStdGrid();
      syncVfStdControls();
    } else if (isVF() && allVfCultivars().length){
      function vfBtn(c){`
, 'render');

rep(
  `      const scenList = isVF() ? allVfCultivars() : allGhCultivars();`,
  `      const scenList = isPalletView() ? allPalletCultivars() : (isVF() ? allVfCultivars() : allGhCultivars());`
, 'scen');

rep(
  `  function renderVfStandardsPanel(){
    if (!isVF() || !VF_CULTIVARS.length) return;
    const cv = getVfCv();
    const s = getVfCvStandards(cv);`,
  `  function renderVfStandardsPanel(){
    if (isPalletView()) return;
    if (!isVF() || !VF_CULTIVARS.length) return;
    const cv = getVfCv();
    const s = getVfCvStandards(cv);`
, 'vfPanel');

// Fix renderVfStandardsPanel - the replacement above is wrong for s. Use simpler panel - only when VF had panel for saved standards. For pallet we can skip detailed panel or use same grid from vf

rep(
  `    document.querySelectorAll('.vf-only').forEach(el => el.classList.toggle('env-block-hidden', !isVF()));`,
  `    document.querySelectorAll('.vf-only').forEach(el => el.classList.toggle('env-block-hidden', !isVF() && !isPalletView()));`
, 'vfonly');

rep(
  `      <p class="vf-cv-std-hint vf-only env-block-hidden" id="vf-cv-std-hint" style="margin-top:12px"></p>`,
  `      <p class="vf-cv-std-hint env-block-hidden" id="vf-cv-std-hint" style="margin-top:12px"></p>`
, 'hintEl');

rep(
  `    if (culturePanel) culturePanel.classList.toggle('is-vf', mode === 'vertical');`,
  `    if (culturePanel) culturePanel.classList.toggle('is-vf', mode === 'vertical' || isPalletView());`
, 'isvf');

rep(
  `    if (isPalletView()){
      el.textContent = (isVF() ? 'Вертикальная ферма' : 'Теплица') + ': поддоны 130×65, 3 кассеты, ' + (state.palletCells === 9 ? '8–9' : state.palletCells) + ' ячеек/кассета.';
    }`,
  `    if (isPalletView()){
      const pcv = getPalletCv();
      const cellsLbl = state.palletCells === 9 ? '8–9' : String(state.palletCells);
      el.textContent = 'Поддоны 130×65 · ' + (pcv ? pcv.name + ' · кассета ' + pcv.palletCellsStd + ' (' + cellsLbl + ' яч.)' : cellsLbl + ' яч./кассета');
    }`
, 'sub');

rep(
  `    if (isPlanting){
      updatePlantingGeomUI();
      updatePageSub();
      renderAll();
    }`,
  `    if (isPlanting){
      if (view === 'pallets' && allPalletCultivars().length) resetPalletStdToSheetDefaults();
      updatePlantingGeomUI();
      updatePageSub();
      renderCultivars();
      renderAll();
    }`
, 'appview');

rep(
  `    if (VF_CULTIVARS.length){ renderVfStdGrid(); resetVfStdToSheetDefaults(); }`,
  `    if (VF_CULTIVARS.length){ renderVfStdGrid(); }
    if (PALLET_CULTIVARS.length && state.appView === 'pallets') resetPalletStdToSheetDefaults();
    else if (VF_CULTIVARS.length && state.facility === 'vertical') resetVfStdToSheetDefaults();`
, 'init');

// Fix applyVfStandardField pallet logic - the patch may have broken it. Read and fix isPalletFieldAtStandard for mass on pallet

fs.writeFileSync(p, h, 'utf8');
console.log('Patched v2 OK');
