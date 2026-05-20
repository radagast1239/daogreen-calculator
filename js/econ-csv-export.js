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
      lines.push(rowCsv([
        p.name,
        p.pct,
        p.slice.area,
        (u === 'кг' || u === T('econ.unit.kg')) ? out.toFixed(1) : out,
        u,
        p.slice.unitCostFull > 0 ? p.slice.unitCostFull.toFixed(2) : '',
        p.slice.revenue > 0 ? Math.round(p.slice.revenue) : '',
        Math.round(p.slice.margin || 0)
      ]));
    });

    lines.push(rowCsv([]));
    lines.push(rowCsv([T('csv.total')]));
    lines.push(rowCsv([T('csv.rev') + ' ' + sym, Math.round(farm.revenue || 0)]));
    lines.push(rowCsv([T('csv.opex') + ' ' + sym, Math.round(farm.monthlyOpex || 0)]));
    lines.push(rowCsv([T('csv.margin') + ' ' + sym, Math.round(farm.margin || 0)]));
    lines.push(rowCsv([T('csv.marginPct'), farm.marginPct != null ? farm.marginPct.toFixed(1) : '']));
    lines.push(rowCsv([T('csv.usn') + ' ' + sym, Math.round(farm.usnTaxAmt || 0)]));
    if (farm.vatTaxAmt > 0) lines.push(rowCsv([T('econ.bd.vat').replace('{pct}', farm.vatPct) + ' ' + sym, Math.round(farm.vatTaxAmt)]));
    if (farm.profitTaxAmt > 0) lines.push(rowCsv([T('econ.bd.profitTax').replace('{pct}', farm.profitTaxPct) + ' ' + sym, Math.round(farm.profitTaxAmt)]));
    lines.push(rowCsv([T('csv.light') + ' ' + sym, Math.round(farm.lightCost || 0)]));
    lines.push(rowCsv([T('csv.cons') + ' ' + sym, Math.round(farm.consumablesCost || 0)]));
    lines.push(rowCsv([T('csv.rent') + ' ' + sym, Math.round(farm.rent || 0)]));
    lines.push(rowCsv([T('csv.payroll') + ' ' + sym, Math.round(farm.staffTotal || 0)]));

    var bom = '\uFEFF';
    var blob = new Blob([bom + lines.join('')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (meta.filename || 'daogreen-economics') + '.csv';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 500);
  }

  global.DG_exportEconCsv = exportEconCsv;
})(typeof window !== 'undefined' ? window : this);
