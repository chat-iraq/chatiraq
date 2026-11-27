import fs from 'node:fs';

const root = process.cwd();
const write = process.argv.includes('--write');
const boilerplate = '<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>';
const css = 'body{margin:0;font-family:Arial,Tahoma,sans-serif;background:#f7f6f2;color:#222;line-height:1.8}header{background:#fff;border-bottom:1px solid #e8e2d4;padding:12px 20px;display:flex;align-items:center;gap:8px}header a{color:#222;text-decoration:none;font-weight:700}nav{padding:10px 20px;font-size:.85rem}nav a{color:#8a6d1f;text-decoration:none}main,footer{max-width:820px;margin:0 auto;padding:20px}section{background:#fff;border:1px solid #e8e2d4;border-radius:14px;padding:18px;margin:0 0 16px}h1{font-size:1.7rem;line-height:1.4;margin:0 0 10px}h2{font-size:1.2rem;margin:0 0 8px}h3{font-size:1rem;margin:16px 0 4px}p,li{font-size:.98rem}a{color:#8a6d1f}footer{font-size:.85rem;color:#666}';

const pages = [
  {
    dir: 'dardasha/amp',
    source: 'dardasha/index.html',
    canonical: 'https://chat-iraq.com/dardasha/',
    ampUrl: 'https://chat-iraq.com/dardasha/amp/',
    name: 'دليل الدردشة العربية',
    title: 'دردشة عربية | دليل الدردشة لكل الدول العربية',
    description: 'دليل عملي للدردشة العربية يجمع غرف الخليج ومصر والشام والمغرب واليمن مع قواعد الأمان والخصوصية.',
    sections: [
      ['دردشة عربية لكل الجنسيات', '<p>اختر الدردشة حسب اللهجة أولاً، ثم اقرأ قواعد الغرفة، ثم ادخل باسم مستعار لا يكشف بياناتك. تجد هنا روابط لغرف الخليج ومصر والشام والعراق والمغرب واليمن.</p>'],
      ['كيف تختار غرفة مناسبة؟', '<ol><li>حدّد اللهجة التي تريدها.</li><li>اقرأ وصف الغرفة قبل الدخول.</li><li>ابدأ باسم مستعار.</li><li>إذا شعرت بالإزعاج، اخرج واستخدم أدوات الحظر والإبلاغ.</li></ol>'],
      ['الأمان والخصوصية', '<p>لا تشارك كلمة المرور أو رمز التحقق، ولا تنتقل إلى رابط خارجي طلب منك أثناء الدردشة. احتفظ بالدليل عند التعرض لتحرش أو احتيال وأبلغ الإدارة.</p>'],
      ['الأسئلة الشائعة', '<h3>هل أحتاج تسجيلاً؟</h3><p>لا؛ معظم الغرف تعمل كزائر باسم مستعار.</p><h3>هل الدردشة متاحة من الجوال؟</h3><p>نعم، تعمل من متصفح الجوال مباشرة دون تطبيق.</p>'],
    ],
  },
  {
    dir: 'articles/kayf-tahmi-hsabak-fi-ghurfat-al-dardasha/amp',
    source: 'articles/kayf-tahmi-hsabak-fi-ghurfat-al-dardasha/index.html',
    canonical: 'https://chat-iraq.com/articles/kayf-tahmi-hsabak-fi-ghurfat-al-dardasha/',
    ampUrl: 'https://chat-iraq.com/articles/kayf-tahmi-hsabak-fi-ghurfat-al-dardasha/amp/',
    name: 'حماية الحساب في الدردشة',
    title: 'كيف تحمي حسابك في غرف الدردشة | شات عسل تايم',
    description: 'خطوات عملية لحماية حسابك وخصوصيتك داخل غرف الدردشة، من الاسم المستعار إلى رمز التحقق.',
    sections: [
      ['ابدأ باسم مستعار', '<p>لا تكتب اسمك الحقيقي أو رقم هاتفك أو مدرستك في الاسم المعروض أو الحالة. اسم بسيط غير دالّ يحفظ هويتك.</p>'],
      ['احمِ رمز التحقق', '<p>لا تعطِ رمز التحقق أو كلمة المرور لأي عضو، حتى لو ادّعى أنه مشرف. الإدارة لا تطلب رموزاً في الدردشة.</p>'],
      ['تعامل مع الروابط بحذر', '<p>إذا أرسل لك عضو رابطاً خارجياً وطلب تسجيل الدخول، أغلق الرابط وأبلغ المشرفين.</p>'],
      ['عند التعرض لمشكلة', '<p>احتفظ بلقطة شاشة، واحظر الطرف، ثم أبلغ الإدارة. يمكنك مغادرة الغرفة في أي وقت.</p>'],
    ],
  },
  {
    dir: 'articles/kayf-takhtar-ghurfat-al-dardasha-al-munasibah/amp',
    source: 'articles/kayf-takhtar-ghurfat-al-dardasha-al-munasibah/index.html',
    canonical: 'https://chat-iraq.com/articles/kayf-takhtar-ghurfat-al-dardasha-al-munasibah/',
    ampUrl: 'https://chat-iraq.com/articles/kayf-takhtar-ghurfat-al-dardasha-al-munasibah/amp/',
    name: 'اختيار غرفة الدردشة المناسبة',
    title: 'كيف تختار غرفة دردشة مناسبة | شات عسل تايم',
    description: 'طريقة بسيطة لاختيار غرفة دردشة تناسب لهجتك وهدفك قبل الدخول.',
    sections: [
      ['حدّد الهدف', '<p>هل تريد سوالف يومية، تعارفاً، أم نقاشاً هادئاً؟ تحديد الهدف يقلل الضياع بين الغرف.</p>'],
      ['اقرأ الوصف', '<p>الغرفة الواضحة الوصف والإشراف تكون عادةً أكثر راحة. تجنّب الغرف التي تطلب بيانات شخصية.</p>'],
      ['جرّب ثم قرّر', '<p>ابدأ بالغرفة العامة، وإذا لم تناسبك فانتقل إلى غرفة متخصصة من دليل الدردشة.</p>'],
    ],
  },
  {
    dir: 'articles/alamat-ghurfat-al-dardasha-al-jayidah/amp',
    source: 'articles/alamat-ghurfat-al-dardasha-al-jayidah/index.html',
    canonical: 'https://chat-iraq.com/articles/alamat-ghurfat-al-dardasha-al-jayidah/',
    ampUrl: 'https://chat-iraq.com/articles/alamat-ghurfat-al-dardasha-al-jayidah/amp/',
    name: 'علامات غرفة الدردشة الجيدة',
    title: 'علامات غرفة الدردشة الجيدة | شات عسل تايم',
    description: 'كيف تعرف أن غرفة الدردشة مناسبة وآمنة قبل أن تبدأ المشاركة.',
    sections: [
      ['وصف واضح', '<p>الغرفة الجيدة تشرح موضوعها بلغة مفهومة، ولا تعتمد على عناوين مضللة.</p>'],
      ['إشراف ظاهر', '<p>وجود قوانين واضحة وأدوات حظر وإبلاغ يجعل الدردشة أكثر راحة.</p>'],
      ['احترام الأعضاء', '<p>إذا انتشرت الإساءة أو طلب البيانات الشخصية، اخرج من الغرفة وأبلغ الإدارة.</p>'],
    ],
  },
  {
    dir: 'articles/kayf-tadamin-khususiyatak-fi-al-shat/amp',
    source: 'articles/kayf-tadamin-khususiyatak-fi-al-shat/index.html',
    canonical: 'https://chat-iraq.com/articles/kayf-tadamin-khususiyatak-fi-al-shat/',
    ampUrl: 'https://chat-iraq.com/articles/kayf-tadamin-khususiyatak-fi-al-shat/amp/',
    name: 'خصوصيتك في الشات',
    title: 'كيف تحافظ على خصوصيتك في الشات | شات عسل تايم',
    description: 'قواعد قصيرة ومفيدة للحفاظ على خصوصيتك أثناء الدردشة العربية.',
    sections: [
      ['لا تشارك التفاصيل', '<p>تجنّب كتابة العنوان أو المدرسة أو رقم الهاتف أو اسم العائلة في الرسائل.</p>'],
      ['راجع الصور', '<p>لا ترسل صوراً تكشف مكانك أو أوراقاً أو شاشة تحتوي بياناتك.</p>'],
      ['استخدم الحظر', '<p>عند الإزعاج استخدم الحظر والإبلاغ، ولا تنتظر أن يتوقف الطرف الآخر من تلقاء نفسه.</p>'],
    ],
  },
  {
    dir: 'articles/kayf-tataamal-maa-al-mutaharrishin/amp',
    source: 'articles/kayf-tataamal-maa-al-mutaharrishin/index.html',
    canonical: 'https://chat-iraq.com/articles/kayf-tataamal-maa-al-mutaharrishin/',
    ampUrl: 'https://chat-iraq.com/articles/kayf-tataamal-maa-al-mutaharrishin/amp/',
    name: 'التعامل مع المتحرشين',
    title: 'كيف تتعامل مع المتحرشين في الدردشة | شات عسل تايم',
    description: 'خطوات هادئة وعملية للتعامل مع التحرش في غرف الدردشة وحماية نفسك.',
    sections: [
      ['لا تردّ على الاستفزاز', '<p>الرد الطويل يعطي الطرف الآخر فرصة للاستمرار. اقطع الحوار بسرعة.</p>'],
      ['احتفظ بالدليل', '<p>خذ لقطة شاشة للرسائل المزعجة قبل الحظر إذا أمكن ذلك.</p>'],
      ['احظر وأبلغ', '<p>استخدم زر الحظر، ثم أبلغ الإدارة برابط الغرفة ووقت الواقعة.</p>'],
    ],
  },
];

