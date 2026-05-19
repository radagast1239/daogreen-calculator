'use strict';
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const lines = html.split(/\r?\n/);

// state object → factory
const stateStart = lines.findIndex((l) => /const todayISO = \(\(\) =>/.test(l));
const georgyRow = lines.findIndex((l) => /georgyChannel2Rows/.test(l));
if (stateStart < 0 || georgyRow < 0) throw new Error('state block markers');
const stateCloseLine = georgyRow + 1;
if (!/^\s*\};\s*$/.test(lines[stateCloseLine])) throw new Error('state close line');

lines.splice(
  stateStart,
  stateCloseLine - stateStart + 1,
  '  var state = global.DG_createDefaultPlantingState(global);'
);

// late init block
const lateStart = lines.findIndex((l) => /^\s*var georgyMode;\s*$/.test(l));
const lateEnd = lines.findIndex((l, idx) => idx > lateStart && /^\s*canopyDensityUi: canopyDensityUi, plantingGuides: plantingGuides, simpleUiMode: simpleUiMode\s*$/.test(l));
if (lateStart < 0 || lateEnd < 0) throw new Error('late init markers');
const renderClose = lines.findIndex((l, idx) => idx > lateEnd && /^\s*\}\);\s*$/.test(l));
if (renderClose < 0) throw new Error('render }); not found');

