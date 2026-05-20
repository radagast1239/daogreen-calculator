/* Справочник каналов VF — из АУДИТ/КАНАЛЫ.xlsx и АУДИТ/ЦВЕТЫ.xlsx
   КАНАЛЫ: урожай г — верх диапазона +12,5%; остальное — mid */
(function(global){
  /** Среднее по диапазону «7–14», «60-80» и т.д. */
  function mid(s){
    if (s == null || s === '') return 0;
    const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
    const nums = [];
    t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => { nums.push(parseFloat(n)); });
    if (!nums.length) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  function hi(s){
    if (s == null || s === '') return 0;
    const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
    const nums = [];
    t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => { nums.push(parseFloat(n)); });
    if (!nums.length) return 0;
    return Math.max.apply(null, nums);
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

  function vfC(id, name, section, germ, ch, den, cut, avgCut, yCut, opts){
    opts = opts || {};
    const germination = Math.round(mid(germ) || 5);
    const channelDays = Math.round(mid(ch) || 25);
    const density = Math.round(mid(den) || 80);
    const unit = opts.unit || 'g';
    let yieldPerCutG = Math.round((hi(yCut) || 0) * (unit === 'шт' ? 1 : 1.125));
    const cutNum = mid(avgCut) || mid(cut);
    const cutInterval = cutNum > 0 ? cutNum : (opts.cutInterval || (opts.partialCut ? 7 : 0));
    const cutNote = (typeof cut === 'string' && !cutNum) ? cut : (opts.cutNote || '');
    const replaceNote = opts.replaceNote || '';
    const potHarvestMonths = replaceMonthsFromNote(replaceNote, cutNote) || 0;
    const multicut = opts.multicut !== false && (cutInterval > 0 || opts.partialCut);
    const subMap = { baby: 'беби D6 · каналы', flowers: 'цветы · каналы', adult: 'взрослые D6 · каналы' };
    return {
      id, name, section, vfSheet: true,
      sub: opts.sub || subMap[section] || 'Каналы VF',
      germination, germinationStd: String(germ),
      channelDays, channelStd: String(ch),
      density, densityStd: String(den),
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
      heatSigma: 70, heatBolt: 1.1
    };
  }

  const VF_SECTIONS = [
    { id: 'baby', title: 'Беби-зелень (срез, горшок D6)' },
    { id: 'flowers', title: 'Цветы пищевые' },
    { id: 'adult', title: 'Взрослая зелень и салаты (D6)' }
  ];

  const VF_CULTIVARS = [
    vfC('vf-sorrel', 'Щавель красножильный', 'baby', '5-7', '35', '100-220', '20', '20', '15', { replaceNote: '2-3 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-kale-baby', 'Капуста Кейл', 'baby', '3-5', '30', '80-150', '15', '15', '25', { replaceNote: 'До года' , sub: 'беби D6 · каналы' }),
    vfC('vf-mizuna-baby', 'Капуста мизуна', 'baby', '2-3', '25-30', '80-150', '15-20', '18', '20', { replaceNote: '3-4 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-corn', 'Салат Корн', 'baby', '5-7', '25-30', '80-150', '15-20', '18', '15', { replaceNote: '2-3 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-chard-baby', 'Мангольд', 'baby', '7-8', '25', '220', '15-20', '18', '20', { replaceNote: 'До года' , sub: 'беби D6 · каналы' }),
    vfC('vf-basil-baby', 'Базилик', 'baby', '5-7', '25-30', '80-150', '20-25', '23', '50', { replaceNote: '2-3 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-melissa-baby', 'Мелисса', 'baby', '5-7', '35', '80-120', '20-30', '25', '20', { replaceNote: 'До года' , sub: 'беби D6 · каналы' }),
    vfC('vf-mint-baby', 'Мята', 'baby', '5-7', '35', '80-120', '20', '25', '20', { replaceNote: 'До года' , sub: 'беби D6 · каналы' }),
    vfC('vf-arugula-dragon', 'Рукола Язык дракона', 'baby', '3-4', '25-30', '80-100', '20-25', '23', '15', { replaceNote: '2-3 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-spinach-baby', 'Шпинат', 'baby', '5-7', '20-25', '150-220', '7', '7', '5', { replaceNote: '3-6 НЕДЕЛЬ' , sub: 'беби D6 · каналы' }),
    vfC('vf-romano-baby', 'Салат Романо', 'baby', '3-4', '20-25', '50-80', '20-25', '23', '40', { replaceNote: '2-3 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-pakchoi-baby', 'Пак чой', 'baby', '3-4', '20-25', '60-120', '15-18', '17', '25', { replaceNote: '3-4 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-tatsoi-baby', 'Татсой', 'baby', '3', '20-25', '60-120', '20', '20', '25', { replaceNote: '3-4 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-komatsuna-baby', 'Комацуна', 'baby', '3-4', '20-25', '60-120', '20', '20', '20', { replaceNote: '3-4 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-mustard-baby', 'Горчица', 'baby', '2-3', '20-25', '60-120', '14-18', '16', '20', { replaceNote: '3-4 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-marigold-leaf', 'Бархатцы на лист', 'baby', '3-5', '25-30', '80-150', 'Срезается частично', '12', '10', { partialCut: true, replaceNote: '6-8 месяца' , sub: 'беби D6 · каналы' }),
    vfC('vf-viola', 'Виола', 'flowers', '2-3', '18', '60-80/30', 'Срезается частично каждые 5-10 дней', '7', '60-80', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-mimulus', 'Мимулюс', 'flowers', '3-5', '40', '60/30', 'Срезается частично каждые 5-10 дней', '7', '25', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-torenia', 'Торения', 'flowers', '3-5', '40', '60-80/30-35', 'Срезается частично каждые 5-10 дней', '7', '20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-marigold-flower', 'Бархатцы', 'flowers', '4-6', '45', '80-120/35-45', 'Срезается частично каждые 5-10 дней', '7', '20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-spilanthes', 'Спилантес (Акмелла Электрическая)', 'flowers', '3-4', '30', '60-80/30', 'Срезается частично каждые 5-10 дней', '7', '15-20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-alyssum', 'Алисум', 'flowers', '5-7', '25', '60-80/30', 'Срезается частично каждые 5-10 дней', '7', '30-50', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-carnation', 'Гвоздика', 'flowers', '3-4', '45', '60-80/30', 'Срезается частично каждые 5-10 дней', '7', '18', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-pentas', 'Пентас', 'flowers', '5-7', '35', '45-60/30', 'Срезается частично каждые 5-10 дней', '7', '30-50', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-cornflower', 'Василек', 'flowers', '3-7', '45', '60-80/45', 'Срезается частично каждые 5-10 дней', '7', '10', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-phlox', 'Флокс', 'flowers', '5-6', '60', '60/30', 'Срезается частично каждые 5-10 дней', '7', '20-30', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-bellflower', 'Колокольчик', 'flowers', '5-8', '35', '60-80/30-35', 'Срезается частично каждые 5-10 дней', '7', '20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-balsam', 'Бальзамин', 'flowers', '5-8', '35', '60-80/30-35', 'Срезается частично каждые 5-10 дней', '7', '20', { partialCut: true, unit: 'шт', replaceNote: '5 месяца' , sub: 'цветы · каналы' }),
    vfC('vf-mint-adult', 'Мята', 'adult', 'от 5-7, до 10-12', '50', '40-45', '20-25', '23', '18', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-melissa-adult', 'Мелисса', 'adult', '5-7', '50', '40-45', '20-25', '23', '18', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-thyme', 'Тимьян', 'adult', '5-7', '60', '40-45', '20-25', '23', '15', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-rosemary', 'Розмарин', 'adult', '7-8', '60', '50-60', 'Срезается частично', '9', '15', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-basil-adult', 'Базилик', 'adult', '5-7', '40', '50-60', '18-25', '22', '60', { replaceNote: '2-3 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-oregano', 'Майоран (Орегано)', 'adult', '5-7', '40', '40-45', 'Срезается частично', '9', '45', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-sage', 'Шалфей', 'adult', '7-8', '40', '50-60', 'Срезается частично', '9', '30', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-chervil', 'Кервель', 'adult', '5-8', '40', '50-60', '25', '25', '25', { replaceNote: '3 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-fennel', 'Фенхель', 'adult', '7-8', '45', '50-60', '25', '25', '25', { replaceNote: '3 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-anise', 'Анис', 'adult', '7-8', '45', '50-60', '25', '25', '25', { replaceNote: '3 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-tarragon', 'Эстрагон', 'adult', '7-8', '60', '50-60', 'Срезается частично', '9', '15', { partialCut: true, replaceNote: 'До года' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-kale-adult', 'Капуста Кейл', 'adult', '3-4', '40', '35-45', '40-45', '23', '25', { replaceNote: 'До года' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-mizuna-adult', 'Капуста мизуна', 'adult', '2-3', '35', '45-50', '30', '30', '50', { replaceNote: '4 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-arugula-adult', 'Рукола', 'adult', '2-3', '35', '60', '15-20', '-', '40', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '4-6 недель' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-arugula-dragon-adult', 'Рукола Дракон', 'adult', '3-4', '30', '60-80', '15-20', '-', '30', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '4-6 недель' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-mustard-red', 'Горчица Красная', 'adult', '2-3', '35', '45-50', '25', '25', '50', { replaceNote: '4 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-spinach-adult', 'Шпинат', 'adult', '4-6', '35', '80', '7-14', '9', '40', { replaceNote: '4 недели' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-batavia', 'Салаты Ботавия', 'adult', '2-3', '35-45', '40-45', '-', '-', '150', { multicut: false, cutNote: 'Однократная срезка · 45 сут от посева', replaceNote: 'Однократная срезка.' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-romaine-adult', 'Салат Ромен', 'adult', '2-3', '35', '40-45', '-', '-', '150', { multicut: false, cutNote: 'Однократная срезка · 45 сут от посева', replaceNote: 'Однократная срезка.' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-frillice-lollo', 'Фрилис, Лоло Роса', 'adult', '2-3', '35', '40-45', '-', '-', '140', { multicut: false, cutNote: 'Однократная срезка · 45 сут от посева', replaceNote: 'Однократная срезка.' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-dill', 'Укроп', 'adult', '5-7', '40', '50-60', '30', '30', '25', { replaceNote: '3 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-parsley', 'Петрушка', 'adult', '5-7', '40', '50-60', '30', '30', '35', { replaceNote: '3 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-cilantro', 'Кинза', 'adult', '5-7', '40', '50-60', '30', '30', '35', { replaceNote: '3 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-pakchoi-adult', 'Пак чой', 'adult', '3-4', '40', '45-50', '-', '25', '60', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '4 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-komatsuna-adult', 'Комацуна', 'adult', '2-3', '35-40', '45-50', '-', '25', '50', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '4 месяца' , sub: 'взрослые D6 · каналы' }),
    vfC('vf-tatsoi-adult', 'Татсой', 'adult', '2-3', '35-40', '45-50', '-', '25', '50', { multicut: false, cutNote: 'Однократная срезка', replaceNote: '4 месяца' , sub: 'взрослые D6 · каналы' }),
  ];

  global.VF_SHEET = { VF_SECTIONS, VF_CULTIVARS, mid, hi, replaceMonthsFromNote, pickCells };
})(typeof window !== 'undefined' ? window : globalThis);
