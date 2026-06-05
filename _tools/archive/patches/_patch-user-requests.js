const fs = require('fs');
const p = 'calculator-110x55_12.html';
let h = fs.readFileSync(p, 'utf8');
const D = 'motion.div'.replace('motion.', '');

function rep(a, b, label) {
  if (!h.includes(a)) { console.warn('MISS:', label); return false; }
  h = h.replace(a, b);
  console.log('OK:', label);
  return true;
}

rep('const CASSETTES_PER_PALLET = 3;', `const CASSETTES_PER_PALLET = 3;
  const CASSETTE_L_MM = 400;
  const CASSETTE_W_MM = 600;`, 'cassette constants');

rep(
  `    const cassetteL = PALLET_L_MM / cassettes;
    const cassetteW = PALLET_W_MM;`,
  `    const cassetteL = mount === 'lid' ? PALLET_L_MM : CASSETTE_L_MM;
    const cassetteW = mount === 'lid' ? PALLET_W_MM : CASSETTE_W_MM;`,
  'palletCellGeometry'
);

rep(
  'Стеллаж <strong>130×65 см</strong> на ярус. Поддон — модуль <strong>130×65 см</strong>. Длина и ширина зоны — только целое число поддонов. В режиме кассет: <strong>3 кассеты</strong> на поддон, в кассете <strong>9–54 ячеек</strong> (отверстия уже в кассете).',
  'Стеллаж <strong>130×65 см</strong> на ярус. Поддон <strong>130×65 см</strong>. Кассета <strong>400×600 мм</strong>, <strong>3 шт</strong> на поддон. В кассете или в крышке-крафте — <strong>9–54 отверстий</strong>.',
  'pallet hint'
);

rep('id="nch" min="2" max="20"', 'id="nch" min="1" max="20"', 'nch min');
rep('<span class="stage-lbl">К съёму</span>', '<span class="stage-lbl">Взрослая зелень</span>', 'stage full');
rep('<span class="stage-lbl">Стрелкование</span>', '<span class="stage-lbl">Стрелкование/перерост</span>', 'stage bolt');
rep(`    full: 'К съёму',\n    bolt: 'Стрелкование'`, `    full: 'Взрослая зелень',\n    bolt: 'Стрелкование/перерост'`, 'STAGE_LABELS');

rep(
  '<p class="kicker">Проточный канал 110 × 55 мм</p>\n    <h1 class="page-title">Калькулятор посадки 110×55 мм</h1>\n    <p class="page-sub" id="page-sub">Теплица (~41° с. ш.): салат и зелень, сезон и досветка. Плотность до 220 шт/м², габарит системы до 2×12 м.</p>',
  '<p class="kicker" id="page-kicker">Калькулятор посадки Daogreen</p>\n    <h1 class="page-title" id="page-title">Планирование посадки и урожая</h1>\n    <p class="page-sub" id="page-sub">Каналы 110×55, поддоны 130×65, вертикальные фермы и экономика — в одном инструменте.</p>',
  'header'
);

rep(
  '<strong>Daogreen</strong> — калькулятор для планирования посадки в проточных каналах.',
  '<strong>Daogreen</strong> — калькулятор планирования: проточные каналы, поддоны с кассетами, вертикальные фермы, экономика урожая.',
  'colophon'
);

rep(`      btn.title = at ? 'Соответствует справочнику' : 'Привести к стандарту из справочника';
      pStd[key] = at;`, `      btn.title = at ? 'Соответствует справочнику' : 'Привести к стандарту из справочника';`, 'pStd fix');

rep(
  `  function isVfFieldAtStandard(key, cv){
    cv = cv || getSheetCv();
    const std = getVfFieldStandard(cv, key);`,
  `  function isVfFieldAtStandard(key, cv){
    cv = cv || getSheetCv();
    const pStd = getPlantingStd();
    if (!pStd[key]) return false;
    const std = getVfFieldStandard(cv, key);`,
  'isVfFieldAtStandard'
);

