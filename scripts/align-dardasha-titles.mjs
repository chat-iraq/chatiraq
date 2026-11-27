import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const skip = new Set(['dist', 'node_modules', '.git', '.github', 'seo', 'scripts']);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('index.html') && !full.replace(/\\/g, '/').includes('/amp/')) files.push(full);
  }
}
walk(root);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lead(value) {
  if (!value.startsWith('شات ')) return value;
  if (value.startsWith('شات عسل') || value.startsWith('شات درر')) return value;
  return `دردشة ${value.slice(4)}`;
}

let changedFiles = 0;
let titles = 0;
let headings = 0;
let descriptions = 0;
let schemas = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  let next = html;
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  const newTitle = lead(title);
  if (newTitle === title || !title) continue;

  next = next.replace(/<title>[\s\S]*?<\/title>/i, (match) => match.replace(title, newTitle));
  titles += 1;

  for (const attr of ['og:title', 'twitter:title']) {
    next = next.replace(new RegExp(`(property|name)=["']${attr}["']\\s+content=["']([^"']*)["']`, 'i'), (match, p1, value) => {
      const updated = lead(value);
      return updated === value ? match : match.replace(value, updated);
    });
  }

  next = next.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (match, value) => {
    const updated = lead(value.trim());
    if (updated === value.trim()) return match;
    return match.replace(value, value.replace(/^شات /, 'دردشة '));
  });
  headings += 1;

  for (const attr of ['description', 'og:description', 'twitter:description']) {
    next = next.replace(new RegExp(`(name|property)=["']${attr}["']\\s+content=["']([^"']*)["']`, 'i'), (match, p1, value) => {
      const updated = lead(value);
      return updated === value ? match : match.replace(value, updated);
    });
  }
  descriptions += 1;

  const schemaPattern = new RegExp(`("name"\\s*:\\s*")(${escapeRegExp(title)})(")`, 'g');
  next = next.replace(schemaPattern, (_match, before, _old, after) => `${before}${newTitle}${after}`);
  if (next !== html) schemas += 1;

  if (next !== html) {
    changedFiles += 1;
    if (write) fs.writeFileSync(file, next, 'utf8');
  }
}

console.log(`${write ? 'WROTE' : 'DRY-RUN'} title alignment`);
console.log(`files scanned: ${files.length}`);
console.log(`files changed: ${changedFiles}`);
console.log(`titles: ${titles}; headings: ${headings}; descriptions: ${descriptions}; schema blocks: ${schemas}`);
