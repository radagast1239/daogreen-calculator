'use strict';
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let h = fs.readFileSync(p, 'utf8');

function mustHave(s, label) {
  if (!h.includes(s)) throw new Error('missing: ' + label);
}

// 1) ECON constants early
if (!h.includes('const ECON_MONTH_DAYS = 30.5;')) {
  h = h.replace(
    "  const ECON_SALAD_MIX_CV_IDS = [\n    'vf-kale-baby'",
    "  const ECON_SALAD_MIX_CV_IDS = [\n    'vf-kale-baby'"
  );
  h = h.replace(
    "    'vf-pakchoi-baby', 'vf-tatsoi-baby', 'vf-komatsuna-baby'\n  ];\n\n  const ECON_EQUIPMENT_GROUPS",
    "    'vf-pakchoi-baby', 'vf-tatsoi-baby', 'vf-komatsuna-baby'\n  ];\n  const ECON_MONTH_DAYS = 30.5;\n  const ECON_MAX_CULTURES = 6;\n\n  const ECON_EQUIPMENT_GROUPS"
  );
}
// do not remove ECON_MONTH_DAYS — only delete duplicate block before calcOtherElecMonthly if present twice
if ((h.match(/const ECON_MONTH_DAYS = 30\.5;/g) || []).length > 1) {
  h = h.replace(/\n  const ECON_MONTH_DAYS = 30\.5;\n  const ECON_MAX_CULTURES = 6;\n\n  function calcOtherElecMonthly/g, '\n  function calcOtherElecMonthly');
}

// 2) econ yield helpers + econYieldParamsForCvId
const oldYield = `  function econYieldParamsForCvId(cvId, snap){
    snap = snap || getPlantingSnapshotForCvId(cvId);
    const gh = allGhCultivars().find(c => c.id === cvId);
    if (gh && !isVfCvId(cvId)){
      const std = getGhCvStandards(gh);
      if (gh.multicut && supportsMulticut(gh)){
        return {
          yieldPerCut: econGhYieldPerCutFromStd(gh, std),
          cutIntervalDays: Math.max(1, std.cutInterval || cutIntervalRange(gh).mid)
        };
      }
      return {
        yieldPerCut: Math.round(snap.yieldPerPotCycle * 10) / 10,
        cutIntervalDays: Math.max(1, snap.totalCycleDays || std.cutInterval || cutIntervalRange(gh).mid)
      };
    }
    const vf = allVfCultivars().find(c => c.id === cvId);
    if (vf){
      const std = getVfCvStandards(vf);
      let yieldPerCut = std.manualMass;
      if (vf.countUnit === 'шт' && vf.yieldPerCutG > 0) yieldPerCut = vf.yieldPerCutG;
      else if (vf.yieldPerCutG > 0 && !yieldPerCut) yieldPerCut = vf.yieldPerCutG;
      return {
        yieldPerCut: Math.round(yieldPerCut * 10) / 10,
        cutIntervalDays: Math.max(1, std.cutInterval || vfCutIntervalFromCv(vf) || snap.totalCycleDays || 15)
      };
    }
    return {
      yieldPerCut: Math.round(snap.yieldPerPotCycle * 10) / 10,
      cutIntervalDays: Math.max(1, snap.totalCycleDays || 15)
    };
  }`;

