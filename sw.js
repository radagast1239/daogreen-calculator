/** Service Worker — кэш статики; версия кэша = CALC_BUILD (обновляется npm run build) */
'use strict';

var CACHE = 'daogreen-2026-05-19-p72-plantui-fix';
var PRECACHE = [
  "./",
  "./index.html",
  "./calculator-110x55_12.html",
  "./calculator-110x55_12.html?v=2026-05-19-p72-plantui-fix",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./sw.js",
  "./vf-cultivars.js?v=2026-05-19-p72-plantui-fix",
  "./pallet-cultivars.js?v=2026-05-19-p72-plantui-fix",
  "./js/cultivar-registry.js?v=2026-05-19-p72-plantui-fix",
  "./js/growth-light-model.js?v=2026-05-19-p72-plantui-fix",
  "./js/cut-model.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-cut-model-init.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-constants.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-state.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-runtime-init.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-dli-light.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-growth-core.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-gh-yield.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-geom-ui.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-render.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-rec-icons.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-late-init-deps.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-late-init.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-pallet-runtime.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-light-energy.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-calc-core.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-event-bindings.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-econ-glue.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-app-nav.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-public-api.js?v=2026-05-19-p72-plantui-fix",
  "./js/gh-cultivars.js?v=2026-05-19-p72-plantui-fix",
  "./js/gh-cv-colors.js?v=2026-05-19-p72-plantui-fix",
  "./js/calc-theme.js?v=2026-05-19-p72-plantui-fix",
  "./js/pallet-load-warn.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-layout.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-ui-helpers.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-cut-interval-ui.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-pallet-sheet.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-custom-cv.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-vf-standards.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-harvest-ui.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-gh-standards.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-vf-user-standards.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-snapshot.js?v=2026-05-19-p72-plantui-fix",
  "./js/georgy-mode.js?v=2026-05-19-p72-plantui-fix",
  "./js/canopy-density-ui.js?v=2026-05-19-p72-plantui-fix",
  "./js/simple-ui-mode.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-guides.js?v=2026-05-19-p72-plantui-fix",
  "./js/planting-i18n.js?v=2026-05-19-p72-plantui-fix",
  "./js/i18n-plant-dynamic.js?v=2026-05-19-p72-plantui-fix",
  "./js/i18n-ui.js?v=2026-05-19-p72-plantui-fix",
  "./js/i18n-econ-extras.js?v=2026-05-19-p72-plantui-fix",
  "./js/i18n-recs.js?v=2026-05-19-p72-plantui-fix",
  "./js/locale.js?v=2026-05-19-p72-plantui-fix",
  "./js/calc-format.js?v=2026-05-19-p72-plantui-fix",
  "./js/calc-error.js?v=2026-05-19-p72-plantui-fix",
  "./js/econ-core.js?v=2026-05-19-p72-plantui-fix",
  "./js/econ-ui.js?v=2026-05-19-p72-plantui-fix",
  "./js/project-store.js?v=2026-05-19-p72-plantui-fix",
  "./js/econ-presets.js?v=2026-05-19-p72-plantui-fix",
  "./js/econ-csv-export.js?v=2026-05-19-p72-plantui-fix",
  "./js/econ-sensitivity.js?v=2026-05-19-p72-plantui-fix",
  "./js/econ-payback.js?v=2026-05-19-p72-plantui-fix",
  "./js/pdf-econ-tables.js?v=2026-05-19-p72-plantui-fix",
  "./js/pdf-export.js?v=2026-05-19-p72-plantui-fix",
  "./js/pwa-register.js?v=2026-05-19-p72-plantui-fix",
  "./js/project-summary.js?v=2026-05-19-p72-plantui-fix",
  "./js/project-compare.js?v=2026-05-19-p72-plantui-fix",
  "./js/app-auth.js?v=2026-05-19-p72-plantui-fix",
  "./js/onboarding-tour.js?v=2026-05-19-p72-plantui-fix",
  "./js/pwa-qr.js?v=2026-05-19-p72-plantui-fix",
  "./js/econ-advanced.js?v=2026-05-19-p72-plantui-fix",
  "./js/readonly-mode.js?v=2026-05-19-p72-plantui-fix",
  "./js/vendor/html2canvas.min.js",
  "./js/vendor/jspdf.umd.min.js",
  "./js/vendor/qrcode.min.js",
  "./js/vendor/DejaVuSans.ttf",
  "./js/pwa-register.js?v=2026-05-19-p72-plantui-fix"
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
