/**
 * Расчёт DLI и допсвета теплицы (естественный + вечерний + дневной досвет).
 * DG_createPlantingDliLight(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  function createPlantingDliLight(deps) {
    function st() {
      return deps.getState();
    }

    function eveningDliPerHour() {
      var glm = deps.getGLM ? deps.getGLM() : global.DG_growthLightModel;
      return glm && glm.EVENING_DLI_PER_HOUR != null ? glm.EVENING_DLI_PER_HOUR : 0.45;
    }

    function naturalDliTable() {
      return deps.naturalDli || (global.DG_PLANTING_CONSTANTS && global.DG_PLANTING_CONSTANTS.NATURAL_DLI) || [];
    }

    function naturalDLI() {
      var state = st();
      var table = naturalDliTable();
      if (deps.isVF() || deps.isPalletView()) return 0;
      return table[state.month - 1] ? table[state.month - 1].dli : 0;
    }

    function photoperiod() {
      var state = st();
      var table = naturalDliTable();
      if (deps.isVF() || deps.isPalletView()) return state.targetPhotoperiod;
      return table[state.month - 1] ? table[state.month - 1].ph : state.targetPhotoperiod;
    }

    function eveningHours() {
      var state = st();
      if (deps.isVF()) return 0;
      if (!state.lighting) return 0;
      return Math.max(0, state.targetPhotoperiod - photoperiod());
    }

    function eveningSupplement() {
      return eveningHours() * eveningDliPerHour();
    }

    function daySupplement() {
      if (deps.isVF()) return 0;
      var state = st();
      if (!state.lighting) return 0;
      var afterEvening = naturalDLI() + eveningSupplement();
      return Math.max(0, state.targetDli - afterEvening);
    }

    function supplementDLI() {
      var state = st();
      if (deps.isVF()) return state.targetDli;
      if (!state.lighting) return 0;
      return eveningSupplement() + daySupplement();
    }

    function effectiveDLI() {
      var state = st();
      if (deps.isVF() || deps.isPalletView()) return state.targetDli;
      return naturalDLI() + supplementDLI();
    }

    function effectivePhotoperiod() {
      var state = st();
      if (deps.isVF()) return state.targetPhotoperiod;
      return photoperiod() + eveningHours();
    }

    function lightingMolForEnergy() {
      if (deps.isVF() || deps.isPalletView()) return effectiveDLI();
      return supplementDLI();
    }

    return {
      eveningDliPerHour: eveningDliPerHour,
      naturalDLI: naturalDLI,
      photoperiod: photoperiod,
      eveningHours: eveningHours,
      eveningSupplement: eveningSupplement,
      daySupplement: daySupplement,
      supplementDLI: supplementDLI,
      effectiveDLI: effectiveDLI,
      effectivePhotoperiod: effectivePhotoperiod,
      lightingMolForEnergy: lightingMolForEnergy
    };
  }

  global.DG_createPlantingDliLight = createPlantingDliLight;
})(typeof window !== 'undefined' ? window : globalThis);
