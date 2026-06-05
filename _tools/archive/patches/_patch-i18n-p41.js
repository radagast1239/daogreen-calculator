/** p41: planting dynamic i18n — renderMonths, renderEnvSummary, renderGhStandardsPanel, fmtDate */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'calculator-110x55_12.html');
let h = fs.readFileSync(htmlPath, 'utf8');

const BUILD = '2026-05-18-p41-i18n-plant-dynamic';

h = h.replace(/const CALC_BUILD = '[^']+'/, "const CALC_BUILD = '" + BUILD + "'");

// renderMonths
h = h.replace(
  /function renderMonths\(\)\{\s*\$\('months'\)\.innerHTML = NATURAL_DLI\.map\(\(m, i\) =>\s*'<button class="month-btn ' \+ \(i \+ 1 === state\.month \? 'on' : ''\) \+ '" data-m="' \+ \(i \+ 1\) \+ '">' \+ m\.m \+ '<\/button>'\s*\)\.join\(''\);/,
  `function renderMonths(){
    $('months').innerHTML = NATURAL_DLI.map((m, i) =>
      '<button class="month-btn ' + (i + 1 === state.month ? 'on' : '') + '" data-m="' + (i + 1) + '">' + monthLabel(i + 1) + '</button>'
    ).join('');`
);

h = h.replace(
  /bWrap\.innerHTML = NATURAL_DLI\.map\(\(m, i\) =>\s*'<button class="month-btn ' \+ \(i \+ 1 === state\.monthB \? 'on' : ''\) \+ '" data-m="' \+ \(i \+ 1\) \+ '">' \+ m\.m \+ '<\/button>'\s*\)\.join\(''\);/,
  `bWrap.innerHTML = NATURAL_DLI.map((m, i) =>
        '<button class="month-btn ' + (i + 1 === state.monthB ? 'on' : '') + '" data-m="' + (i + 1) + '">' + monthLabel(i + 1) + '</button>'
      ).join('');`
);

// fmtDate
h = h.replace(
  /function fmtDate\(d\)\{\s*const dd = String\(d\.getDate\(\)\)\.padStart\(2,'0'\);\s*const mm = \['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'\]\[d\.getMonth\(\)\];\s*const yr = d\.getFullYear\(\) !== new Date\(\)\.getFullYear\(\) \? ' ' \+ d\.getFullYear\(\) : '';\s*return dd \+ ' ' \+ mm \+ yr;\s*\}/,
  `function fmtDate(d){
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = monthLabel(d.getMonth() + 1);
    const yr = d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '';
    return dd + ' ' + mm + yr;
  }`
);

// renderGhStandardsPanel fields
h = h.replace(
  /const fields = \[\s*\{ key: 'germination', label: 'Прорастание', unit: 'сут', min: 1, max: 21 \},[\s\S]*?\{ key: 'manualMass', label: 'Масса 1-го среза', unit: 'г\/горшок', min: 5, max: 500 \}\s*\];/,
  `const fields = [
      { key: 'germination', label: pt('std.gh.germination'), unit: pm('unit.days'), min: 1, max: 21 },
      { key: 'nursery', label: pt('std.gh.nursery'), unit: pm('unit.days'), min: 7, max: 28 },
      { key: 'day', label: pt('std.gh.day'), unit: pm('unit.days'), min: 1, max: 70 },
      { key: 'density', label: pt('std.gh.density'), unit: pm('u.pcsSqm'), min: 15, max: 220 },
      { key: 'cutInterval', label: pt('std.gh.cutInterval'), unit: pm('unit.days'), min: 5, max: 45 },
      { key: 'manualCanopy', label: pt('std.gh.canopy'), unit: pm('unit.mm'), min: 20, max: 600, step: 1 },
      { key: 'manualMass', label: pt('std.gh.cutMass'), unit: pm('u.perPot'), min: 5, max: 500 }
    ];`
);

h = h.replace(
  /html \+= '<motion\.div class="gh-std-field"><label>Число срезок<\/label>/,
  "html += '<motion.div class=\"gh-std-field\"><label>' + pt('std.gh.cutCount') + '</label>"
);
// fix typo if any
h = h.replace(/<motion\.motion/g, '<motion');

h = h.replace(
  /<label>Масса среза ' \+ \(i \+ 1\) \+ '<\/label>/,
  "<label>' + ptf('std.gh.cutMassN', { n: i + 1 }) + '</label>"
);

// syncPalletPlantsHint
h = h.replace(
  /if \(form\) form\.textContent = lid \? \(cells \+ ' отв\. на поддон'\) : \('3×' \+ cells \+ ' в кассетах'\);/,
  "if (form) form.textContent = lid ? ui('ui.pal.formulaLid', { cells: cells }) : ui('ui.pal.formulaCas', { cells: cells });"
);
h = h.replace(
  /if \(prefix\) prefix\.textContent = lid \? 'На поддон \(крышка-крафт\):' : 'На поддон:';/,
  "if (prefix) prefix.textContent = lid ? ui('ui.pal.prefixLid') : ui('ui.pal.plantsPrefix');"
);

// renderEnvSummary — replace whole function body between markers
const envStart = '  function renderEnvSummary(r){';
const envEnd = "    $('env-summary').innerHTML = row1 + row2;";
const i0 = h.indexOf(envStart);
const i1 = h.indexOf(envEnd, i0);
if (i0 < 0 || i1 < 0) throw new Error('renderEnvSummary block not found');
const envNew = `  function renderEnvSummary(r){
    const nat = naturalDLI();
    const eff = effectiveDLI();
    const dayS = daySupplement();
    const eveS = eveningSupplement();
    const eveH = eveningHours();
    const ph = photoperiod();
    const effPh = effectivePhotoperiod();
    const dliF = dliFactor();
    const tF = tempFactor(r.cv);
    const mult = envMultiplier(r.cv);
    const mol = ui('ui.unit.mol');
    const hUnit = ui('ui.unit.hDay');
    const ppfdUnit = ui('ui.unit.umolSq');
    const umolJ = ui('ui.unit.umol');
    const dUnit = pm('unit.days');

    function pillClass(f, neutralAt){
      const ref = neutralAt || 1.0;
      if (f >= ref * 0.95) return 'ok';
      if (f >= ref * 0.75) return 'warn';
      return 'bad';
    }
    function pct(f){ return r1((f - 1) * 100); }
    function sign(p){ return p >= 0 ? '+' : ''; }
    function dliPill(f){ return '<span class="env-pill ' + pillClass(f) + '">DLI ' + sign(pct(f)) + pct(f) + '%</span>'; }
    function tempPill(f){
      const lbl = (isVF() || isPalletView()) ? 'T' : ui('ui.env.temp');
      return '<span class="env-pill ' + pillClass(f) + '">' + lbl + ' ' + sign(pct(f)) + pct(f) + '%</span>';
    }

    let row1, row2;
    if (isVF() || isPalletView()){
      const kwhDay = kwhPerSqmPerDayFromDli(eff);
      const ppfdShow = Math.round(ppfdFromDli(eff, effPh));
      row1 = '<div class="env-row">' +
        '<span>' + ui('ui.env.lightLamps') + '</span>' +
        '<span><strong>' + r1(eff) + '</strong> ' + mol + ' · ' + r1(effPh) + ' ' + hUnit + ' · ~' + ppfdShow + ' ' + ppfdUnit + '</span>' +
        '<span class="env-pill ok">' + ui('ui.env.ledPill', { eff: r1(ledEfficacy()) }) + '</span>' +
        '<span style="opacity:0.8">' + ui('ui.env.kwhApprox', { val: r1(kwhDay), unit: ui('ui.env.kwhDay') }) + '</span></motion.div>';
      row2 = '<motion.div class="env-row">' +
        '<span>' + ui('ui.env.growthRate') + '</span><strong>×' + r2(mult) + '</strong>' +
        dliPill(dliF) + tempPill(tF) +
        '<span style="opacity:0.75">' + ui('ui.env.rhTopt', { rh: state.rh, t: r.cv.t_opt }) + '</span>';
      if (boltShift(r.cv) > 0){
        row2 += '<span class="env-pill ' + (boltShift(r.cv) > 5 ? 'bad' : 'warn') + '">' +
          ui('ui.env.boltMinus') + ' ' + r1(boltShift(r.cv)) + ' ' + dUnit + '</span>';
      }
      row2 += '</motion.div>';
    } else {
      row1 = '<motion.div class="env-row">' +
        '<span>' + ui('ui.env.light') + '</span>' +
        '<span>' + ui('ui.env.natLine', { nat: r1(nat), mol: mol, ph: r1(ph), hUnit: hUnit }) + '</span>';
      if (state.lighting){
        if (dayS > 0){
          row1 += '<span class="env-pill ok">' + ui('ui.env.dayPill', { day: ui('ui.env.daySupp'), val: r1(dayS), mol: mol }) + '</span>';
        }
        if (eveS > 0){
          row1 += '<span class="env-pill ok">' + ui('ui.env.evePill', { eve: ui('ui.env.eveSupp'), h: r1(eveH), val: r1(eveS), mol: mol }) + '</span>';
        }
        if (dayS === 0 && eveS === 0){
          row1 += '<span class="env-pill ok">' + ui('ui.env.noSupp') + '</span>';
        }
        row1 += '<span>' + ui('ui.env.totalLine', { eff: r1(eff), mol: mol, ph: r1(effPh), hUnit: hUnit }) + '</span>';
        row1 += '<span style="opacity:0.8">' + ui('ui.env.eff') + ' ' + r1(state.ledEfficacyGh) + ' ' + umolJ + '</span>';
      } else {
        if (nat < 14) row1 += '<span class="env-pill bad">' + ui('ui.env.lowLight') + '</span>';
        else row1 += '<span class="env-pill ok">' + ui('ui.env.noSuppNeed') + '</span>';
      }
      row1 += '</motion.div>';

      row2 = '<motion.div class="env-row">' +
        '<span>' + ui('ui.env.growthRate') + '</span>' +
        '<strong>×' + r2(mult) + '</strong>' +
        dliPill(dliF) + tempPill(tF) +
        '<span style="opacity:0.75">' + ui('ui.env.cultOpt') + ' ' + r.cv.t_opt + '°C</span>';
      if (boltShift(r.cv) > 0){
        row2 += '<span class="env-pill ' + (boltShift(r.cv) > 5 ? 'bad' : 'warn') + '">' +
          ui('ui.env.boltEarly') + ' ' + r1(boltShift(r.cv)) + ' ' + dUnit + '</span>';
      }
      row2 += '</motion.div>';
    }

    $('env-summary').innerHTML = row1 + row2;`;
// Fix motion typos in envNew
const envBody = envNew.replace(/<\/motion\.motion/g, '</div>').replace(/<motion\.div/g, '<div').replace(/<\/motion\.div>/g, '</motion.div>').replace(/<\/motion\.div>/g, '</div>');
// Actually I introduced motion typos - let me fix envNew properly
const envFixed = envNew.split('</motion.div>').join('</div>').split('<motion.div').join('<div');
h = h.slice(0, i0) + envFixed + h.slice(i1 + envEnd.length);

fs.writeFileSync(htmlPath, h, 'utf8');
console.log('patched calculator, BUILD=' + BUILD);
