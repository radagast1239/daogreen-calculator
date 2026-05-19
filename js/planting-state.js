/**
 * Начальное состояние калькулятора посадки.
 * DG_createDefaultPlantingState(global)
 */
(function (global) {
  'use strict';

  function createDefaultPlantingState(g) {
    var todayISO = (function () {
      return new Date().toISOString().slice(0, 10);
    })();
    var currentMonth = new Date().getMonth() + 1;
    return {
      cv: 'aficion',
      germination: 5,
      nursery: 14,
      day: 21,
      month: currentMonth,
      lighting: false,
      targetDli: 17,
      targetPhotoperiod: 16,
      temp: 26,
      multicut: false,
      cutInterval: 12,
      useManualCutMass: false,
      manualCutMass: 15,
      sowDate: todayISO,
      length: 12,
      nch: 13,
      density: 40,
      offset: 50,
      pot: 50,
      extraB: 0,
      useManualMass: false,
      manualMass: 120,
      useManualCanopy: false,
      manualCanopy: 150,
      canopyPct: 100,
      ghCutCount: 3,
      ghCutMasses: [50, 45, 40, 35, 30],
      useManualGhCutCount: false,
      simpleUiMode: false,
      ghStandards: {},
      vfUserStandards: {},
      showRange: false,
      errorPct: 12,
      ghUsefulArea: 24,
      compareMode: false,
      comparePick: {},
      sectionCollapsed: {},
      vfSectionOpen: { baby: true, flowers: true, adult: true },
      compareScenarios: false,
      facility: 'greenhouse',
      vfCv: 'vf-sorrel',
      vfStd: {
        germination: true,
        day: true,
        density: true,
        mass: true,
        cutInterval: true,
        cutMass: true
      },
      ppfd: 295,
      ledEfficacyGh: 2.1,
      ledEfficacyVf: 2.4,
      rh: 65,
      cvB: 'lollo',
      monthB: currentMonth,
      lightingB: true,
      tempB: 26,
      targetDliB: 15,
      targetPhotoperiodB: 18,
      pricePerKg: 800,
      pricePerKwh: 5,
      appView: 'channels',
      palletCells: 54,
      palletsAlong: 3,
      palletMount: 'cassette',
      palletLidHoles: 54,
      palletTiers: 5,
      tierGapMm: 350,
      palletCv: 'pl-shiso',
      palletStd: {
        germination: false,
        day: false,
        density: false,
        mass: false,
        cutInterval: false,
        cutMass: false,
        cells: false
      },
      palletUserStandards: {},
      econ: null,
      customGhCultivars: [],
      customVfCultivars: [],
      georgyMode: false,
      georgyRestore: null,
      georgyFirstCutCh: null,
      georgyTargetDensity: null,
      georgyAutoDensity: null,
      georgyDensityFitted: false,
      georgyChannel2Rows: false
    };
  }

  global.DG_createDefaultPlantingState = createDefaultPlantingState;
})(typeof window !== 'undefined' ? window : globalThis);
