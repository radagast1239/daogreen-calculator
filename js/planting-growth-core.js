/**
 * Модуляция среды и логистическая модель роста (обёртка growth-light-model).
 * DG_createPlantingGrowthCore(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  function createPlantingGrowthCore(deps) {
    function st() {
      return deps.getState();
    }

    function glm() {
      return deps.getGLM ? deps.getGLM() : global.DG_growthLightModel || null;
    }

    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }

    function lightGrowthOpts() {
      var state = st();
      return {
        lighting: !!(state.lighting && !deps.isVF() && !deps.isPalletView()),
        month: state.month,
        natPh: deps.photoperiod(),
        effPh: deps.effectivePhotoperiod(),
        eveningH: deps.eveningHours()
      };
    }

    function dliFactor() {
      var GLM = glm();
      if (GLM) return GLM.dliResponseFactor(deps.effectiveDLI());
      return deps.clamp(deps.effectiveDLI() / 17, 0.4, 1.3);
    }

    function photoperiodFactor() {
      var GLM = glm();
      if (GLM) return GLM.photoperiodExtensionFactor(lightGrowthOpts());
      return 1;
    }

    function tempFactor(cv) {
      var GLM = glm();
      var state = st();
      cv = cv || deps.getCv();
      if (GLM) return GLM.tempResponseFactor(state.temp, cv);
      var t_opt = cv.t_opt || 20;
      var d = state.temp - t_opt;
      return deps.clamp(Math.exp((-d * d) / (2 * cv.heatSigma)), 0.15, 1.0);
    }

    function greenhouseHeatYieldFactor(temp) {
      var GLM = glm();
      var state = st();
      temp = temp != null ? temp : state.temp;
      if (GLM && GLM.heatYieldFactor) return GLM.heatYieldFactor(temp, {});
      var t0 = 26;
      var t1 = 30;
      var lossMax = 0.2;
      var span = 8;
      var tStressEnd = Math.max(34, t1 + span);
      var fMin = 0.15;
      function sm(u){ u = deps.clamp(u, 0, 1); return u * u * (3 - 2 * u); }
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

    function greenhouseHeatYieldLossPct(temp) {
      var GLM = glm();
      if (GLM && GLM.heatYieldLossPct) return GLM.heatYieldLossPct(temp, {});
      return Math.round((1 - greenhouseHeatYieldFactor(temp)) * 100);
    }

    function isChannelGreenhouse() {
      var state = st();
      return state.facility === 'greenhouse' && !deps.isVF() && !deps.isPalletView();
    }

    function isControlledEnv() {
      return deps.isVF() || deps.isPalletView();
    }

    function isPlantingYieldView() {
      return isChannelGreenhouse() || deps.isPalletView() || deps.isVF();
    }

    function isGreenhousePlanting() {
      return isPlantingYieldView();
    }

    function vfEnvGrowthFactor() {
      var GLM = glm();
      var state = st();
      if (!GLM || !GLM.vfTempResponseFactor) return 1;
      return GLM.vfTempResponseFactor(state.temp) *
        (GLM.vfRhGrowthFactor ? GLM.vfRhGrowthFactor(state.rh) : 1);
    }

    function effectiveTempFactor(cv) {
      cv = cv || deps.getCv();
      if (deps.isVF && deps.isVF()) return vfEnvGrowthFactor();
      var state = st();
      var georgyMode = georgyModeRef();
      if (georgyMode) {
        var profile = georgyMode.getGeorgyProfile(cv);
        if (profile && (georgyMode.isGeorgyGh() || isChannelGreenhouse())) {
          return georgyMode.georgyYieldFactor(profile, state.temp);
        }
      }
      return tempFactor(cv);
    }

    function boltShift(cv) {
      var state = st();
      var t_opt = cv.t_opt || 20;
      return cv.heatBolt * Math.max(0, state.temp - (t_opt + 3));
    }

    function envK(cv) {
      return cv.k * dliFactor() * effectiveTempFactor(cv);
    }

    function envBolt(cv) {
      return cv.bolt - boltShift(cv);
    }

    function envMultiplier(cv) {
      return dliFactor() * photoperiodFactor() * effectiveTempFactor(cv);
    }

    function crowdingFactor(canopyAtMax, nearestDist) {
      var overlap = canopyAtMax - nearestDist;
      if (overlap <= 0) return 1.0;
      var rel = overlap / canopyAtMax;
      return deps.clamp(1 - 0.65 * rel, 0.65, 1.0);
    }

    function effectiveCa(cv) {
      var GLM = glm();
      var state = st();
      if (GLM) return GLM.canopyCoeff(cv, state.temp);
      var t_opt = cv.t_opt || 20;
      var excess = Math.max(0, state.temp - t_opt - 3);
      return cv.ca * (1 + 0.012 * excess);
    }

    function totalAge(channelDay) {
      return deps.preChannelDays() + channelDay;
    }

    function massAtTotal(cv, t) {
      var GLM = glm();
      var m = GLM
        ? GLM.logisticMass(cv, t, envK(cv))
        : cv.M_max / (1 + Math.exp(-envK(cv) * (t - cv.t50)));
      if (!deps.isVF() && !deps.isPalletView()) {
        m *= photoperiodFactor();
        if (m > cv.M_max) m = cv.M_max;
      }
      return m;
    }

    function canopyAtTotal(cv, t) {
      var GLM = glm();
      if (GLM && GLM.canopyFromMass) {
        return GLM.canopyFromMass(cv, massAtTotal(cv, t), st().temp);
      }
      return effectiveCa(cv) * Math.sqrt(massAtTotal(cv, t));
    }

    function rgrAtTotal(cv, t) {
      return envK(cv) * (1 - massAtTotal(cv, t) / cv.M_max);
    }

    function harvestTotal(cv) {
      return cv.t50 + 1.4 / envK(cv);
    }

    function harvestChannel(cv) {
      return harvestTotal(cv) - deps.preChannelDays();
    }

    return {
      lightGrowthOpts: lightGrowthOpts,
      dliFactor: dliFactor,
      photoperiodFactor: photoperiodFactor,
      tempFactor: tempFactor,
      greenhouseHeatYieldFactor: greenhouseHeatYieldFactor,
      greenhouseHeatYieldLossPct: greenhouseHeatYieldLossPct,
      isChannelGreenhouse: isChannelGreenhouse,
      isControlledEnv: isControlledEnv,
      isPlantingYieldView: isPlantingYieldView,
      isGreenhousePlanting: isGreenhousePlanting,
      effectiveTempFactor: effectiveTempFactor,
      boltShift: boltShift,
      envK: envK,
      envBolt: envBolt,
      envMultiplier: envMultiplier,
      crowdingFactor: crowdingFactor,
      effectiveCa: effectiveCa,
      totalAge: totalAge,
      massAtTotal: massAtTotal,
      canopyAtTotal: canopyAtTotal,
      rgrAtTotal: rgrAtTotal,
      harvestTotal: harvestTotal,
      harvestChannel: harvestChannel
    };
  }

  global.DG_createPlantingGrowthCore = createPlantingGrowthCore;
})(typeof window !== 'undefined' ? window : globalThis);
