import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const site = 'https://chat-iraq.com';

const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const groups = [
  { label: 'غرف الدردشة', test: (p) => p.split('/').filter(Boolean).length === 1 },
  { label: 'الأدلة والمقالات والصفحات', test: () => true },
];
const buckets = groups.map(() => []);
let skippedAmp = 0;
let skippedCanonical = 0;
let missingFile = 0;

for (const url of urls) {
  if (!url.startsWith(`${site}/`)) continue;
  const pathname = new URL(url).pathname;
  if (pathname.includes('/amp/')) { skippedAmp += 1; continue; }
  const dir = path.join(root, pathname.replace(/^\//, ''));
  const file = ['index.html', 'index.htm'].map((n) => path.join(dir, n)).find((f) => fs.existsSync(f));
  if (!file) { missingFile += 1; continue; }
  const html = fs.readFileSync(file, 'utf8');
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] ?? url;
  if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) { skippedCanonical += 1; continue; }
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || pathname;
  const anchor = `<a href="${escapeHtml(url)}">${escapeHtml(title)}</a>`;
  const index = groups.findIndex((g) => g.test(pathname));
  buckets[index === -1 ? buckets.length - 1 : index].push(anchor);
}

const block = `<section class="card"><h2>روابط الموقع</h2><p>كل صفحات الدردشة العربية في مكان واحد: اختر غرفتك أو افتح أحد الأدلة والمقالات مباشرة.</p>${groups.map((g, i) => `<h3>${g.label}</h3><div class="grid grid-4">${buckets[i].join('')}</div>`).join('')}</section>`;

const sitemapFile = path.join(root, 'sitemap', 'index.html');
const sitemapHtml = fs.readFileSync(sitemapFile, 'utf8');
const re = /<section class="card"><h2>روابط الموقع<\/h2>[\s\S]*?<\/div><\/section>/i;
if (!re.test(sitemapHtml)) throw new Error('sitemap link grid not found');
const nextSitemap = sitemapHtml.replace(re, block);

const homeFile = path.join(root, 'index.html');
let home = fs.readFileSync(homeFile, 'utf8');
const footerAnchor = '<li><a href="https://chat-iraq.com/dalil/">دليل الشات</a></li>';
if (!home.includes('href="https://chat-iraq.com/sitemap/"')) {
  if (!home.includes(footerAnchor)) throw new Error('home footer anchor not found');
  home = home.replace(footerAnchor, `${footerAnchor}\n<li><a href="https://chat-iraq.com/sitemap/">خريطة الموقع</a></li>`);
}

console.log(`${write ? 'WROTE' : 'DRY-RUN'} HTML sitemap rebuild`);
console.log(`sitemap locs: ${urls.length}; anchors: ${buckets.reduce((a, b) => a + b.length, 0)}`);
console.log(`rooms: ${buckets[0].length}; guides+pages: ${buckets[1].length}`);
console.log(`skipped amp=${skippedAmp} nonSelfCanonical=${skippedCanonical} missingFile=${missingFile}`);
console.log(`home footer link: ${home.includes('href="https://chat-iraq.com/sitemap/"') ? 'yes' : 'no'}`);

if (write) {
  fs.writeFileSync(sitemapFile, nextSitemap, 'utf8');
  fs.writeFileSync(homeFile, home, 'utf8');
}
