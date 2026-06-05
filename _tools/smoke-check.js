/** Быстрая проверка целостности (не трогает формулы calc) */
const fs = require('fs');
const path = require('path');
const manifest = require('./build-manifest');

const root = path.join(__dirname, '..');

function read(p){ return fs.readFileSync(path.join(root, p), 'utf8'); }

const checks = [];
function ok(msg){ checks.push({ ok: true, msg }); }
function fail(msg){ checks.push({ ok: false, msg }); }

const html = read(manifest.htmlFile);
const buildMatch = html.match(/const CALC_BUILD = '([^']+)'/);
const build = buildMatch ? buildMatch[1] : null;

if (build) ok('CALC_BUILD: ' + build);
else fail('CALC_BUILD missing in html');

manifest.versionedScripts.forEach(function(s){
  if (!html.includes(s)) fail('missing script in html: ' + s);
  else ok('script linked: ' + s);
});

if (build){
  manifest.versionedScripts.forEach(function(s){
    var re = new RegExp('<script src="' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=([^"]+)"');
    var m = html.match(re);
    if (!m) fail('version tag missing: ' + s);
    else if (m[1] !== build) fail('version drift ' + s + ': ' + m[1] + ' != ' + build);
    else ok('version synced: ' + s);
  });
}

manifest.staticScripts.forEach(function(s){
  if (html.includes(s)) ok('vendor linked: ' + s);
  else fail('missing vendor: ' + s);
});

manifest.syntaxCheck.forEach(function(f){
  try {
    new Function(read(f));
    ok('syntax ok: ' + f);
  } catch (e){
    fail('syntax error ' + f + ': ' + e.message);
  }
});

if (html.includes('getActivePlantingCvId: getActivePlantingCvId')) ok('econ-core dep wired');
else fail('getActivePlantingCvId not in initEconCore deps');

if (html.includes('VF_CULTIVARS: VF_CULTIVARS')) ok('econ-ui VF_CULTIVARS dep');
else fail('VF_CULTIVARS not in initEconUI deps');

const econGlue = fs.existsSync(path.join(root, 'js/planting-econ-glue.js'))
  ? read('js/planting-econ-glue.js')
  : '';
const econSrc = html + econGlue;
if (econSrc.includes('econCulturesTotalPct: econCulturesTotalPct')) ok('econCulturesTotalPct dep');
else fail('econCulturesTotalPct not in initEconUI deps');

if (html.includes('econ-panel-sensitivity')) ok('sensitivity panel in html');
else fail('econ-panel-sensitivity missing');

if (html.includes('econ-panel-payback')) ok('payback panel in html');
else fail('econ-panel-payback missing');

if (econSrc.includes('DG_renderEconPayback')) ok('payback render wired');
else fail('DG_renderEconPayback not wired');

if (econSrc.includes('DG_initEconSensitivityExtras')) ok('sensitivity extras init');
else fail('DG_initEconSensitivityExtras not wired');

if (html.includes('btn-project-compare')) ok('project compare ui');
if (html.includes('btn-tour')) ok('onboarding tour ui');
if (html.includes('econ-panel-advanced')) ok('econ advanced panel');
if (html.includes('DG_initReadonlyMode')) ok('readonly mode wired');
if (html.includes('js/locale.js')) ok('locale.js linked');
if (html.includes('DG_initLocale')) ok('locale init wired');
if (html.includes('btn-locale-toggle')) ok('locale ui');

if (fs.existsSync(path.join(root, 'package.json'))) ok('package.json');
else fail('package.json missing');

const vendorH2c = path.join(root, 'js/vendor/html2canvas.min.js');
if (fs.existsSync(vendorH2c) && fs.statSync(vendorH2c).size > 10000) ok('vendor html2canvas');
else fail('vendor html2canvas missing or too small');

if (html.includes('pdf-econ-tables.js')) ok('pdf-econ-tables linked');
else fail('pdf-econ-tables.js not in html');

const pdfFont = path.join(root, 'js/vendor/DejaVuSans.ttf');
if (fs.existsSync(pdfFont) && fs.statSync(pdfFont).size > 100000) ok('vendor DejaVuSans.ttf');
else fail('js/vendor/DejaVuSans.ttf missing (npm run build)');

const indexHtml = read(manifest.indexFile);
if (build && indexHtml.includes('?v=' + build)) ok('index.html build ref');
else if (build) fail('index.html not synced to CALC_BUILD');

if (fs.existsSync(path.join(root, 'manifest.webmanifest'))) ok('manifest.webmanifest');
else fail('manifest.webmanifest missing');

if (fs.existsSync(path.join(root, 'sw.js'))) ok('sw.js');
else fail('sw.js missing');

if (html.includes('manifest.webmanifest')) ok('manifest linked in html');
else fail('manifest not linked');

if (html.includes('pwa-register.js')) ok('pwa-register linked');
else fail('pwa-register.js not linked');

if (build){
  var swTxt = read('sw.js');
  if (swTxt.includes("daogreen-" + build)) ok('sw cache version synced');
  else fail('sw.js CACHE not synced to CALC_BUILD');
}

(function(){
  var vpStart = html.indexOf('id="view-planting"');
  var vpEnd = html.indexOf('<footer class="colophon"');
  if (vpStart < 0 || vpEnd < 0) return;
  var vp = html.slice(vpStart, vpEnd);
  var gs = vp.indexOf('id="panel-georgy-simple"');
  var ep = vp.indexOf('id="env-panel"');
  if (gs >= 0 && ep > gs){
    var between = vp.slice(gs, ep);
    var open = (between.match(/<section\b/g) || []).length;
    var close = (between.match(/<\/section>/g) || []).length;
    if (open > close) fail('env-panel nested inside panel-georgy-simple (missing </section>)');
    else ok('planting DOM: env-panel outside georgy panel');
  }
})();

const failed = checks.filter(c => !c.ok);
checks.forEach(c => console.log((c.ok ? 'OK  ' : 'FAIL') + ' ' + c.msg));
console.log('\n' + (failed.length ? failed.length + ' failed' : 'All checks passed'));
process.exit(failed.length ? 1 : 0);
