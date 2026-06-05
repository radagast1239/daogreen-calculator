/* Справочник поддонов 130×65 — из АУДИТ/ПОДДОНЫ.xlsx и АУДИТ/ЦВЕТЫ.xlsx
   Поддоны: числовые диапазоны — midUpper (между серединой и верхней границей) */
(function(global){
  function midUpper(s){
    if (s == null || s === '') return 0;
    const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
    const nums = [];
    t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => { nums.push(parseFloat(n)); });
    if (!nums.length) return 0;
    const lo = Math.min.apply(null, nums);
    const hi = Math.max.apply(null, nums);
    const mid = (lo + hi) / 2;
    return (mid + hi) / 2;
  }

  function replaceMonthsFromNote(note, cutNote){
    const t = ((note || '') + ' ' + (cutNote || '')).toLowerCase();
    if (/до\s*года|вечноцвет/.test(t)) return 12;
    const wm = t.match(/(\d+)\s*[-–]\s*(\d+)\s*нед/);
    if (wm) return Math.max(1, Math.ceil(parseInt(wm[2], 10) / 4));
    const ws = t.match(/(\d+)\s*нед/);
    if (ws) return Math.max(1, Math.ceil(parseInt(ws[1], 10) / 4));
    const mm = t.match(/(\d+)\s*[-–]\s*(\d+)\s*месяц/);
    if (mm) return parseInt(mm[2], 10);
    const ms = t.match(/(\d+)\s*месяц/);
    if (ms) return parseInt(ms[1], 10);
    if (/^\d+$/.test(String(note || '').trim())) return parseInt(note, 10);
    return 0;
  }

  function pickCells(str){
    const s = String(str || '').trim();
    const opts = [6, 8, 9, 14, 20, 24, 54];
    if (!s) return { cells: 54, std: s };
    const slash = s.split(/[/\\]/).map(x => x.trim()).filter(Boolean);
    const pickPart = (part) => {
      const range = part.match(/(\d+)\s*[-–]\s*(\d+)/);
      if (range) return Math.max(parseInt(range[1], 10), parseInt(range[2], 10));
      const nums = (part.match(/\d+/g) || []).map(Number);
      if (!nums.length) return 54;
      const n = Math.max.apply(null, nums);
      if (opts.includes(n)) return n;
      return opts.reduce((p, c) => Math.abs(c - n) < Math.abs(p - n) ? c : p, 54);
    };
    const cells = slash.length > 1 ? pickPart(slash[0]) : pickPart(s);
    return { cells, std: s };
  }

  function plC(id, name, section, germ, ch, den, cellsStr, cut, avgCut, yCut, opts){
    opts = opts || {};
    const pc = pickCells(cellsStr);
    const germination = Math.round(midUpper(germ) || 5);
    const channelDays = Math.round(midUpper(ch) || 25);
    const density = Math.round(midUpper(den) || 80);
    const unit = opts.unit || 'g';
    const yieldPerCutG = Math.round(midUpper(yCut) || 0);
    const cutNum = midUpper(avgCut) || midUpper(cut);
    const cutInterval = cutNum > 0 ? cutNum : (opts.cutInterval || (opts.partialCut ? 7 : 0));
    const cutNote = (typeof cut === 'string' && !cutNum) ? cut : (opts.cutNote || '');
    const replaceNote = opts.replaceNote || '';
    const potHarvestMonths = replaceMonthsFromNote(replaceNote, cutNote) || 0;
    const multicut = opts.multicut !== false && (cutInterval > 0 || opts.partialCut);
    const subMap = { baby: 'беби D6 · поддон', flowers: 'цветы · поддон', adult: 'взрослые D6 · поддон' };
    const out = {
      id, name, section, palletSheet: true,
      sub: opts.sub || subMap[section] || 'поддон',
      germination, germinationStd: String(germ),
      channelDays, channelStd: String(ch),
      density, densityStd: String(den),
      palletCells: pc.cells, palletCellsStd: pc.std || String(cellsStr),
      cutInterval, cutIntervalStd: String(cut),
      cutNote,
      yieldPerCutG, yieldPerCutStd: String(yCut),
      countUnit: unit,
      multicut,
      partialCut: !!opts.partialCut,
      replaceNote,
      potHarvestMonths: potHarvestMonths || undefined,
      M_max: Math.max(Math.round(yieldPerCutG * 1.15) || 40, 25),
      k: 0.38, t50: germination + 14 + channelDays * 0.55,
      ca: 10, bolt: 90, t_opt: 22,
      babyGreen: section === 'baby',
      heatSigma: 70, heatBolt: 1.1,
      econLotSale: !!opts.lotSale,
      econLotSalePot: !!(opts.lotSale && (opts.salePot || opts.lotSalePot))
    };
    if (opts.lotSale){
      out.yieldPerCutG = 1;
      out.multicut = false;
      out.partialCut = false;
    }
    return out;
  }

  const PALLET_SECTIONS = [
    { id: 'baby', title: 'Беби-зелень (срез, горшок D6)' },
    { id: 'flowers', title: 'Цветы пищевые' },
    { id: 'adult', title: 'Взрослая зелень и салаты (D6)' }
  ];

  const PALLET_CULTIVARS = [
    plC('pl-microgreens', 'Микрозелень', 'baby', '2-3', '10-12', '200-300', '54', '12', '12', '1', { unit: 'шт', lotSale: true, replaceNote: '3-6 недель', sub: 'микрозелень · 1 лоток = 1 шт' }),
    plC('pl-salad', 'Салат', 'adult', '2-3', '25-35', '50-80', '9-14', '-', '-', '1', { unit: 'шт', lotSale: true, salePot: true, cutNote: '1 горшок = 1 шт', replaceNote: '2-3 месяца', sub: 'салат · 1 горшок = 1 шт', multicut: false }),
    plC('pl-baby-living', 'Беби-зелень (растущая)', 'baby', '5-7', '25-30', '50-80', '14-24', '28', '28', '1', { unit: 'шт', lotSale: true, cutNote: '1 горшок = 1 шт', replaceNote: '2-3 месяца', sub: 'беби D6 · горшок в продаже' }),
    plC('pl-wheatgrass', 'Витграсс', 'baby', '2-3', '10-14', '150-200', '54', '12', '12', '1', { unit: 'шт', lotSale: true, cutNote: '1 лоток = 1 шт', replaceNote: '3-4 недели', sub: 'витграсс · лоток' }),
    plC('pl-edible-flowers', 'Пищевые цветы', 'flowers', '3-5', '35', '60', '14', '7', '7', '21', { partialCut: true, unit: 'шт', replaceNote: '5 месяца', sub: 'цветы · ~5400 шт/м²·мес' }),
    plC('pl-cabbage-avg', 'Капуста (общая)', 'baby', '3-4', '28', '100-140', '14-24', '16', '16', '18', { replaceNote: '3-4 месяца', sub: 'беби · капустные (среднее)' }),
    plC('pl-adult-lettuce', 'Салат взрослый', 'adult', '2-3', '40', '42', '9-14', '-', '-', '125', { multicut: false, cutNote: 'Однократная срезка · 45 сут', replaceNote: 'Однократная срезка.', sub: 'взрослые D6 · поддон' }),
    plC('pl-baby-cut-lettuce', 'Салат беби (срез)', 'baby', '3-4', '22', '65', '14-24', '22', '22', '35', { replaceNote: '2-3 месяца', sub: 'беби D6 · срез' }),
    plC('pl-shiso', 'Шисо', 'baby', '5-7', '30', '60-80', '9', 'Срезается частично', '7', '10', { partialCut: true, replaceNote: 'До года' , sub: 'беби D6 · поддон' }),
    plC('pl-sorrel', 'Щавель красножильный', 'baby', '5-7', '35', '100-220', '24', '20', '20', '10-15', { replaceNote: '2-3 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-kale-baby', 'Капуста Кейл', 'baby', '3-5', '30', '80-150', '14-24', '15', '15', '15-25', { replaceNote: 'До года' , sub: 'беби D6 · поддон' }),
    plC('pl-mizuna-baby', 'Капуста мизуна', 'baby', '2-3', '25-30', '80-150', '14-24', '15-20', '18', '15-20', { replaceNote: '3-4 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-corn', 'Салат Корн', 'baby', '5-7', '25-30', '80-150', '14-24', '15-20', '18', '15', { replaceNote: '2-3 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-chard-baby', 'Мангольд', 'baby', '7-8', '25', '220', '54', '15-20', '18', '15-20', { replaceNote: 'До года' , sub: 'беби D6 · поддон' }),
    plC('pl-basil-baby', 'Базилик', 'baby', '5-7', '25-30', '80-150', '14-24', '20-25', '23', '15-20', { replaceNote: '2-3 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-strawberry-spinach', 'Марь гигантская (шпинат земляничный)', 'baby', '4', '20-25', '80-120', '14-24', '20', '20', '15-25', { replaceNote: '3-4 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-melissa-baby', 'Мелисса', 'baby', '5-7', '35', '80-120', '14-24', '20-30', '25', '15-20', { replaceNote: 'До года' , sub: 'беби D6 · поддон' }),
    plC('pl-mint-baby', 'Мята', 'baby', '5-7', '35', '80-120', '14-24', '20-30', '25', '15-20', { replaceNote: 'До года' , sub: 'беби D6 · поддон' }),
    plC('pl-ice-plant', 'Хрустальная трава (Мезембриантемум)', 'baby', '4-6', '30', '80-100', '14-24', 'Срезается частично', '7', '10-15', { partialCut: true, replaceNote: '5 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-arugula-baby', 'Рукола', 'baby', '2-3', '20-25', '60-150', '14-24', '20', '20', '14-19', { replaceNote: '2 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-arugula-dragon', 'Рукола Язык дракона', 'baby', '3-4', '25-30', '80-100', '14-24', '20-25', '23', '10-15', { replaceNote: '2-3 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-spinach-baby', 'Шпинат', 'baby', '5-7', '20-25', '150-220', '54', '7', '7', '3-5', { replaceNote: '3-6 недель' , sub: 'беби D6 · поддон' }),
    plC('pl-romano-baby', 'Салат Романо', 'baby', '3-4', '20-25', '50-80', '14-24', '20-25', '23', '30-40', { replaceNote: '2-3 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-pakchoi-baby', 'Пак чой', 'baby', '3-4', '20-25', '60-120', '14-24', '15-18', '17', '15-25', { replaceNote: '3-4 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-nasturtium-baby', 'Настурция', 'baby', '7-8', '20-25', '50-60', '14-24', 'Срезается частично', '7', '5-8', { partialCut: true, replaceNote: '5 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-tatsoi-baby', 'Татсой', 'baby', '3', '20-25', '60-120', '14-24', '20', '20', '15-25', { replaceNote: '3-4 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-komatsuna-baby', 'Комацуна', 'baby', '3-4', '20-25', '60-120', '14-24', '20', '20', '20', { replaceNote: '3-4 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-mustard-baby', 'Горчица', 'baby', '2-3', '20-25', '60-120', '14-24', '14-18', '16', '20', { replaceNote: '3-4 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-verbena', 'Вербена лимон', 'baby', '', '', '50-80', '14-24', 'Срезается частично', '20', '5-8', { partialCut: true, replaceNote: '5 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-marigold-leaf', 'Бархатцы на лист', 'baby', '3-5', '25-30', '80-150', '9-14', 'Срезается частично', '12', '10', { partialCut: true, replaceNote: '6-8 месяца' , sub: 'беби D6 · поддон' }),
    plC('pl-oyster-leaf', 'Устричный лист', 'baby', '14', '40', '50-80', '9-14', 'Срезается частично', '12', '5-8', { partialCut: true, replaceNote: 'До года' , sub: 'беби D6 · поддон' }),
    plC('pl-viola', 'Виола', 'flowers', '2-3', '18', '60-80/30', '14', 'Срезается частично каждые 5-10 дней', '7', '60-80', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-mimulus', 'Мимулюс', 'flowers', '3-5', '40', '60/30', '9/14', 'Срезается частично каждые 5-10 дней', '7', '25', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-begonia', 'Бегония\\пеларгония\\герань', 'flowers', '7-8', '45', '45-60/30', '14', 'Срезается частично каждые 5-10 дней', '7', '25', { partialCut: true, unit: 'шт', replaceNote: 'вечноцветущая' , sub: 'цветы · поддон' }),
    plC('pl-torenia', 'Торения', 'flowers', '3-5', '40', '60-80/30-35', '9/14', 'Срезается частично каждые 5-10 дней', '7', '20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-marigold-flower', 'Бархатцы', 'flowers', '4-6', '45', '80-120/35-45', '9', 'Срезается частично каждые 5-10 дней', '7', '20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-spilanthes', 'Спилантес (Акмелла Электрическая)', 'flowers', '3-4', '30', '60-80/30', '9', 'Срезается частично каждые 5-10 дней', '7', '15-20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-alyssum', 'Алисум', 'flowers', '5-7', '25', '60-80/30', '14', 'Срезается частично каждые 5-10 дней', '7', '30-50', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-nasturtium-flower', 'Настурция', 'flowers', '10-14', '45', '25-35/20', '14', 'Срезается частично каждые 5-10 дней', '7', '10', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-carnation', 'Гвоздика', 'flowers', '3-4', '45', '60-80/30', '14', 'Срезается частично каждые 5-10 дней', '7', '18', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-pentas', 'Пентас', 'flowers', '5-7', '35', '45-60/30', '9/14', 'Срезается частично каждые 5-10 дней', '7', '30-50', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-mesemb-flower', 'Мезембриантемум (Хрустальная трава)', 'flowers', '5-7', '40', '60-80/30-35', '14', 'Срезается частично каждые 5-10 дней', '7', '10', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-borage', 'Бораго', 'flowers', '3-4', '45', '30-35/15-20', '4', 'Срезается частично каждые 5-10 дней', '7', '80', { partialCut: true, unit: 'шт', replaceNote: '3 месяца' , sub: 'цветы · поддон' }),
    plC('pl-cornflower', 'Василек', 'flowers', '3-7', '45', '60-80/45', '9', 'Срезается частично каждые 5-10 дней', '7', '10', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-zucchini-flower', 'Цветы Цуккини (Кабачок)', 'flowers', '4-5', '35', '30/5', '4', 'Срезается частично каждые 5-10 дней', '7', '7', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-phlox', 'Флокс', 'flowers', '5-6', '60', '60/30', '9', 'Срезается частично каждые 5-10 дней', '7', '20-30', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-lavender', 'Лаванда', 'flowers', '7-10', '50', '60/30', '14', 'Срезается частично каждые 5-10 дней', '7', '20-30', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-bellflower', 'Колокольчик', 'flowers', '5-8', '35', '60-80/30-35', '14', 'Срезается частично каждые 5-10 дней', '7', '20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-balsam', 'Бальзамин', 'flowers', '5-8', '35', '60-80/30-35', '9', 'Срезается частично каждые 5-10 дней', '7', '20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · поддон' }),
    plC('pl-mint-adult', 'Мята', 'adult', 'от 5-7, до 10-12', '50', '40-45', '9-14', '20-25', '23', '15-18', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-melissa-adult', 'Мелисса', 'adult', '5-7', '50', '40-45', '9-14', '20-25', '23', '15-18', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-thyme', 'Тимьян', 'adult', '5-7', '60', '40-45', '9-14', '20-25', '23', '10-15', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-rosemary', 'Розмарин', 'adult', '7-8', '60', '50-60', '9-14', 'Срезается частично', '9', '10-15', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-basil-adult', 'Базилик', 'adult', '5-7', '40', '50-60', '14', '18-25', '22', '60', { replaceNote: '2-3 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-oregano', 'Майоран (Орегано)', 'adult', '5-7', '40', '40-45', '9-14', 'Срезается частично', '9', '30-45', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-sage', 'Шалфей', 'adult', '7-8', '40', '50-60', '9-14', 'Срезается частично', '9', '30', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-chervil', 'Кервель', 'adult', '5-8', '40', '50-60', '9-14', '25', '25', '25', { replaceNote: '2-3 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-fennel', 'Фенхель', 'adult', '7-8', '45', '50-60', '9-14', '25', '25', '25', { replaceNote: '2-3 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-anise', 'Анис', 'adult', '7-8', '45', '50-60', '9-14', '25', '25', '25', { replaceNote: '2-3 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-tarragon', 'Эстрагон', 'adult', '7-8', '60', '50-60', '9-14', 'Срезается частично', '9', '10-15', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-shiso-adult', 'Шисо', 'adult', '5-7', '40', '40-45', '9-14', 'Срезается частично', '9', '10-20', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-kale-adult', 'Капуста Кейл', 'adult', '3-4', '40', '35-45', '9-14', '40-45', '23', '20-25', { replaceNote: 'До года' , sub: 'взрослые D6 · поддон' }),
    plC('pl-mizuna-adult', 'Капуста мизуна', 'adult', '2-3', '35', '45-50', '9-14', '30', '30', '35-50', { replaceNote: '3-4 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-arugula-adult', 'Рукола', 'adult', '2-3', '35', '60', '9-14', 'Чаще практикуется однократная срезка', '-', '30-40', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '4-6 недель' , sub: 'взрослые D6 · поддон' }),
    plC('pl-arugula-dragon-adult', 'Рукола Дракон', 'adult', '3-4', '30', '60-80', '9-14', 'Чаще практикуется однократная срезка', '-', '30', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '4-6 недель' , sub: 'взрослые D6 · поддон' }),
    plC('pl-mustard-red', 'Горчица Красная', 'adult', '2-3', '35', '45-50', '9-14', '25', '25', '40-60', { replaceNote: '3-4 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-spinach-adult', 'Шпинат', 'adult', '4-6', '35', '80', '24', '7-14', '9', '30-40', { replaceNote: '4 недели' , sub: 'взрослые D6 · поддон' }),
    plC('pl-batavia', 'Салаты Ботавия', 'adult', '2-3', '35-45', '40-45', '9-14', '-', '-', '100-150', { multicut: false, cutNote: 'Однократная срезка · 45 сут от посева', replaceNote: 'Однократная срезка.' , sub: 'взрослые D6 · поддон' }),
    plC('pl-romaine-adult', 'Салат Ромен', 'adult', '2-3', '35', '40-45', '9-14', '-', '-', '120-160', { multicut: false, cutNote: 'Однократная срезка · 45 сут от посева', replaceNote: 'Однократная срезка.' , sub: 'взрослые D6 · поддон' }),
    plC('pl-frillice-lollo', 'Фрилис, Лоло Роса', 'adult', '2-3', '35', '40-45', '9-14', '-', '-', '120-140', { multicut: false, cutNote: 'Однократная срезка · 45 сут от посева', replaceNote: 'Однократная срезка.' , sub: 'взрослые D6 · поддон' }),
    plC('pl-dill', 'Укроп', 'adult', '5-7', '40', '50-60', '14-24', '30', '30', '25', { replaceNote: '2-3 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-parsley', 'Петрушка', 'adult', '5-7', '40', '50-60', '14-24', '30', '30', '25-35', { replaceNote: '2-3 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-cilantro', 'Кинза', 'adult', '5-7', '40', '50-60', '14-24', '30', '30', '25-35', { replaceNote: '2-3 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-pakchoi-adult', 'Пак чой', 'adult', '3-4', '40', '45-50', '9-14', 'Чаще практикуется однократная срезка', '25', '40-60', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '3-4 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-komatsuna-adult', 'Комацуна', 'adult', '2-3', '35-40', '45-50', '9-14', 'Чаще практикуется однократная срезка', '25', '30-50', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '3-4 месяца' , sub: 'взрослые D6 · поддон' }),
    plC('pl-tatsoi-adult', 'Татсой', 'adult', '2-3', '35-40', '45-50', '9-14', 'Чаще практикуется однократная срезка', '25', '30-50', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '3-4 месяца' , sub: 'взрослые D6 · поддон' }),
  ];

  global.PALLET_SHEET = { PALLET_SECTIONS, PALLET_CULTIVARS, midUpper, replaceMonthsFromNote, pickCells };
})(typeof window !== 'undefined' ? window : globalThis);
