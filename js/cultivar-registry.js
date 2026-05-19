/** Сорта: id, списки, активный cv — DG_createCultivarRegistry */
(function(global){
  'use strict';

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

    function getCv(){
      return allGhCultivars().find(c => c.id === st().cv) || allGhCultivars()[0];
    }
    function getPalletCv(){
      const list = allPalletCultivars();
      return list.find(c => c.id === st().palletCv) || list[0];
    }
    function getVfCv(){
      const list = allVfCultivars();
      return list.find(c => c.id === st().vfCv) || list[0];
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
      if (isPalletCvId(id)) return allPalletCultivars().find(c => c.id === id) || null;
      if (isVfCvId(id)) return allVfCultivars().find(c => c.id === id) || null;
      const gh = allGhCultivars().find(c => c.id === id);
      if (gh) return gh;
      return allVfCultivars().find(c => c.id === id) || allPalletCultivars().find(c => c.id === id) || null;
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
