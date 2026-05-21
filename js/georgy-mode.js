/**
 * Упрощённый режим теплицы «Расчёт для Георгия».
 * Салаты — как раньше (один срез, подбор плотности).
 * Руккола беби и салат беби — стаканы, 2 ряда в канале, многосрезка.
 */
(function(global){
  'use strict';

  var GEORGY_STORAGE_KEY = 'calc-georgy-mode';
  var GEORGY_DENSITY_KEY = 'calc-georgy-target-density';
  var RUCOLA_BABY_ID = 'rucola-baby';
  var LETTUCE_BABY_ID = 'lettuce-baby';
  var GERM_DAYS = 3;
  var HEAD_GERM_MIN = 1;
  var HEAD_GERM_MAX = 4;
  var HEAD_NURSERY_MIN = 1;
  var HEAD_NURSERY_MAX = 28;
  var HEAD_CHANNEL_MIN = 1;
  var HEAD_CHANNEL_MAX = 40;
  var HEAD_NURSERY_DEFAULT_D = 14;
  /** Макс. плотность (шт/м²) для подбора по шапке — по морфотипу (не беби-профили). */
  var HEAD_DENSITY_MAX_BY_TYPE = {
    butterhead: 55,
    romaine: 75,
    batavia: 70,
    oakleaf: 58,
    lollo: 52,
    salanova: 78,
    iceberg: 62,
    mini: 95,
    leaf: 85,
    other: 68
  };
  /** Мин. суток от посева до товарного кочана (предупреждение). */
  var HEAD_MIN_TOTAL_DAYS_BY_TYPE = {
    butterhead: 28,
    romaine: 32,
    batavia: 30,
    oakleaf: 28,
    lollo: 28,
    salanova: 28,
    iceberg: 38,
    mini: 24,
    leaf: 21,
    other: 28
  };
  /** Верх разбега кроны; подбор в Георгии: ромэн — по hi, остальные — по mid. */
  var HEAD_CANOPY_RANGE_HI_MULT_BY_TYPE = {
    butterhead: 1.30,
    oakleaf: 1.30,
    lollo: 1.32,
    batavia: 1.26,
    romaine: 1.25,
    salanova: 1.26,
    iceberg: 1.28,
    mini: 1.25,
    leaf: 1.24,
    other: 1.25
  };
  var STAFF_AREA_MIN_M2 = 150;
  var STAFF_AREA_MAX_M2 = 200;
  var HARVEST_MONTH_DAYS = (global.DG_CUT && global.DG_CUT.HARVEST_MONTH_DAYS) || 30.5;
  var OFFSET_PCT = 50;
  var POT_MM = 50;
  var PHOTOPERIOD_H = 16;
  var TARGET_DLI = 17;
  /** Допустимое перекрытие при ручной плотности (жёлтое предупреждение до этого значения). */
  var MAX_LEAF_OVERLAP_MM = 20;
  /** Подбор в режиме Георгия: листья не касаются (зазор ≥ 0). */
  var GEORGY_FIT_MIN_GAP_MM = 0;
  var PLACEHOLDER_DENSITY = 40;

  var GEORGY_HIDDEN_CV = {
    rucola: 1, basil: 1, mizuna: 1, kale: 1, chard: 1, spinach: 1, pakchoi: 1
  };

  /** Жара для беби: T≥30 °C → 6–8 срезок; ниже 30 — до 12 (салат). Потеря массы 15–20%. */
  var BABY_HEAT = {
    tempHot: 30,
    tempWarmStart: 26,
    yieldLossMin: 0.15,
    yieldLossMax: 0.20
  };

  var RUCOLA_PROFILE = {
    id: RUCOLA_BABY_ID,
    densityMin: 80, densityMax: 110, densityLight: 110, dliLightMin: 16,
    cutInterval: 12, cutIntervalMin: 8, cutIntervalMax: 18,
    maxCutsHot: 8, maxCutsBelowHot: 6,
    firstCutCh: 10, defaultDay: 10,
    massMin: 10, massMax: 18,
    cutMasses: [16, 15, 14, 13, 12, 11, 11, 11],
    channelRows: 2, nchDefault: 13, nchMin: 10, nchMax: 19,
    recKey: 'georgy.rec.rucola',
    stdKey: 'georgy.rucola.stdBtn',
    warnPlanKey: 'georgy.warn.rucolaPlan'
  };
  Object.keys(BABY_HEAT).forEach(function(k){ RUCOLA_PROFILE[k] = BABY_HEAT[k]; });

  var LETTUCE_PROFILE = {
    id: LETTUCE_BABY_ID,
    densityMin: 80, densityMax: 110, densityLight: 110, dliLightMin: 16,
    cutInterval: 12, cutIntervalMin: 8, cutIntervalMax: 18,
    maxCutsHot: 8, maxCutsBelowHot: 12,
    firstCutCh: 12, defaultDay: 12,
    massMin: 20, massMax: 30,
    cutMasses: [28, 28, 27, 26, 25, 24, 23, 22, 22, 21, 21, 20],
    channelRows: 2, nchDefault: 13, nchMin: 10, nchMax: 19,
    recKey: 'georgy.rec.lettuce',
    stdKey: 'georgy.lettuce.stdBtn',
    warnPlanKey: 'georgy.warn.lettucePlan'
  };
  Object.keys(BABY_HEAT).forEach(function(k){ LETTUCE_PROFILE[k] = BABY_HEAT[k]; });

  var PROFILES = {};
  PROFILES[RUCOLA_BABY_ID] = RUCOLA_PROFILE;
  PROFILES[LETTUCE_BABY_ID] = LETTUCE_PROFILE;

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  function createGeorgyMode(deps){
    function st(){ return deps.getState(); }
    function r1(n){
      if (typeof deps.r1 === 'function') return deps.r1(n);
      return Math.round(n * 10) / 10;
    }
    function r2(n){
      if (typeof deps.r2 === 'function') return deps.r2(n);
      return Math.round(n * 100) / 100;
    }
    function T(k, vars, ru){
      if (deps.tFmt && vars) return deps.tFmt(k, vars);
      if (deps.t){
        var v = deps.t(k);
        if (v != null && v !== k) return v;
      }
      if (vars && ru){
        Object.keys(vars).forEach(function(vk){
          ru = ru.replace(new RegExp('\\{' + vk + '\\}', 'g'), String(vars[vk]));
        });
      }
      return ru != null ? ru : k;
    }

    function isGeorgyGh(){
      var s = st();
      return !!(s.georgyMode && s.facility === 'greenhouse' && !deps.isVF() && !deps.isPalletView());
    }

    /** Каналы в теплице (солнце, не VF и не поддоны). */
    function isChannelGreenhouse(){
      var s = st();
      return s.facility === 'greenhouse' && !deps.isVF() && !deps.isPalletView();
    }

    /** Подбор плотности по шапке: каналы, салаты и беби (не поддоны/VF). */
    function canUseCanopyDensityPick(cv){
      if (!isChannelGreenhouse() || !cv) return false;
      if (cv.vfSheet) return false;
      return true;
    }

    function getGeorgyProfile(cv){
      cv = cv || deps.getCv();
      return cv && PROFILES[cv.id] ? PROFILES[cv.id] : null;
    }

    function isGeorgyProfiled(cv){
      return !!getGeorgyProfile(cv);
    }

    function isGeorgyRucola(cv){
      cv = cv || deps.getCv();
      return !!(cv && cv.id === RUCOLA_BABY_ID);
    }

    function isGeorgyLettuce(cv){
      cv = cv || deps.getCv();
      return !!(cv && cv.id === LETTUCE_BABY_ID);
    }

    function isGeorgyCvAllowed(cv){
      if (!cv) return false;
      if (!isGeorgyGh()) return true;
      return !GEORGY_HIDDEN_CV[cv.id];
    }

    function filterGeorgyCultivars(list){
      if (!isGeorgyGh()) return list;
      return (list || []).filter(function(c){ return isGeorgyCvAllowed(c); });
    }

    function usesGeorgyChannel2Rows(cv){
      return isGeorgyGh() && isGeorgyProfiled(cv);
    }

    function georgyYieldFactor(profile, temp){
      if (!profile) return 1;
      temp = temp != null ? temp : st().temp;
      if (global.DG_growthLightModel && global.DG_growthLightModel.heatYieldFactor) {
        return global.DG_growthLightModel.heatYieldFactor(temp, profile);
      }
      /* Fallback = та же формула, что в heatYieldFactor в growth-light-model (без узкого 30→34 °C). */
      var t0 = profile.tempWarmStart != null ? profile.tempWarmStart : 26;
      var t1 = profile.tempHot != null ? profile.tempHot : 30;
      var lossMax = profile.yieldLossMax != null ? profile.yieldLossMax : 0.20;
      var spanDeg = profile.heatStressSpanDeg != null ? profile.heatStressSpanDeg : 8;
      var tStressEnd =
        profile.tempStressEnd != null ? profile.tempStressEnd : Math.max(profile.t_max != null ? profile.t_max : 34, t1 + spanDeg);
      var fMin = 0.15;
      function sm(u){ u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }
      var fHot = 1 - lossMax;
      if (temp <= t0) return 1;
      if (temp <= t1){
        var uw = (temp - t0) / Math.max(0.1, t1 - t0);
        return fHot + (1 - fHot) * (1 - sm(uw));
      }
      if (temp >= tStressEnd) return fMin;
      var us = (temp - t1) / Math.max(0.1, tStressEnd - t1);
      return fMin + (fHot - fMin) * (1 - sm(us));
    }

    function georgyYieldLossPct(profile, temp){
      return Math.round((1 - georgyYieldFactor(profile, temp)) * 100);
    }

    /** DLI × вечернее продление (досветка вкл/выкл) — беби и головные салаты в режиме Георгия. */
    function georgyLightYieldFactor(){
      if (!deps.dliFactor) return 1;
      var df = deps.dliFactor();
      var pf = deps.photoperiodFactor ? deps.photoperiodFactor() : 1;
      return clamp(df * pf, 0.72, 1.15);
    }

    function georgyLightYieldPct(){
      return Math.round((georgyLightYieldFactor() - 1) * 100);
    }

    function clampBabyNch(n, profile){
      profile = profile || getGeorgyProfile();
      var lo = profile ? profile.nchMin : 10;
      var hi = profile ? profile.nchMax : 19;
      if (n == null || !isFinite(n)) n = profile ? profile.nchDefault : 13;
      return clamp(Math.round(n), lo, hi);
    }

    function normativeBabyCutMass(profile, cv, cutIndex){
      if (!profile) return 0;
      var s = st();
      var i = cutIndex != null ? cutIndex : 0;
      if (s.ghCutMasses && s.ghCutMasses[i] != null && isFinite(Number(s.ghCutMasses[i]))){
        return Math.round(Number(s.ghCutMasses[i]));
      }
      var n = resolveGeorgyMaxCuts(profile, cv);
      var masses = scaledProfileCutMasses(profile, n);
      return masses[i] || masses[0] || profile.cutMasses[0];
    }

    function adjustMassForGeorgyBaby(profile, cv, massFromModel){
      if (!profile || !deps.tempFactor || !(massFromModel > 0)) return massFromModel;
      var tf = deps.tempFactor(cv);
      if (tf < 0.05) tf = 0.05;
      return massFromModel / tf * georgyYieldFactor(profile, st().temp);
    }

    function scaledProfileCutMasses(profile, n){
      var yf = georgyYieldFactor(profile, st().temp) * georgyLightYieldFactor();
      var base = profile.cutMasses;
      var out = [];
      for (var i = 0; i < n; i++){
        var m = base[i] != null ? base[i] : base[base.length - 1];
        out.push(Math.max(1, Math.round(m * yf)));
      }
      return out;
    }

    function refreshGeorgyCutMasses(profile, cv){
      if (!profile) return;
      var nResolved = resolveGeorgyMaxCuts(profile, cv);
      if (!st().useManualGhCutCount){
        st().ghCutCount = nResolved;
      }
      var n = clamp(Math.round(st().ghCutCount), 1, 24);
      st().ghCutCount = n;
      var scaled = scaledProfileCutMasses(profile, n);
      if (!st().georgyManualCutMasses){
        st().ghCutMasses = scaled.slice();
        return;
      }
      var old = st().ghCutMasses || [];
      var out = [];
      for (var i = 0; i < n; i++){
        var prev = old[i];
        if (prev != null && isFinite(Number(prev))){
          out.push(clamp(Math.round(Number(prev)), 1, 500));
        } else {
          out.push(scaled[i]);
        }
      }
      st().ghCutMasses = out;
    }

    function resolveGeorgyMaxCuts(profile, cv){
      var temp = st().temp;
      if (temp >= profile.tempHot) return profile.maxCutsHot;
      return profile.maxCutsBelowHot;
    }

    function clampProfiledDensity(profile, rho){
      rho = clamp(Math.round(rho), profile.densityMin, profile.densityMax);
      if (deps.effectiveDLI && deps.effectiveDLI() >= profile.dliLightMin){
        rho = Math.min(profile.densityLight, Math.max(rho, profile.densityMin));
      }
      return rho;
    }

    function preChannelDaysGeorgy(){
      if (!isGeorgyGh()) return st().germination + st().nursery;
      var cv = deps.getCv();
      if (getGeorgyProfile(cv)) return GERM_DAYS;
      return clamp(Math.round(st().germination), HEAD_GERM_MIN, HEAD_GERM_MAX) +
        clamp(Math.round(st().nursery), HEAD_NURSERY_MIN, HEAD_NURSERY_MAX);
    }

    function isGeorgyHeadSalad(cv){
      cv = cv || deps.getCv();
      return !!(st().georgyMode && cv && !getGeorgyProfile(cv) &&
        st().facility === 'greenhouse' && !deps.isVF() && !deps.isPalletView());
    }

    function headCvType(cv){
      cv = cv || deps.getCv();
      if (!cv) return 'other';
      if (global.DG_ghCultivarType) return global.DG_ghCultivarType(cv);
      if (cv.type) return String(cv.type);
      if (cv.id === 'little-gem') return 'mini';
      return 'other';
    }

    function headDensityMaxForCv(cv){
      var t = headCvType(cv);
      if (t === 'mini_romaine' || t === 'baby_romaine') return HEAD_DENSITY_MAX_BY_TYPE.mini;
      return HEAD_DENSITY_MAX_BY_TYPE[t] != null ? HEAD_DENSITY_MAX_BY_TYPE[t] : HEAD_DENSITY_MAX_BY_TYPE.other;
    }

    function headMinTotalDaysForCv(cv){
      var t = headCvType(cv);
      return HEAD_MIN_TOTAL_DAYS_BY_TYPE[t] != null ? HEAD_MIN_TOTAL_DAYS_BY_TYPE[t] : HEAD_MIN_TOTAL_DAYS_BY_TYPE.other;
    }

    function headMassRawAtHarvest(cv){
      cv = cv || deps.getCv();
      var tTotal = totalDaysFromSowGeorgy(cv);
      if (!(tTotal > 0)) tTotal = preChannelDaysGeorgy() + Math.round(st().day);
      return deps.massAtTotal(cv, tTotal);
    }

    function headCanopyBaseMm(cv, mass){
      return Math.round(deps.harvestCanopy(cv, mass));
    }

    /** Крона: модель (lo), верх hi; в UI — диапазон lo…hi. */
    function headCanopyFitRange(cv, massRaw){
      cv = cv || deps.getCv();
      massRaw = massRaw != null ? massRaw : headMassRawAtHarvest(cv);
      var base = headCanopyBaseMm(cv, massRaw);
      var t = headCvType(cv);
      var hiMult = HEAD_CANOPY_RANGE_HI_MULT_BY_TYPE[t] != null
        ? HEAD_CANOPY_RANGE_HI_MULT_BY_TYPE[t] : HEAD_CANOPY_RANGE_HI_MULT_BY_TYPE.other;
      var lo = base;
      var hi = Math.round(base * hiMult);
      var mid = Math.round((lo + hi) / 2);
      return { base: base, lo: lo, hi: hi, mid: mid };
    }

    /** Ромэн в Георгии — подбор по верху кроны; остальные головные — по середине диапазона. */
    function headCanopyUsesHiForGeorgyFit(cv){
      return headCvType(cv) === 'romaine';
    }

    /** Диаметр кроны для геометрии подбора (без касания): ромэн — верх диапазона, остальные — середина; не ниже модели по массе без затенения. */
    function headCanopyForDensityFit(cv){
      var range = headCanopyFitRange(cv);
      var fitMm = (isGeorgyGh() && headCanopyUsesHiForGeorgyFit(cv)) ? range.hi : range.mid;
      var rawCanopy = headCanopyBaseMm(cv, headMassRawAtHarvest(cv));
      return Math.max(fitMm, rawCanopy);
    }

    function headCanopyFitRangeLabel(cv, massRaw){
      var range = headCanopyFitRange(cv, massRaw);
      return {
        loCm: r1(range.lo / 10),
        hiCm: r1(range.hi / 10),
        midCm: r1(range.mid / 10),
        baseCm: r1(range.base / 10),
        fitMm: range.mid,
        baseMm: range.base,
        loMm: range.lo,
        hiMm: range.hi,
        midMm: range.mid
      };
    }

    function headDensityBounds(cv){
      return { lo: 15, hi: headDensityMaxForCv(cv) };
    }

    /** Только дни роста в канале (основное отделение), без проращивания и рассады. */
    function headMainChannelDays(){
      return clamp(Math.round(st().day), HEAD_CHANNEL_MIN, HEAD_CHANNEL_MAX);
    }

    /** Оборот урожая с полезной площади = только дни в канале (головной салат в режиме Георгия). */
    function mainHarvestIntervalDays(){
      return isGeorgyHeadSalad() ? headMainChannelDays() : 0;
    }

    function headHarvestCyclesPerMonth(){
      var iv = mainHarvestIntervalDays();
      return iv > 0 ? HARVEST_MONTH_DAYS / iv : 0;
    }

    function totalDaysFromSowGeorgy(cv){
      cv = cv || deps.getCv();
      if (!isGeorgyGh()) return null;
      if (getGeorgyProfile(cv)) return GERM_DAYS + Math.round(st().day);
      return preChannelDaysGeorgy() + clamp(Math.round(st().day), HEAD_CHANNEL_MIN, HEAD_CHANNEL_MAX);
    }

    function clampGeorgyHeadCycleInputs(){
      st().germination = clamp(Math.round(st().germination), HEAD_GERM_MIN, HEAD_GERM_MAX);
      st().nursery = clamp(Math.round(st().nursery), HEAD_NURSERY_MIN, HEAD_NURSERY_MAX);
      st().day = clamp(Math.round(st().day), HEAD_CHANNEL_MIN, HEAD_CHANNEL_MAX);
    }

    /** Синхронизация state с ползунками Георгия (проращивание + рассада + канал). */
    function readGeorgyHeadCycleFromDom(){
      if (!isGeorgyGh()) return;
      var cv = deps.getCv();
      if (getGeorgyProfile(cv)) return;
      var germInp = document.getElementById('georgy-germ');
      var nurInp = document.getElementById('georgy-nursery');
      var dayInp = document.getElementById('georgy-day');
      if (germInp) st().germination = clamp(parseInt(germInp.value, 10) || GERM_DAYS, HEAD_GERM_MIN, HEAD_GERM_MAX);
      if (nurInp) st().nursery = clamp(parseInt(nurInp.value, 10) || HEAD_NURSERY_DEFAULT_D, HEAD_NURSERY_MIN, HEAD_NURSERY_MAX);
      if (dayInp) st().day = clamp(parseInt(dayInp.value, 10) || st().day, HEAD_CHANNEL_MIN, HEAD_CHANNEL_MAX);
      clampGeorgyHeadCycleInputs();
    }

    /** Масса и шапка салата: t = проращ. + рассада + канал; crowding на плотности rho. */
    function headHarvestGeorgy(cv, rho){
      cv = cv || deps.getCv();
      if (!cv || getGeorgyProfile(cv)) return null;
      var tTotal = totalDaysFromSowGeorgy(cv);
      if (!(tTotal > 0)) tTotal = preChannelDaysGeorgy() + Math.round(st().day);
      rho = rho != null ? rho : PLACEHOLDER_DENSITY;
      var saved = { density: st().density, extraB: st().extraB };
      st().density = rho;
      st().extraB = 0;
      try {
        var massRaw = deps.massAtTotal(cv, tTotal);
        var lay = deps.plantLayout(cv);
        var canopyAtMax = deps.effectiveCa(cv) * Math.sqrt(cv.M_max);
        var crowdF = deps.crowdingFactor(canopyAtMax, lay.nearest);
        var massAuto = massRaw * crowdF;
        var mass = deps.manualHarvestMass ? deps.manualHarvestMass(massAuto) : massAuto;
        var canopy = deps.harvestCanopy(cv, massAuto);
        return {
          tTotal: tTotal,
          massRaw: massRaw,
          massAuto: massAuto,
          mass: Math.round(mass),
          canopy: Math.round(canopy),
          crowdF: crowdF
        };
      } finally {
        st().density = saved.density;
        st().extraB = saved.extraB;
      }
    }

    function syncGeorgyHeadSlidersToState(){
      var cv = deps.getCv();
      var profile = getGeorgyProfile(cv);
      var germInp = document.getElementById('georgy-germ');
      var germV = document.getElementById('georgy-germ-v');
      var nurInp = document.getElementById('georgy-nursery');
      var nurV = document.getElementById('georgy-nursery-v');
      if (!profile){
        clampGeorgyHeadCycleInputs();
        if (germInp && document.activeElement !== germInp){
          germInp.value = st().germination;
          if (germV) germV.textContent = String(st().germination);
        }
        if (nurInp && document.activeElement !== nurInp){
          nurInp.value = st().nursery;
          if (nurV) nurV.textContent = String(st().nursery);
        }
        var germMain = document.getElementById('germination');
        var germMainV = document.getElementById('germination-v');
        var nurMain = document.getElementById('nursery');
        var nurMainV = document.getElementById('nursery-v');
        if (germMain) germMain.value = st().germination;
        if (germMainV) germMainV.textContent = String(st().germination);
        if (nurMain) nurMain.value = st().nursery;
        if (nurMainV) nurMainV.textContent = String(st().nursery);
      }
    }

    function renderGeorgyStaffHint(){
      var el = document.getElementById('georgy-staff-hint');
      if (!el || !isGeorgyGh()) return;
      var area = parseFloat(st().ghUsefulArea);
      if (!(area > 0)){
        el.textContent = T('georgy.staffNeedArea', null, 'Укажите полезную площадь в блоке урожая — покажем норму персонала.');
        return;
      }
      var wMin = area / STAFF_AREA_MAX_M2;
      var wMax = area / STAFF_AREA_MIN_M2;
      el.textContent = T('georgy.staffNorm', {
        area: r2(area),
        wMin: r2(wMin),
        wMax: r2(wMax),
        aMin: STAFF_AREA_MIN_M2,
        aMax: STAFF_AREA_MAX_M2
      }, '');
    }

    function georgyAutoTargetDli(){
      var nat = deps.naturalDLI();
      if (!st().lighting) return Math.max(12, Math.round(nat * 10) / 10);
      return TARGET_DLI;
    }

    function estimateGeorgyHarvest(cv){
      cv = cv || deps.getCv();
      var profile = getGeorgyProfile(cv);
      var massAuto;
      if (profile){
        massAuto = normativeBabyCutMass(profile, cv, 0);
      } else {
        var h = headHarvestGeorgy(cv, PLACEHOLDER_DENSITY);
        if (h){
          return { mass: h.mass, canopy: h.canopy, massAuto: h.massAuto };
        }
        massAuto = 0;
      }
      var saved = { density: st().density, extraB: st().extraB };
      st().density = PLACEHOLDER_DENSITY;
      st().extraB = 0;
      var lay = deps.plantLayout(cv);
      var canopy = deps.harvestCanopy(cv, massAuto);
      st().density = saved.density;
      st().extraB = saved.extraB;
      return {
        mass: Math.round(massAuto),
        canopy: Math.round(canopy),
        massAuto: massAuto
      };
    }

    function estimateHarvestCanopy(cv){
      return estimateGeorgyHarvest(cv).canopy;
    }

    function layoutAtDensity(cv, rho){
      var saved = { density: st().density, extraB: st().extraB };
      st().density = rho;
      var hHead = headHarvestGeorgy(cv, rho);
      var canopy = hHead
        ? headCanopyForDensityFit(cv)
        : estimateHarvestCanopy(cv);
      st().extraB = extraBFromCanopy(cv, canopy);
      var lay = deps.plantLayout(cv);
      var gap = lay.nearest - canopy;
      var out = {
        gap: gap,
        nearest: lay.nearest,
        canopy: canopy,
        rhoA: lay.rhoA,
        extraB: st().extraB
      };
      st().density = saved.density;
      st().extraB = saved.extraB;
      return out;
    }

    function leafGapForDensity(cv, rho){
      return layoutAtDensity(cv, rho).gap;
    }

    /** Макс. перекрытие при подборе: в Георгии 0 (без касания), в обычной теплице — до 20 мм. */
    function leafOverlapMaxMm(){
      return isGeorgyGh() ? GEORGY_FIT_MIN_GAP_MM : MAX_LEAF_OVERLAP_MM;
    }

    function densityFromCanopy(cv){
      var profile = getGeorgyProfile(cv);
      var minGap = -leafOverlapMaxMm();
      var bounds = profile
        ? { lo: profile.densityMin, hi: profile.densityMax }
        : headDensityBounds(cv);
      var lo = bounds.lo;
      var hi = bounds.hi;
      if (leafGapForDensity(cv, lo) < minGap) return lo;

      var best = lo;
      var l = lo;
      var h = hi;
      while (l <= h){
        var mid = Math.round((l + h) / 2);
        if (leafGapForDensity(cv, mid) >= minGap){
          best = mid;
          l = mid + 1;
        } else {
          h = mid - 1;
        }
      }
      while (best > lo && leafGapForDensity(cv, best) < minGap) best--;
      while (best < hi && leafGapForDensity(cv, best + 1) >= minGap) best++;
      return best;
    }

    function extraBFromCanopy(cv, canopy){
      var savedB = st().extraB;
      var savedRho = st().density;
      st().extraB = 0;
      var lay0 = deps.plantLayout(cv);
      var overlapMm = leafOverlapMaxMm();
      var minNearest = canopy - overlapMm;
      var deficit = minNearest - lay0.nearest;
      var extra = deficit > 0.5 ? Math.max(0, Math.round(deficit * 0.9)) : 0;
      if (lay0.constrained) extra = Math.max(extra, Math.round(canopy * 0.08));
      st().extraB = savedB;
      st().density = savedRho;
      return clamp(extra, 0, 120);
    }

    function previewGeorgyAutoDensity(cv){
      cv = cv || deps.getCv();
      var profile = getGeorgyProfile(cv);
      var rho = densityFromCanopy(cv);
      if (profile) rho = clampProfiledDensity(profile, rho);
      st().georgyAutoDensity = rho;
      return st().georgyAutoDensity;
    }

    function setGeorgyTargetDensity(rho){
      var cv = deps.getCv();
      var profile = getGeorgyProfile(cv);
      var bounds = profile
        ? { lo: profile.densityMin, hi: profile.densityMax }
        : headDensityBounds(cv);
      rho = clamp(Math.round(rho), bounds.lo, bounds.hi);
      if (profile) rho = clampProfiledDensity(profile, rho);
      st().georgyTargetDensity = rho;
      try { localStorage.setItem(GEORGY_DENSITY_KEY, String(st().georgyTargetDensity)); } catch(_){}
    }

    function applyGeorgyDensityAuto(cv){
      cv = cv || deps.getCv();
      var profile = getGeorgyProfile(cv);
      var rho = densityFromCanopy(cv);
      if (profile) rho = clampProfiledDensity(profile, rho);
      else rho = clamp(Math.round(rho), 15, headDensityMaxForCv(cv));
      var lay = layoutAtDensity(cv, rho);
      st().georgyAutoDensity = rho;
      st().georgyLastFitGap = Math.round(lay.gap);
      setGeorgyTargetDensity(rho);
      st().georgyDensityFitted = true;
      st().extraB = lay.extraB;
      st().density = rho;
    }

    function applyGeorgyProfileStandard(profile){
      if (!isGeorgyGh() || !profile) return;
      var cv = deps.findCvById ? deps.findCvById(profile.id) : null;
      st().georgyManualCutMasses = false;
      st().cv = profile.id;
      st().day = profile.defaultDay;
      st().nch = clampBabyNch(st().nch, profile);
      st().offset = OFFSET_PCT;
      st().cutInterval = clamp(profile.cutInterval, profile.cutIntervalMin, profile.cutIntervalMax);
      st().multicut = true;
      st().georgyFirstCutCh = profile.firstCutCh;
      st().georgyChannel2Rows = true;
      refreshGeorgyCutMasses(profile, cv || { id: profile.id });
      st().georgyDensityFitted = false;
      st().georgyTargetDensity = null;
      st().georgyAutoDensity = null;
      st().georgyLastFitGap = null;
      var dayInp = document.getElementById('georgy-day');
      var dayV = document.getElementById('georgy-day-v');
      if (dayInp) dayInp.value = st().day;
      if (dayV) dayV.textContent = String(st().day);
      if (deps.syncMainSliders) deps.syncMainSliders();
    }

    function applyGeorgyRucolaStandard(){
      applyGeorgyProfileStandard(RUCOLA_PROFILE);
    }

    function applyGeorgyLettuceStandard(){
      applyGeorgyProfileStandard(LETTUCE_PROFILE);
    }

    function applyGeorgyProfilePresets(cv){
      var profile = getGeorgyProfile(cv);
      if (!profile) return;
      st().georgyChannel2Rows = true;
      st().nch = clampBabyNch(st().nch, profile);
      st().multicut = true;
      st().cutInterval = clamp(st().cutInterval || profile.cutInterval, profile.cutIntervalMin, profile.cutIntervalMax);
      if (st().georgyFirstCutCh == null) st().georgyFirstCutCh = profile.firstCutCh;
      refreshGeorgyCutMasses(profile, cv);
    }

    function applyGeorgyBeforeCalc(){
      if (!isGeorgyGh()) return;
      readGeorgyHeadCycleFromDom();
      var cv = deps.getCv();
      if (!isGeorgyCvAllowed(cv)){
        st().cv = RUCOLA_BABY_ID;
        cv = deps.getCv();
      }
      var profile = getGeorgyProfile(cv);
      if (profile){
        st().germination = GERM_DAYS;
        st().nursery = 0;
      } else {
        clampGeorgyHeadCycleInputs();
        if (!(st().nursery > 0)) st().nursery = HEAD_NURSERY_DEFAULT_D;
        if (st().germination < HEAD_GERM_MIN) st().germination = GERM_DAYS;
      }
      st().offset = OFFSET_PCT;
      st().pot = POT_MM;
      st().useManualMass = false;
      st().useManualCanopy = false;
      st().useManualCutMass = false;
      st().targetPhotoperiod = PHOTOPERIOD_H;
      if (st().lighting) st().targetDli = georgyAutoTargetDli();
      if (profile){
        st().day = clamp(Math.round(st().day), 8, 40);
      } else {
        st().day = clamp(Math.round(st().day), HEAD_CHANNEL_MIN, HEAD_CHANNEL_MAX);
      }
      if (profile){
        applyGeorgyProfilePresets(cv);
      } else {
        st().multicut = false;
        st().georgyFirstCutCh = null;
        st().georgyChannel2Rows = false;
      }
      previewGeorgyAutoDensity(cv);
      if (!profile && st().georgyTargetDensity > 0) {
        setGeorgyTargetDensity(st().georgyTargetDensity);
      }
      if (st().georgyDensityFitted && st().georgyTargetDensity > 0){
        var rho = st().georgyTargetDensity;
        if (profile) rho = clampProfiledDensity(profile, rho);
        else rho = clamp(Math.round(rho), 15, headDensityMaxForCv(cv));
        st().density = rho;
        var layFit = layoutAtDensity(cv, st().density);
        st().extraB = layFit.extraB;
        st().georgyLastFitGap = Math.round(layFit.gap);
      } else {
        st().density = PLACEHOLDER_DENSITY;
        st().extraB = 0;
      }
    }

    function renderGeorgyProfileRec(cv){
      var el = document.getElementById('georgy-profile-rec');
      if (!el) return;
      var profile = getGeorgyProfile(cv);
      if (!isGeorgyGh() || !profile){
        el.textContent = '';
        return;
      }
      var dli = deps.effectiveDLI ? r2(deps.effectiveDLI()) : '—';
      var maxCuts = resolveGeorgyMaxCuts(profile, cv);
      var yf = georgyYieldFactor(profile, st().temp);
      var massMin = Math.round(profile.massMin * yf);
      var massMax = Math.round(profile.massMax * yf);
      var vars = {
        rhoMin: profile.densityMin,
        rhoMax: profile.densityMax,
        rhoLight: profile.densityLight,
        intervalMin: profile.cutIntervalMin,
        intervalMax: profile.cutIntervalMax,
        maxCuts: maxCuts,
        massMin: massMin,
        massMax: massMax,
        dli: dli,
        temp: st().temp,
        yieldPct: georgyYieldLossPct(profile, st().temp),
        yieldPctMin: Math.round((profile.yieldLossMin || 0.15) * 100),
        yieldPctMax: Math.round((profile.yieldLossMax || 0.20) * 100)
      };
      el.textContent = T(profile.recKey, vars, '');
    }

    function buildCutPlanRows(profile, cv, opts){
      opts = opts || {};
      if (!profile || !cv) return [];
      var s = st();
      if (!s.multicut && !opts.force) return [];
      var interval = s.cutInterval || profile.cutInterval;
      var firstCh = s.georgyFirstCutCh > 0 ? s.georgyFirstCutCh : profile.firstCutCh;
      var nCuts = opts.nCuts != null ? opts.nCuts
        : (s.useManualGhCutCount ? s.ghCutCount : resolveGeorgyMaxCuts(profile, cv));
      nCuts = clamp(Math.round(nCuts), 1, 24);
      var masses = scaledProfileCutMasses(profile, nCuts);
      var pm = deps.plantMetric || function(k){ return k; };
      var rows = [];
      for (var i = 0; i < nCuts; i++){
        var ch = firstCh + i * interval;
        var mass =
          s.ghCutMasses && s.ghCutMasses[i] != null && isFinite(Number(s.ghCutMasses[i]))
            ? Math.round(Number(s.ghCutMasses[i]))
            : masses[i];
        rows.push({
          n: i + 1,
          chLabel: Math.round(ch) + ' ' + (pm('unit.days') || 'сут'),
          mass: mass,
          massLabel: mass + ' ' + (pm('unit.g') || 'г')
        });
      }
      return rows;
    }

    function renderCutPlanTable(box, r, opts){
      if (!box) return;
      var profile = getGeorgyProfile(r && r.cv);
      if (!profile || !st().multicut){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      var rows = buildCutPlanRows(profile, r.cv, opts);
      if (!rows.length){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      box.classList.remove('env-block-hidden');
      var autoNoteManual = st().useManualGhCutCount || st().useManualCutMass || st().georgyManualCutMasses;
      var autoNote = autoNoteManual
        ? T('mc.cutPlan.manualNote', null, 'Часть параметров задана вручную; остальное — по нормативу.')
        : T('mc.cutPlan.autoNote', null, 'Автоматический план: число срезок от температуры, массы — с учётом жары и света.');
      var editableGeorgy = isGeorgyGh();
      var resetNorm =
        editableGeorgy && st().georgyManualCutMasses
          ? ' <button type="button" class="auto-btn georgy-reset-cut-masses">' +
            T('georgy.cutMassesResetNorm', null, 'Сброс масс к нормативу') +
            '</button>'
          : '';
      var editHint = editableGeorgy
        ? '<p class="georgy-density-hint" style="margin:8px 0 0">' +
          T(
            'georgy.cutMassesEditHint',
            null,
            'Массу по каждой срезке можно изменить в таблице ниже; пересчёт обновит метрики и урожай.'
          ) +
          '</p>'
        : '';
      var ae = typeof document !== 'undefined' ? document.activeElement : null;
      var keepIdx = null;
      var keepSel0 = 0;
      var keepSel1 = 0;
      if (
        editableGeorgy &&
        ae &&
        ae.getAttribute &&
        ae.getAttribute('data-georgy-cut-mass-i') != null &&
        box.contains(ae)
      ){
        keepIdx = ae.getAttribute('data-georgy-cut-mass-i');
        keepSel0 = ae.selectionStart || 0;
        keepSel1 = ae.selectionEnd || 0;
      }
      box.innerHTML =
        '<div class="georgy-cut-preview-title">' +
        T('georgy.profile.cutsTitle', null, 'План срезок') +
        '</div>' +
        '<p class="georgy-density-hint" style="margin:0 0 8px">' +
        autoNote +
        resetNorm +
        '</p>' +
        editHint +
        '<table class="georgy-cut-preview-table"><thead><tr><th>№</th><th>' +
        T('georgy.rucola.cutsColDay', null, 'В канале') +
        '</th><th>' +
        T('georgy.rucola.cutsColMass', null, 'Масса') +
        '</th></tr></thead><tbody>' +
        rows
          .map(function (row){
            var massCell =
              editableGeorgy
                ? '<input type="number" class="georgy-cut-mass-inp" min="1" max="500" step="1" data-georgy-cut-mass-i="' +
                  (row.n - 1) +
                  '" value="' +
                  row.mass +
                  '">'
                : row.massLabel;
            return '<tr><td>' + row.n + '</td><td>' + row.chLabel + '</td><td>' + massCell + '</td></tr>';
          })
          .join('') +
        '</tbody></table>';
      if (keepIdx != null && typeof requestAnimationFrame === 'function'){
        requestAnimationFrame(function (){
          var el = box.querySelector('input[data-georgy-cut-mass-i="' + keepIdx + '"]');
          if (el){
            el.focus();
            try {
              el.setSelectionRange(keepSel0, keepSel1);
            } catch (_){
            }
          }
        });
      }
    }

    function renderMulticutBabyCutPreview(r){
      var box = document.getElementById('multicut-cut-preview');
      if (!box) return;
      if (isGeorgyGh() || deps.isVF() || deps.isPalletView()){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      if (!getGeorgyProfile(r && r.cv)){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      renderCutPlanTable(box, r, {});
    }

    function syncBabyGhCutsAuto(cv){
      cv = cv || deps.getCv();
      var profile = getGeorgyProfile(cv);
      if (!profile || st().useManualGhCutCount) return;
      st().ghCutCount = resolveGeorgyMaxCuts(profile, cv);
      refreshGeorgyCutMasses(profile, cv);
      if (st().georgyFirstCutCh == null) st().georgyFirstCutCh = profile.firstCutCh;
    }

    function applyCanopyDensityBeforeCalc(){
      if (isGeorgyGh()) return;
      if (!st().georgyDensityFitted || !(st().georgyTargetDensity > 0)) return;
      var cv = deps.getCv();
      if (!canUseCanopyDensityPick(cv)) return;
      var profile = getGeorgyProfile(cv);
      var rho = st().georgyTargetDensity;
      if (profile) rho = clampProfiledDensity(profile, rho);
      var lay = layoutAtDensity(cv, rho);
      st().density = rho;
      st().extraB = lay.extraB;
      st().georgyLastFitGap = Math.round(lay.gap);
    }

    function renderGeorgyCutPreview(r){
      var box = document.getElementById('georgy-cut-preview');
      if (!box) return;
      var cv = r && r.cv;
      var profile = getGeorgyProfile(cv);
      if (!isGeorgyGh() || !profile){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      renderCutPlanTable(box, r, {});
    }

    function setGeorgyDom(on){
      document.documentElement.classList.toggle('georgy-active', !!on);
      var btn = document.getElementById('btn-georgy-mode');
      if (btn) btn.classList.toggle('on', !!on);
      var facWrap = document.getElementById('facility-env-wrap');
      if (facWrap) facWrap.classList.toggle('georgy-facility-dim', !!on);
    }

    function syncGeorgyControls(r){
      if (!isGeorgyGh()){
        setGeorgyDom(false);
        return;
      }
      setGeorgyDom(true);
      var cv = (r && r.cv) ? r.cv : deps.getCv();
      var profile = getGeorgyProfile(cv);
      var showBabyUi = !!(profile && isGeorgyGh());
      document.querySelectorAll('#panel-georgy-simple .georgy-baby-only').forEach(function (node){
        node.classList.toggle('env-block-hidden', !showBabyUi);
      });
      document.querySelectorAll('#panel-georgy-simple .georgy-head-only').forEach(function (node){
        node.classList.toggle('env-block-hidden', showBabyUi);
      });
      var rucolaBtn = document.getElementById('georgy-rucola-std');
      var lettuceBtn = document.getElementById('georgy-lettuce-std');
      if (rucolaBtn){
        rucolaBtn.classList.toggle('on', !!(showBabyUi && cv && cv.id === RUCOLA_BABY_ID));
      }
      if (lettuceBtn){
        lettuceBtn.classList.toggle('on', !!(showBabyUi && cv && cv.id === LETTUCE_BABY_ID));
      }
      var massLblEl = document.getElementById('georgy-preview-mass-lbl');
      if (massLblEl){
        massLblEl.textContent = T(
          profile ? 'georgy.preview.massPerCut' : 'georgy.preview.massModel',
          null,
          massLblEl.textContent
        );
      }
      var step2Lbl = document.querySelector('#panel-georgy-simple .georgy-step-label[data-i18n="georgy.step2"]');
      if (step2Lbl){
        step2Lbl.textContent = T(profile ? 'georgy.step2.baby' : 'georgy.step2', null, step2Lbl.textContent);
      }
      var nchInp = document.getElementById('nch');
      if (nchInp && profile){
        nchInp.min = String(profile.nchMin);
        nchInp.max = String(profile.nchMax);
      }
      var germV = document.getElementById('georgy-germ-val');
      if (germV) germV.textContent = String(GERM_DAYS);
      syncGeorgyHeadSlidersToState();
      var dayInp = document.getElementById('georgy-day');
      var dayV = document.getElementById('georgy-day-v');
      if (dayInp){
        dayInp.min = profile ? '8' : String(HEAD_CHANNEL_MIN);
        dayInp.max = profile ? '40' : String(HEAD_CHANNEL_MAX);
      }
      if (dayInp && document.activeElement !== dayInp){
        dayInp.value = st().day;
        if (dayV) dayV.textContent = String(st().day);
      }
      var harvest = estimateGeorgyHarvest(cv);
      var pm = deps.plantMetric || (typeof global.DG_plantMetric === 'function' ? global.DG_plantMetric : function(k){ return k; });
      var massEl = document.getElementById('georgy-preview-mass');
      var canopyEl = document.getElementById('georgy-preview-canopy');
      if (massEl) massEl.textContent = harvest.mass + ' ' + (pm('unit.g') || 'г');
      if (canopyEl && !profile){
        var cRg = headCanopyFitRangeLabel(cv);
        canopyEl.textContent = T('georgy.preview.canopyFit', cRg, cRg.loCm + '–' + cRg.hiCm + ' см');
      } else if (canopyEl) {
        canopyEl.textContent = harvest.canopy + ' ' + (pm('unit.mm') || 'мм');
      }
      var fitted = !!st().georgyDensityFitted;
      var densBlock = document.getElementById('georgy-density-block');
      if (densBlock) densBlock.classList.toggle('is-locked', !fitted);
      var densInp = document.getElementById('georgy-density');
      var densV = document.getElementById('georgy-density-v');
      var headBounds = headDensityBounds(cv);
      var rhoLo = profile ? profile.densityMin : headBounds.lo;
      var rhoHi = profile ? profile.densityMax : headBounds.hi;
      var targetRho = fitted && st().georgyTargetDensity > 0
        ? st().georgyTargetDensity
        : (st().georgyAutoDensity || PLACEHOLDER_DENSITY);
      if (densInp){
        densInp.min = String(rhoLo);
        densInp.max = String(rhoHi);
        densInp.disabled = !fitted;
        if (document.activeElement !== densInp) densInp.value = targetRho;
      }
      if (densV) densV.textContent = String(targetRho);
      var mainDens = document.getElementById('density');
      var mainDensV = document.getElementById('density-v');
      if (mainDens && !profile){
        mainDens.min = String(rhoLo);
        mainDens.max = String(rhoHi);
        if (document.activeElement !== mainDens && fitted) mainDens.value = targetRho;
        if (mainDensV && fitted) mainDensV.textContent = String(targetRho);
      }
      var densAutoBtn = document.getElementById('georgy-density-auto');
      if (densAutoBtn){
        var minTotal = profile ? 8 : HEAD_CHANNEL_MIN;
        var tdOk = totalDaysFromSowGeorgy(cv);
        densAutoBtn.disabled = !(tdOk != null && tdOk >= minTotal);
      }
      var densHint = document.getElementById('georgy-density-hint');
      if (densHint){
        var autoRho = st().georgyAutoDensity;
        if (autoRho == null) autoRho = previewGeorgyAutoDensity(cv);
        if (fitted){
          var gapShown = st().georgyLastFitGap != null ? st().georgyLastFitGap : leafGapForDensity(cv, st().georgyTargetDensity);
          var cHint = !profile ? headCanopyFitRangeLabel(cv) : null;
          var fitCm = cHint
            ? (headCanopyUsesHiForGeorgyFit(cv) ? cHint.hiCm : cHint.midCm)
            : '';
          densHint.textContent = T('georgy.densityHint', {
            auto: autoRho,
            target: st().georgyTargetDensity,
            gap: gapShown,
            canopy: harvest.canopy,
            canopyLoCm: cHint ? cHint.loCm : '',
            canopyHiCm: cHint ? cHint.hiCm : '',
            hiCm: cHint ? cHint.hiCm : '',
            midCm: cHint ? cHint.midCm : '',
            fitCm: fitCm,
            name: cv ? cv.name : ''
          }, '«' + (cv ? cv.name : '') + '»: ' + st().georgyTargetDensity + ' шт/м², подбор без касания по ' +
            fitCm + ' см (' + (cHint ? cHint.loCm + '–' + cHint.hiCm : '') + '), зазор ' + gapShown + ' мм');
        } else {
          var cBefore = !profile ? headCanopyFitRangeLabel(cv) : null;
          densHint.textContent = cBefore
            ? T('georgy.densityHintBeforeRange', Object.assign({}, cBefore, {
              fitCm: headCanopyUsesHiForGeorgyFit(cv) ? cBefore.hiCm : cBefore.midCm
            }),
              'Крона ' + cBefore.loCm + '–' + cBefore.hiCm + ' см, подбор по ' +
              (headCanopyUsesHiForGeorgyFit(cv) ? 'верху ' + cBefore.hiCm : 'середине ' + cBefore.midCm) + ' см.')
            : T('georgy.densityHintBefore', null,
              'Задайте дни роста, проверьте массу и шапку, затем нажмите кнопку подбора.');
        }
      }
      var totalDaysEl = document.getElementById('georgy-total-days');
      if (totalDaysEl){
        var td = totalDaysFromSowGeorgy(cv);
        totalDaysEl.textContent = td != null ? String(Math.round(td)) : '—';
      }
      renderGeorgyStaffHint();
      renderGeorgyProfileRec(cv);
      renderGeorgyCutPreview(r);
      var autoDli = document.getElementById('georgy-auto-dli');
      if (autoDli) autoDli.textContent = r2(st().targetDli) + ' ' + T('georgy.unit.mol', null, 'моль/сут');
      var autoPh = document.getElementById('georgy-auto-ph');
      if (autoPh) autoPh.textContent = String(PHOTOPERIOD_H) + ' ' + T('georgy.unit.h', null, 'ч/сут');
      var gLight = document.getElementById('georgy-lighting');
      var mainLight = document.getElementById('lighting');
      if (gLight && document.activeElement !== gLight) gLight.checked = !!st().lighting;
      if (mainLight && document.activeElement !== mainLight) mainLight.checked = !!st().lighting;
      var gLightLbl = document.getElementById('georgy-lighting-label');
      if (gLightLbl){
        gLightLbl.textContent = st().lighting
          ? T('georgy.lightingOn', null, 'Включена (вечер до 16 ч)')
          : T('georgy.lightingOff', null, 'Выключена — только естественный свет');
      }
      var lightHint = document.getElementById('georgy-lighting-hint');
      if (lightHint){
        var ly = georgyLightYieldPct();
        lightHint.textContent = st().lighting
          ? T('georgy.lightingHintOn', { pct: ly }, 'Вечерняя досветка: +' + ly + '% к массе (DLI и продление дня).')
          : T('georgy.lightingHintOff', { pct: ly }, 'Без досветки: ' + ly + '% к массе относительно цели с вечерним светом.');
      }
      var autoLightYield = document.getElementById('georgy-auto-light-yield');
      if (autoLightYield){
        var pct = georgyLightYieldPct();
        autoLightYield.textContent = (pct >= 0 ? '+' : '') + pct + '%';
      }
      var autoRhoEl = document.getElementById('georgy-auto-density');
      if (autoRhoEl && r) autoRhoEl.textContent = Math.round(r.rhoA) + ' ' + T('georgy.unit.pcsSqm', null, 'шт/м²');
      var autoGap = document.getElementById('georgy-auto-leafgap');
      if (autoGap && r) autoGap.textContent = (r.leafGap >= 0 ? '+' : '') + Math.round(r.leafGap) + ' ' + T('georgy.unit.mm', null, 'мм');
      var mc = document.getElementById('multicut');
      if (mc && profile) mc.checked = true;
      var intInp = document.getElementById('georgy-cutInterval');
      var intV = document.getElementById('georgy-cutInterval-v');
      if (intInp && profile){
        intInp.min = String(profile.cutIntervalMin);
        intInp.max = String(profile.cutIntervalMax);
        if (document.activeElement !== intInp){
          st().cutInterval = clamp(st().cutInterval || profile.cutInterval, profile.cutIntervalMin, profile.cutIntervalMax);
          intInp.value = st().cutInterval;
          if (intV) intV.textContent = String(st().cutInterval);
        }
      }
      var intHint = document.getElementById('georgy-cut-interval-hint');
      if (intHint && profile && deps.cutIntervalMods){
        var mods = deps.cutIntervalMods(cv);
        intHint.textContent = T('georgy.cutIntervalHint', {
          rec: mods.rec,
          massPct: (mods.massPct >= 0 ? '+' : '') + mods.massPct,
          cutsMo: mods.rec > 0 ? r2(30.5 / st().cutInterval) : '—'
        }, '');
      } else if (intHint) intHint.textContent = '';
      renderGeorgyGuide();
    }


    var GUIDE_SECTIONS = [
      'georgy.guide.scope',
      'georgy.guide.baby',
      'georgy.guide.workflow',
      'georgy.guide.visible',
      'georgy.guide.auto',
      'georgy.guide.step1',
      'georgy.guide.step2',
      'georgy.guide.step3',
      'georgy.guide.env',
      'georgy.guide.margin',
      'georgy.guide.yield',
      'georgy.guide.read',
      'georgy.guide.sources'
    ];

    function renderGeorgyGuide(){
      var box = document.getElementById('georgy-guide-body');
      if (!box) return;
      if (!isGeorgyGh()) return;
      box.innerHTML = GUIDE_SECTIONS.map(function(k){
        var html = T(k, null, '');
        if (!html || html === k) return '';
        return '<section class="georgy-guide-sec">' + html + '</section>';
      }).join('');
    }

    function pushProfileWarnings(items, profile, cv, r){
      if (r.rhoA < profile.densityMin - 2 || r.rhoA > profile.densityMax + 2){
        items.push({ t: 'warn', k: 'georgy.warn.profileDensity', vars: {
          rho: Math.round(r.rhoA), min: profile.densityMin, max: profile.densityMax
        }});
      }
      if (deps.effectiveDLI && deps.effectiveDLI() >= profile.dliLightMin && r.rhoA < profile.densityLight - 5){
        items.push({ t: 'info', k: 'georgy.warn.profileLight', vars: { target: profile.densityLight, dli: r2(deps.effectiveDLI()) } });
      }
      if (st().cutInterval < profile.cutIntervalMin || st().cutInterval > profile.cutIntervalMax){
        items.push({ t: 'warn', k: 'georgy.warn.profileInterval', vars: {
          d: st().cutInterval, min: profile.cutIntervalMin, max: profile.cutIntervalMax
        }});
      }
      var nCuts = resolveGeorgyMaxCuts(profile, cv);
      var yf = georgyYieldFactor(profile, st().temp);
      items.push({ t: 'info', k: profile.warnPlanKey, vars: {
        n: nCuts, interval: st().cutInterval || profile.cutInterval,
        mass: Math.round(profile.massMin * yf) + '–' + Math.round(profile.massMax * yf),
        temp: st().temp,
        intervalMin: profile.cutIntervalMin,
        intervalMax: profile.cutIntervalMax
      }});
    }

    function renderGeorgyWarnings(r){
      var box = document.getElementById('georgy-cut-warnings');
      if (!box) return;
      if (!isGeorgyGh()){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      var cv = r.cv;
      var profile = getGeorgyProfile(cv);
      if (!st().georgyDensityFitted && !profile){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      box.classList.remove('env-block-hidden');
      var items = [];

      if (profile) pushProfileWarnings(items, profile, cv, r);

      if (st().temp >= 28){
        items.push({ t: 'info', k: 'georgy.warn.tempHeadBaby', vars: {
          temp: st().temp,
          babyPct: profile ? georgyYieldLossPct(profile, st().temp) : georgyYieldLossPct(RUCOLA_PROFILE, st().temp),
          headPct: Math.round((1 - (deps.tempFactor ? deps.tempFactor(cv) : 1)) * 100)
        }});
      }

      if (!profile && r && Number.isFinite(r.leafGap)){
        var gapNow = Math.round(r.leafGap);
        if (gapNow < -MAX_LEAF_OVERLAP_MM){
          items.push({ t: 'bad', k: 'georgy.warn.overlap', vars: { mm: Math.abs(gapNow) } });
        } else if (gapNow < 0){
          items.push({ t: 'warn', k: 'georgy.warn.overlapLight', vars: { mm: Math.abs(gapNow) } });
        }
      }
      if (st().georgyDensityFitted){
        if (!profile){
          var boltCh = deps.boltChannel(cv);
          if (st().day >= boltCh - 5){
            items.push({ t: 'warn', k: 'georgy.warn.nearBolt', vars: { bolt: Math.round(boltCh) } });
          }
          var rhoCap = headDensityMaxForCv(cv);
          if (st().density > rhoCap){
            items.push({ t: 'warn', k: 'georgy.warn.headDensityHigh', vars: {
              rho: Math.round(st().density), max: rhoCap, type: cv.type || 'head'
            }});
          }
          var tdHead = totalDaysFromSowGeorgy(cv);
          var minTd = headMinTotalDaysForCv(cv);
          if (tdHead > 0 && tdHead < minTd){
            items.push({ t: 'info', k: 'georgy.warn.headShortCycle', vars: {
              days: tdHead, min: minTd, type: headCvType(cv), mass: r.mass, canopy: r.canopy
            }});
          }
        }
        if (st().lighting && deps.effectiveDLI() < 14){
          items.push({ t: 'warn', k: 'georgy.warn.lowDli', vars: { dli: r2(deps.effectiveDLI()) } });
        }
      }

      var icon = { info: 'ℹ️', warn: '⚠️', bad: '⛔' };
      box.innerHTML = '<div class="georgy-warn-title">' + T('georgy.warn.title', null, 'Плотность и риски') + '</div>' +
        items.map(function(it){
          var cls = it.t === 'bad' ? 'georgy-warn bad' : (it.t === 'warn' ? 'georgy-warn warn' : 'georgy-warn');
          return '<div class="' + cls + '"><span class="georgy-warn-ico">' + (icon[it.t] || '•') + '</span><span>' +
            T(it.k, it.vars, it.k) + '</span></div>';
        }).join('');
    }

    function captureRestore(){
      var s = st();
      return {
        germination: s.germination, nursery: s.nursery, day: s.day,
        density: s.density, offset: s.offset, extraB: s.extraB, pot: s.pot,
        nch: s.nch, cv: s.cv,
        useManualMass: s.useManualMass, useManualCanopy: s.useManualCanopy,
        multicut: s.multicut, cutInterval: s.cutInterval, ghCutCount: s.ghCutCount,
        ghCutMasses: s.ghCutMasses ? s.ghCutMasses.slice() : [],
        useManualCutMass: s.useManualCutMass, lighting: s.lighting,
        georgyManualCutMasses: !!s.georgyManualCutMasses,
        targetDli: s.targetDli, targetPhotoperiod: s.targetPhotoperiod,
        facility: s.facility,
        georgyDensityFitted: s.georgyDensityFitted,
        georgyChannel2Rows: s.georgyChannel2Rows,
        georgyFirstCutCh: s.georgyFirstCutCh
      };
    }

    function firstAllowedCvId(){
      var list = filterGeorgyCultivars(deps.allGhCultivars ? deps.allGhCultivars() : []);
      return list.length ? list[0].id : RUCOLA_BABY_ID;
    }

    function toggleGeorgyMode(forceOn){
      if (global.DG_isPreviewMode && global.DG_isPreviewMode() && forceOn !== false) return;
      var s = st();
      var next = forceOn != null ? !!forceOn : !s.georgyMode;
      if (next === s.georgyMode) return;
      if (next){
        s.georgyRestore = captureRestore();
        s.georgyMode = true;
        s.facility = 'greenhouse';
        if (s.appView === 'pallets') s.appView = 'channels';
        if (!isGeorgyCvAllowed(deps.findCvById ? deps.findCvById(s.cv) : null)){
          s.cv = firstAllowedCvId();
        }
        if (isGeorgyRucola()) applyGeorgyRucolaStandard();
        else if (isGeorgyLettuce()) applyGeorgyLettuceStandard();
        else {
          s.georgyDensityFitted = false;
          s.georgyChannel2Rows = false;
          s.multicut = false;
        }
        s.lighting = true;
        deps.setFacility && deps.setFacility('greenhouse');
      } else {
        s.georgyMode = false;
        s.georgyFirstCutCh = null;
        s.georgyChannel2Rows = false;
        s.georgyDensityFitted = false;
        if (s.georgyRestore){
          Object.keys(s.georgyRestore).forEach(function(k){ s[k] = s.georgyRestore[k]; });
          s.georgyRestore = null;
        }
      }
      try { localStorage.setItem(GEORGY_STORAGE_KEY, next ? '1' : '0'); } catch(_){}
      setGeorgyDom(next);
      deps.renderAll && deps.renderAll();
    }

    function loadGeorgyMode(){
      if (global.DG_isPreviewMode && global.DG_isPreviewMode()) return;
      try {
        if (localStorage.getItem(GEORGY_STORAGE_KEY) === '1'){
          st().georgyMode = true;
          st().facility = 'greenhouse';
          if (!isGeorgyCvAllowed(deps.findCvById ? deps.findCvById(st().cv) : null)){
            st().cv = firstAllowedCvId();
          }
          st().georgyDensityFitted = false;
          var cv = deps.getCv();
          if (isGeorgyProfiled(cv)) applyGeorgyProfilePresets(cv);
          setGeorgyDom(true);
        }
      } catch(_){}
    }

    function onGeorgyDayChanged(){
      var cv = deps.getCv();
      if (isGeorgyGh()) {
        if (getGeorgyProfile(cv)) {
          st().georgyDensityFitted = false;
        } else if (st().georgyDensityFitted) {
          applyGeorgyDensityAuto(cv);
        } else {
          previewGeorgyAutoDensity(cv);
        }
        syncGeorgyHeadSlidersToState();
        return;
      }
      if (canUseCanopyDensityPick(cv) && st().georgyDensityFitted) {
        applyGeorgyDensityAuto(cv);
      }
      syncGeorgyHeadSlidersToState();
    }

    function onGeorgyHeadCycleChanged(){
      readGeorgyHeadCycleFromDom();
      st().georgyDensityFitted = false;
      st().georgyTargetDensity = null;
      st().georgyAutoDensity = null;
      st().georgyLastFitGap = null;
      var cv = deps.getCv();
      var profile = getGeorgyProfile(cv);
      if (!profile) previewGeorgyAutoDensity(cv);
      var totalDaysEl = document.getElementById('georgy-total-days');
      if (totalDaysEl){
        var td = totalDaysFromSowGeorgy(cv);
        totalDaysEl.textContent = td != null ? String(Math.round(td)) : '—';
      }
      var harvest = estimateGeorgyHarvest(cv);
      var pm = deps.plantMetric || function(k){ return k; };
      var massEl = document.getElementById('georgy-preview-mass');
      var canopyEl = document.getElementById('georgy-preview-canopy');
      if (massEl) massEl.textContent = harvest.mass + ' ' + (pm('unit.g') || 'г');
      if (canopyEl && !profile){
        var cRange = headCanopyFitRangeLabel(cv);
        canopyEl.textContent = T('georgy.preview.canopyFit', cRange,
          cRange.loCm + '–' + cRange.hiCm + ' см');
      } else if (canopyEl) {
        canopyEl.textContent = harvest.canopy + ' ' + (pm('unit.mm') || 'мм');
      }
      syncGeorgyHeadSlidersToState();
    }

    /** Сброс ручных масс срезок беби к авто-нормативу (тепло, свет). */
    function resetGeorgyBabyCutMassesNorm(){
      var cv = deps.getCv();
      st().georgyManualCutMasses = false;
      var profile = getGeorgyProfile(cv);
      if (profile) refreshGeorgyCutMasses(profile, cv);
    }

    return {
      isGeorgyGh: isGeorgyGh,
      isChannelGreenhouse: isChannelGreenhouse,
      canUseCanopyDensityPick: canUseCanopyDensityPick,
      isGeorgyRucola: isGeorgyRucola,
      isGeorgyLettuce: isGeorgyLettuce,
      isGeorgyProfiled: isGeorgyProfiled,
      getGeorgyProfile: getGeorgyProfile,
      isGeorgyCvAllowed: isGeorgyCvAllowed,
      filterGeorgyCultivars: filterGeorgyCultivars,
      usesGeorgyChannel2Rows: usesGeorgyChannel2Rows,
      applyGeorgyRucolaStandard: applyGeorgyRucolaStandard,
      applyGeorgyLettuceStandard: applyGeorgyLettuceStandard,
      resolveGeorgyMaxCuts: resolveGeorgyMaxCuts,
      georgyYieldFactor: function(profile, temp){ return georgyYieldFactor(profile, temp); },
      georgyYieldLossPct: georgyYieldLossPct,
      normativeBabyCutMass: normativeBabyCutMass,
      adjustMassForGeorgyBaby: adjustMassForGeorgyBaby,
      clampBabyNch: clampBabyNch,
      RUCOLA_BABY_ID: RUCOLA_BABY_ID,
      LETTUCE_BABY_ID: LETTUCE_BABY_ID,
      RUCOLA_PROFILE: RUCOLA_PROFILE,
      LETTUCE_PROFILE: LETTUCE_PROFILE,
      preChannelDaysGeorgy: preChannelDaysGeorgy,
      isGeorgyHeadSalad: isGeorgyHeadSalad,
      mainHarvestIntervalDays: mainHarvestIntervalDays,
      headHarvestCyclesPerMonth: headHarvestCyclesPerMonth,
      totalDaysFromSowGeorgy: totalDaysFromSowGeorgy,
      clampGeorgyHeadCycleInputs: clampGeorgyHeadCycleInputs,
      applyGeorgyBeforeCalc: applyGeorgyBeforeCalc,
      applyCanopyDensityBeforeCalc: applyCanopyDensityBeforeCalc,
      syncGeorgyControls: syncGeorgyControls,
      renderMulticutBabyCutPreview: renderMulticutBabyCutPreview,
      syncBabyGhCutsAuto: syncBabyGhCutsAuto,
      scaledProfileCutMasses: scaledProfileCutMasses,
      renderGeorgyWarnings: renderGeorgyWarnings,
      renderGeorgyGuide: renderGeorgyGuide,
      toggleGeorgyMode: toggleGeorgyMode,
      loadGeorgyMode: loadGeorgyMode,
      refreshGeorgyCutMasses: refreshGeorgyCutMasses,
      resetGeorgyBabyCutMassesNorm: resetGeorgyBabyCutMassesNorm,
      applyGeorgyDensityAuto: applyGeorgyDensityAuto,
      setGeorgyTargetDensity: setGeorgyTargetDensity,
      densityFromCanopy: densityFromCanopy,
      layoutAtDensity: layoutAtDensity,
      estimateGeorgyHarvest: estimateGeorgyHarvest,
      headHarvestGeorgy: headHarvestGeorgy,
      headDensityMaxForCv: headDensityMaxForCv,
      headMainChannelDays: headMainChannelDays,
      headCvType: headCvType,
      headCanopyFitRange: headCanopyFitRange,
      headCanopyFitRangeLabel: headCanopyFitRangeLabel,
      headCanopyForDensityFit: headCanopyForDensityFit,
      headCanopyUsesHiForGeorgyFit: headCanopyUsesHiForGeorgyFit,
      readGeorgyHeadCycleFromDom: readGeorgyHeadCycleFromDom,
      MAX_LEAF_OVERLAP_MM: MAX_LEAF_OVERLAP_MM,
      GEORGY_FIT_MIN_GAP_MM: GEORGY_FIT_MIN_GAP_MM,
      onGeorgyDayChanged: onGeorgyDayChanged,
      onGeorgyHeadCycleChanged: onGeorgyHeadCycleChanged,
      GERM_DAYS: GERM_DAYS
    };
  }

  global.DG_createGeorgyMode = createGeorgyMode;
})(typeof window !== 'undefined' ? window : this);
