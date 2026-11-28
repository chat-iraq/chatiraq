import fs from 'node:fs';
import path from 'node:path';

/**
 * Page data is intentionally written by hand: each page has its own angle,
 * room list and FAQ. The shared shell below only provides layout and schema.
 */
const pages = [
  {
    slug: 'baghdad',
    name: 'دردشة بغداد',
    title: 'دردشة بغداد | غرف عراقية بلهجة بغدادية من الجوال',
    description: 'دردشة بغداد بلهجة عراقية أصيلة: ابدأ من غرف بغداد المعروفة، اقرأ قواعد الغرفة، وادخل باسم مستعار من متصفح الجوال بلا تسجيل.',
    kicker: 'لهجة بغداد في الدردشة',
    h1: 'دردشة بغداد — غرف عراقية من الجوال بلا تسجيل',
    intro: 'إذا كنت تبحث عن دردشة بغداد فأنت تبحث عن لهجة مألوفة وسوالف قريبة من الشارع العراقي. غرف بغداد في الموقع تعمل من متصفح الجوال مباشرة، وتتيح لك الدخول كزائر باسم مستعار قبل أن تقرر البقاء أو تغيير الغرفة.',
    sections: [
      ['لماذا تبحث عن دردشة بغداد؟', '<p>بغداد مدينة واسعة، ولهجتها تظهر في كثير من غرف السوالف العربية. من يكتب «دردشة بغداد» أو «شات بغداد» غالباً يريد حديثاً يومياً بلغة يفهمها دون ترجمة، لذلك تجمع هذه الصفحة الغرف العراقية التي تصلح للبداية.</p>'],
      ['ابدأ من غرف بغداد هذه', '<p>جرّب <a href="https://chat-iraq.com/baghdad/">غرفة بغداد العامة</a> أولاً، أو افتح <a href="https://chat-iraq.com/qmr-bghdad/">قمر بغداد</a> و<a href="https://chat-iraq.com/nar-alhb/">نار الحب</a> إن كنت تفضّل السوالف الهادئة. وللمقارنة بين اللهجات، ارجع إلى <a href="https://chat-iraq.com/dardasha/">دليل الدردشة العربية</a>.</p>'],
      ['كيف تختار غرفة بغدادية مناسبة؟', '<ol><li>اقرأ وصف الغرفة قبل الدخول؛ الواضح منها يكون عادةً أكثر راحة.</li><li>اكتب اسماً مستعاراً لا يدل على اسمك الحقيقي أو مدرستك.</li><li>جرّب الغرفة العامة، ثم انتقل إلى غرفة متخصصة إن وجدت ما يناسبك.</li><li>إذا شعرت بالإزعاج، اخرج واستخدم أدوات الحظر والإبلاغ.</li></ol>'],
      ['الأمان في غرف بغداد', '<p>لا تشارك رقم هاتفك أو عنوان سكنك أو رمز تحقق مع أي عضو، حتى لو قال إنه مشرف. تجنّب الروابط الخارجية التي تُطلب منك أثناء الدردشة، وراجع <a href="https://chat-iraq.com/child-safety/">قواعد السلامة</a> قبل السماح لأطفالك بالدخول.</p>'],
    ],
    faqs: [
      ['هل أحتاج تسجيلاً لدردشة بغداد؟', 'لا؛ معظم الغرف العراقية تعمل كزائر باسم مستعار من متصفح الجوال.'],
      ['ما الفرق بين دردشة بغداد وشات بغداد؟', 'الاسمان يصفان الغرفة نفسها؛ الفرق في الصيغة فقط، وكلاهما يقود إلى الغرف العراقية المذكورة هنا.'],
      ['كيف أصل إلى غرفة قمر بغداد؟', 'افتح رابط غرفة قمر بغداد من هذه الصفحة، ثم اكتب الاسم المستعار في نموذج الدخول.'],
    ],
    related: [['/dardasha/aden/', 'دردشة عدن واليمن'], ['/dardasha/khaleej/', 'دردشة الخليج'], ['/dardasha/', 'دليل الدردشة العربية']],
  },
  {
    slug: 'aden',
    name: 'دردشة عدن',
    title: 'دردشة عدن واليمن | غرف يمنية باللهجة المحلية من الجوال',
    description: 'دردشة عدن واليمن باللهجة المحلية: تعرّف على الغرف اليمنية، ابدأ باسم مستعار، وتكلم كتابةً أو صوتاً من الجوال من دون تسجيل.',
    kicker: 'سوالف يمنية من الجوال',
    h1: 'دردشة عدن واليمن — غرف باللهجة المحلية',
    intro: 'الدردشة اليمنية تتميز بلهجة قريبة من القلب ومفردات خاصة بالساحل والمدينة. هذه الصفحة تجمع مداخل الغرف اليمنية، ومنها غرف عدن، لتصل إلى حديث مألوف بدل البحث بين عشرات الأسماء.',
    sections: [
      ['دردشة عدن واللهجة اليمنية', '<p>من يبحث عن دردشة عدن غالباً يريد لهجة الجنوب تحديداً: كلمات بسيطة، مزاح خفيف، وحديث عن الحياة اليومية. ابدأ بالغرفة العامة ثم خصّص حسب ما تجده في الوصف.</p>'],
      ['غرف يمنية يمكنك أن تبدأ منها', '<p>افتح <a href="https://chat-iraq.com/aden/">غرفة عدن</a> أو <a href="https://chat-iraq.com/aden-chat/">عدن شات</a>، وإن أردت نطاقاً أوسع فجرّب <a href="https://chat-iraq.com/yemen/">دردشة اليمن</a> و<a href="https://chat-iraq.com/yemeny-chat/">الشات اليمني</a>. هذه الروابط كلها تعمل من الجوال دون تطبيق.</p>'],
      ['كيف أكتب باللهجة اليمنية في الدردشة؟', '<p>اكتب كما تتكلم، لكن تجنّب الإملاء الذي يصعب قراءته على الطرف الآخر. إذا كانت الغرفة تطلب الفصحى أو لغة أخرى، سيظهر ذلك في الوصف قبل الدخول.</p>'],
      ['قواعد الحوار المحترم', '<p>السوالف اليمنية جميلة عندما تبقى داخل حدود الاحترام: لا تسخر من لهجة أحد، ولا تشارك بيانات خاصة، وأبلغ الإدارة عند التعرض لتحرش. راجع <a href="https://chat-iraq.com/rules/">قوانين الموقع</a> قبل المشاركة.</p>'],
    ],
    faqs: [
      ['هل توجد غرفة خاصة بعدن؟', 'نعم، ابدأ من رابط غرفة عدن أو عدن شات في هذه الصفحة، ثم اختر ما يناسبك من الغرف اليمنية الأخرى.'],
      ['هل أحتاج تطبيقاً للدردشة اليمنية؟', 'لا؛ الغرف تعمل داخل متصفح الجوال مباشرة.'],
      ['كيف أحمي خصوصيتي في الغرفة؟', 'استخدم اسماً مستعاراً، ولا تكتب بلدك أو مدينتك بالتفصيل ولا تشارك رمز تحقق.'],
    ],
    related: [['/dardasha/baghdad/', 'دردشة بغداد'], ['/dardasha/maghrib/', 'دردشة المغرب'], ['/dardasha/', 'دليل الدردشة العربية']],
  },
  {
    slug: 'khaleej',
    name: 'دردشة الخليج',
    title: 'دردشة الخليج | غرف سعودية وكويتية وقطرية من الجوال',
    description: 'دردشة الخليج بلهجات سعودية وكويتية وقطرية وبحرينية: اختر الغرفة المناسبة، وادخل باسم مستعار من الجوال من دون تسجيل أو تطبيق.',
    kicker: 'لهجات الخليج في سوالف يومية',
    h1: 'دردشة الخليج — غرف عربية باللهجة الخليجية',
    intro: 'تتقارب اللهجات الخليجية في كثير من الكلمات، لكن لكل دولة طعمها الخاص في السوالف. إن كنت تبحث عن دردشة خليجية، ابدأ من قائمة الدول ثم اقرأ وصف الغرفة قبل الدخول كزائر.',
    sections: [
      ['ما الذي يميز دردشة الخليج؟', '<p>الحوار الخليجي يميل إلى المزاح اليومي والحديث عن العمل والسفر والرياضة. الغرفة الجديدة توضّح لهجتها في الوصف، فلا تحتاج إلى تخمين قبل المشاركة.</p>'],
      ['غرف خليجية للبداية', '<p>جرّب <a href="https://chat-iraq.com/saudi/">دردشة السعودية</a>، <a href="https://chat-iraq.com/kuwait/">دردشة الكويت</a>، <a href="https://chat-iraq.com/qatar/">دردشة قطر</a>، أو <a href="https://chat-iraq.com/bahrain/">دردشة البحرين</a>. وإن أردت مقارنة اللهجات، افتح <a href="https://chat-iraq.com/dardasha/">الدليل العام</a>.</p>'],
      ['كيف تختار غرفة خليجية؟', '<ol><li>حدّد اللهجة الأقرب لك أولاً.</li><li>اقرأ وصف الغرفة وقواعدها.</li><li>ابدأ باسم مستعار لا يكشف هويتك.</li><li>غيّر الغرفة إن لم تجد ما يناسبك؛ لا توجد تكلفة للتجربة.</li></ol>'],
      ['الخصوصية في الغرف الخليجية', '<p>لا تشارك أرقام الجوال أو أسماء العمل أو رموز التحقق. أي طلب بتسجيل الدخول عبر رابط خارجي أثناء الدردشة يجب أن يُقابل بالتجاهل والإبلاغ.</p>'],
    ],
    faqs: [
      ['ما الفرق بين دردشة خليجية ومصرية؟', 'الفرق في اللهجة ومفردات الحوار اليومي؛ يمكنك تجربة النوعين من الدليل ثم البقاء في الغرفة التي ترتاح لها.'],
      ['هل الدخول إلى غرف الخليج مجاني؟', 'نعم، يمكنك الدخول كزائر باسم مستعار من متصفح الجوال دون تسجيل.'],
      ['كيف أعرف لهجة الغرفة قبل الدخول؟', 'اقرأ وصف الغرفة في صفحتها؛ الوصف الواضح هو أسرع طريقة.'],
    ],
    related: [['/dardasha/masr/', 'دردشة مصر والسودان'], ['/dardasha/baghdad/', 'دردشة بغداد'], ['/dardasha/', 'دليل الدردشة العربية']],
  },
  {
    slug: 'masr',
    name: 'دردشة مصر',
    title: 'دردشة مصر والسودان | غرف باللهجة المصرية من الجوال',
    description: 'دردشة مصر والسودان باللهجة المصرية والدارجة: ابدأ من الغرف المصرية، اكتب باسم مستعار، وتكلم من الجوال بلا تسجيل أو تطبيق.',
    kicker: 'سوالف مصرية وسودانية',
    h1: 'دردشة مصر والسودان — غرف باللهجة المصرية',
    intro: 'اللهجة المصرية من أكثر اللهجات حضوراً في الدردشة العربية، ولها مفرداتها الخاصة التي تجعل الحوار سريعاً وخفيفاً. إن كنت تبحث عن دردشة مصرية أو حديث مصري–سوداني، ابدأ من الغرف التالية.',
    sections: [
      ['دردشة مصرية بالدارجة', '<p>الغرفة المصرية الجيدة تتيح لك الكتابة كما تتكلم، مع وصف يوضّح هل الحوار عام أم متخصص. لا تفترض أن كل غرفة عربية تحمل اللهجة نفسها؛ اقرأ الوصف أولاً.</p>'],
      ['غرف مصرية وسودانية للبداية', '<p>افتح <a href="https://chat-iraq.com/egypt/">دردشة مصر</a>، أو <a href="https://chat-iraq.com/sudan/">دردشة السودان</a>، أو <a href="https://chat-iraq.com/masry-chat/">الشات المصري</a>. وإن أردت لهجة مغربية قريبة من الدارجة، تابع إلى <a href="https://chat-iraq.com/dardasha/maghrib/">دردشة المغرب</a>.</p>'],
      ['السوالف المصرية من الجوال', '<p>كل الغرف تعمل داخل متصفح الجوال: اكتب الاسم المستعار، ثم ابدأ الكتابة أو الصوت حسب ما تتيحه الغرفة. لا يوجد تحميل للتطبيق ولا تسجيل إلزامي.</p>'],
      ['احترام قواعد الغرفة', '<p>المزاح المقبول في غرفة قد لا يكون مقبولاً في أخرى. راجع <a href="https://chat-iraq.com/rules/">القوانين</a>، واحترم بقية الأعضاء، واستخدم الحظر والإبلاغ عند الحاجة.</p>'],
    ],
    faqs: [
      ['هل توجد غرف دردشة مصرية؟', 'نعم، ابدأ من رابط دردشة مصر أو الشات المصري في هذه الصفحة.'],
      ['ما الفرق بين شات مصري ودردشة مصرية؟', 'الصيغتان تستخدمان للبحث عن الغرف نفسها؛ اختر ما تجده أسهل لك.'],
      ['كيف أبدأ باسم مستعار؟', 'اكتب اسماً لا يدل على اسمك الحقيقي في نموذج الدخول قبل فتح الغرفة.'],
    ],
    related: [['/dardasha/khaleej/', 'دردشة الخليج'], ['/dardasha/maghrib/', 'دردشة المغرب'], ['/dardasha/', 'دليل الدردشة العربية']],
  },
  {
    slug: 'maghrib',
    name: 'دردشة المغرب',
    title: 'دردشة المغرب والجزائر | غرف بالدارجة من الجوال',
    description: 'دردشة المغرب والجزائر بالدارجة والعربية: اختر غرفة تناسب لغتك، وادخل باسم مستعار من الجوال دون تسجيل أو تطبيق.',
    kicker: 'الدارجة في الدردشة المغربية',
    h1: 'دردشة المغرب والجزائر — غرف بالدارجة',
    intro: 'في المغرب والجزائر يمزج الحوار اليومي بين الدارجة والعربية الفصحى وأحياناً الفرنسية. إن كنت تبحث عن دردشة مغربية، هذه الصفحة تجمع لك الغرف التي توضح لغتها قبل الدخول.',
    sections: [
      ['الدارجة في الدردشة المغربية', '<p>الدارجة سريعة ومليئة بالاختصارات، لذلك اقرأ وصف الغرفة لتعرف إن كان الحوار بالدارجة أم بالفصحى. الغرفة الواضحة الوصف توفر عليك وقت البحث.</p>'],
      ['غرف المغرب والجزائر', '<p>ابدأ بـ <a href="https://chat-iraq.com/morocco/">دردشة المغرب</a> أو <a href="https://chat-iraq.com/algeria/">دردشة الجزائر</a>، ثم قارن مع <a href="https://chat-iraq.com/dardasha/masr/">دردشة مصر</a> إن أردت لهجة عربية أخرى. كل الغرف تعمل من الجوال.</p>'],
      ['دمج العربية والفرنسية', '<p>بعض الأعضاء يخلطون اللغات في الجملة نفسها. إن كان ذلك يزعجك، اختر غرفة تذكر في وصفها أن الحوار عربي فقط؛ وإن كان يناسبك فستجد غرفاً مرحة بهذا الأسلوب.</p>'],
      ['الأمان والخصوصية', '<p>لا تشارك بيانات حقيقية أو رموز تحقق، ولا تتبع روابط خارجية تطلب تسجيل الدخول أثناء الدردشة. عند التعرض لمشكلة، احتفظ بالدليل وأبلغ الإدارة.</p>'],
    ],
    faqs: [
      ['هل أحتاج تطبيقاً للدردشة المغربية؟', 'لا؛ الغرف تعمل داخل متصفح الجوال مباشرة.'],
      ['كيف أعرف لغة الغرفة قبل الدخول؟', 'اقرأ الوصف المكتوب في صفحة الغرفة؛ سيوضح الدارجة أو الفصحى أو الخلط بينهما.'],
      ['هل الدخول إلى غرف المغرب مجاني؟', 'نعم، يمكنك الدخول كزائر باسم مستعار دون تسجيل.'],
    ],
    related: [['/dardasha/masr/', 'دردشة مصر والسودان'], ['/dardasha/aden/', 'دردشة عدن واليمن'], ['/dardasha/', 'دليل الدردشة العربية']],
  },
];

