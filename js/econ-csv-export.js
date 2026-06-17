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

  function payrollAllocLabel(mode){
    var map = {
      area: 'econ.payroll.allocArea',
      revenue: 'econ.payroll.allocRevenue',
      labor: 'econ.payroll.allocLabor',
      laborOps: 'econ.payroll.allocLaborOps'
    };
    return T(map[mode] || map.area);
  }

  function elecCatLabel(id){
    var key = 'econ.elec.cat.' + id;
    var t = T(key);
    return t !== key ? t : id;
  }

  function heatingElecCsvRow(cat){
    cat = cat || {};
    if (cat.dayNight){
      var day = (parseFloat(cat.kwDay) || 0) + '×' + (parseFloat(cat.hDay) || 0);
      var night = (parseFloat(cat.kwNight) || 0) + '×' + (parseFloat(cat.hNight) || 0);
      var daily = (parseFloat(cat.kwDay) || 0) * (parseFloat(cat.hDay) || 0) +
        (parseFloat(cat.kwNight) || 0) * (parseFloat(cat.hNight) || 0);
      return [day + ' + ' + night, daily.toFixed(1)];
    }
    return [(parseFloat(cat.kw) || 0) + '×' + (parseFloat(cat.h) || 0), ((parseFloat(cat.kw) || 0) * (parseFloat(cat.h) || 0)).toFixed(1)];
  }

  function exportEconCsv(farm, meta){
    meta = meta || {};
    if (!farm || !farm.parts) throw new Error(T('csv.noData'));
    var econ = meta.econ || null;

    var sym = (global.DG_getCurrency && global.DG_getCurrency() === 'USD') ? '$' : '₽';
    var wasteFactor = farm.wasteFactor != null ? farm.wasteFactor
      : 1 - Math.min(50, Math.max(0, parseFloat(farm.wastePct) || 0)) / 100;
    var lines = [];
    lines.push(rowCsv([T('csv.title')]));
    lines.push(rowCsv([T('csv.date'), meta.date || new Date().toLocaleDateString(global.DG_getLocale ? global.DG_getLocale() : 'ru')]));
    lines.push(rowCsv([T('csv.build'), meta.build || '']));
    lines.push(rowCsv([T('csv.area'), farm.plantingArea]));
    lines.push(rowCsv([T('csv.shareSum'), farm.totalPct]));
    lines.push(rowCsv([]));

    lines.push(rowCsv([
      T('econ.snap.culture'), '%', T('econ.unit.sqm'), T('econ.cult.laborCoeff'),
      T('econ.metrics.fotShare') + ', %', T('econ.metrics.out') + '/mo', T('econ.tbl.unit'),
      T('econ.tbl.cost'), T('econ.tbl.rev') + ' ' + sym, T('econ.tbl.margin') + ' ' + sym
    ]));

    var staffTotal = farm.staffTotal || 0;
    farm.parts.forEach(function(p){
      var u = p.slice.outputUnit;
      var out = p.slice.monthlyOutput;
      var revNet = (p.slice.revenue || 0) * wasteFactor;
      var laborCoeff = p.row && p.row.laborCoeff != null ? p.row.laborCoeff : 1;
      var fotPct = staffTotal > 0 && p.slice.allocatedStaff != null
        ? ((p.slice.allocatedStaff / staffTotal) * 100).toFixed(1)
        : '';
      lines.push(rowCsv([
        p.name,
        p.pct,
        p.slice.area,
        laborCoeff,
        fotPct,
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

    if (farm.waterEnabled === false){
      lines.push(rowCsv([T('econ.waterInCalc'), T('econ.off')]));
    }
    if (farm.wasteEnabled === false && (farm.wastePct || 0) > 0){
      lines.push(rowCsv([T('econ.wasteInCalc'), T('econ.off') + ' (' + farm.wastePct + '%)']));
    }

    if (econ){
      lines.push(rowCsv([]));
      lines.push(rowCsv([T('csv.payrollSection')]));
      lines.push(rowCsv([T('econ.payroll.allocMode'), payrollAllocLabel(econ.payrollAllocMode || 'area')]));
      if (econ.payrollSplitEnabled){
        lines.push(rowCsv([T('econ.payroll.splitEnabled'), T('pdf.vec.yes')]));
        lines.push(rowCsv([T('econ.payroll.overheadAlloc'), payrollAllocLabel(econ.payrollOverheadAllocMode === 'area' ? 'area' : 'revenue')]));
      }
      if (econ.logisticsFollowPayroll){
        lines.push(rowCsv([T('econ.logistics.followPayroll'), T('pdf.vec.yes')]));
      }
      (econ.staffLines || []).forEach(function(row){
        var role = row.staffRole === 'overhead' ? T('econ.staff.roleOverhead') : T('econ.staff.roleField');
        lines.push(rowCsv([row.label || T('econ.staff.role'), row.salary || 0, role]));
      });

      if (econ.elecCats && typeof econ.elecCats === 'object'){
        lines.push(rowCsv([]));
        lines.push(rowCsv([T('csv.elecSection')]));
        lines.push(rowCsv([T('pdf.vec.elecCat'), T('pdf.vec.elecKw'), T('pdf.vec.elecDaily')]));
        Object.keys(econ.elecCats).forEach(function(id){
          var cat = econ.elecCats[id];
          if (!cat) return;
          var pair = id === 'heating' ? heatingElecCsvRow(cat) : [(parseFloat(cat.kw) || 0) + '×' + (parseFloat(cat.h) || 0), ((parseFloat(cat.kw) || 0) * (parseFloat(cat.h) || 0)).toFixed(1)];
          lines.push(rowCsv([elecCatLabel(id), pair[0], pair[1]]));
        });
      }

      if (farm.elecBreakdown && farm.elecBreakdown.length){
        lines.push(rowCsv([]));
        lines.push(rowCsv([T('csv.elecCostSection')]));
        lines.push(rowCsv([T('econ.tbl.article'), T('econ.tbl.kwh'), T('econ.tbl.rev') + ' ' + sym]));
        farm.elecBreakdown.forEach(function(row){
          var lbl = row.id === 'light' ? T('econ.bd.light') : (T('econ.bd.elecPrefix') + ' ' + elecCatLabel(row.id));
          if (row.sub) lbl += ' (' + row.sub + ')';
          lines.push(rowCsv([lbl, Math.round(row.kwh || 0), Math.round(row.cost || 0)]));
        });
      }
    }

    return lines.join('');
  }

  function downloadEconCsv(farm, meta){
    meta = meta || {};
    var csv = exportEconCsv(farm, meta);
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (meta.filename || 'daogreen-econ') + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 500);
    return csv;
  }

  global.DG_exportEconCsv = exportEconCsv;
  global.DG_downloadEconCsv = downloadEconCsv;
})(typeof window !== 'undefined' ? window : this);
