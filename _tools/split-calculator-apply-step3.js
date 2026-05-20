'use strict';
const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let s = fs.readFileSync(htmlPath, 'utf8');
const build = (s.match(/const CALC_BUILD = '([^']+)'/) || [])[1] || 'dev';

if (!s.includes('calc-error.js')) {
  s = s.replace(
    '<script src="js/calc-format.js?v=' + build + '"></script>',
    '<script src="js/calc-format.js?v=' + build + '"></script>\n<script src="js/calc-error.js?v=' + build + '"></script>'
  );
}

const re =
  /  \/\* Outer error catcher[\s\S]*?  \}\r?\n\r?\n  try \{\r?\n    var global = typeof window/;
if (!re.test(s)) {
  console.error('showError block not found');
  process.exit(1);
}
s = s.replace(
  re,
  '  function showError(stage, err){ window.DG_showCalcError(stage, err); }\n\n  try {\n    var global = typeof window'
);

fs.writeFileSync(htmlPath, s, 'utf8');
console.log('patched calc-error');
