/** Сорта: id, списки, активный cv — DG_createCultivarRegistry */
(function(global){
  'use strict';

  var CV_ID_ALIASES = { romaine: 'little-gem' };

  function resolveCvId(id){
    return id && CV_ID_ALIASES[id] ? CV_ID_ALIASES[id] : id;
  }

  function createCultivarRegistry(deps){
    function st(){ return deps.getState(); }

    function isPalletView(){ return st().appView === 'pallets'; }
    function isVF(){ return st().facility === 'vertical'; }

    function isVfCvId(cvId){
      return !!(cvId && (cvId.indexOf('vf-') === 0 || cvId.indexOf('custom-vf-') === 0));
    }
    function allGhCultivars(){ return deps.CULTIVARS.concat(st().customGhCultivars || []); }
    function allVfCultivars(){ return deps.VF_CULTIVARS.concat(st().customVfCultivars || []); }
    function isPalletCvId(cvId){ return !!(cvId && cvId.indexOf('pl-') === 0); }
    function allPalletCultivars(){ return deps.PALLET_CULTIVARS; }
    function isPalletSheetCv(cv){ return !!(cv && cv.palletSheet); }

    function withFarmPatch(cv){
      if (!cv) return cv;
      if (deps.applyFarmCvPatch) return deps.applyFarmCvPatch(cv);
      if (global.DG_farmCalibrationRef && global.DG_farmCalibrationRef.applyFarmCvPatch){
        return global.DG_farmCalibrationRef.applyFarmCvPatch(cv);
      }
      return cv;
    }
    function getCv(){
      var id = resolveCvId(st().cv);
      var cv = allGhCultivars().find(c => c.id === id) || allGhCultivars()[0];
      return withFarmPatch(cv);
    }
    function getPalletCv(){
      const list = allPalletCultivars();
      var cv = list.find(c => c.id === st().palletCv) || list[0];
      return withFarmPatch(cv);
    }
    function getVfCv(){
      const list = allVfCultivars();
      var cv = list.find(c => c.id === st().vfCv) || list[0];
      return withFarmPatch(cv);
    }
    function getActiveCv(){
      if (isPalletView()) return getPalletCv() || allPalletCultivars()[0] || getCv();
      return isVF() ? getVfCv() : getCv();
    }
    function getSheetCv(){
      if (isPalletView()) return getPalletCv();
      if (isVF()) return getVfCv();
      return null;
    }
    function isSheetCv(cv){ return deps.isVfSheetCv(cv) || isPalletSheetCv(cv); }
    function usePlantingSheet(){
      return (isPalletView() && allPalletCultivars().length) || (isVF() && allVfCultivars().length);
    }
    function findCvById(id){
      if (!id) return null;
      id = resolveCvId(id);
      var cv = null;
      if (isPalletCvId(id)) cv = allPalletCultivars().find(c => c.id === id) || null;
      else if (isVfCvId(id)) cv = allVfCultivars().find(c => c.id === id) || null;
      else {
        cv = allGhCultivars().find(c => c.id === id);
        if (!cv) cv = allVfCultivars().find(c => c.id === id) || allPalletCultivars().find(c => c.id === id) || null;
      }
      return cv ? withFarmPatch(cv) : null;
    }

    return {
      isPalletView: isPalletView,
      isVF: isVF,
      isVfCvId: isVfCvId,
      allGhCultivars: allGhCultivars,
      allVfCultivars: allVfCultivars,
      isPalletCvId: isPalletCvId,
      allPalletCultivars: allPalletCultivars,
      isPalletSheetCv: isPalletSheetCv,
      getCv: getCv,
      getPalletCv: getPalletCv,
      getVfCv: getVfCv,
      getActiveCv: getActiveCv,
      getSheetCv: getSheetCv,
      isSheetCv: isSheetCv,
      usePlantingSheet: usePlantingSheet,
      findCvById: findCvById
    };
  }

  global.DG_createCultivarRegistry = createCultivarRegistry;
})(typeof window !== 'undefined' ? window : this);
