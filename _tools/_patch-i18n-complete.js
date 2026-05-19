const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function w(rel, s) {
  const p = path.join(root, rel);
  fs.writeFileSync(p, s, 'utf8');
  console.log('wrote', rel);
}

// --- econ-ui broken lines ---
let eu = fs.readFileSync(path.join(root, 'js/econ-ui.js'), 'utf8');
eu = eu.replace(
  "'<motion class=\"line\"><span>Посев (разово)</span><strong>' + consOnceSqm + ' ₽/м²</strong> · ' + consOnceArea + ' ' + moneySym()</div>' +",
  "'<motion class=\"line\"><span>Посев (разово)</span><strong>' + consOnceSqm + ' ' + moneySym() + L('econ.perSqm') + '</strong> · ' + consOnceArea + ' ' + moneySym() + '</div>' +"
);
eu = eu.replace(
  /'<div class="line"><span>Посев \(разово\)<\/span><strong>' \+ consOnceSqm \+ ' ₽\/м²<\/strong> · ' \+ consOnceArea \+ ' ' \+ moneySym\(\)<\/div>' \+/,
  "'<div class=\"line\"><span>Посев (разово)</span><strong>' + consOnceSqm + ' ' + moneySym() + L('econ.perSqm') + '</strong> · ' + consOnceArea + ' ' + moneySym() + '</div>' +"
);
eu = eu.replace(
  /'<div class="line"><span>Посев в месяц<\/span><strong>' \+ consSqm \+ ' ₽\/м²·мес<\/strong> \(÷ ' \+ deps\.r1\(hm\) \+ ' мес\)<\/div>' \+/,
  "'<div class=\"line\"><span>Посев в месяц</span><strong>' + consSqm + ' ' + moneySym() + L('econ.perSqmMonth') + '</strong></motion>' +"
);
eu = eu.replace(/<\/motion>' \+\s*'<div class="line"><span>Посев в месяц/, "'</div>' +\n          '<motion class=\"line\"><span>Посев в месяц");
eu = eu.replace(
  /'<div class="line"><span>Посев в месяц<\/span><strong>' \+ consSqm \+ ' [^']+'<\/strong>[^+]*\+/,
  "'<div class=\"line\"><span>Посев в месяц</span><strong>' + consSqm + ' ' + moneySym() + L('econ.perSqmMonth') + '</strong></div>' +"
);
eu = eu.replace(
  /'<div class="line"><span>Расходн\. на участок<\/span><strong>' \+ consMo \+ ' ₽\/мес<\/strong><\/motion>' \+/,
  "'<div class=\"line\"><span>Расходн. на участок</span><strong>' + consMo + ' ' + moneySym() + L('econ.perMonth') + '</strong></div>' +"
);
eu = eu.replace(
  /'<div class="line"><span>Расходн\. на участок<\/span><strong>' \+ consMo \+ ' ₽\/мес<\/strong><\/div>' \+/,
  "'<motion class=\"line\"><span>Расходн. на участок</span><strong>' + consMo + ' ' + moneySym() + L('econ.perMonth') + '</strong></div>' +"
);
fs.writeFileSync(path.join(root, 'js/econ-ui.js'), eu);

// --- HTML banner + script + econ static ---
let h = fs.readFileSync(path.join(root, 'calculator-110x55_12.html'), 'utf8');
h = h.replace('<motion id="currency-active-banner"', '<motion id="currency-active-banner"');
h = h.replace(/<motion id="currency-active-banner"([^>]*)><\/motion>/, '<div id="currency-active-banner"$1></motion>');
h = h.replace(/<\/motion>(\s*<div id="calc-build-badge")/, '</div>$1');
if (!h.includes('js/planting-i18n.js')) {
  h = h.replace(
    '<script src="js/locale.js?v=',
    '<script src="js/planting-i18n.js?v=\n<script src="js/locale.js?v='.replace('\n', '')
  );
  h = h.replace(
    '<script src="js/locale.js?v=',
    '<script src="js/planting-i18n.js?v=2026-05-18-p36-i18n"></script>\n<script src="js/locale.js?v='
  );
}
h = h.replace(
  '<p style="font-size:12.5px;color:var(--ink-faint);margin:-6px 0 10px">До 6 культур.',
  '<p style="font-size:12.5px;color:var(--ink-faint);margin:-6px 0 10px" data-i18n="econ.cultures.intro">До 6 культур.'
);
h = h.replace(
  '<div class="section-h">Оборудование и подготовка (разово, ₽)</motion>',
  '<div class="section-h" data-i18n="econ.section.equipment">Оборудование и подготовка (разово)</div>'
);
h = h.replace(
  '<motion class="section-h">Оборудование и подготовка (разово, ₽)</motion>',
  '<div class="section-h" data-i18n="econ.section.equipment">Оборудование и подготовка (разово)</div>'
);
h = h.replace(
  'Оборудование и подготовка (разово, ₽)',
  'Оборудование и подготовка (разово)'
);
h = h.replace(
  '<div class="econ-equip-total-val" id="econ-equipment-total-val">0<span class="econ-equip-total-unit">₽</span></div>',
  '<div class="econ-equip-total-val" id="econ-equipment-total-val">0<span class="econ-equip-total-unit"></span></div>'
);
if (!h.includes('btn-currency-toggle') || !h.includes('$ USD')) {
  h = h.replace(/id="btn-currency-toggle"([^>]*)>\$<\/button>/, 'id="btn-currency-toggle"$1 data-i18n="currency.btnUsd">$ USD</button>');
}
fs.writeFileSync(path.join(root, 'calculator-110x55_12.html'), h);

// manifest
let m = fs.readFileSync(path.join(root, '_tools/build-manifest.js'), 'utf8');
if (!m.includes('planting-i18n.js')) {
  m = m.replace("'js/locale.js',", "'js/locale.js',\n    'js/planting-i18n.js',");
  m = m.replace("'js/locale.js',", "'js/locale.js',\n    'js/planting-i18n.js',", 1);
  if (!m.includes('planting-i18n')) {
    m = m.replace(
      "syntaxCheck: [\n    'js/locale.js',",
      "syntaxCheck: [\n    'js/locale.js',\n    'js/planting-i18n.js',"
    );
  }
  fs.writeFileSync(path.join(root, '_tools/build-manifest.js'), m);
}

console.log('patch-i18n-complete done');
