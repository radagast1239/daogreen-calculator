/** p39: econ UI, sensitivity, payback, pdf, renderRecs, build manifest */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function read(f){ return fs.readFileSync(path.join(root, f), 'utf8'); }
function write(f, s){ fs.writeFileSync(path.join(root, f), s, 'utf8'); }

const BUILD = '2026-05-18-p39-i18n-recs-econ';

// build-manifest + html script tags
const manifestPath = '_tools/build-manifest.js';
let man = read(manifestPath);
if (!man.includes('i18n-econ-extras.js')){
  man = man.replace(
    "'js/i18n-ui.js',",
    "'js/i18n-ui.js',\n    'js/i18n-econ-extras.js',\n    'js/i18n-recs.js',"
  );
  man = man.replace(
    "'js/i18n-ui.js',",
    "'js/i18n-ui.js',\n    'js/i18n-econ-extras.js',\n    'js/i18n-recs.js',",
    1
  );
}
if (!man.includes("'js/i18n-econ-extras.js'")){
  man = man.replace(
    /syntaxCheck: \[/,
    "syntaxCheck: [\n    'js/i18n-econ-extras.js',\n    'js/i18n-recs.js',"
  );
}
write(manifestPath, man);

let html = read('calculator-110x55_12.html');
html = html.replace(
  /<script src="js\/planting-i18n\.js\?v=[^"]+"><\/script>\s*<script src="js\/i18n-ui\.js\?v=[^"]+"><\/script>\s*<script src="js\/locale\.js\?v=[^"]+"><\/script>/,
  `<script src="js/planting-i18n.js?v=${BUILD}"></script>\n<script src="js/i18n-ui.js?v=${BUILD}"></script>\n<script src="js/i18n-econ-extras.js?v=${BUILD}"></script>\n<script src="js/i18n-recs.js?v=${BUILD}"></script>\n<script src="js/locale.js?v=${BUILD}"></script>`
);
html = html.replace(/v=2026-05-18-p38-i18n-full/g, 'v=' + BUILD);
if (!html.includes('function pr(')){
  html = html.replace(
    "function tr(k){ return (typeof DG_t === 'function') ? DG_t(k) : k; }",
    "function tr(k){ return (typeof DG_t === 'function') ? DG_t(k) : k; }\n  function pr(k, vars){ return (typeof DG_tFmt === 'function') ? DG_tFmt(k, vars) : k; }"
  );
}
write('calculator-110x55_12.html', html);

// econ-ui.js
let eu = read('js/econ-ui.js');
eu = eu.replace("opt('', '— укажите сорт или введите вручную —')", "opt('', L('econ.opt.empty'))");
eu = eu.replace("opt(ECON_SALAD_MIX_ID, 'Микс салатов (среднее)')", "opt(ECON_SALAD_MIX_ID, L('econ.opt.mix'))");
eu = eu.replace('<optgroup label="Вертикальная ферма">', "<optgroup label=\"\" + L('econ.opt.vf') + \"\">");
eu = eu.replace('<optgroup label="Теплица">', "<optgroup label=\"\" + L('econ.opt.gh') + \"\">");
eu = eu.replace('<optgroup label="Поддоны 130×65">', "<optgroup label=\"\" + L('econ.opt.pal') + \"\">");
eu = eu.replace(
  "? 'Сумма участвует в себестоимости через амортизацию — укажите срок в общих параметрах.'\n        : 'Оборудование отключено — в месячных затратах не учитывается. Включите переключатель, чтобы редактировать статьи.'",
  "? L('econ.equip.hintOn')\n        : L('econ.equip.hintOff')"
);
eu = eu.replace("let txt = 'Оборудование + подготовка помещения (разово)'", "let txt = L('econ.equip.totalTxt')");
eu = eu.replace('placeholder="Название статьи"', 'placeholder="\' + L(\'econ.equip.placeholder\') + \'"');
eu = eu.replace(/title="Удалить" aria-label="Удалить"/g, 'title="\' + L(\'econ.btn.remove\') + \'" aria-label="\' + L(\'econ.btn.remove\') + \'"');
eu = eu.replace("<h4>Свои статьи</h4>", "<h4>\" + L('econ.equip.customGroup') + \"</h4>");
eu = eu.replace('id="econ-equipment-add-custom">+ Статья</button>', "id=\"econ-equipment-add-custom\">+ \" + L('econ.equip.addBtn') + \"</button>");
eu = eu.replace("label: 'Новая статья'", "label: L('econ.equip.newItem')");
eu = eu.replace("title: 'Г или шт с одного горшка за одну срезку'", "title: L('econ.cult.yieldHint')");
write('js/econ-ui.js', eu);

