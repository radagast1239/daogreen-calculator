/** QR для установки PWA (локальная генерация, без внешнего API) */
(function(global){
  'use strict';

  function t(k, vars){
    if (global.DG_t) return global.DG_t(k, vars);
    if (global.DG_uiT) return global.DG_uiT(k, vars);
    return k;
  }

  function pageUrl(){
    var u = global.location.href.split('#')[0];
    if (u.indexOf('?') >= 0) u = u.split('?')[0];
    return u;
  }

  function isLocalHost(){
    var h = global.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  }

  function effectiveUrl(customInput){
    var custom = customInput && customInput.value ? customInput.value.trim() : '';
    if (custom) return custom;
    return pageUrl();
  }

  function setWarn(el, msg, show){
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('env-block-hidden', !show);
  }

  function renderQrImage(img, url, onDone){
    if (!img) { if (onDone) onDone(); return; }
    img.alt = 'QR: ' + url;
    img.style.display = '';

    function done(dataUrl){
      img.src = dataUrl;
      if (onDone) onDone();
    }

    if (global.QRCode && typeof global.QRCode.toDataURL === 'function'){
      global.QRCode.toDataURL(url, { width: 220, margin: 1, errorCorrectionLevel: 'M' }, function(err, dataUrl){
        if (!err && dataUrl) return done(dataUrl);
        img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=' + encodeURIComponent(url);
        if (onDone) onDone();
      });
      return;
    }
    img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=' + encodeURIComponent(url);
    if (onDone) onDone();
  }

  function refreshDialog(){
    var dialog = document.getElementById('pwa-qr-dialog');
    var img = document.getElementById('pwa-qr-img');
    var link = document.getElementById('pwa-qr-url');
    var warn = document.getElementById('pwa-qr-warn');
    var lanWrap = document.getElementById('pwa-qr-lan-wrap');
    var custom = document.getElementById('pwa-qr-custom');
    if (!dialog) return;

    var proto = global.location.protocol;
    var url = effectiveUrl(custom);

    if (link) link.textContent = url;

    if (proto === 'file:'){
      setWarn(warn, t('ui.pwa.warnFile'), true);
      if (img) img.style.display = 'none';
      if (lanWrap) lanWrap.classList.remove('env-block-hidden');
      return;
    }

    if (isLocalHost() && !(custom && custom.value.trim())){
      setWarn(warn, t('ui.pwa.warnLocalhost'), true);
      if (lanWrap) lanWrap.classList.remove('env-block-hidden');
    } else if (proto === 'http:' && !isLocalHost()){
      setWarn(warn, t('ui.pwa.warnHttp'), true);
      if (lanWrap) lanWrap.classList.add('env-block-hidden');
    } else {
      setWarn(warn, '', false);
      if (lanWrap) lanWrap.classList.toggle('env-block-hidden', proto === 'https:');
    }

    renderQrImage(img, url);
  }

  function openDialog(){
    var dialog = document.getElementById('pwa-qr-dialog');
    if (!dialog) return;
    refreshDialog();
    if (typeof dialog.showModal === 'function') dialog.showModal();
  }

  function initPwaQr(){
    var dialog = document.getElementById('pwa-qr-dialog');
    var btn = document.getElementById('btn-pwa-qr');
    var custom = document.getElementById('pwa-qr-custom');
    var copyBtn = document.getElementById('pwa-qr-copy');
    if (!dialog || !btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';

    btn.addEventListener('click', openDialog);

    if (custom){
      var upd = function(){ if (dialog.open) refreshDialog(); };
      custom.addEventListener('change', upd);
      custom.addEventListener('blur', upd);
      custom.addEventListener('keydown', function(e){
        if (e.key === 'Enter'){ e.preventDefault(); refreshDialog(); }
      });
    }

    if (copyBtn){
      copyBtn.addEventListener('click', function(){
        var url = effectiveUrl(custom);
        if (global.navigator && navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).catch(function(){});
        }
      });
    }

    dialog.querySelectorAll('[data-pwa-qr-close]').forEach(function(b){
      b.addEventListener('click', function(){ dialog.close(); });
    });
  }

  global.DG_initPwaQr = initPwaQr;
  global.DG_openPwaQr = openDialog;

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initPwaQr);
  } else {
    initPwaQr();
  }
})(typeof window !== 'undefined' ? window : this);
