import fs from 'node:fs';

const write = process.argv.includes('--write');
const root = process.cwd();
const labels = {
  questions: 'الأسئلة',
  Forum: 'المنتدى',
  blog: 'المدونة',
  amp: 'نسخة AMP',
  news: 'الأخبار',
  preview: 'معاينة',
  'home-v2': 'الرئيسية التجريبية',
  'search-v2': 'البحث التجريبي',
  zwar: 'زوار',
  chatiraq: 'شاتIRAQ',
  random: 'غرفة عشوائية',
  'child-safety': 'سلامة الأطفال',
  about: 'من نحن',
};
const targets = [
  '/',
  '/chatiraq/',
  '/questions/hal-al-tasjil-fi-ghuraf-al-dardasha-majani/',
  '/questions/hal-yumkin-istikhdam-al-shat-bidun-hisab/',
  '/questions/kayf-adkhul-ghurfat-dardasha-min-al-jawal-bidun-tahmil/',
  '/questions/kayf-ughayyir-ismi-fi-ghurfat-al-dardasha/',
  '/questions/matha-afal-itha-lam-astati3-al-dukhul/',
  '/random/',
  '/child-safety/',
  '/about/',
  '/Forum/',
  '/blog/',
  '/blog/amp/',
  '/news/',
  '/preview/home-v2/',
  '/preview/search-v2/',
  '/zwar/',
];

const changed = [];
for (const pathname of targets) {
  const file = `${root}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}/index.html`;
  if (!fs.existsSync(file)) {
    changed.push(`MISSING ${pathname}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  let next = html;
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.split('|')[0]?.trim() || 'الصفحة';
  const segments = pathname === '/' ? [] : pathname.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://chat-iraq.com/' }];
  let cumulative = '';
  segments.forEach((segment, index) => {
    cumulative += `/${segment}`;
    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name: index === segments.length - 1 ? title : labels[segment] ?? segment,
      item: `https://chat-iraq.com${cumulative}/`,
    });
  });
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items });
  if (!/BreadcrumbList/.test(next)) {
    next = next.replace(/<\/head>/i, `<script type="application/ld+json">${schema}</script></head>`);
  }
  if (!/(class|id)=["'][^"']*crumb/i.test(next)) {
    const links = items.map((item, index) => index === items.length - 1
      ? `<span aria-current="page">${item.name}</span>`
      : `<a href="${item.item}">${item.name}</a>`).join('');
    const nav = `<nav class="ds-crumbs ds-rb" aria-label="مسار التنقل">${links}</nav>`;
    next = next.replace(/<body[^>]*>/i, (match) => `${match}${nav}`);
  }
  if (next !== html) {
    changed.push(pathname);
    if (write) fs.writeFileSync(file, next);
  }
}

console.log(`${write ? 'WROTE' : 'DRY-RUN'} breadcrumbs for ${changed.length} pages`);
for (const pathname of changed) console.log(`  ${pathname}`);
