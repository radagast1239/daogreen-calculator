/**
 * Общие константы посадки (каналы, поддоны, свет по месяцам).
 */
(function (global) {
  'use strict';

  var HMD = (global.DG_CUT && global.DG_CUT.HARVEST_MONTH_DAYS) || 30.5;

  global.DG_PLANTING_CONSTANTS = {
    CH_W: 110,
    MAX_WIDTH: 2000,
    DENSITY_MAX: 220,
    HOLE_D_VF: 25,
    PALLET_L_MM: 1300,
    PALLET_W_MM: 650,
    CASSETTES_PER_PALLET: 3,
    CASSETTE_L_MM: 400,
    CASSETTE_W_MM: 600,
    PALLET_TIER_ZONE_MM: 400,
    PALLET_L_M: 1.3,
    PALLET_W_M: 0.65,
    /** Средний «месяц» для срезок и экономики */
    DAYS_PER_MONTH: HMD,
    /** Календарный год для «циклов в год» и кг/м²·год */
    DAYS_PER_YEAR: 365,
    NATURAL_DLI: [
      { m: 'янв', dli: 6.5, ph: 9.7 },
      { m: 'фев', dli: 10.0, ph: 10.8 },
      { m: 'мар', dli: 14.0, ph: 12.0 },
      { m: 'апр', dli: 18.0, ph: 13.3 },
      { m: 'май', dli: 22.0, ph: 14.5 },
      { m: 'июн', dli: 25.0, ph: 15.0 },
      { m: 'июл', dli: 24.0, ph: 14.7 },
      { m: 'авг', dli: 21.0, ph: 13.7 },
      { m: 'сен', dli: 16.0, ph: 12.4 },
      { m: 'окт', dli: 11.0, ph: 11.1 },
      { m: 'ноя', dli: 7.5, ph: 10.0 },
      { m: 'дек', dli: 5.5, ph: 9.3 }
    ]
  };
})(typeof window !== 'undefined' ? window : global);
