/**
 * Сборка: синхронизация CALC_BUILD и ?v= во всех скриптах, index, start-server.bat.
 * Не извлекает модули из HTML (для этого — устаревшие _tools/_wire-*.js).
 *
 * npm run build
 * npm run build -- --set 2026-05-18-p32-name
 * npm run build -- --dry-run
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const manifest = require('./build-manifest');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, manifest.htmlFile);

function read(p){ return fs.readFileSync(path.join(root, p), 'utf8'); }
function write(p, content){ fs.writeFileSync(path.join(root, p), content, 'utf8'); }

function escapeRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function readCalcBuild(html){
  var m = html.match(/const CALC_BUILD = '([^']+)'/);
  return m ? m[1] : null;
}

function setCalcBuild(html, build){
  if (!html.match(/const CALC_BUILD = '[^']+'/)){
    throw new Error('CALC_BUILD not found in ' + manifest.htmlFile);
  }
  return html.replace(/const CALC_BUILD = '[^']+'/, "const CALC_BUILD = '" + build + "'");
}

function syncCacheGuard(html, build){
  if (!html.includes('id="calc-cache-guard"')){
    throw new Error('calc-cache-guard script missing in ' + manifest.htmlFile);
  }
  return html.replace(
    /(<script id="calc-cache-guard">[\s\S]*?var BUILD=')[^']+'/,
    "$1" + build + "'"
  );
}

function syncScriptVersions(html, build){
  manifest.versionedScripts.forEach(function(rel){
    var esc = escapeRe(rel);
    var withV = new RegExp('(<script src="' + esc + ')\\?v=[^"]+"', 'g');
    if (html.match(withV)){
      html = html.replace(withV, '$1?v=' + build + '"');
      return;
    }
    var bare = new RegExp('(<script src="' + esc + '")(\\s*>)', 'g');
    if (html.match(bare)){
      html = html.replace(bare, '$1?v=' + build + '$2');
      return;
    }
    throw new Error('script tag not found in HTML: ' + rel);
  });
  return html;
}

function syncIndex(build){
  var p = manifest.indexFile;
  var html = read(p);
  var next = html
    .replace(/calculator-110x55_12\.html\?v=[^"']+/g, manifest.htmlFile + '?v=' + build)
    .replace(/content="0;url=calculator-110x55_12\.html[^"]*"/,
      'content="0;url=' + manifest.htmlFile + '?v=' + build + '"');
  if (next !== html) write(p, next);
}

function syncServerBat(build){
  var p = manifest.serverBat;
  if (!fs.existsSync(path.join(root, p))) return;
  var txt = read(p);
  var next = txt.replace(/Сборка [^\r\n]+/, 'Сборка ' + build);
  if (next !== txt) write(p, next);
}

function syncWebManifest(build){
  var p = 'manifest.webmanifest';
  var raw = read(p);
  var startUrl = './' + manifest.htmlFile + '?v=' + build;
  var next = raw.replace(/"start_url":\s*"[^"]*"/, '"start_url": "' + startUrl + '"');
  if (next !== raw) write(p, next);
}

function syncServiceWorker(build){
  var precache = [
    './',
    './index.html',
    './' + manifest.htmlFile + '?v=' + build,
    './manifest.webmanifest',
    './icons/icon.svg',
    './sw.js'
  ];
  manifest.versionedScripts.forEach(function(rel){
    precache.push('./' + rel + '?v=' + build);
  });
  manifest.staticScripts.forEach(function(rel){
    precache.push('./' + rel);
  });
  precache.push('./js/vendor/DejaVuSans.ttf');
  precache.push('./js/pwa-register.js?v=' + build);

  var sw = read('sw.js');
  sw = sw.replace(/var CACHE = '[^']+';/, "var CACHE = 'daogreen-" + build + "';");
  sw = sw.replace(/var PRECACHE = \[[\s\S]*?\];/, 'var PRECACHE = ' + JSON.stringify(precache, null, 2) + ';');
  write('sw.js', sw);
}

function ensurePdfFontFile(){
  var dst = path.join(root, 'js/vendor/DejaVuSans.ttf');
  if (fs.existsSync(dst) && fs.statSync(dst).size > 100000) return;
  var src = path.join(root, 'node_modules/dejavu-fonts-ttf/ttf/DejaVuSans.ttf');
  if (!fs.existsSync(src)){
    console.warn('WARN  DejaVuSans.ttf: npm install dejavu-fonts-ttf (или положите файл в js/vendor/)');
    return;
  }
  fs.copyFileSync(src, dst);
  console.log('Copied PDF font -> js/vendor/DejaVuSans.ttf');
}

function verifyFilesExist(){
  ensurePdfFontFile();
  var missing = [];
  manifest.versionedScripts.concat(manifest.staticScripts).forEach(function(rel){
    if (!fs.existsSync(path.join(root, rel))) missing.push(rel);
  });
  var pdfFont = path.join(root, 'js/vendor/DejaVuSans.ttf');
  if (!fs.existsSync(pdfFont) || fs.statSync(pdfFont).size < 100000) missing.push('js/vendor/DejaVuSans.ttf');
  if (missing.length) throw new Error('Missing files:\n  ' + missing.join('\n  '));
}

function collectVersionDrift(html, build){
  var drift = [];
  manifest.versionedScripts.forEach(function(rel){
    var re = new RegExp('<script src="' + escapeRe(rel) + '\\?v=([^"]+)"');
    var m = html.match(re);
    if (!m) drift.push(rel + ': not linked');
    else if (m[1] !== build) drift.push(rel + ': ' + m[1]);
  });
  return drift;
}

function main(){
  var args = process.argv.slice(2);
  var dryRun = args.indexOf('--dry-run') >= 0;
  var setIdx = args.indexOf('--set');
  var newBuild = setIdx >= 0 ? args[setIdx + 1] : (process.env.BUILD || null);

  verifyFilesExist();

  var html = read(manifest.htmlFile);
  var build = newBuild || readCalcBuild(html);
  if (!build){
    console.error('CALC_BUILD not found. Use: npm run build -- --set 2026-05-18-p32-name');
    process.exit(1);
  }

  if (newBuild) html = setCalcBuild(html, build);

  var beforeDrift = collectVersionDrift(html, build);
  html = syncScriptVersions(html, build);
  html = syncCacheGuard(html, build);
  var afterDrift = collectVersionDrift(html, build);

  console.log('Build ID: ' + build);
  if (beforeDrift.length){
    console.log('Version drift fixed:');
    beforeDrift.forEach(function(d){ console.log('  - ' + d); });
  } else {
    console.log('Script ?v= already aligned with CALC_BUILD');
  }
  if (afterDrift.length){
    console.error('Still drifted after sync:', afterDrift);
    process.exit(1);
  }

  if (dryRun){
    console.log('--dry-run: files not written');
    return;
  }

  write(manifest.htmlFile, html);
  syncIndex(build);
  syncServerBat(build);
  syncWebManifest(build);
  syncServiceWorker(build);
  console.log('Updated: ' + manifest.htmlFile + ', ' + manifest.indexFile + ', ' + manifest.serverBat + ', manifest, sw.js');

  console.log('\nRunning smoke-check...');
  execSync('node _tools/smoke-check.js', { cwd: root, stdio: 'inherit' });
}

main();