const header = `<header class="ds-header"><div class="ds-container ds-nav"><a class="ds-brand" href="https://chat-iraq.com/"><img src="/assets/brand-logo.webp" srcset="/assets/brand-logo-40.webp 40w, /assets/brand-logo.webp 512w" sizes="34px" alt="" width="34" height="34" fetchpriority="high">عسل تايم</a><nav class="ds-menu" aria-label="القائمة الرئيسية"><a href="https://chat-iraq.com/">الرئيسية</a><a href="https://chat-iraq.com/dardasha/" class="is-active">دليل الدردشة</a><a href="https://chat-iraq.com/profile/">الملف الشخصي</a><a href="https://chat-iraq.com/questions/">الأسئلة</a><a href="https://chat-iraq.com/Forum/">المنتدى</a><a href="https://chat-iraq.com/search/">بحث</a></nav></div></header>`;

const footer = `<footer class="footer"><div class="container"><div class="row"><div class="col-lg-8 col-md-6 text-right"><img loading="lazy" decoding="async" class="img-fluid footer-brand" src="/assets/brand-logo.webp" alt="عسل تايم" width="88" height="88"><span class="footer-brandname">عسل تايم</span><p class="footer_description">دردشة عربية مجانية تجمع أصدقاء من كل الجنسيات في غرف مراقبة تعمل من الجوال مباشرة.</p></div><div class="col-lg-2 col-md-3 col-6 mt-sm-3"><h2 class="menu_title">الدليل</h2><ul class="footer-menu pr-3"><li><a href="https://chat-iraq.com/dardasha/">دليل الدردشة</a></li><li><a href="https://chat-iraq.com/profile/">الملف الشخصي</a></li><li><a href="https://chat-iraq.com/articles/">المقالات</a></li></ul></div><div class="col-lg-2 col-md-3 col-6 mt-sm-3"><h2 class="menu_title">معلومات</h2><ul class="footer-menu pr-2"><li><a href="https://chat-iraq.com/child-safety/">سلامة الأطفال</a></li><li><a href="https://chat-iraq.com/rules/">قوانين الموقع</a></li><li><a href="https://chat-iraq.com/contact/">اتصل بنا</a></li></ul></div></div></div><div class="middle_footer"><div class="container"><p class="copyrights">&copy; 2026 عسل تايم · جميع الحقوق محفوظة</p></div></div></footer>`;

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function render(page) {
  const url = `https://chat-iraq.com/dardasha/${page.slug}/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'ar', isPartOf: { '@id': 'https://chat-iraq.com/#website' }, breadcrumb: { '@id': `${url}#breadcrumb` } },
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://chat-iraq.com/' },
        { '@type': 'ListItem', position: 2, name: 'دليل الدردشة', item: 'https://chat-iraq.com/dardasha/' },
        { '@type': 'ListItem', position: 3, name: page.name, item: url },
      ] },
      { '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: page.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
    ],
  };
  const sections = page.sections.map(([heading, body]) => `<section class="ds-card ds-reveal"><h2>${heading}</h2>${body}</section>`).join('\n');
  const faqs = page.faqs.map(([question, answer]) => `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).join('');
  const related = page.related.map(([href, label]) => `<a class="ds-pill" href="https://chat-iraq.com${href}">${escapeHtml(label)}</a>`).join('');
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/png" sizes="64x64" href="/assets/favicon-64.png">
<link rel="stylesheet" href="/assets/site.min.css">
<link rel="stylesheet" href="/assets/site-extra.min.css">
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ar_IQ">
<meta property="og:site_name" content="عسل تايم">
<meta property="og:title" content="${escapeHtml(page.title)}">
<meta property="og:description" content="${escapeHtml(page.description)}">
<meta property="og:image" content="https://chat-iraq.com/assets/brand-logo.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(page.title)}">
<meta name="twitter:description" content="${escapeHtml(page.description)}">
<meta name="twitter:image" content="https://chat-iraq.com/assets/brand-logo.webp">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#4d388f">
</head>
<body>
${header}
<nav class="ds-crumbs ds-rb" aria-label="مسار التنقل"><a href="https://chat-iraq.com/">الرئيسية</a><a href="https://chat-iraq.com/dardasha/">دليل الدردشة</a><span aria-current="page">${escapeHtml(page.name)}</span></nav>
<main class="ds-container"><div class="room_content">
<section class="px-hero ds-reveal"><span class="px-kicker">${escapeHtml(page.kicker)}</span><h1>${escapeHtml(page.h1)}</h1><p>${page.intro}</p><p><a href="https://chat-iraq.com/dardasha/">العودة إلى دليل الدردشة العربية</a> · <a href="https://chat-iraq.com/profile/">الملف الشخصي</a></p></section>
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
  const dir = path.join(process.cwd(), 'dardasha', page.slug);
  if (write) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), render(page), 'utf8');
  }
  console.log(`${write ? 'WROTE' : 'DRY-RUN'} https://chat-iraq.com/dardasha/${page.slug}/`);
}
