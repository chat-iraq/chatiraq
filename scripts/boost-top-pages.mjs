import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');

// أعلى الكلمات ظهوراً مع CTR ضعيف من بيانات GSC لآخر 28 يوماً.
const rooms = [
  { name: 'قمر بغداد', path: '/qmr-bghdad/' },
  { name: 'نار الحب', path: '/nar-alhb/' },
  { name: 'الامير', path: '/alamyr/' },
  { name: 'بغداد', path: '/baghdad/' },
  { name: 'بنوته قلبي', path: '/bnwth-qlby/' },
  { name: 'ندى العراق', path: '/nada/' },
  { name: 'باربي', path: '/barby/' },
  { name: 'درب', path: '/drb/' },
  { name: 'ليالي تايم', path: '/lyaly-zman-taym/' },
  { name: 'ترف', path: '/trf/' },
  { name: 'انستا العراق', path: '/drdsh-ansta-alaaraq/' },
  { name: 'عراقنا لوف', path: '/aaraqna-lwf/' },
];

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const marker = 'id="most-wanted"';

function popularBlock() {
  const links = rooms.map((r) => `<a class="ds-pill" href="https://chat-iraq.com${r.path}">دردشة ${escapeHtml(r.name)} | شات ${escapeHtml(r.name)}</a>`).join('');
  return `<section class="ds-card ds-reveal" ${marker}><h2 class="ds-sec">الأكثر طلباً من غرف الدردشة</h2><p>غرف يبحث عنها الزوار يومياً بالاسم؛ اختر غرفتك وادخل باسم مستعار من الجوال دون تسجيل.</p><div class="ds-related">${links}</div></section>\n`;
}

let changed = 0;
let titles = 0;
let descriptions = 0;
let blocks = 0;
let navLinks = 0;

for (const room of rooms) {
  const file = path.join(root, room.path.slice(1), 'index.html');
  if (!fs.existsSync(file)) { console.log(`MISSING ${file}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  let next = html;

  const title = `دردشة ${room.name} | شات ${room.name} من الجوال بلا تسجيل`;
  const description = `دردشة ${room.name} الآن بلا تسجيل: شات ${room.name} كتابي وصوتي من متصفح الجوال، باسم مستعار وبقواعد واضحة تحفظ خصوصيتك. ابدأ مباشرة دون تحميل تطبيق.`;

  if (/<title>[\s\S]*?<\/title>/i.test(next)) {
    next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    titles += 1;
  }
  for (const attr of ['og:title', 'twitter:title']) {
    const re = new RegExp(`((?:property|name)="${attr}"\\s+content=")[^"]*(")`, 'i');
    if (re.test(next)) next = next.replace(re, `$1${title}$2`);
  }
  for (const attr of ['description', 'og:description', 'twitter:description']) {
    const re = new RegExp(`((?:name|property)="${attr}"\\s+content=")[^"]*(")`, 'i');
    if (re.test(next)) { next = next.replace(re, `$1${description}$2`); descriptions += 1; }
  }
  next = next.replace(/("name"\s*:\s*")[^"]*(",\s*"url")/g, (m, a, b) => a + title + b);

  if (next !== html) {
    changed += 1;
    if (write) fs.writeFileSync(file, next, 'utf8');
  }
}

// روابط مباشرة من صفحات كثيرة الزحف إلى الصفحات غير المكتشفة.
const homeFile = path.join(root, 'index.html');
let home = fs.readFileSync(homeFile, 'utf8');
if (!home.includes(marker)) {
  home = home.replace('<footer class="footer">', `${popularBlock()}<footer class="footer">`);
  blocks += 1;
}
const footerMenu = '<ul class="footer-menu pr-3"><li><a href="https://chat-iraq.com/">الرئيسية</a></li>';
if (home.includes(footerMenu) && !home.includes('href="https://chat-iraq.com/profile/"')) {
  home = home.replace(footerMenu, `${footerMenu}\n<li><a href="https://chat-iraq.com/profile/">الملف الشخصي</a></li>\n<li><a href="https://chat-iraq.com/dalil/">دليل الشات</a></li>`);
  navLinks += 2;
}
if (write) fs.writeFileSync(homeFile, home, 'utf8');

const hubFile = path.join(root, 'dardasha', 'index.html');
let hub = fs.readFileSync(hubFile, 'utf8');
if (!hub.includes(marker)) {
  hub = hub.replace('<section class="px-grid">', `${popularBlock()}<section class="px-grid">`);
  blocks += 1;
}
if (!hub.includes('href="https://chat-iraq.com/profile/"')) {
  hub = hub.replace('<h2 class="ds-sec">اقرأ أيضاً</h2>', '<h2 class="ds-sec">اقرأ أيضاً</h2><a class="ds-pill" href="https://chat-iraq.com/profile/">الملف الشخصي</a>');
  navLinks += 1;
}
if (write) fs.writeFileSync(hubFile, hub, 'utf8');

console.log(`${write ? 'WROTE' : 'DRY-RUN'} top-page CTR + discovery boost`);
console.log(`room pages changed: ${changed}; titles: ${titles}; descriptions: ${descriptions}`);
console.log(`popular blocks added: ${blocks}; footer/profile links: ${navLinks}`);
