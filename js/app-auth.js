/**
 * Вход: сервер (Netlify / serve:auth) или локальный режим для GitHub Pages (хеш пароля).
 */
(function (global) {
  'use strict';

  var API = {
    session: '/.netlify/functions/auth-session',
    login: '/.netlify/functions/auth-login',
    logout: '/.netlify/functions/auth-logout'
  };

  var SESSION_KEY = 'dg-auth-session-v1';
  var serverAuth = null;
  var clientAuth = false;
  var useClientMode = false;
  var loginComplete = false;

  /** Временно: в HTML задайте window.DG_AUTH_DISABLED = true */
  function authDisabled() {
    return global.DG_AUTH_DISABLED === true;
  }

  function getClientCfg() {
    return global.DG_AUTH_CLIENT || null;
  }

  function clientReady() {
    var c = getClientCfg();
    return !!(c && c.passHash && String(c.passHash).length === 64 && /^[a-f0-9]+$/.test(c.passHash));
  }

  function sha256Hex(str) {
    var enc = new TextEncoder();
    return global.crypto.subtle.digest('SHA-256', enc.encode(str)).then(function (buf) {
      var arr = Array.from(new Uint8Array(buf));
      return arr.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function passHash(login, pass, cfg) {
    cfg = cfg || getClientCfg();
    var salt = (cfg && cfg.salt) || 'daogreen-calc-auth-v1';
    return sha256Hex(salt + '\n' + String(login || '').trim().toLowerCase() + ':' + String(pass || ''));
  }

  function sessionToken(cfg) {
    cfg = cfg || getClientCfg();
    return sha256Hex(
      (cfg.salt || '') + '|' + String(cfg.login || '').trim().toLowerCase() + '|' +
      cfg.passHash + '|session-v1'
    );
  }

  function fetchJson(url, opts) {
    opts = opts || {};
    opts.credentials = 'same-origin';
    opts.headers = Object.assign({ Accept: 'application/json' }, opts.headers || {});
    return fetch(url, opts).then(function (res) {
      return res.json().catch(function () {
        return { ok: false };
      }).then(function (data) {
        return { res: res, data: data || {} };
      });
    });
  }

  function isAuthed() {
    if (authDisabled()) return true;
    return serverAuth === true || clientAuth === true;
  }

  function isPreviewMode() {
    return document.documentElement.classList.contains('auth-preview');
  }

  function tAuth(key, fallback) {
    return (global.DG_t && global.DG_t(key)) || fallback;
  }

  function syncPreviewBannerText() {
    var text = document.getElementById('app-auth-preview-text');
    var loginBtn = document.getElementById('btn-auth-preview-login');
    if (text) {
      text.textContent = tAuth(
        'auth.preview.banner',
        'Режим предпросмотра — можно смотреть все вкладки. Для расчётов и правок войдите.'
      );
    }
    if (loginBtn) {
      loginBtn.textContent = tAuth('auth.preview.login', 'Войти');
    }
  }

  function showAuthGateModal() {
    var gate = document.getElementById('app-auth-gate');
    if (!gate) return;
    gate.hidden = false;
    gate.style.display = '';
    gate.classList.add('app-auth-gate--modal');
    gate.setAttribute('aria-hidden', 'false');
    var login = document.getElementById('app-auth-login');
    if (login) login.focus();
  }

  function hideAuthGate() {
    var gate = document.getElementById('app-auth-gate');
    if (!gate) return;
    gate.hidden = true;
    gate.style.display = 'none';
    gate.classList.remove('app-auth-gate--modal');
    gate.setAttribute('aria-hidden', 'true');
  }

  function enterPreviewMode() {
    document.documentElement.classList.remove('auth-locked');
    document.documentElement.classList.add('auth-preview');
    document.documentElement.classList.remove('read-only-mode');
    hideAuthGate();
    var banner = document.getElementById('app-auth-preview-banner');
    if (banner) banner.hidden = false;
    syncPreviewBannerText();
    var page = document.querySelector('.page');
    if (page) {
      page.removeAttribute('aria-hidden');
      page.style.visibility = '';
      page.style.pointerEvents = '';
    }
    try {
      localStorage.removeItem('daogreen-readonly');
    } catch (_) {}
    var roBtn = document.getElementById('btn-readonly');
    if (roBtn) roBtn.classList.remove('on');
    global.dispatchEvent(new CustomEvent('daogreen-preview-enter'));
  }

  function exitPreviewMode() {
    document.documentElement.classList.remove('auth-preview');
    var banner = document.getElementById('app-auth-preview-banner');
    if (banner) banner.hidden = true;
    hideAuthGate();
  }

  function unlock() {
    exitPreviewMode();
    document.documentElement.classList.remove('auth-locked');
    var page = document.querySelector('.page');
    if (page) {
      page.removeAttribute('aria-hidden');
      page.style.visibility = '';
      page.style.pointerEvents = '';
    }
    loginComplete = false;
    global.dispatchEvent(new CustomEvent('daogreen-auth-ok'));
  }

  function grantAccess() {
    if (loginComplete && !clientAuth && !serverAuth) {
      clientAuth = true;
    }
    if (isAuthed() || loginComplete) {
      unlock();
      return Promise.resolve();
    }
    return checkClientSession().then(function (ok) {
      if (ok) unlock();
    });
  }

  function lock() {
    enterPreviewMode();
  }

  function formatErr(msg) {
    if (msg == null || msg === '') return '';
    if (typeof msg === 'string') return msg;
    if (typeof msg === 'object' && msg.message) return String(msg.message);
    return tAuth('auth.error.invalid', 'Неверный логин или пароль');
  }

  function showError(msg) {
    var el = document.getElementById('app-auth-error');
    if (!el) return;
    if (msg) {
      el.textContent = formatErr(msg);
      el.hidden = false;
    } else {
      el.textContent = '';
      el.hidden = true;
    }
  }

  function showConfigHint(msg) {
    var el = document.getElementById('app-auth-config-hint');
    if (el) {
      el.textContent = msg || '';
      el.hidden = !msg;
    }
  }

  function showSuccess() {
    loginComplete = true;
    var form = document.getElementById('app-auth-form');
    var ok = document.getElementById('app-auth-success');
    var footerLinks = document.getElementById('app-auth-footer-links');
    if (form) form.hidden = true;
    if (ok) ok.hidden = false;
    if (footerLinks) footerLinks.hidden = true;
    showError('');
    var enterBtn = document.getElementById('app-auth-enter');
    if (enterBtn) enterBtn.focus();
  }

  /** Серверный вход только на Netlify (и serve:auth вручную). Локально — хеш из auth-client-config.js */
  function hostUsesServerAuth() {
    var h = global.location && global.location.hostname;
    return !!(h && h.indexOf('netlify.app') >= 0);
  }

  function preferClientAuth() {
    return clientReady() || !hostUsesServerAuth();
  }

  function readClientSession() {
    try {
      var raw = global.sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function writeClientSession(token) {
    var cfg = getClientCfg();
    var days = (cfg && cfg.maxAgeDays) || 7;
    var payload = {
      t: token,
      exp: Date.now() + days * 24 * 60 * 60 * 1000
    };
    try {
      global.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  function clearClientSession() {
    try {
      global.sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
  }

  function checkClientSession() {
    if (!clientReady()) return Promise.resolve(false);
    var saved = readClientSession();
    if (!saved || !saved.t || !saved.exp || saved.exp < Date.now()) {
      clearClientSession();
      return Promise.resolve(false);
    }
    return sessionToken().then(function (tok) {
      if (saved.t === tok) {
        clientAuth = true;
        return true;
      }
      clearClientSession();
      return false;
    });
  }

  function tryClientLogin(login, password) {
    var cfg = getClientCfg();
    if (!clientReady()) {
      return Promise.resolve({ ok: false, error: tAuth('auth.error.notConfigured', 'Вход не настроен. Выполните npm run auth:config и обновите сайт на GitHub.') });
    }
    if (!global.crypto || !global.crypto.subtle) {
      return Promise.resolve({
        ok: false,
        error: tAuth('auth.error.https', 'Нужен HTTPS или http://localhost (не file://).')
      });
    }
    return passHash(login, password, cfg).then(function (hash) {
      if (hash !== cfg.passHash) {
        return { ok: false, error: tAuth('auth.error.invalid', 'Неверный логин или пароль') };
      }
      if (String(login || '').trim().toLowerCase() !== String(cfg.login || '').trim().toLowerCase()) {
        return { ok: false, error: tAuth('auth.error.invalid', 'Неверный логин или пароль') };
      }
      return sessionToken(cfg).then(function (tok) {
        writeClientSession(tok);
        clientAuth = true;
        return { ok: true };
      });
    }).catch(function () {
      return { ok: false, error: tAuth('auth.error.clientCheck', 'Ошибка проверки пароля в браузере.') };
    });
  }

  function enableClientMode() {
    useClientMode = true;
    showConfigHint('');
  }

  function checkServerSession() {
    if (!hostUsesServerAuth()) {
      return Promise.resolve(false);
    }
    return fetchJson(API.session, { method: 'GET' }).then(function (r) {
      if (r.res.status === 200 && r.data.ok) {
        serverAuth = true;
        return true;
      }
      return false;
    }).catch(function () {
      return false;
    });
  }

  function submitServerLogin(login, pass) {
    return fetchJson(API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: login, password: pass })
    }).then(function (r) {
      if (r.res.status === 200 && r.data.ok) {
        serverAuth = true;
        return { ok: true };
      }
      if (r.res.status === 503 || r.res.status === 404 || r.res.status >= 500) {
        return { ok: false, serverOff: true, error: r.data.error };
      }
      return { ok: false, serverOff: true };
    }).catch(function () {
      return { ok: false, serverOff: true };
    });
  }

  function bindForm() {
    var form = document.getElementById('app-auth-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var loginEl = form.querySelector('[name="login"]');
      var passEl = form.querySelector('[name="password"]');
      var login = loginEl ? String(loginEl.value || '').trim() : '';
      var pass = passEl ? String(passEl.value || '') : '';
      showError('');

      function doneClientFirst() {
        tryClientLogin(login, pass).then(function (r) {
          if (r.ok) {
            showSuccess();
            if (passEl) passEl.value = '';
            return;
          }
          showError(r.error || tAuth('auth.error.invalid', 'Неверный логин или пароль'));
          if (passEl) {
            passEl.value = '';
            passEl.focus();
          }
        });
      }

      if (useClientMode || preferClientAuth()) {
        if (!clientReady()) {
          showError(tAuth('auth.error.noConfig', 'Не загружен js/auth-client-config.js.'));
          return;
        }
        enableClientMode();
        doneClientFirst();
        return;
      }

      submitServerLogin(login, pass).then(function (r) {
        if (r.ok) {
          showSuccess();
          if (passEl) passEl.value = '';
          return;
        }
        showError(formatErr(r.error) || tAuth('auth.error.invalid', 'Неверный логин или пароль'));
        if (passEl) {
          passEl.value = '';
          passEl.focus();
        }
      });
    });

    var enterBtn = document.getElementById('app-auth-enter');
    if (enterBtn && !enterBtn.dataset.bound) {
      enterBtn.dataset.bound = '1';
      enterBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (isAuthed() || loginComplete) {
          grantAccess();
          return;
        }
        checkClientSession().then(function (ok) {
          if (ok || loginComplete) grantAccess();
        });
      });
    }
  }

  function bindLogout() {
    var btn = document.getElementById('btn-logout');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      global.DG_logoutApp();
    });
  }

  function isPreviewAllowedTarget(el) {
    if (!el) return false;
    return !!(
      el.closest('#app-auth-preview-banner') ||
      el.closest('#app-auth-gate') ||
      el.closest('[data-preview-allow]') ||
      el.closest('.app-tab') ||
      el.closest('.facility-btn') ||
      el.closest('.collapse-head')
    );
  }

  function bindPreviewGuards() {
    if (document.documentElement.dataset.previewGuard) return;
    document.documentElement.dataset.previewGuard = '1';

    document.addEventListener('click', function (e) {
      if (!isPreviewMode()) return;
      if (isPreviewAllowedTarget(e.target)) return;
      var blocked = e.target.closest(
        'input, select, textarea, button, label, .cv-card, .cv-row, .cultivar, [role="slider"], .theme-toggle'
      );
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    document.addEventListener('change', function (e) {
      if (!isPreviewMode()) return;
      if (isPreviewAllowedTarget(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    }, true);

    document.addEventListener('keydown', function (e) {
      if (!isPreviewMode()) return;
      if (isPreviewAllowedTarget(e.target)) return;
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
        e.preventDefault();
      }
    }, true);
  }

  function bindPreviewUi() {
    var loginBtn = document.getElementById('btn-auth-preview-login');
    if (loginBtn && !loginBtn.dataset.bound) {
      loginBtn.dataset.bound = '1';
      loginBtn.addEventListener('click', function () {
        showAuthGateModal();
      });
    }
    var closeBtn = document.getElementById('app-auth-gate-close');
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', function () {
        hideAuthGate();
      });
    }
    var gate = document.getElementById('app-auth-gate');
    if (gate && !gate.dataset.previewBound) {
      gate.dataset.previewBound = '1';
      gate.addEventListener('click', function (e) {
        if (!isPreviewMode()) return;
        if (e.target === gate) hideAuthGate();
      });
    }
  }

  function initAppAuth() {
    bindForm();
    bindLogout();
    bindPreviewGuards();
    bindPreviewUi();

    if (authDisabled()) {
      clientAuth = true;
      unlock();
      return;
    }

    function finishInit() {
      return checkClientSession().then(function (clientOk) {
        if (clientOk) {
          enableClientMode();
          unlock();
          return;
        }
        if (hostUsesServerAuth()) {
          return checkServerSession().then(function (serverOk) {
            if (serverOk) {
              enableClientMode();
              unlock();
              return;
            }
            enterPreviewMode();
            if (clientReady()) showConfigHint('');
          });
        }
        if (clientReady()) enableClientMode();
        enterPreviewMode();
        var host = global.location && global.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
          showConfigHint('');
        } else {
          showConfigHint('');
        }
      });
    }
    finishInit();
  }

  global.DG_isAppAuthed = isAuthed;
  global.DG_isPreviewMode = isPreviewMode;
  global.DG_syncAuthPreviewI18n = syncPreviewBannerText;
  global.DG_logoutApp = function () {
    var done = function () {
      serverAuth = false;
      clientAuth = false;
      loginComplete = false;
      clearClientSession();
      lock();
      var form = document.getElementById('app-auth-form');
      var okBox = document.getElementById('app-auth-success');
      var footerLinks = document.getElementById('app-auth-footer-links');
      if (form) {
        form.hidden = false;
        form.reset();
      }
      if (okBox) okBox.hidden = true;
      if (footerLinks) footerLinks.hidden = false;
      showError('');
    };
    if (serverAuth && hostUsesServerAuth()) {
      fetchJson(API.logout, { method: 'POST' }).finally(done);
    } else {
      done();
    }
  };
  global.DG_initAppAuth = initAppAuth;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppAuth);
  } else {
    initAppAuth();
  }
})(typeof window !== 'undefined' ? window : this);
