/* patch-brand-ai.mjs — توحيد هوية «عسل تايم» وتوسيع أدوات الذكاء الاصطناعي في الصفحات الثابتة.
 * القاعدة المعتمدة: الاسم الرسمي للبراند هو «عسل تايم». أما «شات» و«دردشة» فكلمات تصف الخدمة،
 * وليست جزءاً من اسم العلامة؛ لذلك تُستخدم في العناوين/Body ولا تُستخدم في حقول الاسم/الكيان.
 * تشغيل: node scripts/patch-brand-ai.mjs --write
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const write = process.argv.includes('--write');
const skipDirs = new Set(['node_modules', 'dist', '.git', 'seo', 'scripts', 'src', 'public', '.github']);
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name));
    } else if (/\.html?$/i.test(entry.name)) {
      files.push(path.join(dir, entry.name));
    }
  }
}
walk(root);

const rules = [
  {
    name: 'organizationName',
    re: /"@type":"Organization","@id":"https:\/\/chat-iraq\.com\/#organization","name":"شات عسل تايم"/g,
    to: '"@type":"Organization","@id":"https://chat-iraq.com/#organization","name":"عسل تايم"',
  },
  {
    name: 'websiteName',
    re: /"@type":"WebSite","@id":"https:\/\/chat-iraq\.com\/#website","url":"https:\/\/chat-iraq\.com\/","name":"شات عسل تايم"/g,
    to: '"@type":"WebSite","@id":"https://chat-iraq.com/#website","url":"https://chat-iraq.com/","name":"عسل تايم"',
  },
  {
    name: 'websiteNameShort',
    re: /"@type":"WebSite","url":"https:\/\/chat-iraq\.com\/","name":"شات عسل تايم"/g,
    to: '"@type":"WebSite","url":"https://chat-iraq.com/","name":"عسل تايم"',
  },
  {
    name: 'organizationNameAny',
    re: /(@type":"Organization",[^}]*?"name":")شات عسل تايم(")/g,
    to: '$1عسل تايم$2',
  },
  {
    name: 'websiteNameAny',
    re: /(@type":"WebSite",[^}]*?"name":")شات عسل تايم(")/g,
    to: '$1عسل تايم$2',
  },
  {
    name: 'alternateName',
    re: /"alternateName":\["عسل تايم","Asl Time"\]/g,
    to: '"alternateName":["Asl Time","chat-iraq.com"]',
  },
  {
    name: 'ogSiteName',
    re: /(<meta[^>]+(?:property="og:site_name"|name="application-name")[^>]+content=")شات عسل تايم(")/g,
    to: '$1عسل تايم$2',
  },
  {
    name: 'ogSiteNameReversed',
    re: /(<meta[^>]+content=")شات عسل تايم("[^>]+(?:property="og:site_name"|name="application-name"))/g,
    to: '$1عسل تايم$2',
  },
  { name: 'logoCaption', re: /"caption":"شات عسل تايم"/g, to: '"caption":"عسل تايم"' },
  { name: 'logoAlt', re: /alt="شات عسل تايم"/g, to: 'alt="عسل تايم"' },
  {
    name: 'footerBrand',
    re: /<span class="footer-brandname">شات عسل تايم<\/span>/g,
    to: '<span class="footer-brandname">عسل تايم</span>',
  },
  {
    name: 'headerBrand',
    re: /(<a class="ds-brand"[^>]*>[\s\S]*?)شات عسل تايم(<\/a>)/g,
    to: '$1عسل تايم$2',
  },
  {
    name: 'footerDescription',
    re: /(<p class="footer_description">)شات عسل تايم/g,
    to: '$1عسل تايم',
  },
  {
    name: 'searchAction',
    re: /https:\/\/chat-iraq\.com\/search\?q=\{search_term_string\}/g,
    to: 'https://chat-iraq.com/search/?q={search_term_string}',
  },
  {
    name: 'toolSearchDescription',
    re: /description:"ابحث في غرف الدردشة وصفحات شات عسل تايم"/g,
    to: 'description:"ابحث في غرف الدردشة وصفحات عسل تايم"',
  },
  {
    name: 'toolSafetyDescription',
    re: /description:"قواعد الخصوصية والسلامة في شات عسل تايم"/g,
    to: 'description:"قواعد الخصوصية والسلامة في عسل تايم"',
  },
];

const toolPattern = /<script>\(\(\)=>\{const m=window\.modelContext\|\|\(window\.navigator&&navigator\.modelContext\);if\(!m\)return;m\.registerTool\(\{name:"search_site"[\s\S]*?\}\);\}\)\(\);<\/script>/g;
const toolScript = '<script>(()=>{const m=window.modelContext||(window.navigator&&navigator.modelContext);if(!m||typeof m.registerTool!=="function")return;const go=p=>{location.assign(p)};[{name:"search_site",description:"ابحث في غرف الدردشة وصفحات عسل تايم",inputSchema:{type:"object",properties:{q:{type:"string",description:"كلمات البحث"}},required:["q"]},execute:({q})=>go("/search/?q="+encodeURIComponent(q))},{name:"brand_info",description:"الاسم الرسمي وتاريخ علامة عسل تايم الموثّق",inputSchema:{type:"object",properties:{}},execute:()=>go("/brand/")},{name:"safety_guide",description:"قواعد الخصوصية والسلامة في عسل تايم",inputSchema:{type:"object",properties:{}},execute:()=>go("/rules/")},{name:"list_games",description:"الألعاب الجماعية في دردشة عسل تايم",inputSchema:{type:"object",properties:{}},execute:()=>go("/al3ab/")}].forEach(t=>m.registerTool(t));})();</script>';

const stats = { files: 0 };
for (const rule of rules) stats[rule.name] = 0;
stats.aiTools = 0;

function normalizeEntityNames(html) {
  return html.split('\n').map((line) => {
    if (!line.includes('"@type":"Organization"') && !line.includes('"@type":"WebSite"')) return line;
    return line.split(/(?=\{"@type":)/).map((segment) => {
      if (segment.startsWith('{"@type":"Organization"') || segment.startsWith('{"@type":"WebSite"')) {
        return segment.replace(/"name":"شات عسل تايم"/g, '"name":"عسل تايم"');
      }
      return segment;
    }).join('');
  }).join('\n');
}

for (const file of files) {
  let html = normalizeEntityNames(fs.readFileSync(file, 'utf8'));
  const before = fs.readFileSync(file, 'utf8');
  for (const rule of rules) {
    const hits = (html.match(rule.re) || []).length;
    if (hits) {
      html = html.replace(rule.re, rule.to);
      stats[rule.name] += hits;
    }
  }
  if (html !== before && html.includes('name:"search_site"') && !html.includes('name:"brand_info"')) {
    html = html.replace(toolPattern, toolScript);
    stats.aiTools += 1;
  }
  if (html === before) continue;
  stats.files += 1;
  if (write) fs.writeFileSync(file, html, 'utf8');
}

console.log(`${write ? 'WROTE' : 'DRY-RUN'} brand/AI normalization`);
console.log(JSON.stringify(stats, null, 2));
