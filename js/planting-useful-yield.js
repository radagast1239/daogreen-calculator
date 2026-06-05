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

    /** Теплица · каналы (не VF, не поддоны). */
    function isGreenhouseChannels() {
      if (deps.isPalletView && deps.isPalletView()) return false;
      if (deps.isVF && deps.isVF()) return false;
      return st().facility === 'greenhouse';
    }

    /** Кочанный салат: один срез, оборот по дням в канале (многосрезка не переключает учёт). */
    function isHeadHallSingleCut(cv, state, gm) {
      if (!gm || !cv || gm.getGeorgyProfile(cv)) return false;
      if (gm.isHeadLettuceChannel) return gm.isHeadLettuceChannel(cv);
      if (cv.multicut || cv.babyGreen) return false;
      if (!gm.canUseCanopyDensityPick || !gm.canUseCanopyDensityPick(cv)) return false;
      return !!state.georgyMode;
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
      var headHallYield = gm && cv && state.georgyDensityFitted && state.georgyTargetDensity > 0 &&
        (
          (state.georgyMode && gm.isHeadLettuceChannel && gm.isHeadLettuceChannel(cv)) ||
          (!state.georgyMode && isGreenhouseChannels() && gm.isHeadLettuceChannel && gm.isHeadLettuceChannel(cv))
        );
      if (headHallYield) {
        meta.mainHallIntervalDays = gm.headMainChannelDays
          ? gm.headMainChannelDays()
          : Math.max(1, Math.round(state.day));
        meta.harvestCyclesPerMonth = meta.mainHallIntervalDays > 0
          ? HMD / meta.mainHallIntervalDays
          : 0;
        meta.usefulAreaBasis = 'main_hall';
        return meta;
      }
      var palletPiecesMonthly =
        deps.isPalletView &&
        deps.isPalletView() &&
        cv &&
        cv.countUnit === 'шт' &&
        cv.cutInterval > 0;
      if (palletPiecesMonthly) {
        var ivPal = deps.effectiveCutInterval
          ? deps.effectiveCutInterval()
          : state.cutInterval;
        meta.mainHallIntervalDays = Math.max(1, Math.round(ivPal || cv.cutInterval));
        meta.harvestCyclesPerMonth = HMD / meta.mainHallIntervalDays;
        meta.usefulAreaBasis = 'main_hall';
        if (state.multicut && deps.supportsMulticut && deps.supportsMulticut(cv)) {
          meta.multicutMode = true;
        }
        return meta;
      }
      if (
        state.multicut && deps.supportsMulticut && deps.supportsMulticut(cv) &&
        !(gm && isHeadHallSingleCut(cv, state, gm))
      ) {
        meta.multicutMode = true;
        var iv = deps.effectiveCutInterval
          ? deps.effectiveCutInterval()
          : state.cutInterval;
        meta.mainHallIntervalDays = Math.max(1, Math.round(iv || 12));
        meta.harvestCyclesPerMonth = HMD / meta.mainHallIntervalDays;
        meta.usefulAreaBasis = 'main_hall';
        return meta;
      }
      if (gm && isHeadHallSingleCut(cv, state, gm)) {
        meta.mainHallIntervalDays = Math.max(1, Math.round(state.day));
        meta.harvestCyclesPerMonth = HMD / meta.mainHallIntervalDays;
        meta.usefulAreaBasis = 'main_hall';
        return meta;
      }
      /* Теплица · каналы: головной салат — оборот по каналу только после подбора плотности; беби — по интервалу срезок. */
      if (isGreenhouseChannels() && !state.georgyMode && gm) {
        var chProf = gm.getGeorgyProfile(cv);
        if (state.multicut && chProf && deps.supportsMulticut && deps.supportsMulticut(cv)) {
          var ivCh = deps.effectiveCutInterval ? deps.effectiveCutInterval() : state.cutInterval;
          meta.mainHallIntervalDays = Math.max(1, Math.round(ivCh || cv.cutInterval || 12));
          meta.harvestCyclesPerMonth = HMD / meta.mainHallIntervalDays;
          meta.usefulAreaBasis = 'main_hall';
          meta.multicutMode = true;
          return meta;
        }
        if (gm.isHeadLettuceChannel && gm.isHeadLettuceChannel(cv)) {
          if (state.georgyDensityFitted && state.georgyTargetDensity > 0) {
            meta.mainHallIntervalDays = Math.max(1, Math.round(state.day));
            meta.harvestCyclesPerMonth = HMD / meta.mainHallIntervalDays;
            meta.usefulAreaBasis = 'main_hall';
            return meta;
          }
          return meta;
        }
        if (!chProf) {
          meta.mainHallIntervalDays = Math.max(1, Math.round(state.day));
          meta.harvestCyclesPerMonth = HMD / meta.mainHallIntervalDays;
          meta.usefulAreaBasis = 'main_hall';
          return meta;
        }
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
      var yieldPerSqmCycle =
        ctx.yieldPerSqmCycle != null
          ? ctx.yieldPerSqmCycle
          : global.DG_yieldPerSqmCycleFromMass
            ? global.DG_yieldPerSqmCycleFromMass(cv, mass, rhoA)
            : (cv && cv.countUnit === 'шт' ? mass * rhoA : (mass * rhoA) / 1000);
      var out = {
        mainHallIntervalDays: meta.mainHallIntervalDays,
        harvestCyclesPerMonth: meta.harvestCyclesPerMonth,
        usefulAreaBasis: meta.usefulAreaBasis
      };
      var piecesMonthly =
        cv &&
        cv.countUnit === 'шт' &&
        meta.harvestCyclesPerMonth > 0 &&
        deps.cutMassForMonthlyYield;
      if ((meta.multicutMode || piecesMonthly) && deps.cutMassForMonthlyYield) {
        var cm = deps.cutMassForMonthlyYield(cv);
        var ypm = cm.val * meta.harvestCyclesPerMonth;
        var piecesMc = cm.unit === 'шт' || cv.countUnit === 'шт';
        out.harvestYieldPerCut = cm.val;
        out.cyclesPerYear =
          meta.mainHallIntervalDays > 0 ? 365 / meta.mainHallIntervalDays : 0;
        if (piecesMc) {
          out.yieldPerSqmMonthPcs = ypm * rhoA;
          out.yieldPerSqmYear = out.yieldPerSqmMonthPcs * 12;
        } else {
          out.yieldPerSqmMonthKg = (ypm / 1000) * rhoA;
          out.yieldPerSqmYear = out.yieldPerSqmMonthKg * 12;
        }
        return out;
      }
      if (meta.usefulAreaBasis === 'main_hall' && meta.mainHallIntervalDays > 0) {
        var cpm = meta.harvestCyclesPerMonth;
        out.cyclesPerYear = 365 / meta.mainHallIntervalDays;
        out.yieldPerSqmYear = yieldPerSqmCycle * out.cyclesPerYear;
        out.harvestYieldPerCut = mass;
        out.harvestCutIntervalDays = meta.mainHallIntervalDays;
        out.harvestCutsPerMonth = cpm;
        if (cpm > 0 && mass > 0) {
          out.yieldPerPotMonth = mass * cpm;
          if (rhoA > 0) {
            if (cv && cv.countUnit === 'шт') {
              out.yieldPerSqmMonthPcs = mass * cpm * rhoA;
            } else {
              out.yieldPerSqmMonthKg = (mass * cpm * rhoA) / 1000;
            }
          }
        }
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
      isHeadHallSingleCut: isHeadHallSingleCut,
      resolveMeta: resolveMeta,
      applyToCalcResult: applyToCalcResult
    };
  }

  global.DG_createPlantingUsefulYield = createPlantingUsefulYield;
})(typeof window !== 'undefined' ? window : globalThis);
