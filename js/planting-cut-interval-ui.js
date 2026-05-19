/**
 * Поля стандарта VF и подсказка ползунка интервала срезки.
 * DG_createPlantingCutIntervalUi(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  global.DG_VF_STD_FIELDS = [
    { key: 'germination', labelKey: 'germination', ctrl: 'ctrl-germination', badge: 'vf-badge-germination' },
    { key: 'day', labelKey: 'day', ctrl: 'ctrl-day', badge: 'vf-badge-day' },
    { key: 'density', labelKey: 'density', ctrl: 'ctrl-density', badge: 'vf-badge-density' },
    { key: 'mass', labelKey: 'mass', ctrl: null, badge: 'vf-badge-mass' },
    { key: 'cutInterval', labelKey: 'cutInterval', ctrl: 'ctrl-cut-interval', badge: 'vf-badge-cutInterval' },
    { key: 'cutMass', labelKey: 'cutMass', ctrl: null, badge: 'vf-badge-cutMass' }
  ];

  function createPlantingCutIntervalUi(deps) {
    var slack = function () {
      var cut = global.DG_CUT || { CUT_INTERVAL_SLACK: 6 };
      return cut.CUT_INTERVAL_SLACK;
    };

    function syncCutIntervalSlider(cv) {
      var $ = deps.$;
      var state = deps.getState();
      var inp = $('cutInterval');
      if (!inp) return;
      cv = cv || deps.getActiveCv();
      var range = deps.cutIntervalRange(cv);
      inp.min = range.sliderMin;
      inp.max = range.sliderMax;
      if (document.activeElement !== inp) {
        state.cutInterval = deps.clamp(state.cutInterval, range.sliderMin, range.sliderMax);
        inp.value = state.cutInterval;
      }
      var vv = $('cutInterval-v');
      if (vv) vv.textContent = state.cutInterval;
      var hint = $('cut-interval-hint');
      if (!hint) return;
      hint.classList.toggle('env-block-hidden', !state.multicut);
      var mods = deps.cutIntervalMods(cv);
      var cutDUnit = deps.pm('unit.days');
      var txt = deps.ui('ui.cut.rec', {
        mid: range.mid,
        slack: slack(),
        min: range.sliderMin,
        max: range.sliderMax,
        dUnit: cutDUnit
      });
      if (cv && cv.cutIntervalStd && String(cv.cutIntervalStd) !== String(range.mid)) {
        txt += deps.ui('ui.cut.stdDiff', { std: cv.cutIntervalStd, dUnit: cutDUnit });
      }
      if (mods.delta === 0) {
        txt += deps.ui('ui.cut.nominal');
      } else if (mods.delta < 0) {
        txt += deps.ui('ui.cut.shorter', {
          delta: Math.abs(mods.delta),
          massPct: mods.massPct,
          canopyPct: mods.canopyPct,
          dUnit: cutDUnit
        });
      } else {
        txt += deps.ui('ui.cut.longer', {
          delta: mods.delta,
          massPct: mods.massPct,
          canopyPct: mods.canopyPct,
          dUnit: cutDUnit
        });
      }
      hint.innerHTML = txt;
    }

    return { syncCutIntervalSlider: syncCutIntervalSlider };
  }

  global.DG_createPlantingCutIntervalUi = createPlantingCutIntervalUi;
})(typeof window !== 'undefined' ? window : globalThis);
