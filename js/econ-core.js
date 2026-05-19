/** Расчёт экономики — DG_createEconCore */
(function(global){
  'use strict';

  const ECON_DEFAULT_CONSUMABLES_PER_POT = 4;
  const ECON_CONSUMABLES_PER_POT_HINT = '3–6';
  const ECON_SALAD_MIX_ID = '__salad_mix__';
  const ECON_SALAD_MIX_CV_IDS = [
    'vf-kale-baby', 'vf-mizuna-baby', 'vf-mustard-baby', 'vf-chard-baby',
    'vf-romano-baby', 'vf-corn',
    'vf-pakchoi-baby', 'vf-tatsoi-baby', 'vf-komatsuna-baby'
  ];
  var ECON_MONTH_DAYS = (global.DG_CUT && global.DG_CUT.HARVEST_MONTH_DAYS) || 30.5;
  const ECON_MAX_CULTURES = 6;

  const ECON_EQUIPMENT_GROUPS_RAW = [
    { titleKey: 'econ.eq.grp.prod', items: [
      ['prodMain', 'econ.eq.prodMain'],
      ['solutionUnit', 'econ.eq.solutionUnit'],
      ['irrigationModule', 'econ.eq.irrigationModule']
    ]},
    { titleKey: 'econ.eq.grp.services', items: [
      ['marketing', 'econ.eq.marketing'],
      ['design', 'econ.eq.design'],
      ['install', 'econ.eq.install'],
      ['commissioning', 'econ.eq.commissioning']
    ]},
    { titleKey: 'econ.eq.grp.extra', items: [
      ['consumables', 'econ.eq.consumables'],
      ['auxEquip', 'econ.eq.auxEquip'],
      ['extraProd', 'econ.eq.extraProd']
    ]},
    { titleKey: 'econ.eq.grp.prep', items: [
      ['prepRent', 'econ.eq.prepRent'],
      ['prepClimate', 'econ.eq.prepClimate'],
      ['prepElectric', 'econ.eq.prepElectric'],
      ['prepWater', 'econ.eq.prepWater'],
      ['prepRepair', 'econ.eq.prepRepair'],
      ['prepOther', 'econ.eq.prepOther']
    ]}
  ];


  global.DG_ECON = {
    ECON_DEFAULT_CONSUMABLES_PER_POT: ECON_DEFAULT_CONSUMABLES_PER_POT,
    ECON_CONSUMABLES_PER_POT_HINT: ECON_CONSUMABLES_PER_POT_HINT,
    ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,
    ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,
    ECON_MONTH_DAYS: ECON_MONTH_DAYS,
    ECON_MAX_CULTURES: ECON_MAX_CULTURES,
    ECON_EQUIPMENT_GROUPS_RAW: ECON_EQUIPMENT_GROUPS_RAW
  };

  function createEconCore(deps){
    function st(){ return deps.getState(); }

    function T(k, ru){
      if (deps.t){
        var v = deps.t(k);
        if (v != null && v !== k) return v;
      }
      return ru != null ? ru : k;
    }

    function TF(k, vars, ru){
      if (deps.tFmt) return deps.tFmt(k, vars);
      var s = T(k, ru);
      if (vars){
        Object.keys(vars).forEach(function(vk){
          s = s.replace(new RegExp('\\{' + vk + '\\}', 'g'), String(vars[vk]));
        });
      }
      return s;
    }

    function getEquipmentGroups(){
      return ECON_EQUIPMENT_GROUPS_RAW.map(function(g){
        return {
          title: T(g.titleKey, g.titleKey),
          items: g.items.map(function(it){
            return [it[0], T(it[1], it[1])];
          })
        };
      });
    }

  function getActivePlantingCvId(){
    return deps.getActivePlantingCvId ? deps.getActivePlantingCvId() : '';
  }

  function defaultEconEquipment(){
    const o = {};
    ECON_EQUIPMENT_GROUPS_RAW.forEach(g => g.items.forEach(function(it){ o[it[0]] = 0; }));
    return o;
  }

  function defaultEconCultureRow(cvId, opts){
    opts = opts || {};
    const row = {
      cvId: cvId || '',
      pct: opts.pct != null ? opts.pct : (opts.isNew ? 0 : 100),
      salePrice: 0,
      density: 80,
      yieldPerCut: 15,
      cutIntervalDays: 15,
      kwhPerM2Hour: 0.08,
      lightHoursDay: 16,
      consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT,
      potHarvestMonths: 3,
      unitIsPieces: false
    };
    if (st().econ){
      row.kwhPerM2Hour = parseFloat(st().econ.kwhPerM2Hour) || row.kwhPerM2Hour;
      row.lightHoursDay = parseFloat(st().econ.lightHoursDay) || row.lightHoursDay;
    }
    if (cvId) Object.assign(row, econCatalogDefaultsForCvId(cvId));
    return row;
  }

  function defaultEconCultures(){
    const id = getActivePlantingCvId();
    return [defaultEconCultureRow(id, { pct: 100 })];
  }

  function defaultEconState(){
    return {
      priceKwh: 5,
      rentMonth: 0,
      staffCount: 2,
      staffSalary: 55000,
      payrollTax: true,
      logisticsMonth: 0,
      floorArea: 200,
      plantingArea: 150,
      cultures: defaultEconCultures(),
      salePrice: 800,
      kwhPerM2Hour: 0.08,
      lightHoursDay: 16,
      otherElecKw: 1.1,
      otherElecHoursDay: 24,
      otherMonth: 15000,
      consumablesPerKg: 0,
      wastePct: 0,
      usnTax: false,
      amortMonths: 60,
      equipmentEnabled: true,
      equipment: defaultEconEquipment(),
      equipmentCustom: []
    };
  }

  function econCvDisplayName(cvId){
    if (!cvId) return T('econ.cv.noSort', 'Культура (без сорта)');
    if (cvId === ECON_SALAD_MIX_ID) return T('econ.opt.mix', 'Микс салатов');
    const cv = deps.findCvById(cvId);
    return cv ? cv.name : cvId;
  }

  /** Урожай за одну срезку (г или шт), не сумма за цикл — для мультисрезки в теплице */
  function econGhYieldPerCutFromStd(cv, std){
    if (cv && cv.multicut && std.ghCutCount > 1 && std.ghCutMasses){
      const masses = std.ghCutMasses.slice(0, std.ghCutCount).map(x => parseFloat(x) || 0).filter(x => x > 0);
      if (masses.length){
        return Math.round((masses.reduce((a, b) => a + b, 0) / masses.length) * 10) / 10;
      }
    }
    return Math.round((std.manualMass || 0) * 10) / 10;
  }

  function econCvTotalCycleDays(cv, snap){
    if (snap && snap.totalCycleDays > 0) return Math.round(snap.totalCycleDays);
    if (!cv) return 0;
    return Math.max(1, Math.round((cv.germination || 0) + 14 + (cv.channelDays || 0)));
  }

  function econSheetCutIntervalDays(cv, snap){
    if (snap && snap.multicutHarvest && snap.harvestCutIntervalDays > 0){
      return Math.max(1, Math.round(snap.harvestCutIntervalDays));
    }
    if (cv && cv.multicut && deps.supportsMulticut(cv) && cv.cutInterval > 0){
      return Math.max(1, Math.round(cv.cutInterval));
    }
    return Math.max(1, econCvTotalCycleDays(cv, snap));
  }

  function econSheetYieldPerCut(cv, snap){
    if (snap && snap.multicutHarvest && snap.harvestYieldPerCut > 0){
      return Math.round(snap.harvestYieldPerCut * 10) / 10;
    }
    if (cv && cv.multicut && deps.supportsMulticut(cv) && cv.yieldPerCutG > 0){
      return Math.round(cv.yieldPerCutG * 10) / 10;
    }
    if (cv && cv.yieldPerCutG > 0) return Math.round(cv.yieldPerCutG * 10) / 10;
    return Math.round((snap && snap.yieldPerPotCycle || 0) * 10) / 10;
  }

  function econYieldParamsForCvId(cvId, snap){
    snap = snap || deps.getPlantingSnapshotForCvId(cvId);
    const cv = deps.findCvById(cvId);
    if (snap && snap.multicutHarvest){
      return {
        yieldPerCut: econSheetYieldPerCut(cv, snap),
        cutIntervalDays: econSheetCutIntervalDays(cv, snap)
      };
    }
    if (deps.isPalletCvId(cvId) && cv){
      return {
        yieldPerCut: econSheetYieldPerCut(cv, snap),
        cutIntervalDays: econSheetCutIntervalDays(cv, snap)
      };
    }
    const gh = deps.allGhCultivars().find(c => c.id === cvId);
    if (gh && !deps.isVfCvId(cvId)){
      const std = deps.getGhCvStandards(gh);
      if (gh.multicut && deps.supportsMulticut(gh)){
        return {
          yieldPerCut: econGhYieldPerCutFromStd(gh, std),
          cutIntervalDays: Math.max(1, std.cutInterval || deps.cutIntervalRange(gh).mid)
        };
      }
      return {
        yieldPerCut: Math.round(snap.yieldPerPotCycle * 10) / 10,
        cutIntervalDays: Math.max(1, snap.totalCycleDays || std.cutInterval || deps.cutIntervalRange(gh).mid)
      };
    }
    if (deps.isVfCvId(cvId) && cv){
      return {
        yieldPerCut: econSheetYieldPerCut(cv, snap),
        cutIntervalDays: econSheetCutIntervalDays(cv, snap)
      };
    }
    return {
      yieldPerCut: Math.round(snap.yieldPerPotCycle * 10) / 10,
      cutIntervalDays: Math.max(1, snap.totalCycleDays || 15)
    };
  }

  function econCatalogDefaultsForCvId(cvId){
    const e = st().econ;
    const light = {
      kwhPerM2Hour: parseFloat(e && e.kwhPerM2Hour) || 0.08,
      lightHoursDay: parseFloat(e && e.lightHoursDay) || 16
    };
    if (!cvId) return light;
    if (cvId === ECON_SALAD_MIX_ID){
      const rows = ECON_SALAD_MIX_CV_IDS.map(id => econCatalogDefaultsForCvId(id));
      const avg = key => rows.reduce((s, r) => s + (r[key] || 0), 0) / rows.length;
      return Object.assign({
        density: Math.round(avg('density')),
        yieldPerCut: Math.round(avg('yieldPerCut') * 10) / 10,
        cutIntervalDays: Math.max(1, Math.round(avg('cutIntervalDays'))),
        unitIsPieces: rows.some(r => r.unitIsPieces)
      }, light);
    }
    if (deps.isPalletCvId(cvId) && deps.allPalletCultivars().length){
      const cv = deps.allPalletCultivars().find(c => c.id === cvId);
      if (!cv) return light;
      const snap = deps.getPlantingSnapshotForCvId(cvId);
      const yp = econYieldParamsForCvId(cvId, snap);
      return Object.assign({
        density: Math.round(snap.rhoA || cv.density),
        yieldPerCut: yp.yieldPerCut,
        cutIntervalDays: yp.cutIntervalDays,
        unitIsPieces: snap.unitIsPieces,
        potHarvestMonths: parsePotHarvestMonthsFromCv(cv, snap),
        consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT
      }, light);
    }
    if (deps.isVfCvId(cvId) && deps.allVfCultivars().length){
      const cv = deps.allVfCultivars().find(c => c.id === cvId);
      if (!cv) return light;
      const snap = deps.getPlantingSnapshotForCvId(cvId);
      const yp = econYieldParamsForCvId(cvId, snap);
      const std = deps.buildDefaultVfStandards(cv);
      return Object.assign({
        density: Math.round(snap.rhoA || std.density),
        yieldPerCut: yp.yieldPerCut,
        cutIntervalDays: yp.cutIntervalDays,
        unitIsPieces: cv.countUnit === 'шт',
        potHarvestMonths: parsePotHarvestMonthsFromCv(cv, snap),
        consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT
      }, light);
    }
    const cv = deps.allGhCultivars().find(c => c.id === cvId);
    if (!cv || deps.isVfCvId(cvId)) return light;
    const std = deps.getGhCvStandards(cv);
    const snap = deps.getPlantingSnapshotForCvId(cvId);
    return Object.assign({
      density: std.density,
      yieldPerCut: econGhYieldPerCutFromStd(cv, std),
      cutIntervalDays: Math.max(1, std.cutInterval || deps.cutIntervalRange(cv).mid),
      unitIsPieces: false,
      potHarvestMonths: parsePotHarvestMonthsFromCv(cv, snap),
      consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT
    }, light);
  }

  function normalizeEconCultureRow(row){
    const base = defaultEconCultureRow('');
    const out = Object.assign(base, row || {});
    out.cvId = row && row.cvId != null ? row.cvId : '';
    out.pct = row && row.pct != null ? row.pct : base.pct;
    out.salePrice = row && row.salePrice != null ? row.salePrice : 0;
    out.unitIsPieces = !!(row && row.unitIsPieces);
    const consRaw = row && row.consumablesPerPot != null ? parseFloat(row.consumablesPerPot) : NaN;
    out.consumablesPerPot = Number.isFinite(consRaw) && consRaw > 0 ? consRaw : ECON_DEFAULT_CONSUMABLES_PER_POT;
    out.potHarvestMonths = row && row.potHarvestMonths != null ? Math.max(0.25, parseFloat(row.potHarvestMonths) || 3) : 3;
    return out;
  }

  /** Срок списания горшка/кассеты (мес) для расходников на посев */
  function parsePotHarvestMonthsFromCv(cv, snap){
    if (!cv) return 3;
    const note = String(cv.replaceNote || cv.cutNote || '').toLowerCase();
    const cycleDays = econCvTotalCycleDays(cv, snap);
    if (cv.multicut === false || (!cv.multicut && !deps.supportsMulticut(cv))){
      if (cycleDays > 0) return Math.max(0.25, cycleDays / ECON_MONTH_DAYS);
      if (/45\s*сут/.test(note)) return Math.max(0.25, 45 / ECON_MONTH_DAYS);
      if (/однократн/.test(note)) return Math.max(0.25, (cycleDays > 0 ? cycleDays : 57) / ECON_MONTH_DAYS);
    }
    if (cv.potHarvestMonths > 0) return Math.max(0.25, cv.potHarvestMonths);
    if (/45\s*сут/.test(note)){
      return Math.max(0.25, (cycleDays > 0 ? cycleDays : 45) / ECON_MONTH_DAYS);
    }
    const fn = (window.VF_SHEET && window.VF_SHEET.replaceMonthsFromNote)
      || (window.PALLET_SHEET && window.PALLET_SHEET.replaceMonthsFromNote);
    if (fn){
      const fromNote = fn(cv.replaceNote || '', cv.cutNote || '');
      if (fromNote > 0) return Math.max(0.25, fromNote);
    }
    if (/до\s*года|вечноцвет/.test(note)) return 12;
    if (/однократн/.test(note) && cycleDays > 0) return Math.max(0.25, cycleDays / ECON_MONTH_DAYS);
    let m = note.match(/(\d+)\s*[-–]\s*(\d+)\s*нед/);
    if (m) return Math.max(0.25, Math.ceil(parseInt(m[2], 10) / 4));
    m = note.match(/(\d+)\s*нед/);
    if (m) return Math.max(0.25, Math.ceil(parseInt(m[1], 10) / 4));
    m = note.match(/(\d+)\s*[-–]\s*(\d+)\s*мес/);
    if (m) return Math.max(0.25, parseInt(m[2], 10));
    m = note.match(/(\d+)\s*мес/);
    if (m) return Math.max(0.25, parseInt(m[1], 10));
    if (/^\d+$/.test(String(cv.replaceNote || '').trim())) return Math.max(0.25, parseInt(cv.replaceNote, 10));
    if (deps.supportsMulticut(cv) && cv.channelDays > 0 && cv.cutInterval > 0){
      const cuts = Math.max(1, Math.floor(cv.channelDays / cv.cutInterval));
      return Math.max(0.25, (cuts * cv.cutInterval) / ECON_MONTH_DAYS);
    }
    if (cv.channelDays > 0) return Math.max(0.25, cv.channelDays / ECON_MONTH_DAYS);
    return 3;
  }

  function migrateEconCultureRows(){
    ensureEconCultures();
    st().econ.cultures = st().econ.cultures.map(row => {
      if (row.density != null && row.yieldPerCut != null && row.cutIntervalDays != null) {
        return normalizeEconCultureRow(row);
      }
      const cvId = row.cvId || '';
      const merged = normalizeEconCultureRow(row);
      if (cvId) Object.assign(merged, econCatalogDefaultsForCvId(cvId));
      merged.pct = row.pct != null ? row.pct : merged.pct;
      merged.salePrice = row.salePrice != null ? row.salePrice : 0;
      merged.cvId = cvId;
      return merged;
    });
    if (st().econ.cultures.length === 1 && !st().econ.cultures[0].cvId){
      const id = getActivePlantingCvId();
      if (id){
        const keptPct = st().econ.cultures[0].pct != null ? st().econ.cultures[0].pct : 100;
        st().econ.cultures[0] = econApplyCultureSelect(normalizeEconCultureRow({ cvId: id, pct: keptPct }), id, keptPct, 0);
      }
    }
    if (st().econ.cultures.length > ECON_MAX_CULTURES){
      st().econ.cultures = st().econ.cultures.slice(0, ECON_MAX_CULTURES);
    }
  }

  function econCultureBio(row){
    row = normalizeEconCultureRow(row);
    const density = Math.max(0, parseFloat(row.density) || 0);
    const yieldPerCut = Math.max(0, parseFloat(row.yieldPerCut) || 0);
    const cutIntervalDays = Math.max(1, parseFloat(row.cutIntervalDays) || 15);
    const cutsPerMonth = ECON_MONTH_DAYS / cutIntervalDays;
    const yieldPerPotMonth = yieldPerCut * cutsPerMonth;
    const unitIsPieces = !!row.unitIsPieces;
    let yieldPerSqmMonthKg = 0;
    let yieldPerSqmMonthPcs = 0;
    if (unitIsPieces){
      yieldPerSqmMonthPcs = yieldPerPotMonth * density;
    } else {
      yieldPerSqmMonthKg = (yieldPerPotMonth / 1000) * density;
    }
    return {
      density: density,
      yieldPerCut: yieldPerCut,
      cutIntervalDays: cutIntervalDays,
      cutsPerMonth: cutsPerMonth,
      yieldPerPotMonth: yieldPerPotMonth,
      unitIsPieces: unitIsPieces,
      yieldUnit: unitIsPieces ? 'шт' : 'г',
      yieldPerSqmMonthKg: yieldPerSqmMonthKg,
      yieldPerSqmMonthPcs: yieldPerSqmMonthPcs,
      outputUnit: unitIsPieces ? 'шт' : 'кг',
      kwhPerM2Hour: parseFloat(row.kwhPerM2Hour) || 0,
      lightHoursDay: parseFloat(row.lightHoursDay) || 0,
      consumablesPerPot: parseFloat(row.consumablesPerPot) || ECON_DEFAULT_CONSUMABLES_PER_POT,
      potHarvestMonths: Math.max(0.25, parseFloat(row.potHarvestMonths) || 3)
    };
  }

  function formatEconCultureHint(row){
    const norm = normalizeEconCultureRow(row);
    const bio = econCultureBio(norm);
    const dUnit = T('econ.unit.days', 'сут');
    const ySqm = bio.unitIsPieces
      ? deps.r1(bio.yieldPerSqmMonthPcs) + ' ' + T('econ.yield.pcsSqm', 'шт/м²·мес')
      : deps.r2(bio.yieldPerSqmMonthKg) + ' ' + T('econ.yield.kgSqm', 'кг/м²·мес');
    const intervalLbl = bio.cutsPerMonth > 1.05
      ? TF('econ.hint.interval', { days: deps.r1(bio.cutIntervalDays), dUnit: dUnit }, 'интервал {days} {dUnit}')
      : TF('econ.hint.fullCycle', { days: deps.r1(bio.cutIntervalDays), dUnit: dUnit }, 'полный цикл {days} {dUnit}');
    let h = TF('econ.hint.cutsMo', {
      cuts: deps.r1(bio.cutsPerMonth),
      intervalLbl: intervalLbl,
      yieldPot: deps.r1(bio.yieldPerPotMonth),
      unit: bio.yieldUnit,
      ySqm: ySqm,
      kwh: deps.r3(bio.kwhPerM2Hour),
      lightH: deps.r1(bio.lightHoursDay)
    }, 'Срезок в месяц: <strong>{cuts}</strong> ({intervalLbl}) · с 1 горшка: <strong>{yieldPot} {unit}</strong> · <strong>{ySqm}</strong> · свет {kwh} кВт·ч/м²·ч × {lightH} ч');
    if (norm.consumablesPerPot > 0){
      const consSqm = bio.density > 0 && bio.potHarvestMonths > 0
        ? (bio.density * norm.consumablesPerPot) / bio.potHarvestMonths : 0;
      const consOnce = bio.density * norm.consumablesPerPot;
      var fm = deps.fmtMoney || deps.fmtNum;
      var sym = deps.currencySym ? deps.currencySym() : '₽';
      var perPot = sym + T('econ.perPot', '/горшок');
      var perSqm = sym + T('econ.perSqm', '/м²');
      var perSqmMo = sym + T('econ.perSqmMonth', '/м²·мес');
      h += TF('econ.hint.cons', {
        perPot: fm(norm.consumablesPerPot) + perPot,
        dens: deps.round(bio.density),
        pcsSqm: T('econ.unit.pcsSqm', 'шт/м²'),
        consOnce: fm(consOnce) + perSqm,
        months: deps.r1(bio.potHarvestMonths),
        consMo: fm(consSqm) + perSqmMo
      }, ' · посев <strong>{perPot}</strong> × <strong>{dens} {pcsSqm}</strong> = <strong>{consOnce}</strong>, ÷ <strong>{months}</strong> → <strong>{consMo}</strong>');
    }
    return h;
  }

  /** Расходники на посев: плотность (шт/м²) × площадь × ₽/горшок (семена, горшок, субстрат) ÷ мес урожая с одного посева */
  function calcCultureConsumables(row, area, monthlyOutput, e){
    const bio = econCultureBio(row);
    const potsPerSqm = bio.density;
    const perPot = bio.consumablesPerPot;
    const harvestMonths = bio.potHarvestMonths;
    const pots = potsPerSqm * Math.max(0, area);
    const potCostOnce = pots * perPot;
    let potCostMonth = harvestMonths > 0 ? potCostOnce / harvestMonths : 0;
    let costPerSqm = harvestMonths > 0 && perPot > 0 ? (potsPerSqm * perPot) / harvestMonths : 0;
    const costPerSqmOnce = potsPerSqm * perPot;
    let cost = potCostMonth;
    const perKgExtra = parseFloat(e && e.consumablesPerKg) || 0;
    const wasteFactor = e ? (1 - deps.clamp(parseFloat(e.wastePct) || 0, 0, 50) / 100) : 1;
    const sellableOutput = monthlyOutput * wasteFactor;
    let extraPerSqm = 0;
    if (perKgExtra > 0 && sellableOutput > 0 && area > 0){
      const extra = sellableOutput * perKgExtra;
      cost += extra;
      extraPerSqm = extra / area;
      costPerSqm += extraPerSqm;
    }
    const unitCost = sellableOutput > 0 ? cost / sellableOutput : 0;
    return {
      cost: cost,
      costPerSqm: costPerSqm,
      costPerSqmOnce: costPerSqmOnce,
      potCostOnce: potCostOnce,
      potsPerSqm: potsPerSqm,
      pots: pots,
      perPot: perPot,
      harvestMonths: harvestMonths,
      extraPerSqm: extraPerSqm,
      unitCost: unitCost
    };
  }

  /** Смена сорта: каталог (или посадка, если этот сорт сейчас на экране посадки) */
  function econApplyCultureSelect(row, cvId, pct, salePrice){
    let out = normalizeEconCultureRow(row);
    out.cvId = cvId || '';
    out.pct = pct;
    out.salePrice = salePrice;
    if (!cvId) return out;
    if (deps.plantingCvIdMatchesLiveState(cvId)){
      out = importEconRowFromPlanting(out);
      out.pct = pct;
      out.salePrice = salePrice;
      return normalizeEconCultureRow(out);
    }
    const defs = econCatalogDefaultsForCvId(cvId);
    Object.assign(out, defs, { cvId: cvId, pct: pct, salePrice: salePrice });
    if (cvId === ECON_SALAD_MIX_ID) out.unitIsPieces = false;
    return normalizeEconCultureRow(out);
  }

  function importEconRowFromPlanting(row){
    const cvId = row.cvId || '';
    if (!cvId) return row;
    const cv = deps.findCvById(cvId);
    const snap = deps.getPlantingSnapshotForCvId(cvId);
    const yp = econYieldParamsForCvId(cvId, snap);
    row.density = Math.round(snap.rhoA);
    row.yieldPerCut = yp.yieldPerCut;
    row.cutIntervalDays = yp.cutIntervalDays;
    row.kwhPerM2Hour = Math.round(snap.kwhPerM2Hour * 1000) / 1000;
    row.lightHoursDay = Math.round(snap.lightHoursDay * 10) / 10;
    row.unitIsPieces = !!snap.unitIsPieces;
    if (cv) row.potHarvestMonths = parsePotHarvestMonthsFromCv(cv, snap);
    if (!(parseFloat(row.consumablesPerPot) > 0)) row.consumablesPerPot = ECON_DEFAULT_CONSUMABLES_PER_POT;
    return normalizeEconCultureRow(row);
  }

  function importAllEconFromPlanting(){
    st().econ.priceKwh = st().pricePerKwh;
    ensureEconCultures();

    const activeId = getActivePlantingCvId();
    const liveSnap = deps.getPlantingSnapshot ? deps.getPlantingSnapshot() : null;

    const ghArea = parseFloat(st().ghUsefulArea);
    if (ghArea > 0){
      const area = Math.round(ghArea * 10) / 10;
      st().econ.plantingArea = area;
      if (!st().econ.floorArea || st().econ.floorArea < area) st().econ.floorArea = area;
    } else if (liveSnap && liveSnap.sysArea > 0){
      const area = Math.round(liveSnap.sysArea * 10) / 10;
      st().econ.plantingArea = area;
      if (!st().econ.floorArea || st().econ.floorArea < area) st().econ.floorArea = area;
    }

    if (activeId){
      let idx = st().econ.cultures.findIndex(function(r){ return r.cvId === activeId; });
      if (idx < 0){
        const emptyIdx = st().econ.cultures.findIndex(function(r){ return !r.cvId; });
        if (emptyIdx >= 0) idx = emptyIdx;
        else if (canAddEconCulture()){
          st().econ.cultures.unshift(defaultEconCultureRow(activeId, { pct: 0, isNew: true }));
          idx = 0;
        } else idx = 0;
      }
      let row = normalizeEconCultureRow(Object.assign({}, st().econ.cultures[idx], { cvId: activeId }));
      st().econ.cultures[idx] = importEconRowFromPlanting(row);
    }

    st().econ.cultures.forEach(function(row, i){
      if (!row.cvId) return;
      st().econ.cultures[i] = importEconRowFromPlanting(normalizeEconCultureRow(row));
    });

    dedupeEconCultures();
    const filled = st().econ.cultures.filter(function(r){ return r.cvId; });
    if (filled.length === 1) filled[0].pct = 100;

    deps.saveEconStore();
    return { activeId: activeId, snap: liveSnap, cvName: liveSnap && liveSnap.cvName ? liveSnap.cvName : '' };
  }

  function calcOtherElecMonthly(e){
    const kw = parseFloat(e.otherElecKw) || 0;
    const h = parseFloat(e.otherElecHoursDay) || 0;
    const kwh = kw * h * ECON_MONTH_DAYS;
    const price = parseFloat(e.priceKwh) || 0;
    return { kw: kw, hoursDay: h, kwh: kwh, cost: kwh * price };
  }

  function migrateEconOtherElectricity(e){
    if (e == null) return;
    if (e.otherElecKw == null || isNaN(parseFloat(e.otherElecKw))){
      const legacy = parseFloat(e.otherKwhMonth);
      if (!isNaN(legacy) && legacy > 0){
        const h = parseFloat(e.otherElecHoursDay) || 24;
        e.otherElecHoursDay = h;
        e.otherElecKw = Math.round((legacy / (h * ECON_MONTH_DAYS)) * 100) / 100;
      } else if (e.otherElecKw == null){
        e.otherElecKw = 1.1;
      }
    }
    if (e.otherElecHoursDay == null || isNaN(parseFloat(e.otherElecHoursDay))){
      e.otherElecHoursDay = 24;
    }
  }

  function ensureEconCultures(){
    if (!st().econ.cultures || !st().econ.cultures.length){
      st().econ.cultures = defaultEconCultures();
    }
  }

  function econCulturesTotalPct(){
    ensureEconCultures();
    return st().econ.cultures.reduce((s, row) => s + (parseFloat(row.pct) || 0), 0);
  }

  function calcCultureSliceFromRow(row, e, area, salePrice){
    const bio = econCultureBio(row);
    const monthlyOutput = bio.unitIsPieces
      ? bio.yieldPerSqmMonthPcs * area
      : bio.yieldPerSqmMonthKg * area;
    const kwhM2h = bio.kwhPerM2Hour;
    const lightH = bio.lightHoursDay;
    const lightKwhMonth = area * kwhM2h * lightH * ECON_MONTH_DAYS;
    const lightCost = lightKwhMonth * (parseFloat(e.priceKwh) || 0);
    const cons = calcCultureConsumables(row, area, monthlyOutput, e);
    const revenue = monthlyOutput * (parseFloat(salePrice) || 0);

    return {
      area: area,
      monthlyOutput: monthlyOutput,
      outputUnit: bio.outputUnit,
      lightCost: lightCost,
      lightKwhMonth: lightKwhMonth,
      consumablesCost: cons.cost,
      consumablesPerSqm: cons.costPerSqm,
      consumablesPerSqmOnce: cons.costPerSqmOnce,
      consumablesOnce: cons.potCostOnce,
      consumablesUnitCost: cons.unitCost,
      consumablesPerPot: cons.perPot,
      potHarvestMonths: cons.harvestMonths,
      potsCount: cons.pots,
      potsPerSqm: cons.potsPerSqm,
      revenue: revenue,
      kwhM2h: kwhM2h,
      lightH: lightH,
      yieldPerSqmMonth: bio.unitIsPieces ? bio.yieldPerSqmMonthPcs : bio.yieldPerSqmMonthKg,
      bio: bio
    };
  }

  function dedupeEconCultures(){
    ensureEconCultures();
    const seen = new Set();
    let seenBlank = false;
    const out = [];
    const removed = [];
    st().econ.cultures.forEach(row => {
      const id = row.cvId || '';
      if (!id){
        if (seenBlank){ removed.push(''); return; }
        seenBlank = true;
        out.push(row);
        return;
      }
      if (id !== ECON_SALAD_MIX_ID && seen.has(id)){
        removed.push(id);
        return;
      }
      seen.add(id);
      out.push(row);
    });
    if (removed.length) st().econ.cultures = out.length ? out : defaultEconCultures();
    return removed;
  }

  function canAddEconCulture(){
    ensureEconCultures();
    return st().econ.cultures.length < ECON_MAX_CULTURES;
  }

  function findDuplicateCultureIds(){
    const seen = new Set();
    const dups = [];
    ensureEconCultures();
    st().econ.cultures.forEach(row => {
      const id = row.cvId || '';
      if (!id || id === ECON_SALAD_MIX_ID) return;
      if (seen.has(id)) { if (dups.indexOf(id) < 0) dups.push(id); }
      else seen.add(id);
    });
    return dups;
  }

  function collectEconWarnings(farm, e, parts){
    const w = [];
    const dupIds = findDuplicateCultureIds();
    if (dupIds.length){
      const names = dupIds.map(id => {
        const c = deps.findCvById(id);
        return c ? c.name : id;
      });
      w.push({ level: 'normal', text: TF('econ.warn.dupCv', { names: names.join(', ') }, 'Один сорт нельзя добавить дважды: {names} — оставьте одну строку.') });
    }
    const hasMix = parts.some(p => p.cvId === ECON_SALAD_MIX_ID);
    if (hasMix){
      const overlap = parts.filter(p => p.cvId && p.cvId !== ECON_SALAD_MIX_ID && ECON_SALAD_MIX_CV_IDS.indexOf(p.cvId) >= 0);
      if (overlap.length){
        w.push({ level: 'normal', text: TF('econ.warn.mixOverlap', { names: overlap.map(p => p.name).join(', ') }, 'Микс салатов уже включает: {names} — уберите дубли из списка.') });
      }
    }
    st().econ.cultures.forEach(row => {
      const pct = parseFloat(row.pct) || 0;
      if (pct <= 0) return;
      const name = econCvDisplayName(row.cvId);
      if (!row.cvId) w.push({ level: 'normal', text: TF('econ.warn.noCvId', { name: name }, 'Строка «{name}»: выберите сорт в списке — иначе в расчёт не попадёт.') });
    });
    parts.forEach(p => {
      if (!p.bio || p.bio.density <= 0) w.push({ level: 'normal', text: TF('econ.warn.noDensity', { name: p.name }, '«{name}»: укажите плотность стояния (шт/м²).') });
      if (p.bio && p.bio.yieldPerCut <= 0) w.push({ level: 'normal', text: TF('econ.warn.noYield', { name: p.name }, '«{name}»: укажите урожай за срезку.') });
    });
    if (farm.totalPct > 100){
      w.push({
        level: 'strong',
        text: TF('econ.warn.pctOver', { pct: deps.r1(farm.totalPct) }, 'Сумма долей {pct}% — в расчёте доли уменьшены пропорционально до 100%.')
      });
    } else if (farm.totalPct > 0 && farm.totalPct < 100){
      w.push({
        level: 'strong',
        text: TF('econ.warn.pctUnder', { pct: deps.r1(farm.totalPct) }, 'Занято {pct}% посевной площади: полная аренда и ФОТ делятся на меньший выпуск → себестоимость выше, чем при 100% загрузке.')
      });
    }
    return w;
  }

  function calcFarmEconomics(e){
    ensureEconCultures();
    const plantingArea = Math.max(0, parseFloat(e.plantingArea) || 0);
    const totalPct = econCulturesTotalPct();
    const scale = totalPct > 100 ? 100 / totalPct : 1;
    const wasteFactor = 1 - deps.clamp(parseFloat(e.wastePct) || 0, 0, 50) / 100;

    const parts = st().econ.cultures.map(row => {
      const norm = normalizeEconCultureRow(row);
      const pct = deps.clamp(parseFloat(norm.pct) || 0, 0, 100) * scale;
      const area = plantingArea * pct / 100;
      const salePrice = parseFloat(norm.salePrice) > 0 ? parseFloat(norm.salePrice) : (parseFloat(e.salePrice) || 0);
      const slice = calcCultureSliceFromRow(norm, e, area, salePrice);
      return {
        cvId: norm.cvId || '',
        name: econCvDisplayName(norm.cvId),
        pct: pct,
        row: norm,
        bio: slice.bio,
        salePrice: salePrice,
        slice: slice
      };
    }).filter(p => p.pct > 0);

    const staffGross = Math.max(0, e.staffCount) * Math.max(0, e.staffSalary);
    const payrollTax = e.payrollTax ? staffGross * 0.425 : 0;
    const staffTotal = staffGross + payrollTax;
    const equipTotal = deps.sumEconEquipment();
    const amortMonths = Math.max(1, parseFloat(e.amortMonths) || 60);
    const equipAmort = equipTotal / amortMonths;
    const rent = parseFloat(e.rentMonth) || 0;
    const logistics = parseFloat(e.logisticsMonth) || 0;
    const other = parseFloat(e.otherMonth) || 0;
    const otherElec = calcOtherElecMonthly(e);
    const otherElecCost = otherElec.cost;
    const fixedOpex = rent + staffTotal + logistics + other + otherElecCost + equipAmort;

    let lightCost = 0;
    let consumablesCost = 0;
    let outKg = 0;
    let outPcs = 0;
    let revKg = 0;
    let revPcs = 0;
    let areaKg = 0;
    let areaPcs = 0;
    parts.forEach(p => {
      lightCost += p.slice.lightCost;
      consumablesCost += p.slice.consumablesCost;
      if (p.slice.outputUnit === 'шт'){
        outPcs += p.slice.monthlyOutput;
        revPcs += p.slice.revenue;
        areaPcs += p.slice.area;
      } else {
        outKg += p.slice.monthlyOutput;
        revKg += p.slice.revenue;
        areaKg += p.slice.area;
      }
    });

    const areaUsed = parts.reduce((s, p) => s + p.slice.area, 0);
    const sellKg = outKg * wasteFactor;
    const sellPcs = outPcs * wasteFactor;
    revKg *= wasteFactor;
    revPcs *= wasteFactor;
    const revenue = revKg + revPcs;
    const monthlyOpex = fixedOpex + lightCost + consumablesCost;
    const usnTaxAmt = e.usnTax ? revenue * 0.06 : 0;
    const margin = revenue - monthlyOpex - usnTaxAmt;

    const fixedKg = areaUsed > 0 ? fixedOpex * (areaKg / areaUsed) : (outKg > 0 ? fixedOpex : 0);
    const fixedPcs = fixedOpex - fixedKg;
    const lightKg = parts.filter(p => p.slice.outputUnit !== 'шт').reduce((s, p) => s + p.slice.lightCost, 0);
    const lightPcs = lightCost - lightKg;
    const consKg = parts.filter(p => p.slice.outputUnit !== 'шт').reduce((s, p) => s + p.slice.consumablesCost, 0);
    const consPcs = consumablesCost - consKg;

    const lightKwhMonth = parts.reduce((s, p) => s + (p.slice.lightKwhMonth || 0), 0);
    const totalElecKwhMonth = lightKwhMonth + otherElec.kwh;
    const totalElecCost = lightCost + otherElecCost;

    const unitCostKg = sellKg > 0 ? (fixedKg + lightKg + consKg) / sellKg : 0;
    const unitCostPcs = sellPcs > 0 ? (fixedPcs + lightPcs + consPcs) / sellPcs : 0;
    const marginKg = revKg - (fixedKg + lightKg + consKg) - (e.usnTax && revenue > 0 ? usnTaxAmt * (revKg / revenue) : 0);
    const marginPcs = revPcs - (fixedPcs + lightPcs + consPcs) - (e.usnTax && revenue > 0 ? usnTaxAmt * (revPcs / revenue) : 0);

    parts.forEach(p => {
      const isPcs = p.slice.outputUnit === 'шт';
      const shareFixed = areaUsed > 0 ? fixedOpex * (p.slice.area / areaUsed) : 0;
      const sell = (isPcs ? p.slice.monthlyOutput : p.slice.monthlyOutput) * wasteFactor;
      p.slice.allocatedFixed = shareFixed;
      p.slice.monthlyOpex = shareFixed + p.slice.lightCost + p.slice.consumablesCost;
      p.slice.unitCostFull = sell > 0 ? p.slice.monthlyOpex / sell : 0;
      const revNet = p.slice.revenue * wasteFactor;
      const usnPart = e.usnTax ? revNet * 0.06 : 0;
      p.slice.margin = revNet - p.slice.monthlyOpex - usnPart;
    });

    const farm = {
      parts: parts,
      totalPct: totalPct,
      areaUsed: areaUsed,
      plantingArea: plantingArea,
      wastePct: parseFloat(e.wastePct) || 0,
      sellKg: sellKg,
      sellPcs: sellPcs,
      outKg: outKg,
      outPcs: outPcs,
      revKg: revKg,
      revPcs: revPcs,
      unitCostKg: unitCostKg,
      unitCostPcs: unitCostPcs,
      marginKg: marginKg,
      marginPcs: marginPcs,
      monthlyOutput: sellKg + sellPcs,
      outputUnit: (sellKg > 0 && sellPcs > 0) ? T('econ.unit.mixed', 'смеш.') : (sellPcs > 0 ? T('econ.unit.pcs', 'шт') : T('econ.unit.kg', 'кг')),
      unitCost: sellKg > 0 ? unitCostKg : unitCostPcs,
      revenue: revenue,
      margin: margin,
      marginPct: revenue > 0 ? (margin / revenue) * 100 : 0,
      monthlyOpex: monthlyOpex,
      usnTaxAmt: usnTaxAmt,
      rent: rent,
      staffTotal: staffTotal,
      payrollTax: payrollTax,
      logistics: logistics,
      lightCost: lightCost,
      lightKwhMonth: lightKwhMonth,
      otherElec: otherElec,
      otherElecKwhMonth: otherElec.kwh,
      otherElecCost: otherElecCost,
      totalElecKwhMonth: totalElecKwhMonth,
      totalElecCost: totalElecCost,
      consumablesCost: consumablesCost,
      other: other,
      equipAmort: equipAmort,
      equipTotal: equipTotal,
      fixedOpex: fixedOpex
    };
    farm.warnings = collectEconWarnings(farm, e, parts);
    return farm;
  }

  function calcEconomics(snap, e){
    return calcFarmEconomics(e);
  }


    return {
      defaultEconEquipment: defaultEconEquipment,
      defaultEconCultureRow: defaultEconCultureRow,
      defaultEconCultures: defaultEconCultures,
      defaultEconState: defaultEconState,
      econCvDisplayName: econCvDisplayName,
      econGhYieldPerCutFromStd: econGhYieldPerCutFromStd,
      econCvTotalCycleDays: econCvTotalCycleDays,
      econSheetCutIntervalDays: econSheetCutIntervalDays,
      econSheetYieldPerCut: econSheetYieldPerCut,
      econYieldParamsForCvId: econYieldParamsForCvId,
      econCatalogDefaultsForCvId: econCatalogDefaultsForCvId,
      normalizeEconCultureRow: normalizeEconCultureRow,
      parsePotHarvestMonthsFromCv: parsePotHarvestMonthsFromCv,
      migrateEconCultureRows: migrateEconCultureRows,
      econCultureBio: econCultureBio,
      formatEconCultureHint: formatEconCultureHint,
      calcCultureConsumables: calcCultureConsumables,
      econApplyCultureSelect: econApplyCultureSelect,
      importEconRowFromPlanting: importEconRowFromPlanting,
      importAllEconFromPlanting: importAllEconFromPlanting,
      calcOtherElecMonthly: calcOtherElecMonthly,
      migrateEconOtherElectricity: migrateEconOtherElectricity,
      ensureEconCultures: ensureEconCultures,
      econCulturesTotalPct: econCulturesTotalPct,
      calcCultureSliceFromRow: calcCultureSliceFromRow,
      dedupeEconCultures: dedupeEconCultures,
      canAddEconCulture: canAddEconCulture,
      findDuplicateCultureIds: findDuplicateCultureIds,
      collectEconWarnings: collectEconWarnings,
      calcFarmEconomics: calcFarmEconomics,
      calcEconomics: calcEconomics,
      getEquipmentGroups: getEquipmentGroups
    };
  }

  global.DG_createEconCore = createEconCore;
})(typeof window !== 'undefined' ? window : this);
