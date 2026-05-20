/**
 * Урожай с полезной площади: только основное отделение (канал/поддон/VF-ярус).
 * Многосрезка: интервал + масса срезки. Однократный срез: дни в канале (без рассады).
 */
(function (global) {
  'use strict';

  function createPlantingUsefulYield(deps) {
    var HMD = deps.HARVEST_MONTH_DAYS || 30.5;

    function st() {
      return deps.getState();
    }

    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }

    /** Каналы, поддоны, VF — блок «урожай с полезной площади». */
    function isUsefulAreaFacility() {
      if (deps.isPalletView && deps.isPalletView()) return true;
      if (deps.isVF && deps.isVF()) return true;
      var s = st();
      return s.facility === 'greenhouse';
    }

    function resolveMeta(cv, r) {
      cv = cv || (deps.getCv ? deps.getCv() : null);
      r = r || {};
      var state = st();
      var meta = {
        usefulAreaBasis: 'full_cycle',
        mainHallIntervalDays: 0,
        harvestCyclesPerMonth: 0,
        multicutMode: false
      };
      var gm = georgyModeRef();
      if (gm && gm.isGeorgyHeadSalad && gm.isGeorgyHeadSalad(cv)) {
        meta.mainHallIntervalDays = gm.mainHarvestIntervalDays();
        meta.harvestCyclesPerMonth = gm.headHarvestCyclesPerMonth();
        meta.usefulAreaBasis = 'main_hall';
        return meta;
      }
      if (state.multicut && deps.supportsMulticut && deps.supportsMulticut(cv)) {
        meta.multicutMode = true;
        var iv = deps.effectiveCutInterval
          ? deps.effectiveCutInterval()
          : state.cutInterval;
        meta.mainHallIntervalDays = Math.max(1, Math.round(iv || 12));
        meta.harvestCyclesPerMonth = HMD / meta.mainHallIntervalDays;
        meta.usefulAreaBasis = 'main_hall';
        return meta;
      }
      var pre = deps.preChannelDays ? deps.preChannelDays() : 0;
      if (isUsefulAreaFacility() && pre > 0) {
        meta.mainHallIntervalDays = Math.max(1, Math.round(state.day));
        meta.harvestCyclesPerMonth = HMD / meta.mainHallIntervalDays;
        meta.usefulAreaBasis = 'main_hall';
        return meta;
      }
      var tcd = r.totalCycleDays > 0 ? r.totalCycleDays : 0;
      if (tcd > 0) meta.harvestCyclesPerMonth = HMD / tcd;
      return meta;
    }

    /** Дополняет результат calc() полями оборота основного отделения. */
    function applyToCalcResult(cv, r, ctx) {
      ctx = ctx || {};
      var meta = resolveMeta(cv, r);
      var mass = ctx.mass != null ? ctx.mass : r.mass;
      var rhoA = ctx.rhoA != null ? ctx.rhoA : r.rhoA;
      var yieldPerSqmCycle = ctx.yieldPerSqmCycle != null
        ? ctx.yieldPerSqmCycle
        : (mass * rhoA) / 1000;
      var out = {
        mainHallIntervalDays: meta.mainHallIntervalDays,
        harvestCyclesPerMonth: meta.harvestCyclesPerMonth,
        usefulAreaBasis: meta.usefulAreaBasis
      };
      if (meta.multicutMode && deps.cutMassForMonthlyYield) {
        var cm = deps.cutMassForMonthlyYield(cv);
        var ypm = cm.val * meta.harvestCyclesPerMonth;
        out.harvestYieldPerCut = cm.val;
        out.yieldPerSqmMonthKg = (ypm / 1000) * rhoA;
        out.cyclesPerYear = meta.mainHallIntervalDays > 0 ? 365 / meta.mainHallIntervalDays : 0;
        out.yieldPerSqmYear = out.yieldPerSqmMonthKg * 12;
        return out;
      }
      if (meta.usefulAreaBasis === 'main_hall' && meta.mainHallIntervalDays > 0) {
        out.cyclesPerYear = 365 / meta.mainHallIntervalDays;
        out.yieldPerSqmYear = yieldPerSqmCycle * out.cyclesPerYear;
        return out;
      }
      var tcd = r.totalCycleDays > 0 ? r.totalCycleDays : 0;
      out.cyclesPerYear = tcd > 0 ? 365 / tcd : 0;
      out.yieldPerSqmYear = yieldPerSqmCycle * out.cyclesPerYear;
      out.mainHallIntervalDays = 0;
      return out;
    }

    return {
      HARVEST_MONTH_DAYS: HMD,
      isUsefulAreaFacility: isUsefulAreaFacility,
      resolveMeta: resolveMeta,
      applyToCalcResult: applyToCalcResult
    };
  }

  global.DG_createPlantingUsefulYield = createPlantingUsefulYield;
})(typeof window !== 'undefined' ? window : globalThis);
