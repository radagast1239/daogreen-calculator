const fs = require('fs');
const root = 'c:/Users/Нико/Desktop/КАЛЬКУЛЯТОР САЛАТОВ ПРОТОЧКА';
const BUILD = '2026-05-17-p21-cv';
const htmlPath = root + '/calculator-110x55_12.html';
let lines = fs.readFileSync(htmlPath, 'utf8').split(/\r?\n/);

lines = lines.map(l => l.replace(/2026-05-17-p20-ui/g, BUILD));

const palIdx = lines.findIndex(l => l.includes('pallet-cultivars.js'));
if (palIdx >= 0 && !lines[palIdx + 1].includes('cultivar-registry.js')) {
  lines.splice(palIdx + 1, 0, '<script src="js/cultivar-registry.js?v=' + BUILD + '"></script>');
}

function dropFn(name, nextName) {
  const a = lines.findIndex(l => l.includes('function ' + name) || l.includes('function ' + name + '('));
  if (a < 0) return;
  const b = lines.findIndex((l, i) => i > a && (
    nextName ? l.includes('function ' + nextName) : /^\s*function \w+/.test(l)
  ));
  if (b <= a) {
    console.error('dropFn', name, a, b);
    process.exit(1);
  }
  lines.splice(a, b - a);
}

const drops = [
  ['isVfCvId', 'allGhCultivars'],
  ['allGhCultivars', 'allVfCultivars'],
  ['allVfCultivars', 'isPalletCvId'],
  ['isPalletCvId', 'allPalletCultivars'],
  ['allPalletCultivars', 'isPalletSheetCv'],
  ['isPalletSheetCv', 'getPalletCv'],
  ['getPalletCv', 'getSheetCv'],
  ['getSheetCv', 'isSheetCv'],
  ['isSheetCv', 'usePlantingSheet'],
  ['usePlantingSheet', 'getPlantingStd'],
  ['getVfCv', 'getActiveCv'],
  ['getActiveCv', 'isVfSheetCv'],
  ['findCvById', 'newCustomCvId']
];

for (const [a, b] of drops) dropFn(a, b);

lines = lines.filter(l => l.trim() !== 'const getCv = () => allGhCultivars().find(c => c.id === state.cv) || allGhCultivars()[0];');

dropFn('isPalletView', 'showAsPalletCalc');
const isVfLine = lines.findIndex(l => l.trim() === "const isVF = () => state.facility === 'vertical';");
if (isVfLine >= 0) lines.splice(isVfLine, 1);

const palSecIdx = lines.findIndex(l => l.includes('const PALLET_SECTIONS'));
if (palSecIdx >= 0 && !lines[palSecIdx + 1].includes('var getCv,')) {
  lines.splice(palSecIdx + 1, 0,
    '',
    '  var getCv, isPalletView, isVF, isVfCvId, allGhCultivars, allVfCultivars, isPalletCvId, allPalletCultivars;',
    '  var isPalletSheetCv, getPalletCv, getVfCv, getActiveCv, getSheetCv, isSheetCv, usePlantingSheet, findCvById;'
  );
}

const initBlock = [
  '  function initCultivarRegistry(){',
  '    if (!window.DG_createCultivarRegistry){',
  '      console.warn(\'cultivar-registry.js не загружен\');',
  '      return;',
  '    }',
  '    var cr = window.DG_createCultivarRegistry({',
  '      getState: function(){ return state; },',
  '      CULTIVARS: CULTIVARS,',
  '      VF_CULTIVARS: VF_CULTIVARS,',
  '      PALLET_CULTIVARS: PALLET_CULTIVARS,',
  '      isVfSheetCv: isVfSheetCv',
  '    });',
  '    isPalletView = cr.isPalletView;',
  '    isVF = cr.isVF;',
  '    isVfCvId = cr.isVfCvId;',
  '    allGhCultivars = cr.allGhCultivars;',
  '    allVfCultivars = cr.allVfCultivars;',
  '    isPalletCvId = cr.isPalletCvId;',
  '    allPalletCultivars = cr.allPalletCultivars;',
  '    isPalletSheetCv = cr.isPalletSheetCv;',
  '    getCv = cr.getCv;',
  '    getPalletCv = cr.getPalletCv;',
  '    getVfCv = cr.getVfCv;',
  '    getActiveCv = cr.getActiveCv;',
  '    getSheetCv = cr.getSheetCv;',
  '    isSheetCv = cr.isSheetCv;',
  '    usePlantingSheet = cr.usePlantingSheet;',
  '    findCvById = cr.findCvById;',
  '  }',
  '  initCultivarRegistry();'
];

const vfIdx = lines.findIndex(l => l.includes('const PALLET_CULTIVARS'));
if (vfIdx < 0) {
  console.error('PALLET_CULTIVARS');
  process.exit(1);
}
let endPal = vfIdx;
while (endPal < lines.length && !lines[endPal].includes('const CUSTOM_CULTIVARS')) endPal++;
lines.splice(endPal, 0, ...initBlock);

const calIdx = lines.findIndex(l => l.includes("const CALC_BUILD = '"));
if (calIdx >= 0) lines[calIdx] = "  const CALC_BUILD = '" + BUILD + "';";

fs.writeFileSync(htmlPath, lines.join('\n'), 'utf8');
['index.html', 'start-server.bat'].forEach(f => {
  const p = root + '/' + f;
  if (fs.existsSync(p)) {
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/2026-05-17-p20-ui/g, BUILD), 'utf8');
  }
});
console.log('ok', lines.length, 'lines');
