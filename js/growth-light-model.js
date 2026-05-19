/**
 * Модель роста и света для гидропонного салата (теплица / каналы).
 * Источники (ориентиры, не дублировать без проверки):
 * — Cornell CEA Lettuce Handbook (Brechner & Both, 2020): DLI 12–17 моль·м⁻²·сут, фотопериод 16–18 ч.
 * — Both et al. (1997) J. Amer. Soc. Hort. Sci.: при равном DLI рост растёт с фотопериодом до ~18 ч.
 * — Samuoliene et al. (2011–2013): продление вечерним светом при высоком дневном DLI — прирост биомассы.
 * — Poorter & van der Werf (1998): насыщение урожая по PAR/DLI у листовых.
 * — Thompson et al. (1998), GDD/фитотрон: T_base≈5 °C, T_opt≈17–22 °C для латука.
 * — Ellyett-Bennett & Jones (1984), логистика массы; Biblis & Peinemann (2005): площадь листа ~ M^0.7–0.8.
 * — Rijk Zwaan RZ: Aficion/Afilion/Starfighter/Grazion — паспорта для индор/NFT (M_max, цикл).
 */
(function(global){
  'use strict';

  var DLI_OPT = 17;
  var DLI_K = 0.12;
  var PHOTO_OPT_H = 16;
  var EVENING_PPFD_UMOL = 125;
  var EVENING_DLI_PER_H = EVENING_PPFD_UMOL * 3600 / 1e6;

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  /** Насыщение по DLI (нелинейное, нормировано к 17 моль). */
  function dliResponseFactor(dli){
    var d = Math.max(0, dli);
    var raw = 1 - Math.exp(-DLI_K * d);
    var atOpt = 1 - Math.exp(-DLI_K * DLI_OPT);
    return clamp(raw / atOpt, 0.4, 1.35);
  }

  /**
   * Доп. прирост от вечернего продления дня (моль уже учтены в DLI).
   * Сильнее в тёплые месяцы (май–авг), когда естественный день длинный.
   */
  function photoperiodExtensionFactor(opts){
    opts = opts || {};
    if (!opts.lighting || !(opts.eveningH > 0)) return 1;
    var warm = opts.month >= 4 && opts.month <= 8;
    var natPh = opts.natPh || 12;
    var perHour = warm ? 0.028 : 0.015;
    if (natPh >= 14) perHour *= 1.12;
    var effPh = opts.effPh || natPh;
    if (effPh > PHOTO_OPT_H + 1) perHour *= 0.6;
    return clamp(1 + perHour * opts.eveningH, 1, 1.12);
  }

  /** Температурный отклик (упрощённая TI-модель, T_base / T_opt / T_max). */
  function tempResponseFactor(temp, cv){
    var tBase = cv.t_base != null ? cv.t_base : 5;
    var tOpt = cv.t_opt != null ? cv.t_opt : 20;
    var tMax = cv.t_max != null ? cv.t_max : 34;
    if (temp <= tBase || temp >= tMax) return 0.15;
    if (temp <= tOpt) return clamp((temp - tBase) / (tOpt - tBase), 0.15, 1);
    return clamp(1 - 0.85 * (temp - tOpt) / (tMax - tOpt), 0.15, 1);
  }

  /** Коэффициент шапки d = ca·√M; лёгкое удлинение выше T_opt+3 (этиоляция). */
  function canopyCoeff(cv, temp){
    var tOpt = cv.t_opt != null ? cv.t_opt : 20;
    var ca = cv.ca || 12;
    var excess = Math.max(0, temp - tOpt - 3);
    return ca * (1 + 0.012 * excess);
  }

  function canopyFromMass(cv, mass, temp){
    return canopyCoeff(cv, temp) * Math.sqrt(Math.max(mass, 0.1));
  }

  function logisticMass(cv, tDays, kEff){
    var k = kEff != null ? kEff : cv.k;
    return cv.M_max / (1 + Math.exp(-k * (tDays - cv.t50)));
  }

  function envGrowthMultiplier(dli, temp, cv, lightOpts){
    return dliResponseFactor(dli) *
      photoperiodExtensionFactor(lightOpts) *
      tempResponseFactor(temp, cv);
  }

  global.DG_growthLightModel = {
    DLI_OPT: DLI_OPT,
    PHOTO_OPT_H: PHOTO_OPT_H,
    EVENING_DLI_PER_HOUR: EVENING_DLI_PER_H,
    dliResponseFactor: dliResponseFactor,
    photoperiodExtensionFactor: photoperiodExtensionFactor,
    tempResponseFactor: tempResponseFactor,
    canopyCoeff: canopyCoeff,
    canopyFromMass: canopyFromMass,
    logisticMass: logisticMass,
    envGrowthMultiplier: envGrowthMultiplier
  };
})(typeof window !== 'undefined' ? window : global);