const changed = [];
for (const page of pages) {
  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://chat-iraq.com/' },
      { '@type': 'ListItem', position: 2, name: 'دليل الدردشة', item: 'https://chat-iraq.com/dardasha/' },
      { '@type': 'ListItem', position: 3, name: page.name, item: page.canonical },
    ],
  });
  const body = page.sections.map(([heading, content]) => `<section><h2>${heading}</h2>${content}</section>`).join('');
  const html = `<!doctype html>
<html amp lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<title>${page.title}</title>
<link rel="canonical" href="${page.canonical}">
<meta name="description" content="${page.description}">
<style amp-custom>${css}</style>
${boilerplate}
<script type="application/ld+json">${breadcrumb}</script>
</head>
<body>
<header><amp-img src="/assets/brand-logo.webp" width="34" height="34" layout="fixed" alt=""></amp-img><a href="https://chat-iraq.com/">شات عسل تايم</a></header>
<nav class="crumbs"><a href="https://chat-iraq.com/">الرئيسية</a> / <a href="https://chat-iraq.com/dardasha/">دليل الدردشة</a> / ${page.name}</nav>
<main><h1>${page.title}</h1>${body}<section><p><a href="${page.canonical}">افتح النسخة الكاملة</a> · <a href="https://chat-iraq.com/dardasha/">دليل الدردشة</a></p></section></main>
<footer>شات عسل تايم — دردشة عربية من الجوال.</footer>
</body>
</html>
`;
  const outDir = `${root}/${page.dir}`;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = `${outDir}/index.html`;
  if (!fs.existsSync(outFile) || fs.readFileSync(outFile, 'utf8') !== html) {
    if (write) fs.writeFileSync(outFile, html);
    changed.push(page.ampUrl);
  }

  const sourceFile = `${root}/${page.source}`;
  const source = fs.readFileSync(sourceFile, 'utf8');
  if (!source.includes(`rel="amphtml"`)) {
    const patched = source.replace(/(<link rel="canonical"[^>]*>)/i, `$1<link rel="amphtml" href="${page.ampUrl}">`);
    if (write) fs.writeFileSync(sourceFile, patched);
    changed.push(page.canonical);
  }
}

console.log(`${write ? 'WROTE' : 'DRY-RUN'} AMP pages: ${pages.length}`);
for (const item of changed) console.log(`  ${item}`);
