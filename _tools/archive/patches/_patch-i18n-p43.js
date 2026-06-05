const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let h = fs.readFileSync(htmlPath, 'utf8');
const BUILD = '2026-05-18-p43-i18n-plant-ui';

h = h.replace(/const CALC_BUILD = '[^']+'/, "const CALC_BUILD = '" + BUILD + "'");

function vfStdFieldsBlock(){
  return `  const VF_STD_FIELDS = [
    { key: 'germination', labelKey: 'germination', ctrl: 'ctrl-germination', badge: 'vf-badge-germination' },
    { key: 'day', labelKey: 'day', ctrl: 'ctrl-day', badge: 'vf-badge-day' },
    { key: 'density', labelKey: 'density', ctrl: 'ctrl-density', badge: 'vf-badge-density' },
    { key: 'mass', labelKey: 'mass', ctrl: null, badge: 'vf-badge-mass' },
    { key: 'cutInterval', labelKey: 'cutInterval', ctrl: 'ctrl-cut-interval', badge: 'vf-badge-cutInterval' },
    { key: 'cutMass', labelKey: 'cutMass', ctrl: null, badge: 'vf-badge-cutMass' }
  ];`;
}

h = h.replace(/  const VF_STD_FIELDS = \[[\s\S]*?  \];/, vfStdFieldsBlock());

h = h.replace(
  /html \+= '<div class="gh-cut-mass-item"><label>\u0421\u0440\u0435\u0437 ' \+ \(i \+ 1\) \+ ', \u0433\/\u0433\u043e\u0440\u0448\u043e\u043a<\/label>' \+/,
  "html += '<div class=\"gh-cut-mass-item\"><label>' + ui('ui.gh.cutMassLabel', { n: i + 1 }) + '</label>' +"
);

h = h.replace(
  /const unit = r\.countUnit === '\u0448\u0442' \? '\u0448\u0442' : '\u0433';/g,
  "const unit = r.countUnit === '\u0448\u0442' ? pm('u.pcs') : pm('unit.g');"
);

h = h.replace(
  /const unit = isVF\(\) && getVfCv\(\) && getVfCv\(\)\.countUnit === '\u0448\u0442' \? '\u0448\u0442' : '\u0433';/,
  "const unit = isVF() && getVfCv() && getVfCv().countUnit === '\u0448\u0442' ? pm('u.pcs') : pm('unit.g');"
);

h = h.replace(
  /if \(pc\) pc\.innerHTML = '<strong>' \+ formatHarvestCtrlVal\(modelCanopy, rangeCanopy\) \+ '<\/strong> \u043c\u043c';/,
  "if (pc) pc.innerHTML = '<strong>' + formatHarvestCtrlVal(modelCanopy, rangeCanopy) + '</strong> ' + pm('unit.mm');"
);

h = h.replace(
  /btnCut\.title = std \? '\u041f\u043e\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b \u0438\u0437 \u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a\u0430 VF' : '\u0414\u043b\u044f \u044d\u0442\u043e\u0439 \u043a\u0443\u043b\u044c\u0442\u0443\u0440\u044b \u0432 \u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a\u0435 \u043d\u0435\u0442 \u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0433\u043e \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0430 \(частичный срез\)';/,
  "btnCut.title = std ? ui('ui.harvest.intervalStd') : ui('ui.harvest.intervalNone');"
);

const updateMassHintOld = /function updateMassModelHint\(massAuto, mass, canopyAuto, canopy\)\{[\s\S]*?    \}\n  \}/;
const updateMassHintNew = `function updateMassModelHint(massAuto, mass, canopyAuto, canopy){
    const el = $('mass-model-hint');
    if (!el) return;
    const unit = isVF() && getVfCv() && getVfCv().countUnit === '\u0448\u0442' ? pm('u.pcs') : pm('unit.g');
    const mm = pm('unit.mm');
    const mDisp = state.showRange
      ? formatHarvestCtrlVal(mass, rangeMass) + ' ' + unit
      : round(mass) + ' ' + unit;
    const cDisp = state.showRange
      ? formatHarvestCtrlVal(canopy, rangeCanopy) + ' ' + mm
      : round(canopy) + ' ' + mm;
    const range = state.showRange
      ? (state.useManualMass || state.useManualCanopy
        ? ui('ui.harvest.rangeManual', { pct: state.errorPct, pctHalf: state.errorPct / 2 })
        : ui('ui.harvest.rangeAuto'))
      : '';
    if (state.useManualMass || state.useManualCanopy){
      el.innerHTML = ui('ui.harvest.hintManual', {
        massAuto: round(massAuto), unit: unit, canopyAuto: round(canopyAuto), mm: mm,
        mDisp: mDisp, cDisp: cDisp, range: range
      });
    } else {
      el.innerHTML = ui('ui.harvest.hintAuto', {
        massAuto: round(massAuto), unit: unit, canopyAuto: round(canopyAuto), mm: mm, range: range
      });
    }
  }`;
