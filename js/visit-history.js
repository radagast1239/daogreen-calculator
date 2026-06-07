/** История посещений калькулятора (localStorage, только этот браузер) */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'daogreen-visit-history-v1';
  var SESSION_KEY = 'daogreen-visit-current-v1';
  var MAX_ENTRIES = 100;

  function t(k, vars) {
    if (global.DG_tFmt) return global.DG_tFmt(k, vars);
    if (global.DG_t) return global.DG_t(k, vars);
    return k;
  }

  function getBuild() {
    return global.CALC_BUILD_EARLY || '';
  }

  function readList() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function writeList(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
    } catch (_) { /* quota */ }
  }

  function readCurrentId() {
    try {
      return sessionStorage.getItem(SESSION_KEY) || '';
    } catch (_) {
      return '';
    }
  }

  function writeCurrentId(id) {
    try {
      if (id) sessionStorage.setItem(SESSION_KEY, id);
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
  }

  function deviceLabel() {
    var ua = navigator.userAgent || '';
    if (/Mobile|Android|iPhone|iPad/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function newVisitId() {
    return new Date().toISOString() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function findVisit(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function ensureCurrentVisit() {
    var list = readList();
    var id = readCurrentId();
    var visit = id ? findVisit(list, id) : null;
    if (visit && !visit.endedAt) return visit;

    visit = {
      id: newVisitId(),
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMs: null,
      path: (global.location && global.location.pathname) || '',
      host: (global.location && global.location.hostname) || '',
      build: getBuild(),
      device: deviceLabel()
    };
    list.unshift(visit);
    writeList(list);
    writeCurrentId(visit.id);
    return visit;
  }

  function finalizeCurrentVisit() {
    var id = readCurrentId();
    if (!id) return;
    var list = readList();
    var visit = findVisit(list, id);
    if (!visit || visit.endedAt) {
      writeCurrentId('');
      return;
    }
    var end = Date.now();
    var start = Date.parse(visit.startedAt) || end;
    visit.endedAt = new Date(end).toISOString();
    visit.durationMs = Math.max(0, end - start);
    writeList(list);
    writeCurrentId('');
  }

  function formatWhen(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return iso;
    }
  }

  function formatDuration(ms) {
    if (ms == null || ms < 0) return t('visit.active', 'сейчас');
    var sec = Math.round(ms / 1000);
    if (sec < 60) return t('visit.sec', { n: sec });
    var min = Math.floor(sec / 60);
    if (min < 60) return t('visit.min', { n: min });
    var h = Math.floor(min / 60);
    var m = min % 60;
    return m ? t('visit.hmin', { h: h, m: m }) : t('visit.h', { h: h });
  }

  function renderList(el) {
    if (!el) return;
    var list = readList();
    if (!list.length) {
      el.innerHTML = '<p class="visit-history-empty">' + t('visit.empty', 'Пока нет записей.') + '</p>';
      return;
    }
    var html = '<ul class="visit-history-list">';
    list.forEach(function (item) {
      var dur = item.endedAt ? item.durationMs : (Date.now() - (Date.parse(item.startedAt) || Date.now()));
      var dev = item.device === 'mobile' ? t('visit.device.mobile', 'телефон') : t('visit.device.desktop', 'ПК');
      var build = item.build ? (' · ' + item.build) : '';
      html += '<li class="visit-history-item">' +
        '<span class="visit-history-when">' + formatWhen(item.startedAt) + '</span>' +
        '<span class="visit-history-meta">' + formatDuration(dur) + ' · ' + dev + build + '</span>' +
        '</li>';
    });
    html += '</ul>';
    el.innerHTML = html;
  }

  function openDialog() {
    var dialog = document.getElementById('visit-history-dialog');
    var listEl = document.getElementById('visit-history-list');
    if (!dialog) return;
    renderList(listEl);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.hidden = false;
  }

  function closeDialog() {
    var dialog = document.getElementById('visit-history-dialog');
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.hidden = true;
  }

  function clearHistory() {
    if (!global.confirm(t('visit.clearConfirm', 'Очистить всю историю посещений в этом браузере?'))) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    ensureCurrentVisit();
    renderList(document.getElementById('visit-history-list'));
  }

  function bindUi() {
    var btn = document.getElementById('btn-visit-history');
    var dialog = document.getElementById('visit-history-dialog');
    if (!dialog) return;

    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', openDialog);
    }
    dialog.querySelectorAll('[data-visit-history-close]').forEach(function (el) {
      if (el.dataset.bound) return;
      el.dataset.bound = '1';
      el.addEventListener('click', closeDialog);
    });
    var clearBtn = document.getElementById('btn-visit-history-clear');
    if (clearBtn && !clearBtn.dataset.bound) {
      clearBtn.dataset.bound = '1';
      clearBtn.addEventListener('click', clearHistory);
    }
  }

  function trackVisit() {
    ensureCurrentVisit();
    global.addEventListener('pagehide', finalizeCurrentVisit);
  }

  function init() {
    trackVisit();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindUi);
    } else {
      bindUi();
    }
  }

  init();
  global.DG_openVisitHistory = openDialog;
})(typeof window !== 'undefined' ? window : this);
