/** Режим только просмотра */
(function(global){
  'use strict';

  var STORAGE_KEY = 'daogreen-readonly';

  function isReadonly(){
    if (global.location.search.indexOf('readonly=1') >= 0) return true;
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch(_){ return false; }
  }

  function t(k){
    return (global.DG_t && global.DG_t(k)) || k;
  }

  function applyReadonly(on){
    if (global.DG_isPreviewMode && global.DG_isPreviewMode()) {
      on = false;
    }
    document.documentElement.classList.toggle('read-only-mode', !!on);
    var btn = document.getElementById('btn-readonly');
    if (btn){
      btn.classList.toggle('on', !!on);
      btn.textContent = on ? t('btn.readonly.edit') : t('btn.readonly');
      btn.title = on ? t('btn.readonly.titleEdit') : t('btn.readonly.title');
    }
    try {
      if (on) localStorage.setItem(STORAGE_KEY, '1');
      else localStorage.removeItem(STORAGE_KEY);
    } catch(_){}
  }

  function initReadonlyMode(){
    var btn = document.getElementById('btn-readonly');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    applyReadonly(isReadonly());
    btn.addEventListener('click', function(){
      if (global.DG_isPreviewMode && global.DG_isPreviewMode()) return;
      applyReadonly(!document.documentElement.classList.contains('read-only-mode'));
    });
  }

  global.DG_initReadonlyMode = initReadonlyMode;
  global.DG_syncReadonlyI18n = function(){
    applyReadonly(document.documentElement.classList.contains('read-only-mode'));
  };
})(typeof window !== 'undefined' ? window : this);
