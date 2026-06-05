/**
 * Группировка сортов теплицы (DG_GH_CULTIVARS) по типу для UI.
 */
(function (global) {
  'use strict';

  var TYPE_ORDER = [
    'butterhead', 'romaine', 'batavia', 'oakleaf', 'lollo', 'salanova',
    'leaf', 'iceberg', 'mini', 'baby_leaf', 'other'
  ];

  var LEGACY_TYPE = {
    rucola: 'leaf',
    lollo: 'lollo',
    'little-gem': 'mini',
    oakleaf: 'oakleaf',
    frillice: 'batavia',
    salanova: 'salanova',
    aficion: 'batavia',
    afilion: 'batavia',
    starfighter: 'batavia',
    grazion: 'batavia',
    basil: 'other',
    'lettuce-baby': 'baby_leaf',
    'rucola-baby': 'baby_leaf',
    mizuna: 'baby_leaf',
    kale: 'baby_leaf',
    chard: 'baby_leaf',
    spinach: 'baby_leaf',
    pakchoi: 'baby_leaf'
  };

  var TYPE_I18N = {
    butterhead: 'cv.type.butterhead',
    romaine: 'cv.type.romaine',
    batavia: 'cv.type.batavia',
    oakleaf: 'cv.type.oakleaf',
    lollo: 'cv.type.lollo',
    salanova: 'cv.type.salanova',
    leaf: 'cv.type.leaf',
    iceberg: 'cv.type.iceberg',
    mini: 'cv.type.mini',
    baby_leaf: 'cv.type.babyLeaf',
    other: 'cv.type.other'
  };

  function t(key, ru) {
    if (global.DG_t) {
      var v = global.DG_t(key);
      if (v != null && v !== key) return v;
    }
    return ru != null ? ru : key;
  }

  function ghCultivarType(cv) {
    if (!cv) return 'other';
    if (cv.type) return String(cv.type);
    if (cv.babyGreen) return 'baby_leaf';
    if (cv.custom) return 'other';
    return LEGACY_TYPE[cv.id] || 'other';
  }

  function typeLabel(typeId) {
    var key = TYPE_I18N[typeId] || 'cv.type.other';
    var ru = {
      butterhead: 'Батерхед',
      romaine: 'Ромэн / кос',
      batavia: 'Батавия',
      oakleaf: 'Оуклиф',
      lollo: 'Лолло',
      salanova: 'Саланова',
      leaf: 'Листовой',
      iceberg: 'Айсберг',
      mini: 'Мини-ромэн',
      baby_leaf: 'Беби-зелень',
      other: 'Прочее'
    }[typeId];
    return t(key, ru);
  }

  function groupGhCultivars(list, activeId) {
    var buckets = {};
    (list || []).forEach(function (cv) {
      var type = ghCultivarType(cv);
      if (!buckets[type]) buckets[type] = [];
      buckets[type].push(cv);
    });
    var out = [];
    TYPE_ORDER.forEach(function (type) {
      var items = buckets[type];
      if (!items || !items.length) return;
      items.sort(function (a, b) {
        return String(a.name).localeCompare(String(b.name), 'ru');
      });
      out.push({
        id: type,
        label: typeLabel(type),
        items: items,
        hasActive: items.some(function (c) { return c.id === activeId; })
      });
    });
    Object.keys(buckets).forEach(function (type) {
      if (TYPE_ORDER.indexOf(type) >= 0) return;
      var items = buckets[type];
      items.sort(function (a, b) {
        return String(a.name).localeCompare(String(b.name), 'ru');
      });
      out.push({
        id: type,
        label: type,
        items: items,
        hasActive: items.some(function (c) { return c.id === activeId; })
      });
    });
    return out;
  }

  function useGroupedGhUi(list) {
    if (global.DG_GH_CULTIVAR_GROUPED === false) return false;
    return (list || []).length >= 22;
  }

  function cvSearchHaystack(cv) {
    return [
      cv.name, cv.sub, cv.id, cv.breeder, cv.type, cv.notes
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function cvMatchesSearch(cv, query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    return cvSearchHaystack(cv).indexOf(q) >= 0;
  }

  function filterGhCultivars(list, query) {
    return (list || []).filter(function (cv) { return cvMatchesSearch(cv, query); });
  }

  function cvPassesCalibratedFilter(cv, activeId) {
    if (!cv) return false;
    if (!getGhCvCalibratedOnly()) return true;
    if (cv.id === activeId) return true;
    if (cv.custom) return true;
    if (cv.calibrated === true) return true;
    if (cv.calibrated !== false) return true;
    return false;
  }

  function cvPassesFarmCalFilter(cv, activeId) {
    if (!cv) return false;
    if (!getGhCvFarmCalOnly()) return true;
    if (cv.id === activeId) return true;
    if (cv.custom) return true;
    if (global.DG_farmCalibrationRef && global.DG_farmCalibrationRef.cvHasFarmCalibration(cv.id)) return true;
    return false;
  }

  function filterGhCatalogList(list, query, activeId) {
    list = (list || []).filter(function (cv) { return cvPassesCalibratedFilter(cv, activeId); });
    list = list.filter(function (cv) { return cvPassesFarmCalFilter(cv, activeId); });
    return filterGhCultivars(list, query);
  }

  function getGhCvCalibratedOnly() {
    return global._dgGhCvCalibratedOnly === true;
  }

  function setGhCvCalibratedOnly(v) {
    global._dgGhCvCalibratedOnly = !!v;
    try {
      if (v) sessionStorage.setItem('dg-gh-cv-calibrated-only', '1');
      else sessionStorage.removeItem('dg-gh-cv-calibrated-only');
    } catch (_) {}
  }

  function getGhCvFarmCalOnly() {
    return global._dgGhCvFarmCalOnly === true;
  }

  function setGhCvFarmCalOnly(v) {
    global._dgGhCvFarmCalOnly = !!v;
    try {
      if (v) sessionStorage.setItem('dg-gh-cv-farm-cal-only', '1');
      else sessionStorage.removeItem('dg-gh-cv-farm-cal-only');
    } catch (_) {}
  }

  try {
    if (sessionStorage.getItem('dg-gh-cv-farm-cal-only') === '1') {
      global._dgGhCvFarmCalOnly = true;
    }
  } catch (_) {}

  function cvCalibratedBadgeHtml(cv, tFn) {
    var t = tFn || t;
    if (cv && global.DG_farmCalibrationRef && global.DG_farmCalibrationRef.cvHasFarmCalibration(cv.id)) {
      return '<span class="cv-badge cv-badge--farm" title="' + t('ui.cv.farmCal', 'Замеры с вашей фермы') + '">' +
        t('ui.cv.badgeFarmCal', 'замер') + '</span>';
    }
    if (cv && cv.calibrated === true) {
      return '<span class="cv-badge cv-badge--cal">' + t('ui.cv.badgeCalibrated', 'калибр.') + '</span>';
    }
    if (cv && cv.calibrated === false) {
      return '<span class="cv-badge cv-badge--est" title="' + t('ui.cv.estimated') + '">' +
        t('ui.cv.badgeEstimated', 'оценка') + '</span>';
    }
    return '';
  }

  function getGhCvSearch() {
    return String(global._dgGhCvSearch || '').trim();
  }

  function setGhCvSearch(v) {
    global._dgGhCvSearch = String(v || '');
  }

  global.DG_ghCultivarType = ghCultivarType;
  global.DG_groupGhCultivars = groupGhCultivars;
  global.DG_useGroupedGhCultivarUi = useGroupedGhUi;
  global.DG_filterGhCultivars = filterGhCultivars;
  global.DG_filterGhCatalogList = filterGhCatalogList;
  global.DG_cvCalibratedBadgeHtml = cvCalibratedBadgeHtml;
  global.DG_getGhCvSearch = getGhCvSearch;
  global.DG_setGhCvSearch = setGhCvSearch;
  global.DG_getGhCvCalibratedOnly = getGhCvCalibratedOnly;
  global.DG_setGhCvCalibratedOnly = setGhCvCalibratedOnly;
  global.DG_getGhCvFarmCalOnly = getGhCvFarmCalOnly;
  global.DG_setGhCvFarmCalOnly = setGhCvFarmCalOnly;
})(typeof window !== 'undefined' ? window : globalThis);
