/* fix-org-name-any-order.mjs — توحيد Organization.name / WebSite.name مهما ترتيب مفاتيح JSON-LD.
 * يبحث عن الكائن الذي يحمل "@type":"Organization" أو "@type":"WebSite" ويستبدل
 * حقل name داخل ذلك الكائن فقط بـ «عسل تايم». الكائنات التي بلا name تُترك كما هي.
 * تشغيل: node scripts/fix-org-name-any-order.mjs --write
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const skip = new Set(['node_modules', 'dist', '.git', 'seo', 'scripts', 'src', 'public', '.github']);
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(path.join(dir, e.name)); }
    else if (/\.html?$/i.test(e.name)) files.push(path.join(dir, e.name));
  }
})(root);

function objectBounds(text, at) {
  let depth = 0;
  for (let i = at; i >= 0; i -= 1) {
    if (text[i] === '}') depth += 1;
    else if (text[i] === '{') {
      if (depth === 0) {
        const start = i;
        depth = 1;
        for (let j = i + 1; j < text.length; j += 1) {
          if (text[j] === '{') depth += 1;
          else if (text[j] === '}') {
            depth -= 1;
            if (depth === 0) return [start, j];
          }
        }
        return null;
      }
      depth -= 1;
    }
  }
  return null;
}

function normalize(text) {
  const hits = [...text.matchAll(/"@type":"(?:Organization|WebSite)"/g)];
  let out = text;
  for (let k = hits.length - 1; k >= 0; k -= 1) {
    const at = hits[k].index;
    const bounds = objectBounds(text, at);
    if (!bounds) continue;
    const [start, end] = bounds;
    const obj = text.slice(start, end + 1);
    const fixed = obj.replace(/("name":")[^"]*(")/, '$1عسل تايم$2');
    if (fixed === obj) continue;
    out = out.slice(0, start) + fixed + out.slice(end + 1);
  }
  return out;
}

const stats = { scanned: files.length, changed: 0 };
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = normalize(before);
  if (after === before) continue;
  stats.changed += 1;
  if (write) fs.writeFileSync(file, after, 'utf8');
}
console.log(`${write ? 'WROTE' : 'DRY-RUN'} entity names (any key order)`);
console.log(JSON.stringify(stats, null, 2));
