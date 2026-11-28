/* fix-entity-name-leftovers.mjs — إصلاح آخر الحقول التي ما زالت تحمل أسماء غير «عسل تايم».
 *  1) Organization.name كان يحمل عنوان صفحة في 13 غرفة.
 *  2) حقوق النشر كانت تقول «شات عسل تايم» في 2,386 صفحة.
 * تشغيل: node scripts/fix-entity-name-leftovers.mjs --write
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

const orgRe = /("@type":"Organization","@id":"https:\/\/chat-iraq\.com\/#organization","name":")[^"]*(")/;
const copyrightFixes = [
  ['&copy; 2026 شات عسل تايم', '&copy; 2026 عسل تايم'],
  ['© 2026 شات عسل تايم', '© 2026 عسل تايم'],
];
const stats = { scanned: files.length, changed: 0, org: 0, copyright: 0 };
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before.replace(orgRe, '$1عسل تايم$2');
  if (after !== before) stats.org += 1;
  if (before.includes('2026 شات عسل تايم')) stats.copyright += 1;
  for (const [from, to] of copyrightFixes) after = after.split(from).join(to);
  if (after === before) continue;
  stats.changed += 1;
  if (write) fs.writeFileSync(file, after, 'utf8');
}
console.log(`${write ? 'WROTE' : 'DRY-RUN'} entity name leftovers`);
console.log(JSON.stringify(stats, null, 2));
