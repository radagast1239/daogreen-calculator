/**
 * Расстановка растений: каналы в теплице и поддоны 130×65.
 * DG_createPlantingLayout(deps) — вызывается из основного калькулятора.
 */
(function (global) {
  'use strict';

  function createPlantingLayout(deps) {
    var C = deps.constants || global.DG_PLANTING_CONSTANTS || {};
    var CH_W = C.CH_W || 110;
    var PALLET_L_MM = C.PALLET_L_MM || 1300;
    var PALLET_W_MM = C.PALLET_W_MM || 650;
    var PALLET_L_M = C.PALLET_L_M || 1.3;
    var PALLET_W_M = C.PALLET_W_M || 0.65;
    var CASSETTES_PER_PALLET = C.CASSETTES_PER_PALLET || 3;
    var PALLET_TIER_ZONE_MM = C.PALLET_TIER_ZONE_MM || 400;
    var HMD = C.DAYS_PER_MONTH || 30.5;

    function st() {
      return deps.getState();
    }

    function plantLayout(cv) {
      cv = cv || deps.getCv();
      if (deps.isPalletView()) return plantLayoutPallet();
      var state = st();
      var rhoT = state.density;
      var Lmm = state.length * 1000;
      var margin = 50;
      var f = state.offset / 100;
      var ratio = Math.sqrt(1 - f * f);
      var a = 1000 / Math.sqrt(rhoT * ratio);
      var b = a * ratio;
      var constrained = false;
      if (b < CH_W) {
        b = CH_W;
        a = 1e6 / (rhoT * b);
        constrained = true;
      }
      b = b + state.extraB;
      var rhoA = 1e6 / (a * b);
      var offMm = a * f;
      var diag = Math.sqrt(offMm * offMm + b * b);
      var nearest = state.offset === 0 ? Math.min(a, b) : Math.min(a, diag);
      var alongOne = Math.max(1, Math.floor((Lmm - 2 * margin) / a) + 1);
      var twoRow = deps.georgyChannelTwoRows && deps.georgyChannelTwoRows();
      var perRow = alongOne;
      var perChan = twoRow ? alongOne * 2 : alongOne;
      var total = perChan * state.nch;
      var sysWmm = (state.nch - 1) * b + CH_W;
      var sysArea = (sysWmm / 1000) * state.length;
      return {
        a: a,
        b: b,
        f: f,
        ratio: ratio,
        rhoA: rhoA,
        offMm: offMm,
        diag: diag,
        nearest: nearest,
        perChan: perChan,
        perRow: perRow,
        total: total,
        sysWmm: sysWmm,
        sysArea: sysArea,
        constrained: constrained,
        vfMode: twoRow
      };
    }

    function plantLayoutPallet(cellsOverride) {
      if (deps.getPalletCv && global.DG_isTrayLotCrop && global.DG_isTrayLotCrop(deps.getPalletCv())) {
        return plantLayoutTrayLot();
      }
      if (deps.syncPalletZoneLength) deps.syncPalletZoneLength();
      var state = st();
      var mount = deps.palletMountMode();
      var cells = cellsOverride != null ? cellsOverride : deps.effectivePalletHoleCount();
      var geo = deps.palletCellGeometry(cells, mount);
      var perPallet = geo.perPallet;
      var along = Math.max(1, state.palletsAlong || 1);
      var across = Math.max(1, state.nch);
      var pitchW = PALLET_W_MM;
      var zoneLenMm = along * PALLET_L_MM;
      var totalPallets = along * across;
      var tiers = Math.max(1, state.palletTiers || 1);
      var plantsPerTier = totalPallets * perPallet;
      var total = plantsPerTier * tiers;
      var palletAreaM2 = PALLET_L_M * PALLET_W_M;
      var footprintAreaM2 = totalPallets * palletAreaM2;
      var sysArea = footprintAreaM2 * tiers;
      var sysWmm = (across - 1) * pitchW + PALLET_W_MM;
      var rhoA = sysArea > 0 ? total / sysArea : 0;
      var tierGap = state.tierGapMm || 350;
      var rackHeightMm = tiers * tierGap + PALLET_TIER_ZONE_MM;
      return {
        palletMode: true,
        mountMode: mount,
        alongLength: along,
        acrossPallets: across,
        zoneLenMm: zoneLenMm,
        totalPallets: totalPallets,
        plantsPerPallet: perPallet,
        cellsPerCassette: cells,
        cassettesPerPallet: mount === 'cassette' ? CASSETTES_PER_PALLET : 0,
        cassetteL: geo.cassetteL,
        cassetteW: geo.cassetteW,
        cellPitch: geo.cellPitch,
        cellD: geo.cellD,
        cassettePitch: geo.cassetteL,
        perChan: perPallet,
        perRow: along,
        total: total,
        plantsPerTier: plantsPerTier,
        footprintAreaM2: footprintAreaM2,
        rhoA: rhoA,
        rhoT: rhoA,
        sysWmm: sysWmm,
        sysArea: sysArea,
        a: deps.round(geo.cellPitch),
        b: pitchW,
        nearest: geo.cellPitch,
        offMm: 0,
        diag: geo.cellPitch,
        ratio: 1,
        constrained: false,
        vfMode: false,
        maxChannelsFit: across,
        palletTiers: tiers,
        tierGapMm: tierGap,
        rackHeightMm: rackHeightMm,
        totalPlantsAllTiers: total,
        totalPalletSlots: totalPallets * tiers
      };
    }

    function plantLayoutTrayLot() {
      if (deps.syncPalletZoneLength) deps.syncPalletZoneLength();
      var state = st();
      var trayD = global.DG_TRAY_LOT_DENSITY || 45;
      var along = Math.max(1, state.palletsAlong || 1);
      var across = Math.max(1, state.nch || 1);
      var tiers = Math.max(1, state.palletTiers || 1);
      var totalPallets = along * across;
      var palletAreaM2 = PALLET_L_M * PALLET_W_M;
      var footprintAreaM2 = totalPallets * palletAreaM2;
      var sysArea = footprintAreaM2 * tiers;
      var rhoA = trayD;
      var traysPerPallet = Math.round(rhoA * palletAreaM2);
      var total = Math.round(rhoA * sysArea);
      var pitchW = PALLET_W_MM;
      var sysWmm = (across - 1) * pitchW + PALLET_W_MM;
      var tierGap = state.tierGapMm || 350;
      var rackHeightMm = tiers * tierGap + PALLET_TIER_ZONE_MM;
      return {
        palletMode: true,
        trayLot: true,
        mountMode: 'tray',
        alongLength: along,
        acrossPallets: across,
        zoneLenMm: along * PALLET_L_MM,
        totalPallets: totalPallets,
        plantsPerPallet: traysPerPallet,
        cellsPerCassette: 0,
        cassettesPerPallet: 0,
        cellPitch: 0,
        cellD: 0,
        perChan: traysPerPallet,
        perRow: along,
        total: total,
        plantsPerTier: traysPerPallet * totalPallets,
        footprintAreaM2: footprintAreaM2,
        rhoA: rhoA,
        rhoT: rhoA,
        sysWmm: sysWmm,
        sysArea: sysArea,
        a: 0,
        b: pitchW,
        nearest: 0,
        offMm: 0,
        diag: 0,
        ratio: 1,
        constrained: false,
        vfMode: false,
        maxChannelsFit: across,
        palletTiers: tiers,
        tierGapMm: tierGap,
        rackHeightMm: rackHeightMm,
        totalPlantsAllTiers: total,
        totalPalletSlots: totalPallets * tiers
      };
    }

    return {
      DAYS_PER_MONTH: HMD,
      plantLayout: plantLayout,
      plantLayoutPallet: plantLayoutPallet
    };
  }

  global.DG_createPlantingLayout = createPlantingLayout;
})(typeof window !== 'undefined' ? window : global);
