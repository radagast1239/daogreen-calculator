/**
 * Стадии роста, диаметр лунки, переключение подписей GH/VF/поддон.
 * DG_createPlantingGeomUi(deps) — из основного калькулятора.
 */
(function (global) {
  'use strict';

  function createPlantingGeomUi(deps) {
    function st() {
      return deps.getState();
    }

    function stageOf(t_channel, mass, tBoltCh, cv) {
      cv = cv || deps.getCv();
      if (t_channel >= tBoltCh) return 'bolt';
      var mFull = cv.babyGreen ? cv.M_max * 0.85 : 150;
      var mMature = cv.babyGreen ? cv.M_max * 0.65 : 100;
      if (mass >= mFull) return 'full';
      if (mass >= mMature) return 'mature';
      return 'young';
    }

    function holeDiameter(cv) {
      if (deps.isPalletView()) {
        var geo = deps.palletCellGeometry();
        return geo.cellD;
      }
      return st().pot;
    }

    function updatePlantingGeomUI() {
      var $ = deps.$;
      var pt = deps.pt;
      var pallet = deps.isPalletView();
      document.querySelectorAll('.sys-channel-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', pallet);
      });
      document.querySelectorAll('.sys-pallet-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', !pallet);
      });
      var lenCh = $('ctrl-length-channel');
      var lenPal = $('ctrl-pallets-along');
      if (lenCh) lenCh.classList.toggle('env-block-hidden', pallet);
      if (lenPal) lenPal.classList.toggle('env-block-hidden', !pallet);
      var nchLbl = $('nch-label');
      if (nchLbl) nchLbl.textContent = pallet ? pt('nchPal') : pt('nchCh');
      var nchEl = $('nch');
      if (nchEl) nchEl.max = pallet ? '99' : '20';
      var extraCtrl = $('ctrl-extraB');
      if (extraCtrl) extraCtrl.classList.toggle('env-block-hidden', pallet);
      if (pallet) {
        deps.syncPalletZoneLength();
        deps.syncPalletMountButtons();
        deps.syncPalletPlantsHint();
        deps.syncPalletTierHint();
      }
      var secTitle = $('system-section-title');
      if (secTitle) {
        secTitle.textContent = pallet ? pt('sys.titlePal') : pt('sys.titleCh');
        secTitle.classList.toggle('env-block-hidden', pallet);
      }
      var geomTitle = $('geom-section-title');
      if (geomTitle) geomTitle.textContent = pallet ? pt('geom.titlePal') : pt('geom.titleCh');
      var palletGeomTitle = $('pallet-geom-inputs-title');
      if (palletGeomTitle) palletGeomTitle.textContent = pt('geom.titlePal');
      var palletGeomPanel = $('panel-pallet-geom');
      if (palletGeomPanel) palletGeomPanel.classList.toggle('env-block-hidden', !pallet);
      var canopyTitle = $('canopy-section-title');
      if (canopyTitle) canopyTitle.textContent = pallet ? pt('canopy.titlePal') : pt('canopy.titleCh');
      var sysMetTitle = $('sys-metrics-section-title');
      if (sysMetTitle) sysMetTitle.textContent = pallet ? pt('sysmet.titlePal') : pt('sysmet.titleCh');
      var kicker = $('page-kicker') || document.querySelector('.kicker');
      if (kicker) {
        kicker.textContent = pallet ? pt('kicker.pal') : deps.isVF() ? pt('kicker.vf') : pt('kicker.ch');
      }
      var title = $('page-title') || document.querySelector('.page-title');
      if (title) {
        title.textContent = pallet ? pt('title.pal') : deps.isVF() ? pt('title.vf') : pt('title.ch');
      }
      deps.syncPalletCellButtons();
      document.querySelectorAll('.gh-geom-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', pallet);
      });
      var facWrap = $('facility-env-wrap');
      if (facWrap) facWrap.classList.toggle('env-block-hidden', pallet);
      document.querySelectorAll('.scen-gh-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', pallet || deps.isVF());
      });
      document.querySelectorAll('.scen-vf-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', !pallet && !deps.isVF());
      });
      var vfStdTitle = document.querySelector('#user-standards-vf-wrap .section-h');
      if (vfStdTitle) vfStdTitle.textContent = pallet ? pt('std.vfPal') : pt('std.vf');
      var schemaTitle = $('schema-section-title');
      if (schemaTitle) schemaTitle.textContent = pallet ? pt('schema.titlePal') : pt('schema.titleCh');
      deps.syncBioMarginVisibility();
    }

    return {
      stageOf: stageOf,
      holeDiameter: holeDiameter,
      updatePlantingGeomUI: updatePlantingGeomUI
    };
  }

  global.DG_createPlantingGeomUi = createPlantingGeomUi;
})(typeof window !== 'undefined' ? window : globalThis);
