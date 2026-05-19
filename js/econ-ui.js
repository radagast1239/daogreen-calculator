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
    function parseMoney(v){ return deps.parseMoneyInput ? deps.parseMoneyInput(v) : deps.parseNumInput(v); }
    function fmtMoneyInp(rub, d){ return deps.formatMoneyInput ? deps.formatMoneyInput(rub, d) : deps.formatInputValue(rub, d); }
    function formToken(){ return deps.localeToken ? deps.localeToken() : 'ru'; }
    function isMoneyKey(k){ return deps.isMoneyEconKey && deps.isMoneyEconKey(k); }
    function isMoneyCult(f){ return deps.isMoneyCultField && deps.isMoneyCultField(f); }
    function moneyLabel(baseKey, perKey){
      return L(baseKey) + ', ' + moneySym() + L(perKey);
    }
    var ECON_MONTH_DAYS = deps.ECON_MONTH_DAYS;
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
    html += opt(ECON_SALAD_MIX_ID, L('econ.opt.mix'));
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
    if (!cvId || cvId === ECON_SALAD_MIX_ID) return false;
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
      }
      if (!isNaN(v) && (
        (k != null && isMoneyKey(k)) || inp.dataset.econEq != null || inp.dataset.econCustomAmount != null ||
        inp.dataset.econCulturePrice != null || (inp.dataset.econCultField != null && isMoneyCult(inp.dataset.econCultField))
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
      valEl.innerHTML = moneyFmt(raw) + '<span class="econ-equip-total-unit">' + moneySym() + '</span>';
    }
    if (hintEl){
      const months = Math.max(1, parseFloat(st().econ.amortMonths) || 60);
      const amort = inCalc && raw > 0 ? raw / months : 0;
      let txt = L('econ.equip.totalTxt');
      if (raw > 0 && inCalc){
        txt += ' · ≈ ' + moneyFmt(amort) + ' ' + moneySym() + L('econ.perMonth') + ' · ' + deps.fmtNum(months) + ' mo';
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

  function renderEconomicsEquipment(){
    deps.ensureEconEquipment();
    const wrap = deps.$('econ-equipment-groups');
    if (!wrap) return;
    const active = document.activeElement;
    const focusKey = active && wrap.contains(active) ? (active.dataset.econEq || active.dataset.econCustomAmount || active.dataset.econCustomLabel) : null;
    let html = '';
    const headRow = '<div class="econ-equip-row econ-equip-row--head"><span>' + L('econ.equip.head') + '</span><span style="text-align:right">' + L('econ.equip.amount') + ', ' + moneySym() + '</span><span></span></div>';
    equipmentGroups().forEach(grp => {
      html += '<div class="econ-equip-group"><h4>' + grp.title + '</h4><div class="econ-equip-items">' + headRow;
      grp.items.forEach(([k, label]) => {
        const val = st().econ.equipment[k] || 0;
        html += '<div class="econ-equip-row"><label for="econ-eq-' + k + '">' + label + '</label>' +
          '<input type="text" id="econ-eq-' + k + '" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" data-econ-eq="' + k + '" value="' + deps.formatInputValue(val, 0) + '">' +
          '<span></span></div>';
      });
      html += '</div></div>';
    });
    const custom = st().econ.equipmentCustom;
    html += '<div class="econ-equip-group"><h4>' + L('econ.equip.customGroup') + '</h4><div class="econ-equip-items" id="econ-equipment-custom-list">';
    if (custom.length) html += headRow;
    custom.forEach(it => { html += renderEconCustomEquipRow(it); });
    html += '</div><button type="button" class="auto-btn econ-equip-add-custom" id="econ-equipment-add-custom">+ ' + L('econ.equip.addBtn') + '</button></div>';
    wrap.innerHTML = html;
    syncEconEquipmentPanel();
    updateEconEquipmentTotal();
    if (focusKey){
      const el = wrap.querySelector('[data-econ-eq="' + focusKey + '"],[data-econ-custom-amount="' + focusKey + '"],[data-econ-custom-label="' + focusKey + '"]');
      if (el) el.focus();
    }
  }

  function bindEconomicsInputs(){
    document.querySelectorAll('[data-econ-key]').forEach(inp => {
      if (inp.dataset.econBound) return;
      inp.dataset.econBound = '1';
      inp.addEventListener('input', () => {
        const k = inp.dataset.econKey;
        if (k === 'payrollTax') return;
        const v = isMoneyKey(k) ? parseMoney(inp.value) : deps.parseNumInput(inp.value);
        st().econ[k] = isNaN(v) ? 0 : v;
        deps.saveEconStore();
        renderEconomics();
      });
    });
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
      const eq = t.dataset.econEq;
      if (eq){
        deps.ensureEconEquipment();
        st().econ.equipment[eq] = parseMoney(t.value) || 0;
        deps.saveEconStore();
        updateEconEquipmentTotal();
        renderEconomics();
      }
    });
  }

  function renderEconomicsForm(){
    const gen = deps.$('econ-inputs-general');
    var ft = formToken();
    if (!gen || gen.dataset.built === ft) return;
    gen.dataset.built = ft;
    gen.innerHTML =
      econNumInput('priceKwh', moneyLabel('econ.priceKwh', 'econ.perKwh'), { step: 0.1 }) +
      econNumInput('rentMonth', moneyLabel('econ.rentMonth', 'econ.perMonth'), { step: 1000 }) +
      econNumInput('staffCount', L('econ.staffCount'), { step: 1 }) +
      econNumInput('staffSalary', moneyLabel('econ.staffSalary', 'econ.perMonth'), { step: 1000 }) +
      econToggleHtml('econ-payroll-tax', L('econ.payrollTax'), st().econ.payrollTax) +
      econNumInput('logisticsMonth', moneyLabel('econ.logisticsMonth', 'econ.perMonth'), { step: 1000 }) +
      econNumInput('floorArea', L('econ.floorArea'), { step: 1 }) +
      econNumInput('plantingArea', L('econ.plantingArea'), { step: 1 }) +
      econNumInput('wastePct', L('econ.wastePct'), { step: 1, hint: L('econ.wastePct.hint') }) +
      econNumInput('salePrice', L('econ.salePrice'), { step: 10, hint: L('econ.salePrice.hint') }) +
      econNumInput('kwhPerM2Hour', L('econ.kwhPerM2Hour'), { step: 0.001, hint: L('econ.kwhPerM2Hour.hint') }) +
      econNumInput('lightHoursDay', L('econ.lightHoursDay'), { step: 0.5, hint: L('econ.lightHoursDay.hint') }) +
      econNumInput('amortMonths', L('econ.amortMonths'), { step: 1 });

    const costs = deps.$('econ-inputs-costs');
    if (costs && costs.dataset.built !== ft){
      costs.dataset.built = ft;
      costs.innerHTML =
      econNumInput('otherElecKw', L('econ.otherElecKw'), { step: 0.1, hint: L('econ.otherElecKw.hint') }) +
      econNumInput('otherElecHoursDay', L('econ.otherElecHoursDay'), { step: 0.5, hint: L('econ.otherElecHoursDay.hint') }) +
      '<div id="econ-other-elec-hint" class="econ-hint" style="grid-column:1/-1"></div>' +
      econNumInput('otherMonth', moneyLabel('econ.otherMonth', 'econ.perMonth'), { step: 1000, hint: L('econ.otherMonth.hint') }) +
      econNumInput('consumablesPerKg', L('econ.consumablesPerKg'), { step: 0.1, hint: L('econ.consumablesPerKg.hint') }) +
      econToggleHtml('econ-usn-tax', L('econ.usnTax'), st().econ.usnTax);
    }

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
    renderEconomicsEquipment();
    bindEconomicsInputs();
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
    return '<div><label>' + label + (yUnit ? ' (' + yUnit + ')' : '') + '</label>' +
      '<input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="' + dec + '" data-econ-cult-field="' + field + '" data-econ-cult-idx="' + i + '" value="' + disp + '"' + ph + title + '></div>';
  }

  function renderEconomicsCultures(){
    deps.ensureEconCultures();
    deps.migrateEconCultureRows();
    deps.dedupeEconCultures();
    const list = deps.$('econ-cultures-list');
    const totalEl = deps.$('econ-cultures-total');
    if (!list) return;

    let html = '';
    st().econ.cultures.forEach((row, i) => {
      const norm = deps.normalizeEconCultureRow(row);
      st().econ.cultures[i] = norm;
      const pct = norm.pct != null ? norm.pct : 0;
      const sp = norm.salePrice > 0 ? norm.salePrice : '';
      const bio = deps.econCultureBio(norm);
      const ySqm = bio.unitIsPieces ? deps.r1(bio.yieldPerSqmMonthPcs) + ' ' + L('econ.yield.pcsSqm') : deps.r2(bio.yieldPerSqmMonthKg) + ' ' + L('econ.yield.kgSqm');
      html += '<div class="econ-culture-card" data-econ-culture-idx="' + i + '">' +
        '<div class="econ-culture-head">' +
        '<div><label>' + L('econ.cult.culture') + '</label><select data-econ-culture-cv="' + i + '">' + getEconCultureOptionsHtml(norm.cvId || '', i) + '</select></div>' +
        '<div><label>' + L('econ.cult.share') + '</label><input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="1" data-econ-culture-pct="' + i + '" value="' + deps.formatInputValue(pct, 1) + '"></div>' +
        '<div><label>' + L('econ.cult.price') + ', ' + moneySym() + '</label><input type="text" inputmode="decimal" class="econ-num-fmt" data-econ-decimals="0" placeholder="—" data-econ-culture-price="' + i + '" value="' + (sp ? fmtMoneyInp(sp, 0) : '') + '"></div>' +
        '<button type="button" class="econ-rm" data-econ-culture-rm="' + i + '" title="' + L('econ.btn.remove') + '" aria-label="' + L('econ.btn.remove') + '">×</button>' +
        '</div>' +
        '<div class="econ-culture-params">' +
        econCultParamInput(i, 'density', L('econ.cult.density'), { step: 1 }) +
        econCultParamInput(i, 'yieldPerCut', L('econ.cult.yield'), { step: 0.1, title: L('econ.cult.yieldHint') }) +
        econCultParamInput(i, 'cutIntervalDays', L('econ.cult.interval'), { step: 1, min: 1 }) +
        econCultParamInput(i, 'kwhPerM2Hour', L('econ.cult.lightKwh'), { step: 0.001 }) +
        econCultParamInput(i, 'lightHoursDay', L('econ.cult.lightH'), { step: 0.5 }) +
        econCultParamInput(i, 'consumablesPerPot', L('econ.cult.consPot') + ', ' + moneySym(), {
          step: 0.5, decimals: 1, placeholder: String(ECON_CONSUMABLES_PER_POT_HINT),
          title: L('econ.cult.consPot')
        }) +
        econCultParamInput(i, 'potHarvestMonths', L('econ.cult.potLife'), { step: 0.5, decimals: 1 }) +
        '</div>' +
        '<p class="econ-culture-hint">' + deps.formatEconCultureHint(norm) + '</p>' +
        '</div>';
    });
    list.innerHTML = html;

    const total = deps.econCulturesTotalPct();
    if (totalEl){
      let cls = 'ok';
      let msg = '<strong>' + tFmt('econ.share.sum', { total: deps.r1(total) }) + '</strong>';
      if (total > 100){ cls = 'bad'; msg += L('econ.share.over'); }
      else if (total < 100) { cls = 'warn'; msg += tFmt('econ.share.free', { free: deps.r1(100 - total) }); }
      totalEl.className = 'econ-cultures-total ' + cls;
      totalEl.innerHTML = msg + tFmt('econ.rows', { n: st().econ.cultures.length, max: ECON_MAX_CULTURES });
    }
    const addBtn = deps.$('econ-add-culture');
    const mixBtn = deps.$('econ-add-salad-mix');
    if (addBtn){
      addBtn.disabled = !deps.canAddEconCulture();
      addBtn.title = addBtn.disabled ? tFmt('econ.add.max', { max: ECON_MAX_CULTURES }) : L('econ.add.row');
    }
    if (mixBtn){
      const mixOverlap = st().econ.cultures.some(c =>
        c.cvId && c.cvId !== ECON_SALAD_MIX_ID && ECON_SALAD_MIX_CV_IDS.indexOf(c.cvId) >= 0
      );
      mixBtn.disabled = !deps.canAddEconCulture()
        || st().econ.cultures.some(c => c.cvId === ECON_SALAD_MIX_ID)
        || mixOverlap;
      if (mixOverlap) mixBtn.title = L('econ.mix.overlap');
    }
  }

  function bindEconomicsCultures(){
    const list = deps.$('econ-cultures-list');
    if (!list || list.dataset.econCulturesBound) return;
    list.dataset.econCulturesBound = '1';

    list.addEventListener('change', e => {
      const cvSel = e.target.dataset.econCultureCv;
      const pctInp = e.target.dataset.econCulturePct;
      const priceInp = e.target.dataset.econCulturePrice;
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
        const hint = e.target.closest('.econ-culture-card')?.querySelector('.econ-culture-hint');
        if (hint){
          const bio = deps.econCultureBio(st().econ.cultures[i]);
      const ySqm = bio.unitIsPieces ? deps.r1(bio.yieldPerSqmMonthPcs) + ' ' + L('econ.yield.pcsSqm') : deps.r2(bio.yieldPerSqmMonthKg) + ' ' + L('econ.yield.kgSqm');
      hint.innerHTML = deps.formatEconCultureHint(st().econ.cultures[i]);
        }
        return;
      }
      if (e.target.dataset.econCulturePct == null && e.target.dataset.econCulturePrice == null) return;
      const i = parseInt(e.target.dataset.econCulturePct != null ? e.target.dataset.econCulturePct : e.target.dataset.econCulturePrice, 10);
      deps.ensureEconCultures();
      if (e.target.dataset.econCulturePct != null){
        st().econ.cultures[i].pct = deps.parseNumInput(e.target.value) || 0;
      } else {
        st().econ.cultures[i].salePrice = parseMoney(e.target.value) || 0;
      }
      deps.saveEconStore();
      const totalEl = deps.$('econ-cultures-total');
      const total = deps.econCulturesTotalPct();
      if (totalEl){
        let cls = total > 100 ? 'bad' : (total < 100 ? 'warn' : 'ok');
        totalEl.className = 'econ-cultures-total ' + cls;
        totalEl.innerHTML = '<strong>' + tFmt('econ.share.sum', { total: deps.r1(total) }) + '</strong>' +
          (total > 100 ? L('econ.share.overShort') : (total < 100 ? tFmt('econ.share.freeShort', { free: deps.r1(100 - total) }) : ''));
      }
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
      '<dt>' + L('econ.snap.light') + '</dt><dd>' + deps.r3(snap.kwhPerM2Hour) + ' кВт·ч/м²·ч · ' + deps.r1(snap.lightHoursDay) + ' ч/сут</dd>' +
      '</dl>';
  }

  function renderEconomics(){
    renderEconomicsForm();
    renderEconomicsCultures();
    syncEconInputsFromState();
    syncEconEquipmentPanel();
    updateEconEquipmentTotal();
    deps.migrateEconOtherElectricity(st().econ);
    const farm = deps.calcFarmEconomics(st().econ);
    const parts = farm.parts;
    const e = st().econ;

    const saleInp = document.querySelector('[data-econ-key="salePrice"]');
    if (saleInp){
      const saleLbl = saleInp.closest('.econ-field')?.querySelector('label');
      if (saleLbl){
        var u = farm.outputUnit;
        var per = (u === L('econ.unit.pcs') || u === 'шт') ? L('econ.perPcs').replace('/', '') : ((u === L('econ.unit.mixed') || u === 'смеш.') ? 'kg|pc' : 'kg');
        saleLbl.textContent = L('econ.salePrice') + ', ' + moneySym() + '/' + per;
      }
    }

    const intro = deps.$('econ-intro');
    if (intro){
      intro.innerHTML = tFmt('econ.intro.html', {
        area: deps.r1(farm.plantingArea),
        warn: farm.totalPct > 100 ? tFmt('econ.intro.warn', { pct: deps.r1(farm.totalPct) }) : ''
      });
    }

    renderEconWarnings(farm.warnings || []);

    const derived = deps.$('econ-derived-panel');
    if (derived){
      if (parts.length){
        let tbl = '<table class="econ-breakdown"><tr><th>' + L('econ.derived.th') + '</th><th>' + L('econ.derived.rho') + '</th><th>' + L('econ.derived.cut') + '</th><th>' + L('econ.derived.interval') + '</th><th>' + L('econ.derived.cutsMo') + '</th><th>' + L('econ.derived.yield') + '</th><th>' + L('econ.derived.kwh') + '</th><th>' + L('econ.derived.lightH') + '</th></tr>';
        parts.forEach(p => {
          const b = p.bio;
          const y = b.unitIsPieces ? deps.r1(b.yieldPerSqmMonthPcs) + ' ' + uPcs() : deps.r2(b.yieldPerSqmMonthKg) + ' ' + uKg();
          const yc = b.unitIsPieces ? uPcs() : uG();
          tbl += '<tr><td>' + p.name + '</td><td>' + deps.round(b.density) + '</td><td>' + deps.r1(b.yieldPerCut) + ' ' + yc + '</td><td>' + deps.r1(b.cutIntervalDays) + '</td><td>' + deps.r1(b.cutsPerMonth) + '</td><td>' + y + '</td><td>' + deps.r3(b.kwhPerM2Hour) + '</td><td>' + deps.r1(b.lightHoursDay) + '</td></tr>';
        });
        derived.innerHTML = '<div class="econ-table-scroll">' + tbl + '</table></div>';
      } else {
        derived.innerHTML = '<p style="color:var(--ink-faint);font-size:13px">' + L('econ.derived.empty') + '</p>';
      }
    }

    const res = farm;
    const wasteFactor = 1 - deps.clamp(res.wastePct || 0, 0, 50) / 100;
    const hasKg = res.sellKg > 0 || res.outKg > 0;
    const hasPcs = res.sellPcs > 0 || res.outPcs > 0;
    const mixed = hasKg && hasPcs;

    const cultTbl = deps.$('econ-cultures-breakdown');
    if (cultTbl){
      if (parts.length){
        let ch = '<tr><th>' + L('econ.cult.culture') + '</th><th>%</th><th>' + L('econ.unit.sqm') + '</th><th>' + L('econ.tbl.out') + '</th><th>' + L('econ.tbl.cost') + '</th><th>' + moneySym() + L('econ.perSqm') + '</th><th>' + L('econ.tbl.rev') + '</th><th>' + L('econ.tbl.margin') + '</th></tr>';
        parts.forEach(p => {
          const u = p.slice.outputUnit;
          const gross = p.slice.monthlyOutput;
          const sell = gross * wasteFactor;
          let out = '—';
          if (gross > 0){
            const gStr = u === 'кг' ? deps.r1(gross) : deps.fmtNum(gross);
            const sStr = u === 'кг' ? deps.r1(sell) : deps.fmtNum(sell);
            out = res.wastePct > 0 ? gStr + ' → ' + sStr + ' ' + uOut(u) : gStr + ' ' + uOut(u);
          }
          const uc = p.slice.unitCostFull > 0 ? deps.fmtNum(p.slice.unitCostFull) : '—';
          const consSqm = p.slice.consumablesPerSqm > 0 ? deps.fmtNum(p.slice.consumablesPerSqm) : '—';
          const uLbl = u === 'шт' ? moneySym() + L('econ.perPcs') : moneySym() + L('econ.perKg');
          ch += '<tr><td>' + p.name + '</td><td>' + deps.r1(p.pct) + '</td><td>' + deps.r1(p.slice.area) + '</td><td>' + out + '</td><td>' + uc + ' ' + uLbl + '</td><td>' + consSqm + '</td><td>' + moneyFmt(p.slice.revenue * wasteFactor) + '</td><td>' + moneyFmt(p.slice.margin) + '</td></tr>';
        });
        const pctShow = deps.r1(farm.totalPct > 100 ? 100 : farm.totalPct);
        if (hasKg){
          ch += '<tr class="econ-total-row"><td><strong>' + L('econ.tbl.totalKg') + '</strong></td><td>' + pctShow + '</td><td>' + deps.r1(farm.areaUsed) + '</td><td>' +
            (res.sellKg > 0 ? deps.r1(res.sellKg) + ' ' + uKg() + (res.wastePct > 0 ? tFmt('econ.waste', { pct: deps.r1(res.wastePct) }) : '') : '—') +
            '</td><td><strong>' + (res.unitCostKg > 0 ? moneyFmt(res.unitCostKg) : '—') + '</strong></td><td>—</td><td><strong>' + moneyFmt(res.revKg) + '</strong></td><td><strong>' + moneyFmt(res.marginKg) + '</strong></td></tr>';
        }
        if (hasPcs){
          ch += '<tr class="econ-total-row"><td><strong>' + L('econ.tbl.totalPcs') + '</strong></td><td>' + (mixed ? '—' : pctShow) + '</td><td>' + (mixed ? '—' : deps.r1(farm.areaUsed)) + '</td><td>' +
            (res.sellPcs > 0 ? deps.fmtNum(res.sellPcs) + ' ' + uPcs() + (res.wastePct > 0 && !mixed ? tFmt('econ.waste', { pct: deps.r1(res.wastePct) }) : '') : '—') +
            '</td><td><strong>' + (res.unitCostPcs > 0 ? moneyFmt(res.unitCostPcs) : '—') + '</strong></td><td>—</td><td><strong>' + moneyFmt(res.revPcs) + '</strong></td><td><strong>' + moneyFmt(res.marginPcs) + '</strong></td></tr>';
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
        const unitLbl = u === 'шт' ? moneySym() + L('econ.perPcs') : moneySym() + L('econ.perKg');
        const outLbl = u === 'шт' ? L('econ.out.pcsMo') : L('econ.out.kgMo');
        const outVal = u === 'кг' ? (sell > 0 ? deps.fmtNum(sell, {decimals: 1}) : '—') : (sell > 0 ? deps.fmtNum(sell) : '—');
        const consSqm = p.slice.consumablesPerSqm > 0 ? moneyFmt(p.slice.consumablesPerSqm) : '—';
        const consMo = p.slice.consumablesCost > 0 ? moneyFmt(p.slice.consumablesCost) : '—';
        const hm = p.slice.potHarvestMonths || 3;
        const consOnceSqm = p.slice.consumablesPerSqmOnce > 0 ? moneyFmt(p.slice.consumablesPerSqmOnce) : '—';
        const consOnceArea = p.slice.consumablesOnce > 0 ? moneyFmt(p.slice.consumablesOnce) : '—';
        const consPerKg = (sell > 0 && p.slice.consumablesCost > 0 && u === 'кг') ? (p.slice.consumablesCost / sell) : 0;
        const consShare = (uc > 0 && consPerKg > 0) ? deps.r1((consPerKg / uc) * 100) : null;
        metrics += '<div class="econ-culture-metric"><div class="name">' + p.name + '</div>' +
          '<div class="line"><span>' + L('econ.metrics.unitCost') + '</span><strong>' + (uc > 0 ? moneyFmt(uc) : '—') + ' ' + unitLbl + '</strong></div>' +
          (consShare ? '<div class="line"><span>' + L('econ.metrics.consShare') + '</span><strong>~' + moneyFmt(consPerKg) + ' ' + unitLbl + ' (' + consShare + '%)</strong></div>' : '') +
          '<div class="line"><span>' + L('econ.metrics.sowOnce') + '</span><strong>' + consOnceSqm + ' ' + moneySym() + L('econ.perSqm') + '</strong> · ' + consOnceArea + ' ' + moneySym() + '</div>' +
          '<div class="line"><span>' + L('econ.metrics.sowMo') + '</span><strong>' + consSqm + ' ' + moneySym() + L('econ.perSqmMonth') + '</strong></div>' +
          '<div class="line"><span>' + L('econ.metrics.consArea') + '</span><strong>' + consMo + ' ' + moneySym() + L('econ.perMonth') + '</strong></div>' +
          '<div class="line"><span>' + L('econ.metrics.out') + '</span><strong>' + outVal + ' ' + outLbl + '</strong></div>' +
          '<div class="line"><span>' + L('econ.metrics.share') + '</span><strong>' + deps.r1(p.pct) + '% · ' + deps.r1(p.slice.area) + ' ' + L('econ.unit.sqm') + '</strong></div></div>';

      });
      metrics += '</div></div>';
    } else {
      metrics += '<div class="econ-results-section"><p style="color:var(--ink-faint);font-size:13px;margin:0">' + L('econ.metrics.empty') + '</p></div>';
    }
    const oE = res.otherElec || {};
    metrics += '<div class="econ-results-farm"><p class="econ-results-sub">' + L('econ.metrics.elecMo') + '</p>' +
      '<div class="econ-table-scroll"><table class="econ-breakdown econ-elec-total"><tr><th>' + L('econ.tbl.article') + '</th><th>' + L('econ.tbl.kwh') + '</th><th>' + moneySym() + '</th></tr>' +
      '<tr><td>' + L('econ.elec.light') + '</td><td>' + deps.fmtNum(res.lightKwhMonth || 0) + '</td><td>' + moneyFmt(res.lightCost) + '</td></tr>' +
      '<tr><td>' + tFmt('econ.elec.other', { kw: deps.r1(oE.kw || 0), h: deps.r1(oE.hoursDay || 0) }) + '</td><td>' + deps.fmtNum(res.otherElecKwhMonth || 0) + '</td><td>' + moneyFmt(res.otherElecCost) + '</td></tr>' +
      '<tr class="econ-row-total"><td><strong>' + L('econ.elec.total') + '</strong></td><td><strong>' + deps.fmtNum(res.totalElecKwhMonth || 0) + '</strong></td><td><strong>' + moneyFmt(res.totalElecCost || 0) + '</strong></td></tr></table></div></div>';
    metrics += '<div class="econ-results-farm"><p class="econ-results-sub">' + L('econ.metrics.farm') + '</p><div class="econ-results" style="margin-top:0">' +
      '<div class="m"><div class="m-label">' + L('econ.metrics.opex') + '</div><div class="m-val">' + moneyFmt(res.monthlyOpex) + '<span class="m-unit">' + moneySym() + '</span></div></div>' +
      '<div class="m ' + (res.margin >= 0 ? 'hl' : 'bad-tint') + '"><div class="m-label">' + L('econ.metrics.marginAll') + '</div><div class="m-val">' + moneyFmt(res.margin) + '<span class="m-unit">' + moneySym() + '</span></div></div>' +
      '</div></div>';
    deps.$('econ-results-metrics').innerHTML = metrics;

    const otherHint = deps.$('econ-other-elec-hint');
    if (otherHint){
      otherHint.textContent = tFmt('econ.otherElecHint', { kwh: deps.fmtNum(res.otherElecKwhMonth || 0), days: ECON_MONTH_DAYS });
    }


    const wasteRow = res.wastePct > 0
      ? '<tr><td>' + L('econ.bd.waste') + '</td><td colspan="2">' + deps.r1(res.wastePct) + '%</td></tr>'
      : '';
    deps.$('econ-breakdown-table').innerHTML =
      '<tr><th>' + L('econ.tbl.article') + '</th><th>' + L('econ.tbl.kwhMo') + '</th><th>' + moneySym() + L('econ.perMonth') + '</th></tr>' +
      '<tr><td>' + L('econ.bd.rent') + '</td><td>—</td><td>' + moneyFmt(res.rent) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.staff') + '</td><td>—</td><td>' + moneyFmt(res.staffTotal) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.logistics') + '</td><td>—</td><td>' + moneyFmt(res.logistics) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.light') + '</td><td>' + deps.fmtNum(res.lightKwhMonth || 0) + '</td><td>' + moneyFmt(res.lightCost) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.otherElec') + '</td><td>' + deps.fmtNum(res.otherElecKwhMonth || 0) + '</td><td>' + moneyFmt(res.otherElecCost) + '</td></tr>' +
      '<tr class="econ-row-total"><td><strong>' + L('econ.bd.elecTotal') + '</strong></td><td><strong>' + deps.fmtNum(res.totalElecKwhMonth || 0) + '</strong></td><td><strong>' + moneyFmt(res.totalElecCost || 0) + '</strong></td></tr>' +
      '<tr><td>' + L('econ.bd.other') + '</td><td>—</td><td>' + moneyFmt(res.other) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.amort') + '</td><td>—</td><td>' + moneyFmt(res.equipAmort) + '</td></tr>' +
      '<tr><td>' + L('econ.bd.consumables') + '</td><td>—</td><td>' + moneyFmt(res.consumablesCost) + '</td></tr>' +
      '<tr><td><strong>' + L('econ.bd.opexTotal') + '</strong></td><td>—</td><td><strong>' + moneyFmt(res.monthlyOpex) + '</strong></td></tr>' +
      wasteRow +
      '<tr><td>' + L('econ.bd.revenue') + '</td><td>—</td><td>' + moneyFmt(res.revenue) + '</td></tr>' +
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
