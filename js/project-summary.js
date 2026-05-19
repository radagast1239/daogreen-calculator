/** Сводка проекта для сравнения и отчётов */
(function(global){
  'use strict';

  function t(deps, key){ return deps.t ? deps.t(key) : key; }
  function moneyUnit(deps, per){ return (deps.currencySym ? deps.currencySym() : '₽') + (per || ''); }

  function modeLabel(state, deps){
    if (!state) return '—';
    if (state.appView === 'economics') return t(deps || {}, 'mode.economics');
    if (state.appView === 'pallets') return t(deps || {}, 'mode.pallets');
    if (state.facility === 'vertical') return t(deps || {}, 'mode.vf');
    return t(deps || {}, 'mode.gh');
  }

  function summarize(state, deps){
    deps = deps || {};
    var rows = [];
    var meta = { build: '', exportedAt: '', mode: modeLabel(state, deps) };

    rows.push({ k: t(deps, 'sum.mode'), a: modeLabel(state, deps), b: null });
    if (state.facility) rows.push({ k: t(deps, 'sum.env'), a: state.facility === 'vertical' ? 'VF' : t(deps, 'facility.greenhouse'), b: null });

    if (state.econ && deps.calcFarmEconomics){
      if (deps.migrateEconOtherElectricity) deps.migrateEconOtherElectricity(state.econ);
      var farm = deps.calcFarmEconomics(state.econ);
      rows.push({ k: t(deps, 'sum.area'), a: farm.plantingArea, b: t(deps, 'sum.unit.sqm'), num: true });
      rows.push({ k: t(deps, 'sum.revenue'), a: farm.revenue, b: moneyUnit(deps), num: true, money: true });
      rows.push({ k: t(deps, 'sum.opex'), a: farm.monthlyOpex, b: moneyUnit(deps), num: true, money: true });
      rows.push({ k: t(deps, 'sum.margin'), a: farm.margin, b: moneyUnit(deps), num: true, highlight: true, money: true });
      rows.push({ k: t(deps, 'sum.marginPct'), a: farm.marginPct, b: '%', num: true });
      rows.push({ k: t(deps, 'sum.sales'), a: farm.sellKg, b: t(deps, 'sum.unit.kgMo'), num: true });
      rows.push({ k: t(deps, 'sum.unitCost'), a: farm.unitCostKg, b: moneyUnit(deps, deps.t ? deps.t('econ.perKg') : '/кг'), num: true, money: true });
      if (deps.sumEconEquipment){
        rows.push({ k: t(deps, 'sum.capex'), a: deps.sumEconEquipment(state.econ), b: moneyUnit(deps), num: true, money: true });
      }
      meta.econ = farm;
    }

    if (deps.calcWithState && state.appView !== 'economics'){
      try {
        var c = deps.calcWithState(state);
        if (c){
          rows.push({ k: t(deps, 'sum.mass'), a: c.mass, b: t(deps, 'sum.unit.g'), num: true });
          rows.push({ k: t(deps, 'sum.plants'), a: c.total, b: t(deps, 'sum.unit.pcs'), num: true });
          if (c.sysArea != null) rows.push({ k: t(deps, 'sum.sysArea'), a: c.sysArea, b: t(deps, 'sum.unit.sqm'), num: true });
          meta.planting = c;
        }
      } catch (e){ meta.plantingError = e.message; }
    } else if (state.appView === 'pallets'){
      rows.push({ k: t(deps, 'sum.trays'), a: state.palletCells, b: t(deps, 'sum.unit.cells'), num: true });
      rows.push({ k: t(deps, 'sum.pallets'), a: state.palletsAlong, b: t(deps, 'sum.unit.pcs'), num: true });
    } else if (state.nch != null){
      rows.push({ k: t(deps, 'sum.channels'), a: state.nch, b: t(deps, 'sum.unit.pcs'), num: true });
    }

    return { rows: rows, meta: meta };
  }

  global.DG_summarizeProject = summarize;
})(typeof window !== 'undefined' ? window : this);
