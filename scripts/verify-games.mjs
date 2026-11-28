/* verify-games.mjs — تحقق بنيوي من قسم «دردشة وألعاب» قبل النشر. */
import fs from 'node:fs';
import vm from 'node:vm';

const root = process.cwd();
const read = (p) => fs.readFileSync(`${root}/${p}`, 'utf8');
const page = read('al3ab/index.html');
const logic = read('al3ab/assets/games.js');
const dataCode = read('al3ab/assets/games-data.js');
const sitemap = read('sitemap.xml');
const searchIndex = JSON.parse(read('assets/search-index.json'));

let failed = 0;
function pass(label) { console.log(`PASS  ${label}`); }
function fail(label) { failed += 1; console.error(`FAIL  ${label}`); }
function check(condition, label) { condition ? pass(label) : fail(label); }

/* بيانات الألعاب */
const sandbox = { window: {} };
vm.runInNewContext(dataCode, sandbox);
const data = sandbox.window.GAME_DATA;
check(!!data, 'games-data.js يوفّر window.GAME_DATA');
if (data) {
  const qs = data.questions || [];
  check(qs.length >= 10, `بنك الأسئلة ${qs.length} سؤالاً كافياً لمسابقة من 10 أسئلة`);
  check(qs.every((x) => x && typeof x.q === 'string' && Array.isArray(x.o) && x.o.length >= 2 && Number.isInteger(x.a) && x.a >= 0 && x.a < x.o.length), 'كل سؤال له خيارات وفهرس إجابة صالح');
  check((data.words || []).length >= 20 && data.words.every((w) => /^[\u0600-\u06FF]+$/.test(w)), 'كلمات خمّن الكلمة عربية فقط');
  check((data.riddles || []).length >= 5 && data.riddles.every((r) => r.q && r.h && r.a), 'الفوازير مكتملة');

  const L = data.ludo || {};
  const cells = L.path || [];
  check(cells.length === 52, `مسار اللودو 52 خانة (${cells.length})`);
  check(new Set(cells.map((c) => c.join(','))).size === 52, 'خانات مسار اللودو غير مكرّرة');
  check((L.start || []).length === 4 && (L.homeEntry || []).length === 4, 'للودو أربع نقاط دخول ومنازل');
  check(L.start.every((s, i) => Number.isInteger(s) && s >= 0 && s < 52 && ((L.homeEntry[i] - s + 52) % 52) === 50), 'مسافة كل لاعب إلى منزله 50 خانة');
  check((L.safe || []).every((i) => Number.isInteger(i) && i >= 0 && i < 52), 'الخانات الآمنة داخل المسار');
  check((L.yard || []).length === 4 && L.yard.every((y) => y.length === 4), 'أربع ساحات لكل لاعب أربع قطع');
  check((L.homeCells || []).length === 4 && L.homeCells.every((h) => h.length === 6), 'أربعة مسارات منزل بست خانات');
  const adjacent = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  check(L.homeCells.every((h, i) => adjacent(cells[L.homeEntry[i]], h[0]) && adjacent(h[5], [7, 7])), 'مسارات المنزل متصلة بمداخلها وبالمركز');
}

/* ربط الواجهة */
const ids = [...new Set([...logic.matchAll(/\$\('#([A-Za-z0-9_-]+)'\)/g)].map((m) => m[1]))];
const htmlIds = new Set([...page.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const missing = ids.filter((id) => !htmlIds.has(id));
check(missing.length === 0, `كل عناصر games.js موجودة في الصفحة (${ids.length} معرّف)${missing.length ? ` — ناقص: ${missing.join(', ')}` : ''}`);
const games = [...page.matchAll(/data-game="([a-z]+)"/g)].map((m) => m[1]);
check(games.length === 6 && new Set(games).size === 6, ` ست ألعاب حقيقية في شريط الاختيار (${games.join(', ')})`);
check(/id="agChatForm"/.test(page) && /id="agVoiceBtn"/.test(page), 'الدردشة الكتابية والصوتية موجودتان في الواجهة');
check(/src="\/al3ab\/assets\/games-data\.js"/.test(page) && /src="\/al3ab\/assets\/games\.js"/.test(page), 'ملفا البيانات والمنطق محمّلان في الصفحة');

/* استخدام قواعد Firebase الحالية بأمان */
check(/msg\.a = String\(sig\.type/.test(logic) && /msg\.c = JSON\.stringify\(\{ to: sig\.to/.test(logic), 'إشارات الصوت تستخدم c/a المتاحين في قواعد الشات بدل تجاوز حد t');
check(!/\bmsg\.to\b/.test(logic) && !/send\('sys', 'create',/.test(logic), 'لا تُكتب حقول غير مسموحة في قواعد Firebase');
check(/blocked\[m\.u\] \|\| blocked\[m\.n\]/.test(logic), 'حجب العضو يعمل بالاسم أو المعرّف');
check(/id="agTry-hangman"/.test(page) && /id="agTry-riddles"/.test(page) && /id="agTry-words"/.test(page), 'نسخة تجريبية فردية تعمل قبل الدخول لغرفة');
check(/letters\.forEach\(function \(ch\) \{ keyset\[ch\] = 1; \}\)/.test(logic), 'لوحة حروف خمّن الكلمة تغطي حروف كل كلمة مهما احتوت على ة أو ء');
check(/next\.u = myUid/.test(logic) && /s\.u === m\.u/.test(logic), 'حالة اللعبة موقّعة بمعرّف المضيف ومتحقّق منها عند الاستقبال');
check(/function resolveHost/.test(logic), 'انتقال المضيف عند مغادرة صاحب الغرفة');

/* SEO والاكتشاف */
check(/<title>دردشة وألعاب/.test(page), 'العنوان يبدأ بـ«دردشة وألعاب»');
check(/<link rel="canonical" href="https:\/\/chat-iraq\.com\/al3ab\/">/.test(page), 'كنونيكال ذاتي');
check(/BreadcrumbList/.test(page) && /class="ds-crumbs/.test(page), 'مسار تنقل مرئي ومخطط');
check(sitemap.includes('<loc>https://chat-iraq.com/al3ab/</loc>'), '/al3ab/ داخل sitemap.xml');
check(searchIndex.some((x) => x.u === 'https://chat-iraq.com/al3ab/'), '/al3ab/ داخل فهرس البحث الداخلي');

if (failed) {
  console.error(`\n${failed} فحص(ات) فشلت.`);
  process.exit(1);
}
console.log('\nALL GAME CHECKS PASSED');
