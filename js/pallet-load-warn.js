/** Предупреждение, если не загрузился pallet-cultivars.js */
(function(global){
'use strict';
(function(){
  var w = document.getElementById('pallet-load-warn');
  var n = (window.PALLET_SHEET && window.PALLET_SHEET.PALLET_CULTIVARS) ? window.PALLET_SHEET.PALLET_CULTIVARS.length : 0;
  if (w && !n){
    w.classList.remove('env-block-hidden');
    w.textContent = (window.DG_t && window.DG_t('err.palletScript')) || 'Не загружен pallet-cultivars.js — поддоны не работают. Запустите start-server.bat в папке проекта и откройте http://localhost:8080/calculator-110x55_12.html';
  }
})();
})(typeof window !== 'undefined' ? window : globalThis);
