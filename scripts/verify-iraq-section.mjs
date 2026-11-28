/* verify-iraq-section.mjs — سلامة قسم «دردشة العراق» وفريدته */
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
let pass = 0;
let fail = 0;
function check(ok, label) {
  if (ok) { pass += 1; console.log('PASS ', label); }
  else { fail += 1; console.log('FAIL ', label); }
}

const slugs = ['', 'al-iraq', 'iraqiya', 'irakna'];
const sitemap = read('sitemap.xml');
const xmlTxt = read('sitemap.txt');
const hub = read('dardasha/index.html');
const htmlSitemap = read('sitemap/index.html');

for (const slug of slugs) {
  const url = `https://chat-iraq.com/dardasha/iraq/${slug ? slug + '/' : ''}`;
  const file = `dardasha/iraq/${slug ? slug + '/' : ''}index.html`;
  check(fs.existsSync(file), `ملف موجود: ${file}`);
  const html = read(file);
  check(html.includes(`<link rel="canonical" href="${url}">`), `كنونيكال ذاتي: ${url}`);
  check(/<h1>[^<]*دردشة/.test(html), `العنوان يبدأ بـ«دردشة»: ${url}`);
  check(!html.includes('FAQPage'), `لا FAQPage schema: ${url}`);
  check(html.includes('عسل تايم'), `هوية عسل تايم: ${url}`);
  check(!/شات عسل تايم|شات درر العرب/.test(html), `لا اسم قديم: ${url}`);
  check(sitemap.includes(`<loc>${url}</loc>`), `داخل sitemap.xml: ${url}`);
  check(xmlTxt.split(/\r?\n/).includes(url), `داخل sitemap.txt: ${url}`);
  check(hub.includes(`href="${url}"`), `مرابط من مركز الدليل: ${url}`);
  check(htmlSitemap.includes(`href="${url}"`), `داخل خريطة HTML: ${url}`);
}

const all = slugs.map((s) => read(`dardasha/iraq/${s ? s + '/' : ''}index.html`)).join('\n');
check(all.includes('بغداد') && all.includes('البصرة') && all.includes('الموصل'), 'المحتوى يذكر مدناً عراقية حقيقية');
check(new Set(slugs.map((s) => read(`dardasha/iraq/${s ? s + '/' : ''}index.html`).match(/<h2[^>]*>([^<]+)<\/h2>/g)?.join('|'))).size === 4, 'لكل صفحة زاوية محتوى مختلفة');

console.log(`\nIRAQ SECTION CHECKS: ${pass} PASS, ${fail} FAIL`);
if (fail) process.exitCode = 1;
