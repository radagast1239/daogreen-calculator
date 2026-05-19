/** Показ JS-ошибки на странице калькулятора */
(function (global) {
  'use strict';

  function showCalcError(stage, err) {
    try {
      var eb = document.createElement('div');
      eb.style.cssText =
        'background:#FEE;color:#900;padding:14px;margin:14px;border:1px solid #C66;border-radius:8px;font:13px/1.5 -apple-system,sans-serif;white-space:pre-wrap;position:relative;z-index:9999';
      var msg = err && err.stack ? err.stack : err;
      eb.textContent = global.DG_tFmt
        ? global.DG_tFmt('err.js', { stage: stage, msg: msg })
        : 'JS ОШИБКА (' + stage + '):\n' + msg;
      document.body.insertBefore(eb, document.body.firstChild);
    } catch (_) {}
  }

  global.DG_showCalcError = showCalcError;
})(typeof window !== 'undefined' ? window : globalThis);