if (!h.includes('function vfMulticutStats')) {
  h = h.replace('  function syncMulticutDetailUI(){', `  function vfMulticutStats(cv){
    cv = cv || getActiveCv();
    const interval = Math.max(1, effectiveCutInterval());
    const vegDays = isVF() ? vfEffectiveDay(cv) : state.day;
    const cutsPerMonth = 30 / interval;
    const cutsInCycle = Math.max(1, Math.floor(vegDays / interval));
    const monthsToReplace = vegDays / 30;
    return { cutsPerMonth, cutsInCycle, monthsToReplace, interval };
  }
  function syncMulticutDetailUI(){`);
}

rep(
  `        hint.innerHTML = 'Справочник: интервал <strong>' + (cv.cutIntervalStd || cv.cutNote || cv.cutInterval) + '</strong> сут · ' +
          cv.yieldPerCutStd + ' ' + u + '/срез · ' + cv.yieldPerSqmStd + ' ' + u + '/м² за цикл' +
          (cv.cutNote ? ' · ' + cv.cutNote : '') + '. <em>Масса срезов без деградации по номеру среза.</em>';`,
  `        const ms = vfMulticutStats(cv);
        hint.innerHTML = 'Справочник: интервал <strong>' + (cv.cutIntervalStd || cv.cutNote || cv.cutInterval) + '</strong> сут · ' +
          cv.yieldPerCutStd + ' ' + u + '/срез · ' + cv.yieldPerSqmStd + ' ' + u + '/м² за цикл' +
          (cv.cutNote ? ' · ' + cv.cutNote : '') + '. <em>Масса срезов без деградации по номеру среза.</em>' +
          (isVF() ? '<br>Срезок в месяц: <strong>' + r1(ms.cutsPerMonth) + '</strong> · срезов за цикл: <strong>' + ms.cutsInCycle + '</strong> · до замены растений: <strong>' + r1(ms.monthsToReplace) + ' мес</strong>.' : '');`,
  'multicut hint'
);

rep(
  `    const kicker = document.querySelector('.kicker');
    if (kicker) kicker.textContent = pallet ? 'Поддоны 130 × 65 см' : 'Проточный канал 110 × 55 мм';
    const title = document.querySelector('.page-title');
    if (title) title.textContent = pallet ? 'Калькулятор посадки · поддоны' : 'Калькулятор посадки 110×55 мм';`,
  `    const kicker = $('page-kicker') || document.querySelector('.kicker');
    if (kicker) kicker.textContent = pallet ? 'Поддоны 130 × 65 см' : (isVF() ? 'Вертикальная ферма · каналы 110×55' : 'Проточный канал 110 × 55 мм');
    const title = $('page-title') || document.querySelector('.page-title');
    if (title) title.textContent = pallet ? 'Калькулятор посадки · поддоны' : (isVF() ? 'Калькулятор посадки · VF' : 'Калькулятор посадки · каналы');`,
  'geom titles'
);

if (!h.includes('function vegContextLabel')) {
  h = h.replace(
    `  function isPalletView(){ return state.appView === 'pallets'; }`,
    `  function isPalletView(){ return state.appView === 'pallets'; }
  function vegContextLabel(short){
    if (isPalletView()) return short ? 'поддон' : 'на поддоне';
    if (isVF()) return short ? 'модуль' : 'в модуле';
    return short ? 'канал' : 'в канале';
  }
  function vegContextLabelCap(){
    if (isPalletView()) return 'На поддоне';
    if (isVF()) return 'В модуле';
    return 'В канале';
  }`
  );
}

