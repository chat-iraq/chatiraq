/* lazy-chat-loader.mjs — تحميل chat.js عند أول محاولة دخول فقط.
 * 3,781 صفحة كانت تحمّل 70.5 KB من JavaScript قبل أي تفاعل، بينما chat.js نفسه
 * يعود فوراً إذا لم يوجد نموذج `.px-enter`. نحذف السكربت من الصفحات التي لا
 * تستخدمه، ونضع بوتستراب صغيراً في الصفحات التي تستخدمه فقط.
 * تشغيل: node scripts/lazy-chat-loader.mjs --write
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const skipDirs = new Set(['node_modules', 'dist', '.git']);
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name));
    } else if (/\.html?$/i.test(entry.name)) files.push(path.join(dir, entry.name));
  }
})(root);

const directTag = '<script src="/assets/chat.js" defer></script>';
const bootstrap = `<script>
window.__loadChat=function(){if(window.__chatRequested)return null;window.__chatRequested=1;var s=document.createElement('script');s.src='/assets/chat.js';s.defer=true;document.head.appendChild(s);return s};
document.addEventListener('submit',function(e){var f=e.target;if(!f||!f.classList||!f.classList.contains('px-enter'))return;if(window.__chatBooted)return;window.__chatBooted=1;e.preventDefault();var s=window.__loadChat();if(!s){return}var go=function(){if(f.requestSubmit){f.requestSubmit()}else{f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))}};s.addEventListener('load',go,{once:true});s.addEventListener('error',function(){var h=f.getAttribute('data-href');if(h){location.href=h}},{once:true})},true);
</script>`;

const stats = { scanned: files.length, removed: 0, lazy: 0, unchanged: 0, bytesSavedOnNonRoomPages: 0 };
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(directTag)) { stats.unchanged += 1; continue; }
  const usesEnter = /class="[^"]*\bpx-enter\b/.test(html);
  const next = usesEnter ? html.replace(directTag, bootstrap) : html.replace(directTag, '');
  if (!write) {
    if (usesEnter) stats.lazy += 1; else stats.removed += 1;
    continue;
  }
  fs.writeFileSync(file, next, 'utf8');
  if (usesEnter) stats.lazy += 1;
  else { stats.removed += 1; stats.bytesSavedOnNonRoomPages += Buffer.byteLength(directTag); }
}
console.log(`${write ? 'WROTE' : 'DRY-RUN'} lazy chat loader`);
console.log(JSON.stringify(stats, null, 2));
