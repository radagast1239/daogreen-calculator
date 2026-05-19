const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'Лист1.html'), 'utf8');
const vfSrc = fs.readFileSync(path.join(__dirname, 'vf-cultivars.js'), 'utf8');

function normName(n) {
  return String(n).toLowerCase().replace(/\\/g, '/').replace(/\s+/g, ' ').replace(/пак-чой/g, 'пак чой').trim();
}

let htmlSection = 'baby';
const cellsByName = new Map();
for (const tr of html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []) {
  if (/Беби зелень/i.test(tr)) { htmlSection = 'baby'; continue; }
  if (/Цветы пищевые/i.test(tr)) { htmlSection = 'flowers'; continue; }
  if (/Взрослая зелень/i.test(tr)) { htmlSection = 'adult'; continue; }
  const tds = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
    m[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
  );
  const name = tds[0];
  if (!name || name.length < 2 || /на м2|стакан/i.test(name)) continue;
  let g = 1;
  while (g < tds.length && !tds[g]) g++;
  if (g + 3 >= tds.length) continue;
  cellsByName.set(htmlSection + '|' + normName(name), tds[g + 3]);
}

const cellKey = (sec, name) => sec + '|' + normName(name);
const aliases = {
  [cellKey('flowers', 'Бегония / пеларгония / герань')]: cellsByName.get(cellKey('flowers', 'Бегония/пеларгония/герань')),
  [cellKey('baby', 'Пак-чой')]: cellsByName.get(cellKey('baby', 'Пак чой')),
  [cellKey('adult', 'Пак-чой')]: cellsByName.get(cellKey('adult', 'Пак чой')),
  [cellKey('flowers', 'Спилантес (Акмелла)')]: cellsByName.get(cellKey('flowers', 'Спилантес (Акмелла Электрическая)')),
  [cellKey('flowers', 'Цветы цуккини')]: cellsByName.get(cellKey('flowers', 'Цветы Цуккини (Кабачок)'))
};

const lines = [];
for (const line of vfSrc.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('vfC(')) continue;
  const m = trimmed.match(/^vfC\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'(.*)\),?$/);
  if (!m) { console.warn('no match:', trimmed.slice(0, 70)); continue; }
  const [, id, name, sec, germ, ch, den, cut, yCut, ySqm, tail] = m;
  const ck = cellKey(sec, name);
  let cells = cellsByName.get(ck) || aliases[ck] || '14-24';
  const plId = id.replace(/^vf-/, 'pl-');
  const sub = sec === 'baby' ? 'беби D6 · поддон' : sec === 'flowers' ? 'цветы · поддон' : 'взрослые D6 · поддон';
  let tailOut = tail;
  if (tailOut.includes('{')) {
    if (!/sub\s*:/.test(tailOut)) tailOut = tailOut.replace(/\}\s*$/, ", sub: '" + sub + "' }");
  } else {
    tailOut = ", { sub: '" + sub + "' }";
  }
  lines.push(`    plC('${plId}', '${name}', '${sec}', '${germ}', '${ch}', '${den}', '${cells}', '${cut}', '${yCut}', '${ySqm}'${tailOut}),`);
}

const out = `/* Справочник поддонов 130×65 из Лист1 — кассеты и параметры по умолчанию */
(function(global){
  function mid(s){
    if (s == null || s === '') return 0;
    const t = String(s).replace(/,/g, '.');
    const nums = [];
    t.replace(/(\\d+(?:\\.\\d+)?)/g, (_, n) => { nums.push(parseFloat(n)); });
    if (!nums.length) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  function pickCells(str){
    const s = String(str || '').trim();
    if (!s) return { cells: 54, std: s };
    const opts = [9, 14, 24, 54];
    const slash = s.split(/[/\\\\]/).map(x => x.trim()).filter(Boolean);
    const pick = (part) => {
      const range = part.match(/(\\d+)\\s*[-–]\\s*(\\d+)/);
      if (range){
        const a = parseInt(range[1], 10), b = parseInt(range[2], 10);
        const m = Math.round((a + b) / 2);
        return opts.reduce((p, c) => Math.abs(c - m) < Math.abs(p - m) ? c : p, 54);
      }
      const nums = (part.match(/\\d+/g) || []).map(Number);
      if (!nums.length) return 54;
      const n = nums[0];
      if (n <= 9) return 9;
      return opts.includes(n) ? n : opts.reduce((p, c) => Math.abs(c - n) < Math.abs(p - n) ? c : p, 54);
    };
    const cells = slash.length > 1 ? pick(slash[0]) : pick(s);
    return { cells, std: s };
  }

  function plC(id, name, section, germ, ch, den, cellsStr, cut, yCut, ySqm, opts){
    opts = opts || {};
    const pc = pickCells(cellsStr);
    const germination = Math.round(mid(germ) || 5);
    const channelDays = Math.round(mid(ch) || 25);
    const density = Math.round(mid(den) || 80);
    const yieldPerCutG = mid(yCut);
    const yieldPerSqmG = mid(ySqm);
    const cutInterval = typeof cut === 'number' ? cut : (mid(cut) || opts.cutInterval || 0);
    const cutNote = (typeof cut === 'string' && !mid(cut)) ? cut : (opts.cutNote || '');
    const unit = opts.unit || 'g';
    const subMap = { baby: 'беби D6 · поддон', flowers: 'цветы · поддон', adult: 'взрослые D6 · поддон' };
    return {
      id, name, section, palletSheet: true,
      sub: opts.sub || subMap[section] || 'поддон',
      germination, germinationStd: String(germ),
      channelDays, channelStd: String(ch),
      density, densityStd: String(den),
      palletCells: pc.cells, palletCellsStd: pc.std || String(cellsStr),
      cutInterval, cutIntervalStd: String(cut),
      cutNote,
      yieldPerCutG, yieldPerCutStd: String(yCut),
      yieldPerSqmG, yieldPerSqmStd: String(ySqm),
      countUnit: unit,
      multicut: opts.multicut !== false,
      partialCut: !!opts.partialCut,
      replaceNote: opts.replaceNote || '',
      M_max: Math.max(Math.round(yieldPerCutG * 1.15) || 40, 25),
      k: 0.38, t50: germination + 14 + channelDays * 0.55,
      ca: 10, bolt: 90, t_opt: 22,
      babyGreen: section === 'baby',
      heatSigma: 70, heatBolt: 1.1
    };
  }

  const PALLET_SECTIONS = [
    { id: 'baby', title: 'Беби-зелень (срез, горшок D6)' },
    { id: 'flowers', title: 'Цветы пищевые' },
    { id: 'adult', title: 'Взрослая зелень и салаты (D6)' }
  ];

  const PALLET_CULTIVARS = [
${lines.join('\n')}
  ];

  global.PALLET_SHEET = { PALLET_SECTIONS, PALLET_CULTIVARS, mid, pickCells };
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync(path.join(__dirname, 'pallet-cultivars.js'), out, 'utf8');
console.log('OK', lines.length, 'cultivars');
