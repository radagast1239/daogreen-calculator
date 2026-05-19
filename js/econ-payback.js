/** Окупаемость и cash-flow (на основе calcFarmEconomics, без новых формул) */
(function(global){
  'use strict';

  function T(k){ return (global.DG_t && global.DG_t(k)) || k; }
  function TF(k, vars){ return global.DG_tFmt ? global.DG_tFmt(k, vars) : T(k); }

  function fmtMonths(m){
    if (!isFinite(m) || m <= 0) return '—';
    if (m > 600) return (global.DG_t && global.DG_t('pb.monthsLong')) || '> 50 лет';
    var y = (m / 12).toFixed(1); var n = m < 120 ? m.toFixed(1) : String(Math.round(m)); return (global.DG_tFmt ? global.DG_tFmt('pb.monthsFmt', { n: n, y: y }) : n + ' mo (~' + y + ' y)');
  }

  function breakEvenMonth(series){
    for (var i = 0; i < series.length; i++){
      if (series[i].cumulative >= 0) return i;
    }
    return null;
  }

  function buildCashflow(equipTotal, monthlyNet, horizon){
    horizon = horizon || 36;
    var series = [{ month: 0, flow: -equipTotal, cumulative: -equipTotal, label: (global.DG_t && global.DG_t('pb.start')) || 'Старт' }];
    var cum = -equipTotal;
    for (var m = 1; m <= horizon; m++){
      cum += monthlyNet;
      series.push({ month: m, flow: monthlyNet, cumulative: cum, label: (global.DG_tFmt ? global.DG_tFmt('pb.month', { n: m }) : 'M' + m) });
    }
    return series;
  }

  function cashflowSvg(series, fmtNum, width, height){
    width = width || 720;
    height = height || 200;
    var pad = { l: 48, r: 12, t: 16, b: 28 };
    var minY = Math.min(0, series[0].cumulative);
    var maxY = Math.max(0, series[0].cumulative);
    series.forEach(function(p){
      minY = Math.min(minY, p.cumulative);
      maxY = Math.max(maxY, p.cumulative);
    });
    if (maxY === minY){ maxY = minY + 1; }
    var plotW = width - pad.l - pad.r;
    var plotH = height - pad.t - pad.b;
    function x(i){ return pad.l + (i / (series.length - 1)) * plotW; }
    function y(v){ return pad.t + plotH - ((v - minY) / (maxY - minY)) * plotH; }

    var zeroY = y(0);
    var path = 'M ' + x(0) + ' ' + y(series[0].cumulative);
    for (var j = 1; j < series.length; j++){
      path += ' L ' + x(j) + ' ' + y(series[j].cumulative);
    }

    var be = breakEvenMonth(series);
    var beMark = '';
    if (be != null){
      beMark = '<line x1="' + x(be) + '" y1="' + pad.t + '" x2="' + x(be) + '" y2="' + (pad.t + plotH) + '" stroke="#6B7B2E" stroke-width="1.2" stroke-dasharray="4 3"/>' +
        '<text x="' + x(be) + '" y="' + (pad.t - 4) + '" text-anchor="middle" font-size="10" fill="#6B7B2E">' + ((global.DG_t && global.DG_t('pb.paybackMark')) || 'payback') + '</text>';
    }

    return '<svg class="econ-cf-svg" viewBox="0 0 ' + width + ' ' + height + '" width="100%" height="' + height + '" role="img" aria-label="' + ((global.DG_t && global.DG_t('pb.cashAria')) || 'Cash flow') + '">' +
      '<line x1="' + pad.l + '" y1="' + zeroY + '" x2="' + (width - pad.r) + '" y2="' + zeroY + '" stroke="#ccc" stroke-width="1"/>' +
      '<path d="' + path + '" fill="none" stroke="#3F6896" stroke-width="2.2"/>' +
      beMark +
      '<text x="' + pad.l + '" y="' + (height - 6) + '" font-size="10" fill="#666">0</text>' +
      '<text x="' + (width - pad.r) + '" y="' + (height - 6) + '" text-anchor="end" font-size="10" fill="#666">' + TF('pb.monthsAxis', { n: series.length }) + '</text>' +
      '<text x="8" y="' + (pad.t + 8) + '" font-size="10" fill="#666">' + fmtNum(maxY) + '</text>' +
      '<text x="8" y="' + (pad.t + plotH) + '" font-size="10" fill="#666">' + fmtNum(minY) + '</text>' +
      '</svg>';
  }

  function paybackBlock(farm, equipTotal, e, deps){
    deps = deps || {};
    equipTotal = parseFloat(equipTotal) || 0;
    var margin = farm.margin || 0;
    var amort = farm.equipAmort || 0;
    var cashBeforeAmort = margin + amort;
    var prep = (e && e.equipmentEnabled !== false) ? equipTotal : 0;

    var rows = [
      { k: T('pb.capex'), v: prep },
      { k: T('pb.margin'), v: margin },
      { k: T('pb.amort'), v: amort },
      { k: T('pb.cash'), v: cashBeforeAmort }
    ];

    var html = '<div class="econ-pb-grid">';
    rows.forEach(function(r){
      html += '<div class="econ-pb-row"><span>' + r.k + '</span><strong>' +
        (typeof r.v === 'number' ? (r.v < 0 ? '−' : '') + (deps.fmtMoney ? deps.fmtMoney(Math.abs(r.v)) : Math.abs(Math.round(r.v)).toLocaleString('ru-RU') + ' ₽') : r.v) +
        '</strong></div>';
    });
    html += '</div>';

    html += '<ul class="econ-pb-list">';
    if (prep <= 0){
      html += '<li>' + T('pb.noCapex') + '</li>';
    } else if (margin <= 0){
      html += '<li>' + T('pb.noMargin') + '</li>';
    } else {
      html += '<li>' + TF('pb.conservativeLi', { months: fmtMonths(prep / margin) }) + '</li>';
    }
    if (prep > 0 && cashBeforeAmort > 0){
      html += '<li>' + TF('pb.beforeAmortLi', { months: fmtMonths(prep / cashBeforeAmort) }) + '</li>';
    }
    html += '<li>' + TF('pb.rentNote', { rent: (deps.fmtMoney ? deps.fmtMoney(farm.rent || 0) : (farm.rent || 0)) + (deps.currencySym ? ' ' + deps.currencySym() : ' ₽') }) + '</li>';
    html += '</ul>';
    return html;
  }

  function renderEconPayback(deps){
    var panel = document.getElementById('econ-payback-body');
    if (!panel || !deps.getState || !deps.calcFarmEconomics) return;
    var e = deps.getState().econ;
    if (!e){
      panel.innerHTML = '<p style="color:var(--ink-faint);font-size:13px">' + T('pb.fill') + '</p>';
      return;
    }

    var farm = deps.calcFarmEconomics(e);
    var equipTotal = (e.equipmentEnabled !== false && deps.sumEconEquipment) ? deps.sumEconEquipment() : 0;
    var horizon = 36;
    var series = buildCashflow(equipTotal, farm.margin || 0, horizon);
    var be = breakEvenMonth(series);

    var html = '<p class="econ-sens-lead">' + T('pb.lead') + '</p>';
    html += paybackBlock(farm, equipTotal, e, deps);
    html += '<p class="econ-cf-caption">' + (be != null
      ? TF('pb.cfCaptionPos', { horizon: horizon, be: be })
      : TF('pb.cfCaptionNeg', { horizon: horizon })) + '</p>';
    html += cashflowSvg(series, deps.fmtNum);
    panel.innerHTML = html;
  }

  global.DG_buildCashflow = buildCashflow;
  global.DG_renderEconPayback = renderEconPayback;
})(typeof window !== 'undefined' ? window : this);
