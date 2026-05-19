/** Service Worker — кэш статики; версия кэша = CALC_BUILD (обновляется npm run build) */
'use strict';

var CACHE = 'daogreen-2026-05-19-p69-georgy-salad-lettuce';
var PRECACHE = [
  "./",
  "./index.html",
  "./calculator-110x55_12.html",
  "./calculator-110x55_12.html?v=2026-05-19-p69-georgy-salad-lettuce",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./sw.js",
  "./vf-cultivars.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./pallet-cultivars.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/cultivar-registry.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/growth-light-model.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/cut-model.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/planting-snapshot.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/georgy-mode.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/planting-i18n.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/i18n-plant-dynamic.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/i18n-ui.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/i18n-econ-extras.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/i18n-recs.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/locale.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/econ-core.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/econ-ui.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/project-store.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/econ-presets.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/econ-csv-export.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/econ-sensitivity.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/econ-payback.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/pdf-econ-tables.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/pdf-export.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/pwa-register.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/project-summary.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/project-compare.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/app-auth.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/onboarding-tour.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/pwa-qr.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/econ-advanced.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/readonly-mode.js?v=2026-05-19-p69-georgy-salad-lettuce",
  "./js/vendor/html2canvas.min.js",
  "./js/vendor/jspdf.umd.min.js",
  "./js/vendor/qrcode.min.js",
  "./js/vendor/DejaVuSans.ttf",
  "./js/pwa-register.js?v=2026-05-19-p69-georgy-salad-lettuce"
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
