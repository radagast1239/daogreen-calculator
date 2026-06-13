/** Расчёт экономики — DG_createEconCore */
(function(global){
  'use strict';

  const ECON_DEFAULT_CONSUMABLES_PER_POT = 4;
  const ECON_DEFAULT_CONSUMABLES_PER_TRAY = 10;
  const ECON_DEFAULT_LOT_DENSITY = 45;
  const ECON_DEFAULT_KWH_M2H = 0.12;
  const ECON_CONSUMABLES_PER_POT_HINT = '3–6';
  const ECON_CV_OVERRIDES = {
    'pl-microgreens': { density: 45, consumablesPerPot: 10 },
    'pl-salad': { density: 45, consumablesPerPot: 10 },
    'pl-baby-living': { density: 45, consumablesPerPot: 10 },
    'pl-wheatgrass': { consumablesPerPot: 10 },
    'pl-spinach-baby': { density: 220, yieldPerCut: 3, cutIntervalDays: 7, consumablesPerPot: 4 },
    'pl-edible-flowers': { yieldPerCut: 30, cutIntervalDays: 7, consumablesPerPot: 4, potHarvestMonths: 5 }
  };
  /** Доп. культуры только для экономики (без посадочного каталога). */
  const ECON_EXTRA_CULTURE_DEFAULTS = {
    'econ-berry-blueberry': {
      density: 8,
      yieldPerPlantMonth: 0.45,
      yieldPerCut: 150,
      cutsPerMonthManual: 3,
      cutIntervalDays: 10,
      unitIsPieces: false,
      consumablesPerPot: 6,
      potHarvestMonths: 8
    },
    'econ-berry-raspberry': {
      density: 10,
      yieldPerPlantMonth: 0.55,
      yieldPerCut: 180,
      cutsPerMonthManual: 3,
      cutIntervalDays: 10,
      unitIsPieces: false,
      consumablesPerPot: 6,
      potHarvestMonths: 6
    },
    'econ-berry-strawberry': {
      density: 16,
      yieldPerPlantMonth: 0.35,
      yieldPerCut: 120,
      cutsPerMonthManual: 3,
      cutIntervalDays: 10,
      unitIsPieces: false,
      consumablesPerPot: 6,
      potHarvestMonths: 5
    },
    'econ-veg-cucumber': {
      density: 2.5,
      yieldPerPlantMonth: 4.2,
      yieldPerCut: 1400,
      cutsPerMonthManual: 3,
      cutIntervalDays: 10,
      unitIsPieces: false,
      consumablesPerPot: 5,
      potHarvestMonths: 5
    },
    'econ-veg-tomato': {
      density: 2.8,
      yieldPerPlantMonth: 3.8,
      yieldPerCut: 1270,
      cutsPerMonthManual: 3,
      cutIntervalDays: 10,
      unitIsPieces: false,
      consumablesPerPot: 5,
      potHarvestMonths: 6
    },
    'econ-veg-pepper': {
      density: 3.2,
      yieldPerPlantMonth: 2.8,
      yieldPerCut: 930,
      cutsPerMonthManual: 3,
      cutIntervalDays: 10,
      unitIsPieces: false,
      consumablesPerPot: 5,
      potHarvestMonths: 6
    },
    // Legacy ids: keep support for already saved projects.
    'econ-berry': {
      density: 18,
      yieldPerCut: 220,
      cutIntervalDays: 28,
      unitIsPieces: false,
      consumablesPerPot: 6,
      potHarvestMonths: 4
    },
    'econ-vegetables': {
      density: 22,
      yieldPerCut: 260,
      cutIntervalDays: 30,
      unitIsPieces: false,
      consumablesPerPot: 6,
      potHarvestMonths: 3
    }
  };
  /** Группы выпуска в кг для итоговых строк */
  const ECON_KG_OUTPUT_GROUPS = {
    berries: ['econ-berry-blueberry', 'econ-berry-raspberry', 'econ-berry-strawberry', 'econ-berry'],
    vegetables: ['econ-veg-cucumber', 'econ-veg-tomato', 'econ-veg-pepper', 'econ-vegetables']
  };
  function econOutputKgGroup(cvId){
    if (!cvId) return 'otherKg';
    if (ECON_KG_OUTPUT_GROUPS.berries.indexOf(cvId) >= 0) return 'berries';
    if (ECON_KG_OUTPUT_GROUPS.vegetables.indexOf(cvId) >= 0) return 'vegetables';
    return 'otherKg';
  }
  /** Группы выпуска в шт для итоговых строк */
  const ECON_PCS_OUTPUT_GROUPS = {
    microBaby: ['pl-microgreens', 'pl-baby-living'],
    flowers: ['pl-edible-flowers'],
    wheatgrass: ['pl-wheatgrass']
  };
  function econOutputPcsGroup(cvId){
    if (!cvId) return 'otherPcs';
    if (ECON_PCS_OUTPUT_GROUPS.microBaby.indexOf(cvId) >= 0) return 'microBaby';
    if (ECON_PCS_OUTPUT_GROUPS.flowers.indexOf(cvId) >= 0) return 'flowers';
    if (ECON_PCS_OUTPUT_GROUPS.wheatgrass.indexOf(cvId) >= 0) return 'wheatgrass';
    return 'otherPcs';
  }
  const ECON_SALAD_MIX_ID = '__salad_mix__'; // legacy id (kept for compatibility)
  const ECON_SALAD_MIX_CV_IDS = [
    'vf-kale-baby', 'vf-mizuna-baby', 'vf-mustard-baby', 'vf-chard-baby',
    'vf-romano-baby', 'vf-corn',
    'vf-pakchoi-baby', 'vf-tatsoi-baby', 'vf-komatsuna-baby'
  ];
  var ECON_MONTH_DAYS = (global.DG_CUT && global.DG_CUT.HARVEST_MONTH_DAYS) || 30.5;
  const ECON_MAX_CULTURES = 12;
  const ECON_ELEC_CAT_IDS = ['pumps', 'fans', 'heating', 'equipment', 'refrigeration', 'packaging', 'misc'];

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
      ['auxEquip', 'econ.eq.auxEquip'],
      ['extraProd', 'econ.eq.extraProd']
    ]},
    { titleKey: 'econ.eq.grp.runway', items: [
      ['prepRent', 'econ.eq.prepRent', { monthly: true, runway: true, defaultMonths: 3 }],
      ['runwayElec', 'econ.eq.runwayElec', { monthly: true, runway: true, defaultMonths: 3 }],
      ['consumables', 'econ.eq.consumables', { monthly: true, runway: true, defaultMonths: 3 }]
    ]},
    { titleKey: 'econ.eq.grp.prep', items: [
      ['prepClimate', 'econ.eq.prepClimate'],
      ['prepElectric', 'econ.eq.prepElectric'],
      ['prepWater', 'econ.eq.prepWater'],
      ['prepRepair', 'econ.eq.prepRepair'],
      ['prepOther', 'econ.eq.prepOther']
    ]}
  ];


  const RUNWAY_ELEC_RAMP_DEFAULTS_PCT = [25, 30, 30];

  function normalizeRunwayElecRampPct(raw, months){
    const defaults = RUNWAY_ELEC_RAMP_DEFAULTS_PCT;
    const mo = Math.max(1, parseFloat(months) || 3);
    let arr = Array.isArray(raw) ? raw.slice() : defaults.slice();
    if (!arr.length) arr = defaults.slice();
    arr = arr.map(function(v, i){
      const n = parseFloat(v);
      if (!Number.isFinite(n) || n < 0) return defaults[i] != null ? defaults[i] : defaults[defaults.length - 1];
      return Math.min(100, n);
    });
    while (arr.length < mo){
      arr.push(arr[arr.length - 1] != null ? arr[arr.length - 1] : defaults[defaults.length - 1]);
    }
    if (arr.length > mo) arr = arr.slice(0, mo);
    return arr;
  }

  function runwayElecRampFractionsFromPct(pctArr, months){
    return normalizeRunwayElecRampPct(pctArr, months).map(function(p){ return p / 100; });
  }

  function runwayElecCumulativeLoad(monthIndex, rampFractions){
    const ramps = rampFractions && rampFractions.length ? rampFractions : runwayElecRampFractionsFromPct(null);
    let load = 0;
    for (let i = 0; i <= monthIndex; i++){
      load += ramps[i] != null ? ramps[i] : ramps[ramps.length - 1];
    }
    return Math.min(load, 1);
  }

  function runwayElecEffectiveAmount(monthlyFull, startupRunwayMonths, rampFractions){
    const mo = Math.max(1, parseFloat(startupRunwayMonths) || 3);
    const ramps = rampFractions || runwayElecRampFractionsFromPct(null, mo);
    const base = parseFloat(monthlyFull) || 0;
    let total = 0;
    for (let m = 0; m < mo; m++) total += base * runwayElecCumulativeLoad(m, ramps);
    return total;
  }

  function runwayElecRampLoads(startupRunwayMonths, rampFractions){
    const mo = Math.max(1, parseFloat(startupRunwayMonths) || 3);
    const ramps = rampFractions || runwayElecRampFractionsFromPct(null, mo);
    const loads = [];
    for (let m = 0; m < mo; m++) loads.push(runwayElecCumulativeLoad(m, ramps));
    return loads;
  }

  global.DG_ECON = {
    RUNWAY_ELEC_RAMP_DEFAULTS_PCT: RUNWAY_ELEC_RAMP_DEFAULTS_PCT,
    normalizeRunwayElecRampPct: normalizeRunwayElecRampPct,
    runwayElecRampFractionsFromPct: runwayElecRampFractionsFromPct,
    runwayElecCumulativeLoad: runwayElecCumulativeLoad,
    runwayElecEffectiveAmount: runwayElecEffectiveAmount,
    runwayElecRampLoads: runwayElecRampLoads,
    ECON_DEFAULT_CONSUMABLES_PER_POT: ECON_DEFAULT_CONSUMABLES_PER_POT,
    ECON_DEFAULT_CONSUMABLES_PER_TRAY: ECON_DEFAULT_CONSUMABLES_PER_TRAY,
    ECON_DEFAULT_LOT_DENSITY: ECON_DEFAULT_LOT_DENSITY,
    ECON_DEFAULT_KWH_M2H: ECON_DEFAULT_KWH_M2H,
    ECON_CONSUMABLES_PER_POT_HINT: ECON_CONSUMABLES_PER_POT_HINT,
    ECON_SALAD_MIX_ID: ECON_SALAD_MIX_ID,
    ECON_SALAD_MIX_CV_IDS: ECON_SALAD_MIX_CV_IDS,
    ECON_MONTH_DAYS: ECON_MONTH_DAYS,
    ECON_MAX_CULTURES: ECON_MAX_CULTURES,
    ECON_ELEC_CAT_IDS: ECON_ELEC_CAT_IDS,
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

    function getEquipItemMeta(key){
      for (let gi = 0; gi < ECON_EQUIPMENT_GROUPS_RAW.length; gi++){
        const g = ECON_EQUIPMENT_GROUPS_RAW[gi];
        for (let ii = 0; ii < g.items.length; ii++){
          const it = g.items[ii];
          if (it[0] === key) return it[2] || null;
        }
      }
      return null;
    }

    function getEquipmentGroups(){
      return ECON_EQUIPMENT_GROUPS_RAW.map(function(g){
        return {
          title: T(g.titleKey, g.titleKey),
          items: g.items.map(function(it){
            return [it[0], T(it[1], it[1]), it[2] || null];
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

  function defaultEconEquipmentMonths(){
    const o = {};
    ECON_EQUIPMENT_GROUPS_RAW.forEach(function(g){
      g.items.forEach(function(it){
        const opts = it[2];
        if (opts && opts.monthly){
          o[it[0]] = opts.defaultMonths != null ? opts.defaultMonths : 1;
        }
      });
    });
    return o;
  }

  function getRunwayElecRampFractions(e){
    e = e || (st().econ || {});
    return runwayElecRampFractionsFromPct(e.startupRunwayElecRamp, e.startupRunwayMonths);
  }

  function migrateEconRunwayElecRamp(e){
    if (!e) return;
    e.startupRunwayElecRamp = normalizeRunwayElecRampPct(e.startupRunwayElecRamp, e.startupRunwayMonths);
  }

  function econEquipEffectiveAmount(key, equipment, equipmentMonths, startupRunwayMonths){
    const amt = parseFloat(equipment && equipment[key]) || 0;
    const meta = getEquipItemMeta(key);
    if (!meta || !meta.monthly) return amt;
    if (meta.runway && key === 'runwayElec'){
      return runwayElecEffectiveAmount(amt, startupRunwayMonths, getRunwayElecRampFractions());
    }
    let mo;
    if (meta.runway){
      mo = Math.max(1, parseFloat(startupRunwayMonths) || meta.defaultMonths || 3);
    } else {
      mo = Math.max(1, parseFloat(equipmentMonths && equipmentMonths[key]) || meta.defaultMonths || 1);
    }
    return amt * mo;
  }

  function newEconRowId(prefix){
    return (prefix || 'row') + '_' + Math.random().toString(36).slice(2, 10);
  }

  function defaultElecCats(){
    return {
      pumps: { kw: 1, h: 4 },
      fans: { kw: 1.2, h: 24 },
      heating: { kw: 0, h: 12 },
      equipment: { kw: 5, h: 16 },
      refrigeration: { kw: 0, h: 24 },
      packaging: { kw: 0, h: 24 },
      misc: { kw: 0, h: 24 }
    };
  }

  function defaultStaffLines(){
    return [
      { id: newEconRowId('staff'), label: T('econ.staff.default1', 'Оператор'), salary: 55000 },
      { id: newEconRowId('staff'), label: T('econ.staff.default2', 'Агроном'), salary: 55000 }
    ];
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
      kwhPerM2Hour: ECON_DEFAULT_KWH_M2H,
      lightHoursDay: 16,
      consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT,
      potHarvestMonths: 3,
      yieldPerPlantMonth: 0,
      yieldPerSqmMonthManual: 0,
      cutsPerMonthManual: 0,
      unitIsPieces: false,
      consPotBreakdown: false,
      consPotSeeds: 0,
      consPotVermiculite: 0,
      consPotPot: 0,
      consPotRockwool: 0
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
      payrollTax: true,
      payrollTaxPct: 30,
      payrollStaffCostPct: 0,
      staffLines: defaultStaffLines(),
      payrollCustom: [],
      accountingMonth: 15000,
      logisticsMonth: 0,
      waterM3Month: 0,
      waterPriceM3: 0,
      waterFertPerM3: 0,
      floorArea: 200,
      plantingArea: 150,
      areaMode: 'pct',
      cultures: defaultEconCultures(),
      salePrice: 0,
      kwhPerM2Hour: ECON_DEFAULT_KWH_M2H,
      lightHoursDay: 16,
      elecCats: defaultElecCats(),
      otherMonth: 15000,
      consumablesPerKg: 0,
      consumablesPerPcs: 0,
      wastePct: 0,
      wasteEnabled: true,
      waterEnabled: true,
      usnTax: false,
      vatTax: false,
      vatInclusive: false,
      vatPct: 12,
      profitTax: false,
      profitTaxPct: 15,
      amortMonths: 60,
      equipmentEnabled: true,
      equipment: defaultEconEquipment(),
      equipmentMonths: defaultEconEquipmentMonths(),
      startupRunwayMonths: 3,
      startupRunwayElecRamp: RUNWAY_ELEC_RAMP_DEFAULTS_PCT.slice(),
      equipmentCustom: []
    };
  }

  function econCvDisplayName(cvId){
    if (!cvId) return T('econ.cv.noSort', 'Культура (без сорта)');
    if (cvId === 'econ-berry-blueberry') return T('econ.opt.berryBlueberry', 'Голубика');
    if (cvId === 'econ-berry-raspberry') return T('econ.opt.berryRaspberry', 'Малина');
    if (cvId === 'econ-berry-strawberry') return T('econ.opt.berryStrawberry', 'Земляника');
    if (cvId === 'econ-veg-cucumber') return T('econ.opt.vegCucumber', 'Огурцы');
    if (cvId === 'econ-veg-tomato') return T('econ.opt.vegTomato', 'Томаты');
    if (cvId === 'econ-veg-pepper') return T('econ.opt.vegPepper', 'Перцы');
    if (cvId === 'econ-berry') return T('econ.opt.berry', 'Ягоды');
    if (cvId === 'econ-vegetables') return T('econ.opt.vegetables', 'Овощи');
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
    if (snap && snap.harvestCutIntervalDays > 0){
      return Math.max(1, Math.round(snap.harvestCutIntervalDays));
    }
    if (snap && snap.mainHallIntervalDays > 0){
      return Math.max(1, Math.round(snap.mainHallIntervalDays));
    }
    if (cv && cv.multicut && deps.supportsMulticut(cv) && cv.cutInterval > 0){
      return Math.max(1, Math.round(cv.cutInterval));
    }
    return Math.max(1, econCvTotalCycleDays(cv, snap));
  }

  function snapDensity(snap, fallback){
    var d = snap && snap.rhoA;
    return Math.round((d > 0 ? d : fallback) || 80);
  }

  /** Плотность посадных единиц для экономики: для лотков — лотки/м², не ячейки кассеты. */
  function econLotStandDensity(cv){
    if (!cv || !cv.econLotSale) return Math.round((cv && cv.density) || 0);
    if (cv.id === 'pl-microgreens' || cv.id === 'pl-baby-living' || cv.id === 'pl-salad') return ECON_DEFAULT_LOT_DENSITY;
    const cellD = Math.round(cv.density || 0);
    const cells = cv.palletCells || 0;
    if (cells > 1 && cellD > cells * 3) return Math.max(1, Math.round(cellD / cells));
    return cellD;
  }

  function econConsumablesDefaultForCv(cv){
    if (!cv) return ECON_DEFAULT_CONSUMABLES_PER_POT;
    if (cv.econLotSale) return econLotSaleAsPot(cv) ? ECON_DEFAULT_CONSUMABLES_PER_POT : ECON_DEFAULT_CONSUMABLES_PER_TRAY;
    return ECON_DEFAULT_CONSUMABLES_PER_POT;
  }

  function applyEconCvOverrides(cvId, row){
    const o = ECON_CV_OVERRIDES[cvId];
    if (o) Object.assign(row, o);
    return row;
  }

  /** Плотность для экономики поддона: шт/м² из справочника, не геометрия layout snap. */
  function econPalletDensity(cv, snap){
    if (cv && cv.palletSheet){
      if (cv.econLotSale) return econLotStandDensity(cv);
      if (cv.density > 0) return Math.round(cv.density);
    }
    return snapDensity(snap, (cv && cv.density) || 80);
  }

  function econLotSaleAsPot(cv){
    return !!(cv && cv.econLotSale && cv.econLotSalePot);
  }

  const CONS_POT_PART_KEYS = ['consPotSeeds', 'consPotVermiculite', 'consPotPot', 'consPotRockwool'];

  function sumConsPotParts(row){
    if (!row) return 0;
    return CONS_POT_PART_KEYS.reduce(function(s, k){
      return s + Math.max(0, parseFloat(row[k]) || 0);
    }, 0);
  }

  function hasConsPotParts(row){
    return CONS_POT_PART_KEYS.some(function(k){ return (parseFloat(row[k]) || 0) > 0; });
  }

  function econSaladPotConsumablesMode(cv){
    return econLotSaleAsPot(cv);
  }

  function syncConsPotPartsTotal(row){
    if (!row) return row;
    const sum = sumConsPotParts(row);
    if (sum > 0) row.consumablesPerPot = Math.round(sum * 100) / 100;
    return row;
  }

  /** Полный цикл для продажи лотком/горшком: 1 шт = 1 лоток или 1 горшок, выход = (мес / цикл) × шт/м² */
  function econPalletLotCycleDays(cv){
    if (!cv) return 15;
    var total = (cv.germination || 0) + (cv.channelDays || 0);
    if (total > 0) return Math.max(1, total);
    if (cv.cutInterval > 0) return Math.max(1, cv.cutInterval);
    return 15;
  }

  function econPalletCatalogYield(cv, snap){
    if (cv && cv.econLotSale){
      return {
        yieldPerCut: 1,
        cutIntervalDays: econPalletLotCycleDays(cv),
        unitIsPieces: true
      };
    }
    if (cv && cv.countUnit === 'шт'){
      return {
        yieldPerCut: Math.max(0, cv.yieldPerCutG || 0),
        cutIntervalDays: Math.max(1, cv.cutInterval || econSheetCutIntervalDays(cv, snap)),
        unitIsPieces: true
      };
    }
    var yp = econYieldParamsForCvId(cv.id, snap);
    return {
      yieldPerCut: yp.yieldPerCut,
      cutIntervalDays: yp.cutIntervalDays,
      unitIsPieces: !!(snap && snap.unitIsPieces)
    };
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
    if (!cv){
      return { yieldPerCut: 0, cutIntervalDays: 15 };
    }
    if (snap && snap.multicutHarvest){
      return {
        yieldPerCut: econSheetYieldPerCut(cv, snap),
        cutIntervalDays: econSheetCutIntervalDays(cv, snap)
      };
    }
    if (snap && (snap.mainHallIntervalDays > 0 || snap.usefulAreaBasis === 'main_hall')){
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
    }
    return {
      yieldPerCut: econSheetYieldPerCut(cv, snap),
      cutIntervalDays: econSheetCutIntervalDays(cv, snap)
    };
  }

  function econCatalogDefaultsForCvId(cvId){
    const e = st().econ;
    const light = {
      kwhPerM2Hour: parseFloat(e && e.kwhPerM2Hour) || ECON_DEFAULT_KWH_M2H,
      lightHoursDay: parseFloat(e && e.lightHoursDay) || 16
    };
    if (!cvId) return light;
    if (ECON_EXTRA_CULTURE_DEFAULTS[cvId]){
      return applyEconCvOverrides(cvId, Object.assign({}, light, ECON_EXTRA_CULTURE_DEFAULTS[cvId]));
    }
    if (deps.isPalletCvId(cvId) && deps.allPalletCultivars().length){
      const cv = deps.allPalletCultivars().find(c => c.id === cvId);
      if (!cv) return light;
      const snap = deps.getPlantingSnapshotForCvId(cvId);
      const py = econPalletCatalogYield(cv, snap);
      return applyEconCvOverrides(cvId, Object.assign({
        density: econPalletDensity(cv, snap),
        yieldPerCut: py.yieldPerCut,
        cutIntervalDays: py.cutIntervalDays,
        unitIsPieces: py.unitIsPieces,
        potHarvestMonths: parsePotHarvestMonthsFromCv(cv, snap),
        consumablesPerPot: econConsumablesDefaultForCv(cv)
      }, light));
    }
    if (deps.isVfCvId(cvId) && deps.allVfCultivars().length){
      const cv = deps.allVfCultivars().find(c => c.id === cvId);
      if (!cv) return light;
      const snap = deps.getPlantingSnapshotForCvId(cvId);
      const yp = econYieldParamsForCvId(cvId, snap);
      const std = deps.buildDefaultVfStandards(cv);
      return applyEconCvOverrides(cvId, Object.assign({
        density: snapDensity(snap, std.density),
        yieldPerCut: yp.yieldPerCut,
        cutIntervalDays: yp.cutIntervalDays,
        unitIsPieces: cv.countUnit === 'шт',
        potHarvestMonths: parsePotHarvestMonthsFromCv(cv, snap),
        consumablesPerPot: econConsumablesDefaultForCv(cv)
      }, light));
    }
    const cv = deps.allGhCultivars().find(c => c.id === cvId);
    if (!cv || deps.isVfCvId(cvId)) return light;
    const snap = deps.getPlantingSnapshotForCvId(cvId);
    const yp = econYieldParamsForCvId(cvId, snap);
    const std = deps.getGhCvStandards(cv);
    return applyEconCvOverrides(cvId, Object.assign({
      density: snapDensity(snap, std.density),
      yieldPerCut: yp.yieldPerCut,
      cutIntervalDays: yp.cutIntervalDays,
      unitIsPieces: !!(snap && snap.unitIsPieces),
      potHarvestMonths: parsePotHarvestMonthsFromCv(cv, snap),
      consumablesPerPot: econConsumablesDefaultForCv(cv)
    }, light));
  }

  function normalizeEconCultureRow(row){
    const base = defaultEconCultureRow('');
    const out = Object.assign(base, row || {});
    out.cvId = row && row.cvId != null ? row.cvId : '';
    out.pct = row && row.pct != null ? row.pct : base.pct;
    const pa = st().econ ? Math.max(0, parseFloat(st().econ.plantingArea) || 0) : 0;
    const sqmRaw = row && row.areaSqm != null ? parseFloat(row.areaSqm) : NaN;
    if (Number.isFinite(sqmRaw) && sqmRaw >= 0) out.areaSqm = sqmRaw;
    else out.areaSqm = pa > 0 ? pa * (parseFloat(out.pct) || 0) / 100 : 0;
    out.salePrice = row && row.salePrice != null ? row.salePrice : 0;
    out.unitIsPieces = !!(row && row.unitIsPieces);
    if (out.cvId){
      const cv = deps.findCvById(out.cvId);
      if (cv && (cv.econLotSale || cv.countUnit === 'шт')) out.unitIsPieces = true;
      else if (cv && cv.countUnit && cv.countUnit !== 'шт') out.unitIsPieces = false;
    }
    const consRaw = row && row.consumablesPerPot != null ? parseFloat(row.consumablesPerPot) : NaN;
    const cv = out.cvId ? deps.findCvById(out.cvId) : null;
    const consDefault = econConsumablesDefaultForCv(cv);
    out.consumablesPerPot = Number.isFinite(consRaw) && consRaw > 0 ? consRaw : consDefault;
    if (cv && cv.id === 'pl-edible-flowers' && out.consumablesPerPot < 1){
      out.consumablesPerPot = ECON_DEFAULT_CONSUMABLES_PER_POT;
    }
    out.yieldPerPlantMonth = Math.max(0, parseFloat(row && row.yieldPerPlantMonth) || 0);
    out.yieldPerSqmMonthManual = Math.max(0, parseFloat(row && row.yieldPerSqmMonthManual) || 0);
    out.cutsPerMonthManual = Math.max(0, parseFloat(row && row.cutsPerMonthManual) || 0);
    CONS_POT_PART_KEYS.forEach(function(k){
      const v = row && row[k] != null ? parseFloat(row[k]) : NaN;
      out[k] = Number.isFinite(v) && v >= 0 ? v : 0;
    });
    if (cv && econSaladPotConsumablesMode(cv)){
      if (out.consPotBreakdown == null) out.consPotBreakdown = true;
      if (hasConsPotParts(out)) syncConsPotPartsTotal(out);
    } else {
      out.consPotBreakdown = false;
    }
    out.potHarvestMonths = row && row.potHarvestMonths != null ? Math.max(0.25, parseFloat(row.potHarvestMonths) || 3) : 3;
    if (cv && cv.econLotSale){
      out.potHarvestMonths = parsePotHarvestMonthsFromCv(cv, deps.getPlantingSnapshotForCvId(out.cvId));
    }
    return out;
  }

  /** Срок списания горшка/кассеты (мес) для расходников на посев */
  function parsePotHarvestMonthsFromCv(cv, snap){
    if (!cv) return 3;
    const note = String(cv.replaceNote || cv.cutNote || '').toLowerCase();
    const cycleDays = econCvTotalCycleDays(cv, snap);
    if (cv.econLotSale){
      const cycleDays = econPalletLotCycleDays(cv);
      if (cycleDays > 0) return Math.max(0.25, cycleDays / ECON_MONTH_DAYS);
    }
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
    st().econ.cultures = st().econ.cultures.filter(function(row){
      return (row && row.cvId) !== ECON_SALAD_MIX_ID;
    });
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
    let yieldPerCut = Math.max(0, parseFloat(row.yieldPerCut) || 0);
    const cutIntervalDays = Math.max(1, parseFloat(row.cutIntervalDays) || 15);
    const unitIsPieces = !!row.unitIsPieces;
    const cutsManual = Math.max(0, parseFloat(row.cutsPerMonthManual) || 0);
    const cutsPerMonth = cutsManual > 0 ? cutsManual : (ECON_MONTH_DAYS / cutIntervalDays);
    const yieldPerPlantMonthInput = Math.max(0, parseFloat(row.yieldPerPlantMonth) || 0);
    const yieldPerSqmMonthManual = Math.max(0, parseFloat(row.yieldPerSqmMonthManual) || 0);
    let yieldPerPotMonth = yieldPerCut * cutsPerMonth;
    if (yieldPerPlantMonthInput > 0){
      // Для кг-культур ввод "с растения в мес" идёт в кг.
      yieldPerPotMonth = unitIsPieces ? yieldPerPlantMonthInput : (yieldPerPlantMonthInput * 1000);
      if (cutsPerMonth > 0) yieldPerCut = yieldPerPotMonth / cutsPerMonth;
    }
    let yieldPerSqmMonthKg = 0;
    let yieldPerSqmMonthPcs = 0;
    if (yieldPerSqmMonthManual > 0){
      if (unitIsPieces){
        yieldPerSqmMonthPcs = yieldPerSqmMonthManual;
      } else {
        yieldPerSqmMonthKg = yieldPerSqmMonthManual;
      }
      if (density > 0){
        if (unitIsPieces){
          yieldPerPotMonth = yieldPerSqmMonthPcs / density;
        } else {
          yieldPerPotMonth = (yieldPerSqmMonthKg * 1000) / density;
        }
        if (cutsPerMonth > 0) yieldPerCut = yieldPerPotMonth / cutsPerMonth;
      }
    } else {
      if (unitIsPieces){
        yieldPerSqmMonthPcs = yieldPerPotMonth * density;
      } else {
        yieldPerSqmMonthKg = (yieldPerPotMonth / 1000) * density;
      }
    }
    return {
      density: density,
      yieldPerCut: yieldPerCut,
      cutIntervalDays: cutIntervalDays,
      cutsPerMonth: cutsPerMonth,
      yieldPerPotMonth: yieldPerPotMonth,
      yieldPerPlantMonthInput: yieldPerPlantMonthInput,
      yieldPerSqmMonthManual: yieldPerSqmMonthManual,
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
    const cv = norm.cvId ? deps.findCvById(norm.cvId) : null;
    const isLot = !!(cv && cv.econLotSale);
    const lotPot = econLotSaleAsPot(cv);
    const dUnit = T('econ.unit.days', 'сут');
    const ySqm = bio.unitIsPieces
      ? deps.r1(bio.yieldPerSqmMonthPcs) + ' ' + T('econ.yield.pcsSqm', 'шт/м²·мес')
      : deps.r2(bio.yieldPerSqmMonthKg) + ' ' + T('econ.yield.kgSqm', 'кг/м²·мес');
    const intervalLbl = isLot
      ? TF('econ.hint.fullCycle', { days: deps.r1(bio.cutIntervalDays), dUnit: dUnit }, 'полный цикл {days} {dUnit}')
      : (bio.cutsPerMonth > 1.05
        ? TF('econ.hint.interval', { days: deps.r1(bio.cutIntervalDays), dUnit: dUnit }, 'интервал {days} {dUnit}')
        : TF('econ.hint.fullCycle', { days: deps.r1(bio.cutIntervalDays), dUnit: dUnit }, 'полный цикл {days} {dUnit}'));
    const fromLbl = isLot
      ? (lotPot ? T('econ.hint.fromPot', 'с 1 горшка') : T('econ.hint.fromTray', 'с 1 лотка'))
      : T('econ.hint.fromPot', 'с 1 горшка');
    let h = TF(isLot ? 'econ.hint.cutsMoLot' : 'econ.hint.cutsMo', {
      cuts: deps.r1(bio.cutsPerMonth),
      intervalLbl: intervalLbl,
      yieldPot: deps.r1(bio.yieldPerPotMonth),
      unit: bio.yieldUnit,
      ySqm: ySqm,
      fromLbl: fromLbl,
      kwh: deps.r3(bio.kwhPerM2Hour),
      lightH: deps.r1(bio.lightHoursDay)
    }, isLot
      ? 'Оборот в месяц: <strong>{cuts}</strong> ({intervalLbl}) · {fromLbl}: <strong>{yieldPot} {unit}</strong> · <strong>{ySqm}</strong> · свет {kwh} кВт·ч/м² × {lightH} ч'
      : 'Срезок в месяц: <strong>{cuts}</strong> ({intervalLbl}) · {fromLbl}: <strong>{yieldPot} {unit}</strong> · <strong>{ySqm}</strong> · свет {kwh} кВт·ч/м² × {lightH} ч');
    if (norm.consumablesPerPot > 0){
      const isExtraSeedling = !!norm.cvId && (
        norm.cvId.indexOf('econ-berry-') === 0 ||
        norm.cvId.indexOf('econ-veg-') === 0 ||
        norm.cvId === 'econ-berry' ||
        norm.cvId === 'econ-vegetables'
      );
      function fmtMoneyUnit(amount, unitKey, unitFallback){
        var unit = T(unitKey, unitFallback);
        if (deps.fmtMoney) return deps.fmtMoney(amount) + unit;
        var sym = deps.currencySym ? deps.currencySym() : '₽';
        return (deps.fmtNum ? deps.fmtNum(amount) : String(amount)) + sym + unit;
      }
      if (isLot){
        const consSqm = bio.yieldPerSqmMonthPcs * norm.consumablesPerPot;
        let perUnitStr = fmtMoneyUnit(norm.consumablesPerPot, lotPot ? 'econ.perPot' : 'econ.perTray', lotPot ? '/горшок' : '/лоток');
        if (lotPot && norm.consPotBreakdown && hasConsPotParts(norm)){
          perUnitStr += TF('econ.hint.consPotParts', {
            seeds: fmtMoneyUnit(norm.consPotSeeds, 'econ.perPot', '/горшок'),
            verm: fmtMoneyUnit(norm.consPotVermiculite, 'econ.perPot', '/горшок'),
            pot: fmtMoneyUnit(norm.consPotPot, 'econ.perPot', '/горшок'),
            wool: fmtMoneyUnit(norm.consPotRockwool, 'econ.perPot', '/горшок')
          }, ' ({seeds} + {verm} + {pot} + {wool})');
        }
        h += TF(lotPot ? 'econ.hint.consLotSalePot' : 'econ.hint.consLotSale', {
          perUnit: perUnitStr,
          consMo: fmtMoneyUnit(consSqm, 'econ.perSqmMonth', '/м²·мес')
        }, lotPot
          ? ' · <strong>{perUnit}</strong> на каждую проданную шт → <strong>{consMo}</strong>'
          : ' · <strong>{perUnit}</strong> на каждую проданную шт → <strong>{consMo}</strong>');
      } else {
        const consSqm = bio.density > 0 && bio.potHarvestMonths > 0
          ? (bio.density * norm.consumablesPerPot) / bio.potHarvestMonths : 0;
        const consOnce = bio.density * norm.consumablesPerPot;
        if (isExtraSeedling){
          h += TF('econ.hint.consSeedling', {
            perSeedling: fmtMoneyUnit(norm.consumablesPerPot, 'econ.perSeedling', '/саженец'),
            dens: deps.round(bio.density),
            pcsSqm: T('econ.unit.pcsSqm', 'шт/м²'),
            consOnce: fmtMoneyUnit(consOnce, 'econ.perSqm', '/м²'),
            months: deps.r1(bio.potHarvestMonths),
            consMo: fmtMoneyUnit(consSqm, 'econ.perSqmMonth', '/м²·мес')
          }, ' · саженец <strong>{perSeedling}</strong> × <strong>{dens} {pcsSqm}</strong> = <strong>{consOnce}</strong>, ÷ <strong>{months}</strong> → <strong>{consMo}</strong>');
        } else {
          h += TF('econ.hint.cons', {
            perPot: fmtMoneyUnit(norm.consumablesPerPot, 'econ.perPot', '/горшок'),
            dens: deps.round(bio.density),
            pcsSqm: T('econ.unit.pcsSqm', 'шт/м²'),
            consOnce: fmtMoneyUnit(consOnce, 'econ.perSqm', '/м²'),
            months: deps.r1(bio.potHarvestMonths),
            consMo: fmtMoneyUnit(consSqm, 'econ.perSqmMonth', '/м²·мес')
          }, ' · посев <strong>{perPot}</strong> × <strong>{dens} {pcsSqm}</strong> = <strong>{consOnce}</strong>, ÷ <strong>{months}</strong> → <strong>{consMo}</strong>');
        }
      }
    }
    return h;
  }

  /** Расходники: срез — горшок ÷ срок на стеллаже; продажа 1 шт = 1 лоток/горшок — ₽/шт × выпуск */
  function calcCultureConsumables(row, area, monthlyOutput, e){
    const bio = econCultureBio(row);
    const cv = row.cvId ? deps.findCvById(row.cvId) : null;
    const lotSale = !!(cv && cv.econLotSale);
    const potsPerSqm = bio.density;
    const perPot = bio.consumablesPerPot;
    const wasteFactor = e ? econWasteFactor(e) : 1;
    const sellableOutput = monthlyOutput * wasteFactor;
    const harvestMonths = bio.potHarvestMonths;
    const pots = potsPerSqm * Math.max(0, area);
    const potCostOnce = pots * perPot;
    let potCostMonth;
    let costPerSqm;
    if (lotSale && perPot > 0){
      potCostMonth = sellableOutput * perPot;
      costPerSqm = area > 0 ? potCostMonth / area : 0;
    } else {
      potCostMonth = harvestMonths > 0 ? potCostOnce / harvestMonths : 0;
      costPerSqm = harvestMonths > 0 && perPot > 0 ? (potsPerSqm * perPot) / harvestMonths : 0;
    }
    const costPerSqmOnce = potsPerSqm * perPot;
    let cost = potCostMonth;
    const perKgExtra = parseFloat(e && e.consumablesPerKg) || 0;
    const perPcsExtra = parseFloat(e && e.consumablesPerPcs) || 0;
    let packagingCost = 0;
    let extraPerSqm = 0;
    if (sellableOutput > 0 && area > 0){
      if (!bio.unitIsPieces && perKgExtra > 0){
        packagingCost = sellableOutput * perKgExtra;
      } else if (bio.unitIsPieces && perPcsExtra > 0){
        packagingCost = sellableOutput * perPcsExtra;
      }
    }
    if (packagingCost > 0){
      cost += packagingCost;
      extraPerSqm = packagingCost / area;
      costPerSqm += extraPerSqm;
    }
    const unitCost = sellableOutput > 0 ? cost / sellableOutput : 0;
    return {
      cost: cost,
      potCostMonth: potCostMonth,
      packagingCost: packagingCost,
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
    return normalizeEconCultureRow(out);
  }

  function importEconRowFromPlanting(row){
    const cvId = row.cvId || '';
    if (!cvId) return row;
    const cv = deps.findCvById(cvId);
    const snap = deps.getPlantingSnapshotForCvId(cvId);
    if (cv && cv.econLotSale){
      row.yieldPerCut = 1;
      row.cutIntervalDays = econPalletLotCycleDays(cv);
      row.unitIsPieces = true;
    } else {
      const yp = econYieldParamsForCvId(cvId, snap);
      row.yieldPerCut = yp.yieldPerCut;
      row.cutIntervalDays = yp.cutIntervalDays;
      if (snap && snap.unitIsPieces != null) row.unitIsPieces = !!snap.unitIsPieces;
      else if (cv && cv.countUnit === 'шт') row.unitIsPieces = true;
    }
    if (snap){
      row.density = (cv && deps.isPalletCvId(cvId)) ? econPalletDensity(cv, snap) : snapDensity(snap, row.density);
      row.kwhPerM2Hour = Math.round(snap.kwhPerM2Hour * 1000) / 1000;
      row.lightHoursDay = Math.round(snap.lightHoursDay * 10) / 10;
      if (cv && cv.econLotSale) row.unitIsPieces = true;
      else if (cv && cv.countUnit === 'шт') row.unitIsPieces = true;
      else row.unitIsPieces = !!snap.unitIsPieces;
      if (cv) row.potHarvestMonths = parsePotHarvestMonthsFromCv(cv, snap);
    }
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
    if (filled.length === 1) {
      filled[0].pct = 100;
      filled[0].areaSqm = Math.max(0, parseFloat(st().econ.plantingArea) || 0);
    }

    if (global.DG_recordPlantingImportMeta){
      global.DG_recordPlantingImportMeta(st(), liveSnap, { activeId: activeId });
    }

    deps.saveEconStore();
    return { activeId: activeId, snap: liveSnap, cvName: liveSnap && liveSnap.cvName ? liveSnap.cvName : '' };
  }

  function migrateEconElecCats(e){
    if (e == null) return;
    if (!e.elecCats || typeof e.elecCats !== 'object'){
      e.elecCats = defaultElecCats();
    }
    ECON_ELEC_CAT_IDS.forEach(function(id){
      if (!e.elecCats[id] || typeof e.elecCats[id] !== 'object') e.elecCats[id] = { kw: 0, h: 24 };
      if (e.elecCats[id].h == null || isNaN(parseFloat(e.elecCats[id].h))) e.elecCats[id].h = 24;
      if (e.elecCats[id].kw == null || isNaN(parseFloat(e.elecCats[id].kw))) e.elecCats[id].kw = 0;
    });
    const legacyKw = parseFloat(e.otherElecKw);
    if (!isNaN(legacyKw) && legacyKw > 0){
      const misc = e.elecCats.misc || {};
      if ((parseFloat(misc.kw) || 0) <= 0){
        const h = parseFloat(e.otherElecHoursDay) || parseFloat(misc.h) || 24;
        e.elecCats.misc = { kw: legacyKw, h: h };
      }
    } else {
      const legacyKwh = parseFloat(e.otherKwhMonth);
      if (!isNaN(legacyKwh) && legacyKwh > 0){
        const h = parseFloat(e.otherElecHoursDay) || 24;
        const kw = Math.round((legacyKwh / (h * ECON_MONTH_DAYS)) * 100) / 100;
        if ((parseFloat((e.elecCats.misc || {}).kw) || 0) <= 0){
          e.elecCats.misc = { kw: kw, h: h };
        }
      }
    }
  }

  function migrateEconPayroll(e){
    if (e == null) return;
    if (!Array.isArray(e.staffLines) || !e.staffLines.length){
      const n = Math.max(1, parseInt(e.staffCount, 10) || 2);
      const sal = parseFloat(e.staffSalary);
      const salary = !isNaN(sal) && sal > 0 ? sal : 55000;
      e.staffLines = [];
      for (let i = 0; i < n; i++){
        e.staffLines.push({
          id: newEconRowId('staff'),
          label: TF('econ.staff.n', { n: i + 1 }, 'Сотрудник {n}'),
          salary: salary
        });
      }
    }
    e.staffLines = e.staffLines.map(function(row){
      return {
        id: row.id || newEconRowId('staff'),
        label: row.label != null ? String(row.label) : '',
        salary: parseFloat(row.salary) || 0
      };
    });
    if (!Array.isArray(e.payrollCustom)) e.payrollCustom = [];
    e.payrollCustom = e.payrollCustom.map(function(row){
      var unit = row.periodUnit === 'day' || row.periodUnit === 'week' ? row.periodUnit : 'month';
      return {
        id: row.id || newEconRowId('pc'),
        label: row.label != null ? String(row.label) : '',
        amount: parseFloat(row.amount) || 0,
        period: Math.max(1, parseFloat(row.period) || 1),
        periodUnit: unit
      };
    });
    if (e.accountingMonth == null || isNaN(parseFloat(e.accountingMonth))) e.accountingMonth = 15000;
    if (e.vatPct == null || isNaN(parseFloat(e.vatPct))) e.vatPct = 12;
    if (e.profitTaxPct == null || isNaN(parseFloat(e.profitTaxPct))) e.profitTaxPct = 15;
    if (e.vatTax == null) e.vatTax = false;
    if (e.vatInclusive == null) e.vatInclusive = false;
    if (e.profitTax == null) e.profitTax = false;
    if (e.payrollTaxPct == null || isNaN(parseFloat(e.payrollTaxPct))){
      e.payrollTaxPct = e.payrollTax !== false ? 42.5 : 30;
    }
    if (e.payrollStaffCostPct == null || isNaN(parseFloat(e.payrollStaffCostPct))) e.payrollStaffCostPct = 0;
  }

  function calcVatTaxAmt(revenue, e){
    if (!e || !e.vatTax || !(revenue > 0)) return 0;
    const vatPct = deps.clamp(parseFloat(e.vatPct) || 12, 0, 30);
    if (e.vatInclusive) return revenue * vatPct / (100 + vatPct);
    return revenue * (vatPct / 100);
  }

  function scaleEconCostFields(c, factor){
    if (!(factor > 0) || factor === 1) return c;
    c.rentMonth = (parseFloat(c.rentMonth) || 0) * factor;
    c.priceKwh = (parseFloat(c.priceKwh) || 0) * factor;
    c.otherMonth = (parseFloat(c.otherMonth) || 0) * factor;
    c.logisticsMonth = (parseFloat(c.logisticsMonth) || 0) * factor;
    c.waterPriceM3 = (parseFloat(c.waterPriceM3) || 0) * factor;
    c.waterFertPerM3 = (parseFloat(c.waterFertPerM3) || 0) * factor;
    c.consumablesPerKg = (parseFloat(c.consumablesPerKg) || 0) * factor;
    c.consumablesPerPcs = (parseFloat(c.consumablesPerPcs) || 0) * factor;
    c.accountingMonth = (parseFloat(c.accountingMonth) || 0) * factor;
    c.staffLines = (c.staffLines || []).map(function(row){
      return Object.assign({}, row, { salary: (parseFloat(row.salary) || 0) * factor });
    });
    c.payrollCustom = (c.payrollCustom || []).map(function(row){
      return Object.assign({}, row, { amount: (parseFloat(row.amount) || 0) * factor });
    });
    c.cultures = (c.cultures || []).map(function(row){
      var r = Object.assign({}, row);
      var cp = parseFloat(r.consumablesPerPot);
      if (cp > 0) r.consumablesPerPot = cp * factor;
      CONS_POT_PART_KEYS.forEach(function(k){
        var v = parseFloat(r[k]);
        if (v > 0) r[k] = v * factor;
      });
      return r;
    });
    c._costScale = (parseFloat(c._costScale) || 1) * factor;
    return c;
  }

  function migrateEconOtherElectricity(e){
    migrateEconElecCats(e);
    migrateEconPayroll(e);
  }

  function econWaterInCalc(e){
    return !e || e.waterEnabled !== false;
  }

  function econWasteInCalc(e){
    return !e || e.wasteEnabled !== false;
  }

  function econWasteFactor(e){
    if (!econWasteInCalc(e)) return 1;
    return 1 - deps.clamp(parseFloat(e && e.wastePct) || 0, 0, 50) / 100;
  }

  function calcWaterMonthly(e){
    const m3 = Math.max(0, parseFloat(e && e.waterM3Month) || 0);
    const price = Math.max(0, parseFloat(e && e.waterPriceM3) || 0);
    const fert = Math.max(0, parseFloat(e && e.waterFertPerM3) || 0);
    return { m3: m3, price: price, fert: fert, cost: m3 * (price + fert) };
  }

  function calcOtherElecMonthly(e){
    migrateEconElecCats(e);
    const price = parseFloat(e.priceKwh) || 0;
    let kwh = 0;
    let cost = 0;
    let kwSum = 0;
    ECON_ELEC_CAT_IDS.forEach(function(id){
      const c = e.elecCats[id] || {};
      const kw = parseFloat(c.kw) || 0;
      const h = parseFloat(c.h) || 0;
      kwh += kw * h * ECON_MONTH_DAYS;
      cost += kw * h * ECON_MONTH_DAYS * price;
      kwSum += kw;
    });
    return { kw: kwSum, hoursDay: 24, kwh: kwh, cost: cost };
  }

  function calcFarmElecBreakdown(e, lightKwh, lightCost){
    migrateEconElecCats(e);
    const price = parseFloat(e.priceKwh) || 0;
    const rows = [{ id: 'light', kw: null, h: null, kwh: lightKwh || 0, cost: lightCost || 0 }];
    ECON_ELEC_CAT_IDS.forEach(function(id){
      const c = e.elecCats[id] || {};
      const kw = parseFloat(c.kw) || 0;
      const h = parseFloat(c.h) || 0;
      const kwh = kw * h * ECON_MONTH_DAYS;
      rows.push({ id: id, kw: kw, h: h, kwh: kwh, cost: kwh * price });
    });
    return rows;
  }

  function payrollCustomPeriodUnit(u){
    return u === 'day' || u === 'week' ? u : 'month';
  }

  function payrollCustomMonthlyAmount(row){
    const amt = Math.max(0, parseFloat(row.amount) || 0);
    const period = Math.max(1, parseFloat(row.period) || 1);
    const unit = payrollCustomPeriodUnit(row.periodUnit);
    if (unit === 'day') return amt * (ECON_MONTH_DAYS / period);
    if (unit === 'week') return amt * (ECON_MONTH_DAYS / (period * 7));
    return amt / period;
  }

  function calcPayrollMonthly(e){
    migrateEconPayroll(e);
    const gross = (e.staffLines || []).reduce(function(s, row){
      return s + Math.max(0, parseFloat(row.salary) || 0);
    }, 0);
    const taxPct = deps.clamp(parseFloat(e.payrollTaxPct) || 0, 0, 100);
    const staffCostPct = deps.clamp(parseFloat(e.payrollStaffCostPct) || 0, 0, 100);
    const payrollTax = e.payrollTax ? gross * (taxPct / 100) : 0;
    const payrollStaffCost = staffCostPct > 0 ? gross * (staffCostPct / 100) : 0;
    const custom = (e.payrollCustom || []).reduce(function(s, row){
      return s + payrollCustomMonthlyAmount(row);
    }, 0);
    const accounting = Math.max(0, parseFloat(e.accountingMonth) || 0);
    return {
      gross: gross,
      payrollTax: payrollTax,
      payrollTaxPct: taxPct,
      payrollStaffCost: payrollStaffCost,
      payrollStaffCostPct: staffCostPct,
      custom: custom,
      accounting: accounting,
      headcount: (e.staffLines || []).length,
      total: gross + payrollTax + payrollStaffCost + custom + accounting
    };
  }

  function ensureEconCultures(){
    if (!st().econ.cultures || !st().econ.cultures.length){
      st().econ.cultures = defaultEconCultures();
    }
  }

  function econGetAreaMode(e){
    e = e || st().econ;
    return e && e.areaMode === 'sqm' ? 'sqm' : 'pct';
  }

  function econCulturesTotalPct(){
    ensureEconCultures();
    return st().econ.cultures.reduce((s, row) => s + (parseFloat(row.pct) || 0), 0);
  }

  function econCulturesTotalSqm(plantingArea){
    ensureEconCultures();
    const pa = Math.max(0, parseFloat(plantingArea) || 0);
    return st().econ.cultures.reduce(function(s, row){
      const norm = normalizeEconCultureRow(row);
      const sqm = parseFloat(norm.areaSqm);
      if (Number.isFinite(sqm) && sqm >= 0) return s + sqm;
      const pct = parseFloat(norm.pct) || 0;
      return s + (pa > 0 ? pa * pct / 100 : 0);
    }, 0);
  }

  function syncEconCultureAreaFields(row, plantingArea, opts){
    opts = opts || {};
    row = normalizeEconCultureRow(row);
    const pa = Math.max(0, parseFloat(plantingArea) || 0);
    const mode = opts.areaMode != null ? opts.areaMode : econGetAreaMode();
    const pct = parseFloat(row.pct) || 0;
    let sqm = parseFloat(row.areaSqm);
    if (mode === 'sqm'){
      if (!Number.isFinite(sqm) || sqm < 0) sqm = pa > 0 ? pa * pct / 100 : 0;
      row.areaSqm = Math.max(0, sqm);
      row.pct = pa > 0 ? row.areaSqm / pa * 100 : pct;
    } else {
      row.pct = pct;
      row.areaSqm = pa > 0 ? pa * row.pct / 100 : (Number.isFinite(sqm) && sqm >= 0 ? sqm : 0);
    }
    return row;
  }

  function setEconAreaMode(mode){
    ensureEconCultures();
    const next = mode === 'sqm' ? 'sqm' : 'pct';
    const prev = econGetAreaMode();
    if (prev === next) return;
    const pa = Math.max(0, parseFloat(st().econ.plantingArea) || 0);
    st().econ.cultures = st().econ.cultures.map(function(row){
      row = normalizeEconCultureRow(row);
      if (next === 'sqm') {
        row.areaSqm = pa > 0 ? pa * (parseFloat(row.pct) || 0) / 100 : 0;
      } else {
        row.pct = pa > 0 ? (parseFloat(row.areaSqm) || 0) / pa * 100 : (parseFloat(row.pct) || 0);
      }
      return row;
    });
    st().econ.areaMode = next;
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
      consumablesPotCost: cons.potCostMonth,
      consumablesPackagingCost: cons.packagingCost,
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
      if (seen.has(id)){
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
      if (!id) return;
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
    const areaMode = econGetAreaMode(e);
    const plantingArea = Math.max(0, parseFloat(e.plantingArea) || 0);
    st().econ.cultures.forEach(row => {
      const norm = normalizeEconCultureRow(row);
      const hasShare = areaMode === 'sqm'
        ? (parseFloat(norm.areaSqm) || 0) > 0
        : (parseFloat(norm.pct) || 0) > 0;
      if (!hasShare) return;
      const name = econCvDisplayName(row.cvId);
      if (!row.cvId) w.push({ level: 'normal', text: TF('econ.warn.noCvId', { name: name }, 'Строка «{name}»: выберите сорт в списке — иначе в расчёт не попадёт.') });
    });
    parts.forEach(p => {
      if (!p.bio || p.bio.density <= 0) w.push({ level: 'normal', text: TF('econ.warn.noDensity', { name: p.name }, '«{name}»: укажите плотность стояния (шт/м²).') });
      if (p.bio && p.bio.yieldPerCut <= 0) w.push({ level: 'normal', text: TF('econ.warn.noYield', { name: p.name }, '«{name}»: укажите урожай за срезку.') });
    });
    if (areaMode === 'sqm'){
      const totalSqm = econCulturesTotalSqm(plantingArea);
      if (totalSqm > plantingArea && plantingArea > 0){
        w.push({
          level: 'strong',
          text: TF('econ.warn.sqmOver', { total: deps.r1(totalSqm), planting: deps.r1(plantingArea) },
            'Сумма площадей {total} м² превышает посевную {planting} м² — в расчёте площади уменьшены пропорционально.')
        });
      } else if (totalSqm > 0 && totalSqm < plantingArea){
        w.push({
          level: 'strong',
          text: TF('econ.warn.sqmUnder', { total: deps.r1(totalSqm), planting: deps.r1(plantingArea), free: deps.r1(plantingArea - totalSqm) },
            'Занято {total} м² из {planting} м² (свободно {free} м²): полная аренда и ФОТ делятся на меньший выпуск → себестоимость выше.')
        });
      }
    } else if (farm.totalPct > 100){
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
    const areaMode = econGetAreaMode(e);
    const totalPctRaw = econCulturesTotalPct();
    const totalSqmRaw = econCulturesTotalSqm(plantingArea);
    let scale;
    let totalPct;
    if (areaMode === 'sqm'){
      scale = totalSqmRaw > plantingArea && plantingArea > 0 ? plantingArea / totalSqmRaw : 1;
      totalPct = plantingArea > 0 ? (totalSqmRaw / plantingArea) * 100 : 0;
    } else {
      scale = totalPctRaw > 100 ? 100 / totalPctRaw : 1;
      totalPct = totalPctRaw;
    }
    const wasteFactor = econWasteFactor(e);

    const parts = st().econ.cultures.map(row => {
      const norm = normalizeEconCultureRow(row);
      let area;
      let pct;
      if (areaMode === 'sqm'){
        const rawSqm = Math.max(0, parseFloat(norm.areaSqm) || 0);
        area = rawSqm * scale;
        pct = plantingArea > 0 ? area / plantingArea * 100 : 0;
      } else {
        pct = deps.clamp(parseFloat(norm.pct) || 0, 0, 100) * scale;
        area = plantingArea * pct / 100;
      }
      const defaultSalePrice = parseFloat(e.salePrice) || 0;
      const salePrice = parseFloat(norm.salePrice) > 0 ? parseFloat(norm.salePrice) : defaultSalePrice;
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
    }).filter(p => p.slice.area > 0 && p.cvId);

    const payroll = calcPayrollMonthly(e);
    const staffGross = payroll.gross;
    const payrollTax = payroll.payrollTax;
    const payrollStaffCost = payroll.payrollStaffCost;
    const payrollCustom = payroll.custom;
    const accountingMonth = payroll.accounting;
    const staffTotal = payroll.total;
    const equipTotal = deps.sumEconEquipment();
    const amortMonths = Math.max(1, parseFloat(e.amortMonths) || 60);
    const costScale = parseFloat(e._costScale) > 0 ? parseFloat(e._costScale) : 1;
    const equipAmort = (equipTotal / amortMonths) * costScale;
    const rent = parseFloat(e.rentMonth) || 0;
    const logistics = parseFloat(e.logisticsMonth) || 0;
    const other = parseFloat(e.otherMonth) || 0;
    const water = calcWaterMonthly(e);
    const waterCost = econWaterInCalc(e) ? water.cost : 0;
    const otherElec = calcOtherElecMonthly(e);
    const otherElecCost = otherElec.cost;
    const fixedOpex = rent + staffTotal + logistics + other + waterCost + otherElecCost + equipAmort;

    let lightCost = 0;
    let consumablesCost = 0;
    let outKg = 0;
    let outBerriesKg = 0;
    let outVegetablesKg = 0;
    let outPcs = 0;
    let outMicroBabyPcs = 0;
    let outFlowersPcs = 0;
    let outWheatgrassPcs = 0;
    let outOtherPcs = 0;
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
        const g = econOutputPcsGroup(p.cvId);
        if (g === 'microBaby') outMicroBabyPcs += p.slice.monthlyOutput;
        else if (g === 'flowers') outFlowersPcs += p.slice.monthlyOutput;
        else if (g === 'wheatgrass') outWheatgrassPcs += p.slice.monthlyOutput;
        else outOtherPcs += p.slice.monthlyOutput;
      } else {
        outKg += p.slice.monthlyOutput;
        const g = econOutputKgGroup(p.cvId);
        if (g === 'berries') outBerriesKg += p.slice.monthlyOutput;
        else if (g === 'vegetables') outVegetablesKg += p.slice.monthlyOutput;
        revKg += p.slice.revenue;
        areaKg += p.slice.area;
      }
    });

    const areaUsed = parts.reduce((s, p) => s + p.slice.area, 0);
    const sellKg = outKg * wasteFactor;
    const sellBerriesKg = outBerriesKg * wasteFactor;
    const sellVegetablesKg = outVegetablesKg * wasteFactor;
    const sellPcs = outPcs * wasteFactor;
    const sellMicroBabyPcs = outMicroBabyPcs * wasteFactor;
    const sellFlowersPcs = outFlowersPcs * wasteFactor;
    const sellWheatgrassPcs = outWheatgrassPcs * wasteFactor;
    const sellOtherPcs = outOtherPcs * wasteFactor;
    revKg *= wasteFactor;
    revPcs *= wasteFactor;
    const revenue = revKg + revPcs;
    const monthlyOpex = fixedOpex + lightCost + consumablesCost;
    const usnTaxAmt = e.usnTax ? revenue * 0.06 : 0;
    const vatPct = deps.clamp(parseFloat(e.vatPct) || 12, 0, 30);
    const profitTaxPct = deps.clamp(parseFloat(e.profitTaxPct) || 15, 0, 30);
    const vatTaxAmt = calcVatTaxAmt(revenue, e);
    const profitBeforeTax = revenue - monthlyOpex - usnTaxAmt - vatTaxAmt;
    const profitTaxAmt = e.profitTax ? Math.max(0, profitBeforeTax) * (profitTaxPct / 100) : 0;
    const margin = profitBeforeTax - profitTaxAmt;
    const taxTotal = usnTaxAmt + vatTaxAmt + profitTaxAmt;

    const fixedKg = areaUsed > 0 ? fixedOpex * (areaKg / areaUsed) : (outKg > 0 ? fixedOpex : 0);
    const fixedPcs = fixedOpex - fixedKg;
    const lightKg = parts.filter(p => p.slice.outputUnit !== 'шт').reduce((s, p) => s + p.slice.lightCost, 0);
    const lightPcs = lightCost - lightKg;
    const consKg = parts.filter(p => p.slice.outputUnit !== 'шт').reduce((s, p) => s + p.slice.consumablesCost, 0);
    const consPcs = consumablesCost - consKg;

    const lightKwhMonth = parts.reduce((s, p) => s + (p.slice.lightKwhMonth || 0), 0);
    const elecBreakdown = calcFarmElecBreakdown(e, lightKwhMonth, lightCost);
    const totalElecKwhMonth = elecBreakdown.reduce(function(s, row){ return s + (row.kwh || 0); }, 0);
    const totalElecCost = elecBreakdown.reduce(function(s, row){ return s + (row.cost || 0); }, 0);

    const unitCostKg = sellKg > 0 ? (fixedKg + lightKg + consKg) / sellKg : 0;
    const unitCostPcs = sellPcs > 0 ? (fixedPcs + lightPcs + consPcs) / sellPcs : 0;
    const taxShareKg = revenue > 0 ? taxTotal * (revKg / revenue) : 0;
    const taxSharePcs = revenue > 0 ? taxTotal * (revPcs / revenue) : 0;
    const marginKg = revKg - (fixedKg + lightKg + consKg) - taxShareKg;
    const marginPcs = revPcs - (fixedPcs + lightPcs + consPcs) - taxSharePcs;

    const varCostKg = lightKg + consKg;
    const contribPerKg = sellKg > 0 ? (revKg - varCostKg) / sellKg : 0;
    const breakEvenKgMo = contribPerKg > 0 && fixedKg > 0 ? fixedKg / contribPerKg : 0;
    const breakEvenKgSqm = breakEvenKgMo > 0 && areaKg > 0 ? breakEvenKgMo / areaKg : (breakEvenKgMo > 0 && plantingArea > 0 ? breakEvenKgMo / plantingArea : 0);
    const varCostPcs = lightPcs + consPcs;
    const contribPerPcs = sellPcs > 0 ? (revPcs - varCostPcs) / sellPcs : 0;
    const breakEvenPcsMo = contribPerPcs > 0 && fixedPcs > 0 ? fixedPcs / contribPerPcs : 0;
    const breakEvenPcsSqm = breakEvenPcsMo > 0 && areaPcs > 0 ? breakEvenPcsMo / areaPcs : (breakEvenPcsMo > 0 && plantingArea > 0 ? breakEvenPcsMo / plantingArea : 0);
    const breakEvenDenom = margin + fixedOpex;
    const breakEvenRevenue = revenue > 0 && fixedOpex > 0 && breakEvenDenom > 0
      ? fixedOpex * revenue / breakEvenDenom
      : 0;
    const breakEvenRevenuePct = revenue > 0 && breakEvenRevenue > 0 ? (breakEvenRevenue / revenue) * 100 : 0;

    parts.forEach(p => {
      const isPcs = p.slice.outputUnit === 'шт';
      const areaShare = areaUsed > 0 ? p.slice.area / areaUsed : 0;
      const shareFixed = fixedOpex * areaShare;
      const shareStaff = staffTotal * areaShare;
      const shareRent = rent * areaShare;
      const shareLogistics = logistics * areaShare;
      const shareWater = waterCost * areaShare;
      const shareOtherElec = otherElecCost * areaShare;
      const shareOther = other * areaShare;
      const shareAmort = equipAmort * areaShare;
      const shareLight = p.slice.lightCost || 0;
      const sell = (isPcs ? p.slice.monthlyOutput : p.slice.monthlyOutput) * wasteFactor;
      p.slice.allocatedFixed = shareFixed;
      p.slice.allocatedStaff = shareStaff;
      p.slice.allocatedRent = shareRent;
      p.slice.allocatedLogistics = shareLogistics;
      p.slice.allocatedWater = shareWater;
      p.slice.allocatedOther = shareOther;
      p.slice.allocatedAmort = shareAmort;
      p.slice.allocatedElec = shareLight + shareOtherElec;
      p.slice.monthlyOpex = shareFixed + shareLight + p.slice.consumablesCost;
      function perUnit(v){ return sell > 0 ? v / sell : 0; }
      p.slice.unitCostLight = perUnit(shareLight);
      p.slice.unitCostElecOther = perUnit(shareOtherElec);
      p.slice.unitCostElec = p.slice.unitCostLight + p.slice.unitCostElecOther;
      p.slice.unitCostStaff = perUnit(shareStaff);
      p.slice.unitCostRent = perUnit(shareRent);
      p.slice.unitCostLogistics = perUnit(shareLogistics);
      p.slice.unitCostWater = perUnit(shareWater);
      p.slice.unitCostOther = perUnit(shareOther);
      p.slice.unitCostAmort = perUnit(shareAmort);
      p.slice.unitCostConsumables = perUnit(p.slice.consumablesCost);
      p.slice.unitCostConsPot = perUnit(p.slice.consumablesPotCost || 0);
      p.slice.unitCostPackaging = perUnit(p.slice.consumablesPackagingCost || 0);
      p.slice.unitCostFull = perUnit(shareFixed + shareLight + p.slice.consumablesCost);
      const revNet = p.slice.revenue * wasteFactor;
      const taxShare = revenue > 0 ? taxTotal * (revNet / revenue) : 0;
      p.slice.margin = revNet - p.slice.monthlyOpex - taxShare;
    });

    const farm = {
      parts: parts,
      areaMode: areaMode,
      totalPct: totalPct,
      totalSqm: totalSqmRaw,
      areaUsed: areaUsed,
      plantingArea: plantingArea,
      wastePct: parseFloat(e.wastePct) || 0,
      wasteEnabled: econWasteInCalc(e),
      waterEnabled: econWaterInCalc(e),
      wasteFactor: wasteFactor,
      sellKg: sellKg,
      sellBerriesKg: sellBerriesKg,
      sellVegetablesKg: sellVegetablesKg,
      sellPcs: sellPcs,
      sellMicroBabyPcs: sellMicroBabyPcs,
      sellFlowersPcs: sellFlowersPcs,
      sellWheatgrassPcs: sellWheatgrassPcs,
      sellOtherPcs: sellOtherPcs,
      outKg: outKg,
      outBerriesKg: outBerriesKg,
      outVegetablesKg: outVegetablesKg,
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
      vatTaxAmt: vatTaxAmt,
      vatPct: vatPct,
      profitTaxAmt: profitTaxAmt,
      profitTaxPct: profitTaxPct,
      profitBeforeTax: profitBeforeTax,
      taxTotal: taxTotal,
      rent: rent,
      staffTotal: staffTotal,
      staffGross: staffGross,
      payrollTax: payrollTax,
      payrollTaxPct: payroll.payrollTaxPct,
      payrollStaffCost: payrollStaffCost,
      payrollStaffCostPct: payroll.payrollStaffCostPct,
      payrollCustom: payrollCustom,
      accountingMonth: accountingMonth,
      payroll: payroll,
      elecBreakdown: elecBreakdown,
      logistics: logistics,
      waterM3Month: water.m3,
      waterPriceM3: water.price,
      waterFertPerM3: water.fert,
      waterCost: waterCost,
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
      fixedOpex: fixedOpex,
      breakEvenKgMo: breakEvenKgMo,
      breakEvenKgSqm: breakEvenKgSqm,
      breakEvenPcsMo: breakEvenPcsMo,
      breakEvenPcsSqm: breakEvenPcsSqm,
      breakEvenRevenue: breakEvenRevenue,
      breakEvenRevenuePct: breakEvenRevenuePct,
      contribPerKg: contribPerKg,
      contribPerPcs: contribPerPcs
    };
    farm.warnings = collectEconWarnings(farm, e, parts);
    return farm;
  }

  function calcEconomics(snap, e){
    return calcFarmEconomics(e);
  }


    return {
      defaultEconEquipment: defaultEconEquipment,
      defaultEconEquipmentMonths: defaultEconEquipmentMonths,
      econEquipEffectiveAmount: econEquipEffectiveAmount,
      normalizeRunwayElecRampPct: normalizeRunwayElecRampPct,
      migrateEconRunwayElecRamp: migrateEconRunwayElecRamp,
      runwayElecEffectiveAmount: function(monthlyFull, mo){
        return runwayElecEffectiveAmount(monthlyFull, mo, getRunwayElecRampFractions());
      },
      runwayElecRampLoads: function(mo){
        return runwayElecRampLoads(mo, getRunwayElecRampFractions());
      },
      getEquipItemMeta: getEquipItemMeta,
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
      calcVatTaxAmt: calcVatTaxAmt,
      scaleEconCostFields: scaleEconCostFields,
      calcFarmElecBreakdown: calcFarmElecBreakdown,
      calcPayrollMonthly: calcPayrollMonthly,
      migrateEconElecCats: migrateEconElecCats,
      migrateEconPayroll: migrateEconPayroll,
      migrateEconOtherElectricity: migrateEconOtherElectricity,
      econWaterInCalc: econWaterInCalc,
      econWasteInCalc: econWasteInCalc,
      econWasteFactor: econWasteFactor,
      ECON_ELEC_CAT_IDS: ECON_ELEC_CAT_IDS,
      ensureEconCultures: ensureEconCultures,
      econGetAreaMode: econGetAreaMode,
      econCulturesTotalPct: econCulturesTotalPct,
      econCulturesTotalSqm: econCulturesTotalSqm,
      syncEconCultureAreaFields: syncEconCultureAreaFields,
      setEconAreaMode: setEconAreaMode,
      calcCultureSliceFromRow: calcCultureSliceFromRow,
      dedupeEconCultures: dedupeEconCultures,
      canAddEconCulture: canAddEconCulture,
      findDuplicateCultureIds: findDuplicateCultureIds,
      collectEconWarnings: collectEconWarnings,
      calcFarmEconomics: calcFarmEconomics,
      calcEconomics: calcEconomics,
      getEquipmentGroups: getEquipmentGroups,
      econSaladPotConsumablesMode: econSaladPotConsumablesMode,
      CONS_POT_PART_KEYS: CONS_POT_PART_KEYS,
      sumConsPotParts: sumConsPotParts,
      hasConsPotParts: hasConsPotParts,
      syncConsPotPartsTotal: syncConsPotPartsTotal
    };
  }

  global.DG_createEconCore = createEconCore;
})(typeof window !== 'undefined' ? window : this);
