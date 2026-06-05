/**
 * Теплица: полезная площадь, урожайность с площади, синхронизация полей.
 * DG_createPlantingGhYield(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  function createPlantingGhYield(deps) {
    function st() {
      return deps.getState();
    }
    function $(id) {
      return deps.$(id);
    }
    function ui(k, vars) {
      return deps.ui(k, vars);
    }
    function r1(n) {
      return deps.r1(n);
    }
    function r2(n) {
      return deps.r2(n);
    }
    function clamp(v, lo, hi) {
      return deps.clamp(v, lo, hi);
    }
    function getCv() {
      return deps.getCv();
    }
    function isVF() {
      return deps.isVF();
    }
    function isPalletView() {
      return deps.isPalletView();
    }
    function isGreenhousePlanting() {
      return deps.isGreenhousePlanting();
    }
    function isChannelGreenhouse() {
      return deps.isChannelGreenhouse();
    }
    function supportsMulticut(cv) {
      return deps.supportsMulticut(cv);
    }
    function plantingHarvestYieldParams(cv, r) {
      return deps.plantingHarvestYieldParams(cv, r);
    }
    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }

    var HMD = deps.HARVEST_MONTH_DAYS || 30.5;

    function isHeadHallSingleCut(cv, state, gm) {
      if (!gm || !cv || gm.getGeorgyProfile(cv)) return false;
      if (!gm.canUseCanopyDensityPick || !gm.canUseCanopyDensityPick(cv)) return false;
      if (state.georgyMode) return true;
      return isChannelGreenhouse() && !state.georgyMode;
    }

    function syncYieldTurnoverHint(r) {
      var ghEl = $('gh-yield-turnover-hint');
      var cycleEl = $('cycle-yield-turnover-hint');
      var state = st();
      var cv = (r && r.cv) || getCv();
      var gm = georgyModeRef();

      function hideEl(el) {
        if (!el) return;
        el.classList.add('env-block-hidden');
        el.innerHTML = '';
      }

      if (gm && gm.isGeorgyGh && gm.isGeorgyGh()) {
        hideEl(ghEl);
        hideEl(cycleEl);
        return;
      }

      var headSingle = gm && isHeadHallSingleCut(cv, state, gm);
      var mcOn = !!(state.multicut && supportsMulticut(cv) && !headSingle);
      var channelDays = r && r.mainHallIntervalDays > 0
        ? Math.max(1, Math.round(r.mainHallIntervalDays))
        : Math.max(1, Math.round(state.day));
      var interval = mcOn
        ? (r && r.mainHallIntervalDays > 0
          ? Math.max(1, Math.round(r.mainHallIntervalDays))
          : Math.max(1, Math.round(state.cutInterval || 12)))
        : channelDays;
      var cutsMo = r && r.harvestCyclesPerMonth > 0
        ? r1(r.harvestCyclesPerMonth)
        : r1(HMD / (mcOn ? interval : channelDays));

      var showGh = isGreenhousePlanting() && !isPalletView();
      var showCycle = (isChannelGreenhouse() || isVF()) && !isPalletView();

      if (showGh && ghEl) {
        if (mcOn) {
          ghEl.classList.remove('env-block-hidden');
          ghEl.innerHTML = ui('gh.yield.turnoverMulticut', { interval: interval, cutsMo: cutsMo });
        } else if (headSingle || (r && r.usefulAreaBasis === 'main_hall' && channelDays > 0)) {
          ghEl.classList.remove('env-block-hidden');
          ghEl.innerHTML = ui('gh.yield.turnoverChannel', { days: channelDays, cutsMo: cutsMo });
          if (state.multicut && supportsMulticut(cv)) {
            ghEl.innerHTML += ' <span class="yield-turnover-sub">' +
              ui('gh.yield.turnoverHeadIgnoreMulticut') + '</span>';
          }
        } else {
          hideEl(ghEl);
        }
      } else {
        hideEl(ghEl);
      }

      if (showCycle && cycleEl) {
        if (mcOn) {
          cycleEl.classList.remove('env-block-hidden');
          cycleEl.innerHTML = ui('cycle.yield.turnoverMulticut', { interval: interval, cutsMo: cutsMo });
        } else if (channelDays > 0) {
          cycleEl.classList.remove('env-block-hidden');
          cycleEl.innerHTML = ui('cycle.yield.turnoverChannel', { days: channelDays, cutsMo: cutsMo });
          if (headSingle && state.multicut) {
            cycleEl.innerHTML += ' <span class="yield-turnover-sub">' +
              ui('gh.yield.turnoverHeadIgnoreMulticut') + '</span>';
          }
        } else {
          hideEl(cycleEl);
        }
      } else {
        hideEl(cycleEl);
      }
    }

    const GH_USEFUL_AREA_KEY = 'calc-gh-useful-area-m2';

    function loadGhUsefulArea() {
      try {
        var raw = localStorage.getItem(GH_USEFUL_AREA_KEY);
        if (raw != null) {
          var v = parseFloat(raw);
          if (v > 0) st().ghUsefulArea = Math.round(v * 10) / 10;
        } else if (!(parseFloat(st().ghUsefulArea) > 0)) {
          st().ghUsefulArea = 24;
        }
      } catch (_) {
        if (!(parseFloat(st().ghUsefulArea) > 0)) st().ghUsefulArea = 24;
      }
    }

    function saveGhUsefulArea() {
      try {
        if (st().ghUsefulArea > 0) localStorage.setItem(GH_USEFUL_AREA_KEY, String(st().ghUsefulArea));
        else localStorage.removeItem(GH_USEFUL_AREA_KEY);
      } catch (_) {}
    }

    function getGhUsefulAreaM2() {
      var a = parseFloat(st().ghUsefulArea);
      if (a > 0) return Math.round(a * 10) / 10;
      return null;
    }

    function ghYieldWithMargin(base, digits) {
      var pct = st().errorPct / 100;
      var fmt = digits === 2 ? r2 : r1;
      if (!(base > 0)) return '—';
      return fmt(base * (1 - pct)) + '–' + fmt(base * (1 + pct));
    }

    function ghYieldKgSqmYear(rc, cv) {
      if (!rc || !cv) return 0;
      var hy = plantingHarvestYieldParams ? plantingHarvestYieldParams(cv, rc) : null;
      if (hy && hy.yieldPerSqmMonthKg > 0) return hy.yieldPerSqmMonthKg * 12;
      if (hy && hy.yieldPerSqmMonthPcs > 0) return hy.yieldPerSqmMonthPcs * 12;
      return rc.yieldPerSqmYear || 0;
    }

    function computeGhYieldTotals(r) {
      var area = getGhUsefulAreaM2();
      if (!(area > 0)) return { hasArea: false };
      var cv = r.cv || getCv();
      var hy = plantingHarvestYieldParams ? plantingHarvestYieldParams(cv, r) : null;
      if (hy && (hy.yieldPerSqmMonthKg > 0 || hy.yieldPerSqmMonthPcs > 0)) {
        var kgMonth = (hy.yieldPerSqmMonthKg || 0) * area;
        var pcsMonth = (hy.yieldPerSqmMonthPcs || 0) * area;
        return {
          hasArea: true,
          area: area,
          unitIsPieces: !!hy.unitIsPieces,
          kgMonth: kgMonth,
          kgYear: kgMonth * 12,
          pcsMonth: pcsMonth,
          pcsYear: pcsMonth * 12,
          mainHallOnly: r.mainHallIntervalDays > 0
        };
      }
      var areaYear = (r.yieldPerSqmYear || 0) * area;
      if (cv.countUnit === 'шт') {
        return {
          hasArea: true,
          area: area,
          unitIsPieces: true,
          kgMonth: 0,
          kgYear: 0,
          pcsMonth: areaYear / 12,
          pcsYear: areaYear,
          mainHallOnly: false
        };
      }
      return {
        hasArea: true,
        area: area,
        unitIsPieces: false,
        kgMonth: areaYear / 12,
        kgYear: areaYear,
        pcsMonth: 0,
        pcsYear: 0,
        mainHallOnly: false
      };
    }

    function syncGhYieldMarginSliders() {
      var ep = Number(st().errorPct);
      if (!Number.isFinite(ep)) ep = 12;
      var v = clamp(Math.round(ep), 0, 20);
      st().errorPct = v;
      ['errorPct', 'errorPctGh', 'compareErrorPct', 'ghYieldFarmErrorPct'].forEach(function (id) {
        var el = $(id);
        if (el && document.activeElement !== el && parseInt(el.value, 10) !== v) el.value = v;
      });
      ['errorPct-v', 'errorPctGh-v', 'compareErrorPct-v', 'ghYieldFarmErrorPct-v'].forEach(function (id) {
        var el = $(id);
        if (el) el.textContent = v;
      });
    }

    function syncBioMarginVisibility() {
      var hide = !isVF() && !isPalletView();
      document.querySelectorAll('.bio-margin-ctrl').forEach(function (el) {
        el.classList.toggle('env-block-hidden', hide);
      });
      var hint = $('bio-margin-hint');
      if (hint) {
        hint.classList.toggle('env-block-hidden', hide);
        if (!hide) {
          var hintKey =
            isPalletView() || isVF() ? 'ui.bio.hintFarm' : 'ui.bio.hint';
          hint.setAttribute('data-i18n', hintKey);
          hint.textContent = ui(hintKey);
        }
      }
    }

    function bindGhYieldI18n(el, key) {
      if (!el || !key) return;
      el.setAttribute('data-i18n', key);
      el.textContent = ui(key);
    }

    function updateGhYieldPanelCopy(r) {
      var title = $('gh-yield-section-title');
      var intro = $('gh-yield-intro');
      var btn = $('gh-useful-area-from-geom');
      var areaLbl = document.querySelector('label[for="gh-useful-area"]');
      var cmpIntro = $('gh-yield-compare-intro');
      if (isPalletView()) {
        var palCv = (r && r.cv) || getCv();
        bindGhYieldI18n(title, 'gh.yield.titlePallet');
        bindGhYieldI18n(
          intro,
          palCv && palCv.countUnit === 'шт' ? 'gh.yield.introPalletPcs' : 'gh.yield.introPallet'
        );
        bindGhYieldI18n(btn, 'gh.yield.fromGeomPallet');
        bindGhYieldI18n(areaLbl, 'gh.yield.areaLabelFarm');
      } else if (isVF()) {
        bindGhYieldI18n(title, 'gh.yield.titleVf');
        bindGhYieldI18n(intro, 'gh.yield.introVf');
        bindGhYieldI18n(btn, 'gh.yield.fromGeomVf');
        bindGhYieldI18n(areaLbl, 'gh.yield.areaLabel');
      } else {
        var cvGh = (r && r.cv) || getCv();
        var gmGh = georgyModeRef();
        var introKey = 'gh.yield.intro';
        if (
          isChannelGreenhouse() && r && r.usefulAreaBasis === 'main_hall' &&
          r.mainHallIntervalDays > 0 &&
          !(st().multicut && supportsMulticut(cvGh) && !(gmGh && isHeadHallSingleCut(cvGh, st(), gmGh)))
        ){
          introKey = 'gh.yield.introChannel';
        }
        bindGhYieldI18n(title, 'gh.yield.title');
        bindGhYieldI18n(intro, introKey);
        bindGhYieldI18n(btn, 'gh.yield.fromGeom');
        bindGhYieldI18n(areaLbl, 'gh.yield.areaLabel');
      }
      if (cmpIntro) {
        var cmpKey = isChannelGreenhouse()
          ? 'gh.yield.compareIntroCanopy'
          : isPalletView()
            ? 'gh.yield.compareIntroPallet'
            : isVF()
              ? 'gh.yield.compareIntroVf'
              : 'gh.yield.compareIntroGeneral';
        bindGhYieldI18n(cmpIntro, cmpKey);
      }
      var hint = $('gh-useful-area-geom-hint');
      if (hint && r && r.sysArea > 0) {
        hint.textContent = isPalletView()
          ? ui('gh.yield.geomHintPallet', { area: r1(r.sysArea) })
          : isVF()
            ? ui('gh.yield.geomHintVf', { area: r1(r.sysArea) })
            : ui('gh.yield.geomHint', { area: r1(r.sysArea) });
      }
    }

    function syncGhYieldControls(r) {
      syncGhYieldMarginSliders();
      syncBioMarginVisibility();
      updateGhYieldPanelCopy(r);
      syncYieldTurnoverHint(r);
      var inp = $('gh-useful-area');
      if (inp && document.activeElement !== inp) {
        var a = st().ghUsefulArea;
        inp.value = a > 0 ? String(a) : '';
      }
      var hint = $('gh-useful-area-geom-hint');
      if (hint && !(r && r.sysArea > 0)) hint.textContent = '';
    }

    return {
      loadGhUsefulArea: loadGhUsefulArea,
      saveGhUsefulArea: saveGhUsefulArea,
      getGhUsefulAreaM2: getGhUsefulAreaM2,
      ghYieldWithMargin: ghYieldWithMargin,
      ghYieldKgSqmYear: ghYieldKgSqmYear,
      computeGhYieldTotals: computeGhYieldTotals,
      syncGhYieldMarginSliders: syncGhYieldMarginSliders,
      syncBioMarginVisibility: syncBioMarginVisibility,
      updateGhYieldPanelCopy: updateGhYieldPanelCopy,
      syncGhYieldControls: syncGhYieldControls,
      syncYieldTurnoverHint: syncYieldTurnoverHint
    };
  }

  global.DG_createPlantingGhYield = createPlantingGhYield;
})(typeof window !== 'undefined' ? window : globalThis);
