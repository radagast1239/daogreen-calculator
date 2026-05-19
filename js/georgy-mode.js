/**
 * Упрощённый режим теплицы «Расчёт для Георгия».
 * Салаты — как раньше (один срез, подбор плотности).
 * Руккола беби и салат беби — стаканы, 2 ряда в канале, многосрезка.
 */
(function(global){
  'use strict';

  var GEORGY_STORAGE_KEY = 'calc-georgy-mode';
  var GEORGY_DENSITY_KEY = 'calc-georgy-target-density';
  var RUCOLA_BABY_ID = 'rucola-baby';
  var LETTUCE_BABY_ID = 'lettuce-baby';
  var GERM_DAYS = 3;
  var OFFSET_PCT = 50;
  var POT_MM = 50;
  var PHOTOPERIOD_H = 16;
  var TARGET_DLI = 17;
  var MAX_LEAF_OVERLAP_MM = 20;
  var PLACEHOLDER_DENSITY = 40;

  var GEORGY_HIDDEN_CV = {
    rucola: 1, basil: 1, mizuna: 1, kale: 1, chard: 1, spinach: 1, pakchoi: 1
  };

  /** Жара для беби: T≥30 °C → 6–8 срезок; ниже 30 — до 12 (салат). Потеря массы 15–20%. */
  var BABY_HEAT = {
    tempHot: 30,
    tempWarmStart: 26,
    yieldLossMin: 0.15,
    yieldLossMax: 0.20
  };

  var RUCOLA_PROFILE = {
    id: RUCOLA_BABY_ID,
    densityMin: 80, densityMax: 110, densityLight: 110, dliLightMin: 16,
    cutInterval: 12, cutIntervalMin: 8, cutIntervalMax: 18,
    maxCutsHot: 8, maxCutsBelowHot: 6,
    firstCutCh: 10, defaultDay: 10,
    massMin: 10, massMax: 18,
    cutMasses: [16, 15, 14, 13, 12, 11, 11, 11],
    channelRows: 2, nchDefault: 13, nchMin: 10, nchMax: 19,
    recKey: 'georgy.rec.rucola',
    stdKey: 'georgy.rucola.stdBtn',
    warnPlanKey: 'georgy.warn.rucolaPlan'
  };
  Object.keys(BABY_HEAT).forEach(function(k){ RUCOLA_PROFILE[k] = BABY_HEAT[k]; });

  var LETTUCE_PROFILE = {
    id: LETTUCE_BABY_ID,
    densityMin: 80, densityMax: 110, densityLight: 110, dliLightMin: 16,
    cutInterval: 12, cutIntervalMin: 8, cutIntervalMax: 18,
    maxCutsHot: 8, maxCutsBelowHot: 12,
    firstCutCh: 12, defaultDay: 12,
    massMin: 20, massMax: 30,
    cutMasses: [28, 28, 27, 26, 25, 24, 23, 22, 22, 21, 21, 20],
    channelRows: 2, nchDefault: 13, nchMin: 10, nchMax: 19,
    recKey: 'georgy.rec.lettuce',
    stdKey: 'georgy.lettuce.stdBtn',
    warnPlanKey: 'georgy.warn.lettucePlan'
  };
  Object.keys(BABY_HEAT).forEach(function(k){ LETTUCE_PROFILE[k] = BABY_HEAT[k]; });

  var PROFILES = {};
  PROFILES[RUCOLA_BABY_ID] = RUCOLA_PROFILE;
  PROFILES[LETTUCE_BABY_ID] = LETTUCE_PROFILE;

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  function createGeorgyMode(deps){
    function st(){ return deps.getState(); }
    function T(k, vars, ru){
      if (deps.tFmt && vars) return deps.tFmt(k, vars);
      if (deps.t){
        var v = deps.t(k);
        if (v != null && v !== k) return v;
      }
      if (vars && ru){
        Object.keys(vars).forEach(function(vk){
          ru = ru.replace(new RegExp('\\{' + vk + '\\}', 'g'), String(vars[vk]));
        });
      }
      return ru != null ? ru : k;
    }

    function isGeorgyGh(){
      var s = st();
      return !!(s.georgyMode && s.facility === 'greenhouse' && !deps.isVF() && !deps.isPalletView());
    }

    function getGeorgyProfile(cv){
      cv = cv || deps.getCv();
      return cv && PROFILES[cv.id] ? PROFILES[cv.id] : null;
    }

    function isGeorgyProfiled(cv){
      return !!getGeorgyProfile(cv);
    }

    function isGeorgyRucola(cv){
      cv = cv || deps.getCv();
      return !!(cv && cv.id === RUCOLA_BABY_ID);
    }

    function isGeorgyLettuce(cv){
      cv = cv || deps.getCv();
      return !!(cv && cv.id === LETTUCE_BABY_ID);
    }

    function isGeorgyCvAllowed(cv){
      if (!cv) return false;
      if (!isGeorgyGh()) return true;
      return !GEORGY_HIDDEN_CV[cv.id];
    }

    function filterGeorgyCultivars(list){
      if (!isGeorgyGh()) return list;
      return (list || []).filter(function(c){ return isGeorgyCvAllowed(c); });
    }

    function usesGeorgyChannel2Rows(cv){
      return isGeorgyGh() && isGeorgyProfiled(cv);
    }

    function georgyYieldFactor(profile, temp){
      if (!profile) return 1;
      temp = temp != null ? temp : st().temp;
      var t0 = profile.tempWarmStart != null ? profile.tempWarmStart : profile.tempHot - 4;
      var t1 = profile.tempHot;
      var lossMax = profile.yieldLossMax != null ? profile.yieldLossMax : 0.20;
      if (temp <= t0) return 1;
      if (temp >= t1) return 1 - lossMax;
      return 1 - lossMax * (temp - t0) / Math.max(0.1, t1 - t0);
    }

    function georgyYieldLossPct(profile, temp){
      return Math.round((1 - georgyYieldFactor(profile, temp)) * 100);
    }

    /** DLI и вечернее продление дня — на норматив беби (зима/лето, досветка вкл/выкл). */
    function georgyLightYieldFactor(){
      if (!deps.dliFactor) return 1;
      var df = deps.dliFactor();
      var pf = deps.photoperiodFactor ? deps.photoperiodFactor() : 1;
      return clamp(df * pf, 0.72, 1.15);
    }

    function clampBabyNch(n, profile){
      profile = profile || getGeorgyProfile();
      var lo = profile ? profile.nchMin : 10;
      var hi = profile ? profile.nchMax : 19;
      if (n == null || !isFinite(n)) n = profile ? profile.nchDefault : 13;
      return clamp(Math.round(n), lo, hi);
    }

    function normativeBabyCutMass(profile, cv, cutIndex){
      if (!profile) return 0;
      var n = resolveGeorgyMaxCuts(profile, cv);
      var masses = scaledProfileCutMasses(profile, n);
      var i = cutIndex != null ? cutIndex : 0;
      return masses[i] || masses[0] || profile.cutMasses[0];
    }

    function adjustMassForGeorgyBaby(profile, cv, massFromModel){
      if (!profile || !deps.tempFactor || !(massFromModel > 0)) return massFromModel;
      var tf = deps.tempFactor(cv);
      if (tf < 0.05) tf = 0.05;
      return massFromModel / tf * georgyYieldFactor(profile, st().temp);
    }

    function scaledProfileCutMasses(profile, n){
      var yf = georgyYieldFactor(profile, st().temp) * georgyLightYieldFactor();
      var base = profile.cutMasses;
      var out = [];
      for (var i = 0; i < n; i++){
        var m = base[i] != null ? base[i] : base[base.length - 1];
        out.push(Math.max(1, Math.round(m * yf)));
      }
      return out;
    }

    function refreshGeorgyCutMasses(profile, cv){
      if (!profile) return;
      var n = resolveGeorgyMaxCuts(profile, cv);
      st().ghCutMasses = scaledProfileCutMasses(profile, n);
      st().ghCutCount = n;
    }

    function resolveGeorgyMaxCuts(profile, cv){
      var temp = st().temp;
      if (temp >= profile.tempHot) return profile.maxCutsHot;
      return profile.maxCutsBelowHot;
    }

    function clampProfiledDensity(profile, rho){
      rho = clamp(Math.round(rho), profile.densityMin, profile.densityMax);
      if (deps.effectiveDLI && deps.effectiveDLI() >= profile.dliLightMin){
        rho = Math.min(profile.densityLight, Math.max(rho, profile.densityMin));
      }
      return rho;
    }

    function preChannelDaysGeorgy(){
      return GERM_DAYS;
    }

    function georgyAutoTargetDli(){
      var nat = deps.naturalDLI();
      if (!st().lighting) return Math.max(12, Math.round(nat * 10) / 10);
      return TARGET_DLI;
    }

    function estimateGeorgyHarvest(cv){
      cv = cv || deps.getCv();
      var profile = getGeorgyProfile(cv);
      var massAuto;
      if (profile){
        massAuto = normativeBabyCutMass(profile, cv, 0);
      } else {
        var tTotal = GERM_DAYS + st().day;
        var massRaw = deps.massAtTotal(cv, tTotal);
        var saved = { density: st().density, extraB: st().extraB };
        st().density = PLACEHOLDER_DENSITY;
        st().extraB = 0;
        var lay = deps.plantLayout(cv);
        var canopyAtMax = deps.effectiveCa(cv) * Math.sqrt(cv.M_max);
        var crowdF = deps.crowdingFactor(canopyAtMax, lay.nearest);
        massAuto = massRaw * crowdF;
        st().density = saved.density;
        st().extraB = saved.extraB;
        var canopy = deps.harvestCanopy(cv, massAuto);
        return {
          mass: Math.round(massAuto),
          canopy: Math.round(canopy),
          massAuto: massAuto
        };
      }
      var saved = { density: st().density, extraB: st().extraB };
      st().density = PLACEHOLDER_DENSITY;
      st().extraB = 0;
      var lay = deps.plantLayout(cv);
      var canopy = deps.harvestCanopy(cv, massAuto);
      st().density = saved.density;
      st().extraB = saved.extraB;
      return {
        mass: Math.round(massAuto),
        canopy: Math.round(canopy),
        massAuto: massAuto
      };
    }

    function estimateHarvestCanopy(cv){
      return estimateGeorgyHarvest(cv).canopy;
    }

    function layoutAtDensity(cv, rho){
      var saved = { density: st().density, extraB: st().extraB };
      st().density = rho;
      var canopy = estimateHarvestCanopy(cv);
      st().extraB = extraBFromCanopy(cv, canopy);
      var lay = deps.plantLayout(cv);
      var gap = lay.nearest - canopy;
      var out = {
        gap: gap,
        nearest: lay.nearest,
        canopy: canopy,
        rhoA: lay.rhoA,
        extraB: st().extraB
      };
      st().density = saved.density;
      st().extraB = saved.extraB;
      return out;
    }

    function leafGapForDensity(cv, rho){
      return layoutAtDensity(cv, rho).gap;
    }

    function densityFromCanopy(cv){
      var profile = getGeorgyProfile(cv);
      var minGap = -MAX_LEAF_OVERLAP_MM;
      var lo = profile ? profile.densityMin : 15;
      var hi = profile ? profile.densityMax : 220;
      var gapLo = leafGapForDensity(cv, lo);
      var gapHi = leafGapForDensity(cv, hi);

      if (gapLo < minGap) return lo;
      if (gapHi >= minGap) return hi;

      var best = lo;
      var l = lo;
      var h = hi;
      while (l <= h){
        var mid = Math.round((l + h) / 2);
        if (leafGapForDensity(cv, mid) >= minGap){
          best = mid;
          l = mid + 1;
        } else {
          h = mid - 1;
        }
      }
      return best;
    }

    function extraBFromCanopy(cv, canopy){
      var savedB = st().extraB;
      var savedRho = st().density;
      st().extraB = 0;
      var lay0 = deps.plantLayout(cv);
      var minNearest = canopy - MAX_LEAF_OVERLAP_MM;
      var deficit = minNearest - lay0.nearest;
      var extra = deficit > 0.5 ? Math.max(0, Math.round(deficit * 0.9)) : 0;
      if (lay0.constrained) extra = Math.max(extra, Math.round(canopy * 0.08));
      st().extraB = savedB;
      st().density = savedRho;
      return clamp(extra, 0, 120);
    }

    function previewGeorgyAutoDensity(cv){
      cv = cv || deps.getCv();
      var profile = getGeorgyProfile(cv);
      var rho = densityFromCanopy(cv);
      if (profile) rho = clampProfiledDensity(profile, rho);
      st().georgyAutoDensity = rho;
      return st().georgyAutoDensity;
    }

    function setGeorgyTargetDensity(rho){
      var cv = deps.getCv();
      var profile = getGeorgyProfile(cv);
      var lo = profile ? profile.densityMin : 15;
      var hi = profile ? profile.densityMax : 220;
      rho = clamp(Math.round(rho), lo, hi);
      if (profile) rho = clampProfiledDensity(profile, rho);
      st().georgyTargetDensity = rho;
      try { localStorage.setItem(GEORGY_DENSITY_KEY, String(st().georgyTargetDensity)); } catch(_){}
    }

    function applyGeorgyDensityAuto(cv){
      cv = cv || deps.getCv();
      var profile = getGeorgyProfile(cv);
      var rho = densityFromCanopy(cv);
      if (profile) rho = clampProfiledDensity(profile, rho);
      var lay = layoutAtDensity(cv, rho);
      st().georgyAutoDensity = rho;
      st().georgyLastFitGap = Math.round(lay.gap);
      setGeorgyTargetDensity(rho);
      st().georgyDensityFitted = true;
      st().extraB = lay.extraB;
      st().density = rho;
    }

    function applyGeorgyProfileStandard(profile){
      if (!isGeorgyGh() || !profile) return;
      var cv = deps.findCvById ? deps.findCvById(profile.id) : null;
      st().cv = profile.id;
      st().day = profile.defaultDay;
      st().nch = clampBabyNch(st().nch, profile);
      st().offset = OFFSET_PCT;
      st().cutInterval = clamp(profile.cutInterval, profile.cutIntervalMin, profile.cutIntervalMax);
      st().multicut = true;
      st().georgyFirstCutCh = profile.firstCutCh;
      st().georgyChannel2Rows = true;
      refreshGeorgyCutMasses(profile, cv || { id: profile.id });
      st().georgyDensityFitted = false;
      st().georgyTargetDensity = null;
      st().georgyAutoDensity = null;
      st().georgyLastFitGap = null;
      var dayInp = document.getElementById('georgy-day');
      var dayV = document.getElementById('georgy-day-v');
      if (dayInp) dayInp.value = st().day;
      if (dayV) dayV.textContent = String(st().day);
      if (deps.syncMainSliders) deps.syncMainSliders();
    }

    function applyGeorgyRucolaStandard(){
      applyGeorgyProfileStandard(RUCOLA_PROFILE);
    }

    function applyGeorgyLettuceStandard(){
      applyGeorgyProfileStandard(LETTUCE_PROFILE);
    }

    function applyGeorgyProfilePresets(cv){
      var profile = getGeorgyProfile(cv);
      if (!profile) return;
      st().georgyChannel2Rows = true;
      st().nch = clampBabyNch(st().nch, profile);
      st().multicut = true;
      st().cutInterval = clamp(st().cutInterval || profile.cutInterval, profile.cutIntervalMin, profile.cutIntervalMax);
      if (st().georgyFirstCutCh == null) st().georgyFirstCutCh = profile.firstCutCh;
      refreshGeorgyCutMasses(profile, cv);
    }

    function applyGeorgyBeforeCalc(){
      if (!isGeorgyGh()) return;
      var cv = deps.getCv();
      if (!isGeorgyCvAllowed(cv)){
        st().cv = RUCOLA_BABY_ID;
        cv = deps.getCv();
      }
      st().germination = GERM_DAYS;
      st().nursery = 0;
      st().offset = OFFSET_PCT;
      st().pot = POT_MM;
      st().useManualMass = false;
      st().useManualCanopy = false;
      st().useManualCutMass = false;
      st().targetPhotoperiod = PHOTOPERIOD_H;
      if (st().lighting) st().targetDli = georgyAutoTargetDli();
      var profile = getGeorgyProfile(cv);
      if (profile){
        applyGeorgyProfilePresets(cv);
      } else {
        st().multicut = false;
        st().georgyFirstCutCh = null;
        st().georgyChannel2Rows = false;
      }
      previewGeorgyAutoDensity(cv);
      if (st().georgyDensityFitted && st().georgyTargetDensity > 0){
        var rho = st().georgyTargetDensity;
        if (profile) rho = clampProfiledDensity(profile, rho);
        st().density = rho;
        var layFit = layoutAtDensity(cv, st().density);
        st().extraB = layFit.extraB;
        st().georgyLastFitGap = Math.round(layFit.gap);
      } else {
        st().density = PLACEHOLDER_DENSITY;
        st().extraB = 0;
      }
    }

    function renderGeorgyProfileRec(cv){
      var el = document.getElementById('georgy-profile-rec');
      var rucolaBtn = document.getElementById('georgy-rucola-std');
      var lettuceBtn = document.getElementById('georgy-lettuce-std');
      var babyBlock = document.getElementById('georgy-baby-actions');
      if (!el) return;
      var profile = getGeorgyProfile(cv);
      if (babyBlock) babyBlock.classList.toggle('env-block-hidden', !isGeorgyGh());
      if (rucolaBtn) rucolaBtn.classList.toggle('on', !!(cv && cv.id === RUCOLA_BABY_ID));
      if (lettuceBtn) lettuceBtn.classList.toggle('on', !!(cv && cv.id === LETTUCE_BABY_ID));
      if (!isGeorgyGh() || !profile){
        el.textContent = '';
        el.classList.add('env-block-hidden');
        return;
      }
      el.classList.remove('env-block-hidden');
      var dli = deps.effectiveDLI ? r2(deps.effectiveDLI()) : '—';
      var maxCuts = resolveGeorgyMaxCuts(profile, cv);
      var yf = georgyYieldFactor(profile, st().temp);
      var massMin = Math.round(profile.massMin * yf);
      var massMax = Math.round(profile.massMax * yf);
      var vars = {
        rhoMin: profile.densityMin,
        rhoMax: profile.densityMax,
        rhoLight: profile.densityLight,
        intervalMin: profile.cutIntervalMin,
        intervalMax: profile.cutIntervalMax,
        maxCuts: maxCuts,
        massMin: massMin,
        massMax: massMax,
        dli: dli,
        temp: st().temp,
        yieldPct: georgyYieldLossPct(profile, st().temp),
        yieldPctMin: Math.round((profile.yieldLossMin || 0.15) * 100),
        yieldPctMax: Math.round((profile.yieldLossMax || 0.20) * 100)
      };
      el.textContent = T(profile.recKey, vars, '');
    }

    function renderGeorgyCutPreview(r){
      var box = document.getElementById('georgy-cut-preview');
      if (!box) return;
      var cv = r && r.cv;
      var profile = getGeorgyProfile(cv);
      if (!isGeorgyGh() || !profile){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      box.classList.remove('env-block-hidden');
      if (!st().multicut){
        box.innerHTML = '';
        return;
      }
      var interval = st().cutInterval || profile.cutInterval;
      var firstCh = st().georgyFirstCutCh || profile.firstCutCh;
      var nCuts = resolveGeorgyMaxCuts(profile, cv);
      var pm = deps.plantMetric || function(k){ return k; };
      var rows = [];
      for (var i = 0; i < nCuts; i++){
        var ch = firstCh + i * interval;
        var mass = (st().ghCutMasses && st().ghCutMasses[i]) ||
          scaledProfileCutMasses(profile, nCuts)[i] ||
          profile.cutMasses[profile.cutMasses.length - 1];
        rows.push('<tr><td>' + (i + 1) + '</td><td>' + Math.round(ch) + ' ' + (pm('unit.days') || 'сут') + '</td><td>' + mass + ' ' + (pm('unit.g') || 'г') + '</td></tr>');
      }
      box.innerHTML = '<div class="georgy-cut-preview-title">' + T('georgy.profile.cutsTitle', null, 'План срезок') + '</div>' +
        '<p class="georgy-density-hint" style="margin:0 0 8px">' + T('georgy.cuts.planNote', null, '') + '</p>' +
        '<table class="georgy-cut-preview-table"><thead><tr><th>№</th><th>' + T('georgy.rucola.cutsColDay', null, 'В канале') + '</th><th>' +
        T('georgy.rucola.cutsColMass', null, 'Масса') + '</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>';
    }

    function setGeorgyDom(on){
      document.documentElement.classList.toggle('georgy-active', !!on);
      var btn = document.getElementById('btn-georgy-mode');
      if (btn) btn.classList.toggle('on', !!on);
      var facWrap = document.getElementById('facility-env-wrap');
      if (facWrap) facWrap.classList.toggle('georgy-facility-dim', !!on);
    }

    function syncGeorgyControls(r){
      if (!isGeorgyGh()){
        setGeorgyDom(false);
        return;
      }
      setGeorgyDom(true);
      var cv = (r && r.cv) ? r.cv : deps.getCv();
      var profile = getGeorgyProfile(cv);
      var step2Lbl = document.querySelector('#panel-georgy-simple .georgy-step-label[data-i18n="georgy.step2"]');
      if (step2Lbl){
        step2Lbl.textContent = T(profile ? 'georgy.step2.baby' : 'georgy.step2', null, step2Lbl.textContent);
      }
      var nchInp = document.getElementById('nch');
      if (nchInp && profile){
        nchInp.min = String(profile.nchMin);
        nchInp.max = String(profile.nchMax);
      }
      var germV = document.getElementById('georgy-germ-val');
      if (germV) germV.textContent = String(GERM_DAYS);
      var dayInp = document.getElementById('georgy-day');
      var dayV = document.getElementById('georgy-day-v');
      if (dayInp){
        dayInp.min = profile ? '8' : '14';
        dayInp.max = '40';
      }
      if (dayInp && document.activeElement !== dayInp){
        dayInp.value = st().day;
        if (dayV) dayV.textContent = String(st().day);
      }
      var harvest = estimateGeorgyHarvest(cv);
      var pm = deps.plantMetric || (typeof global.DG_plantMetric === 'function' ? global.DG_plantMetric : function(k){ return k; });
      var massEl = document.getElementById('georgy-preview-mass');
      var canopyEl = document.getElementById('georgy-preview-canopy');
      if (massEl) massEl.textContent = harvest.mass + ' ' + (pm('unit.g') || 'г');
      if (canopyEl) canopyEl.textContent = harvest.canopy + ' ' + (pm('unit.mm') || 'мм');
      var fitted = !!st().georgyDensityFitted;
      var densBlock = document.getElementById('georgy-density-block');
      if (densBlock) densBlock.classList.toggle('is-locked', !fitted);
      var densInp = document.getElementById('georgy-density');
      var densV = document.getElementById('georgy-density-v');
      var rhoLo = profile ? profile.densityMin : 15;
      var rhoHi = profile ? profile.densityMax : 220;
      var targetRho = fitted && st().georgyTargetDensity > 0
        ? st().georgyTargetDensity
        : (st().georgyAutoDensity || PLACEHOLDER_DENSITY);
      if (densInp){
        densInp.min = String(rhoLo);
        densInp.max = String(rhoHi);
        densInp.disabled = !fitted;
        if (document.activeElement !== densInp) densInp.value = targetRho;
      }
      if (densV) densV.textContent = String(targetRho);
      var densAutoBtn = document.getElementById('georgy-density-auto');
      if (densAutoBtn) densAutoBtn.disabled = !(st().day >= (profile ? 8 : 14));
      var densHint = document.getElementById('georgy-density-hint');
      if (densHint){
        var autoRho = st().georgyAutoDensity;
        if (autoRho == null) autoRho = previewGeorgyAutoDensity(cv);
        if (fitted){
          var gapShown = st().georgyLastFitGap != null ? st().georgyLastFitGap : leafGapForDensity(cv, st().georgyTargetDensity);
          densHint.textContent = T('georgy.densityHint', {
            auto: autoRho,
            target: st().georgyTargetDensity,
            gap: gapShown,
            canopy: harvest.canopy,
            name: cv ? cv.name : ''
          }, '«' + (cv ? cv.name : '') + '»: ' + st().georgyTargetDensity + ' шт/м², зазор ' + gapShown + ' мм (перекрытие до ' + MAX_LEAF_OVERLAP_MM + ' мм)');
        } else {
          densHint.textContent = T('georgy.densityHintBefore', null,
            'Задайте дни роста, проверьте массу и шапку, затем нажмите кнопку подбора.');
        }
      }
      renderGeorgyProfileRec(cv);
      renderGeorgyCutPreview(r);
      var autoDli = document.getElementById('georgy-auto-dli');
      if (autoDli) autoDli.textContent = r2(st().targetDli) + ' ' + T('georgy.unit.mol', null, 'моль/сут');
      var autoPh = document.getElementById('georgy-auto-ph');
      if (autoPh) autoPh.textContent = String(PHOTOPERIOD_H) + ' ' + T('georgy.unit.h', null, 'ч/сут');
      var autoRhoEl = document.getElementById('georgy-auto-density');
      if (autoRhoEl && r) autoRhoEl.textContent = Math.round(r.rhoA) + ' ' + T('georgy.unit.pcsSqm', null, 'шт/м²');
      var autoGap = document.getElementById('georgy-auto-leafgap');
      if (autoGap && r) autoGap.textContent = (r.leafGap >= 0 ? '+' : '') + Math.round(r.leafGap) + ' ' + T('georgy.unit.mm', null, 'мм');
      var mc = document.getElementById('multicut');
      if (mc && profile) mc.checked = true;
      if (profile) refreshGeorgyCutMasses(profile, cv);
      var intWrap = document.getElementById('georgy-cut-interval-wrap');
      if (intWrap) intWrap.classList.toggle('env-block-hidden', !profile);
      var intInp = document.getElementById('georgy-cutInterval');
      var intV = document.getElementById('georgy-cutInterval-v');
      if (intInp && profile){
        intInp.min = String(profile.cutIntervalMin);
        intInp.max = String(profile.cutIntervalMax);
        if (document.activeElement !== intInp){
          st().cutInterval = clamp(st().cutInterval || profile.cutInterval, profile.cutIntervalMin, profile.cutIntervalMax);
          intInp.value = st().cutInterval;
          if (intV) intV.textContent = String(st().cutInterval);
        }
      }
      var intHint = document.getElementById('georgy-cut-interval-hint');
      if (intHint && profile && deps.cutIntervalMods){
        var mods = deps.cutIntervalMods(cv);
        intHint.textContent = T('georgy.cutIntervalHint', {
          rec: mods.rec,
          massPct: (mods.massPct >= 0 ? '+' : '') + mods.massPct,
          cutsMo: mods.rec > 0 ? r2(30.5 / st().cutInterval) : '—'
        }, '');
      } else if (intHint) intHint.textContent = '';
      renderGeorgyGuide();
    }

    function r2(n){ return Math.round(n * 10) / 10; }

    var GUIDE_SECTIONS = [
      'georgy.guide.scope',
      'georgy.guide.baby',
      'georgy.guide.workflow',
      'georgy.guide.visible',
      'georgy.guide.auto',
      'georgy.guide.step1',
      'georgy.guide.step2',
      'georgy.guide.step3',
      'georgy.guide.env',
      'georgy.guide.margin',
      'georgy.guide.read',
      'georgy.guide.sources'
    ];

    function renderGeorgyGuide(){
      var box = document.getElementById('georgy-guide-body');
      if (!box) return;
      if (!isGeorgyGh()) return;
      box.innerHTML = GUIDE_SECTIONS.map(function(k){
        var html = T(k, null, '');
        if (!html || html === k) return '';
        return '<section class="georgy-guide-sec">' + html + '</section>';
      }).join('');
    }

    function pushProfileWarnings(items, profile, cv, r){
      if (r.rhoA < profile.densityMin - 2 || r.rhoA > profile.densityMax + 2){
        items.push({ t: 'warn', k: 'georgy.warn.profileDensity', vars: {
          rho: Math.round(r.rhoA), min: profile.densityMin, max: profile.densityMax
        }});
      }
      if (deps.effectiveDLI && deps.effectiveDLI() >= profile.dliLightMin && r.rhoA < profile.densityLight - 5){
        items.push({ t: 'info', k: 'georgy.warn.profileLight', vars: { target: profile.densityLight, dli: r2(deps.effectiveDLI()) } });
      }
      if (st().cutInterval < profile.cutIntervalMin || st().cutInterval > profile.cutIntervalMax){
        items.push({ t: 'warn', k: 'georgy.warn.profileInterval', vars: {
          d: st().cutInterval, min: profile.cutIntervalMin, max: profile.cutIntervalMax
        }});
      }
      var nCuts = resolveGeorgyMaxCuts(profile, cv);
      var yf = georgyYieldFactor(profile, st().temp);
      items.push({ t: 'info', k: profile.warnPlanKey, vars: {
        n: nCuts, interval: st().cutInterval || profile.cutInterval,
        mass: Math.round(profile.massMin * yf) + '–' + Math.round(profile.massMax * yf),
        temp: st().temp,
        intervalMin: profile.cutIntervalMin,
        intervalMax: profile.cutIntervalMax
      }});
    }

    function renderGeorgyWarnings(r){
      var box = document.getElementById('georgy-cut-warnings');
      if (!box) return;
      if (!isGeorgyGh()){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      var cv = r.cv;
      var profile = getGeorgyProfile(cv);
      if (!st().georgyDensityFitted && !profile){
        box.innerHTML = '';
        box.classList.add('env-block-hidden');
        return;
      }
      box.classList.remove('env-block-hidden');
      var items = [];

      if (profile) pushProfileWarnings(items, profile, cv, r);

      if (st().temp >= 28){
        items.push({ t: 'info', k: 'georgy.warn.tempHeadBaby', vars: {
          temp: st().temp,
          babyPct: profile ? georgyYieldLossPct(profile, st().temp) : georgyYieldLossPct(RUCOLA_PROFILE, st().temp),
          headPct: Math.round((1 - (deps.tempFactor ? deps.tempFactor(cv) : 1)) * 100)
        }});
      }

      if (st().georgyDensityFitted){
        if (r.leafGap < -MAX_LEAF_OVERLAP_MM){
          items.push({ t: 'bad', k: 'georgy.warn.overlap', vars: { mm: Math.abs(Math.round(r.leafGap)) } });
        } else if (r.leafGap < 0){
          items.push({ t: 'info', k: 'georgy.warn.overlapOk', vars: { mm: Math.abs(Math.round(r.leafGap)) } });
        }
        if (!profile){
          var boltCh = deps.boltChannel(cv);
          if (st().day >= boltCh - 5){
            items.push({ t: 'warn', k: 'georgy.warn.nearBolt', vars: { bolt: Math.round(boltCh) } });
          }
        }
        if (st().lighting && deps.effectiveDLI() < 14){
          items.push({ t: 'warn', k: 'georgy.warn.lowDli', vars: { dli: r2(deps.effectiveDLI()) } });
        }
      }

      var icon = { info: 'ℹ️', warn: '⚠️', bad: '⛔' };
      box.innerHTML = '<div class="georgy-warn-title">' + T('georgy.warn.title', null, 'Плотность и риски') + '</div>' +
        items.map(function(it){
          var cls = it.t === 'bad' ? 'georgy-warn bad' : (it.t === 'warn' ? 'georgy-warn warn' : 'georgy-warn');
          return '<div class="' + cls + '"><span class="georgy-warn-ico">' + (icon[it.t] || '•') + '</span><span>' +
            T(it.k, it.vars, it.k) + '</span></div>';
        }).join('');
    }

    function captureRestore(){
      var s = st();
      return {
        germination: s.germination, nursery: s.nursery, day: s.day,
        density: s.density, offset: s.offset, extraB: s.extraB, pot: s.pot,
        nch: s.nch, cv: s.cv,
        useManualMass: s.useManualMass, useManualCanopy: s.useManualCanopy,
        multicut: s.multicut, cutInterval: s.cutInterval, ghCutCount: s.ghCutCount,
        ghCutMasses: s.ghCutMasses ? s.ghCutMasses.slice() : [],
        useManualCutMass: s.useManualCutMass, lighting: s.lighting,
        targetDli: s.targetDli, targetPhotoperiod: s.targetPhotoperiod,
        facility: s.facility,
        georgyDensityFitted: s.georgyDensityFitted,
        georgyChannel2Rows: s.georgyChannel2Rows,
        georgyFirstCutCh: s.georgyFirstCutCh
      };
    }

    function firstAllowedCvId(){
      var list = filterGeorgyCultivars(deps.allGhCultivars ? deps.allGhCultivars() : []);
      return list.length ? list[0].id : RUCOLA_BABY_ID;
    }

    function toggleGeorgyMode(forceOn){
      var s = st();
      var next = forceOn != null ? !!forceOn : !s.georgyMode;
      if (next === s.georgyMode) return;
      if (next){
        s.georgyRestore = captureRestore();
        s.georgyMode = true;
        s.facility = 'greenhouse';
        if (s.appView === 'pallets') s.appView = 'channels';
        if (!isGeorgyCvAllowed(deps.findCvById ? deps.findCvById(s.cv) : null)){
          s.cv = firstAllowedCvId();
        }
        if (isGeorgyRucola()) applyGeorgyRucolaStandard();
        else if (isGeorgyLettuce()) applyGeorgyLettuceStandard();
        else {
          s.georgyDensityFitted = false;
          s.georgyChannel2Rows = false;
          s.multicut = false;
        }
        s.lighting = true;
        deps.setFacility && deps.setFacility('greenhouse');
      } else {
        s.georgyMode = false;
        s.georgyFirstCutCh = null;
        s.georgyChannel2Rows = false;
        s.georgyDensityFitted = false;
        if (s.georgyRestore){
          Object.keys(s.georgyRestore).forEach(function(k){ s[k] = s.georgyRestore[k]; });
          s.georgyRestore = null;
        }
      }
      try { localStorage.setItem(GEORGY_STORAGE_KEY, next ? '1' : '0'); } catch(_){}
      setGeorgyDom(next);
      deps.renderAll && deps.renderAll();
    }

    function loadGeorgyMode(){
      try {
        if (localStorage.getItem(GEORGY_STORAGE_KEY) === '1'){
          st().georgyMode = true;
          st().facility = 'greenhouse';
          if (!isGeorgyCvAllowed(deps.findCvById ? deps.findCvById(st().cv) : null)){
            st().cv = firstAllowedCvId();
          }
          st().georgyDensityFitted = false;
          var cv = deps.getCv();
          if (isGeorgyProfiled(cv)) applyGeorgyProfilePresets(cv);
          setGeorgyDom(true);
        }
      } catch(_){}
    }

    function onGeorgyDayChanged(){
      st().georgyDensityFitted = false;
    }

    return {
      isGeorgyGh: isGeorgyGh,
      isGeorgyRucola: isGeorgyRucola,
      isGeorgyLettuce: isGeorgyLettuce,
      isGeorgyProfiled: isGeorgyProfiled,
      getGeorgyProfile: getGeorgyProfile,
      isGeorgyCvAllowed: isGeorgyCvAllowed,
      filterGeorgyCultivars: filterGeorgyCultivars,
      usesGeorgyChannel2Rows: usesGeorgyChannel2Rows,
      applyGeorgyRucolaStandard: applyGeorgyRucolaStandard,
      applyGeorgyLettuceStandard: applyGeorgyLettuceStandard,
      resolveGeorgyMaxCuts: resolveGeorgyMaxCuts,
      georgyYieldFactor: function(profile, temp){ return georgyYieldFactor(profile, temp); },
      georgyYieldLossPct: georgyYieldLossPct,
      normativeBabyCutMass: normativeBabyCutMass,
      adjustMassForGeorgyBaby: adjustMassForGeorgyBaby,
      clampBabyNch: clampBabyNch,
      RUCOLA_BABY_ID: RUCOLA_BABY_ID,
      LETTUCE_BABY_ID: LETTUCE_BABY_ID,
      RUCOLA_PROFILE: RUCOLA_PROFILE,
      LETTUCE_PROFILE: LETTUCE_PROFILE,
      preChannelDaysGeorgy: preChannelDaysGeorgy,
      applyGeorgyBeforeCalc: applyGeorgyBeforeCalc,
      syncGeorgyControls: syncGeorgyControls,
      renderGeorgyWarnings: renderGeorgyWarnings,
      renderGeorgyGuide: renderGeorgyGuide,
      toggleGeorgyMode: toggleGeorgyMode,
      loadGeorgyMode: loadGeorgyMode,
      applyGeorgyDensityAuto: applyGeorgyDensityAuto,
      setGeorgyTargetDensity: setGeorgyTargetDensity,
      densityFromCanopy: densityFromCanopy,
      layoutAtDensity: layoutAtDensity,
      estimateGeorgyHarvest: estimateGeorgyHarvest,
      MAX_LEAF_OVERLAP_MM: MAX_LEAF_OVERLAP_MM,
      onGeorgyDayChanged: onGeorgyDayChanged,
      GERM_DAYS: GERM_DAYS
    };
  }

  global.DG_createGeorgyMode = createGeorgyMode;
})(typeof window !== 'undefined' ? window : this);
