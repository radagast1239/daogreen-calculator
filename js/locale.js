/** Язык (ru/en) и отображение валюты (RUB/USD). Расчёт и JSON — всегда в ₽. */
(function(global){
  'use strict';

  var LOCALE_KEY = 'daogreen-locale';
  var CURRENCY_KEY = 'daogreen-currency';
  var FX_KEY = 'daogreen-fx-rub-usd';
  var DEFAULT_FX = 90;

  var MONEY_ECON_KEYS = {
    priceKwh: 1, rentMonth: 1, staffSalary: 1, logisticsMonth: 1, salePrice: 1,
    otherMonth: 1, consumablesPerKg: 1, consumablesPerPcs: 1, accountingMonth: 1
  };
  var MONEY_CULT_FIELDS = { salePrice: 1, consumablesPerPot: 1 };

  var STR = {
    ru: {
      'btn.save': 'Сохранить', 'btn.save.title': 'Сохранить расчёт в браузере',
      'btn.menu': 'Меню', 'btn.menu.title': 'Дополнительные действия',
      'btn.load': 'Загрузить', 'btn.load.title': 'Загрузить из браузера',
      'btn.json': 'JSON', 'btn.json.title': 'Скачать файл проекта JSON',
      'btn.import': 'Импорт', 'btn.import.title': 'Загрузить файл проекта',
      'btn.compare': 'Сравнить', 'btn.compare.title': 'Сравнить два проекта JSON',
      'btn.pdf': 'PDF', 'btn.pdf.title': 'Сохранить выбранные разделы в PDF',
      'btn.tour': 'Гайд', 'btn.tour.title': 'Гайд по интерфейсу',
      'btn.visitHistory': 'История', 'btn.visitHistory.title': 'История посещений в этом браузере',
      'btn.qr': 'QR', 'btn.qr.title': 'QR для установки на телефон',
      'visit.title': 'История посещений',
      'visit.lead': 'Когда вы открывали калькулятор в этом браузере.',
      'visit.localNote': 'Только на этом устройстве — общая статистика сайта здесь не показывается.',
      'visit.empty': 'Пока нет записей.',
      'visit.clear': 'Очистить',
      'visit.close': 'Закрыть',
      'visit.clearConfirm': 'Очистить всю историю посещений в этом браузере?',
      'visit.active': 'сейчас',
      'visit.sec': '{n} сек',
      'visit.min': '{n} мин',
      'visit.h': '{h} ч',
      'visit.hmin': '{h} ч {m} мин',
      'visit.device.mobile': 'телефон',
      'visit.device.desktop': 'ПК',
      'btn.readonly': 'Просмотр', 'btn.readonly.title': 'Только просмотр',
      'btn.readonly.edit': 'Редактировать', 'btn.readonly.titleEdit': 'Включить редактирование',
      'btn.theme': 'Тема', 'btn.theme.title': 'Светлая / тёмная тема',
      'locale.en': 'EN', 'locale.ru': 'RU',
      'currency.rub': '₽', 'currency.usd': '$',
      'fx.label': 'Курс ₽/$',
      'page.kicker': 'Калькулятор посадки Daogreen',
      'page.title': 'Планирование посадки и урожая',
      'page.sub': 'Каналы 110×55, поддоны 130×65, вертикальные фермы и экономика — в одном инструменте.',
      'tab.channels': 'Каналы',
      'tab.pallets': 'Поддоны',
      'tab.economics': 'Экономика',
      'tab.standards': 'Справочник',
      'tab.channels.tip': 'Посадка и геометрия · каналы 110×55',
      'tab.pallets.tip': 'Посадка и геометрия · поддоны 130×65',
      'tab.economics.tip': 'Экономика фермы',
      'tab.standards.tip': 'Справочник стандартов по культурам',
      'facility.label': 'Среда выращивания',
      'facility.greenhouse': 'Теплица',
      'facility.vertical': 'Вертикальная ферма',
      'badge.build': 'Сборка',
      'badge.channels': 'КАНАЛЫ',
      'badge.pallets': 'ПОДДОНЫ',
      'badge.economics': 'ЭКОНОМИКА',
      'badge.standards': 'СПРАВОЧНИК',
      'badge.catalog': 'справочник',
      'badge.sorts': 'сортов',
      'badge.noCatalog': 'НЕТ справочника!',
      'badge.plants': 'раст.',
      'badge.loading': 'Калькулятор · загрузка…',
      'auth.preview.banner': 'Режим предпросмотра — можно смотреть все вкладки. Для расчётов и правок войдите.',
      'auth.preview.login': 'Войти',
      'auth.gate.lead': 'Калькулятор посадки и экономики фермы',
      'auth.field.login': 'Логин',
      'auth.field.password': 'Пароль',
      'auth.submit': 'Войти',
      'auth.welcome': 'Добро пожаловать',
      'auth.successText': 'Контакты и ссылки:',
      'auth.openCalc': 'Открыть калькулятор',
      'auth.contact': 'Связаться',
      'auth.close': 'Закрыть',
      'auth.error.invalid': 'Неверный логин или пароль',
      'auth.error.notConfigured': 'Вход не настроен. Выполните npm run auth:config и обновите сайт на GitHub.',
      'auth.error.https': 'Нужен HTTPS или http://localhost (не file://).',
      'auth.error.clientCheck': 'Ошибка проверки пароля в браузере.',
      'auth.error.noConfig': 'Не загружен js/auth-client-config.js. В терминале: node _tools/write-auth-client-config.js daogreen пароль — затем Ctrl+F5.',
      'btn.logout': 'Выход',
      'btn.logoutTitle': 'Выйти из калькулятора',
      'issues.plantingStale': 'После импорта изменились параметры посадки ({fields}) — нажмите «Импорт из посадки».',
      'issues.priceZero': '«{name}»: цена продажи 0 — выручка и маржа будут нулевыми.',
      'issues.widthExceeds': 'Ширина системы превышает допустимый предел.',
      'issues.overlapBad': 'Сильное перекрытие шапок ({mm} мм).',
      'import.field.facility': 'режим',
      'import.field.appView': 'вкладка',
      'import.field.cv': 'сорт (теплица)',
      'import.field.vfCv': 'сорт (ВФ)',
      'import.field.palletCv': 'сорт (поддоны)',
      'import.field.germination': 'прорастание',
      'import.field.nursery': 'рассада',
      'import.field.day': 'дни в канале',
      'import.field.density': 'плотность',
      'import.field.cutInterval': 'интервал срезки',
      'import.field.multicut': 'мультисрезка',
      'import.field.nch': 'каналы',
      'import.field.temp': 'температура',
      'import.field.lighting': 'досветка',
      'import.field.targetDli': 'DLI',
      'import.field.targetPhotoperiod': 'фотопериод',
      'import.field.month': 'месяц',
      'import.field.ghUsefulArea': 'полезная площадь',
      'import.field.georgyMode': 'режим Георгия',
      'import.field.extraB': 'шаг ряда',
      'import.field.vfStd': 'стандарты ВФ',
      'import.field.palletStd': 'стандарты поддонов',
      'month.jan': 'янв', 'month.feb': 'фев', 'month.mar': 'мар', 'month.apr': 'апр',
      'month.may': 'май', 'month.jun': 'июн', 'month.jul': 'июл', 'month.aug': 'авг',
      'month.sep': 'сен', 'month.oct': 'окт', 'month.nov': 'ноя', 'month.dec': 'дек',
      'currency.note': 'В проекте суммы хранятся в ₽',
      'currency.activeUsd': 'Суммы в долларах США (USD)',
      'currency.activeRub': 'Суммы в рублях (₽)',
      'currency.btnUsd': '$ USD',
      'currency.btnRub': '₽ RUB',
      'econ.intro': 'Экономика считается отдельно от вкладки «Посадка»: плотность, урожай, свет и затраты вводите сами или «Импорт из посадки». Сорт в посадке не меняет цифры автоматически.',
      'econ.preset': 'Шаблон фермы:',
      'econ.sync': 'Импорт из посадки (все культуры)',
      'econ.sync.meta': 'Данные посадки от {time}: {name}, {facility}.',
      'econ.sync.stale': 'Изменено: {fields}. Нажмите «Импорт из посадки».',
      'econ.sync.fresh': 'Связь с посадкой актуальна.',
      'econ.fillAreas': 'Площадь из геометрии посадки',
      'econ.csv': 'Скачать CSV',
      'econ.section.general': 'Общие параметры',
      'econ.section.cultures': 'Состав фермы по культурам',
      'econ.cultures.intro': 'До 12 культур. Доли площади — не больше 100%. Расходники на посев: шт/м² × цена за горшок (семена, горшок, субстрат) — ориентир 3–6 за горшок, по умолчанию 4; сумма ÷ срок урожая с посева → в месяц на м². Урожай и свет — вручную или «Импорт из посадки» (в т.ч. культуры поддонов pl-*).',
      'econ.section.yield': 'Сводка урожая (из полей культур)',
      'econ.section.elec': 'Электроэнергия по категориям',
      'econ.section.payroll': 'Персонал, учёт и налоги',
      'econ.section.costs': 'Затраты (в месяц)',
      'econ.section.equipment': 'Оборудование и подготовка (разово)',
      'econ.section.results': 'Итог',
      'econ.section.sensitivity': 'Сценарии «что если»',
      'econ.section.payback': 'Окупаемость и cash-flow',
      'econ.zone.inputs': 'Параметры фермы',
      'econ.zone.results': 'Результаты и сценарии',
      'econ.section.advanced': 'Расширенная модель',
      'econ.priceKwh': 'Стоимость электроэнергии',
      'econ.rentMonth': 'Аренда помещения',
      'econ.staffCount': 'Персонал, чел.',
      'econ.staffSalary': 'Зарплата на человека',
      'econ.payrollTax': 'Отчисления с ФОТ 42,5%',
      'econ.logisticsMonth': 'Логистика',
      'econ.floorArea': 'Площадь фермы по полу, м²',
      'econ.plantingArea': 'Посевная полезная площадь, м²',
      'econ.wastePct': 'Брак / нереализованный урожай, %',
      'econ.wastePct.hint': 'Снижает продаваемый объём; себестоимость на чистый выпуск',
      'econ.salePrice': 'Цена продажи (по умолчанию)',
      'econ.salePrice.hint': 'Для всех культур; можно задать в строке',
      'econ.kwhPerM2Hour': 'Свет, кВт·ч/м²',
      'econ.kwhPerM2Hour.hint': 'Общий параметр: при изменении обновляет все культуры',
      'econ.lightHoursDay': 'Часы света',
      'econ.lightHoursDay.hint': 'Общий параметр: при изменении обновляет все культуры',
      'econ.amortMonths': 'Амортизация оборудования, мес',
      'econ.otherElecKw': 'Прочая электроэнергия, кВт',
      'econ.otherElecKw.hint': 'Вытяжка, кондиционирование',
      'econ.otherElecHoursDay': 'Часы работы в сутки',
      'econ.otherElecHoursDay.hint': 'Часов работы оборудования в сутки',
      'econ.otherMonth': 'Прочие расходы фермы',
      'econ.otherMonth.hint': 'Дезинфекция, хозрасходы',
      'econ.consumablesPerKg': 'Упаковка на проданный кг',
      'econ.consumablesPerKg.hint': 'Упаковка/этикетка на кг продажи (культуры в кг). Горшок и субстрат — в «₽/горшок» у культуры',
      'econ.consumablesPerPcs': 'Упаковка на проданную шт',
      'econ.consumablesPerPcs.hint': 'Упаковка/этикетка на шт продажи (микрозелень, салат в горшке и т.п.). Горшок/субстрат — в «₽/горшок» у культуры; для лотковых культур — «₽/лоток»',
      'econ.usnTax': 'УСН 6% с выручки',
      'econ.vatTax': 'НДС с выручки',
      'econ.vatInclusive': 'Цены с НДС (включён)',
      'econ.vatInclusive.hint': 'Если включено — цены в строках культур уже с НДС',
      'econ.vatPct': 'Ставка НДС, %',
      'econ.profitTax': 'Налог на прибыль',
      'econ.profitTaxPct': 'Ставка налога на прибыль, %',
      'econ.perMonth': '/мес',
      'econ.perKwh': '/кВт·ч',
      'econ.perKg': '/кг',
      'econ.perPcs': '/шт',
      'econ.perSqm': '/м²',
      'econ.perSqmMonth': '/м²·мес',
      'econ.perPot': '/горшок',
      'econ.perTray': '/лоток',
      'econ.equip.enable': 'Учитывать в себестоимости',
      'econ.equip.total': 'Итого',
      'econ.equip.head': 'Статья',
      'econ.equip.amount': 'Сумма',
      'econ.equip.custom': 'Свои статьи',
      'econ.equip.add': '+ Статья',
      'econ.cult.culture': 'Культура',
      'econ.cult.share': 'Доля, %',
      'econ.cult.areaSqm': 'Площадь, м²',
      'econ.areaMode.label': 'Распределение посевной площади',
      'econ.areaMode.aria': 'Способ задания площади культур',
      'econ.areaMode.pct': 'Доли, %',
      'econ.areaMode.sqm': 'Площадь, м²',
      'econ.cult.price': 'Цена',
      'econ.cult.density': 'Плотность, шт/м²',
      'econ.cult.yield': 'Масса одной срезки',
      'econ.cult.yieldPcs': 'Шт за срезку',
      'econ.cult.yieldCycle': 'Шт за цикл',
      'econ.cult.yieldCycleHint': 'Количество штук (лотков) с одного цикла на 1 м²',
      'econ.cult.interval': 'Интервал / цикл, сут',
      'econ.cult.lightKwh': 'кВт·ч/м²',
      'econ.cult.lightH': 'Часов света',
      'econ.unit.hPerDay': 'ч/сут',
      'econ.cult.consPot': 'Посев на 1 горшок',
      'econ.cult.consPot.lotHint': '₽/горшок на каждую проданную шт — попадает в себестоимость, строка «Расходники». Упаковка/этикетка — отдельно, «₽/шт» в затратах фермы',
      'econ.cult.consTray': 'Посев на 1 лоток',
      'econ.cult.consPcs': 'Расходники на 1 шт',
      'econ.cult.potLife': 'Срок жизни горшка, мес',
      'econ.addCulture': '+ Культура',
      'econ.addMix': '+ Микс салатов',
      'econ.warn.mixPctSum': 'Состав микса: сумма долей {pct}% (нужно 100%).',
      'econ.mix.title': 'Состав микса (внутри микса)',
      'econ.mix.add': '+ Компонент',
      'econ.mix.hint': '«Доля, %» — сколько выращиваете на ферме. «% в миксе» — рецепт упаковки (сумма 100%). Можно выращивать больше, чем идёт в микс.',
      'econ.mix.breakdownTitle': 'Детализация микса',
      'econ.mix.comp': 'Компонент',
      'econ.mix.sellKgMo': 'Продажа, кг/мес',
      'econ.mix.varCost': 'Перем. себест., ₽/кг',
      'econ.mix.fixedCost': 'Фикс., ₽/кг',
      'econ.mix.fullCost': 'Полная, ₽/кг',
      'econ.mix.total': 'Итого по миксу',
      'econ.mix.breakdownHint': '₽/кг по строкам — из «Доли» на ферме. «Итого по миксу» — взвешенная сумма по рецепту (% в миксе), себестоимость 1 кг готового микса. Урожай в кг/мес — фактический, только для справки.',
      'econ.mix.use': 'В микс',
      'econ.mix.pct': '% в миксе',
      'econ.mix.panel': 'Настройки микса',
      'econ.mix.panelHint': 'В карточках культур ниже отметьте «В микс» и долю.',
      'econ.warn.mixPctZero': 'Состав микса: укажите % для выбранных культур (иначе микс не считается).',
      'sum.revenue': 'Выручка / мес',
      'sum.opex': 'Затраты / мес',
      'sum.margin': 'Маржа / мес',
      'sum.marginPct': 'Маржа %',
      'sum.unitCost': 'Себестоимость',
      'sum.capex': 'CAPEX оборуд.',
      'sum.area': 'Посевная площадь',
      'sum.mode': 'Режим',
      'sum.env': 'Среда',
      'sum.mass': 'Масса урожая',
      'sum.plants': 'Растений',
      'sum.sysArea': 'Площадь системы',
      'sum.channels': 'Каналов',
      'sum.trays': 'Кассет',
      'sum.pallets': 'Поддонов',
      'sum.sales': 'Продажи',
      'sum.salesKg': 'Выпуск (кг)',
      'sum.salesMicroBaby': 'Выпуск · микрозелень и беби',
      'sum.salesFlowers': 'Выпуск · цветы',
      'sum.salesWheatgrass': 'Выпуск · витграсс',
      'sum.salesOtherPcs': 'Выпуск · прочее (шт)',
      'sum.unit.sqm': 'м²',
      'sum.unit.kgMo': 'кг/мес',
      'sum.unit.pcsMo': 'шт/мес',
      'sum.unit.kgSqmBe': 'кг/м²·мес',
      'sum.unit.pcsSqmBe': 'шт/м²·мес',
      'sum.breakEvenKgSqm': 'Безубыточность',
      'sum.breakEvenPcsSqm': 'Безубыточность',
      'sum.breakEvenRevenue': 'Безубыточность (выручка)',
      'sum.unit.g': 'г',
      'sum.unit.pcs': 'шт',
      'sum.unit.cells': 'яч.',
      'mode.economics': 'Экономика',
      'mode.standards': 'Справочник стандартов',
      'mode.pallets': 'Поддоны',
      'mode.vf': 'VF · каналы',
      'mode.gh': 'Теплица · каналы',
      'tour.skip': 'Пропустить', 'tour.back': 'Назад', 'tour.next': 'Далее', 'tour.done': 'Готово',
      'tour.step': 'Шаг'
    },
    en: {
      'btn.save': 'Save', 'btn.save.title': 'Save calculation in browser',
      'btn.menu': 'Menu', 'btn.menu.title': 'More actions',
      'btn.load': 'Load', 'btn.load.title': 'Load from browser',
      'btn.json': 'JSON', 'btn.json.title': 'Download project JSON',
      'btn.import': 'Import', 'btn.import.title': 'Load project file',
      'btn.compare': 'Compare', 'btn.compare.title': 'Compare two JSON projects',
      'btn.pdf': 'PDF', 'btn.pdf.title': 'Export selected sections to PDF',
      'btn.tour': 'Guide', 'btn.tour.title': 'Interface tour',
      'btn.visitHistory': 'History', 'btn.visitHistory.title': 'Visit history in this browser',
      'btn.qr': 'QR', 'btn.qr.title': 'QR for phone install',
      'visit.title': 'Visit history',
      'visit.lead': 'When you opened the calculator in this browser.',
      'visit.localNote': 'This device only — site-wide analytics are not shown here.',
      'visit.empty': 'No entries yet.',
      'visit.clear': 'Clear',
      'visit.close': 'Close',
      'visit.clearConfirm': 'Clear all visit history in this browser?',
      'visit.active': 'now',
      'visit.sec': '{n} sec',
      'visit.min': '{n} min',
      'visit.h': '{h} h',
      'visit.hmin': '{h} h {m} min',
      'visit.device.mobile': 'phone',
      'visit.device.desktop': 'desktop',
      'btn.readonly': 'View only', 'btn.readonly.title': 'Read-only mode',
      'btn.readonly.edit': 'Edit', 'btn.readonly.titleEdit': 'Enable editing',
      'btn.theme': 'Theme', 'btn.theme.title': 'Light / dark theme',
      'locale.en': 'EN', 'locale.ru': 'RU',
      'currency.rub': '₽', 'currency.usd': '$',
      'fx.label': '₽ per $',
      'page.kicker': 'Daogreen planting calculator',
      'page.title': 'Planting and yield planning',
      'page.sub': 'Channels 110×55, pallets 130×65, vertical farms and farm economics in one tool.',
      'tab.channels': 'Channels',
      'tab.pallets': 'Pallets',
      'tab.economics': 'Economics',
      'tab.standards': 'Catalog',
      'tab.channels.tip': 'Planting & geometry · 110×55 channels',
      'tab.pallets.tip': 'Planting & geometry · 130×65 pallets',
      'tab.economics.tip': 'Farm economics',
      'tab.standards.tip': 'Crop standards catalog',
      'facility.label': 'Growing environment',
      'facility.greenhouse': 'Greenhouse',
      'facility.vertical': 'Vertical farm',
      'badge.build': 'Build',
      'badge.channels': 'CHANNELS',
      'badge.pallets': 'PALLETS',
      'badge.economics': 'ECONOMICS',
      'badge.standards': 'CATALOG',
      'badge.catalog': 'catalog',
      'badge.sorts': 'cultivars',
      'badge.noCatalog': 'NO catalog!',
      'badge.plants': 'plants',
      'badge.loading': 'Calculator · loading…',
      'auth.preview.banner': 'Preview mode — browse all tabs. Sign in to edit and calculate.',
      'auth.preview.login': 'Sign in',
      'auth.gate.lead': 'Planting & farm economics calculator',
      'auth.field.login': 'Login',
      'auth.field.password': 'Password',
      'auth.submit': 'Sign in',
      'auth.welcome': 'Welcome',
      'auth.successText': 'Contacts & links:',
      'auth.openCalc': 'Open calculator',
      'auth.contact': 'Contact',
      'auth.close': 'Close',
      'auth.error.invalid': 'Invalid login or password',
      'auth.error.notConfigured': 'Sign-in not configured. Run npm run auth:config and redeploy.',
      'auth.error.https': 'HTTPS or http://localhost required (not file://).',
      'auth.error.clientCheck': 'Browser password check failed.',
      'auth.error.noConfig': 'js/auth-client-config.js not loaded. Run node _tools/write-auth-client-config.js in the project folder, then hard-refresh.',
      'btn.logout': 'Sign out',
      'btn.logoutTitle': 'Sign out of the calculator',
      'issues.plantingStale': 'Planting parameters changed after import ({fields}) — click «Import from planting».',
      'issues.priceZero': '«{name}»: sale price is 0 — revenue and margin will be zero.',
      'issues.widthExceeds': 'System width exceeds the allowed limit.',
      'issues.overlapBad': 'Heavy canopy overlap ({mm} mm).',
      'import.field.facility': 'mode',
      'import.field.appView': 'tab',
      'import.field.cv': 'cultivar (greenhouse)',
      'import.field.vfCv': 'cultivar (VF)',
      'import.field.palletCv': 'cultivar (pallets)',
      'import.field.germination': 'germination',
      'import.field.nursery': 'nursery',
      'import.field.day': 'channel days',
      'import.field.density': 'density',
      'import.field.cutInterval': 'cut interval',
      'import.field.multicut': 'multicut',
      'import.field.nch': 'channels',
      'import.field.temp': 'temperature',
      'import.field.lighting': 'supplemental light',
      'import.field.targetDli': 'DLI',
      'import.field.targetPhotoperiod': 'photoperiod',
      'import.field.month': 'month',
      'import.field.ghUsefulArea': 'useful area',
      'import.field.georgyMode': 'Georgy mode',
      'import.field.extraB': 'row pitch',
      'import.field.vfStd': 'VF standards',
      'import.field.palletStd': 'pallet standards',
      'month.jan': 'Jan', 'month.feb': 'Feb', 'month.mar': 'Mar', 'month.apr': 'Apr',
      'month.may': 'May', 'month.jun': 'Jun', 'month.jul': 'Jul', 'month.aug': 'Aug',
      'month.sep': 'Sep', 'month.oct': 'Oct', 'month.nov': 'Nov', 'month.dec': 'Dec',
      'currency.note': 'Project amounts are stored in ₽',
      'currency.activeUsd': 'Amounts in US dollars (USD)',
      'currency.activeRub': 'Amounts in Russian rubles (₽)',
      'currency.btnUsd': '$ USD',
      'currency.btnRub': '₽ RUB',
      'econ.intro': 'Economics is separate from Planting: enter density, yield, light and costs yourself or use Import from planting. Cultivar in planting does not auto-update numbers.',
      'econ.preset': 'Farm template:',
      'econ.sync': 'Import from planting (all crops)',
      'econ.sync.meta': 'Planting data from {time}: {name}, {facility}.',
      'econ.sync.stale': 'Changed: {fields}. Click «Import from planting».',
      'econ.sync.fresh': 'In sync with planting tab.',
      'econ.fillAreas': 'Area from planting geometry',
      'econ.csv': 'Download CSV',
      'econ.section.general': 'General parameters',
      'econ.section.cultures': 'Farm crop mix',
      'econ.cultures.intro': 'Up to 12 crops. Area shares must not exceed 100%. Sowing consumables: pcs/m² × price per pot (seed, pot, substrate) — typical 3–6 per pot, default 4; total ÷ months to harvest from sowing → per m² per month. Yield and light — manual or Import from planting (incl. pallet crops pl-*).',
      'econ.section.yield': 'Yield summary (from crop fields)',
      'econ.section.elec': 'Electricity by category',
      'econ.section.payroll': 'Staff, accounting & taxes',
      'econ.section.costs': 'Costs (monthly)',
      'econ.section.equipment': 'Equipment & setup (one-time)',
      'econ.section.results': 'Summary',
      'econ.section.sensitivity': 'What-if scenarios',
      'econ.section.payback': 'Payback and cash flow',
      'econ.zone.inputs': 'Farm parameters',
      'econ.zone.results': 'Results and scenarios',
      'econ.section.advanced': 'Advanced model',
      'econ.priceKwh': 'Electricity cost',
      'econ.rentMonth': 'Facility rent',
      'econ.staffCount': 'Staff, people',
      'econ.staffSalary': 'Salary per person',
      'econ.payrollTax': 'Payroll taxes 42.5%',
      'econ.logisticsMonth': 'Logistics',
      'econ.floorArea': 'Floor area, m²',
      'econ.plantingArea': 'Planting area, m²',
      'econ.wastePct': 'Waste / unsold, %',
      'econ.wastePct.hint': 'Reduces sellable volume; cost per net output',
      'econ.salePrice': 'Default sale price',
      'econ.salePrice.hint': 'For all crops; override per row',
      'econ.kwhPerM2Hour': 'Light, kWh/m²',
      'econ.kwhPerM2Hour.hint': 'Global: changing updates all culture rows',
      'econ.lightHoursDay': 'Light hours',
      'econ.lightHoursDay.hint': 'Global: changing updates all culture rows',
      'econ.amortMonths': 'Equipment amortization, mo',
      'econ.otherElecKw': 'Other electricity, kW',
      'econ.otherElecKw.hint': 'HVAC, exhaust',
      'econ.otherElecHoursDay': 'Hours per day',
      'econ.otherElecHoursDay.hint': 'Equipment run hours per day',
      'econ.otherMonth': 'Other farm costs',
      'econ.otherMonth.hint': 'Sanitation, supplies',
      'econ.consumablesPerKg': 'Packaging per sold kg',
      'econ.consumablesPerKg.hint': 'Packaging/labels per kg sold (kg crops). Pot/substrate — per-pot field on crop',
      'econ.consumablesPerPcs': 'Packaging per sold unit',
      'econ.consumablesPerPcs.hint': 'Packaging/labels per piece sold (microgreens, potted salad, etc.). Pot/substrate — per-pot on crop; tray crops — per-tray',
      'econ.usnTax': 'Simplified tax 6% of revenue',
      'econ.vatTax': 'VAT on revenue',
      'econ.vatInclusive': 'Prices include VAT',
      'econ.vatInclusive.hint': 'When on — culture prices are VAT-inclusive',
      'econ.vatPct': 'VAT rate, %',
      'econ.profitTax': 'Profit tax',
      'econ.profitTaxPct': 'Profit tax rate, %',
      'econ.perMonth': '/mo',
      'econ.perKwh': '/kWh',
      'econ.perKg': '/kg',
      'econ.perPcs': '/pc',
      'econ.perSqm': '/m²',
      'econ.perSqmMonth': '/m²·mo',
      'econ.perPot': '/pot',
      'econ.perTray': '/tray',
      'econ.equip.enable': 'Include in unit cost',
      'econ.equip.total': 'Total',
      'econ.equip.head': 'Item',
      'econ.equip.amount': 'Amount',
      'econ.equip.custom': 'Custom items',
      'econ.equip.add': '+ Item',
      'econ.cult.culture': 'Crop',
      'econ.cult.share': 'Share, %',
      'econ.cult.areaSqm': 'Area, m²',
      'econ.areaMode.label': 'Planting area split',
      'econ.areaMode.aria': 'How to assign crop areas',
      'econ.areaMode.pct': 'Shares, %',
      'econ.areaMode.sqm': 'Area, m²',
      'econ.cult.price': 'Price',
      'econ.cult.density': 'Density, pots/m²',
      'econ.cult.yield': 'Yield per cut',
      'econ.cult.yieldPcs': 'Pcs per cut',
      'econ.cult.yieldCycle': 'Pcs per cycle',
      'econ.cult.yieldCycleHint': 'Pieces (trays) per cycle per m²',
      'econ.cult.interval': 'Interval / cycle, d',
      'econ.cult.lightKwh': 'kWh/m²',
      'econ.cult.lightH': 'Light hours',
      'econ.unit.hPerDay': 'h/d',
      'econ.cult.consPot': 'Sowing per pot',
      'econ.cult.consPot.lotHint': '₽/pot per unit sold — in unit cost under “Consumables”. Packaging/labels — separate “per unit” farm cost',
      'econ.cult.consTray': 'Sowing per tray',
      'econ.cult.consPcs': 'Consumables per pc',
      'econ.cult.potLife': 'Pot life, mo',
      'econ.addCulture': '+ Crop',
      'econ.addMix': '+ Salad mix',
      'econ.warn.mixPctSum': 'Mix composition: shares sum to {pct}% (should be 100%).',
      'econ.mix.title': 'Mix composition (inside the mix)',
      'econ.mix.add': '+ Component',
      'econ.mix.hint': '“Share, %” is how much you grow on the farm. “% in mix” is the pack recipe (must sum to 100%). You can grow more than goes into the mix.',
      'econ.mix.breakdownTitle': 'Mix breakdown',
      'econ.mix.comp': 'Component',
      'econ.mix.sellKgMo': 'Sellable, kg/mo',
      'econ.mix.varCost': 'Variable cost, ₽/kg',
      'econ.mix.fixedCost': 'Fixed, ₽/kg',
      'econ.mix.fullCost': 'Full, ₽/kg',
      'econ.mix.total': 'Mix total',
      'econ.mix.breakdownHint': '₽/kg per row comes from farm share. “Mix total” is recipe-weighted (% in mix) — cost of 1 kg of finished mix. kg/mo is actual output for reference only.',
      'econ.mix.use': 'Use in mix',
      'econ.mix.pct': '% in mix',
      'econ.mix.panel': 'Mix settings',
      'econ.mix.panelHint': 'In crop cards below, check «Use in mix» and set share.',
      'econ.warn.mixPctZero': 'Mix composition: set % for selected crops (otherwise mix is not calculated).',
      'sum.revenue': 'Revenue / mo',
      'sum.opex': 'Costs / mo',
      'sum.margin': 'Margin / mo',
      'sum.marginPct': 'Margin %',
      'sum.unitCost': 'Unit cost',
      'sum.capex': 'Equipment CAPEX',
      'sum.area': 'Planting area',
      'sum.mode': 'Mode',
      'sum.env': 'Environment',
      'sum.mass': 'Harvest mass',
      'sum.plants': 'Plants',
      'sum.sysArea': 'System area',
      'sum.channels': 'Channels',
      'sum.trays': 'Tray cells',
      'sum.pallets': 'Pallets',
      'sum.sales': 'Sales',
      'sum.salesKg': 'Output (kg)',
      'sum.salesMicroBaby': 'Output · microgreens & baby',
      'sum.salesFlowers': 'Output · flowers',
      'sum.salesWheatgrass': 'Output · wheatgrass',
      'sum.salesOtherPcs': 'Output · other (pcs)',
      'sum.unit.sqm': 'm²',
      'sum.unit.kgMo': 'kg/mo',
      'sum.unit.pcsMo': 'pcs/mo',
      'sum.unit.kgSqmBe': 'kg/m²·mo',
      'sum.unit.pcsSqmBe': 'pcs/m²·mo',
      'sum.breakEvenKgSqm': 'Break-even',
      'sum.breakEvenPcsSqm': 'Break-even',
      'sum.breakEvenRevenue': 'Break-even (revenue)',
      'sum.unit.g': 'g',
      'sum.unit.pcs': 'pcs',
      'sum.unit.cells': 'cells',
      'mode.economics': 'Economics',
      'mode.standards': 'Standards catalog',
      'mode.pallets': 'Pallets',
      'mode.vf': 'VF · channels',
      'mode.gh': 'Greenhouse · channels',
      'tour.skip': 'Skip', 'tour.back': 'Back', 'tour.next': 'Next', 'tour.done': 'Done',
      'tour.step': 'Step'
    }
  };

  function mergeI18nExtras(){
    var bags = [global.I18N_ECON_EXTRA, global.I18N_RECS_EXTRA];
    bags.forEach(function(ex){
      if (!ex) return;
      ['ru', 'en'].forEach(function(loc){
        if (!ex[loc]) return;
        Object.keys(ex[loc]).forEach(function(k){ STR[loc][k] = ex[loc][k]; });
      });
    });
  }
  mergeI18nExtras();

  var TOUR_KEYS = [
    { title: 'tour.0.title', body: 'tour.0.body', target: null },
    { title: 'tour.1.title', body: 'tour.1.body', target: '#app-tabs' },
    { title: 'tour.2.title', body: 'tour.2.body', target: '.masthead-actions' },
    { title: 'tour.3.title', body: 'tour.3.body', target: '#btn-export-pdf' },
    { title: 'tour.4.title', body: 'tour.4.body', target: '#facility-env-wrap' },
    { title: 'tour.5.title', body: 'tour.5.body', target: '#panel-cultivars' },
    { title: 'tour.6.title', body: 'tour.6.body', target: '#panel-culture' },
    { title: 'tour.7.title', body: 'tour.7.body', target: '#panel-metrics' },
    { title: 'tour.8.title', body: 'tour.8.body', target: '#panel-schema' },
    { title: 'tour.9.title', body: 'tour.9.body', target: '#planting-econ-bridge' },
    { title: 'tour.10.title', body: 'tour.10.body', target: '#econ-sync-planting' },
    { title: 'tour.11.title', body: 'tour.11.body', target: '#econ-panel-cultures' },
    { title: 'tour.12.title', body: 'tour.12.body', target: '#econ-panel-results' },
    { title: 'tour.13.title', body: 'tour.13.body', target: '#econ-panel-advanced' },
    { title: 'tour.14.title', body: 'tour.14.body', target: '#btn-pwa-qr' },
    { title: 'tour.15.title', body: 'tour.15.body', target: null }
  ];

  var TOUR_TEXT = {
    ru: {
      'tour.0.title': 'Добро пожаловать', 'tour.0.body': 'Калькулятор Daogreen: посадка, экономика, PDF и проекты. Запускайте через start-server.bat или хостинг — не двойным кликом по HTML.',
      'tour.1.title': 'Вкладки', 'tour.1.body': 'Каналы, поддоны 130×65 и экономика — один проект.',
      'tour.2.title': 'Сохранение', 'tour.2.body': 'Сохранить, JSON, импорт, сравнение двух проектов.',
      'tour.3.title': 'PDF', 'tour.3.body': 'Отчёт по выбранным разделам.',
      'tour.4.title': 'Среда', 'tour.4.body': 'Теплица или вертикальная ферма.',
      'tour.5.title': 'Сорт', 'tour.5.body': 'Культура и свой сорт.',
      'tour.6.title': 'Параметры', 'tour.6.body': 'Ползунки и стандарты VF.',
      'tour.7.title': 'Итоги', 'tour.7.body': 'Масса, плотность, растения.',
      'tour.8.title': 'Схема', 'tour.8.body': 'Вид сверху.',
      'tour.9.title': 'Мост', 'tour.9.body': 'Импорт в экономику из посадки.',
      'tour.10.title': 'Импорт в экономику', 'tour.10.body': 'Кнопка «Импорт из посадки» переносит урожай и площади.',
      'tour.11.title': 'Культуры', 'tour.11.body': 'До 6 культур, доли %.',
      'tour.12.title': 'Итог', 'tour.12.body': 'Маржа, «что если», окупаемость.',
      'tour.13.title': 'Расширения', 'tour.13.body': 'Сезонность, площадки, каналы, инфляция.',
      'tour.14.title': 'PWA', 'tour.14.body': 'QR для телефона (HTTPS).',
      'tour.15.title': 'Готово', 'tour.15.body': 'Сборка внизу справа. Ctrl+F5 после обновления.'
    },
    en: {
      'tour.0.title': 'Welcome', 'tour.0.body': 'Daogreen calculator: planting, economics, PDF, projects. Use start-server.bat or hosting — not file://.',
      'tour.1.title': 'Tabs', 'tour.1.body': 'Channels, pallets 130×65, economics — one project.',
      'tour.2.title': 'Save', 'tour.2.body': 'Save, JSON export/import, compare two projects.',
      'tour.3.title': 'PDF', 'tour.3.body': 'Export selected sections.',
      'tour.4.title': 'Environment', 'tour.4.body': 'Greenhouse or vertical farm.',
      'tour.5.title': 'Cultivar', 'tour.5.body': 'Crop and custom cultivar.',
      'tour.6.title': 'Parameters', 'tour.6.body': 'Sliders and VF standards.',
      'tour.7.title': 'Metrics', 'tour.7.body': 'Mass, density, plant count.',
      'tour.8.title': 'Layout', 'tour.8.body': 'Top view schema.',
      'tour.9.title': 'Bridge', 'tour.9.body': 'Import planting data into economics.',
      'tour.10.title': 'Import to economics', 'tour.10.body': '«Import from planting» brings yield and areas over.',
      'tour.11.title': 'Crops', 'tour.11.body': 'Up to 6 crops, area shares.',
      'tour.12.title': 'Results', 'tour.12.body': 'Margin, sensitivity, payback.',
      'tour.13.title': 'Advanced', 'tour.13.body': 'Seasonality, sites, channels, inflation.',
      'tour.14.title': 'PWA', 'tour.14.body': 'QR for phone (HTTPS).',
      'tour.15.title': 'Done', 'tour.15.body': 'Build badge bottom-right. Ctrl+F5 after updates.'
    }
  };

  var _parseNum = null;
  var _formatInput = null;
  var _onChange = null;

  function getLocale(){
    try {
      var v = localStorage.getItem(LOCALE_KEY);
      return v === 'en' ? 'en' : 'ru';
    } catch(_){ return 'ru'; }
  }

  function getCurrency(){
    try {
      var v = localStorage.getItem(CURRENCY_KEY);
      return v === 'USD' ? 'USD' : 'RUB';
    } catch(_){ return 'RUB'; }
  }

  function getFxRate(){
    try {
      var v = parseFloat(localStorage.getItem(FX_KEY));
      return v > 0 ? v : DEFAULT_FX;
    } catch(_){ return DEFAULT_FX; }
  }

  function setLocale(loc){
    try { localStorage.setItem(LOCALE_KEY, loc === 'en' ? 'en' : 'ru'); } catch(_){}
    document.documentElement.lang = getLocale();
    fireChange();
  }

  function setCurrency(cur){
    try { localStorage.setItem(CURRENCY_KEY, cur === 'USD' ? 'USD' : 'RUB'); } catch(_){}
    fireChange();
  }

  function setFxRate(n){
    var v = parseFloat(n);
    if (!(v > 0)) v = DEFAULT_FX;
    try { localStorage.setItem(FX_KEY, String(v)); } catch(_){}
    fireChange();
  }

  function t(key){
    var loc = getLocale();
    var bag = STR[loc] || STR.ru;
    if (bag[key] != null) return bag[key];
    if (loc !== 'ru' && STR.ru[key] != null) return STR.ru[key];
    var tour = TOUR_TEXT[loc] || TOUR_TEXT.ru;
    if (tour[key] != null) return tour[key];
    if (typeof global.DG_plantT === 'function'){
      var p = global.DG_plantT(key);
      if (p !== key) return p;
    }
    if (typeof global.DG_uiT === 'function'){
      var u = global.DG_uiT(key);
      if (u !== key) return u;
    }
    return key;
  }

  function tFmt(key, vars){
    var s = t(key);
    if (vars){
      Object.keys(vars).forEach(function(k){
        s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
      });
    }
    return s;
  }

  function localeToken(){
    return getLocale() + '-' + getCurrency() + '-' + getFxRate();
  }

  function rubToDisplay(rub){
    if (getCurrency() !== 'USD') return rub;
    return rub / getFxRate();
  }

  function displayToRub(display){
    if (getCurrency() !== 'USD') return display;
    return display * getFxRate();
  }

  function currencySym(){
    return getCurrency() === 'USD' ? '$' : '₽';
  }

  function moneySuffix(per){
    return currencySym() + (per || '');
  }

  function isMoneyEconKey(k){ return !!MONEY_ECON_KEYS[k]; }
  function isMoneyCultField(f){ return !!MONEY_CULT_FIELDS[f]; }
  function isMoneyEq(){ return true; }

  function fmtNumLocale(n, opts){
    opts = opts || {};
    if (n == null || n === '' || isNaN(n)) return opts.empty != null ? opts.empty : '—';
    var d = opts.decimals != null ? opts.decimals : 0;
    var num = Number(n);
    if (!isFinite(num)) return opts.empty || '—';
    var neg = num < 0;
    num = Math.abs(num);
    var en = getLocale() === 'en';
    var raw = d > 0 ? num.toFixed(d) : String(Math.round(num));
    var parts = raw.split('.');
    if (en){
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      var body = parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
      return neg ? '−' + body : body;
    }
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    var bodyRu = parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
    return neg ? '−' + bodyRu : bodyRu;
  }

  function parseNumLocale(str){
    if (_parseNum) return _parseNum(str);
    if (str == null || str === '') return NaN;
    var s = String(str).replace(/\s/g, '');
    if (getLocale() === 'en') return parseFloat(s.replace(/,/g, ''));
    return parseFloat(s.replace(',', '.'));
  }

  function formatInputLocale(n, decimals){
    if (_formatInput) return _formatInput(n, decimals);
    if (n == null || n === '' || isNaN(n)) return '';
    return fmtNumLocale(n, { decimals: decimals });
  }

  function fmtMoney(rub, opts){
    opts = opts || {};
    var n = fmtNumLocale(rubToDisplay(rub), opts);
    var sym = currencySym();
    if (getCurrency() === 'USD') return sym + '\u00a0' + n;
    return n + '\u00a0' + sym;
  }

  /** Сумма с единицей (/кг, /м²…) — без повторного символа валюты */
  function fmtMoneyPer(rub, perKey, opts){
    var per = perKey ? t(perKey) : '';
    if (!per && perKey) per = perKey;
    return fmtMoney(rub, opts) + per;
  }

  function fmtMoneyPlain(rub, opts){
    return fmtNumLocale(rubToDisplay(rub), opts);
  }

  function parseMoneyInput(str){
    var v = parseNumLocale(str);
    if (isNaN(v)) return NaN;
    return displayToRub(v);
  }

  function formatMoneyInput(rub, decimals){
    return formatInputLocale(rubToDisplay(rub), decimals);
  }

  function applyDomI18n(root){
    root = root || document;
    if (typeof document !== 'undefined'){
      document.title = t('page.htmlTitle');
    }
    var themeLbl = document.querySelector('.theme-toggle-label');
    if (themeLbl) themeLbl.textContent = t('btn.theme');
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.setAttribute('aria-label', t('btn.theme.aria'));
    var facBar = document.getElementById('facility-bar');
    if (facBar) facBar.setAttribute('aria-label', t('facility.ariaType'));
    root.querySelectorAll('[data-i18n]').forEach(function(el){
      if (el.id === 'calc-build-badge') return;
      var key = el.getAttribute('data-i18n');
      var attr = el.getAttribute('data-i18n-attr');
      var val = t(key);
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });
    root.querySelectorAll('[data-i18n-tip]').forEach(function(el){
      var tipKey = el.getAttribute('data-i18n-tip');
      if (tipKey) el.title = t(tipKey);
    });
    var logout = document.getElementById('btn-logout');
    if (logout) {
      logout.textContent = t('btn.logout');
      logout.title = t('btn.logoutTitle');
    }
    var authLead = document.querySelector('.app-auth-lead');
    if (authLead) authLead.textContent = t('auth.gate.lead');
    var authLoginLbl = document.querySelector('#app-auth-form label:nth-child(1) span');
    if (authLoginLbl) authLoginLbl.textContent = t('auth.field.login');
    var authPassLbl = document.querySelector('#app-auth-form label:nth-child(2) span');
    if (authPassLbl) authPassLbl.textContent = t('auth.field.password');
    var authSubmit = document.querySelector('.app-auth-submit');
    if (authSubmit) authSubmit.textContent = t('auth.submit');
    var authWelcome = document.querySelector('.app-auth-success-title');
    if (authWelcome) authWelcome.textContent = t('auth.welcome');
    var authSuccessText = document.querySelector('.app-auth-success-text');
    if (authSuccessText) authSuccessText.textContent = t('auth.successText');
    var authEnter = document.getElementById('app-auth-enter');
    if (authEnter) authEnter.textContent = t('auth.openCalc');
    var authContact = document.querySelector('.app-auth-links-title');
    if (authContact) authContact.textContent = t('auth.contact');
    var authClose = document.getElementById('app-auth-gate-close');
    if (authClose) {
      authClose.setAttribute('aria-label', t('auth.close'));
      authClose.title = t('auth.close');
    }
  }

  function invalidateDynamicForms(){
    ['econ-inputs-general', 'econ-inputs-costs'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) delete el.dataset.built;
    });
    var adv = document.getElementById('econ-advanced-body');
    if (adv) delete adv.dataset.built;
    var sensPanel = document.getElementById('econ-panel-sensitivity');
    if (sensPanel) delete sensPanel.dataset.sensBound;
    var ve = document.getElementById('view-economics');
    if (ve){
      delete ve.dataset.eqBound;
      ve.querySelectorAll('[data-econ-bound]').forEach(function(inp){ delete inp.dataset.econBound; });
    }
    document.querySelectorAll('#econ-cultures-list[data-econ-cultures-bound]').forEach(function(el){
      delete el.dataset.econCulturesBound;
    });
  }

  function syncCurrencyUi(){
    var banner = document.getElementById('currency-active-banner');
    if (banner){
      if (getCurrency() === 'USD'){
        banner.textContent = t('currency.activeUsd') + ' · 1 $ = ' + getFxRate() + ' ₽';
        banner.hidden = false;
      } else {
        banner.hidden = true;
      }
    }
    document.querySelectorAll('.econ-equip-total-unit').forEach(function(el){
      el.textContent = currencySym();
    });
    var eqSec = document.querySelector('#econ-panel-equipment .section-h');
    if (eqSec){
      var base = t('econ.section.equipment');
      eqSec.textContent = base + ' (' + currencySym() + ')';
    }
    if (typeof global.DG_syncScenarioPriceUnits === 'function') global.DG_syncScenarioPriceUnits();
  }

  function fireChange(){
    if (typeof global.DG_applyUiI18n === 'function') global.DG_applyUiI18n();
    else {
      applyDomI18n();
      if (typeof global.DG_applyPlantingI18n === 'function') global.DG_applyPlantingI18n();
    }
    if (typeof global.DG_syncReadonlyI18n === 'function') global.DG_syncReadonlyI18n();
    if (typeof global.DG_syncAuthPreviewI18n === 'function') global.DG_syncAuthPreviewI18n();
    syncCurrencyUi();
    invalidateDynamicForms();
    if (typeof _onChange === 'function') _onChange();
  }

  function getTourSteps(){
    return TOUR_KEYS.map(function(s){
      return { title: t(s.title), body: t(s.body), target: s.target };
    });
  }

  function initLocale(opts){
    opts = opts || {};
    _parseNum = opts.parseNumInput || null;
    _formatInput = opts.formatInputValue || null;
    _onChange = opts.onChange || null;
    document.documentElement.lang = getLocale();
    if (typeof global.DG_applyUiI18n === 'function') global.DG_applyUiI18n();
    else applyDomI18n();
    var bar = document.getElementById('locale-bar');
    if (!bar) return;
    var locBtn = document.getElementById('btn-locale-toggle');
    var curBtn = document.getElementById('btn-currency-toggle');
    var fxInp = document.getElementById('locale-fx-rate');
    if (fxInp){
      fxInp.value = String(getFxRate());
      fxInp.addEventListener('change', function(){
        setFxRate(fxInp.value);
        fxInp.value = String(getFxRate());
      });
    }
    function syncToggleBtns(){
      if (locBtn) locBtn.textContent = getLocale() === 'en' ? t('locale.ru') : t('locale.en');
      if (curBtn){
        curBtn.textContent = getCurrency() === 'USD' ? t('currency.btnRub') : t('currency.btnUsd');
        curBtn.title = getCurrency() === 'USD' ? t('currency.activeUsd') : t('currency.activeRub');
      }
      if (fxInp) fxInp.value = String(getFxRate());
      var fxWrap = document.getElementById('locale-fx-wrap');
      if (fxWrap) fxWrap.style.display = getCurrency() === 'USD' ? '' : 'none';
    }
    if (locBtn && !locBtn.dataset.localeWired){
      locBtn.dataset.localeWired = '1';
      locBtn.addEventListener('click', function(){
        setLocale(getLocale() === 'en' ? 'ru' : 'en');
        syncToggleBtns();
      });
    }
    if (curBtn && !curBtn.dataset.localeWired){
      curBtn.dataset.localeWired = '1';
      curBtn.addEventListener('click', function(){
        setCurrency(getCurrency() === 'USD' ? 'RUB' : 'USD');
        syncToggleBtns();
      });
    }
    syncToggleBtns();
  }

  global.DG_getLocale = getLocale;
  global.DG_getCurrency = getCurrency;
  global.DG_getFxRate = getFxRate;
  global.DG_setLocale = setLocale;
  global.DG_setCurrency = setCurrency;
  global.DG_setFxRate = setFxRate;
  global.DG_t = t;
  global.DG_tFmt = tFmt;
  global.DG_localeToken = localeToken;
  global.DG_currencySym = currencySym;
  global.DG_moneySuffix = moneySuffix;
  global.DG_fmtNumLocale = fmtNumLocale;
  global.DG_fmtMoney = fmtMoney;
  global.DG_fmtMoneyPer = fmtMoneyPer;
  global.DG_fmtMoneyPlain = fmtMoneyPlain;
  global.DG_syncCurrencyUi = syncCurrencyUi;
  global.DG_parseMoneyInput = parseMoneyInput;
  global.DG_formatMoneyInput = formatMoneyInput;
  global.DG_isMoneyEconKey = isMoneyEconKey;
  global.DG_isMoneyCultField = isMoneyCultField;
  global.DG_rubToDisplay = rubToDisplay;
  global.DG_applyDomI18n = applyDomI18n;
  global.DG_getTourSteps = getTourSteps;
  global.DG_initLocale = initLocale;
})(typeof window !== 'undefined' ? window : this);
