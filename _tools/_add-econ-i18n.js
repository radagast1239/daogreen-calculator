const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'calculator-110x55_12.html');
let h = fs.readFileSync(p, 'utf8');
const pairs = [
  ['<div class="section-h">Общие параметры</motion>', '<motion class="section-h" data-i18n="econ.section.general">Общие параметры</div>'],
  ['<div class="section-h">Общие параметры</div>', '<div class="section-h" data-i18n="econ.section.general">Общие параметры</div>'],
  ['<div class="section-h">Состав фермы по культурам</div>', '<div class="section-h" data-i18n="econ.section.cultures">Состав фермы по культурам</motion>'],
  ['<motion class="section-h" data-i18n="econ.section.cultures">Состав фермы по культурам</motion>', '<div class="section-h" data-i18n="econ.section.cultures">Состав фермы по культурам</div>'],
  ['id="econ-add-culture">+ Культура', 'id="econ-add-culture" data-i18n="econ.addCulture">+ Культура'],
  ['id="econ-add-salad-mix">+ Микс салатов', 'id="econ-add-salad-mix" data-i18n="econ.addMix">+ Микс салатов'],
  ['<div class="section-h">Сводка урожая (из полей культур)</div>', '<div class="section-h" data-i18n="econ.section.yield">Сводка урожая (из полей культур)</div>'],
  ['<div class="section-h">Затраты (в месяц)</div>', '<div class="section-h" data-i18n="econ.section.costs">Затраты (в месяц)</div>'],
  ['<motion class="section-h">Итог</motion>', '<div class="section-h" data-i18n="econ.section.results">Итог</div>'],
  ['<div class="section-h">Итог</div>', '<div class="section-h" data-i18n="econ.section.results">Итог</div>'],
  ['<div class="section-h">Расширенная модель</div>', '<div class="section-h" data-i18n="econ.section.advanced">Расширенная модель</div>'],
];
pairs.forEach(function(pair){
  if (h.includes(pair[0])) h = h.replace(pair[0], pair[1]);
});
fs.writeFileSync(p, h);
console.log('done');