rep(
  `    const geom = r.palletMode ? [
      { l: 'Длина зоны', v: (r.zoneLenMm / 1000).toFixed(1), u: 'м (' + r.alongLength + '×130 см)' },
      { l: 'Поддонов вдоль (130 см)', v: r.alongLength, u: 'шт' },
      { l: 'Поддонов поперёк (65 см)', v: r.acrossPallets, u: 'шт' },
      { l: 'Всего поддонов', v: r.totalPallets, u: 'шт' },
      { l: r.mountMode === 'lid' ? 'Отверстий на поддон' : 'Кассет × ячеек', v: r.mountMode === 'lid' ? r.cellsPerCassette : (r.cassettesPerPallet + '×' + r.cellsPerCassette), u: '' },
      { l: 'Растений на поддон', v: r.plantsPerPallet, u: 'шт' },
      { l: 'Шаг между ячейками', v: round(r.cellPitch), u: 'мм' },
      { l: '⌀ ячейки (ориентир)', v: round(r.cellD), u: 'мм' },
      ...(r.mountMode === 'cassette' ? [{ l: 'Длина кассеты на поддоне', v: round(r.cassettePitch), u: 'мм' }] : []),
      { l: 'Зазор между поддонами', v: state.extraB || 0, u: 'мм' }
    ]`,
  `    const geom = r.palletMode ? [
      { l: 'Длина зоны', v: (r.zoneLenMm / 1000).toFixed(1), u: 'м (' + r.alongLength + '×130 см)' },
      { l: 'Поддонов вдоль (130 см)', v: r.alongLength, u: 'шт' },
      { l: 'Поддонов поперёк (65 см)', v: r.acrossPallets, u: 'шт' },
      { l: 'Всего поддонов', v: r.totalPallets, u: 'шт' },
      ...(r.mountMode === 'cassette' ? [
        { l: 'Кассет на поддон', v: CASSETTES_PER_PALLET, u: 'шт (400×600 мм)' },
        { l: 'Отверстий в кассете', v: r.cellsPerCassette, u: 'шт' }
      ] : [
        { l: 'Отверстий в крышке (крафт)', v: r.cellsPerCassette, u: 'шт' }
      ]),
      { l: 'Растений на поддон', v: r.plantsPerPallet, u: 'шт' },
      { l: 'Шаг ячеек (ориентир)', v: round(r.cellPitch), u: 'мм' },
      { l: 'Зазор между поддонами', v: state.extraB || 0, u: 'мм' }
    ]`,
  'pallet geom'
);

rep(
  `      { l: 'Рекомендуемый съём', vHtml: withRange(r.tHarvestCh, dayRange, r.palletMode ? 'сут вегетации' : 'сут вегетации (канал)') }
    ];`,
  `      { l: 'Рекомендуемый съём', vHtml: withRange(r.tHarvestCh, dayRange, r.palletMode ? 'сут вегетации' : (isVF() ? 'сут в модуле' : 'сут вегетации (канал)')) },
      ...(isVF() && supportsMulticut(r.cv) && state.multicut ? (function(){
        const ms = vfMulticutStats(r.cv);
        return [
          { l: 'Срезок в месяц', v: r1(ms.cutsPerMonth), u: 'шт' },
          { l: 'Срезов за цикл', v: ms.cutsInCycle, u: 'шт' },
          { l: 'До замены растений', v: r1(ms.monthsToReplace), u: 'мес' }
        ];
      })() : [])
    ];`,
  'growth vf'
);

rep(
  `        for (let c = 0; c < nCas; c++){
          const cx0 = x + c * (pw / nCas), cw = pw / nCas;`,
  `        for (let c = 0; c < nCas; c++){
          const casW = (mount === 'cassette' ? CASSETTE_L_MM : pw) * sc;
          const cx0 = x + c * casW, cw = casW;`,
  'schema cas'
);

rep(
  `      { stage: 'Пересадка в канал', date: transplant, totalDay: state.germination + state.nursery, ch: '0' },`,
  `      { stage: isPalletView() ? 'Пересадка на поддон' : (isVF() ? 'Пересадка в модуль' : 'Пересадка в канал'), date: transplant, totalDay: state.germination + state.nursery, ch: '0' },`,
  'calendar'
);

rep(
  `      '<td class="cal-day">общий ' + row.totalDay + ' сут · вегетация в канале ' + row.ch + '</td>' +`,
  `      '<td class="cal-day">общий ' + row.totalDay + ' сут · вегетация ' + vegContextLabel() + ' ' + row.ch + '</td>' +`,
  'cal col'
);