const newYield = `  function econCvTotalCycleDays(cv, snap){
    if (snap && snap.totalCycleDays > 0) return Math.round(snap.totalCycleDays);
    if (!cv) return 0;
    return Math.max(1, Math.round((cv.germination || 0) + 14 + (cv.channelDays || 0)));
  }

  function econSheetCutIntervalDays(cv, snap){
    if (cv && cv.multicut && supportsMulticut(cv) && cv.cutInterval > 0){
      return Math.max(1, Math.round(cv.cutInterval));
    }
    return Math.max(1, econCvTotalCycleDays(cv, snap));
  }

  function econSheetYieldPerCut(cv, snap){
    if (cv && cv.multicut && supportsMulticut(cv) && cv.yieldPerCutG > 0){
      return Math.round(cv.yieldPerCutG * 10) / 10;
    }
    if (cv && cv.yieldPerCutG > 0) return Math.round(cv.yieldPerCutG * 10) / 10;
    return Math.round((snap && snap.yieldPerPotCycle || 0) * 10) / 10;
  }

  function econYieldParamsForCvId(cvId, snap){
    snap = snap || getPlantingSnapshotForCvId(cvId);
    const cv = findCvById(cvId);
    if (isPalletCvId(cvId) && cv){
      return {
        yieldPerCut: econSheetYieldPerCut(cv, snap),
        cutIntervalDays: econSheetCutIntervalDays(cv, snap)
      };
    }
    const gh = allGhCultivars().find(c => c.id === cvId);
    if (gh && !isVfCvId(cvId)){
      const std = getGhCvStandards(gh);
      if (gh.multicut && supportsMulticut(gh)){
        return {
          yieldPerCut: econGhYieldPerCutFromStd(gh, std),
          cutIntervalDays: Math.max(1, std.cutInterval || cutIntervalRange(gh).mid)
        };
      }
      return {
        yieldPerCut: Math.round(snap.yieldPerPotCycle * 10) / 10,
        cutIntervalDays: Math.max(1, snap.totalCycleDays || std.cutInterval || cutIntervalRange(gh).mid)
      };
    }
    if (isVfCvId(cvId) && cv){
      return {
        yieldPerCut: econSheetYieldPerCut(cv, snap),
        cutIntervalDays: econSheetCutIntervalDays(cv, snap)
      };
    }
    return {
      yieldPerCut: Math.round(snap.yieldPerPotCycle * 10) / 10,
      cutIntervalDays: Math.max(1, snap.totalCycleDays || 15)
    };
  }`;

mustHave(oldYield.trim().slice(0, 40), 'econYieldParamsForCvId');
h = h.replace(oldYield, newYield);

// 3) econCatalogDefaults pallet + vf
h = h.replace(
`      const snap = getPlantingSnapshotForCvId(cvId);
      return Object.assign({
        density: Math.round(snap.rhoA || cv.density),
        yieldPerCut: Math.round(snap.yieldPerPotCycle * 10) / 10,
        cutIntervalDays: Math.max(1, snap.totalCycleDays || cv.channelDays || 15),
        unitIsPieces: snap.unitIsPieces,
        potHarvestMonths: parsePotHarvestMonthsFromCv(cv),
        consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT
      }, light);`,
`      const snap = getPlantingSnapshotForCvId(cvId);
      const yp = econYieldParamsForCvId(cvId, snap);
      return Object.assign({
        density: Math.round(snap.rhoA || cv.density),
        yieldPerCut: yp.yieldPerCut,
        cutIntervalDays: yp.cutIntervalDays,
        unitIsPieces: snap.unitIsPieces,
        potHarvestMonths: parsePotHarvestMonthsFromCv(cv, snap),
        consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT
      }, light);`
);

h = h.replace(
`      const std = getVfCvStandards(cv);
      let yieldPerCut = std.manualMass;
      if (cv.countUnit === 'шт' && cv.yieldPerCutG > 0) yieldPerCut = cv.yieldPerCutG;
      else if (cv.yieldPerCutG > 0 && !yieldPerCut) yieldPerCut = cv.yieldPerCutG;
      return Object.assign({
        density: std.density,
        yieldPerCut: yieldPerCut,
        cutIntervalDays: Math.max(1, std.cutInterval || vfCutIntervalFromCv(cv) || 15),
        unitIsPieces: cv.countUnit === 'шт',
        consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT
      }, light);`,
`      const snap = getPlantingSnapshotForCvId(cvId);
      const yp = econYieldParamsForCvId(cvId, snap);
      const std = buildDefaultVfStandards(cv);
      return Object.assign({
        density: Math.round(snap.rhoA || std.density),
        yieldPerCut: yp.yieldPerCut,
        cutIntervalDays: yp.cutIntervalDays,
        unitIsPieces: cv.countUnit === 'шт',
        potHarvestMonths: parsePotHarvestMonthsFromCv(cv, snap),
        consumablesPerPot: ECON_DEFAULT_CONSUMABLES_PER_POT
      }, light);`
);

