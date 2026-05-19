const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

let u = fs.readFileSync(path.join(root, 'js/econ-ui.js'), 'utf8');
const i = u.indexOf("Посев (разово)");
if (i > 0) {
  const chunk = u.slice(i, i + 400);
  const fixed = chunk
    .replace(/consOnceSqm \+ ' ₽\/м²'/g, "consOnceSqm + ' ' + moneySym() + L('econ.perSqm')")
    .replace(/consSqm \+ ' ₽\/м²·мес'<\/strong> \(÷ ' \+ deps\.r1\(hm\) \+ ' мес\)/g, "consSqm + ' ' + moneySym() + L('econ.perSqmMonth')")
    .replace(/consMo \+ ' ₽\/мес'/g, "consMo + ' ' + moneySym() + L('econ.perMonth')")
    .replace(/ \+ ' ' \+ deps\.r1\(p\.slice\.area\) \+ ' м²/g, '');
  u = u.slice(0, i) + fixed + u.slice(i + chunk.length);
  fs.writeFileSync(path.join(root, 'js/econ-ui.js'), u);
  console.log('econ-ui fixed');
} else console.log('econ-ui marker not found');

let h = fs.readFileSync(path.join(root, 'calculator-110x55_12.html'), 'utf8');
if (!h.includes('id="currency-active-banner"')) {
  h = h.replace(
    '  <div id="calc-build-badge" class="calc-build-badge" aria-live="polite">',
    '  <div id="currency-active-banner" class="currency-active-banner" hidden></div>\n  <motion id="calc-build-badge" class="calc-build-badge" aria-live="polite">'
  );
  h = h.replace(
    '<motion id="calc-build-badge" class="calc-build-badge" aria-live="polite">',
    '<div id="calc-build-badge" class="calc-build-badge" aria-live="polite">'
  );
}
h = h.replace('data-readonly-allow>$</button>', 'data-readonly-allow title="USD">$ USD</button>');
fs.writeFileSync(path.join(root, 'calculator-110x55_12.html'), h);
