/**
 * calc(), calcScenario* — ядро расчёта посадки.
 * DG_createPlantingCalcCore(deps)
 */
(function (global) {
  'use strict';

  function createPlantingCalcCore(deps) {
    function st() { return deps.getState(); }
    function georgyModeRef() {
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
    function withUsefulAreaYield(r, cv) {
      if (!r || !deps.usefulYield) return r;
      var patch = deps.usefulYield.applyToCalcResult(cv || r.cv, r, {
        mass: r.mass,
        rhoA: r.rhoA,
        yieldPerSqmCycle: r.yieldPerSqmCycle
      });
      return Object.assign({}, r, patch);
    }
    var MAX_WIDTH = deps.MAX_WIDTH || 2000;
    var CH_W = deps.CH_W || 110;

  /* ---- Scenario calc: like calc() but with explicit cv/month/lighting/temp ---- */
  function calcScenario(opts){
    const cv = findCvById(opts.cv) || getCv();
    /* Build a temporary "st()-like" object for environment functions */
    const saved = {
      cv: st().cv, month: st().month, lighting: st().lighting, temp: st().temp,
      facility: st().facility, targetDli: st().targetDli, targetPhotoperiod: st().targetPhotoperiod
    };
    if (opts.facility) st().facility = opts.facility;
    st().cv = cv.id;
    if (opts.month != null) st().month = opts.month;
    if (opts.lighting != null) st().lighting = opts.lighting;
    if (opts.temp != null) st().temp = opts.temp;
    if (opts.targetDli != null) st().targetDli = opts.targetDli;
    if (opts.targetPhotoperiod != null) st().targetPhotoperiod = opts.targetPhotoperiod;

    const tHarvestCh = harvestChannel(cv);
    const tTotalHarvest = totalAge(tHarvestCh);

    /* Mass and canopy at recommended harvest day */
    const massRaw = massAtTotal(cv, tTotalHarvest);
    const lay = plantLayout(cv);
    const { a, b, offMm, diag, nearest, rhoA, perChan, perRow, total, sysWmm, sysArea } = lay;
    const canopyAtMax = effectiveCa(cv) * Math.sqrt(cv.M_max);
    const crowdF = crowdingFactor(canopyAtMax, nearest);
    const massAuto = massRaw * crowdF;
    const mass = manualHarvestMass(massAuto);

    const totalCycleDays = preChannelDays() + Math.round(tHarvestCh);
    const cyclesPerYear = totalCycleDays > 0 ? 365 / totalCycleDays : 0;
    const yieldPerCycleKg = global.DG_yieldPerCycleTotalFromMass
      ? global.DG_yieldPerCycleTotalFromMass(cv, mass, total)
      : mass * total / 1000;
    const yieldPerSqmCycle = global.DG_yieldPerSqmCycleFromMass
      ? global.DG_yieldPerSqmCycleFromMass(cv, mass, rhoA)
      : mass * rhoA / 1000;
    const yieldPerSqmYear = yieldPerSqmCycle * cyclesPerYear;

    /* Electricity: kWh/m²·сут = DLI_досветки / (КПД × 3.6); теплица 2.1, сити-ферма 2.3–2.5 µmol/Дж */
    const suppDli = lightingMolForEnergy();
    const kwhPerSqmPerDay = kwhPerSqmPerDayFromDli(suppDli);
    const kwhPerYear = kwhPerSqmPerDay * sysArea * 365;
    const electricityCost = kwhPerYear * st().pricePerKwh;
    const revenue = yieldPerSqmYear * sysArea * st().pricePerKg;
    const netProfit = revenue - electricityCost;

    /* Growth multiplier and shading info */
    const growthMult = dliFactor() * effectiveTempFactor(cv);
    const naturalDliVal = naturalDLI();
    const effectiveDliVal = effectiveDLI();
    const boltShiftDays = boltShift(cv);

    /* Restore st() */
    st().cv = saved.cv; st().month = saved.month; st().lighting = saved.lighting; st().temp = saved.temp;
    st().facility = saved.facility; st().targetDli = saved.targetDli; st().targetPhotoperiod = saved.targetPhotoperiod;

    return {
      cv, mass, canopy: effectiveCa(cv) * Math.sqrt(mass),
      tHarvestCh, totalCycleDays, cyclesPerYear,
      yieldPerCycleKg, yieldPerSqmCycle, yieldPerSqmYear,
      total, rhoA, sysArea,
      kwhPerYear, electricityCost, revenue, netProfit,
      growthMult, naturalDliVal, effectiveDliVal, suppDli, boltShiftDays, crowdF
    };
  }


  function calcScenarioVf(vfId, opts){
    const saved = { vfCv: st().vfCv, vfStd: { ...st().vfStd }, temp: st().temp, targetDli: st().targetDli, targetPhotoperiod: st().targetPhotoperiod, facility: st().facility };
    st().vfCv = vfId || st().vfCv;
    if (opts.temp != null) st().temp = opts.temp;
    if (opts.targetDli != null) st().targetDli = opts.targetDli;
    if (opts.targetPhotoperiod != null) st().targetPhotoperiod = opts.targetPhotoperiod;
    st().facility = 'vertical';
    const r = calcFromVfSheet(getVfCv());
    const suppDli = lightingMolForEnergy();
    const kwhPerSqmPerDay = kwhPerSqmPerDayFromDli(suppDli);
    const kwhPerYear = kwhPerSqmPerDay * r.sysArea * 365;
    const electricityCost = kwhPerYear * st().pricePerKwh;
    const revenue = r.yieldPerSqmYear * r.sysArea * st().pricePerKg;
    const netProfit = revenue - electricityCost;
    const growthMult = dliFactor() * tempFactor(r.cv);
    st().vfCv = saved.vfCv;
    st().vfStd = saved.vfStd;
    st().temp = saved.temp;
    st().targetDli = saved.targetDli;
    st().targetPhotoperiod = saved.targetPhotoperiod;
    st().facility = saved.facility;
    return Object.assign({}, r, { kwhPerYear, electricityCost, revenue, netProfit, growthMult, naturalDliVal: 0, effectiveDliVal: effectiveDLI(), suppDli, boltShiftDays: boltShift(r.cv) });
  }

  function calcScenarioPallet(palletCvId, opts){
    const saved = getPlantingStateEconSlice();
    const prevFacility = st().facility;
    try {
      st().appView = 'pallets';
      st().palletCv = palletCvId || st().palletCv;
      st().facility = 'vertical';
      if (opts && opts.temp != null) st().temp = opts.temp;
      if (opts && opts.targetDli != null) st().targetDli = opts.targetDli;
      if (opts && opts.targetPhotoperiod != null) st().targetPhotoperiod = opts.targetPhotoperiod;
      const cv = getPalletCv();
      applyPalletStandardsFromSheet(cv, { econ: true });
      const r = calcFromPalletSheet(cv);
      const suppDli = st().targetDli;
      const kwhPerSqmPerDay = kwhPerSqmPerDayFromDli(suppDli);
      const kwhPerYear = kwhPerSqmPerDay * r.sysArea * 365;
      const electricityCost = kwhPerYear * st().pricePerKwh;
      const revenue = r.yieldPerSqmYear * r.sysArea * st().pricePerKg;
      const netProfit = revenue - electricityCost;
      const growthMult = dliFactor() * tempFactor(r.cv);
      return Object.assign({}, r, {
        mass: r.mass, canopy: r.canopy,
        kwhPerYear, electricityCost, revenue, netProfit,
        growthMult, naturalDliVal: 0, effectiveDliVal: suppDli, suppDli,
        boltShiftDays: boltShift(r.cv), crowdF: r.crowdF
      });
    } finally {
      restorePlantingStateEconSlice(saved);
      st().facility = prevFacility;
    }
  }

  function calc(){
    var ghCh = deps.getGhChannelSimple ? deps.getGhChannelSimple() : null;
    if (ghCh && ghCh.applyBeforeCalc) ghCh.applyBeforeCalc();
    var gm = georgyModeRef();
    if (gm) {
      if (gm.isGeorgyGh && gm.isGeorgyGh()) gm.applyGeorgyBeforeCalc();
      else if (gm.applyCanopyDensityBeforeCalc) gm.applyCanopyDensityBeforeCalc();
    }
    if (isPalletView()){
      let r;
      if (allPalletCultivars().length) r = calcFromPalletSheet(getPalletCv());
      else r = Object.assign(plantLayoutPallet(), { cv: { name: '—', M_max: 40, ca: 10, bolt: 90, t_opt: 22 }, t_ch: st().day, mass: 0, canopy: 0, massAuto: 0, palletSheet: true });
      r.palletMode = true;
      r.vfMode = false;
      return withUsefulAreaYield(r, r.cv);
    }
    if (isVF() && allVfCultivars().length) return withUsefulAreaYield(calcFromVfSheet(getVfCv()), getVfCv());
    const cv = getCv();
    const t_ch = st().day;
    let t_total = totalAge(t_ch);
    if (georgyModeRef() && georgyModeRef().isGeorgyHeadSalad && georgyModeRef().isGeorgyHeadSalad(cv)){
      const tdGeorgy = georgyModeRef().totalDaysFromSowGeorgy(cv);
      if (tdGeorgy != null && tdGeorgy > 0) t_total = tdGeorgy;
    } else if (ghCh && ghCh.isEnabled && ghCh.isEnabled() && ghCh.totalDaysFromSow) {
      const tdCh = ghCh.totalDaysFromSow(cv);
      if (tdCh > 0) t_total = tdCh;
    }
    const massRaw = massAtTotal(cv, t_total);
    const canopyRaw = canopyAtTotal(cv, t_total);

    const lay = plantLayout(cv);
    const { a, b, offMm, diag, nearest, rhoA, perChan, perRow, total, sysWmm, sysArea, constrained, vfMode } = lay;
    const rhoT = st().density;

    const georgyProf = georgyModeRef() && georgyModeRef().isGeorgyGh() && georgyModeRef().getGeorgyProfile(cv);
    const canopyAtMax = effectiveCa(cv) * Math.sqrt(cv.M_max);
    const crowdF = crowdingFactor(canopyAtMax, nearest);
    let massAuto = georgyProf
      ? georgyModeRef().normativeBabyCutMass(georgyProf, cv, 0)
      : massRaw * crowdF;
    let mass = manualHarvestMass(massAuto);
    let canopy = harvestCanopy(cv, mass);
    const intervalMod = applyCutIntervalHarvestMods(cv, mass, canopy);
    mass = intervalMod.mass;
    canopy = intervalMod.canopy;
    const rgrMass = rgrAtTotal(cv, t_total) * 100;
    const rgrCanopy = rgrMass / 2;
    const tHarvestCh = harvestChannel(cv);
    const tBoltCh = boltChannel(cv);
    const growthStage = stageOf(t_ch, mass, tBoltCh, cv);

    const edgeGap = nearest - holeDiameter(cv);
    let leafGap = nearest - canopy;
    if (gm && st().georgyDensityFitted && st().georgyTargetDensity > 0 && gm.layoutAtDensity){
      var fitCv = cv;
      var useFitGap = (gm.isGeorgyHeadSalad && gm.isGeorgyHeadSalad(fitCv)) ||
        (gm.isHeadLettuceChannel && gm.isHeadLettuceChannel(fitCv));
      if (useFitGap){
        var layFit = gm.layoutAtDensity(fitCv, st().georgyTargetDensity);
        leafGap = layFit.gap;
      }
    }

    const widthExceeds = sysWmm > MAX_WIDTH;
    const widthClose = !widthExceeds && sysWmm > MAX_WIDTH - 200;
    const maxChannelsFit = Math.max(2, Math.floor((MAX_WIDTH - CH_W) / b) + 1);

    /* Cycle metrics (полный цикл — для календаря; урожай с площади — в withUsefulAreaYield) */
    const totalCycleDays = preChannelDays() + Math.round(tHarvestCh);
    const totalDaysFromSow = preChannelDays() + Math.round(t_ch);
    const yieldPerCycleKg = mass * total / 1000;
    const yieldPerSqmCycle = mass * rhoA / 1000;

    return withUsefulAreaYield({ cv, t_ch, t_total, mass, massAuto, canopy, massRaw, canopyRaw, crowdF,
             rgrMass, rgrCanopy, tHarvestCh, tBoltCh, st: growthStage,
             a, b, diag, nearest, edgeGap, offMm, constrained,
             rhoT, rhoA, leafGap,
             perChan, perRow, total, sysWmm, sysArea, vfMode,
             widthExceeds, widthClose, maxChannelsFit,
             totalCycleDays, totalDaysFromSow,
             yieldPerCycleKg, yieldPerSqmCycle }, cv);
  }
    return {
      calcScenario: calcScenario,
      calcScenarioVf: calcScenarioVf,
      calcScenarioPallet: calcScenarioPallet,
      calc: calc
    };
  }

  global.DG_createPlantingCalcCore = createPlantingCalcCore;
})(typeof window !== 'undefined' ? window : globalThis);
