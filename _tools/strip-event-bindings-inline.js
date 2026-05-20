'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let t = fs.readFileSync(p, 'utf8');

const mStart = t.indexOf('  function initPlantingPdfExport(){');
const mEnd = t.indexOf('  window.DG_syncSchemaCanopyLegend = syncSchemaCanopyLegend;');
if (mStart < 0 || mEnd < 0 || mEnd <= mStart) {
  console.error('markers', mStart, mEnd);
  process.exit(1);
}

const scriptTag =
  '<script src="js/planting-event-bindings.js?v=2026-05-19-p71-audit-fixes"></script>\n';
const renderTag = '<script src="js/planting-render.js';
if (!t.includes('planting-event-bindings.js')) {
  const ri = t.indexOf(renderTag);
  if (ri < 0) {
    console.error('render tag missing');
    process.exit(1);
  }
  const lineEnd = t.indexOf('\n', ri);
  t = t.slice(0, lineEnd + 1) + scriptTag + t.slice(lineEnd + 1);
}

const replacement =
  '  function initPlantingPdfExport(){\n' +
  '    if (!window.DG_initPdfExport) return;\n' +
  '    window.DG_initPdfExport({\n' +
  '      renderEconomics: typeof renderEconomics === "function" ? renderEconomics : null,\n' +
  '      renderAll: typeof renderAll === "function" ? renderAll : null,\n' +
  '      getExportMeta: function(){\n' +
  '        var r = calc();\n' +
  '        var cv = getActiveCv();\n' +
  '        var lines = [];\n' +
  "        if (cv) lines.push({ label: ui('ui.pdf.meta.cultivar'), value: cv.name, unit: '' });\n" +
  "        if (r && r.mass != null) lines.push({ label: ui('ui.pdf.meta.mass'), value: r1(r.mass), unit: pm('unit.g') });\n" +
  "        if (r && r.canopy != null) lines.push({ label: ui('ui.pdf.meta.canopy'), value: r1(r.canopy), unit: pm('unit.mm') });\n" +
  "        if (r && r.total != null) lines.push({ label: ui('ui.pdf.meta.plants'), value: fmtNum(r.total), unit: pm('u.pcs') });\n" +
  "        if (r && r.sysArea != null) lines.push({ label: ui('ui.pdf.meta.area'), value: r2(r.sysArea), unit: tr('sum.unit.sqm') });\n" +
  "        var mode = state.appView === 'pallets' ? tr('mode.pallets') : (state.facility === 'vertical' ? tr('mode.vf') : tr('mode.gh'));\n" +
  "        if (state.appView === 'economics') mode = tr('mode.economics');\n" +
  "        lines.push({ label: ui('ui.pdf.meta.mode'), value: mode, unit: '' });\n" +
  "        var tEl = $('page-title');\n" +
  "        var s = $('page-sub');\n" +
  '        return {\n' +
  "          title: tEl ? tEl.textContent : ui('ui.pdf.meta.titleFallback'),\n" +
  "          subtitle: s ? s.textContent : '',\n" +
  "          date: new Date().toLocaleDateString((window.DG_getLocale && DG_getLocale() === 'en') ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),\n" +
  '          build: CALC_BUILD,\n' +
  '          lines: lines\n' +
  '        };\n' +
  '      },\n' +
  '      pdfFilename: function(){\n' +
  '        var cv = getActiveCv();\n' +
  "        var slug = (cv && cv.name) ? String(cv.name).replace(/[^a-zA-ZЀ-ӿ0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) : 'calc';\n" +
  "        return 'daogreen-' + (slug || 'calc') + '-' + new Date().toISOString().slice(0, 10);\n" +
  '      }\n' +
  '    });\n' +
  '  }\n\n' +
  '  var _eventBindings;\n' +
  '  function plantingEventDeps(){\n' +
  '    return {\n' +
  '      getState: function(){ return state; },\n' +
  '      getGeorgyMode: function(){ return georgyMode; },\n' +
  '      georgyMode: georgyMode,\n' +
  '      canopyDensityUi: canopyDensityUi,\n' +
  '      $: $, clamp: clamp, parseNumInput: parseNumInput,\n' +
  '      VF_CULTIVARS: VF_CULTIVARS, FACILITY_KEY: FACILITY_KEY, APP_VIEW_KEY: APP_VIEW_KEY,\n' +
  '      CALC_BUILD: CALC_BUILD, ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,\n' +
  '      lightEnergy: _lightEnergy,\n' +
  '      renderAll: renderAll, renderCultivars: renderCultivars, renderMonths: renderMonths,\n' +
  '      renderEconomics: renderEconomics, renderGhStandardsPanel: renderGhStandardsPanel,\n' +
  '      renderVfStandardsPanel: renderVfStandardsPanel, renderVfStdGrid: renderVfStdGrid,\n' +
  '      renderGhYieldTotals: renderGhYieldTotals, calc: calc, setFacility: setFacility,\n' +
  '      setAppView: setAppView, isVF: isVF, isPalletView: isPalletView, getCv: getCv,\n' +
  '      getVfCv: getVfCv, getActiveCv: getActiveCv, getCompareList: getCompareList,\n' +
  '      comparePickActiveId: comparePickActiveId, ensureComparePick: ensureComparePick,\n' +
  '      ghCutCountMax: ghCutCountMax, syncGhCutsUI: syncGhCutsUI, syncGhYieldMarginSliders: syncGhYieldMarginSliders,\n' +
  '      syncVfSlidersFromState: syncVfSlidersFromState, syncPalletZoneLength: syncPalletZoneLength,\n' +
  '      syncPalletPlantsHint: syncPalletPlantsHint, syncPalletCellButtons: syncPalletCellButtons,\n' +
  '      syncPalletMountButtons: syncPalletMountButtons, syncManualMassUI: syncManualMassUI,\n' +
  '      syncCutMassUI: syncCutMassUI, syncMulticutDetailUI: syncMulticutDetailUI,\n' +
  '      syncCanopyUI: syncCanopyUI, syncHarvestBlockUI: syncHarvestBlockUI, syncVfStdBadges: syncVfStdBadges,\n' +
  '      unlockPlantingStdForControl: unlockPlantingStdForControl, initCollapseBlocks: initCollapseBlocks,\n' +
  '      bindVfStdBadges: bindVfStdBadges, modelCanopyFromMass: modelCanopyFromMass,\n' +
  '      applyCanopyStandard: applyCanopyStandard, applyGhStandardFromStore: applyGhStandardFromStore,\n' +
  '      applyVfStandardFromStore: applyVfStandardFromStore, applyVfStandardField: applyVfStandardField,\n' +
  '      readGhStandardsFromState: readGhStandardsFromState, readVfStandardsFromState: readVfStandardsFromState,\n' +
  '      saveGhStandardsStore: saveGhStandardsStore, saveVfStandardsStore: saveVfStandardsStore,\n' +
  '      buildDefaultGhStandards: buildDefaultGhStandards, buildDefaultVfStandards: buildDefaultVfStandards,\n' +
  '      resetVfStdToSheetDefaults: resetVfStdToSheetDefaults, loadGhStandardsStore: loadGhStandardsStore,\n' +
  '      loadVfStandardsStore: loadVfStandardsStore, loadCustomCultivarsStore: loadCustomCultivarsStore,\n' +
  '      loadGhUsefulArea: loadGhUsefulArea, saveGhUsefulArea: saveGhUsefulArea,\n' +
  '      loadEconStore: loadEconStore, saveEconStore: saveEconStore, runPlantingEconImport: runPlantingEconImport,\n' +
  '      ensureEconCultures: ensureEconCultures, canAddEconCulture: canAddEconCulture,\n' +
  '      defaultEconCultureRow: defaultEconCultureRow, econApplyCultureSelect: econApplyCultureSelect,\n' +
  '      getDefaultEconState: getDefaultEconState, calcFarmEconomics: calcFarmEconomics,\n' +
  '      migrateEconOtherElectricity: migrateEconOtherElectricity, syncEconInputsFromState: syncEconInputsFromState,\n' +
  '      dliFromPpfd: dliFromPpfd, ppfdFromDli: ppfdFromDli, harvestChannel: harvestChannel,\n' +
  '      addCustomGhCultivar: addCustomGhCultivar, addCustomVfCultivar: addCustomVfCultivar,\n' +
  '      blankGhCultivarTemplate: blankGhCultivarTemplate, blankVfCultivarTemplate: blankVfCultivarTemplate,\n' +
  '      showError: showError, showToast: showToast, ui: ui, pr: pr, r1: r1, r2: r2,\n' +
  '      mergeLocaleDeps: mergeLocaleDeps, runWithState: runWithState, htmlEsc: htmlEsc,\n' +
  '      updatePageSub: updatePageSub, updateCalcBuildBadge: updateCalcBuildBadge,\n' +
  '      applyProjectState: applyProjectState, initPdfExport: initPlantingPdfExport,\n' +
  '      DG_initProjectStore: window.DG_initProjectStore,\n' +
  '      DG_applyEconPreset: window.DG_applyEconPreset,\n' +
  '      DG_econPresetLabel: window.DG_econPresetLabel,\n' +
  '      DG_exportEconCsv: window.DG_exportEconCsv,\n' +
  '      DG_fmtMoneyPlain: window.DG_fmtMoneyPlain\n' +
  '    };\n' +
  '  }\n\n' +
  '  _eventBindings = global.DG_createPlantingEventBindings(plantingEventDeps());\n' +
  '  _eventBindings.bindEvents();\n' +
  '  _eventBindings.bootApp();\n\n';

t = t.slice(0, mStart) + replacement + t.slice(mEnd);
fs.writeFileSync(p, t, 'utf8');
console.log('stripped event handlers inline, bytes saved ~', mEnd - mStart);
