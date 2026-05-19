/** Service Worker — кэш статики; версия кэша = CALC_BUILD (обновляется npm run build) */
'use strict';

var CACHE = 'daogreen-2026-05-19-p73-planting-std';
var PRECACHE = [
  "./",
  "./index.html",
  "./calculator-110x55_12.html",
  "./calculator-110x55_12.html?v=2026-05-19-p73-planting-std",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./sw.js",
  "./vf-cultivars.js?v=2026-05-19-p73-planting-std",
  "./pallet-cultivars.js?v=2026-05-19-p73-planting-std",
  "./js/cultivar-registry.js?v=2026-05-19-p73-planting-std",
  "./js/growth-light-model.js?v=2026-05-19-p73-planting-std",
  "./js/cut-model.js?v=2026-05-19-p73-planting-std",
  "./js/planting-cut-model-init.js?v=2026-05-19-p73-planting-std",
  "./js/planting-constants.js?v=2026-05-19-p73-planting-std",
  "./js/planting-state.js?v=2026-05-19-p73-planting-std",
  "./js/planting-runtime-init.js?v=2026-05-19-p73-planting-std",
  "./js/planting-dli-light.js?v=2026-05-19-p73-planting-std",
  "./js/planting-growth-core.js?v=2026-05-19-p73-planting-std",
  "./js/planting-gh-yield.js?v=2026-05-19-p73-planting-std",
  "./js/planting-geom-ui.js?v=2026-05-19-p73-planting-std",
  "./js/planting-render.js?v=2026-05-19-p73-planting-std",
  "./js/planting-rec-icons.js?v=2026-05-19-p73-planting-std",
  "./js/planting-late-init-deps.js?v=2026-05-19-p73-planting-std",
  "./js/planting-late-init.js?v=2026-05-19-p73-planting-std",
  "./js/planting-pallet-runtime.js?v=2026-05-19-p73-planting-std",
  "./js/planting-light-energy.js?v=2026-05-19-p73-planting-std",
  "./js/planting-calc-core.js?v=2026-05-19-p73-planting-std",
  "./js/planting-event-bindings.js?v=2026-05-19-p73-planting-std",
  "./js/planting-econ-glue.js?v=2026-05-19-p73-planting-std",
  "./js/planting-app-nav.js?v=2026-05-19-p73-planting-std",
  "./js/planting-public-api.js?v=2026-05-19-p73-planting-std",
  "./js/gh-cultivars.js?v=2026-05-19-p73-planting-std",
  "./js/gh-cv-colors.js?v=2026-05-19-p73-planting-std",
  "./js/calc-theme.js?v=2026-05-19-p73-planting-std",
  "./js/pallet-load-warn.js?v=2026-05-19-p73-planting-std",
  "./js/planting-layout.js?v=2026-05-19-p73-planting-std",
  "./js/planting-ui-helpers.js?v=2026-05-19-p73-planting-std",
  "./js/planting-cut-interval-ui.js?v=2026-05-19-p73-planting-std",
  "./js/planting-pallet-sheet.js?v=2026-05-19-p73-planting-std",
  "./js/planting-custom-cv.js?v=2026-05-19-p73-planting-std",
  "./js/planting-vf-standards.js?v=2026-05-19-p73-planting-std",
  "./js/planting-harvest-ui.js?v=2026-05-19-p73-planting-std",
  "./js/planting-gh-standards.js?v=2026-05-19-p73-planting-std",
  "./js/planting-vf-user-standards.js?v=2026-05-19-p73-planting-std",
  "./js/planting-snapshot.js?v=2026-05-19-p73-planting-std",
  "./js/georgy-mode.js?v=2026-05-19-p73-planting-std",
  "./js/canopy-density-ui.js?v=2026-05-19-p73-planting-std",
  "./js/simple-ui-mode.js?v=2026-05-19-p73-planting-std",
  "./js/planting-guides.js?v=2026-05-19-p73-planting-std",
  "./js/planting-i18n.js?v=2026-05-19-p73-planting-std",
  "./js/i18n-plant-dynamic.js?v=2026-05-19-p73-planting-std",
  "./js/i18n-ui.js?v=2026-05-19-p73-planting-std",
  "./js/i18n-econ-extras.js?v=2026-05-19-p73-planting-std",
  "./js/i18n-recs.js?v=2026-05-19-p73-planting-std",
  "./js/locale.js?v=2026-05-19-p73-planting-std",
  "./js/calc-format.js?v=2026-05-19-p73-planting-std",
  "./js/calc-error.js?v=2026-05-19-p73-planting-std",
  "./js/econ-core.js?v=2026-05-19-p73-planting-std",
  "./js/econ-ui.js?v=2026-05-19-p73-planting-std",
  "./js/project-store.js?v=2026-05-19-p73-planting-std",
  "./js/econ-presets.js?v=2026-05-19-p73-planting-std",
  "./js/econ-csv-export.js?v=2026-05-19-p73-planting-std",
  "./js/econ-sensitivity.js?v=2026-05-19-p73-planting-std",
  "./js/econ-payback.js?v=2026-05-19-p73-planting-std",
  "./js/pdf-econ-tables.js?v=2026-05-19-p73-planting-std",
  "./js/pdf-export.js?v=2026-05-19-p73-planting-std",
  "./js/pwa-register.js?v=2026-05-19-p73-planting-std",
  "./js/project-summary.js?v=2026-05-19-p73-planting-std",
  "./js/project-compare.js?v=2026-05-19-p73-planting-std",
  "./js/app-auth.js?v=2026-05-19-p73-planting-std",
  "./js/onboarding-tour.js?v=2026-05-19-p73-planting-std",
  "./js/pwa-qr.js?v=2026-05-19-p73-planting-std",
  "./js/econ-advanced.js?v=2026-05-19-p73-planting-std",
  "./js/readonly-mode.js?v=2026-05-19-p73-planting-std",
  "./js/vendor/html2canvas.min.js",
  "./js/vendor/jspdf.umd.min.js",
  "./js/vendor/qrcode.min.js",
  "./js/vendor/DejaVuSans.ttf",
  "./js/pwa-register.js?v=2026-05-19-p73-planting-std"
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
