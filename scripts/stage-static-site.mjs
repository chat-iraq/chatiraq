import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'dist');
const dryRun = process.argv.includes('--dry-run');
const excludedDirectories = new Set([
  '.git', '.github', 'node_modules', 'src', 'public', 'scripts', 'seo', 'admin', 'data', 'dist',
]);
const excludedFiles = new Set([
  'dnd.txt', 'package.json', 'package-lock.json', 'vite.config.js', 'tailwind.config.js',
  'postcss.config.js', '.gitignore',
]);

let copied = 0;
let bytes = 0;
let skipped = 0;

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) {
        skipped += 1;
        continue;
      }
      const destination = path.join(target, path.relative(root, source));
      if (!dryRun) {
        fs.mkdirSync(destination, { recursive: true });
      }
      walk(source);
      continue;
    }

    if (!entry.isFile() || excludedFiles.has(entry.name)) {
      skipped += 1;
      continue;
    }

    const destination = path.join(target, path.relative(root, source));
    if (!dryRun) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
    }
    copied += 1;
    bytes += fs.statSync(source).size;
  }
}

if (!dryRun) {
  fs.mkdirSync(target, { recursive: true });
}
walk(root);

console.log(`Staged ${copied} files (${(bytes / 1048576).toFixed(1)} MB)${dryRun ? ' [dry-run]' : ''}; skipped ${skipped} dev entries.`);
