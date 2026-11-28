/* unify-brand-name.mjs — توحيد اسم العلامة «عسل تايم» في كل أصول الموقع.
 *
 * الاسم الرسمي = «عسل تايم» فقط. «شات» و«دردشة» كلمات تصف الخدمة، ولا تُستخدمان
 * في حقول الاسم (Organization.name / WebSite.name / og:site_name / لاحقة العنوان).
 *
 * هذه الأداة تُصلح الأثر المتبقي من الاسمين السابقين:
 *   «شات درر العرب»  → «عسل تايم»
 *   لاحقة «| شات عسل تايم» → «| عسل تايم»
 *   نص المشاركة المُشفّر للاسم القديم → نص «عسل تايم» المُشفّر
 *
 * يُستثنى التوثيق التاريخي فقط: /brand/ و llms.txt و seo/ و dnd.txt و README.md
 * و scripts/ و ملف الجلسة. تشغيل: node scripts/unify-brand-name.mjs --write
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const skipDirs = new Set(['node_modules', 'dist', '.git']);
const docPrefixes = ['brand' + path.sep, 'seo' + path.sep, 'scripts' + path.sep, '.github' + path.sep];
const docFiles = new Set(['llms.txt', 'dnd.txt', 'README.md', 'session-ses_de63.md']);

const OLD_NETWORK = 'شات درر العرب';
const NEW_NAME = 'عسل تايم';
const OLD_ENC = '%D8%B4%D8%A7%D8%AA%20%D8%AF%D8%B1%D8%B1%20%D8%A7%D9%84%D8%B9%D8%B1%D8%A8';
const NEW_ENC = '%D8%B9%D8%B3%D9%84%20%D8%AA%D8%A7%D9%8A%D9%85';
const replacements = [
  [OLD_ENC, NEW_ENC],
  [OLD_NETWORK, NEW_NAME],
  ['| شات عسل تايم', '| ' + NEW_NAME],
];

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.relative(root, path.join(dir, e.name));
    if (e.isDirectory()) {
      if (!skipDirs.has(e.name) && !docPrefixes.some((p) => rel === p.slice(0, -1) || rel.startsWith(p))) walk(path.join(dir, e.name));
    } else if (/\.(html?|json|md|txt|js|mjs)$/i.test(e.name) && !docFiles.has(e.name)) files.push(path.join(dir, e.name));
  }
})(root);

const stats = { scanned: files.length, changed: 0, network: 0, suffix: 0, encoded: 0 };
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [from, to] of replacements) after = after.split(from).join(to);
  if (after === before) continue;
  stats.changed += 1;
  if (before.includes(OLD_NETWORK)) stats.network += 1;
  if (before.includes('| شات عسل تايم')) stats.suffix += 1;
  if (before.includes(OLD_ENC)) stats.encoded += 1;
  if (write) fs.writeFileSync(file, after, 'utf8');
}
console.log(`${write ? 'WROTE' : 'DRY-RUN'} unified brand name = ${NEW_NAME}`);
console.log(JSON.stringify(stats, null, 2));
