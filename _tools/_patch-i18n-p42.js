/** p42: i18n chart, calendar, multicut, schema, colophon, toasts */
const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let h = fs.readFileSync(htmlPath, 'utf8');
const BUILD = '2026-05-18-p42-i18n-plant-render';

h = h.replace(/const CALC_BUILD = '[^']+'/, "const CALC_BUILD = '" + BUILD + "'");
h = h.replace(/js\/i18n-plant-dynamic\.js\?v=[^"]+/, 'js/i18n-plant-dynamic.js?v=' + BUILD);

function vegCtx(short) {
  return `function vegContextLabel(short){
    if (isPalletView()) return short ? ui('ui.veg.pallet') : ui('ui.veg.palletLong');
    if (isVF()) return short ? ui('ui.veg.vf') : ui('ui.veg.vfLong');
    return short ? ui('ui.veg.ch') : ui('ui.veg.chLong');
  }
  function vegContextLabelCap(){
    if (isPalletView()) return ui('ui.veg.palletCap');
    if (isVF()) return ui('ui.veg.vfCap');
    return ui('ui.veg.chCap');
  }`;
}

h = h.replace(
  /function vegContextLabel\(short\)\{[\s\S]*?function vegContextLabelCap\(\)\{[\s\S]*?return 'В канале';\s*\}/,
  vegCtx()
);

h = h.replace(
  "svg += '<text x=\"' + padL + '\" y=\"' + (padT - 6) + '\" class=\"svg-axis-t\" text-anchor=\"start\">масса, г</text>';",
  "svg += '<text x=\"' + padL + '\" y=\"' + (padT - 6) + '\" class=\"svg-axis-t\" text-anchor=\"start\">' + ui('ui.chart.axisMass') + '</text>';"
);
h = h.replace(
  "svg += '<text x=\"' + (padL + dW) + '\" y=\"' + (padT - 6) + '\" class=\"svg-axis-t\" text-anchor=\"end\">шапка, мм</text>';",
  "svg += '<text x=\"' + (padL + dW) + '\" y=\"' + (padT - 6) + '\" class=\"svg-axis-t\" text-anchor=\"end\">' + ui('ui.chart.axisCanopy') + '</text>';"
);
h = h.replace(
  /svg \+= '<text x="' \+ \(padL \+ dW\/2\) \+ '" y="' \+ \(H - 8\) \+ '" class="svg-axis-t" text-anchor="middle">сут вегетации ' \+ vegContextLabel\(\) \+ ' \(прорастание ' \+ state\.germination \+ ' \+ период вегетации ' \+ \(state\.nursery \+ state\.day\) \+ '\)<\/text>';/,
  "svg += '<text x=\"' + (padL + dW/2) + '\" y=\"' + (H - 8) + '\" class=\"svg-axis-t\" text-anchor=\"middle\">' + ui('ui.chart.axisX', { ctx: vegContextLabel(), germ: state.germination, veg: state.nursery + state.day }) + '</text>';"
);
h = h.replace(
  "const outUnit = r.countUnit === 'шт' ? 'шт' : 'г';",
  "const outUnit = r.countUnit === '\u0448\u0442' ? pm('u.pcs') : pm('unit.g');"
);
h = h.replace(
  /const canopyLabel = state\.showRange[\s\S]*?: round\(canopyMark\) \+ ' мм';/,
  `const canopyLabel = state.showRange
      ? round(canopyMark - rangeCanopy(canopyMark)) + '\u2013' + round(canopyMark + rangeCanopy(canopyMark)) + ' ' + pm('unit.mm')
      : round(canopyMark) + ' ' + pm('unit.mm');`
);
h = h.replace(
  "svg += '<text x=\"' + hx + '\" y=\"' + (padT + dH - 9) + '\" class=\"svg-axis-t\" text-anchor=\"middle\" style=\"fill:#6B7B2E;font-weight:500\">съём</text>';",
  "svg += '<text x=\"' + hx + '\" y=\"' + (padT + dH - 9) + '\" class=\"svg-axis-t\" text-anchor=\"middle\" style=\"fill:#6B7B2E;font-weight:500\">' + ui('ui.chart.harvestMark') + '</text>';"
);
h = h.replace(
  "? '<span><span class=\"swatch mass\"></span>Масса, г (сравнение сортов)</span>'\n        : '<span><span class=\"swatch mass\"></span>Масса, г</span><span><span class=\"swatch canopy\"></span>Шапка, мм</span>';",
  "? '<span><span class=\"swatch mass\"></span>' + ui('ui.chart.legendCompare') + '</span>'\n        : '<span><span class=\"swatch mass\"></span>' + ui('ui.chart.legendMass') + '</span><span><span class=\"swatch canopy\"></span>' + ui('ui.chart.legendCanopy') + '</span>';"
);

// calendar
h = h.replace(
  "{ stage: 'Посев', date: sow, totalDay: 0, ch: '—' },",
  "{ stage: ui('ui.cal.stageSow'), date: sow, totalDay: 0, ch: '\u2014' },"
);
h = h.replace(
  "{ stage: isPalletView() ? 'Пересадка на поддон' : (isVF() ? 'Пересадка в модуль' : 'Пересадка в канал'), date: transplant, totalDay: state.germination + state.nursery, ch: '0' },",
  "{ stage: isPalletView() ? ui('ui.cal.stageTransPal') : (isVF() ? ui('ui.cal.stageTransVf') : ui('ui.cal.stageTransCh')), date: transplant, totalDay: state.germination + state.nursery, ch: '0' },"
);
h = h.replace(
  "{ stage: 'Текущий день', date: current, totalDay: r.t_total, ch: state.day + ' (' + massLabel + ' г · ' + canopyLabel + ' мм)', current: true },",
  "{ stage: ui('ui.cal.stageCurrent'), date: current, totalDay: r.t_total, ch: ui('ui.cal.currentDetail', { day: state.day, mass: massLabel, gUnit: pm('unit.g'), canopy: canopyLabel, mm: pm('unit.mm') }), current: true },"
);
h = h.replace(
  "{ stage: 'Рекомендуемый съём', date: harvest, totalDay: harvestDay, ch: round(r.tHarvestCh) },",
  "{ stage: ui('ui.cal.stageHarvest'), date: harvest, totalDay: harvestDay, ch: round(r.tHarvestCh) },"
);
h = h.replace(
  "{ stage: 'Риск стрелкования', date: bolt, totalDay: boltDay, ch: round(r.tBoltCh) }",
  "{ stage: ui('ui.cal.stageBolt'), date: bolt, totalDay: boltDay, ch: round(r.tBoltCh) }"
);
h = h.replace(
  "'<td class=\"cal-day\">общий ' + row.totalDay + ' сут · вегетация ' + vegContextLabel() + ' ' + row.ch + '</td>'",
  "'<td class=\"cal-day\">' + ui('ui.cal.dayCol', { total: row.totalDay, dUnit: pm('unit.days'), ctx: vegContextLabel(), ch: row.ch }) + '</td>'"
);

// multicut
h = h.replace(
  "$('cut-schedule').innerHTML = '<div style=\"color:var(--ink-faint);font-size:13px\">Включите режим срезов, чтобы увидеть график</motion.div>';",
  "$('cut-schedule').innerHTML = '<div style=\"color:var(--ink-faint);font-size:13px\">' + ui('ui.cut.enableHint') + '</div>';"
);
h = h.replace(
  /'\<div style="color:var\(--ink-faint\);font-size:13px"\>Включите режим срезов, чтобы увидеть график\<\/motion.div\>';/,
  "'<div style=\"color:var(--ink-faint);font-size:13px\">' + ui('ui.cut.enableHint') + '</div>';"
);

// fix if still russian
h = h.replace(
  "Включите режим срезов, чтобы увидеть график",
  "' + ui('ui.cut.enableHint') + '"
);
// undo broken replace - read file after

h = h.replace(
  /Нет срезов в допустимом окне — увеличьте сут ' \+ vegContextLabel\(\) \+ ' \(вегетация\) или интервал\./,
  "ui('ui.cut.noCutsHint', { dUnit: pm('unit.days'), ctx: vegContextLabel() })"
);

h = h.replace(
  "const massCol = unit === 'шт' ? 'Шт/растение' : 'Масса/растение, г/горшок';",
  "const massCol = unit === '\u0448\u0442' ? ui('ui.cut.colMassPcs') : ui('ui.cut.colMassG');"
);
h = h.replace(
  "html += '<tr><th>Срез</th><th>' + vegContextLabelCap() + '</th><th>Дата</th><th>' + massCol + '</th></tr>';",
  "html += '<tr><th>' + ui('ui.cut.colCut') + '</th><th>' + vegContextLabelCap() + '</th><th>' + ui('ui.cut.colDate') + '</th><th>' + massCol + '</th></tr>';"
);
h = h.replace(
  "(c.nearBolt ? ' (риск горечи)' : '')",
  "(c.nearBolt ? ui('ui.cut.bitterRisk') : '')"
);

// colophon light
h = h.replace(
  /function renderColophonLight\(\)\{[\s\S]*?el\.innerHTML = el\.innerHTML\.replace\(\/div\/g, 'div'\);\s*\}/,
  `function renderColophonLight(){
    const el = $('colophon-light');
    if (!el) return;
    el.innerHTML = isVF() ? ui('ui.colophon.lightVf') : ui('ui.colophon.lightGh');
  }`
);

// toasts
h = h.replace("showToast('Посадка импортирована в экономику');", "showToast(ui('ui.toast.importEcon'));");
h = h.replace("showToast('Проект загружен');", "showToast(ui('ui.toast.projectLoaded'));");
h = h.replace(
  "showToast('Шаблон: ' + btn.textContent.trim());",
  "showToast(ui('ui.toast.preset', { name: btn.textContent.trim() }));"
);

// pdf meta
h = h.replace("lines.push({ label: 'Сорт', value: cv.name, unit: '' });", "lines.push({ label: ui('ui.pdf.meta.cultivar'), value: cv.name, unit: '' });");
h = h.replace("lines.push({ label: 'Масса урожая', value: r1(r.mass), unit: 'г' });", "lines.push({ label: ui('ui.pdf.meta.mass'), value: r1(r.mass), unit: pm('unit.g') });");
h = h.replace("lines.push({ label: 'Шапка', value: r1(r.canopy), unit: 'мм' });", "lines.push({ label: ui('ui.pdf.meta.canopy'), value: r1(r.canopy), unit: pm('unit.mm') });");
h = h.replace("lines.push({ label: 'Растений', value: fmtNum(r.total), unit: 'шт' });", "lines.push({ label: ui('ui.pdf.meta.plants'), value: fmtNum(r.total), unit: pm('u.pcs') });");
h = h.replace("lines.push({ label: 'Посевная площадь', value: r2(r.sysArea), unit: 'м²' });", "lines.push({ label: ui('ui.pdf.meta.area'), value: r2(r.sysArea), unit: tr('sum.unit.sqm') });");
h = h.replace("lines.push({ label: 'Режим', value: mode, unit: '' });", "lines.push({ label: ui('ui.pdf.meta.mode'), value: mode, unit: '' });");
h = h.replace(
  /var mode = state\.appView === 'pallets' \? 'Поддоны' : \(state\.facility === 'vertical' \? 'VF' : 'Теплица'\);\s*if \(state\.appView === 'economics'\) mode = 'Экономика';/,
  `var mode = state.appView === 'pallets' ? tr('mode.pallets') : (state.facility === 'vertical' ? tr('mode.vf') : tr('mode.gh'));
          if (state.appView === 'economics') mode = tr('mode.economics');`
);
h = h.replace(
  "title: t ? t.textContent : 'Калькулятор Daogreen',",
  "title: t ? t.textContent : ui('ui.pdf.meta.titleFallback'),"
);

// metrics chan plant
h = h.replace(
  "v: typeof DG_getLocale === 'function' && DG_getLocale() === 'en' ? '2 rows, staggered' : '2 ряда, шахм.', u: ''",
  "v: ui('ui.schema.chanPlant2'), u: ''"
);
h = h.replace(
  "u: 'м (' + (r.alongLength || 0) + '×130 см)'",
  "u: ui('ui.metrics.zoneLen', { along: r.alongLength || 0 })"
);

// schema pallet title
h = h.replace(
  'поддон 1300 мм (вдоль потока)',
  "' + ui('ui.schema.palletFlow') + '"
);
// fix - need proper replace
h = h.replace(
  "svg += '<text x=\"' + (oX + pw / 2).toFixed(1) + '\" y=\"' + titleY.toFixed(1) + '\" text-anchor=\"middle\" class=\"svg-dim-t\" font-size=\"11\">поддон 1300 мм (вдоль потока)</text>';",
  "svg += '<text x=\"' + (oX + pw / 2).toFixed(1) + '\" y=\"' + titleY.toFixed(1) + '\" text-anchor=\"middle\" class=\"svg-dim-t\" font-size=\"11\">' + ui('ui.schema.palletFlow') + '</text>';"
);

h = h.replace(
  /кассета ' \+ \(c \+ 1\) \+ ' · 400×600 · ' \+ cells \+ ' яч\.'/,
  "ui('ui.schema.cassetteN', { n: c + 1, cells: cells })"
);
h = h.replace(
  /крышка-крафт 1300×650 · ' \+ cells \+ ' отв\. на поддон/,
  "ui('ui.schema.lidCraft', { cells: cells })"
);

h = h.replace(
  /const ml = mount === 'lid' \? \('крышка · ' \+ cells \+ ' отв\.\/поддон'\) : \('3 кассеты × ' \+ cells \+ ' яч\.'\);\s*const staggerNote = \(cells === 6 \|\| cells === 14\) \? ' · шахм\.' : '';\s*\$\('viz-caption'\)\.textContent = 'Один поддон 130×65 см · ' \+ ml \+ staggerNote \+ ' · шапка на схеме ⌀' \+ round\(canopyMm\) \+ ' мм \(масштаб 1:1\) · ' \+ along \+ '×' \+ across \+ ' подд\. · ' \+ \(r\.cv \? r\.cv\.name : ''\);/,
  `const ml = mount === 'lid' ? ui('ui.schema.mountLid', { cells: cells }) : ui('ui.schema.mountCas', { cells: cells });
    const staggerNote = (cells === 6 || cells === 14) ? ui('ui.schema.stagger') : '';
    $('viz-caption').textContent = ui('ui.schema.captionPal', { mount: ml, stagger: staggerNote, canopy: round(canopyMm), along: along, across: across, name: r.cv ? r.cv.name : '' });`
);

// schema channel dims and caption
h = h.replace(
  "'a = ' + round(r.a) + ' мм'",
  "ui('ui.schema.dimA', { a: round(r.a) })"
);
h = h.replace(
  "'b = ' + round(r.b) + ' мм'",
  "ui('ui.schema.dimB', { b: round(r.b) })"
);
h = h.replace(
  "'⤬ ' + round(r.nearest) + ' мм'",
  "ui('ui.schema.dimNearest', { d: round(r.nearest) })"
);
h = h.replace(
  /const chanLabel = r\.vfMode\s*\? \('2×' \+ r\.perRow \+ ' = ' \+ r\.perChan \+ ' в канале'\)\s*: \(r\.perChan \+ ' в канале'\);/,
  `const chanLabel = r.vfMode
      ? ui('ui.schema.chanVf', { perRow: r.perRow, perChan: r.perChan })
      : ui('ui.schema.chanPlain', { perChan: r.perChan });`
);
h = h.replace(
  /\$\('viz-caption'\)\.textContent = \(hEll \|\| vEll\)\s*\? 'Фрагмент: ' \+ showN \+ \(r\.vfMode \? ' точек в ряду' : ''\) \+ ' из ' \+ chanLabel \+ ', ' \+ showCh \+ ' из ' \+ state\.nch \+ ' каналов\. ' \+ r\.cv\.name \+ ', ' \+ r\.t_ch \+ ' сут вегетации в канале, шапка ' \+ round\(r\.canopy\) \+ ' мм\.'\s*: 'Полная схема: ' \+ chanLabel \+ ' × ' \+ state\.nch \+ ' каналов' \+ \(r\.vfMode \? ' \(2 ряда, шахм\.\)' : ''\) \+ '\. ' \+ r\.cv\.name \+ ', ' \+ r\.t_ch \+ ' сут вегетации в канале, шапка ' \+ round\(r\.canopy\) \+ ' мм\.';/,
  `$('viz-caption').textContent = (hEll || vEll)
      ? ui('ui.schema.captionFrag', { showN: showN, rowNote: r.vfMode ? ui('ui.schema.rowNote') : '', chanLabel: chanLabel, showCh: showCh, nch: state.nch, name: r.cv.name, days: r.t_ch, dUnit: pm('unit.days'), ctx: vegContextLabel(), canopy: round(r.canopy) })
      : ui('ui.schema.captionFull', { chanLabel: chanLabel, nch: state.nch, vfNote: r.vfMode ? ui('ui.schema.vfNote') : '', name: r.cv.name, days: r.t_ch, dUnit: pm('unit.days'), ctx: vegContextLabel(), canopy: round(r.canopy) });`
);

// multicut meta block - complex, do simpler partial
const multicutMetaOld = /html \+= '<div class="multicut-meta">' \+[\s\S]*?html \+= '<\/div>';/;
const multicutMetaNew = `html += '<div class="multicut-meta">' +
      ui('ui.cut.meta', { interval: interval, dUnit: pm('unit.days'), rec: intervalMods.rec, slack: CUT_INTERVAL_SLACK, n: cuts.length, total: totalLabel });
    if (intervalMods.delta !== 0){
      html += ui('ui.cut.metaAdj', { pct: (intervalMods.massPct >= 0 ? '+' : '') + intervalMods.massPct });
    }
    if (ghPlanned){
      html += ui('ui.cut.metaGh', { n: state.ghCutCount });
    }
    html += '.<br>';
    {
      const hy = plantingHarvestYieldParams(cv, r);
      const u2 = hy.unitIsPieces ? pm('u.pcs') : pm('unit.g');
      const ySqm = hy.unitIsPieces
        ? r1(hy.yieldPerSqmMonthPcs) + ' ' + ui('ui.cut.pcsMo')
        : r2(hy.yieldPerSqmMonthKg) + ' ' + ui('ui.cut.kgMo');
      html += ui('ui.cut.monthLine', {
        ySqm: ySqm, interval: hy.harvestCutIntervalDays, dUnit: pm('unit.days'),
        perCut: Math.round(hy.harvestYieldPerCut), u2: u2, cutsMo: r1(hy.harvestCutsPerMonth),
        sum: Math.round(calcSqm), lastDay: lastDay, ctx: vegContextLabel()
      });
    }
    html += '</div>';`;
if (multicutMetaOld.test(h)) h = h.replace(multicutMetaOld, multicutMetaNew);

// cut schedule enable hint fix
h = h.replace(
  /innerHTML = '<div style="color:var\(--ink-faint\);font-size:13px">' \+ ui\('ui\.cut\.enableHint'\) \+ '<\/div>';/g,
  "innerHTML = '<div style=\"color:var(--ink-faint);font-size:13px\">' + ui('ui.cut.enableHint') + '</div>';"
);
h = h.replace(
  /\$\('cut-schedule'\)\.innerHTML = '<div style="color:var\(--ink-faint\);font-size:13px">'' \+ ui\('ui\.cut\.enableHint'\) \+ ''<\/div>';/,
  "$('cut-schedule').innerHTML = '<motion.div style=\"color:var(--ink-faint);font-size:13px\">' + ui('ui.cut.enableHint') + '</div>';"
);
h = h.replace(/<motion\.div/g, '<div').replace(/<\/motion\.motion/g, '</div>');

fs.writeFileSync(htmlPath, h, 'utf8');
console.log('patched', BUILD);
