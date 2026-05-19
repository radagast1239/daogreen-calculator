/** Регистрация PWA / service worker (только по HTTP(S), не file://) */
(function(global){
  'use strict';

  function getBuild(){
    if (global.DaoGreenCalc && global.DaoGreenCalc.BUILD) return global.DaoGreenCalc.BUILD;
    var m = document.querySelector('script[src*="calculator"]');
    return null;
  }

  function registerSw(){
    if (!('serviceWorker' in navigator)) return;
    if (global.location.protocol === 'file:'){
      console.info('PWA: откройте через локальный сервер (start-server.bat), не file://');
      return;
    }
    var build = getBuild();
    var url = 'sw.js' + (build ? '?v=' + encodeURIComponent(build) : '');
    navigator.serviceWorker.register(url, { scope: './' }).then(function(reg){
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }).catch(function(err){
      console.warn('PWA: service worker не зарегистрирован', err);
    });
  }

  if (document.readyState === 'complete') registerSw();
  else global.addEventListener('load', registerSw);
})(typeof window !== 'undefined' ? window : this);
