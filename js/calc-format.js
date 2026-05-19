/** Форматирование чисел и обёртки i18n для калькулятора посадки */
(function (global) {
  'use strict';

  function parseNumInput(str) {
    if (str == null || str === '') return NaN;
    return parseFloat(String(str).replace(/\s/g, '').replace(',', '.'));
  }

  function decimalsFromStep(step) {
    const st = String(step != null ? step : 1);
    const dot = st.indexOf('.');
    return dot >= 0 ? st.length - dot - 1 : 0;
  }

  function fmtNumRu(n, opts) {
    opts = opts || {};
    if (n == null || n === '' || isNaN(n)) return opts.empty != null ? opts.empty : '—';
    const d = opts.decimals != null ? opts.decimals : 0;
    let num = Number(n);
    if (!isFinite(num)) return opts.empty || '—';
    const neg = num < 0;
    num = Math.abs(num);
    const raw = d > 0 ? num.toFixed(d) : String(Math.round(num));
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const body = parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
    return neg ? '−' + body : body;
  }

  function fmtNum(n, opts) {
    if (global.DG_fmtNumLocale) return global.DG_fmtNumLocale(n, opts);
    return fmtNumRu(n, opts);
  }

  function pt(k) {
    return typeof global.DG_plantT === 'function' ? global.DG_plantT(k) : k;
  }

  function pm(k) {
    return typeof global.DG_plantMetric === 'function' ? global.DG_plantMetric(k) : k;
  }

  function ptf(k, vars) {
    return typeof global.DG_plantTF === 'function' ? global.DG_plantTF(k, vars) : pt(k);
  }

  function ui(k, vars) {
    return typeof global.DG_uiT === 'function' ? global.DG_uiT(k, vars) : k;
  }

  function cvSubLine(c) {
    if (!c) return '';
    if (c.custom) return pt('cv.customSub');
    var key = 'cv.sub.' + c.id;
    var t = ui(key);
    if (t !== key) return t;
    var sub = c.sub || '';
    if (typeof global.DG_localizeCvSub === 'function') return global.DG_localizeCvSub(sub);
    return sub;
  }

  function catalogPhrase(text) {
    if (typeof global.DG_localizeCatalogPhrase === 'function') return global.DG_localizeCatalogPhrase(text);
    return text || '';
  }

  function tr(k) {
    return typeof global.DG_t === 'function' ? global.DG_t(k) : k;
  }

  function pr(k, vars) {
    return typeof global.DG_tFmt === 'function' ? global.DG_tFmt(k, vars) : k;
  }

  function mergeLocaleDeps(deps) {
    if (!global.DG_t) return deps;
    return Object.assign({}, deps, {
      t: global.DG_t,
      tFmt: global.DG_tFmt,
      fmtMoney: global.DG_fmtMoney,
      currencySym: global.DG_currencySym,
      parseMoneyInput: global.DG_parseMoneyInput,
      formatMoneyInput: global.DG_formatMoneyInput,
      isMoneyEconKey: global.DG_isMoneyEconKey,
      isMoneyCultField: global.DG_isMoneyCultField,
      localeToken: global.DG_localeToken,
      rubToDisplay: global.DG_rubToDisplay
    });
  }

  function formatInputValue(n, decimals) {
    if (n == null || n === '' || isNaN(n)) return '';
    return fmtNum(n, { decimals: decimals || 0 });
  }

  global.DG_calcFormat = {
    parseNumInput: parseNumInput,
    decimalsFromStep: decimalsFromStep,
    fmtNumRu: fmtNumRu,
    fmtNum: fmtNum,
    pt: pt,
    pm: pm,
    ptf: ptf,
    ui: ui,
    cvSubLine: cvSubLine,
    catalogPhrase: catalogPhrase,
    tr: tr,
    pr: pr,
    mergeLocaleDeps: mergeLocaleDeps,
    formatInputValue: formatInputValue
  };
})(typeof window !== 'undefined' ? window : globalThis);
