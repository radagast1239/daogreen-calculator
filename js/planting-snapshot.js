/**
 * Снимки посадки для экономики (DG_createPlantingSnapshot).
 */
(function(global){
  'use strict';

  function createPlantingSnapshot(deps){
    var HMD = deps.HARVEST_MONTH_DAYS;

    function T(k, ru){
      if (deps.t){
        var v = deps.t(k);
        if (v != null && v !== k) return v;
      }
      return ru != null ? ru : k;
    }

    function facilityLabel(){
      if (deps.isPalletView()) return T('mode.pallets', 'Поддоны');
      if (deps.isVF()) return T('facility.vertical', 'Вертикальная ферма');
      return T('facility.greenhouse', 'Теплица');
    }

    function plantingHarvestYieldParams(cv, r){
      var state = deps.getState();
      var unitIsPieces = cv.countUnit === 'шт';
      var useMc = state.multicut && deps.supportsMulticut(cv);
      if (useMc){
        var cutIntervalDays = Math.max(1, Math.round(deps.effectiveCutInterval()));
        var cm = deps.cutMassPerPlant(cv, null);
        var yieldPerCut = cm.val;
        var yieldUnit = cm.unit;
        var cutsPerMonth = HMD / cutIntervalDays;
        var yieldPerPotMonth = yieldPerCut * cutsPerMonth;
        var pieces = unitIsPieces || yieldUnit === 'шт';
        var yieldPerSqmMonthKg = 0;
        var yieldPerSqmMonthPcs = 0;
        if (pieces) yieldPerSqmMonthPcs = yieldPerPotMonth * r.rhoA;
        else yieldPerSqmMonthKg = (yieldPerPotMonth / 1000) * r.rhoA;
        var mc = deps.getMulticutYieldPerPlant(cv);
        return {
          multicutHarvest: true,
          harvestYieldPerCut: yieldPerCut,
          harvestCutIntervalDays: cutIntervalDays,
          harvestCutsPerMonth: cutsPerMonth,
          yieldPerCut: yieldPerCut,
          yieldPerPotCycle: yieldPerCut,
          yieldPerPotLife: mc ? mc.total : null,
          yieldPerPotMonth: yieldPerPotMonth,
          yieldPerSqmMonthKg: yieldPerSqmMonthKg,
          yieldPerSqmMonthPcs: yieldPerSqmMonthPcs,
          yieldUnit: yieldUnit,
          unitIsPieces: pieces
        };
      }
      var yieldPerPotCycle = r.mass;
      var yieldUnit = unitIsPieces ? 'шт' : 'г';
      if (unitIsPieces && deps.isVfSheetCv(cv) && cv.yieldPerCutG > 0) yieldPerPotCycle = cv.yieldPerCutG;
      var cyclesPerMonth = r.totalCycleDays > 0 ? HMD / r.totalCycleDays : 0;
      var yieldPerPotMonth = yieldPerPotCycle * cyclesPerMonth;
      var yieldPerSqmMonthKg2 = 0;
      var yieldPerSqmMonthPcs2 = 0;
      if (yieldUnit === 'шт') yieldPerSqmMonthPcs2 = yieldPerPotMonth * r.rhoA;
      else yieldPerSqmMonthKg2 = (yieldPerPotMonth / 1000) * r.rhoA;
      return {
        multicutHarvest: false,
        harvestYieldPerCut: yieldPerPotCycle,
        harvestCutIntervalDays: Math.max(1, r.totalCycleDays || 1),
        harvestCutsPerMonth: cyclesPerMonth,
        yieldPerCut: yieldPerPotCycle,
        yieldPerPotCycle: yieldPerPotCycle,
        yieldPerPotLife: null,
        yieldPerPotMonth: yieldPerPotMonth,
        yieldPerSqmMonthKg: yieldPerSqmMonthKg2,
        yieldPerSqmMonthPcs: yieldPerSqmMonthPcs2,
        yieldUnit: yieldUnit,
        unitIsPieces: unitIsPieces || yieldUnit === 'шт',
        cyclesPerMonth: cyclesPerMonth
      };
    }

    function buildPlantingSnapshot(r, cv){
      var hy = plantingHarvestYieldParams(cv, r);
      var suppDli = deps.lightingMolForEnergy();
      var kwhPerSqmDay = deps.kwhPerSqmPerDayFromDli(suppDli);
      var lightHoursDay = deps.effectivePhotoperiod();
      var kwhPerM2Hour = lightHoursDay > 0 ? kwhPerSqmDay / lightHoursDay : 0;
      var cyclesPerMonth = hy.cyclesPerMonth != null
        ? hy.cyclesPerMonth
        : (r.totalCycleDays > 0 ? HMD / r.totalCycleDays : 0);
      var facLabel = facilityLabel();
      return {
        cvId: cv.id,
        cvName: cv.name,
        facilityLabel: facLabel,
        unitIsPieces: hy.unitIsPieces,
        rhoA: r.rhoA,
        totalCycleDays: r.totalCycleDays,
        multicutHarvest: hy.multicutHarvest,
        harvestYieldPerCut: hy.harvestYieldPerCut,
        harvestCutIntervalDays: hy.harvestCutIntervalDays,
        harvestCutsPerMonth: hy.harvestCutsPerMonth,
        yieldPerPotLife: hy.yieldPerPotLife,
        yieldPerPotCycle: hy.yieldPerPotCycle,
        yieldPerPotMonth: hy.yieldPerPotMonth,
        yieldUnit: hy.yieldUnit,
        yieldPerSqmMonthKg: hy.yieldPerSqmMonthKg,
        yieldPerSqmMonthPcs: hy.yieldPerSqmMonthPcs,
        kwhPerM2Hour: kwhPerM2Hour,
        kwhPerSqmDay: kwhPerSqmDay,
        lightHoursDay: lightHoursDay,
        sysArea: r.sysArea,
        cyclesPerMonth: cyclesPerMonth,
        isMix: false
      };
    }

    function getPlantingStateEconSlice(){
      var state = deps.getState();
      return {
        facility: state.facility,
        cv: state.cv,
        vfCv: state.vfCv,
        germination: state.germination,
        nursery: state.nursery,
        day: state.day,
        density: state.density,
        cutInterval: state.cutInterval,
        canopyPct: state.canopyPct,
        manualMass: state.manualMass,
        manualCutMass: state.manualCutMass,
        useManualCutMass: state.useManualCutMass,
        useManualMass: state.useManualMass,
        useManualCanopy: state.useManualCanopy,
        manualCanopy: state.manualCanopy,
        multicut: state.multicut,
        ghCutCount: state.ghCutCount,
        ghCutMasses: state.ghCutMasses.slice(),
        vfStd: Object.assign({}, state.vfStd),
        appView: state.appView,
        palletCv: state.palletCv,
        palletCells: state.palletCells,
        palletsAlong: state.palletsAlong,
        palletMount: state.palletMount,
        palletTiers: state.palletTiers,
        tierGapMm: state.tierGapMm,
        nch: state.nch,
        extraB: state.extraB,
        palletStd: Object.assign({}, state.palletStd)
      };
    }

    function restorePlantingStateEconSlice(sl){
      var state = deps.getState();
      state.facility = sl.facility;
      state.cv = sl.cv;
      state.vfCv = sl.vfCv;
      state.germination = sl.germination;
      state.nursery = sl.nursery;
      state.day = sl.day;
      state.density = sl.density;
      state.cutInterval = sl.cutInterval;
      state.canopyPct = sl.canopyPct;
      state.manualMass = sl.manualMass;
      state.manualCutMass = sl.manualCutMass;
      state.useManualCutMass = sl.useManualCutMass;
      state.useManualMass = sl.useManualMass;
      state.useManualCanopy = sl.useManualCanopy;
      state.manualCanopy = sl.manualCanopy;
      state.multicut = sl.multicut;
      state.ghCutCount = sl.ghCutCount;
      state.ghCutMasses = sl.ghCutMasses.slice();
      state.vfStd = Object.assign({}, sl.vfStd);
      if (sl.appView != null) state.appView = sl.appView;
      if (sl.palletCv != null) state.palletCv = sl.palletCv;
      if (sl.palletCells != null) state.palletCells = sl.palletCells;
      if (sl.palletsAlong != null) state.palletsAlong = sl.palletsAlong;
      if (sl.palletMount != null) state.palletMount = sl.palletMount;
      if (sl.palletTiers != null) state.palletTiers = sl.palletTiers;
      if (sl.tierGapMm != null) state.tierGapMm = sl.tierGapMm;
      if (sl.nch != null) state.nch = sl.nch;
      if (sl.extraB != null) state.extraB = sl.extraB;
      if (sl.palletStd) state.palletStd = Object.assign({}, sl.palletStd);
    }

    function plantingCvIdMatchesLiveState(cvId){
      var state = deps.getState();
      if (!cvId) return false;
      if (deps.isPalletCvId(cvId)) return state.palletCv === cvId;
      if (deps.isVfCvId(cvId)) return state.vfCv === cvId;
      return state.cv === cvId;
    }

    function getPlantingSnapshot(){
      var r = deps.calc();
      return buildPlantingSnapshot(r, r.cv);
    }

    function averageSnapshots(snaps, label, cvId){
      var n = snaps.length;
      if (!n) return getPlantingSnapshot();
      function avg(key){ return snaps.reduce(function(s, x){ return s + (x[key] || 0); }, 0) / n; }
      var unitIsPieces = snaps.some(function(s){ return s.unitIsPieces; });
      return {
        cvId: cvId,
        cvName: label,
        facilityLabel: snaps[0].facilityLabel,
        unitIsPieces: unitIsPieces,
        rhoA: avg('rhoA'),
        totalCycleDays: Math.round(avg('totalCycleDays')),
        yieldPerPotCycle: avg('yieldPerPotCycle'),
        yieldPerPotMonth: avg('yieldPerPotMonth'),
        yieldUnit: unitIsPieces ? 'шт' : 'г',
        yieldPerSqmMonthKg: avg('yieldPerSqmMonthKg'),
        yieldPerSqmMonthPcs: avg('yieldPerSqmMonthPcs'),
        kwhPerM2Hour: avg('kwhPerM2Hour'),
        kwhPerSqmDay: avg('kwhPerSqmDay'),
        lightHoursDay: avg('lightHoursDay'),
        sysArea: avg('sysArea'),
        cyclesPerMonth: avg('cyclesPerMonth'),
        isMix: true,
        mixCount: n
      };
    }

    function getPlantingSnapshotForCvId(cvId){
      if (!cvId) return getPlantingSnapshot();
      if (cvId === deps.ECON_SALAD_MIX_ID) return getSaladMixSnapshot();

      if (plantingCvIdMatchesLiveState(cvId)){
        var cv = deps.findCvById(cvId);
        if (cv){
          var r;
          if (deps.isPalletCvId(cvId) && deps.allPalletCultivars().length) r = deps.calcFromPalletSheet(cv);
          else if (deps.isVfCvId(cvId) && deps.allVfCultivars().length) r = deps.calcFromVfSheet(cv);
          else r = deps.calc();
          var snap = buildPlantingSnapshot(r, cv);
          if (deps.isPalletCvId(cvId)) snap.facilityLabel = T('mode.pallets', 'Поддоны');
          snap.profileSource = 'live';
          return snap;
        }
      }

      var saved = getPlantingStateEconSlice();
      var cv, r, snap, state;
      try {
        if (deps.isPalletCvId(cvId) && deps.allPalletCultivars().length){
          cv = deps.allPalletCultivars().find(function(c){ return c.id === cvId; });
          if (!cv) return getPlantingSnapshot();
          state = deps.getState();
          state.appView = 'pallets';
          state.palletCv = cvId;
          if (cv.palletCells) state.palletCells = cv.palletCells;
          deps.applyPalletStandardsFromSheet(cv, { econ: true });
          state.multicut = !!cv.multicut;
          r = deps.calcFromPalletSheet(cv);
          snap = buildPlantingSnapshot(r, cv);
          snap.facilityLabel = T('mode.pallets', 'Поддоны');
          snap.profileSource = 'default';
          return snap;
        }
        if (deps.isVfCvId(cvId) && deps.allVfCultivars().length){
          cv = deps.allVfCultivars().find(function(c){ return c.id === cvId; });
          if (!cv) return getPlantingSnapshot();
          deps.applyVfProfileToStateOnly(deps.buildDefaultVfStandards(cv), cv);
          deps.getState().multicut = !!cv.multicut;
          r = deps.calcFromVfSheet(cv);
          snap = buildPlantingSnapshot(r, cv);
          snap.profileSource = deps.hasEconSavedProfile(cvId) ? 'saved' : 'default';
          return snap;
        }
        cv = deps.allGhCultivars().find(function(c){ return c.id === cvId; });
        if (!cv || deps.isVfCvId(cvId)) return getPlantingSnapshot();
        state = deps.getState();
        state.facility = 'greenhouse';
        state.cv = cv.id;
        deps.applyGhProfileToStateOnly(deps.getGhCvStandards(cv), cv);
        state.multicut = !!cv.multicut;
        r = deps.calc();
        snap = buildPlantingSnapshot(r, cv);
        snap.profileSource = deps.hasEconSavedProfile(cvId) ? 'saved' : 'default';
        return snap;
      } finally {
        restorePlantingStateEconSlice(saved);
      }
    }

    function getSaladMixSnapshot(){
      var snaps = deps.ECON_SALAD_MIX_CV_IDS.map(function(id){
        return getPlantingSnapshotForCvId(id);
      }).filter(Boolean);
      return averageSnapshots(snaps, T('econ.opt.mix', 'Микс салатов'), deps.ECON_SALAD_MIX_ID);
    }

    return {
      plantingHarvestYieldParams: plantingHarvestYieldParams,
      buildPlantingSnapshot: buildPlantingSnapshot,
      getPlantingSnapshot: getPlantingSnapshot,
      getPlantingStateEconSlice: getPlantingStateEconSlice,
      restorePlantingStateEconSlice: restorePlantingStateEconSlice,
      plantingCvIdMatchesLiveState: plantingCvIdMatchesLiveState,
      getPlantingSnapshotForCvId: getPlantingSnapshotForCvId,
      averageSnapshots: averageSnapshots,
      getSaladMixSnapshot: getSaladMixSnapshot
    };
  }

  global.DG_createPlantingSnapshot = createPlantingSnapshot;
})(typeof window !== 'undefined' ? window : this);
