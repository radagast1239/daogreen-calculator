/**
 * Подбор плотности по шапке (≤20 мм) в каналах теплицы — вне режима Георгия.
 */
(function(global){
  'use strict';

  var STORAGE_KEY = 'calc-canopy-density-hint-dismissed';

  function createCanopyDensityUi(deps){
    function st(){ return deps.getState(); }
    function t(k, vars, ru){ return deps.tFmt ? deps.tFmt(k, vars) : (deps.t(k) || ru || k); }

    function canShow(cv){
      return deps.georgyMode && deps.georgyMode.canUseCanopyDensityPick(cv || deps.getCv());
    }

    function syncCanopyDensityUi(r){
      var wrap = document.getElementById('canopy-density-wrap');
      var block = document.getElementById('canopy-density-block');
      var btn = document.getElementById('canopy-density-auto');
      var hint = document.getElementById('canopy-density-hint');
      var densCtrl = document.getElementById('ctrl-density');
      var cv = (r && r.cv) || deps.getCv();
      var show = canShow(cv) && !(deps.georgyMode && deps.georgyMode.isGeorgyGh());
      if (wrap) wrap.classList.toggle('env-block-hidden', !show);
      if (!show) return;

      if (block) block.classList.remove('is-locked');
      if (densCtrl) densCtrl.classList.remove('canopy-density-locked');

      var fitted = !!st().georgyDensityFitted;
      var autoRho = st().georgyAutoDensity;
      if (autoRho == null && deps.georgyMode.densityFromCanopy){
        autoRho = deps.georgyMode.densityFromCanopy(cv);
        st().georgyAutoDensity = autoRho;
      }
      if (hint){
        var cRg = deps.georgyMode.headCanopyFitRangeLabel
          ? deps.georgyMode.headCanopyFitRangeLabel(cv)
          : null;
        if (fitted && st().georgyTargetDensity > 0){
          var gap = st().georgyLastFitGap != null ? st().georgyLastFitGap
            : (r ? Math.round(r.leafGap) : '—');
          hint.textContent = t('canopy.density.hintFitted', {
            target: st().georgyTargetDensity,
            auto: autoRho,
            gap: gap,
            max: deps.georgyMode.MAX_LEAF_OVERLAP_MM || 20,
            lo: cRg ? cRg.loCm : '',
            hi: cRg ? cRg.hiCm : '',
            mid: cRg ? cRg.midCm : ''
          }, 'Плотность ' + st().georgyTargetDensity + ' шт/м², подбор по кроне ' +
            (cRg ? cRg.midCm + ' см (' + cRg.loCm + '–' + cRg.hiCm + ')' : '') + ', зазор ' + gap + ' мм');
        } else {
          hint.textContent = cRg
            ? t('canopy.density.hintBeforeRange', {
              lo: cRg.loCm,
              hi: cRg.hiCm,
              mid: cRg.midCm,
              base: cRg.baseCm,
              max: deps.georgyMode.MAX_LEAF_OVERLAP_MM || 20
            }, 'Диапазон кроны ' + cRg.loCm + '–' + cRg.hiCm + ' см, подбор по ' + cRg.midCm + ' см.')
            : t('canopy.density.hintBefore', { max: deps.georgyMode.MAX_LEAF_OVERLAP_MM || 20 },
              'Задайте срок роста и массу, затем нажмите подбор по шапке.');
        }
      }
      if (btn) btn.disabled = !(st().day >= 8);
    }

    function applyAuto(){
      if (!deps.georgyMode || !deps.georgyMode.applyGeorgyDensityAuto) return;
      deps.georgyMode.applyGeorgyDensityAuto(deps.getCv());
      if (deps.syncMainSliders) deps.syncMainSliders();
      if (deps.renderAll) deps.renderAll();
    }

    function bind(){
      var btn = document.getElementById('canopy-density-auto');
      if (btn && !btn.dataset.bound){
        btn.dataset.bound = '1';
        btn.addEventListener('click', applyAuto);
      }
    }

    function onDayChanged(){
      if (deps.georgyMode && deps.georgyMode.onGeorgyDayChanged){
        deps.georgyMode.onGeorgyDayChanged();
      }
    }

    return {
      bind: bind,
      syncCanopyDensityUi: syncCanopyDensityUi,
      canShow: canShow,
      onDayChanged: onDayChanged,
      applyAuto: applyAuto
    };
  }

  global.DG_createCanopyDensityUi = createCanopyDensityUi;
})(typeof window !== 'undefined' ? window : this);
