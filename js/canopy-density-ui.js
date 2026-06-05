/**
 * Подбор плотности по шапке (≤20 мм) в каналах теплицы — вне режима Георгия.
 */
(function(global){
  'use strict';

  function createCanopyDensityUi(deps){
    function st(){ return deps.getState(); }
    function t(k, vars, ru){ return deps.tFmt ? deps.tFmt(k, vars) : (deps.t(k) || ru || k); }

    function georgyApi(){
      if (typeof deps.getGeorgyMode === 'function') return deps.getGeorgyMode();
      return deps.georgyMode;
    }

    function ghChannelApi(){
      return deps.getGhChannelSimple ? deps.getGhChannelSimple() : null;
    }

    function canShow(cv){
      var gm = georgyApi();
      return gm && gm.isHeadLettuceChannel && gm.isHeadLettuceChannel(cv || deps.getCv()) && !isGeorgyActive();
    }

    function isGeorgyActive(){
      var gm = georgyApi();
      return gm && gm.isGeorgyGh && gm.isGeorgyGh();
    }

    function maxOverlapMm(){
      var gm = georgyApi();
      return (gm && gm.MAX_LEAF_OVERLAP_MM) || 20;
    }

    function overlapGap(r){
      if (st().georgyLastFitGap != null && isFinite(st().georgyLastFitGap)) return st().georgyLastFitGap;
      if (r && Number.isFinite(r.leafGap)) return Math.round(r.leafGap);
      return null;
    }

    function overlapStatusHtml(gap){
      var max = maxOverlapMm();
      if (gap == null || !isFinite(gap)){
        return '<span class="canopy-overlap-status canopy-overlap-status--muted">' +
          t('canopy.density.overlapPending', null, 'После подбора покажем зазор листьев.') + '</span>';
      }
      if (gap < -max){
        return '<span class="canopy-overlap-status canopy-overlap-status--bad">' +
          t('canopy.density.overlapBad', { mm: Math.abs(gap), max: max },
            'Перекрытие ' + Math.abs(gap) + ' мм — больше допустимых ' + max + ' мм.') + '</span>';
      }
      if (gap < 0){
        return '<span class="canopy-overlap-status canopy-overlap-status--warn">' +
          t('canopy.density.overlapWarn', { mm: Math.abs(gap), max: max },
            'Перекрытие ' + Math.abs(gap) + ' мм (допустимо до ' + max + ' мм).') + '</span>';
      }
      return '<span class="canopy-overlap-status canopy-overlap-status--ok">' +
        t('canopy.density.overlapOk', { gap: gap },
          'Зазор между листьями ' + gap + ' мм.') + '</span>';
    }

    function setOverlapOnElements(ids, html){
      ids.forEach(function(id){
        var el = document.getElementById(id);
        if (el) el.innerHTML = html;
      });
    }

    function syncCanopyDensityUi(r){
      var block = document.getElementById('canopy-density-block');
      var hint = document.getElementById('canopy-density-hint');
      var densCtrl = document.getElementById('ctrl-density');
      var densInp = document.getElementById('density');
      var densV = document.getElementById('density-v');
      var densLbl = document.getElementById('density-ctrl-label');
      var cv = (r && r.cv) || deps.getCv();
      var showPick = canShow(cv);

      document.querySelectorAll('.canopy-density-pick-only').forEach(function(el){
        el.classList.toggle('env-block-hidden', !showPick);
      });

      if (!showPick){
        if (densCtrl) densCtrl.classList.remove('canopy-density-locked');
        if (densInp) densInp.disabled = false;
        if (densLbl) densLbl.setAttribute('data-i18n', 'density');
        return;
      }

      var fitted = !!st().georgyDensityFitted;
      if (block) block.classList.toggle('is-locked', !fitted);
      if (densCtrl) densCtrl.classList.toggle('canopy-density-locked', !fitted);

      var gm = georgyApi();
      var autoRho = st().georgyAutoDensity;
      if (autoRho == null && gm && gm.previewGeorgyAutoDensity){
        autoRho = gm.previewGeorgyAutoDensity(cv);
        st().georgyAutoDensity = autoRho;
      }
      var headBounds = gm && gm.headDensityBounds ? gm.headDensityBounds(cv) : { lo: 15, hi: 220 };
      var rhoLo = headBounds.lo;
      var rhoHi = headBounds.hi;
      var targetRho = fitted && st().georgyTargetDensity > 0
        ? st().georgyTargetDensity
        : (st().georgyAutoDensity || st().density || 40);

      if (densInp){
        densInp.min = String(rhoLo);
        densInp.max = String(rhoHi);
        densInp.disabled = !fitted;
        if (document.activeElement !== densInp && fitted) densInp.value = targetRho;
      }
      if (densV && fitted) densV.textContent = String(targetRho);
      if (densLbl) densLbl.setAttribute('data-i18n', 'georgy.densityLabel');

      var cRg = gm && gm.headCanopyFitRangeLabel ? gm.headCanopyFitRangeLabel(cv) : null;
      var gap = overlapGap(r);
      var overlapHtml = overlapStatusHtml(gap);
      var harvest = r && r.harvest;
      if (!harvest && gm && gm.estimateGeorgyHarvest) harvest = gm.estimateGeorgyHarvest(cv);

      var hintText;
      if (fitted && st().georgyTargetDensity > 0){
        var cHint = gm && gm.headCanopyFitRangeLabel
          ? gm.headCanopyFitRangeLabel(cv, null, st().georgyTargetDensity)
          : null;
        var fitCm = cHint ? cHint.fitCm : (cRg ? cRg.midCm : '');
        hintText = t('georgy.densityHint', {
          auto: autoRho,
          target: st().georgyTargetDensity,
          gap: gap != null ? gap : '—',
          canopy: harvest ? harvest.canopy : '—',
          canopyLoCm: cHint ? cHint.loCm : '',
          canopyHiCm: cHint ? cHint.hiCm : '',
          hiCm: cHint ? cHint.hiCm : '',
          midCm: cHint ? cHint.midCm : '',
          fitCm: fitCm,
          name: cv ? cv.name : ''
        }, '«' + (cv ? cv.name : '') + '»: ' + st().georgyTargetDensity + ' шт/м², подбор по ' +
          fitCm + ' см, зазор ' + (gap != null ? gap : '—') + ' мм');
      } else {
        var cBefore = cRg;
        hintText = cBefore
          ? t('georgy.densityHintBeforeRange', cBefore,
            'Крона ' + cBefore.loCm + '–' + cBefore.hiCm + ' см, подбор по ' + cBefore.fitCm + ' см.')
          : t('georgy.densityHintBefore', null,
            'Задайте дни роста, проверьте массу и шапку, затем нажмите кнопку подбора.');
      }
      if (hint) hint.textContent = hintText;

      setOverlapOnElements(['canopy-density-overlap'], overlapHtml);

      var noTouchBtn = document.getElementById('canopy-density-no-touch');
      var autoBtn = document.getElementById('canopy-density-auto');
      var gh = ghChannelApi();
      var tdOk = gh && gh.totalDaysFromSow ? gh.totalDaysFromSow(cv) : null;
      var minTotal = 8;
      var btnDisabled = !(tdOk != null && tdOk >= minTotal);
      if (noTouchBtn) noTouchBtn.disabled = btnDisabled;
      if (autoBtn) autoBtn.disabled = btnDisabled;
    }

    function applyDensityFit(maxOverlapMmVal){
      var cv = deps.getCv();
      if (!canShow(cv)) return;
      var gm = georgyApi();
      var gh = ghChannelApi();
      if (gm && gm.applyCanopyDensityFit) {
        gm.applyCanopyDensityFit(cv, maxOverlapMmVal);
      } else if (gh && gh.applyDensityFit) {
        gh.applyDensityFit(maxOverlapMmVal);
      }
      if (deps.syncMainSliders) deps.syncMainSliders();
      if (deps.renderAll) deps.renderAll();
    }

    function bind(){
      if (document.documentElement.dataset.canopyDensityDelegated) return;
      document.documentElement.dataset.canopyDensityDelegated = '1';
      document.addEventListener('click', function(e){
        var btn = e.target && e.target.closest && e.target.closest(
          '#canopy-density-no-touch, #canopy-density-auto'
        );
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var id = btn.id || '';
        applyDensityFit(id.indexOf('no-touch') >= 0 ? 0 : maxOverlapMm());
      });
    }

    function onDayChanged(){
      var gm = georgyApi();
      if (gm && gm.onGeorgyDayChanged) gm.onGeorgyDayChanged();
    }

    return {
      bind: bind,
      syncCanopyDensityUi: syncCanopyDensityUi,
      canShow: canShow,
      onDayChanged: onDayChanged,
      applyDensityFit: applyDensityFit
    };
  }

  global.DG_createCanopyDensityUi = createCanopyDensityUi;
})(typeof window !== 'undefined' ? window : globalThis);
