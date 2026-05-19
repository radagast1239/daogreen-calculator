/**
 * Переключатель «простой / полный» интерфейс (без скрытия как у Георгия).
 */
(function(global){
  'use strict';

  var STORAGE_KEY = 'calc-simple-ui';

  function createSimpleUiMode(deps){
    function st(){ return deps.getState(); }

    function setDom(on){
      document.documentElement.classList.toggle('simple-ui-active', !!on);
      var btn = document.getElementById('btn-simple-ui');
      if (btn){
        btn.classList.toggle('on', !!on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        var labelOn = deps.t ? deps.t('ui.simple.btnOn') : 'Полный интерфейс';
        var labelOff = deps.t ? deps.t('ui.simple.btn') : 'Простой интерфейс';
        btn.textContent = on ? (labelOn || 'Полный интерфейс') : (labelOff || 'Простой интерфейс');
      }
    }

    function sync(){
      setDom(!!st().simpleUiMode);
    }

    function toggle(force){
      var next = force != null ? !!force : !st().simpleUiMode;
      st().simpleUiMode = next;
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch(_){}
      setDom(next);
      if (deps.renderAll) deps.renderAll();
    }

    function load(){
      try {
        st().simpleUiMode = localStorage.getItem(STORAGE_KEY) === '1';
      } catch(_){ st().simpleUiMode = false; }
      setDom(!!st().simpleUiMode);
    }

    function bind(){
      var btn = document.getElementById('btn-simple-ui');
      if (btn && !btn.dataset.bound){
        btn.dataset.bound = '1';
        btn.addEventListener('click', function(){ toggle(); });
      }
    }

    return { bind: bind, load: load, sync: sync, toggle: toggle };
  }

  global.DG_createSimpleUiMode = createSimpleUiMode;
})(typeof window !== 'undefined' ? window : this);
