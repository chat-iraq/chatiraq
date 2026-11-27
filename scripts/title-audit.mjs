import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const skip = new Set(['dist', 'node_modules', '.git', '.github', 'seo', 'scripts']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
}
walk(root);

let startsChat = 0;
let startsDardasha = 0;
let other = 0;
const samples = [];
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  if (title.startsWith('شات')) {
    startsChat += 1;
    if (samples.length < 25) samples.push(`${path.relative(root, file)} :: ${title}`);
  } else if (title.startsWith('دردشة')) startsDardasha += 1;
  else other += 1;
}
console.log(JSON.stringify({ files: files.length, startsChat, startsDardasha, other }, null, 2));
console.log(samples.join('\n'));
