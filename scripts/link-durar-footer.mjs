/* link-durar-footer.mjs — يحوّل عنوان «درر العرب» في التذييل إلى رابط القسم الجديد
 * تشغيل: node scripts/link-durar-footer.mjs [--write]
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const skip = new Set(['node_modules', 'dist', '.git', 'seo', 'scripts', 'src', 'public', '.github']);
const OLD = '<h2 class="menu_title">درر العرب</h2>';
const NEW = '<h2 class="menu_title"><a href="https://chat-iraq.com/dardasha/durar/">درر العرب</a></h2>';
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(path.join(dir, e.name)); }
    else if (/\.html?$/i.test(e.name)) files.push(path.join(dir, e.name));
  }
})(root);
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(OLD)) continue;
  const after = before.split(OLD).join(NEW);
  changed += 1;
  if (write) fs.writeFileSync(file, after, 'utf8');
}
console.log(`${write ? 'WROTE' : 'DRY-RUN'} footer durar links`);
console.log(JSON.stringify({ scanned: files.length, changed }, null, 2));
