/**
 * Модель интервалов и урожая за срезку (мультисрезка).
 * Подключается до основного IIFE; инициализация: DG_createCutModel(deps).
 */
(function(global){
  'use strict';

  var HARVEST_MONTH_DAYS = 30.5;
  var CUT_INTERVAL_SLACK = 6;

  global.DG_CUT = {
    HARVEST_MONTH_DAYS: HARVEST_MONTH_DAYS,
    CUT_INTERVAL_SLACK: CUT_INTERVAL_SLACK
  };

  function createCutModel(deps){
    function st(){ return deps.getState(); }

    function parseNumsFromStr(s){
      if (s == null || s === '') return [];
      var nums = [];
      String(s).replace(/,/g, '.').replace(/(\d+(?:\.\d+)?)/g, function(_, n){ nums.push(parseFloat(n)); });
      return nums;
    }

    function vfCutIntervalFromCv(cv){
      if (!cv) return 0;
      return cv.cutInterval > 0 ? Math.round(cv.cutInterval) : 0;
    }

    function cutIntervalRange(cv){
      cv = cv || deps.getActiveCv();
      var state = st();
      var mid = vfCutIntervalFromCv(cv) || state.cutInterval || 12;
      if (cv && cv.cutIntervalStd && !(cv.cutInterval > 0)){
        var nums = parseNumsFromStr(cv.cutIntervalStd);
        if (nums.length) mid = nums.reduce(function(a, b){ return a + b; }, 0) / nums.length;
      }
      mid = Math.round(mid);
      return {
        mid: mid,
        sliderMin: Math.max(5, mid - CUT_INTERVAL_SLACK),
        sliderMax: Math.min(45, mid + CUT_INTERVAL_SLACK)
      };
    }

    function cutIntervalMods(cv){
      var range = cutIntervalRange(cv);
      var rec = range.mid;
      var delta = st().cutInterval - rec;
      var massF = deps.clamp(1 + delta * (0.12 / CUT_INTERVAL_SLACK), 0.88, 1.12);
      var canopyF = deps.clamp(1 + delta * (0.10 / CUT_INTERVAL_SLACK), 0.90, 1.12);
      return {
        range: range,
        rec: rec,
        delta: delta,
        massF: massF,
        canopyF: canopyF,
        massPct: Math.round((massF - 1) * 100),
        canopyPct: Math.round((canopyF - 1) * 100)
      };
    }

    function supportsMulticut(cv){
      cv = cv || deps.getActiveCv();
      if (!cv) return false;
      if (cv.multicut) return true;
      return deps.isSheetCv(cv) && cv.cutInterval > 0 && cv.yieldPerCutG > 0;
    }

    function effectiveCutInterval(){
      return st().cutInterval;
    }

    function applyCutIntervalHarvestMods(cv, mass, canopy){
      var state = st();
      if (!state.multicut || !supportsMulticut(cv)) return { mass: mass, canopy: canopy };
      var m = cutIntervalMods(cv);
      return {
        mass: mass * m.massF,
        canopy: state.useManualCanopy ? canopy : canopy * m.canopyF
      };
    }

    /** VF: эталон с листа × фактор T/RH (как vfEffectiveMass). */
    function vfSheetCutMassG(cv, rawG){
      if (!rawG || rawG <= 0) return rawG;
      if (deps.isVF && deps.isVF() && deps.effectiveTempFactor) {
        return Math.max(1, Math.round(rawG * deps.effectiveTempFactor(cv)));
      }
      return rawG;
    }

    function cutMassPerPlant(cv, cutIndex, opts){
      opts = opts || {};
      cv = cv || deps.getActiveCv();
      var state = st();
      var u = cv.countUnit === 'шт' ? 'шт' : 'г';
      var val;
      if (!deps.isVF() && !deps.isPalletView() && state.multicut && cutIndex != null) val = deps.getGhCutMass(cutIndex);
      else if (state.useManualCutMass) val = deps.clamp(state.manualCutMass, 1, 500);
      else if (deps.isPalletView() && deps.isPalletSheetCv(cv) && cv.yieldPerCutG > 0) val = cv.yieldPerCutG;
      else if (deps.usePlantingSheet() && deps.isSheetCv(cv) && deps.getPlantingStd().cutMass && cv.yieldPerCutG > 0) val = vfSheetCutMassG(cv, cv.yieldPerCutG);
      else val = Math.round((cv.M_max / 2) * deps.envMultiplier(cv));
      if (!opts.skipIntervalMassF && state.multicut && supportsMulticut(cv)) val *= cutIntervalMods(cv).massF;
      return { val: Math.round(val), unit: u };
    }

    /** Средняя масса одной срезки для месячного урожая: 30,5/интервал × масса (без massF по интервалу). */
    function cutMassForMonthlyYield(cv){
      cv = cv || deps.getActiveCv();
      var state = st();
      var noF = { skipIntervalMassF: true };
      if (!state.multicut || !supportsMulticut(cv)) {
        if (
          deps.isPalletView() &&
          deps.isPalletSheetCv(cv) &&
          cv.countUnit === 'шт' &&
          cv.yieldPerCutG > 0 &&
          cv.cutInterval > 0
        ) {
          return cutMassPerPlant(cv, null, noF);
        }
        return cutMassPerPlant(cv, null, noF);
      }
      var planned = deps.georgyPlannedCuts ? deps.georgyPlannedCuts(cv) : null;
      var sum = 0;
      var n = 0;
      var unit = cv.countUnit === 'шт' ? 'шт' : 'г';
      var i;
      if (planned){
        var nAvg = Math.min(planned.maxCuts, 16);
        for (i = 0; i < nAvg; i++){
          var cmP = cutMassPerPlant(cv, i, noF);
          sum += cmP.val;
          unit = cmP.unit;
          n++;
        }
      } else if (!deps.isVF() && !deps.isPalletView()){
        var cnt = Math.max(1, Math.min(24, state.ghCutCount || 5));
        for (i = 0; i < cnt; i++){
          var cmG = cutMassPerPlant(cv, i, noF);
          sum += cmG.val;
          unit = cmG.unit;
          n++;
        }
      } else if (deps.isPalletView() && deps.isPalletSheetCv(cv) && cv.yieldPerCutG > 0){
        return cutMassPerPlant(cv, null, noF);
      } else if (deps.usePlantingSheet() && deps.isSheetCv(cv) && cv.yieldPerCutG > 0){
        return cutMassPerPlant(cv, null, noF);
      }
      if (n > 0) return { val: Math.round(sum / n), unit: unit };
      return cutMassPerPlant(cv, 0, noF);
    }

    /** Горизонт многосрезки: первый срез и последний день вегетации (из replaceNote → potHarvestMonths). */
    function multicutHorizon(cv){
      cv = cv || deps.getActiveCv();
      var state = st();
      var interval = Math.max(5, effectiveCutInterval());
      var firstCutCh;
      var maxCh;
      if (deps.isPalletView()){
        firstCutCh = Math.max(1, state.day);
        maxCh = Math.max(90, state.day + interval * 6);
      } else if (deps.isVfSheetCv(cv)){
        firstCutCh = deps.vfEffectiveDay(cv);
        maxCh = Math.max(90, state.day + interval * 6);
      } else if (deps.georgyPlannedCuts && deps.georgyPlannedCuts(cv)){
        var planned = deps.georgyPlannedCuts(cv);
        firstCutCh = planned.firstCutCh;
        maxCh = Math.max(30, deps.boltChannel(cv) - 2);
      } else {
        firstCutCh = Math.max(1, Math.round(deps.harvestChannel(cv)));
        maxCh = Math.max(30, deps.boltChannel(cv) - 2);
      }
      if (cv.potHarvestMonths > 0){
        maxCh = Math.max(maxCh, firstCutCh + cv.potHarvestMonths * HARVEST_MONTH_DAYS);
      }
      var maxCuts = 48;
      if (cv.potHarvestMonths > 0){
        maxCuts = Math.min(96, Math.ceil((maxCh - firstCutCh) / interval) + 2);
      } else if (!deps.isVF() && !deps.isPalletView() && state.multicut){
        maxCuts = state.ghCutCount || 24;
      }
      return { firstCutCh: firstCutCh, maxCh: maxCh, interval: interval, maxCuts: maxCuts };
    }

    function vfMulticutStats(cv){
      cv = cv || deps.getActiveCv();
      var hz = multicutHorizon(cv);
      var interval = hz.interval;
      var cutsPerMonth = HARVEST_MONTH_DAYS / interval;
      var cutsInCycle = 0;
      var i;
      for (i = 0; i < hz.maxCuts; i++){
        var cutCh = hz.firstCutCh + i * interval;
        if (cutCh > hz.maxCh) break;
        if (deps.totalAge(cutCh) > deps.envBolt(cv)) break;
        cutsInCycle++;
      }
      cutsInCycle = Math.max(1, cutsInCycle);
      var monthsToReplace = cv.potHarvestMonths > 0
        ? cv.potHarvestMonths
        : hz.maxCh / HARVEST_MONTH_DAYS;
      return {
        cutsPerMonth: cutsPerMonth,
        cutsInCycle: cutsInCycle,
        monthsToReplace: monthsToReplace,
        interval: interval,
        potHarvestMonths: cv.potHarvestMonths || 0,
        replaceNote: cv.replaceNote || ''
      };
    }

  /** Сумма срезок за жизнь растения — метрики и UI; для режима Георгия (беби) — норматив без bolt. */
    function getMulticutYieldPerPlant(cv){
      var state = st();
      if (!state.multicut || !supportsMulticut(cv)) return null;
      var planned = deps.georgyPlannedCuts ? deps.georgyPlannedCuts(cv) : null;
      var interval = Math.max(5, effectiveCutInterval());
      var ghPlanned = !deps.isVF() && !deps.isPalletView() && state.multicut;
      var total = 0;
      var unit = 'г';
      var i;
      if (planned){
        for (i = 0; i < planned.maxCuts; i++){
          var cm = cutMassPerPlant(cv, i);
          unit = cm.unit;
          total += cm.val;
        }
        return total > 0 ? { total: total, unit: unit } : null;
      }
      var hz = multicutHorizon(cv);
      var firstCutCh = hz.firstCutCh;
      var maxCh = hz.maxCh;
      var maxCuts = ghPlanned ? state.ghCutCount : hz.maxCuts;
      for (i = 0; i < maxCuts; i++){
        var cutCh = firstCutCh + i * interval;
        if (cutCh < 1 || cutCh > maxCh) break;
        if (deps.totalAge(cutCh) > deps.envBolt(cv)) break;
        var cm2 = cutMassPerPlant(cv, ghPlanned ? i : null);
        unit = cm2.unit;
        total += cm2.val;
      }
      return total > 0 ? { total: total, unit: unit } : null;
    }

    return {
      HARVEST_MONTH_DAYS: HARVEST_MONTH_DAYS,
      CUT_INTERVAL_SLACK: CUT_INTERVAL_SLACK,
      parseNumsFromStr: parseNumsFromStr,
      vfCutIntervalFromCv: vfCutIntervalFromCv,
      cutIntervalRange: cutIntervalRange,
      cutIntervalMods: cutIntervalMods,
      applyCutIntervalHarvestMods: applyCutIntervalHarvestMods,
      supportsMulticut: supportsMulticut,
      effectiveCutInterval: effectiveCutInterval,
      cutMassPerPlant: cutMassPerPlant,
      cutMassForMonthlyYield: cutMassForMonthlyYield,
      multicutHorizon: multicutHorizon,
      vfMulticutStats: vfMulticutStats,
      getMulticutYieldPerPlant: getMulticutYieldPerPlant
    };
  }

  global.DG_createCutModel = createCutModel;
})(typeof window !== 'undefined' ? window : this);
