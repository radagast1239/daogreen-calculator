'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function excelSerialToDM(n) {
  const d = new Date(Math.round((n - 25569) * 86400000));
  return d.getUTCDate() + '-' + (d.getUTCMonth() + 1);
}

function normalizeCell(val) {
  if (val == null || val === '') return '';
  let s = String(val).trim();
  const n = parseFloat(s);
  if (!isNaN(n) && n > 40000 && n < 50000 && Math.abs(n - Math.round(n)) < 1e-6) {
    return excelSerialToDM(Math.round(n));
  }
  if (/^\d+\.0$/.test(s)) return String(parseInt(n, 10));
  return s;
}

function normName(n) {
  return String(n || '')
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/\s+/g, ' ')
    .replace(/пак-чой/g, 'пак чой')
    .replace(/\s+$/, '')
    .trim();
}

function formatReplaceNote(s) {
  s = normalizeCell(s);
  if (!s) return '';
  const low = s.toLowerCase();
  if (/недел|месяц|год|срезка|вечноцвет|до\s*года/i.test(s)) return s;
  if (/^\d+$/.test(s)) {
    if (s === '12') return 'До года';
    if (s === '5') return '5 месяцев';
    return s + ' месяцев';
  }
  if (/^\d+-\d+$/.test(s)) return s + ' месяца';
  return s;
}