if (updateMassHintOld.test(h)) h = h.replace(updateMassHintOld, updateMassHintNew);

h = h.replace(
  /function updateVfCvHint\(\)\{[\s\S]*?    if \(nameEl\) nameEl\.textContent = cv \? cv\.name : '\u2014';\n  \}/,
  `function updateVfCvHint(){
    const cv = getSheetCv();
    const unit = cv && cv.countUnit === '\u0448\u0442' ? pm('u.pcs') : pm('unit.g');
    const dUnit = pm('unit.days');
    const pcsSqm = pm('u.pcsSqm');
    const perCut = ui('ui.cv.perCut');
    let html = '';
    if (cv && isPalletView()){
      html = ui('ui.vf.hintPal', {
        name: cv.name, germ: cv.germinationStd, chStd: cv.channelStd, dUnit: dUnit,
        cellsStd: cv.palletCellsStd, cells: cv.palletCells, cellsUnit: ui('ui.sub.cellsUnit'),
        density: cv.densityStd, pcsSqm: pcsSqm, yield: cv.yieldPerCutStd, unit: unit
      });
    } else if (cv && isVF()){
      html = ui('ui.vf.hintVf', {
        name: cv.name, germ: cv.germinationStd, chStd: cv.channelStd, dUnit: dUnit,
        density: cv.densityStd, pcsSqm: pcsSqm, yield: cv.yieldPerCutStd, unit: unit,
        note: cv.cutNote ? ' \u00b7 ' + cv.cutNote : ''
      });
    }
    const el = $('vf-cv-std-hint');
    if (el){
      el.classList.toggle('env-block-hidden', !usePlantingSheet() || !cv);
      el.innerHTML = html;
    }
    const nameEl = $('vf-std-cv-name');
    if (nameEl) nameEl.textContent = cv ? cv.name : '\u2014';
  }`
);

h = h.replace(
  /\? VF_STD_FIELDS\.concat\(\[\{ key: 'cells', label: '\u041a\u0430\u0441\u0441\u0435\u0442\u0430 \(\u044f\u0447\.\/\u043a\u0430\u0441\u0441\u0435\u0442\u0430\)' \}\]\)/,
  "? VF_STD_FIELDS.concat([{ key: 'cells', labelKey: 'cells' }])"
);

h = h.replace(
  /\(pStd\[f\.key\] \? 'checked' : ''\) \+ '> ' \+ f\.label \+ '<\/label>'/,
  "(pStd[f.key] ? 'checked' : '') + '> ' + ui('vf.std.' + (f.labelKey || f.key)) + '</label>'"
);