// sensitivity
let sens = read('js/econ-sensitivity.js');
if (!sens.includes('function scenLabel')){
  sens = sens.replace(
    "var SCENARIOS = [",
    "function scenLabel(id, fallback){ return (global.DG_t && global.DG_t('sens.' + id)) || fallback; }\n\n  var SCENARIOS = ["
  );
  sens = sens.replace("{ id: 'base', label: 'Текущий расчёт'", "{ id: 'base', labelKey: 'base', label: 'Текущий расчёт'");
  sens = sens.replace("{ id: 'price-m10', label: 'Цена продажи −10%'", "{ id: 'price-m10', labelKey: 'priceM10', label: 'Цена продажи −10%'");
  sens = sens.replace("{ id: 'price-p10', label: 'Цена продажи +10%'", "{ id: 'price-p10', labelKey: 'priceP10', label: 'Цена продажи +10%'");
  sens = sens.replace("{ id: 'yield-m15', label: 'Урожай −15%'", "{ id: 'yield-m15', labelKey: 'yieldM15', label: 'Урожай −15%'");
  sens = sens.replace("{ id: 'waste-p5', label: 'Брак +5 п.п.'", "{ id: 'waste-p5', labelKey: 'wasteP5', label: 'Брак +5 п.п.'");
  sens = sens.replace("{ id: 'kwh-p20', label: 'Электричество +20%'", "{ id: 'kwh-p20', labelKey: 'kwhP20', label: 'Электричество +20%'");
  sens = sens.replace("{ id: 'area-m10', label: 'Посевная площадь −10%'", "{ id: 'area-m10', labelKey: 'areaM10', label: 'Посевная площадь −10%'");
  sens = sens.replace("{ id: 'rent-p15', label: 'Аренда +15%'", "{ id: 'rent-p15', labelKey: 'rentP15', label: 'Аренда +15%'");
  sens = sens.replace(/s\.label/g, "(s.labelKey ? scenLabel(s.labelKey, s.label) : s.label)");
}
write('js/econ-sensitivity.js', sens);

// payback
let pb = read('js/econ-payback.js');
pb = pb.replace("if (m > 600) return '> 50 лет';", "if (m > 600) return (global.DG_t && global.DG_t('pb.monthsLong')) || '> 50 лет';");
pb = pb.replace(
  "return (m < 120 ? m.toFixed(1) : Math.round(m)) + ' мес (~' + (m / 12).toFixed(1) + ' лет)';",
  "var y = (m / 12).toFixed(1); var n = m < 120 ? m.toFixed(1) : String(Math.round(m)); return (global.DG_tFmt ? global.DG_tFmt('pb.monthsFmt', { n: n, y: y }) : n + ' mo (~' + y + ' y)');"
);
pb = pb.replace("label: 'Старт'", "label: (global.DG_t && global.DG_t('pb.start')) || 'Старт'");
pb = pb.replace("label: 'М' + m", "label: (global.DG_tFmt ? global.DG_tFmt('pb.month', { n: m }) : 'M' + m)");
pb = pb.replace(
  'aria-label="Накопленный cash-flow"',
  'aria-label="\' + ((global.DG_t && global.DG_t(\'pb.cashAria\')) || \'Cash flow\') + \'"'
);
pb = pb.replace(
  '>окупаемость</text>',
  '>\' + ((global.DG_t && global.DG_t(\'pb.paybackMark\')) || \'payback\') + \'</text>'
);
write('js/econ-payback.js', pb);

// pdf-export errors
let pdf = read('js/pdf-export.js');
pdf = pdf.replace(/reject\(new Error\('Не удалось загрузить PDF-библиотеку'\)\)/, "reject(new Error((global.DG_t && global.DG_t('pdf.err.lib')) || 'PDF lib'))");
pdf = pdf.replace(/reject\(new Error\('Не удалось загрузить PDF-библиотеку \(нужен интернет\)'\)\)/, "reject(new Error((global.DG_t && global.DG_t('pdf.err.libNet')) || 'PDF lib net'))");
pdf = pdf.replace(
  "throw new Error('PDF-библиотеки недоступны. Запустите start-server.bat или проверьте папку js/vendor/.');",
  "throw new Error((global.DG_t && global.DG_t('pdf.err.unavail')) || 'PDF unavailable');"
);
pdf = pdf.replace(
  "throw new Error('PDF-библиотеки не загружены. Проверьте интернет и обновите страницу (Ctrl+F5).');",
  "throw new Error((global.DG_t && global.DG_t('pdf.err.noload')) || 'PDF not loaded');"
);
write('js/pdf-export.js', pdf);

// extra econ keys
let extras = read('js/i18n-econ-extras.js');
if (!extras.includes('econ.equip.customGroup')){
  extras = extras.replace(
    "'econ.equip.newItem': 'Новая статья',",
    "'econ.equip.newItem': 'Новая статья',\n      'econ.equip.customGroup': 'Свои статьи',\n      'econ.equip.addBtn': 'Статья',\n      'econ.equip.notInCost': ' · не учитывается в себестоимости',"
  );
  extras = extras.replace(
    "'econ.equip.newItem': 'New item',",
    "'econ.equip.newItem': 'New item',\n      'econ.equip.customGroup': 'Custom items',\n      'econ.equip.addBtn': 'Item',\n      'econ.equip.notInCost': ' · not included in unit cost',"
  );
}
write('js/i18n-econ-extras.js', extras);

console.log('patch p39 done, BUILD=' + BUILD);