const wire = `  const CALC_BUILD = '2026-05-19-p71-audit-fixes';

  function plantingLateInitDeps(){
    return {
      getState: function(){ return state; },
      $: $, clamp: clamp,
      HARVEST_MONTH_DAYS: HARVEST_MONTH_DAYS,
      ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,
      ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,
      supportsMulticut: supportsMulticut,
      effectiveCutInterval: effectiveCutInterval,
      cutMassPerPlant: cutMassPerPlant,
      getMulticutYieldPerPlant: getMulticutYieldPerPlant,
      isVfSheetCv: isVfSheetCv,
      isPalletView: isPalletView,
      isVF: isVF,
      lightingMolForEnergy: lightingMolForEnergy,
      kwhPerSqmPerDayFromDli: kwhPerSqmPerDayFromDli,
      effectivePhotoperiod: effectivePhotoperiod,
      calc: calc,
      calcFromPalletSheet: calcFromPalletSheet,
      calcFromVfSheet: calcFromVfSheet,
      findCvById: findCvById,
      isPalletCvId: isPalletCvId,
      isVfCvId: isVfCvId,
      allPalletCultivars: allPalletCultivars,
      allVfCultivars: allVfCultivars,
      allGhCultivars: allGhCultivars,
      applyPalletStandardsFromSheet: applyPalletStandardsFromSheet,
      applyVfProfileToStateOnly: applyVfProfileToStateOnly,
      applyGhProfileToStateOnly: applyGhProfileToStateOnly,
      getGhCvStandards: getGhCvStandards,
      buildDefaultVfStandards: buildDefaultVfStandards,
      getCv: getCv,
      plantLayout: plantLayout,
      massAtTotal: massAtTotal,
      harvestCanopy: harvestCanopy,
      crowdingFactor: crowdingFactor,
      effectiveCa: effectiveCa,
      boltShift: boltShift,
      boltChannel: boltChannel,
      tempFactor: tempFactor,
      naturalDLI: naturalDLI,
      effectiveDLI: effectiveDLI,
      setFacility: setFacility,
      renderAll: renderAll,
      renderCultivars: renderCultivars,
      dliFactor: dliFactor,
      photoperiodFactor: photoperiodFactor,
      cutIntervalMods: cutIntervalMods,
      syncVegPeriodTotal: syncVegPeriodTotal,
      ui: ui, pt: pt, pm: pm, pr: pr, tr: tr,
      fmtNumRu: fmtNumRu, catalogPhrase: catalogPhrase, cvSubLine: cvSubLine,
      r1: r1, r2: r2, round: round, htmlEsc: htmlEsc,
      getActiveCv: getActiveCv, getVfCv: getVfCv, getPalletCv: getPalletCv,
      isGreenhousePlanting: isGreenhousePlanting,
      isChannelGreenhouse: isChannelGreenhouse,
      usePlantingSheet: usePlantingSheet,
      getPlantingStd: getPlantingStd,
      getGhUsefulAreaM2: getGhUsefulAreaM2,
      ghYieldWithMargin: ghYieldWithMargin,
      ghYieldKgSqmYear: ghYieldKgSqmYear,
      syncGhYieldControls: syncGhYieldControls,
      syncGhYieldMarginSliders: syncGhYieldMarginSliders,
      syncBioMarginVisibility: syncBioMarginVisibility,
      rangeMass: rangeMass, rangeCanopy: rangeCanopy, rangeDay: rangeDay,
      initPalletValuesFromSheet: initPalletValuesFromSheet,
      resetVfStdToSheetDefaults: resetVfStdToSheetDefaults,
      applyVfStandardsFromSheet: applyVfStandardsFromSheet,
      syncVfStdControls: syncVfStdControls,
      renderGhStandardsPanel: renderGhStandardsPanel,
      renderVfStandardsPanel: renderVfStandardsPanel,
      renderVfStdGrid: renderVfStdGrid,
      updatePlantingGeomUI: updatePlantingGeomUI,
      syncGhFacilityPanels: syncGhFacilityPanels,
      syncGhCutsUI: syncGhCutsUI,
      syncCanopyUI: syncCanopyUI,
      syncManualMassUI: syncManualMassUI,
      syncMoneySliderDisplays: syncMoneySliderDisplays,
      updatePageSub: updatePageSub,
      updateCalcBuildBadge: updateCalcBuildBadge,
      showError: showError,
      monthLabel: monthLabel,
      stageOf: stageOf,
      holeDiameter: holeDiameter,
      plantLayoutPallet: plantLayoutPallet,
      schemaCanopyMm: schemaCanopyMm,
      syncSchemaCanopyLegend: syncSchemaCanopyLegend,
      palletCellGeometry: palletCellGeometry,
      getCellCenters: getCellCenters,
      supplementDLI: supplementDLI,
      photoperiod: photoperiod,
      eveningHours: eveningHours,
      effectiveTempFactor: effectiveTempFactor,
      greenhouseHeatYieldLossPct: greenhouseHeatYieldLossPct,
      canopyAtTotal: canopyAtTotal,
      harvestChannel: harvestChannel,
      totalAge: totalAge,
      preChannelDays: preChannelDays,
      vfMulticutStats: vfMulticutStats,
      ICON: ICON,
      CV_COLORS: CV_COLORS,
      COLLAPSE_DEFAULTS: COLLAPSE_DEFAULTS,
      CALC_BUILD: CALC_BUILD,
      PALLET_SECTIONS: PALLET_SECTIONS,
      VF_SECTIONS: VF_SECTIONS,
      CULTIVARS: CULTIVARS,
      addCustomGhCultivar: addCustomGhCultivar,
      addCustomVfCultivar: addCustomVfCultivar,
      removeCustomCultivar: removeCustomCultivar,
      renderEconomics: function(){
        return typeof renderEconomics === 'function' ? renderEconomics() : undefined;
      }
    };
  }

  var _lateInitApi = global.DG_createPlantingLateInit(plantingLateInitDeps());
  _lateInitApi.install();
  _render = _lateInitApi.getRender();
  var georgyMode = _lateInitApi.getGeorgyMode();
  var plantingHarvestYieldParams = _lateInitApi.plantingHarvestYieldParams;
  var buildPlantingSnapshot = _lateInitApi.buildPlantingSnapshot;
  var getPlantingSnapshot = _lateInitApi.getPlantingSnapshot;
  var getPlantingStateEconSlice = _lateInitApi.getPlantingStateEconSlice;
  var restorePlantingStateEconSlice = _lateInitApi.restorePlantingStateEconSlice;
  var plantingCvIdMatchesLiveState = _lateInitApi.plantingCvIdMatchesLiveState;
  var getPlantingSnapshotForCvId = _lateInitApi.getPlantingSnapshotForCvId;
  var averageSnapshots = _lateInitApi.averageSnapshots;
  var getSaladMixSnapshot = _lateInitApi.getSaladMixSnapshot;
  var canopyDensityUi = _lateInitApi.canopyDensityUi();
  var simpleUiMode = _lateInitApi.simpleUiMode();
  var plantingGuides = _lateInitApi.plantingGuides();`;

