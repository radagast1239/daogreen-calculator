/**
 * UI render: сравнение сортов, метрики, схемы, renderAll.
 * DG_createPlantingRender(deps)
 */
(function (global) {
  'use strict';

  function createPlantingRender(deps) {
    function st() { return deps.getState(); }
    function $(id) { return deps.$(id); }
    function ui(k, vars) { return deps.ui(k, vars); }
    function pt(k) { return deps.pt(k); }
    function pm(k) { return deps.pm(k); }
    function pr(k, vars) { return deps.pr(k, vars); }
    function tr(k) { return deps.tr(k); }
    function r1(n) { return deps.r1(n); }
    function r2(n) { return deps.r2(n); }
    function round(n) { return deps.round(n); }
    function clamp(v, lo, hi) { return deps.clamp(v, lo, hi); }
    function htmlEsc(s) { return deps.htmlEsc(s); }
    function catalogPhrase(t) { return deps.catalogPhrase(t); }
    function cvSubLine(c) { return deps.cvSubLine(c); }
    function fmtNumRu(n, o) { return deps.fmtNumRu(n, o); }
    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }
    function getCv() { return deps.getCv(); }
    function getActiveCv() { return deps.getActiveCv(); }
    function getVfCv() { return deps.getVfCv(); }
    function getPalletCv() { return deps.getPalletCv(); }
    function isVF() { return deps.isVF(); }
    function isPalletView() { return deps.isPalletView(); }
    function isGreenhousePlanting() { return deps.isGreenhousePlanting(); }
    function isChannelGreenhouse() { return deps.isChannelGreenhouse(); }
    function isVfSheetCv(cv) { return deps.isVfSheetCv(cv); }
    function vfEffectiveDay(cv) { return deps.vfEffectiveDay(cv); }
    function usePlantingSheet() { return deps.usePlantingSheet(); }
    function calc() { return deps.calc(); }
    function getPlantingStd() { return deps.getPlantingStd(); }
    var canopyDensityUi = deps.canopyDensityUi;
    var plantingGuides = deps.plantingGuides;
    var simpleUiMode = deps.simpleUiMode;
    function getGhUsefulAreaM2() { return deps.getGhUsefulAreaM2(); }
    function ghYieldWithMargin(b, d) { return deps.ghYieldWithMargin(b, d); }
    function ghYieldKgSqmYear(r, c) { return deps.ghYieldKgSqmYear(r, c); }
    function syncGhYieldControls(r) { return deps.syncGhYieldControls(r); }
    function syncGhYieldMarginSliders() { return deps.syncGhYieldMarginSliders(); }
    function syncBioMarginVisibility() { return deps.syncBioMarginVisibility(); }
    function supportsMulticut(cv) { return deps.supportsMulticut(cv); }
    function plantingHarvestYieldParams(cv, r) { return deps.plantingHarvestYieldParams(cv, r); }
    function countIsPieces(cv) {
      return global.DG_countIsPieces ? global.DG_countIsPieces(cv) : !!(cv && cv.countUnit === 'шт');
    }
    function areaYieldSqmUnit(cv, hy) {
      return (hy && hy.unitIsPieces) || countIsPieces(cv) ? pm('u.pcsSqm') : 'kg/m²';
    }
    function farmYieldMoUnit(hy) {
      return hy && hy.unitIsPieces ? ui('gh.yield.unitPcsMo') : ui('gh.yield.unitKgMo');
    }
    function farmYieldYrUnit(hy) {
      return hy && hy.unitIsPieces ? ui('gh.yield.unitPcsYear') : ui('gh.yield.unitKgYear');
    }
    function rangeMass(v) { return deps.rangeMass(v); }
    function rangeCanopy(v) { return deps.rangeCanopy(v); }
    function rangeDay() { return deps.rangeDay(); }
    function getPlantingStateEconSlice() { return deps.getPlantingStateEconSlice(); }
    function restorePlantingStateEconSlice(s) { return deps.restorePlantingStateEconSlice(s); }
    function initPalletValuesFromSheet(cv) { return deps.initPalletValuesFromSheet(cv); }
    function resetVfStdToSheetDefaults() { return deps.resetVfStdToSheetDefaults(); }
    function resetPalletStdToSheetDefaults() { return deps.resetPalletStdToSheetDefaults(); }
    function applyVfStandardsFromSheet() { return deps.applyVfStandardsFromSheet(); }
    function syncVfStdControls() { return deps.syncVfStdControls(); }
    function renderGhStandardsPanel() { return deps.renderGhStandardsPanel(); }
    function renderVfStandardsPanel() { return deps.renderVfStandardsPanel(); }
    function renderVfStdGrid() { return deps.renderVfStdGrid(); }
    function updatePlantingGeomUI() { return deps.updatePlantingGeomUI(); }
    function syncGhFacilityPanels() { return deps.syncGhFacilityPanels(); }
    function syncGhCutsUI() { return deps.syncGhCutsUI(); }
    function syncCanopyUI() { return deps.syncCanopyUI(); }
    function syncManualMassUI() { return deps.syncManualMassUI(); }
    function syncMoneySliderDisplays() { return deps.syncMoneySliderDisplays(); }
    function updatePageSub() { return deps.updatePageSub(); }
    function updateCalcBuildBadge(r) { return deps.updateCalcBuildBadge(r); }
    function showError(stage, err) { return deps.showError(stage, err); }
    function monthLabel(i) { return deps.monthLabel(i); }
    function stageOf(a, b, c, cv) { return deps.stageOf(a, b, c, cv); }
    function holeDiameter(cv) { return deps.holeDiameter(cv); }
    function plantLayout(cv) { return deps.plantLayout(cv); }
    function plantLayoutPallet(c) { return deps.plantLayoutPallet(c); }
    function schemaCanopyMm(r) { return deps.schemaCanopyMm(r); }
    function syncSchemaCanopyLegend(mm) { return deps.syncSchemaCanopyLegend(mm); }
    function palletCellGeometry(c, m) { return deps.palletCellGeometry(c, m); }
    function palletCellsForLayout(cv) { return deps.palletCellsForLayout(cv); }
    function getCellCenters(n, l, w) { return deps.getCellCenters(n, l, w); }
    function effectiveDLI() { return deps.effectiveDLI(); }
    function naturalDLI() { return deps.naturalDLI(); }
    function supplementDLI() { return deps.supplementDLI(); }
    function effectivePhotoperiod() { return deps.effectivePhotoperiod(); }
    function photoperiod() { return deps.photoperiod(); }
    function eveningHours() { return deps.eveningHours(); }
    function daySupplement() { return deps.daySupplement(); }
    function eveningSupplement() { return deps.eveningSupplement(); }
    function photoperiodFactor() { return deps.photoperiodFactor(); }
    function envMultiplier(cv) { return deps.envMultiplier(cv); }
    function kwhPerSqmPerDayFromDli(d) { return deps.kwhPerSqmPerDayFromDli(d); }
    function ppfdFromDli(d, ph) { return deps.ppfdFromDli(d, ph); }
    function ledEfficacy() { return deps.ledEfficacy(); }
    function findCvById(id) { return deps.findCvById(id); }
    function buildDefaultVfStandards(cv) { return deps.buildDefaultVfStandards(cv); }
    function buildDefaultGhStandards(cv) { return deps.buildDefaultGhStandards(cv); }
    function envBolt(cv) { return deps.envBolt(cv); }
    function harvestTotal(cv) { return deps.harvestTotal(cv); }
    function vegContextLabel(short) { return deps.vegContextLabel(short); }
    function growCtxParams() {
      return { ctx: vegContextLabel(true), ctxLong: vegContextLabel(false) };
    }
    function syncGrowContextHints(r) {
      var p = growCtxParams();
      var cv = r && r.cv ? r.cv : getActiveCv();
      var dayYield = $('channel-day-yield-hint');
      var hideDayYield = !!(st().multicut && cv && supportsMulticut(cv) && (isVF() || isPalletView()));
      if (dayYield) {
        dayYield.classList.toggle('env-block-hidden', hideDayYield);
        if (!hideDayYield) dayYield.textContent = ui('grow.channelYieldHint', p);
      }
      var autoDay = $('auto-day-hint');
      if (autoDay) autoDay.textContent = ui('grow.autoDayHint', p);
      var mcHint = $('multicut-enable-hint');
      if (mcHint && !st().multicut && cv && supportsMulticut(cv)) {
        mcHint.textContent = ui('multicut.enableHintOff', p);
      }
    }
    function showAsPalletCalc(r) { return deps.showAsPalletCalc(r); }
    function syncMulticutBabyUi(cv) { return deps.syncMulticutBabyUi(cv); }
    function calcScenario(o) { return deps.calcScenario(o); }
    function calcScenarioVf(id, o) { return deps.calcScenarioVf(id, o); }
    function calcScenarioPallet(id, o) { return deps.calcScenarioPallet(id, o); }
    function addDays(d, n) { return deps.addDays(d, n); }
    function fmtDate(d) { return deps.fmtDate(d); }
    function syncHarvestBlockUI(r) { return deps.syncHarvestBlockUI(r); }
    function updateMassModelHint(a, m, ca, c) { return deps.updateMassModelHint(a, m, ca, c); }
    function modelCanopyFromMass(cv, mass) { return deps.modelCanopyFromMass(cv, mass); }
    function syncMulticutDetailUI() { return deps.syncMulticutDetailUI(); }
    function cutIntervalMods(cv) { return deps.cutIntervalMods(cv); }
    function vegContextLabelCap() { return deps.vegContextLabelCap(); }
    function palletMountMode() { return deps.palletMountMode(); }
    function computeGhYieldTotals(r) { return deps.computeGhYieldTotals(r); }
    function dliFactor() { return deps.dliFactor(); }
    function tempFactor(cv) { return deps.tempFactor(cv); }
    function effectiveTempFactor(cv) { return deps.effectiveTempFactor(cv); }
    function boltShift(cv) { return deps.boltShift(cv); }
    function greenhouseHeatYieldLossPct(t) { return deps.greenhouseHeatYieldLossPct(t); }
    function massAtTotal(cv, t) { return deps.massAtTotal(cv, t); }
    function canopyAtTotal(cv, t) { return deps.canopyAtTotal(cv, t); }
    function harvestChannel(cv) { return deps.harvestChannel(cv); }
    function boltChannel(cv) { return deps.boltChannel(cv); }
    function totalAge(d) { return deps.totalAge(d); }
    function preChannelDays() { return deps.preChannelDays(); }
    function effectiveCutInterval() { return deps.effectiveCutInterval(); }
    function syncCutIntervalSlider(cv) {
      if (typeof deps.syncCutIntervalSlider === 'function') deps.syncCutIntervalSlider(cv);
    }
    function cutMassPerPlant(cv, i) { return deps.cutMassPerPlant(cv, i); }
    function multicutHorizon(cv) {
      if (typeof deps.multicutHorizon === 'function') return deps.multicutHorizon(cv);
      return null;
    }
    function vfMulticutStats(cv) { return deps.vfMulticutStats(cv); }
    var ICON = deps.ICON || {};
    var CV_COLORS = deps.CV_COLORS || {};
    var COLLAPSE_DEFAULTS = deps.COLLAPSE_DEFAULTS || {};
    var CALC_BUILD = deps.CALC_BUILD || '';
    var PALLET_SECTIONS = deps.PALLET_SECTIONS || [];
    var VF_SECTIONS = deps.VF_SECTIONS || [];
    var CULTIVARS = deps.CULTIVARS || [];
    var NATURAL_DLI = deps.NATURAL_DLI || [];
    var VF_CULTIVARS = deps.VF_CULTIVARS || [];
    var PALLET_CULTIVARS = deps.PALLET_CULTIVARS || [];
    var CASSETTES_PER_PALLET = deps.CASSETTES_PER_PALLET != null ? deps.CASSETTES_PER_PALLET : 3;
    var CUT_INTERVAL_SLACK = deps.CUT_INTERVAL_SLACK != null ? deps.CUT_INTERVAL_SLACK : 6;
    var CH_W = deps.CH_W != null ? deps.CH_W : 110;
    var MAX_WIDTH = deps.MAX_WIDTH != null ? deps.MAX_WIDTH : 2000;
    var HOLE_D_VF = deps.HOLE_D_VF != null ? deps.HOLE_D_VF : 25;
    var PALLET_L_MM = deps.PALLET_L_MM != null ? deps.PALLET_L_MM : 1300;
    var PALLET_W_MM = deps.PALLET_W_MM != null ? deps.PALLET_W_MM : 650;
    var CASSETTE_L_MM = deps.CASSETTE_L_MM != null ? deps.CASSETTE_L_MM : 400;
    var CASSETTE_W_MM = deps.CASSETTE_W_MM != null ? deps.CASSETTE_W_MM : 600;
    var FACILITY_KEY = deps.FACILITY_KEY;
    var LED_VF_MIN = deps.LED_VF_MIN != null ? deps.LED_VF_MIN : 2.3;
    var LED_VF_MAX = deps.LED_VF_MAX != null ? deps.LED_VF_MAX : 2.5;
    function showToast(msg) { return deps.showToast(msg); }
    var lightSync = false;
    function allGhCultivars() { return deps.allGhCultivars(); }
    function allVfCultivars() { return deps.allVfCultivars(); }
    function allPalletCultivars() { return deps.allPalletCultivars(); }
    function addCustomGhCultivar(n, t) { return deps.addCustomGhCultivar(n, t); }
    function addCustomVfCultivar(n, s, t) { return deps.addCustomVfCultivar(n, s, t); }
    function removeCustomCultivar(id) { return deps.removeCustomCultivar(id); }
    function renderEconomics() { return deps.renderEconomics(); }

  function renderGhYieldCultivarCompare(r){
    const block = $('gh-yield-cultivar-compare');
    const table = $('gh-yield-compare-table');
    if (!block || !table) return;
    const show = isGreenhousePlanting() && getCompareList().length >= 1;
    block.classList.toggle('env-block-hidden', !show);
    if (!show) return;

    const area = getGhUsefulAreaM2();
    const meta = $('gh-yield-compare-meta');
    if (!(area > 0)){
      table.innerHTML = '';
      if (meta) meta.textContent = ui('gh.yield.enterArea');
      return;
    }

    ensureComparePick();
    bindGhYieldComparePick();
    const pickGrid = $('gh-yield-compare-pick');
    if (pickGrid) pickGrid.innerHTML = buildComparePickHtml();

    if (meta){
      meta.textContent = ui('gh.yield.compareMeta', {
        area: r1(area),
        days: st().day,
        month: monthLabel(st().month),
        temp: r1(st().temp)
      });
    }

    const activeId = comparePickActiveId();
    const showRhoRec = isChannelGreenhouse();
    const dataRows = getCompareSelected().map(function(cv){
      const rc = calcForGhYieldCompareCv(cv);
      const hyR = plantingHarvestYieldParams(cv, rc);
      const kgSqmYear = ghYieldKgSqmYear(rc, cv);
      const kgSqmMo = kgSqmYear / 12;
      const kgYear = kgSqmYear * area;
      const kgFarmMo = kgSqmMo * area;
      const rhoRec = (showRhoRec && georgyModeRef() && georgyModeRef().canUseCanopyDensityPick(cv))
        ? georgyModeRef().densityFromCanopy(cv) : null;
      return {
        cv: cv,
        rc: rc,
        hyR: hyR,
        mass: rc.mass,
        rhoRec: rhoRec,
        rhoA: rc.rhoA,
        kgSqmYear: kgSqmYear,
        kgSqmMo: kgSqmMo,
        kgFarmMo: kgFarmMo,
        kgYear: kgYear,
        isActive: cv.id === activeId
      };
    });
    dataRows.sort(function(a, b){ return b.kgYear - a.kgYear; });

    const pcsCols = dataRows.some(function (row) {
      return row.hyR && row.hyR.unitIsPieces;
    });
    const head = '<thead><tr>' +
      '<th>' + ui('gh.yield.compareColCultivar') + '</th>' +
      '<th>' + ui(pcsCols ? 'gh.yield.compareColQty' : 'gh.yield.compareColMass') + '</th>' +
      (showRhoRec ? '<th>' + ui('gh.yield.compareColRho') + '</th>' : '') +
      '<th>' + ui('gh.yield.compareColRhoA') + '</th>' +
      '<th>' + ui(pcsCols ? 'gh.yield.compareColPcsSqmY' : 'gh.yield.compareColKgSqmY') + '</th>' +
      '<th>' + ui(pcsCols ? 'gh.yield.compareColPcsSqmMo' : 'gh.yield.compareColKgSqmMo') + '</th>' +
      '<th>' + ui(pcsCols ? 'gh.yield.compareColFarmPcsMo' : 'gh.yield.compareColFarmMo') + '</th>' +
      '<th>' + ui(pcsCols ? 'gh.yield.compareColPcsYear' : 'gh.yield.compareColYear') + '</th>' +
      '</tr></thead>';

    const body = dataRows.map(function(row){
      const hyR = row.hyR;
      const pcs = hyR && hyR.unitIsPieces;
      const massU = pcs ? pm('u.pcs') : pm('unit.g');
      const sqmU = pcs ? pm('u.pcsSqm') : 'kg/m²';
      return '<tr class="' + (row.isActive ? 'gh-yield-row-active' : '') + '">' +
        '<td><span class="compare-chip-dot" style="background:' + cvColor(row.cv.id) + ';display:inline-block;vertical-align:middle;margin-right:6px"></span>' +
        row.cv.name + '</td>' +
        '<td>' + round(row.mass) + ' ' + massU + '</td>' +
        (showRhoRec ? '<td>' + (row.rhoRec != null ? Math.round(row.rhoRec) : '—') + ' ' + pm('u.pcsSqm') + '</td>' : '') +
        '<td>' + Math.round(row.rhoA) + ' ' + pm('u.pcsSqm') + '</td>' +
        '<td>' + ghYieldWithMargin(row.kgSqmYear, 1) + ' ' + sqmU + '</td>' +
        '<td>' + ghYieldWithMargin(row.kgSqmMo, 1) + ' ' + sqmU + '</td>' +
        '<td>' + ghYieldWithMargin(row.kgFarmMo, 1) + ' ' + farmYieldMoUnit(hyR) + '</td>' +
        '<td><strong>' + ghYieldWithMargin(row.kgYear, 1) + '</strong> ' + farmYieldYrUnit(hyR) + '</td>' +
        '</tr>';
    }).join('');

    table.innerHTML = head + '<tbody>' + body + '</tbody>';
  }

  function renderGhYieldTotals(r){
    const box = $('gh-yield-results');
    if (!box) return;
    if (!isGreenhousePlanting()){
      box.innerHTML = '';
      const gcmp = $('gh-yield-cultivar-compare');
      if (gcmp) gcmp.classList.add('env-block-hidden');
      return;
    }
    syncGhYieldControls(r);
    const t = computeGhYieldTotals(r);
    if (!t.hasArea){
      box.innerHTML = '<div class="m"><div class="m-label">—</div><div class="m-val" style="font-size:14px;color:var(--ink-soft)">' +
        ui('gh.yield.enterArea') + '</div></div>';
      renderGhYieldCultivarCompare(r);
      return;
    }
    const rows = [];
    if (t.unitIsPieces && t.pcsMonth > 0){
      rows.push({ l: ui('gh.yield.totalMonth'), v: ghYieldWithMargin(t.pcsMonth, 1), u: ui('gh.yield.unitPcsMo'), cls: 'hl' });
      rows.push({ l: ui('gh.yield.totalYear'), v: ghYieldWithMargin(t.pcsYear, 1), u: ui('gh.yield.unitPcsYear'), cls: 'hl' });
    } else {
      rows.push({ l: ui('gh.yield.totalMonth'), v: ghYieldWithMargin(t.kgMonth, 1), u: ui('gh.yield.unitKgMo'), cls: 'hl' });
      rows.push({ l: ui('gh.yield.totalYear'), v: ghYieldWithMargin(t.kgYear, 1), u: ui('gh.yield.unitKgYear'), cls: 'hl' });
    }
    const basicUplift = 0.125;
    const optimisticUplift = 0.175;
    var scenariosHtml = '';
    if (t.unitIsPieces && t.pcsMonth > 0){
      var bMoP = t.pcsMonth * (1 + basicUplift);
      var bYrP = t.pcsYear * (1 + basicUplift);
      var oMoP = t.pcsMonth * (1 + optimisticUplift);
      var oYrP = t.pcsYear * (1 + optimisticUplift);
      scenariosHtml =
        '<div class="gh-yield-scenarios">' +
        '<div class="gh-yield-scenarios-title">' + ui('gh.yield.scenariosTitle') + '</div>' +
        '<div class="gh-yield-scenario-row"><span class="gh-yield-scenario-lbl">' + ui('gh.yield.scenarioBasic') + '</span>' +
        '<span class="gh-yield-scenario-val">' + r1(bMoP) + ' ' + ui('gh.yield.unitPcsMo') + ' · ' + r1(bYrP) + ' ' + ui('gh.yield.unitPcsYear') + '</span></div>' +
        '<div class="gh-yield-scenario-row"><span class="gh-yield-scenario-lbl">' + ui('gh.yield.scenarioOptimistic') + '</span>' +
        '<span class="gh-yield-scenario-val">' + r1(oMoP) + ' ' + ui('gh.yield.unitPcsMo') + ' · ' + r1(oYrP) + ' ' + ui('gh.yield.unitPcsYear') + '</span></div>' +
        '</div>';
    } else {
      var bMo = t.kgMonth * (1 + basicUplift);
      var bYr = t.kgYear * (1 + basicUplift);
      var oMo = t.kgMonth * (1 + optimisticUplift);
      var oYr = t.kgYear * (1 + optimisticUplift);
      scenariosHtml =
        '<div class="gh-yield-scenarios">' +
        '<div class="gh-yield-scenarios-title">' + ui('gh.yield.scenariosTitle') + '</div>' +
        '<div class="gh-yield-scenario-row"><span class="gh-yield-scenario-lbl">' + ui('gh.yield.scenarioBasic') + '</span>' +
        '<span class="gh-yield-scenario-val">' + r1(bMo) + ' ' + ui('gh.yield.unitKgMo') + ' · ' + r1(bYr) + ' ' + ui('gh.yield.unitKgYear') + '</span></div>' +
        '<div class="gh-yield-scenario-row"><span class="gh-yield-scenario-lbl">' + ui('gh.yield.scenarioOptimistic') + '</span>' +
        '<span class="gh-yield-scenario-val">' + r1(oMo) + ' ' + ui('gh.yield.unitKgMo') + ' · ' + r1(oYr) + ' ' + ui('gh.yield.unitKgYear') + '</span></div>' +
        '</div>';
    }
    box.innerHTML = rows.map(function(m){
      return '<div class="m ' + (m.cls || '') + '"><div class="m-label">' + m.l +
        '</div><div class="m-val has-range">' + m.v + '<span class="m-unit">' + m.u + '</span></div></div>';
    }).join('') + scenariosHtml;
    const noteEl = $('gh-yield-note');
    if (noteEl){
      const cv = r.cv || getCv();
      const hy = plantingHarvestYieldParams ? plantingHarvestYieldParams(cv, r) : null;
      if (hy && hy.multicutHarvest){
        if (hy.unitIsPieces) {
          noteEl.textContent = ui('gh.yield.noteMulticutPcs', {
            interval: hy.harvestCutIntervalDays,
            cutsMo: r1(hy.harvestCutsPerMonth),
            mass: round(hy.harvestYieldPerCut),
            potMo: round(hy.yieldPerPotMonth),
            sqmMo: r1(hy.yieldPerSqmMonthPcs || 0),
            rho: Math.round(r.rhoA || 0)
          });
        } else {
          noteEl.textContent = ui('gh.yield.noteMulticut', {
            interval: hy.harvestCutIntervalDays,
            cutsMo: r1(hy.harvestCutsPerMonth),
            mass: round(hy.harvestYieldPerCut),
            potMo: round(hy.yieldPerPotMonth)
          });
        }
      } else if (r.mainHallIntervalDays > 0 && r.usefulAreaBasis === 'main_hall'){
        noteEl.textContent = ui('gh.yield.noteMainHall', {
          mainDays: r.mainHallIntervalDays,
          cutsMo: r1(r.harvestCyclesPerMonth || 0)
        });
      } else {
        noteEl.textContent = ui('gh.yield.note');
      }
    }
    renderGhYieldCultivarCompare(r);
  }

  function withRange(v, halfWidth, unit){
    const unitHtml = unit ? '<span class="m-unit">' + unit + '</span>' : '';
    if (!st().showRange) return round(v) + unitHtml;
    /* When range is enabled, show range as main value, average below */
    const lo = round(v - halfWidth);
    const hi = round(v + halfWidth);
    return lo + '–' + hi + unitHtml + '<span class="m-range">' + ui('ui.range.avg', { v: round(v) }) + '</span>';
  }
  function rangeText(v, halfWidth, digits){
    const r = digits === 1 ? r1 : round;
    if (!st().showRange) return r(v) + '';
    return r(v - halfWidth) + '–' + r(v + halfWidth);
  }
  function calcForGhYieldCompareCv(cv){
    const saved = getPlantingStateEconSlice();
    const savedRho = st().georgyTargetDensity;
    const savedFitted = st().georgyDensityFitted;
    try {
      if (isPalletView()) st().palletCv = cv.id;
      else if (isVF()) st().vfCv = cv.id;
      else st().cv = cv.id;
      var ghCh = deps.getGhChannelSimple ? deps.getGhChannelSimple() : null;
      if (ghCh && ghCh.isEnabled && ghCh.isEnabled()) ghCh.applyDensityFitForCompare(cv);
      else if (georgyModeRef() && georgyModeRef().canUseCanopyDensityPick(cv)){
        st().georgyTargetDensity = georgyModeRef().densityFromCanopy(cv);
        st().georgyDensityFitted = true;
      }
      return calc();
    } finally {
      st().georgyTargetDensity = savedRho;
      st().georgyDensityFitted = savedFitted;
      restorePlantingStateEconSlice(saved);
    }
  }

  function bindGhYieldComparePick(){
    const grid = $('gh-yield-compare-pick');
    if (!grid || grid.dataset.cmpBound) return;
    grid.dataset.cmpBound = '1';
    grid.addEventListener('click', e => {
      const chip = e.target.closest('.compare-chip');
      if (!chip) return;
      const id = chip.getAttribute('data-cmp-id');
      if (!id) return;
      const turningOff = !!st().comparePick[id];
      const nOn = getCompareList().filter(c => st().comparePick[c.id]).length;
      if (turningOff && nOn <= 1) return;
      st().comparePick[id] = !st().comparePick[id];
      deps.renderAll();
    });
  }
  function stageLabel(st){
    return pt('stage.' + st);
  }

  function cvColor(id){
    if (CV_COLORS[id]) return CV_COLORS[id];
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
    return 'hsl(' + h + ',45%,42%)';
  }
  function getCompareList(){
    if (isPalletView() && allPalletCultivars().length) return allPalletCultivars();
    var list = isVF() && allVfCultivars().length ? allVfCultivars() : allGhCultivars();
    if (georgyModeRef() && georgyModeRef().isGeorgyGh()) list = georgyModeRef().filterGeorgyCultivars(list);
    return list;
  }
  function ensureComparePick(){
    const list = getCompareList();
    list.forEach(c => {
      if (st().comparePick[c.id] === undefined) st().comparePick[c.id] = false;
    });
    const activeId = isPalletView() ? st().palletCv : (isVF() ? st().vfCv : st().cv);
    if (st().comparePick[activeId] === undefined) st().comparePick[activeId] = true;
  }
  function getCompareSelected(){
    ensureComparePick();
    const list = getCompareList().filter(c => st().comparePick[c.id]);
    return list.length ? list : [getActiveCv()];
  }
  function comparePickActiveId(){
    if (isPalletView()) return st().palletCv;
    return isVF() ? st().vfCv : st().cv;
  }
  function compareChipHtml(c){
    const on = !!st().comparePick[c.id];
    const isActive = c.id === comparePickActiveId();
    return '<button type="button" class="compare-chip' + (on ? ' on' : '') + (isActive ? ' is-active' : '') +
      '" data-cmp-id="' + c.id + '" data-readonly-allow data-preview-allow title="' +
      (isActive ? ui('ui.cv.compareOn') : ui('ui.cv.compareOff')) + '">' +
      '<span class="compare-chip-dot" style="background:' + cvColor(c.id) + '"></span>' + c.name + '</button>';
  }
  function catalogSectionTitle(sec){
    const k = 'cv.secGroup.' + sec.id;
    const v = ui(k);
    return v !== k ? v : sec.title;
  }

  function buildComparePickHtml(){
    const list = getCompareList();
    if (isPalletView() && PALLET_SECTIONS.length){
      return PALLET_SECTIONS.map(sec => {
        const items = list.filter(c => c.section === sec.id);
        if (!items.length) return '';
        return '<div class="compare-pick-group"><div class="compare-pick-group-title">' + catalogSectionTitle(sec) +
          '</div><div class="compare-pick-chips">' + items.map(compareChipHtml).join('') + '</div></div>';
      }).join('');
    }
    if (isVF() && VF_SECTIONS.length){
      return VF_SECTIONS.map(sec => {
        const items = list.filter(c => c.section === sec.id);
        if (!items.length) return '';
        return '<div class="compare-pick-group"><div class="compare-pick-group-title">' + catalogSectionTitle(sec) +
          '</div><div class="compare-pick-chips">' + items.map(compareChipHtml).join('') + '</div></div>';
      }).join('');
    }
    return '<div class="compare-pick-chips">' + list.map(compareChipHtml).join('') + '</div>';
  }
  function bindComparePickGrid(){
    const grid = $('compare-pick-grid');
    if (!grid || grid.dataset.cmpBound) return;
    grid.dataset.cmpBound = '1';
    grid.addEventListener('click', e => {
      const chip = e.target.closest('.compare-chip');
      if (!chip) return;
      const id = chip.getAttribute('data-cmp-id');
      if (!id) return;
      const turningOff = !!st().comparePick[id];
      const nOn = getCompareList().filter(c => st().comparePick[c.id]).length;
      if (turningOff && nOn <= 1) return;
      st().comparePick[id] = !st().comparePick[id];
      deps.renderAll();
    });
  }
  function renderComparePickGrid(){
    const wrap = $('compare-pick-wrap');
    const grid = $('compare-pick-grid');
    const summary = $('compare-pick-summary');
    if (!wrap || !grid) return;
    wrap.classList.toggle('env-block-hidden', !st().compareMode);
    if (!st().compareMode) return;
    ensureComparePick();
    bindComparePickGrid();
    grid.innerHTML = buildComparePickHtml();
    const n = getCompareSelected().length;
    const active = getActiveCv();
    if (summary){
      summary.textContent = ui('ui.compare.summary', {
        n: n,
        total: getCompareList().length,
        active: active ? active.name : tr('compare.active')
      });
    }
  }
  function calcForCompareCv(cv){
    const saved = getPlantingStateEconSlice();
    try {
      if (isPalletView()) st().palletCv = cv.id;
      else if (isVF()) st().vfCv = cv.id;
      else st().cv = cv.id;
      return calc();
    } finally {
      restorePlantingStateEconSlice(saved);
    }
  }
  function fmtCompareRange(val, rangeFn, suffix){
    const unit = suffix ? ' ' + suffix : '';
    if (!st().showRange) return String(round(val)) + unit;
    return round(val - rangeFn(val)) + '–' + round(val + rangeFn(val)) + unit;
  }
  function formatCvCompareCell(col, metricId){
    const r = col.r;
    const hy = col.hy;
    switch (metricId){
      case 'mass':
        return fmtCompareRange(
          r.mass,
          rangeMass,
          (hy && hy.unitIsPieces) || r.countUnit === 'шт' ? pm('u.pcs') : pm('unit.g')
        );
      case 'canopy':
        return fmtCompareRange(r.canopy, rangeCanopy, pm('unit.mm'));
      case 'harvestDay':
        if (!st().showRange) return Math.round(r.t_ch || 0) + ' ' + pm('unit.days');
        const d = Math.round(r.t_ch || 0);
        const rd = rangeDay();
        return Math.max(0, d - Math.round(rd)) + '–' + (d + Math.round(rd)) + ' ' + pm('unit.days');
      case 'cycle': {
        const ghHead = georgyModeRef() && georgyModeRef().isGeorgyGh() && georgyModeRef().isGeorgyHeadSalad(r.cv);
        const cycleD = ghHead && r.totalDaysFromSow != null ? r.totalDaysFromSow : (r.totalCycleDays || 0);
        if (!st().showRange) return Math.round(cycleD) + ' ' + pm('unit.days');
        const c = Math.round(cycleD);
        const rc = rangeDay();
        return Math.max(1, c - Math.round(rc)) + '–' + (c + Math.round(rc)) + ' ' + pm('unit.days');
      }
      case 'kgSqmYear': {
        const sqmU = areaYieldSqmUnit(col.cv, hy);
        const v = r.yieldPerSqmYear || 0;
        return st().showRange
          ? r1(v * (1 - st().errorPct / 100)) + '–' + r1(v * (1 + st().errorPct / 100)) + ' ' + sqmU
          : r1(v) + ' ' + sqmU;
      }
      case 'kgSqmCycle': {
        const sqmU = areaYieldSqmUnit(col.cv, hy);
        const v = r.yieldPerSqmCycle || 0;
        return st().showRange
          ? r1(v * (1 - st().errorPct / 100)) + '–' + r1(v * (1 + st().errorPct / 100)) + ' ' + sqmU
          : r1(v) + ' ' + sqmU;
      }
      case 'rhoA':
        return Math.round(r.rhoA || 0) + ' ' + pm('u.pcsSqm');
      case 'rhoRec':
        return col.rhoRec != null ? Math.round(col.rhoRec) + ' ' + pm('u.pcsSqm') : '—';
      case 'leafGap':
        return fmtCompareRange(r.leafGap, function(v){ return Math.max(1, Math.abs(v) * st().errorPct / 100); }, pm('unit.mm'));
      case 'cyclesYear':
        return r1(r.cyclesPerYear || 0);
      case 'yieldMo':
        if (!hy || !hy.multicutHarvest) return '—';
        return hy.unitIsPieces
          ? r2(hy.yieldPerSqmMonthPcs) + ' ' + pm('u.pcsMo')
          : r2(hy.yieldPerSqmMonthKg) + ' ' + pm('u.kgSqmMo');
      case 'cutsMo':
        if (!hy || !hy.multicutHarvest) return '—';
        return r1(hy.harvestCutsPerMonth) + ' ' + pm('u.pcs');
      case 'farmKgMonth': {
        const area = getGhUsefulAreaM2();
        if (!(area > 0)) return '—';
        const kgSqmMo = ghYieldKgSqmYear(r, col.cv) / 12;
        return ghYieldWithMargin(kgSqmMo * area, 1) + ' ' + farmYieldMoUnit(hy);
      }
      case 'farmKgYear': {
        const area = getGhUsefulAreaM2();
        if (!(area > 0)) return '—';
        return ghYieldWithMargin(ghYieldKgSqmYear(r, col.cv) * area, 1) + ' ' + farmYieldYrUnit(hy);
      }
      default:
        return '—';
    }
  }
  function renderCvCompareTable(){
    const table = $('cv-compare-table');
    if (!table) return;
    const cmpToggle = $('compareMode');
    if (cmpToggle) cmpToggle.checked = !!st().compareMode;
    if (!st().compareMode){
      table.innerHTML = '';
      return;
    }
    const selected = getCompareSelected();
    const activeId = comparePickActiveId();
    const cols = selected.map(function(c){
      const r = calcForCompareCv(c);
      const hy = plantingHarvestYieldParams ? plantingHarvestYieldParams(c, r) : null;
      var rhoRec = null;
      if (georgyModeRef() && georgyModeRef().canUseCanopyDensityPick && georgyModeRef().canUseCanopyDensityPick(c)){
        rhoRec = georgyModeRef().densityFromCanopy(c);
      }
      return { cv: c, r: r, hy: hy, rhoRec: rhoRec };
    });
    const anyMulticut = cols.some(function(col){ return col.hy && col.hy.multicutHarvest; });
    const anyPcs = cols.some(function(col){
      return (col.hy && col.hy.unitIsPieces) || countIsPieces(col.cv);
    });
    const metricRows = [
      { id: 'mass', label: anyPcs ? pm('m.massPcsCut') : ui('cvCompare.row.mass') },
      { id: 'canopy', label: ui('cvCompare.row.canopy') },
      { id: 'harvestDay', label: ui('cvCompare.row.harvestDay') },
      { id: 'cycle', label: ui('cvCompare.row.cycle') },
      { id: 'kgSqmYear', label: anyPcs ? pm('m.pcsSqmYear') : ui('cvCompare.row.kgSqmYear') },
      { id: 'kgSqmCycle', label: anyPcs ? pm('m.pcsSqmCycle') : ui('cvCompare.row.kgSqmCycle') },
      { id: 'rhoA', label: ui('cvCompare.row.rhoA') },
      { id: 'leafGap', label: ui('cvCompare.row.leafGap') }
    ];
    if (isChannelGreenhouse()){
      metricRows.splice(metricRows.findIndex(function(row){ return row.id === 'rhoA'; }) + 1,
        0, { id: 'rhoRec', label: ui('cvCompare.row.rhoRec') });
    }
    if (!anyMulticut){
      metricRows.push({ id: 'cyclesYear', label: ui('cvCompare.row.cyclesYear') });
    } else {
      metricRows.push({ id: 'yieldMo', label: ui('cvCompare.row.yieldMonth') });
      metricRows.push({ id: 'cutsMo', label: ui('cvCompare.row.cutsMonth') });
    }
    const farmArea = getGhUsefulAreaM2();
    if (farmArea > 0 && isGreenhousePlanting()){
      metricRows.push({
        id: 'farmKgMonth',
        label: anyPcs ? ui('cvCompare.row.farmPcsMonth') : ui('cvCompare.row.farmKgMonth')
      });
      metricRows.push({
        id: 'farmKgYear',
        label: anyPcs ? ui('cvCompare.row.farmPcsYear') : ui('cvCompare.row.farmKgYear')
      });
    }
    let html = '<thead><tr><th></th>';
    cols.forEach(function(col){
      const act = col.cv.id === activeId ? ' cv-compare-col-active' : '';
      html += '<th class="' + act.trim() + '"><span class="cv-compare-th-name">' +
        '<span class="compare-chip-dot" style="background:' + cvColor(col.cv.id) + '"></span>' +
        htmlEsc(col.cv.name) + '</span></th>';
    });
    html += '</tr></thead><tbody>';
    metricRows.forEach(function(row){
      html += '<tr><td class="cv-compare-metric">' + htmlEsc(row.label) + '</td>';
      cols.forEach(function(col){
        const act = col.cv.id === activeId ? ' cv-compare-col-active' : '';
        html += '<td class="' + act.trim() + '">' + formatCvCompareCell(col, row.id) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }
  function setGrowthChartSvg(svgHtml){
    var compareOn = !!st().compareMode;
    var compareEl = $('cv-compare-growth-chart');
    var singleEl = $('growth-chart');
    if (compareOn && compareEl) compareEl.innerHTML = svgHtml;
    else if (singleEl) singleEl.innerHTML = svgHtml;
    if (compareOn && singleEl) singleEl.innerHTML = '';
  }
  function setGrowthChartLegendHtml(html){
    var compareOn = !!st().compareMode;
    if (compareOn){
      var cmpLeg = $('cv-compare-chart-legend');
      if (cmpLeg){
        cmpLeg.style.display = '';
        cmpLeg.innerHTML = html;
      }
      return;
    }
    var leg = $('chart-legend');
    if (leg){
      leg.style.display = '';
      leg.innerHTML = html;
    }
  }
  function bindCompareLegendPills(legendEl){
    if (!legendEl || legendEl.dataset.cmpLegendBound) return;
    legendEl.dataset.cmpLegendBound = '1';
    legendEl.addEventListener('click', function(e){
      const btn = e.target.closest('.cmp-pill');
      if (!btn) return;
      var legId = btn.getAttribute('data-id');
      if (!legId) return;
      if (isPalletView()){
        st().palletCv = legId;
        resetPalletStdToSheetDefaults();
        initPalletValuesFromSheet(getPalletCv());
        updatePlantingGeomUI();
      } else if (isVF()){
        st().vfCv = legId;
        resetVfStdToSheetDefaults();
      } else {
        st().cv = legId;
      }
      deps.renderAll();
      renderCultivars();
    });
  }
  function fillCompareLegend(activeCv){
    const html = st().compareMode
      ? getCompareSelected().map(function(ocv){
          const isOn = ocv.id === activeCv.id;
          return '<button type="button" class="cmp-pill ' + (isOn ? 'on' : '') + '" data-id="' + ocv.id + '">' +
            '<span class="cmp-dot" style="background:' + cvColor(ocv.id) + '"></span>' +
            htmlEsc(ocv.name) + '</button>';
        }).join('')
      : '';
    ['compare-legend', 'cv-compare-legend'].forEach(function(id){
      const legendEl = $(id);
      if (!legendEl) return;
      if (id === 'compare-legend' && st().compareMode) {
        legendEl.innerHTML = '';
        legendEl.style.display = 'none';
        return;
      }
      legendEl.innerHTML = html;
      legendEl.style.display = html ? '' : 'none';
      if (html) bindCompareLegendPills(legendEl);
    });
  }
  function syncCompareMarginUI(){
    const on = !!st().compareMode;
    const marginWrap = $('cv-compare-margin-wrap');
    if (marginWrap) marginWrap.classList.toggle('env-block-hidden', !on);
    const chk = $('compareShowRange');
    if (chk) chk.checked = !!st().showRange;
    const mainRange = $('showRange');
    if (mainRange && document.activeElement !== mainRange) mainRange.checked = !!st().showRange;
    const epRaw = Number(st().errorPct);
    const v = clamp(Math.round(Number.isFinite(epRaw) ? epRaw : 12), 0, 20);
    st().errorPct = v;
    const slider = $('compareErrorPct');
    if (slider && document.activeElement !== slider) slider.value = v;
    const val = $('compareErrorPct-v');
    if (val) val.textContent = String(v);
  }
  function syncGrowthCompareUi(){
    var on = !!st().compareMode;
    var growthBlock = $('block-panel-growth');
    if (growthBlock) growthBlock.classList.toggle('env-block-hidden', on);
    var cmpToggle = $('compareMode');
    if (cmpToggle && document.activeElement !== cmpToggle) {
      cmpToggle.checked = on;
    }
    renderComparePickGrid();
    var leg = $('compare-legend');
    if (leg) leg.style.display = on ? 'none' : (st().compareMode ? '' : 'none');
    if (global.DG_plantingUx) global.DG_plantingUx.syncCvCompareTabs();
  }

  function renderCvCompare(){
    syncGrowthCompareUi();
    syncCompareMarginUI();
    renderCvCompareTable();
  }
  function setCollapseBlock(blockId, collapsed){
    st().sectionCollapsed[blockId] = collapsed;
    const block = $(blockId);
    const body = $(blockId + '-body') || (block && block.querySelector('.collapse-body'));
    const head = block && block.querySelector('.collapse-head');
    if (body) body.classList.toggle('is-collapsed', collapsed);
    if (head){
      const chev = head.querySelector('.collapse-chev');
      if (chev) chev.textContent = collapsed ? '▶' : '▼';
    }
    if (collapsed && block && usePlantingSheet()){
      const keys = (block.dataset.collapseVf || '').split(',').filter(Boolean);
      const pStd = getPlantingStd();
      keys.forEach(k => { if (pStd[k] !== undefined) pStd[k] = true; });
      if (isPalletView()) deps.applyPalletStandardsFromSheet();
      else if (isVF()) applyVfStandardsFromSheet();
      syncVfStdControls();
    }
  }
  function initCollapseBlocks(){
    document.querySelectorAll('.collapse-block').forEach(block => {
      const id = block.id;
      if (st().sectionCollapsed[id] === undefined){
        st().sectionCollapsed[id] = Object.prototype.hasOwnProperty.call(COLLAPSE_DEFAULTS, id)
          ? COLLAPSE_DEFAULTS[id]
          : false;
      }
      setCollapseBlock(id, !!st().sectionCollapsed[id]);
      const head = block.querySelector('.collapse-head');
      if (head && !head.dataset.collapseBound){
        head.dataset.collapseBound = '1';
        head.addEventListener('click', (e) => {
          if (e.target.closest('input, button, a, label')) return;
          const next = !st().sectionCollapsed[id];
          setCollapseBlock(id, next);
          deps.renderAll();
        });
      }
    });
  }

  function cvPanelRefreshNeeded(){
    var el = document.activeElement;
    if (el && el.closest) {
      if (el.closest('#cultivars .cv-catalog-search')) return false;
      /* Не пересобирать сетку, пока фокус на кнопке сорта — иначе клик «съедается» (особенно поддоны/VF). */
      if (el.closest('#cultivars .cv-btn')) return false;
    }
    if (isPalletView() || isVF()) return true;
    if (!el || !el.closest) return true;
    if (el.closest('#cultivars')) {
      var tag = (el.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return false;
      return true;
    }
    var tag = (el.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return false;
    return true;
  }

  function setCultivarsHtml(html, layout) {
    var host = $('cultivars');
    if (!host) return;
    if (layout === 'catalog') {
      host.className = 'cv-catalog-host';
      host.innerHTML = html;
      return;
    }
    host.className = 'cv-catalog-host';
    host.innerHTML = '<div class="cultivar-grid cultivar-grid--pick">' + html + '</div>';
  }

  /* ---- Render: cultivar buttons ---- */
  function renderCultivars(){
    function cvDelBtn(id){
      return '<button type="button" class="cv-del" data-cv-del="' + id + '" title="' + ui('ui.cv.delTitle') + '" aria-label="' + ui('ui.cv.delAria') + '">×</button>';
    }
    function cvBadge(c){
      if (global.DG_cvCalibratedBadgeHtml) {
        return global.DG_cvCalibratedBadgeHtml(c, function (k) { return ui(k); });
      }
      return '';
    }
    function cvOptionTag(c){
      if (c.calibrated === true) return ' · ' + ui('ui.cv.badgeCalibrated');
      if (c.calibrated === false) return ' · ' + ui('ui.cv.badgeEstimated');
      return '';
    }
    function cvBtn(c){
      var noteTip = (c.notes && String(c.notes).trim())
        ? ' title="' + htmlEsc(String(c.notes).trim()) + '"'
        : '';
      return '<button type="button" class="cv-btn ' + (c.id === st().cv ? 'on' : '') + (c.custom ? ' is-custom' : '') + '" data-id="' + c.id + '" data-readonly-allow data-preview-allow"' + noteTip + '>' +
        (c.custom ? cvDelBtn(c.id) : '') +
        '<span class="cv-name">' + c.name + cvBadge(c) + '</span>' +
        '<span class="cv-sub">' + cvSubLine(c) + (c.multicut ? ui('ui.cv.multicutTag') : '') + '</span></button>';
    }
    if (isPalletView() && allPalletCultivars().length){
      var palActive = getPalletCv();
      var palActiveId = palActive ? palActive.id : st().palletCv;
      if (palActiveId && st().palletCv !== palActiveId) st().palletCv = palActiveId;
      function plBtn(c){
        return '<button type="button" class="cv-btn ' + (c.id === palActiveId ? 'on' : '') + '" data-pl-id="' + c.id + '" data-id="' + c.id + '" data-readonly-allow data-preview-allow">' +
          '<span class="cv-name">' + c.name + '</span>' +
          '<span class="cv-sub">' + cvSubLine(c) + (c.multicut ? ui('ui.cv.multicutTag') : '') + '</span></button>';
      }
      let html = '';
      PALLET_SECTIONS.forEach(sec => {
        const list = PALLET_CULTIVARS.filter(c => c.section === sec.id);
        if (!list.length) return;
        html += '<div class="cv-group-h">' + catalogSectionTitle(sec) + '</div>';
        html += list.map(plBtn).join('');
      });
      setCultivarsHtml(html, 'grid');
      renderVfStdGrid();
      syncVfStdControls();
    } else if (isVF() && allVfCultivars().length){
      function vfBtn(c){
        return '<button type="button" class="cv-btn ' + (c.id === st().vfCv ? 'on' : '') + (c.custom ? ' is-custom' : '') + '" data-vf-id="' + c.id + '" data-readonly-allow data-preview-allow">' +
          (c.custom ? cvDelBtn(c.id) : '') +
          '<span class="cv-name">' + c.name + '</span>' +
          '<span class="cv-sub">' + cvSubLine(c) + (c.multicut ? ui('ui.cv.multicutTag') : '') + '</span></button>';
      }
      let html = '';
      VF_SECTIONS.forEach(sec => {
        const list = VF_CULTIVARS.filter(c => c.section === sec.id);
        if (!list.length) return;
        html += '<div class="cv-group-h">' + catalogSectionTitle(sec) + '</div>';
        html += list.map(vfBtn).join('');
      });
      const customVf = st().customVfCultivars || [];
      if (customVf.length){
        html += '<div class="cv-group-h">' + ui('ui.cv.myCultivars') + '</div>';
        html += customVf.map(vfBtn).join('');
      }
      setCultivarsHtml(html, 'grid');
      renderVfStdGrid();
      syncVfStdControls();
    } else {
    function renderGhCatalogGrouped(ghList){
      var q = global.DG_getGhCvSearch ? global.DG_getGhCvSearch() : '';
      var calOnly = global.DG_getGhCvCalibratedOnly && global.DG_getGhCvCalibratedOnly();
      var farmOnly = global.DG_getGhCvFarmCalOnly && global.DG_getGhCvFarmCalOnly();
      if (global.DG_filterGhCatalogList) {
        ghList = global.DG_filterGhCatalogList(ghList, q, st().cv);
      } else if (global.DG_filterGhCultivars) {
        ghList = global.DG_filterGhCultivars(ghList, q);
      }
      var groups = global.DG_groupGhCultivars(ghList, st().cv);
      var openIfSearch = q.length > 0;
      var html = '<div class="cv-catalog-toolbar">';
      html += '<div class="cv-catalog-toolbar-top">';
      html += '<label class="cv-catalog-search-label">' + ui('ui.cv.search') + ' ';
      html += '<input type="search" class="cv-catalog-search" value="' + htmlEsc(q) + '" placeholder="' +
        htmlEsc(ui('ui.cv.searchPh')) + '" autocomplete="off" spellcheck="false"></label>';
      html += '<label class="cv-catalog-filter-label"><input type="checkbox" class="cv-catalog-calibrated-only"' +
        (calOnly ? ' checked' : '') + '> ' + ui('ui.cv.calibratedOnly') + '</label>';
      html += '<label class="cv-catalog-filter-label"><input type="checkbox" class="cv-catalog-farm-cal-only"' +
        (farmOnly ? ' checked' : '') + '> ' + ui('ui.cv.farmCalOnly') + '</label>';
      html += '</div></div>';
      html += '<p class="cv-catalog-hint">' + ui('ui.cv.catalogHint') + '</p>';
      if (!ghList.length) {
        html += '<p class="cv-catalog-empty">' + (calOnly || farmOnly ? ui('ui.cv.calibratedEmpty') : ui('ui.cv.searchEmpty')) + '</p>';
      } else {
        html += '<div class="cv-catalog-grouped">';
        groups.forEach(function (grp) {
          if (!grp.items.length) return;
          var open = grp.hasActive || openIfSearch;
          html += '<details class="cv-category"' + (open ? ' open' : '') + '>';
          html += '<summary class="cv-category-summary"><span class="cv-category-title">' + htmlEsc(grp.label) + '</span>';
          html += '<span class="cv-category-count">' + grp.items.length + '</span></summary>';
          html += '<div class="cv-category-body">';
          html += '<label class="cv-cat-select-label">' + ui('ui.cv.catSelect') + ' ';
          html += '<select class="cv-cat-select" data-gh-cat="' + htmlEsc(grp.id) + '">';
          grp.items.forEach(function (c) {
            html += '<option value="' + htmlEsc(c.id) + '"' + (c.id === st().cv ? ' selected' : '') + '>' +
              htmlEsc(c.name) + cvOptionTag(c) + '</option>';
          });
          html += '</select></label>';
          html += '<div class="cultivar-grid cv-cat-grid">' + grp.items.map(cvBtn).join('') + '</div>';
          html += '</div></details>';
        });
        html += '</div>';
      }
      var host = $('cultivars');
      var prevFocus = document.activeElement;
      var wasSearch = !!(prevFocus && prevFocus.closest && prevFocus.closest('#cultivars .cv-catalog-search'));
      var caretStart = wasSearch ? prevFocus.selectionStart : null;
      var caretEnd = wasSearch ? prevFocus.selectionEnd : null;
      host.className = 'cv-catalog-host';
      host.innerHTML = html;
      if (wasSearch) {
        var searchInp = host.querySelector('.cv-catalog-search');
        if (searchInp) {
          try { searchInp.focus({ preventScroll: true }); } catch (_) { searchInp.focus(); }
          try {
            if (caretStart != null) searchInp.setSelectionRange(caretStart, caretEnd != null ? caretEnd : caretStart);
          } catch (_) {}
        }
      }
    }
    if (georgyModeRef() && georgyModeRef().isGeorgyGh()){
      const georgyList = georgyModeRef().filterGeorgyCultivars(allGhCultivars());
      const salad = georgyList.filter(c => !c.babyGreen);
      const baby = georgyList.filter(c => c.babyGreen);
      let html = '';
      if (salad.length) html += '<div class="cv-group-h">' + ui('ui.cv.ghSalad') + '</div>' + salad.map(cvBtn).join('');
      if (baby.length) html += '<div class="cv-group-h">' + ui('ui.cv.ghBaby') + '</div>' + baby.map(cvBtn).join('');
      setCultivarsHtml(html, 'grid');
    } else {
      const ghList = allGhCultivars();
      if (global.DG_useGroupedGhCultivarUi && global.DG_useGroupedGhCultivarUi(ghList) && global.DG_groupGhCultivars) {
        renderGhCatalogGrouped(ghList);
      } else {
        const builtSalad = ghList.filter(c => !c.babyGreen);
        const builtBaby = ghList.filter(c => c.babyGreen);
        let html = '<div class="cv-group-h">' + ui('ui.cv.ghSalad') + '</div>' + builtSalad.map(cvBtn).join('');
        html += '<div class="cv-group-h">' + ui('ui.cv.ghBaby') + '</div>' + builtBaby.map(cvBtn).join('');
        setCultivarsHtml(html, 'grid');
      }
    }
    }

    const bWrap = $('cultivars-B');
    if (bWrap){
      const scenList = isPalletView() ? allPalletCultivars() : (isVF() ? allVfCultivars() : allGhCultivars());
      if (!isPalletView() && !isVF() && global.DG_groupGhCultivars && global.DG_useGroupedGhCultivarUi(scenList)) {
        var cmpList = scenList;
        var cq = global.DG_getGhCvSearch ? global.DG_getGhCvSearch() : '';
        if (global.DG_filterGhCatalogList) {
          cmpList = global.DG_filterGhCatalogList(scenList, cq, st().cvB);
        } else if (global.DG_filterGhCultivars && cq) {
          cmpList = global.DG_filterGhCultivars(scenList, cq);
        }
        const groups = global.DG_groupGhCultivars(cmpList, st().cvB);
        let sel = '<label class="cv-cat-select-label">' + ui('ui.cv.comparePick') + ' ';
        sel += '<select class="cv-compare-select" id="cvB-grouped-select">';
        groups.forEach(function (grp) {
          if (!grp.items.length) return;
          sel += '<optgroup label="' + htmlEsc(grp.label) + '">';
          grp.items.forEach(function (c) {
            sel += '<option value="' + htmlEsc(c.id) + '"' + (c.id === st().cvB ? ' selected' : '') + '>' +
              htmlEsc(c.name) + cvOptionTag(c) + '</option>';
          });
          sel += '</optgroup>';
        });
        sel += '</select></label>';
        bWrap.innerHTML = sel;
        var cmpSel = document.getElementById('cvB-grouped-select');
        if (cmpSel && !cmpSel.dataset.bound) {
          cmpSel.dataset.bound = '1';
          cmpSel.addEventListener('change', function () {
            st().cvB = cmpSel.value;
            renderCultivars();
            deps.renderAll();
          });
        }
      } else {
        bWrap.innerHTML = scenList.map(c =>
          '<button class="cv-btn ' + (c.id === st().cvB ? 'on' : '') + '" data-id="' + c.id + '">' +
          '<span class="cv-name">' + c.name + '</span>' +
          '<span class="cv-sub">' + cvSubLine(c) + '</span></button>'
        ).join('');
        bWrap.querySelectorAll('.cv-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            st().cvB = btn.dataset.id;
            renderCultivars();
            deps.renderAll();
          });
        });
      }
    }
    syncVfStdControls();
  }


  /* ---- Render: month buttons ---- */
  function renderMonths(){
    $('months').innerHTML = NATURAL_DLI.map((m, i) =>
      '<button class="month-btn ' + (i + 1 === st().month ? 'on' : '') + '" data-m="' + (i + 1) + '">' + monthLabel(i + 1) + '</button>'
    ).join('');
    document.querySelectorAll('#months .month-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        st().month = parseInt(btn.dataset.m);
        renderMonths();
        deps.renderAll();
      });
    });

    const bWrap = $('months-B');
    if (bWrap){
      bWrap.innerHTML = NATURAL_DLI.map((m, i) =>
        '<button class="month-btn ' + (i + 1 === st().monthB ? 'on' : '') + '" data-m="' + (i + 1) + '">' + monthLabel(i + 1) + '</button>'
      ).join('');
      bWrap.querySelectorAll('.month-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          st().monthB = parseInt(btn.dataset.m);
          renderMonths();
          deps.renderAll();
        });
      });
    }
  }

  /* ---- Render: stage bar ---- */
  function renderStage(r){
    document.querySelectorAll('#stage-bar .stage-seg').forEach(seg => {
      const key = seg.dataset.stage;
      seg.classList.toggle('on', key === r.st);
      const lbl = seg.querySelector('.stage-lbl');
      if (lbl) lbl.textContent = stageLabel(key);
    });
  }

  /* ---- Render: env summary ---- */
  function showEnvBoltPill(cv) {
    if (isVF() || isPalletView() || !isChannelGreenhouse()) return false;
    var gm = georgyModeRef();
    if (!(gm && gm.isHeadLettuceChannel && gm.isHeadLettuceChannel(cv))) return false;
    return boltShift(cv) > 0;
  }

  function renderEnvSummary(r){
    const nat = naturalDLI();
    const eff = effectiveDLI();
    const dayS = daySupplement();
    const eveS = eveningSupplement();
    const eveH = eveningHours();
    const ph = photoperiod();
    const effPh = effectivePhotoperiod();
    const dliF = dliFactor();
    const phF = photoperiodFactor();
    const tF = effectiveTempFactor(r.cv);
    const mult = envMultiplier(r.cv);
    const mol = ui('ui.unit.mol');
    const hUnit = ui('ui.unit.hDay');
    const ppfdUnit = ui('ui.unit.umolSq');
    const umolJ = ui('ui.unit.umol');
    const dUnit = pm('unit.days');

    function pillClass(f, neutralAt){
      const ref = neutralAt || 1.0;
      if (f >= ref * 0.95) return 'ok';
      if (f >= ref * 0.75) return 'warn';
      return 'bad';
    }
    function pct(f){ return r1((f - 1) * 100); }
    function sign(p){ return p >= 0 ? '+' : ''; }
    function dliPill(f){ return '<span class="env-pill ' + pillClass(f) + '">DLI ' + sign(pct(f)) + pct(f) + '%</span>'; }
    function envFactorPill(lbl, f){
      return '<span class="env-pill ' + pillClass(f) + '">' + lbl + ' ' + sign(pct(f)) + pct(f) + '%</span>';
    }
    function tempPill(f){
      const lbl = (isVF() || isPalletView()) ? 'T' : ui('ui.env.temp');
      return envFactorPill(lbl, f);
    }

    let row1, row2;
    if (isVF() || isPalletView()){
      const kwhDay = kwhPerSqmPerDayFromDli(eff);
      const ppfdShow = Math.round(ppfdFromDli(eff, effPh));
      row1 = '<div class="env-row">' +
        '<span>' + ui('ui.env.idealLightClosed') + '</span>' +
        '<span><strong>' + r1(eff) + '</strong> ' + mol + ' · ' + r1(effPh) + ' ' + hUnit + ' · ~' + ppfdShow + ' ' + ppfdUnit + '</span>' +
        '<span class="env-pill ok">' + ui('ui.env.ledPill', { eff: r1(ledEfficacy()) }) + '</span>' +
        '<span style="opacity:0.8">' + ui('ui.env.kwhApprox', { val: r1(kwhDay), unit: ui('ui.env.kwhDay') }) + '</span></div>' +
        '<div class="env-row env-row--hint"><span style="opacity:0.85;font-size:12.5px">' + ui('ui.env.idealLightNote') + '</span></div>';
      const GLM = global.DG_growthLightModel;
      const vfTempF = (isVF() && GLM && GLM.vfTempResponseFactor) ? GLM.vfTempResponseFactor(st().temp) : tF;
      const vfRhF = (isVF() && GLM && GLM.vfRhGrowthFactor) ? GLM.vfRhGrowthFactor(st().rh) : 1;
      const envPills = isVF() && GLM && GLM.vfTempResponseFactor
        ? envFactorPill('T', vfTempF) + (vfRhF < 0.999 ? envFactorPill('RH', vfRhF) : '')
        : tempPill(tF);
      row2 = '<div class="env-row">' +
        '<span>' + ui('ui.env.growthRate') + '</span><strong>×' + r2(mult) + '</strong>' +
        dliPill(dliF) + envPills +
        '<span style="opacity:0.75">' + ui('ui.env.rhTopt', { rh: st().rh, t: r.cv.t_opt }) + '</span>';
      if (st().temp > 26){
        row2 += '<span class="env-pill bad">' + ui('ui.env.tempMoldHint', { temp: r1(st().temp) }) + '</span>';
      }
      row2 += '</div>';
    } else {
      row1 = '<div class="env-row">' +
        '<span>' + ui('ui.env.light') + '</span>' +
        '<span>' + ui('ui.env.natLine', { nat: r1(nat), mol: mol, ph: r1(ph), hUnit: hUnit }) + '</span>';
      if (st().lighting){
        if (dayS > 0){
          row1 += '<span class="env-pill ok">' + ui('ui.env.dayPill', { day: ui('ui.env.daySupp'), val: r1(dayS), mol: mol }) + '</span>';
        }
        if (eveS > 0){
          row1 += '<span class="env-pill ok">' + ui('ui.env.evePill', { eve: ui('ui.env.eveSupp'), h: r1(eveH), val: r1(eveS), mol: mol }) + '</span>';
        }
        if (dayS === 0 && eveS === 0){
          row1 += '<span class="env-pill ok">' + ui('ui.env.noSupp') + '</span>';
        }
        row1 += '<span>' + ui('ui.env.totalLine', { eff: r1(eff), mol: mol, ph: r1(effPh), hUnit: hUnit }) + '</span>';
        row1 += '<span style="opacity:0.8">' + ui('ui.env.eff') + ' ' + r1(st().ledEfficacyGh) + ' ' + umolJ + '</span>';
      } else {
        if (nat < 14) row1 += '<span class="env-pill bad">' + ui('ui.env.lowLight') + '</span>';
        else row1 += '<span class="env-pill ok">' + ui('ui.env.noSuppNeed') + '</span>';
      }
      row1 += '</div>';

      row2 = '<div class="env-row">' +
        '<span>' + ui('ui.env.growthRate') + '</span>' +
        '<strong>×' + r2(mult) + '</strong>' +
        dliPill(dliF) + tempPill(tF) +
        (phF > 1.01 ? '<span class="env-pill ok">' + ui('ui.env.eveGrowthPill', { pct: sign(pct(phF)) + pct(phF) }) + '</span>' : '') +
        '<span style="opacity:0.75">' + ui('ui.env.cultOpt') + ' ' + r.cv.t_opt + '°C</span>';
      if (showEnvBoltPill(r.cv)){
        const shift = boltShift(r.cv);
        row2 += '<span class="env-pill ' + (shift > 5 ? 'bad' : 'warn') + '">' +
          ui('ui.env.boltEarly') + ' ' + r1(shift) + ' ' + dUnit + '</span>';
      }
      row2 += '</div>';
    }

    $('env-summary').innerHTML = row1 + row2;

    if (!isVF()){
    const ll = $('lighting-label');
    if (ll){
      if (st().lighting){
        const parts = [];
        if (dayS > 0) parts.push('+' + r1(dayS) + ' ' + ui('ui.unit.mol') + ' ' + ui('ui.env.daySupp'));
        if (eveS > 0) parts.push('+' + r1(eveS) + ' ' + ui('ui.unit.mol') + ' ' + ui('ui.env.eveSupp'));
        if (parts.length) ll.textContent = ui('ui.light.on', { parts: parts.join(', ') });
        else ll.textContent = ui('ui.light.onEnough');
      } else {
        ll.textContent = ui('ui.light.off');
      }
    }
    }
  }

  /* ---- Render: metrics ---- */
  function renderMetrics(r){
    const pallet = showAsPalletCalc(r);
    const trayLot = !!(r && r.trayLot) || (global.DG_isTrayLotCrop && r.cv && global.DG_isTrayLotCrop(r.cv));
    let rateClass = 'hl';
    if (r.rgrMass < 2) rateClass = 'warn-tint';
    if (r.t_ch >= r.tBoltCh) rateClass = 'bad-tint';

    const massRange = rangeMass(r.mass);
    const canopyRange = rangeCanopy(r.canopy);
    const dayRange = rangeDay();

    const outUnit = r.countUnit === 'шт' ? pm('u.pcs') : pm('unit.g');
    const massLabel = (function () {
      if (countIsPieces(r.cv)) return pm('m.massPcsCut');
      if (st().useManualMass) return (r.vfSheet || pallet) ? pm('m.massCut') : pm('m.massHarvest');
      if (r.cv.babyGreen) return pm('m.massProduct');
      if (pallet || isVF() || r.vfSheet) return pm('m.massCut');
      return pm('m.massHead');
    })();
    const massHtml = (st().useManualMass && !st().showRange)
      ? (round(r.mass) + '<span class="m-unit">' + outUnit + '</span><span class="m-range">' + pm('m.model') + ': ' + round(r.massAuto) + ' ' + outUnit + '</span>')
      : withRange(r.mass, massRange, outUnit) +
        (st().useManualMass ? '<span class="m-range">' + pm('m.model') + ': ' + round(r.massAuto) + ' ' + outUnit + '</span>' : '');
    const vegU = pallet ? pm('u.vegPal') : (isVF() ? pm('u.vegVf') : pm('u.vegCh'));
    const growth = [
      { l: massLabel, vHtml: massHtml, cls: 'hl' },
      ...(trayLot ? [] : [
        { l: pm('m.canopyDiam'), vHtml: withRange(r.canopy, canopyRange, pm('unit.mm')) },
        { l: pm('m.massGain'), v: r1(r.rgrMass), u: pm('u.pctDay'), cls: rateClass },
        { l: pm('m.canopyGain'), v: r1(r.rgrCanopy), u: pm('u.pctDay') }
      ]),
      (function(){
        if (trayLot) {
          var harvestT = Math.round(r.t_ch);
          var subT = tr('m.trayLotAgeBreakdown', { channel: harvestT, dUnit: pm('unit.days') });
          if (!subT || subT === 'm.trayLotAgeBreakdown') subT = pm('m.cycle') + ' ' + harvestT;
          return {
            l: pm('m.cycle'),
            vHtml: round(r.t_total) + '<span class="m-unit">' + pm('unit.days') + '</span>' +
              '<span class="m-range">' + subT + '</span>',
            cls: 'hl'
          };
        }
        var ghCh = deps.getGhChannelSimple && deps.getGhChannelSimple();
        var showBreakdown = ghCh && ghCh.isEnabled && ghCh.isEnabled() &&
          ghCh.isHeadSalad && ghCh.isHeadSalad(r.cv);
        if (!showBreakdown) {
          return { l: pm('m.totalAge'), v: round(r.t_total), u: pm('unit.days') };
        }
        var germ = Math.round(st().germination);
        var nursery = Math.round(st().nursery);
        var channel = Math.round(r.t_ch);
        var sub = tr('m.totalAgeBreakdown', Object.assign({ germ: germ, nursery: nursery, channel: channel }, growCtxParams()));
        if (!sub || sub === 'm.totalAgeBreakdown') {
          sub = germ + '+' + nursery + '+' + channel;
        }
        return {
          l: pm('m.totalAge'),
          vHtml: round(r.t_total) + '<span class="m-unit">' + pm('unit.days') + '</span>' +
            '<span class="m-range">' + sub + '</span>'
        };
      })(),
      ...(trayLot ? [] : [
        { l: pm('m.harvestRec'), vHtml: withRange(r.tHarvestCh, dayRange, vegU) }
      ]),
      ...((function(){
        if (!supportsMulticut(r.cv) || !st().multicut) return [];
        if (georgyModeRef() && georgyModeRef().isGeorgyGh()) return [];
        const ms = vfMulticutStats(r.cv);
        return [
          { l: pm('m.cutsMonth'), v: r1(ms.cutsPerMonth), u: pm('u.pcs') },
          { l: pm('m.cutsCycle'), v: ms.cutsInCycle, u: pm('u.pcs') },
          { l: pm('m.replaceMo'), v: r1(ms.monthsToReplace), u: pm('u.mo') }
        ];
      })())
    ];
    $('metrics-growth').innerHTML = growth.map(m => {
      const inner = m.vHtml || (m.v + '<span class="m-unit">' + m.u + '</span>');
      const valClass = (m.vHtml && st().showRange) ? 'm-val has-range' : 'm-val';
      return '<div class="m ' + (m.cls || '') + '"><div class="m-label">' + m.l + '</div><div class="' + valClass + '">' + inner + '</div></div>';
    }).join('');

    const geom = pallet ? (trayLot ? [
      { l: pm('m.zoneLen'), v: ((r.zoneLenMm || 0) / 1000).toFixed(1), u: ui('ui.metrics.zoneLen', { along: r.alongLength || 0 }) },
      { l: pm('m.palAlong'), v: r.alongLength, u: pm('u.pcs') },
      { l: pm('m.palTotal'), v: r.totalPallets, u: pm('u.pcs') },
      { l: pm('m.plantsPal'), v: r.plantsPerPallet, u: pm('u.pcs') },
      { l: pm('m.densityTrayLot'), v: round(r.rhoA || 0), u: pm('u.pcsSqm') }
    ] : [
      { l: pm('m.zoneLen'), v: ((r.zoneLenMm || 0) / 1000).toFixed(1), u: ui('ui.metrics.zoneLen', { along: r.alongLength || 0 }) },
      { l: pm('m.palAlong'), v: r.alongLength, u: pm('u.pcs') },
      { l: pm('m.palTotal'), v: r.totalPallets, u: pm('u.pcs') },
      ...(r.mountMode === 'cassette' ? [
        { l: pm('m.cassPerPal'), v: CASSETTES_PER_PALLET, u: pm('u.pcs') + ' ' + ui('ui.pal.cassetteDims') },
        { l: pm('m.cellsCass'), v: r.cellsPerCassette, u: pm('u.pcs') }
      ] : [
        { l: pm('m.holesPal'), v: r.cellsPerCassette, u: pm('u.pcs') + ' ' + ui('ui.pal.lidDims') }
      ]),
      { l: pm('m.plantsPal'), v: r.plantsPerPallet, u: pm('u.pcs') },
      { l: pm('m.cellPitch'), v: round(r.cellPitch), u: pm('unit.mm') }
    ]) : [
      { l: pm('m.pitchA'), v: round(r.a), u: pm('unit.mm') },
      ...(r.vfMode ? [
        { l: pm('m.perRow'), v: r.perRow, u: pm('u.pcs') },
        { l: pm('m.chanPlant'), v: ui('ui.schema.chanPlant2'), u: '' }
      ] : []),
      { l: pm('m.gapB'), v: round(r.b), u: pm('unit.mm') },
      { l: pm('m.diag'), v: round(r.diag), u: pm('unit.mm') },
      { l: (r.vfMode ? pm('m.holeGap') : pm('m.potGap')), v: round(r.edgeGap), u: pm('unit.mm') }
    ];
    $('metrics-geom').innerHTML = geom.map(m =>
      '<div class="m"><div class="m-label">' + m.l + '</div><div class="m-val">' + m.v + '<span class="m-unit">' + m.u + '</span></div></div>'
    ).join('');

    let leafCls = 'hl';
    var georgyHeadGap = georgyModeRef() && georgyModeRef().isGeorgyGh() &&
      georgyModeRef().isGeorgyHeadSalad && georgyModeRef().isGeorgyHeadSalad(r.cv);
    var ghChOn = deps.getGhChannelSimple && deps.getGhChannelSimple() && deps.getGhChannelSimple().isEnabled();
    var canopyPickGap = !pallet && !isVF() && st().facility === 'greenhouse' &&
      georgyModeRef() && georgyModeRef().canUseCanopyDensityPick(r.cv) &&
      (ghChOn || st().georgyMode);
    var overlapMax = (georgyModeRef() && georgyModeRef().MAX_LEAF_OVERLAP_MM) || 20;
    if (georgyHeadGap || canopyPickGap) {
      if (r.leafGap < -overlapMax) leafCls = 'bad-tint';
      else if (r.leafGap < 0) leafCls = 'warn-tint';
    } else if (r.leafGap < -25) leafCls = 'bad-tint';
    else if (r.leafGap < 0) leafCls = 'warn-tint';

    const canopyArr = trayLot ? [] : [
      { l: pm('m.canopyDiam'), vHtml: withRange(r.canopy, rangeCanopy(r.canopy), pm('unit.mm')) },
      { l: pallet ? pm('m.cellPitch') : pm('m.nearest'), v: round(pallet ? r.cellPitch : r.nearest), u: pm('unit.mm') },
      { l: r.leafGap >= 0 ? pm('m.leafGap') : pm('m.leafOverlap'), v: round(Math.abs(r.leafGap)), u: pm('unit.mm'), cls: leafCls }
    ];
    $('metrics-canopy').innerHTML = canopyArr.length ? canopyArr.map(m => {
      const inner = m.vHtml || (m.v + '<span class="m-unit">' + m.u + '</span>');
      const valClass = (m.vHtml && st().showRange) ? 'm-val has-range' : 'm-val';
      return '<div class="m ' + (m.cls || '') + '"><div class="m-label">' + m.l + '</div><div class="' + valClass + '">' + inner + '</div></div>';
    }).join('') : '';

    const drift = Math.abs(r.rhoA - r.rhoT) > 0.5;
    const sys = [
      { l: trayLot ? pm('m.densityTrayLot') : pm('m.density'), v: round(r.rhoA), u: pm('u.pcsSqm'), cls: (trayLot || drift) ? 'hl' : '' },
      { l: pm('m.sysWidth'), v: round(r.sysWmm), u: pm('unit.mm'), cls: (!pallet && r.widthExceeds) ? 'bad-tint' : ((!pallet && r.widthClose) ? 'warn-tint' : '') },
      { l: pallet ? pm('m.plantsPal') : pm('m.plantsChan'), v: r.perChan, u: pm('u.pcs') },
      ...(pallet && r.palletTiers > 1 ? [
        { l: pm('m.tiers'), v: r.palletTiers, u: pm('u.pcs') },
        { l: pm('m.plantsTier'), v: r.plantsPerTier != null ? r.plantsPerTier : Math.round((r.total || 0) / Math.max(1, r.palletTiers)), u: pm('u.pcs') },
        { l: pm('m.rackH'), v: round(r.rackHeightMm), u: pm('unit.mm') }
      ] : []),
      { l: pm('m.totalPlants'), v: r.total, u: pm('u.pcs') },
      { l: pallet ? pm('m.areaTiers') : pm('m.sysArea'), v: (r.sysArea != null ? r.sysArea : 0).toFixed(2), u: 'm²' },
      ...(pallet && r.footprintAreaM2 != null ? [
        { l: pm('m.footprint'), v: r.footprintAreaM2.toFixed(2), u: 'm²' }
      ] : []),
      { l: trayLot ? pm('m.cycle') : (function(){
          if (st().multicut && supportsMulticut(r.cv)) return pm('m.firstCut');
          if (georgyModeRef() && georgyModeRef().isGeorgyGh() && georgyModeRef().isGeorgyHeadSalad(r.cv)) return ui('georgy.totalDaysFromSow');
          if (!pallet && !isVF() && r.usefulAreaBasis === 'main_hall' && r.mainHallIntervalDays > 0) {
            return (ghChOn && !st().georgyMode) ? ui('ghCh.mainHallTurnover') : ui('georgy.mainHallTurnover');
          }
          return pm('m.cycle');
        })(),
        v: (function(){
          if (georgyModeRef() && georgyModeRef().isGeorgyGh() && georgyModeRef().isGeorgyHeadSalad(r.cv) && r.totalDaysFromSow != null) return r.totalDaysFromSow;
          if (!pallet && !isVF() && r.usefulAreaBasis === 'main_hall' && r.mainHallIntervalDays > 0) return r.mainHallIntervalDays;
          return r.totalCycleDays != null ? r.totalCycleDays : '—';
        })(), u: pm('unit.days') },
      ...((function(){
        const hy = plantingHarvestYieldParams ? plantingHarvestYieldParams(r.cv, r) : null;
        if (hy && hy.multicutHarvest){
          const ySqm = hy.unitIsPieces
            ? r1(hy.yieldPerSqmMonthPcs) + ' ' + pm('u.pcsMo')
            : r2(hy.yieldPerSqmMonthKg) + ' ' + pm('u.kgSqmMo');
          const yPotMo = hy.unitIsPieces
            ? r1(hy.yieldPerPotMonth) + ' ' + pm('u.pcsMo')
            : round(hy.yieldPerPotMonth) + ' ' + pm('unit.g');
          const kgYr = hy.unitIsPieces
            ? (hy.yieldPerSqmMonthPcs > 0 ? hy.yieldPerSqmMonthPcs * 12 : (r.yieldPerSqmYear || 0))
            : (r.yieldPerSqmYear > 0
              ? r.yieldPerSqmYear
              : (hy.yieldPerSqmMonthKg > 0 ? hy.yieldPerSqmMonthKg * 12 : 0));
          const sysMo = hy.unitIsPieces
            ? Math.round(hy.yieldPerPotMonth * (r.total || 0))
            : (hy.yieldPerPotMonth / 1000) * (r.total || 0);
          const sysYr = sysMo * 12;
          const sysMoU = hy.unitIsPieces ? pm('u.pcs') + '/мес' : 'kg';
          const yrSqmU = areaYieldSqmUnit(r.cv, hy);
          return [
            { l: pm('m.cutMass'), v: round(hy.harvestYieldPerCut), u: hy.yieldUnit, cls: 'hl' },
            { l: pm('m.cutInterval'), v: hy.harvestCutIntervalDays, u: pm('unit.days') },
            { l: pm('m.cutsMonth'), v: r1(hy.harvestCutsPerMonth), u: pm('u.pcs') },
            { l: pm('m.yieldPotMo'), v: yPotMo, u: '', cls: 'hl' },
            { l: pm('m.yieldMo'), v: ySqm, u: '', cls: 'hl' },
            { l: pm('m.yieldSysMo'), v: r1(sysMo), u: sysMoU, cls: 'hl' },
            { l: pm('m.yieldSysYear'), v: r1(sysYr), u: sysMoU, cls: 'hl' },
            { l: hy.unitIsPieces ? pm('m.pcsSqmYear') : pm('m.kgSqmYear'), v: r1(kgYr), u: yrSqmU, cls: 'hl' },
            ...(hy.yieldPerPotLife != null ? [
              { l: pm('m.lifeSum'), v: round(hy.yieldPerPotLife), u: hy.yieldUnit }
            ] : [])
          ];
        }
        if (hy && r.mainHallIntervalDays > 0 && r.usefulAreaBasis === 'main_hall'){
          const ySqm = hy.unitIsPieces
            ? r1(hy.yieldPerSqmMonthPcs) + ' ' + pm('u.pcsMo')
            : r2(hy.yieldPerSqmMonthKg) + ' ' + pm('u.kgSqmMo');
          const yPotMo = hy.unitIsPieces
            ? r1(hy.yieldPerPotMonth) + ' ' + pm('u.pcsMo')
            : round(hy.yieldPerPotMonth) + ' ' + pm('unit.g');
          return [
            { l: pm('m.cutMass'), v: round(hy.harvestYieldPerCut), u: hy.yieldUnit, cls: 'hl' },
            { l: ui('georgy.mainHallTurnover'), v: hy.harvestCutIntervalDays, u: pm('unit.days') },
            { l: pm('m.cutsMonth'), v: r1(hy.harvestCutsPerMonth), u: pm('u.pcs') },
            { l: pm('m.yieldPotMo'), v: yPotMo, u: '', cls: 'hl' },
            { l: pm('m.yieldMo'), v: ySqm, u: '', cls: 'hl' },
            { l: countIsPieces(r.cv) ? pm('m.pcsSqmYear') : pm('m.kgSqmYear'), v: r1(r.yieldPerSqmYear || 0), u: areaYieldSqmUnit(r.cv, hy), cls: '' }
          ];
        }
        const pcsCv = countIsPieces(r.cv);
        const cycleU = pcsCv ? pm('u.pcs') : 'kg';
        const sqmU = areaYieldSqmUnit(r.cv, null);
        return [
          { l: pm('m.cyclesYear'), v: r1(r.cyclesPerYear || 0), u: pm('u.pcs'), cls: 'hl' },
          { l: pm('m.yieldCycle'), v: (r.yieldPerCycleKg != null ? r.yieldPerCycleKg : 0).toFixed(1), u: cycleU, cls: 'hl' },
          { l: pcsCv ? pm('m.pcsSqmCycle') : pm('m.kgSqmCycle'), v: r1(r.yieldPerSqmCycle || 0), u: sqmU },
          { l: pcsCv ? pm('m.pcsSqmYear') : pm('m.kgSqmYear'), v: r1(r.yieldPerSqmYear || 0), u: sqmU, cls: 'hl' },
          ...(pallet ? [
            { l: pm('m.yieldPal'), v: ((r.yieldPerCycleKg || 0) / Math.max(1, r.totalPalletSlots || r.totalPallets || 1)).toFixed(1), u: pcsCv ? pm('u.pcs') : pm('u.kgPal') }
          ] : [])
        ];
      })())
    ];
    $('metrics-sys').innerHTML = sys.map(m =>
      '<div class="m ' + (m.cls || '') + '"><div class="m-label">' + m.l + '</div><div class="m-val">' + m.v + '<span class="m-unit">' + m.u + '</span></div></div>'
    ).join('');
    const sysEl = $('metrics-sys');
    if (sysEl){
      const hyMcHint = plantingHarvestYieldParams ? plantingHarvestYieldParams(r.cv, r) : null;
      const showYearHint = !(hyMcHint && hyMcHint.multicutHarvest) && (r.cyclesPerYear > 0 || r.yieldPerSqmYear > 0);
      if (showYearHint) sysEl.insertAdjacentHTML('beforeend', '<p class="planting-year-month-hint">' + pm('m.yearMonthHint') + '</p>');
      if (global.DG_buildCalcTrace && global.DG_calcTraceHtml) {
        var traceRows = global.DG_buildCalcTrace(r, r.cv, st(), deps);
        sysEl.insertAdjacentHTML('beforeend', global.DG_calcTraceHtml(traceRows, htmlEsc));
      }
    }
    syncHarvestBlockUI(r);
    updateMassModelHint(r.massAuto, r.mass, modelCanopyFromMass(r.cv, r.massAuto), r.canopy);
    renderGhYieldTotals(r);
  }

  /* ---- Render: growth chart ---- */
  function renderChart(r){
    const W = 760, H = 268;
    const padL = 48, padR = st().compareMode ? 16 : 48, padT = 22, padB = 36;
    const dW = W - padL - padR;
    const dH = H - padT - padB;
    const cv = r.cv;
    const boltCh = boltChannel(cv);

    const xMin = 0;
    const xMax = Math.max(40, Math.ceil(Math.max(r.t_ch || 0, r.tHarvestCh || 0, boltCh || 0, 10) / 5) * 5);
    /* When comparing all cultivars, scale Y to fit the largest one */
    let yMassRef = cv.M_max || 40;
    if (st().compareMode){
      getCompareSelected().forEach(ocv => { if (ocv.M_max > yMassRef) yMassRef = ocv.M_max; });
    }
    const yMassMax = Math.max(50, Math.ceil(yMassRef / 50) * 50);
    const yCanopyMax = Math.max(50, Math.ceil((cv.ca || 10) * Math.sqrt(cv.M_max || 40) / 50) * 50);

    const xs = t => padL + (t - xMin) / (xMax - xMin) * dW;
    const ysM = m => padT + dH - (m / yMassMax) * dH;
    const ysC = c => padT + dH - (c / yCanopyMax) * dH;

    let svg = '';

    if (boltCh < xMax){
      const bx = xs(Math.max(boltCh, xMin));
      svg += '<rect x="' + bx + '" y="' + padT + '" width="' + (padL + dW - bx) + '" height="' + dH + '" class="svg-bolt-zone"/>';
    }

    for (let m = 0; m <= yMassMax; m += 50){
      const y = ysM(m);
      svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (padL + dW) + '" y2="' + y + '" class="svg-grid"/>';
      svg += '<text x="' + (padL - 6) + '" y="' + (y + 3.5) + '" class="svg-axis-t" text-anchor="end">' + m + '</text>';
    }
    const xTickStep = xMax <= 50 ? 5 : 10;
    for (let t = 0; t <= xMax; t += xTickStep){
      const x = xs(t);
      svg += '<line x1="' + x + '" y1="' + padT + '" x2="' + x + '" y2="' + (padT + dH) + '" class="svg-grid"/>';
      svg += '<text x="' + x + '" y="' + (padT + dH + 14) + '" class="svg-axis-t" text-anchor="middle">' + t + '</text>';
    }
    if (!st().compareMode){
      for (let c = 0; c <= yCanopyMax; c += 50){
        const y = ysC(c);
        svg += '<text x="' + (padL + dW + 6) + '" y="' + (y + 3.5) + '" class="svg-axis-t" text-anchor="start">' + c + '</text>';
      }
    }

    svg += '<line x1="' + padL + '" y1="' + (padT + dH) + '" x2="' + (padL + dW) + '" y2="' + (padT + dH) + '" class="svg-axis"/>';
    svg += '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + dH) + '" class="svg-axis"/>';

    svg += '<text x="' + padL + '" y="' + (padT - 6) + '" class="svg-axis-t" text-anchor="start">' + ui('ui.chart.axisMass') + '</text>';
    if (!st().compareMode){
      svg += '<text x="' + (padL + dW) + '" y="' + (padT - 6) + '" class="svg-axis-t" text-anchor="end">' + ui('ui.chart.axisCanopy') + '</text>';
    }
    svg += '<text x="' + (padL + dW/2) + '" y="' + (H - 8) + '" class="svg-axis-t" text-anchor="middle">' + ui('ui.chart.axisX', { ctx: vegContextLabel(), germ: st().germination, veg: st().nursery + st().day }) + '</text>';

    /* Error bands (if range is shown and not comparing) — drawn under curves */
    if (st().showRange){
      const pct = st().errorPct / 100;
      const stepBand = 80;
      let topM = '', botM = '';
      let topC = '', botC = '';
      for (let i = 0; i <= stepBand; i++){
        const tCh = xMin + (xMax - xMin) * i / stepBand;
        const tTotal = totalAge(tCh);
        const m = massAtTotal(cv, tTotal);
        const c = canopyAtTotal(cv, tTotal);
        const mTop = m * (1 + pct);
        const mBot = m * (1 - pct);
        const cTop = c * (1 + pct/2);
        const cBot = c * (1 - pct/2);
        const x = xs(tCh).toFixed(1);
        topM += (i === 0 ? 'M' : 'L') + x + ',' + ysM(Math.min(mTop, yMassMax)).toFixed(1);
        botM = ' L' + x + ',' + ysM(Math.max(mBot, 0)).toFixed(1) + botM;
        topC += (i === 0 ? 'M' : 'L') + x + ',' + ysC(Math.min(cTop, yCanopyMax)).toFixed(1);
        botC = ' L' + x + ',' + ysC(Math.max(cBot, 0)).toFixed(1) + botC;
      }
      svg += '<path d="' + topM + botM + ' Z" class="svg-band"/>';
      if (!st().compareMode) svg += '<path d="' + topC + botC + ' Z" class="svg-band-canopy"/>';
    }

    let pathM = '', pathC = '';
    const stepN = 80;
    for (let i = 0; i <= stepN; i++){
      const tCh = xMin + (xMax - xMin) * i / stepN;
      const tTotal = totalAge(tCh);
      const m = massAtTotal(cv, tTotal);
      const c = canopyAtTotal(cv, tTotal);
      pathM += (i === 0 ? 'M' : 'L') + xs(tCh).toFixed(1) + ',' + ysM(m).toFixed(1);
      pathC += (i === 0 ? 'M' : 'L') + xs(tCh).toFixed(1) + ',' + ysC(c).toFixed(1);
    }

    /* Comparison mode: all выбранные культуры; текущая — жирная линия */
    if (st().compareMode){
      const activeId = comparePickActiveId();
      getCompareSelected().forEach(ocv => {
        if (ocv.id === activeId) return;
        let p = '';
        for (let i = 0; i <= stepN; i++){
          const tCh = xMin + (xMax - xMin) * i / stepN;
          const tTotal = totalAge(tCh);
          const km = ocv.k * dliFactor() * effectiveTempFactor(ocv);
          const m = ocv.M_max / (1 + Math.exp(-km * (tTotal - ocv.t50)));
          p += (i === 0 ? 'M' : 'L') + xs(tCh).toFixed(1) + ',' + ysM(m).toFixed(1);
        }
        svg += '<path d="' + p + '" fill="none" stroke="' + cvColor(ocv.id) + '" stroke-width="1.8" opacity="0.85"/>';
      });
      svg += '<path d="' + pathM + '" fill="none" stroke="' + cvColor(activeId) + '" stroke-width="3.5"/>';
    } else {
      svg += '<path d="' + pathC + '" class="svg-curve-canopy"/>';
      svg += '<path d="' + pathM + '" class="svg-curve"/>';
    }

    const tMark = clamp(r.t_ch, xMin, xMax);
    const mx = xs(tMark);
    const massMark = Number.isFinite(r.mass) ? r.mass : 0;
    const canopyMark = Number.isFinite(r.canopy) ? r.canopy : 0;
    svg += '<line x1="' + mx + '" y1="' + padT + '" x2="' + mx + '" y2="' + (padT + dH) + '" class="svg-marker"/>';
    const myM = ysM(clamp(massMark, 0, yMassMax));
    const myC = ysC(clamp(canopyMark, 0, yCanopyMax));
    if (!st().compareMode){
      svg += '<circle cx="' + mx + '" cy="' + myC.toFixed(1) + '" r="4" class="svg-marker-dot-c"/>';
    }
    svg += '<circle cx="' + mx + '" cy="' + myM.toFixed(1) + '" r="5" class="svg-marker-dot"/>';
    const lblX = mx > padL + dW - 80 ? mx - 8 : mx + 8;
    const lblAnchor = mx > padL + dW - 80 ? 'end' : 'start';
    const outUnit = r.countUnit === 'шт' ? pm('u.pcs') : pm('unit.g');
    const massLabel = st().showRange && !st().compareMode
      ? round(massMark - rangeMass(massMark)) + '–' + round(massMark + rangeMass(massMark)) + ' ' + outUnit
      : round(massMark) + ' ' + outUnit;
    const canopyLabel = st().showRange
      ? round(canopyMark - rangeCanopy(canopyMark)) + '–' + round(canopyMark + rangeCanopy(canopyMark)) + ' ' + pm('unit.mm')
      : round(canopyMark) + ' ' + pm('unit.mm');
    const fullLabel = st().compareMode
      ? cv.name + ' · ' + massLabel
      : massLabel + ' · ' + canopyLabel;
    const lblY = clamp(myM - 8, padT + 10, padT + dH - 4);
    svg += '<text x="' + lblX + '" y="' + lblY + '" class="svg-marker-label" text-anchor="' + lblAnchor + '">' + fullLabel + '</text>';

    if (r.tHarvestCh >= xMin && r.tHarvestCh <= xMax){
      const hx = xs(r.tHarvestCh);
      svg += '<line x1="' + hx + '" y1="' + (padT + dH - 5) + '" x2="' + hx + '" y2="' + (padT + dH + 5) + '" stroke="#6B7B2E" stroke-width="2"/>';
      svg += '<text x="' + hx + '" y="' + (padT + dH - 9) + '" class="svg-axis-t" text-anchor="middle" style="fill:#6B7B2E;font-weight:500">' + ui('ui.chart.harvestMark') + '</text>';
    }

    setGrowthChartSvg(svg);

    const legendMassCanopy = '<span><span class="swatch mass"></span>' + ui('ui.chart.legendMass') + '</span>' +
      '<span><span class="swatch canopy"></span>' + ui('ui.chart.legendCanopy') + '</span>';
    const legendCompareOnly = '<span><span class="swatch mass"></span>' + ui('ui.chart.legendCompare') + '</span>';
    setGrowthChartLegendHtml(st().compareMode ? legendCompareOnly : legendMassCanopy);
    fillCompareLegend(cv);
    syncGrowthCompareUi();
  }

  /* ---- Render: multi-cut schedule ---- */
  function renderMulticut(r){
    const panel = $('block-panel-multicut');
    const cv = r.cv;
    if (!panel) return;
    syncMulticutBabyUi(cv);
    if (georgyModeRef() && georgyModeRef().renderMulticutBabyCutPreview){
      georgyModeRef().renderMulticutBabyCutPreview(r);
    }
    var cutWrap = $('cut-schedule-wrap');
    var cutEl = $('cut-schedule');
    var mcHint = $('multicut-enable-hint');
    function setCutScheduleVisible(on){
      if (cutWrap) cutWrap.classList.toggle('env-block-hidden', !on);
    }
    if (georgyModeRef() && georgyModeRef().isGeorgyGh()){
      if (cutEl) cutEl.innerHTML = '';
      setCutScheduleVisible(false);
      if (mcHint) mcHint.classList.add('env-block-hidden');
      return;
    }
    panel.classList.remove('env-block-hidden');
    if (isVF() && !supportsMulticut(cv) && st().multicut){
      if (mcHint){
        mcHint.textContent = ui('vf.cutMode.unsupported');
        mcHint.classList.remove('env-block-hidden');
      }
    }
    syncMulticutDetailUI();

    var mcYieldHint = $('multicut-yield-only-hint');
    if (mcYieldHint) {
      mcYieldHint.classList.toggle('env-block-hidden', !st().multicut || !supportsMulticut(cv));
    }
    if (!st().multicut){
      if (cutEl) cutEl.innerHTML = '';
      setCutScheduleVisible(false);
      if (mcHint){
        mcHint.textContent = ui('multicut.enableHintOff', growCtxParams());
        mcHint.classList.remove('env-block-hidden');
      }
      return;
    }
    if (mcHint) mcHint.classList.add('env-block-hidden');
    setCutScheduleVisible(true);

    const interval = Math.max(5, effectiveCutInterval());
    const intervalMods = cutIntervalMods(cv);

    const hz = multicutHorizon(cv);
    const firstCutCh = hz ? hz.firstCutCh : Math.max(1, st().day);
    const maxCh = hz ? hz.maxCh : Math.max(90, st().day + interval * 6);
    const sow = new Date(st().sowDate);
    const cuts = [];
    const ghPlanned = !isVF() && !isPalletView() && st().multicut;
    const maxCuts = hz ? hz.maxCuts : (ghPlanned ? st().ghCutCount : 24);
    for (let i = 0; i < maxCuts; i++){
      const cutCh = firstCutCh + i * interval;
      if (cutCh < 1) continue;
      const cutTotal = totalAge(cutCh);
      if (cutCh > maxCh) break;
      if (cutTotal > envBolt(cv)) break;
      const cutMass = cutMassPerPlant(cv, ghPlanned ? i : null);
      cuts.push({
        n: i + 1,
        cutCh: Math.round(cutCh),
        cutTotal: Math.round(cutTotal),
        mass: Math.round(cutMass.val),
        unit: cutMass.unit,
        date: addDays(sow, cutTotal),
        isCurrent: Math.abs(cutCh - st().day) < interval / 2,
        nearBolt: cutTotal >= envBolt(cv) - 2
      });
    }

    if (!cuts.length){
      if (cutEl) cutEl.innerHTML = '<div class="multicut-meta">' + ui('ui.cut.noCutsHint', { dUnit: pm('unit.days'), ctx: vegContextLabel() }) + '</div>';
      return;
    }

    let totalYield = cuts.reduce((s, c) => s + c.mass, 0);
    const unit = cuts[0].unit;
    const massCol = unit === 'шт' ? ui('ui.cut.colMassPcs') : ui('ui.cut.colMassG');

    let html = '<table class="cut-table">';
    html += '<tr><th>' + ui('ui.cut.colCut') + '</th><th>' + vegContextLabelCap() + '</th><th>' + ui('ui.cut.colDate') + '</th><th>' + massCol + '</th></tr>';
    cuts.forEach(c => {
      const warn = c.nearBolt ? ' style="color:var(--brick-text)"' : '';
      const massCell = st().showRange && unit === 'г'
        ? round(c.mass * (1 - st().errorPct/100)) + '–' + round(c.mass * (1 + st().errorPct/100)) + ' ' + unit
        : c.mass + ' ' + unit;
      html += '<tr' + (c.isCurrent ? ' class="current"' : '') + '>' +
        '<td>' + c.n + '</td>' +
        '<td>' + c.cutCh + '</td>' +
        '<td>' + fmtDate(c.date) + '</td>' +
        '<td' + warn + '>' + massCell + (c.nearBolt ? ui('ui.cut.bitterRisk') : '') + '</td>' +
        '</tr>';
    });
    html += '</table>';

    const lastDay = cuts[cuts.length - 1].cutCh;
    const totalLabel = st().showRange && unit === 'г'
      ? round(totalYield * (1 - st().errorPct/100)) + '–' + round(totalYield * (1 + st().errorPct/100)) + ' ' + unit
      : totalYield + ' ' + unit;

    const perPlantCycle = totalYield;
    const yieldSqmCalc = r.rhoA > 0 ? (perPlantCycle * r.rhoA / 1000) : 0;
    const calcSqm = unit === 'шт' ? totalYield * r.rhoA : yieldSqmCalc * 1000;

    const mcStats = vfMulticutStats(cv);
    html += '<div class="multicut-meta">' +
      ui('ui.cut.meta', { interval: interval, dUnit: pm('unit.days'), rec: intervalMods.rec, slack: CUT_INTERVAL_SLACK, n: cuts.length, total: totalLabel });
    if (mcStats.potHarvestMonths > 0 && cv.replaceNote){
      html += '<br>' + ui('ui.cut.lifeNote', { note: cv.replaceNote, months: mcStats.potHarvestMonths });
    }
    if (intervalMods.delta !== 0){
      html += ui('ui.cut.metaAdj', { pct: (intervalMods.massPct >= 0 ? '+' : '') + intervalMods.massPct });
    }
    if (ghPlanned){
      html += ui('ui.cut.metaGh', { n: st().ghCutCount });
    }
    html += '.<br>';
    {
      const hy = plantingHarvestYieldParams(cv, r);
      const u2 = hy.unitIsPieces ? pm('u.pcs') : pm('unit.g');
      const ySqm = hy.unitIsPieces
        ? r1(hy.yieldPerSqmMonthPcs) + ' ' + ui('ui.cut.pcsMo')
        : r2(hy.yieldPerSqmMonthKg) + ' ' + ui('ui.cut.kgMo');
      html += ui('ui.cut.monthLine', {
        ySqm: ySqm, interval: hy.harvestCutIntervalDays, dUnit: pm('unit.days'),
        perCut: Math.round(hy.harvestYieldPerCut), u2: u2, cutsMo: r1(hy.harvestCutsPerMonth),
        sum: Math.round(calcSqm), lastDay: lastDay, ctx: vegContextLabel()
      });
    }
    html += '</div>';

    if (cutEl) cutEl.innerHTML = html;
  }

  function collectSchemaHoleCenters(oX, oY, s, margin, lay, showCh, showN){
    const pts = [];
    const r = lay;
    for (let i = 0; i < showCh; i++){
      const baseCy = oY + i * r.b * s + (CH_W / 2) * s;
      const rows = r.vfMode ? 2 : 1;
      for (let row = 0; row < rows; row++){
        const cy = baseCy + (r.vfMode ? (row === 0 ? -CH_W / 4 : CH_W / 4) * s : 0);
        const rowShift = r.vfMode ? row * r.offMm * s : (i % 2) * r.offMm * s;
        for (let j = 0; j < showN; j++){
          const cx = oX + (margin + j * r.a) * s + rowShift;
          pts.push({ cx: cx, cy: cy });
        }
      }
    }
    return pts;
  }

  function nearestHoleCenterPair(pts, scale){
    let best = null;
    let bestD = Infinity;
    for (let p = 0; p < pts.length; p++){
      for (let q = p + 1; q < pts.length; q++){
        const d = Math.hypot(pts[p].cx - pts[q].cx, pts[p].cy - pts[q].cy);
        if (d < bestD){ bestD = d; best = [pts[p], pts[q]]; }
      }
    }
    if (!best) return null;
    return { p1: best[0], p2: best[1], distMm: bestD / scale };
  }

  /* ---- Render: schema (top-down) ---- */
  function schemaPalletLayout(r){
    const cells = palletCellsForLayout((r && r.cv) || getPalletCv());
    const lay = plantLayoutPallet(cells);
    const cv = (r && r.cv) || getPalletCv();
    return Object.assign({}, lay, {
      palletMode: true,
      cellsPerCassette: cells,
      cv: cv,
      canopy: r && Number.isFinite(r.canopy) ? r.canopy : 80,
      leafGap: r && Number.isFinite(r.leafGap) ? r.leafGap : lay.cellPitch,
      cellD: lay.cellD,
      total: lay.total
    });
  }

  function palletSchemaHoleRadiusPx(geo, sc){
    const cellDpx = (geo.cellD / 2) * sc;
    const pitchPx = geo.cellPitch * sc;
    return Math.max(2, Math.min(cellDpx, pitchPx * 0.42));
  }
  function palletSchemaCanopyRadiusPx(canopyMm, sc){
    return Math.max(0.5, (canopyMm / 2) * sc);
  }
  function palletSchemaPlantSvg(hx, hy, holeR, canopyRpx, leafGap, showLabel, canopyMm){
    const coreR = Math.max(1.2, holeR * 0.42);
    const capR = canopyRpx;
    const canopyClass = leafGap < 0 ? 'svg-pallet-canopy-over' : 'svg-pallet-canopy';
    let s = '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="' + capR.toFixed(1) + '" class="' + canopyClass + '"/>' +
      '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="' + holeR.toFixed(1) + '" class="svg-plant-hole"/>' +
      '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="' + coreR.toFixed(1) + '" class="svg-plant-core"/>';
    if (showLabel && capR > 12){
      s += '<text x="' + hx.toFixed(1) + '" y="' + (hy - capR - 4).toFixed(1) + '" text-anchor="middle" class="svg-canopy-label" font-size="10">⌀' + round(canopyMm) + '</text>';
    }
    return s;
  }

  function renderSchemaPallet(r){
    r = schemaPalletLayout(r);
    const W = 640, H = 340, padL = 44, padR = 20, padT = 50, padB = 40;
    const dW = W - padL - padR, dH = H - padT - padB;
    const sc = Math.min(dW / PALLET_L_MM, dH / PALLET_W_MM) * 0.9;
    const pw = PALLET_L_MM * sc, ph = PALLET_W_MM * sc;
    const oX = padL + (dW - pw) / 2;
    const oY = padT + (dH - ph) / 2;
    if (r.trayLot || (r.cv && global.DG_isTrayLotCrop && global.DG_isTrayLotCrop(r.cv))){
      const perPal = r.plantsPerPallet || (global.DG_TRAY_LOT_PER_PALLET || 33);
      let svg = '<rect x="' + oX.toFixed(1) + '" y="' + oY.toFixed(1) + '" width="' + pw.toFixed(1) + '" height="' + ph.toFixed(1) + '" class="svg-pallet" rx="5"/>';
      svg += '<text x="' + (oX + pw / 2).toFixed(1) + '" y="' + (oY + ph / 2 - 6).toFixed(1) + '" text-anchor="middle" class="svg-dim-t" font-size="12">' + ui('ui.schema.trayLotTitle', { per: perPal }) + '</text>';
      svg += '<text x="' + (oX + pw / 2).toFixed(1) + '" y="' + (oY + ph / 2 + 12).toFixed(1) + '" text-anchor="middle" class="svg-dim-t" font-size="10">' + ui('ui.schema.trayLotDensity', { density: r1(r.rhoA || 0) }) + '</text>';
      $('schema').innerHTML = svg;
      return;
    }
    const canopyMm = r.canopy > 0 ? r.canopy : 80;
    const mount = r.mountMode || palletMountMode();
    const nCas = mount === 'cassette' ? CASSETTES_PER_PALLET : 1;
    const cells = parseInt(palletCellsForLayout(r.cv), 10) || 54;
    const geo = palletCellGeometry(cells, mount);
    const cellPts = geo.centers;
    const holeR = palletSchemaHoleRadiusPx(geo, sc);
    const canopyRpx = palletSchemaCanopyRadiusPx(canopyMm, sc);
    const casOffV = mount === 'cassette' ? (PALLET_W_MM - CASSETTE_W_MM) / 2 : 0;
    const casOffH = mount === 'cassette' ? (PALLET_L_MM - CASSETTE_L_MM * nCas) / 2 : 0;
    const along = r.alongLength || st().palletsAlong || 1;
    const across = r.acrossPallets || st().nch || 1;
    const titleY = oY - 26;
    const dimY = oY - 10;
    let svg = '<defs><marker id="arrP" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker></defs>';
    svg += '<text x="' + (oX + pw / 2).toFixed(1) + '" y="' + titleY.toFixed(1) + '" text-anchor="middle" class="svg-dim-t" font-size="11">' + ui('ui.schema.palletFlow') + '</text>';
    if (mount === 'cassette'){
      const casW = CASSETTE_L_MM * sc;
      for (let c = 0; c < nCas; c++){
        const x1 = oX + casOffH * sc + c * casW;
        const x2 = x1 + casW;
        svg += '<line x1="' + x1.toFixed(1) + '" y1="' + dimY + '" x2="' + x2.toFixed(1) + '" y2="' + dimY + '" class="svg-dim" marker-start="url(#arrP)" marker-end="url(#arrP)"/>';
        svg += '<text x="' + ((x1 + x2) / 2).toFixed(1) + '" y="' + (dimY - 4) + '" text-anchor="middle" class="svg-dim-t" font-size="8">400</text>';
      }
    }
    svg += '<rect x="' + oX.toFixed(1) + '" y="' + oY.toFixed(1) + '" width="' + pw.toFixed(1) + '" height="' + ph.toFixed(1) + '" class="svg-pallet" rx="5"/>';
    svg += '<text x="' + (oX - 10).toFixed(1) + '" y="' + (oY + ph / 2).toFixed(1) + '" text-anchor="middle" class="svg-dim-t" font-size="10" transform="rotate(-90 ' + (oX - 10) + ' ' + (oY + ph / 2) + ')">650</text>';
    let plantsSvg = '';
    for (let c = 0; c < nCas; c++){
      const cw = (mount === 'cassette' ? CASSETTE_L_MM : PALLET_L_MM) * sc;
      const casH = (mount === 'cassette' ? CASSETTE_W_MM : PALLET_W_MM) * sc;
      const cx0 = oX + casOffH * sc + c * cw;
      const cy0 = oY + casOffV * sc;
      const spanL = mount === 'cassette' ? CASSETTE_L_MM : PALLET_L_MM;
      const spanW = mount === 'cassette' ? CASSETTE_W_MM : PALLET_W_MM;
      svg += '<rect x="' + cx0.toFixed(1) + '" y="' + cy0.toFixed(1) + '" width="' + cw.toFixed(1) + '" height="' + casH.toFixed(1) + '" class="svg-cassette" rx="3"/>';
      if (mount === 'cassette'){
        svg += '<text x="' + (cx0 + cw / 2).toFixed(1) + '" y="' + (cy0 + casH + 24).toFixed(1) + '" text-anchor="middle" class="svg-dim-t" font-size="9">' + ui('ui.schema.cassetteN', { n: c + 1, cells: cells }) + '</text>';
        if (c < nCas - 1){
          const divX = cx0 + cw;
          svg += '<line x1="' + divX.toFixed(1) + '" y1="' + cy0.toFixed(1) + '" x2="' + divX.toFixed(1) + '" y2="' + (cy0 + casH).toFixed(1) + '" stroke="var(--olive)" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.7"/>';
        }
      } else {
        svg += '<text x="' + (cx0 + cw / 2).toFixed(1) + '" y="' + (cy0 + casH + 24).toFixed(1) + '" text-anchor="middle" class="svg-dim-t" font-size="9">' + ui('ui.schema.lidCraft', { cells: cells }) + '</text>';
      }
      cellPts.forEach((pt, idx) => {
        const hx = cx0 + (pt.u / spanL) * cw;
        const hy = cy0 + (pt.v / spanW) * casH;
        const showLbl = c === 0 && idx === 0;
        plantsSvg += palletSchemaPlantSvg(hx, hy, holeR, canopyRpx, r.leafGap, showLbl, canopyMm);
      });
    }
    svg += '<g class="pallet-schema-plants">' + plantsSvg + '</g>';
    $('schema').innerHTML = svg;
    var schemaPanel = $('panel-schema');
    if (schemaPanel) schemaPanel.classList.add('is-pallet-schema');
    syncSchemaCanopyLegend(canopyMm);
    const ml = mount === 'lid' ? ui('ui.schema.mountLid', { cells: cells }) : ui('ui.schema.mountCas', { cells: cells });
    const staggerNote = (cells === 6 || cells === 14) ? ui('ui.schema.stagger') : '';
    $('viz-caption').textContent = ui('ui.schema.captionPal', { mount: ml, stagger: staggerNote, canopy: round(canopyMm), along: along, across: across, name: r.cv ? r.cv.name : '' });
  }

  function renderSchema(r){
    if (isPalletView()){ renderSchemaPallet(r); return; }
    var schemaPanel = $('panel-schema');
    if (schemaPanel) schemaPanel.classList.remove('is-pallet-schema');
    const W = 640, H = 340;
    const padL = 70, padR = 40, padT = 35, padB = 45;
    const dW = W - padL - padR;
    const dH = H - padT - padB;

    const alongN = r.vfMode ? r.perRow : r.perChan;
    const showN = Math.min(alongN, Math.max(4, Math.floor(dW / 70)));
    const hEll = alongN > showN;
    const showCh = Math.min(st().nch, 6);
    const vEll = st().nch > showCh;
    const holeR = (r.vfMode ? HOLE_D_VF : st().pot) / 2;

    const margin = 50;
    const fragLen = margin + (showN - 1) * r.a + margin;
    const widthMm = (showCh - 1) * r.b + CH_W;
    const s = Math.min(dW / fragLen, dH / widthMm);

    const aW = fragLen * s;
    const aH = widthMm * s;
    const oX = padL + (dW - aW) / 2;
    const oY = padT + (dH - aH) / 2;

    const schemaCanopy = schemaCanopyMm(r);
    const overlap = r.nearest - schemaCanopy < 0;
    const canopyClass = overlap ? 'svg-canopy-over' : 'svg-canopy';
    const canopyD = round(schemaCanopy);
    syncSchemaCanopyLegend(schemaCanopy);
    const rowsN = r.vfMode ? 2 : 1;
    const labelAllCanopy = (showCh * rowsN * showN) <= 18;

    let svg = '<defs><marker id="arr" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="currentColor"/></marker><marker id="arr2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="currentColor"/></marker></defs>';

    for (let i = 0; i < showCh; i++){
      const cy = oY + i * r.b * s + (CH_W/2) * s;
      const y = cy - (CH_W/2) * s;
      svg += '<rect x="' + oX.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + aW.toFixed(1) + '" height="' + (CH_W*s).toFixed(1) + '" class="svg-channel" rx="3"/>';
    }

    for (let i = 0; i < showCh; i++){
      const baseCy = oY + i * r.b * s + (CH_W/2) * s;
      const rows = r.vfMode ? 2 : 1;
      for (let row = 0; row < rows; row++){
        const cy = baseCy + (r.vfMode ? (row === 0 ? -CH_W/4 : CH_W/4) * s : 0);
        const rowShift = r.vfMode ? row * r.offMm * s : (i % 2) * r.offMm * s;
        for (let j = 0; j < showN; j++){
          const cx = oX + (margin + j * r.a) * s + rowShift;
          if (cx > oX + aW + 5) continue;
          const cR = (schemaCanopy / 2 * s);
          svg += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + cR.toFixed(1) + '" class="' + canopyClass + '"/>';
          if (labelAllCanopy || (i === 0 && row === 0 && j === 0) || (i === showCh - 1 && j === showN - 1)){
            svg += '<text x="' + cx.toFixed(1) + '" y="' + (cy - cR - 3).toFixed(1) + '" class="svg-canopy-label" text-anchor="middle">⌀' + canopyD + '</text>';
          }
        }
      }
    }

    for (let i = 0; i < showCh; i++){
      const baseCy = oY + i * r.b * s + (CH_W/2) * s;
      const rows = r.vfMode ? 2 : 1;
      for (let row = 0; row < rows; row++){
        const cy = baseCy + (r.vfMode ? (row === 0 ? -CH_W/4 : CH_W/4) * s : 0);
        const rowShift = r.vfMode ? row * r.offMm * s : (i % 2) * r.offMm * s;
        for (let j = 0; j < showN; j++){
          const cx = oX + (margin + j * r.a) * s + rowShift;
          if (cx > oX + aW + 5) continue;
          const pr = holeR * s;
          svg += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + pr.toFixed(1) + '" class="svg-pot"/>';
          svg += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + Math.max(1, pr - 2.5).toFixed(1) + '" class="svg-medium"/>';
        }
      }
    }

    if (hEll) svg += '<text x="' + (oX + aW + 8) + '" y="' + (oY + aH/2 + 5) + '" class="svg-ellipsis" font-size="18">…</text>';
    if (vEll) svg += '<text x="' + (oX + aW/2) + '" y="' + (oY + aH + 22) + '" class="svg-ellipsis" font-size="18" text-anchor="middle">⋮</text>';

    if (showCh >= 2 && showN >= 2){
      const x1 = oX + margin * s;
      const x2 = oX + (margin + r.a) * s;
      const dimY = oY - 12;
      svg += '<g style="color:#847D69"><line x1="' + x1.toFixed(1) + '" y1="' + dimY + '" x2="' + x2.toFixed(1) + '" y2="' + dimY + '" class="svg-dim" marker-start="url(#arr)" marker-end="url(#arr)"/></g>';
      svg += '<text x="' + ((x1+x2)/2).toFixed(1) + '" y="' + (dimY - 5) + '" class="svg-dim-t" text-anchor="middle">' + ui('ui.schema.dimA', { a: round(r.a) }) + '</text>';

      const y1 = oY + (CH_W/2) * s;
      const y2 = oY + r.b * s + (CH_W/2) * s;
      const dimX = oX - 14;
      svg += '<g style="color:#847D69"><line x1="' + dimX + '" y1="' + y1.toFixed(1) + '" x2="' + dimX + '" y2="' + y2.toFixed(1) + '" class="svg-dim" marker-start="url(#arr)" marker-end="url(#arr)"/></g>';
      svg += '<text x="' + (dimX - 4) + '" y="' + ((y1+y2)/2 + 4).toFixed(1) + '" class="svg-dim-t" text-anchor="end">' + ui('ui.schema.dimB', { b: round(r.b) }) + '</text>';

      if ((r.vfMode || st().offset > 0) && r.offMm > 0){
        const holePts = collectSchemaHoleCenters(oX, oY, s, margin, r, showCh, showN);
        const nearPair = nearestHoleCenterPair(holePts, s);
        if (nearPair && nearPair.distMm < r.a - 0.25){
          const dx1 = nearPair.p1.cx;
          const dy1 = nearPair.p1.cy;
          const dx2 = nearPair.p2.cx;
          const dy2 = nearPair.p2.cy;
          svg += '<g style="color:#6B7B2E"><line x1="' + dx1.toFixed(1) + '" y1="' + dy1.toFixed(1) + '" x2="' + dx2.toFixed(1) + '" y2="' + dy2.toFixed(1) + '" class="svg-dim-diag" marker-start="url(#arr2)" marker-end="url(#arr2)"/></g>';
          const mx = (dx1 + dx2) / 2 + 6;
          const my = (dy1 + dy2) / 2;
          svg += '<text x="' + mx.toFixed(1) + '" y="' + my.toFixed(1) + '" class="svg-dim-t-diag" text-anchor="start">' + ui('ui.schema.dimNearest', { d: round(r.nearest) }) + '</text>';
        }
      }
    }

    $('schema').innerHTML = svg;
    const chanLabel = r.vfMode
      ? ui('ui.schema.chanVf', { perRow: r.perRow, perChan: r.perChan })
      : ui('ui.schema.chanPlain', { perChan: r.perChan });
    $('viz-caption').textContent = (hEll || vEll)
      ? ui('ui.schema.captionFrag', { showN: showN, rowNote: r.vfMode ? ui('ui.schema.rowNote') : '', chanLabel: chanLabel, showCh: showCh, nch: st().nch, name: r.cv.name, days: r.t_ch, dUnit: pm('unit.days'), ctx: vegContextLabel(), canopy: round(r.canopy) })
      : ui('ui.schema.captionFull', { chanLabel: chanLabel, nch: st().nch, vfNote: r.vfMode ? ui('ui.schema.vfNote') : '', name: r.cv.name, days: r.t_ch, dUnit: pm('unit.days'), ctx: vegContextLabel(), canopy: round(r.canopy) });
  }

  /* ---- Render: scenario comparison ---- */
  function renderScenarios(){
    const wrap = $('scenario-config');
    if (!st().compareScenarios){
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';

    const scenOpts = { facility: st().facility };
    const A = isPalletView()
      ? calcScenarioPallet(st().palletCv, { temp: st().temp, targetDli: st().targetDli, targetPhotoperiod: st().targetPhotoperiod })
      : (isVF()
        ? calcScenarioVf(st().vfCv, { temp: st().temp, targetDli: st().targetDli, targetPhotoperiod: st().targetPhotoperiod })
        : calcScenario({ cv: st().cv, month: st().month, lighting: st().lighting, temp: st().temp, facility: 'greenhouse' }));
    const B = isPalletView()
      ? calcScenarioPallet(st().cvB, { temp: st().tempB, targetDli: st().targetDliB, targetPhotoperiod: st().targetPhotoperiodB })
      : (isVF()
        ? calcScenarioVf(st().cvB, { temp: st().tempB, targetDli: st().targetDliB, targetPhotoperiod: st().targetPhotoperiodB })
        : calcScenario({ cv: st().cvB, month: st().monthB, lighting: st().lightingB, temp: st().tempB, facility: 'greenhouse' }));

    function fmt(n, digits, suffix){
      const v = digits === 1 ? r1(n) : (digits === 2 ? r2(n) : round(n));
      return v + (suffix || '');
    }
    function delta(a, b, digits, suffix){
      const diff = b - a;
      if (Math.abs(diff) < (digits === 1 ? 0.1 : (digits === 2 ? 0.01 : 1))) {
        return '<span class="scen-delta zero">±0</span>';
      }
      const sign = diff > 0 ? '+' : '−';
      const cls = diff > 0 ? 'pos' : 'neg';
      const dv = digits === 1 ? r1(Math.abs(diff)) : (digits === 2 ? r2(Math.abs(diff)) : round(Math.abs(diff)));
      return '<span class="scen-delta ' + cls + '">' + sign + dv + (suffix || '') + '</span>';
    }
    function deltaMoney(a, b){
      const diff = b - a;
      if (Math.abs(diff) < 100) return '<span class="scen-delta zero">±0</span>';
      const sign = diff > 0 ? '+' : '−';
      const cls = diff > 0 ? 'pos' : 'neg';
      return '<span class="scen-delta ' + cls + '">' + sign + fmtMoney(Math.abs(diff)) + '</span>';
    }
    function fmtMoney(n){
      if (window.DG_fmtMoney) return window.DG_fmtMoney(n);
      return fmtNum(n);
    }

    function lightInfo(s){
      if (s.suppDli === 0) return ui('ui.light.none');
      return '+' + r1(s.suppDli) + ' ' + ui('ui.unit.mol') + '/d';
    }
    const dDay = ' ' + pt('unit.days');
    const dKg = ' ' + pt('unit.kg');

    const rows = [];
    rows.push({ l: ui('scen.row.cultivar'), a: A.cv.name, b: B.cv.name, d: '' });
    if (isVF() || isPalletView()){
      rows.push({ l: ui('scen.row.dliLamps'), a: r1(st().targetDli), b: r1(st().targetDliB), d: delta(st().targetDli, st().targetDliB, 1, '') });
      rows.push({ l: ui('scen.row.photo'), a: r1(st().targetPhotoperiod), b: r1(st().targetPhotoperiodB), d: delta(st().targetPhotoperiod, st().targetPhotoperiodB, 1, '') });
    } else {
      rows.push({ l: ui('scen.row.month'), a: monthLabel(st().month), b: monthLabel(st().monthB), d: '' });
      rows.push({ l: ui('scen.row.dliNat'), a: r1(A.naturalDliVal), b: r1(B.naturalDliVal), d: '' });
      rows.push({ l: ui('scen.row.supp'), a: lightInfo(A), b: lightInfo(B), d: '' });
    }
    rows.push({ l: ui('scen.row.temp'), a: r1(st().temp), b: r1(st().tempB), d: delta(st().temp, st().tempB, 1, '°C') });
    rows.push({ l: ui('scen.row.growth'), a: r2(A.growthMult), b: r2(B.growthMult), d: delta(A.growthMult, B.growthMult, 2, '') });
    rows.push({ divider: true });
    rows.push({ l: ui('scen.row.mass'), a: round(A.mass), b: round(B.mass), d: delta(A.mass, B.mass, 0, ' g'), result: true });
    rows.push({ l: ui('scen.row.canopy'), a: round(A.canopy), b: round(B.canopy), d: delta(A.canopy, B.canopy, 0, ' mm') });
    rows.push({ l: ui('scen.row.cycle'), a: A.totalCycleDays, b: B.totalCycleDays, d: delta(A.totalCycleDays, B.totalCycleDays, 0, dDay) });
    rows.push({ l: ui('scen.row.cyclesYear'), a: r1(A.cyclesPerYear), b: r1(B.cyclesPerYear), d: delta(A.cyclesPerYear, B.cyclesPerYear, 1, '') });
    rows.push({ l: ui('scen.row.kgSqmYear'), a: r1(A.yieldPerSqmYear), b: r1(B.yieldPerSqmYear), d: delta(A.yieldPerSqmYear, B.yieldPerSqmYear, 1, ''), result: true });
    rows.push({ l: ui('scen.row.kgYearSys'), a: r1(A.yieldPerSqmYear * A.sysArea), b: r1(B.yieldPerSqmYear * B.sysArea), d: delta(A.yieldPerSqmYear * A.sysArea, B.yieldPerSqmYear * B.sysArea, 1, dKg) });
    rows.push({ divider: true });
    rows.push({ l: ui('scen.row.revenue'), a: fmtMoney(A.revenue), b: fmtMoney(B.revenue), d: deltaMoney(A.revenue, B.revenue), money: true });
    rows.push({ l: ui('scen.row.elec'), a: A.kwhPerYear > 0 ? fmtMoney(A.electricityCost) : '0', b: B.kwhPerYear > 0 ? fmtMoney(B.electricityCost) : '0', d: deltaMoney(A.electricityCost, B.electricityCost) });
    rows.push({ l: ui('scen.row.profit'), a: fmtMoney(A.netProfit), b: fmtMoney(B.netProfit), d: deltaMoney(A.netProfit, B.netProfit), money: true });

    let html = '<table class="scen-table"><thead><tr><th></th><th>' + ui('ui.scen.a') + '</th><th>' + ui('ui.scen.b') + '</th><th>' + ui('ui.scen.diff') + '</th></tr></thead><tbody>';
    rows.forEach(r => {
      if (r.divider){ html += '<tr class="scen-divider"><td colspan="4"></td></tr>'; return; }
      const cls = (r.result ? 'scen-result' : '') + ' ' + (r.money ? 'scen-money' : '');
      html += '<tr class="' + cls + '"><td>' + r.l + '</td><td>' + r.a + '</td><td>' + r.b + '</td><td>' + r.d + '</td></tr>';
    });
    html += '</tbody></table>';

    /* Summary verdict */
    const profitDelta = B.netProfit - A.netProfit;
    let verdict = '';
    if (Math.abs(profitDelta) > 1000){
      const better = profitDelta > 0 ? 'B' : 'A';
      const worse = profitDelta > 0 ? 'A' : 'B';
      verdict = '<div style="margin-top:14px;padding:12px 14px;background:var(--olive-pale);color:var(--olive-text);border-radius:var(--radius);font-size:13.5px;line-height:1.5">' +
        '<strong>' + ui('ui.scen.verdictBetter', { better: better, amount: fmtMoney(Math.abs(profitDelta)) }) + '</strong> ' +
        ui('ui.scen.verdictDetail', { better: better, worse: worse }) + '</div>';
    } else if (Math.abs(profitDelta) > 0){
      verdict = '<div style="margin-top:14px;padding:12px 14px;background:var(--paper-deep);color:var(--ink-soft);border-radius:var(--radius);font-size:13.5px;line-height:1.5">' +
        ui('ui.scen.verdictEqual', { amount: fmtMoney(Math.abs(profitDelta)) }) + '</div>';
    }

    $('scenario-results').innerHTML = html + verdict;

    const llb = $('lighting-B-label');
    if (llb) llb.textContent = st().lightingB
      ? ui('ui.lightB.on', { dli: st().targetDli, h: st().targetPhotoperiod })
      : ui('ui.lightB.off');
  }

  /* ---- Render: recommendations ---- */
  function renderRecs(r){
    const recs = [];
    const push = (t, i, txt) => recs.push({ t, i, txt });

    const nat = naturalDLI();
    const eff = effectiveDLI();
    const effPh = effectivePhotoperiod();
    const monthName = monthLabel(st().month);

    if (isVF()){
      const vfGrowPct = r1(effectiveTempFactor(r.cv) * 100);
      if (st().temp >= 20 && st().temp <= 24){
        push('check', 'check', pr('rec.vf.temp.ok', { temp: r1(st().temp), growth: vfGrowPct }));
      } else if (st().temp < 20){
        push('warn', 'warn', pr('rec.vf.temp.low', { temp: r1(st().temp), growth: vfGrowPct }));
      } else {
        push('warn', 'warn', pr('rec.vf.temp.high', { temp: r1(st().temp), growth: vfGrowPct }));
      }
      if (st().rh < 60){
        push('warn', 'warn', pr('rec.vf.rh.growthLow', { rh: st().rh, growth: vfGrowPct }));
      } else if (st().rh > 75){
        push('warn', 'warn', pr('rec.vf.rh.warn', { rh: st().rh, dli: r1(eff) }));
      }
      if (st().temp > 26){
        push('warn', 'warn', pr('rec.closed.temp.mold', { temp: r1(st().temp) }));
      }
    } else if (isPalletView()){
      if (st().rh > 75){
        push('warn', 'warn', pr('rec.vf.rh.warn', { rh: st().rh, dli: r1(eff) }));
      } else if (st().rh < 50){
        push('info', 'info', pr('rec.vf.rh.low', { rh: st().rh }));
      }
      if (st().temp > 26){
        push('warn', 'warn', pr('rec.closed.temp.mold', { temp: r1(st().temp) }));
      }
    } else if (!st().lighting){
      if (nat < 10){
        push('bad', 'bad', pr('rec.gh.nat.bad', { month: monthName, nat: r1(nat) }));
      } else if (nat < 14){
        push('warn', 'warn', pr('rec.gh.nat.warn', { month: monthName, nat: r1(nat), pct: Math.round((1 - dliFactor()) * 100) }));
      } else if (nat >= 18){
        push('check', 'check', pr('rec.gh.nat.ok', { month: monthName, nat: r1(nat) }));
      }
    } else {
      const supp = supplementDLI();
      if (supp === 0){
        push('info', 'info', pr('rec.gh.supp.zero', { month: monthName, nat: r1(nat), target: st().targetDli }));
      } else if (supp < 4){
        push('info', 'info', pr('rec.gh.supp.low', { month: monthName, supp: r1(supp) }));
      } else {
        push('check', 'check', pr('rec.gh.supp.ok', {
          month: monthName, supp: r1(supp), nat: r1(nat), eff: r1(eff),
          wpm: Math.round(supp * 1e6 / 12 / st().ledEfficacyGh), led: r1(st().ledEfficacyGh)
        }));
      }
    }

    if (showAsPalletCalc(r) && r.leafGap < -10){
      push('warn', 'warn', pr('rec.pal.leafOverlap', { mm: round(-r.leafGap) }));
    }
    if (r.vfMode && !showAsPalletCalc(r) && st().density >= 180){
      push('warn', 'warn', pr('rec.vf.density', { dens: st().density }));
    }

    if (!isVF()){
      const ph = photoperiod();
      if (ph < 11 && !st().lighting){
        push('warn', 'warn', pr('rec.gh.ph', { ph: r1(ph) }));
      }
    }

    const t_opt = r.cv.t_opt;
    const overOpt = st().temp - t_opt;
    const isHeatTolerant = r.cv.heatSigma > 90;
    const tempLimit1 = isHeatTolerant ? 8 : 4;
    const tempLimit2 = isHeatTolerant ? 12 : 8;

    const growthPct = r1(effectiveTempFactor(r.cv) * 100);
    if (overOpt >= tempLimit2){
      push('bad', 'bad', pr('rec.temp.bad', {
        temp: st().temp, name: r.cv.name, opt: t_opt, over: r1(overOpt),
        growth: growthPct, bolt: r1(boltShift(r.cv))
      }));
    } else if (overOpt >= tempLimit1){
      push('warn', 'warn', pr(isHeatTolerant ? 'rec.temp.warnHeat' : 'rec.temp.warn', {
        temp: st().temp, opt: t_opt, growth: growthPct, bolt: r1(boltShift(r.cv))
      }));
    } else if (Math.abs(overOpt) <= 2){
      push('check', 'check', pr('rec.temp.ok', {
        temp: st().temp, name: r.cv.name, opt: t_opt, growth: growthPct
      }));
    } else if (overOpt < -3){
      push('info', 'info', pr('rec.temp.cold', { temp: st().temp, opt: t_opt }));
    }

    if (r.crowdF < 0.97){
      const lossPct = round((1 - r.crowdF) * 100);
      push('warn', 'warn', pr('rec.crowd', {
        loss: lossPct, max: r.cv.M_max, adj: round(r.cv.M_max * r.crowdF),
        hint: showAsPalletCalc(r) ? pr('rec.crowd.hintPal') : pr('rec.crowd.hintCh')
      }));
    }

    if (r.t_ch >= r.tBoltCh){
      push('bad', 'bad', pr('rec.stage.bolt', {
        name: r.cv.name, days: r.t_ch, ctx: vegContextLabel(), bolt: round(r.tBoltCh), harvest: round(r.tHarvestCh)
      }));
    } else if (r.t_ch > r.tHarvestCh + 3){
      push('warn', 'warn', pr('rec.stage.slow', { rgr: r1(r.rgrMass), harvest: round(r.tHarvestCh) }));
    } else if (Math.abs(r.t_ch - r.tHarvestCh) <= 2){
      push('check', 'check', pr('rec.stage.harvest', {
        harvest: round(r.tHarvestCh), ctx: vegContextLabel(), rgr: r1(r.rgrMass)
      }));
    } else if (r.t_ch < r.tHarvestCh - 5){
      push('info', 'info', pr('rec.stage.early', {
        mass: round(r.mass), rgr: r1(r.rgrMass),
        days: Math.round(r.tHarvestCh - r.t_ch), future: round(massAtTotal(r.cv, totalAge(r.tHarvestCh)))
      }));
    }

    if (showAsPalletCalc(r)){
      if (r.leafGap < -30){
        push('bad', 'bad', pr('rec.pal.canopy.bad', { mm: round(-r.leafGap) }));
      } else if (r.leafGap >= -10 && r.leafGap < 10){
        push('check', 'check', pr('rec.pal.canopy.touch', { gap: round(r.leafGap) }));
      } else if (r.leafGap < 50){
        push('check', 'check', pr('rec.pal.canopy.gap', { gap: round(r.leafGap) }));
      } else {
        const dDay = r.tHarvestCh > r.t_ch ? Math.round(r.tHarvestCh - r.t_ch) : 0;
        push('info', 'info', pr('rec.pal.canopy.loose', {
          gap: round(r.leafGap),
          extra: dDay ? pr('rec.pal.canopy.looseExtra', { days: dDay }) : ''
        }));
      }
      if (r.edgeGap < 5){
        push('info', 'info', pr('rec.pal.edge', { edge: round(r.edgeGap), d: round(r.cellD), pitch: round(r.cellPitch) }));
      }
    } else if (r.leafGap < -30){
      push('bad', 'bad', pr('rec.canopy.bad', { mm: round(-r.leafGap) }));
    } else if (r.leafGap < -10){
      push('warn', 'warn', pr('rec.canopy.overlap', { mm: round(-r.leafGap) }));
    } else if (r.leafGap < 10){
      push('check', 'check', pr('rec.canopy.touch', { gap: round(r.leafGap) }));
    } else if (r.leafGap < 50){
      push('check', 'check', pr('rec.canopy.gap', { gap: round(r.leafGap) }));
    } else {
      const dDay = r.tHarvestCh > r.t_ch ? Math.round(r.tHarvestCh - r.t_ch) : 0;
      push('info', 'info', pr('rec.canopy.loose', {
        gap: round(r.leafGap),
        extra: dDay ? pr('rec.canopy.looseExtra', { days: dDay }) : ''
      }));
    }

    if (r.edgeGap < 0 && !showAsPalletCalc(r)){
      push('bad', 'bad', pr('rec.geom.pots.bad', { gap: round(r.edgeGap) }));
    } else if (r.edgeGap < 15 && !showAsPalletCalc(r)){
      push('warn', 'warn', pr('rec.geom.pots.warn', { gap: round(r.edgeGap) }));
    }

    const unitW = showAsPalletCalc(r) ? pr('rec.unit.pallets') : pr('rec.unit.channels');
    if (!showAsPalletCalc(r)){
      if (r.widthExceeds){
        push('bad', 'bad', pr('rec.width.bad', {
          w: round(r.sysWmm), over: round(r.sysWmm - MAX_WIDTH), unit: unitW, max: r.maxChannelsFit
        }));
      } else if (r.widthClose){
        push('info', 'info', pr('rec.width.close', { w: round(r.sysWmm) }));
      } else if (st().nch < r.maxChannelsFit){
        push('info', 'info', pr('rec.width.spare', { max: r.maxChannelsFit, unit: unitW, spare: r.maxChannelsFit - st().nch }));
      }
    }

    if (!showAsPalletCalc(r) && r.constrained && st().extraB === 0){
      push('warn', 'warn', pr('rec.channels.tight', { b: CH_W, rho: round(r.rhoA) }));
    }
    if (showAsPalletCalc(r)){
      const ml = r.mountMode === 'lid' ? pr('rec.pal.mount.lid') : pr('rec.pal.mount.cassette');
      const tierNote = r.palletTiers > 1
        ? pr('rec.pal.tier', { n: r.palletTiers, area: r.sysArea != null ? r.sysArea.toFixed(2) : '—' }) : '';
      push('check', 'check', pr('rec.pal.zone', {
        len: (r.zoneLenMm/1000).toFixed(1), along: r.alongLength, across: r.acrossPallets,
        mount: ml, total: r.total, tier: tierNote, rho: round(r.rhoA)
      }));
    }

    if (georgyModeRef() && georgyModeRef().isGeorgyProfiled && georgyModeRef().isGeorgyProfiled(r.cv) && (georgyModeRef().isGeorgyGh() || isChannelGreenhouse())){
      const gp = georgyModeRef().getGeorgyProfile(r.cv);
      const maxCuts = st().useManualGhCutCount ? st().ghCutCount : georgyModeRef().resolveGeorgyMaxCuts(gp, r.cv);
      const yf = georgyModeRef().georgyYieldFactor(gp, st().temp);
      push('info', 'bulb', pr(gp.recKey, {
        rhoMin: gp.densityMin, rhoMax: gp.densityMax, rhoLight: gp.densityLight,
        intervalMin: gp.cutIntervalMin, intervalMax: gp.cutIntervalMax,
        maxCuts: maxCuts,
        massMin: Math.round(gp.massMin * yf), massMax: Math.round(gp.massMax * yf),
        temp: st().temp
      }));
    } else if (georgyModeRef() && georgyModeRef().isGeorgyGh() && st().temp >= 28){
      push('info', 'bulb', ui('georgy.warn.tempHeadBaby', {
        temp: st().temp,
        babyPct: georgyModeRef().georgyYieldLossPct(georgyModeRef().LETTUCE_PROFILE, st().temp),
        headPct: Math.round((1 - effectiveTempFactor(r.cv)) * 100)
      }));
    } else if (isChannelGreenhouse() && st().temp >= 28){
      push('info', 'bulb', ui('gh.yield.tempHeat', {
        temp: r1(st().temp),
        pct: greenhouseHeatYieldLossPct(st().temp)
      }));
    } else if (r.cv.id === 'rucola') push('info', 'bulb', pr('rec.cv.rucola'));
    if (r.cv.id === 'aficion') push('info', 'bulb', pr('rec.cv.aficion'));
    if (r.cv.id === 'afilion') push('info', 'bulb', pr('rec.cv.afilion'));
    if (r.cv.id === 'starfighter') push('info', 'bulb', pr('rec.cv.starfighter', { days: round(r.tBoltCh - r.tHarvestCh) }));
    if (r.cv.id === 'grazion') push('info', 'bulb', pr('rec.cv.grazion', { max: r.cv.M_max }));
    if (r.cv.id === 'little-gem') push('info', 'bulb', pr('rec.cv.little-gem', { ca: r.cv.ca }));
    if (r.cv.id === 'oakleaf') push('info', 'bulb', pr('rec.cv.oakleaf', { ca: r.cv.ca }));
    if (supportsMulticut(r.cv) && !st().multicut && !(georgyModeRef() && georgyModeRef().isGeorgyGh() && georgyModeRef().isGeorgyProfiled && georgyModeRef().isGeorgyProfiled(r.cv))){
      push('info', 'bulb', pr('rec.cv.multicut', { name: r.cv.name }));
    }

    if (!showAsPalletCalc(r) && st().length >= 8){
      push('info', 'info', pr('rec.channel.long', { len: st().length }));
    }
    if (!(global.DG_isTrayLotCrop && r.cv && global.DG_isTrayLotCrop(r.cv)) && st().nursery < 12){
      push('info', 'info', pr('rec.nursery.short', { days: st().nursery }));
    } else if (!(global.DG_isTrayLotCrop && r.cv && global.DG_isTrayLotCrop(r.cv)) && st().nursery > 18){
      push('warn', 'warn', pr('rec.nursery.long', { days: st().nursery }));
    }

    $('recs').innerHTML = recs.map(rc =>
      '<div class="rec ' + rc.t + '">' + ICON[rc.i] + '<span>' + rc.txt + '</span></div>'
    ).join('');
  }


  function syncVfSlidersFromState(){
    if (!isVF() && !isPalletView()) return;
    const dliEl = $('targetDliVf') || $('targetDli');
    const photoEl = $('targetPhotoperiodVf') || $('targetPhotoperiod');
    if (!dliEl || !photoEl) return;
    lightSync = true;
    dliEl.value = st().targetDli;
    photoEl.value = st().targetPhotoperiod;
    st().ppfd = Math.round(ppfdFromDli(st().targetDli, st().targetPhotoperiod));
    const ppfdEl = $('ppfd');
    if (ppfdEl) ppfdEl.value = st().ppfd;
    const dliV = $('targetDliVf-v') || $('targetDli-v');
    const photoV = $('targetPhotoperiodVf-v') || $('targetPhotoperiod-v');
    if (dliV) dliV.textContent = r1(st().targetDli);
    if (photoV) photoV.textContent = r1(st().targetPhotoperiod);
    const ppfdV = $('ppfd-v');
    if (ppfdV) ppfdV.textContent = st().ppfd;
    const ledVf = $('ledEfficacyVf');
    if (ledVf) ledVf.value = st().ledEfficacyVf;
    const ledVfV = $('ledEfficacyVf-v');
    if (ledVfV) ledVfV.textContent = r2(st().ledEfficacyVf);
    if ($('ledEfficacyGh-v')) $('ledEfficacyGh-v').textContent = r1(st().ledEfficacyGh);
    lightSync = false;
  }

  function applyIdealClosedLight(){
    if (!isVF() && !isPalletView()) return;
    st().targetDli = 17;
    st().targetPhotoperiod = 16;
    st().ppfd = Math.round(ppfdFromDli(17, 16));
    syncVfSlidersFromState();
  }

  function setFacility(mode){
    if (georgyModeRef() && georgyModeRef().isGeorgyGh && georgyModeRef().isGeorgyGh() && mode === 'vertical'){
      showToast(ui('georgy.toast.ghOnly') || 'Режим Георгия — только теплица');
      return;
    }
    st().facility = mode;
    const culturePanel = $('panel-culture');
    if (culturePanel) {
      const sheetMode = mode === 'vertical' || isPalletView();
      culturePanel.classList.toggle('is-vf', sheetMode);
      culturePanel.classList.toggle('is-sheet-mode', sheetMode);
    }
    try { localStorage.setItem(FACILITY_KEY, mode); } catch(_){}
    const gh = $('env-greenhouse');
    const vf = $('env-vertical');
    const rhCtrl = document.querySelector('.env-vf-only');
    const tempEl = $('temp');
    const tempBEl = $('temp-B');
    document.querySelectorAll('#facility-bar button').forEach(btn => {
      const on = btn.dataset.facility === mode;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (mode === 'vertical'){
      if (rhCtrl) rhCtrl.classList.remove('env-block-hidden');
      document.querySelectorAll('.scen-gh-only').forEach(el => el.classList.add('env-block-hidden'));
      document.querySelectorAll('.scen-vf-only').forEach(el => el.classList.remove('env-block-hidden'));
      if (tempEl){ tempEl.min = 16; tempEl.max = 32; }
      if (st().temp > 32) st().temp = 32;
      if (st().temp < 16) st().temp = 16;
      if (tempBEl){ tempBEl.min = 16; tempBEl.max = 32; }
      st().ledEfficacyVf = clamp(st().ledEfficacyVf, LED_VF_MIN, LED_VF_MAX);
      applyIdealClosedLight();
      if (allVfCultivars().length){
        if (!allVfCultivars().find(c => c.id === st().cvB)) st().cvB = st().vfCv;
        resetVfStdToSheetDefaults();
        renderCultivars();
      }
      updatePageSub();
    } else {
      if (rhCtrl) rhCtrl.classList.add('env-block-hidden');
      document.querySelectorAll('.scen-gh-only').forEach(el => el.classList.remove('env-block-hidden'));
      document.querySelectorAll('.scen-vf-only').forEach(el => el.classList.add('env-block-hidden'));
      if (tempEl){ tempEl.min = 20; tempEl.max = 38; }
      if (tempBEl){ tempBEl.min = 20; tempBEl.max = 38; }
      renderCultivars();
      updatePageSub();
    }
    if (tempEl) tempEl.value = st().temp;
    if ($('temp-v')) $('temp-v').textContent = r1(st().temp);
    updatePlantingGeomUI();
    renderColophonLight();
    syncGhFacilityPanels();
    syncVfStdControls();
    if (mode === 'greenhouse') renderGhStandardsPanel();
    else renderVfStandardsPanel();
  }

  function renderColophonLight(){
    const el = $('colophon-light');
    if (!el) return;
    el.innerHTML = (isVF() || isPalletView()) ? ui('ui.colophon.lightClosed') : ui('ui.colophon.lightGh');
  }

  function renderPlantingHero(r){
    var hero = $('planting-hero');
    var grid = $('planting-hero-grid');
    if (!hero || !grid) return;
    if (!isPlantingView() || !r || !r.cv){
      hero.classList.add('env-block-hidden');
      return;
    }
    hero.classList.remove('env-block-hidden');
    var pallet = showAsPalletCalc(r);
    var outUnit = r.countUnit === 'шт' ? pm('u.pcs') : pm('unit.g');
    var hy = plantingHarvestYieldParams ? plantingHarvestYieldParams(r.cv, r) : null;
    var heroMass = (hy && hy.harvestYieldPerCut != null) ? hy.harvestYieldPerCut : r.mass;
    var heroUnit = (hy && hy.yieldUnit === 'шт') ? pm('u.pcs') : outUnit;
    var massLabel = (hy && hy.multicutHarvest)
      ? (countIsPieces(r.cv) ? pm('m.massPcsCut') : pm('m.cutMass'))
      : (countIsPieces(r.cv) ? pm('m.massPcsCut') : (pallet || isVF() || r.vfSheet ? pm('m.massCut') : pm('m.massHead')));
    var massVal = st().showRange
      ? round(heroMass - rangeMass(heroMass)) + '–' + round(heroMass + rangeMass(heroMass))
      : String(round(heroMass));
    var sqmU = areaYieldSqmUnit(r.cv, hy);
    var pcsSqm = countIsPieces(r.cv) || (hy && hy.unitIsPieces);
    var sqmMoVal = hy
      ? (pcsSqm ? r1(hy.yieldPerSqmMonthPcs || 0) : r2(hy.yieldPerSqmMonthKg || 0))
      : (pcsSqm ? r1((r.yieldPerSqmYear || 0) / 12) : r2((r.yieldPerSqmYear || 0) / 12));
    var trayLot = !!(r.trayLot) || (global.DG_isTrayLotCrop && global.DG_isTrayLotCrop(r.cv));
    var tiles = [
      { l: massLabel, v: massVal, u: heroUnit, cls: 'hl' },
      { l: pcsSqm ? pm('m.pcsSqmMo') : pm('m.kgSqmMo'), v: sqmMoVal, u: sqmU, cls: 'hl' },
      { l: trayLot ? pm('m.cycle') : pm('m.totalAge'), v: String(round(trayLot ? (r.totalCycleDays || r.t_total) : r.t_total)), u: pm('unit.days') },
      { l: trayLot ? pm('m.densityTrayLot') : pm('m.density'), v: String(round(r.rhoA || 0)), u: pm('u.pcsSqm') },
      { l: pm('m.totalPlants'), v: String(r.total || 0), u: pm('u.pcs') },
      ...(trayLot ? [] : [{ l: pm('m.canopyDiam'), v: String(round(r.canopy)), u: pm('unit.mm') }])
    ];
    grid.innerHTML = tiles.map(function(t){
      return '<div class="planting-hero-tile ' + (t.cls || '') + '">' +
        '<div class="planting-hero-label">' + htmlEsc(t.l) + '</div>' +
        '<div class="planting-hero-val">' + htmlEsc(t.v) + '<span class="planting-hero-unit">' + htmlEsc(t.u) + '</span></div>' +
        '</div>';
    }).join('');
  }

  function renderActiveCvBar(r){
    var bar = $('planting-active-cv-bar');
    if (!bar) return;
    if (!isPlantingView()){
      bar.classList.add('env-block-hidden');
      return;
    }
    bar.classList.remove('env-block-hidden');
    var cv = r && r.cv;
    var nameEl = $('planting-active-cv-name');
    var subEl = $('planting-active-cv-sub');
    var modeEl = $('planting-active-cv-mode');
    if (nameEl) nameEl.textContent = cv ? cv.name : '—';
    if (subEl){
      if (cv && cv.sub){
        subEl.textContent = catalogPhrase(cv.sub);
        subEl.classList.remove('env-block-hidden');
      } else {
        subEl.textContent = '';
        subEl.classList.add('env-block-hidden');
      }
    }
    if (modeEl){
      var modeKey = isPalletView() ? 'tab.pallets' : (isVF() ? 'facility.vertical' : 'facility.greenhouse');
      modeEl.textContent = ui(modeKey);
    }
  }

  function renderAll(){
    if (isVF() || isPalletView()) applyIdealClosedLight();
    let r;
    try {
      r = calc();
    } catch (err) {
      showError('renderAll/calc', err);
      r = { cv: getActiveCv() || { name: '—', M_max: 40, ca: 10, bolt: 90, t_opt: 22 }, total: 0, mass: 0, canopy: 0, massAuto: 0, t_ch: st().day, t_total: 0, rgrMass: 0, rgrCanopy: 0, tHarvestCh: 0, tBoltCh: 90, st: 'young', rhoA: 0, perChan: 0, sysWmm: 0, sysArea: 0, leafGap: 0, cyclesPerYear: 0, yieldPerCycleKg: 0, yieldPerSqmCycle: 0, yieldPerSqmYear: 0, totalCycleDays: 0, palletMode: isPalletView(), palletTiers: st().palletTiers || 1, totalPlantsAllTiers: 0, rackHeightMm: 0, totalPallets: 0 };
      if (isPalletView()){
        try { Object.assign(r, plantLayoutPallet()); } catch(_){}
      }
    }
    updateCalcBuildBadge(r);
    updatePlantingGeomUI();
    if (deps.syncTrayLotUI) deps.syncTrayLotUI();
    syncGhFacilityPanels();
    renderActiveCvBar(r);
    renderPlantingHero(r);
    syncGhCutsUI();
    if (st().multicut && supportsMulticut(r.cv)) syncCutIntervalSlider(r.cv);
    syncCanopyUI();
    syncVfStdControls();
    if (!georgyModeRef() || !georgyModeRef().isGeorgyGh()){
      renderGhStandardsPanel();
      renderVfStandardsPanel();
    }
    if (georgyModeRef() && georgyModeRef().isGeorgyGh()){
      georgyModeRef().syncGeorgyControls(r);
      georgyModeRef().renderGeorgyWarnings(r);
    }
    if (canopyDensityUi) canopyDensityUi.syncCanopyDensityUi(r);
    var ghChUi = deps.getGhChannelSimple ? deps.getGhChannelSimple() : null;
    if (ghChUi && ghChUi.syncPanel) ghChUi.syncPanel(r);
    if (plantingGuides) plantingGuides.sync();
    if (simpleUiMode) simpleUiMode.sync();
    renderStage(r);
    renderEnvSummary(r);
    renderMetrics(r);
    if (deps.getFarmCalibration) deps.getFarmCalibration().renderPanel(r);
    renderChart(r);
    renderMulticut(r);
    syncGrowContextHints(r);
    renderSchema(r);
    renderScenarios();
    renderRecs(r);
    renderCvCompare();
    if (st().appView === 'economics') renderEconomics();
    syncMoneySliderDisplays();
    if (isPlantingView() && cvPanelRefreshNeeded()) renderCultivars();
    if (typeof DG_applyUiI18n === 'function') DG_applyUiI18n();
    else if (typeof DG_applyPlantingI18n === 'function') DG_applyPlantingI18n();
    syncMulticutDetailUI();
    syncGhYieldControls(r);
    syncHarvestBlockUI(r);
    syncVfStdControls();
    updatePageSub();
    if (global.DG_plantingUx) global.DG_plantingUx.syncProjectMetaBar();
  }

  function isPlantingView(){
    return st().appView === 'channels' || st().appView === 'pallets';
  }

    /* Публичный API — только то, что вызывается из HTML / runtime-init */
    return {
      renderAll: renderAll,
      renderCultivars: renderCultivars,
      renderMonths: renderMonths,
      renderCvCompare: renderCvCompare,
      initCollapseBlocks: initCollapseBlocks,
      setCollapseBlock: setCollapseBlock,
      setFacility: setFacility,
      withRange: withRange,
      rangeText: rangeText,
      calcForGhYieldCompareCv: calcForGhYieldCompareCv,
      renderGhYieldTotals: renderGhYieldTotals,
      getCompareList: getCompareList,
      comparePickActiveId: comparePickActiveId,
      ensureComparePick: ensureComparePick,
      syncVfSlidersFromState: syncVfSlidersFromState
    };
  }

  global.DG_createPlantingRender = createPlantingRender;
})(typeof window !== 'undefined' ? window : globalThis);
