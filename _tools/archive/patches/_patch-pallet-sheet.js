const fs = require('fs');
const p = 'calculator-110x55_12.html';
let h = fs.readFileSync(p, 'utf8');

function rep(a, b, label) {
  if (!h.includes(a)) { console.error('MISSING:', label); process.exit(1); }
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
, 'destructure');

rep(
  'function allVfCultivars(){ return VF_CULTIVARS.concat(state.customVfCultivars || []); }',
  `function allVfCultivars(){ return VF_CULTIVARS.concat(state.customVfCultivars || []); }
  function isPalletCvId(cvId){ return !!(cvId && cvId.indexOf('pl-') === 0); }
  function allPalletCultivars(){ return PALLET_CULTIVARS; }
  function isPalletSheetCv(cv){ return !!(cv && cv.palletSheet); }`
, 'allPallet');

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
, 'findCv');

rep(
  `  function getVfCv(){
    const list = allVfCultivars();
    return list.find(c => c.id === state.vfCv) || list[0];
  }
  function getActiveCv(){
    return isVF() ? getVfCv() : getCv();
  }`,
  `  function getVfCv(){
    const list = allVfCultivars();
    return list.find(c => c.id === state.vfCv) || list[0];
  }
  function getPalletCv(){
    const list = allPalletCultivars();
    return list.find(c => c.id === state.palletCv) || list[0];
  }
  function getSheetCv(){
    if (isPalletView()) return getPalletCv();
    if (isVF()) return getVfCv();
    return null;
  }
  function isSheetCv(cv){
    return isVfSheetCv(cv) || isPalletSheetCv(cv);
  }
  function usePlantingSheet(){
    return (isPalletView() && allPalletCultivars().length) || (isVF() && allVfCultivars().length);
  }
  function getActiveCv(){
    if (isPalletView() && allPalletCultivars().length) return getPalletCv();
    return isVF() ? getVfCv() : getCv();
  }`
, 'getActiveCv');

rep(
  `  function isVfSheetCv(cv){
    return !!(cv && cv.vfSheet);
  }`,
  `  function isVfSheetCv(cv){
    return !!(cv && cv.vfSheet);
  }
  function getPlantingStd(){
    return isPalletView() ? state.palletStd : state.vfStd;
  }
  function palletEffectiveGermination(cv){
    cv = cv || getPalletCv();
    return state.palletStd.germination ? cv.germination : state.germination;
  }
  function palletEffectiveDay(cv){
    cv = cv || getPalletCv();
    return state.palletStd.day ? cv.channelDays : state.day;
  }
  function palletEffectiveDensity(cv){
    cv = cv || getPalletCv();
    return state.palletStd.density ? cv.density : state.density;
  }
  function palletEffectiveMass(cv, massAuto){
    cv = cv || getPalletCv();
    if (state.palletStd.mass) return cv.yieldPerCutG;
    if (state.useManualMass) return manualHarvestMass(massAuto);
    return massAuto;
  }`
, 'palletEff');

rep(
  `  function supportsMulticut(cv){
    cv = cv || getActiveCv();
    if (!cv) return false;
    if (cv.multicut) return true;
    return isVfSheetCv(cv) && cv.cutInterval > 0 && cv.yieldPerCutG > 0;
  }`,
  `  function supportsMulticut(cv){
    cv = cv || getActiveCv();
    if (!cv) return false;
    if (cv.multicut) return true;
    return isSheetCv(cv) && cv.cutInterval > 0 && cv.yieldPerCutG > 0;
  }`
, 'multicut');

rep(
  `    else if (isVF() && isVfSheetCv(cv) && cv.yieldPerCutG > 0) val = cv.yieldPerCutG;`,
  `    else if (usePlantingSheet() && isSheetCv(cv) && cv.yieldPerCutG > 0) val = cv.yieldPerCutG;`
, 'cutMass');

rep(
  `      if (hint && isVF() && isVfSheetCv(cv)) {`,
  `      if (hint && usePlantingSheet() && isSheetCv(cv)) {`
, 'hint');

rep(
  `  function applyCutStandardsFromSheet(cv){
    cv = cv || getActiveCv();
    if (!cv || !isVfSheetCv(cv)) return;
    if (state.vfStd.cutInterval && cutIntervalRange(cv).mid > 0){`,
  `  function applyCutStandardsFromSheet(cv){
    cv = cv || getActiveCv();
    if (!cv || !isSheetCv(cv)) return;
    const pStd = getPlantingStd();
    if (pStd.cutInterval && cutIntervalRange(cv).mid > 0){`
, 'applyCut1');

