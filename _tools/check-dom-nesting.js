'use strict';
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'calculator-110x55_12.html'), 'utf8');
const start = html.indexOf('id="view-planting"');
const end = html.indexOf('<footer class="colophon"');
const chunk = html.slice(start, end);

const stack = [];
const re = /<\/?(section|div)\b[^>]*>/gi;
let m;
const problems = [];
while ((m = re.exec(chunk)) !== null) {
  const tag = m[0];
  const name = m[1].toLowerCase();
  const isClose = tag.startsWith('</');
  const selfClose = /\/>\s*$/.test(tag);
  if (selfClose) continue;
  const idMatch = tag.match(/\bid="([^"]+)"/);
  const id = idMatch ? idMatch[1] : '';
  if (isClose) {
    const top = stack.pop();
    if (!top || top.name !== name) {
      problems.push('Mismatch close </' + name + '> expected </' + (top && top.name) + '> near ' + id);
    }
  } else {
    stack.push({ name, id, pos: m.index });
  }
}
console.log('Unclosed at end:', stack.slice(-8).map((s) => s.name + (s.id ? '#' + s.id : '')).join(' > '));
console.log('Problems:', problems.length ? problems.slice(0, 10) : 'none');

const cultivarsEnd = chunk.indexOf('</section>', chunk.indexOf('panel-cultivars'));
const envPos = chunk.indexOf('id="env-panel"');
const georgyClose = chunk.indexOf('</section>', chunk.indexOf('panel-georgy-simple'));
console.log('env-panel after cultivars section close:', envPos > cultivarsEnd);
console.log('panel-georgy-simple closed before env-panel:', georgyClose > 0 && georgyClose < envPos);
