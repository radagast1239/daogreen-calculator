/** Сезонность, площадки, каналы сбыта, инфляция — поверх calcFarmEconomics */
(function(global){
  'use strict';

  var MONTH_IDS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  function T(k){ return (global.DG_t && global.DG_t(k)) || k; }
  function TF(k, v){ return global.DG_tFmt ? global.DG_tFmt(k, v) : T(k); }
  function monthLbl(i){ return T('adv.month.' + MONTH_IDS[i]); }

  function cloneEcon(e){ return JSON.parse(JSON.stringify(e)); }

  function scaleEconCosts(c, factor){
    if (global.DG_scaleEconCostFields) return global.DG_scaleEconCostFields(c, factor);
    if (!(factor > 0) || factor === 1) return c;
    c.rentMonth = (parseFloat(c.rentMonth) || 0) * factor;
    c.priceKwh = (parseFloat(c.priceKwh) || 0) * factor;
    c.otherMonth = (parseFloat(c.otherMonth) || 0) * factor;
    c.logisticsMonth = (parseFloat(c.logisticsMonth) || 0) * factor;
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
      return r;
    });
    c._costScale = (parseFloat(c._costScale) || 1) * factor;
    return c;
  }

  function ensureExtensions(state, defaults){
    if (!state.econChannels || !state.econChannels.length){
      var sp = 850;
      if (state.econ && state.econ.cultures && state.econ.cultures.length){
        var priced = state.econ.cultures.map(function(r){ return parseFloat(r.salePrice) || 0; }).filter(function(v){ return v > 0; });
        if (priced.length) sp = priced.reduce(function(s, v){ return s + v; }, 0) / priced.length;
      }
      state.econChannels = [
        { id: 'retail', name: T('adv.retail'), price: sp, sharePct: 60 },
        { id: 'horeca', name: 'HoReCa', price: Math.round(sp * 1.15), sharePct: 40 }
      ];
    }
    if (!state.econSites) state.econSites = [];
    if (!state.econSeasonality){
      state.econSeasonality = { priceIdx: MONTH_IDS.map(function(){ return 1; }), yieldIdx: MONTH_IDS.map(function(){ return 1; }), costIdx: MONTH_IDS.map(function(){ return 1; }) };
    }
    if (!state.econInflation){
      state.econInflation = { years: 5, rentPctY: 5, kwhPctY: 3, otherPctY: 4, pricePctY: 4, payrollPctY: 5, logisticsPctY: 4 };
    }
    if (state.econInflation.payrollPctY == null) state.econInflation.payrollPctY = 5;
    if (state.econInflation.logisticsPctY == null) state.econInflation.logisticsPctY = 4;
    if (state.econInflation.pricePctY == null) state.econInflation.pricePctY = 4;
  }

  function blendedPrice(e, channels){
    var sum = 0, w = 0;
    (channels || []).forEach(function(ch){
      var p = parseFloat(ch.price) || 0;
      var s = parseFloat(ch.sharePct) || 0;
      if (p > 0 && s > 0){ sum += p * s; w += s; }
    });
    if (w <= 0) return 0;
    return sum / w;
  }

  function applyChannels(e, channels){
    var c = cloneEcon(e);
    var bp = blendedPrice(e, channels);
    if (!(bp > 0)) return c;
    c.cultures = (c.cultures || []).map(function(row){
      var r = Object.assign({}, row);
      if (!(parseFloat(r.salePrice) > 0)) r.salePrice = bp;
      return r;
    });
    return c;
  }

  function applySeasonMonth(e, sens, mi){
    var c = cloneEcon(e);
    var pi = sens.priceIdx[mi] != null ? sens.priceIdx[mi] : 1;
    var yi = sens.yieldIdx[mi] != null ? sens.yieldIdx[mi] : 1;
    var ci = sens.costIdx[mi] != null ? sens.costIdx[mi] : 1;
    scaleEconCosts(c, ci);
    c.cultures = (c.cultures || []).map(function(row){
      var r = Object.assign({}, row);
      r.yieldPerCut = (parseFloat(r.yieldPerCut) || 0) * yi;
      var sp = parseFloat(r.salePrice);
      if (sp > 0) r.salePrice = sp * pi;
      return r;
    });
    return c;
  }

  function inflateEcon(e, inf, year){
    var c = cloneEcon(e);
    if (year <= 0) return c;
    var fRent = Math.pow(1 + (inf.rentPctY || 0) / 100, year);
    var fKwh = Math.pow(1 + (inf.kwhPctY || 0) / 100, year);
    var fOther = Math.pow(1 + (inf.otherPctY || 0) / 100, year);
    var fPayroll = Math.pow(1 + (inf.payrollPctY || 0) / 100, year);
    var fLog = Math.pow(1 + (inf.logisticsPctY || 0) / 100, year);
    var fPrice = Math.pow(1 + (inf.pricePctY || 0) / 100, year);
    c.rentMonth = (parseFloat(c.rentMonth) || 0) * fRent;
    c.priceKwh = (parseFloat(c.priceKwh) || 0) * fKwh;
    c.otherMonth = (parseFloat(c.otherMonth) || 0) * fOther;
    c.logisticsMonth = (parseFloat(c.logisticsMonth) || 0) * fLog;
    c.consumablesPerKg = (parseFloat(c.consumablesPerKg) || 0) * fOther;
    c.consumablesPerPcs = (parseFloat(c.consumablesPerPcs) || 0) * fOther;
    c.accountingMonth = (parseFloat(c.accountingMonth) || 0) * fPayroll;
    c.staffLines = (c.staffLines || []).map(function(row){
      return Object.assign({}, row, { salary: (parseFloat(row.salary) || 0) * fPayroll });
    });
    c.payrollCustom = (c.payrollCustom || []).map(function(row){
      return Object.assign({}, row, { amount: (parseFloat(row.amount) || 0) * fPayroll });
    });
    c.cultures = (c.cultures || []).map(function(row){
      var r = Object.assign({}, row);
      var cp = parseFloat(r.consumablesPerPot);
      if (cp > 0) r.consumablesPerPot = cp * fOther;
      var sp = parseFloat(r.salePrice);
      if (sp > 0) r.salePrice = sp * fPrice;
      return r;
    });
    c._costScale = fOther;
    return c;
  }

  function mf(deps, n){ return deps.fmtMoney ? deps.fmtMoney(n) : deps.fmtNum(n); }
  function sym(deps){ return deps.currencySym ? deps.currencySym() : '₽'; }

  function renderAdvancedPanel(deps){
    var root = document.getElementById('econ-advanced-body');
    if (!root || !deps.getState) return;
    var state = deps.getState();
    ensureExtensions(state);
    var e = state.econ;
    if (!e){
      root.innerHTML = '<p style="color:var(--ink-faint)">' + T('adv.fill') + '</p>';
      return;
    }

    var html = '';

    html += '<div class="adv-block"><h4 class="adv-h">' + T('adv.channelsTitle') + '</h4>' +
      '<p class="adv-lead">' + T('adv.channelsLead') + '</p>' +
      '<table class="econ-breakdown adv-table"><thead><tr><th>' + T('adv.channel') + '</th><th>' + (deps.t ? deps.t('econ.cult.price') : T('econ.cult.price')) + ' ' + sym(deps) + '</th><th>' + T('adv.share') + '</th></tr></thead><tbody>';
    state.econChannels.forEach(function(ch, i){
      html += '<tr><td><input type="text" data-ch-name="' + i + '" value="' + deps.esc(ch.name) + '"></td>' +
        '<td><input type="number" data-ch-price="' + i + '" value="' + (ch.price || '') + '"></td>' +
        '<td><input type="number" data-ch-share="' + i + '" value="' + (ch.sharePct != null ? ch.sharePct : '') + '"></td></tr>';
    });
    html += '</tbody></table>';
  var chFarm = deps.calcFarmEconomics(applyChannels(e, state.econChannels));
    html += '<p class="adv-note">' + TF('adv.blended', { price: mf(deps, blendedPrice(e, state.econChannels)) + ' ' + sym(deps), margin: mf(deps, chFarm.margin) + sym(deps), perMo: deps.t ? deps.t('econ.perMonth') : '/mo' }) + '</p></div>';

    html += '<div class="adv-block"><h4 class="adv-h">' + T('adv.sitesTitle') + '</h4>' +
      '<p class="adv-lead">' + T('adv.sitesLead') + '</p>' +
      '<ul class="adv-sites-list">';
    var totRev = 0, totMargin = 0;
    state.econSites.forEach(function(site, si){
      if (deps.migrateEconOtherElectricity) deps.migrateEconOtherElectricity(site.econ);
      var f = deps.calcFarmEconomics(site.econ);
      totRev += f.revenue || 0;
      totMargin += f.margin || 0;
      html += '<li>' + TF('adv.siteRow', { name: deps.esc(site.name), margin: mf(deps, f.margin), sym: sym(deps), area: deps.r1(f.plantingArea) }) + ' ' +
        '<button type="button" class="auto-btn adv-rm-site" data-site-rm="' + si + '">×</button></li>';
    });
    html += '</ul><p class="adv-note">' + TF('adv.sitesTotal', { rev: mf(deps, totRev), sym: sym(deps), margin: mf(deps, totMargin), perMo: deps.t ? deps.t('econ.perMonth') : '/mo' }) + '</p>' +
      '<button type="button" class="auto-btn" id="adv-add-site">' + T('adv.addSite') + '</button></div>';

    html += '<div class="adv-block"><h4 class="adv-h">' + T('adv.seasonTitle') + '</h4>' +
      '<p class="adv-lead">' + T('adv.seasonLead') + '</p>' +
      '<table class="econ-breakdown adv-table adv-season"><thead><tr><th>' + T('adv.seasonMonth') + '</th><th>' + T('adv.seasonPrice') + '</th><th>' + T('adv.seasonYield') + '</th><th>' + T('adv.seasonCost') + '</th><th>' + T('adv.seasonMargin') + '</th></tr></thead><tbody>';
    var sens = state.econSeasonality;
    var yearMargin = 0;
    for (var m = 0; m < 12; m++){
      var em = applySeasonMonth(e, sens, m);
      if (state.econChannels.length) em = applyChannels(em, state.econChannels);
      var fm = deps.calcFarmEconomics(em);
      yearMargin += fm.margin || 0;
      html += '<tr><td>' + monthLbl(m) + '</td>' +
        '<td><input type="number" step="0.05" min="0" data-seas="price" data-m="' + m + '" value="' + sens.priceIdx[m] + '"></td>' +
        '<td><input type="number" step="0.05" min="0" data-seas="yield" data-m="' + m + '" value="' + sens.yieldIdx[m] + '"></td>' +
        '<td><input type="number" step="0.05" min="0" data-seas="cost" data-m="' + m + '" value="' + sens.costIdx[m] + '"></td>' +
        '<td>' + mf(deps, fm.margin) + '</td></tr>';
    }
    html += '</tbody></table><p class="adv-note">' + TF('adv.yearMargin', { margin: mf(deps, yearMargin), sym: sym(deps) }) + '</p></div>';

    var inf = state.econInflation;
    html += '<div class="adv-block"><h4 class="adv-h">' + T('adv.infTitle') + '</h4>' +
      '<p class="adv-lead">' + T('adv.infHint') + '</p>' +
      '<div class="adv-infl-form">' +
      '<label>' + T('adv.infYears') + ' <input type="number" id="adv-inf-years" min="1" max="20" value="' + inf.years + '"></label>' +
      '<label>' + T('adv.infRent') + ' <input type="number" id="adv-inf-rent" step="0.5" value="' + inf.rentPctY + '"></label>' +
      '<label>' + T('adv.infKwh') + ' <input type="number" id="adv-inf-kwh" step="0.5" value="' + inf.kwhPctY + '"></label>' +
      '<label>' + T('adv.infOther') + ' <input type="number" id="adv-inf-other" step="0.5" value="' + inf.otherPctY + '"></label>' +
      '<label>' + T('adv.infPayroll') + ' <input type="number" id="adv-inf-payroll" step="0.5" value="' + inf.payrollPctY + '"></label>' +
      '<label>' + T('adv.infLogistics') + ' <input type="number" id="adv-inf-logistics" step="0.5" value="' + inf.logisticsPctY + '"></label>' +
      '<label>' + T('adv.infPrice') + ' <input type="number" id="adv-inf-price" step="0.5" value="' + inf.pricePctY + '"></label>' +
      '</div><table class="econ-breakdown adv-table"><thead><tr><th>' + T('adv.year') + '</th><th>' + (deps.t ? deps.t('sum.opex') : T('econ.metrics.opex')) + ' ' + sym(deps) + '</th><th>' + (deps.t ? deps.t('sum.margin') : T('econ.bd.margin')) + ' ' + sym(deps) + '</th></tr></thead><tbody>';
    var baseF = deps.calcFarmEconomics(applyChannels(e, state.econChannels));
    for (var y = 0; y <= (inf.years || 5); y++){
      var ey = y === 0 ? applyChannels(e, state.econChannels) : inflateEcon(applyChannels(e, state.econChannels), inf, y);
      var fy = deps.calcFarmEconomics(ey);
      html += '<tr><td>' + (y === 0 ? T('adv.now') : '+' + y) + '</td><td>' + mf(deps, fy.monthlyOpex) + '</td><td>' + mf(deps, fy.margin) + '</td></tr>';
    }
    html += '</tbody></table></div>';

    root.innerHTML = html;

    root.querySelectorAll('[data-ch-name]').forEach(function(inp){
      inp.addEventListener('change', function(){
        var i = +inp.dataset.chName;
        state.econChannels[i].name = inp.value;
        renderAdvancedPanel(deps);
      });
    });
    root.querySelectorAll('[data-ch-price]').forEach(function(inp){
      inp.addEventListener('change', function(){
        state.econChannels[+inp.dataset.chPrice].price = parseFloat(inp.value) || 0;
        renderAdvancedPanel(deps);
      });
    });
    root.querySelectorAll('[data-ch-share]').forEach(function(inp){
      inp.addEventListener('change', function(){
        state.econChannels[+inp.dataset.chShare].sharePct = parseFloat(inp.value) || 0;
        renderAdvancedPanel(deps);
      });
    });
    root.querySelectorAll('[data-seas]').forEach(function(inp){
      inp.addEventListener('change', function(){
        var m = +inp.dataset.m;
        var k = inp.dataset.seas;
        var v = Math.max(0, parseFloat(inp.value) || 0);
        if (k === 'price') sens.priceIdx[m] = v;
        if (k === 'yield') sens.yieldIdx[m] = v;
        if (k === 'cost') sens.costIdx[m] = v;
        renderAdvancedPanel(deps);
      });
    });
    var addSite = document.getElementById('adv-add-site');
    if (addSite) addSite.addEventListener('click', function(){
      state.econSites.push({
        name: TF('adv.site', { n: state.econSites.length + 1 }),
        econ: cloneEcon(e)
      });
      if (deps.saveEconStore) deps.saveEconStore();
      renderAdvancedPanel(deps);
    });
    root.querySelectorAll('.adv-rm-site').forEach(function(btn){
      btn.addEventListener('click', function(){
        state.econSites.splice(+btn.dataset.siteRm, 1);
        if (deps.saveEconStore) deps.saveEconStore();
        renderAdvancedPanel(deps);
      });
    });
    ['adv-inf-years','adv-inf-rent','adv-inf-kwh','adv-inf-other','adv-inf-payroll','adv-inf-logistics','adv-inf-price'].forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      function onInfInput(){
        state.econInflation.years = Math.max(1, parseInt(document.getElementById('adv-inf-years').value, 10) || 5);
        state.econInflation.rentPctY = parseFloat(document.getElementById('adv-inf-rent').value) || 0;
        state.econInflation.kwhPctY = parseFloat(document.getElementById('adv-inf-kwh').value) || 0;
        state.econInflation.otherPctY = parseFloat(document.getElementById('adv-inf-other').value) || 0;
        state.econInflation.payrollPctY = parseFloat(document.getElementById('adv-inf-payroll').value) || 0;
        state.econInflation.logisticsPctY = parseFloat(document.getElementById('adv-inf-logistics').value) || 0;
        state.econInflation.pricePctY = parseFloat(document.getElementById('adv-inf-price').value) || 0;
        renderAdvancedPanel(deps);
      }
      el.addEventListener('change', onInfInput);
      el.addEventListener('input', onInfInput);
    });
  }

  global.DG_ensureEconExtensions = ensureExtensions;
  global.DG_renderEconAdvanced = renderAdvancedPanel;
  global.DG_scaleEconCostFields = scaleEconCosts;
})(typeof window !== 'undefined' ? window : this);
