/** Вход: проверка логина/пароля на сервере (Netlify Functions или npm run serve:auth). */
(function (global) {
  'use strict';

  var API = {
    session: '/.netlify/functions/auth-session',
    login: '/.netlify/functions/auth-login',
    logout: '/.netlify/functions/auth-logout'
  };

  var serverAuth = null;
  var serverChecked = false;

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
    return serverAuth === true;
  }

  function unlock() {
    document.documentElement.classList.remove('auth-locked');
    var gate = document.getElementById('app-auth-gate');
    if (gate) {
      gate.hidden = true;
      gate.setAttribute('aria-hidden', 'true');
    }
    var page = document.querySelector('.page');
    if (page) page.removeAttribute('aria-hidden');
    global.dispatchEvent(new CustomEvent('daogreen-auth-ok'));
  }

  function lock() {
    document.documentElement.classList.add('auth-locked');
    var gate = document.getElementById('app-auth-gate');
    if (gate) {
      gate.hidden = false;
      gate.setAttribute('aria-hidden', 'false');
    }
    var page = document.querySelector('.page');
    if (page) page.setAttribute('aria-hidden', 'true');
  }

  function showError(msg) {
    var el = document.getElementById('app-auth-error');
    if (!el) return;
    if (msg) {
      el.textContent = msg;
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
    var form = document.getElementById('app-auth-form');
    var ok = document.getElementById('app-auth-success');
    var footerLinks = document.getElementById('app-auth-footer-links');
    if (form) form.hidden = true;
    if (ok) ok.hidden = false;
    if (footerLinks) footerLinks.hidden = true;
    showError('');
  }

  function checkServerSession() {
    return fetchJson(API.session, { method: 'GET' }).then(function (r) {
      serverChecked = true;
      if (r.res.status === 200 && r.data.ok) {
        serverAuth = true;
        return true;
      }
      if (r.res.status === 503 && r.data.configured === false) {
        serverAuth = false;
        showConfigHint(
          'Сервер входа не настроен: в Netlify → Site settings → Environment variables задайте AUTH_USER, AUTH_PASS и AUTH_SECRET (см. .env.example).'
        );
        return false;
      }
      serverAuth = false;
      return false;
    }).catch(function () {
      serverChecked = true;
      serverAuth = false;
      var host = global.location && global.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        showConfigHint('Локально запускайте npm run serve:auth (не просто serve) и файл .env в корне проекта.');
      } else {
        showConfigHint(
          'Вход через сервер недоступен на этом хостинге. Разместите сайт на Netlify с netlify.toml или включите защиту паролем в панели хостинга.'
        );
      }
      return false;
    });
  }

  function bindForm() {
    var form = document.getElementById('app-auth-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var login = form.querySelector('[name="login"]');
      var pass = form.querySelector('[name="password"]');
      showError('');
      fetchJson(API.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: login && login.value,
          password: pass && pass.value
        })
      })
        .then(function (r) {
          if (r.res.status === 200 && r.data.ok) {
            serverAuth = true;
            showSuccess();
            if (pass) pass.value = '';
            return;
          }
          if (r.res.status === 503) {
            showError(r.data.error || 'Сервер входа не настроен');
            return;
          }
          showError(r.data.error || 'Неверный логин или пароль');
          if (pass) {
            pass.value = '';
            pass.focus();
          }
        })
        .catch(function () {
          showError('Нет связи с сервером входа. Проверьте хостинг и HTTPS.');
        });
    });

    var enterBtn = document.getElementById('app-auth-enter');
    if (enterBtn) {
      enterBtn.addEventListener('click', function () {
        if (serverAuth) unlock();
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

  function initAppAuth() {
    bindForm();
    bindLogout();
    lock();
    checkServerSession().then(function (ok) {
      if (ok) unlock();
    });
  }

  global.DG_isAppAuthed = isAuthed;
  global.DG_logoutApp = function () {
    fetchJson(API.logout, { method: 'POST' }).finally(function () {
      serverAuth = false;
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
      var login = document.getElementById('app-auth-login');
      if (login) login.focus();
    });
  };
  global.DG_initAppAuth = initAppAuth;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppAuth);
  } else {
    initAppAuth();
  }
})(typeof window !== 'undefined' ? window : this);