rep(
  `    if ((state.vfStd.cutMass || state.vfStd.mass) && cv.yieldPerCutG > 0){`,
  `    if ((pStd.cutMass || pStd.mass) && cv.yieldPerCutG > 0){`
, 'applyCut2');

rep(
  `  function updateVfCvHint(){
    const cv = getVfCv();
    const u = cv && cv.countUnit === 'шт' ? 'шт' : 'г';
    const html = cv && isVF()
      ? 'Стандарты <strong>' + cv.name + '</strong>: прорастание ' + cv.germinationStd +
        ' сут · вегетация в канале ' + cv.channelStd + ' сут · ' + cv.densityStd + ' шт/м² · ' +
        cv.yieldPerCutStd + ' ' + u + '/срез · ' + cv.yieldPerSqmStd + ' ' + u + '/м² за цикл' +
        (cv.cutNote ? ' · ' + cv.cutNote : '')
      : '';
    const el = $('vf-cv-std-hint');
    if (el){
      el.classList.toggle('env-block-hidden', !isVF() || !cv);
      el.innerHTML = html;
    }
    const nameEl = $('vf-std-cv-name');
    if (nameEl) nameEl.textContent = cv ? cv.name : '—';
  }`,
  `  function updateVfCvHint(){
    const cv = getSheetCv();
    const u = cv && cv.countUnit === 'шт' ? 'шт' : 'г';
    let html = '';
    if (cv && isPalletView()){
      html = 'Справочник поддонов <strong>' + cv.name + '</strong>: прорастание ' + cv.germinationStd +
        ' сут · до среза ' + cv.channelStd + ' сут · кассета ' + cv.palletCellsStd + ' яч. (' + cv.palletCells + ') · ' +
        cv.densityStd + ' шт/м² · ' + cv.yieldPerCutStd + ' ' + u + '/срез · ' + cv.yieldPerSqmStd + ' ' + u + '/м²';
    } else if (cv && isVF()){
      html = 'Стандарты <strong>' + cv.name + '</strong>: прорастание ' + cv.germinationStd +
        ' сут · вегетация в канале ' + cv.channelStd + ' сут · ' + cv.densityStd + ' шт/м² · ' +
        cv.yieldPerCutStd + ' ' + u + '/срез · ' + cv.yieldPerSqmStd + ' ' + u + '/м² за цикл' +
        (cv.cutNote ? ' · ' + cv.cutNote : '');
    }
    const el = $('vf-cv-std-hint');
    if (el){
      el.classList.toggle('env-block-hidden', !usePlantingSheet() || !cv);
      el.classList.toggle('vf-only', !isPalletView());
      el.innerHTML = html;
    }
    const nameEl = $('vf-std-cv-name');
    if (nameEl) nameEl.textContent = cv ? cv.name : '—';
  }`
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
, 'stdGrid');

rep(
  `  function resetVfStdToSheetDefaults(){
    if (!isVF()) return;
    state.vfStd = {
      germination: true,
      day: true,
      density: true,
      mass: true,
      cutInterval: true,
      cutMass: true
    };
    state.useManualCutMass = false;
    applyVfStandardsFromSheet(getVfCv());
    renderVfStdGrid();
    syncManualMassUI();
    syncCutMassUI();
    syncMulticutDetailUI();
  }`,
  `  function resetVfStdToSheetDefaults(){
    if (!isVF()) return;
    state.vfStd = {
      germination: true, day: true, density: true, mass: true, cutInterval: true, cutMass: true
    };
    state.useManualCutMass = false;
    applyVfStandardsFromSheet(getVfCv());
    renderVfStdGrid();
    syncManualMassUI();
    syncCutMassUI();
    syncMulticutDetailUI();
  }
  function resetPalletStdToSheetDefaults(){
    if (!isPalletView()) return;
    state.palletStd = {
      germination: true, day: true, density: true, mass: true, cutInterval: true, cutMass: true, cells: true
    };
    state.useManualCutMass = false;
    applyPalletStandardsFromSheet(getPalletCv());
    renderVfStdGrid();
    syncPalletCellButtons();
    syncManualMassUI();
    syncCutMassUI();
    syncMulticutDetailUI();
  }`
, 'resetPallet');

rep(
  `  function applyVfStandardsFromSheet(cv){
    cv = cv || getVfCv();
    if (!cv || !isVF()) return;`,
  `  function applyPalletStandardsFromSheet(cv){
    cv = cv || getPalletCv();
    if (!cv || !isPalletView()) return;
    const dMax = Math.max(DENSITY_MAX, Math.ceil(cv.density * 1.2));
    $('density').max = dMax;
    $('day').max = 70;
    $('nursery').min = 7;
    $('nursery').max = 28;
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
    $('multicut').checked = state.multicut;
    syncManualMassUI();
    syncVfStdControls();
  }

  function applyVfStandardsFromSheet(cv){
    cv = cv || getVfCv();
    if (!cv || !isVF()) return;`
, 'applyPallet');