lines.splice(lateStart, renderClose - lateStart + 1, wire);

// remove duplicate CALC_BUILD if present after wire
const dupBuild = lines.findIndex((l, idx) => idx > lateStart && /^\s*const CALC_BUILD = /.test(l));
if (dupBuild >= 0 && lines[dupBuild].trim() === "const CALC_BUILD = '2026-05-19-p71-audit-fixes';") {
  // keep first (in wire), remove second
  const dup2 = lines.findIndex((l, idx) => idx > dupBuild + 5 && /^\s*const CALC_BUILD = /.test(l));
  if (dup2 >= 0) lines.splice(dup2, 1);
}

// public API block
const pubStart = lines.findIndex((l) => /function syncPreviewSlidersToState\(\)/.test(l));
const pubEndClose = lines.findIndex((l, idx) => idx > pubStart && /^\s*window\.DaoGreenCalc = \{/.test(lines[idx - 1] || lines[idx]));
// end at closing `};` of DaoGreenCalc (line after diagnose block's `    }`)
let pubScan = pubStart;
while (pubScan < lines.length && !/window\.DaoGreenCalc = \{/.test(lines[pubScan])) pubScan++;
if (pubScan >= lines.length) throw new Error('DaoGreenCalc block not found');
pubEndClose = lines.findIndex((l, idx) => idx > pubScan && /^\s*\};\s*$/.test(l) && /germination:/.test(lines.slice(pubScan, idx).join('\n')));
if (pubEndClose < 0) {
  pubEndClose = lines.findIndex((l, idx) => idx > pubScan + 5 && /^\s*\};\s*$/.test(l));
}
if (pubStart < 0 || pubEndClose < 0) throw new Error('public api markers: ' + pubStart + ' ' + pubEndClose);

const pubWire = `  global.DG_installPlantingPublicApi({
    getState: function(){ return state; },
    $: $,
    r1: r1,
    setFacility: setFacility,
    setAppView: setAppView,
    renderCultivars: renderCultivars,
    renderAll: renderAll,
    renderEconomics: renderEconomics,
    calc: calc,
    applyProjectState: applyProjectState,
    migrateEconOtherElectricity: migrateEconOtherElectricity,
    calcFarmEconomics: calcFarmEconomics,
    allPalletCultivars: allPalletCultivars,
    allVfCultivars: allVfCultivars,
    CALC_BUILD: CALC_BUILD
  });`;

lines.splice(pubStart, pubEndClose - pubStart + 1, pubWire);

html = lines.join('\n');

// script tags
const buildId = '2026-05-19-p71-audit-fixes';
if (!html.includes('planting-state.js')) {
  html = html.replace(
    '<script src="js/planting-constants.js?v=' + buildId + '"></script>',
    '<script src="js/planting-constants.js?v=' + buildId + '"></script>\n' +
      '<script src="js/planting-state.js?v=' + buildId + '"></script>'
  );
}
if (!html.includes('planting-late-init.js')) {
  html = html.replace(
    '<script src="js/planting-render.js?v=' + buildId + '"></script>',
    '<script src="js/planting-render.js?v=' + buildId + '"></script>\n' +
      '<script src="js/planting-late-init.js?v=' + buildId + '"></script>'
  );
}
if (!html.includes('planting-public-api.js')) {
  html = html.replace(
    '<script src="js/planting-app-nav.js?v=' + buildId + '"></script>',
    '<script src="js/planting-app-nav.js?v=' + buildId + '"></script>\n' +
      '<script src="js/planting-public-api.js?v=' + buildId + '"></script>'
  );
}

fs.writeFileSync(htmlPath, html);
console.log('stripped bootstrap inline, lines:', lines.length);
