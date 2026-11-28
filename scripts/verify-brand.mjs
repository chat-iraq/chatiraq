/* verify-brand.mjs — يمنع تراجع هوية «عسل تايم» وتوثيقها ودعم الذكاء الاصطناعي. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
let passed = 0;
let failed = 0;
function check(condition, label) {
  if (condition) { passed += 1; console.log(`PASS  ${label}`); }
  else { failed += 1; console.log(`FAIL  ${label}`); }
}

const brand = read('brand/index.html');
check(/<title>عسل تايم/.test(brand), 'عنوان صفحة العلامة يبدأ بالاسم الرسمي');
check(brand.includes('<link rel="canonical" href="https://chat-iraq.com/brand/">'), 'كنونيكال ذاتي لصفحة العلامة');
check(brand.includes('2019-05-29') && brand.includes('2019-06-01'), 'الصفحة تعرض تاريخي النطاق وأقدم أثر للاسم');
check(!/foundingDate/.test(brand), 'لا يُدّعى تاريخ تأسيس غير موثّق في البيانات المنظّمة');
check(brand.includes('web.archive.org/web/20190601092108') && brand.includes('rdap.org/domain/chat-iraq.com'), 'روابط المصادر الأساسية موجودة');
check(brand.includes('الاسم السابق ليس الاسم الرسمي الحالي') && brand.includes('دردشة العراق'), '«شات العراق» موثّق كاسم سابق و«دردشة العراق» كلمة بحث لا اسم علامة');
check(brand.includes('كلمتان تصفان الخدمة، وليستا جزءاً من اسم العلامة'), '«شات» و«دردشة» مُعرّفتان كوصف للخدمة لا كاسم علامة');
check(brand.includes('"@type":"Organization","@id":"https://chat-iraq.com/#organization","name":"عسل تايم"') && !brand.includes('"name":"شات عسل تايم"'), 'Organization.name هو «عسل تايم» فقط');
check(brand.includes('https://www.facebook.com/3asltime/') && brand.includes('https://www.facebook.com/chatiraqi') && brand.includes('https://www.instagram.com/3asltime'), 'sameAs يستخدم الحسابات الرسمية المعتمدة بما فيها فيسبوك 3asltime');
check(JSON.parse(read('data/forum.json')).social.includes('https://www.facebook.com/3asltime/'), 'حساب فيسبوك المملوك موجود في مصدر البيانات');
check(brand.includes('https://chat-iraq.com/search/?q={search_term_string}'), 'SearchAction يطابق مسار البحث الفعلي');
check(/BreadcrumbList/.test(brand) && /class="ds-crumbs/.test(brand), 'مسار تنقل مرئي ومخطط في صفحة العلامة');
check(brand.includes('rel="alternate" type="text/markdown"'), 'رابط النسخة Markdown معلن في الصفحة');

const md = read('brand/index.md');
check(/^# عسل تايم/m.test(md) && md.includes('2019-06-01'), 'النسخة Markdown تحمل الهوية والتاريخ نفسه');

const llms = read('llms.txt');
check(/^# عسل تايم/m.test(llms), 'llms.txt يبدأ باسم العلامة');
check(llms.includes('/brand/') && llms.includes('/al3ab/') && llms.includes('/dardasha/'), 'llms.txt يربط الهوية والدردشة والألعاب');
check(/^## /m.test(llms), 'llms.txt يتبع بنية الأقسام القابلة للقراءة الآلية');

const robots = read('robots.txt');
for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot', 'Google-Extended']) {
  check(new RegExp(`User-agent:\\s*${bot}`, 'i').test(robots), `زاحف البحث والإجابة ${bot} مذكور صراحةً`);
}
check(/User-agent:\s*GPTBot[\s\S]*?Disallow:\s*\//i.test(robots), 'زاحف تدريب GPTBot غير مفعّل');
check(/User-agent:\s*ClaudeBot[\s\S]*?Disallow:\s*\//i.test(robots), 'زاحف تدريب ClaudeBot غير مفعّل');

check(read('sitemap.xml').includes('<loc>https://chat-iraq.com/brand/</loc>'), '/brand/ داخل sitemap.xml');
check(read('sitemap.txt').includes('https://chat-iraq.com/brand/'), '/brand/ داخل sitemap.txt');
check(read('sitemap/index.html').includes('https://chat-iraq.com/brand/'), '/brand/ داخل خريطة الموقع HTML');
check(read('assets/search-index.json').includes('https://chat-iraq.com/brand/'), '/brand/ داخل فهرس البحث الداخلي');
check(read('about/index.html').includes('href="https://chat-iraq.com/brand/"'), 'صفحة من نحن ترابط صفحة العلامة');
check(read('contact/index.html').includes('href="https://chat-iraq.com/brand/"'), 'صفحة اتصل بنا ترابط صفحة العلامة');

const dossier = read('seo/BRAND_REGISTRATION.md');
check(dossier.includes('tm.industry.gov.iq') && dossier.includes('2019-06-01'), 'ملف التسجيل يحدد القناة الرسمية والأدلة');
check(dossier.includes('لا أستطيع'), 'ملف التسجيل يوضح حدود التفويض القانوني');
check(dossier.includes('لماذا لا نُحوّل البراند إلى «شات العراق»؟') && dossier.includes('48.11'), 'قرار عدم تثبيت الاسم العام مدعوم ببيانات GSC');
check(dossier.includes('اسم العلامة المطلوب تثبيته وتسجيله: «عسل تايم» وحدها'), 'ملف التسجيل يثبّت «عسل تايم» دون «شات»');
check(dossier.includes('أكّد المالك في 2026-11-28') && dossier.includes('facebook.com/3asltime'), 'ملف التسجيل يسجّل تأكيد ملكية حساب 3asltime');

const chatJs = read('assets/chat.js');
check(chatJs.includes('function privacyRisks') && chatJs.includes('مساعد الأمان'), 'مساعد الأمان الذكي مدمج في الدردشة الكتابية');
check(chatJs.includes('window.confirm('), 'تحذير الإرسال يطلب تأكيداً صريحاً');

const BRAND_NAME = 'عسل تايم';
function jsonLdNodes(html) {
  const nodes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { continue; }
    const stack = [data];
    while (stack.length) {
      const n = stack.pop();
      if (Array.isArray(n)) { stack.push(...n); continue; }
      if (n && typeof n === 'object') { nodes.push(n); stack.push(...Object.values(n)); }
    }
  }
  return nodes;
}

const skipDirs = new Set(['node_modules', 'dist', '.git', 'seo', 'scripts', 'src', 'public', '.github']);
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) { if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name)); }
    else if (/\.html?$/i.test(entry.name)) files.push(path.join(dir, entry.name));
  }
})(root);
let staleSearch = 0;
let staleTool = 0;
let enrichedTools = 0;
let orgNames = 0;
let wrongOrgNames = 0;
let wrongWebNames = 0;
let staleOgNames = 0;
let staleSuffixes = 0;
let staleNetworkMentions = 0;
let staleEncodedShares = 0;
let wrongHeaderBrand = 0;
let wrongFooterBrand = 0;
let wrongCopyright = 0;
let missingOwnedSocial = 0;
let staleFacebookLink = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('https://chat-iraq.com/search?q={search_term_string}')) staleSearch += 1;
  if (html.includes('name:"search_site"') && !html.includes('name:"brand_info"')) staleTool += 1;
  if (html.includes('name:"brand_info"')) enrichedTools += 1;
  if (html.includes('"@type":"Organization","@id":"https://chat-iraq.com/#organization","name":"عسل تايم"')) orgNames += 1;
  for (const node of jsonLdNodes(html)) {
    const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
    if (types.includes('Organization') && node.name !== BRAND_NAME) wrongOrgNames += 1;
    if (types.includes('WebSite') && node.name && node.name !== BRAND_NAME) wrongWebNames += 1;
    if (types.includes('Organization') && Array.isArray(node.sameAs) && !node.sameAs.includes('https://www.facebook.com/3asltime/')) missingOwnedSocial += 1;
  }
  if (/href=["']https:\/\/www\.facebook\.com\/chatiraqi["']/.test(html)) staleFacebookLink += 1;
  if (/property="og:site_name" content="(?!عسل تايم")/.test(html)) staleOgNames += 1;
  if (/\| شات (?:عسل تايم|درر العرب)/.test(html)) staleSuffixes += 1;
  if (html.includes('شات درر العرب')) staleNetworkMentions += 1;
  if (html.includes('%D8%B4%D8%A7%D8%AA%20%D8%AF%D8%B1%D8%B1%20%D8%A7%D9%84%D8%B9%D8%B1%D8%A8')) staleEncodedShares += 1;
  if (/class="ds-brand"[\s\S]{0,220}?>شات/.test(html)) wrongHeaderBrand += 1;
  if (/footer-brandname">شات/.test(html)) wrongFooterBrand += 1;
  if (/class="copyrights">[^<]*شات/.test(html)) wrongCopyright += 1;
}
check(staleSearch === 0, 'لا مسار بحث قديم في أي صفحة');
check(staleTool === 0, 'لا أداة ذكاء اصطناعي قديمة في أي صفحة');
check(enrichedTools > 3000, `أدوات الذكاء الاصطناعي الموسّعة في ${enrichedTools} صفحة`);
check(orgNames > 2000, `اسم العلامة «عسل تايم» موحّد في ${orgNames} صفحة`);
check(wrongOrgNames === 0, 'كل حقل Organization.name هو «عسل تايم»');
check(wrongWebNames === 0, 'كل حقل WebSite.name هو «عسل تايم»');
check(staleOgNames === 0, 'كل og:site_name هو «عسل تايم»');
check(staleSuffixes === 0, 'لا لاحقة عنوان تحمل «شات عسل تايم» أو «شات درر العرب»');
check(staleNetworkMentions === 0, 'لا ذكر لاسم الشبكة القديم «شات درر العرب» في صفحات الموقع');
check(staleEncodedShares === 0, 'روابط المشاركة لا تحمل الاسم القديم مُشفّراً');
check(wrongHeaderBrand === 0, 'شعار الترويسة يعرض «عسل تايم»');
check(wrongFooterBrand === 0, 'شعار التذييل يعرض «عسل تايم»');
check(wrongCopyright === 0, 'حقوق النشر باسم «عسل تايم»');
check(missingOwnedSocial === 0, 'كل كيان Organization يذكر فيسبوك 3asltime في sameAs');
check(staleFacebookLink === 0, 'لا رابط تذييل قديم إلى facebook.com/chatiraqi');

console.log(`\nBRAND/AI CHECKS: ${passed} PASS, ${failed} FAIL`);
process.exit(failed ? 1 : 0);