rep(
  `             vfSheet: true, countUnit: cv.countUnit };
  }

  function useTwoRowsInChannel(){`,
  `             vfSheet: true, countUnit: cv.countUnit };
  }

  function calcFromPalletSheet(cv){
    cv = cv || getPalletCv();
    const germ = palletEffectiveGermination(cv);
    const nursery = state.nursery;
    const t_ch = palletEffectiveDay(cv);
    const rhoT = palletEffectiveDensity(cv);
    const savedDensity = state.density;
    const savedGerm = state.germination;
    const savedNursery = state.nursery;
    const savedDay = state.day;
  const savedCells = state.palletCells;
    state.density = rhoT;
    state.germination = germ;
    state.day = t_ch;
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
    mass = intervalMod.mass;
    canopy = intervalMod.canopy;
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

    state.density = savedDensity;
    state.germination = savedGerm;
    state.nursery = savedNursery;
    state.day = savedDay;
    state.palletCells = savedCells;

    return { cv, t_ch, t_total, mass, massAuto, canopy, massRaw, canopyRaw: canopy, crowdF,
             rgrMass, rgrCanopy, tHarvestCh, tBoltCh, st,
             a, b, diag, nearest, edgeGap, offMm, constrained,
             rhoT, rhoA, leafGap,
             perChan, perRow, total, sysWmm, sysArea, vfMode,
             widthExceeds, widthClose, maxChannelsFit,
             totalCycleDays, cyclesPerYear, yieldPerCycleKg, yieldPerSqmCycle, yieldPerSqmYear,
             palletSheet: true, countUnit: cv.countUnit };
  }

  function useTwoRowsInChannel(){`
, 'calcPallet');

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
, 'plantingId');

rep(
  `  function syncVfStdBadges(){
    const cv = getVfCv();
    const show = isVF() && isVfSheetCv(cv);`,
  `  function syncVfStdBadges(){
    const cv = getSheetCv();
    const show = usePlantingSheet() && isSheetCv(cv);
    const pStd = getPlantingStd();`
, 'badges1');

rep(
  `      const at = isVfFieldAtStandard(key, cv);
      btn.classList.toggle('at-standard', at);
      btn.classList.toggle('off-standard', !at);
      btn.disabled = at;
      btn.title = at ? 'Соответствует справочнику' : 'Привести к стандарту из справочника';
      state.vfStd[key] = at;`,
  `      const at = isPalletView() ? isPalletFieldAtStandard(key, cv) : isVfFieldAtStandard(key, cv);
      btn.classList.toggle('at-standard', at);
      btn.classList.toggle('off-standard', !at);
      btn.disabled = at;
      btn.title = at ? 'Соответствует справочнику' : 'Привести к стандарту из справочника';
      pStd[key] = at;`
, 'badges2');

rep(
  `        if (state.vfStd[inp.dataset.vfStd] !== undefined) inp.checked = !!state.vfStd[inp.dataset.vfStd];`,
  `        if (pStd[inp.dataset.vfStd] !== undefined) inp.checked = !!pStd[inp.dataset.vfStd];`
, 'badges3');

