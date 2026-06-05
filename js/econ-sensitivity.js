/** Сценарии «что если» — только повторный вызов calcFarmEconomics, формулы не меняются */
(function(global){
  'use strict';

  function cloneEcon(e){
    return JSON.parse(JSON.stringify(e));
  }

  function scalePrices(e, factor){
    var c = cloneEcon(e);
    c.cultures = (c.cultures || []).map(function(row){
      var r = Object.assign({}, row);
      var sp = parseFloat(r.salePrice);
      if (sp > 0) r.salePrice = Math.max(0, sp * (1 + factor));
      return r;
    });
    return c;
  }

  function scaleYields(e, factor){
    var c = cloneEcon(e);
    c.cultures = (c.cultures || []).map(function(row){
      var r = Object.assign({}, row);
      r.yieldPerCut = Math.max(0, (parseFloat(r.yieldPerCut) || 0) * (1 + factor));
      return r;
    });
    return c;
  }

  function patchNum(e, key, factor){
    var c = cloneEcon(e);
    c[key] = Math.max(0, (parseFloat(c[key]) || 0) * (1 + factor));
    return c;
  }

  function scenLabel(id, fallback){ return (global.DG_t && global.DG_t('sens.' + id)) || fallback; }

  var SCENARIOS = [
    { id: 'base', labelKey: 'base', label: 'Текущий расчёт', apply: function(e){ return cloneEcon(e); } },
    { id: 'price-m10', labelKey: 'priceM10', label: 'Цена продажи −10%', apply: function(e){ return scalePrices(e, -0.1); } },
    { id: 'price-p10', labelKey: 'priceP10', label: 'Цена продажи +10%', apply: function(e){ return scalePrices(e, 0.1); } },
    { id: 'yield-m15', labelKey: 'yieldM15', label: 'Урожай −15%', apply: function(e){ return scaleYields(e, -0.15); } },
    { id: 'crisis', labelKey: 'crisis', label: 'Кризис: цена −10% и урожай −15%', apply: function(e){ return scalePrices(scaleYields(e, -0.15), -0.1); } },
    { id: 'waste-p5', labelKey: 'wasteP5', label: 'Брак +5 п.п.', apply: function(e){
      var c = cloneEcon(e);
      c.wastePct = Math.min(50, (parseFloat(c.wastePct) || 0) + 5);
      return c;
    }},
    { id: 'kwh-p20', labelKey: 'kwhP20', label: 'Электричество +20%', apply: function(e){ return patchNum(e, 'priceKwh', 0.2); } },
    { id: 'area-m10', labelKey: 'areaM10', label: 'Посевная площадь −10%', apply: function(e){ return patchNum(e, 'plantingArea', -0.1); } },
    { id: 'rent-p15', labelKey: 'rentP15', label: 'Аренда +15%', apply: function(e){ return patchNum(e, 'rentMonth', 0.15); } }
  ];

  var customRows = [];
  var sensDeps = null;

  function applyCustomAdjustments(e, adj){
    var c = cloneEcon(e);
    var price = parseFloat(adj.pricePct) || 0;
    var yieldF = parseFloat(adj.yieldPct) || 0;
    var waste = parseFloat(adj.wastePp) || 0;
    var kwh = parseFloat(adj.kwhPct) || 0;
    var area = parseFloat(adj.areaPct) || 0;
    var rent = parseFloat(adj.rentPct) || 0;
    if (price) c = scalePrices(c, price / 100);
    if (yieldF) c = scaleYields(c, yieldF / 100);
    if (waste) c.wastePct = Math.min(50, (parseFloat(c.wastePct) || 0) + waste);
    if (kwh) c = patchNum(c, 'priceKwh', kwh / 100);
    if (area) c = patchNum(c, 'plantingArea', area / 100);
    if (rent) c = patchNum(c, 'rentMonth', rent / 100);
    return c;
  }

  function readCustomAdjFromDom(){
    function v(id){ var el = document.getElementById(id); return el ? el.value : '0'; }
    return {
      pricePct: v('econ-custom-price'),
      yieldPct: v('econ-custom-yield'),
      wastePp: v('econ-custom-waste'),
      kwhPct: v('econ-custom-kwh'),
      areaPct: v('econ-custom-area'),
      rentPct: v('econ-custom-rent')
    };
  }

  function runScenarios(e, calcFarmEconomics, extra){
    var list = SCENARIOS.slice();
    (extra || []).forEach(function(cr, i){
      list.push({
        id: 'custom-' + i,
        label: cr.label,
        apply: function(base){ return applyCustomAdjustments(base, cr.adj); }
      });
    });
    return list.map(function(sc){
      var farm = calcFarmEconomics(sc.apply(e));
      return {
        id: sc.id,
        label: sc.labelKey ? scenLabel(sc.labelKey, sc.label) : sc.label,
        revenue: farm.revenue || 0,
        monthlyOpex: farm.monthlyOpex || 0,
        margin: farm.margin || 0,
        marginPct: farm.marginPct != null ? farm.marginPct : 0,
        unitCostKg: farm.unitCostKg || 0,
        sellKg: farm.sellKg || 0
      };
    });
  }

  function T(k){ return (global.DG_t && global.DG_t(k)) || k; }
  function TF(k, vars){ return global.DG_tFmt ? global.DG_tFmt(k, vars) : T(k); }

  function customScenarioFormHtml(){
    return '<div class="econ-custom-block">' +
      '<div class="econ-custom-title">' + T('sens.custom.title') + '</div>' +
      '<div class="econ-custom-form">' +
      '<label>' + T('sens.customLabel') + '<input type="text" id="econ-custom-label" maxlength="60" placeholder="' + T('sens.customPh') + '"></label>' +
      '<label>' + T('sens.custom.price') + '<input type="number" id="econ-custom-price" step="1" value="0"></label>' +
      '<label>' + T('sens.custom.yield') + '<input type="number" id="econ-custom-yield" step="1" value="0"></label>' +
      '<label>' + T('sens.custom.waste') + '<input type="number" id="econ-custom-waste" step="0.5" value="0"></label>' +
      '<label>' + T('sens.custom.kwh') + '<input type="number" id="econ-custom-kwh" step="1" value="0"></label>' +
      '<label>' + T('sens.custom.area') + '<input type="number" id="econ-custom-area" step="1" value="0"></label>' +
      '<label>' + T('sens.custom.rent') + '<input type="number" id="econ-custom-rent" step="1" value="0"></label>' +
      '</div>' +
      '<div class="econ-custom-actions">' +
      '<button type="button" class="auto-btn" id="econ-custom-run">' + T('sens.custom.add') + '</button>' +
      '<button type="button" class="auto-btn" id="econ-custom-clear">' + T('sens.custom.clear') + '</button>' +
      '</div></div>';
  }

  function paybackHint(farm, equipTotal){
    equipTotal = parseFloat(equipTotal) || 0;
    if (equipTotal <= 0) return T('sens.noEquip');
    if (farm.margin <= 0) return T('sens.negMargin');
    var months = equipTotal / farm.margin;
    if (months > 600) return T('sens.paybackLong');
    var mo = months < 120 ? months.toFixed(1) : String(Math.round(months));
    return TF('sens.paybackFmt', { months: mo, years: (months / 12).toFixed(1) });
  }

  function initEconSensitivityExtras(){
    var panel = document.getElementById('econ-panel-sensitivity');
    if (!panel || panel.dataset.sensBound) return;
    panel.dataset.sensBound = '1';
    panel.addEventListener('click', function(ev){
      var t = ev.target;
      if (!sensDeps) return;
      if (t.id === 'econ-custom-run'){
        var labelEl = document.getElementById('econ-custom-label');
        var label = (labelEl && labelEl.value.trim()) || T('sens.customDefault');
        customRows.push({ label: label, adj: readCustomAdjFromDom() });
        renderEconSensitivity(sensDeps);
      }
      if (t.id === 'econ-custom-clear'){
        customRows = [];
        renderEconSensitivity(sensDeps);
      }
    });
  }

  function renderEconSensitivity(deps){
    sensDeps = deps;
    var panel = document.getElementById('econ-sensitivity-body');
    if (!panel || !deps.getState || !deps.calcFarmEconomics) return;
    var e = deps.getState().econ;
    if (!e) {
      panel.innerHTML = '<p style="color:var(--ink-faint);font-size:13px">' + T('sens.empty') + '</p>';
      return;
    }

    var baseFarm = deps.calcFarmEconomics(e);
    var rows = runScenarios(e, deps.calcFarmEconomics, customRows);
    var base = rows[0] || { margin: 0, revenue: 0 };
    var sym = deps.currencySym ? deps.currencySym() : '₽';
    var perMo = deps.t ? deps.t('econ.perMonth') : '/мес';

    var html = '<p class="econ-sens-lead">' + T('sens.lead') + '</p>';
    html += '<p class="econ-sens-sync">' + T('sens.syncHint') + '</p>';
    html += '<p class="econ-sens-base">' + TF('sens.baseLine', {
      rev: deps.fmtMoney ? deps.fmtMoney(baseFarm.revenue) : deps.fmtNum(baseFarm.revenue),
      margin: deps.fmtMoney ? deps.fmtMoney(baseFarm.margin) : deps.fmtNum(baseFarm.margin),
      perMo: perMo
    }) + '</p>';
    html += '<p class="econ-sens-payback">' + paybackHint(baseFarm, deps.sumEconEquipment ? deps.sumEconEquipment() : 0) + '</p>';
    html += '<table class="econ-breakdown econ-sens-table"><thead><tr>' +
      '<th>' + T('sens.th.scenario') + '</th><th>' + (deps.t ? deps.t('sum.revenue') : T('econ.bd.revenue')) + ' ' + sym + perMo + '</th><th>' +
      (deps.t ? deps.t('sum.opex') : T('econ.metrics.opex')) + ' ' + sym + perMo + '</th><th>' +
      (deps.t ? deps.t('sum.margin') : T('econ.bd.margin')) + ' ' + sym + perMo + '</th><th>' + T('sens.th.marginPct') + '</th><th>' + T('sens.th.marginDelta') + '</th>' +
      '</tr></thead><tbody>';

    rows.forEach(function(r){
      var dMargin = r.margin - base.margin;
      var dCls = dMargin >= 0 ? 'econ-sens-up' : 'econ-sens-down';
      var dSign = dMargin > 0 ? '+' : '';
      html += '<tr' + (r.id === 'base' ? ' class="econ-sens-base"' : '') + '>' +
        '<td>' + r.label + '</td>' +
        '<td>' + (deps.fmtMoney ? deps.fmtMoney(r.revenue) : deps.fmtNum(r.revenue)) + '</td>' +
        '<td>' + (deps.fmtMoney ? deps.fmtMoney(r.monthlyOpex) : deps.fmtNum(r.monthlyOpex)) + '</td>' +
        '<td><strong>' + (deps.fmtMoney ? deps.fmtMoney(r.margin) : deps.fmtNum(r.margin)) + '</strong></td>' +
        '<td>' + deps.r1(r.marginPct) + '%</td>' +
        '<td class="' + dCls + '">' + (r.id === 'base' ? '—' : dSign + (deps.fmtMoney ? deps.fmtMoney(dMargin) : deps.fmtNum(dMargin))) + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    html += customScenarioFormHtml();
    panel.innerHTML = html;
  }

  global.DG_SCENARIOS = SCENARIOS;
  global.DG_runEconScenarios = runScenarios;
  global.DG_renderEconSensitivity = renderEconSensitivity;
  global.DG_initEconSensitivityExtras = initEconSensitivityExtras;
})(typeof window !== 'undefined' ? window : this);
