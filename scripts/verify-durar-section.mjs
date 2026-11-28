/* verify-durar-section.mjs — سلامة قسم «درر العرب» وفريدته */
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
let pass = 0;
let fail = 0;
function check(ok, label) {
  if (ok) { pass += 1; console.log('PASS ', label); }
  else { fail += 1; console.log('FAIL ', label); }
}

const slugs = ['', 'khaleej', 'bahrain', 'saudi', 'iraq'];
const sitemap = read('sitemap.xml');
const xmlTxt = read('sitemap.txt');
const hub = read('dardasha/index.html');
const htmlSitemap = read('sitemap/index.html');
const footerSample = read('aasl-khlyj-drr/index.html');

for (const slug of slugs) {
  const url = `https://chat-iraq.com/dardasha/durar/${slug ? slug + '/' : ''}`;
  const file = `dardasha/durar/${slug ? slug + '/' : ''}index.html`;
  check(fs.existsSync(file), `ملف موجود: ${file}`);
  const html = read(file);
  check(html.includes(`<link rel="canonical" href="${url}">`), `كنونيكال ذاتي: ${url}`);
  check(/<h1>[^<]*درر/.test(html), `العنوان يذكر درر: ${url}`);
  check(!html.includes('FAQPage'), `لا FAQPage schema: ${url}`);
  check(!html.includes('شات درر العرب'), `لا اسم الشبكة القديم: ${url}`);
  check(html.includes('عسل تايم'), `هوية عسل تايم: ${url}`);
  check(!/شات عسل تايم|شات درر العرب/.test(html), `لا اسم قديم في العنوان: ${url}`);
  check(sitemap.includes(`<loc>${url}</loc>`), `داخل sitemap.xml: ${url}`);
  check(xmlTxt.split(/\r?\n/).includes(url), `داخل sitemap.txt: ${url}`);
  check(hub.includes(`href="${url}"`), `مرابط من مركز الدليل: ${url}`);
  check(htmlSitemap.includes(`href="${url}"`), `داخل خريطة HTML: ${url}`);
}

check(footerSample.includes('<h2 class="menu_title"><a href="https://chat-iraq.com/dardasha/durar/">درر العرب</a></h2>'), 'تذييل الغرف يربط درر العرب بالقسم الجديد');
const all = slugs.map((s) => read(`dardasha/durar/${s ? s + '/' : ''}index.html`)).join('\n');
check(all.includes('الخليج') && all.includes('البحرين') && all.includes('السعودية') && all.includes('العراق'), 'المحتوى يغطي الدول المطلوبة');
check(new Set(slugs.map((s) => read(`dardasha/durar/${s ? s + '/' : ''}index.html`).match(/<h2[^>]*>([^<]+)<\/h2>/g)?.join('|'))).size === 5, 'لكل صفحة زاوية محتوى مختلفة');

console.log(`\nDURAR SECTION CHECKS: ${pass} PASS, ${fail} FAIL`);
if (fail) process.exitCode = 1;
