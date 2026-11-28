/* build-iraq-pages.mjs — قسم «دردشة العراق» بهوية عسل تايم
 * صفحات مكتوبة يدوياً، لكل صفحة زاوية مختلفة؛ لا قوالب مكررة ولا FAQPage schema.
 * تشغيل: node scripts/build-iraq-pages.mjs --write
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://chat-iraq.com';
const DIR = 'dardasha/iraq';

const pages = [
  {
    slug: '', name: 'دردشة العراق',
    title: 'دردشة العراق | غرف عراقية من الجوال بلا تسجيل',
    description: 'دردشة العراق في مكان واحد: غرف عراقية بلهجات بغداد والجنوب والكردية، تعمل من متصفح الجوال باسم مستعار ودون تسجيل. ابدأ بغرفة قريبة من لهجتك.',
    h1: 'دردشة العراق — غرف عراقية حقيقية من جوالك',
    lede: 'إذا كنت تبحث عن دردشة العراق فأنت لا تريد موقعاً عاماً يتحدث عن كل الدول؛ تريد مكاناً يفهم لهجتك، يعرف بغداد والبصرة والموصل، ويفتح لك من الجوال في ثوانٍ. هذا بالضبط ما يجمعه هذا القسم.',
    kicker: 'القسم العراقي في عسل تايم',
    sections: [
      ['لماذا تبحث عن دردشة العراق؟', '<p>العراقيون يبحثون عن «دردشة العراق» لأنهم يريدون سوالف باللهجة نفسها: مزاح بغدادي، هدوء الجنوب، أو حديث كردي. الغرفة المناسبة توفر وقتك وتجعل الحديث يبدأ فوراً دون شرح أو ترجمة.</p>'],
      ['كيف تبدأ؟', '<p>اختر زاويتك من الأسفل: <a href="https://chat-iraq.com/dardasha/iraq/al-iraq/">دردشة عراقنا</a> إن كنت تريد نظرة شاملة، أو <a href="https://chat-iraq.com/dardasha/iraq/iraqiya/">دردشة عراقية</a> إن كنت تبحث عن اللهجة والهوية، أو <a href="https://chat-iraq.com/dardasha/iraq/irakna/">دردشة العراق Na</a> للصيغة المكتوبة الشائعة. كلها تفتح غرفاً حقيقية على الموقع.</p>'],
      ['غرف حقيقية وليست صفحات وعود', '<p>الروابط في هذا القسم تؤدي إلى غرف دردشة فعلية تعمل بتقنية Firebase، لا إلى صفحات تشرح الموقع فقط. يمكنك الدخول كزائر باسم مستعار، ثم تغيير الغرفة متى أردت.</p>'],
      ['الأمان أولاً', '<p>لا تكتب رقم هاتفك أو بريدك أو كلمة مرور أثناء الدردشة. مساعد الأمان المدمج في عسل تايم ينبهك قبل إرسال أي بيانات حساسة. اقرأ <a href="https://chat-iraq.com/rules/">قوانين الموقع</a> قبل المشاركة.</p>'],
    ],
    faqs: [
      ['هل دردشة العراق مجانية؟', 'نعم، يمكنك الدخول كزائر دون تسجيل أو اشتراك.'],
      ['هل أحتاج تحميل تطبيق؟', 'لا، الغرف تعمل داخل متصفح الجوال مباشرة.'],
      ['ما الفرق بين هذه الصفحات؟', 'كل صفحة تشرح زاوية مختلفة من البحث نفسه، وتربطك بالغرف المناسبة لها.'],
    ],
    related: [['/dardasha/baghdad/', 'دردشة بغداد'], ['/dardasha/aden/', 'دردشة عدن'], ['/dardasha/', 'دليل الدردشة العربية']],
  },
  {
    slug: 'al-iraq', name: 'دردشة عراقنا',
    title: 'دردشة عراقنا | غرف تجمع العراقيين من كل المحافظات',
    description: 'دردشة عراقنا تجمعك بأعضاء من بغداد والبصرة والموصل وكركوك في غرف عامة بلهجة عراقية مفهومة، وتعمل من الجوال بلا تسجيل.',
    h1: 'دردشة عراقنا — من بغداد إلى البصرة في غرفة واحدة',
    lede: 'كلمة «عراقنا» تعني المكان الذي يجمعه كل العراقي: محافظات مختلفة ولهجات متقاربة. هذه الصفحة توضح لك كيف تبدأ من الغرف العامة وتجد من يشاركك السوالف دون انتظار.',
    kicker: 'نظرة تجمع كل المحافظات',
    sections: [
      ['ما الذي يميز دردشة عراقنا؟', '<p>أنها لا تتطلب منك اختيار محافظة قبل أن تعرف ما تريد. ابدأ من غرفة عامة، واستمع للهجة، ثم انتقل إلى غرفة أخص إن أردت. هذا أسرع من البحث في عشرات المواقع.</p>'],
      ['من بغداد إلى البصرة', '<p>الغرف العراقية في عسل تايم تستخدم أسماء واضحة. إن أردت لهجة بغدادية تحديداً فافتح <a href="https://chat-iraq.com/dardasha/baghdad/">دردشة بغداد</a>، وإن أردت نظرة أوسع فعد إلى <a href="https://chat-iraq.com/dardasha/iraq/">دردشة العراق</a>.</p>'],
      ['دخول سريع من الجوال', '<p>الصفحة خفيفة والمحتوى مقروء على الشاشة الصغيرة. لا توجد خطوة تسجيل، ولا تحميل، ولا انتظار موافقة؛ اختر اسماً مستعاراً وابدأ.</p>'],
      ['احترام الخصوصية', '<p>لا تشارك رابطاً خارجياً أو بيانات خاصة. مساعد الأمان في الدردشة يذكّرك قبل الإرسال، والإدارة تراجع البلاغات.</p>'],
    ],
    faqs: [
      ['هل أجد أعضاء من كل المحافظات؟', 'الغرف العامة تضم أعضاء من مناطق متعددة، والأسماء الواضحة تساعدك على الاختيار.'],
      ['هل الدخول باسم حقيقي؟', 'لا، يمكنك الدخول باسم مستعار تماماً.'],
      ['هل هناك رسوم؟', 'لا، الدردشة الكتابية مجانية.'],
    ],
    related: [['/dardasha/iraq/', 'دردشة العراق'], ['/dardasha/khaleej/', 'دردشة الخليج'], ['/profile/', 'الملف الشخصي']],
  },
  {
    slug: 'iraqiya', name: 'دردشة عراقية',
    title: 'دردشة عراقية | لهجة عراقية أصيلة في غرف آمنة',
    description: 'دردشة عراقية بلغة قريبة من الشارع العراقي: غرف تحترم اللهجة والخصوصية، وتعمل من متصفح الجوال بلا تسجيل وباسم مستعار.',
    h1: 'دردشة عراقية — لهجة تفهمها من أول رسالة',
    lede: 'الفرق بين «دردشة العراق» و«دردشة عراقية» هو السؤال عن الهوية لا عن المكان: تريد حديثاً عراقياً فعلاً، لا مجرد وجود أعضاء عراقيين. هنا نركز على اللهجة والسلوك داخل الغرفة.',
    kicker: 'الهوية واللهجة العراقية',
    sections: [
      ['اللهجة أولاً', '<p>في الغرفة العراقية الجيدة تفهم الكلمة من سياقها: «شلونك»، «وينك»، «هذا شلون؟». هذه الصفحة تجمع الغرف التي يظهر في وصفها أن الحوار عراقي، حتى لا تفاجئك لهجة أخرى.</p>'],
      ['كيف تتعرف على الغرفة المناسبة؟', '<p>اقرأ الوصف قبل الدخول. الغرفة التي تذكر «عراقي» أو «بغدادي» أو «جنوبي» في عنوانها هي الأقرب لما تبحث عنه. وللمقارنة، اطّلع على <a href="https://chat-iraq.com/dardasha/iraq/al-iraq/">دردشة عراقنا</a>.</p>'],
      ['الأدب في السوالف', '<p>اللهجة القريبة لا تعني تجاوز الخصوصية. لا تسأل عن العمر أو العنوان أو رقم الهاتف، ولا تضغط على أحد للبقاء. القواعد واضحة في <a href="https://chat-iraq.com/rules/">صفحة القوانين</a>.</p>'],
      ['من الجوال مباشرة', '<p>لا تحتاج تطبيقاً ولا تسجيلاً. افتح الرابط من هاتفك، اختر اسماً مستعاراً، وابدأ الكتابة. الدردشة الصوتية متاحة أيضاً لكن الكتابية هي الأسرع والأكثر موثوقية.</p>'],
    ],
    faqs: [
      ['هل الحوار عربي فصيح؟', 'الغرف العراقية تميل للهجة، وهذا مطلوب عند البحث عن دردشة عراقية.'],
      ['هل يمكنني تغيير اسمي؟', 'نعم، يمكنك الدخول باسم مستعار جديد في أي وقت.'],
      ['هل توجد غرف للشباب فقط؟', 'الغرف عامة وتخضع لقواعد الأمان، ولا تُصنّف حسب العمر.'],
    ],
    related: [['/dardasha/iraq/', 'دردشة العراق'], ['/dardasha/baghdad/', 'دردشة بغداد'], ['/child-safety/', 'سلامة الأطفال']],
  },
  {
    slug: 'irakna', name: 'دردشة العراق Na',
    title: 'دردشة العراق Na | الصيغة المكتوبة الشائعة لبحث العراقيين',
    description: 'صفحة توضيحية لصيغة «العراق Na» كما يكتبها الباحثون: الفرق بينها وبين «دردشة العراق»، والغرف العراقية التي تصلح للبداية من الجوال.',
    h1: 'دردشة العراق Na — كيف تكتبها وتجد الغرفة الصحيحة',
    lede: 'كثير من العراقيين يكتبون «Irak Na» أو «العراق na» عند البحث عن دردشة. هذه الصفحة لا تخترع اسماً جديداً؛ بل تشرح الصيغة وتوجهك إلى الغرف العراقية الحقيقية داخل عسل تايم.',
    kicker: 'صيغة بحث، لا اسم علامة',
    sections: [
      ['لماذا تظهر صيغة Na؟', '<p>الكتابة العربية على الجوال تخلط بين الحروف والإنجليزية، فيكتب بعضهم «العراق na» بدل «العراق». نحن نفهم هذه الصيغة كطريقة بحث، ولا نعتبرها اسماً منفصلاً للعلامة؛ اسمنا هو <a href="https://chat-iraq.com/brand/">عسل تايم</a>.</p>'],
      ['أين تذهب بعد هذه الصفحة؟', '<p>ابدأ من <a href="https://chat-iraq.com/dardasha/iraq/">دردشة العراق</a> للغرف العامة، أو من <a href="https://chat-iraq.com/dardasha/iraq/iraqiya/">دردشة عراقية</a> إن كنت تريد لهجة عراقية محددة. كلتاهما تؤدي إلى غرف تعمل الآن.</p>'],
      ['لا صفحة مكررة بلا سبب', '<p>قد يبدو أن هذه الصفحات متشابهة، لكن لكل واحدة سؤال مختلف: المكان، الهوية، الجميع، وطريقة الكتابة. هذا يخدم الباحث ولا يكرر المحتوى نفسه.</p>'],
      ['الخصوصية تبقى كما هي', '<p>بغض النظر عن صيغة البحث، القاعدة واحدة: اسم مستعار، بلا بيانات خاصة، وبلا روابط مشبوهة. مساعد الأمان يعمل داخل الدردشة قبل كل إرسال.</p>'],
    ],
    faqs: [
      ['هل «العراق Na» اسم موقع؟', 'لا، هي صيغة بحث شائعة؛ الاسم الرسمي عسل تايم.'],
      ['هل توجد غرفة بهذا الاسم؟', 'لا، لكن الغرف العراقية العامة تؤدي المطلوب.'],
      ['كيف أصل إليها بسرعة؟', 'من الصفحة الرئيسة لدردشة العراق في هذا القسم.'],
    ],
    related: [['/dardasha/iraq/', 'دردشة العراق'], ['/dardasha/iraq/iraqiya/', 'دردشة عراقية'], ['/brand/', 'هوية عسل تايم']],
  },
];

const header = `<header class="ds-header"><div class="ds-container ds-nav"><a class="ds-brand" href="${BASE}/"><img src="/assets/brand-logo.webp" srcset="/assets/brand-logo-40.webp 40w, /assets/brand-logo.webp 512w" sizes="34px" alt="" width="34" height="34" fetchpriority="high">عسل تايم</a><nav class="ds-menu" aria-label="القائمة الرئيسية"><a href="${BASE}/">الرئيسية</a><a href="${BASE}/dardasha/" class="is-active">دليل الدردشة</a><a href="${BASE}/profile/">الملف الشخصي</a><a href="${BASE}/al3ab/">الألعاب</a><a href="${BASE}/Forum/">المنتدى</a></nav></div></header>`;
const footer = `<footer class="footer"><div class="container"><div class="row"><div class="col-lg-8 col-md-6 text-right"><img loading="lazy" decoding="async" class="img-fluid footer-brand" src="/assets/brand-logo.webp" alt="عسل تايم" width="88" height="88"><span class="footer-brandname">عسل تايم</span><p class="footer_description">دردشة عربية مجانية تجمع أصدقاء من كل الجنسيات في غرف مراقبة تعمل من الجوال مباشرة.</p></div><div class="col-lg-2 col-md-3 col-6 mt-sm-3"><h2 class="menu_title">القسم العراقي</h2><ul class="footer-menu pr-3"><li><a href="${BASE}/dardasha/iraq/">دردشة العراق</a></li><li><a href="${BASE}/dardasha/iraq/al-iraq/">دردشة عراقنا</a></li><li><a href="${BASE}/dardasha/iraq/iraqiya/">دردشة عراقية</a></li></ul></div><div class="col-lg-2 col-md-3 col-6 mt-sm-3"><h2 class="menu_title">معلومات</h2><ul class="footer-menu pr-2"><li><a href="${BASE}/rules/">القوانين</a></li><li><a href="${BASE}/child-safety/">سلامة الأطفال</a></li><li><a href="${BASE}/brand/">هويتنا</a></li></ul></div></div></div><div class="middle_footer"><div class="container"><p class="copyrights">&copy; 2026 عسل تايم · جميع الحقوق محفوظة</p></div></div></footer>`;

function esc(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function render(page) {
  const url = `${BASE}/${DIR}/${page.slug ? page.slug + '/' : ''}`;
  const crumbName = page.name;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'ar', isPartOf: { '@id': `${BASE}/#website` }, breadcrumb: { '@id': `${url}#breadcrumb` } },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'دليل الدردشة', item: `${BASE}/dardasha/` },
        { '@type': 'ListItem', position: 3, name: 'دردشة العراق', item: `${BASE}/dardasha/iraq/` },
        ...(page.slug ? [{ '@type': 'ListItem', position: 4, name: crumbName, item: url }] : []),
      ] },
    ],
  };
  const sections = page.sections.map(([h, b]) => `<section class="ds-card ds-reveal"><h2>${esc(h)}</h2>${b}</section>`).join('\n');
  const faqs = page.faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('');
  const related = page.related.map(([href, label]) => `<a class="ds-pill" href="${BASE}${href}">${esc(label)}</a>`).join('');
  const crumbs = `<nav class="ds-crumbs ds-rb" aria-label="مسار التنقل"><a href="${BASE}/">الرئيسية</a><a href="${BASE}/dardasha/">دليل الدردشة</a>${page.slug ? `<a href="${BASE}/dardasha/iraq/">دردشة العراق</a><span aria-current="page">${esc(crumbName)}</span>` : '<span aria-current="page">دردشة العراق</span>'}</nav>`;
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" sizes="64x64" href="/assets/favicon-64.png">
<link rel="stylesheet" href="/assets/site.min.css">
<link rel="stylesheet" href="/assets/site-extra.min.css">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ar_IQ">
<meta property="og:site_name" content="عسل تايم">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${BASE}/assets/brand-logo.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#4d388f">
</head>
<body>
${header}
${crumbs}
<main class="ds-container"><div class="room_content">
<section class="px-hero ds-reveal"><span class="px-kicker">${esc(page.kicker)}</span><h1>${esc(page.h1)}</h1><p>${page.lede}</p><p><a href="${BASE}/dardasha/iraq/">كل صفحات دردشة العراق</a> · <a href="${BASE}/dardasha/">دليل الدردشة العربية</a></p></section>
${sections}
<section class="ds-card ds-reveal"><h2>أسئلة شائعة</h2>${faqs}</section>
<section class="ds-card ds-related-wrap ds-rb"><h2 class="ds-sec">اقرأ أيضاً</h2><div class="ds-related">${related}</div></section>
</div></main>
${footer}
<script src="/assets/app.js" defer></script>
</body>
</html>
`;
}

const write = process.argv.includes('--write');
for (const page of pages) {
  const dir = path.join(process.cwd(), DIR, page.slug);
  if (write) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), render(page), 'utf8');
  }
  const url = `${BASE}/${DIR}/${page.slug ? page.slug + '/' : ''}`;
  console.log(`${write ? 'WROTE' : 'DRY-RUN'} ${url}`);
}
