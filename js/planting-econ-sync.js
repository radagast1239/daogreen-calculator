/**
 * Свежесть связи посадка ↔ экономика: отпечаток state при импорте.
 */
(function (global) {
  'use strict';

  var FINGERPRINT_KEYS = [
    'facility', 'appView', 'cv', 'vfCv', 'palletCv',
    'germination', 'nursery', 'day', 'density', 'cutInterval', 'multicut',
    'nch', 'temp', 'lighting', 'targetDli', 'targetPhotoperiod', 'month',
    'ghUsefulArea', 'georgyMode', 'extraB'
  ];

  var FIELD_LABELS = {
    facility: 'режим',
    appView: 'вкладка',
    cv: 'сорт (теплица)',
    vfCv: 'сорт (ВФ)',
    palletCv: 'сорт (поддоны)',
    germination: 'прорастание',
    nursery: 'рассада',
    day: 'дни в канале',
    density: 'плотность',
    cutInterval: 'интервал срезки',
    multicut: 'мультисрезка',
    nch: 'каналы',
    temp: 'температура',
    lighting: 'досветка',
    targetDli: 'DLI',
    targetPhotoperiod: 'фотопериод',
    month: 'месяц',
    ghUsefulArea: 'полезная площадь',
    georgyMode: 'режим Георгия',
    extraB: 'шаг ряда'
  };

  function plantingImportFingerprint(state) {
    state = state || {};
    var o = {};
    FINGERPRINT_KEYS.forEach(function (k) { o[k] = state[k]; });
    if (state.vfStd) o.vfStd = JSON.stringify(state.vfStd);
    if (state.palletStd) o.palletStd = JSON.stringify(state.palletStd);
    return JSON.stringify(o);
  }

  function formatImportTime(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      return d.toLocaleString('ru-RU', {
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch (_) {
      return String(iso);
    }
  }

  function recordPlantingImportMeta(state, snap, extras) {
    if (!state || !state.econ) return;
    extras = extras || {};
    var cvIds = (state.econ.cultures || [])
      .filter(function (r) { return r.cvId; })
      .map(function (r) { return r.cvId; });
    state.econ.plantingImportMeta = {
      at: new Date().toISOString(),
      cvId: extras.activeId || (snap && snap.cvId) || '',
      cvName: (snap && snap.cvName) || '',
      facilityLabel: (snap && snap.facilityLabel) || '',
      fingerprint: plantingImportFingerprint(state),
      cultureCvIds: cvIds
    };
  }

  function checkPlantingImportFreshness(state, deps) {
    var meta = state && state.econ && state.econ.plantingImportMeta;
    if (!meta || !meta.at) return { status: 'none', meta: null, changedFields: [], showRefresh: false };
    var current = plantingImportFingerprint(state);
    var stale = meta.fingerprint !== current;
    var changed = [];
    if (stale) {
      try {
        var was = JSON.parse(meta.fingerprint || '{}');
        var now = JSON.parse(current);
        FINGERPRINT_KEYS.forEach(function (k) {
          if (was[k] !== now[k]) changed.push(k);
        });
        if (was.vfStd !== now.vfStd) changed.push('vfStd');
        if (was.palletStd !== now.palletStd) changed.push('palletStd');
      } catch (_) {}
    }
    return {
      status: stale ? 'stale' : 'fresh',
      meta: meta,
      changedFields: changed,
      showRefresh: stale
    };
  }

  function changedFieldsLabel(keys) {
    return (keys || []).map(function (k) {
      return FIELD_LABELS[k] || k;
    }).join(', ');
  }

  global.DG_plantingImportFingerprint = plantingImportFingerprint;
  global.DG_recordPlantingImportMeta = recordPlantingImportMeta;
  global.DG_checkPlantingImportFreshness = checkPlantingImportFreshness;
  global.DG_formatPlantingImportTime = formatImportTime;
  global.DG_plantingImportChangedLabels = changedFieldsLabel;
})(typeof window !== 'undefined' ? window : globalThis);
