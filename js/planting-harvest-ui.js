/**
 * Урожай и шапка: ручной ввод, синхронизация UI, подсказки модели.
 * DG_createPlantingHarvestUi(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  function createPlantingHarvestUi(deps) {
    function st() {
      return deps.getState();
    }

    function rangeMass(v) {
      return v * st().errorPct / 100;
    }

    function rangeCanopy(v) {
      return v * st().errorPct / 200;
    }

    function manualHarvestMass(massAuto) {
      var state = st();
      if (state.useManualMass) return deps.clamp(state.manualMass, 5, 500);
      return massAuto;
    }

    function modelCanopyFromMass(cv, mass) {
      var GLM = global.DG_growthLightModel;
      var state = st();
      if (GLM && GLM.canopyFromMass) {
        return GLM.canopyFromMass(cv, mass, state.temp);
      }
      return deps.effectiveCa(cv) * Math.sqrt(Math.max(mass, 1));
    }

    function standardCanopyMm(cv, mass) {
      return modelCanopyFromMass(cv, mass);
    }

    function harvestCanopy(cv, mass) {
      var state = st();
      if (state.useManualCanopy) return deps.clamp(state.manualCanopy, 20, 600);
      var pct = deps.clamp(state.canopyPct || 100, 100, 130);
      return deps.clamp(standardCanopyMm(cv, mass) * pct / 100, 20, 600);
    }

    function applyCanopyStandard(cv, mass) {
      var state = st();
      cv = cv || deps.getActiveCv();
      var m = mass != null ? mass : (state.useManualMass ? state.manualMass : null);
      var massVal = m;
      if (massVal == null) {
        var r = deps.calc();
        massVal = r.mass;
      }
      state.useManualCanopy = false;
      state.canopyPct = 100;
      state.manualCanopy = Math.round(standardCanopyMm(cv, massVal));
      syncCanopyUI();
    }

    function formatHarvestCtrlVal(val, rangeFn) {
      if (!st().showRange) return String(deps.round(val));
      var hw = rangeFn(val);
      return deps.round(val - hw) + '–' + deps.round(val + hw);
    }

    function syncManualMassUI() {
      var state = st();
      var $ = deps.$;
      var chk = $('useManualMass');
      if (chk) chk.checked = !!state.useManualMass;
      var block = $('manual-mass-block');
      if (block) block.classList.toggle('env-block-hidden', !state.useManualMass);
      var inp = $('manualMass');
      if (inp && document.activeElement !== inp) inp.value = state.manualMass;
    }

    function syncCanopyUI() {
      var state = st();
      var $ = deps.$;
      var chk = $('useManualCanopy');
      if (chk) chk.checked = !!state.useManualCanopy;
      var block = $('manual-canopy-block');
      if (block) block.classList.toggle('env-block-hidden', !state.useManualCanopy);
      var pctBlock = $('canopy-pct-block');
      if (pctBlock) pctBlock.classList.toggle('env-block-hidden', !!state.useManualCanopy);
      document.querySelectorAll('.canopy-schema-pct').forEach(function (el) {
        el.classList.toggle('env-block-hidden', !!state.useManualCanopy);
      });
      var inp = $('manualCanopy');
      if (inp && document.activeElement !== inp) inp.value = state.manualCanopy;
      var pct = deps.clamp(state.canopyPct || 100, 100, 130);
      state.canopyPct = pct;
      document.querySelectorAll('#canopyPct, .canopyPct-sync').forEach(function (el) {
        if (document.activeElement !== el) el.value = pct;
      });
      document.querySelectorAll('#canopyPct-v, .canopyPct-v-sync').forEach(function (el) {
        el.textContent = pct;
      });
    }

    function syncManualCanopyUI() {
      syncCanopyUI();
    }

    function syncMassBlockLabels(cv) {
      var pcs = !!(cv && cv.countUnit === 'шт');
      var plantT =
        typeof global.DG_plantT === 'function'
          ? global.DG_plantT
          : function (k) {
              return k;
            };
      var massHead = document.querySelector('#block-mass .collapse-head > span:first-child');
      if (massHead) massHead.textContent = plantT(pcs ? 'mass.titlePcs' : 'mass.title');
      var toggleLbl = document.querySelector('#block-mass .toggle-label');
      if (toggleLbl) toggleLbl.textContent = plantT(pcs ? 'mass.manualPcs' : 'mass.manual');
      var potLbl = document.querySelector('#manual-mass-block .ctrl-label');
      if (potLbl) {
        var badge = potLbl.querySelector('.vf-sheet-badge');
        while (potLbl.firstChild && potLbl.firstChild !== badge) potLbl.removeChild(potLbl.firstChild);
        potLbl.insertBefore(document.createTextNode(plantT(pcs ? 'mass.perPotPcs' : 'mass.perPot')), badge);
      }
      var unitSpan = document.querySelector('#manual-mass-block .unit');
      if (unitSpan) unitSpan.textContent = pcs ? deps.pm('u.pcs') : 'г';
    }

    function syncHarvestBlockUI(r) {
      var state = st();
      var $ = deps.$;
      if (r && r.cv) syncMassBlockLabels(r.cv);
      syncManualMassUI();
      syncManualCanopyUI();
      var cv = r.cv;
      var unit = r.countUnit === 'шт' ? deps.pm('u.pcs') : deps.pm('unit.g');
      var modelMass = r.massAuto;
      var modelCanopy = modelCanopyFromMass(cv, r.mass);
      var sheetMassStd =
        (deps.isPalletView() && state.palletStd && state.palletStd.mass) ||
        (deps.isVF() && state.vfStd && state.vfStd.mass);
      var massVal = state.useManualMass || sheetMassStd ? r.mass : modelMass;
      var canopyVal = state.useManualCanopy ? r.canopy : modelCanopy;
      var mv = $('manualMass-v');
      if (mv) mv.textContent = formatHarvestCtrlVal(massVal, rangeMass);
      var cvv = $('manualCanopy-v');
      if (cvv) cvv.textContent = formatHarvestCtrlVal(canopyVal, rangeCanopy);
      var preview = $('harvest-preview-block');
      var showPreview = !state.useManualMass || !state.useManualCanopy;
      if (preview) preview.classList.toggle('env-block-hidden', !showPreview);
      if (showPreview) {
        preview.classList.toggle('has-range', !!state.showRange);
        var massEl = $('harvest-preview-mass');
        var canopyEl = $('harvest-preview-canopy');
        if (massEl) {
          massEl.innerHTML =
            '<strong>' + formatHarvestCtrlVal(modelMass, rangeMass) + '</strong> ' + unit;
        }
        if (canopyEl) {
          canopyEl.innerHTML =
            '<strong>' + formatHarvestCtrlVal(modelCanopy, rangeCanopy) + '</strong> ' +
            deps.pm('unit.mm');
        }
      }
      var btnCut = $('auto-cut-interval');
      if (btnCut) {
        var std = deps.isVF() && deps.isVfSheetCv(cv) ? deps.vfCutIntervalFromCv(cv) : 0;
        btnCut.disabled = !std;
        btnCut.title = std ? deps.ui('ui.harvest.intervalStd') : deps.ui('ui.harvest.intervalNone');
      }
    }

    function updateMassModelHint(massAuto, mass, canopyAuto, canopy) {
      var state = st();
      var el = deps.$('mass-model-hint');
      if (!el) return;
      var activeCv = deps.getActiveCv ? deps.getActiveCv() : null;
      var unit =
        activeCv && activeCv.countUnit === 'шт' ? deps.pm('u.pcs') : deps.pm('unit.g');
      var mm = deps.pm('unit.mm');
      var mDisp = state.showRange
        ? formatHarvestCtrlVal(mass, rangeMass) + ' ' + unit
        : deps.round(mass) + ' ' + unit;
      var cDisp = state.showRange
        ? formatHarvestCtrlVal(canopy, rangeCanopy) + ' ' + mm
        : deps.round(canopy) + ' ' + mm;
      var range = state.showRange
        ? state.useManualMass || state.useManualCanopy
          ? deps.ui('ui.harvest.rangeManual', {
              pct: state.errorPct,
              pctHalf: state.errorPct / 2
            })
          : deps.ui('ui.harvest.rangeAuto')
        : '';
      if (state.useManualMass || state.useManualCanopy) {
        el.innerHTML = deps.ui('ui.harvest.hintManual', {
          massAuto: deps.round(massAuto),
          unit: unit,
          canopyAuto: deps.round(canopyAuto),
          mm: mm,
          mDisp: mDisp,
          cDisp: cDisp,
          range: range
        });
      } else {
        el.innerHTML = deps.ui('ui.harvest.hintAuto', {
          massAuto: deps.round(massAuto),
          unit: unit,
          canopyAuto: deps.round(canopyAuto),
          mm: mm,
          range: range
        });
      }
    }

    return {
      manualHarvestMass: manualHarvestMass,
      modelCanopyFromMass: modelCanopyFromMass,
      standardCanopyMm: standardCanopyMm,
      harvestCanopy: harvestCanopy,
      applyCanopyStandard: applyCanopyStandard,
      formatHarvestCtrlVal: formatHarvestCtrlVal,
      syncManualMassUI: syncManualMassUI,
      syncCanopyUI: syncCanopyUI,
      syncManualCanopyUI: syncManualCanopyUI,
      syncHarvestBlockUI: syncHarvestBlockUI,
      syncMassBlockLabels: syncMassBlockLabels,
      updateMassModelHint: updateMassModelHint,
      rangeMass: rangeMass,
      rangeCanopy: rangeCanopy
    };
  }

  global.DG_createPlantingHarvestUi = createPlantingHarvestUi;
})(typeof window !== 'undefined' ? window : globalThis);