h = h.replace(
  /const fields = \[\s*\{ key: 'germination', label: '\u041f\u0440\u043e\u0440\u0430\u0441\u0442\u0430\u043d\u0438\u0435'[\s\S]*?\{ key: 'manualCutMass', label: '\u041c\u0430\u0441\u0441\u0430 \u0441\u0440\u0435\u0437', min: 1, max: 500 \}\s*\];/,
  `const fields = [
      { key: 'germination', label: pt('std.gh.germination'), min: 1, max: 21 },
      { key: 'nursery', label: pt('std.gh.nursery'), min: 7, max: 28 },
      { key: 'day', label: pt('std.gh.day'), min: 1, max: 70 },
      { key: 'density', label: pt('std.gh.density'), min: 15, max: 220 },
      { key: 'cutInterval', label: pt('std.gh.cutInterval'), min: 5, max: 45 },
      { key: 'manualCanopy', label: pt('std.gh.canopy'), min: 20, max: 600, step: 1 },
      { key: 'manualMass', label: ui('ui.vf.std.harvest'), min: 5, max: 500 },
      { key: 'manualCutMass', label: ui('ui.vf.std.cutMassField'), min: 1, max: 500 }
    ];`
);

h = h.replace(
  /function updatePageSub\(\)\{[\s\S]*?    \} else \{\n      el\.textContent = pt\('sub\.gh'\);\n    \}\n  \}/,
  `function updatePageSub(){
    const el = $('page-sub');
    const kick = $('page-kicker') || document.querySelector('.kicker');
    const title = $('page-title') || document.querySelector('.page-title');
    syncPalletLoadWarn();
    if (state.appView === 'economics'){
      if (kick) kick.textContent = pt('econ.kicker');
      if (title) title.textContent = pt('econ.title');
      if (el) el.textContent = pt('econ.sub');
      return;
    }
    if (isPalletView()){
      const pcv = getPalletCv();
      const cellsLbl = String(state.palletCells);
      const detail = pcv
        ? ui('ui.sub.palCv', {
          name: pcv.name,
          tray: ui('ui.sub.trayPrefix'),
          cellsStd: pcv.palletCellsStd,
          cells: cellsLbl,
          cellsUnit: ui('ui.sub.cellsUnit')
        })
        : ui('ui.sub.palCells', { cells: cellsLbl, cellsUnit: ui('ui.sub.trayUnit') });
      if (el) el.textContent = pt('sub.pal') + ' \u00b7 ' + detail + ' \u00b7 ' +
        ui('ui.sub.buildTag', { buildWord: ui('ui.sub.buildWord'), build: CALC_BUILD });
    } else if (isVF()){
      if (el) el.textContent = pt('sub.vf');
    } else {
      if (el) el.textContent = pt('sub.gh');
    }
  }`
);

h = h.replace(
  /w\.textContent = '\u0421\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a \u043f\u043e\u0434\u043e\u043d\u043e\u0432 \u043d\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d \(pallet-cultivars\.js\)\. Откройте папку через локальный сервер, не двойным щелчком по HTML\.';/,
  "w.textContent = ui('ui.pal.loadWarn');"
);

h = h.replace(
  /return '<button type="button" class="cv-del" data-cv-del="' \+ id \+ '" title="\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0441\u043e\u0440\u0442" aria-label="\u0423\u0434\u0430\u043b\u0438\u0442\u044c">×<\/button>';/,
  "return '<button type=\"button\" class=\"cv-del\" data-cv-del=\"' + id + '\" title=\"' + ui('ui.cv.delTitle') + '\" aria-label=\"' + ui('ui.cv.delAria') + '\">×</button>';"
);

h = h.replace(
  /\(c\.multicut \? ' \u00b7 \u0441\u0440\u0435\u0437\u044b' : ''\)/g,
  "(c.multicut ? ui('ui.cv.multicutTag') : '')"
);

h = h.replace(
  /\(isActive \? '\u0422\u0435\u043a\u0443\u0449\u0430\u044f \u043a\u0443\u043b\u044c\u0442\u0443\u0440\u0430 \(линия жирная\)' : '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043d\u0430 \u0433\u0440\u0430\u0444\u0438\u043a\u0435'\)/,
  "(isActive ? ui('ui.cv.compareOn') : ui('ui.cv.compareOff'))"
);

h = h.replace(
  /const plSecShort = \{ baby: '\u0411\u0435\u0431\u0438-\u0437\u0435\u043b\u0435\u043d\u044c', flowers: '\u0426\u0432\u0435\u0442\u044b \u043f\u0438\u0449\u0435\u0432\u044b\u0435', adult: '\u0412\u0437\u0440\u043e\u0441\u043b\u044b\u0435 \/ \u0441\u0430\u043b\u0430\u0442\u044b' \};/,
  "const plSecShort = { baby: ui('ui.cv.sec.baby'), flowers: ui('ui.cv.sec.flowers'), adult: ui('ui.cv.sec.adult') };"
);

