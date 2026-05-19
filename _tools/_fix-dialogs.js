const fs = require('fs');
const path = require('path');
const htmlPath = path.join('c:/Users/Нико/Desktop/КАЛЬКУЛЯТОР САЛАТОВ ПРОТОЧКА', 'calculator-110x55_12.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const pdfStart = html.indexOf('<dialog id="pdf-export-dialog"');
const cvStart = html.indexOf('<dialog id="cv-add-dialog"');
const bodyEnd = html.indexOf('</body>');
if (pdfStart < 0 || cvStart < 0) {
  console.error('dialogs not found');
  process.exit(1);
}

const pdfBlock = html.slice(pdfStart, cvStart).trim();
const cvBlock = html.slice(cvStart, bodyEnd).trim();

html = html.slice(0, pdfStart) + html.slice(bodyEnd);
const insertAt = html.indexOf('<script src="vf-cultivars.js');
if (insertAt < 0) {
  console.error('insert point');
  process.exit(1);
}
html = html.slice(0, insertAt) + pdfBlock + '\n\n' + cvBlock + '\n\n' + html.slice(insertAt);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('dialogs moved before scripts');
