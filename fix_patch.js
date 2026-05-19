const fs = require('fs');
const p = '_patch_custom_cv.js';
let t = fs.readFileSync(p, 'utf8');
t = t.replace(/<\/?motion>/g, '');
const block = [
  '// HTML panel',
  'rep(',
  '  `    <div class="collapse-body" id="panel-cultivars-body">',
  '      <div class="cultivar-grid" id="cultivars"></motion></motion></motion></div>',
  '      <p class="vf-cv-std-hint vf-only env-block-hidden" id="vf-cv-std-hint" style="margin-top:12px"></p>',
  '    </div>`,',
  '  `    <div class="collapse-body" id="panel-cultivars-body">',
  '      <div class="cultivar-grid" id="cultivars"></div>',
  '      <div class="cv-custom-bar">',
  '        <button type="button" class="auto-btn" id="cv-add-custom">+ Добавить свой сорт</button>',
  '      </div>',
  '      <p class="vf-cv-std-hint vf-only env-block-hidden" id="vf-cv-std-hint" style="margin-top:12px"></p>',
  '    </div>`,',
  "  'panel html'",
  ');',
  '',
  '// Dialog before </body>'
].join('\n');
t = t.replace(/\/\/ HTML panel[\s\S]*?\/\/ Dialog before <\/body>/, block);
t = t.replace(/<\/?motion>/g, '');
fs.writeFileSync(p, t);
console.log('fixed');
