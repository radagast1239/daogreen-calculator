/**
 * Доп. логика теплицы · каналы (встроена в основной UI, не отдельный режим).
 * Не меняет georgy-mode.js и state.georgyMode.
 */
(function (global) {
  'use strict';

  var HEAD_NURSERY_DEFAULT = 14;
  var GERM_DAYS = 3;
  var MAX_OVERLAP_MM = 20;
  var STAFF_AREA_MIN = 150;
  var STAFF_AREA_MAX = 200;

  function createGhChannelSimple(deps) {
    function st() { return deps.getState(); }
    function gm() { return deps.georgyMode; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function T(k, vars, ru) {
      if (deps.tFmt && vars) return deps.tFmt(k, vars);
      if (deps.t) {
        var v = deps.t(k);
        if (v != null && v !== k) return v;
      }
      if (vars && ru) {
        Object.keys(vars).forEach(function (vk) {
          ru = ru.replace(new RegExp('\\{' + vk + '\\}', 'g'), String(vars[vk]));
        });
      }
      return ru != null ? ru : k;
    }

    function isChannelGh() {
      var s = st();
      return s.facility === 'greenhouse' && !deps.isVF() && !deps.isPalletView();
    }

    /** Встроенные функции каналов: теплица · каналы, без режима Георгия. */
    function isEnabled() {
      return isChannelGh() && !st().georgyMode;
    }

    function profile(cv) {
      return gm() && gm().getGeorgyProfile ? gm().getGeorgyProfile(cv || deps.getCv()) : null;
    }

    function isHeadSalad(cv) {
      cv = cv || deps.getCv();
      return isEnabled() && cv && gm() && gm().isHeadLettuceChannel && gm().isHeadLettuceChannel(cv);
    }

    function totalDaysFromSow(cv) {
      cv = cv || deps.getCv();
      if (profile(cv)) return GERM_DAYS + Math.round(st().day);
      return Math.round(st().germination) + Math.round(st().nursery) + Math.round(st().day);
    }

    function applyDensityFit(maxOverlapMm) {
      var g = gm();
      if (!g || !isEnabled() || !isHeadSalad()) return;
      if (g.applyCanopyDensityFit) g.applyCanopyDensityFit(deps.getCv(), maxOverlapMm);
    }

    function applyBabyStandard(prof) {
      if (!prof || !gm() || !isEnabled()) return;
      var cv = deps.findCvById ? deps.findCvById(prof.id) : null;
      st().georgyManualCutMasses = false;
      st().cv = prof.id;
      st().day = prof.defaultDay;
      st().germination = GERM_DAYS;
      st().nursery = 0;
      st().nch = gm().clampBabyNch(st().nch, prof);
      st().offset = 50;
      st().cutInterval = clamp(prof.cutInterval, prof.cutIntervalMin, prof.cutIntervalMax);
      st().multicut = true;
      st().georgyFirstCutCh = prof.firstCutCh;
      st().georgyChannel2Rows = true;
      gm().refreshGeorgyCutMasses(prof, cv || { id: prof.id });
      st().georgyDensityFitted = false;
      st().georgyTargetDensity = null;
      st().georgyAutoDensity = null;
      st().georgyLastFitGap = null;
      if (deps.syncMainSliders) deps.syncMainSliders();
      if (deps.syncMulticutBabyUi) deps.syncMulticutBabyUi(cv);
    }

    function applyBeforeCalc() {
      if (!isEnabled()) return;
      var cv = deps.getCv();
      var prof = profile(cv);
      st().offset = st().offset != null ? st().offset : 50;
      st().pot = st().pot != null ? st().pot : 50;
      if (prof) {
        st().germination = GERM_DAYS;
        st().nursery = 0;
        st().multicut = true;
        st().georgyChannel2Rows = true;
        st().nch = gm().clampBabyNch(st().nch, prof);
        st().cutInterval = clamp(st().cutInterval || prof.cutInterval, prof.cutIntervalMin, prof.cutIntervalMax);
        if (st().georgyFirstCutCh == null) st().georgyFirstCutCh = prof.firstCutCh;
        gm().refreshGeorgyCutMasses(prof, cv);
      } else if (isHeadSalad(cv)) {
        st().multicut = false;
        st().georgyChannel2Rows = false;
        st().georgyFirstCutCh = null;
        if (!(st().germination > 0)) st().germination = 5;
        if (!(st().nursery > 0)) st().nursery = HEAD_NURSERY_DEFAULT;
      }
      if (st().georgyDensityFitted && st().georgyTargetDensity > 0) {
        st().density = st().georgyTargetDensity;
      }
    }

    function estimateHarvest(cv) {
      cv = cv || deps.getCv();
      if (gm() && gm().estimateGeorgyHarvest) return gm().estimateGeorgyHarvest(cv);
      return { mass: 0, canopy: 0, massAuto: 0 };
    }

    function headMassPlateau(cv, harvest, r) {
      var g = gm();
      if (g && g.headMassPlateauForHint) return g.headMassPlateauForHint(cv, harvest, r);
      return false;
    }

    function syncHeadOnlyBabyOnly(cv) {
      var prof = profile(cv);
      var showBaby = !!prof;
      document.querySelectorAll('.channel-head-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', showBaby);
      });
      document.querySelectorAll('.channel-baby-only').forEach(function (el) {
        el.classList.toggle('env-block-hidden', !showBaby);
      });
      var rucolaBtn = document.getElementById('channel-rucola-std');
      var lettuceBtn = document.getElementById('channel-lettuce-std');
      if (rucolaBtn && gm()) rucolaBtn.classList.toggle('on', showBaby && cv && cv.id === gm().RUCOLA_BABY_ID);
      if (lettuceBtn && gm()) lettuceBtn.classList.toggle('on', showBaby && cv && cv.id === gm().LETTUCE_BABY_ID);
    }

    function syncPreview(r) {
      var wrap = document.getElementById('channel-harvest-preview');
      var cv0 = deps.getCv();
      if (wrap) wrap.classList.toggle('env-block-hidden', !isEnabled() || (!isHeadSalad(cv0) && !profile(cv0)));
      if (!isEnabled()) return;
      var cv = deps.getCv();
      var harvest = estimateHarvest(cv);
      var massEl = document.getElementById('channel-preview-mass');
      var canopyEl = document.getElementById('channel-preview-canopy');
      var massLbl = document.getElementById('channel-preview-mass-lbl');
      if (massLbl) {
        massLbl.textContent = T(profile(cv) ? 'ghCh.preview.massPerCut' : 'ghCh.preview.massModel', null, massLbl.textContent);
      }
      if (massEl) massEl.textContent = harvest.mass + ' ' + T('unit.g', null, 'г');
      if (canopyEl) {
        var g = gm();
        if (profile(cv)) canopyEl.textContent = harvest.canopy + ' ' + T('unit.mm', null, 'мм');
        else if (g && g.headCanopyFitRangeLabel) {
          var cRg = g.headCanopyFitRangeLabel(cv);
          canopyEl.textContent = T('ghCh.preview.canopyFit', cRg, cRg.loCm + '–' + cRg.hiCm + ' ' + T('unit.cm', null, 'см'));
        } else canopyEl.textContent = harvest.canopy + ' ' + T('unit.mm', null, 'мм');
      }
      var readyText = '';
      var showReady = isHeadSalad(cv) && headMassPlateau(cv, harvest, r);
      if (showReady) {
        readyText = T('georgy.headReadyHint', { mass: harvest.mass, max: Math.round(cv.M_max) }, '');
      }
      ['channel-head-ready-hint', 'channel-head-ready-hint-mass'].forEach(function (id) {
        var ready = document.getElementById(id);
        if (!ready) return;
        ready.classList.toggle('env-block-hidden', !showReady);
        if (showReady) ready.textContent = readyText;
      });
    }

    function syncTotalDays(cv) {
      var td = document.getElementById('channel-total-days');
      var wrap = document.getElementById('channel-total-days-wrap');
      if (wrap) wrap.classList.toggle('env-block-hidden', !isEnabled());
      if (td && isEnabled()) td.textContent = String(totalDaysFromSow(cv));
    }

    function syncStaffHint() {
      var el = document.getElementById('channel-staff-hint');
      if (!el) return;
      el.classList.toggle('env-block-hidden', !isEnabled());
      if (!isEnabled()) return;
      var area = parseFloat(st().ghUsefulArea);
      if (!(area > 0)) {
        el.textContent = T('georgy.staffNeedArea', null, '');
        return;
      }
      el.textContent = T('georgy.staffNorm', {
        area: Math.round(area * 10) / 10,
        wMin: Math.round((area / STAFF_AREA_MAX) * 10) / 10,
        wMax: Math.round((area / STAFF_AREA_MIN) * 10) / 10,
        aMin: STAFF_AREA_MIN,
        aMax: STAFF_AREA_MAX
      }, '');
    }

    function syncMulticutPreview() {
      var wrap = document.getElementById('multicut-cut-preview');
      if (!wrap || !isEnabled()) return;
      var cv = deps.getCv();
      var prof = profile(cv);
      if (!prof || !gm() || !gm().renderMulticutBabyCutPreview) {
        return;
      }
      if (!st().multicut) {
        wrap.classList.add('env-block-hidden');
        wrap.innerHTML = '';
        return;
      }
      wrap.classList.remove('env-block-hidden');
      gm().renderMulticutBabyCutPreview(wrap, cv, prof);
    }

    function renderWarnings(r) {
      var box = document.getElementById('channel-density-warnings');
      if (!box) return;
      if (!isEnabled() || !isHeadSalad(r.cv) || !st().georgyDensityFitted) {
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      box.classList.remove('env-block-hidden');
      var items = [];
      if (r && Number.isFinite(r.leafGap)) {
        var gap = Math.round(r.leafGap);
        if (gap < -MAX_OVERLAP_MM) items.push({ t: 'bad', k: 'georgy.warn.overlap', vars: { mm: Math.abs(gap) } });
        else if (gap < 0) items.push({ t: 'warn', k: 'georgy.warn.overlapLight', vars: { mm: Math.abs(gap) } });
      }
      if (deps.boltChannel) {
        var boltCh = Math.round(deps.boltChannel(r.cv));
        if (st().day >= boltCh - 5) items.push({ t: 'warn', k: 'georgy.warn.nearBolt', vars: { bolt: boltCh } });
      }
      var icon = { warn: '⚠️', bad: '⛔' };
      box.innerHTML = items.map(function (it) {
        var cls = it.t === 'bad' ? 'georgy-warn bad' : 'georgy-warn warn';
        return '<div class="' + cls + '"><span class="georgy-warn-ico">' + (icon[it.t] || '•') + '</span><span>' +
          T(it.k, it.vars, it.k) + '</span></div>';
      }).join('');
    }

    function syncPanel(r) {
      if (!isEnabled()) {
        document.querySelectorAll('.channel-gh-only').forEach(function (el) {
          el.classList.add('env-block-hidden');
        });
        return;
      }
      document.querySelectorAll('.channel-gh-only').forEach(function (el) {
        el.classList.remove('env-block-hidden');
      });
      var cv = deps.getCv();
      syncHeadOnlyBabyOnly(cv);
      syncTotalDays(cv);
      syncPreview(r);
      syncStaffHint();
      syncMulticutPreview();
      renderWarnings(r);
    }

    function onDayChanged() {
      if (!isEnabled()) return;
      var cv = deps.getCv();
      if (profile(cv)) {
        st().georgyDensityFitted = false;
      } else if (st().georgyDensityFitted) {
        applyDensityFit(MAX_OVERLAP_MM);
      } else if (gm() && gm().previewGeorgyAutoDensity) {
        gm().previewGeorgyAutoDensity(cv);
      }
    }

    function bind() {
      function bindBtn(id, fn) {
        var btn = document.getElementById(id);
        if (btn && !btn.dataset.channelBound) {
          btn.dataset.channelBound = '1';
          btn.addEventListener('click', fn);
        }
      }
      bindBtn('channel-rucola-std', function () {
        if (gm()) applyBabyStandard(gm().RUCOLA_PROFILE);
        if (deps.renderCultivars) deps.renderCultivars();
        if (deps.renderAll) deps.renderAll();
      });
      bindBtn('channel-lettuce-std', function () {
        if (gm()) applyBabyStandard(gm().LETTUCE_PROFILE);
        if (deps.renderCultivars) deps.renderCultivars();
        if (deps.renderAll) deps.renderAll();
      });
    }

    return {
      isActive: isEnabled,
      isEnabled: isEnabled,
      isHeadSalad: isHeadSalad,
      applyBeforeCalc: applyBeforeCalc,
      syncPanel: syncPanel,
      bind: bind,
      onDayChanged: onDayChanged,
      applyDensityFit: applyDensityFit,
      totalDaysFromSow: totalDaysFromSow,
      applyDensityFitForCompare: function (cv) {
        if (!isEnabled() || !gm()) return;
        var savedCv = st().cv;
        st().cv = cv.id;
        applyDensityFit(MAX_OVERLAP_MM);
        st().cv = savedCv;
      },
      usesChannel2Rows: function (cv) {
        return isEnabled() && !!profile(cv || deps.getCv());
      }
    };
  }

  global.DG_createGhChannelSimple = createGhChannelSimple;
})(typeof window !== 'undefined' ? window : globalThis);
