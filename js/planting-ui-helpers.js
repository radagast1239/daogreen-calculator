/**
 * Метки месяцев, цены на слайдерах, слайдеры фаз цикла, разблокировка «стандарт».
 * DG_createPlantingUiHelpers(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  var MONTH_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function createPlantingUiHelpers(deps) {
    function naturalDli() {
      if (deps.naturalDli) return deps.naturalDli;
      var PC = deps.constants || global.DG_PLANTING_CONSTANTS || {};
      return PC.NATURAL_DLI || [];
    }

    function monthLabel(i) {
      var dli = naturalDli();
      var idx = (i || 1) - 1;
      if (typeof global.DG_getLocale === 'function' && global.DG_getLocale() === 'en') {
        return MONTH_EN[idx] || (dli[idx] && dli[idx].m) || '';
      }
      return (dli[idx] && dli[idx].m) || MONTH_EN[idx] || '';
    }

    function syncMoneySliderDisplays() {
      var state = deps.getState();
      var $ = deps.$;
      var pk = $('pricePerKg-v');
      if (pk && global.DG_fmtMoneyPlain) {
        pk.textContent = global.DG_fmtMoneyPlain(state.pricePerKg, { decimals: 0 });
      }
      var pkw = $('pricePerKwh-v');
      if (pkw && global.DG_fmtMoneyPlain) {
        pkw.textContent = global.DG_fmtMoneyPlain(state.pricePerKwh, { decimals: 2 });
      }
    }

    function getPlantingStd() {
      return deps.isPalletView() ? deps.getState().palletStd : deps.getState().vfStd;
    }

    function unlockPlantingStdForControl(idOrKey) {
      var map = {
        germination: 'germination',
        day: 'day',
        density: 'density',
        cutInterval: 'cutInterval',
        manualMass: 'mass',
        manualCutMass: 'cutMass',
        nursery: 'day'
      };
      var key = map[idOrKey] || idOrKey;
      var pStd = getPlantingStd();
      if (key && pStd[key] !== undefined) pStd[key] = false;
    }

    function syncCycleSlidersFromState() {
      var state = deps.getState();
      var $ = deps.$;
      [['germination', 'germination-v'], ['nursery', 'nursery-v'], ['day', 'day-v']].forEach(function (pair) {
        var el = $(pair[0]);
        var lab = $(pair[1]);
        if (el && state[pair[0]] != null) el.value = state[pair[0]];
        if (lab && state[pair[0]] != null) lab.textContent = state[pair[0]];
      });
    }

    return {
      monthLabel: monthLabel,
      syncMoneySliderDisplays: syncMoneySliderDisplays,
      getPlantingStd: getPlantingStd,
      unlockPlantingStdForControl: unlockPlantingStdForControl,
      syncCycleSlidersFromState: syncCycleSlidersFromState
    };
  }

  global.DG_createPlantingUiHelpers = createPlantingUiHelpers;
})(typeof window !== 'undefined' ? window : globalThis);
