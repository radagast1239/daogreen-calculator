/** Переводы вкладки «Посадка» (ru/en) */
(function(global){
  'use strict';

  var P = {
    ru: {
      'cultivars.title': 'Культуры',
      'cultivars.add': '+ Добавить свой сорт',
      'cultivars.addHint': 'Копия параметров текущего сорта · сохраняется в браузере',
      'cycle.title': 'Параметры цикла',
      'grow.title': 'Сроки цикла',
      'grow.sheetHintVf': 'свернуть → подставить стандарты вертикальной фермы',
      'grow.sheetHintPal': 'свернуть → подставить стандарты поддонов',
      'grow.flow': 'Прорастание, затем период вегетации — рассада и выращивание (канал, поддон с кассетами или вертикальная ферма).',
      'mass.sheetHintVf': 'свернуть → стандарт вертикальной фермы',
      'mass.sheetHintPal': 'свернуть → стандарт поддонов',
      'germination': 'Время прорастания',
      'nursery': 'Рассада',
      'grow.nurseryYieldHint': 'В общий урожай с м² / с площади участка не входит — рассада в отдельном отделении. Влияет на модель массы и шапки (общий возраст с посева).',
      'grow.channelYieldHint': 'В урожай с полезной площади входят только эти дни ({ctxLong}). Проращивание и рассада — отдельно.',
      'vegDays': 'Дней роста до среза/готовности',
      'autoDay': '→ К рекомендуемому дню съёма',
      'grow.autoDayHint': 'Ставит ползунок дней {ctxLong} на рекомендуемый срок съёма по модели роста (масса и шапка). Не меняет проращивание, рассаду, плотность и урожай с площади.',
      'mass.title': 'Масса урожая',
      'mass.titlePcs': 'Количество урожая',
      'mass.manual': 'Задать массу урожая вручную',
      'mass.manualPcs': 'Задать количество вручную',
      'mass.perPot': 'Масса урожая с 1 горшка, г',
      'mass.perPotPcs': 'Количество с 1 горшка, шт',
      'canopy.schema': 'Диаметр шапки на схеме и в расчёте зазоров',
      'canopy.std': 'стандарт',
      'canopy.pct': 'Погрешность шапки',
      'canopy.pctHint': '100% — модель; выше — запас по диаметру шапки на схеме (погрешность посадки).',
      'canopy.mm': 'задать в мм',
      'canopy.diam': 'Диаметр шапки, мм',
      'harvest.preview': 'По расчёту:',
      'autoMass': '→ Масса по модели роста',
      'stage.title': 'Фаза роста',
      'stage.young': 'Молодой лист',
      'stage.mature': 'Набор массы',
      'stage.full': 'Взрослая зелень',
      'stage.bolt': 'Стрелкование/перерост',
      'env.season': 'Сезон и естественный свет',
      'env.month': 'Месяц',
      'env.lighting': 'Искусственная досветка',
      'env.lightingOff': 'Выключена — только естественный свет',
      'env.dli': 'Целевой DLI с досветкой',
      'env.photoperiod': 'Целевой фотопериод',
      'env.ledGh': 'КПД LED (досветка)',
      'env.autoLedGh': '→ Стандарт 2.1 µmol/Дж (теплица)',
      'env.vfLight': 'Искусственный свет (закрытое помещение)',
      'env.vfIntro': 'DLI и PPFD связаны: DLI = PPFD × часы × 0,0036. Ориентиры для листового салата: Cornell CEA Handbook — DLI 12–17 моль/м²·сут, фотопериод 16–18 ч.',
      'env.dliCrown': 'DLI на кроне',
      'env.ppPeriod': 'Фотопериод ламп',
      'env.ppfd': 'PPFD на кроне',
      'env.ledVf': 'КПД системы (лампы + БП)',
      'env.temp': 'Температура воздуха',
      'env.rh': 'Влажность воздуха',
      'bio.title': 'Биологический разброс',
      'bio.range': 'Разброс по партии',
      'dates.title': 'Даты и срезки',
      'sowDate': 'Дата посева',
      'cutInterval': 'Интервал между срезами',
      'cutMass': 'Вес за срез',
      'sys.titleCh': 'Параметры системы · каналы 110×55',
      'sys.titlePal': 'Параметры системы · поддоны 130×65',
      'lengthCh': 'Длина канала',
      'palletsAlong': 'Поддонов вдоль стойки (130 см)',
      'nchCh': 'Количество каналов',
      'nchPal': 'Поддонов поперёк (×65 см)',
      'palletCells': 'Ячеек в кассете (400×600)',
      'palletHoles': 'Отверстий на поддон (крышка 1300×650)',
      'palletMount': 'Тип посадки на поддоне',
      'tiers': 'Ярусов в стеллаже',
      'tierGap': 'Расстояние между ярусами',
      'density': 'Целевая плотность',
      'offset': 'Сдвиг рядов',
      'extraB': 'Доп. отступ b',
      'potDiam': 'Диаметр горшка',
      'geom.titleCh': 'Геометрия посадки',
      'geom.titlePal': 'Геометрия поддонов и кассет',
      'canopy.titleCh': 'Шапка и зазоры',
      'canopy.titlePal': 'Шапка и шаг ячеек',
      'sysmet.titleCh': 'Система целиком',
      'sysmet.titlePal': 'Стеллаж и зона целиком',
      'scen.title': 'Сравнение сценариев и экономика',
      'scen.compare': 'Сравнить текущий сценарий A с альтернативой B',
      'planting.activeCv': 'Настройка культуры',
      'planting.activeCvMode': 'Режим',
      'farmCal.title': 'Калибровка по замерам',
      'farmCal.intro': 'Замеры с объекта подгоняют модель под вашу ферму. Сохраняются в проект JSON.',
      'farmCal.measuredMass': 'Факт. масса срезки',
      'farmCal.measuredYield': 'Факт. урожай',
      'farmCal.date': 'Дата замера',
      'farmCal.comment': 'Комментарий',
      'farmCal.modelNow': 'Сейчас модель: {mass} {massUnit}, урожай {yield} {yieldUnit}',
      'farmCal.applied': 'Применено: {fields}',
      'farmCal.save': 'Применить калибровку',
      'farmCal.clear': 'Сбросить замеры',
      'farmCal.noCv': 'Выберите сорт в списке культур.',
      'farmCal.unitYieldKg': 'кг/м²·мес',
      'farmCal.unitYieldPcs': 'шт/м²·мес',
      'farmCal.unitMassPcs': 'шт',
      'farmCal.nudge': 'Есть замеры с вашей фермы? Подгоните модель под факт.',
      'farmCal.nudgeOpen': 'Калибровка по замерам',
      'trace.summary': 'Откуда эти числа',
      'trace.mass': 'Масса срезки',
      'trace.canopy': 'Диаметр шапки',
      'trace.rhoA': 'Плотность стояния',
      'trace.leafGap': 'Зазор шапок',
      'trace.trayDensity': 'Лотков на м²',
      'trace.src.trayStd': 'стандарт лотков',
      'trace.yieldSqm': 'Урожай / м²·мес',
      'trace.cyclesMo': 'Срезок / мес',
      'trace.farmCal': 'Калибровка фермы',
      'trace.src.manual': 'ручной ввод',
      'trace.src.modelEst': 'модель (оценка)',
      'trace.src.model': 'модель роста',
      'trace.src.fromMass': 'из массы',
      'trace.src.geom': 'геометрия',
      'trace.src.multicut': 'мультисрезка',
      'trace.src.cycle': 'цикл',
      'trace.src.intervalCalc': '30,5 сут / интервал',
      'trace.src.farm': 'замеры на объекте',
      'trace.unit.pcsSqm': 'шт/м²',
      'scen.hint': 'Сценарий A = текущие настройки выше. В сценарии B меняете только то, что хотите сравнить:',
      'scen.cvB': 'Сорт B',
      'scen.monthB': 'Месяц B',
      'scen.lightB': 'Досветка B',
      'scen.lightOff': 'Выключена',
      'scen.dliB': 'DLI B, моль/сут',
      'scen.photoB': 'Фотопериод B, ч',
      'scen.tempB': 'Температура B',
      'scen.econ': 'Экономика — для расчёта выручки',
      'scen.priceSalad': 'Цена готового салата',
      'scen.priceKwh': 'Цена электричества',
      'schema.titleCh': 'Схема — вид сверху',
      'schema.titlePal': 'Схема — один поддон 130×65, вид сверху (3 кассеты)',
      'schema.canopy': 'Шапка ⌀',
      'recs.title': 'Рекомендации',
      'std.title': 'Мои стандарты',
      'std.gh': 'Теплица',
      'std.vf': 'Вертикальная ферма',
      'std.vfPal': 'Поддоны · мои стандарты',
      'std.apply': 'Применить к расчёту',
      'std.save': 'Сохранить для сорта',
      'std.reset': 'Сбросить к модели сорта',
      'std.resetVf': 'Сбросить к справочнику',
      'vf.stdLocks': 'Подставлять из справочника вертикальной фермы:',
      'std.gh.germination': 'Прорастание',
      'std.gh.nursery': 'Рассада',
      'std.gh.day': 'Дней до среза',
      'std.gh.density': 'Плотность',
      'std.gh.cutInterval': 'Интервал срезов',
      'std.gh.canopy': 'Шапка',
      'std.gh.cutMass': 'Масса 1-го среза',
      'std.gh.cutCount': 'Число срезок',
      'std.gh.cutMassN': 'Масса среза {n}',
      'u.perPot': 'г/горшок',
      'unit.days': 'сут',
      'unit.kg': 'кг',
      'unit.g': 'г',
      'unit.mm': 'мм',
      'unit.cm': 'см',
      'unit.pct': '%',
      'unit.mol': 'моль',
      'unit.hDay': 'ч/сут',
      'unit.perKg': 'за кг',
      'unit.perKwh': 'за кВт·ч',
      'kicker.ch': 'Проточный канал 110 × 55 мм',
      'kicker.vf': 'Вертикальная ферма · каналы 110×55',
      'kicker.pal': 'Поддоны 130 × 65 см',
      'title.ch': 'Калькулятор посадки · каналы',
      'title.vf': 'Калькулятор посадки · вертикальная ферма',
      'title.pal': 'Калькулятор посадки · поддоны',
      'sub.gh': 'Теплица: салат и зелень, досветка, плотность до 220 шт/м², габарит до 2×12 м.',
      'sub.vf': 'Вертикальная ферма: культуры из справочника, DLI, PPFD; каналы 110×55 мм.',
      'sub.pal': 'Поддоны 130×65',
      'econ.kicker': 'Экономика Daogreen',
      'econ.title': 'Экономика фермы',
      'econ.sub': 'Доход, затраты на свет и расходники по культурам — отдельно от вкладки посадки.',
      'stdcat.kicker': 'Справочник Daogreen',
      'stdcat.title': 'Стандарты по культурам',
      'stdcat.sub': 'Прорастание, дни вегетации, плотность стояния и урожай за срез — по всем сортам из аудита и модели теплицы.',
      'stdcat.intro': 'Диапазон из аудита → значение в калькуляторе. Переключайте среду ниже.',
      'stdcat.modeAria': 'Среда выращивания в справочнике',
      'stdcat.mode.vf': 'Вертикальная ферма',
      'stdcat.mode.pal': 'Поддоны',
      'stdcat.mode.gh': 'Теплица',
      'stdcat.legend': 'В ячейках: диапазон из аудита → расчётное значение (жирным). Урожай на каналах: верх диапазона +12,5%.',
      'stdcat.about': 'Источник данных',
      'stdcat.sec.vf': 'Вертикальная ферма · каналы 110×55',
      'stdcat.sec.pal': 'Поддоны 130×65',
      'stdcat.sec.gh': 'Теплица · модель роста',
      'stdcat.hint.vf': 'Источник: АУДИТ/КАНАЛЫ.xlsx, АУДИТ/ЦВЕТЫ.xlsx. Плотность — растений на погонный метр канала.',
      'stdcat.hint.pal': 'Источник: АУДИТ/ПОДДОНЫ.xlsx. Ячейки кассеты — типовой формат под поддон.',
      'stdcat.hint.gh': 'Сорта теплицы без листа аудита: M_max и t50 задают кривую роста; срезки и плотность настраиваются на вкладке посадки.',
      'stdcat.col.section': 'Секция',
      'stdcat.col.name': 'Культура',
      'stdcat.col.germ': 'Прор., дн.',
      'stdcat.col.days': 'Вег., дн.',
      'stdcat.col.density': 'Плотн., шт/м',
      'stdcat.col.cells': 'Ячейки кассеты',
      'stdcat.col.yield': 'Урожай за срез',
      'stdcat.col.cut': 'Интервал срезки, дн.',
      'stdcat.col.multicut': 'Многосрез',
      'stdcat.col.note': 'Замена / примечание',
      'stdcat.col.mmax': 'M_max, г',
      'stdcat.col.t50': 'День t50',
      'stdcat.col.cutStd': 'Интервал (справ.)',
      'stdcat.col.baby': 'Беби-зелень',
      'stdcat.yes': 'да',
      'stdcat.no': 'нет',
      'stdcat.unit.g': 'г',
      'stdcat.unit.pcs': 'шт',
      'stdcat.empty': 'Нет данных в справочнике',
      'stdcat.openCalc': 'В расчёт',
      'stdcat.col.open': '',
      'veg.head': 'Период вегетации',
      'std.badge': 'стандарт',
      'm.massCut': 'Урожай за срез',
      'm.massHarvest': 'Масса урожая',
      'm.massProduct': 'Масса продукции',
      'm.massHead': 'Масса кочана',
      'm.massPcsCut': 'Количество за срез',
      'm.canopyDiam': 'Диаметр шапки',
      'm.massGain': 'Прирост массы',
      'm.canopyGain': 'Прирост шапки',
      'm.totalAge': 'Общий возраст',
      'm.totalAgeBreakdown': 'проращ. {germ} + рассада {nursery} + {ctx} {channel}',
      'm.trayLotAgeBreakdown': 'до готовности {channel} {dUnit} · проращ. отдельно',
      'm.harvestRec': 'Рекомендуемый съём',
      'm.cutsMonth': 'Срезок в месяц',
      'm.cutsCycle': 'Срезов за срок жизни',
      'm.replaceMo': 'До замены растений',
      'm.zoneLen': 'Длина зоны',
      'm.palAlong': 'Поддонов вдоль (130 см)',
      'm.palAcross': 'Поддонов поперёк (65 см)',
      'm.palTotal': 'Всего поддонов',
      'm.cassPerPal': 'Кассет на поддон',
      'm.cellsCass': 'Ячеек в кассете',
      'm.holesPal': 'Отверстий на поддон',
      'm.plantsPal': 'Растений на поддон',
      'm.cellPitch': 'Шаг ячеек (ориентир)',
      'm.pitchA': 'Шаг в канале (a)',
      'm.perRow': 'Точек в ряду',
      'm.chanPlant': 'Посадка в канале',
      'm.gapB': 'Между каналами (b)',
      'm.diag': 'Между центрами в соседнем канале',
      'm.potGap': 'Зазор между горшками',
      'm.holeGap': 'Зазор между отверстиями',
      'm.nearest': 'Ближайшие центры отверстий',
      'm.leafGap': 'Зазор между листьями',
      'm.leafOverlap': 'Перекрытие листьев',
      'm.density': 'Факт. плотность',
      'm.densityTrayLot': 'Лотков на м²',
      'm.sysWidth': 'Ширина системы',
      'm.plantsChan': 'Растений в канале',
      'm.tiers': 'Ярусов в стеллаже',
      'm.plantsTier': 'Растений на одном ярусе',
      'm.rackH': 'Высота стеллажа (ориентир)',
      'm.totalPlants': 'Всего растений',
      'm.areaTiers': 'Посевная площадь (с ярусами)',
      'm.sysArea': 'Площадь системы',
      'm.footprint': 'Площадь по полу',
      'm.firstCut': 'До первой срезки',
      'm.cycle': 'Цикл выращивания',
      'm.cutMass': 'Масса одной срезки',
      'm.cutInterval': 'Интервал срезки',
      'm.yieldMo': 'Урожай в месяц',
      'm.yieldPotMo': 'Урожай с 1 растения в месяц',
      'm.yieldSysMo': 'Валовый урожай в месяц',
      'm.yieldSysYear': 'Валовый урожай в год',
      'm.lifeSum': 'Сумма срезок за жизнь',
      'm.cyclesYear': 'Циклов в год',
      'm.yieldCycle': 'Урожай за цикл',
      'm.kgSqmCycle': 'кг/м² за цикл',
      'm.kgSqmYear': 'кг/м² в год',
      'm.kgSqmMo': 'кг/м² в месяц',
      'm.pcsSqmCycle': 'шт/м² за цикл',
      'm.pcsSqmYear': 'шт/м² в год',
      'm.pcsSqmMo': 'шт/м² в месяц',
      'm.yearMonthHint': '«В год» считается по 365 календарным дням. «В месяц» и срезки — по 30,5 сут (средний месяц). Поэтому годовой урожай не всегда ровно в 12 раз больше месячного.',
      'm.yieldPal': 'Урожай с поддона за цикл',
      'm.model': 'модель',
      'u.pcs': 'шт',
      'u.pcsSqm': 'шт/м²',
      'u.pcsMo': 'шт/м²·мес',
      'u.kgSqmMo': 'кг/м²·мес',
      'u.kgPal': 'кг/поддон',
      'u.vegPal': 'сут вегетации (поддон)',
      'u.vegVf': 'сут в модуле',
      'u.vegCh': 'сут вегетации (канал)',
      'u.pctDay': '%/сут',
      'u.mo': 'мес',
      'cv.customSub': 'свой сорт',
      'cv.secGroup.baby': 'Беби-зелень (срез, горшок D6)',
      'cv.secGroup.flowers': 'Цветы пищевые',
      'cv.secGroup.adult': 'Взрослая зелень и салаты (D6)'
    },
    en: {
      'cultivars.title': 'Crops',
      'cultivars.add': '+ Add custom cultivar',
      'cultivars.addHint': 'Copy of current cultivar · saved in browser',
      'cycle.title': 'Cycle parameters',
      'grow.title': 'Cycle timing',
      'grow.sheetHintVf': 'collapse → apply vertical farm standards',
      'grow.sheetHintPal': 'collapse → apply pallet standards',
      'grow.flow': 'Germination, then vegetative period — nursery and grow-out (channel, pallet trays, or vertical farm).',
      'mass.sheetHintVf': 'collapse → vertical farm standard',
      'mass.sheetHintPal': 'collapse → pallet standard',
      'germination': 'Germination time',
      'nursery': 'Nursery',
      'grow.nurseryYieldHint': 'Excluded from useful-area yield (kg/m²) — nursery is a separate zone. Affects mass/canopy model (total age from sowing).',
      'grow.channelYieldHint': 'Only these days count toward useful-area yield ({ctxLong}). Germination and nursery are separate.',
      'vegDays': 'Days to harvest / ready',
      'autoDay': '→ Recommended harvest day',
      'grow.autoDayHint': 'Sets the day slider ({ctxLong}) to the model harvest day (mass and canopy). Does not change germination, nursery, density, or area yield.',
      'mass.title': 'Harvest mass',
      'mass.titlePcs': 'Harvest count',
      'mass.manual': 'Set harvest mass manually',
      'mass.manualPcs': 'Set count manually',
      'mass.perPot': 'Harvest mass per pot, g',
      'mass.perPotPcs': 'Count per pot, pcs',
      'canopy.schema': 'Canopy diameter on layout and gap calc',
      'canopy.std': 'standard',
      'canopy.pct': 'Canopy margin',
      'canopy.pctHint': '100% = model; higher widens canopy circles on the plan (planting margin).',
      'canopy.mm': 'set in mm',
      'canopy.diam': 'Canopy diameter, mm',
      'harvest.preview': 'Calculated:',
      'autoMass': '→ Mass from growth model',
      'stage.title': 'Growth phase',
      'stage.young': 'Young leaf',
      'stage.mature': 'Mass gain',
      'stage.full': 'Mature green',
      'stage.bolt': 'Bolting / overgrown',
      'env.season': 'Season & natural light',
      'env.month': 'Month',
      'env.lighting': 'Supplemental lighting',
      'env.lightingOff': 'Off — natural light only',
      'env.dli': 'Target DLI with supplemental',
      'env.photoperiod': 'Target photoperiod',
      'env.ledGh': 'LED efficacy (supplemental)',
      'env.autoLedGh': '→ Standard 2.1 µmol/J (greenhouse)',
      'env.vfLight': 'Artificial light (indoor)',
      'env.vfIntro': 'DLI and PPFD: DLI = PPFD × hours × 0.0036. Leafy greens: DLI 12–17 mol/m²·d, photoperiod 16–18 h.',
      'env.dliCrown': 'DLI at canopy',
      'env.ppPeriod': 'Lamp photoperiod',
      'env.ppfd': 'PPFD at canopy',
      'env.ledVf': 'System efficacy (lamps + driver)',
      'env.temp': 'Air temperature',
      'env.rh': 'Relative humidity',
      'bio.title': 'Biological variation',
      'bio.range': 'Batch variation',
      'dates.title': 'Dates & cuts',
      'sowDate': 'Sowing date',
      'cutInterval': 'Interval between cuts',
      'cutMass': 'Mass per cut',
      'sys.titleCh': 'System · channels 110×55',
      'sys.titlePal': 'System · pallets 130×65',
      'lengthCh': 'Channel length',
      'palletsAlong': 'Pallets along rack (130 cm)',
      'nchCh': 'Number of channels',
      'nchPal': 'Pallets across (×65 cm)',
      'palletCells': 'Cells per tray (400×600)',
      'palletHoles': 'Holes per pallet (lid 1300×650)',
      'palletMount': 'Planting on pallet',
      'tiers': 'Shelf tiers',
      'tierGap': 'Tier spacing',
      'density': 'Target density',
      'offset': 'Row offset',
      'extraB': 'Extra spacing b',
      'potDiam': 'Pot diameter',
      'geom.titleCh': 'Planting geometry',
      'geom.titlePal': 'Pallet & tray geometry',
      'canopy.titleCh': 'Canopy & gaps',
      'canopy.titlePal': 'Canopy & cell pitch',
      'sysmet.titleCh': 'Whole system',
      'sysmet.titlePal': 'Rack & zone',
      'scen.title': 'Scenario comparison & economics',
      'scen.compare': 'Compare scenario A vs B',
      'planting.activeCv': 'Configuring cultivar',
      'planting.activeCvMode': 'Mode',
      'farmCal.title': 'Field calibration',
      'farmCal.intro': 'On-site measurements tune the model to your farm. Saved in project JSON.',
      'farmCal.measuredMass': 'Actual cut mass',
      'farmCal.measuredYield': 'Actual yield',
      'farmCal.date': 'Measurement date',
      'farmCal.comment': 'Comment',
      'farmCal.modelNow': 'Model now: {mass} {massUnit}, yield {yield} {yieldUnit}',
      'farmCal.applied': 'Applied: {fields}',
      'farmCal.save': 'Apply calibration',
      'farmCal.clear': 'Clear measurements',
      'farmCal.noCv': 'Select a cultivar in the list.',
      'farmCal.unitYieldKg': 'kg/m²·mo',
      'farmCal.unitYieldPcs': 'pcs/m²·mo',
      'farmCal.unitMassPcs': 'pcs',
      'farmCal.nudge': 'Have on-farm measurements? Tune the model to your site.',
      'farmCal.nudgeOpen': 'Field calibration',
      'trace.summary': 'Where these numbers come from',
      'trace.mass': 'Cut mass',
      'trace.canopy': 'Canopy diameter',
      'trace.rhoA': 'Stand density',
      'trace.leafGap': 'Canopy gap',
      'trace.trayDensity': 'Trays per m²',
      'trace.src.trayStd': 'tray standard',
      'trace.yieldSqm': 'Yield / m²·mo',
      'trace.cyclesMo': 'Cuts / mo',
      'trace.farmCal': 'Farm calibration',
      'trace.src.manual': 'manual input',
      'trace.src.modelEst': 'model (estimate)',
      'trace.src.model': 'growth model',
      'trace.src.fromMass': 'from mass',
      'trace.src.geom': 'geometry',
      'trace.src.multicut': 'multi-harvest',
      'trace.src.cycle': 'cycle',
      'trace.src.intervalCalc': '30.5 d / interval',
      'trace.src.farm': 'field measurements',
      'trace.unit.pcsSqm': 'pcs/m²',
      'scen.hint': 'Scenario A = settings above. In B change only what you compare:',
      'scen.cvB': 'Cultivar B',
      'scen.monthB': 'Month B',
      'scen.lightB': 'Supplemental B',
      'scen.lightOff': 'Off',
      'scen.dliB': 'DLI B, mol/d',
      'scen.photoB': 'Photoperiod B, h',
      'scen.tempB': 'Temperature B',
      'scen.econ': 'Economics — revenue estimate',
      'scen.priceSalad': 'Finished salad price',
      'scen.priceKwh': 'Electricity price',
      'schema.titleCh': 'Layout — top view',
      'schema.titlePal': 'Layout — one pallet 130×65, top view (3 trays)',
      'schema.canopy': 'Canopy ⌀',
      'recs.title': 'Recommendations',
      'std.title': 'My standards',
      'std.gh': 'Greenhouse',
      'std.vf': 'Vertical farm',
      'std.vfPal': 'Pallets · my standards',
      'std.apply': 'Apply to calculation',
      'std.save': 'Save for cultivar',
      'std.reset': 'Reset to model',
      'std.resetVf': 'Reset to catalog',
      'vf.stdLocks': 'Use vertical farm catalog for:',
      'std.gh.germination': 'Germination',
      'std.gh.nursery': 'Nursery',
      'std.gh.day': 'Days to cut',
      'std.gh.density': 'Density',
      'std.gh.cutInterval': 'Cut interval',
      'std.gh.canopy': 'Canopy',
      'std.gh.cutMass': 'First cut mass',
      'std.gh.cutCount': 'Number of cuts',
      'std.gh.cutMassN': 'Cut {n} mass',
      'u.perPot': 'g/pot',
      'unit.days': 'd',
      'unit.kg': 'kg',
      'unit.g': 'g',
      'unit.mm': 'mm',
      'unit.cm': 'cm',
      'unit.pct': '%',
      'unit.mol': 'mol',
      'unit.hDay': 'h/d',
      'unit.perKg': 'per kg',
      'unit.perKwh': 'per kWh',
      'kicker.ch': 'NFT channel 110 × 55 mm',
      'kicker.vf': 'Vertical farm · channels 110×55',
      'kicker.pal': 'Pallets 130 × 65 cm',
      'title.ch': 'Planting calculator · channels',
      'title.vf': 'Planting calculator · vertical farm',
      'title.pal': 'Planting calculator · pallets',
      'sub.gh': 'Greenhouse: salads & greens, supplemental light, density up to 220 pots/m².',
      'sub.vf': 'Vertical farm: VF crops, DLI, PPFD; 110×55 mm channels.',
      'sub.pal': 'Pallets 130×65',
      'econ.kicker': 'Daogreen economics',
      'econ.title': 'Farm economics',
      'econ.sub': 'Revenue, light and consumables by crop — separate from planting tab.',
      'stdcat.kicker': 'Daogreen catalog',
      'stdcat.title': 'Crop standards',
      'stdcat.sub': 'Germination, veg days, stand density and yield per cut — all cultivars from audit sheets and greenhouse model.',
      'stdcat.intro': 'Audit range → calculator value. Switch growing environment below.',
      'stdcat.modeAria': 'Environment in catalog',
      'stdcat.mode.vf': 'Vertical farm',
      'stdcat.mode.pal': 'Pallets',
      'stdcat.mode.gh': 'Greenhouse',
      'stdcat.legend': 'Cells show audit range → calculated value (bold). Channels: yield = top of range +12.5%.',
      'stdcat.about': 'Data source',
      'stdcat.sec.vf': 'Vertical farm · channels 110×55',
      'stdcat.sec.pal': 'Pallets 130×65',
      'stdcat.sec.gh': 'Greenhouse · growth model',
      'stdcat.hint.vf': 'Source: audit channel sheets. Density — plants per linear meter.',
      'stdcat.hint.pal': 'Source: audit pallet sheet. Tray cell count — typical format.',
      'stdcat.hint.gh': 'Greenhouse cultivars without audit sheet: M_max and t50 drive the growth curve; cuts and density are set on the planting tab.',
      'stdcat.col.section': 'Section',
      'stdcat.col.name': 'Crop',
      'stdcat.col.germ': 'Germ., d',
      'stdcat.col.days': 'Veg, d',
      'stdcat.col.density': 'Dens., pcs/m',
      'stdcat.col.cells': 'Tray cells',
      'stdcat.col.yield': 'Yield per cut',
      'stdcat.col.cut': 'Cut interval, d',
      'stdcat.col.multicut': 'Multicut',
      'stdcat.col.note': 'Replacement / note',
      'stdcat.col.mmax': 'M_max, g',
      'stdcat.col.t50': 'Day t50',
      'stdcat.col.cutStd': 'Interval (ref.)',
      'stdcat.col.baby': 'Baby greens',
      'stdcat.yes': 'yes',
      'stdcat.no': 'no',
      'stdcat.unit.g': 'g',
      'stdcat.unit.pcs': 'pcs',
      'stdcat.empty': 'No data in catalog',
      'stdcat.openCalc': 'Open in calc',
      'stdcat.col.open': '',
      'veg.head': 'Vegetative period',
      'std.badge': 'standard',
      'm.massCut': 'Yield per cut',
      'm.massHarvest': 'Harvest mass',
      'm.massProduct': 'Product mass',
      'm.massHead': 'Head mass',
      'm.massPcsCut': 'Pieces per cut',
      'm.canopyDiam': 'Canopy diameter',
      'm.massGain': 'Mass gain rate',
      'm.canopyGain': 'Canopy gain rate',
      'm.totalAge': 'Total age',
      'm.totalAgeBreakdown': 'germ. {germ} + nursery {nursery} + {ctx} {channel}',
      'm.trayLotAgeBreakdown': 'to harvest {channel} {dUnit} · germ. separate',
      'm.harvestRec': 'Recommended harvest',
      'm.cutsMonth': 'Cuts per month',
      'm.cutsCycle': 'Cuts per cycle',
      'm.replaceMo': 'Until plant replacement',
      'm.zoneLen': 'Zone length',
      'm.palAlong': 'Pallets along (130 cm)',
      'm.palAcross': 'Pallets across (65 cm)',
      'm.palTotal': 'Total pallets',
      'm.cassPerPal': 'Trays per pallet',
      'm.cellsCass': 'Cells per tray',
      'm.holesPal': 'Holes per pallet',
      'm.plantsPal': 'Plants per pallet',
      'm.cellPitch': 'Cell pitch (ref.)',
      'm.pitchA': 'In-channel pitch (a)',
      'm.perRow': 'Points per row',
      'm.chanPlant': 'Channel layout',
      'm.gapB': 'Between channels (b)',
      'm.diag': 'Center-to-center (adj. channel)',
      'm.potGap': 'Gap between pots',
      'm.holeGap': 'Gap between holes',
      'm.nearest': 'Nearest hole centers',
      'm.leafGap': 'Gap between leaves',
      'm.leafOverlap': 'Leaf overlap',
      'm.density': 'Actual density',
      'm.densityTrayLot': 'Trays per m²',
      'm.sysWidth': 'System width',
      'm.plantsChan': 'Plants per channel',
      'm.tiers': 'Shelf tiers',
      'm.plantsTier': 'Plants per tier',
      'm.rackH': 'Rack height (ref.)',
      'm.totalPlants': 'Total plants',
      'm.areaTiers': 'Growing area (with tiers)',
      'm.sysArea': 'System area',
      'm.footprint': 'Floor area',
      'm.firstCut': 'Until first cut',
      'm.cycle': 'Growing cycle',
      'm.cutMass': 'Mass per cut',
      'm.cutInterval': 'Cut interval',
      'm.yieldMo': 'Monthly yield',
      'm.yieldPotMo': 'Yield per plant per month',
      'm.yieldSysMo': 'Gross yield per month',
      'm.yieldSysYear': 'Gross yield per year',
      'm.lifeSum': 'Total cuts per plant life',
      'm.cyclesYear': 'Cycles per year',
      'm.yieldCycle': 'Yield per cycle',
      'm.kgSqmCycle': 'kg/m² per cycle',
      'm.kgSqmYear': 'kg/m² per year',
      'm.kgSqmMo': 'kg/m² per month',
      'm.pcsSqmCycle': 'pcs/m² per cycle',
      'm.pcsSqmYear': 'pcs/m² per year',
      'm.pcsSqmMo': 'pcs/m² per month',
      'm.yearMonthHint': 'Per-year uses 365 calendar days. Per-month and cuts use 30.5 days (average month). Annual yield is not always exactly 12× the monthly figure.',
      'm.yieldPal': 'Yield per pallet per cycle',
      'm.model': 'model',
      'u.pcs': 'pcs',
      'u.pcsSqm': 'pcs/m²',
      'u.pcsMo': 'pcs/m²·mo',
      'u.kgSqmMo': 'kg/m²·mo',
      'u.kgPal': 'kg/pallet',
      'u.vegPal': 'd veg. (pallet)',
      'u.vegVf': 'd in module',
      'u.vegCh': 'd veg. (channel)',
      'u.pctDay': '%/d',
      'u.mo': 'mo',
      'cv.customSub': 'custom',
      'cv.secGroup.baby': 'Baby greens (cut, D6 pot)',
      'cv.secGroup.flowers': 'Edible flowers',
      'cv.secGroup.adult': 'Adult greens & salads (D6)'
    }
  };

  function plantMetric(key){
    return plantT(key);
  }

  function plantT(key){
    var loc = global.DG_getLocale ? global.DG_getLocale() : 'ru';
    var bag = P[loc] || P.ru;
    return bag[key] != null ? bag[key] : (P.ru[key] || key);
  }

  function plantTF(key, vars){
    var s = plantT(key);
    if (vars){
      Object.keys(vars).forEach(function(k){
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return s;
  }

  function setText(sel, key){
    var el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (el) el.textContent = plantT(key);
  }

  function setLabel(sel, key, badgeSel){
    var el = document.querySelector(sel);
    if (!el) return;
    var badge = badgeSel ? el.querySelector(badgeSel) : null;
    if (badge){
      /* Не пересоздавать кнопку «стандарт» — иначе теряются обработчики bindVfStdBadges */
      while (el.firstChild && el.firstChild !== badge) el.removeChild(el.firstChild);
      el.insertBefore(document.createTextNode(plantT(key)), badge);
      badge.textContent = plantT('std.badge');
    } else el.textContent = plantT(key);
  }

  function uix(k, vars){
    if (typeof global.DG_uiT === 'function') return global.DG_uiT(k, vars);
    return plantT(k);
  }

  function applyPlantingI18n(){
    var vp = document.getElementById('view-planting');
    if (!vp) return;

    setText('#panel-cultivars .collapse-head > span:first-child', 'cultivars.title');
    setText('#cv-add-custom', 'cultivars.add');
    var cvHint = document.querySelector('#panel-cultivars-body .cv-custom-bar span');
    if (cvHint) cvHint.textContent = plantT('cultivars.addHint');

    setText('#panel-culture > .section-h', 'cycle.title');
    setText('#block-grow-time .collapse-head > span:first-child', 'grow.title');
    /* collapse-sheet-only: текст в syncVfStdBadges */
    var gfn = document.querySelector('#block-grow-time .grow-flow-note');
    if (gfn) gfn.innerHTML = uix('ui.grow.flowNote');

    setLabel('#ctrl-germination .ctrl-label', 'germination', '.vf-sheet-badge');
    setText('#ctrl-nursery .ctrl-label', 'nursery');
    setLabel('#ctrl-day .ctrl-label', 'vegDays', '.vf-sheet-badge');
    setText('#auto-day', 'autoDay');
    setText('#auto-day-hint', 'grow.autoDayHint');
    setText('#nursery-yield-hint', 'grow.nurseryYieldHint');
    setText('#channel-day-yield-hint', 'grow.channelYieldHint');
    setText('#vf-growth-slider-hint', 'vf.growthSliderHint');
    setText('#multicut-yield-only-hint', 'multicut.yieldOnlyHint');

    setText('#block-mass .collapse-head > span:first-child', 'mass.title');
    setText('#block-mass .toggle-label', 'mass.manual');
    setLabel('#manual-mass-block .ctrl-label', 'mass.perPot', '.vf-sheet-badge');
    var cnote = document.querySelector('#block-mass-body > p');
    if (cnote) cnote.textContent = plantT('canopy.schema');
    document.querySelectorAll('.js-canopy-std').forEach(function(b){ b.textContent = plantT('canopy.std'); });
    setText('#canopy-pct-block .ctrl-label', 'canopy.pct');
    var mmLbl = document.querySelector('label.canopy-mm-toggle');
    if (mmLbl) mmLbl.lastChild.textContent = ' ' + plantT('canopy.mm');
    setText('#manual-canopy-block .ctrl-label', 'canopy.diam');
    setText('.harvest-preview-label', 'harvest.preview');
    setText('#auto-mass', 'autoMass');

    setText('#block-stage .collapse-head > span:first-child', 'stage.title');
    var stages = { young: 'stage.young', mature: 'stage.mature', full: 'stage.full', bolt: 'stage.bolt' };
    document.querySelectorAll('#stage-bar .stage-seg').forEach(function(seg){
      var lbl = seg.querySelector('.stage-lbl');
      if (lbl && stages[seg.dataset.stage]) lbl.textContent = plantT(stages[seg.dataset.stage]);
    });

    setText('#block-env-gh-season .collapse-head > span:first-child', 'env.season');
    setText('#env-greenhouse .ctrl:nth-child(1) .ctrl-label', 'env.month');
    setText('#env-greenhouse .ctrl:nth-child(2) .ctrl-label', 'env.lighting');
  var ll = document.getElementById('lighting-label');
    if (ll) ll.textContent = plantT('env.lightingOff');
    setText('.env-gh-lighting:nth-of-type(1) .ctrl-label', 'env.dli');
    setText('.env-gh-lighting:nth-of-type(2) .ctrl-label', 'env.photoperiod');
    document.querySelectorAll('.env-gh-lighting').forEach(function(row, i){
      var lab = row.querySelector('.ctrl-label');
      if (!lab) return;
      if (i === 2) lab.textContent = plantT('env.ledGh');
    });
    setText('#auto-led-gh', 'env.autoLedGh');

    setText('#block-env-vf-light .collapse-head > span:first-child', 'env.vfLight');
    var vfDivs = document.querySelectorAll('#env-vertical > div');
    if (vfDivs[0]) vfDivs[0].textContent = uix('ui.env.vfDliIntro');
    if (vfDivs[1]) vfDivs[1].textContent = uix('ui.env.vfEffHint');
    var vfCtrls = document.querySelectorAll('#env-vertical .ctrl-label');
    var vfKeys = ['env.dliCrown', 'env.ppPeriod', 'env.ppfd', 'env.ledVf'];
    vfCtrls.forEach(function(lab, i){ if (vfKeys[i]) lab.textContent = plantT(vfKeys[i]); });

    var clHead = document.querySelector('#block-env-climate .collapse-head > span:first-child');
    if (clHead) clHead.textContent = uix('ui.env.climate');
    setText('#block-env-climate-body > .ctrl:nth-child(1) .ctrl-label', 'env.temp');
    setText('#block-env-climate-body > .env-vf-only .ctrl-label', 'env.rh');

    setText('#panel-bio-margin .collapse-head > span:first-child', 'bio.title');
    setText('#panel-bio-margin .bio-margin-ctrl .ctrl-label', 'bio.range');
    setText('#block-panel-geom .collapse-head > span:first-child', 'ui.planting.geomTitle');
    setText('#panel-metrics .collapse-head > span:first-child', 'ui.planting.metricsTitle');
    setText('#panel-schema .collapse-head > span:first-child', 'ui.planting.schemaTitle');
    setText('#panel-planting-advanced .collapse-head > span:first-child', 'ui.planting.advancedTitle');

    setText('#block-dates .collapse-head > span:first-child', 'dates.title');
    setText('#ctrl-sowDate .ctrl-label', 'sowDate');
    setLabel('#ctrl-cutInterval .ctrl-label', 'cutInterval', '.vf-sheet-badge');
    setLabel('#ctrl-cutMass .ctrl-label', 'cutMass', '.vf-sheet-badge');

    setText('#length-label', 'lengthCh');
    setText('#ctrl-pallets-along .ctrl-label', 'palletsAlong');
    setText('#pallet-cells-label', 'palletCells');
    setText('#ctrl-pallet-lid-holes .ctrl-label', 'palletHoles');
    setText('#ctrl-pallet-mount .ctrl-label', 'palletMount');
    setText('#ctrl-pallet-tiers .ctrl-label', 'tiers');
    setText('#ctrl-tier-gap .ctrl-label', 'tierGap');
    setLabel('#ctrl-density .ctrl-label', 'density', '.vf-sheet-badge');
    setText('#ctrl-offset .ctrl-label', 'offset');
    setText('#extraB-label', 'extraB');
    setText('#ctrl-potDiam .ctrl-label', 'potDiam');

    setText('#panel-scenarios > .section-h', 'scen.title');
    setText('#panel-scenarios .toggle-label', 'scen.compare');
    setText('#block-panel-farm-calibration .collapse-head > span:first-child', 'farmCal.title');
    setText('#farm-cal-no-cv', 'farmCal.noCv');
    setText('#farm-cal-save', 'farmCal.save');
    setText('#farm-cal-clear', 'farmCal.clear');
    setText('.farm-cal-nudge-text', 'farmCal.nudge');
    setText('[data-farm-cal-open]', 'farmCal.nudgeOpen');
    setText('#planting-active-cv-bar .planting-active-cv-label', 'planting.activeCv');
    setText('#planting-active-cv-bar .planting-active-cv-mode-lbl', 'planting.activeCvMode');
    var sh = document.querySelector('#scenario-config > div');
    if (sh) sh.textContent = plantT('scen.hint');
    setText('#scenario-config .ctrl:nth-child(1) .ctrl-label', 'scen.cvB');
    setText('.scen-gh-only.ctrl:nth-child(2) .ctrl-label', 'scen.monthB');
    setText('.scen-gh-only.ctrl:nth-child(3) .ctrl-label', 'scen.lightB');
    var llb = document.getElementById('lighting-B-label');
    if (llb) llb.textContent = plantT('scen.lightOff');
    document.querySelectorAll('.scen-vf-only .ctrl-label').forEach(function(lab, i){
      lab.textContent = plantT(i === 0 ? 'scen.dliB' : 'scen.photoB');
    });
    setText('#scenario-config .ctrl-label', 'scen.tempB');
    document.querySelectorAll('#scenario-config .section-h').forEach(function(h){
      if (h.textContent.indexOf('Экономика') >= 0 || h.textContent.indexOf('Economics') >= 0) h.textContent = plantT('scen.econ');
    });
    var priceLbls = document.querySelectorAll('#scenario-config .ctrl-label');
    priceLbls.forEach(function(lab){
      if (lab.textContent.indexOf('салат') >= 0 || lab.textContent.indexOf('salad') >= 0) lab.textContent = plantT('scen.priceSalad');
      if (lab.textContent.indexOf('электр') >= 0 || lab.textContent.indexOf('Electric') >= 0) lab.textContent = plantT('scen.priceKwh');
    });

    setText('#block-panel-recs .collapse-head > span:first-child', 'recs.title');
    setText('#block-panel-standards .collapse-head > span:first-child', 'std.title');
    setText('#gh-std-apply', 'std.apply');
    setText('#gh-std-save', 'std.save');
    setText('#gh-std-reset-model', 'std.reset');
    setText('#vf-std-apply', 'std.apply');
    setText('#vf-std-save', 'std.save');
    setText('#vf-std-reset-model', 'std.resetVf');
    setText('#user-standards-gh-wrap .section-h', 'std.gh');
    var ghHint = document.querySelector('#user-standards-gh-wrap .gh-standards-hint');
    if (ghHint) ghHint.innerHTML = uix('ui.std.ghHint');
    /* sheet-standards: заголовок и подсказка — в syncVfStdBadges */
    var tierHint = document.getElementById('pallet-tier-hint');
    if (tierHint) tierHint.innerHTML = uix('ui.pal.tierHintHtml');
    /* подпись галочек — в syncVfStdBadges по режиму канал/VF/поддоны */

    document.querySelectorAll('#view-planting .unit').forEach(function(u){
      var t = u.textContent.trim();
      if (t === 'сут' || t === 'd') u.textContent = plantT('unit.days');
      else if (t === 'г' || t === 'g') u.textContent = plantT('unit.g');
      else if (t === 'мм' || t === 'mm') u.textContent = plantT('unit.mm');
      else if (t === 'моль' || t === 'mol') u.textContent = plantT('unit.mol');
      else if (t === 'моль/сут' || t === 'mol/d') u.textContent = uix('ui.unit.molDay');
      else if (t === 'ч/сут' || t === 'h/d') u.textContent = plantT('unit.hDay');
      else if (t === 'µmol/м²·с' || t === 'µmol/m²·s') u.textContent = uix('ui.unit.umolSq');
    });

    document.querySelectorAll('#pots .pot-btn').forEach(function(btn){
      var d = btn.dataset.d;
      if (d) btn.textContent = d + ' ' + plantT('unit.mm');
    });
    var bar = document.getElementById('canopy-schema-bar');
    if (bar){
      bar.querySelectorAll('.js-canopy-std').forEach(function(b){ b.textContent = plantT('canopy.std'); });
      var pctLab = bar.querySelector('.canopy-schema-pct .ctrl-label');
      if (pctLab) pctLab.textContent = plantT('canopy.pct');
    }
    if (typeof global.DG_syncSchemaCanopyLegend === 'function') global.DG_syncSchemaCanopyLegend();

    syncPlantingUnits();
    if (typeof global.DG_syncScenarioPriceUnits === 'function') global.DG_syncScenarioPriceUnits();
    if (typeof global.DG_syncBioMarginVisibility === 'function') global.DG_syncBioMarginVisibility();
  }

  function syncPlantingUnits(){
    var pu = document.querySelector('#pricePerKg + .ctrl-val .unit, #pricePerKg ~ .ctrl-val .unit');
    var el = document.querySelector('#pricePerKg-v');
    var unitEl = el && el.parentElement && el.parentElement.querySelector('.unit');
    if (unitEl){
      if (global.DG_getCurrency && global.DG_getCurrency() === 'USD'){
        unitEl.textContent = global.DG_currencySym ? global.DG_currencySym() + (global.DG_getLocale && global.DG_getLocale() === 'en' ? '/kg' : '/кг') : '$/kg';
      } else {
        unitEl.textContent = plantT('unit.perKg');
      }
    }
    var pk = document.querySelector('#pricePerKwh-v');
    var u2 = pk && pk.parentElement && pk.parentElement.querySelector('.unit');
    if (u2) u2.textContent = plantT('unit.perKwh');
  }

  global.DG_plantT = plantT;
  global.DG_plantTF = plantTF;
  global.DG_plantMetric = plantMetric;
  global.DG_applyPlantingI18n = applyPlantingI18n;
  global.DG_syncScenarioPriceUnits = syncPlantingUnits;
})(typeof window !== 'undefined' ? window : this);
