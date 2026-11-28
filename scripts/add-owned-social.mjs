/* add-owned-social.mjs — يضيف صفحة فيسبوك المملوكة «3asltime» إلى البيانات المنظّمة
 * ويجعلها رابط التذييل المرئي، مع الإبقاء على الحساب القديم في sameAs.
 * تشغيل: node scripts/add-owned-social.mjs --write
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const skip = new Set(['node_modules', 'dist', '.git', 'seo', 'scripts', 'src', 'public', '.github']);
const OLD_FB = 'https://www.facebook.com/chatiraqi';
const NEW_FB = 'https://www.facebook.com/3asltime/';
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(path.join(dir, e.name)); }
    else if (/\.html?$/i.test(e.name)) files.push(path.join(dir, e.name));
  }
})(root);

const stats = { scanned: files.length, changed: 0, sameAs: 0, visibleLink: 0 };
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before.replace(
    /"sameAs"\s*:\s*\[([^\]]*?)("https:\/\/www\.facebook\.com\/chatiraqi")/g,
    (whole, prefix, quotedOld) => {
      if (whole.includes('facebook.com/3asltime')) return whole;
      return `"sameAs":[${prefix}"${NEW_FB}",${quotedOld}`;
    },
  );
  if (after !== before) stats.sameAs += 1;
  const linkBefore = after;
  after = after.split(`href="${OLD_FB}"`).join(`href="${NEW_FB}"`)
    .split(`href='${OLD_FB}'`).join(`href='${NEW_FB}'`);
  if (after !== linkBefore) stats.visibleLink += 1;
  if (after === before) continue;
  stats.changed += 1;
  if (write) fs.writeFileSync(file, after, 'utf8');
}

const dataPath = path.join(root, 'data', 'forum.json');
const dataBefore = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(dataBefore);
if (data.social && data.social.includes(OLD_FB) && !data.social.includes(NEW_FB)) {
  data.social.splice(data.social.indexOf(OLD_FB), 0, NEW_FB);
  const dataAfter = JSON.stringify(data, null, 2) + '\n';
  if (write) fs.writeFileSync(dataPath, dataAfter, 'utf8');
  stats.forumData = true;
} else {
  stats.forumData = false;
}

console.log(`${write ? 'WROTE' : 'DRY-RUN'} owned Facebook account`);
console.log(JSON.stringify(stats, null, 2));