// 4) parsePotHarvestMonthsFromCv
const oldParse = `  /** Срок урожая с одного посева (мес): верхняя граница; «до года» = 12; однократка = 1; недели → мес вверх */
  function parsePotHarvestMonthsFromCv(cv){
    if (!cv) return 3;
    if (cv.potHarvestMonths > 0) return Math.max(0.25, cv.potHarvestMonths);
    const fn = (window.VF_SHEET && window.VF_SHEET.replaceMonthsFromNote)
      || (window.PALLET_SHEET && window.PALLET_SHEET.replaceMonthsFromNote);
    if (fn){
      const fromNote = fn(cv.replaceNote || '', cv.cutNote || '');
      if (fromNote > 0) return Math.max(0.25, fromNote);
    }
    const note = String(cv.replaceNote || cv.cutNote || '').toLowerCase();
    if (/до\\s*года|вечноцвет/.test(note)) return 12;
    if (/однократн|45\\s*сут/.test(note)) return 1;`;

const newParse = `  /** Срок списания горшка/кассеты (мес) для расходников на посев */
  function parsePotHarvestMonthsFromCv(cv, snap){
    if (!cv) return 3;
    if (cv.potHarvestMonths > 0) return Math.max(0.25, cv.potHarvestMonths);
    const note = String(cv.replaceNote || cv.cutNote || '').toLowerCase();
    const cycleDays = econCvTotalCycleDays(cv, snap);
    if (cv.multicut === false || (!cv.multicut && !supportsMulticut(cv))){
      if (cycleDays > 0) return Math.max(0.25, cycleDays / ECON_MONTH_DAYS);
    }
    if (/45\\s*сут/.test(note)){
      return Math.max(0.25, (cycleDays > 0 ? cycleDays : 45) / ECON_MONTH_DAYS);
    }
    const fn = (window.VF_SHEET && window.VF_SHEET.replaceMonthsFromNote)
      || (window.PALLET_SHEET && window.PALLET_SHEET.replaceMonthsFromNote);
    if (fn){
      const fromNote = fn(cv.replaceNote || '', cv.cutNote || '');
      if (fromNote > 0) return Math.max(0.25, fromNote);
    }
    if (/до\\s*года|вечноцвет/.test(note)) return 12;
    if (/однократн/.test(note) && cycleDays > 0) return Math.max(0.25, cycleDays / ECON_MONTH_DAYS);`;

mustHave(oldParse.slice(0, 30), 'parsePotHarvestMonths');
h = h.replace(oldParse, newParse);

h = h.replace(
  'if (cv) row.potHarvestMonths = parsePotHarvestMonthsFromCv(cv);',
  'if (cv) row.potHarvestMonths = parsePotHarvestMonthsFromCv(cv, snap);'
);

// 5) importAllEconFromPlanting
h = h.replace(
`  function importAllEconFromPlanting(){
    state.econ.priceKwh = state.pricePerKwh;
    const snap0 = getPlantingSnapshot();
    if (!state.econ.plantingArea || state.econ.plantingArea <= 0){
      state.econ.plantingArea = Math.round(snap0.sysArea * 10) / 10;
    }
    ensureEconCultures();`,
`  function importAllEconFromPlanting(){
    state.econ.priceKwh = state.pricePerKwh;
    ensureEconCultures();
    const firstCvId = state.econ.cultures.map(r => r.cvId).find(id => id);
    const snap0 = firstCvId ? getPlantingSnapshotForCvId(firstCvId) : getPlantingSnapshot();
    if (!state.econ.plantingArea || state.econ.plantingArea <= 0){
      state.econ.plantingArea = Math.round(snap0.sysArea * 10) / 10;
    }`
);

// 6) ledEfficacy
h = h.replace(
  'return isVF() ? state.ledEfficacyVf : state.ledEfficacyGh;',
  'return (isVF() || isPalletView()) ? state.ledEfficacyVf : state.ledEfficacyGh;'
);

// 7) applyPalletStandardsToStateOnly
const oldApply = `  function applyPalletStandardsFromSheet(cv, opts){
    cv = cv || getPalletCv();
    if (!cv) return;
    if (!isPalletView() && !(opts && opts.econ)) return;
    const dMax = Math.max(DENSITY_MAX, Math.ceil(cv.density * 1.2));
    const densityEl = $('density'), dayEl = $('day');
    if (densityEl) densityEl.max = dMax;
    if (dayEl) dayEl.max = 70;
    if (state.palletStd.germination){
      state.germination = clamp(cv.germination, 1, 21);
      $('germination').value = state.germination;
      $('germination-v').textContent = state.germination;
    }
    if (state.palletStd.day){
      state.day = clamp(cv.channelDays, 1, 70);
      $('day').value = state.day;
      $('day-v').textContent = state.day;
    }
    if (state.palletStd.density){
      state.density = clamp(cv.density, 15, dMax);
      $('density').value = state.density;
      $('density-v').textContent = state.density;
    }
    if (state.palletStd.cells && cv.palletCells){
      state.palletCells = cv.palletCells;
      syncPalletCellButtons();
    }
    if (state.palletStd.mass){
      state.manualMass = Math.round(cv.yieldPerCutG) || 10;
      state.useManualMass = true;
      $('manualMass').value = state.manualMass;
      if (!state.useManualCanopy){
        state.manualCanopy = Math.round(modelCanopyFromMass(cv, state.manualMass));
        if ($('manualCanopy')) $('manualCanopy').value = state.manualCanopy;
      }
    }
    applyCutStandardsFromSheet(cv);
    state.multicut = !!cv.multicut;
    if ($('multicut')) $('multicut').checked = state.multicut;
    syncManualMassUI();
    syncVfStdControls();
  }`;

