/** Статические подписи UI (посадка + экономика) — ru/en */
(function(global){
  'use strict';

  var UIL = {
    ru: {
      'ui.facility': 'Среда выращивания',
      'ui.bridge.title': 'Экономика фермы',
      'ui.bridge.hint': '— перенос урожая и площади из посадки',
      'ui.bridge.open': 'Открыть экономику',
      'ui.bridge.import': 'Импорт из посадки',
      'ui.bio.section': 'Биологический разброс',
      'ui.bio.showRange': 'Показывать диапазон значений (а не одну цифру)',
      'ui.bio.hint': 'Разные семена в одной партии, неодинаковая рассада, микроклимат в разных точках теплицы — всё это даёт реальный разброс. Типичные значения: 8–10% при отработанной агротехнике и хороших семенах, 12–15% при обычных условиях, 18–20% если рассада неравномерная или генетика семян «гуляет». Применяется к массе (±N%), шапке (±N/2%), дню съёма (±N/8 сут).',
      'ui.bio.hintFarm': 'Разные семена, неодинаковая рассада, микроклимат на разных ярусах и в разных точках зала — всё это даёт реальный разброс. Типичные значения: 8–10% при отработанной агротехнике, 12–15% при обычных условиях, 18–20% при неравномерной рассаде. Применяется к массе или количеству (±N%), шапке (±N/2%), дню съёма (±N/8 сут).',
      'ui.chart.title': 'Кривая роста',
      'ui.chart.compare': 'Сравнить сорта на одном графике',
      'ui.chart.compareHint': 'Включите сравнение — на графике появятся кривые выбранных культур; жирная линия — текущая. Переключить текущую можно кнопками под графиком.',
      'ui.chart.pickSummary': 'Выберите культуры для линий на графике. Жирная линия — текущая.',
      'ui.chart.all': 'Все',
      'ui.chart.none': 'Снять',
      'ui.chart.onlyActive': 'Только текущая',
      'ui.chart.addActive': '+ Текущая',
      'ui.chart.legendMass': 'Масса, г',
      'ui.chart.legendCanopy': 'Шапка, мм',
      'ui.cal.title': 'Календарь посадки',
      'ui.cal.sowDate': 'Дата посева',
      'ui.mc.title': 'Многократный срез',
      'ui.mc.toggle': 'Многократный срез',
      'ui.mc.autoInterval': '→ Интервал из справочника',
      'ui.mc.ghHint': 'Теплица: число срезок и масса с 1 горшка на каждый срез',
      'ui.mc.cutsLabel': 'Срезок:',
      'ui.mc.manualCut': 'Задать вес одного среза вручную',
      'ui.mc.autoCutMass': '→ Вес среза из справочника',
      'ui.env.climate': 'Климат',
      'ui.veg.head': 'Период вегетации',
      'ui.mass.sheetHintVf': 'свернуть → стандарт вертикальной фермы',
      'ui.mass.sheetHintPal': 'свернуть → стандарт поддонов',
      'ui.grow.sheetHintVf': 'свернуть → подставить стандарты вертикальной фермы',
      'ui.grow.sheetHintPal': 'свернуть → подставить стандарты поддонов',
      'ui.sys.autoNch': '→ Максимум каналов в 2 м ширины',
      'ui.sys.twoRows': '2 ряда отверстий в канале (шахматный порядок)',
      'ui.sys.twoRowsNote': 'Два ряда в канале 110×55 мм: второй ряд сдвигается вдоль канала на долю шага a (ползунок «Сдвиг рядов»). Плотность до 220 шт/м².',
      'ui.pal.mount.cassette': '3 кассеты 600×400 мм',
      'ui.pal.mount.lid': 'Крышка-крафт 1300×650 мм',
      'ui.pal.plantsPrefix': 'На поддон:',
      'ui.pal.plantsSuffix': 'раст.',
      'ui.pal.tierHint': 'Высота стеллажа (ориентир):',
      'ui.pal.areaHint': 'посевная площадь:',
      'ui.pal.footprint': 'отпечаток',
      'ui.pal.tiers': 'яр.',
      'ui.pal.sysHint': 'Стеллаж 130×65 см на ярус. Поддон 130×65 см. Кассета 600×400 мм, 3 шт на поддон. В кассете или в крышке-крафт — 9–54 отверстий.',
      'ui.pal.sysHintTrayLot': 'Лотки на стеллаже <strong>130×65 см</strong>: <strong>{per} лотков на поддон</strong> (без кассет и крышек). Свет и климат — как в закрытом зале, целевой режим подставляется автоматически.',
      'ui.pal.formulaTrayLot': '{per} лотков на поддон',
      'ui.pal.prefixTray': 'На поддон:',
      'ui.pal.traysSuffix': 'лотков',
      'ui.grow.flowTrayLot': '<strong>Прорастание</strong> — отдельно (не входит в цикл). <strong>Дней до готовности/сбора</strong> — это полный цикл на полезной площади. Лотки: <strong>33 шт на поддон</strong>.',
      'ui.grow.trayHarvestDays': 'Дней до готовности/сбора',
      'ui.grow.channelDays': 'Дней роста до среза/готовности',
      'ui.veg.trayLotTotal': 'до готовности {day} {dUnit} · проращ. {germ} {dUnit} отдельно',
      'ui.env.idealLightClosed': 'Целевой свет (закрытое помещение)',
      'ui.env.idealLightNote': 'DLI и фотопериод заданы автоматически — настройка не требуется.',
      'ui.env.tempMoldHint': 'T {temp}°C — риск плесени',
      'ui.schema.trayLotTitle': '{per} лотков на поддон',
      'ui.schema.trayLotDensity': '{density} лотков/м²',
      'ui.scen.a': 'Сценарий A',
      'ui.scen.b': 'Сценарий B',
      'ui.scen.diff': 'Разница',
      'ui.scen.verdictBetter': 'Сценарий {better} выгоднее на {amount}/год.',
      'ui.scen.verdictDetail': 'Окупаемость дополнительных затрат и/или доход от увеличенного урожая в сценарии {better} выше, чем в {worse}.',
      'ui.scen.verdictEqual': 'Сценарии почти равноценны по прибыли (разница {amount}/год). Выбирайте по другим критериям: качество, стабильность, удобство.',
      'ui.light.on': 'Включена — {parts}',
      'ui.light.onEnough': 'Включена — естественного света и фотопериода достаточно',
      'ui.light.off': 'Выключена — только естественный свет',
      'ui.lightB.on': 'Включена (топ-ап до {dli} моль, {h} ч)',
      'ui.lightB.off': 'Выключена',
      'ui.light.none': 'без',
      'ui.env.light': 'Свет:',
      'ui.env.lightLamps': 'Свет (лампы):',
      'ui.env.natural': 'естественный',
      'ui.env.growthRate': 'Скорость роста:',
      'ui.env.temp': 'Темп.',
      'ui.env.cultOpt': 'оптимум сорта',
      'ui.env.noSupp': 'досветка не требуется',
      'ui.env.noSuppNeed': 'досветка не нужна',
      'ui.env.lowLight': 'мало света для финиша!',
      'ui.env.daySupp': '+ день',
      'ui.env.eveSupp': '+ вечер',
      'ui.env.total': 'итого',
      'ui.env.eff': 'КПД',
      'ui.env.boltEarly': 'стрелк. ранее на',
      'ui.env.boltMinus': 'стрелк. −',
      'ui.env.kwhDay': 'кВт·ч/м²·сут',
      'ui.env.natLine': 'естественный <strong>{nat}</strong> {mol} · {ph} {hUnit}',
      'ui.env.dayPill': '{day} {val} {mol}',
      'ui.env.evePill': '{eve} {h} ч ({val} {mol})',
      'ui.env.totalLine': 'итого <strong>{eff}</strong> {mol} · {ph} {hUnit}',
      'ui.env.ledPill': 'LED {eff} µmol/Дж',
      'ui.env.kwhApprox': '≈ {val} {unit}',
      'ui.env.rhTopt': 'RH {rh}% · T<sub>opt</sub> {t}°C',
      'ui.unit.umolSq': 'µmol/м²·с',
      'ui.pal.formulaLid': '{cells} отв. на поддон',
      'ui.pal.formulaCas': '3×{cells} в кассетах',
      'ui.pal.prefixLid': 'На поддон (крышка-крафт):',
      'ui.cv.title': 'Новый сорт',
      'ui.cv.name': 'Название',
      'ui.cv.placeholder': 'Например, Руккола VF-12',
      'ui.cv.section': 'Секция (VF)',
      'ui.cv.copy': 'Скопировать параметры из «{name}»',
      'ui.cv.cancel': 'Отмена',
      'ui.cv.add': 'Добавить',
      'ui.cv.sec.baby': 'Беби-зелень',
      'ui.cv.sec.flowers': 'Цветы пищевые',
      'ui.cv.sec.adult': 'Взрослые / салаты',
      'ui.projCompare.title': 'Сравнение проектов',
      'ui.projCompare.lead': 'Выберите два файла проекта (.json) или «текущий» как проект A.',
      'ui.projCompare.run': 'Сравнить',
      'ui.projCompare.close': 'Закрыть',
      'ui.projCompare.loading': 'Загрузка…',
      'ui.projCompare.confirmA': 'Проект A — текущий расчёт в браузере?\n\nOK = да, Отмена = выбрать файл A',
      'ui.projCompare.pickA': 'Выберите файл проекта A…',
      'ui.projCompare.pickB': 'Выберите файл проекта B…',
      'ui.projCompare.cancelled': 'Отменено.',
      'ui.projCompare.error': 'Ошибка: {msg}',
      'ui.projCompare.current': 'Текущий',
      'ui.projCompare.now': 'сейчас',
      'ui.projCompare.metric': 'Показатель',
      'ui.projCompare.delta': 'Δ (B−A)',
      'ui.projCompare.buildMeta': 'A: сборка {buildA}, {dateA}<br>B: сборка {buildB}, {dateB}',
      'ui.projCompare.noState': 'Нет поля state',
      'ui.projCompare.readFail': 'Не удалось прочитать файл',
      'ui.pwa.title': 'Установка на телефон',
      'ui.pwa.lead': 'Нажмите «QR» в шапке. Отсканируйте код или скопируйте ссылку. На телефоне в Chrome/Safari: «Установить приложение» / «На экран Домой».',
      'ui.pwa.close': 'Закрыть',
      'ui.pwa.copy': 'Копировать ссылку',
      'ui.pwa.lanLabel': 'Ссылка для телефона в той же Wi‑Fi',
      'ui.pwa.warnFile': 'Сейчас страница открыта как файл (file://). QR для телефона не сработает. Запустите start-server.bat и откройте http://localhost:8080/… — ниже можно вписать адрес ПК в Wi‑Fi (например http://192.168.1.5:8080/calculator-110x55_12.html).',
      'ui.pwa.warnLocalhost': 'localhost с телефона не откроется. Узнайте IP компьютера в Wi‑Fi (ipconfig) и введите ссылку ниже, затем обновите QR.',
      'ui.pwa.warnHttp': 'Для установки PWA на телефоне нужен HTTPS. HTTP подойдёт только для проверки в локальной сети.',
      'ui.compare.onChart': 'На графике:',
      'ui.compare.of': 'из',
      'ui.compare.bold': 'Жирная линия — текущая культура.',
      'ui.compare.summary': 'В сравнении: {n} из {total}. Колонка «{active}» — текущий сорт. Нажмите чип, чтобы добавить или убрать.',
      'cvCompare.title': 'Сравнение сортов',
      'cvCompare.intro': 'График и таблица при одинаковых настройках (свет, температура, плотность, срок). Жирная линия — текущий сорт.',
      'cvCompare.introUnified': 'График и таблица при одинаковых настройках (свет, температура, плотность, срок). Жирная линия — текущий сорт.',
      'cvCompare.tabChart': 'График',
      'cvCompare.tabTable': 'Таблица',
      'cvCompare.toggle': 'Сравнить сорта',
      'cvCompare.tableTitle': 'Показатели',
      'cvCompare.row.mass': 'Масса среза',
      'cvCompare.row.canopy': 'Шапка',
      'cvCompare.row.harvestDay': 'День среза (канал)',
      'cvCompare.row.cycle': 'Цикл, сут',
      'cvCompare.row.kgSqmYear': 'Урожай, кг/м²·год',
      'cvCompare.row.kgSqmCycle': 'Урожай, кг/м²·цикл',
      'cvCompare.row.rhoA': 'Плотность',
      'cvCompare.row.leafGap': 'Зазор листьев',
      'cvCompare.row.cyclesYear': 'Циклов в год',
      'cvCompare.row.yieldMonth': 'Урожай, кг/м²·мес',
      'cvCompare.row.cutsMonth': 'Срезов в месяц',
      'cvCompare.row.farmKgMonth': 'Урожай фермы, кг/мес',
      'cvCompare.row.farmPcsMonth': 'Урожай фермы, шт/мес',
      'cvCompare.row.farmPcsYear': 'Урожай фермы, шт/год',
      'cvCompare.row.farmKgYear': 'Урожай фермы, кг/год',
      'cvCompare.row.rhoRec': 'Рекоменд. плотность',
      'cvCompare.showRange': 'Показать погрешность',
      'cvCompare.errorPct': 'Погрешность',
      'ui.unit.m': 'м',
      'ui.unit.pcsSqm': 'шт/м²',
      'ui.unit.umol': 'µmol/Дж',
      'ui.unit.mol': 'моль',
      'ui.unit.hDay': 'ч/сут',
      'ui.unit.degC': '°C',
      'ui.econ.sensitivity': 'Сценарии «что если»',
      'ui.econ.payback': 'Окупаемость и cash-flow',
      'ui.econ.equipHint': 'Сумма участвует в себестоимости через амортизацию — укажите срок в общих параметрах.',
      'ui.econ.equipTotalHint': 'Оборудование + подготовка помещения (разово)',
      'ui.econ.presetBar': 'Шаблон фермы:',
      'ui.cut.rec': 'Рекомендуется <strong>{mid}</strong> {dUnit} (допуск ±{slack}: {min}–{max}). ',
      'ui.cut.stdDiff': ' В справочнике <strong>{std}</strong> {dUnit}.',
      'ui.cut.nominal': ' На выбранном интервале урожай и сроки соответствуют рекомендации.',
      'ui.cut.shorter': ' Короче на {delta} {dUnit}: масса {massPct}%, шапка {canopyPct}%.',
      'ui.cut.longer': ' Длиннее на {delta} {dUnit}: масса {massPct}%, шапка {canopyPct}%.',
      'ui.badge.atStd': 'Соответствует справочнику',
      'ui.badge.toStd': 'Привести к стандарту из справочника',
      'ui.vf.stdLocksPal': 'Подставлять из справочника поддонов:',
      'ui.vf.stdLocksVf': 'Подставлять из справочника вертикальной фермы:',
      'ui.mc.sheetHint': 'Справочник: интервал <strong>{interval}</strong> {dUnit} · {yield} {unit}{perCut}{note}. <em>Масса срезов без деградации по номеру среза.</em>',
      'ui.mc.sheetStats': '<br>Срезок в месяц (ползунок): <strong>{cpm}</strong> · срезов за период вегетации: <strong>{cycle}</strong> · до замены: <strong>{months} мес</strong>.',
      'ui.cv.myCultivars': 'Мои сорта',
      'scen.row.cultivar': 'Сорт',
      'scen.row.dliLamps': 'DLI ламп, моль',
      'scen.row.photo': 'Фотопериод, ч',
      'scen.row.month': 'Месяц',
      'scen.row.dliNat': 'DLI естественный, моль',
      'scen.row.supp': 'Досветка',
      'scen.row.temp': 'Температура, °C',
      'scen.row.growth': 'Скорость роста, ×',
      'scen.row.mass': 'Масса кочана, г',
      'scen.row.canopy': 'Диаметр шапки, мм',
      'scen.row.cycle': 'Цикл от посева, сут',
      'scen.row.cyclesYear': 'Циклов в год',
      'scen.row.kgSqmYear': 'кг/м² в год',
      'scen.row.kgYearSys': 'кг/год со всей системы',
      'scen.row.revenue': 'Выручка/год',
      'scen.row.elec': 'Электричество/год',
      'scen.row.profit': 'Прибыль/год'
    },
    en: {
      'ui.facility': 'Growing environment',
      'ui.bridge.title': 'Farm economics',
      'ui.bridge.hint': '— import yield and area from planting',
      'ui.bridge.open': 'Open economics',
      'ui.bridge.import': 'Import from planting',
      'ui.bio.section': 'Biological variation',
      'ui.bio.showRange': 'Show value ranges (not a single number)',
      'ui.bio.hint': 'Seed lot variation, uneven seedlings, and microclimate across the bay all add real spread. Typical: 8–10% with tight SOP and good seed; 12–15% under normal conditions; 18–20% with uneven seedlings or variable genetics. Applied to mass (±N%), canopy (±N/2%), harvest day (±N/8 d).',
      'ui.bio.hintFarm': 'Seed lot variation, uneven seedlings, and tier-to-tier microclimate add real spread. Typical: 8–10% with tight SOP; 12–15% under normal conditions; 18–20% with uneven seedlings. Applied to mass or count (±N%), canopy (±N/2%), harvest day (±N/8 d).',
      'ui.chart.title': 'Growth curve',
      'ui.chart.compare': 'Compare cultivars on one chart',
      'ui.chart.compareHint': 'Turn on compare to plot selected cultivars; the bold line is the active one. Switch active cultivar with the pills below the chart.',
      'ui.chart.pickSummary': 'Pick crops for chart lines. Bold line — active cultivar.',
      'ui.chart.all': 'All',
      'ui.chart.none': 'Clear',
      'ui.chart.onlyActive': 'Active only',
      'ui.chart.addActive': '+ Active',
      'ui.chart.legendMass': 'Mass, g',
      'ui.chart.legendCanopy': 'Canopy, mm',
      'ui.cal.title': 'Planting calendar',
      'ui.cal.sowDate': 'Sowing date',
      'ui.mc.title': 'Multiple harvests',
      'ui.mc.toggle': 'Multiple harvests',
      'ui.mc.autoInterval': '→ Interval from catalog',
      'ui.mc.ghHint': 'Greenhouse: cut count and mass per pot per cut',
      'ui.mc.cutsLabel': 'Cuts:',
      'ui.mc.manualCut': 'Set mass per cut manually',
      'ui.mc.autoCutMass': '→ Cut mass from catalog',
      'ui.env.climate': 'Climate',
      'ui.veg.head': 'Vegetative period',
      'ui.mass.sheetHintVf': 'collapse → vertical farm standard',
      'ui.mass.sheetHintPal': 'collapse → pallet standard',
      'ui.grow.sheetHintVf': 'collapse → apply vertical farm standards',
      'ui.grow.sheetHintPal': 'collapse → apply pallet standards',
      'ui.sys.autoNch': '→ Max channels in 2 m width',
      'ui.sys.twoRows': '2 hole rows in channel (staggered)',
      'ui.sys.twoRowsNote': 'Two rows in 110×55 mm channel: second row shifted along the channel by a fraction of pitch a (row offset slider). Density up to 220 pots/m².',
      'ui.pal.mount.cassette': '3 trays 600×400 mm',
      'ui.pal.mount.lid': 'Craft lid 1300×650 mm',
      'ui.pal.plantsPrefix': 'Per pallet:',
      'ui.pal.plantsSuffix': 'plants',
      'ui.pal.tierHint': 'Rack height (ref.):',
      'ui.pal.areaHint': 'growing area:',
      'ui.pal.footprint': 'footprint',
      'ui.pal.tiers': 'tiers',
      'ui.pal.sysHint': 'Rack 130×65 cm per tier. Pallet 130×65 cm. Tray 600×400 mm, 3 per pallet. In tray or craft lid — 9–54 holes.',
      'ui.pal.sysHintTrayLot': 'Trays on <strong>130×65 cm</strong> rack: <strong>{per} trays per pallet</strong> (no cassettes or lids). Light and climate use automatic closed-room defaults.',
      'ui.pal.formulaTrayLot': '{per} trays per pallet',
      'ui.pal.prefixTray': 'Per pallet:',
      'ui.pal.traysSuffix': 'trays',
      'ui.grow.flowTrayLot': '<strong>Germination</strong> is separate (not in the cycle). <strong>Days to harvest</strong> is the full useful-area cycle. Trays: <strong>33 per pallet</strong>.',
      'ui.grow.trayHarvestDays': 'Days to harvest',
      'ui.grow.channelDays': 'Days to cut/harvest',
      'ui.veg.trayLotTotal': 'to harvest {day} {dUnit} · germ. {germ} {dUnit} separate',
      'ui.env.idealLightClosed': 'Target light (closed room)',
      'ui.env.idealLightNote': 'DLI and photoperiod are set automatically — no adjustment needed.',
      'ui.env.tempMoldHint': 'T {temp}°C — mold risk',
      'ui.schema.trayLotTitle': '{per} trays per pallet',
      'ui.schema.trayLotDensity': '{density} trays/m²',
      'ui.scen.a': 'Scenario A',
      'ui.scen.b': 'Scenario B',
      'ui.scen.diff': 'Difference',
      'ui.scen.verdictBetter': 'Scenario {better} is more profitable by {amount}/year.',
      'ui.scen.verdictDetail': 'Payback of extra costs and/or yield upside in scenario {better} beats {worse}.',
      'ui.scen.verdictEqual': 'Scenarios are close in profit (difference {amount}/year). Choose by quality, stability, or operations.',
      'ui.light.on': 'On — {parts}',
      'ui.light.onEnough': 'On — natural light and photoperiod are sufficient',
      'ui.light.off': 'Off — natural light only',
      'ui.lightB.on': 'On (top-up to {dli} mol, {h} h)',
      'ui.lightB.off': 'Off',
      'ui.light.none': 'none',
      'ui.env.light': 'Light:',
      'ui.env.lightLamps': 'Light (lamps):',
      'ui.env.natural': 'natural',
      'ui.env.growthRate': 'Growth rate:',
      'ui.env.temp': 'Temp.',
      'ui.env.cultOpt': 'cultivar optimum',
      'ui.env.noSupp': 'no supplemental needed',
      'ui.env.noSuppNeed': 'supplemental not needed',
      'ui.env.lowLight': 'too little light for finish!',
      'ui.env.daySupp': '+ day',
      'ui.env.eveSupp': '+ evening',
      'ui.env.total': 'total',
      'ui.env.eff': 'efficacy',
      'ui.env.boltEarly': 'bolting earlier by',
      'ui.env.boltMinus': 'bolting −',
      'ui.env.kwhDay': 'kWh/m²·d',
      'ui.env.natLine': 'natural <strong>{nat}</strong> {mol} · {ph} {hUnit}',
      'ui.env.dayPill': '{day} {val} {mol}',
      'ui.env.evePill': '{eve} {h} h ({val} {mol})',
      'ui.env.totalLine': 'total <strong>{eff}</strong> {mol} · {ph} {hUnit}',
      'ui.env.ledPill': 'LED {eff} µmol/J',
      'ui.env.kwhApprox': '≈ {val} {unit}',
      'ui.env.rhTopt': 'RH {rh}% · T<sub>opt</sub> {t}°C',
      'ui.unit.umolSq': 'µmol/m²·s',
      'ui.pal.formulaLid': '{cells} holes/pallet',
      'ui.pal.formulaCas': '3×{cells} in trays',
      'ui.pal.prefixLid': 'Per pallet (kraft lid):',
      'ui.cv.title': 'New cultivar',
      'ui.cv.name': 'Name',
      'ui.cv.placeholder': 'e.g. Arugula VF-12',
      'ui.cv.section': 'Section (VF)',
      'ui.cv.copy': 'Copy parameters from «{name}»',
      'ui.cv.cancel': 'Cancel',
      'ui.cv.add': 'Add',
      'ui.cv.sec.baby': 'Baby greens',
      'ui.cv.sec.flowers': 'Edible flowers',
      'ui.cv.sec.adult': 'Adult / head lettuce',
      'ui.projCompare.title': 'Compare projects',
      'ui.projCompare.lead': 'Pick two project files (.json) or use the current calc as project A.',
      'ui.projCompare.run': 'Compare',
      'ui.projCompare.close': 'Close',
      'ui.projCompare.loading': 'Loading…',
      'ui.projCompare.confirmA': 'Project A — current calculation in browser?\n\nOK = yes, Cancel = pick file A',
      'ui.projCompare.pickA': 'Pick project file A…',
      'ui.projCompare.pickB': 'Pick project file B…',
      'ui.projCompare.cancelled': 'Cancelled.',
      'ui.projCompare.error': 'Error: {msg}',
      'ui.projCompare.current': 'Current',
      'ui.projCompare.now': 'now',
      'ui.projCompare.metric': 'Metric',
      'ui.projCompare.delta': 'Δ (B−A)',
      'ui.projCompare.buildMeta': 'A: build {buildA}, {dateA}<br>B: build {buildB}, {dateB}',
      'ui.projCompare.noState': 'Missing state field',
      'ui.projCompare.readFail': 'Could not read file',
      'ui.pwa.title': 'Install on phone',
      'ui.pwa.lead': 'Tap “QR” in the header. Scan the code or copy the link. On your phone in Chrome/Safari: “Install app” / “Add to Home Screen”.',
      'ui.pwa.close': 'Close',
      'ui.pwa.copy': 'Copy link',
      'ui.pwa.lanLabel': 'Link for phone on the same Wi‑Fi',
      'ui.pwa.warnFile': 'The page is opened as a file (file://). QR will not work on a phone. Run start-server.bat and open http://localhost:8080/… — or enter your PC’s Wi‑Fi URL below (e.g. http://192.168.1.5:8080/calculator-110x55_12.html).',
      'ui.pwa.warnLocalhost': 'localhost won’t open from your phone. Find your PC’s Wi‑Fi IP (ipconfig), enter the URL below, then refresh the QR.',
      'ui.pwa.warnHttp': 'Phone PWA install needs HTTPS. HTTP is only for testing on your local network.',
      'ui.compare.onChart': 'On chart:',
      'ui.compare.of': 'of',
      'ui.compare.bold': 'Bold line — active cultivar.',
      'ui.compare.summary': 'Comparing: {n} of {total}. Column «{active}» is the active cultivar. Click a chip to add or remove.',
      'cvCompare.title': 'Cultivar comparison',
      'cvCompare.intro': 'Chart and table under the same settings (light, temperature, density, timing). Bold line — active cultivar.',
      'cvCompare.introUnified': 'Chart and table under the same settings (light, temperature, density, timing). Bold line — active cultivar.',
      'cvCompare.tabChart': 'Chart',
      'cvCompare.tabTable': 'Table',
      'cvCompare.toggle': 'Compare cultivars',
      'cvCompare.tableTitle': 'Metrics',
      'cvCompare.row.mass': 'Cut mass',
      'cvCompare.row.canopy': 'Canopy',
      'cvCompare.row.harvestDay': 'Harvest day (channel)',
      'cvCompare.row.cycle': 'Cycle, days',
      'cvCompare.row.kgSqmYear': 'Yield, kg/m²·year',
      'cvCompare.row.kgSqmCycle': 'Yield, kg/m²·cycle',
      'cvCompare.row.rhoA': 'Density',
      'cvCompare.row.leafGap': 'Leaf gap',
      'cvCompare.row.cyclesYear': 'Cycles per year',
      'cvCompare.row.yieldMonth': 'Yield, kg/m²·month',
      'cvCompare.row.cutsMonth': 'Cuts per month',
      'cvCompare.row.farmKgMonth': 'Farm yield, kg/mo',
      'cvCompare.row.farmPcsMonth': 'Farm yield, pcs/mo',
      'cvCompare.row.farmKgYear': 'Farm yield, kg/yr',
      'cvCompare.row.farmPcsYear': 'Farm yield, pcs/yr',
      'cvCompare.row.rhoRec': 'Recommended density',
      'cvCompare.showRange': 'Show margin',
      'cvCompare.errorPct': 'Margin',
      'ui.unit.m': 'm',
      'ui.unit.pcsSqm': 'pcs/m²',
      'ui.unit.umol': 'µmol/J',
      'ui.unit.mol': 'mol',
      'ui.unit.hDay': 'h/d',
      'ui.unit.degC': '°C',
      'ui.econ.sensitivity': 'What-if scenarios',
      'ui.econ.payback': 'Payback & cash flow',
      'ui.econ.equipHint': 'Amount is amortized into unit cost — set period in general parameters.',
      'ui.econ.equipTotalHint': 'Equipment + facility prep (one-time)',
      'ui.econ.presetBar': 'Farm template:',
      'ui.cut.rec': 'Recommended <strong>{mid}</strong> {dUnit} (tolerance ±{slack}: {min}–{max}). ',
      'ui.cut.stdDiff': ' Catalog standard <strong>{std}</strong> {dUnit}.',
      'ui.cut.nominal': ' At this interval, yield timing matches the recommendation.',
      'ui.cut.shorter': ' Shorter by {delta} {dUnit}: mass {massPct}%, canopy {canopyPct}%.',
      'ui.cut.longer': ' Longer by {delta} {dUnit}: mass {massPct}%, canopy {canopyPct}%.',
      'ui.badge.atStd': 'Matches catalog',
      'ui.badge.toStd': 'Apply catalog standard',
      'ui.vf.stdLocksPal': 'Use pallet catalog for:',
      'ui.vf.stdLocksVf': 'Use vertical farm catalog for:',
      'ui.mc.sheetHint': 'Catalog: interval <strong>{interval}</strong> {dUnit} · {yield} {unit}{perCut}{note}. <em>Cut mass does not degrade by cut number.</em>',
      'ui.mc.sheetStats': '<br>Cuts per month (slider): <strong>{cpm}</strong> · cuts per veg. period: <strong>{cycle}</strong> · until replacement: <strong>{months} mo</strong>.',
      'ui.cv.myCultivars': 'My cultivars',
      'scen.row.cultivar': 'Cultivar',
      'scen.row.dliLamps': 'Lamp DLI, mol',
      'scen.row.photo': 'Photoperiod, h',
      'scen.row.month': 'Month',
      'scen.row.dliNat': 'Natural DLI, mol',
      'scen.row.supp': 'Supplemental',
      'scen.row.temp': 'Temperature, °C',
      'scen.row.growth': 'Growth rate, ×',
      'scen.row.mass': 'Head mass, g',
      'scen.row.canopy': 'Canopy diameter, mm',
      'scen.row.cycle': 'Cycle from sowing, d',
      'scen.row.cyclesYear': 'Cycles per year',
      'scen.row.kgSqmYear': 'kg/m² per year',
      'scen.row.kgYearSys': 'kg/year whole system',
      'scen.row.revenue': 'Revenue/year',
      'scen.row.elec': 'Electricity/year',
      'scen.row.profit': 'Profit/year'
    }
  };

  (function mergePlantDynamic(){
    var ex = global.I18N_PLANT_DYNAMIC;
    if (!ex) return;
    ['ru', 'en'].forEach(function(loc){
      if (!ex[loc]) return;
      Object.keys(ex[loc]).forEach(function(k){ UIL[loc][k] = ex[loc][k]; });
    });
  })();

  function uiT(key, vars){
    var loc = global.DG_getLocale ? global.DG_getLocale() : 'ru';
    var bag = UIL[loc] || UIL.ru;
    var s = bag[key] != null ? bag[key] : (UIL.ru[key] || key);
    if (vars){
      Object.keys(vars).forEach(function(k){
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return s;
  }

  function setTxt(sel, key){
    var el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el) el.textContent = uiT(key);
  }

  function setHtml(sel, key){
    var el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el) el.innerHTML = uiT(key);
  }

  function applyUiI18n(){
    var bridge = document.getElementById('planting-econ-bridge');
    if (bridge){
      var strong = bridge.querySelector('strong');
      var span = bridge.querySelector('span');
      if (strong) strong.textContent = uiT('ui.bridge.title');
      if (span) span.textContent = uiT('ui.bridge.hint');
      setTxt('#btn-go-economics', 'ui.bridge.open');
      setTxt('#btn-import-econ-quick', 'ui.bridge.import');
    }
    setTxt('.facility-env-label', 'ui.facility');
    var fGreen = document.querySelector('.facility-btn[data-facility="greenhouse"]');
    var fVert = document.querySelector('.facility-btn[data-facility="vertical"]');
    if (fGreen && global.DG_t) fGreen.textContent = global.DG_t('facility.greenhouse');
    if (fVert && global.DG_t) fVert.textContent = global.DG_t('facility.vertical');

    setTxt('#block-env-climate .collapse-head > span:first-child', 'ui.env.climate');
    setTxt('section.panel > .section-h', 'ui.bio.section');
    document.querySelectorAll('section.panel > .section-h').forEach(function(h){
      if (h.textContent.indexOf('Биологический') >= 0 || h.textContent.indexOf('Biological') >= 0) h.textContent = uiT('ui.bio.section');
    });
    var bioPanel = document.querySelector('#view-planting section.panel');
    document.querySelectorAll('#view-planting .toggle-label').forEach(function(el){
      var t = el.textContent.trim();
      if (t.indexOf('диапазон') >= 0 || t.indexOf('range') >= 0) el.textContent = uiT('ui.bio.showRange');
      if (t.indexOf('Сравнить сорта') >= 0 || t.indexOf('Compare cultivar') >= 0) el.textContent = uiT('ui.chart.compare');
      if (t === 'Многократный срез' || t === 'Multiple harvests') el.textContent = uiT('ui.mc.toggle');
      if (t.indexOf('вес одного среза') >= 0 || t.indexOf('mass per cut') >= 0) el.textContent = uiT('ui.mc.manualCut');
      if (t.indexOf('2 ряда') >= 0 || t.indexOf('2 hole rows') >= 0) el.textContent = uiT('ui.sys.twoRows');
    });
    var bioHint = document.querySelector('#view-planting section.panel div[style*="line-height:1.55"]');
    if (bioHint && bioHint.textContent.indexOf('семена') >= 0) bioHint.textContent = uiT('ui.bio.hint');

    setTxt('#block-panel-growth .collapse-head > span:first-child', 'ui.chart.title');
    setTxt('#compare-pick-summary', 'ui.chart.pickSummary');
    setTxt('#compare-pick-all', 'ui.chart.all');
    setTxt('#compare-pick-none', 'ui.chart.none');
    setTxt('#compare-pick-active', 'ui.chart.onlyActive');
    setTxt('#compare-pick-add-active', 'ui.chart.addActive');
    var leg = document.querySelector('#chart-legend');
    if (leg){
      leg.innerHTML = '<span><span class="swatch mass"></span>' + uiT('ui.chart.legendMass') + '</span>' +
        '<span><span class="swatch canopy"></span>' + uiT('ui.chart.legendCanopy') + '</span>';
    }
    setTxt('#block-panel-multicut .multicut-cycle-head', 'ui.mc.title');
    setTxt('#auto-cut-interval', 'ui.mc.autoInterval');
    setTxt('#auto-cut-mass', 'ui.mc.autoCutMass');
    var ghMc = document.querySelector('#gh-cuts-block > p');
    if (ghMc) ghMc.textContent = uiT('ui.mc.ghHint');
    var cutsLbl = document.querySelector('#gh-cut-count-row span');
    if (cutsLbl) cutsLbl.textContent = uiT('ui.mc.cutsLabel');
    setTxt('#auto-nch', 'ui.sys.autoNch');
    var twoNote = document.getElementById('two-row-geom-note');
    if (twoNote) twoNote.innerHTML = uiT('ui.sys.twoRowsNote').replace('a', '<strong>a</strong>');
    var palHint = document.getElementById('pallet-sys-hint');
    if (palHint) palHint.innerHTML = uiT('ui.pal.sysHint');
    var palPre = document.getElementById('pallet-plants-prefix');
    if (palPre) palPre.textContent = uiT('ui.pal.plantsPrefix');
    document.querySelectorAll('.pallet-mount-btn[data-mount="cassette"]').forEach(function(b){ b.textContent = uiT('ui.pal.mount.cassette'); });
    document.querySelectorAll('.pallet-mount-btn[data-mount="lid"]').forEach(function(b){ b.textContent = uiT('ui.pal.mount.lid'); });
    /* collapse hints — режим подставляется в syncVfStdBadges */
    document.querySelectorAll('.veg-period-head').forEach(function(el){
      var tot = el.querySelector('.veg-period-total');
      var totHtml = tot ? tot.outerHTML : '';
      el.innerHTML = uiT('ui.veg.head') + ' ' + totHtml;
    });

    document.querySelectorAll('.econ-preset-btn[data-econ-preset]').forEach(function(btn){
      var id = btn.dataset.econPreset;
      if (global.DG_t) btn.textContent = global.DG_t('econ.preset.' + id) || btn.textContent;
    });

    var econ = document.getElementById('view-economics');
    if (econ){
      var sens = econ.querySelector('#econ-panel-sensitivity .section-h');
      if (sens) sens.textContent = uiT('ui.econ.sensitivity');
      var pay = econ.querySelector('#econ-panel-payback .section-h');
      if (pay) pay.textContent = uiT('ui.econ.payback');
      var eqHint = document.getElementById('econ-equipment-panel-hint');
      if (eqHint) eqHint.textContent = uiT('ui.econ.equipHint');
      var eqTotHint = document.getElementById('econ-equipment-total-hint');
      if (eqTotHint) eqTotHint.textContent = uiT('ui.econ.equipTotalHint');
      var eqToggle = document.querySelector('.econ-equip-panel-head .toggle-label');
      if (eqToggle && global.DG_t) eqToggle.textContent = global.DG_t('econ.equip.enable');
      var eqLabel = document.querySelector('.econ-equip-total-label');
      if (eqLabel && global.DG_t) eqLabel.textContent = global.DG_t('econ.equip.total');
    }

    var gt = function(k){ return global.DG_t ? global.DG_t(k) : k; };
    var pdfDlg = document.getElementById('pdf-export-dialog');
    if (pdfDlg){
      var pt = pdfDlg.querySelector('.pdf-export-title');
      var pl = pdfDlg.querySelector('.pdf-export-lead');
      if (pt) pt.textContent = gt('pdf.dialog.title');
      if (pl) pl.textContent = gt('pdf.dialog.lead');
      ['#pdf-preset-planting', '#pdf-preset-econ', '#pdf-preset-full', '#pdf-select-all', '#pdf-select-none'].forEach(function(sel, i){
        var el = document.querySelector(sel);
        var keys = ['pdf.preset.planting', 'pdf.preset.econ', 'pdf.preset.full', 'pdf.select.all', 'pdf.select.none'];
        if (el) el.textContent = gt(keys[i]);
      });
      var pdfCancel = pdfDlg.querySelector('[data-pdf-cancel]');
      if (pdfCancel) pdfCancel.textContent = gt('pdf.btn.cancel');
      var pdfGo = document.getElementById('pdf-export-go');
      if (pdfGo) pdfGo.textContent = gt('pdf.btn.download');
    }

    var cvDlg = document.getElementById('cv-add-dialog');
    if (cvDlg){
      var cvH = cvDlg.querySelector('h3');
      if (cvH) cvH.textContent = uiT('ui.cv.title');
      cvDlg.querySelectorAll('label').forEach(function(lab){
        var inp = lab.querySelector('input, select');
        if (!inp) return;
        if (inp.id === 'cv-add-name'){
          lab.childNodes[0].textContent = uiT('ui.cv.name') + '\n        ';
          inp.placeholder = uiT('ui.cv.placeholder');
        } else if (inp.id === 'cv-add-section'){
          lab.childNodes[0].textContent = uiT('ui.cv.section') + '\n        ';
          var opts = inp.querySelectorAll('option');
          if (opts[0]) opts[0].textContent = uiT('ui.cv.sec.baby');
          if (opts[1]) opts[1].textContent = uiT('ui.cv.sec.flowers');
          if (opts[2]) opts[2].textContent = uiT('ui.cv.sec.adult');
        }
      });
      var cvCopy = cvDlg.querySelector('#cv-add-copy + span, label.cv-add-check span');
      if (cvCopy){
        var tn = document.getElementById('cv-add-template-name');
        cvCopy.innerHTML = uiT('ui.cv.copy', { name: tn ? tn.textContent : '—' });
      }
      var cvCancel = document.getElementById('cv-add-cancel');
      if (cvCancel) cvCancel.textContent = uiT('ui.cv.cancel');
      var cvSubmit = cvDlg.querySelector('button[type="submit"]');
      if (cvSubmit) cvSubmit.textContent = uiT('ui.cv.add');
    }

    var cmpDlg = document.getElementById('project-compare-dialog');
    if (cmpDlg){
      var cmpT = cmpDlg.querySelector('.pdf-export-title');
      if (cmpT) cmpT.textContent = uiT('ui.projCompare.title');
      cmpDlg.querySelectorAll('[data-compare-cancel]').forEach(function(b){
        b.textContent = uiT('ui.projCompare.close');
      });
    }

    var pwaDlg = document.getElementById('pwa-qr-dialog');
    if (pwaDlg){
      var pwaT = pwaDlg.querySelector('.pdf-export-title');
      var pwaL = pwaDlg.querySelector('.pdf-export-lead');
      if (pwaT) pwaT.textContent = uiT('ui.pwa.title');
      if (pwaL) pwaL.textContent = uiT('ui.pwa.lead');
      pwaDlg.querySelectorAll('[data-pwa-qr-close]').forEach(function(b){
        b.textContent = uiT('ui.pwa.close');
      });
      var pwaCopy = document.getElementById('pwa-qr-copy');
      if (pwaCopy) pwaCopy.textContent = uiT('ui.pwa.copy');
      var pwaLan = document.getElementById('pwa-qr-lan-label');
      if (pwaLan) pwaLan.textContent = uiT('ui.pwa.lanLabel');
    }

    var col = document.querySelector('footer.colophon');
    if (col){
      var kids = col.children;
      if (kids[0]) kids[0].innerHTML = uiT('ui.colophon.growth');
      if (kids[2]) kids[2].innerHTML = uiT('ui.colophon.temp');
      if (kids[3]) kids[3].innerHTML = uiT('ui.colophon.shading');
      if (kids[4]) kids[4].innerHTML = uiT('ui.colophon.conditions');
      if (kids[5]) kids[5].innerHTML = uiT('ui.colophon.daogreen');
      var warn = col.querySelector('.warn-note');
      if (warn) warn.innerHTML = uiT('ui.colophon.bioWarn');
    }

    if (typeof global.DG_applyPlantingI18n === 'function') global.DG_applyPlantingI18n();
    if (typeof global.DG_applyDomI18n === 'function') global.DG_applyDomI18n();
  }

  global.DG_uiT = uiT;
  global.DG_applyUiI18n = applyUiI18n;
})(typeof window !== 'undefined' ? window : this);
