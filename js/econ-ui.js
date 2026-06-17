/** DOM/UI экономики — DG_createEconUI */
(function(global){
  'use strict';

  function createEconUI(deps){
    function st(){ return deps.getState(); }
    function L(k){ return deps.t ? deps.t(k) : k; }
    function equipmentGroups(){
      if (typeof deps.getEquipmentGroups === 'function') return deps.getEquipmentGroups();
      return deps.ECON_EQUIPMENT_GROUPS || [];
    }
    function uKg(){ return L('econ.unit.kg'); }
    function uPcs(){ return L('econ.unit.pcs'); }
    function uG(){ return L('econ.unit.g'); }
    function uOut(u){ return u === 'кг' ? uKg() : (u === 'шт' ? uPcs() : u); }
    function tFmt(k, vars){
      if (global.DG_tFmt) return global.DG_tFmt(k, vars);
      var s = L(k);
      if (vars){
        Object.keys(vars).forEach(function(kk){
          s = s.replace(new RegExp('\\{' + kk + '\\}', 'g'), String(vars[kk]));
        });
      }
      return s;
    }
    function moneySym(){ return deps.currencySym ? deps.currencySym() : '₽'; }
    function moneyFmt(n, o){ return deps.fmtMoney ? deps.fmtMoney(n, o) : deps.fmtNum(n, o); }
    function moneyPer(n, perKey, o){
      if (deps.fmtMoneyPer) return deps.fmtMoneyPer(n, perKey, o);
      return moneyFmt(n, o) + L(perKey);
    }
    function fmtUnitCost(val, u){
      if (!(val > 0)) return '—';
      return u === 'шт' ? moneyPer(val, 'econ.perPcs', { decimals: 2 }) : moneyPer(val, 'econ.perKg');
    }
    function unitCostBreakdownLine(label, val, u, monthlyAlloc){
      if (!(val > 0)) return '';
      let amt = fmtUnitCost(val, u);
      if (monthlyAlloc > 0) amt += '<span class="econ-uc-mo"> · ' + moneyFmt(monthlyAlloc) + L('econ.perMonth') + '</span>';
      return '<div class="line line--sub"><span>' + label + '</span><strong>' + amt + '</strong></div>';
    }
    function parseMoney(v){ return deps.parseMoneyInput ? deps.parseMoneyInput(v) : deps.parseNumInput(v); }
    function fmtMoneyInp(rub, d){ return deps.formatMoneyInput ? deps.formatMoneyInput(rub, d) : deps.formatInputValue(rub, d); }
    function formToken(){ return deps.localeToken ? deps.localeToken() : 'ru'; }
    function isMoneyKey(k){ return deps.isMoneyEconKey && deps.isMoneyEconKey(k); }
    function isMoneyCult(f){ return deps.isMoneyCultField && deps.isMoneyCultField(f); }
    function moneyLabel(baseKey, perKey){
      return L(baseKey) + ', ' + moneySym() + L(perKey);
    }
    function payrollAllocMode(){
      const m = st().econ && st().econ.payrollAllocMode;
      return m === 'revenue' || m === 'labor' || m === 'laborOps' ? m : 'area';
    }
    function unitCostBreakdownHintText(){
      const mode = payrollAllocMode();
      const logFollow = !!(st().econ && st().econ.logisticsFollowPayroll);
      const split = !!(st().econ && st().econ.payrollSplitEnabled);
      if (mode === 'laborOps') return L('econ.metrics.unitCostBreakdownHintLaborOps') + (logFollow ? ' ' + L('econ.metrics.unitCostBreakdownLogFollow') : '');
      if (mode === 'revenue') return L('econ.metrics.unitCostBreakdownHintRevenue') + (logFollow ? ' ' + L('econ.metrics.unitCostBreakdownLogFollow') : '');
      if (mode === 'labor') return L('econ.metrics.unitCostBreakdownHintLabor') + (logFollow ? ' ' + L('econ.metrics.unitCostBreakdownLogFollow') : '');
      if (split) return L('econ.metrics.unitCostBreakdownHintSplit') + (logFollow ? ' ' + L('econ.metrics.unitCostBreakdownLogFollow') : '');
      return L('econ.metrics.unitCostBreakdownHint') + (logFollow ? ' ' + L('econ.metrics.unitCostBreakdownLogFollow') : '');
    }
    var ECON_MONTH_DAYS = deps.ECON_MONTH_DAYS;
    var ECON_ELEC_CAT_IDS = deps.ECON_ELEC_CAT_IDS || ['pumps', 'fans', 'heating', 'equipment', 'refrigeration', 'packaging', 'misc'];
    var ECON_MAX_CULTURES = deps.ECON_MAX_CULTURES;
    var ECON_SALAD_MIX_ID = deps.ECON_SALAD_MIX_ID;
    var ECON_SALAD_MIX_CV_IDS = deps.ECON_SALAD_MIX_CV_IDS;
    var ECON_CONSUMABLES_PER_POT_HINT = deps.ECON_CONSUMABLES_PER_POT_HINT;
    var ECON_EQUIPMENT_GROUPS = deps.ECON_EQUIPMENT_GROUPS;
    var VF_CULTIVARS = deps.VF_CULTIVARS || [];
    var CULTIVARS = deps.CULTIVARS || [];
    var PALLET_CULTIVARS = deps.PALLET_CULTIVARS || [];
    var ECON_EXTRA_BERRIES = [
      { id: 'econ-berry-blueberry', labelKey: 'econ.opt.berryBlueberry' },
      { id: 'econ-berry-raspberry', labelKey: 'econ.opt.berryRaspberry' },
      { id: 'econ-berry-strawberry', labelKey: 'econ.opt.berryStrawberry' },
      { id: 'econ-berry', labelKey: 'econ.opt.berryLegacy' }
    ];
    var ECON_EXTRA_VEGETABLES = [
      { id: 'econ-veg-cucumber', labelKey: 'econ.opt.vegCucumber' },
      { id: 'econ-veg-tomato', labelKey: 'econ.opt.vegTomato' },
      { id: 'econ-veg-pepper', labelKey: 'econ.opt.vegPepper' },
      { id: 'econ-vegetables', labelKey: 'econ.opt.vegetablesLegacy' }
    ];

  function getEconCultureOptionsHtml(selectedId, rowIdx, searchQuery){
    const used = new Set();
    deps.ensureEconCultures();
    st().econ.cultures.forEach((row, j) => {
      if (j !== rowIdx && row.cvId) used.add(row.cvId);
    });
    const q = String(searchQuery || '').trim().toLowerCase();
    const matchName = function(name){
      if (!q) return true;
      return String(name || '').toLowerCase().indexOf(q) >= 0;
    };
    const opt = (val, label) => {
      const sel = selectedId === val ? ' selected' : '';
      const dis = val && used.has(val) ? ' disabled' : '';
      return '<option value="' + val + '"' + sel + dis + '>' + label + '</option>';
    };
    const pushMatched = function(target, id, label){
      if (!id) return;
      if (selectedId === id || matchName(label)) target.push({ id: id, label: label });
    };
    const renderGroup = function(label, list){
      if (!list.length) return '';
      return '<optgroup label="' + label + '">' + list.map(function(item){ return opt(item.id, item.label); }).join('') + '</optgroup>';
    };
    let html = opt('', L('econ.opt.empty'));
    const customVf = st().customVfCultivars || [];
    const customGh = st().customGhCultivars || [];
    const vfOpts = [];
    VF_CULTIVARS.forEach(function(c){ pushMatched(vfOpts, c.id, c.name); });
    customVf.forEach(function(c){ pushMatched(vfOpts, c.id, c.name + ' ★'); });
    html += renderGroup(L('econ.opt.vf'), vfOpts);
    const ghOpts = [];
    CULTIVARS.forEach(function(c){ pushMatched(ghOpts, c.id, c.name); });
    customGh.forEach(function(c){ pushMatched(ghOpts, c.id, c.name + ' ★'); });
    html += renderGroup(L('econ.opt.gh'), ghOpts);
    if (PALLET_CULTIVARS.length){
      const palOpts = [];
      PALLET_CULTIVARS.forEach(function(c){ pushMatched(palOpts, c.id, c.name); });
      html += renderGroup(L('econ.opt.pal'), palOpts);
    }
    const berryOpts = [];
    ECON_EXTRA_BERRIES.forEach(function(c){ pushMatched(berryOpts, c.id, L(c.labelKey)); });
    html += renderGroup(L('econ.opt.groupBerries'), berryOpts);
    const vegOpts = [];
    ECON_EXTRA_VEGETABLES.forEach(function(c){ pushMatched(vegOpts, c.id, L(c.labelKey)); });
    html += renderGroup(L('econ.opt.groupVegetables'), vegOpts);
    return html;
  }

  function econExtraKind(cvId){
    if (!cvId) return '';
    if (cvId.indexOf('econ-berry-') === 0 || cvId === 'econ-berry') return 'berry';
    if (cvId.indexOf('econ-veg-') === 0 || cvId === 'econ-vegetables') return 'vegetables';
    return '';
  }

  function fmtYieldSqmRate(yieldPerSqm, unit){
    if (!(yieldPerSqm > 0)) return '';
    if (unit === 'шт') return deps.r1(yieldPerSqm) + ' ' + L('econ.yield.pcsSqm');
    return deps.r2(yieldPerSqm) + ' ' + L('econ.yield.kgSqm');
  }

  function fmtCultureOutputCell(slice, wasteActive, wasteFactor){
    const u = slice.outputUnit;
    const gross = slice.monthlyOutput;
    const sell = gross * wasteFactor;
    const yieldPerSqm = slice.yieldPerSqmMonth > 0
      ? slice.yieldPerSqmMonth
      : (slice.area > 0 ? sell / slice.area : 0);
    const perSqm = fmtYieldSqmRate(yieldPerSqm, u === 'шт' ? 'шт' : 'кг');
    if (!(gross > 0)) return '—';
    const gStr = u === 'кг' ? deps.r1(gross) : deps.fmtNum(gross);
    const sStr = u === 'кг' ? deps.r1(sell) : deps.fmtNum(sell);
    const totalStr = wasteActive ? gStr + ' → ' + sStr + ' ' + uOut(u) : gStr + ' ' + uOut(u);
    return (perSqm ? perSqm + ' · ' : '') + totalStr;
  }

  function econYieldInputMode(row, extraKind){
    if (extraKind !== 'berry' && extraKind !== 'vegetables') return 'cutMonth';
    const mode = row && row.yieldInputMode;
    if (mode === 'plantMonth' || mode === 'sqmMonth' || mode === 'cutMonth') return mode;
    const bySqm = Math.max(0, parseFloat(row && row.yieldPerSqmMonthManual) || 0);
    if (bySqm > 0) return 'sqmMonth';
    const byPlant = Math.max(0, parseFloat(row && row.yieldPerPlantMonth) || 0);
    if (byPlant > 0) return 'plantMonth';
    const byCuts = Math.max(0, parseFloat(row && row.cutsPerMonthManual) || 0);
    if (byCuts > 0) return 'cutMonth';
    return 'plantMonth';
  }

  function isEconCvIdTaken(cvId, exceptIdx){
    if (!cvId) return false;
    deps.ensureEconCultures();
    return st().econ.cultures.some((row, j) => j !== exceptIdx && row.cvId === cvId);
  }

  function econEscAttr(t){
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function econYieldModeSelectInput(i, mode, plantLabel){
    function opt(val, lbl){
      return '<option value="' + val + '"' + (mode === val ? ' selected' : '') + '>' + econEscAttr(lbl) + '</option>';
    }
    return '<div class="econ-field econ-culture-param"><label>' + L('econ.cult.yieldMode') + '</label>' +
      '<select data-econ-cult-field="yieldInputMode" data-econ-cult-idx="' + i + '">' +
      opt('plantMonth', plantLabel) +
      opt('sqmMonth', L('econ.cult.yieldModeSqmMonth')) +
      opt('cutMonth', L('econ.cult.yieldModeCutsMonth')) +
      '</select></div>';
  }

  function fmtEconRub(n){
    return deps.fmtNum(n);
  }

  function refreshFmtDisplayAll(){
    const root = deps.$('view-economics');
    if (!root) return;
    root.querySelectorAll('.econ-num-fmt').forEach(inp => {
      if (document.activeElement === inp) return;
      const dec = parseInt(inp.dataset.econDecimals, 10) || 0;
      let v = NaN;
      const k = inp.dataset.econKey;
      if (k != null) v = st().econ[k];
      else if (inp.dataset.econEq != null) v = (st().econ.equipment || {})[inp.dataset.econEq];
      else if (inp.dataset.econCustomAmount != null){
        const cid = inp.dataset.econCustomAmount;
        const it = (st().econ.equipmentCustom || []).find(x => x.id === cid);
        if (it) v = it.amount;
      } else if (inp.dataset.econCultField != null){
        const i = parseInt(inp.dataset.econCultIdx, 10);
        if (st().econ.cultures[i]) v = st().econ.cultures[i][inp.dataset.econCultField];
      } else if (inp.dataset.econCulturePrice != null){
        const i = parseInt(inp.dataset.econCulturePrice, 10);
        if (st().econ.cultures[i]) v = st().econ.cultures[i].salePrice;
      } else if (inp.dataset.econCulturePct != null){
        const i = parseInt(inp.dataset.econCulturePct, 10);
        if (st().econ.cultures[i]) v = st().econ.cultures[i].pct;
      } else if (inp.dataset.econCultureSqm != null){
        const i = parseInt(inp.dataset.econCultureSqm, 10);
        if (st().econ.cultures[i]) v = st().econ.cultures[i].areaSqm;
      } else if (inp.dataset.econStaffSalary != null){
        const sid = inp.dataset.econStaffSalary;
        const row = (st().econ.staffLines || []).find(function(x){ return x.id === sid; });
        if (row) v = row.salary;
      } else if (inp.dataset.econPayrollCustom != null){
        const cid = inp.dataset.econPayrollCustom;
        const row = (st().econ.payrollCustom || []).find(function(x){ return x.id === cid; });
        if (row) v = row.amount;
      } else if (inp.dataset.econCatKw != null){
        const cat = inp.dataset.econCatKw;
        if (st().econ.elecCats && st().econ.elecCats[cat]) v = st().econ.elecCats[cat].kw;
      } else if (inp.dataset.econCatH != null){
        const cat = inp.dataset.econCatH;
        if (st().econ.elecCats && st().econ.elecCats[cat]) v = st().econ.elecCats[cat].h;
      }
      if (!isNaN(v) && (
        (k != null && isMoneyKey(k)) || inp.dataset.econEq != null || inp.dataset.econCustomAmount != null ||
        inp.dataset.econCulturePrice != null || inp.dataset.econStaffSalary != null || inp.dataset.econPayrollCustom != null ||
        (inp.dataset.econCultField != null && isMoneyCult(inp.dataset.econCultField))
      )) v = deps.rubToDisplay ? deps.rubToDisplay(v) : v;
      inp.value = (v == null || v === '' || isNaN(v)) ? '' : deps.formatInputValue(v, dec);
    });
  }

  function initEconFmtInputs(){
    const root = deps.$('view-economics');
    if (!root || root.dataset.fmtInited) return;
    root.dataset.fmtInited = '1';
    root.addEventListener('focusin', e => {
      const inp = e.target.closest('.econ-num-fmt');
      if (!inp) return;
      const v = deps.parseNumInput(inp.value);
      const dec = parseInt(inp.dataset.econDecimals, 10) || 0;
      if (isNaN(v)) inp.value = '';
      else inp.value = dec > 0 ? String(v) : String(Math.round(v));
    });
    root.addEventListener('focusout', e => {
      const inp = e.target.closest('.econ-num-fmt');
      if (!inp || document.activeElement === inp) return;
      const dec = parseInt(inp.dataset.econDecimals, 10) || 0;
      const v = deps.parseNumInput(inp.value);
      inp.value = isNaN(v) ? '' : deps.formatInputValue(v, dec);
    });
  }

  function syncEconCalcOpts(){
    const e = st().econ;
    const waterOn = e.waterEnabled !== false;
    const wasteOn = e.wasteEnabled !== false;
    const waterChk = deps.$('econ-water-enabled');
    const wasteChk = deps.$('econ-waste-enabled');
    if (waterChk) waterChk.checked = waterOn;
    if (wasteChk) wasteChk.checked = wasteOn;
    const waterOpt = deps.$('econ-water-opt');
    const wasteOpt = deps.$('econ-waste-opt');
    if (waterOpt) waterOpt.classList.toggle('econ-calc-opt--off', !waterOn);
    if (wasteOpt) wasteOpt.classList.toggle('econ-calc-opt--off', !wasteOn);
    const waterHint = deps.$('econ-water-off-hint');
    const wasteHint = deps.$('econ-waste-off-hint');
    if (waterHint){
      waterHint.hidden = waterOn;
      if (!waterOn) waterHint.textContent = L('econ.waterOffHint');
    }
    if (wasteHint){
      wasteHint.hidden = wasteOn;
      if (!wasteOn) wasteHint.textContent = L('econ.wasteOffHint');
    }
    const payrollOpt = deps.$('econ-payroll-opt');
    const payrollTaxOn = e.payrollTax !== false;
    const payrollChk = deps.$('econ-payroll-tax');
    if (payrollChk) payrollChk.checked = payrollTaxOn;
    if (payrollOpt) payrollOpt.classList.toggle('econ-calc-opt--off', !payrollTaxOn);
  }

  function syncEconEquipmentPanel(){
    deps.ensureEconEquipment();
    const enabled = st().econ.equipmentEnabled !== false;
    const chk = deps.$('econ-equipment-enabled');
    if (chk) chk.checked = enabled;
    const body = deps.$('econ-equipment-body');
    if (body) body.classList.toggle('econ-equipment-body--hidden', !enabled);
    const panel = deps.$('econ-panel-equipment');
    if (panel) panel.classList.toggle('econ-equipment-panel--off', !enabled);
    const hint = deps.$('econ-equipment-panel-hint');
    if (hint){
      hint.textContent = enabled
        ? L('econ.equip.hintOn')
        : L('econ.equip.hintOff');
    }
  }

  function updateEconEquipmentTotal(){
    const raw = deps.sumEconEquipmentRaw();
    const inCalc = st().econ.equipmentEnabled !== false;
    const valEl = deps.$('econ-equipment-total-val');
    const hintEl = deps.$('econ-equipment-total-hint');
    if (valEl){
      valEl.innerHTML = moneyFmt(raw);
    }
    if (hintEl){
      const months = Math.max(1, parseFloat(st().econ.amortMonths) || 60);
      const amort = inCalc && raw > 0 ? raw / months : 0;
      let txt = L('econ.equip.totalTxt');
      if (raw > 0 && inCalc){
        txt += ' · ≈ ' + moneyPer(amort, 'econ.perMonth') + ' · ' + tFmt('econ.equip.amortOver', { months: deps.fmtNum(months) });
      } else if (raw > 0 && !inCalc){
        txt += L('econ.equip.notInCost');
      }
      hintEl.textContent = txt;
    }
  }

  function renderEconWarnings(list){
    const el = deps.$('econ-warnings');
    if (!el) return;
    if (!list.length){
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    el.innerHTML = list.map(function(item){
      const t = typeof item === 'string' ? item : (item && item.text ? item.text : '');
      const strong = item && item.level === 'strong';
      return '<li class="' + (strong ? 'econ-warn--strong' : '') + '">' + t + '</li>';
    }).join('');
  }

  function econToggleHtml(id, label, checked){
    return '<div class="toggle-wrap econ-toggle-field"><span class="toggle-label">' + label + '</span>' +
      '<label class="toggle"><input type="checkbox" id="' + id + '" ' + (checked ? 'checked' : '') + '>' +
      '<span class="toggle-switch"></span></label></div>';
  }

  function econToggleRowHtml(id, label, checked){
    return '<label class="toggle econ-toggle-row" for="' + id + '">' +
      '<input type="checkbox" id="' + id + '" ' + (checked ? 'checked' : '') + '>' +
      '<span class="toggle-switch" aria-hidden="true"></span>' +
      '<span class="toggle-label">' + label + '</span></label>';
  }

  function syncEconTaxNestedUi(){
    const e = st().econ;
    const vatTax = deps.$('econ-vat-tax');
    const vatGroup = vatTax && vatTax.closest('.econ-tax-group');
    if (vatGroup){
      const showVat = !!e.vatTax;
      const vatIncRow = vatGroup.querySelector('#econ-vat-inclusive')?.closest('.econ-toggle-row');
      const nested = vatGroup.querySelector('.econ-tax-nested');
      const hint = vatGroup.querySelector('.econ-tax-hint');
      if (vatIncRow) vatIncRow.style.display = showVat ? '' : 'none';
      if (nested) nested.style.display = showVat ? '' : 'none';
      if (hint) hint.style.display = showVat ? '' : 'none';
    }
    const profitTax = deps.$('econ-profit-tax');
    const profitGroup = profitTax && profitTax.closest('.econ-tax-group');
    if (profitGroup){
      const nested = profitGroup.querySelector('.econ-tax-nested');
      if (nested) nested.style.display = e.profitTax ? '' : 'none';
    }
  }

  function econTaxBlockHtml(){
    const e = st().econ;
    return '<div class="econ-tax-block">' +
      '<p class="econ-tax-block-title">' + L('econ.taxBlock.title') + '</p>' +
      econToggleRowHtml('econ-usn-tax', L('econ.usnTax'), e.usnTax) +
      '<div class="econ-tax-group">' +
        econToggleRowHtml('econ-vat-tax', L('econ.vatTax'), e.vatTax) +
        econToggleRowHtml('econ-vat-inclusive', L('econ.vatInclusive'), e.vatInclusive) +
        '<div class="econ-tax-nested">' + econNumInput('vatPct', L('econ.vatPct'), { step: 0.5 }) + '</div>' +
        '<p class="econ-hint econ-tax-hint">' + L('econ.vatInclusive.hint') + '</p>' +
      '</div>' +
      '<div class="econ-tax-group">' +
        econToggleRowHtml('econ-profit-tax', L('econ.profitTax'), e.profitTax) +
        '<div class="econ-tax-nested">' + econNumInput('profitTaxPct', L('econ.profitTaxPct'), { step: 0.5 }) + '</div>' +
      '</div></div>';
  }

  function renderEconCustomEquipRow(it){
    const id = it.id;
    const label = it.label || '';
    const val = parseFloat(it.amount) || 0;
    return '<div class="econ-equip-row econ-equip-row--custom" data-econ-custom-id="' + id + '">' +
      '<input type="text" class="econ-equip-label-inp" data-econ-custom-label="' + id + '" value="' + econEscAttr(label) + '" placeholder="' + L('econ.equip.placeholder') + '">' +
      '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" data-econ-custom-amount="' + id + '" value="' + deps.formatInputValue(val, 0) + '">' +
      '<button type="button" class="econ-rm" data-econ-custom-rm="' + id + '" title="' + L('econ.btn.remove') + '" aria-label="' + L('econ.btn.remove') + '">×</button></div>';
  }

  function econNumInput(key, label, opts){
    opts = opts || {};
    const val = st().econ[key];
    const dec = opts.decimals != null ? opts.decimals : deps.decimalsFromStep(opts.step != null ? opts.step : 1);
    const disp = (val == null || val === '') ? '' : deps.formatInputValue(val, dec);
    const ro = opts.readOnly ? ' readonly' : '';
    const hint = opts.hint ? '<div class="econ-hint">' + opts.hint + '</div>' : '';
    return '<div class="econ-field"><label>' + label + '</label>' +
      '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="' + dec + '" data-econ-key="' + key + '" value="' + disp + '"' + ro + '>' + hint + '</div>';
  }

  function equipItemHint(key){
    const hintKey = 'econ.eq.hint.' + key;
    const hint = L(hintKey);
    return hint !== hintKey ? hint : '';
  }

  function renderEquipLabelCell(k, label, hint){
    let html = '<div class="econ-equip-label-cell"><label for="econ-eq-' + k + '">' + label + '</label>';
    if (hint) html += '<span class="econ-equip-hint">' + econEscAttr(hint) + '</span>';
    return html + '</div>';
  }

  function startupRunwayMonthsVal(){
    return Math.max(1, parseFloat(st().econ.startupRunwayMonths) || 3);
  }

  function runwayElecRampLabel(months){
    const loads = deps.runwayElecRampLoads ? deps.runwayElecRampLoads(months) : [];
    if (!loads.length) return tFmt('econ.runway.timesMonths', { months: deps.fmtNum(months) });
    const pct = loads.map(function(l){ return deps.r1(l * 100) + '%'; });
    return tFmt('econ.runway.elecRamp', { loads: pct.join('→') });
  }

  function equipLineTotal(key, monthlyAmt, months, opts){
    const meta = opts || (deps.getEquipItemMeta ? deps.getEquipItemMeta(key) : null);
    if (!meta || !meta.monthly) return parseFloat(monthlyAmt) || 0;
    if (meta.runway && key === 'runwayElec' && deps.runwayElecEffectiveAmount){
      return deps.runwayElecEffectiveAmount(monthlyAmt, startupRunwayMonthsVal());
    }
    let mo;
    if (meta.runway) mo = startupRunwayMonthsVal();
    else mo = Math.max(1, parseFloat(months) || meta.defaultMonths || 1);
    return (parseFloat(monthlyAmt) || 0) * mo;
  }

  function syncRunwayFromCalc(){
    const e = st().econ;
    deps.ensureEconEquipment();
    const rent = parseFloat(e.rentMonth) || 0;
    if (rent > 0) e.equipment.prepRent = rent;
    const farm = deps.calcFarmEconomics(e);
    if (farm && farm.consumablesCost > 0) e.equipment.consumables = Math.round(farm.consumablesCost);
    if (farm && farm.totalElecCost > 0) e.equipment.runwayElec = Math.round(farm.totalElecCost);
    deps.saveEconStore();
  }

  function updateEconEquipLineTotals(){
    const wrap = deps.$('econ-equipment-groups');
    if (!wrap) return;
    const runwayMo = startupRunwayMonthsVal();
    wrap.querySelectorAll('[data-econ-runway-mo-label]').forEach(function(el){
      const row = el.closest('.econ-equip-row');
      const eqInp = row && row.querySelector('[data-econ-eq]');
      const key = eqInp && eqInp.dataset.econEq;
      el.textContent = key === 'runwayElec' ? runwayElecRampLabel(runwayMo) : tFmt('econ.runway.timesMonths', { months: deps.fmtNum(runwayMo) });
    });
    wrap.querySelectorAll('[data-econ-eq-total]').forEach(function(el){
      const key = el.dataset.econEqTotal;
      const amtInp = wrap.querySelector('[data-econ-eq="' + key + '"]');
      const moInp = wrap.querySelector('[data-econ-eq-months="' + key + '"]');
      if (!amtInp) return;
      const meta = deps.getEquipItemMeta ? deps.getEquipItemMeta(key) : null;
      const total = equipLineTotal(key, deps.parseNumInput(amtInp.value), moInp ? deps.parseNumInput(moInp.value) : null, meta);
      el.textContent = moneyFmt(total);
    });
  }

  function isRunwayGroup(grp){
    return grp.items.some(function(it){ return it[2] && it[2].runway; });
  }

  function ensureRunwayElecRampState(){
    const e = st().econ;
    if (deps.migrateEconRunwayElecRamp) deps.migrateEconRunwayElecRamp(e);
    else if (deps.normalizeRunwayElecRampPct){
      e.startupRunwayElecRamp = deps.normalizeRunwayElecRampPct(e.startupRunwayElecRamp, e.startupRunwayMonths);
    }
  }

  function renderRunwayElecRampInputs(){
    ensureRunwayElecRampState();
    const ramps = st().econ.startupRunwayElecRamp || [];
    let html = '<div class="econ-runway-ramp-row"><span class="econ-runway-ramp-lbl">' + L('econ.runway.elecRampLabel') + '</span>';
    ramps.forEach(function(v, i){
      html += '<label class="econ-runway-ramp-cell">' + tFmt('econ.runway.elecRampMonth', { n: i + 1 }) +
        '<input type="text" inputmode="decimal" class="econ-num-fmt econ-runway-ramp-inp" data-econ-decimals="0" data-econ-runway-elec-ramp="' + i + '" value="' + deps.formatInputValue(v, 0) + '" title="' + econEscAttr(L('econ.runway.elecRampHint')) + '"></label>';
    });
    return html + '<span class="econ-hint econ-runway-ramp-hint">' + L('econ.runway.elecRampHint') + '</span></div>';
  }

  function renderRunwayIntro(){
    const mo = startupRunwayMonthsVal();
    return '<div class="econ-runway-intro">' +
      '<p class="econ-hint econ-runway-hint">' + L('econ.runway.intro') + '</p>' +
      '<div class="econ-runway-controls">' +
      '<label class="econ-runway-months-lbl">' + L('econ.runway.monthsLabel') +
      '<input type="text" inputmode="numeric" class="econ-num-fmt econ-runway-months-inp" data-econ-decimals="0" data-econ-startup-runway-months value="' + deps.formatInputValue(mo, 0) + '"></label>' +
      '<button type="button" class="auto-btn econ-runway-sync-btn" data-econ-runway-sync>' + L('econ.runway.syncBtn') + '</button>' +
      '</div>' + renderRunwayElecRampInputs() + '</div>';
  }

  function renderEquipHeadRow(hasMonthly, runway){
    if (runway){
      return '<div class="econ-equip-row econ-equip-row--head econ-equip-row--monthly econ-equip-row--runway">' +
        '<span>' + L('econ.equip.head') + '</span>' +
        '<span style="text-align:right">' + L('econ.equip.perMonth') + ', ' + moneySym() + '</span>' +
        '<span style="text-align:center">' + L('econ.equip.months') + '</span>' +
        '<span style="text-align:right">' + L('econ.equip.lineTotal') + ', ' + moneySym() + '</span>' +
        '<span></span></div>';
    }
    if (hasMonthly){
      return '<div class="econ-equip-row econ-equip-row--head econ-equip-row--monthly">' +
        '<span>' + L('econ.equip.head') + '</span>' +
        '<span style="text-align:right">' + L('econ.equip.perMonth') + ', ' + moneySym() + '</span>' +
        '<span style="text-align:center">' + L('econ.equip.months') + '</span>' +
        '<span style="text-align:right">' + L('econ.equip.lineTotal') + ', ' + moneySym() + '</span>' +
        '<span></span></div>';
    }
    return '<div class="econ-equip-row econ-equip-row--head"><span>' + L('econ.equip.head') + '</span><span style="text-align:right">' + L('econ.equip.amount') + ', ' + moneySym() + '</span><span></span></div>';
  }

  function renderEquipItemRow(k, label, opts){
    const val = st().econ.equipment[k] || 0;
    const hint = equipItemHint(k);
    const labelCell = renderEquipLabelCell(k, label, hint);
    const monthly = opts && opts.monthly;
    const runway = opts && opts.runway;
    if (monthly && runway){
      const total = equipLineTotal(k, val, null, opts);
      return '<div class="econ-equip-row econ-equip-row--monthly econ-equip-row--runway">' +
        labelCell +
        '<input type="text" id="econ-eq-' + k + '" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" data-econ-eq="' + k + '" value="' + deps.formatInputValue(val, 0) + '">' +
        '<span class="econ-equip-runway-mo' + (k === 'runwayElec' ? ' econ-equip-runway-mo--elec' : '') + '" data-econ-runway-mo-label>' + (k === 'runwayElec' ? runwayElecRampLabel(startupRunwayMonthsVal()) : tFmt('econ.runway.timesMonths', { months: deps.fmtNum(startupRunwayMonthsVal()) })) + '</span>' +
        '<span class="econ-equip-line-total" data-econ-eq-total="' + k + '">' + moneyFmt(total) + '</span>' +
        '<span></span></div>';
    }
    if (monthly){
      const months = Math.max(1, parseFloat((st().econ.equipmentMonths || {})[k]) || (opts.defaultMonths || 1));
      const total = equipLineTotal(k, val, months, opts);
      return '<div class="econ-equip-row econ-equip-row--monthly">' +
        labelCell +
        '<input type="text" id="econ-eq-' + k + '" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" data-econ-eq="' + k + '" value="' + deps.formatInputValue(val, 0) + '">' +
        '<input type="text" inputmode="numeric" class="econ-num-fmt econ-equip-months-inp" data-econ-decimals="0" data-econ-eq-months="' + k + '" value="' + deps.formatInputValue(months, 0) + '" aria-label="' + econEscAttr(L('econ.equip.months')) + '">' +
        '<span class="econ-equip-line-total" data-econ-eq-total="' + k + '">' + moneyFmt(total) + '</span>' +
        '<span></span></div>';
    }
    return '<div class="econ-equip-row">' + labelCell +
      '<input type="text" id="econ-eq-' + k + '" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" data-econ-eq="' + k + '" value="' + deps.formatInputValue(val, 0) + '">' +
      '<span></span></div>';
  }

  function renderEconomicsEquipment(){
    deps.ensureEconEquipment();
    const wrap = deps.$('econ-equipment-groups');
    if (!wrap) return;
    const active = document.activeElement;
    const focusKey = active && wrap.contains(active) ? (active.dataset.econEq || active.dataset.econEqMonths || active.dataset.econStartupRunwayMonths || active.dataset.econCustomAmount || active.dataset.econCustomLabel) : null;
    let html = '';
    equipmentGroups().forEach(grp => {
      const runway = isRunwayGroup(grp);
      const hasMonthly = runway || grp.items.some(function(it){ return it[2] && it[2].monthly; });
      html += '<div class="econ-equip-group' + (runway ? ' econ-equip-group--runway' : '') + '"><h4>' + grp.title + '</h4>';
      if (runway) html += renderRunwayIntro();
      html += '<div class="econ-equip-items">' + renderEquipHeadRow(hasMonthly, runway);
      grp.items.forEach(function(it){
        html += renderEquipItemRow(it[0], it[1], it[2]);
      });
      html += '</div></div>';
    });
    const custom = st().econ.equipmentCustom;
    html += '<div class="econ-equip-group"><h4>' + L('econ.equip.customGroup') + '</h4><div class="econ-equip-items" id="econ-equipment-custom-list">';
    if (custom.length) html += renderEquipHeadRow(false, false);
    custom.forEach(it => { html += renderEconCustomEquipRow(it); });
    html += '</div><button type="button" class="auto-btn econ-equip-add-custom" id="econ-equipment-add-custom">+ ' + L('econ.equip.addBtn') + '</button></div>';
    wrap.innerHTML = html;
    syncEconEquipmentPanel();
    updateEconEquipmentTotal();
    if (focusKey){
      const el = wrap.querySelector('[data-econ-eq="' + focusKey + '"],[data-econ-eq-months="' + focusKey + '"],[data-econ-custom-amount="' + focusKey + '"],[data-econ-custom-label="' + focusKey + '"]');
      if (el) el.focus();
    }
  }

  function elecCatLabel(id){
    return L('econ.elec.cat.' + id);
  }

  function renderElecCatsInputs(){
    deps.migrateEconOtherElectricity(st().econ);
    const wrap = deps.$('econ-elec-cats-inputs');
    if (!wrap) return;
    let html = '<p class="econ-elec-cats-intro">' + L('econ.elec.catsIntro') + '</p><div class="econ-elec-cats-grid">';
    ECON_ELEC_CAT_IDS.forEach(function(id){
      const c = (st().econ.elecCats && st().econ.elecCats[id]) || { kw: 0, h: 24 };
      const kw = c.kw != null ? c.kw : 0;
      const h = c.h != null ? c.h : 24;
      html += '<div class="econ-elec-cat-card"><div class="econ-elec-cat-title">' + elecCatLabel(id) + '</div>' +
        '<div class="econ-field"><label>' + L('econ.elec.kw') + '</label>' +
        '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="2" data-econ-cat-kw="' + id + '" value="' + deps.formatInputValue(kw, 2) + '"></div>' +
        '<div class="econ-field"><label>' + L('econ.elec.hDay') + '</label>' +
        '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="1" data-econ-cat-h="' + id + '" value="' + deps.formatInputValue(h, 1) + '"></div></div>';
    });
    html += '</div>';
    wrap.innerHTML = html;
  }

  function renderPayrollStaffRow(row){
    const sal = parseFloat(row.salary) || 0;
    const role = row.staffRole === 'overhead' ? 'overhead' : 'field';
    return '<div class="econ-payroll-row econ-payroll-row--staff" data-econ-staff-id="' + row.id + '">' +
      '<input type="text" class="econ-payroll-label-inp" data-econ-staff-label="' + row.id + '" value="' + econEscAttr(row.label || '') + '" placeholder="' + L('econ.staff.role') + '">' +
      '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" data-econ-staff-salary="' + row.id + '" value="' + deps.formatInputValue(sal, 0) + '">' +
      '<select class="econ-payroll-role-sel" data-econ-staff-role="' + row.id + '" title="' + L('econ.staff.roleTypeHint') + '">' +
      '<option value="field"' + (role === 'field' ? ' selected' : '') + '>' + L('econ.staff.roleField') + '</option>' +
      '<option value="overhead"' + (role === 'overhead' ? ' selected' : '') + '>' + L('econ.staff.roleOverhead') + '</option>' +
      '</select>' +
      '<button type="button" class="econ-rm" data-econ-staff-rm="' + row.id + '" title="' + L('econ.btn.remove') + '">×</button></div>';
  }

  function renderPayrollCustomHead(){
    return '<div class="econ-payroll-row econ-payroll-row--head econ-payroll-row--custom">' +
      '<span>' + L('econ.staff.role') + '</span>' +
      '<span>' + moneySym() + '</span>' +
      '<span>' + L('econ.payroll.periodHead') + '</span>' +
      '<span></span></div>';
  }

  function renderPayrollCustomRow(row){
    const amt = parseFloat(row.amount) || 0;
    const period = Math.max(1, parseFloat(row.period) || 1);
    const unit = row.periodUnit === 'day' || row.periodUnit === 'week' ? row.periodUnit : 'month';
    return '<div class="econ-payroll-row econ-payroll-row--custom" data-econ-pc-id="' + row.id + '">' +
      '<input type="text" class="econ-payroll-label-inp" data-econ-pc-label="' + row.id + '" value="' + econEscAttr(row.label || '') + '" placeholder="' + L('econ.payroll.customPh') + '">' +
      '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" data-econ-payroll-custom="' + row.id + '" value="' + deps.formatInputValue(amt, 0) + '">' +
      '<div class="econ-payroll-period">' +
      '<span>' + L('econ.payroll.periodEvery') + '</span>' +
      '<input type="number" class="econ-payroll-period-inp" min="1" step="1" data-econ-pc-period="' + row.id + '" value="' + period + '">' +
      '<select class="econ-payroll-period-unit" data-econ-pc-unit="' + row.id + '">' +
      '<option value="day"' + (unit === 'day' ? ' selected' : '') + '>' + L('econ.payroll.periodDay') + '</option>' +
      '<option value="week"' + (unit === 'week' ? ' selected' : '') + '>' + L('econ.payroll.periodWeek') + '</option>' +
      '<option value="month"' + (unit === 'month' ? ' selected' : '') + '>' + L('econ.payroll.periodMonth') + '</option>' +
      '</select></div>' +
      '<button type="button" class="econ-rm" data-econ-pc-rm="' + row.id + '" title="' + L('econ.btn.remove') + '">×</button></div>';
  }

  function renderPayrollAllocBlock(){
    const mode = payrollAllocMode();
    const split = !!(st().econ && st().econ.payrollSplitEnabled);
    const logFollow = !!(st().econ && st().econ.logisticsFollowPayroll);
    const overheadMode = st().econ && st().econ.payrollOverheadAllocMode === 'area' ? 'area' : 'revenue';
    const opts = [
      ['area', L('econ.payroll.allocArea')],
      ['revenue', L('econ.payroll.allocRevenue')],
      ['labor', L('econ.payroll.allocLabor')],
      ['laborOps', L('econ.payroll.allocLaborOps')]
    ].map(function(pair){
      return '<option value="' + pair[0] + '"' + (mode === pair[0] ? ' selected' : '') + '>' + pair[1] + '</option>';
    }).join('');
    const overheadOpts = [
      ['revenue', L('econ.payroll.overheadRevenue')],
      ['area', L('econ.payroll.overheadArea')]
    ].map(function(pair){
      return '<option value="' + pair[0] + '"' + (overheadMode === pair[0] ? ' selected' : '') + '>' + pair[1] + '</option>';
    }).join('');
    return '<div class="econ-payroll-block"><h4 class="econ-payroll-h4">' + L('econ.payroll.allocMode') + '</h4>' +
      '<div class="econ-grid econ-grid--tight">' +
      '<div class="econ-field econ-field--wide"><label>' + L('econ.payroll.allocVariable') + '</label>' +
      '<select data-econ-payroll-alloc>' + opts + '</select>' +
      '<p class="econ-hint" style="margin:6px 0 0">' + L('econ.payroll.allocHint.' + mode) + '</p></div>' +
      '<div class="econ-field econ-field--wide"><label class="econ-check-label">' +
      '<input type="checkbox" data-econ-payroll-split' + (split ? ' checked' : '') + '> ' + L('econ.payroll.splitEnabled') + '</label>' +
      '<p class="econ-hint" style="margin:4px 0 0">' + L('econ.payroll.splitHint') + '</p></div>' +
      (split
        ? '<div class="econ-field econ-field--wide"><label>' + L('econ.payroll.overheadAlloc') + '</label>' +
          '<select data-econ-payroll-overhead-alloc>' + overheadOpts + '</select>' +
          '<p class="econ-hint" style="margin:6px 0 0">' + L('econ.payroll.overheadAllocHint') + '</p></div>'
        : '') +
      '<div class="econ-field econ-field--wide"><label class="econ-check-label">' +
      '<input type="checkbox" data-econ-logistics-follow' + (logFollow ? ' checked' : '') + '> ' + L('econ.logistics.followPayroll') + '</label>' +
      '<p class="econ-hint" style="margin:4px 0 0">' + L('econ.logistics.followPayrollHint') + '</p></div>' +
      '</div></div>';
  }

  function renderPayrollSection(){
    deps.migrateEconOtherElectricity(st().econ);
    const wrap = deps.$('econ-payroll-body');
    if (!wrap) return;
    const head = '<div class="econ-payroll-row econ-payroll-row--staff econ-payroll-row--head"><span>' + L('econ.staff.role') + '</span><span>' + L('econ.staff.salary') + ', ' + moneySym() + '</span><span>' + L('econ.staff.roleType') + '</span><span></span></div>';
    let staffHtml = head;
    (st().econ.staffLines || []).forEach(function(row){ staffHtml += renderPayrollStaffRow(row); });
    let customHtml = '';
    if ((st().econ.payrollCustom || []).length) customHtml += renderPayrollCustomHead();
    (st().econ.payrollCustom || []).forEach(function(row){ customHtml += renderPayrollCustomRow(row); });
    wrap.innerHTML =
      renderPayrollAllocBlock() +
      '<div class="econ-payroll-block"><h4 class="econ-payroll-h4">' + L('econ.section.staff') + '</h4>' +
      '<div class="econ-payroll-items" id="econ-staff-list">' + staffHtml + '</div>' +
      '<button type="button" class="auto-btn" id="econ-staff-add">+ ' + L('econ.staff.add') + '</button></div>' +
      '<div class="econ-payroll-block"><h4 class="econ-payroll-h4">' + L('econ.section.accounting') + '</h4>' +
      '<div class="econ-grid econ-grid--tight">' + econNumInput('accountingMonth', moneyLabel('econ.accountingMonth', 'econ.perMonth'), { step: 1000 }) + '</div></div>' +
      '<div class="econ-payroll-block"><h4 class="econ-payroll-h4">' + L('econ.section.payrollCustom') + '</h4>' +
      '<div class="econ-payroll-items" id="econ-payroll-custom-list">' + (customHtml || '<p class="econ-hint" style="margin:0">' + L('econ.payroll.customEmpty') + '</p>') + '</div>' +
      '<button type="button" class="auto-btn" id="econ-payroll-custom-add">+ ' + L('econ.payroll.customAdd') + '</button></div>';
  }

  function bindEconomicsInputs(){
    const root = deps.$('view-economics');
    if (!root || root.dataset.econInpBound) return;
    root.dataset.econInpBound = '1';
    root.addEventListener('input', function(e){
      const inp = e.target.closest('[data-econ-key]');
      if (inp){
        const k = inp.dataset.econKey;
        if (k === 'payrollTax') return;
        const v = isMoneyKey(k) ? parseMoney(inp.value) : deps.parseNumInput(inp.value);
        st().econ[k] = isNaN(v) ? 0 : v;
        if (k === 'kwhPerM2Hour' || k === 'lightHoursDay'){
          deps.ensureEconCultures();
          (st().econ.cultures || []).forEach(function(row){
            if (k === 'kwhPerM2Hour') row.kwhPerM2Hour = st().econ[k];
            else row.lightHoursDay = st().econ[k];
          });
        }
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      const catKw = e.target.closest('[data-econ-cat-kw]');
      const catH = e.target.closest('[data-econ-cat-h]');
      const catInp = catKw || catH;
      if (catInp){
        deps.migrateEconOtherElectricity(st().econ);
        const id = catInp.dataset.econCatKw || catInp.dataset.econCatH;
        if (!id || !st().econ.elecCats[id]) return;
        const v = deps.parseNumInput(catInp.value);
        if (catKw) st().econ.elecCats[id].kw = isNaN(v) ? 0 : v;
        else st().econ.elecCats[id].h = isNaN(v) ? 0 : v;
        deps.saveEconStore();
        renderEconomics();
      }
    });
  }

  function bindEconomicsPayroll(){
    const root = deps.$('view-economics');
    if (!root || root.dataset.payrollBound) return;
    root.dataset.payrollBound = '1';
    root.addEventListener('click', function(e){
      if (e.target.id === 'econ-staff-add'){
        deps.migrateEconOtherElectricity(st().econ);
        st().econ.staffLines.push({ id: 'staff_' + Math.random().toString(36).slice(2, 10), label: '', salary: 55000, staffRole: 'field' });
        deps.saveEconStore();
        const list = deps.$('econ-staff-list');
        if (list) list.insertAdjacentHTML('beforeend', renderPayrollStaffRow(st().econ.staffLines[st().econ.staffLines.length - 1]));
        renderEconomics();
        return;
      }
      if (e.target.id === 'econ-payroll-custom-add'){
        deps.migrateEconOtherElectricity(st().econ);
        st().econ.payrollCustom.push({ id: 'pc_' + Math.random().toString(36).slice(2, 10), label: '', amount: 0, period: 1, periodUnit: 'month' });
        deps.saveEconStore();
        const list = deps.$('econ-payroll-custom-list');
        if (list){
          if (!list.querySelector('.econ-payroll-row--head.econ-payroll-row--custom')){
            list.innerHTML = renderPayrollCustomHead();
          }
          list.insertAdjacentHTML('beforeend', renderPayrollCustomRow(st().econ.payrollCustom[st().econ.payrollCustom.length - 1]));
        }
        renderEconomics();
        return;
      }
      const rmStaff = e.target.closest('[data-econ-staff-rm]');
      if (rmStaff){
        const id = rmStaff.dataset.econStaffRm;
        st().econ.staffLines = (st().econ.staffLines || []).filter(function(x){ return x.id !== id; });
        if (!st().econ.staffLines.length) st().econ.staffLines.push({ id: 'staff_' + Math.random().toString(36).slice(2, 10), label: '', salary: 0, staffRole: 'field' });
        deps.saveEconStore();
        const pw = deps.$('econ-payroll-body');
        if (pw) pw.dataset.built = '';
        renderPayrollSection();
        renderEconomics();
        return;
      }
      const rmPc = e.target.closest('[data-econ-pc-rm]');
      if (rmPc){
        const id = rmPc.dataset.econPcRm;
        st().econ.payrollCustom = (st().econ.payrollCustom || []).filter(function(x){ return x.id !== id; });
        deps.saveEconStore();
        const pw2 = deps.$('econ-payroll-body');
        if (pw2) pw2.dataset.built = '';
        renderPayrollSection();
        renderEconomics();
      }
    });
    root.addEventListener('input', function(e){
      const t = e.target;
      const sid = t.dataset.econStaffSalary;
      if (sid){
        const row = (st().econ.staffLines || []).find(function(x){ return x.id === sid; });
        if (row){ row.salary = parseMoney(t.value) || 0; deps.saveEconStore(); renderEconomics(); }
        return;
      }
      const lbl = t.dataset.econStaffLabel;
      if (lbl){
        const row = (st().econ.staffLines || []).find(function(x){ return x.id === lbl; });
        if (row){ row.label = t.value; deps.saveEconStore(); }
        return;
      }
      const cid = t.dataset.econPayrollCustom;
      if (cid){
        const row = (st().econ.payrollCustom || []).find(function(x){ return x.id === cid; });
        if (row){ row.amount = parseMoney(t.value) || 0; deps.saveEconStore(); renderEconomics(); }
        return;
      }
      const pcl = t.dataset.econPcLabel;
      if (pcl){
        const row = (st().econ.payrollCustom || []).find(function(x){ return x.id === pcl; });
        if (row){ row.label = t.value; deps.saveEconStore(); }
        return;
      }
      const pper = t.dataset.econPcPeriod;
      if (pper){
        const row = (st().econ.payrollCustom || []).find(function(x){ return x.id === pper; });
        if (row){ row.period = Math.max(1, parseInt(t.value, 10) || 1); deps.saveEconStore(); renderEconomics(); }
        return;
      }
    });
    root.addEventListener('change', function(e){
      const t = e.target;
      if (t.dataset && t.dataset.econPayrollAlloc != null){
        st().econ.payrollAllocMode = t.value;
        deps.saveEconStore();
        const pw = deps.$('econ-payroll-body');
        if (pw) pw.dataset.built = '';
        renderPayrollSection();
        renderEconomics();
        return;
      }
      const overheadAlloc = t.dataset && t.dataset.econPayrollOverheadAlloc;
      if (overheadAlloc != null){
        st().econ.payrollOverheadAllocMode = t.value;
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      const staffRole = t.dataset && t.dataset.econStaffRole;
      if (staffRole){
        const row = (st().econ.staffLines || []).find(function(x){ return x.id === staffRole; });
        if (row){
          row.staffRole = t.value === 'overhead' ? 'overhead' : 'field';
          deps.saveEconStore();
          renderEconomics();
        }
        return;
      }
      if (t.dataset && t.dataset.econPayrollSplit != null){
        st().econ.payrollSplitEnabled = !!t.checked;
        deps.saveEconStore();
        const pw2 = deps.$('econ-payroll-body');
        if (pw2) pw2.dataset.built = '';
        renderPayrollSection();
        renderEconomics();
        return;
      }
      if (t.dataset && t.dataset.econLogisticsFollow != null){
        st().econ.logisticsFollowPayroll = !!t.checked;
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      const punit = t.dataset && t.dataset.econPcUnit;
      if (!punit) return;
      const row = (st().econ.payrollCustom || []).find(function(x){ return x.id === punit; });
      if (row){
        row.periodUnit = t.value === 'day' || t.value === 'week' ? t.value : 'month';
        deps.saveEconStore();
        renderEconomics();
      }
    });
  }

  function renderElecCharts(farm){
    const el = deps.$('econ-elec-charts');
    if (!el) return;
    const rows = farm.elecBreakdown || [];
    const maxCost = Math.max.apply(null, rows.map(function(r){ return r.cost || 0; }).concat([1]));
    let html = '<div class="econ-elec-chart-card">' +
      '<div class="econ-elec-chart-top">' +
      '<h4 class="econ-elec-chart-title">' + L('econ.elec.chartTitle') + '</h4>' +
      '<div class="econ-elec-bar-cols" aria-hidden="true"><span></span><span></span><span>' + L('econ.tbl.kwh') + '</span><span>' + moneySym() + '</span></div>' +
      '</div><div class="econ-elec-charts">';
    rows.forEach(function(row){
      const pct = maxCost > 0 ? Math.round((row.cost / maxCost) * 100) : 0;
      const lbl = row.id === 'light' ? L('econ.elec.cat.light') : elecCatLabel(row.id);
      const sub = row.kw != null ? tFmt('econ.elec.catSub', { kw: deps.r1(row.kw), h: deps.r1(row.h) }) : L('econ.elec.catLightSub');
      const zero = !(row.cost > 0);
      html += '<div class="econ-elec-bar-row' + (zero ? ' econ-elec-bar-row--zero' : '') + '">' +
        '<span class="econ-elec-bar-label">' + lbl + '<span class="econ-elec-bar-sub">' + sub + '</span></span>' +
        '<div class="econ-elec-bar-track"><div class="econ-elec-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="econ-elec-bar-kwh">' + deps.fmtNum(row.kwh || 0) + '</span>' +
        '<span class="econ-elec-bar-cost">' + moneyFmt(row.cost) + '</span></div>';
    });
    html += '</div></div>';
    el.innerHTML = html;
  }

  function bindEconomicsEquipment(){
    const root = deps.$('view-economics');
    if (!root || root.dataset.eqBound) return;
    root.dataset.eqBound = '1';
    const enabledChk = deps.$('econ-equipment-enabled');
    if (enabledChk){
      enabledChk.addEventListener('change', () => {
        st().econ.equipmentEnabled = enabledChk.checked;
        deps.saveEconStore();
        syncEconEquipmentPanel();
        updateEconEquipmentTotal();
        renderEconomics();
      });
    }
    root.addEventListener('click', e => {
      if (e.target.closest('[data-econ-runway-sync]')){
        syncRunwayFromCalc();
        renderEconomicsEquipment();
        renderEconomics();
        return;
      }
      if (e.target.closest('#econ-equipment-add-custom')){
        deps.ensureEconEquipment();
        st().econ.equipmentCustom.push({ id: 'eqc_' + Date.now(), label: L('econ.equip.newItem'), amount: 0 });
        deps.saveEconStore();
        renderEconomicsEquipment();
        renderEconomics();
        return;
      }
      const rm = e.target.closest('[data-econ-custom-rm]');
      if (rm){
        deps.ensureEconEquipment();
        st().econ.equipmentCustom = st().econ.equipmentCustom.filter(x => x.id !== rm.dataset.econCustomRm);
        deps.saveEconStore();
        renderEconomicsEquipment();
        renderEconomics();
      }
    });
    root.addEventListener('input', e => {
      const t = e.target;
      const lblId = t.dataset.econCustomLabel;
      if (lblId){
        deps.ensureEconEquipment();
        const it = st().econ.equipmentCustom.find(x => x.id === lblId);
        if (it){ it.label = t.value; deps.saveEconStore(); }
        return;
      }
      const amtId = t.dataset.econCustomAmount;
      if (amtId){
        deps.ensureEconEquipment();
        const it = st().econ.equipmentCustom.find(x => x.id === amtId);
        if (it){ it.amount = parseMoney(t.value) || 0; deps.saveEconStore(); updateEconEquipmentTotal(); renderEconomics(); }
        return;
      }
      const runwayMoInp = t.dataset.econStartupRunwayMonths;
      if (runwayMoInp != null){
        deps.ensureEconEquipment();
        st().econ.startupRunwayMonths = Math.max(1, deps.parseNumInput(t.value) || 1);
        ensureRunwayElecRampState();
        deps.saveEconStore();
        renderEconomicsEquipment();
        updateEconEquipLineTotals();
        updateEconEquipmentTotal();
        renderEconomics();
        return;
      }
      const rampIdx = t.dataset.econRunwayElecRamp;
      if (rampIdx != null){
        deps.ensureEconEquipment();
        ensureRunwayElecRampState();
        const i = parseInt(rampIdx, 10);
        if (i >= 0 && st().econ.startupRunwayElecRamp[i] != null){
          st().econ.startupRunwayElecRamp[i] = Math.max(0, deps.parseNumInput(t.value) || 0);
          deps.saveEconStore();
          updateEconEquipLineTotals();
          updateEconEquipmentTotal();
          renderEconomics();
        }
        return;
      }
      const eqMo = t.dataset.econEqMonths;
      if (eqMo){
        deps.ensureEconEquipment();
        if (!st().econ.equipmentMonths) st().econ.equipmentMonths = {};
        st().econ.equipmentMonths[eqMo] = Math.max(1, deps.parseNumInput(t.value) || 1);
        deps.saveEconStore();
        updateEconEquipLineTotals();
        updateEconEquipmentTotal();
        renderEconomics();
        return;
      }
      const eq = t.dataset.econEq;
      if (eq){
        deps.ensureEconEquipment();
        st().econ.equipment[eq] = parseMoney(t.value) || 0;
        deps.saveEconStore();
        updateEconEquipLineTotals();
        updateEconEquipmentTotal();
        renderEconomics();
      }
    });
  }

  function ensureEconSubPanels(ft){
    const elecWrap = deps.$('econ-elec-cats-inputs');
    const payWrap = deps.$('econ-payroll-body');
    if (elecWrap && elecWrap.dataset.built !== ft){
      elecWrap.dataset.built = ft;
      renderElecCatsInputs();
    }
    if (payWrap && payWrap.dataset.built !== ft){
      payWrap.dataset.built = ft;
      renderPayrollSection();
    }
  }

  function renderEconomicsForm(){
    const gen = deps.$('econ-inputs-general');
    var ft = formToken();
    const genToken = ft + '-farm-v6';
    if (!gen){
      ensureEconSubPanels(ft);
      return;
    }
    if (gen.dataset.built === genToken){
      syncEconCalcOpts();
      ensureEconSubPanels(ft);
      return;
    }
    gen.dataset.built = genToken;
    gen.innerHTML =
      econNumInput('priceKwh', moneyLabel('econ.priceKwh', 'econ.perKwh'), { step: 0.1 }) +
      econNumInput('rentMonth', moneyLabel('econ.rentMonth', 'econ.perMonth'), { step: 1000 }) +
      '<div class="econ-calc-opt" id="econ-payroll-opt">' +
      econToggleHtml('econ-payroll-tax', L('econ.payrollTax'), st().econ.payrollTax) +
      '<div class="econ-calc-opt-fields">' +
      econNumInput('payrollTaxPct', L('econ.payrollTaxPct'), { step: 0.1, hint: L('econ.payrollTaxPct.hint') }) +
      econNumInput('payrollStaffCostPct', L('econ.payrollStaffCostPct'), { step: 0.1, hint: L('econ.payrollStaffCostPct.hint') }) +
      '</div></div>' +
      econNumInput('salePrice', L('econ.salePrice'), { step: 1, hint: L('econ.salePrice.hint') }) +
      econNumInput('logisticsMonth', moneyLabel('econ.logisticsMonth', 'econ.perMonth'), { step: 1000 }) +
      '<div class="econ-calc-opt" id="econ-water-opt">' +
      econToggleHtml('econ-water-enabled', L('econ.waterInCalc'), st().econ.waterEnabled !== false) +
      '<p class="econ-calc-opt-hint" id="econ-water-off-hint" hidden></p>' +
      '<div class="econ-calc-opt-fields" id="econ-water-fields">' +
      econNumInput('waterM3Month', L('econ.waterM3Month'), { step: 0.1, decimals: 1, hint: L('econ.waterM3Month.hint') }) +
      econNumInput('waterPriceM3', moneyLabel('econ.waterPriceM3', 'econ.perM3'), { step: 1, hint: L('econ.waterPriceM3.hint') }) +
      econNumInput('waterFertPerM3', moneyLabel('econ.waterFertPerM3', 'econ.perM3'), { step: 1, hint: L('econ.waterFertPerM3.hint') }) +
      '</div></div>' +
      econNumInput('floorArea', L('econ.floorArea'), { step: 1 }) +
      econNumInput('plantingArea', L('econ.plantingArea'), { step: 1 }) +
      '<div class="econ-calc-opt" id="econ-waste-opt">' +
      econToggleHtml('econ-waste-enabled', L('econ.wasteInCalc'), st().econ.wasteEnabled !== false) +
      '<p class="econ-calc-opt-hint" id="econ-waste-off-hint" hidden></p>' +
      '<div class="econ-calc-opt-fields" id="econ-waste-fields">' +
      econNumInput('wastePct', L('econ.wastePct'), { step: 1, hint: L('econ.wastePct.hint') }) +
      '</div></div>' +
      econNumInput('kwhPerM2Hour', L('econ.kwhPerM2Hour'), { step: 0.001, hint: L('econ.kwhPerM2Hour.hint') }) +
      econNumInput('lightHoursDay', L('econ.lightHoursDay'), { step: 0.5, hint: L('econ.lightHoursDay.hint') }) +
      econNumInput('amortMonths', L('econ.amortMonths'), { step: 1 });

    const costs = deps.$('econ-inputs-costs');
    const costsToken = ft + '-tax-v3';
    if (costs && costs.dataset.built !== costsToken){
      costs.dataset.built = costsToken;
      costs.innerHTML =
      econNumInput('otherMonth', moneyLabel('econ.otherMonth', 'econ.perMonth'), { step: 1000, hint: L('econ.otherMonth.hint') }) +
      econNumInput('consumablesPerKg', L('econ.consumablesPerKg'), { step: 0.1, hint: L('econ.consumablesPerKg.hint') }) +
      econNumInput('consumablesPerPcs', L('econ.consumablesPerPcs'), { step: 0.1, hint: L('econ.consumablesPerPcs.hint') }) +
      econTaxBlockHtml();
    }

    ensureEconSubPanels(ft);

    const waterEn = deps.$('econ-water-enabled');
    if (waterEn){
      waterEn.addEventListener('change', () => {
        st().econ.waterEnabled = waterEn.checked;
        deps.saveEconStore();
        syncEconCalcOpts();
        renderEconomics();
      });
    }
    const wasteEn = deps.$('econ-waste-enabled');
    if (wasteEn){
      wasteEn.addEventListener('change', () => {
        st().econ.wasteEnabled = wasteEn.checked;
        deps.saveEconStore();
        syncEconCalcOpts();
        renderEconomics();
      });
    }
    syncEconCalcOpts();
    const tax = deps.$('econ-payroll-tax');
    if (tax){
      tax.addEventListener('change', () => {
        st().econ.payrollTax = tax.checked;
        deps.saveEconStore();
        syncEconCalcOpts();
        renderEconomics();
      });
    }
    const usn = deps.$('econ-usn-tax');
    if (usn){
      usn.addEventListener('change', () => {
        st().econ.usnTax = usn.checked;
        deps.saveEconStore();
        renderEconomics();
      });
    }
    const vat = deps.$('econ-vat-tax');
    if (vat){
      vat.addEventListener('change', () => {
        st().econ.vatTax = vat.checked;
        deps.saveEconStore();
        renderEconomics();
      });
    }
    const vatInc = deps.$('econ-vat-inclusive');
    if (vatInc){
      vatInc.addEventListener('change', () => {
        st().econ.vatInclusive = vatInc.checked;
        deps.saveEconStore();
        renderEconomics();
      });
    }
    const profit = deps.$('econ-profit-tax');
    if (profit){
      profit.addEventListener('change', () => {
        st().econ.profitTax = profit.checked;
        deps.saveEconStore();
        renderEconomics();
      });
    }
    renderEconomicsEquipment();
    bindEconomicsInputs();
    bindEconomicsPayroll();
    bindEconomicsEquipment();
    bindEconomicsCultures();
    initEconFmtInputs();
  }

  function isConsPotPartField(f){
    return f === 'consPotSeeds' || f === 'consPotVermiculite' || f === 'consPotPot' || f === 'consPotRockwool';
  }

  function applyCultFieldValue(i, field, rawVal){
    deps.ensureEconCultures();
    if (field === 'yieldInputMode'){
      st().econ.cultures[i][field] = String(rawVal || '');
      return;
    }
    const v = isMoneyCult(field) || isConsPotPartField(field) ? parseMoney(rawVal) : deps.parseNumInput(rawVal);
    st().econ.cultures[i][field] = isNaN(v) ? 0 : v;
    if (isConsPotPartField(field) && deps.syncConsPotPartsTotal){
      deps.syncConsPotPartsTotal(st().econ.cultures[i]);
    }
  }

  function econCultParamInput(i, field, label, opts){
    opts = opts || {};
    const row = deps.normalizeEconCultureRow(st().econ.cultures[i]);
    const yUnit = field === 'yieldPerCut' ? (row.unitIsPieces ? uPcs() : uG()) : '';
    const dec = opts.decimals != null ? opts.decimals : deps.decimalsFromStep(opts.step || 1);
    const v = row[field] != null ? row[field] : '';
    const disp = v === '' ? '' : (isMoneyCult(field) || isConsPotPartField(field) ? fmtMoneyInp(v, dec) : deps.formatInputValue(v, dec));
    const ph = opts.placeholder ? ' placeholder="' + opts.placeholder + '"' : '';
    const title = opts.title ? ' title="' + opts.title + '"' : '';
    return '<div class="econ-field econ-culture-param"><label>' + label + (yUnit ? ' (' + yUnit + ')' : '') + '</label>' +
      '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="' + dec + '" data-econ-cult-field="' + field + '" data-econ-cult-idx="' + i + '" value="' + disp + '"' + ph + title + '></div>';
  }

  function econCultConsPotFieldHtml(i, norm, cv, consLbl, consPh){
    const saladPot = deps.econSaladPotConsumablesMode && cv && deps.econSaladPotConsumablesMode(cv);
    const consTitle = (cv && cv.econLotSale && cv.econLotSalePot) ? L('econ.cult.consPot.lotHint') : consLbl;
    if (!saladPot){
      return econCultParamInput(i, 'consumablesPerPot', consLbl + ', ' + moneySym(), {
        step: 0.5, decimals: 1, placeholder: consPh, title: consTitle
      });
    }
    if (!norm.consPotBreakdown){
      return '<div class="econ-culture-cons-simple">' +
        econCultParamInput(i, 'consumablesPerPot', consLbl + ', ' + moneySym(), {
          step: 0.1, decimals: 1, placeholder: consPh, title: consTitle
        }) +
        '<button type="button" class="econ-link-btn econ-cons-breakdown-toggle" data-econ-cult-breakdown="' + i + '" data-econ-cult-breakdown-on="1">' + L('econ.cult.consPot.expand') + '</button>' +
        '</div>';
    }
    const parts = [
      ['consPotSeeds', L('econ.cult.consPot.seeds')],
      ['consPotVermiculite', L('econ.cult.consPot.vermiculite')],
      ['consPotPot', L('econ.cult.consPot.pot')],
      ['consPotRockwool', L('econ.cult.consPot.rockwool')]
    ];
    const total = deps.sumConsPotParts ? deps.sumConsPotParts(norm) : 0;
    const totalDisp = total > 0 ? total : norm.consumablesPerPot;
    return '<div class="econ-culture-cons-breakdown">' +
      '<div class="econ-culture-cons-breakdown-head">' +
      '<span class="econ-cons-breakdown-title">' + consLbl + ', ' + moneySym() + '</span>' +
      '<button type="button" class="econ-link-btn econ-cons-breakdown-toggle" data-econ-cult-breakdown="' + i + '" data-econ-cult-breakdown-on="0">' + L('econ.cult.consPot.collapse') + '</button>' +
      '</div>' +
      '<div class="econ-cons-breakdown-grid">' + parts.map(function(p){
        return econCultParamInput(i, p[0], p[1], { step: 0.1, decimals: 1 });
      }).join('') + '</div>' +
      '<p class="econ-cons-breakdown-total">' + L('econ.cult.consPot.total') + ': <strong data-econ-cons-total="' + i + '">' + fmtMoneyInp(totalDisp, 1) + ' ' + moneySym() + '</strong></p>' +
      '</div>';
  }

  function econAreaMode(){
    return deps.econGetAreaMode ? deps.econGetAreaMode(st().econ) : 'pct';
  }

  function plantingAreaVal(){
    return Math.max(0, parseFloat(st().econ.plantingArea) || 0);
  }

  function renderEconAreaModeBar(){
    const wrap = deps.$('econ-area-mode-wrap');
    if (!wrap) return;
    const mode = econAreaMode();
    wrap.innerHTML =
      '<p class="econ-area-mode-label">' + L('econ.areaMode.label') + '</p>' +
      '<div class="econ-area-mode-bar" role="group" aria-label="' + L('econ.areaMode.aria') + '">' +
      '<button type="button" class="econ-area-mode-btn' + (mode === 'pct' ? ' on' : '') + '" data-econ-area-mode="pct">' + L('econ.areaMode.pct') + '</button>' +
      '<button type="button" class="econ-area-mode-btn' + (mode === 'sqm' ? ' on' : '') + '" data-econ-area-mode="sqm">' + L('econ.areaMode.sqm') + '</button>' +
      '</div>';
  }

  function updateCulturesTotalLine(totalEl){
    if (!totalEl) return;
    const mode = econAreaMode();
    const pa = plantingAreaVal();
    let cls = 'ok';
    let msg = '';
    if (mode === 'sqm'){
      const total = deps.econCulturesTotalSqm ? deps.econCulturesTotalSqm(pa) : 0;
      msg = '<strong>' + tFmt('econ.area.sum', { total: deps.r1(total), planting: deps.r1(pa) }) + '</strong>';
      if (total > pa && pa > 0){ cls = 'bad'; msg += L('econ.area.over'); }
      else if (total > 0 && total < pa){ cls = 'warn'; msg += tFmt('econ.area.free', { free: deps.r1(pa - total) }); }
    } else {
      const total = deps.econCulturesTotalPct();
      msg = '<strong>' + tFmt('econ.share.sum', { total: deps.r1(total) }) + '</strong>';
      if (total > 100){ cls = 'bad'; msg += L('econ.share.over'); }
      else if (total < 100){ cls = 'warn'; msg += tFmt('econ.share.free', { free: deps.r1(100 - total) }); }
    }
    totalEl.className = 'econ-cultures-total ' + cls;
    totalEl.innerHTML = msg + tFmt('econ.rows', { n: st().econ.cultures.length, max: ECON_MAX_CULTURES });
  }

  function renderEconomicsCultures(){
    deps.ensureEconCultures();
    deps.migrateEconCultureRows();
    deps.dedupeEconCultures();
    if (!st().econ.areaMode) st().econ.areaMode = 'pct';
    renderEconAreaModeBar();
    const list = deps.$('econ-cultures-list');
    const totalEl = deps.$('econ-cultures-total');
    if (!list) return;
    const mode = econAreaMode();
    const pa = plantingAreaVal();

    let html = '';
    st().econ.cultures.forEach((row, i) => {
      let norm = deps.normalizeEconCultureRow(row);
      if (deps.syncEconCultureAreaFields) norm = deps.syncEconCultureAreaFields(norm, pa, { areaMode: mode });
      st().econ.cultures[i] = norm;
      const pct = norm.pct != null ? norm.pct : 0;
      const areaSqm = norm.areaSqm != null ? norm.areaSqm : 0;
      const sp = norm.salePrice > 0 ? norm.salePrice : '';
      const bio = deps.econCultureBio(norm);
      const cv = typeof deps.findCvById === 'function' ? deps.findCvById(norm.cvId) : null;
      const isLot = !!(cv && cv.econLotSale);
      const lotPot = !!(cv && cv.econLotSalePot);
      const extraKind = econExtraKind(norm.cvId);
      const densityLbl = extraKind === 'berry'
        ? L('econ.cult.densityBush')
        : (extraKind === 'vegetables' ? L('econ.cult.densityPlant') : L('econ.cult.density'));
      const yieldLbl = (extraKind && !isLot)
        ? L('econ.cult.yieldCut')
        : (isLot ? L('econ.cult.yieldCycle') : (norm.unitIsPieces ? L('econ.cult.yieldPcs') : L('econ.cult.yield')));
      const yieldHint = isLot ? L('econ.cult.yieldCycleHint') : L('econ.cult.yieldHint');
      const consLbl = (extraKind === 'berry' || extraKind === 'vegetables')
        ? L('econ.cult.consSeedling')
        : (isLot ? (lotPot ? L('econ.cult.consPot') : L('econ.cult.consTray')) : L('econ.cult.consPot'));
      const consPh = isLot ? '10' : String(ECON_CONSUMABLES_PER_POT_HINT);
      const showPlantYield = extraKind === 'berry' || extraKind === 'vegetables';
      const plantYieldLabel = extraKind === 'berry' ? L('econ.cult.yieldBushMonth') : L('econ.cult.yieldPlantMonth');
      const yieldMode = showPlantYield ? econYieldInputMode(norm, extraKind) : 'cutMonth';
      const showYieldByPlant = showPlantYield && yieldMode === 'plantMonth';
      const showYieldBySqm = showPlantYield && yieldMode === 'sqmMonth';
      const showYieldByCuts = showPlantYield && yieldMode === 'cutMonth';
      const showClassicYieldControls = !showPlantYield || showYieldByCuts;
      const replaceLabel = (extraKind === 'berry' || extraKind === 'vegetables')
        ? L('econ.cult.seedlingLifeMonths')
        : L('econ.cult.potLife');
      const searchQ = String(norm.cvSearch || '');
      html += '<div class="econ-culture-card" data-econ-culture-idx="' + i + '">' +
        '<div class="econ-culture-head">' +
        '<div class="econ-field econ-field--culture-main"><label>' + L('econ.cult.culture') + '</label><select data-econ-culture-cv="' + i + '">' + getEconCultureOptionsHtml(norm.cvId || '', i, searchQ) + '</select></div>' +
        '<div class="econ-field econ-field--culture-search"><label>' + L('econ.cult.search') + '</label><input type="search" autocomplete="off" spellcheck="false" data-econ-culture-search="' + i + '" value="' + econEscAttr(searchQ) + '" placeholder="' + econEscAttr(L('econ.cult.searchPh')) + '"></div>' +
        (mode === 'sqm'
          ? '<div class="econ-field econ-field--culture-share"><label>' + L('econ.cult.areaSqm') + '</label><input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="1" data-econ-culture-sqm="' + i + '" value="' + deps.formatInputValue(areaSqm, 1) + '"></div>'
          : '<div class="econ-field econ-field--culture-share"><label>' + L('econ.cult.share') + '</label><input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="1" data-econ-culture-pct="' + i + '" value="' + deps.formatInputValue(pct, 1) + '"></div>') +
        '<div class="econ-field econ-field--culture-price"><label>' + L('econ.cult.price') + ', ' + moneySym() + '</label><input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" placeholder="—" data-econ-culture-price="' + i + '" value="' + (sp ? fmtMoneyInp(sp, 0) : '') + '"></div>' +
        '<button type="button" class="econ-rm" data-econ-culture-rm="' + i + '" title="' + L('econ.btn.remove') + '" aria-label="' + L('econ.btn.remove') + '">×</button>' +
        '</div>' +
        '<div class="econ-culture-params">' +
        econCultParamInput(i, 'density', densityLbl, showPlantYield ? { step: 0.1, decimals: 1 } : { step: 1 }) +
        (showPlantYield ? econYieldModeSelectInput(i, yieldMode, plantYieldLabel) : '') +
        (showYieldByPlant ? econCultParamInput(i, 'yieldPerPlantMonth', plantYieldLabel, { step: 0.01, decimals: 2 }) : '') +
        (showYieldBySqm ? econCultParamInput(i, 'yieldPerSqmMonthManual', L('econ.cult.yieldSqmMonth'), { step: 0.01, decimals: 2 }) : '') +
        (showYieldByCuts ? econCultParamInput(i, 'cutsPerMonthManual', L('econ.cult.cutsMonth'), { step: 0.1, decimals: 1 }) : '') +
        (showClassicYieldControls ? econCultParamInput(i, 'yieldPerCut', yieldLbl, { step: isLot ? 1 : 0.1, decimals: isLot ? 0 : null, title: yieldHint }) : '') +
        (showClassicYieldControls ? econCultParamInput(i, 'cutIntervalDays', L('econ.cult.interval'), { step: 1, min: 1 }) : '') +
        econCultParamInput(i, 'kwhPerM2Hour', L('econ.cult.lightKwh'), { step: 0.001 }) +
        econCultParamInput(i, 'lightHoursDay', L('econ.cult.lightH'), { step: 0.5 }) +
        econCultConsPotFieldHtml(i, norm, cv, consLbl, consPh) +
        (isLot ? '' : econCultParamInput(i, 'potHarvestMonths', replaceLabel, { step: 0.5, decimals: 1 })) +
        econCultParamInput(i, 'laborCoeff', L('econ.cult.laborCoeff'), { step: 0.1, decimals: 1, min: 0.1, title: L('econ.cult.laborCoeffHint') }) +
        econCultParamInput(i, 'laborSecPerUnit', L('econ.cult.laborSecPerUnit'), { step: 0.5, decimals: 1, min: 0, title: L('econ.cult.laborSecPerUnitHint') }) +
        '</div>' +
        '<p class="econ-culture-hint">' + deps.formatEconCultureHint(norm) + '</p>' +
        '</div>';
    });
    list.innerHTML = html;
    updateCulturesTotalLine(totalEl);
    const addBtn = deps.$('econ-add-culture');
    if (addBtn){
      addBtn.disabled = !deps.canAddEconCulture();
      addBtn.title = addBtn.disabled ? tFmt('econ.add.max', { max: ECON_MAX_CULTURES }) : L('econ.add.row');
    }
  }

  function bindEconomicsAreaMode(){
    const wrap = deps.$('econ-area-mode-wrap');
    if (!wrap || wrap.dataset.econAreaModeBound) return;
    wrap.dataset.econAreaModeBound = '1';
    wrap.addEventListener('click', function(e){
      const btn = e.target.closest('[data-econ-area-mode]');
      if (!btn || !deps.setEconAreaMode) return;
      deps.setEconAreaMode(btn.dataset.econAreaMode);
      deps.saveEconStore();
      renderEconomics();
    });
  }

  function bindEconomicsCultures(){
    bindEconomicsAreaMode();
    const list = deps.$('econ-cultures-list');
    if (!list || list.dataset.econCulturesBound) return;
    list.dataset.econCulturesBound = '1';

    list.addEventListener('click', e => {
      const bdBtn = e.target.closest('[data-econ-cult-breakdown]');
      if (bdBtn){
        const iBd = parseInt(bdBtn.dataset.econCultBreakdown, 10);
        deps.ensureEconCultures();
        if (!st().econ.cultures[iBd]) return;
        st().econ.cultures[iBd].consPotBreakdown = bdBtn.dataset.econCultBreakdownOn === '1';
        deps.saveEconStore();
        renderEconomics();
        return;
      }
    });

    list.addEventListener('change', e => {
      const cvSel = e.target.dataset.econCultureCv;
      const pctInp = e.target.dataset.econCulturePct;
      const sqmInp = e.target.dataset.econCultureSqm;
      const priceInp = e.target.dataset.econCulturePrice;
      const mixIncl = e.target.dataset.econMixIncl;
      const mixPctRow = e.target.dataset.econMixPctRow;
      if (cvSel != null){
        const i = parseInt(cvSel, 10);
        deps.ensureEconCultures();
        const newId = e.target.value;
        if (newId && isEconCvIdTaken(newId, i)){
          e.target.value = st().econ.cultures[i].cvId || '';
          renderEconomics();
          return;
        }
        const keptPct = st().econ.cultures[i].pct;
        const keptPrice = st().econ.cultures[i].salePrice;
        st().econ.cultures[i] = deps.econApplyCultureSelect(st().econ.cultures[i], newId, keptPct, keptPrice);
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      if (mixIncl != null){
        const iMix = parseInt(mixIncl, 10);
        deps.ensureEconCultures();
        if (!st().econ.cultures[iMix]) return;
        st().econ.cultures[iMix].mixInMix = !!e.target.checked;
        if (!st().econ.cultures[iMix].mixInMix) st().econ.cultures[iMix].mixPct = 0;
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      if (mixPctRow != null){
        const iMixPct = parseInt(mixPctRow, 10);
        deps.ensureEconCultures();
        if (!st().econ.cultures[iMixPct]) return;
        st().econ.cultures[iMixPct].mixPct = deps.clamp(deps.parseNumInput(e.target.value) || 0, 0, 100);
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      const cultField = e.target.dataset.econCultField;
      if (cultField != null){
        const i = parseInt(e.target.dataset.econCultIdx, 10);
        applyCultFieldValue(i, cultField, e.target.value);
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      if (pctInp != null){
        const i = parseInt(pctInp, 10);
        deps.ensureEconCultures();
        st().econ.cultures[i].pct = deps.clamp(deps.parseNumInput(e.target.value) || 0, 0, 100);
        if (deps.syncEconCultureAreaFields) {
          st().econ.cultures[i] = deps.syncEconCultureAreaFields(st().econ.cultures[i], plantingAreaVal(), { areaMode: 'pct' });
        }
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      if (sqmInp != null){
        const iSqm = parseInt(sqmInp, 10);
        deps.ensureEconCultures();
        st().econ.cultures[iSqm].areaSqm = Math.max(0, deps.parseNumInput(e.target.value) || 0);
        if (deps.syncEconCultureAreaFields) {
          st().econ.cultures[iSqm] = deps.syncEconCultureAreaFields(st().econ.cultures[iSqm], plantingAreaVal(), { areaMode: 'sqm' });
        }
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      if (priceInp != null){
        const i = parseInt(priceInp, 10);
        deps.ensureEconCultures();
        st().econ.cultures[i].salePrice = parseMoney(e.target.value) || 0;
        deps.saveEconStore();
        renderEconomics();
      }
    });

    list.addEventListener('input', e => {
      if (e.target.dataset.econCultureSearch != null){
        const iSearch = parseInt(e.target.dataset.econCultureSearch, 10);
        if (!isFinite(iSearch)) return;
        deps.ensureEconCultures();
        if (!st().econ.cultures[iSearch]) return;
        const q = String(e.target.value || '');
        st().econ.cultures[iSearch].cvSearch = q;
        const card = e.target.closest('.econ-culture-card');
        const sel = card && card.querySelector('[data-econ-culture-cv="' + iSearch + '"]');
        if (sel){
          sel.innerHTML = getEconCultureOptionsHtml(st().econ.cultures[iSearch].cvId || '', iSearch, q);
        }
        deps.saveEconStore();
        return;
      }
      const cultField = e.target.dataset.econCultField;
      if (cultField != null){
        const i = parseInt(e.target.dataset.econCultIdx, 10);
        applyCultFieldValue(i, cultField, e.target.value);
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      if (e.target.dataset.econMixPctRow != null){
        const iMixInp = parseInt(e.target.dataset.econMixPctRow, 10);
        if (!isFinite(iMixInp)) return;
        deps.ensureEconCultures();
        if (!st().econ.cultures[iMixInp]) return;
        st().econ.cultures[iMixInp].mixPct = deps.parseNumInput(e.target.value);
        deps.saveEconStore();
        renderEconomics();
        return;
      }
      if (e.target.dataset.econCultureSqm != null){
        const iSqmInp = parseInt(e.target.dataset.econCultureSqm, 10);
        deps.ensureEconCultures();
        st().econ.cultures[iSqmInp].areaSqm = Math.max(0, deps.parseNumInput(e.target.value) || 0);
        if (deps.syncEconCultureAreaFields) {
          st().econ.cultures[iSqmInp] = deps.syncEconCultureAreaFields(st().econ.cultures[iSqmInp], plantingAreaVal(), { areaMode: 'sqm' });
        }
        deps.saveEconStore();
        updateCulturesTotalLine(deps.$('econ-cultures-total'));
        return;
      }
      if (e.target.dataset.econCulturePct == null && e.target.dataset.econCulturePrice == null) return;
      const i = parseInt(e.target.dataset.econCulturePct != null ? e.target.dataset.econCulturePct : e.target.dataset.econCulturePrice, 10);
      deps.ensureEconCultures();
      if (e.target.dataset.econCulturePct != null){
        st().econ.cultures[i].pct = deps.parseNumInput(e.target.value) || 0;
        if (deps.syncEconCultureAreaFields) {
          st().econ.cultures[i] = deps.syncEconCultureAreaFields(st().econ.cultures[i], plantingAreaVal(), { areaMode: 'pct' });
        }
      } else {
        st().econ.cultures[i].salePrice = parseMoney(e.target.value) || 0;
      }
      deps.saveEconStore();
      updateCulturesTotalLine(deps.$('econ-cultures-total'));
    });

    list.addEventListener('click', e => {
      const btn = e.target.closest('[data-econ-culture-rm]');
      if (!btn) return;
      const i = parseInt(btn.dataset.econCultureRm, 10);
      deps.ensureEconCultures();
      if (st().econ.cultures.length <= 1) return;
      st().econ.cultures.splice(i, 1);
      deps.saveEconStore();
      renderEconomics();
    });
  }

  function syncEconInputsFromState(){
    refreshFmtDisplayAll();
  }

  function syncEconFromPlanting(){
    var meta = deps.importAllEconFromPlanting();
    return meta && meta.snap ? meta.snap : deps.getPlantingSnapshot();
  }

  function econSnapDerivedHtml(snap){
    const yLabel = snap.unitIsPieces ? L('econ.yield.pcsSqm') : L('econ.yield.kgSqm');
    const yVal = snap.unitIsPieces ? deps.r1(snap.yieldPerSqmMonthPcs) : deps.r2(snap.yieldPerSqmMonthKg);
    const mixNote = snap.isMix ? ' <span style="font-weight:400;color:var(--ink-faint)">' + tFmt('econ.snap.mixAvg', { n: snap.mixCount || ECON_SALAD_MIX_CV_IDS.length }) + '</span>' : '';
    const perPotLbl = snap.multicutHarvest ? L('econ.snap.cutMass') : L('econ.snap.yieldPot');
    const cycleLbl = snap.multicutHarvest ? L('econ.snap.cycleFirst') : L('econ.snap.cycleGrow');
    let extra = '';
    if (snap.multicutHarvest && snap.harvestCutIntervalDays > 0){
      extra = '<dt>' + L('econ.snap.cutInt') + '</dt><dd>' + tFmt('econ.snap.cutRow', { days: snap.harvestCutIntervalDays, cuts: deps.r1(snap.harvestCutsPerMonth) }) + '</dd>';
    }
    return '<dl>' +
      '<dt>' + L('econ.snap.culture') + '</dt><dd>' + snap.cvName + mixNote + '</dd>' +
      '<dt>' + L('econ.snap.pots') + '</dt><dd>' + deps.round(snap.rhoA) + ' ' + uPcs() + '</dd>' +
      '<dt>' + cycleLbl + '</dt><dd>' + snap.totalCycleDays + ' ' + L('econ.unit.days') + '</dd>' +
      extra +
      '<dt>' + perPotLbl + '</dt><dd>' + deps.r1(snap.yieldPerPotCycle) + ' ' + snap.yieldUnit + '</dd>' +
      '<dt>' + L('econ.snap.yieldPotMo') + '</dt><dd>' + deps.r1(snap.yieldPerPotMonth) + ' ' + snap.yieldUnit + '</dd>' +
      '<dt>' + L('econ.snap.yield') + '</dt><dd>' + yVal + ' ' + yLabel + '</dd>' +
      '<dt>' + L('econ.snap.light') + '</dt><dd>' + deps.r3(snap.kwhPerM2Hour) + ' ' + L('econ.cult.lightKwh') + ' · ' + deps.r1(snap.lightHoursDay) + ' ' + L('econ.unit.hPerDay') + '</dd>' +
      '</dl>';
  }

  function econCultureRowName(cvId){
    if (!cvId) return '—';
    if (typeof deps.econCvDisplayName === 'function') return deps.econCvDisplayName(cvId);
    const customVf = st().customVfCultivars || [];
    const customGh = st().customGhCultivars || [];
    const all = VF_CULTIVARS.concat(customVf, CULTIVARS, customGh, PALLET_CULTIVARS);
    const cv = all.find(function(c){ return c.id === cvId; });
    return cv ? cv.name : cvId;
  }

  function buildEconDerivedRows(){
    deps.ensureEconCultures();
    const rows = [];
    st().econ.cultures.forEach(function(row){
      const norm = deps.normalizeEconCultureRow(row);
      if (!norm.cvId) return;
      rows.push({
        name: econCultureRowName(norm.cvId),
        bio: deps.econCultureBio(norm)
      });
    });
    return rows;
  }

  function renderEconDerivedPanel(){
    const derived = deps.$('econ-derived-panel');
    if (!derived) return;
    const parts = buildEconDerivedRows();
    if (parts.length){
      let tbl = '<table class="econ-breakdown econ-breakdown--yield"><tr><th>' + L('econ.derived.th') + '</th><th>' + L('econ.derived.rho') + '</th><th>' + L('econ.derived.cut') + '</th><th>' + L('econ.derived.interval') + '</th><th>' + L('econ.derived.cutsMo') + '</th><th>' + L('econ.derived.yield') + '</th><th>' + L('econ.derived.kwh') + '</th><th>' + L('econ.derived.lightH') + '</th></tr>';
      parts.forEach(function(p){
        const b = p.bio || {};
        const y = b.unitIsPieces ? deps.r1(b.yieldPerSqmMonthPcs) + ' ' + uPcs() : deps.r2(b.yieldPerSqmMonthKg) + ' ' + uKg();
        const yc = b.unitIsPieces ? uPcs() : uG();
        tbl += '<tr><td>' + p.name + '</td><td>' + (b.density != null ? deps.round(b.density) : '—') + '</td><td>' + (b.yieldPerCut != null ? (deps.r1(b.yieldPerCut) + ' ' + yc) : '—') + '</td><td>' + (b.cutIntervalDays != null ? deps.r1(b.cutIntervalDays) : '—') + '</td><td>' + (b.cutsPerMonth != null ? deps.r1(b.cutsPerMonth) : '—') + '</td><td>' + y + '</td><td>' + (b.kwhPerM2Hour != null ? deps.r3(b.kwhPerM2Hour) : '—') + '</td><td>' + (b.lightHoursDay != null ? deps.r1(b.lightHoursDay) : '—') + '</td></tr>';
      });
      derived.innerHTML = '<div class="econ-table-scroll">' + tbl + '</table></div>';
    } else {
      derived.innerHTML = '<p style="color:var(--ink-faint);font-size:13px">' + L('econ.derived.empty') + '</p>';
    }
  }

  function renderEconPlantingSync(){
    const el = deps.$('econ-planting-sync');
    if (!el) return;
    const fresh = global.DG_checkPlantingImportFreshness
      ? global.DG_checkPlantingImportFreshness(st(), deps)
      : { status: 'none' };
    if (fresh.status === 'none'){
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    const meta = fresh.meta || {};
    const timeStr = global.DG_formatPlantingImportTime
      ? global.DG_formatPlantingImportTime(meta.at)
      : meta.at;
    let html = '<div class="econ-planting-sync-inner">';
    html += tFmt('econ.sync.meta', {
      time: timeStr,
      name: meta.cvName || '—',
      facility: meta.facilityLabel || '—'
    }, 'Данные посадки от {time}: <strong>{name}</strong>, {facility}.');
    if (fresh.showRefresh){
      const ch = global.DG_plantingImportChangedLabels
        ? global.DG_plantingImportChangedLabels(fresh.changedFields)
        : fresh.changedFields.join(', ');
      html += ' <span class="econ-planting-sync-stale">' +
        tFmt('econ.sync.stale', { fields: ch },
          'Изменено: {fields}. Нажмите «Импорт из посадки».') + '</span>';
    } else {
      html += ' <span class="econ-planting-sync-ok">' + L('econ.sync.fresh') + '</span>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  function updateCultureFotShareHints(parts, staffTotal){
    (parts || []).forEach(function(p, i){
      const card = document.querySelector('.econ-culture-card[data-econ-culture-idx="' + i + '"]');
      if (!card) return;
      const hint = card.querySelector('.econ-culture-hint');
      if (!hint) return;
      const row = st().econ.cultures[i];
      let html = deps.formatEconCultureHint(row);
      const alloc = p.slice && p.slice.allocatedStaff;
      if (staffTotal > 0 && alloc > 0){
        const pct = deps.r1((alloc / staffTotal) * 100);
        html += '<span class="econ-culture-fot-share">' + L('econ.metrics.fotShare') + ': ' + pct + '% ' + L('econ.metrics.fotShareOf') + ' ' + moneyFmt(staffTotal) + '</span>';
      }
      hint.innerHTML = html;
    });
  }

  function renderEconomics(){
    renderEconomicsForm();
    syncEconTaxNestedUi();
    renderEconomicsCultures();
    syncEconInputsFromState();
    syncEconEquipmentPanel();
    updateEconEquipmentTotal();
    deps.migrateEconOtherElectricity(st().econ);
    const farm = deps.calcFarmEconomics(st().econ);
    const parts = farm.parts;
    const e = st().econ;

    const intro = deps.$('econ-intro');
    if (intro){
      intro.innerHTML = tFmt('econ.intro.html', {
        area: deps.r1(farm.plantingArea),
        warn: farm.totalPct > 100 ? tFmt('econ.intro.warn', { pct: deps.r1(farm.totalPct) }) : ''
      });
    }

    renderEconPlantingSync();

    var allIssues = global.DG_collectCalcIssues ? global.DG_collectCalcIssues({
      state: st(),
      farm: farm,
      parts: parts,
      econWarnings: farm.warnings || [],
      calcResult: deps.calc ? deps.calc() : null,
      deps: deps,
      cvName: econCultureRowName
    }) : [];
    var warnItems = (farm.warnings || []).slice();
    if (global.DG_mergeIssueTexts){
      global.DG_mergeIssueTexts(allIssues, ['critical', 'warn']).forEach(function(txt){
        if (!warnItems.some(function(w){ return (w.text || w) === txt; })){
          warnItems.push({ level: 'normal', text: txt });
        }
      });
    }
    renderEconWarnings(warnItems);
    renderEconDerivedPanel();
    if (typeof global.DG_renderProjectStatsPanel === 'function'){
      global.DG_renderProjectStatsPanel();
    }

    const res = farm;
    const wasteActive = res.wasteEnabled !== false && (res.wastePct || 0) > 0;
    const wasteFactor = res.wasteFactor != null ? res.wasteFactor : 1;
    const hasKg = res.sellKg > 0 || res.outKg > 0;
    const hasPcs = res.sellPcs > 0 || res.outPcs > 0;
    const mixed = hasKg && hasPcs;

    function farmGroupAgg(sell, rev, margin, area, unitCost, unit){
      return {
        sell: sell,
        rev: rev,
        margin: margin,
        area: area,
        unitCost: unitCost,
        yieldSqm: area > 0 ? sell / area : 0,
        unit: unit
      };
    }

    function fmtMixedFarmOutputCell(res, wasteSuffix){
      const parts = [];
      if (res.sellKg > 0) parts.push(deps.r1(res.sellKg) + ' ' + uKg());
      if (res.sellPcs > 0) parts.push(deps.fmtNum(res.sellPcs) + ' ' + uPcs());
      return parts.join(' · ') + (wasteSuffix || '');
    }

    function outputTotalRow(label, agg, opts){
      opts = opts || {};
      const isGrandTotal = !!opts.isGrandTotal;
      if (!agg || (!(agg.sell > 0) && !isGrandTotal)) return '';
      const mixed = opts.mixed;
      const volumeOnly = !!opts.volumeOnly;
      const pctShow = opts.pctShow;
      const farm = opts.farm;
      const res = opts.res;
      const wasteSuffix = wasteActive && !opts.skipWaste ? tFmt('econ.waste', { pct: deps.r1(res.wastePct) }) : '';
      let outCell;
      if (isGrandTotal && mixed){
        outCell = fmtMixedFarmOutputCell(res, wasteSuffix);
      } else {
        const unitLbl = agg.unit === 'шт' ? uPcs() : uKg();
        const valStr = agg.unit === 'кг' ? deps.r1(agg.sell) : deps.fmtNum(agg.sell);
        const perSqm = fmtYieldSqmRate(agg.yieldSqm, agg.unit === 'шт' ? 'шт' : 'кг');
        outCell = (perSqm ? perSqm + ' · ' : '') + valStr + ' ' + unitLbl + wasteSuffix;
      }
      const uc = isGrandTotal && mixed ? '—' : (agg.unitCost > 0 ? fmtUnitCost(agg.unitCost, agg.unit) : '—');
      const revCell = volumeOnly ? '—' : (agg.rev > 0 ? moneyFmt(agg.rev) : '—');
      const marginCell = volumeOnly ? '—' : (agg.rev > 0 || agg.margin !== 0 ? moneyFmt(agg.margin) : '—');
      const areaShow = agg.area > 0 ? agg.area : farm.areaUsed;
      const pctCell = isGrandTotal ? pctShow : (mixed ? '—' : pctShow);
      const areaCell = isGrandTotal ? deps.r1(farm.areaUsed) : (mixed ? '—' : deps.r1(areaShow));
      return '<tr class="econ-total-row' + (isGrandTotal ? ' econ-total-row--grand' : '') + '"><td><strong>' + label + '</strong></td><td>' + pctCell + '</td><td>' + areaCell + '</td><td>' +
        outCell + '</td><td>' + uc + '</td><td>—</td><td>' + revCell + '</td><td>' + marginCell + '</td></tr>';
    }

    const cultTbl = deps.$('econ-cultures-breakdown');
    const cultNote = deps.$('econ-cultures-breakdown-note');
    if (cultNote){
      if (wasteActive && parts.length){
        cultNote.textContent = tFmt('econ.tbl.outWasteNote', { pct: deps.r1(res.wastePct) });
        cultNote.hidden = false;
      } else {
        cultNote.textContent = '';
        cultNote.hidden = true;
      }
    }
    if (cultTbl){
      if (parts.length){
        const revHdr = wasteActive ? L('econ.tbl.revNet') : L('econ.tbl.rev');
        let ch = '<tr><th>' + L('econ.cult.culture') + '</th><th>%</th><th>' + L('econ.unit.sqm') + '</th><th>' + L('econ.tbl.out') + '</th><th>' + L('econ.tbl.cost') + '</th><th>' + moneySym() + L('econ.perSqm') + '</th><th>' + revHdr + '</th><th>' + L('econ.tbl.margin') + '</th></tr>';
        parts.forEach(p => {
          const u = p.slice.outputUnit;
          const revNet = p.slice.revenue * wasteFactor;
          const out = fmtCultureOutputCell(p.slice, wasteActive, wasteFactor);
          const uc = p.slice.unitCostFull > 0 ? fmtUnitCost(p.slice.unitCostFull, u) : '—';
          const consSqm = p.slice.consumablesPerSqm > 0 ? moneyPer(p.slice.consumablesPerSqm, 'econ.perSqm') : '—';
          ch += '<tr data-econ-cv-id="' + econEscAttr(p.cvId || '') + '"><td>' + p.name + '</td><td>' + deps.r1(p.pct) + '</td><td>' + deps.r1(p.slice.area) + '</td><td>' + out + '</td><td>' + uc + '</td><td>' + consSqm + '</td><td>' + moneyFmt(revNet) + '</td><td>' + moneyFmt(p.slice.margin) + '</td></tr>';
        });
        const pctShow = deps.r1(farm.totalPct > 100 ? 100 : farm.totalPct);
        const totOpts = { mixed: mixed, pctShow: pctShow, farm: farm, res: res, skipWaste: mixed, volumeOnly: mixed };
        if (hasKg){
          ch += outputTotalRow(L('econ.tbl.totalKg'), farmGroupAgg(res.sellKg, res.revKg, res.marginKg, res.areaKg || 0, res.unitCostKg, 'кг'), totOpts);
          ch += outputTotalRow(L('econ.tbl.outBerriesKg'), farmGroupAgg(res.sellBerriesKg, res.revBerriesKg, res.marginBerriesKg, res.areaBerriesKg, res.unitCostBerriesKg, 'кг'), totOpts);
          ch += outputTotalRow(L('econ.tbl.outVegetablesKg'), farmGroupAgg(res.sellVegetablesKg, res.revVegetablesKg, res.marginVegetablesKg, res.areaVegetablesKg, res.unitCostVegetablesKg, 'кг'), totOpts);
        }
        if (hasPcs && !hasKg){
          ch += outputTotalRow(L('econ.tbl.totalPcs'), farmGroupAgg(res.sellPcs, res.revPcs, res.marginPcs, res.areaPcs || 0, res.unitCostPcs, 'шт'), totOpts);
        }
        ch += outputTotalRow(L('econ.tbl.outMicroBaby'), farmGroupAgg(res.sellMicroBabyPcs, res.revMicroBabyPcs, res.marginMicroBabyPcs, res.areaMicroBabyPcs, res.unitCostMicroBabyPcs, 'шт'), totOpts);
        ch += outputTotalRow(L('econ.tbl.outFlowers'), farmGroupAgg(res.sellFlowersPcs, res.revFlowersPcs, res.marginFlowersPcs, res.areaFlowersPcs, res.unitCostFlowersPcs, 'шт'), totOpts);
        ch += outputTotalRow(L('econ.tbl.outWheatgrass'), farmGroupAgg(res.sellWheatgrassPcs, res.revWheatgrassPcs, res.marginWheatgrassPcs, res.areaWheatgrassPcs, res.unitCostWheatgrassPcs, 'шт'), totOpts);
        if (res.sellOtherPcs > 0){
          ch += outputTotalRow(L('econ.tbl.outOtherPcs'), farmGroupAgg(res.sellOtherPcs, res.revOtherPcs, res.marginOtherPcs, res.areaOtherPcs, res.unitCostOtherPcs, 'шт'), totOpts);
        }
        if (mixed){
          ch += outputTotalRow(L('econ.tbl.total'), farmGroupAgg(1, res.revenue, res.margin, farm.areaUsed, 0, 'mixed'), {
            mixed: mixed,
            pctShow: pctShow,
            farm: farm,
            res: res,
            isGrandTotal: true
          });
        } else if (!hasKg && !hasPcs){
          ch += '<tr><td><strong>' + L('econ.tbl.total') + '</strong></td><td colspan="7">—</td></tr>';
        }
        cultTbl.innerHTML = ch;
      } else cultTbl.innerHTML = '';
    }

    let metrics = '';
    if (parts.length){
      metrics += '<div class="econ-results-section"><p class="econ-results-sub">' + L('econ.metrics.byCult') + '</p><div class="econ-results-per-culture">';
      parts.forEach(p => {
        const u = p.slice.outputUnit;
        const sell = p.slice.monthlyOutput * wasteFactor;
        const uc = p.slice.unitCostFull;
        const outLbl = u === 'шт' ? L('econ.out.pcsMo') : L('econ.out.kgMo');
        const outVal = u === 'кг' ? (sell > 0 ? deps.fmtNum(sell, {decimals: 1}) : '—') : (sell > 0 ? deps.fmtNum(sell) : '—');
        const ySqmMo = p.slice.yieldPerSqmMonth > 0
          ? p.slice.yieldPerSqmMonth
          : (p.slice.area > 0 ? sell / p.slice.area : 0);
        const ySqmFmt = ySqmMo > 0 ? fmtYieldSqmRate(ySqmMo, u === 'шт' ? 'шт' : 'кг') : '—';
        const consSqm = p.slice.consumablesPerSqm > 0 ? moneyPer(p.slice.consumablesPerSqm, 'econ.perSqmMonth') : '—';
        const consMo = p.slice.consumablesCost > 0 ? moneyPer(p.slice.consumablesCost, 'econ.perMonth') : '—';
        const consOnceSqm = p.slice.consumablesPerSqmOnce > 0 ? moneyPer(p.slice.consumablesPerSqmOnce, 'econ.perSqm') : '—';
        const consOnceArea = p.slice.consumablesOnce > 0 ? moneyFmt(p.slice.consumablesOnce) : '—';
        const ucFmt = fmtUnitCost(uc, u);
        const sl = p.slice;
        const sellMo = sell;
        const elecOtherMo = sl.unitCostElecOther > 0 && sellMo > 0 ? sl.unitCostElecOther * sellMo : 0;
        let breakdown = unitCostBreakdownLine(L('econ.metrics.unitCostElecLight'), sl.unitCostLight, u, sl.lightCost || 0) +
          unitCostBreakdownLine(L('econ.metrics.unitCostElecInfra'), sl.unitCostElecOther, u, elecOtherMo);
        if (!breakdown && sl.unitCostElec > 0){
          breakdown = unitCostBreakdownLine(L('econ.metrics.unitCostElec'), sl.unitCostElec, u);
        }
        const staffSharePct = res.staffTotal > 0 && sl.allocatedStaff > 0
          ? deps.r1((sl.allocatedStaff / res.staffTotal) * 100)
          : '';
        breakdown += unitCostBreakdownLine(L('econ.metrics.unitCostFot'), sl.unitCostStaff, u, sl.allocatedStaff || 0) +
          unitCostBreakdownLine(L('econ.metrics.unitCostRent'), sl.unitCostRent, u, sl.allocatedRent || 0) +
          unitCostBreakdownLine(L('econ.metrics.unitCostLog'), sl.unitCostLogistics, u, sl.allocatedLogistics || 0) +
          unitCostBreakdownLine(L('econ.metrics.unitCostWater'), sl.unitCostWater, u, sl.allocatedWater || 0) +
          unitCostBreakdownLine(L('econ.metrics.unitCostOther'), sl.unitCostOther, u, sl.allocatedOther || 0) +
          unitCostBreakdownLine(L('econ.metrics.unitCostAmort'), sl.unitCostAmort, u, sl.allocatedAmort || 0);
        if (sl.unitCostPackaging > 0){
          breakdown += unitCostBreakdownLine(L('econ.metrics.unitCostCons'), sl.unitCostConsPot, u) +
            unitCostBreakdownLine(L('econ.metrics.unitCostPackaging'), sl.unitCostPackaging, u);
        } else {
          breakdown += unitCostBreakdownLine(L('econ.metrics.unitCostCons'), sl.unitCostConsumables, u);
        }
        metrics += '<div class="econ-culture-metric"><div class="name">' + p.name + '</div>' +
          '<div class="line line--total"><span>' + L('econ.metrics.unitCost') + '</span><strong>' + ucFmt + '</strong></div>' +
          (breakdown ? '<div class="econ-uc-breakdown"><div class="econ-uc-breakdown-title">' + L('econ.metrics.unitCostBreakdown') + '</div>' +
            '<p class="econ-uc-breakdown-hint">' + unitCostBreakdownHintText() + '</p>' + breakdown + '</div>' : '') +
          '<div class="econ-uc-extra">' +
          '<div class="line"><span>' + L('econ.metrics.sowOnce') + '</span><strong>' + consOnceSqm + '</strong> · ' + consOnceArea + '</div>' +
          '<div class="line"><span>' + L('econ.metrics.sowMo') + '</span><strong>' + consSqm + '</strong></div>' +
          '<div class="line"><span>' + L('econ.metrics.consArea') + '</span><strong>' + consMo + '</strong></div>' +
          '<div class="line"><span>' + L('econ.derived.yield') + '</span><strong>' + ySqmFmt + '</strong></div>' +
          '<div class="line"><span>' + L('econ.metrics.out') + '</span><strong>' + outVal + ' ' + outLbl + '</strong></div>' +
          (staffSharePct ? '<div class="line econ-metric-line--fot"><span>' + L('econ.metrics.fotShare') + '</span><strong>' + staffSharePct + '% ' + L('econ.metrics.fotShareOf') + ' ' + moneyFmt(res.staffTotal) + '</strong></div>' : '') +
          '<div class="line econ-metric-line--share"><span>' + L('econ.metrics.share') + '</span><strong>' + deps.r1(p.pct) + '% · ' + deps.r1(p.slice.area) + ' ' + L('econ.unit.sqm') + '</strong></div></div></div>';

      });
      metrics += '</div></div>';
    } else {
      metrics += '<div class="econ-results-section"><p style="color:var(--ink-faint);font-size:13px;margin:0">' + L('econ.metrics.empty') + '</p></div>';
    }

    metrics += '<div class="econ-results-farm"><div id="econ-elec-charts" class="econ-elec-charts-wrap"></div>' +
      '<div class="econ-elec-table-block"><p class="econ-elec-table-title">' + L('econ.metrics.elecMo') + '</p>' +
      '<div class="econ-table-scroll econ-table-scroll--elec"><table class="econ-breakdown econ-elec-total"><tr><th>' + L('econ.tbl.article') + '</th><th>' + L('econ.tbl.kwh') + '</th><th>' + moneySym() + '</th></tr>';
    (res.elecBreakdown || []).forEach(function(row){
      const lbl = row.id === 'light' ? L('econ.elec.cat.light') : elecCatLabel(row.id);
      const sub = row.kw != null ? ' <span class="econ-tbl-sub">(' + tFmt('econ.elec.catSub', { kw: deps.r1(row.kw), h: deps.r1(row.h) }) + ')</span>' : '';
      metrics += '<tr><td>' + lbl + sub + '</td><td>' + deps.fmtNum(row.kwh || 0) + '</td><td>' + moneyFmt(row.cost) + '</td></tr>';
    });
    metrics += '<tr class="econ-row-total"><td><strong>' + L('econ.elec.total') + '</strong></td><td><strong>' + deps.fmtNum(res.totalElecKwhMonth || 0) + '</strong></td><td><strong>' + moneyFmt(res.totalElecCost || 0) + '</strong></td></tr></table></div></div></div>';
    deps.$('econ-results-metrics').innerHTML = metrics;

    let farmCards = '<div class="econ-results" style="margin-top:0">';
    if (res.sellKg > 0){
      farmCards += '<div class="m econ-out-card"><div class="m-label">' + L('econ.tbl.totalKg') + '</div><div class="m-val">' + deps.r1(res.sellKg) + ' <span class="m-u">' + uKg() + '</span></div></div>';
    }
    if (res.sellBerriesKg > 0){
      farmCards += '<div class="m econ-out-card"><div class="m-label">' + L('econ.tbl.outBerriesKg') + '</div><div class="m-val">' + deps.r1(res.sellBerriesKg) + ' <span class="m-u">' + uKg() + '</span></div></div>';
    }
    if (res.sellVegetablesKg > 0){
      farmCards += '<div class="m econ-out-card"><div class="m-label">' + L('econ.tbl.outVegetablesKg') + '</div><div class="m-val">' + deps.r1(res.sellVegetablesKg) + ' <span class="m-u">' + uKg() + '</span></div></div>';
    }
    if (res.sellMicroBabyPcs > 0){
      farmCards += '<div class="m econ-out-card"><div class="m-label">' + L('econ.tbl.outMicroBaby') + '</div><div class="m-val">' + deps.fmtNum(res.sellMicroBabyPcs) + ' <span class="m-u">' + uPcs() + '</span></div></div>';
    }
    if (res.sellFlowersPcs > 0){
      farmCards += '<div class="m econ-out-card"><div class="m-label">' + L('econ.tbl.outFlowers') + '</div><div class="m-val">' + deps.fmtNum(res.sellFlowersPcs) + ' <span class="m-u">' + uPcs() + '</span></div></div>';
    }
    if (res.sellWheatgrassPcs > 0){
      farmCards += '<div class="m econ-out-card"><div class="m-label">' + L('econ.tbl.outWheatgrass') + '</div><div class="m-val">' + deps.fmtNum(res.sellWheatgrassPcs) + ' <span class="m-u">' + uPcs() + '</span></div></div>';
    }
    if (res.sellOtherPcs > 0){
      farmCards += '<div class="m econ-out-card"><div class="m-label">' + L('econ.tbl.outOtherPcs') + '</div><div class="m-val">' + deps.fmtNum(res.sellOtherPcs) + ' <span class="m-u">' + uPcs() + '</span></div></div>';
    }
    farmCards +=
      '<div class="m"><div class="m-label">' + L('econ.metrics.opex') + '</div><div class="m-val">' + moneyFmt(res.monthlyOpex) + '</div></div>' +
      '<div class="m"><div class="m-label">' + L('econ.bd.revenue') + '</div><div class="m-val">' + moneyFmt(res.revenue) + '</div></div>' +
      '<div class="m ' + (res.margin >= 0 ? 'hl' : 'bad-tint') + '"><div class="m-label">' + L('econ.metrics.marginAll') + '</div><div class="m-val">' + moneyFmt(res.margin) + '</div></div>';
    if (res.breakEvenRevenue > 0){
      farmCards += '<div class="m"><div class="m-label">' + L('econ.metrics.breakEvenRevenue') + '</div><div class="m-val">' + moneyFmt(res.breakEvenRevenue) + '</div>' +
        (res.breakEvenRevenuePct > 0 ? '<div class="m-sub">' + tFmt('econ.metrics.breakEvenRevenuePct', { pct: deps.r1(res.breakEvenRevenuePct) }) + '</div>' : '') +
        '</div>';
    }
    farmCards += '</div>';
    const farmCardsEl = deps.$('econ-results-final-cards');
    if (farmCardsEl) farmCardsEl.innerHTML = farmCards;
    renderElecCharts(res);

    const wasteRow = wasteActive
      ? '<tr><td>' + L('econ.bd.waste') + '</td><td colspan="2">' + deps.r1(res.wastePct) + '%</td></tr>'
      : '';
    let bd =
      '<tr><td>' + L('econ.bd.rent') + '</td><td>—</td><td>' + moneyFmt(res.rent) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.staffGross') + '</td><td>—</td><td>' + moneyFmt(res.staffGross) + '</td></tr>' +
      (res.payrollTax > 0 ? '<tr><td>' + L('econ.bd.payrollTax') + (res.payrollTaxPct > 0 ? ' (' + deps.r1(res.payrollTaxPct) + '%)' : '') + '</td><td>—</td><td>' + moneyFmt(res.payrollTax) + '</td></tr>' : '') +
      (res.payrollStaffCost > 0 ? '<tr><td>' + L('econ.bd.payrollStaffCost') + (res.payrollStaffCostPct > 0 ? ' (' + deps.r1(res.payrollStaffCostPct) + '%)' : '') + '</td><td>—</td><td>' + moneyFmt(res.payrollStaffCost) + '</td></tr>' : '') +
      (res.payrollCustom > 0 ? '<tr><td>' + L('econ.bd.payrollCustom') + '</td><td>—</td><td>' + moneyFmt(res.payrollCustom) + '</td></tr>' : '') +
      (res.accountingMonth > 0 ? '<tr><td>' + L('econ.bd.accounting') + '</td><td>—</td><td>' + moneyFmt(res.accountingMonth) + '</td></tr>' : '') +
      '<tr><td>' + L('econ.bd.staff') + '</td><td>—</td><td>' + moneyFmt(res.staffTotal) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.logistics') + '</td><td>—</td><td>' + moneyFmt(res.logistics) + '</td></tr>' +
      (res.waterEnabled !== false && res.waterCost > 0 ? '<tr><td>' + tFmt('econ.bd.waterWithVol', { vol: deps.r1(res.waterM3Month) }) + '</td><td>—</td><td>' + moneyFmt(res.waterCost) + '</td></tr>' : '');
    (res.elecBreakdown || []).forEach(function(row){
      const lbl = row.id === 'light' ? L('econ.bd.light') : (L('econ.bd.elecPrefix') + ' ' + elecCatLabel(row.id));
      bd += '<tr><td>' + lbl + '</td><td>' + deps.fmtNum(row.kwh || 0) + '</td><td>' + moneyFmt(row.cost) + '</td></tr>';
    });
    deps.$('econ-breakdown-table').innerHTML =
      '<tr><th>' + L('econ.tbl.article') + '</th><th>' + L('econ.tbl.kwhMo') + '</th><th>' + moneySym() + L('econ.perMonth') + '</th></tr>' + bd +
      '<tr class="econ-row-total"><td><strong>' + L('econ.bd.elecTotal') + '</strong></td><td><strong>' + deps.fmtNum(res.totalElecKwhMonth || 0) + '</strong></td><td><strong>' + moneyFmt(res.totalElecCost || 0) + '</strong></td></tr>' +
      '<tr><td>' + L('econ.bd.other') + '</td><td>—</td><td>' + moneyFmt(res.other) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.amort') + '</td><td>—</td><td>' + moneyFmt(res.equipAmort) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.consumables') + '</td><td>—</td><td>' + moneyFmt(res.consumablesCost) + '</td></tr>' +
      '<tr><td><strong>' + L('econ.bd.opexTotal') + '</strong></td><td>—</td><td><strong>' + moneyFmt(res.monthlyOpex) + '</strong></td></tr>' +
      wasteRow +
      '<tr><td>' + L('econ.bd.revenue') + '</td><td>—</td><td>' + moneyFmt(res.revenue) + '</td></tr>' +
      (res.usnTaxAmt > 0 ? '<tr><td>' + L('econ.bd.usn') + '</td><td>—</td><td>' + moneyFmt(res.usnTaxAmt) + '</td></tr>' : '') +
      (res.vatTaxAmt > 0 ? '<tr><td>' + tFmt('econ.bd.vat', { pct: deps.r1(res.vatPct) }) + '</td><td>—</td><td>' + moneyFmt(res.vatTaxAmt) + '</td></tr>' : '') +
      (res.profitTaxAmt > 0 ? '<tr><td>' + tFmt('econ.bd.profitTax', { pct: deps.r1(res.profitTaxPct) }) + '</td><td>—</td><td>' + moneyFmt(res.profitTaxAmt) + '</td></tr>' : '') +
      '<tr><td>' + L('econ.bd.margin') + '</td><td>—</td><td>' + moneyFmt(res.margin) + ' (' + deps.r1(res.marginPct) + '%)</td></tr>';
    updateCultureFotShareHints(parts, res.staffTotal);
    refreshFmtDisplayAll();
  }


    return {
      getEconCultureOptionsHtml: getEconCultureOptionsHtml,
      isEconCvIdTaken: isEconCvIdTaken,
      econEscAttr: econEscAttr,
      fmtEconRub: fmtEconRub,
      refreshFmtDisplayAll: refreshFmtDisplayAll,
      initEconFmtInputs: initEconFmtInputs,
      syncEconEquipmentPanel: syncEconEquipmentPanel,
      updateEconEquipmentTotal: updateEconEquipmentTotal,
      renderEconWarnings: renderEconWarnings,
      econToggleHtml: econToggleHtml,
      renderEconCustomEquipRow: renderEconCustomEquipRow,
      econNumInput: econNumInput,
      renderEconomicsEquipment: renderEconomicsEquipment,
      bindEconomicsInputs: bindEconomicsInputs,
      bindEconomicsEquipment: bindEconomicsEquipment,
      renderEconomicsForm: renderEconomicsForm,
      econCultParamInput: econCultParamInput,
      renderEconomicsCultures: renderEconomicsCultures,
      bindEconomicsCultures: bindEconomicsCultures,
      syncEconInputsFromState: syncEconInputsFromState,
      syncEconFromPlanting: syncEconFromPlanting,
      econSnapDerivedHtml: econSnapDerivedHtml,
      renderEconomics: renderEconomics
    };
  }

  global.DG_createEconUI = createEconUI;
})(typeof window !== 'undefined' ? window : this);
