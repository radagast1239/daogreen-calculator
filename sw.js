/** Service Worker — кэш статики; версия кэша = CALC_BUILD (обновляется npm run build) */
'use strict';

var CACHE = 'daogreen-2026-06-15-cons-col-label';
var PRECACHE = [
  "./",
  "./index.html",
  "./calculator-110x55_12.html?v=2026-06-15-cons-col-label",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./assets/dao-logo.png",
  "./sw.js",
  "./vf-cultivars.js?v=2026-06-15-cons-col-label",
  "./pallet-cultivars.js?v=2026-06-15-cons-col-label",
  "./js/cultivar-registry.js?v=2026-06-15-cons-col-label",
  "./js/growth-light-model.js?v=2026-06-15-cons-col-label",
  "./js/cut-model.js?v=2026-06-15-cons-col-label",
  "./js/planting-cut-model-init.js?v=2026-06-15-cons-col-label",
  "./js/preview-config.js?v=2026-06-15-cons-col-label",
  "./js/auth-client-config.js?v=2026-06-15-cons-col-label",
  "./js/planting-constants.js?v=2026-06-15-cons-col-label",
  "./js/planting-state.js?v=2026-06-15-cons-col-label",
  "./js/planting-runtime-init.js?v=2026-06-15-cons-col-label",
  "./js/planting-dli-light.js?v=2026-06-15-cons-col-label",
  "./js/planting-growth-core.js?v=2026-06-15-cons-col-label",
  "./js/planting-useful-yield.js?v=2026-06-15-cons-col-label",
  "./js/planting-gh-yield.js?v=2026-06-15-cons-col-label",
  "./js/planting-geom-ui.js?v=2026-06-15-cons-col-label",
  "./js/planting-render.js?v=2026-06-15-cons-col-label",
  "./js/planting-rec-icons.js?v=2026-06-15-cons-col-label",
  "./js/planting-late-init-deps.js?v=2026-06-15-cons-col-label",
  "./js/planting-late-init.js?v=2026-06-15-cons-col-label",
  "./js/planting-pallet-runtime.js?v=2026-06-15-cons-col-label",
  "./js/planting-light-energy.js?v=2026-06-15-cons-col-label",
  "./js/planting-calc-core.js?v=2026-06-15-cons-col-label",
  "./js/planting-event-bindings.js?v=2026-06-15-cons-col-label",
  "./js/planting-econ-glue.js?v=2026-06-15-cons-col-label",
  "./js/standards-catalog-table.js?v=2026-06-15-cons-col-label",
  "./js/planting-app-nav.js?v=2026-06-15-cons-col-label",
  "./js/planting-ux.js?v=2026-06-15-cons-col-label",
  "./js/planting-public-api.js?v=2026-06-15-cons-col-label",
  "./js/gh-cultivars.js?v=2026-06-15-cons-col-label",
  "./js/gh-cultivars-extended.js?v=2026-06-15-cons-col-label",
  "./js/gh-cultivar-catalog.js?v=2026-06-15-cons-col-label",
  "./js/gh-cultivars-user.js?v=2026-06-15-cons-col-label",
  "./js/gh-cv-colors.js?v=2026-06-15-cons-col-label",
  "./js/calc-theme.js?v=2026-06-15-cons-col-label",
  "./js/pallet-load-warn.js?v=2026-06-15-cons-col-label",
  "./js/planting-layout.js?v=2026-06-15-cons-col-label",
  "./js/planting-ui-helpers.js?v=2026-06-15-cons-col-label",
  "./js/planting-cut-interval-ui.js?v=2026-06-15-cons-col-label",
  "./js/planting-pallet-sheet.js?v=2026-06-15-cons-col-label",
  "./js/planting-custom-cv.js?v=2026-06-15-cons-col-label",
  "./js/planting-vf-standards.js?v=2026-06-15-cons-col-label",
  "./js/planting-harvest-ui.js?v=2026-06-15-cons-col-label",
  "./js/planting-gh-standards.js?v=2026-06-15-cons-col-label",
  "./js/planting-vf-user-standards.js?v=2026-06-15-cons-col-label",
  "./js/planting-snapshot.js?v=2026-06-15-cons-col-label",
  "./js/planting-econ-sync.js?v=2026-06-15-cons-col-label",
  "./js/calc-issues.js?v=2026-06-15-cons-col-label",
  "./js/calc-trace.js?v=2026-06-15-cons-col-label",
  "./js/farm-calibration.js?v=2026-06-15-cons-col-label",
  "./js/georgy-mode.js?v=2026-06-15-cons-col-label",
  "./js/gh-channel-simple.js?v=2026-06-15-cons-col-label",
  "./js/canopy-density-ui.js?v=2026-06-15-cons-col-label",
  "./js/simple-ui-mode.js?v=2026-06-15-cons-col-label",
  "./js/planting-guides.js?v=2026-06-15-cons-col-label",
  "./js/planting-i18n.js?v=2026-06-15-cons-col-label",
  "./js/i18n-plant-dynamic.js?v=2026-06-15-cons-col-label",
  "./js/i18n-ui.js?v=2026-06-15-cons-col-label",
  "./js/i18n-econ-extras.js?v=2026-06-15-cons-col-label",
  "./js/i18n-recs.js?v=2026-06-15-cons-col-label",
  "./js/locale.js?v=2026-06-15-cons-col-label",
  "./js/calc-format.js?v=2026-06-15-cons-col-label",
  "./js/calc-error.js?v=2026-06-15-cons-col-label",
  "./js/econ-core.js?v=2026-06-15-cons-col-label",
  "./js/econ-ui.js?v=2026-06-15-cons-col-label",
  "./js/project-store.js?v=2026-06-15-cons-col-label",
  "./js/econ-presets.js?v=2026-06-15-cons-col-label",
  "./js/econ-csv-export.js?v=2026-06-15-cons-col-label",
  "./js/econ-sensitivity.js?v=2026-06-15-cons-col-label",
  "./js/econ-payback.js?v=2026-06-15-cons-col-label",
  "./js/pdf-econ-tables.js?v=2026-06-15-cons-col-label",
  "./js/pdf-export.js?v=2026-06-15-cons-col-label",
  "./js/pwa-register.js?v=2026-06-15-cons-col-label",
  "./js/project-summary.js?v=2026-06-15-cons-col-label",
  "./js/project-compare.js?v=2026-06-15-cons-col-label",
  "./js/app-auth.js?v=2026-06-15-cons-col-label",
  "./js/onboarding-tour.js?v=2026-06-15-cons-col-label",
  "./js/visit-history.js?v=2026-06-15-cons-col-label",
  "./js/pwa-qr.js?v=2026-06-15-cons-col-label",
  "./js/econ-advanced.js?v=2026-06-15-cons-col-label",
  "./js/readonly-mode.js?v=2026-06-15-cons-col-label",
  "./js/share-view.js?v=2026-06-15-cons-col-label",
  "./js/vendor/html2canvas.min.js",
  "./js/vendor/jspdf.umd.min.js",
  "./js/vendor/qrcode.min.js",
  "./css/daogreen-unify.css?v=2026-06-15-cons-col-label",
  "./css/econ-unify.css?v=2026-06-15-cons-col-label",
  "./css/visual-polish.css?v=2026-06-15-cons-col-label",
  "./css/pdf-planting.css?v=2026-06-15-cons-col-label",
  "./css/mobile.css?v=2026-06-15-cons-col-label",
  "./css/app-auth.css?v=2026-06-15-cons-col-label",
  "./js/vendor/DejaVuSans.ttf",
  "./js/pwa-register.js?v=2026-06-15-cons-col-label"
];

function sameOrigin(url){
  try {
    return new URL(url).origin === self.location.origin;
  } catch (e){
    return false;
  }
}

/** Версионированные и исходники — сначала сеть, иначе PWA держит старый ?v=p72 при HTML p73 */
function preferNetworkFirst(url){
  if (url.searchParams.has('v')) return true;
  return /\.(js|css|html)$/i.test(url.pathname);
}

function networkFirst(request){
  return fetch(request).then(function(res){
    if (res && res.status === 200){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(request, copy); });
    }
    return res;
  }).catch(function(){
    return caches.match(request);
  });
}

function cacheFirst(request){
  return caches.match(request).then(function(cached){
    var network = fetch(request).then(function(res){
      if (res && res.status === 200){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(request, copy); });
      }
      return res;
    });
    return cached || network;
  });
}

self.addEventListener('message', function(event){
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

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

  if (isNavigate || preferNetworkFirst(url)){
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