h = h.replace(
  /return avg \? round\(avg\) \+ '<span class="m-range">' \+ round\(v\) \+ ' \u0432 \u0441\u0440\u0435\u0434\u043d\u0435\u043c<\/span>'/,
  "return avg ? round(avg) + '<span class=\"m-range\">' + ui('ui.range.avg', { v: round(v) }) + '</span>'"
);

h = h.replace(
  /const u = cv && cv\.countUnit === '\u0448\u0442' \? '\u0448\u0442' : '\u0433';/g,
  "const u = cv && cv.countUnit === '\u0448\u0442' ? pm('u.pcs') : pm('unit.g');"
);
h = h.replace(
  /const u = cv\.countUnit === '\u0448\u0442' \? '\u0448\u0442' : '\u0433';/g,
  "const u = cv.countUnit === '\u0448\u0442' ? pm('u.pcs') : pm('unit.g');"
);

h = h.replace(
  /btn\.title = at \? 'Соответствует справочнику' : 'Привести к стандарту из справочника';/,
  "btn.title = at ? ui('ui.badge.atStd') : ui('ui.badge.toStd');"
);
h = h.replace(
  /locksTitle\.textContent = isPalletView\(\)\s*\n\s*\? 'Подставлять из справочника поддонов:'\s*\n\s*: 'Подставлять из справочника VF:';/,
  "locksTitle.textContent = isPalletView() ? ui('ui.vf.stdLocksPal') : ui('ui.vf.stdLocksVf');"
);

