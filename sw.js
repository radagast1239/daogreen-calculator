/** Service Worker — кэш статики; версия кэша = CALC_BUILD (обновляется npm run build) */
'use strict';

var CACHE = 'daogreen-2026-05-19-p71-audit-fixes';
var PRECACHE = [
  "./",
  "./index.html",
  "./calculator-110x55_12.html",
  "./calculator-110x55_12.html?v=2026-05-19-p71-audit-fixes",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./sw.js",
  "./vf-cultivars.js?v=2026-05-19-p71-audit-fixes",
  "./pallet-cultivars.js?v=2026-05-19-p71-audit-fixes",
  "./js/cultivar-registry.js?v=2026-05-19-p71-audit-fixes",
  "./js/growth-light-model.js?v=2026-05-19-p71-audit-fixes",
  "./js/cut-model.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-cut-model-init.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-constants.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-dli-light.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-growth-core.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-gh-yield.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-geom-ui.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-render.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-pallet-runtime.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-light-energy.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-calc-core.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-event-bindings.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-econ-glue.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-app-nav.js?v=2026-05-19-p71-audit-fixes",
  "./js/gh-cultivars.js?v=2026-05-19-p71-audit-fixes",
  "./js/gh-cv-colors.js?v=2026-05-19-p71-audit-fixes",
  "./js/calc-theme.js?v=2026-05-19-p71-audit-fixes",
  "./js/pallet-load-warn.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-layout.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-ui-helpers.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-cut-interval-ui.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-pallet-sheet.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-custom-cv.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-vf-standards.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-harvest-ui.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-gh-standards.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-vf-user-standards.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-snapshot.js?v=2026-05-19-p71-audit-fixes",
  "./js/georgy-mode.js?v=2026-05-19-p71-audit-fixes",
  "./js/canopy-density-ui.js?v=2026-05-19-p71-audit-fixes",
  "./js/simple-ui-mode.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-guides.js?v=2026-05-19-p71-audit-fixes",
  "./js/planting-i18n.js?v=2026-05-19-p71-audit-fixes",
  "./js/i18n-plant-dynamic.js?v=2026-05-19-p71-audit-fixes",
  "./js/i18n-ui.js?v=2026-05-19-p71-audit-fixes",
  "./js/i18n-econ-extras.js?v=2026-05-19-p71-audit-fixes",
  "./js/i18n-recs.js?v=2026-05-19-p71-audit-fixes",
  "./js/locale.js?v=2026-05-19-p71-audit-fixes",
  "./js/calc-format.js?v=2026-05-19-p71-audit-fixes",
  "./js/calc-error.js?v=2026-05-19-p71-audit-fixes",
  "./js/econ-core.js?v=2026-05-19-p71-audit-fixes",
  "./js/econ-ui.js?v=2026-05-19-p71-audit-fixes",
  "./js/project-store.js?v=2026-05-19-p71-audit-fixes",
  "./js/econ-presets.js?v=2026-05-19-p71-audit-fixes",
  "./js/econ-csv-export.js?v=2026-05-19-p71-audit-fixes",
  "./js/econ-sensitivity.js?v=2026-05-19-p71-audit-fixes",
  "./js/econ-payback.js?v=2026-05-19-p71-audit-fixes",
  "./js/pdf-econ-tables.js?v=2026-05-19-p71-audit-fixes",
  "./js/pdf-export.js?v=2026-05-19-p71-audit-fixes",
  "./js/pwa-register.js?v=2026-05-19-p71-audit-fixes",
  "./js/project-summary.js?v=2026-05-19-p71-audit-fixes",
  "./js/project-compare.js?v=2026-05-19-p71-audit-fixes",
  "./js/app-auth.js?v=2026-05-19-p71-audit-fixes",
  "./js/onboarding-tour.js?v=2026-05-19-p71-audit-fixes",
  "./js/pwa-qr.js?v=2026-05-19-p71-audit-fixes",
  "./js/econ-advanced.js?v=2026-05-19-p71-audit-fixes",
  "./js/readonly-mode.js?v=2026-05-19-p71-audit-fixes",
  "./js/vendor/html2canvas.min.js",
  "./js/vendor/jspdf.umd.min.js",
  "./js/vendor/qrcode.min.js",
  "./js/vendor/DejaVuSans.ttf",
  "./js/pwa-register.js?v=2026-05-19-p71-audit-fixes"
];

function sameOrigin(url){
  try {
    return new URL(url).origin === self.location.origin;
  } catch (e){
    return false;
  }
}

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE).then(function(cache){
      return Promise.allSettled(PRECACHE.map(function(u){
        return cache.add(new Request(u, { cache: 'reload' }));
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){
        return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  if (event.request.method !== 'GET' || !sameOrigin(event.request.url)) return;

  var url = new URL(event.request.url);
  var isNavigate = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').indexOf('text/html') >= 0;

  if (isNavigate){
    event.respondWith(
      fetch(event.request).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(event.request, copy); });
        return res;
      }).catch(function(){
        return caches.match(event.request).then(function(cached){
          return cached || caches.match('./calculator-110x55_12.html');
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached){
      var network = fetch(event.request).then(function(res){
        if (res && res.status === 200){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(event.request, copy); });
        }
        return res;
      });
      return cached || network;
    })
  );
});
