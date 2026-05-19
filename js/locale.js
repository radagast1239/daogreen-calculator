/** Язык (ru/en) и отображение валюты (RUB/USD). Расчёт и JSON — всегда в ₽. */
(function(global){
  'use strict';

  var LOCALE_KEY = 'daogreen-locale';
  var CURRENCY_KEY = 'daogreen-currency';
  var FX_KEY = 'daogreen-fx-rub-usd';
  var DEFAULT_FX = 90;

  var MONEY_ECON_KEYS = {
    priceKwh: 1, rentMonth: 1, staffSalary: 1, logisticsMonth: 1, salePrice: 1,
    otherMonth: 1, consumablesPerKg: 1
  };
  var MONEY_CULT_FIELDS = { salePrice: 1, consumablesPerPot: 1 };

  var STR = {
    ru: {
      'btn.save': 'Сохранить', 'btn.save.title': 'Сохранить расчёт в браузере',
      'btn.load': 'Загрузить', 'btn.load.title': 'Загрузить из браузера',
      'btn.json': 'JSON', 'btn.json.title': 'Скачать файл проекта JSON',
      'btn.import': 'Импорт', 'btn.import.title': 'Загрузить файл проекта',
      'btn.compare': 'Сравнить', 'btn.compare.title': 'Сравнить два проекта JSON',
      'btn.pdf': 'PDF', 'btn.pdf.title': 'Сохранить выбранные разделы в PDF',
      'btn.tour': 'Гайд', 'btn.tour.title': 'Гайд по интерфейсу',
      'btn.qr': 'QR', 'btn.qr.title': 'QR для установки на телефон',
      'btn.readonly': 'Просмотр', 'btn.readonly.title': 'Только просмотр',
      'btn.readonly.edit': 'Редактировать', 'btn.readonly.titleEdit': 'Включить редактирование',
      'btn.theme': 'Тема', 'btn.theme.title': 'Светлая / тёмная тема',
      'locale.en': 'EN', 'locale.ru': 'RU',
      'currency.rub': '₽', 'currency.usd': '$',
      'fx.label': 'Курс ₽/$',
      'page.kicker': 'Калькулятор посадки Daogreen',
      'page.title': 'Планирование посадки и урожая',
      'page.sub': 'Каналы 110×55, поддоны 130×65, вертикальные фермы и экономика — в одном инструменте.',
      'tab.channels': 'Посадка и геометрия · каналы',
      'tab.pallets': 'Посадка и геометрия · поддоны 130×65',
      'tab.economics': 'Экономика',
      'bridge.title': 'Экономика фермы',
      'bridge.hint': '— перенос урожая и площади из посадки',
      'bridge.open': 'Открыть экономику',
      'bridge.import': 'Импорт из посадки',
      'facility.label': 'Среда выращивания',
      'facility.greenhouse': 'Теплица',
      'facility.vertical': 'Вертикальная ферма',
      'badge.build': 'Сборка',
      'badge.channels': 'КАНАЛЫ',
      'badge.pallets': 'ПОДДОНЫ',
      'badge.economics': 'ЭКОНОМИКА',
      'badge.catalog': 'справочник',
      'badge.sorts': 'сортов',
      'badge.noCatalog': 'НЕТ справочника!',
      'badge.plants': 'раст.',
      'badge.loading': 'Калькулятор · загрузка…',
      'currency.note': 'В проекте суммы хранятся в ₽',
      'currency.activeUsd': 'Суммы в долларах США (USD)',
      'currency.activeRub': 'Суммы в рублях (₽)',
      'currency.btnUsd': '$ USD',
      'currency.btnRub': '₽ RUB',
      'econ.intro': 'Экономика считается отдельно от вкладки «Посадка»: плотность, урожай, свет и затраты вводите сами или «Импорт из посадки». Сорт в посадке не меняет цифры автоматически.',
      'econ.preset': 'Шаблон фермы:',
      'econ.sync': 'Импорт из посадки (все культуры)',
      'econ.fillAreas': 'Площадь из геометрии посадки',
      'econ.csv': 'Скачать CSV',
      'econ.section.general': 'Общие параметры',
      'econ.section.cultures': 'Состав фермы по культурам',
      'econ.cultures.intro': 'До 6 культур. Доли площади — не больше 100%. Расходники на посев: шт/м² × цена за горшок (семена, горшок, субстрат) — ориентир 3–6 за горшок, по умолчанию 4; сумма ÷ срок урожая с посева → в месяц на м². Урожай и свет — вручную или «Импорт из посадки» (в т.ч. культуры поддонов pl-*).',
      'econ.section.yield': 'Сводка урожая (из полей культур)',
      'econ.section.costs': 'Затраты (в месяц)',
      'econ.section.equipment': 'Оборудование и подготовка (разово)',
      'econ.section.results': 'Итог',
      'econ.section.sensitivity': 'Что если',
      'econ.section.payback': 'Окупаемость',
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
      'econ.kwhPerM2Hour': 'Свет по умолчанию, кВт·ч/м²·ч',
      'econ.kwhPerM2Hour.hint': 'При выборе сорта; в строке — своё',
      'econ.lightHoursDay': 'Часы света по умолчанию',
      'econ.lightHoursDay.hint': 'Для новых строк',
      'econ.amortMonths': 'Амортизация оборудования, мес',
      'econ.otherElecKw': 'Прочая электроэнергия, кВт',
      'econ.otherElecKw.hint': 'Вытяжка, кондиционирование',
      'econ.otherElecHoursDay': 'Часы работы в сутки',
      'econ.otherElecHoursDay.hint': 'Часов работы оборудования в сутки',
      'econ.otherMonth': 'Прочие расходы фермы',
      'econ.otherMonth.hint': 'Дезинфекция, хозрасходы',
      'econ.consumablesPerKg': 'Доп. на ед. продукции',
      'econ.consumablesPerKg.hint': 'Упаковка на единицу выпуска; в таблице — на м²·мес',
      'econ.usnTax': 'УСН 6% с выручки',
      'econ.perMonth': '/мес',
      'econ.perKwh': '/кВт·ч',
      'econ.perKg': '/кг',
      'econ.perPcs': '/шт',
      'econ.perSqm': '/м²',
      'econ.perSqmMonth': '/м²·мес',
      'econ.perPot': '/горшок',
      'econ.equip.enable': 'Учитывать в себестоимости',
      'econ.equip.total': 'Итого',
      'econ.equip.head': 'Статья',
      'econ.equip.amount': 'Сумма',
      'econ.equip.custom': 'Свои статьи',
      'econ.equip.add': '+ Статья',
      'econ.cult.culture': 'Культура',
      'econ.cult.share': 'Доля, %',
      'econ.cult.price': 'Цена',
      'econ.cult.density': 'Плотность, шт/м²',
      'econ.cult.yield': 'Масса одной срезки',
      'econ.cult.interval': 'Интервал / цикл, сут',
      'econ.cult.lightKwh': 'кВт·ч/м²·ч',
      'econ.cult.lightH': 'Часов света',
      'econ.cult.consPot': 'Посев на 1 горшок',
      'econ.cult.potLife': 'Срок жизни горшка, мес',
      'econ.addCulture': '+ Культура',
      'econ.addMix': '+ Микс салатов',
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
      'sum.unit.sqm': 'м²',
      'sum.unit.kgMo': 'кг/мес',
      'sum.unit.g': 'г',
      'sum.unit.pcs': 'шт',
      'sum.unit.cells': 'яч.',
      'mode.economics': 'Экономика',
      'mode.pallets': 'Поддоны',
      'mode.vf': 'VF · каналы',
      'mode.gh': 'Теплица · каналы',
      'tour.skip': 'Пропустить', 'tour.back': 'Назад', 'tour.next': 'Далее', 'tour.done': 'Готово',
      'tour.step': 'Шаг'
    },
    en: {
      'btn.save': 'Save', 'btn.save.title': 'Save calculation in browser',
      'btn.load': 'Load', 'btn.load.title': 'Load from browser',
      'btn.json': 'JSON', 'btn.json.title': 'Download project JSON',
      'btn.import': 'Import', 'btn.import.title': 'Load project file',
      'btn.compare': 'Compare', 'btn.compare.title': 'Compare two JSON projects',
      'btn.pdf': 'PDF', 'btn.pdf.title': 'Export selected sections to PDF',
      'btn.tour': 'Guide', 'btn.tour.title': 'Interface tour',
      'btn.qr': 'QR', 'btn.qr.title': 'QR for phone install',
      'btn.readonly': 'View only', 'btn.readonly.title': 'Read-only mode',
      'btn.readonly.edit': 'Edit', 'btn.readonly.titleEdit': 'Enable editing',
      'btn.theme': 'Theme', 'btn.theme.title': 'Light / dark theme',
      'locale.en': 'EN', 'locale.ru': 'RU',
      'currency.rub': '₽', 'currency.usd': '$',
      'fx.label': '₽ per $',
      'page.kicker': 'Daogreen planting calculator',
      'page.title': 'Planting and yield planning',
      'page.sub': 'Channels 110×55, pallets 130×65, vertical farms and farm economics in one tool.',
      'tab.channels': 'Planting & geometry · channels',
      'tab.pallets': 'Planting & geometry · pallets 130×65',
      'tab.economics': 'Economics',
      'bridge.title': 'Farm economics',
      'bridge.hint': '— import yield and area from planting',
      'bridge.open': 'Open economics',
      'bridge.import': 'Import from planting',
      'facility.label': 'Growing environment',
      'facility.greenhouse': 'Greenhouse',
      'facility.vertical': 'Vertical farm',
      'badge.build': 'Build',
      'badge.channels': 'CHANNELS',
      'badge.pallets': 'PALLETS',
      'badge.economics': 'ECONOMICS',
      'badge.catalog': 'catalog',
      'badge.sorts': 'cultivars',
      'badge.noCatalog': 'NO catalog!',
      'badge.plants': 'plants',
      'badge.loading': 'Calculator · loading…',
      'currency.note': 'Project amounts are stored in ₽',
      'currency.activeUsd': 'Amounts in US dollars (USD)',
      'currency.activeRub': 'Amounts in Russian rubles (₽)',
      'currency.btnUsd': '$ USD',
      'currency.btnRub': '₽ RUB',
      'econ.intro': 'Economics is separate from Planting: enter density, yield, light and costs yourself or use Import from planting. Cultivar in planting does not auto-update numbers.',
      'econ.preset': 'Farm template:',
      'econ.sync': 'Import from planting (all crops)',
      'econ.fillAreas': 'Area from planting geometry',
      'econ.csv': 'Download CSV',
      'econ.section.general': 'General parameters',
      'econ.section.cultures': 'Farm crop mix',
      'econ.cultures.intro': 'Up to 6 crops. Area shares must not exceed 100%. Sowing consumables: pcs/m² × price per pot (seed, pot, substrate) — typical 3–6 per pot, default 4; total ÷ months to harvest from sowing → per m² per month. Yield and light — manual or Import from planting (incl. pallet crops pl-*).',
      'econ.section.yield': 'Yield summary (from crop fields)',
      'econ.section.costs': 'Costs (monthly)',
      'econ.section.equipment': 'Equipment & setup (one-time)',
      'econ.section.results': 'Summary',
      'econ.section.sensitivity': 'What if',
      'econ.section.payback': 'Payback',
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
      'econ.kwhPerM2Hour': 'Default light, kWh/m²·h',
      'econ.kwhPerM2Hour.hint': 'On cultivar select; per-row override',
      'econ.lightHoursDay': 'Default light hours',
      'econ.lightHoursDay.hint': 'For new rows',
      'econ.amortMonths': 'Equipment amortization, mo',
      'econ.otherElecKw': 'Other electricity, kW',
      'econ.otherElecKw.hint': 'HVAC, exhaust',
      'econ.otherElecHoursDay': 'Hours per day',
      'econ.otherElecHoursDay.hint': 'Equipment run hours per day',
      'econ.otherMonth': 'Other farm costs',
      'econ.otherMonth.hint': 'Sanitation, supplies',
      'econ.consumablesPerKg': 'Extra per product unit',
      'econ.consumablesPerKg.hint': 'Packaging per sold unit; table shows per m²·mo',
      'econ.usnTax': 'Simplified tax 6% of revenue',
      'econ.perMonth': '/mo',
      'econ.perKwh': '/kWh',
      'econ.perKg': '/kg',
      'econ.perPcs': '/pc',
      'econ.perSqm': '/m²',
      'econ.perSqmMonth': '/m²·mo',
      'econ.perPot': '/pot',
      'econ.equip.enable': 'Include in unit cost',
      'econ.equip.total': 'Total',
      'econ.equip.head': 'Item',
      'econ.equip.amount': 'Amount',
      'econ.equip.custom': 'Custom items',
      'econ.equip.add': '+ Item',
      'econ.cult.culture': 'Crop',
      'econ.cult.share': 'Share, %',
      'econ.cult.price': 'Price',
      'econ.cult.density': 'Density, pots/m²',
      'econ.cult.yield': 'Yield per cut',
      'econ.cult.interval': 'Interval / cycle, d',
      'econ.cult.lightKwh': 'kWh/m²·h',
      'econ.cult.lightH': 'Light hours',
      'econ.cult.consPot': 'Sowing per pot',
      'econ.cult.potLife': 'Pot life, mo',
      'econ.addCulture': '+ Crop',
      'econ.addMix': '+ Salad mix',
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
      'sum.unit.sqm': 'm²',
      'sum.unit.kgMo': 'kg/mo',
      'sum.unit.g': 'g',
      'sum.unit.pcs': 'pcs',
      'sum.unit.cells': 'cells',
      'mode.economics': 'Economics',
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
    { title: 'tour.10.title', body: 'tour.10.body', target: '#econ-preset-bar' },
    { title: 'tour.11.title', body: 'tour.11.body', target: '#econ-panel-cultures' },
    { title: 'tour.12.title', body: 'tour.12.body', target: '#econ-panel-results' },
    { title: 'tour.13.title', body: 'tour.13.body', target: '#econ-panel-advanced' },
    { title: 'tour.14.title', body: 'tour.14.body', target: '#btn-pwa-qr' },
    { title: 'tour.15.title', body: 'tour.15.body', target: '#btn-readonly' },
    { title: 'tour.16.title', body: 'tour.16.body', target: null }
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
      'tour.10.title': 'Шаблоны', 'tour.10.body': '150 м², VF 300, теплица 500.',
      'tour.11.title': 'Культуры', 'tour.11.body': 'До 6 культур, доли %.',
      'tour.12.title': 'Итог', 'tour.12.body': 'Маржа, «что если», окупаемость.',
      'tour.13.title': 'Расширения', 'tour.13.body': 'Сезонность, площадки, каналы, инфляция.',
      'tour.14.title': 'PWA', 'tour.14.body': 'QR для телефона (HTTPS).',
      'tour.15.title': 'Просмотр', 'tour.15.body': 'Только чтение для показа.',
      'tour.16.title': 'Готово', 'tour.16.body': 'Сборка внизу справа. Ctrl+F5 после обновления.'
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
      'tour.10.title': 'Templates', 'tour.10.body': '150 m², VF 300, greenhouse 500.',
      'tour.11.title': 'Crops', 'tour.11.body': 'Up to 6 crops, area shares.',
      'tour.12.title': 'Results', 'tour.12.body': 'Margin, sensitivity, payback.',
      'tour.13.title': 'Advanced', 'tour.13.body': 'Seasonality, sites, channels, inflation.',
      'tour.14.title': 'PWA', 'tour.14.body': 'QR for phone (HTTPS).',
      'tour.15.title': 'View only', 'tour.15.body': 'Read-only for presentations.',
      'tour.16.title': 'Done', 'tour.16.body': 'Build badge bottom-right. Ctrl+F5 after updates.'
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
      var key = el.getAttribute('data-i18n');
      var attr = el.getAttribute('data-i18n-attr');
      var val = t(key);
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });
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
