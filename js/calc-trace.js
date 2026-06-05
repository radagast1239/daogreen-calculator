/**
 * Трассировка ключевых чисел calc() для UI «откуда это».
 */
(function (global) {
  'use strict';

  function t(k, ru) {
    if (global.DG_plantT) {
      var v = global.DG_plantT(k);
      if (v != null && v !== k) return v;
    }
    return ru != null ? ru : k;
  }

  function buildCalcTrace(r, cv, state, deps) {
    if (!r || !cv) return [];
    state = state || {};
    deps = deps || {};
    var rows = [];
    var unitPcs = cv.countUnit === 'шт';

    function push(key, label, value, unit, source) {
      rows.push({ key: key, label: label, value: value, unit: unit || '', source: source || '' });
    }

    push('mass', t('trace.mass', 'Масса срезки'), Math.round(r.mass * 10) / 10,
      unitPcs ? t('farmCal.unitMassPcs', 'шт') : t('unit.g', 'г'),
      state.useManualMass ? t('trace.src.manual', 'ручной ввод')
        : (cv.calibrated === false ? t('trace.src.modelEst', 'модель (оценка)') : t('trace.src.model', 'модель роста')));
    if (!(global.DG_isTrayLotCrop && global.DG_isTrayLotCrop(cv))) {
      push('canopy', t('trace.canopy', 'Диаметр шапки'), Math.round(r.canopy), t('unit.mm', 'мм'),
        state.useManualCanopy ? t('trace.src.manual', 'ручной ввод') : t('trace.src.fromMass', 'из массы'));
      push('rhoA', t('trace.rhoA', 'Плотность стояния'), Math.round(r.rhoA * 10) / 10,
        t('trace.unit.pcsSqm', 'шт/м²'), t('trace.src.geom', 'геометрия'));
      push('leafGap', t('trace.leafGap', 'Зазор шапок'), Math.round(r.leafGap), t('unit.mm', 'мм'),
        t('trace.src.geom', 'геометрия'));
    } else {
      push('traysPerPal', t('trace.traysPerPal', 'Лотков на поддон'), r.plantsPerPallet || (global.DG_TRAY_LOT_PER_PALLET || 33),
        t('farmCal.unitMassPcs', 'шт'), t('trace.src.trayStd', 'стандарт лотков'));
      push('rhoA', t('trace.trayDensity', 'Лотков на м²'), Math.round((r.rhoA || 0) * 10) / 10,
        t('trace.unit.pcsSqm', 'шт/м²'), t('trace.src.geom', 'геометрия'));
    }

    var yKg = r.yieldPerSqmMonthKg;
    var yPcs = r.yieldPerSqmMonthPcs;
    var yieldSrc = r.multicutHarvest || state.multicut
      ? t('trace.src.multicut', 'мультисрезка')
      : t('trace.src.cycle', 'цикл');
    if (unitPcs || yPcs > 0) {
      push('yieldSqm', t('trace.yieldSqm', 'Урожай / м²·мес'), Math.round((yPcs || 0) * 10) / 10,
        t('farmCal.unitMassPcs', 'шт'), yieldSrc);
    } else {
      push('yieldSqm', t('trace.yieldSqm', 'Урожай / м²·мес'), Math.round((yKg || 0) * 100) / 100,
        t('unit.kg', 'кг'), yieldSrc);
    }

    if (r.harvestCyclesPerMonth > 0) {
      push('cyclesMo', t('trace.cyclesMo', 'Срезок / мес'), Math.round(r.harvestCyclesPerMonth * 10) / 10, '',
        t('trace.src.intervalCalc', '30,5 сут / интервал'));
    }

    var fc = (state.farmCalibrations || {})[cv.id];
    if (fc && fc.measuredAt) {
      push('farmCal', t('trace.farmCal', 'Калибровка фермы'), fc.comment || fc.measuredAt.slice(0, 10), '',
        t('trace.src.farm', 'замеры на объекте'));
    }

    return rows;
  }

  function traceHtml(rows, esc) {
    esc = esc || function (s) { return String(s == null ? '' : s); };
    if (!rows.length) return '';
    var html = '<details class="calc-trace"><summary>' + esc(t('trace.summary', 'Откуда эти числа')) +
      '</summary><dl class="calc-trace-dl">';
    rows.forEach(function (row) {
      html += '<dt>' + esc(row.label) + '</dt><dd>' +
        esc(row.value) + (row.unit ? ' ' + esc(row.unit) : '') +
        (row.source ? ' <span class="calc-trace-src">(' + esc(row.source) + ')</span>' : '') +
        '</dd>';
    });
    html += '</dl></details>';
    return html;
  }

  global.DG_buildCalcTrace = buildCalcTrace;
  global.DG_calcTraceHtml = traceHtml;
})(typeof window !== 'undefined' ? window : globalThis);