rep(
  `  function applyVfStandardField(key){
    const cv = getVfCv();
    if (!cv || !isVF()) return;`,
  `  function isPalletFieldAtStandard(key, cv){
    cv = cv || getPalletCv();
    if (!cv || !isPalletSheetCv(cv)) return true;
    if (key === 'germination') return state.germination === cv.germination;
    if (key === 'day') return state.day === cv.channelDays;
    if (key === 'density') return state.density === cv.density;
    if (key === 'cells') return state.palletCells === cv.palletCells;
    if (key === 'mass') return state.useManualMass && Math.round(state.manualMass) === Math.round(cv.yieldPerCutG);
    if (key === 'cutInterval') return state.cutInterval === cutIntervalRange(cv).mid;
    if (key === 'cutMass') return !state.useManualCutMass && Math.round(state.manualCutMass) === Math.round(cv.yieldPerCutG);
    return true;
  }
  function applyPalletStandardField(key){
    const cv = getPalletCv();
    if (!cv || !isPalletView()) return;
    const std = getVfFieldStandard(cv, key);
    if (std == null && key !== 'cells') return;
    if (key === 'germination'){
      state.germination = clamp(cv.germination, 1, 21);
      $('germination').value = state.germination;
      $('germination-v').textContent = state.germination;
    } else if (key === 'day'){
      state.day = clamp(cv.channelDays, 1, 70);
      $('day').value = state.day;
      $('day-v').textContent = state.day;
    } else if (key === 'density'){
      const dMax = Math.max(DENSITY_MAX, Math.ceil(cv.density * 1.2));
      $('density').max = dMax;
      state.density = clamp(cv.density, 15, dMax);
      $('density').value = state.density;
      $('density-v').textContent = state.density;
    } else if (key === 'cells'){
      state.palletCells = cv.palletCells;
      syncPalletCellButtons();
    } else if (key === 'mass'){
      state.manualMass = Math.round(cv.yieldPerCutG) || 10;
      state.useManualMass = true;
      $('manualMass').value = state.manualMass;
      if (!state.useManualCanopy){
        state.manualCanopy = Math.round(modelCanopyFromMass(cv, state.manualMass));
        if ($('manualCanopy')) $('manualCanopy').value = state.manualCanopy;
      }
      syncManualMassUI();
    } else if (key === 'cutInterval'){
      state.cutInterval = cutIntervalRange(cv).mid;
      syncCutIntervalSlider(cv);
    } else if (key === 'cutMass'){
      state.useManualCutMass = false;
      state.manualCutMass = Math.round(cv.yieldPerCutG) || 1;
      syncCutMassUI();
    }
    syncVfStdBadges();
    renderVfStdGrid();
    renderAll();
  }
  function applyVfStandardField(key){
    if (isPalletView()){ applyPalletStandardField(key); return; }
    const cv = getVfCv();
    if (!cv || !isVF()) return;`
, 'palletField');

rep(
  `  function getCompareList(){
    return isVF() && allVfCultivars().length ? allVfCultivars() : allGhCultivars();
  }`,
  `  function getCompareList(){
    if (isPalletView() && allPalletCultivars().length) return allPalletCultivars();
    return isVF() && allVfCultivars().length ? allVfCultivars() : allGhCultivars();
  }`
, 'compare');

rep(
  `    const activeId = isVF() ? state.vfCv : state.cv;`,
  `    const activeId = isPalletView() ? state.palletCv : (isVF() ? state.vfCv : state.cv);`
, 'cmpPick1');

rep(
  `  function comparePickActiveId(){
    return isVF() ? state.vfCv : state.cv;
  }`,
  `  function comparePickActiveId(){
    if (isPalletView()) return state.palletCv;
    return isVF() ? state.vfCv : state.cv;
  }`
, 'cmpPick2');

rep(
  `    if (isVF() && VF_SECTIONS.length){
      return VF_SECTIONS.map(sec => {`,
  `    if (isPalletView() && PALLET_SECTIONS.length){
      return PALLET_SECTIONS.map(sec => {
        const items = list.filter(c => c.section === sec.id);
        if (!items.length) return '';
        return '<div class="compare-pick-group"><div class="compare-pick-group-title">' + sec.title +
          '</div><div class="compare-pick-chips">' + items.map(compareChipHtml).join('') + '</div></div>';
      }).join('');
    }
    if (isVF() && VF_SECTIONS.length){
      return VF_SECTIONS.map(sec => {`
, 'compareHtml');

rep(
  `  function renderCultivars(){
    function cvDelBtn(id){
      return '<button type="button" class="cv-del" data-cv-del="' + id + '" title="Удалить сорт" aria-label="Удалить">×</button>';
    }
    if (isVF() && allVfCultivars().length){`,
  `  function renderCultivars(){
    function cvDelBtn(id){
      return '<button type="button" class="cv-del" data-cv-del="' + id + '" title="Удалить сорт" aria-label="Удалить">×</button>';
    }
    if (isPalletView() && allPalletCultivars().length){
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
    } else if (isVF() && allVfCultivars().length){`
, 'renderCv');

rep(
  `      const scenList = isVF() ? allVfCultivars() : allGhCultivars();`,
  `      const scenList = isPalletView() ? allPalletCultivars() : (isVF() ? allVfCultivars() : allGhCultivars());`
, 'scenList');

rep(
  `    if (culturePanel) culturePanel.classList.toggle('is-vf', mode === 'vertical');`,
  `    if (culturePanel) culturePanel.classList.toggle('is-vf', mode === 'vertical' || isPalletView());`
, 'is-vf class');