h = h.replace(
  /let txt = 'Рекомендуется <strong>' \+ range\.mid \+ ' сут<\/strong> \(допуск ±' \+ CUT_INTERVAL_SLACK \+ ': ' \+\s*range\.sliderMin \+ '–' \+ range\.sliderMax \+ '\)\. ';\s*if \(cv && cv\.cutIntervalStd[\s\S]*?hint\.innerHTML = txt;/,
  `let txt = ui('ui.cut.rec', { mid: range.mid, slack: CUT_INTERVAL_SLACK, min: range.sliderMin, max: range.sliderMax });
    if (cv && cv.cutIntervalStd && String(cv.cutIntervalStd) !== String(range.mid)){
      txt += ui('ui.cut.stdDiff', { std: cv.cutIntervalStd });
    }
    if (mods.delta === 0){
      txt += ui('ui.cut.nominal');
    } else if (mods.delta < 0){
      txt += ui('ui.cut.shorter', { delta: Math.abs(mods.delta), massPct: mods.massPct, canopyPct: mods.canopyPct });
    } else {
      txt += ui('ui.cut.longer', { delta: mods.delta, massPct: mods.massPct, canopyPct: mods.canopyPct });
    }
    hint.innerHTML = txt;`
);

h = h.replace(
  /hint\.innerHTML = 'Справочник: интервал <strong>' \+ \(cv\.cutIntervalStd \|\| cv\.cutNote \|\| cv\.cutInterval\) \+ '<\/strong> сут · ' \+\s*cv\.yieldPerCutStd \+ ' ' \+ u \+ '\/срез' \+\s*\(cv\.cutNote \? ' · ' \+ cv\.cutNote : ''\) \+ '\. <em>Масса срезов без деградации по номеру среза\.<\/em>' \+\s*\(\(isVF\(\) \|\| isPalletView\(\)\) \? '<br>Срезок в месяц \(ползунок\): <strong>' \+ r1\(ms\.cutsPerMonth\) \+ '<\/strong> · срезов за период вегетации: <strong>' \+ ms\.cutsInCycle \+ '<\/strong> · до замены: <strong>' \+ r1\(ms\.monthsToReplace\) \+ ' мес<\/strong>\.' : ''\);/,
  `hint.innerHTML = ui('ui.mc.sheetHint', {
          interval: cv.cutIntervalStd || cv.cutNote || cv.cutInterval,
          yield: cv.yieldPerCutStd, unit: u, perCut: ui('ui.cv.perCut'),
          note: cv.cutNote ? ' · ' + cv.cutNote : ''
        }) + ((isVF() || isPalletView()) ? ui('ui.mc.sheetStats', {
          cpm: r1(ms.cutsPerMonth), cycle: ms.cutsInCycle, months: r1(ms.monthsToReplace)
        }) : '');`
);

h = h.replace(
  /html \+= '<motion\.motion\.div class="cv-group-h">Мои сорта<\/div>';/,
  "html += '<motion.div class=\"cv-group-h\">' + ui('ui.cv.myCultivars') + '</div>';"
);
// fix typo if previous bad patch
h = h.replace(
  /html \+= '<div class="cv-group-h">Мои сорта<\/motion\.div>';/,
  "html += '<div class=\"cv-group-h\">' + ui('ui.cv.myCultivars') + '</div>';"
);
h = h.replace(
  /html \+= '<motion\.div class="cv-group-h">Мои сорта<\/div>';/,
  "html += '<div class=\"cv-group-h\">' + ui('ui.cv.myCultivars') + '</motion.div>';"
);
h = h.replace(
  /html \+= '<div class="cv-group-h">Мои сорта<\/motion\.motion\.motion\.div>';/,
  "html += '<div class=\"cv-group-h\">' + ui('ui.cv.myCultivars') + '</div>';"
);
h = h.replace(
  /html \+= '<div class="cv-group-h">Мои сорта<\/motion\.div>';/,
  "html += '<div class=\"cv-group-h\">' + ui('ui.cv.myCultivars') + '</div>';"
);
h = h.replace(
  /html \+= '<div class="cv-group-h">Мои сорта<\/div>';/,
  "html += '<motion.div class=\"cv-group-h\">' + ui('ui.cv.myCultivars') + '</div>';"
);

h = h.replace(
  /if \(!id \|\| !confirm\('Удалить сорт «' \+ \(findCvById\(id\)\?\.name \|\| id\) \+ '»\?'\)\) return;/g,
  "if (!id || !confirm(ui('ui.cv.delConfirm', { name: findCvById(id)?.name || id }))) return;"
);

h = h.replace(
  /return lo \+ '–' \+ hi \+ unitHtml \+\s*'<span class="m-range">≈ ' \+ round\(v\) \+ ' в среднем<\/span>';/,
  "return lo + '–' + hi + unitHtml + '<span class=\"m-range\">' + ui('ui.range.avg', { v: round(v) }) + '</span>';"
);

h = h.replace(
  /{ key: 'manualCanopy', label: 'Шапка, мм', min: 20, max: 600, step: 1 },/,
  "{ key: 'manualCanopy', label: pt('std.gh.canopy') + ', ' + pm('unit.mm'), min: 20, max: 600, step: 1 },"
);
h = h.replace(
  /{ key: 'germination', label: 'Прорастание', min: 1, max: 21 },\s*\{ key: 'nursery', label: 'Рассада', min: 7, max: 28 },\s*\{ key: 'day', label: 'Дней до среза', min: 1, max: 70 },\s*\{ key: 'density', label: 'Плотность', min: 15, max: 220 },\s*\{ key: 'cutInterval', label: 'Интервал срезов', min: 5, max: 45 },\s*\{ key: 'manualCanopy', label: 'Шапка, мм', min: 20, max: 600, step: 1 },\s*\{ key: 'manualMass', label: 'Урожай за срез', min: 5, max: 500 },\s*\{ key: 'manualCutMass', label: 'Масса среза', min: 1, max: 500 }/,
  `{ key: 'germination', label: pt('std.gh.germination'), min: 1, max: 21 },
      { key: 'nursery', label: pt('std.gh.nursery'), min: 7, max: 28 },
      { key: 'day', label: pt('std.gh.day'), min: 1, max: 70 },
      { key: 'density', label: pt('std.gh.density'), min: 15, max: 220 },
      { key: 'cutInterval', label: pt('std.gh.cutInterval'), min: 5, max: 45 },
      { key: 'manualCanopy', label: pt('std.gh.canopy') + ', ' + pm('unit.mm'), min: 20, max: 600, step: 1 },
      { key: 'manualMass', label: ui('ui.vf.std.harvest'), min: 5, max: 500 },
      { key: 'manualCutMass', label: ui('ui.vf.std.cutMassField'), min: 1, max: 500 }`
);

fs.writeFileSync(htmlPath, h, 'utf8');
console.log('patched', BUILD);

