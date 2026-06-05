const fs = require('fs');
const p = 'calculator-110x55_12.html';
let h = fs.readFileSync(p, 'utf8');

const D = 'div';

if (!h.includes('id="geom-section-title"')) {
  h = h.replace(
    '    <' + D + ' class="section-h">Геометрия посадки</' + D + '>',
    '    <' + D + ' class="section-h" id="geom-section-title">Геометрия посадки</' + D + '>'
  );
}
h = h.replace(
  '    <' + D + ' class="section-h">Шапка и зазоры</' + D + '>',
  '    <' + D + ' class="section-h" id="canopy-section-title">Шапка и зазоры</' + D + '>'
);
h = h.replace(
  '    <' + D + ' class="section-h">Система целиком</' + D + '>\n    <' + D + ' class="metrics" id="metrics-sys">',
  '    <' + D + ' class="section-h" id="sys-metrics-section-title">Система целиком</' + D + '>\n    <' + D + ' class="metrics" id="metrics-sys">'
);

const uiOld = `    const secTitle = $('system-section-title');
    if (secTitle) secTitle.textContent = pallet ? 'Параметры системы · поддоны 130×65' : 'Параметры системы · каналы 110×55';`;
const uiNew = `    const secTitle = $('system-section-title');
    if (secTitle) secTitle.textContent = pallet ? 'Параметры системы · поддоны 130×65' : 'Параметры системы · каналы 110×55';
    const geomTitle = $('geom-section-title');
    if (geomTitle) geomTitle.textContent = pallet ? 'Геометрия поддонов и кассет' : 'Геометрия посадки';
    const canopyTitle = $('canopy-section-title');
    if (canopyTitle) canopyTitle.textContent = pallet ? 'Шапка и шаг ячеек' : 'Шапка и зазоры';
    const sysMetTitle = $('sys-metrics-section-title');
    if (sysMetTitle) sysMetTitle.textContent = pallet ? 'Стеллаж и зона целиком' : 'Система целиком';`;
if (!h.includes("geomTitle = $('geom-section-title')")) {
  h = h.replace(uiOld, uiNew);
}

const crowdOld = `      push('warn', 'warn', 'Затенение от высокой плотности снижает достижимую массу на ' + lossPct + '% (M_max ' + r.cv.M_max + ' → ' + round(r.cv.M_max * r.crowdF) + ' г). Это физиологический эффект перекрытия шапок — нижние листья получают мало света. Увеличьте шаг между растениями.');`;
const crowdNew = `      push('warn', 'warn', 'Затенение от высокой плотности снижает достижимую массу на ' + lossPct + '% (M_max ' + r.cv.M_max + ' → ' + round(r.cv.M_max * r.crowdF) + ' г). Это физиологический эффект перекрытия шапок — нижние листья получают мало света. ' + (r.palletMode ? 'Уменьшите число ячеек в кассете или увеличьте шаг отверстий.' : 'Увеличьте шаг между растениями.'));`;
if (h.includes(crowdOld)) h = h.replace(crowdOld, crowdNew);

const canopyBlockOld = `    /* Canopy spacing */
    if (r.leafGap < -30){
      push('bad', 'bad', 'Шапки сильно перекрываются на ' + round(-r.leafGap) + ' мм. Снизьте плотность.');
    } else if (r.leafGap < -10){
      push('warn', 'warn', 'Шапки заходят друг на друга на ' + round(-r.leafGap) + ' мм. Уменьшите плотность или массу/шапку урожая.');
    } else if (r.leafGap < 10){
      push('check', 'check', 'Шапки практически смыкаются (зазор ' + round(r.leafGap) + ' мм). Площадь использована полностью.');
    } else if (r.leafGap < 50){
      push('check', 'check', 'Зазор между листьями ' + round(r.leafGap) + ' мм — комфортный воздухообмен, легко собирать.');
    } else {
      const dDay = r.tHarvestCh > r.t_ch ? Math.round(r.tHarvestCh - r.t_ch) : 0;
      push('info', 'info', 'Между листьями ' + round(r.leafGap) + ' мм. Можно поднять плотность или дорастить' + (dDay ? ' (ещё ' + dDay + ' дней до съёма)' : '') + '.');
    }`;

const canopyBlockNew = `    /* Canopy spacing */
    if (r.palletMode){
      if (r.leafGap < -30){
        push('bad', 'bad', 'Шапки сильно перекрывают соседние ячейки на ' + round(-r.leafGap) + ' мм. Уменьшите число ячеек в кассете.');
      } else if (r.leafGap < -10){
        /* предупреждение выше */
      } else if (r.leafGap < 10){
        push('check', 'check', 'Шапки почти касаются соседних ячеек (зазор ' + round(r.leafGap) + ' мм) — площадь кассеты использована полностью.');
      } else if (r.leafGap < 50){
        push('check', 'check', 'Зазор между шапками в соседних ячейках ' + round(r.leafGap) + ' мм — нормальный воздухообмен.');
      } else {
        const dDay = r.tHarvestCh > r.t_ch ? Math.round(r.tHarvestCh - r.t_ch) : 0;
        push('info', 'info', 'Между шапками ' + round(r.leafGap) + ' мм — можно взять кассету плотнее' + (dDay ? ' или дорастить ещё ' + dDay + ' сут' : '') + '.');
      }
      if (r.edgeGap < 5){
        push('info', 'info', 'Зазор между стенками ячеек ~' + round(r.edgeGap) + ' мм (⌀ ячейки ' + round(r.cellD) + ' мм, шаг ' + round(r.cellPitch) + ' мм).');
      }
    } else if (r.leafGap < -30){
      push('bad', 'bad', 'Шапки сильно перекрываются на ' + round(-r.leafGap) + ' мм. Снизьте плотность.');
    } else if (r.leafGap < -10){
      push('warn', 'warn', 'Шапки заходят друг на друга на ' + round(-r.leafGap) + ' мм. Уменьшите плотность или массу/шапку урожая.');
    } else if (r.leafGap < 10){
      push('check', 'check', 'Шапки практически смыкаются (зазор ' + round(r.leafGap) + ' мм). Площадь использована полностью.');
    } else if (r.leafGap < 50){
      push('check', 'check', 'Зазор между листьями ' + round(r.leafGap) + ' мм — комфортный воздухообмен, легко собирать.');
    } else {
      const dDay = r.tHarvestCh > r.t_ch ? Math.round(r.tHarvestCh - r.t_ch) : 0;
      push('info', 'info', 'Между листьями ' + round(r.leafGap) + ' мм. Можно поднять плотность или дорастить' + (dDay ? ' (ещё ' + dDay + ' дней до съёма)' : '') + '.');
    }`;

if (h.includes(canopyBlockOld)) h = h.replace(canopyBlockOld, canopyBlockNew);

h = h.replace(
  "r.t_ch + ' сут вегетации в канале — фаза стрелкования",
  "r.t_ch + ' сут вегетации' + (r.palletMode ? ' на поддоне' : ' в канале') + ' — фаза стрелкования"
);
h = h.replace(
  "' сут вегетации в канале): прирост",
  "' сут вегетации' + (r.palletMode ? ' на поддоне' : ' в канале') + '): прирост"
);

fs.writeFileSync(p, h);
console.log('geom title:', h.includes('geom-section-title'));
console.log('ui titles:', h.includes('geomTitle'));
console.log('canopy block:', h.includes('можно взять кассету плотнее'));
