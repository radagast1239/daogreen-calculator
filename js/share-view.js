/**
 * Демо по ссылке: ?share=demos/имя.json
 * Загружает JSON проекта с того же сайта (или raw.githubusercontent.com), только просмотр.
 */
(function (global) {
  'use strict';

  var PROJECT_VERSION = 1;

  function parseShareParam() {
    try {
      var q = new URLSearchParams(global.location.search);
      var share = (q.get('share') || '').trim();
      if (!share || share === '0' || share === 'false') return null;
      if (share === '1' || share === 'true') {
        share = (q.get('project') || q.get('demo') || '').trim();
        if (!share) return null;
      }
      return share;
    } catch (_) {
      return null;
    }
  }

  function isAllowedShareRef(ref) {
    if (!ref || typeof ref !== 'string') return false;
    if (/^https?:\/\//i.test(ref)) {
      try {
        var u = new URL(ref);
        var loc = new URL(global.location.href);
        if (u.origin === loc.origin) return /\.json$/i.test(u.pathname);
        if (/^https:\/\/raw\.githubusercontent\.com\//i.test(u.href)) return /\.json(\?|$)/i.test(u.href);
      } catch (_) {
        return false;
      }
      return false;
    }
    if (ref.indexOf('..') >= 0 || ref.indexOf('\\') >= 0) return false;
    return /^[a-zA-Z0-9][a-zA-Z0-9._/-]*\.json$/i.test(ref);
  }

  function resolveShareUrl(ref) {
    if (/^https?:\/\//i.test(ref)) return ref;
    return new URL(ref, global.location.href).href;
  }

  function t(k, ru) {
    if (global.DG_t) {
      var v = global.DG_t(k);
      if (v != null && v !== k) return v;
    }
    return ru != null ? ru : k;
  }

  function tFmt(k, vars, ru) {
    if (global.DG_tFmt) return global.DG_tFmt(k, vars);
    var s = t(k, ru);
    if (vars) {
      Object.keys(vars).forEach(function (vk) {
        s = s.replace(new RegExp('\\{' + vk + '\\}', 'g'), String(vars[vk]));
      });
    }
    return s;
  }

  var shareRef = parseShareParam();
  if (!shareRef || !isAllowedShareRef(shareRef)) {
    if (shareRef) {
      global.DG_SHARE_ERROR = t('share.badPath', 'Недопустимый путь к демо (нужен demos/имя.json)');
    }
    return;
  }

  global.DG_SHARE = {
    ref: shareRef,
    url: resolveShareUrl(shareRef),
    active: false,
    loading: true
  };
  global.DG_SHARE_PENDING = true;

  global.DG_isShareMode = function () {
    return !!(global.DG_SHARE && (global.DG_SHARE.active || global.DG_SHARE.loading));
  };

  function calcOpenHref() {
    try {
      var u = new URL(global.location.href);
      u.searchParams.delete('share');
      u.searchParams.delete('project');
      u.searchParams.delete('demo');
      u.searchParams.delete('readonly');
      return u.pathname + (u.search || '') + u.hash;
    } catch (_) {
      return 'calculator-110x55_12.html';
    }
  }

  function ensureBanner() {
    var el = document.getElementById('share-view-banner');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'share-view-banner';
    el.className = 'share-view-banner';
    el.setAttribute('role', 'status');
    document.body.insertBefore(el, document.body.firstChild);
    return el;
  }

  function setBanner(html) {
    var el = ensureBanner();
    el.innerHTML = html;
    el.hidden = false;
  }

  function setLoading(on) {
    document.documentElement.classList.toggle('share-loading', !!on);
    if (on) {
      setBanner(
        '<span class="share-view-banner__text">' + t('share.loading', 'Загрузка демо…') + '</span>'
      );
    }
  }

  function lockShareUi(meta) {
    global.DG_SHARE.active = true;
    global.DG_SHARE.loading = false;
    global.DG_SHARE_PENDING = false;
    document.documentElement.classList.add('share-mode', 'read-only-mode');
    document.documentElement.classList.remove('share-loading');

    var title = (meta && meta.title) ? meta.title : shareRef;
    var build = (meta && meta.build) ? meta.build : '';
    setBanner(
      '<span class="share-view-banner__brand" aria-hidden="true">Daogreen</span>' +
      '<span class="share-view-banner__watermark">' +
        t('share.watermark', 'Только просмотр') +
      '</span>' +
      '<span class="share-view-banner__text">' +
        tFmt('share.banner', { title: title, build: build }, 'Демо: {title} — только просмотр') +
      '</span>' +
      '<a class="share-view-banner__link" href="' + calcOpenHref() + '">' +
        t('share.openCalc', 'Открыть калькулятор') +
      '</a>'
    );

    if (global.DG_syncReadonlyI18n) global.DG_syncReadonlyI18n();
    var roBtn = document.getElementById('btn-readonly');
    if (roBtn) roBtn.classList.add('on');
  }

  function showShareError(msg) {
    global.DG_SHARE.loading = false;
    global.DG_SHARE_PENDING = false;
    document.documentElement.classList.remove('share-loading');
    setBanner(
      '<span class="share-view-banner__text share-view-banner__text--err">' +
        tFmt('share.error', { msg: msg }, 'Не удалось загрузить демо: {msg}') +
      '</span>' +
      '<a class="share-view-banner__link" href="' + calcOpenHref() + '">' +
        t('share.openCalc', 'Открыть калькулятор') +
      '</a>'
    );
  }

  function normalizeSnapshot(raw) {
    if (!raw || typeof raw !== 'object') throw new Error(t('share.invalidJson', 'Пустой JSON'));
    if (raw.v === PROJECT_VERSION && raw.state) return raw;
    if (raw.state && typeof raw.state === 'object') {
      return { v: PROJECT_VERSION, build: raw.build || '', exportedAt: raw.exportedAt || '', state: raw.state };
    }
    return { v: PROJECT_VERSION, build: '', exportedAt: '', state: raw };
  }

  function applySnapshot(data) {
    var snap = normalizeSnapshot(data);
    if (snap.v !== PROJECT_VERSION || !snap.state) {
      throw new Error(tFmt('share.badVersion', { v: PROJECT_VERSION }, 'Ожидается версия проекта {v}'));
    }
    if (!global.DaoGreenCalc || typeof global.DaoGreenCalc.applyProject !== 'function') {
      throw new Error(t('share.appNotReady', 'Калькулятор ещё не готов'));
    }
    global.DaoGreenCalc.applyProject(snap.state);
    if (typeof global.DaoGreenCalc.renderAll === 'function') global.DaoGreenCalc.renderAll();
    var st = global.DaoGreenCalc.getState();
    var cv = st && (st.vfCv || st.cv || st.palletCv);
    lockShareUi({
      title: shareRef.replace(/^.*\//, '').replace(/\.json$/i, ''),
      build: snap.build || (global.DaoGreenCalc.BUILD || '')
    });
    if (global.DG_tFmt && cv) {
      /* noop — title from filename is enough */
    }
  }

  function waitForApp() {
    return new Promise(function (resolve, reject) {
      var n = 0;
      var max = 400;
      function tick() {
        if (global.DaoGreenCalc && typeof global.DaoGreenCalc.applyProject === 'function') {
          resolve();
          return;
        }
        if (++n > max) {
          reject(new Error(t('share.timeout', 'Таймаут загрузки калькулятора')));
          return;
        }
        global.setTimeout(tick, 50);
      }
      global.addEventListener('daogreen-app-ready', resolve, { once: true });
      tick();
    });
  }

  function run() {
    setLoading(true);
    Promise.all([
      fetch(global.DG_SHARE.url, { cache: 'no-cache' }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }),
      waitForApp()
    ])
      .then(function (pair) {
        applySnapshot(pair[0]);
      })
      .catch(function (err) {
        showShareError(err && err.message ? err.message : String(err));
      });
  }

  global.DG_onShareReady = run;
})(typeof window !== 'undefined' ? window : this);
