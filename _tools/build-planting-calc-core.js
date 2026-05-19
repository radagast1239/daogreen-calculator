'use strict';
const fs = require('fs');
const path = require('path');

function extractBody(file) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/var lightSync = false;\s*\n([\s\S]*?)\s*return api;/);
  if (!m) throw new Error('body in ' + file);
  return m[1];
}

const calcBody = extractBody(path.join(__dirname, '..', 'js/planting-calc-core-temp.js'));

const depsHelpers = `    function georgyModeRef() {
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }
    function findCvById(id) { return deps.findCvById(id); }
    function getCv() { return deps.getCv(); }
    function getVfCv() { return deps.getVfCv(); }
    function getPalletCv() { return deps.getPalletCv(); }
    function isPalletView() { return deps.isPalletView(); }
    function isVF() { return deps.isVF(); }
    function allPalletCultivars() { return deps.allPalletCultivars(); }
    function allVfCultivars() { return deps.allVfCultivars(); }
    function harvestChannel(cv) { return deps.harvestChannel(cv); }
    function totalAge(d) { return deps.totalAge(d); }
    function massAtTotal(cv, t) { return deps.massAtTotal(cv, t); }
    function plantLayout(cv) { return deps.plantLayout(cv); }
    function plantLayoutPallet() { return deps.plantLayoutPallet(); }
    function effectiveCa(cv) { return deps.effectiveCa(cv); }
    function crowdingFactor(a, b) { return deps.crowdingFactor(a, b); }
    function manualHarvestMass(m) { return deps.manualHarvestMass(m); }
    function preChannelDays() { return deps.preChannelDays(); }
    function lightingMolForEnergy() { return deps.lightingMolForEnergy(); }
    function kwhPerSqmPerDayFromDli(d) { return deps.kwhPerSqmPerDayFromDli(d); }
    function dliFactor() { return deps.dliFactor(); }
    function effectiveTempFactor(cv) { return deps.effectiveTempFactor(cv); }
    function tempFactor(cv) { return deps.tempFactor(cv); }
    function naturalDLI() { return deps.naturalDLI(); }
    function effectiveDLI() { return deps.effectiveDLI(); }
    function boltShift(cv) { return deps.boltShift(cv); }
    function calcFromVfSheet(cv) { return deps.calcFromVfSheet(cv); }
    function calcFromPalletSheet(cv) { return deps.calcFromPalletSheet(cv); }
    function applyPalletStandardsFromSheet(cv, o) { return deps.applyPalletStandardsFromSheet(cv, o); }
    function getPlantingStateEconSlice() { return deps.getPlantingStateEconSlice(); }
    function restorePlantingStateEconSlice(s) { return deps.restorePlantingStateEconSlice(s); }
    function canopyAtTotal(cv, t) { return deps.canopyAtTotal(cv, t); }
    function applyCutIntervalHarvestMods(cv, m, c) { return deps.applyCutIntervalHarvestMods(cv, m, c); }
    function rgrAtTotal(cv, t) { return deps.rgrAtTotal(cv, t); }
    function boltChannel(cv) { return deps.boltChannel(cv); }
    function stageOf(a, b, c, cv) { return deps.stageOf(a, b, c, cv); }
    function holeDiameter(cv) { return deps.holeDiameter(cv); }
    function harvestCanopy(cv, m) { return deps.harvestCanopy(cv, m); }
    var MAX_WIDTH = deps.MAX_WIDTH || 2000;
    var CH_W = deps.CH_W || 110;
`;

const body = calcBody.replace(/\bgeorgyMode\b/g, 'georgyModeRef()').replace(/georgyModeRef\(\)Ref\(\)/g, 'georgyModeRef()');

const out =
  '/**\n * calc(), calcScenario* — ядро расчёта посадки.\n * DG_createPlantingCalcCore(deps)\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingCalcCore(deps) {\n' +
  '    function st() { return deps.getState(); }\n' +
  depsHelpers +
  '\n' +
  body +
  '\n    return {\n' +
  '      calcScenario: calcScenario,\n' +
  '      calcScenarioVf: calcScenarioVf,\n' +
  '      calcScenarioPallet: calcScenarioPallet,\n' +
  '      calc: calc\n' +
  '    };\n  }\n\n' +
  '  global.DG_createPlantingCalcCore = createPlantingCalcCore;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";

fs.writeFileSync(path.join(__dirname, '..', 'js/planting-calc-core.js'), out);

const lightSrc = fs.readFileSync(path.join(__dirname, '..', 'js/planting-light-energy-temp.js'), 'utf8');
const lightBody = extractBody(path.join(__dirname, '..', 'js/planting-light-energy-temp.js'));
const lightOut =
  '/**\n * PPFD/DLI и КПД светильников.\n * DG_createPlantingLightEnergy(deps)\n */\n' +
  '(function (global) {\n' +
  "  'use strict';\n\n" +
  '  function createPlantingLightEnergy(deps) {\n' +
  '    function st() { return deps.getState(); }\n' +
  '    function isVF() { return deps.isVF(); }\n' +
  '    function isPalletView() { return deps.isPalletView(); }\n' +
  '\n' +
  lightBody +
  '\n    return {\n' +
  '      dliFromPpfd: dliFromPpfd,\n' +
  '      ppfdFromDli: ppfdFromDli,\n' +
  '      ledEfficacy: ledEfficacy,\n' +
  '      kwhPerSqmPerDayFromDli: kwhPerSqmPerDayFromDli,\n' +
  '      LED_STD_GH: LED_STD_GH,\n' +
  '      LED_VF_MIN: LED_VF_MIN,\n' +
  '      LED_VF_MAX: LED_VF_MAX\n' +
  '    };\n  }\n\n' +
  '  global.DG_createPlantingLightEnergy = createPlantingLightEnergy;\n' +
  "})(typeof window !== 'undefined' ? window : globalThis);\n";
fs.writeFileSync(path.join(__dirname, '..', 'js/planting-light-energy.js'), lightOut);

console.log('planting-calc-core.js + planting-light-energy.js ok');
