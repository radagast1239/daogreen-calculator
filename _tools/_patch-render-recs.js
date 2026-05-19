const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'calculator-110x55_12.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const start = html.indexOf('  function renderRecs(r){');
const end = html.indexOf('\n  function syncVfSlidersFromState()', start);
if (start < 0 || end < 0) { console.error('markers not found', start, end); process.exit(1); }

const fn = `  function renderRecs(r){
    const recs = [];
    const push = (t, i, txt) => recs.push({ t, i, txt });

    const nat = naturalDLI();
    const eff = effectiveDLI();
    const effPh = effectivePhotoperiod();
    const monthName = monthLabel(state.month);

    if (isVF()){
      if (eff < 12){
        push('bad', 'bad', pr('rec.vf.dli.bad', { dli: r1(eff) }));
      } else if (eff < 14){
        push('warn', 'warn', pr('rec.vf.dli.warnLow', { dli: r1(eff) }));
      } else if (eff >= 14 && eff <= 17){
        push('check', 'check', pr('rec.vf.dli.ok', { dli: r1(eff) }));
      } else if (eff > 20){
        push('warn', 'warn', pr('rec.vf.dli.warnHigh', { dli: r1(eff) }));
      } else {
        push('info', 'info', pr('rec.vf.dli.infoHigh', { dli: r1(eff) }));
      }
      if (effPh < 15 || effPh > 18){
        push('info', 'info', pr('rec.vf.ph', { ph: r1(effPh) }));
      }
      if (state.rh > 75 && eff > 16){
        push('warn', 'warn', pr('rec.vf.rh.warn', { rh: state.rh, dli: r1(eff) }));
      } else if (state.rh < 50){
        push('info', 'info', pr('rec.vf.rh.low', { rh: state.rh }));
      }
    } else if (!state.lighting){
      if (nat < 10){
        push('bad', 'bad', pr('rec.gh.nat.bad', { month: monthName, nat: r1(nat) }));
      } else if (nat < 14){
        push('warn', 'warn', pr('rec.gh.nat.warn', { month: monthName, nat: r1(nat), pct: Math.round((1 - dliFactor()) * 100) }));
      } else if (nat >= 18){
        push('check', 'check', pr('rec.gh.nat.ok', { month: monthName, nat: r1(nat) }));
      }
    } else {
      const supp = supplementDLI();
      if (supp === 0){
        push('info', 'info', pr('rec.gh.supp.zero', { month: monthName, nat: r1(nat), target: state.targetDli }));
      } else if (supp < 4){
        push('info', 'info', pr('rec.gh.supp.low', { month: monthName, supp: r1(supp) }));
      } else {
        push('check', 'check', pr('rec.gh.supp.ok', {
          month: monthName, supp: r1(supp), nat: r1(nat), eff: r1(eff),
          wpm: Math.round(supp * 1e6 / 12 / state.ledEfficacyGh), led: r1(state.ledEfficacyGh)
        }));
      }
    }

    if (showAsPalletCalc(r) && r.leafGap < -10){
      push('warn', 'warn', pr('rec.pal.leafOverlap', { mm: round(-r.leafGap) }));
    }
    if (r.vfMode && !showAsPalletCalc(r) && state.density >= 180){
      push('warn', 'warn', pr('rec.vf.density', { dens: state.density }));
    }

    if (!isVF()){
      const ph = photoperiod();
      if (ph < 11 && !state.lighting){
        push('warn', 'warn', pr('rec.gh.ph', { ph: r1(ph) }));
      }
    }

    const t_opt = r.cv.t_opt;
    const overOpt = state.temp - t_opt;
    const isHeatTolerant = r.cv.heatSigma > 90;
    const tempLimit1 = isHeatTolerant ? 8 : 4;
    const tempLimit2 = isHeatTolerant ? 12 : 8;

    if (overOpt >= tempLimit2){
      push('bad', 'bad', pr('rec.temp.bad', {
        temp: state.temp, name: r.cv.name, opt: t_opt, over: r1(overOpt),
        growth: r1(tempFactor(r.cv) * 100), bolt: r1(boltShift(r.cv))
      }));
    } else if (overOpt >= tempLimit1){
      push('warn', 'warn', pr(isHeatTolerant ? 'rec.temp.warnHeat' : 'rec.temp.warn', {
        temp: state.temp, opt: t_opt, growth: r1(tempFactor(r.cv) * 100), bolt: r1(boltShift(r.cv))
      }));
    } else if (Math.abs(overOpt) <= 2){
      push('check', 'check', pr('rec.temp.ok', {
        temp: state.temp, name: r.cv.name, opt: t_opt, growth: r1(tempFactor(r.cv) * 100)
      }));
    } else if (overOpt < -3){
      push('info', 'info', pr('rec.temp.cold', { temp: state.temp, opt: t_opt }));
    }

    if (r.crowdF < 0.97){
      const lossPct = round((1 - r.crowdF) * 100);
      push('warn', 'warn', pr('rec.crowd', {
        loss: lossPct, max: r.cv.M_max, adj: round(r.cv.M_max * r.crowdF),
        hint: showAsPalletCalc(r) ? pr('rec.crowd.hintPal') : pr('rec.crowd.hintCh')
      }));
    }

    if (r.t_ch >= r.tBoltCh){
      push('bad', 'bad', pr('rec.stage.bolt', {
        name: r.cv.name, days: r.t_ch, ctx: vegContextLabel(), bolt: round(r.tBoltCh), harvest: round(r.tHarvestCh)
      }));
    } else if (r.t_ch > r.tHarvestCh + 3){
      push('warn', 'warn', pr('rec.stage.slow', { rgr: r1(r.rgrMass), harvest: round(r.tHarvestCh) }));
    } else if (Math.abs(r.t_ch - r.tHarvestCh) <= 2){
      push('check', 'check', pr('rec.stage.harvest', {
        harvest: round(r.tHarvestCh), ctx: vegContextLabel(), rgr: r1(r.rgrMass)
      }));
    } else if (r.t_ch < r.tHarvestCh - 5){
      push('info', 'info', pr('rec.stage.early', {
        mass: round(r.mass), rgr: r1(r.rgrMass),
        days: Math.round(r.tHarvestCh - r.t_ch), future: round(massAtTotal(r.cv, totalAge(r.tHarvestCh)))
      }));
    }

    if (showAsPalletCalc(r)){
      if (r.leafGap < -30){
        push('bad', 'bad', pr('rec.pal.canopy.bad', { mm: round(-r.leafGap) }));
      } else if (r.leafGap >= -10 && r.leafGap < 10){
        push('check', 'check', pr('rec.pal.canopy.touch', { gap: round(r.leafGap) }));
      } else if (r.leafGap < 50){
        push('check', 'check', pr('rec.pal.canopy.gap', { gap: round(r.leafGap) }));
      } else {
        const dDay = r.tHarvestCh > r.t_ch ? Math.round(r.tHarvestCh - r.t_ch) : 0;
        push('info', 'info', pr('rec.pal.canopy.loose', {
          gap: round(r.leafGap),
          extra: dDay ? pr('rec.pal.canopy.looseExtra', { days: dDay }) : ''
        }));
      }
      if (r.edgeGap < 5){
        push('info', 'info', pr('rec.pal.edge', { edge: round(r.edgeGap), d: round(r.cellD), pitch: round(r.cellPitch) }));
      }
    } else if (r.leafGap < -30){
      push('bad', 'bad', pr('rec.canopy.bad', { mm: round(-r.leafGap) }));
    } else if (r.leafGap < -10){
      push('warn', 'warn', pr('rec.canopy.overlap', { mm: round(-r.leafGap) }));
    } else if (r.leafGap < 10){
      push('check', 'check', pr('rec.canopy.touch', { gap: round(r.leafGap) }));
    } else if (r.leafGap < 50){
      push('check', 'check', pr('rec.canopy.gap', { gap: round(r.leafGap) }));
    } else {
      const dDay = r.tHarvestCh > r.t_ch ? Math.round(r.tHarvestCh - r.t_ch) : 0;
      push('info', 'info', pr('rec.canopy.loose', {
        gap: round(r.leafGap),
        extra: dDay ? pr('rec.canopy.looseExtra', { days: dDay }) : ''
      }));
    }

    if (r.edgeGap < 0 && !showAsPalletCalc(r)){
      push('bad', 'bad', pr('rec.geom.pots.bad', { gap: round(r.edgeGap) }));
    } else if (r.edgeGap < 15 && !showAsPalletCalc(r)){
      push('warn', 'warn', pr('rec.geom.pots.warn', { gap: round(r.edgeGap) }));
    }

    const unitW = showAsPalletCalc(r) ? pr('rec.unit.pallets') : pr('rec.unit.channels');
    if (!showAsPalletCalc(r)){
      if (r.widthExceeds){
        push('bad', 'bad', pr('rec.width.bad', {
          w: round(r.sysWmm), over: round(r.sysWmm - MAX_WIDTH), unit: unitW, max: r.maxChannelsFit
        }));
      } else if (r.widthClose){
        push('info', 'info', pr('rec.width.close', { w: round(r.sysWmm) }));
      } else if (state.nch < r.maxChannelsFit){
        push('info', 'info', pr('rec.width.spare', { max: r.maxChannelsFit, unit: unitW, spare: r.maxChannelsFit - state.nch }));
      }
    }

    if (!showAsPalletCalc(r) && r.constrained && state.extraB === 0){
      push('warn', 'warn', pr('rec.channels.tight', { b: CH_W, rho: round(r.rhoA) }));
    }
    if (showAsPalletCalc(r)){
      const ml = r.mountMode === 'lid' ? pr('rec.pal.mount.lid') : pr('rec.pal.mount.cassette');
      const tierNote = r.palletTiers > 1
        ? pr('rec.pal.tier', { n: r.palletTiers, area: r.sysArea != null ? r.sysArea.toFixed(2) : '—' }) : '';
      push('check', 'check', pr('rec.pal.zone', {
        len: (r.zoneLenMm/1000).toFixed(1), along: r.alongLength, across: r.acrossPallets,
        mount: ml, total: r.total, tier: tierNote, rho: round(r.rhoA)
      }));
    }

    if (r.cv.id === 'rucola') push('info', 'bulb', pr('rec.cv.rucola'));
    if (r.cv.id === 'aficion') push('info', 'bulb', pr('rec.cv.aficion'));
    if (r.cv.id === 'afilion') push('info', 'bulb', pr('rec.cv.afilion'));
    if (r.cv.id === 'starfighter') push('info', 'bulb', pr('rec.cv.starfighter', { days: round(r.tBoltCh - r.tHarvestCh) }));
    if (r.cv.id === 'grazion') push('info', 'bulb', pr('rec.cv.grazion', { max: r.cv.M_max }));
    if (r.cv.id === 'romaine') push('info', 'bulb', pr('rec.cv.romaine', { ca: r.cv.ca }));
    if (r.cv.id === 'oakleaf') push('info', 'bulb', pr('rec.cv.oakleaf', { ca: r.cv.ca }));
    if (supportsMulticut(r.cv) && !state.multicut){
      push('info', 'bulb', pr('rec.cv.multicut', { name: r.cv.name }));
    }

    if (!showAsPalletCalc(r) && state.length >= 8){
      push('info', 'info', pr('rec.channel.long', { len: state.length }));
    }
    if (state.nursery < 12){
      push('info', 'info', pr('rec.nursery.short', { days: state.nursery }));
    } else if (state.nursery > 18){
      push('warn', 'warn', pr('rec.nursery.long', { days: state.nursery }));
    }

    $('recs').innerHTML = recs.map(rc =>
      '<div class="rec ' + rc.t + '">' + ICON[rc.i] + '<span>' + rc.txt + '</span></div>'
    ).join('');
  }

`;

fs.writeFileSync(htmlPath, html.slice(0, start) + fn + html.slice(end));
console.log('renderRecs OK');
