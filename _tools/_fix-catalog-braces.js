const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
['pallet-cultivars.js', 'vf-cultivars.js'].forEach((f) => {
  const p = path.join(root, f);
  let s = fs.readFileSync(p, 'utf8');
  let n = 0;
  s = s.replace(/^(.*(?:plC|vfC)\(.*)$/gm, (line) => {
    const fixed = line.replace(/',\s{2,}([a-zA-Z_]+):/g, (m, key) => {
      n++;
      return "', { " + key + ":";
    });
    return fixed;
  });
  fs.writeFileSync(p, s);
  console.log(f + ': fixed ' + n);
});
