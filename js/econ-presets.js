/** Пресеты экономики (поля state.econ + опционально состав культур) — DG_ECON_PRESETS */
(function(global){
  'use strict';

  function presetLabel(id, fallback){
    if (global.DG_t){
      var full = global.DG_t('econ.preset.full.' + id);
      if (full && full !== 'econ.preset.full.' + id) return full;
      var short = global.DG_t('econ.preset.' + id);
      if (short && short !== 'econ.preset.' + id) return short;
    }
    return fallback;
  }

  /**
   * Базовый ассортимент (11 культур, доли = 100%).
   * шт: лоток/горшок = 1 шт, цена ₽/шт; остальное — г → кг, цена ₽/кг.
   */
  var BASE_SCENARIO_CULTURES = [
    { cvId: 'pl-microgreens', pct: 8, salePrice: 45 },
    { cvId: 'pl-baby-living', pct: 8, salePrice: 150 },
    { cvId: 'pl-edible-flowers', pct: 7, salePrice: 35 },
    { cvId: 'pl-arugula-baby', pct: 8, salePrice: 950 },
    { cvId: 'pl-spinach-baby', pct: 9, salePrice: 900 },
    { cvId: 'pl-cabbage-avg', pct: 9, salePrice: 850 },
    { cvId: 'pl-basil-baby', pct: 9, salePrice: 1100 },
    { cvId: 'pl-chard-baby', pct: 9, salePrice: 800 },
    { cvId: 'pl-adult-lettuce', pct: 9, salePrice: 750 },
    { cvId: 'pl-baby-cut-lettuce', pct: 9, salePrice: 900 },
    { cvId: 'pl-wheatgrass', pct: 15, salePrice: 55 }
  ];

  var BASE_FARM_PATCH = {
    floorArea: 200,
    plantingArea: 150,
    staffCount: 2,
    staffSalary: 55000,
    payrollTax: true,
    payrollTaxPct: 42.5,
    rentMonth: 80000,
    logisticsMonth: 15000,
    otherMonth: 12000,
    priceKwh: 5,
    kwhPerM2Hour: 0.12,
    lightHoursDay: 16,
    amortMonths: 60,
    wastePct: 5,
    salePrice: 850,
    equipmentEnabled: true
  };

  var BASE_SCENARIO_OPTS = {
    patch: Object.assign({}, BASE_FARM_PATCH),
    cultures: BASE_SCENARIO_CULTURES.slice(),
    clearEquipment: true
  };

  var NEWBIE_EMPTY_PATCH = {
    floorArea: 0,
    plantingArea: 0,
    rentMonth: 0,
    logisticsMonth: 0,
    otherMonth: 0,
    accountingMonth: 0,
    priceKwh: 0,
    kwhPerM2Hour: 0.12,
    lightHoursDay: 0,
    amortMonths: 0,
    wastePct: 0,
    salePrice: 0,
    consumablesPerKg: 0,
    consumablesPerPcs: 0,
    payrollTax: false,
    equipmentEnabled: false,
    usnTax: false,
    vatTax: false,
    profitTax: false
  };

  var NEWBIE_SCENARIO_OPTS = {
    patch: Object.assign({}, NEWBIE_EMPTY_PATCH),
    cultures: BASE_SCENARIO_CULTURES.slice(),
    clearEquipment: true,
    clearStaff: true,
    stripCulturePrices: true
  };

  global.DG_ECON_PRESETS = [
    {
      id: 'micro150',
      labelKey: 'micro150',
      label: 'Микроферма 150 м²',
      patch: {
        floorArea: 200,
        plantingArea: 150,
        staffCount: 2,
        staffSalary: 55000,
        payrollTax: true,
        payrollTaxPct: 42.5,
        rentMonth: 80000,
        logisticsMonth: 15000,
        otherMonth: 12000,
        priceKwh: 5,
        amortMonths: 60,
        wastePct: 5
      }
    },
    {
      id: 'vf300',
      labelKey: 'vf300',
      label: 'VF блок 300 м²',
      patch: {
        floorArea: 400,
        plantingArea: 300,
        staffCount: 3,
        staffSalary: 60000,
        payrollTax: true,
        payrollTaxPct: 42.5,
        rentMonth: 120000,
        logisticsMonth: 25000,
        otherMonth: 20000,
        kwhPerM2Hour: 0.12,
        lightHoursDay: 16,
        priceKwh: 5.5,
        amortMonths: 48,
        wastePct: 8
      }
    },
    {
      id: 'greenhouse500',
      labelKey: 'greenhouse500',
      label: 'Теплица 500 м²',
      patch: {
        floorArea: 650,
        plantingArea: 500,
        staffCount: 4,
        staffSalary: 50000,
        payrollTax: true,
        payrollTaxPct: 42.5,
        rentMonth: 150000,
        logisticsMonth: 35000,
        otherMonth: 25000,
        priceKwh: 4.8,
        amortMonths: 72,
        wastePct: 10
      }
    },
    Object.assign({ id: 'baseScenario', labelKey: 'baseScenario', label: 'Базовый ассортимент' }, BASE_SCENARIO_OPTS),
    Object.assign({ id: 'newbieScenario', labelKey: 'newbieScenario', label: 'Сценарий для новичков' }, NEWBIE_SCENARIO_OPTS)
  ];

  function clearEconEquipment(state, helpers){
    if (typeof helpers.defaultEconEquipment === 'function'){
      state.econ.equipment = helpers.defaultEconEquipment();
    } else if (state.econ.equipment){
      Object.keys(state.econ.equipment).forEach(function(k){ state.econ.equipment[k] = 0; });
    } else {
      state.econ.equipment = {};
    }
    state.econ.equipmentCustom = [];
  }

  function applyEconPreset(state, presetId, helpers){
    helpers = helpers || {};
    var presets = helpers.presets || global.DG_ECON_PRESETS;
    var p = presets.find(function(x){ return x.id === presetId; });
    if (!p || !state.econ) return false;
    if (p.patch){
      Object.keys(p.patch).forEach(function(k){
        state.econ[k] = p.patch[k];
      });
    }
    if (p.clearEquipment) clearEconEquipment(state, helpers);
    if (p.clearStaff){
      state.econ.staffLines = [];
      state.econ.payrollCustom = [];
    }
    if (p.cultures && p.cultures.length && typeof helpers.defaultEconCultureRow === 'function'){
      state.econ.cultures = p.cultures.map(function(c){
        var row = helpers.defaultEconCultureRow(c.cvId, { pct: c.pct != null ? c.pct : 0, isNew: false });
        if (!p.stripCulturePrices && c.salePrice > 0) row.salePrice = c.salePrice;
        if (c.mixInMix) row.mixInMix = true;
        if (c.mixPct != null) row.mixPct = c.mixPct;
        return row;
      });
      if (typeof helpers.migrateEconCultureRows === 'function') helpers.migrateEconCultureRows();
      if (typeof helpers.dedupeEconCultures === 'function') helpers.dedupeEconCultures();
    }
    return { ok: true, presetId: p.id };
  }

  global.DG_ECON_BASE_SCENARIO_CULTURES = BASE_SCENARIO_CULTURES;
  global.DG_applyEconPreset = applyEconPreset;
  global.DG_econPresetLabel = presetLabel;
})(typeof window !== 'undefined' ? window : this);
