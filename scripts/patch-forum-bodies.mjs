/**
 * Adds the original question body to every topic and drops the placeholder
 * "views" field (a real 0 is still fake data - the live layer owns that).
 */
import { readFile, writeFile } from 'node:fs/promises'

const P = 'data/forum.json'
const d = JSON.parse(await readFile(P, 'utf8'))

const bodies = {
  visitors:
    'شفت الأعضاء صفتهم «عضوية دائمة» وأنا زائر، كيف أدخل كزائر وما هي طريقة ترقية الصفة؟',
  entry: 'ما الطريقة الصحيحة للدخول إلى الشات من الجوال؟ سمعت أن هناك طريقة دخول سريعة بدون تحميل برامج.',
  register: 'أريد إنشاء عضوية جديدة، ما هي البيانات المطلوبة وكم تستغرق عملية التسجيل؟',
  activate: 'سجّلت عضوية أمس ولم يتم تفعيلها بعد، متى يتم التفعيل وكم يستغرق؟',
  panel: 'عندما أدخل الشات تخرج لوحة الدردشة ولا تظهر لي، ما الحل؟',
  banned: 'ظهرت لي رسالة «لقد تم حظرك من الدردشة» بدون سبب واضح، ماذا أفعل؟',
  'delete-account': 'أبحث عن طريقة حذف العضوية، ماذا عليّ أن أفعل؟'
}

let touched = 0
for (const t of d.topics) {
  if (bodies[t.id] === undefined) throw new Error('no body written for topic ' + t.id)
  t.body = bodies[t.id]
  delete t.views
  touched++
}

await writeFile(P, JSON.stringify(d, null, 2) + '\n', 'utf8')
console.log('topics patched: ' + touched)

// re-verify the text survived the round trip
const check = JSON.parse(await readFile(P, 'utf8'))
for (const t of check.topics) {
  const bad = t.body.match(/[A-Za-z]{2,}/g)
  console.log(
    (bad ? 'LATIN! ' : 'ok  ') + t.id.padEnd(16) + ' | ' + t.body.slice(0, 52)
  )
}
