import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const excluded = new Set(['dist', 'node_modules', '.git', '.github', 'seo', 'scripts']);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
}
walk(root);

let removedPreloads = 0;
let fixedLogos = 0;
let touchedFiles = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  let next = html;
  const links = [...next.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  const styles = new Set(links.filter((tag) => /rel=["']stylesheet["']/i.test(tag))
    .map((tag) => tag.match(/href=["']([^"']+)["']/i)?.[1])
    .filter(Boolean));
  for (const tag of links) {
    if (!/rel=["']preload["']/i.test(tag) || !/as=["']style["']/i.test(tag)) continue;
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (href && styles.has(href)) {
      next = next.replace(tag, '');
      removedPreloads += 1;
    }
  }
  next = next.replace(/(<a\s+class=["']ds-brand["'][^>]*>\s*<img\b[^>]*?)(loading=["']lazy["'])/gi, (match, before) => {
    fixedLogos += 1;
    return `${before}fetchpriority="high"`;
  });
  if (next !== html) {
    touchedFiles += 1;
    if (write) fs.writeFileSync(file, next);
  }
}

console.log(`${write ? 'WROTE' : 'DRY-RUN'} performance pass`);
console.log(`files: ${files.length}`);
console.log(`touched files: ${touchedFiles}`);
console.log(`removed duplicate style preloads: ${removedPreloads}`);
console.log(`header logos set to fetchpriority: ${fixedLogos}`);