const cutEmptyOld = "$('cut-schedule').innerHTML = '<" + "div style=\"color:var(--ink-faint);font-size:13px\">Нет срезов в допустимом окне — увеличьте сут в канале (вегетация) или интервал.</" + "motion.div>';".replace(/motion\.div/g, 'motion.div');
const cutEmptyNew = "$('cut-schedule').innerHTML = '<" + "div style=\"color:var(--ink-faint);font-size:13px\">Нет срезов в допустимом окне — увеличьте сут ' + vegContextLabel() + ' (вегетация) или интервал.</" + "div>';";
rep(cutEmptyOld.replace(/motion\.motion\.div/g, 'div'), cutEmptyNew, 'cut empty');

rep(
  `    html += '<tr><th>Срез</th><th>Сут в канале</th><th>Дата</th><th>' + massCol + '</th></tr>';`,
  `    html += '<tr><th>Срез</th><th>' + vegContextLabelCap() + '</th><th>Дата</th><th>' + massCol + '</th></tr>';`,
  'cut hdr'
);

rep(
  `      html += 'Суммарно в канале до дня <strong>' + lastDay + '</strong>.';`,
  `      html += 'Суммарно ' + vegContextLabel() + ' до дня <strong>' + lastDay + '</strong>.';`,
  'cut sum'
);

rep(
  `    svg += '<text x="' + (padL + dW/2) + '" y="' + (H - 8) + '" class="svg-axis-t" text-anchor="middle">сут вегетации в канале (прорастание ' + state.germination + ' + период вегетации ' + (state.nursery + state.day) + ')</text>';`,
  `    svg += '<text x="' + (padL + dW/2) + '" y="' + (H - 8) + '" class="svg-axis-t" text-anchor="middle">сут вегетации ' + vegContextLabel() + ' (прорастание ' + state.germination + ' + период вегетации ' + (state.nursery + state.day) + ')</text>';`,
  'chart axis'
);

rep(
  `      push('bad', 'bad', r.cv.name + ': ' + r.t_ch + ' сут вегетации' + (r.palletMode ? ' на поддоне' : ' в канале') + ' — фаза стрелкования`,
  `      push('bad', 'bad', r.cv.name + ': ' + r.t_ch + ' сут вегетации ' + vegContextLabel() + ' — фаза стрелкования/перероста`,
  'rec bolt'
);

rep(
  `      push('check', 'check', 'Текущий день близок к оптимуму съёма (' + round(r.tHarvestCh) + ' сут вегетации' + (r.palletMode ? ' на поддоне' : ' в канале') + '): прирост`,
  `      push('check', 'check', 'Текущий день близок к оптимуму съёма (' + round(r.tHarvestCh) + ' сут вегетации ' + vegContextLabel() + '): прирост`,
  'rec ok'
);

if (!h.includes('Экономика Daogreen')) {
  rep(
    `  function updatePageSub(){
    const el = $('page-sub');
    if (!el || state.appView === 'economics') return;`,
    `  function updatePageSub(){
    const el = $('page-sub');
    const kick = $('page-kicker') || document.querySelector('.kicker');
    const title = $('page-title') || document.querySelector('.page-title');
    if (state.appView === 'economics'){
      if (kick) kick.textContent = 'Экономика Daogreen';
      if (title) title.textContent = 'Экономика фермы';
      if (el) el.textContent = 'Доход, затраты на свет и расходники по культурам — отдельно от вкладки посадки.';
      return;
    }`,
    'econ sub'
  );
}

// pallet canopy metric label
rep(
  `      { l: r.palletMode ? 'Шаг между центрами ячеек' : 'Ближайшие центры отверстий', v: round(r.palletMode ? r.cellPitch : r.nearest), u: 'мм' },`,
  `      { l: r.palletMode ? 'Шаг ячеек (ориентир)' : 'Ближайшие центры отверстий', v: round(r.palletMode ? r.cellPitch : r.nearest), u: 'мм' },`,
  'canopy pitch'
);

// setAppView call updatePageSub on economics
if (!h.includes("if (view === 'economics') renderEconomics();") || h.includes('updatePageSub')) {
  rep(
    `    if (view === 'economics') renderEconomics();
  }`,
    `    if (view === 'economics'){ updatePageSub(); renderEconomics(); }
  }`,
    'setAppView econ sub'
  );
}

fs.writeFileSync(p, h);
console.log('written');
