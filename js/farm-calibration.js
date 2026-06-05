/**
 * Калибровка под ферму: замеры → patch M_max / yieldPerCutG / k.
 */
(function (global) {
  'use strict';

  var M_MAX_MIN = 15;
  var M_MAX_MAX = 600;
  var K_MIN = 0.08;
  var K_MAX = 1.2;
  var YIELD_MIN = 1;
  var YIELD_MAX = 500;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function createFarmCalibration(deps) {
    var lastRenderCvId = null;

    function st() { return deps.getState(); }
    function t(k, ru) {
      if (deps.t) {
        var v = deps.t(k);
        if (v != null && v !== k) return v;
      }
      return ru != null ? ru : k;
    }
    function tFmt(k, vars, ru) {
      if (deps.tFmt) {
        var v = deps.tFmt(k, vars);
        if (v != null && v !== k) return v;
      }
      var s = t(k, ru);
      if (vars && s) {
        Object.keys(vars).forEach(function (key) {
          s = s.replace(new RegExp('\\{' + key + '\\}', 'g'), vars[key]);
        });
      }
      return s;
    }

    function ensureStore() {
      if (!st().farmCalibrations || typeof st().farmCalibrations !== 'object') {
        st().farmCalibrations = {};
      }
    }

    function getEntry(cvId) {
      ensureStore();
      return st().farmCalibrations[cvId] || null;
    }

    function applyFarmCvPatch(cv) {
      if (!cv || !cv.id) return cv;
      var entry = getEntry(cv.id);
      if (!entry || !entry.patch || !Object.keys(entry.patch).length) return cv;
      return Object.assign({}, cv, entry.patch);
    }

    function cvHasFarmCalibration(cvId) {
      var e = getEntry(cvId);
      return !!(e && (e.measuredMass > 0 || e.measuredYieldSqm > 0));
    }

    function computePatch(cv, measuredMass, measuredYieldSqm, modelMass, modelYieldSqm) {
      cv = cv || {};
      var patch = {};
      var notes = [];

      if (measuredMass > 0 && modelMass > 0) {
        var ratio = measuredMass / modelMass;
        if (cv.M_max > 0) {
          patch.M_max = clamp(Math.round(cv.M_max * ratio), M_MAX_MIN, M_MAX_MAX);
          notes.push('M_max');
        } else if (cv.yieldPerCutG > 0) {
          patch.yieldPerCutG = clamp(Math.round(cv.yieldPerCutG * ratio), YIELD_MIN, YIELD_MAX);
          notes.push('yieldPerCutG');
        }
        if (cv.k > 0 && Math.abs(ratio - 1) > 0.03) {
          patch.k = clamp(Math.round(cv.k * ratio * 1000) / 1000, K_MIN, K_MAX);
          notes.push('k');
        }
      }

      if (measuredYieldSqm > 0 && modelYieldSqm > 0) {
        var yr = measuredYieldSqm / modelYieldSqm;
        if (cv.yieldPerCutG > 0) {
          patch.yieldPerCutG = clamp(Math.round(cv.yieldPerCutG * yr), YIELD_MIN, YIELD_MAX);
          notes.push('yieldPerCutG');
        } else if (cv.M_max > 0 && !patch.M_max) {
          patch.M_max = clamp(Math.round(cv.M_max * yr), M_MAX_MIN, M_MAX_MAX);
          notes.push('M_max');
        }
      }

      return { patch: patch, notes: notes };
    }

    function saveCalibration(cvId, form) {
      ensureStore();
      cvId = cvId || (deps.getActiveCv && deps.getActiveCv().id);
      if (!cvId) return null;
      var cv = deps.findCvById ? deps.findCvById(cvId) : null;
      if (!cv) return null;

      var measuredMass = parseFloat(form.measuredMass) || 0;
      var measuredYieldSqm = parseFloat(form.measuredYieldSqm) || 0;
      var comment = String(form.comment || '').trim();
      var measuredAt = form.measuredAt || new Date().toISOString().slice(0, 10);

      var r = deps.calc ? deps.calc() : null;
      var modelMass = r && r.mass ? r.mass : 0;
      var modelYieldSqm = 0;
      if (r) {
        if (cv.countUnit === 'шт') modelYieldSqm = r.yieldPerSqmMonthPcs || 0;
        else modelYieldSqm = r.yieldPerSqmMonthKg || 0;
      }

      var computed = computePatch(cv, measuredMass, measuredYieldSqm, modelMass, modelYieldSqm);
      st().farmCalibrations[cvId] = {
        measuredMass: measuredMass,
        measuredYieldSqm: measuredYieldSqm,
        measuredAt: measuredAt,
        comment: comment,
        modelMass: modelMass,
        modelYieldSqm: modelYieldSqm,
        patch: computed.patch,
        patchFields: computed.notes
      };
      lastRenderCvId = null;
      if (deps.renderAll) deps.renderAll();
      return st().farmCalibrations[cvId];
    }

    function removeCalibration(cvId) {
      ensureStore();
      delete st().farmCalibrations[cvId];
      lastRenderCvId = null;
      if (deps.renderAll) deps.renderAll();
    }

    function $(id) { return document.getElementById(id); }

    function setVisible(el, show) {
      if (!el) return;
      el.classList.toggle('env-block-hidden', !show);
      if (el.hasAttribute('hidden')) el.hidden = !show;
    }

    function renderPanel(r) {
      var panel = $('block-panel-farm-calibration');
      if (!panel) return;
      var cv = (r && r.cv) || (deps.getActiveCv ? deps.getActiveCv() : null);
      var noCv = $('farm-cal-no-cv');
      var form = $('farm-cal-form');
      if (!cv) {
        setVisible(noCv, true);
        setVisible(form, false);
        lastRenderCvId = null;
        return;
      }
      setVisible(noCv, false);
      setVisible(form, true);

      var entry = getEntry(cv.id) || {};
      var unitMass = cv.countUnit === 'шт'
        ? t('farmCal.unitMassPcs', 'шт')
        : t('unit.g', 'г');
      var unitYield = cv.countUnit === 'шт'
        ? t('farmCal.unitYieldPcs', 'шт/м²·мес')
        : t('farmCal.unitYieldKg', 'кг/м²·мес');
      var cvChanged = cv.id !== lastRenderCvId;
      lastRenderCvId = cv.id;

      var massLbl = $('farm-cal-mass-lbl');
      var yieldLbl = $('farm-cal-yield-lbl');
      var dateLbl = $('farm-cal-date-lbl');
      var commentLbl = $('farm-cal-comment-lbl');
      if (massLbl) massLbl.textContent = t('farmCal.measuredMass', 'Факт. масса срезки') + ', ' + unitMass;
      if (yieldLbl) yieldLbl.textContent = t('farmCal.measuredYield', 'Факт. урожай') + ', ' + unitYield;
      if (dateLbl) dateLbl.textContent = t('farmCal.date', 'Дата замера');
      if (commentLbl) commentLbl.textContent = t('farmCal.comment', 'Комментарий');

      var intro = $('farm-cal-intro');
      if (intro) intro.textContent = t('farmCal.intro',
        'Замеры с объекта подгоняют модель под вашу ферму. Сохраняются в проект JSON.');

      var massInput = $('farm-cal-mass');
      var yieldInput = $('farm-cal-yield');
      var dateInput = $('farm-cal-date');
      var commentInput = $('farm-cal-comment');
      if (cvChanged) {
        if (massInput) massInput.value = entry.measuredMass > 0 ? entry.measuredMass : '';
        if (yieldInput) yieldInput.value = entry.measuredYieldSqm > 0 ? entry.measuredYieldSqm : '';
        if (dateInput) dateInput.value = entry.measuredAt || '';
        if (commentInput) commentInput.value = entry.comment || '';
      }

      var modelEl = $('farm-cal-model');
      if (modelEl && r) {
        var yieldVal = cv.countUnit === 'шт'
          ? (deps.r1 ? deps.r1(r.yieldPerSqmMonthPcs) : r.yieldPerSqmMonthPcs)
          : (deps.r2 ? deps.r2(r.yieldPerSqmMonthKg) : r.yieldPerSqmMonthKg);
        modelEl.textContent = tFmt('farmCal.modelNow', {
          mass: Math.round(r.mass),
          massUnit: unitMass,
          yield: yieldVal,
          yieldUnit: unitYield
        }, 'Сейчас модель: {mass} {massUnit}, урожай {yield} {yieldUnit}');
        setVisible(modelEl, true);
      } else if (modelEl) {
        setVisible(modelEl, false);
      }

      var appliedEl = $('farm-cal-applied');
      if (appliedEl && entry.patch && Object.keys(entry.patch).length) {
        appliedEl.textContent = tFmt('farmCal.applied',
          { fields: (entry.patchFields || Object.keys(entry.patch)).join(', ') },
          'Применено: {fields}');
        setVisible(appliedEl, true);
      } else if (appliedEl) {
        setVisible(appliedEl, false);
      }

      var saveBtn = $('farm-cal-save');
      var clearBtn = $('farm-cal-clear');
      if (saveBtn) saveBtn.textContent = t('farmCal.save', 'Применить калибровку');
      if (clearBtn) {
        clearBtn.textContent = t('farmCal.clear', 'Сбросить замеры');
        setVisible(clearBtn, !!entry.measuredAt);
      }
    }

    function bind() {
      document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'farm-cal-save') {
          var cv = deps.getActiveCv ? deps.getActiveCv() : null;
          saveCalibration(cv && cv.id, {
            measuredMass: document.getElementById('farm-cal-mass') && document.getElementById('farm-cal-mass').value,
            measuredYieldSqm: document.getElementById('farm-cal-yield') && document.getElementById('farm-cal-yield').value,
            measuredAt: document.getElementById('farm-cal-date') && document.getElementById('farm-cal-date').value,
            comment: document.getElementById('farm-cal-comment') && document.getElementById('farm-cal-comment').value
          });
        }
        if (e.target && e.target.id === 'farm-cal-clear') {
          var cv2 = deps.getActiveCv ? deps.getActiveCv() : null;
          if (cv2) removeCalibration(cv2.id);
        }
      });
    }

    return {
      bind: bind,
      renderPanel: renderPanel,
      applyFarmCvPatch: applyFarmCvPatch,
      cvHasFarmCalibration: cvHasFarmCalibration,
      saveCalibration: saveCalibration,
      removeCalibration: removeCalibration,
      getEntry: getEntry
    };
  }

  global.DG_createFarmCalibration = createFarmCalibration;
})(typeof window !== 'undefined' ? window : globalThis);
