/**
 * PPFD/DLI и КПД светильников.
 * DG_createPlantingLightEnergy(deps)
 */
(function (global) {
  'use strict';

  function createPlantingLightEnergy(deps) {
    function st() { return deps.getState(); }
    function isVF() { return deps.isVF(); }
    function isPalletView() { return deps.isPalletView(); }

  function dliFromPpfd(ppfd, ph){ return ppfd * ph * 0.0036; }
  function ppfdFromDli(dli, ph){ return ph > 0 ? dli / (ph * 0.0036) : 0; }
  const LED_STD_GH = 2.1;
  const LED_VF_MIN = 2.3;
  const LED_VF_MAX = 2.5;

  function ledEfficacy(){
    return (isVF() || isPalletView()) ? st().ledEfficacyVf : st().ledEfficacyGh;
  }
  function kwhPerSqmPerDayFromDli(dli){
    return dli / (ledEfficacy() * 3.6);
  }
    return {
      dliFromPpfd: dliFromPpfd,
      ppfdFromDli: ppfdFromDli,
      ledEfficacy: ledEfficacy,
      kwhPerSqmPerDayFromDli: kwhPerSqmPerDayFromDli,
      LED_STD_GH: LED_STD_GH,
      LED_VF_MIN: LED_VF_MIN,
      LED_VF_MAX: LED_VF_MAX
    };
  }

  global.DG_createPlantingLightEnergy = createPlantingLightEnergy;
})(typeof window !== 'undefined' ? window : globalThis);