const newApply = `  function applyPalletStandardsToStateOnly(cv, opts){
    cv = cv || getPalletCv();
    if (!cv) return;
    const force = !!(opts && opts.econ);
    const dMax = Math.max(DENSITY_MAX, Math.ceil(cv.density * 1.2));
    if (force || state.palletStd.germination) state.germination = clamp(cv.germination, 1, 21);
    if (force || state.palletStd.day) state.day = clamp(cv.channelDays, 1, 70);
    if (force || state.palletStd.density) state.density = clamp(cv.density, 15, dMax);
    if ((force || state.palletStd.cells) && cv.palletCells) state.palletCells = cv.palletCells;
    if (force || state.palletStd.mass){
      state.manualMass = Math.round(cv.yieldPerCutG) || 10;
      state.useManualMass = true;
      if (!state.useManualCanopy) state.manualCanopy = Math.round(modelCanopyFromMass(cv, state.manualMass));
    }
    if (force || state.palletStd.cutInterval){
      const cr = cutIntervalRange(cv);
      if (cr.mid > 0) state.cutInterval = cr.mid;
    }
    if (force || state.palletStd.cutMass || state.palletStd.mass){
      if (cv.yieldPerCutG > 0){
        state.manualCutMass = Math.round(cv.yieldPerCutG) || 1;
        state.useManualCutMass = false;
      }
    }
    state.multicut = !!cv.multicut;
  }

  function applyPalletStandardsFromSheet(cv, opts){
    cv = cv || getPalletCv();
    if (!cv) return;
    if (!isPalletView() && !(opts && opts.econ)) return;
    if (opts && opts.econ){
      applyPalletStandardsToStateOnly(cv, opts);
      return;
    }
    const dMax = Math.max(DENSITY_MAX, Math.ceil(cv.density * 1.2));
    const densityEl = $('density'), dayEl = $('day');
    if (densityEl) densityEl.max = dMax;
    if (dayEl) dayEl.max = 70;
    applyPalletStandardsToStateOnly(cv, opts);
    if (state.palletStd.germination){
      $('germination').value = state.germination;
      $('germination-v').textContent = state.germination;
    }
    if (state.palletStd.day){
      $('day').value = state.day;
      $('day-v').textContent = state.day;
    }
    if (state.palletStd.density){
      $('density').value = state.density;
      $('density-v').textContent = state.density;
    }
    if (state.palletStd.cells && cv.palletCells) syncPalletCellButtons();
    if (state.palletStd.mass){
      $('manualMass').value = state.manualMass;
      if (!state.useManualCanopy && $('manualCanopy')) $('manualCanopy').value = state.manualCanopy;
    }
    applyCutStandardsFromSheet(cv);
    if ($('multicut')) $('multicut').checked = state.multicut;
    syncManualMassUI();
    syncVfStdControls();
  }`;

mustHave('function applyPalletStandardsFromSheet', 'applyPallet');
h = h.replace(oldApply, newApply);

// 8) VF snapshot for econ
h = h.replace(
  'applyVfProfileToStateOnly(getVfCvStandards(cv), cv);',
  'applyVfProfileToStateOnly(buildDefaultVfStandards(cv), cv);'
);

