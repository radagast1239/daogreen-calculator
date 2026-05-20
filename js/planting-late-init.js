/**
 * Snapshot, Georgy, render — поздняя инициализация.
 * DG_createPlantingLateInit(deps) → { install, getRender, … }
 */
(function (global) {
  'use strict';

  function createPlantingLateInit(deps) {
    var georgyMode;
    var canopyDensityUi;
    var simpleUiMode;
    var plantingGuides;
    var plantingHarvestYieldParams, buildPlantingSnapshot, getPlantingSnapshot;
    var getPlantingStateEconSlice, restorePlantingStateEconSlice, plantingCvIdMatchesLiveState;
    var getPlantingSnapshotForCvId, averageSnapshots, getSaladMixSnapshot;
    var _render;

    var $ = deps.$;
    var clamp = deps.clamp;
    var HARVEST_MONTH_DAYS = deps.HARVEST_MONTH_DAYS;
    var ECON_SALAD_MIX_ID = deps.ECON_SALAD_MIX_ID;
    var ECON_SALAD_MIX_CV_IDS = deps.ECON_SALAD_MIX_CV_IDS;
    var supportsMulticut = deps.supportsMulticut;
    var effectiveCutInterval = deps.effectiveCutInterval;
    var cutMassPerPlant = deps.cutMassPerPlant;
    var cutMassForMonthlyYield = deps.cutMassForMonthlyYield || cutMassPerPlant;
    var getMulticutYieldPerPlant = deps.getMulticutYieldPerPlant;
    var isVfSheetCv = deps.isVfSheetCv;
    var isPalletView = deps.isPalletView;
    var isChannelGreenhouse = deps.isChannelGreenhouse;
    var isVF = deps.isVF;
    var lightingMolForEnergy = deps.lightingMolForEnergy;
    var kwhPerSqmPerDayFromDli = deps.kwhPerSqmPerDayFromDli;
    var effectivePhotoperiod = deps.effectivePhotoperiod;
    var calc = deps.calc;
    var calcFromPalletSheet = deps.calcFromPalletSheet;
    var calcFromVfSheet = deps.calcFromVfSheet;
    var findCvById = deps.findCvById;
    var isPalletCvId = deps.isPalletCvId;
    var isVfCvId = deps.isVfCvId;
    var allPalletCultivars = deps.allPalletCultivars;
    var allVfCultivars = deps.allVfCultivars;
    var allGhCultivars = deps.allGhCultivars;
    var applyPalletStandardsFromSheet = deps.applyPalletStandardsFromSheet;
    var applyVfProfileToStateOnly = deps.applyVfProfileToStateOnly;
    var applyGhProfileToStateOnly = deps.applyGhProfileToStateOnly;
    var getGhCvStandards = deps.getGhCvStandards;
    var buildDefaultVfStandards = deps.buildDefaultVfStandards;
    var getCv = deps.getCv;
    var plantLayout = deps.plantLayout;
    var massAtTotal = deps.massAtTotal;
    var harvestCanopy = deps.harvestCanopy;
    var crowdingFactor = deps.crowdingFactor;
    var effectiveCa = deps.effectiveCa;
    var boltShift = deps.boltShift;
    var boltChannel = deps.boltChannel;
    var tempFactor = deps.tempFactor;
    var naturalDLI = deps.naturalDLI;
    var effectiveDLI = deps.effectiveDLI;
    var setFacility = deps.setFacility;
    var renderAll = deps.renderAll;
    var renderCultivars = deps.renderCultivars;
    var dliFactor = deps.dliFactor;
    var photoperiodFactor = deps.photoperiodFactor;
    var cutIntervalMods = deps.cutIntervalMods;
    var syncVegPeriodTotal = deps.syncVegPeriodTotal;

  function hasEconSavedProfile(cvId){
    if (!cvId || cvId === ECON_SALAD_MIX_ID) return true;
    if (isVfCvId(cvId)) return !!(deps.getState().vfUserStandards[cvId] && deps.getState().vfUserStandards[cvId].userSaved);
    return !!(deps.getState().ghStandards[cvId] && deps.getState().ghStandards[cvId].userSaved);
  }

  function initPlantingSnapshot(){
    if (!window.DG_createPlantingSnapshot){
      console.warn('planting-snapshot.js не загружен — импорт в экономику недоступен');
      function snapUnavailable(){ return null; }
      function snapSliceUnavailable(){ return {}; }
      plantingHarvestYieldParams = function(){ return {}; };
      buildPlantingSnapshot = snapUnavailable;
      getPlantingSnapshot = snapUnavailable;
      getPlantingStateEconSlice = snapSliceUnavailable;
      restorePlantingStateEconSlice = function(){};
      plantingCvIdMatchesLiveState = function(){ return false; };
      getPlantingSnapshotForCvId = snapUnavailable;
      averageSnapshots = snapUnavailable;
      getSaladMixSnapshot = snapUnavailable;
      return;
    }
    var ps = window.DG_createPlantingSnapshot({
      getState: deps.getState,
      HARVEST_MONTH_DAYS: HARVEST_MONTH_DAYS,
      supportsMulticut: supportsMulticut,
      effectiveCutInterval: effectiveCutInterval,
      cutMassPerPlant: cutMassPerPlant,
      cutMassForMonthlyYield: cutMassForMonthlyYield,
      getMulticutYieldPerPlant: getMulticutYieldPerPlant,
      isVfSheetCv: isVfSheetCv,
      isPalletView: isPalletView,
      isVF: isVF,
      lightingMolForEnergy: lightingMolForEnergy,
      kwhPerSqmPerDayFromDli: kwhPerSqmPerDayFromDli,
      effectivePhotoperiod: effectivePhotoperiod,
      calc: calc,
      calcFromPalletSheet: calcFromPalletSheet,
      calcFromVfSheet: calcFromVfSheet,
      findCvById: findCvById,
      isPalletCvId: isPalletCvId,
      isVfCvId: isVfCvId,
      allPalletCultivars: allPalletCultivars,
      allVfCultivars: allVfCultivars,
      allGhCultivars: allGhCultivars,
      applyPalletStandardsFromSheet: applyPalletStandardsFromSheet,
      applyVfProfileToStateOnly: applyVfProfileToStateOnly,
      applyGhProfileToStateOnly: applyGhProfileToStateOnly,
      getGhCvStandards: getGhCvStandards,
      buildDefaultVfStandards: buildDefaultVfStandards,
      hasEconSavedProfile: hasEconSavedProfile,
      ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,
      ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,
      t: window.DG_t,
      tFmt: window.DG_tFmt
    });
    plantingHarvestYieldParams = ps.plantingHarvestYieldParams;
    buildPlantingSnapshot = ps.buildPlantingSnapshot;
    getPlantingSnapshot = ps.getPlantingSnapshot;
    getPlantingStateEconSlice = ps.getPlantingStateEconSlice;
    restorePlantingStateEconSlice = ps.restorePlantingStateEconSlice;
    plantingCvIdMatchesLiveState = ps.plantingCvIdMatchesLiveState;
    getPlantingSnapshotForCvId = ps.getPlantingSnapshotForCvId;
    averageSnapshots = ps.averageSnapshots;
    getSaladMixSnapshot = ps.getSaladMixSnapshot;
  }

  function initGeorgyMode(){
    if (!window.DG_createGeorgyMode) return;
    georgyMode = window.DG_createGeorgyMode({
      $: $,
      getState: deps.getState,
      getCv: getCv,
      findCvById: findCvById,
      allGhCultivars: allGhCultivars,
      plantLayout: plantLayout,
      massAtTotal: massAtTotal,
      harvestCanopy: harvestCanopy,
      crowdingFactor: crowdingFactor,
      effectiveCa: effectiveCa,
      boltShift: boltShift,
      boltChannel: boltChannel,
      tempFactor: tempFactor,
      cutMassPerPlant: cutMassPerPlant,
      naturalDLI: naturalDLI,
      effectiveDLI: effectiveDLI,
      isVF: isVF,
      isPalletView: isPalletView,
      setFacility: setFacility,
      renderAll: renderAll,
      dliFactor: dliFactor,
      photoperiodFactor: photoperiodFactor,
      cutIntervalMods: cutIntervalMods,
      syncMainSliders: function(){
        if ($('day')){ $('day').value = deps.getState().day; if ($('day-v')) $('day-v').textContent = deps.getState().day; }
        if ($('density')){ $('density').value = deps.getState().density; if ($('density-v')) $('density-v').textContent = deps.getState().density; }
        if ($('nch')){ $('nch').value = deps.getState().nch; if ($('nch-v')) $('nch-v').textContent = deps.getState().nch; }
        if ($('offset')){ $('offset').value = deps.getState().offset; if ($('offset-v')) $('offset-v').textContent = deps.getState().offset; }
        if ($('cutInterval')){ $('cutInterval').value = deps.getState().cutInterval; if ($('cutInterval-v')) $('cutInterval-v').textContent = deps.getState().cutInterval; }
        syncVegPeriodTotal();
      },
      t: window.DG_t,
      tFmt: window.DG_tFmt
    });
    georgyMode.loadGeorgyMode();
    var gBtn = $('btn-georgy-mode');
    if (gBtn) gBtn.addEventListener('click', function(){ georgyMode.toggleGeorgyMode(); });
    function bindGeorgyRange(id, onInput){
      var el = $(id);
      if (!el || el.dataset.georgyBound) return;
      el.dataset.georgyBound = '1';
      el.addEventListener('input', onInput);
    }
    bindGeorgyRange('georgy-germ', function(){
      var cv = getCv();
      if (georgyMode.getGeorgyProfile(cv)) return;
      deps.getState().germination = clamp(parseInt($('georgy-germ').value, 10) || 3, 1, 4);
      if ($('georgy-germ-v')) $('georgy-germ-v').textContent = String(deps.getState().germination);
      if ($('germination')) $('germination').value = deps.getState().germination;
      if ($('germination-v')) $('germination-v').textContent = String(deps.getState().germination);
      if (georgyMode.onGeorgyHeadCycleChanged) georgyMode.onGeorgyHeadCycleChanged();
      renderAll();
    });
    bindGeorgyRange('georgy-nursery', function(){
      var cv = getCv();
      if (georgyMode.getGeorgyProfile(cv)) return;
      deps.getState().nursery = clamp(parseInt($('georgy-nursery').value, 10) || 14, 1, 28);
      if ($('georgy-nursery-v')) $('georgy-nursery-v').textContent = String(deps.getState().nursery);
      if ($('nursery')) $('nursery').value = deps.getState().nursery;
      if ($('nursery-v')) $('nursery-v').textContent = String(deps.getState().nursery);
      if (georgyMode.onGeorgyHeadCycleChanged) georgyMode.onGeorgyHeadCycleChanged();
      renderAll();
    });
    var gDay = $('georgy-day');
    if (gDay){
      gDay.addEventListener('input', function(){
        var cv = getCv();
        var gp = georgyMode.getGeorgyProfile(cv);
        var dMin = gp ? 8 : 1;
        var dMax = gp ? 40 : 28;
        deps.getState().day = clamp(parseInt(gDay.value, 10) || 21, dMin, dMax);
        if (georgyMode.onGeorgyDayChanged) georgyMode.onGeorgyDayChanged();
        if (georgyMode.onGeorgyHeadCycleChanged) georgyMode.onGeorgyHeadCycleChanged();
        if ($('georgy-day-v')) $('georgy-day-v').textContent = String(deps.getState().day);
        if ($('day')) $('day').value = deps.getState().day;
        if ($('day-v')) $('day-v').textContent = String(deps.getState().day);
        renderAll();
      });
    }
    var gInt = $('georgy-cutInterval');
    if (gInt){
      gInt.addEventListener('input', function(){
        var cv = getCv();
        var gp = georgyMode.getGeorgyProfile(cv);
        var lo = gp ? gp.cutIntervalMin : 8;
        var hi = gp ? gp.cutIntervalMax : 18;
        deps.getState().cutInterval = clamp(parseInt(gInt.value, 10) || 12, lo, hi);
        if ($('georgy-cutInterval-v')) $('georgy-cutInterval-v').textContent = String(deps.getState().cutInterval);
        if ($('cutInterval')) $('cutInterval').value = deps.getState().cutInterval;
        if ($('cutInterval-v')) $('cutInterval-v').textContent = deps.getState().cutInterval;
        renderAll();
      });
    }
    var gDens = $('georgy-density');
    if (gDens){
      gDens.addEventListener('input', function(){
        var v = clamp(parseInt(gDens.value, 10) || 80, 15, 220);
        georgyMode.setGeorgyTargetDensity(v);
        deps.getState().georgyDensityFitted = true;
        deps.getState().density = v;
        if ($('georgy-density-v')) $('georgy-density-v').textContent = String(v);
        if ($('density')) $('density').value = v;
        if ($('density-v')) $('density-v').textContent = String(v);
        renderAll();
      });
    }
    if (window.DG_createCanopyDensityUi){
      canopyDensityUi = window.DG_createCanopyDensityUi({
        getState: deps.getState,
        getCv: getCv,
        georgyMode: georgyMode,
        syncMainSliders: function(){
          if ($('density')){ $('density').value = deps.getState().density; if ($('density-v')) $('density-v').textContent = deps.getState().density; }
          if ($('extraB')){ $('extraB').value = deps.getState().extraB; if ($('extraB-v')) $('extraB-v').textContent = deps.getState().extraB; }
        },
        renderAll: renderAll,
        t: window.DG_t,
        tFmt: window.DG_tFmt
      });
      canopyDensityUi.bind();
    }
    if (window.DG_createSimpleUiMode){
      simpleUiMode = window.DG_createSimpleUiMode({
        getState: deps.getState,
        renderAll: renderAll,
        t: window.DG_t
      });
      simpleUiMode.load();
      simpleUiMode.bind();
    }
    if (window.DG_createPlantingGuides){
      plantingGuides = window.DG_createPlantingGuides({
        t: window.DG_t,
        tFmt: window.DG_tFmt,
        isChannelGreenhouse: isChannelGreenhouse,
        isPalletView: isPalletView
      });
    }
    var gDensAuto = $('georgy-density-auto');
    if (gDensAuto){
      gDensAuto.addEventListener('click', function(){
        georgyMode.applyGeorgyDensityAuto();
        var v = deps.getState().georgyTargetDensity;
        if ($('georgy-density')) $('georgy-density').value = v;
        if ($('georgy-density-v')) $('georgy-density-v').textContent = String(v);
        renderAll();
      });
    }
    var gRucolaStd = $('georgy-rucola-std');
    if (gRucolaStd) gRucolaStd.addEventListener('click', function(){
      georgyMode.applyGeorgyRucolaStandard();
      renderCultivars();
      renderAll();
    });
    var gLettuceStd = $('georgy-lettuce-std');
    if (gLettuceStd) gLettuceStd.addEventListener('click', function(){
      georgyMode.applyGeorgyLettuceStandard();
      renderCultivars();
      renderAll();
    });
    var gGeorgyPanel = $('panel-georgy-simple');
    if (gGeorgyPanel){
      gGeorgyPanel.addEventListener('input', function (e){
        var t = e.target;
        if (!t || !t.getAttribute || t.getAttribute('data-georgy-cut-mass-i') == null) return;
        var idx = parseInt(t.getAttribute('data-georgy-cut-mass-i'), 10);
        if (!isFinite(idx) || idx < 0) return;
        deps.getState().ghCutMasses[idx] = clamp(parseFloat(t.value) || 0, 1, 500);
        deps.getState().georgyManualCutMasses = true;
        renderAll();
      });
      gGeorgyPanel.addEventListener('click', function (e){
        var btn = e.target && e.target.closest && e.target.closest('.georgy-reset-cut-masses');
        if (!btn || !gGeorgyPanel.contains(btn)) return;
        e.preventDefault();
        georgyMode.resetGeorgyBabyCutMassesNorm();
        renderAll();
      });
    }
  }

    function createRenderModule() {
      return global.DG_createPlantingRender({
        getState: deps.getState,
        $: deps.$,
        ui: deps.ui, pt: deps.pt, pm: deps.pm, pr: deps.pr, tr: deps.tr,
        fmtNumRu: deps.fmtNumRu, catalogPhrase: deps.catalogPhrase, cvSubLine: deps.cvSubLine,
        r1: deps.r1, r2: deps.r2, round: deps.round, clamp: deps.clamp, htmlEsc: deps.htmlEsc,
        getGeorgyMode: function(){ return georgyMode; }, georgyMode: georgyMode,
        calc: deps.calc, renderAll: function(){ return _render.renderAll(); },
        getCv: deps.getCv, getActiveCv: deps.getActiveCv, getVfCv: deps.getVfCv, getPalletCv: deps.getPalletCv,
        isVF: deps.isVF, isPalletView: deps.isPalletView, isGreenhousePlanting: deps.isGreenhousePlanting,
        isChannelGreenhouse: deps.isChannelGreenhouse, isVfSheetCv: deps.isVfSheetCv,
        vfEffectiveDay: deps.vfEffectiveDay,
        usePlantingSheet: deps.usePlantingSheet, getPlantingStd: deps.getPlantingStd,
        getGhUsefulAreaM2: deps.getGhUsefulAreaM2, ghYieldWithMargin: deps.ghYieldWithMargin,
        ghYieldKgSqmYear: deps.ghYieldKgSqmYear, calcForGhYieldCompareCv: function(cv){ return _render.calcForGhYieldCompareCv(cv); },
        syncGhYieldControls: deps.syncGhYieldControls, syncGhYieldMarginSliders: deps.syncGhYieldMarginSliders,
        syncBioMarginVisibility: deps.syncBioMarginVisibility,
        supportsMulticut: deps.supportsMulticut,
        plantingHarvestYieldParams: function(cv, r){ return plantingHarvestYieldParams(cv, r); },
        rangeMass: deps.rangeMass, rangeCanopy: deps.rangeCanopy, rangeDay: deps.rangeDay,
        getPlantingStateEconSlice: getPlantingStateEconSlice,
        restorePlantingStateEconSlice: restorePlantingStateEconSlice,
        initPalletValuesFromSheet: deps.initPalletValuesFromSheet,
        resetPalletStdToSheetDefaults: deps.resetPalletStdToSheetDefaults,
        resetVfStdToSheetDefaults: deps.resetVfStdToSheetDefaults,
        applyVfStandardsFromSheet: deps.applyVfStandardsFromSheet,
        applyPalletStandardsFromSheet: applyPalletStandardsFromSheet,
        syncVfStdControls: deps.syncVfStdControls,
        renderGhStandardsPanel: deps.renderGhStandardsPanel, renderVfStandardsPanel: deps.renderVfStandardsPanel,
        renderVfStdGrid: deps.renderVfStdGrid, updatePlantingGeomUI: deps.updatePlantingGeomUI,
        syncGhFacilityPanels: deps.syncGhFacilityPanels, syncGhCutsUI: deps.syncGhCutsUI,
        syncCanopyUI: deps.syncCanopyUI, syncManualMassUI: deps.syncManualMassUI,
        syncMoneySliderDisplays: deps.syncMoneySliderDisplays, updatePageSub: deps.updatePageSub,
        updateCalcBuildBadge: deps.updateCalcBuildBadge, showError: deps.showError,
        monthLabel: deps.monthLabel, stageOf: deps.stageOf, holeDiameter: deps.holeDiameter,
        plantLayout: deps.plantLayout, plantLayoutPallet: deps.plantLayoutPallet,
        schemaCanopyMm: deps.schemaCanopyMm, syncSchemaCanopyLegend: deps.syncSchemaCanopyLegend,
        palletCellGeometry: deps.palletCellGeometry, getCellCenters: deps.getCellCenters,
        effectiveDLI: deps.effectiveDLI, naturalDLI: deps.naturalDLI, supplementDLI: deps.supplementDLI,
        effectivePhotoperiod: deps.effectivePhotoperiod, photoperiod: deps.photoperiod, eveningHours: deps.eveningHours,
        daySupplement: deps.daySupplement, eveningSupplement: deps.eveningSupplement,
        photoperiodFactor: deps.photoperiodFactor, envMultiplier: deps.envMultiplier,
        kwhPerSqmPerDayFromDli: deps.kwhPerSqmPerDayFromDli, ppfdFromDli: deps.ppfdFromDli, ledEfficacy: deps.ledEfficacy,
        findCvById: deps.findCvById, buildDefaultVfStandards: deps.buildDefaultVfStandards,
        buildDefaultGhStandards: deps.buildDefaultGhStandards,
        envBolt: deps.envBolt, harvestTotal: deps.harvestTotal, vegContextLabel: deps.vegContextLabel,
        showAsPalletCalc: deps.showAsPalletCalc, syncMulticutBabyUi: deps.syncMulticutBabyUi,
        calcScenario: deps.calcScenario, calcScenarioVf: deps.calcScenarioVf, calcScenarioPallet: deps.calcScenarioPallet,
        addDays: deps.addDays, fmtDate: deps.fmtDate,
        NATURAL_DLI: deps.NATURAL_DLI, VF_CULTIVARS: deps.VF_CULTIVARS, PALLET_CULTIVARS: deps.PALLET_CULTIVARS,
        CASSETTES_PER_PALLET: deps.CASSETTES_PER_PALLET,
        CUT_INTERVAL_SLACK: deps.CUT_INTERVAL_SLACK,
        CH_W: deps.CH_W, MAX_WIDTH: deps.MAX_WIDTH, HOLE_D_VF: deps.HOLE_D_VF,
        PALLET_L_MM: deps.PALLET_L_MM, PALLET_W_MM: deps.PALLET_W_MM,
        CASSETTE_L_MM: deps.CASSETTE_L_MM, CASSETTE_W_MM: deps.CASSETTE_W_MM,
        palletCellsForLayout: deps.palletCellsForLayout,
        FACILITY_KEY: deps.FACILITY_KEY, showToast: deps.showToast,
        LED_VF_MIN: deps.LED_VF_MIN, LED_VF_MAX: deps.LED_VF_MAX,
        syncHarvestBlockUI: deps.syncHarvestBlockUI, updateMassModelHint: deps.updateMassModelHint,
        modelCanopyFromMass: deps.modelCanopyFromMass, syncMulticutDetailUI: deps.syncMulticutDetailUI,
        cutIntervalMods: deps.cutIntervalMods, vegContextLabelCap: deps.vegContextLabelCap,
        palletMountMode: deps.palletMountMode, computeGhYieldTotals: deps.computeGhYieldTotals,
        dliFactor: deps.dliFactor, tempFactor: deps.tempFactor, effectiveTempFactor: deps.effectiveTempFactor,
        boltShift: deps.boltShift, greenhouseHeatYieldLossPct: deps.greenhouseHeatYieldLossPct,
        massAtTotal: deps.massAtTotal, canopyAtTotal: deps.canopyAtTotal, harvestChannel: deps.harvestChannel,
        boltChannel: deps.boltChannel, totalAge: deps.totalAge, preChannelDays: deps.preChannelDays,
        effectiveCutInterval: deps.effectiveCutInterval, cutMassPerPlant: deps.cutMassPerPlant,
        multicutHorizon: deps.multicutHorizon,
        vfMulticutStats: deps.vfMulticutStats,
        ICON: deps.ICON, CV_COLORS: deps.CV_COLORS, COLLAPSE_DEFAULTS: deps.COLLAPSE_DEFAULTS,
        CALC_BUILD: deps.CALC_BUILD, PALLET_SECTIONS: deps.PALLET_SECTIONS, VF_SECTIONS: deps.VF_SECTIONS,
        CULTIVARS: deps.CULTIVARS, allGhCultivars: deps.allGhCultivars, allVfCultivars: deps.allVfCultivars,
        allPalletCultivars: deps.allPalletCultivars, addCustomGhCultivar: deps.addCustomGhCultivar,
        addCustomVfCultivar: deps.addCustomVfCultivar, removeCustomCultivar: deps.removeCustomCultivar,
        renderEconomics: deps.renderEconomics,
        canopyDensityUi: canopyDensityUi, plantingGuides: plantingGuides, simpleUiMode: simpleUiMode
      });
    }

    function install() {
      initPlantingSnapshot();
      initGeorgyMode();
      _render = createRenderModule();
      global.DG_plantingRender = _render;
    }

    function api() {
      return {
        install: install,
        getRender: function(){ return _render; },
        getGeorgyMode: function(){ return georgyMode; },
        hasEconSavedProfile: hasEconSavedProfile,
        plantingHarvestYieldParams: plantingHarvestYieldParams,
        buildPlantingSnapshot: buildPlantingSnapshot,
        getPlantingSnapshot: getPlantingSnapshot,
        getPlantingStateEconSlice: getPlantingStateEconSlice,
        restorePlantingStateEconSlice: restorePlantingStateEconSlice,
        plantingCvIdMatchesLiveState: plantingCvIdMatchesLiveState,
        getPlantingSnapshotForCvId: getPlantingSnapshotForCvId,
        averageSnapshots: averageSnapshots,
        getSaladMixSnapshot: getSaladMixSnapshot,
        canopyDensityUi: function(){ return canopyDensityUi; },
        plantingGuides: function(){ return plantingGuides; },
        simpleUiMode: function(){ return simpleUiMode; }
      };
    }

    return api();
  }

  global.DG_createPlantingLateInit = createPlantingLateInit;
})(typeof window !== 'undefined' ? window : globalThis);
