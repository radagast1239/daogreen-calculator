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
      var hy =
        st().multicut && supportsMulticut(cv) && deps.plantingHarvestYieldParams
          ? plantingHarvestYieldParams(cv, rc)
          : null;
      if (hy && hy.multicutHarvest && hy.yieldPerSqmMonthKg > 0) {
        return hy.yieldPerSqmMonthKg * 12;
      }
      return rc.yieldPerSqmYear || 0;
    }

    function computeGhYieldTotals(r) {
      var area = getGhUsefulAreaM2();
      if (!(area > 0)) return { hasArea: false };
      var cv = r.cv || getCv();
      var hy = st().multicut && supportsMulticut(cv) ? plantingHarvestYieldParams(cv, r) : null;
      if (hy && hy.multicutHarvest) {
        var kgMonth = (hy.yieldPerSqmMonthKg || 0) * area;
        var pcsMonth = (hy.yieldPerSqmMonthPcs || 0) * area;
        return {
          hasArea: true,
          area: area,
          unitIsPieces: !!hy.unitIsPieces,
          kgMonth: kgMonth,
          kgYear: kgMonth * 12,
          pcsMonth: pcsMonth,
          pcsYear: pcsMonth * 12
        };
      }
      var kgYear = (r.yieldPerSqmYear || 0) * area;
      return {
        hasArea: true,
        area: area,
        unitIsPieces: cv.countUnit === 'шт',
        kgMonth: kgYear / 12,
        kgYear: kgYear,
        pcsMonth: 0,
        pcsYear: 0
      };
    }

    function syncGhYieldMarginSliders() {
      var v = clamp(Math.round(st().errorPct) || 12, 1, 20);
      st().errorPct = v;
      ['errorPct', 'errorPctGh', 'compareErrorPct'].forEach(function (id) {
        var el = $(id);
        if (el && document.activeElement !== el && parseInt(el.value, 10) !== v) el.value = v;
      });
      ['errorPct-v', 'errorPctGh-v', 'compareErrorPct-v'].forEach(function (id) {
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
      if (hint) hint.classList.toggle('env-block-hidden', hide);
    }

    function updateGhYieldPanelCopy(r) {
      var title = $('gh-yield-section-title');
      var intro = $('gh-yield-intro');
      var btn = $('gh-useful-area-from-geom');
      var cmpIntro = $('gh-yield-compare-intro');
      if (isPalletView()) {
        if (title) title.textContent = ui('gh.yield.titlePallet');
        if (intro) intro.textContent = ui('gh.yield.introPallet');
        if (btn) btn.textContent = ui('gh.yield.fromGeomPallet');
      } else {
        if (title) title.textContent = ui('gh.yield.title');
        if (intro) intro.textContent = ui('gh.yield.intro');
        if (btn) btn.textContent = ui('gh.yield.fromGeom');
      }
      if (cmpIntro) {
        cmpIntro.textContent = isChannelGreenhouse()
          ? ui('gh.yield.compareIntroCanopy')
          : isPalletView()
            ? ui('gh.yield.introPallet') + ' ' + ui('gh.yield.palletEnvNote')
            : ui('gh.yield.compareIntroGeneral');
      }
      var hint = $('gh-useful-area-geom-hint');
      if (hint && r && r.sysArea > 0) {
        hint.textContent = isPalletView()
          ? ui('gh.yield.geomHintPallet', { area: r1(r.sysArea) })
          : ui('gh.yield.geomHint', { area: r1(r.sysArea) });
      }
    }

    function syncGhYieldControls(r) {
      syncGhYieldMarginSliders();
      syncBioMarginVisibility();
      updateGhYieldPanelCopy(r);
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
      syncGhYieldControls: syncGhYieldControls
    };
  }

  global.DG_createPlantingGhYield = createPlantingGhYield;
})(typeof window !== 'undefined' ? window : globalThis);
