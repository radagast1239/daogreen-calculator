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
   * Доп. прирост биомассы от вечернего продления фотопериода (Both 1997; Samuoliene 2011–2013).
   * Действует даже когда дневной DLI уже насыщён (лето): ориентир +7–10% при 1–2 ч вечера.
   */
  function photoperiodExtensionFactor(opts){
    opts = opts || {};
    if (!opts.lighting || !(opts.eveningH > 0)) return 1;
    var warm = opts.month >= 4 && opts.month <= 8;
    var natPh = opts.natPh || 12;
    var perHour = warm ? 0.058 : 0.032;
    if (natPh >= 13 && natPh < 15) perHour *= 1.08;
    return clamp(1 + perHour * opts.eveningH, 1, 1.10);
  }

  /** S-кривая на [0,1]: производные по краям равны 0 — без «ступеньки» на шагах 0,5 °C. */
  function smoothstep01(u){
    u = clamp(u, 0, 1);
    return u * u * (3 - 2 * u);
  }

  /**
   * Жара после T_opt…26 °C: плавный рост стресса без линейного «пилообразного» приращения каждые 0,5 °C.
   * 26→T_hot: −20% к коэффициенту через smoothstep к T_hot (обычно 30 °C);
   * Выше T_hot: тот же низкий предел урожая, но на более длинном участке (~8 °C до T_stress_end)
   * вместо 4 °C раньше — меньше скачок «каждые полградуса −8 п.п.» в интерфейсе.
   */
  function heatYieldFactor(temp, cv){
    cv = cv || {};
    var t0 = cv.tempWarmStart != null ? cv.tempWarmStart : 26;
    var t1 = cv.tempHot != null ? cv.tempHot : 30;
    var lossAt30 = cv.yieldLossMax != null ? cv.yieldLossMax : 0.20;
    var spanDeg = cv.heatStressSpanDeg != null ? cv.heatStressSpanDeg : 8;
    var tStressEnd =
      cv.tempStressEnd != null ? cv.tempStressEnd : Math.max(cv.t_max != null ? cv.t_max : 34, t1 + spanDeg);
    var fMin = 0.15;
    if (temp <= t0) return 1;
    var fHot = 1 - lossAt30;
    if (temp <= t1){
      var uWarm = (temp - t0) / Math.max(0.1, t1 - t0);
      return fHot + (1 - fHot) * (1 - smoothstep01(uWarm));
    }
    if (temp >= tStressEnd) return fMin;
    var uStress = (temp - t1) / Math.max(0.1, tStressEnd - t1);
    return fMin + (fHot - fMin) * (1 - smoothstep01(uStress));
  }

  /** Потолок вегетации по календарю температур: ниже этого вызывают heatYieldFactor; после — режим экстремального стресса. */
  function growthTempCeiling(cv){
    cv = cv || {};
    var span = cv.heatStressSpanDeg != null ? cv.heatStressSpanDeg : 8;
    var hot = cv.tempHot != null ? cv.tempHot : 30;
    var stress =
      cv.tempStressEnd != null ? cv.tempStressEnd : Math.max(cv.t_max != null ? cv.t_max : 34, hot + span);
    return cv.t_growth_abs_max != null ? cv.t_growth_abs_max : stress + Math.max(2, span / 8);
  }

  function heatYieldLossPct(temp, cv){
    return Math.round((1 - heatYieldFactor(temp, cv)) * 100);
  }

  /** Температурный отклик: холод — TI-модель; тепло — heatYieldFactor с 26 °C. */
  function tempResponseFactor(temp, cv){
    cv = cv || {};
    var tBase = cv.t_base != null ? cv.t_base : 5;
    var tOpt = cv.t_opt != null ? cv.t_opt : 20;
    var tTop = growthTempCeiling(cv);
    if (temp <= tBase || temp >= tTop) return 0.15;
    if (temp <= tOpt) return clamp((temp - tBase) / (tOpt - tBase), 0.15, 1);
    if (temp < 26) return 1;
    return heatYieldFactor(temp, cv);
  }

  /** Коэффициент шапки d = ca·√M; лёгкое удлинение выше T_opt+3 (этиоляция). */
  function canopyCoeff(cv, temp){
    var tOpt = cv.t_opt != null ? cv.t_opt : 20;
    var ca = cv.ca || 12;
    var excess = Math.max(0, temp - tOpt - 3);
    return ca * (1 + 0.012 * excess);
  }

  function canopyMassExponent(cv){
    var exp = cv && cv.canopyExp != null ? parseFloat(cv.canopyExp) : NaN;
    return exp > 0 && exp < 1.2 ? exp : 0.5;
  }

  function canopyFromMass(cv, mass, temp){
    return canopyCoeff(cv, temp) * Math.pow(Math.max(mass, 0.1), canopyMassExponent(cv));
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

  /** VF: оптимум 20–24 °C; ниже и выше — замедление роста и урожая. */
  function vfTempResponseFactor(temp){
    var tLo = 20;
    var tHi = 24;
    var tMin = 8;
    var tMax = 32;
    var fMin = 0.35;
    temp = parseFloat(temp);
    if (isNaN(temp)) return 1;
    if (temp >= tLo && temp <= tHi) return 1;
    if (temp < tLo) return clamp(fMin + (1 - fMin) * (temp - tMin) / (tLo - tMin), fMin, 1);
    return clamp(fMin + (1 - fMin) * (tMax - temp) / (tMax - tHi), fMin, 1);
  }

  /** VF: ниже 60% RH — замедление роста и усвоения питательных веществ. */
  function vfRhGrowthFactor(rh){
    var ideal = 60;
    var fMin = 0.5;
    rh = parseFloat(rh);
    if (isNaN(rh)) return 1;
    if (rh >= ideal) return 1;
    return clamp(fMin + (1 - fMin) * rh / ideal, fMin, 1);
  }

  global.DG_growthLightModel = {
    DLI_OPT: DLI_OPT,
    PHOTO_OPT_H: PHOTO_OPT_H,
    EVENING_DLI_PER_HOUR: EVENING_DLI_PER_H,
    dliResponseFactor: dliResponseFactor,
    photoperiodExtensionFactor: photoperiodExtensionFactor,
    smoothstep01: smoothstep01,
    heatYieldFactor: heatYieldFactor,
    heatYieldLossPct: heatYieldLossPct,
    growthTempCeiling: growthTempCeiling,
    tempResponseFactor: tempResponseFactor,
    canopyCoeff: canopyCoeff,
    canopyMassExponent: canopyMassExponent,
    canopyFromMass: canopyFromMass,
    logisticMass: logisticMass,
    envGrowthMultiplier: envGrowthMultiplier,
    vfTempResponseFactor: vfTempResponseFactor,
    vfRhGrowthFactor: vfRhGrowthFactor
  };
})(typeof window !== 'undefined' ? window : global);
