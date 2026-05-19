/** Тема light/dark — раньше inline в calculator HTML */
(function(global){
'use strict';
/* Theme handling — runs first, before main calculator IIFE */
(function(){
  const STORAGE_KEY = 'calc-110x55-theme';
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
  }
  function getStoredTheme(){
    try { return localStorage.getItem(STORAGE_KEY); } catch(e){ return null; }
  }
  function setStoredTheme(theme){
    try { localStorage.setItem(STORAGE_KEY, theme); } catch(e){}
  }
  function systemPrefersDark(){
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /* Initial theme: stored value > system preference > light */
  const stored = getStoredTheme();
  const initial = stored || (systemPrefersDark() ? 'dark' : 'light');
  applyTheme(initial);

  /* Wire up toggle */
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      setStoredTheme(next);
    });
  });
})();
})(typeof window !== 'undefined' ? window : globalThis);
