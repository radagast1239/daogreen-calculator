/**
 * Связка cut-model.js с калькулятором (георгиевские срезки, deps).
 * DG_createPlantingCutModelInit(deps) → API cut-model или null.
 */
(function (global) {
  'use strict';

  function createPlantingCutModelInit(deps) {
    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }

    if (!global.DG_createCutModel) {
      console.warn('cut-model.js не загружен — интервалы срезки недоступны');
      return null;
    }
    return global.DG_createCutModel({
      getState: deps.getState,
      clamp: deps.clamp,
      getActiveCv: deps.getActiveCv,
      isVF: deps.isVF,
      isPalletView: deps.isPalletView,
      isVfSheetCv: deps.isVfSheetCv,
      isPalletSheetCv: deps.isPalletSheetCv,
      isSheetCv: deps.isSheetCv,
      usePlantingSheet: deps.usePlantingSheet,
      getPlantingStd: deps.getPlantingStd,
      getGhCutMass: deps.getGhCutMass,
      envMultiplier: deps.envMultiplier,
      vfEffectiveDay: deps.vfEffectiveDay,
      harvestChannel: deps.harvestChannel,
      boltChannel: deps.boltChannel,
      totalAge: deps.totalAge,
      envBolt: deps.envBolt,
      georgyPlannedCuts: function (cv) {
        var georgyMode = georgyModeRef();
        var state = deps.getState();
        if (!georgyMode || !georgyMode.isGeorgyProfiled(cv)) return null;
        if (
          !deps.isChannelGreenhouse() &&
          !(georgyMode.isGeorgyGh && georgyMode.isGeorgyGh())
        ) {
          return null;
        }
        var p = georgyMode.getGeorgyProfile(cv);
        var maxCuts = state.useManualGhCutCount
          ? state.ghCutCount
          : georgyMode.resolveGeorgyMaxCuts(p, cv);
        return {
          firstCutCh: state.georgyFirstCutCh > 0 ? state.georgyFirstCutCh : p.firstCutCh,
          maxCuts: maxCuts
        };
      }
    });
  }

  global.DG_createPlantingCutModelInit = createPlantingCutModelInit;
})(typeof window !== 'undefined' ? window : globalThis);
