/**
 * Единый сбор предупреждений: посадка + экономика + экспорт.
 */
(function (global) {
  'use strict';

  function tFmt(k, vars, ru) {
    if (global.DG_tFmt) return global.DG_tFmt(k, vars);
    if (global.DG_t) {
      var v = global.DG_t(k);
      if (v != null && v !== k) return v;
    }
    if (ru && vars) {
      Object.keys(vars).forEach(function (vk) {
        ru = ru.replace(new RegExp('\\{' + vk + '\\}', 'g'), String(vars[vk]));
      });
    }
    return ru != null ? ru : k;
  }

  function collectCalcIssues(ctx) {
    ctx = ctx || {};
    var issues = [];
    var state = ctx.state;
    var farm = ctx.farm;
    var parts = ctx.parts || (farm && farm.parts) || [];
    var econWarnings = ctx.econWarnings || (farm && farm.warnings) || [];

    econWarnings.forEach(function (w) {
      var level = w.level === 'strong' ? 'critical' : 'warn';
      issues.push({ level: level, code: 'econ.' + level, text: w.text || w, scope: 'economics' });
    });

    if (state && state.econ) {
      var fresh = global.DG_checkPlantingImportFreshness
        ? global.DG_checkPlantingImportFreshness(state, ctx.deps)
        : { status: 'none' };
      if (fresh.status === 'stale') {
        var ch = global.DG_plantingImportChangedLabels
          ? global.DG_plantingImportChangedLabels(fresh.changedFields)
          : fresh.changedFields.join(', ');
        issues.push({
          level: 'warn',
          code: 'econ.plantingStale',
          scope: 'economics',
          text: tFmt('issues.plantingStale', { fields: ch },
            'После импорта изменились параметры посадки ({fields}) — нажмите «Импорт из посадки».')
        });
      }

      var areaMode = state.econ.areaMode === 'sqm' ? 'sqm' : 'pct';
      (state.econ.cultures || []).forEach(function (row) {
        var hasShare = areaMode === 'sqm'
          ? (parseFloat(row.areaSqm) || 0) > 0
          : (parseFloat(row.pct) || 0) > 0;
        if (!hasShare || !row.cvId) return;
        var price = parseFloat(row.salePrice) || 0;
        if (price <= 0) {
          var name = ctx.cvName ? ctx.cvName(row.cvId) : row.cvId;
          issues.push({
            level: 'critical',
            code: 'econ.priceZero',
            scope: 'economics',
            text: tFmt('issues.priceZero', { name: name },
              '«{name}»: цена продажи 0 — выручка и маржа будут нулевыми.')
          });
        }
      });
    }

    var r = ctx.calcResult;
    if (r) {
      if (r.widthExceeds) {
        issues.push({
          level: 'critical', code: 'plant.width', scope: 'planting',
          text: tFmt('issues.widthExceeds', null, 'Ширина системы превышает допустимый предел.')
        });
      }
      if (Number.isFinite(r.leafGap) && r.leafGap < -20) {
        issues.push({
          level: 'warn', code: 'plant.overlap', scope: 'planting',
          text: tFmt('issues.overlapBad', { mm: Math.abs(Math.round(r.leafGap)) },
            'Сильное перекрытие шапок ({mm} мм).')
        });
      }
    }

    return issues;
  }

  function hasCriticalIssues(issues) {
    return (issues || []).some(function (i) { return i.level === 'critical'; });
  }

  function mergeIssueTexts(issues, levels) {
    levels = levels || ['critical', 'warn'];
    return (issues || [])
      .filter(function (i) { return levels.indexOf(i.level) >= 0; })
      .map(function (i) { return i.text; });
  }

  global.DG_collectCalcIssues = collectCalcIssues;
  global.DG_hasCriticalCalcIssues = hasCriticalIssues;
  global.DG_mergeIssueTexts = mergeIssueTexts;
})(typeof window !== 'undefined' ? window : globalThis);
