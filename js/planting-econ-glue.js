/**
 * Инициализация econ-core/ui, store, обёртка renderEconomics.
 * DG_createPlantingEconGlue(deps)
 */
(function (global) {
  'use strict';

  function createPlantingEconGlue(deps) {
    function st() { return deps.getState(); }
    function $(id) { return deps.$(id); }
    function clamp(v, lo, hi) { return deps.clamp(v, lo, hi); }
    function mergeLocaleDeps(o) { return deps.mergeLocaleDeps(o); }
    var ECON_STORAGE = deps.ECON_STORAGE;
    var ECON_EQUIPMENT_GROUPS_FALLBACK = deps.ECON_EQUIPMENT_GROUPS_FALLBACK;
    var ECON_MONTH_DAYS = deps.ECON_MONTH_DAYS;
    var ECON_MAX_CULTURES = deps.ECON_MAX_CULTURES;
    var ECON_SALAD_MIX_ID = deps.ECON_SALAD_MIX_ID;
    var ECON_SALAD_MIX_CV_IDS = deps.ECON_SALAD_MIX_CV_IDS;
    var ECON_CONSUMABLES_PER_POT_HINT = deps.ECON_CONSUMABLES_PER_POT_HINT;
    var VF_CULTIVARS = deps.VF_CULTIVARS;
    var CULTIVARS = deps.CULTIVARS;
    var PALLET_CULTIVARS = deps.PALLET_CULTIVARS;
    var HARVEST_MONTH_DAYS = deps.HARVEST_MONTH_DAYS;
    function getActivePlantingCvId() { return deps.getActivePlantingCvId.apply(deps, arguments); }
    function r1() { return deps.r1.apply(deps, arguments); }
    function r2() { return deps.r2.apply(deps, arguments); }
    function r3() { return deps.r3.apply(deps, arguments); }
    function fmtNum() { return deps.fmtNum.apply(deps, arguments); }
    function getPlantingSnapshotForCvId() { return deps.getPlantingSnapshotForCvId.apply(deps, arguments); }
    function getPlantingSnapshot() { return deps.getPlantingSnapshot.apply(deps, arguments); }
    function plantingCvIdMatchesLiveState() { return deps.plantingCvIdMatchesLiveState.apply(deps, arguments); }
    function findCvById() { return deps.findCvById.apply(deps, arguments); }
    function isPalletCvId() { return deps.isPalletCvId.apply(deps, arguments); }
    function isVfCvId() { return deps.isVfCvId.apply(deps, arguments); }
    function allPalletCultivars() { return deps.allPalletCultivars.apply(deps, arguments); }
    function allVfCultivars() { return deps.allVfCultivars.apply(deps, arguments); }
    function allGhCultivars() { return deps.allGhCultivars.apply(deps, arguments); }
    function supportsMulticut() { return deps.supportsMulticut.apply(deps, arguments); }
    function cutIntervalRange() { return deps.cutIntervalRange.apply(deps, arguments); }
    function getGhCvStandards() { return deps.getGhCvStandards.apply(deps, arguments); }
    function buildDefaultVfStandards() { return deps.buildDefaultVfStandards.apply(deps, arguments); }
    function parseNumInput() { return deps.parseNumInput.apply(deps, arguments); }
    function formatInputValue() { return deps.formatInputValue.apply(deps, arguments); }
    function decimalsFromStep() { return deps.decimalsFromStep.apply(deps, arguments); }
    function round() { return deps.round.apply(deps, arguments); }

    var defaultEconState, defaultEconEquipment, defaultEconCultureRow, defaultEconCultures;
    var getEquipmentGroups;
    var econCvDisplayName, econGhYieldPerCutFromStd, econCvTotalCycleDays, econSheetCutIntervalDays, econSheetYieldPerCut;
    var econYieldParamsForCvId, econCatalogDefaultsForCvId, normalizeEconCultureRow, parsePotHarvestMonthsFromCv, migrateEconCultureRows;
    var econCultureBio, formatEconCultureHint, calcCultureConsumables, econApplyCultureSelect, importEconRowFromPlanting, importAllEconFromPlanting;
    var calcOtherElecMonthly, migrateEconOtherElectricity, ensureEconCultures, econCulturesTotalPct, calcCultureSliceFromRow;
    var dedupeEconCultures, canAddEconCulture, findDuplicateCultureIds, collectEconWarnings, calcFarmEconomics, calcEconomics;
    var getEconCultureOptionsHtml, isEconCvIdTaken, renderEconomics, syncEconFromPlanting, syncEconInputsFromState;

    function econStateFallback(){
    return {
      priceKwh: 5, rentMonth: 0, staffCount: 2, staffSalary: 55000, payrollTax: true, logisticsMonth: 0,
      floorArea: 200, plantingArea: 150,
      cultures: [{ cvId: '', pct: 100, salePrice: 0, density: 80, yieldPerCut: 15, cutIntervalDays: 15,
        kwhPerM2Hour: 0.08, lightHoursDay: 16, consumablesPerPot: 4, potHarvestMonths: 3, unitIsPieces: false }],
      salePrice: 800, kwhPerM2Hour: 0.08, lightHoursDay: 16, otherElecKw: 1.1, otherElecHoursDay: 24,
      otherMonth: 15000, consumablesPerKg: 0, wastePct: 0, usnTax: false, amortMonths: 60,
      equipmentEnabled: true, equipment: {}, equipmentCustom: []
    };
  }
  function getDefaultEconState(){
    if (typeof defaultEconState === 'function') return defaultEconState();
    return econStateFallback();
  }
  function getDefaultEconEquipment(){
    if (typeof defaultEconEquipment === 'function') return defaultEconEquipment();
    return {};
  }
  function getDefaultEconCultureRow(cvId, opts){
    if (typeof defaultEconCultureRow === 'function') return defaultEconCultureRow(cvId, opts);
    return { cvId: cvId || '', pct: 100, salePrice: 0, density: 80, yieldPerCut: 15, cutIntervalDays: 15,
      kwhPerM2Hour: 0.08, lightHoursDay: 16, consumablesPerPot: 4, potHarvestMonths: 3, unitIsPieces: false };
  }

  function loadEconStore(){
    try {
      let raw = localStorage.getItem(ECON_STORAGE);
      if (!raw) raw = localStorage.getItem('calc-econ-v2');
      if (!raw) raw = localStorage.getItem('calc-econ-v1');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;
      st().econ = Object.assign(getDefaultEconState(), data);
      if (data.equipment) st().econ.equipment = Object.assign(getDefaultEconEquipment(), data.equipment);
      if (!data.cultures && data.cultureShare != null){
        st().econ.cultures = [getDefaultEconCultureRow('')];
        st().econ.cultures[0].pct = data.cultureShare;
      }
      ensureEconCultures();
      migrateEconCultureRows();
      migrateEconOtherElectricity(st().econ);
      ensureEconEquipment();
      try {
        localStorage.removeItem('calc-econ-v1');
        localStorage.removeItem('calc-econ-v2');
      } catch(_){}
    } catch(_){}
  }

  function saveEconStore(){
    try { localStorage.setItem(ECON_STORAGE, JSON.stringify(st().econ)); } catch(_){}
  }

  function ensureEconEquipment(){
    if (!st().econ) return;
    if (!st().econ.equipment) st().econ.equipment = getDefaultEconEquipment();
    else st().econ.equipment = Object.assign(getDefaultEconEquipment(), st().econ.equipment);
    if (!Array.isArray(st().econ.equipmentCustom)) st().econ.equipmentCustom = [];
    if (st().econ.equipmentEnabled == null) st().econ.equipmentEnabled = true;
  }

  function econEquipmentGroups(){
    return (typeof getEquipmentGroups === 'function') ? getEquipmentGroups() : ECON_EQUIPMENT_GROUPS_FALLBACK;
  }

  function sumEconEquipmentRaw(){
    ensureEconEquipment();
    let tot = 0;
    const eq = st().econ.equipment;
    econEquipmentGroups().forEach(g => g.items.forEach(([k]) => { tot += parseFloat(eq[k]) || 0; }));
    (st().econ.equipmentCustom || []).forEach(it => { tot += parseFloat(it.amount) || 0; });
    return tot;
  }

  function sumEconEquipment(){
    if (st().econ.equipmentEnabled === false) return 0;
    return sumEconEquipmentRaw();
  }

  function initEconCore(){
    if (!window.DG_createEconCore){
      console.warn('econ-core.js не загружен — экономика недоступна');
      return;
    }
    var ec = window.DG_createEconCore(mergeLocaleDeps({
      getState: function(){ return st(); },
      getActivePlantingCvId: getActivePlantingCvId,
      clamp: clamp,
      round: function(n){ return Math.round(n); },
      r1: r1, r2: r2, r3: r3,
      fmtNum: fmtNum,
      getPlantingSnapshotForCvId: getPlantingSnapshotForCvId,
      getPlantingSnapshot: getPlantingSnapshot,
      plantingCvIdMatchesLiveState: plantingCvIdMatchesLiveState,
      findCvById: findCvById,
      isPalletCvId: isPalletCvId,
      isVfCvId: isVfCvId,
      allPalletCultivars: allPalletCultivars,
      allVfCultivars: allVfCultivars,
      allGhCultivars: allGhCultivars,
      supportsMulticut: supportsMulticut,
      cutIntervalRange: cutIntervalRange,
      getGhCvStandards: getGhCvStandards,
      buildDefaultVfStandards: buildDefaultVfStandards,
      saveEconStore: saveEconStore,
      sumEconEquipment: sumEconEquipment
    }));
    getEquipmentGroups = ec.getEquipmentGroups;
    defaultEconEquipment = ec.defaultEconEquipment;
    defaultEconCultureRow = ec.defaultEconCultureRow;
    defaultEconCultures = ec.defaultEconCultures;
    defaultEconState = ec.defaultEconState;
    econCvDisplayName = ec.econCvDisplayName;
    econGhYieldPerCutFromStd = ec.econGhYieldPerCutFromStd;
    econCvTotalCycleDays = ec.econCvTotalCycleDays;
    econSheetCutIntervalDays = ec.econSheetCutIntervalDays;
    econSheetYieldPerCut = ec.econSheetYieldPerCut;
    econYieldParamsForCvId = ec.econYieldParamsForCvId;
    econCatalogDefaultsForCvId = ec.econCatalogDefaultsForCvId;
    normalizeEconCultureRow = ec.normalizeEconCultureRow;
    parsePotHarvestMonthsFromCv = ec.parsePotHarvestMonthsFromCv;
    migrateEconCultureRows = ec.migrateEconCultureRows;
    econCultureBio = ec.econCultureBio;
    formatEconCultureHint = ec.formatEconCultureHint;
    calcCultureConsumables = ec.calcCultureConsumables;
    econApplyCultureSelect = ec.econApplyCultureSelect;
    importEconRowFromPlanting = ec.importEconRowFromPlanting;
    importAllEconFromPlanting = ec.importAllEconFromPlanting;
    calcOtherElecMonthly = ec.calcOtherElecMonthly;
    migrateEconOtherElectricity = ec.migrateEconOtherElectricity;
    ensureEconCultures = ec.ensureEconCultures;
    econCulturesTotalPct = ec.econCulturesTotalPct;
    calcCultureSliceFromRow = ec.calcCultureSliceFromRow;
    dedupeEconCultures = ec.dedupeEconCultures;
    canAddEconCulture = ec.canAddEconCulture;
    findDuplicateCultureIds = ec.findDuplicateCultureIds;
    collectEconWarnings = ec.collectEconWarnings;
    calcFarmEconomics = ec.calcFarmEconomics;
    calcEconomics = ec.calcEconomics;
    if (!st().econ && typeof ec.defaultEconState === 'function') st().econ = ec.defaultEconState();
  }

  function initEconUI(){
    if (!window.DG_createEconUI){
      console.warn('econ-ui.js не загружен — интерфейс экономики недоступен');
      return;
    }
    var eu = window.DG_createEconUI(mergeLocaleDeps({
      getState: function(){ return st(); },
      $: $,
      ECON_MONTH_DAYS: ECON_MONTH_DAYS,
      ECON_MAX_CULTURES: ECON_MAX_CULTURES,
      ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,
      ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,
      ECON_CONSUMABLES_PER_POT_HINT: ECON_CONSUMABLES_PER_POT_HINT,
      getEquipmentGroups: econEquipmentGroups,
      ECON_EQUIPMENT_GROUPS: ECON_EQUIPMENT_GROUPS_FALLBACK,
      VF_CULTIVARS: VF_CULTIVARS,
      CULTIVARS: CULTIVARS,
      PALLET_CULTIVARS: PALLET_CULTIVARS,
      ensureEconCultures: ensureEconCultures,
      migrateEconCultureRows: migrateEconCultureRows,
      dedupeEconCultures: dedupeEconCultures,
      normalizeEconCultureRow: normalizeEconCultureRow,
      econCultureBio: econCultureBio,
      formatEconCultureHint: formatEconCultureHint,
      econApplyCultureSelect: econApplyCultureSelect,
      calcFarmEconomics: calcFarmEconomics,
      importAllEconFromPlanting: importAllEconFromPlanting,
      getPlantingSnapshot: getPlantingSnapshot,
      saveEconStore: saveEconStore,
      ensureEconEquipment: ensureEconEquipment,
      sumEconEquipmentRaw: sumEconEquipmentRaw,
      sumEconEquipment: sumEconEquipment,
      canAddEconCulture: canAddEconCulture,
      econCulturesTotalPct: econCulturesTotalPct,
      migrateEconOtherElectricity: migrateEconOtherElectricity,
      parseNumInput: parseNumInput,
      formatInputValue: formatInputValue,
      decimalsFromStep: decimalsFromStep,
      fmtNum: fmtNum,
      clamp: clamp,
      round: round,
      r1: r1, r2: r2, r3: r3
    }));
    getEconCultureOptionsHtml = eu.getEconCultureOptionsHtml;
    isEconCvIdTaken = eu.isEconCvIdTaken;
    renderEconomics = eu.renderEconomics;
    syncEconFromPlanting = eu.syncEconFromPlanting;
    syncEconInputsFromState = eu.syncEconInputsFromState;
  }

    function install() {
      initEconCore();
      initEconUI();
      if (!st().econ) st().econ = getDefaultEconState();
      var renderEconomicsBase = renderEconomics;
      renderEconomics = function(){
        renderEconomicsBase();
        var sensDeps = mergeLocaleDeps({
          getState: function(){ return st(); },
          calcFarmEconomics: calcFarmEconomics,
          sumEconEquipment: sumEconEquipment,
          fmtNum: deps.fmtNum,
          r1: deps.r1
        });
        if (global.DG_renderEconSensitivity) global.DG_renderEconSensitivity(sensDeps);
        if (global.DG_renderEconPayback){
          global.DG_renderEconPayback(mergeLocaleDeps({
            getState: function(){ return st(); },
            calcFarmEconomics: calcFarmEconomics,
            sumEconEquipment: sumEconEquipment,
            fmtNum: deps.fmtNum
          }));
        }
        if (global.DG_ensureEconExtensions) global.DG_ensureEconExtensions(st());
        if (global.DG_renderEconAdvanced){
          global.DG_renderEconAdvanced(mergeLocaleDeps({
            getState: function(){ return st(); },
            calcFarmEconomics: calcFarmEconomics,
            migrateEconOtherElectricity: migrateEconOtherElectricity,
            saveEconStore: saveEconStore,
            fmtNum: deps.fmtNum,
            r1: deps.r1,
            esc: function(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
          }));
        }
      };
      if (global.DG_initEconSensitivityExtras) global.DG_initEconSensitivityExtras();
      return buildApi();
    }

    function buildApi() {
      return {
        getEquipmentGroups: getEquipmentGroups,
        getDefaultEconState: getDefaultEconState,
        getDefaultEconEquipment: getDefaultEconEquipment,
        getDefaultEconCultureRow: getDefaultEconCultureRow,
        loadEconStore: loadEconStore,
        saveEconStore: saveEconStore,
        ensureEconEquipment: ensureEconEquipment,
        econEquipmentGroups: econEquipmentGroups,
        sumEconEquipmentRaw: sumEconEquipmentRaw,
        sumEconEquipment: sumEconEquipment,
        defaultEconEquipment: defaultEconEquipment,
        defaultEconCultureRow: defaultEconCultureRow,
        defaultEconCultures: defaultEconCultures,
        defaultEconState: defaultEconState,
        econCvDisplayName: econCvDisplayName,
        econGhYieldPerCutFromStd: econGhYieldPerCutFromStd,
        econCvTotalCycleDays: econCvTotalCycleDays,
        econSheetCutIntervalDays: econSheetCutIntervalDays,
        econSheetYieldPerCut: econSheetYieldPerCut,
        econYieldParamsForCvId: econYieldParamsForCvId,
        econCatalogDefaultsForCvId: econCatalogDefaultsForCvId,
        normalizeEconCultureRow: normalizeEconCultureRow,
        parsePotHarvestMonthsFromCv: parsePotHarvestMonthsFromCv,
        migrateEconCultureRows: migrateEconCultureRows,
        econCultureBio: econCultureBio,
        formatEconCultureHint: formatEconCultureHint,
        calcCultureConsumables: calcCultureConsumables,
        econApplyCultureSelect: econApplyCultureSelect,
        importEconRowFromPlanting: importEconRowFromPlanting,
        importAllEconFromPlanting: importAllEconFromPlanting,
        calcOtherElecMonthly: calcOtherElecMonthly,
        migrateEconOtherElectricity: migrateEconOtherElectricity,
        ensureEconCultures: ensureEconCultures,
        econCulturesTotalPct: econCulturesTotalPct,
        calcCultureSliceFromRow: calcCultureSliceFromRow,
        dedupeEconCultures: dedupeEconCultures,
        canAddEconCulture: canAddEconCulture,
        findDuplicateCultureIds: findDuplicateCultureIds,
        collectEconWarnings: collectEconWarnings,
        calcFarmEconomics: calcFarmEconomics,
        calcEconomics: calcEconomics,
        getEconCultureOptionsHtml: getEconCultureOptionsHtml,
        isEconCvIdTaken: isEconCvIdTaken,
        renderEconomics: renderEconomics,
        syncEconFromPlanting: syncEconFromPlanting,
        syncEconInputsFromState: syncEconInputsFromState
      };
    }

    return { install: install };
  }

  global.DG_createPlantingEconGlue = createPlantingEconGlue;
})(typeof window !== 'undefined' ? window : globalThis);
