/** Единый список модулей и скриптов приложения (источник для build + smoke-check) */
module.exports = {
  htmlFile: 'calculator-110x55_12.html',
  indexFile: 'index.html',
  serverBat: 'start-server.bat',

  /** Скрипты с ?v= — синхронизируются с CALC_BUILD */
  versionedScripts: [
    'vf-cultivars.js',
    'pallet-cultivars.js',
    'js/cultivar-registry.js',
    'js/growth-light-model.js',
    'js/cut-model.js',
    'js/planting-snapshot.js',
    'js/georgy-mode.js',
    'js/planting-i18n.js',
    'js/i18n-plant-dynamic.js',
    'js/i18n-ui.js',
    'js/i18n-econ-extras.js',
    'js/i18n-recs.js',
    'js/locale.js',
    'js/econ-core.js',
    'js/econ-ui.js',
    'js/project-store.js',
    'js/econ-presets.js',
    'js/econ-csv-export.js',
    'js/econ-sensitivity.js',
    'js/econ-payback.js',
    'js/pdf-econ-tables.js',
    'js/pdf-export.js',
    'js/pwa-register.js',
    'js/project-summary.js',
    'js/project-compare.js',
    'js/app-auth.js',
    'js/onboarding-tour.js',
    'js/pwa-qr.js',
    'js/econ-advanced.js',
    'js/readonly-mode.js'
  ],

  /** Без версии в URL (vendor, CDN fallback внутри модулей) */
  staticScripts: [
    'js/vendor/html2canvas.min.js',
    'js/vendor/jspdf.umd.min.js',
    'js/vendor/qrcode.min.js'
  ],

  syntaxCheck: [
    'js/locale.js',
    'js/planting-i18n.js',
    'js/i18n-plant-dynamic.js',
    'js/i18n-ui.js',
    'js/i18n-econ-extras.js',
    'js/i18n-recs.js',
    'js/econ-core.js',
    'js/econ-ui.js',
    'js/pdf-export.js',
    'js/project-store.js',
    'js/econ-sensitivity.js',
    'js/econ-payback.js',
    'js/econ-csv-export.js',
    'js/econ-presets.js',
    'js/pdf-econ-tables.js',
    'js/pwa-register.js',
    'js/project-summary.js',
    'js/project-compare.js',
    'js/app-auth.js',
    'js/onboarding-tour.js',
    'js/pwa-qr.js',
    'js/econ-advanced.js',
    'js/readonly-mode.js'
  ]
};
