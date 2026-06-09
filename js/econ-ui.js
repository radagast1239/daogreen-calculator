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
    function unitCostBreakdownLine(label, val, u){
      if (!(val > 0)) return '';
      return '<div class="line line--sub"><span>' + label + '</span><strong>' + fmtUnitCost(val, u) + '</strong></div>';
    }
    function parseMoney(v){ return deps.parseMoneyInput ? deps.parseMoneyInput(v) : deps.parseNumInput(v); }
    function fmtMoneyInp(rub, d){ return deps.formatMoneyInput ? deps.formatMoneyInput(rub, d) : deps.formatInputValue(rub, d); }
    function formToken(){ return deps.localeToken ? deps.localeToken() : 'ru'; }
    function isMoneyKey(k){ return deps.isMoneyEconKey && deps.isMoneyEconKey(k); }
    function isMoneyCult(f){ return deps.isMoneyCultField && deps.isMoneyCultField(f); }
    function moneyLabel(baseKey, perKey){
      return L(baseKey) + ', ' + moneySym() + L(perKey);
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

  function getEconCultureOptionsHtml(selectedId, rowIdx){
    const used = new Set();
    deps.ensureEconCultures();
    st().econ.cultures.forEach((row, j) => {
      if (j !== rowIdx && row.cvId) used.add(row.cvId);
    });
    const opt = (val, label) => {
      const sel = selectedId === val ? ' selected' : '';
      const dis = val && used.has(val) ? ' disabled' : '';
      return '<option value="' + val + '"' + sel + dis + '>' + label + '</option>';
    };
    let html = opt('', L('econ.opt.empty'));
    const customVf = st().customVfCultivars || [];
    const customGh = st().customGhCultivars || [];
    if (VF_CULTIVARS.length || customVf.length){
      html += '<optgroup label="' + L('econ.opt.vf') + '">';
      VF_CULTIVARS.forEach(c => { html += opt(c.id, c.name); });
      customVf.forEach(c => { html += opt(c.id, c.name + ' ★'); });
      html += '</optgroup>';
    }
    html += '<optgroup label="' + L('econ.opt.gh') + '">';
    CULTIVARS.forEach(c => { html += opt(c.id, c.name); });
    customGh.forEach(c => { html += opt(c.id, c.name + ' ★'); });
    html += '</optgroup>';
    if (PALLET_CULTIVARS.length){
      html += '<optgroup label="' + L('econ.opt.pal') + '">';
      PALLET_CULTIVARS.forEach(c => { html += opt(c.id, c.name); });
      html += '</optgroup>';
    }
    return html;
  }

  function isEconCvIdTaken(cvId, exceptIdx){
    if (!cvId) return false;
    deps.ensureEconCultures();
    return st().econ.cultures.some((row, j) => j !== exceptIdx && row.cvId === cvId);
  }

  function econEscAttr(t){
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
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

  function equipLineTotal(key, monthlyAmt, months, opts){
    const meta = opts || (deps.getEquipItemMeta ? deps.getEquipItemMeta(key) : null);
    if (!meta || !meta.monthly) return parseFloat(monthlyAmt) || 0;
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
    deps.saveEconStore();
  }

  function updateEconEquipLineTotals(){
    const wrap = deps.$('econ-equipment-groups');
    if (!wrap) return;
    const runwayMo = startupRunwayMonthsVal();
    wrap.querySelectorAll('[data-econ-runway-mo-label]').forEach(function(el){
      el.textContent = tFmt('econ.runway.timesMonths', { months: deps.fmtNum(runwayMo) });
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

  function renderRunwayIntro(){
    const mo = startupRunwayMonthsVal();
    return '<div class="econ-runway-intro">' +
      '<p class="econ-hint econ-runway-hint">' + L('econ.runway.intro') + '</p>' +
      '<div class="econ-runway-controls">' +
      '<label class="econ-runway-months-lbl">' + L('econ.runway.monthsLabel') +
      '<input type="text" inputmode="numeric" class="econ-num-fmt econ-runway-months-inp" data-econ-decimals="0" data-econ-startup-runway-months value="' + deps.formatInputValue(mo, 0) + '"></label>' +
      '<button type="button" class="auto-btn econ-runway-sync-btn" data-econ-runway-sync>' + L('econ.runway.syncBtn') + '</button>' +
      '</div></div>';
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
        '<span class="econ-equip-runway-mo" data-econ-runway-mo-label>' + tFmt('econ.runway.timesMonths', { months: deps.fmtNum(startupRunwayMonthsVal()) }) + '</span>' +
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
    return '<div class="econ-payroll-row" data-econ-staff-id="' + row.id + '">' +
      '<input type="text" class="econ-payroll-label-inp" data-econ-staff-label="' + row.id + '" value="' + econEscAttr(row.label || '') + '" placeholder="' + L('econ.staff.role') + '">' +
      '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" data-econ-staff-salary="' + row.id + '" value="' + deps.formatInputValue(sal, 0) + '">' +
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

  function renderPayrollSection(){
    deps.migrateEconOtherElectricity(st().econ);
    const wrap = deps.$('econ-payroll-body');
    if (!wrap) return;
    const head = '<div class="econ-payroll-row econ-payroll-row--head"><span>' + L('econ.staff.role') + '</span><span>' + L('econ.staff.salary') + ', ' + moneySym() + '</span><span></span></div>';
    let staffHtml = head;
    (st().econ.staffLines || []).forEach(function(row){ staffHtml += renderPayrollStaffRow(row); });
    let customHtml = '';
    if ((st().econ.payrollCustom || []).length) customHtml += renderPayrollCustomHead();
    (st().econ.payrollCustom || []).forEach(function(row){ customHtml += renderPayrollCustomRow(row); });
    wrap.innerHTML =
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
        st().econ.staffLines.push({ id: 'staff_' + Math.random().toString(36).slice(2, 10), label: '', salary: 55000 });
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
        if (!st().econ.staffLines.length) st().econ.staffLines.push({ id: 'staff_' + Math.random().toString(36).slice(2, 10), label: '', salary: 0 });
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
    let html = '<p class="econ-results-sub" style="margin-top:0">' + L('econ.elec.chartTitle') + '</p>';
    rows.forEach(function(row){
      const pct = maxCost > 0 ? Math.round((row.cost / maxCost) * 100) : 0;
      const lbl = row.id === 'light' ? L('econ.elec.cat.light') : elecCatLabel(row.id);
      const sub = row.kw != null ? tFmt('econ.elec.catSub', { kw: deps.r1(row.kw), h: deps.r1(row.h) }) : L('econ.elec.catLightSub');
      html += '<div class="econ-elec-bar-row"><span class="econ-elec-bar-label">' + lbl + '<span class="econ-elec-bar-sub">' + sub + '</span></span>' +
        '<div class="econ-elec-bar-track"><div class="econ-elec-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="econ-elec-bar-kwh">' + deps.fmtNum(row.kwh || 0) + '</span>' +
        '<span class="econ-elec-bar-cost">' + moneyFmt(row.cost) + '</span></div>';
    });
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
        deps.saveEconStore();
        updateEconEquipLineTotals();
        updateEconEquipmentTotal();
        renderEconomics();
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
    if (!gen){
      ensureEconSubPanels(ft);
      return;
    }
    if (gen.dataset.built === ft){
      ensureEconSubPanels(ft);
      return;
    }
    gen.dataset.built = ft;
    gen.innerHTML =
      econNumInput('priceKwh', moneyLabel('econ.priceKwh', 'econ.perKwh'), { step: 0.1 }) +
      econNumInput('rentMonth', moneyLabel('econ.rentMonth', 'econ.perMonth'), { step: 1000 }) +
      econToggleHtml('econ-payroll-tax', L('econ.payrollTax'), st().econ.payrollTax) +
      econNumInput('logisticsMonth', moneyLabel('econ.logisticsMonth', 'econ.perMonth'), { step: 1000 }) +
      econNumInput('floorArea', L('econ.floorArea'), { step: 1 }) +
      econNumInput('plantingArea', L('econ.plantingArea'), { step: 1 }) +
      econNumInput('wastePct', L('econ.wastePct'), { step: 1, hint: L('econ.wastePct.hint') }) +
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

    const tax = deps.$('econ-payroll-tax');
    if (tax){
      tax.addEventListener('change', () => {
        st().econ.payrollTax = tax.checked;
        deps.saveEconStore();
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

  function econCultParamInput(i, field, label, opts){
    opts = opts || {};
    const row = deps.normalizeEconCultureRow(st().econ.cultures[i]);
    const yUnit = field === 'yieldPerCut' ? (row.unitIsPieces ? uPcs() : uG()) : '';
    const dec = opts.decimals != null ? opts.decimals : deps.decimalsFromStep(opts.step || 1);
    const v = row[field] != null ? row[field] : '';
    const disp = v === '' ? '' : deps.formatInputValue(v, dec);
    const ph = opts.placeholder ? ' placeholder="' + opts.placeholder + '"' : '';
    const title = opts.title ? ' title="' + opts.title + '"' : '';
    return '<div class="econ-field econ-culture-param"><label>' + label + (yUnit ? ' (' + yUnit + ')' : '') + '</label>' +
      '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="' + dec + '" data-econ-cult-field="' + field + '" data-econ-cult-idx="' + i + '" value="' + disp + '"' + ph + title + '></div>';
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
      const yieldLbl = isLot ? L('econ.cult.yieldCycle') : (norm.unitIsPieces ? L('econ.cult.yieldPcs') : L('econ.cult.yield'));
      const yieldHint = isLot ? L('econ.cult.yieldCycleHint') : L('econ.cult.yieldHint');
      const consLbl = isLot ? (lotPot ? L('econ.cult.consPot') : L('econ.cult.consTray')) : L('econ.cult.consPot');
      const consPh = isLot ? '10' : String(ECON_CONSUMABLES_PER_POT_HINT);
      const mixToggle = '<div class="econ-mix-inline">' +
        '<label class="econ-mix-check"><input type="checkbox" data-econ-mix-incl="' + i + '"' + (norm.mixInMix ? ' checked' : '') + '> ' + L('econ.mix.use') + '</label>' +
        (norm.mixInMix ? ('<label class="econ-mix-pct-lbl">' + L('econ.mix.pct') + ' <input type="text" inputmode="decimal" class="econ-mix-pct" data-econ-mix-pct-row="' + i + '" value="' + deps.formatInputValue(norm.mixPct || 0, 1) + '"></label>') : '') +
        '</div>';
      html += '<div class="econ-culture-card" data-econ-culture-idx="' + i + '">' +
        '<div class="econ-culture-head">' +
        '<div class="econ-field"><label>' + L('econ.cult.culture') + '</label><select data-econ-culture-cv="' + i + '">' + getEconCultureOptionsHtml(norm.cvId || '', i) + '</select></div>' +
        (mode === 'sqm'
          ? '<div class="econ-field"><label>' + L('econ.cult.areaSqm') + '</label><input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="1" data-econ-culture-sqm="' + i + '" value="' + deps.formatInputValue(areaSqm, 1) + '"></div>'
          : '<div class="econ-field"><label>' + L('econ.cult.share') + '</label><input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="1" data-econ-culture-pct="' + i + '" value="' + deps.formatInputValue(pct, 1) + '"></div>') +
        '<div class="econ-field"><label>' + L('econ.cult.price') + ', ' + moneySym() + '</label><input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" placeholder="—" data-econ-culture-price="' + i + '" value="' + (sp ? fmtMoneyInp(sp, 0) : '') + '"></div>' +
        '<button type="button" class="econ-rm" data-econ-culture-rm="' + i + '" title="' + L('econ.btn.remove') + '" aria-label="' + L('econ.btn.remove') + '">×</button>' +
        '</div>' +
        mixToggle +
        '<div class="econ-culture-params">' +
        econCultParamInput(i, 'density', L('econ.cult.density'), { step: 1 }) +
        econCultParamInput(i, 'yieldPerCut', yieldLbl, { step: isLot ? 1 : 0.1, decimals: isLot ? 0 : null, title: yieldHint }) +
        econCultParamInput(i, 'cutIntervalDays', L('econ.cult.interval'), { step: 1, min: 1 }) +
        econCultParamInput(i, 'kwhPerM2Hour', L('econ.cult.lightKwh'), { step: 0.001 }) +
        econCultParamInput(i, 'lightHoursDay', L('econ.cult.lightH'), { step: 0.5 }) +
        econCultParamInput(i, 'consumablesPerPot', consLbl + ', ' + moneySym(), {
          step: 0.5, decimals: 1, placeholder: consPh,
          title: (isLot && lotPot) ? L('econ.cult.consPot.lotHint') : consLbl
        }) +
        (isLot ? '' : econCultParamInput(i, 'potHarvestMonths', L('econ.cult.potLife'), { step: 0.5, decimals: 1 })) +
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
        deps.ensureEconCultures();
        const v = isMoneyCult(cultField) ? parseMoney(e.target.value) : deps.parseNumInput(e.target.value);
        st().econ.cultures[i][cultField] = isNaN(v) ? 0 : v;
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
      const cultField = e.target.dataset.econCultField;
      if (cultField != null){
        const i = parseInt(e.target.dataset.econCultIdx, 10);
        deps.ensureEconCultures();
        const v = isMoneyCult(cultField) ? parseMoney(e.target.value) : deps.parseNumInput(e.target.value);
        st().econ.cultures[i][cultField] = isNaN(v) ? 0 : v;
        deps.saveEconStore();
        renderEconDerivedPanel();
        const hint = e.target.closest('.econ-culture-card')?.querySelector('.econ-culture-hint');
        if (hint){
          const bio = deps.econCultureBio(st().econ.cultures[i]);
      const ySqm = bio.unitIsPieces ? deps.r1(bio.yieldPerSqmMonthPcs) + ' ' + L('econ.yield.pcsSqm') : deps.r2(bio.yieldPerSqmMonthKg) + ' ' + L('econ.yield.kgSqm');
      hint.innerHTML = deps.formatEconCultureHint(st().econ.cultures[i]);
        }
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

    const res = farm;
    const wasteFactor = 1 - deps.clamp(res.wastePct || 0, 0, 50) / 100;
    const hasKg = res.sellKg > 0 || res.outKg > 0;
    const hasPcs = res.sellPcs > 0 || res.outPcs > 0;
    const mixed = hasKg && hasPcs;

    function outputTotalRow(label, sellVal, opts){
      if (!(sellVal > 0)) return '';
      opts = opts || {};
      const mixed = opts.mixed;
      const pctShow = opts.pctShow;
      const farm = opts.farm;
      const res = opts.res;
      const wasteSuffix = res.wastePct > 0 && !opts.skipWaste ? tFmt('econ.waste', { pct: deps.r1(res.wastePct) }) : '';
      const unit = opts.unit || uPcs();
      const valStr = opts.decimals != null ? deps.fmtNum(sellVal, { decimals: opts.decimals }) : deps.fmtNum(sellVal);
      return '<tr class="econ-total-row"><td><strong>' + label + '</strong></td><td>' + (mixed ? '—' : pctShow) + '</td><td>' + (mixed ? '—' : deps.r1(farm.areaUsed)) + '</td><td>' +
        valStr + ' ' + unit + wasteSuffix + '</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>';
    }

    const cultTbl = deps.$('econ-cultures-breakdown');
    const cultNote = deps.$('econ-cultures-breakdown-note');
    if (cultNote){
      if (res.wastePct > 0 && parts.length){
        cultNote.textContent = tFmt('econ.tbl.outWasteNote', { pct: deps.r1(res.wastePct) });
        cultNote.hidden = false;
      } else {
        cultNote.textContent = '';
        cultNote.hidden = true;
      }
    }
    if (cultTbl){
      if (parts.length){
        const revHdr = res.wastePct > 0 ? L('econ.tbl.revNet') : L('econ.tbl.rev');
        let ch = '<tr><th>' + L('econ.cult.culture') + '</th><th>%</th><th>' + L('econ.unit.sqm') + '</th><th>' + L('econ.tbl.out') + '</th><th>' + L('econ.tbl.cost') + '</th><th>' + moneySym() + L('econ.perSqm') + '</th><th>' + revHdr + '</th><th>' + L('econ.tbl.margin') + '</th></tr>';
        parts.forEach(p => {
          const u = p.slice.outputUnit;
          const gross = p.slice.monthlyOutput;
          const sell = gross * wasteFactor;
          const revNet = p.slice.revenue * wasteFactor;
          let out = '—';
          if (gross > 0){
            const gStr = u === 'кг' ? deps.r1(gross) : deps.fmtNum(gross);
            const sStr = u === 'кг' ? deps.r1(sell) : deps.fmtNum(sell);
            out = res.wastePct > 0 ? gStr + ' → ' + sStr + ' ' + uOut(u) : gStr + ' ' + uOut(u);
          }
          const uc = p.slice.unitCostFull > 0 ? fmtUnitCost(p.slice.unitCostFull, u) : '—';
          const consSqm = p.slice.consumablesPerSqm > 0 ? moneyPer(p.slice.consumablesPerSqm, 'econ.perSqm') : '—';
          ch += '<tr><td>' + p.name + '</td><td>' + deps.r1(p.pct) + '</td><td>' + deps.r1(p.slice.area) + '</td><td>' + out + '</td><td>' + uc + '</td><td>' + consSqm + '</td><td>' + moneyFmt(revNet) + '</td><td>' + moneyFmt(p.slice.margin) + '</td></tr>';
        });
        const pctShow = deps.r1(farm.totalPct > 100 ? 100 : farm.totalPct);
        const totOpts = { mixed: mixed, pctShow: pctShow, farm: farm, res: res, skipWaste: mixed };
        if (hasKg){
          ch += '<tr class="econ-total-row"><td><strong>' + L('econ.tbl.totalKg') + '</strong></td><td>' + pctShow + '</td><td>' + deps.r1(farm.areaUsed) + '</td><td>' +
            (res.sellKg > 0 ? deps.r1(res.sellKg) + ' ' + uKg() + (res.wastePct > 0 ? tFmt('econ.waste', { pct: deps.r1(res.wastePct) }) : '') : '—') +
            '</td><td><strong>' + (res.unitCostKg > 0 ? moneyFmt(res.unitCostKg) : '—') + '</strong></td><td>—</td><td><strong>' + moneyFmt(res.revKg) + '</strong></td><td><strong>' + moneyFmt(res.marginKg) + '</strong></td></tr>';
        }
        ch += outputTotalRow(L('econ.tbl.outMicroBaby'), res.sellMicroBabyPcs, totOpts);
        ch += outputTotalRow(L('econ.tbl.outFlowers'), res.sellFlowersPcs, totOpts);
        ch += outputTotalRow(L('econ.tbl.outWheatgrass'), res.sellWheatgrassPcs, totOpts);
        if (res.sellOtherPcs > 0){
          ch += outputTotalRow(L('econ.tbl.outOtherPcs'), res.sellOtherPcs, totOpts);
        }
        if (!hasKg && !hasPcs){
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
        const consSqm = p.slice.consumablesPerSqm > 0 ? moneyPer(p.slice.consumablesPerSqm, 'econ.perSqmMonth') : '—';
        const consMo = p.slice.consumablesCost > 0 ? moneyPer(p.slice.consumablesCost, 'econ.perMonth') : '—';
        const consOnceSqm = p.slice.consumablesPerSqmOnce > 0 ? moneyPer(p.slice.consumablesPerSqmOnce, 'econ.perSqm') : '—';
        const consOnceArea = p.slice.consumablesOnce > 0 ? moneyFmt(p.slice.consumablesOnce) : '—';
        const ucFmt = fmtUnitCost(uc, u);
        const sl = p.slice;
        let breakdown = unitCostBreakdownLine(L('econ.metrics.unitCostElecLight'), sl.unitCostLight, u) +
          unitCostBreakdownLine(L('econ.metrics.unitCostElecInfra'), sl.unitCostElecOther, u);
        if (!breakdown && sl.unitCostElec > 0){
          breakdown = unitCostBreakdownLine(L('econ.metrics.unitCostElec'), sl.unitCostElec, u);
        }
        breakdown += unitCostBreakdownLine(L('econ.metrics.unitCostFot'), sl.unitCostStaff, u) +
          unitCostBreakdownLine(L('econ.metrics.unitCostRent'), sl.unitCostRent, u) +
          unitCostBreakdownLine(L('econ.metrics.unitCostLog'), sl.unitCostLogistics, u) +
          unitCostBreakdownLine(L('econ.metrics.unitCostOther'), sl.unitCostOther, u) +
          unitCostBreakdownLine(L('econ.metrics.unitCostAmort'), sl.unitCostAmort, u);
        if (sl.unitCostPackaging > 0){
          breakdown += unitCostBreakdownLine(L('econ.metrics.unitCostCons'), sl.unitCostConsPot, u) +
            unitCostBreakdownLine(L('econ.metrics.unitCostPackaging'), sl.unitCostPackaging, u);
        } else {
          breakdown += unitCostBreakdownLine(L('econ.metrics.unitCostCons'), sl.unitCostConsumables, u);
        }
        metrics += '<div class="econ-culture-metric"><div class="name">' + p.name + '</div>' +
          '<div class="line line--total"><span>' + L('econ.metrics.unitCost') + '</span><strong>' + ucFmt + '</strong></div>' +
          (breakdown ? '<div class="econ-uc-breakdown"><div class="econ-uc-breakdown-title">' + L('econ.metrics.unitCostBreakdown') + '</div>' + breakdown + '</div>' : '') +
          '<div class="econ-uc-extra">' +
          '<div class="line"><span>' + L('econ.metrics.sowOnce') + '</span><strong>' + consOnceSqm + '</strong> · ' + consOnceArea + '</div>' +
          '<div class="line"><span>' + L('econ.metrics.sowMo') + '</span><strong>' + consSqm + '</strong></div>' +
          '<div class="line"><span>' + L('econ.metrics.consArea') + '</span><strong>' + consMo + '</strong></div>' +
          '<div class="line"><span>' + L('econ.metrics.out') + '</span><strong>' + outVal + ' ' + outLbl + '</strong></div>' +
          '<div class="line econ-metric-line--share"><span>' + L('econ.metrics.share') + '</span><strong>' + deps.r1(p.pct) + '% · ' + deps.r1(p.slice.area) + ' ' + L('econ.unit.sqm') + '</strong></div></div></div>';

      });
      metrics += '</div></div>';
    } else {
      metrics += '<div class="econ-results-section"><p style="color:var(--ink-faint);font-size:13px;margin:0">' + L('econ.metrics.empty') + '</p></div>';
    }

    metrics += '<div class="econ-results-farm"><div id="econ-elec-charts" class="econ-elec-charts-wrap"></div>' +
      '<p class="econ-results-sub">' + L('econ.metrics.elecMo') + '</p>' +
      '<div class="econ-table-scroll"><table class="econ-breakdown econ-elec-total"><tr><th>' + L('econ.tbl.article') + '</th><th>' + L('econ.tbl.kwh') + '</th><th>' + moneySym() + '</th></tr>';
    (res.elecBreakdown || []).forEach(function(row){
      const lbl = row.id === 'light' ? L('econ.elec.cat.light') : elecCatLabel(row.id);
      const sub = row.kw != null ? ' <span class="econ-tbl-sub">(' + tFmt('econ.elec.catSub', { kw: deps.r1(row.kw), h: deps.r1(row.h) }) + ')</span>' : '';
      metrics += '<tr><td>' + lbl + sub + '</td><td>' + deps.fmtNum(row.kwh || 0) + '</td><td>' + moneyFmt(row.cost) + '</td></tr>';
    });
    metrics += '<tr class="econ-row-total"><td><strong>' + L('econ.elec.total') + '</strong></td><td><strong>' + deps.fmtNum(res.totalElecKwhMonth || 0) + '</strong></td><td><strong>' + moneyFmt(res.totalElecCost || 0) + '</strong></td></tr></table></div></div>';
    deps.$('econ-results-metrics').innerHTML = metrics;

    let farmCards = '<div class="econ-results" style="margin-top:0">';
    if (res.sellKg > 0){
      farmCards += '<div class="m econ-out-card"><div class="m-label">' + L('econ.tbl.totalKg') + '</div><div class="m-val">' + deps.r1(res.sellKg) + ' <span class="m-u">' + uKg() + '</span></div></div>';
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

    const wasteRow = res.wastePct > 0
      ? '<tr><td>' + L('econ.bd.waste') + '</td><td colspan="2">' + deps.r1(res.wastePct) + '%</td></tr>'
      : '';
    let bd =
      '<tr><td>' + L('econ.bd.rent') + '</td><td>—</td><td>' + moneyFmt(res.rent) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.staffGross') + '</td><td>—</td><td>' + moneyFmt(res.staffGross) + '</td></tr>' +
      (res.payrollTax > 0 ? '<tr><td>' + L('econ.bd.payrollTax') + '</td><td>—</td><td>' + moneyFmt(res.payrollTax) + '</td></tr>' : '') +
      (res.payrollCustom > 0 ? '<tr><td>' + L('econ.bd.payrollCustom') + '</td><td>—</td><td>' + moneyFmt(res.payrollCustom) + '</td></tr>' : '') +
      (res.accountingMonth > 0 ? '<tr><td>' + L('econ.bd.accounting') + '</td><td>—</td><td>' + moneyFmt(res.accountingMonth) + '</td></tr>' : '') +
      '<tr><td>' + L('econ.bd.staff') + '</td><td>—</td><td>' + moneyFmt(res.staffTotal) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.logistics') + '</td><td>—</td><td>' + moneyFmt(res.logistics) + '</td></tr>';
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
