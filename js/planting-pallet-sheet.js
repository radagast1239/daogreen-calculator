/**
 * Поддоны: стандарты сорта, расчёт по листу PALLET_SHEET.
 * DG_createPlantingPalletSheet(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  function createPlantingPalletSheet(deps) {
    function st() {
      return deps.getState();
    }

    function densityMax(cv) {
      var C = deps.constants || global.DG_PLANTING_CONSTANTS || {};
      var dMax = C.DENSITY_MAX || 220;
      return Math.max(dMax, Math.ceil(cv.density * 1.2));
    }

    function initPalletValuesFromSheet(cv) {
      cv = cv || deps.getPalletCv();
      if (!cv) return;
      var state = st();
      var $ = deps.$;
      var dMax = densityMax(cv);
      if ($('density')) $('density').max = dMax;
      if ($('day')) $('day').max = 70;
      state.germination = deps.clamp(cv.germination, 1, 21);
      state.day = deps.clamp(cv.channelDays, 1, 70);
      state.density = deps.clamp(cv.density, 15, dMax);
      if (cv.palletCells) state.palletCells = cv.palletCells;
      state.useManualMass = false;
      state.useManualCanopy = false;
      state.canopyPct = 100;
      var cutMid = deps.cutIntervalRange(cv).mid;
      if (cutMid > 0) state.cutInterval = cutMid;
      state.multicut = !!cv.multicut;
      if ($('multicut')) $('multicut').checked = state.multicut;
      deps.syncCycleSlidersFromState();
      if ($('density')) {
        $('density').value = state.density;
        $('density-v').textContent = state.density;
      }
      deps.syncPalletCellButtons();
      deps.syncCutIntervalSlider(cv);
      deps.syncManualMassUI();
      deps.syncCanopyUI();
      deps.syncMulticutDetailUI();
    }

    function palletEffectiveGermination(cv) {
      cv = cv || deps.getPalletCv();
      var state = st();
      return state.palletStd.germination ? cv.germination : state.germination;
    }

    function palletEffectiveDay(cv) {
      cv = cv || deps.getPalletCv();
      var state = st();
      return state.palletStd.day ? cv.channelDays : state.day;
    }

    function palletEffectiveDensity(cv) {
      cv = cv || deps.getPalletCv();
      var state = st();
      return state.palletStd.density ? cv.density : state.density;
    }

    function palletEffectiveMass(cv, massAuto) {
      cv = cv || deps.getPalletCv();
      var state = st();
      if (state.palletStd.mass && !state.useManualMass) return Math.round(cv.yieldPerCutG) || massAuto;
      if (state.useManualMass) return deps.manualHarvestMass(massAuto);
      return massAuto;
    }

    function resetPalletStdToSheetDefaults() {
      if (!deps.isPalletView()) return;
      var state = st();
      state.palletStd = {
        germination: true,
        day: true,
        density: true,
        mass: true,
        cutInterval: true,
        cutMass: true,
        cells: true
      };
      state.useManualCutMass = false;
      applyPalletStandardsFromSheet(deps.getPalletCv());
      deps.renderVfStdGrid();
      if (deps.renderVfStandardsPanel) deps.renderVfStandardsPanel();
      deps.syncPalletCellButtons();
      deps.syncManualMassUI();
      deps.syncCutMassUI();
      deps.syncMulticutDetailUI();
    }

    function applyPalletStandardsToStateOnly(cv, opts) {
      cv = cv || deps.getPalletCv();
      if (!cv) return;
      var state = st();
      var force = !!(opts && opts.econ);
      var dMax = densityMax(cv);
      if (force || state.palletStd.germination) state.germination = deps.clamp(cv.germination, 1, 21);
      if (force || state.palletStd.day) state.day = deps.clamp(cv.channelDays, 1, 70);
      if (force || state.palletStd.density) state.density = deps.clamp(cv.density, 15, dMax);
      if ((force || state.palletStd.cells) && cv.palletCells) state.palletCells = cv.palletCells;
      if (force || state.palletStd.mass) {
        state.manualMass = Math.round(cv.yieldPerCutG) || 10;
        state.useManualMass = false;
        if (!state.useManualCanopy) {
          state.manualCanopy = Math.round(deps.modelCanopyFromMass(cv, state.manualMass));
        }
      }
      if (force || state.palletStd.cutInterval) {
        var cr = deps.cutIntervalRange(cv);
        if (cr.mid > 0) state.cutInterval = cr.mid;
      }
      if (force || state.palletStd.cutMass || state.palletStd.mass) {
        if (cv.yieldPerCutG > 0) {
          state.manualCutMass = Math.round(cv.yieldPerCutG) || 1;
          state.useManualCutMass = false;
        }
      }
      state.multicut = !!cv.multicut;
    }

    function applyPalletStandardsFromSheet(cv, opts) {
      cv = cv || deps.getPalletCv();
      if (!cv) return;
      var state = st();
      if (!deps.isPalletView() && !(opts && opts.econ)) return;
      if (opts && opts.econ) {
        applyPalletStandardsToStateOnly(cv, opts);
        return;
      }
      var $ = deps.$;
      var dMax = densityMax(cv);
      var densityEl = $('density');
      var dayEl = $('day');
      if (densityEl) densityEl.max = dMax;
      if (dayEl) dayEl.max = 70;
      applyPalletStandardsToStateOnly(cv, opts);
      function setPair(id, val) {
        var el = $(id);
        var lab = $(id + '-v');
        if (el) el.value = val;
        if (lab) lab.textContent = val;
      }
      if (state.palletStd.germination) setPair('germination', state.germination);
      if (state.palletStd.day) setPair('day', state.day);
      if (state.palletStd.density) setPair('density', state.density);
      if (state.palletStd.cells && cv.palletCells) deps.syncPalletCellButtons();
      if (state.palletStd.mass) {
        var massInp = $('manualMass');
        if (massInp) massInp.value = state.manualMass;
        if (!state.useManualCanopy) {
          var canopyInp = $('manualCanopy');
          if (canopyInp) canopyInp.value = state.manualCanopy;
        }
      }
      deps.applyCutStandardsFromSheet(cv);
      if ($('multicut')) $('multicut').checked = state.multicut;
      deps.syncManualMassUI();
      deps.syncVfStdControls();
    }

    function effectivePalletHoleCount() {
      var state = st();
      if (deps.palletMountMode() === 'lid') {
        return deps.clamp(parseInt(state.palletLidHoles, 10) || 54, 20, 200);
      }
      return parseInt(state.palletCells, 10) || 54;
    }

    function palletCellsForLayout(cv) {
      cv = cv || deps.getPalletCv();
      var state = st();
      if (deps.palletMountMode() === 'lid') return effectivePalletHoleCount();
      if (state.palletStd.cells && cv && cv.palletCells) return cv.palletCells;
      return state.palletCells || 54;
    }

    function calcFromPalletSheet(cv) {
      cv = cv || deps.getPalletCv();
      if (!cv) {
        return {
          palletMode: true,
          cv: { name: '—', M_max: 40, ca: 10, bolt: 90, t_opt: 22 },
          total: 0,
          mass: 0,
          canopy: 0
        };
      }
      var state = st();
      var germ = state.germination;
      var nursery = state.nursery;
      var t_ch = state.day;
      var rhoT = state.density;
      var cellsLayout = palletCellsForLayout(cv);
      var t_total = germ + nursery + t_ch;
      var massRaw = deps.massAtTotal(cv, t_total);
      var lay = deps.plantLayoutPallet(cellsLayout);
      var cellPitch = lay.cellPitch || lay.nearest;
      var canopyAtMax = deps.effectiveCa(cv) * Math.sqrt(cv.M_max);
      var crowdF = deps.crowdingFactor(canopyAtMax, cellPitch);
      var massAuto = massRaw * crowdF;
      var mass = state.useManualMass ? deps.manualHarvestMass(massAuto) : massAuto;
      var canopy = deps.harvestCanopy(cv, mass);
      var intervalMod = deps.applyCutIntervalHarvestMods(cv, mass, canopy);
      mass = intervalMod.mass;
      canopy = intervalMod.canopy;
      var rgrMass = deps.rgrAtTotal(cv, t_total) * 100;
      var rgrCanopy = rgrMass / 2;
      var tHarvestCh = deps.harvestChannel(cv);
      var tBoltCh = deps.boltChannel(cv);
      var stg = deps.stageOf(t_ch, mass, tBoltCh, cv);
      var edgeGap = cellPitch - (lay.cellD || 0);
      var leafGap = cellPitch - canopy;
      var totalCycleDays = germ + nursery + Math.round(tHarvestCh);
      var cyclesPerYear = totalCycleDays > 0 ? 365 / totalCycleDays : 0;
      var yieldPerSqmCycle = (mass * lay.rhoA) / 1000;
      var yieldPerCycleKg = (mass * lay.total) / 1000;
      var yieldPerSqmYear = yieldPerSqmCycle * cyclesPerYear;
      return Object.assign(
        {
          cv: cv,
          t_ch: t_ch,
          t_total: t_total,
          mass: mass,
          massAuto: massAuto,
          canopy: canopy,
          massRaw: massRaw,
          canopyRaw: canopy,
          crowdF: crowdF,
          rgrMass: rgrMass,
          rgrCanopy: rgrCanopy,
          tHarvestCh: tHarvestCh,
          tBoltCh: tBoltCh,
          st: stg,
          a: cellPitch,
          b: lay.b,
          diag: cellPitch,
          nearest: cellPitch,
          edgeGap: edgeGap,
          offMm: 0,
          constrained: false,
          rhoT: rhoT,
          rhoA: lay.rhoA,
          leafGap: leafGap,
          perChan: lay.perChan,
          perRow: lay.perRow,
          total: lay.total,
          sysWmm: lay.sysWmm,
          sysArea: lay.sysArea,
          vfMode: false,
          widthExceeds: false,
          widthClose: false,
          maxChannelsFit: lay.maxChannelsFit,
          totalCycleDays: totalCycleDays,
          cyclesPerYear: cyclesPerYear,
          yieldPerCycleKg: yieldPerCycleKg,
          yieldPerSqmCycle: yieldPerSqmCycle,
          yieldPerSqmYear: yieldPerSqmYear,
          palletSheet: true,
          countUnit: cv.countUnit,
          palletMode: true
        },
        lay
      );
    }

    return {
      initPalletValuesFromSheet: initPalletValuesFromSheet,
      palletEffectiveGermination: palletEffectiveGermination,
      palletEffectiveDay: palletEffectiveDay,
      palletEffectiveDensity: palletEffectiveDensity,
      palletEffectiveMass: palletEffectiveMass,
      resetPalletStdToSheetDefaults: resetPalletStdToSheetDefaults,
      applyPalletStandardsToStateOnly: applyPalletStandardsToStateOnly,
      applyPalletStandardsFromSheet: applyPalletStandardsFromSheet,
      effectivePalletHoleCount: effectivePalletHoleCount,
      palletCellsForLayout: palletCellsForLayout,
      calcFromPalletSheet: calcFromPalletSheet
    };
  }

  global.DG_createPlantingPalletSheet = createPlantingPalletSheet;
})(typeof window !== 'undefined' ? window : globalThis);
