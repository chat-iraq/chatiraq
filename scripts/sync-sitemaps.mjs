import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const xmlPath = path.join(root, 'sitemap.xml');
const txtPath = path.join(root, 'sitemap.txt');
const dryRun = process.argv.includes('--dry-run');

const xml = fs.readFileSync(xmlPath, 'utf8');
const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
const urls = [...new Set(matches.map((match) => match[1]))];

if (urls.length === 0) {
  throw new Error('No URLs found in sitemap.xml');
}

const existing = fs.existsSync(txtPath)
  ? fs.readFileSync(txtPath, 'utf8').split(/\r?\n/).filter(Boolean)
  : [];
const known = new Set(existing);
const additions = urls.filter((url) => !known.has(url));

if (!dryRun) {
  fs.writeFileSync(txtPath, `${[...existing, ...additions].join('\n')}\n`, 'utf8');
}

console.log(`sitemap.xml: ${urls.length} URLs; sitemap.txt: ${existing.length + additions.length} URLs (+${additions.length} missing)${dryRun ? ' [dry-run]' : ''}`);