rep(
  `    syncVfStdControls();
    renderGhStandardsPanel();
    renderVfStandardsPanel();`,
  `    syncVfStdControls();
    renderGhStandardsPanel();
    if (isPalletView()) renderVfStandardsPanel();
    else renderVfStandardsPanel();`
, 'renderAll panel - noop');

rep(
  `  function renderVfStandardsPanel(){
    if (!isVF() || !VF_CULTIVARS.length) return;`,
  `  function renderVfStandardsPanel(){
    if (!usePlantingSheet()) return;
    if (isPalletView() && !PALLET_CULTIVARS.length) return;
    if (!isPalletView() && (!isVF() || !VF_CULTIVARS.length)) return;`
, 'vfPanel');

rep(
  `    const cv = getVfCv();
    const s = getVfCvStandards(cv);`,
  `    const cv = getSheetCv();
    const s = isPalletView() ? getPalletCvStandards(cv) : getVfCvStandards(cv);`
, 'vfPanel cv - need getPalletCvStandards');

// Add getPalletCvStandards before renderVfStandardsPanel - insert after getVfCvStandards
rep(
  `  function getVfCvStandards(cv){
    cv = cv || getVfCv();
    if (!cv) return buildDefaultVfStandards(cv);
    if (!state.vfUserStandards[cv.id]) state.vfUserStandards[cv.id] = buildDefaultVfStandards(cv);
    return state.vfUserStandards[cv.id];
  }`,
  `  function getVfCvStandards(cv){
    cv = cv || getVfCv();
    if (!cv) return buildDefaultVfStandards(cv);
    if (!state.vfUserStandards[cv.id]) state.vfUserStandards[cv.id] = buildDefaultVfStandards(cv);
    return state.vfUserStandards[cv.id];
  }
  function buildDefaultPalletStandards(cv){
    cv = cv || getPalletCv();
    if (!cv) return {};
    const y = Math.round(cv.yieldPerCutG) || 10;
    const canopy = Math.round(modelCanopyFromMass(cv, y));
    return {
      germination: cv.germination,
      nursery: cv.nursery || state.nursery,
      day: cv.channelDays,
      density: cv.density,
      palletCells: cv.palletCells,
      cutInterval: cutIntervalRange(cv).mid,
      canopyPct: 100,
      manualCanopy: canopy,
      useManualCanopy: true,
      manualMass: y,
      manualCutMass: y,
      userSaved: false
    };
  }
  function getPalletCvStandards(cv){
    cv = cv || getPalletCv();
    if (!cv) return buildDefaultPalletStandards(cv);
    if (!state.palletUserStandards[cv.id]) state.palletUserStandards[cv.id] = buildDefaultPalletStandards(cv);
    return state.palletUserStandards[cv.id];
  }`
, 'palletStandards');

rep(
  `    if (isPalletView()){
      el.textContent = (isVF() ? 'Вертикальная ферма' : 'Теплица') + ': поддоны 130×65, 3 кассеты, ' + (state.palletCells === 9 ? '8–9' : state.palletCells) + ' ячеек/кассета.';
    }`,
  `    if (isPalletView()){
      const pcv = getPalletCv();
      const cellsLbl = state.palletCells === 9 ? '8–9' : String(state.palletCells);
      el.textContent = 'Поддоны 130×65, 3 кассеты · ' + (pcv ? pcv.name + ' · ' : '') + cellsLbl + ' яч./кассета (справочник: ' + (pcv ? pcv.palletCellsStd : '—') + ').';
    }`
, 'pageSub');

rep(
  `    document.querySelectorAll('.vf-only').forEach(el => el.classList.toggle('env-block-hidden', !isVF()));`,
  `    document.querySelectorAll('.vf-only').forEach(el => el.classList.toggle('env-block-hidden', !isVF() && !isPalletView()));`
, 'vf-only');

rep(
  `      <p class="vf-cv-std-hint vf-only env-block-hidden" id="vf-cv-std-hint" style="margin-top:12px"></p>`,
  `      <p class="vf-cv-std-hint env-block-hidden" id="vf-cv-std-hint" style="margin-top:12px"></p>`
, 'hint class');

// setAppView when pallets
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
, 'setAppView');

rep(
  `    if (VF_CULTIVARS.length){ renderVfStdGrid(); resetVfStdToSheetDefaults(); }`,
  `    if (VF_CULTIVARS.length){ renderVfStdGrid(); }
    if (PALLET_CULTIVARS.length && state.appView === 'pallets') resetPalletStdToSheetDefaults();
    else if (VF_CULTIVARS.length && state.facility === 'vertical') resetVfStdToSheetDefaults();`
, 'init');

fs.writeFileSync(p, h, 'utf8');
console.log('Patched OK');
