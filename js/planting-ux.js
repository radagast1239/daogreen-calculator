/** Посадка: метаданные проекта, мобильная шапка, табы сравнения, справочник → расчёт */
(function (global) {
  'use strict';

  var cvCompareTab = 'chart';

  function createPlantingUx(deps) {
    var $ = deps.$;
    var getState = deps.getState;

    function ui(k) {
      return deps.ui ? deps.ui(k) : k;
    }

    function syncProjectMetaBar() {
      var bar = $('project-meta-bar');
      if (!bar) return;
      var view = getState().appView;
      bar.classList.toggle('env-block-hidden', view === 'standards');
    }

    function initMastheadMobile() {
      var btn = $('btn-masthead-menu');
      var panel = $('masthead-menu-panel');
      if (!btn || !panel || btn.dataset.bound) return;
      btn.dataset.bound = '1';

      function close() {
        panel.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        var actions = document.getElementById('masthead-actions');
        if (actions) actions.classList.remove('masthead-actions--open');
      }
      function open() {
        panel.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        var actions = document.getElementById('masthead-actions');
        if (actions) actions.classList.add('masthead-actions--open');
      }

      btn.addEventListener('click', function () {
        if (panel.hidden) open();
        else close();
      });
      panel.querySelectorAll('[data-masthead-menu-close]').forEach(function (el) {
        el.addEventListener('click', close);
      });
      document.addEventListener('click', function (e) {
        if (panel.hidden) return;
        if (btn.contains(e.target) || panel.contains(e.target)) return;
        close();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    }

    function setCvCompareTab(tab) {
      cvCompareTab = tab === 'table' ? 'table' : 'chart';
      syncCvCompareTabs();
    }

    function syncCvCompareTabs() {
      var st = getState();
      var tabs = $('cv-compare-tabs');
      var chartPane = $('cv-compare-pane-chart');
      var tablePane = $('cv-compare-pane-table');
      if (!tabs) return;
      var compareOn = !!st.compareMode;
      tabs.classList.toggle('env-block-hidden', !compareOn);
      if (!compareOn) {
        if (chartPane) chartPane.classList.remove('env-block-hidden');
        if (tablePane) tablePane.classList.add('env-block-hidden');
        return;
      }
      tabs.querySelectorAll('[data-cv-compare-tab]').forEach(function (b) {
        var on = b.getAttribute('data-cv-compare-tab') === cvCompareTab;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (chartPane) chartPane.classList.toggle('env-block-hidden', cvCompareTab !== 'chart');
      if (tablePane) tablePane.classList.toggle('env-block-hidden', cvCompareTab !== 'table');
    }

    function bindCvCompareTabs() {
      var tabs = $('cv-compare-tabs');
      if (!tabs || tabs.dataset.bound) return;
      tabs.dataset.bound = '1';
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-cv-compare-tab]');
        if (!btn) return;
        setCvCompareTab(btn.getAttribute('data-cv-compare-tab'));
      });
    }

    function openCultivarInCalc(cvId, env) {
      if (!cvId || !deps.setAppView) return;
      var st = getState();
      if (env === 'pal') {
        deps.setAppView('pallets');
        st.palletCv = cvId;
        st.cv = cvId;
      } else if (env === 'vf') {
        deps.setAppView('channels');
        st.facility = 'vertical';
        st.vfCv = cvId;
      } else {
        deps.setAppView('channels');
        st.facility = 'greenhouse';
        st.cv = cvId;
      }
      if (deps.renderAll) deps.renderAll();
      var tabs = $('app-tabs');
      if (tabs && tabs.scrollIntoView) tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function bindFarmCalNudge() {
      var nudge = $('farm-cal-nudge');
      if (!nudge || nudge.dataset.bound) return;
      nudge.dataset.bound = '1';
      nudge.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-farm-cal-open]');
        if (!btn) return;
        var st = getState();
        st.sectionCollapsed['block-panel-farm-calibration'] = false;
        var block = $('block-panel-farm-calibration');
        var body = $('block-panel-farm-calibration-body') ||
          (block && block.querySelector('.collapse-body'));
        var head = block && block.querySelector('.collapse-head');
        if (body) body.classList.remove('is-collapsed');
        if (head) {
          var chev = head.querySelector('.collapse-chev');
          if (chev) chev.textContent = '▼';
        }
        if (block && block.scrollIntoView) block.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    function init() {
      initMastheadMobile();
      bindCvCompareTabs();
      bindFarmCalNudge();
      syncProjectMetaBar();
      syncCvCompareTabs();
    }

    return {
      init: init,
      syncProjectMetaBar: syncProjectMetaBar,
      syncCvCompareTabs: syncCvCompareTabs,
      setCvCompareTab: setCvCompareTab,
      openCultivarInCalc: openCultivarInCalc
    };
  }

  global.DG_createPlantingUx = createPlantingUx;
})(typeof window !== 'undefined' ? window : globalThis);
