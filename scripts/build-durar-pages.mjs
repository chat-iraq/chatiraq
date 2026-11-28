/* build-durar-pages.mjs — قسم «درر العرب» بهوية عسل تايم
 * «درر العرب» هنا باب موضوعي لغرف الدردشة، وليس اسماً للعلامة.
 * لا يستخدم العبارة القديمة «شات درر العرب»، ولا FAQPage schema.
 * تشغيل: node scripts/build-durar-pages.mjs --write
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://chat-iraq.com';
const DIR = 'dardasha/durar';

const pages = [
  {
    slug: '', name: 'درر العرب',
    title: 'درر العرب | دردشة درر العرب في عسل تايم',
    description: 'درر العرب باب يجمع غرف الدردشة العربية داخل عسل تايم: تعرف على دردشة درر العرب، واختر غرفة خليجية أو بحرينية أو سعودية أو عراقية من الجوال بلا تسجيل.',
    h1: 'درر العرب — باب الدردشة العربية في عسل تايم',
    lede: 'قدمت كلمة «درر العرب» في تذييل نسخ قديمة من الموقع، وما زال الناس يبحثون عنها. أعددناها اليوم باباً واضحاً يجمع غرفاً عربية حقيقية؛ الاسم الرسمي للمنصة هو عسل تايم، و«دردشة» صفة للخدمة.',
    kicker: 'من التذييل القديم إلى غرف حقيقية',
    sections: [
      ['ما المقصود بـ«درر العرب»؟', '<p>هي تسمية كانت تظهر كعنوان في تذييل النسخ القديمة، وليست اسماً مستقلاً للعلامة. الاسم المعتمد هو <a href="https://chat-iraq.com/brand/">عسل تايم</a>. لذلك تجد هنا دردشة درر العرب بمعناها العملي: غرف عربية مفتوحة تعمل من المتصفح.</p>'],
      ['دردشة درر العرب اليوم', '<p>إن كنت تبحث عن دردشة درر العرب فابدأ من الباب الذي يناسب لهجتك: <a href="https://chat-iraq.com/dardasha/durar/khaleej/">دردشة درر الخليج</a>، أو <a href="https://chat-iraq.com/dardasha/durar/bahrain/">دردشة درر البحرين</a>، أو <a href="https://chat-iraq.com/dardasha/durar/saudi/">دردشة درر السعودية</a>، أو <a href="https://chat-iraq.com/dardasha/durar/iraq/">دردشة درر العراق</a>. كلها تؤدي إلى غرف تعمل الآن.</p>'],
      ['غرف حقيقية وليست وعوداً', '<p>من الأمثلة التي يمكنك فتحها مباشرة: <a href="https://chat-iraq.com/aaraq-star/">غرفة عراق ستار</a>، و<a href="https://chat-iraq.com/aashq-alshywkh/">غرفة عشاق الشيوخ</a>، و<a href="https://chat-iraq.com/aasl-khlyj/">غرفة عسل الخليج</a>. اقرأ وصف الغرفة قبل الدخول.</p>'],
      ['الأمان والهوية', '<p>ادخل باسم مستعار، ولا تشارك رقم هاتف أو كلمة مرور أو رمز تحقق. مساعد الأمان في عسل تايم ينبهك قبل الإرسال، والقواعد واضحة في <a href="https://chat-iraq.com/rules/">صفحة القوانين</a>.</p>'],
    ],
    faqs: [
      ['هل درر العرب اسم موقع منفصل؟', 'لا؛ الاسم الرسمي عسل تايم، ودرر العرب باب موضوعي يجمع غرفاً عربية.'],
      ['ما الفرق بين درر العرب ودردشة درر العرب؟', 'الأولى الباب، والثانية وصف للخدمة داخل هذا الباب.'],
      ['هل الدخول مجاني؟', 'نعم، يمكنك الدخول كزائر باسم مستعار دون تسجيل.'],
    ],
    related: [['/dardasha/iraq/', 'دردشة العراق'], ['/dardasha/khaleej/', 'دردشة الخليج'], ['/brand/', 'هوية عسل تايم']],
  },
  {
    slug: 'khaleej', name: 'دردشة درر الخليج',
    title: 'دردشة درر الخليج | غرف خليجية من الجوال',
    description: 'دردشة درر الخليج تجمع لهجات خليجية قريبة من البيت: غرف عامة تعمل من جوالك باسم مستعار، مع روابط لغرف سعودية وبحرينية حقيقية.',
    h1: 'دردشة درر الخليج — لهجة خليجية من أول رسالة',
    lede: 'من يبحث عن دردشة درر الخليج غالباً يريد لهجة يفهمها بلا ترجمة. هنا تجد طريقة بسيطة للبدء من الغرف العامة، ثم الانتقال إلى غرفة أدق حسب الدولة.',
    kicker: 'الخليج في غرفة قريبة',
    sections: [
      ['لماذا درر الخليج؟', '<p>الخليج لهجات متقاربة لكنها ليست متطابقة. البدء من غرفة عامة يسمعك أكثر من لهجة، ويساعدك على اختيار ما يناسبك قبل أن تستقر في غرفة واحدة.</p>'],
      ['ابدأ من الغرف المتاحة', '<p>افتح <a href="https://chat-iraq.com/aasl-khlyj/">غرفة عسل الخليج</a> للتعرف على الأجواء، ثم قارن مع <a href="https://chat-iraq.com/dardasha/durar/saudi/">دردشة درر السعودية</a> و<a href="https://chat-iraq.com/dardasha/durar/bahrain/">دردشة درر البحرين</a>. ولدليل أوسع راجع <a href="https://chat-iraq.com/dardasha/khaleej/">دليل دردشة الخليج</a>.</p>'],
      ['من الجوال بلا تسجيل', '<p>لا يوجد تطبيق ولا خطوة تسجيل. اكتب اسماً مستعاراً، وابدأ من المتصفح. الدردشة الكتابية هي الأسرع، والصوتية متاحة إن أردت.</p>'],
      ['احترام الخصوصية', '<p>لا تذكر بلدك أو مدرستك بالتفصيل، ولا تتبع رابطاً خارجياً وصل أثناء الدردشة. عند أي مشكلة استخدم الحظر والتبليغ.</p>'],
    ],
    faqs: [
      ['هل توجد لهجة خليجية واحدة؟', 'لا؛ لكن اللهجات متقاربة والغرف العامة تجمعها.'],
      ['هل أحتاج تطبيقاً؟', 'لا، المتصفح يكفي.'],
      ['هل يمكنني الصمت والاستماع أولاً؟', 'نعم، يمكنك القراءة قبل المشاركة.'],
    ],
    related: [['/dardasha/durar/', 'درر العرب'], ['/dardasha/durar/saudi/', 'درر السعودية'], ['/dardasha/durar/bahrain/', 'درر البحرين']],
  },
  {
    slug: 'bahrain', name: 'دردشة درر البحرين',
    title: 'دردشة درر البحرين | غرف بحرينية بلهجة خليجية',
    description: 'دردشة درر البحرين تفتح لك غرفاً بحرينية وخليجية من الجوال بلا تسجيل: لهجة مألوفة، أسماء مستعارة، وروابط غرف حقيقية.',
    h1: 'دردشة درر البحرين — سوالف بحرينية من جوالك',
    lede: 'البحرين صغيرة لكن حديثها واسع. إن كنت تبحث عن دردشة درر البحرين فستجد هنا مدخلاً إلى الغرف البحرينية والخليجية دون أن تضيع بين صفحات عامة.',
    kicker: 'لهجة البحرين في الدردشة',
    sections: [
      ['ما الذي تبحث عنه في دردشة البحرين؟', '<p>غالباً تريد لهجة قريبة وأشخاصاً يفهمون بيئتك. ابدأ من <a href="https://chat-iraq.com/bahrain/">غرفة البحرين</a>، ثم وسّع إلى <a href="https://chat-iraq.com/dardasha/durar/khaleej/">دردشة درر الخليج</a> إن أردت أصواتاً أخرى.</p>'],
      ['غرفة قريبة من البيت', '<p>الغرفة البحرينية تعطيك إحساس المكان دون كشف هويتك. استخدم اسماً مستعاراً، واقرأ القواعد قبل أول رسالة.</p>'],
      ['الانتقال بين الغرف', '<p>لا التزام بغرفة واحدة؛ إن لم تجد الحديث الذي تريد، انتقل إلى غرفة خليجية أوسع أو ارجع إلى <a href="https://chat-iraq.com/dardasha/durar/">باب درر العرب</a>.</p>'],
      ['الأمان', '<p>لا تشارك أرقاماً أو روابط تسجيل دخول داخل الغرفة. مساعد الأمان يعمل قبل الإرسال، والتبليغ متاح دائماً.</p>'],
    ],
    faqs: [
      ['هل الغرفة مخصصة للبحرينيين فقط؟', 'لا، لكن اللهجة بحرينية والزوار من الخليج أيضاً.'],
      ['هل الدخول مجاني؟', 'نعم، بلا تسجيل.'],
      ['هل أستطيع تغيير الغرفة؟', 'نعم في أي وقت.'],
    ],
    related: [['/dardasha/durar/', 'درر العرب'], ['/dardasha/durar/khaleej/', 'درر الخليج'], ['/bahrain/', 'غرفة البحرين']],
  },
  {
    slug: 'saudi', name: 'دردشة درر السعودية',
    title: 'دردشة درر السعودية | غرف سعودية من الجوال بلا تسجيل',
    description: 'دردشة درر السعودية تجمع لهجات سعودية في غرف عامة تعمل من الجوال: ابدأ من غرفة سعودية حقيقية، وانتقل إلى درر الخليج إن أردت لهجة أوسع.',
    h1: 'دردشة درر السعودية — سوالف سعودية من أول دقيقة',
    lede: 'السعودية حاضرة بقوة في الدردشة العربية. هذه الصفحة تختصر لك الطريق إلى الغرف السعودية وتوضح متى تختار غرفة سعودية ومتى تنتقل إلى غرفة خليجية أوسع.',
    kicker: 'اللهجة السعودية في عسل تايم',
    sections: [
      ['لماذا غرفة سعودية؟', '<p>لأن اللهجة تحمل تفاصيل صغيرة يفهمها السعودي فوراً. ابدأ من <a href="https://chat-iraq.com/saudi/">غرفة السعودية</a>، ثم إن أردت لهجات مجاورة افتح <a href="https://chat-iraq.com/dardasha/durar/khaleej/">دردشة درر الخليج</a>.</p>'],
      ['غرف عامة وخيارات أخص', '<p>الغرفة العامة أسهل للبداية. بعد أن تعرف الأجواء يمكنك البحث داخل الموقع عن غرفة باسم مدينة أو اهتمام معين؛ الروابط في هذا القسم كلها تؤدي إلى غرف حقيقية.</p>'],
      ['من الجوال مباشرة', '<p>الصفحة خفيفة والغرفة تعمل في المتصفح دون تحميل تطبيق. اختر اسماً مستعاراً ولا تكتب بيانات حقيقية.</p>'],
      ['الخصوصية', '<p>لا تتبع روابط خارجية طلبت أثناء الدردشة، ولا تشارك حسابك أو رمز تحقق. القواعد في <a href="https://chat-iraq.com/rules/">صفحة القوانين</a>.</p>'],
    ],
    faqs: [
      ['هل الغرفة سعودية بالكامل؟', 'اللهجة سعودية والزوار عرب من جنسيات مختلفة.'],
      ['هل أحتاج تسجيلاً؟', 'لا، الدخول كزائر متاح.'],
      ['كيف أجد غرفة مدينتي؟', 'استخدم مربع البحث في الموقع أو ابدأ من الغرفة السعودية العامة.'],
    ],
    related: [['/dardasha/durar/', 'درر العرب'], ['/dardasha/durar/khaleej/', 'درر الخليج'], ['/saudi/', 'غرفة السعودية']],
  },
  {
    slug: 'iraq', name: 'دردشة درر العراق',
    title: 'دردشة درر العراق | غرف عراقية بلهجة مفهومة',
    description: 'دردشة درر العراق تفتح لك غرفاً عراقية بلهجة قريبة من الشارع: ابدأ من غرفة عراقية حقيقية، أو راجع قسم دردشة العراق للغرف المصنّفة.',
    h1: 'دردشة درر العراق — لهجة عراقية من الجوال',
    lede: 'إن وصلت إلى هنا من تذييل قديم أو من قائمة «درر العرب»، فأنت تبحث عن دردشة عراقية بسيطة. هذه الصفحة توصلك إلى غرف عراقية تعمل الآن، وتشرح أين تذهب بعدها.',
    kicker: 'العراق داخل درر العرب',
    sections: [
      ['من درر العرب إلى العراق', '<p>«درر العرب» كان تذييلاً قديماً؛ أما اليوم فله باب موضوعي في <a href="https://chat-iraq.com/dardasha/durar/">درر العرب</a>. وللغرف العراقية المصنّفة زر <a href="https://chat-iraq.com/dardasha/iraq/">دردشة العراق</a>، وصفحة <a href="https://chat-iraq.com/dardasha/iraq/iraqiya/">دردشة عراقية</a> للهجة والهوية.</p>'],
      ['ابدأ من غرفة حقيقية', '<p>جرّب <a href="https://chat-iraq.com/aaraq-star/">غرفة عراق ستار</a> أو افتح <a href="https://chat-iraq.com/iraq/">غرفة العراق</a>. اقرأ الوصف أولاً، ثم اختر ما يناسب مزاجك.</p>'],
      ['لا تسجيل ولا تطبيق', '<p>المتصفح كافٍ. اسم مستعار، رسالة قصيرة، ويمكنك تغيير الغرفة متى شئت.</p>'],
      ['الأمان', '<p>لا تشارك بيانات خاصة أو روابط دخول. مساعد الأمان ينبهك قبل الإرسال، ويمكنك حظر أي عضو مزعج.</p>'],
    ],
    faqs: [
      ['هل هذه صفحة دردشة مباشرة؟', 'هي باب يوصلك إلى غرف مباشرة داخل الموقع.'],
      ['هل اللهجة عراقية؟', 'نعم، الغرف العراقية تستخدم لهجة عراقية مفهومة.'],
      ['هل الدخول مجاني؟', 'نعم، دون تسجيل.'],
    ],
    related: [['/dardasha/durar/', 'درر العرب'], ['/dardasha/iraq/', 'دردشة العراق'], ['/aaraq-star/', 'غرفة عراق ستار']],
  },
];

const header = `<header class="ds-header"><div class="ds-container ds-nav"><a class="ds-brand" href="${BASE}/"><img src="/assets/brand-logo.webp" srcset="/assets/brand-logo-40.webp 40w, /assets/brand-logo.webp 512w" sizes="34px" alt="" width="34" height="34" fetchpriority="high">عسل تايم</a><nav class="ds-menu" aria-label="القائمة الرئيسية"><a href="${BASE}/">الرئيسية</a><a href="${BASE}/dardasha/" class="is-active">دليل الدردشة</a><a href="${BASE}/profile/">الملف الشخصي</a><a href="${BASE}/al3ab/">الألعاب</a><a href="${BASE}/Forum/">المنتدى</a></nav></div></header>`;
const footer = `<footer class="footer"><div class="container"><div class="row"><div class="col-lg-8 col-md-6 text-right"><img loading="lazy" decoding="async" class="img-fluid footer-brand" src="/assets/brand-logo.webp" alt="عسل تايم" width="88" height="88"><span class="footer-brandname">عسل تايم</span><p class="footer_description">دردشة عربية مجانية تجمع أصدقاء من كل الجنسيات في غرف مراقبة تعمل من الجوال مباشرة.</p></div><div class="col-lg-2 col-md-3 col-6 mt-sm-3"><h2 class="menu_title"><a href="${BASE}/dardasha/durar/">درر العرب</a></h2><ul class="footer-menu pr-3"><li><a href="${BASE}/dardasha/durar/khaleej/">دردشة درر الخليج</a></li><li><a href="${BASE}/dardasha/durar/bahrain/">دردشة درر البحرين</a></li><li><a href="${BASE}/dardasha/durar/saudi/">دردشة درر السعودية</a></li><li><a href="${BASE}/dardasha/durar/iraq/">دردشة درر العراق</a></li></ul></div><div class="col-lg-2 col-md-3 col-6 mt-sm-3"><h2 class="menu_title">معلومات</h2><ul class="footer-menu pr-2"><li><a href="${BASE}/rules/">القوانين</a></li><li><a href="${BASE}/brand/">هويتنا</a></li><li><a href="${BASE}/sitemap/">الخريطة</a></li></ul></div></div></div><div class="middle_footer"><div class="container"><p class="copyrights">&copy; 2026 عسل تايم · جميع الحقوق محفوظة</p></div></div></footer>`;

function esc(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function render(page) {
  const url = `${BASE}/${DIR}/${page.slug ? page.slug + '/' : ''}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'ar', isPartOf: { '@id': `${BASE}/#website` }, breadcrumb: { '@id': `${url}#breadcrumb` } },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'دليل الدردشة', item: `${BASE}/dardasha/` },
        { '@type': 'ListItem', position: 3, name: 'درر العرب', item: `${BASE}/dardasha/durar/` },
        ...(page.slug ? [{ '@type': 'ListItem', position: 4, name: page.name, item: url }] : []),
      ] },
    ],
  };
  const sections = page.sections.map(([h, b]) => `<section class="ds-card ds-reveal"><h2>${esc(h)}</h2>${b}</section>`).join('\n');
  const faqs = page.faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('');
  const related = page.related.map(([href, label]) => `<a class="ds-pill" href="${BASE}${href}">${esc(label)}</a>`).join('');
  const crumbs = `<nav class="ds-crumbs ds-rb" aria-label="مسار التنقل"><a href="${BASE}/">الرئيسية</a><a href="${BASE}/dardasha/">دليل الدردشة</a>${page.slug ? `<a href="${BASE}/dardasha/durar/">درر العرب</a><span aria-current="page">${esc(page.name)}</span>` : '<span aria-current="page">درر العرب</span>'}</nav>`;
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
<meta property="og:locale" content="ar">
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
<section class="px-hero ds-reveal"><span class="px-kicker">${esc(page.kicker)}</span><h1>${esc(page.h1)}</h1><p>${page.lede}</p><p><a href="${BASE}/dardasha/durar/">كل صفحات درر العرب</a> · <a href="${BASE}/dardasha/">دليل الدردشة العربية</a></p></section>
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
  console.log(`${write ? 'WROTE' : 'DRY-RUN'} ${BASE}/${DIR}/${page.slug ? page.slug + '/' : ''}`);
}