// 9) consumables waste
h = h.replace(
`    const perKgExtra = parseFloat(e && e.consumablesPerKg) || 0;
    let extraPerSqm = 0;
    if (perKgExtra > 0 && monthlyOutput > 0 && area > 0){
      const extra = monthlyOutput * perKgExtra;
      cost += extra;
      extraPerSqm = extra / area;
      costPerSqm += extraPerSqm;
    }
    const unitCost = monthlyOutput > 0 ? cost / monthlyOutput : 0;`,
`    const perKgExtra = parseFloat(e && e.consumablesPerKg) || 0;
    const wasteFactor = e ? (1 - clamp(parseFloat(e.wastePct) || 0, 0, 50) / 100) : 1;
    const sellableOutput = monthlyOutput * wasteFactor;
    let extraPerSqm = 0;
    if (perKgExtra > 0 && sellableOutput > 0 && area > 0){
      const extra = sellableOutput * perKgExtra;
      cost += extra;
      extraPerSqm = extra / area;
      costPerSqm += extraPerSqm;
    }
    const unitCost = sellableOutput > 0 ? cost / sellableOutput : 0;`
);

// 10) formatEconCultureHint interval label
h = h.replace(
`    let h = 'Срезок в месяц: <strong>' + r1(bio.cutsPerMonth) + '</strong> · с 1 горшка:`,
`    const intervalLbl = bio.cutIntervalDays >= 25
      ? 'полный цикл ' + r1(bio.cutIntervalDays) + ' сут'
      : 'интервал ' + r1(bio.cutIntervalDays) + ' сут';
    let h = 'Срезок в месяц: <strong>' + r1(bio.cutsPerMonth) + '</strong> (' + intervalLbl + ') · с 1 горшка:`
);

// 11) UI labels
h = h.replace("econCultParamInput(i, 'yieldPerCut', 'Урожай за срезку', { step: 0.1 })", "econCultParamInput(i, 'yieldPerCut', 'Масса одной срезки', { step: 0.1, title: 'Г или шт с одного горшка за одну срезку, не сумма за жизнь растения' })");
h = h.replace("econCultParamInput(i, 'cutIntervalDays', 'Интервал срезов, сут', { step: 1, min: 1 })", "econCultParamInput(i, 'cutIntervalDays', 'Интервал / цикл, сут', { step: 1, min: 1, title: 'Мультисрез: дни между срезками. Однократка: полный цикл до среза' })");
h = h.replace("econCultParamInput(i, 'potHarvestMonths', 'Срок урожая с 1 посева, мес', { step: 0.5, decimals: 1 })", "econCultParamInput(i, 'potHarvestMonths', 'Срок жизни горшка, мес', { step: 0.5, decimals: 1, title: 'Расходники на посев ÷ этот срок. Однократка 45 сут ≈ 1,48 мес' })");
h = h.replace("econNumInput('consumablesPerKg', 'Доп. на 1 кг/шт урожая, ₽'", "econNumInput('consumablesPerKg', 'Доп. на ед. продукции, ₽'", "step: 0.1, hint: '₽/кг или ₽/шт на продаваемый выпуск (с учётом брака), опционально'");

// 12) mix button
h = h.replace(
`    if (mixBtn){
      mixBtn.disabled = !canAddEconCulture() || state.econ.cultures.some(c => c.cvId === ECON_SALAD_MIX_ID);
    }`,
`    if (mixBtn){
      const mixOverlap = state.econ.cultures.some(c =>
        c.cvId && c.cvId !== ECON_SALAD_MIX_ID && ECON_SALAD_MIX_CV_IDS.indexOf(c.cvId) >= 0
      );
      mixBtn.disabled = !canAddEconCulture()
        || state.econ.cultures.some(c => c.cvId === ECON_SALAD_MIX_ID)
        || mixOverlap;
      if (mixOverlap) mixBtn.title = 'Уберите отдельные сорта из состава микса';
    }`
);

// 13) loadEconStore cleanup
if (!h.includes("localStorage.removeItem('calc-econ-v1')")) {
  h = h.replace(
`      ensureEconEquipment();
    } catch(_){}
  }

  function saveEconStore(){`,
`      ensureEconEquipment();
      try {
        localStorage.removeItem('calc-econ-v1');
        localStorage.removeItem('calc-econ-v2');
      } catch(_){}
    } catch(_){}
  }

  function saveEconStore(){`
  );
}

// 14) CALC_BUILD
h = h.replace("const CALC_BUILD = '2026-05-17-p12'", "const CALC_BUILD = '2026-05-17-p13-econ'");

fs.writeFileSync(p, h, 'utf8');
console.log('OK calculator patched', h.length);
