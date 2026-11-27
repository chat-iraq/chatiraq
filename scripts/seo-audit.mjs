import fs from 'node:fs';

const root = process.cwd();
const xml = fs.readFileSync(`${root}/sitemap.xml`, 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const report = {
  urls: urls.length,
  missingFile: [],
  missingCanonical: [],
  canonicalMismatch: [],
  missingTitle: [],
  missingDescription: [],
  missingBreadcrumbSchema: [],
  missingVisibleBreadcrumb: [],
  noindexInSitemap: [],
  nofollowInSitemap: [],
  duplicateLoc: [],
};
const seen = new Set();

for (const url of urls) {
  if (seen.has(url)) report.duplicateLoc.push(url);
  seen.add(url);
  const pathname = new URL(url).pathname;
  const dir = `${root}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
  const file = ['index.html', 'index.htm'].map((name) => `${dir}/${name}`).find((candidate) => fs.existsSync(candidate));
  if (!file) {
    report.missingFile.push(url);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]?.trim() ?? '';
  const hasTitle = /<title>[\s\S]*?<\/title>/i.test(html);
  const hasDescription = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html);
  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join(' ');
  const hasBreadcrumbSchema = /BreadcrumbList/.test(jsonLd);
  const hasVisibleBreadcrumb = /(class|id)=["'][^"']*crumb/i.test(html);
  const hasNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  const hasNofollow = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*nofollow/i.test(html);

  const canonicalIsIntentional = url.includes('/amp/') || url === 'https://chat-iraq.com/drdsh-drraliraq-taym/';
  if (!canonical) report.missingCanonical.push(url);
  else if (!canonicalIsIntentional && canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) report.canonicalMismatch.push(`${url} -> ${canonical}`);
  if (!hasTitle) report.missingTitle.push(url);
  if (!hasDescription) report.missingDescription.push(url);
  if (!hasBreadcrumbSchema) report.missingBreadcrumbSchema.push(url);
  if (!hasVisibleBreadcrumb) report.missingVisibleBreadcrumb.push(url);
  if (hasNoindex) report.noindexInSitemap.push(url);
  if (hasNofollow) report.nofollowInSitemap.push(url);
}

console.log(`sitemap URLs: ${report.urls}`);
for (const [key, items] of Object.entries(report)) {
  if (key === 'urls') continue;
  console.log(`${key}: ${items.length}`);
  for (const item of items.slice(0, 15)) console.log(`  ${item}`);
}
