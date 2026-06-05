/** CSV из результатов экономики (без изменения расчёта) — DG_exportEconCsv */
(function(global){
  'use strict';

  function T(k){ return (global.DG_t && global.DG_t(k)) || k; }

  function escCsv(v){
    var s = String(v == null ? '' : v);
    if (/[",;\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function rowCsv(cells){
    return cells.map(escCsv).join(';') + '\n';
  }

  function exportEconCsv(farm, meta){
    meta = meta || {};
    if (!farm || !farm.parts) throw new Error(T('csv.noData'));

    var sym = (global.DG_getCurrency && global.DG_getCurrency() === 'USD') ? '$' : '₽';
    var wasteFactor = 1 - Math.min(50, Math.max(0, parseFloat(farm.wastePct) || 0)) / 100;
    var lines = [];
    lines.push(rowCsv([T('csv.title')]));
    lines.push(rowCsv([T('csv.date'), meta.date || new Date().toLocaleDateString(global.DG_getLocale ? global.DG_getLocale() : 'ru')]));
    lines.push(rowCsv([T('csv.build'), meta.build || '']));
    lines.push(rowCsv([T('csv.area'), farm.plantingArea]));
    lines.push(rowCsv([T('csv.shareSum'), farm.totalPct]));
    lines.push(rowCsv([]));

    lines.push(rowCsv([
      T('econ.snap.culture'), '%', T('econ.unit.sqm'), T('econ.metrics.out') + '/mo', 'Unit',
      T('econ.tbl.cost'), T('econ.tbl.rev') + ' ' + sym, T('econ.tbl.margin') + ' ' + sym
    ]));

    farm.parts.forEach(function(p){
      var u = p.slice.outputUnit;
      var out = p.slice.monthlyOutput;
      var revNet = (p.slice.revenue || 0) * wasteFactor;
      lines.push(rowCsv([
        p.name,
        p.pct,
        p.slice.area,
        (u === 'кг' || u === T('econ.unit.kg')) ? out.toFixed(1) : out,
        u,
        p.slice.unitCostFull > 0 ? p.slice.unitCostFull.toFixed(2) : '',
        revNet > 0 ? Math.round(revNet) : '',
        Math.round(p.slice.margin || 0)
      ]));
    });

    lines.push(rowCsv([]));
    lines.push(rowCsv([T('csv.total')]));
    lines.push(rowCsv([T('csv.rev') + ' ' + sym, Math.round(farm.revenue || 0)]));
    lines.push(rowCsv([T('csv.opex') + ' ' + sym, Math.round(farm.monthlyOpex || 0)]));
    lines.push(rowCsv([T('csv.margin') + ' ' + sym, Math.round(farm.margin || 0)]));
    lines.push(rowCsv([T('csv.marginPct'), farm.marginPct != null ? farm.marginPct.toFixed(1) : '']));
    if (farm.breakEvenRevenue > 0){
      lines.push(rowCsv([T('econ.metrics.breakEvenRevenue') + ' ' + sym, Math.round(farm.breakEvenRevenue)]));
    }
    if (farm.vatTaxAmt > 0) lines.push(rowCsv([T('econ.bd.vat').replace('{pct}', farm.vatPct) + ' ' + sym, Math.round(farm.vatTaxAmt)]));

    return lines.join('');
  }

  global.DG_exportEconCsv = exportEconCsv;
})(typeof window !== 'undefined' ? window : this);