function readSheetRows(xlsxPath) {
  const full = path.isAbsolute(xlsxPath) ? xlsxPath : path.join(ROOT, xlsxPath);
  const dir = path.join(__dirname, '_audit_tmp');
  const zip = path.join(__dirname, '_audit.zip');
  fs.copyFileSync(full, zip);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
  fs.mkdirSync(dir, { recursive: true });
  execSync(
    'powershell -NoProfile -Command "Expand-Archive -LiteralPath \'' +
      zip.replace(/'/g, "''") +
      "' -DestinationPath '" +
      dir.replace(/'/g, "''") +
      "' -Force\""
  );
  const strings = [];
  const ssPath = path.join(dir, 'xl', 'sharedStrings.xml');
  if (fs.existsSync(ssPath)) {
    const xml = fs.readFileSync(ssPath, 'utf8');
    const re = /<t[^>]*>([^<]*)<\/t>/g;
    let m;
    while ((m = re.exec(xml))) strings.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<'));
  }
  function colToIndex(col) {
    let n = 0;
    for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
    return n - 1;
  }
  const sheetsDir = path.join(dir, 'xl', 'worksheets');
  const sheet = fs.readdirSync(sheetsDir).filter((f) => f.endsWith('.xml')).sort()[0];
  const sxml = fs.readFileSync(path.join(sheetsDir, sheet), 'utf8');
  const rows = new Map();
  const re2 = /<c r="([A-Z]+)(\d+)"([^>]*)>(?:<v>([^<]*)<\/v>)?(?:<is><t>([^<]*)<\/t><\/is>)?/g;
  let m;
  while ((m = re2.exec(sxml))) {
    const col = colToIndex(m[1]);
    const row = parseInt(m[2], 10);
    let val = m[4] || m[5] || '';
    if (m[3].includes('t="s"')) val = strings[parseInt(val, 10)] || val;
    if (!rows.has(row)) rows.set(row, {});
    rows.get(row)[col] = normalizeCell(val);
  }
  return rows;
}

function parseSectionRows(rows, kind) {
  const isPallet = kind === 'pallet';
  const isFlowers = kind === 'flowers';
  let section = 'baby';
  const out = [];
  const sorted = [...rows.keys()].sort((a, b) => a - b);
  for (const r of sorted) {
    const row = rows.get(r);
    const name = (row[0] || '').trim();
    if (!name || name.length < 2) continue;
    const low = name.toLowerCase();
    if (/беби|baby/i.test(low) && /зелень|срез/i.test(low)) {
      section = 'baby';
      continue;
    }
    if (/цветы пищевые/i.test(low)) {
      section = 'flowers';
      continue;
    }
    if (/взросл|салаты д6/i.test(low)) {
      section = 'adult';
      continue;
    }
    if (/на м2|стакан|шт\/срез/i.test(low)) continue;

    let germ, ch, den, cells, cut, avgCut, replace, yCut;
    if (isFlowers) {
      germ = row[1];
      ch = row[2];
      den = row[4];
      cells = row[5];
      cut = row[6];
      avgCut = row[7];
      replace = formatReplaceNote(row[8]);
      yCut = row[9];
    } else if (isPallet) {
      germ = row[1];
      ch = row[2];
      den = row[3];
      cells = row[4];
      cut = row[5];
      avgCut = row[6];
      replace = formatReplaceNote(row[7]);
      yCut = row[8];
    } else {
      germ = row[1];
      ch = row[2];
      den = row[3];
      cut = row[4];
      avgCut = row[5];
      replace = formatReplaceNote(row[6]);
      yCut = row[7];
    }

    out.push({
      name,
      section,
      germ: germ || '',
      ch: ch || '',
      den: den || '',
      cells: cells || '',
      cut: cut || '',
      avgCut: avgCut || '',
      replace,
      yCut: yCut || ''
    });
  }
  return out;
}

function mergeFlowerDensity(oldDen, newDen) {
  const d = normalizeCell(newDen);
  if (!d) return oldDen;
  if (!oldDen || !String(oldDen).includes('/')) return d;
  const suffix = String(oldDen).split('/').slice(1).join('/');
  return d + '/' + suffix;
}

function escJs(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function unescapeJsStr(s) {
  return String(s).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

function parseCultivarFile(filePath, fnName) {
  const entries = [];
  const re = new RegExp(
    "^\\s*" +
      fnName +
      "\\('([^']+)',\\s*'((?:\\\\'|[^'])*)',\\s*'([^']+)',\\s*'((?:\\\\'|[^'])*)',\\s*'((?:\\\\'|[^'])*)',\\s*'((?:\\\\'|[^'])*)',\\s*'((?:\\\\'|[^'])*)',\\s*'((?:\\\\'|[^'])*)',\\s*'((?:\\\\'|[^'])*)'" +
      (fnName === 'plC' ? ",\\s*'((?:\\\\'|[^'])*)'" : '') +
      "(,\\s*\\{[\\s\\S]*?\\})?\\),?\\s*$"
  );
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const m = line.match(re);
    if (!m) continue;
    if (fnName === 'plC') {
      entries.push({
        id: m[1],
        name: unescapeJsStr(m[2]),
        section: m[3],
        germ: unescapeJsStr(m[4]),
        ch: unescapeJsStr(m[5]),
        den: unescapeJsStr(m[6]),
        cells: unescapeJsStr(m[7]),
        cut: unescapeJsStr(m[8]),
        avgCut: unescapeJsStr(m[9]),
        yCut: unescapeJsStr(m[10]),
        opts: m[11] || ''
      });
    } else {
      entries.push({
        id: m[1],
        name: unescapeJsStr(m[2]),
        section: m[3],
        germ: unescapeJsStr(m[4]),
        ch: unescapeJsStr(m[5]),
        den: unescapeJsStr(m[6]),
        cut: unescapeJsStr(m[7]),
        avgCut: unescapeJsStr(m[8]),
        yCut: unescapeJsStr(m[9]),
        opts: m[10] || ''
      });
    }
  }
  return entries;
}

const XLSX_NAME_ALIASES = {
  'рукола язык дракона': 'рукола язык дракона',
  'салат романо': 'салат романо',
  'капуста кейл': 'капуста кейл',
  'капуста мизуна': 'капуста мизуна',
  'майоран (орегано)': 'майоран (орегано)',
  'салаты ботавия': 'салаты ботавия',
  'салат ромен': 'салат ромен',
  'горчица красная': 'горчица красная',
  'рукола дракон': 'рукола дракон',
  'мезембриантемум (хрустальная трава)': 'мезембриантемум (хрустальная трава)',
  'цветы цуккини (кабачок)': 'цветы цуккини (кабачок)',
  'бегония/пеларгония/герань': 'бегония\\пеларгония\\герань',
  'торения': 'торения',
  'бархатцы': 'бархатцы',
  'спилантес (акмелла электрическая)': 'спилантес (акмелла электрическая)'
};

function matchKey(name, section) {
  let n = normName(name);
  if (XLSX_NAME_ALIASES[n]) n = normName(XLSX_NAME_ALIASES[n]);
  return section + '|' + n;
}

function buildAuditMap(rows, kind) {
  const map = new Map();
  for (const row of rows) {
    map.set(matchKey(row.name, row.section), row);
  }
  return map;
}

function applyAuditRow(entry, audit, kind) {
  if (!audit) return { entry, changed: false };
  const e = { ...entry };
  let changed = false;
  const fields =
    kind === 'pallet'
      ? ['germ', 'ch', 'den', 'cells', 'cut', 'avgCut', 'yCut']
      : ['germ', 'ch', 'den', 'cut', 'avgCut', 'yCut'];
  for (const f of fields) {
    let v = audit[f];
    if (v === undefined || v === '') continue;
    if (f === 'den' && entry.section === 'flowers') {
      v = mergeFlowerDensity(entry.den, v);
    }
    if (String(v) !== String(e[f])) {
      e[f] = v;
      changed = true;
    }
  }
  if (audit.replace) {
    const opts = patchReplaceNote(e.opts, audit.replace);
    if (opts !== e.opts) {
      e.opts = opts;
      changed = true;
    }
  }
  return { entry: e, changed };
}

function patchReplaceNote(opts, replace) {
  if (!replace) return opts;
  const esc = escJs(replace);
  if (/replaceNote\s*:/.test(opts)) {
    return opts.replace(/replaceNote\s*:\s*'[^']*'/, "replaceNote: '" + esc + "'");
  }
  if (opts.includes('{')) {
    return opts.replace(/\}\s*$/, ", replaceNote: '" + esc + "' }");
  }
  return ", { replaceNote: '" + esc + "' }";
}

function formatVfLine(e) {
  return (
    "    vfC('" +
    e.id +
    "', '" +
    escJs(e.name) +
    "', '" +
    e.section +
    "', '" +
    escJs(e.germ) +
    "', '" +
    escJs(e.ch) +
    "', '" +
    escJs(e.den) +
    "', '" +
    escJs(e.cut) +
    "', '" +
    escJs(e.avgCut) +
    "', '" +
    escJs(e.yCut) +
    "'" +
    (e.opts || '') +
    '),'
  );
}

function formatPlLine(e) {
  return (
    "    plC('" +
    e.id +
    "', '" +
    escJs(e.name) +
    "', '" +
    e.section +
    "', '" +
    escJs(e.germ) +
    "', '" +
    escJs(e.ch) +
    "', '" +
    escJs(e.den) +
    "', '" +
    escJs(e.cells) +
    "', '" +
    escJs(e.cut) +
    "', '" +
    escJs(e.avgCut) +
    "', '" +
    escJs(e.yCut) +
    "'" +
    (e.opts || '') +
    '),'
  );
}

const VF_HEADER = `/* Справочник каналов VF — из АУДИТ/КАНАЛЫ.xlsx и АУДИТ/ЦВЕТЫ.xlsx
   КАНАЛЫ: урожай г — верх диапазона +12,5%; остальное — mid */
(function(global){
  /** Среднее по диапазону «7–14», «60-80» и т.д. */
  function mid(s){
    if (s == null || s === '') return 0;
    const t = String(s).replace(/,/g, '.').replace(/\\s*(г|шт)\\s*$/gi, '').replace(/до\\s*(\\d+)/gi, '$1');
    const nums = [];
    t.replace(/(\\d+(?:\\.\\d+)?)/g, (_, n) => { nums.push(parseFloat(n)); });
    if (!nums.length) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  function hi(s){
    if (s == null || s === '') return 0;
    const t = String(s).replace(/,/g, '.').replace(/\\s*(г|шт)\\s*$/gi, '').replace(/до\\s*(\\d+)/gi, '$1');
    const nums = [];
    t.replace(/(\\d+(?:\\.\\d+)?)/g, (_, n) => { nums.push(parseFloat(n)); });
    if (!nums.length) return 0;
    return Math.max.apply(null, nums);
  }

  function replaceMonthsFromNote(note, cutNote){
    const t = ((note || '') + ' ' + (cutNote || '')).toLowerCase();
    if (/до\\s*года|вечноцвет/.test(t)) return 12;
    const wm = t.match(/(\\d+)\\s*[-–]\\s*(\\d+)\\s*нед/);
    if (wm) return Math.max(1, Math.ceil(parseInt(wm[2], 10) / 4));
    const ws = t.match(/(\\d+)\\s*нед/);
    if (ws) return Math.max(1, Math.ceil(parseInt(ws[1], 10) / 4));
    const mm = t.match(/(\\d+)\\s*[-–]\\s*(\\d+)\\s*мес/);
    if (mm) return parseInt(mm[2], 10);
    const ms = t.match(/(\\d+)\\s*мес/);
    if (ms) return parseInt(ms[1], 10);
    if (/^\\d+$/.test(String(note || '').trim())) return parseInt(note, 10);
    return 0;
  }

  function pickCells(str){
    const s = String(str || '').trim();
    const opts = [6, 8, 9, 14, 20, 24, 54];
    if (!s) return { cells: 54, std: s };
    const slash = s.split(/[/\\\\]/).map(x => x.trim()).filter(Boolean);
    const pickPart = (part) => {
      const range = part.match(/(\\d+)\\s*[-–]\\s*(\\d+)/);
      if (range) return Math.max(parseInt(range[1], 10), parseInt(range[2], 10));
      const nums = (part.match(/\\d+/g) || []).map(Number);
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
`;

const PALLET_HEADER = `/* Справочник поддонов 130×65 — из АУДИТ/ПОДДОНЫ.xlsx и АУДИТ/ЦВЕТЫ.xlsx
   Поддоны: числовые диапазоны — midUpper (между серединой и верхней границей) */
(function(global){
  function midUpper(s){
    if (s == null || s === '') return 0;
    const t = String(s).replace(/,/g, '.').replace(/\\s*(г|шт)\\s*$/gi, '').replace(/до\\s*(\\d+)/gi, '$1');
    const nums = [];
    t.replace(/(\\d+(?:\\.\\d+)?)/g, (_, n) => { nums.push(parseFloat(n)); });
    if (!nums.length) return 0;
    const lo = Math.min.apply(null, nums);
    const hi = Math.max.apply(null, nums);
    const mid = (lo + hi) / 2;
    return (mid + hi) / 2;
  }

  function replaceMonthsFromNote(note, cutNote){
    const t = ((note || '') + ' ' + (cutNote || '')).toLowerCase();
    if (/до\\s*года|вечноцвет/.test(t)) return 12;
    const wm = t.match(/(\\d+)\\s*[-–]\\s*(\\d+)\\s*нед/);
    if (wm) return Math.max(1, Math.ceil(parseInt(wm[2], 10) / 4));
    const ws = t.match(/(\\d+)\\s*нед/);
    if (ws) return Math.max(1, Math.ceil(parseInt(ws[1], 10) / 4));
    const mm = t.match(/(\\d+)\\s*[-–]\\s*(\\d+)\\s*мес/);
    if (mm) return parseInt(mm[2], 10);
    const ms = t.match(/(\\d+)\\s*мес/);
    if (ms) return parseInt(ms[1], 10);
    if (/^\\d+$/.test(String(note || '').trim())) return parseInt(note, 10);
    return 0;
  }

  function pickCells(str){
    const s = String(str || '').trim();
    const opts = [6, 8, 9, 14, 20, 24, 54];
    if (!s) return { cells: 54, std: s };
    const slash = s.split(/[/\\\\]/).map(x => x.trim()).filter(Boolean);
    const pickPart = (part) => {
      const range = part.match(/(\\d+)\\s*[-–]\\s*(\\d+)/);
      if (range) return Math.max(parseInt(range[1], 10), parseInt(range[2], 10));
      const nums = (part.match(/\\d+/g) || []).map(Number);
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

  const PALLET_SECTIONS = [
    { id: 'baby', title: 'Беби-зелень (срез, горшок D6)' },
    { id: 'flowers', title: 'Цветы пищевые' },
    { id: 'adult', title: 'Взрослая зелень и салаты (D6)' }
  ];

  const PALLET_CULTIVARS = [
`;

const VF_FOOTER = `
  ];

  global.VF_SHEET = { VF_SECTIONS, VF_CULTIVARS, mid, hi, replaceMonthsFromNote, pickCells };
})(typeof window !== 'undefined' ? window : globalThis);
`;

const PALLET_FOOTER = `
  ];

  global.PALLET_SHEET = { PALLET_SECTIONS, PALLET_CULTIVARS, midUpper, replaceMonthsFromNote, pickCells };
})(typeof window !== 'undefined' ? window : globalThis);
`;

function mid(s) {
  if (s == null || s === '') return 0;
  const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
  const nums = [];
  t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => nums.push(parseFloat(n)));
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function hi(s) {
  if (s == null || s === '') return 0;
  const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
  const nums = [];
  t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => nums.push(parseFloat(n)));
  if (!nums.length) return 0;
  return Math.max.apply(null, nums);
}

function midUpper(s) {
  if (s == null || s === '') return 0;
  const t = String(s).replace(/,/g, '.').replace(/\s*(г|шт)\s*$/gi, '').replace(/до\s*(\d+)/gi, '$1');
  const nums = [];
  t.replace(/(\d+(?:\.\d+)?)/g, (_, n) => nums.push(parseFloat(n)));
  if (!nums.length) return 0;
  const lo = Math.min.apply(null, nums);
  const h = Math.max.apply(null, nums);
  const m = (lo + h) / 2;
  return (m + h) / 2;
}

function computedYield(entry, mode) {
  const unit = /unit:\s*'шт'/.test(entry.opts) ? 'шт' : 'g';
  if (mode === 'vf') {
    return Math.round((hi(entry.yCut) || 0) * (unit === 'шт' ? 1 : 1.125));
  }
  return Math.round(midUpper(entry.yCut) || 0);
}

function syncFile(filePath, fnName, header, footer, formatLine, auditMaps) {
  const entries = parseCultivarFile(filePath, fnName);
  const report = [];
  const matchedXlsx = new Set();

  for (const e of entries) {
    const key = matchKey(e.name, e.section);
    let audit = null;
    let kind = fnName === 'vfC' ? 'vf' : 'pallet';
    if (e.section === 'flowers') {
      audit = auditMaps.flowers.get(key);
    } else if (fnName === 'vfC') {
      audit = auditMaps.kanaly.get(key);
    } else {
      audit = auditMaps.poddony.get(key);
    }
    if (audit) matchedXlsx.add(key + '@' + (e.section === 'flowers' ? 'flowers' : fnName));

    const before = { ...e };
    const { entry, changed } = applyAuditRow(e, audit, kind);
    Object.assign(e, entry);

    if (changed && audit) {
      const oldY = fnName === 'vfC' ? Math.round((hi(before.yCut) || 0) * (/unit:\s*'шт'/.test(before.opts) ? 1 : 1.125)) : Math.round(midUpper(before.yCut) || 0);
      const newY = computedYield(e, fnName === 'vfC' ? 'vf' : 'pallet');
      report.push({
        id: e.id,
        name: e.name,
        section: e.section,
        yield: { was: oldY, now: newY },
        fields: ['germ', 'ch', 'den', 'cut', 'avgCut', 'yCut'].filter((f) => String(before[f]) !== String(e[f]))
      });
    }
  }

  const lines = entries.map(formatLine).join('\n');
  fs.writeFileSync(filePath, header + lines + footer, 'utf8');
  return { report, entries, matchedXlsx };
}

function runSync() {
  const kanaly = buildAuditMap(parseSectionRows(readSheetRows(path.join(ROOT, 'АУДИТ/КАНАЛЫ.xlsx')), 'kanaly'), 'kanaly');
  const poddony = buildAuditMap(parseSectionRows(readSheetRows(path.join(ROOT, 'АУДИТ/ПОДДОНЫ.xlsx')), 'pallet'), 'pallet');
  const flowers = buildAuditMap(parseSectionRows(readSheetRows(path.join(ROOT, 'АУДИТ/ЦВЕТЫ.xlsx')), 'flowers'), 'flowers');

  const auditMaps = { kanaly, poddony, flowers };
  const vfPath = path.join(ROOT, 'vf-cultivars.js');
  const plPath = path.join(ROOT, 'pallet-cultivars.js');

  const vf = syncFile(vfPath, 'vfC', VF_HEADER, VF_FOOTER, formatVfLine, auditMaps);
  const pl = syncFile(plPath, 'plC', PALLET_HEADER, PALLET_FOOTER, formatPlLine, auditMaps);

  const allKeys = new Set([...kanaly.keys(), ...poddony.keys(), ...flowers.keys()]);
  const jsKeys = new Set([
    ...vf.entries.map((e) => matchKey(e.name, e.section)),
    ...pl.entries.map((e) => matchKey(e.name, e.section))
  ]);
  const unmatchedXlsx = [...allKeys].filter((k) => !jsKeys.has(k));
  const unmatchedJs = [...jsKeys].filter((k) => !allKeys.has(k));

  const reportPath = path.join(ROOT, 'АУДИТ/sync-report.md');
  const lines = [
    '# Отчёт sync:audit',
    '',
    'Дата: ' + new Date().toISOString().slice(0, 10),
    '',
    '## Правила',
    '- Каналы (`vf-cultivars.js`): mid, урожай г = hi × 1,125; цветы в шт — без ×1,125',
    '- Поддоны (`pallet-cultivars.js`): midUpper для всех числовых полей',
    '',
    '## Изменения (было → стало, урожай за срез)',
    '',
    '| Сорт | Секция | Файл | Урожай было | Урожай стало | Поля |',
    '|------|--------|------|-------------|--------------|------|'
  ];
  for (const r of [...vf.report, ...pl.report]) {
    const file = r.id.startsWith('vf-') ? 'vf' : 'pl';
    lines.push(
      '| ' +
        [r.name, r.section, file, r.yield.was, r.yield.now, r.fields.join(', ') || '—'].join(' | ') +
        ' |'
    );
  }
  lines.push('', '## Не сопоставлено в xlsx (есть в JS)', '', unmatchedJs.map((k) => '- ' + k).join('\n') || '—');
  lines.push('', '## Не сопоставлено в JS (есть в xlsx)', '', unmatchedXlsx.map((k) => '- ' + k).join('\n') || '—');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');

  console.log('vf changes:', vf.report.length);
  console.log('pallet changes:', pl.report.length);
  console.log('unmatched JS:', unmatchedJs.length);
  console.log('unmatched xlsx:', unmatchedXlsx.length);
  console.log('Report:', reportPath);
}

module.exports = {
  readSheetRows,
  parseSectionRows,
  buildAuditMap,
  normName,
  matchKey,
  mid,
  hi,
  midUpper,
  runSync
};

if (require.main === module) runSync();
