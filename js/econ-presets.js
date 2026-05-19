/** Пресеты экономики (только подстановка полей state.econ) — DG_ECON_PRESETS */
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
        rentMonth: 120000,
        logisticsMonth: 25000,
        otherMonth: 20000,
        kwhPerM2Hour: 0.08,
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
        rentMonth: 150000,
        logisticsMonth: 35000,
        otherMonth: 25000,
        priceKwh: 4.8,
        amortMonths: 72,
        wastePct: 10
      }
    }
  ];

  function applyEconPreset(state, presetId, presets){
    presets = presets || global.DG_ECON_PRESETS;
    var p = presets.find(function(x){ return x.id === presetId; });
    if (!p || !state.econ) return false;
    Object.keys(p.patch).forEach(function(k){
      state.econ[k] = p.patch[k];
    });
    return true;
  }

  global.DG_applyEconPreset = applyEconPreset;
  global.DG_econPresetLabel = presetLabel;
})(typeof window !== 'undefined' ? window : this);
