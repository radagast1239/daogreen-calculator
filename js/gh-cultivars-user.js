/**
 * Ваши калибровки поверх каталога (подключать последним).
 * Сейчас пусто: в расчёте только gh-cultivars.js (18) + gh-cultivars-extended.js (оценки).
 * Когда будут замеры с фермы — добавьте строки в OVERRIDES или npm run gen:gh-user.
 */
(function (global) {
  'use strict';

  /** @type {Array<Record<string, unknown>>} */
  var OVERRIDES = [];

  function applyUserOverrides() {
    if (!global.DG_GH_CULTIVARS || !OVERRIDES.length) return;
    var byId = {};
    global.DG_GH_CULTIVARS.forEach(function (c, i) { byId[c.id] = i; });
    OVERRIDES.forEach(function (patch) {
      if (!patch || !patch.id) return;
      var idx = byId[patch.id];
      if (idx == null) return;
      var cur = global.DG_GH_CULTIVARS[idx];
      Object.keys(patch).forEach(function (k) {
        if (k !== 'id') cur[k] = patch[k];
      });
    });
  }

  applyUserOverrides();
  global.DG_GH_CULTIVAR_USER = { overrides: OVERRIDES, apply: applyUserOverrides };
})(typeof window !== 'undefined' ? window : globalThis);
