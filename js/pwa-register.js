/** Регистрация PWA / service worker (только по HTTP(S), не file://) */
(function(global){
  'use strict';

  function getBuild(){
    if (global.CALC_BUILD_EARLY) return global.CALC_BUILD_EARLY;
    if (global.DaoGreenCalc && global.DaoGreenCalc.BUILD) return global.DaoGreenCalc.BUILD;
    var scripts = document.getElementsByTagName('script');
    var build = null;
    for (var i = 0; i < scripts.length; i++){
      var src = scripts[i].src || '';
      if (!src || /preview-config\.js/i.test(src)) continue;
      var m = src.match(/[?&]v=([^&]+)/);
      if (m) build = decodeURIComponent(m[1]);
    }
    return build;
  }

  function registerSw(){
    if (!('serviceWorker' in navigator)) return;
    if (global.location.protocol === 'file:'){
      console.info('PWA: откройте через локальный сервер (start-server.bat), не file://');
      return;
    }
    var build = getBuild();
    var url = 'sw.js' + (build ? '?v=' + encodeURIComponent(build) : '');
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      global.location.reload();
    });
    navigator.serviceWorker.register(url, { scope: './' }).then(function(reg){
      function activateWaiting(worker){
        if (worker) worker.postMessage({ type: 'SKIP_WAITING' });
      }
      activateWaiting(reg.waiting);
      reg.addEventListener('updatefound', function(){
        var installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', function(){
          if (installing.state === 'installed' && navigator.serviceWorker.controller){
            activateWaiting(reg.waiting || installing);
          }
        });
      });
    }).catch(function(err){
      console.warn('PWA: service worker не зарегистрирован', err);
    });
  }

  if (document.readyState === 'complete') registerSw();
  else global.addEventListener('load', registerSw);
})(typeof window !== 'undefined' ? window : this);
