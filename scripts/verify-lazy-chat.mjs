/* verify-lazy-chat.mjs — يمنع عودة تحميل chat.js في كل صفحة قبل التفاعل. */
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

const skipDirs = new Set(['node_modules', 'dist', '.git']);
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) { if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name)); }
    else if (/\.html?$/i.test(entry.name)) files.push(path.join(dir, entry.name));
  }
})(root);

let direct = 0;
let enterForms = 0;
let lazy = 0;
let brokenBootstrap = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('<script src="/assets/chat.js"')) direct += 1;
  if (/class="[^"]*\bpx-enter\b/.test(html)) {
    enterForms += 1;
    if (html.includes('window.__loadChat')) lazy += 1;
    if (!html.includes("s.addEventListener('load',go,{once:true})") || !html.includes('f.requestSubmit') || !html.includes("f.getAttribute('data-href')")) brokenBootstrap += 1;
  }
}
check(direct === 0, 'لا صفحة تحمّل chat.js مباشرة قبل التفاعل');
check(enterForms > 3000, `نماذج الدخول موجودة في ${enterForms} صفحة`);
check(lazy === enterForms, `كل صفحة دخول تستخدم محمّل chat.js عند الطلب (${lazy})`);
check(brokenBootstrap === 0, 'بوتستراب التحميل يحفظإعادة الإرسال ومسار الاحتياط');

for (const p of ['brand/index.html', 'dardasha/index.html', 'al3ab/index.html', 'profile/index.html']) {
  const html = read(p);
  check(!html.includes('/assets/chat.js'), `${p} لا تحمّل chat.js`);
}
check(read('assets/chat.js').includes("var form = qs('.px-enter');\n  if (!form) return;"), 'chat.js لا يفعل شيئاً بلا نموذج دخول');

console.log(`\nLAZY CHAT CHECKS: ${passed} PASS, ${failed} FAIL`);
process.exit(failed ? 1 : 0);
