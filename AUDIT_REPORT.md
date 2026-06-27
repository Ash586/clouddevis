# CloudDevis — تقرير التدقيق الشامل
> 15 محوراً · ~135 مشكلة · مُصنّفة حسب الأولوية مع الإصلاح البرمجي
> التاريخ: 2026-06-26

---

## 🔴 حرج (Critical) — يجب إصلاحه فوراً قبل الإطلاق

### C1 — أسرار الإنتاج مكشوفة في `.env` المُلتزَم بـ git
**الموقع:** `.env:9,11`
```bash
DATABASE_URL="postgresql://neondb_owner:npg_0Tz8YlFqdiSx@...neon.tech/neondb"
JWT_SECRET="XaXJ0/h1UGiIKKw3UGnCyWVdMPcP09PUJgQ7CpadBsvo9CvVosXQitArjM4OK/CJu1YpBLyq3UUIOj+gUn5GQg=="
```
**الإصلاح (فوري، بالترتيب):**
```bash
# 1. ألغِ كلمة مرور Neon من dashboard وأنشئ جديدة
# 2. ولّد JWT_SECRET جديداً (يُبطل كل الجلسات)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# 3. أزل .env من git
git rm --cached .env
echo ".env" >> .gitignore
# 4. نظّف history (BFG أو filter-repo)
git filter-repo --path .env --invert-paths
# 5. أعد الأسرار عبر Vercel Environment Variables فقط
```

---

### C2 — لا خط عربي في مولّد الـ PDF (المخرجات العربية معطوبة)
**الموقع:** `src/lib/generateDocumentHTML.ts:340,554,627,693,758`
كل القوالب تحمّل خطوطاً لاتينية فقط، بينما `totalInWords` (تفقيط عربي) و`sigClientNameAr` تُحقَن في الـ PDF → حروف متقطّعة/مربعات.
**الإصلاح:** أضف خطاً عربياً وسلسلة fallback لكل قالب:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
```
```css
/* لكل سلسلة font-family، أضف الخط العربي fallback */
font-family: 'Cormorant Garamond', 'Noto Naskh Arabic', Georgia, serif;
/* وللعناصر العربية صراحةً */
.ar, [lang="ar"] { font-family: 'Noto Naskh Arabic', serif; direction: rtl; }
```

---

### C3 — الطباعة تقع قبل تحميل الخطوط
**الموقع:** `src/lib/generateDocumentHTML.ts:303,528,601,667,730`
```javascript
window.onload=function(){setTimeout(function(){window.print();},300);};
```
**الإصلاح:** انتظر تحميل الخطوط فعلياً:
```javascript
window.onload=function(){
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function(){ setTimeout(window.print, 50); });
  } else { setTimeout(window.print, 500); }
};
```

---

### C4 — لا `dir="rtl"` في PDF (ترتيب bidi معكوس للعربية)
**الموقع:** كل `<html lang="fr">` في `generateDocumentHTML.ts:552,625,691`
**الإصلاح:** غلّف العناصر العربية بـ `dir="rtl"`:
```html
<div class="inwords" dir="rtl" lang="ar">${e(results.totalInWords)}</div>
```

---

### C5 — لا CSRF على نقاط المصادقة
**الموقع:** `src/app/api/auth/{login,register,forgot-password,reset-password}/route.ts` — تستخدم `postHandler` مباشرة بلا `requireCsrf`.
**الأثر:** هجوم spam على `forgot-password` لأي بريد.
**الإصلاح:** استدعِ `requireCsrf(req)` في بداية كل handler:
```typescript
import { requireCsrf } from '@/lib/csrf';
async function postHandler(req: Request) {
  requireCsrf(req);   // ← أضف هذا
  // ...
}
```

---

### C6 — `withAuth` لا يتحقق من الحظر (suspended)
**الموقع:** `src/lib/auth.ts:138-147`
المستخدم المحظور يُكمل استخدام جلسته القائمة 7-30 يوماً.
**الإصلاح:** استبدل `getSession` بـ `getActiveSession`:
```typescript
export function withAuth(handler: AuthenticatedHandler): any {
  return async (req: NextRequest, ctx?: Record<string, unknown>) => {
    requireCsrf(req);
    const session = await getActiveSession();  // ← بدل getSession
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return handler(req, session, ctx);
  };
}
```

---

### C7 — لا إبطال JWT عند تغيير كلمة المرور
**الموقع:** `src/app/api/auth/reset-password/route.ts:43`
**الإصلاح:** أضف `tokenVersion` في موديل User، ضمّنه في JWT، وزِده عند التغيير:
```prisma
model User { tokenVersion Int @default(0) }
```
```typescript
// reset-password — بعد تحديث كلمة المرور:
await prisma.user.update({ where: { id: resetToken.userId },
  data: { password: hashed, tokenVersion: { increment: 1 } } });
// getSession — تحقق أن payload.tokenVersion == user.tokenVersion
```

---

### C8 — الطابع الجبائي يتجاهل طريقة الدفع
**الموقع:** `src/lib/dgi.ts:172-182`
حق الطابع يُطبَّق قانونياً على المدفوعات النقدية فقط، لكن الكود يطبّقه على virement/chèque أيضاً.
**الإصلاح:**
```typescript
export function shouldApplyTimbre(documentType: string, totalTTC: number, paymentMode: string): boolean {
  const exempt = ['devis','attachement'];
  if (exempt.includes(documentType.toLowerCase())) return false;
  if (paymentMode !== 'especes' && paymentMode !== 'cash') return false; // ← نقد فقط
  return totalTTC >= TIMBRE_FISCAL_THRESHOLD;
}
```

---

### C9 — معدل TVA واحد للوثيقة (لا ventilation متعدد)
**الموقع:** `src/lib/calculations.ts:28` · `src/types/index.ts:54-62` (LineItem بلا tvaRate)
فاتورة بـ 9% و19% معاً مستحيلة — مخالفة لمتطلب جدول تفصيل TVA.
**الإصلاح:** أضف `tvaRate` لكل سطر واحسب الـ ventilation:
```typescript
interface LineItem { /* ... */ tvaRate: number; }
// في calculateDocument: جمّع HT و TVA لكل معدّل
const byRate: Record<number, {ht:number, tva:number}> = {};
for (const it of doc.items) {
  const ht = it.quantity * it.unitPrice;
  byRate[it.tvaRate] ??= {ht:0, tva:0};
  byRate[it.tvaRate].ht += ht;
  byRate[it.tvaRate].tva += ht * it.tvaRate/100;
}
// اعرض جدول ventilation في الـ PDF
```

---

### C10 — محرّكان حسابيان متباعدان (Web ≠ Mobile)
**الموقع:** `src/lib/calculations.ts:calculateDocument` vs `src/lib/dgi.ts:calculateDocumentTotals`
الويب يتجاهل per-item TVA؛ الموبايل يتجاهل الخصم → مجاميع مختلفة لنفس الوثيقة.
**الإصلاح:** وحّد على محرّك واحد في `dgi.ts` يدعم (per-item TVA + discount + timbre + acompte)، واجعل `calculateDocument` غلافاً له.

---

### C11 — `Document.number` بلا قيد تفرّد
**الموقع:** `prisma/schema.prisma` (موديل Document)
رقمان متطابقان ممكنان لنفس المستخدم.
**الإصلاح:**
```prisma
model Document { /* ... */ @@unique([userId, number]) }
```
```bash
npx prisma migrate dev --name unique_doc_number
```

---

### C12 — 93% من الـ API بلا Rate Limiting
**الموقع:** 67 من 72 route بلا `checkRateLimit`. الأخطر: `POST /api/export` يقبل مصفوفة `ids` بلا حدّ.
**الإصلاح:** غلاف rate-limit عام + حدّ على المدخلات:
```typescript
// export/route.ts
if (!Array.isArray(ids) || ids.length > 200)
  return NextResponse.json({ error: 'Max 200 documents' }, { status: 400 });
const rl = await checkRateLimit(`export:${session.userId}`, 10, 60000);
if (!rl.allowed) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
```
وفعّل Upstash Redis (`UPSTASH_REDIS_REST_URL`) ليكون الحدّ موزّعاً على Vercel.

---

### C13 — البيانات الجبائية والمصرفية نص صريح في DB
**الموقع:** `prisma/schema.prisma` (Client.nif/nis/rc/ai، Company، Document._editorMeta.iban/rib/ccp)
**الإصلاح:** تشفير تطبيقي deterministic (للسماح بالبحث) عبر `pgcrypto` أو طبقة AES-256-GCM:
```typescript
// lib/crypto.ts — AES-256-GCM مع مفتاح من ENV (ليس في git)
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
const KEY = Buffer.from(process.env.FIELD_ENCRYPTION_KEY!, 'hex');
export function encryptField(v: string){ const iv=randomBytes(12);
  const c=createCipheriv('aes-256-gcm',KEY,iv); const e=Buffer.concat([c.update(v,'utf8'),c.final()]);
  return iv.toString('hex')+':'+c.getAuthTag().toString('hex')+':'+e.toString('hex'); }
// طبّقه في Prisma middleware على حقول nif/nis/rc/ai/iban
```
> ملاحظة: التشفير يتعارض مع `@@index([userId,nif])` للبحث `contains` — استخدم blind-index منفصل أو tokenization.

---

## 🟠 عالي (High)

### H1 — Race condition في upsert العميل
**الموقع:** `src/app/api/clients/route.ts:82-119`
**الإصلاح:** استبدل find-then-create بـ upsert ذرّي:
```typescript
const client = await prisma.client.upsert({
  where: { userId_name: { userId: session.userId, name: trimmedName } },
  update: { address, phone, email, nif, nis, rc, ai },
  create: { userId: session.userId, name: trimmedName, address, phone, email, nif, nis, rc, ai },
});
// يتطلب @@unique([userId, name]) في schema
```

### H2 — TOCTOU في 8 endpoints (check ثم write بلا userId)
**الموقع:** `documents/[id]`, `clients/[id]`, `templates/[id]` (PUT/DELETE)
**الإصلاح:** اجعل العملية ذرّية:
```typescript
const r = await prisma.document.deleteMany({ where: { id, userId: session.userId } });
if (r.count === 0) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
```

### H3 — Share endpoint يكشف وجود وثائق الآخرين (403 vs 404)
**الموقع:** `src/app/api/documents/[id]/share/route.ts:15,48,72`
**الإصلاح:** أعد 404 موحّدة بدل التمييز، واجلب بـ userId:
```typescript
const document = await prisma.document.findFirst({ where: { id, userId: session.userId } });
if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
```

### H4 — `reports` يجمّع بـ timestamp كامل بدل الشهر
**الموقع:** `src/app/api/reports/route.ts:57` (`groupBy: ['createdAt']`)
**الإصلاح:** استخدم `$queryRaw` آمن مع `DATE_TRUNC`:
```typescript
const monthly = await prisma.$queryRaw`
  SELECT DATE_TRUNC('month',"createdAt") m, SUM("totalTTC") rev, COUNT(*) cnt
  FROM "Document" WHERE "userId"=${session.userId} AND "createdAt">=${startDate}
  GROUP BY m ORDER BY m ASC`;
```

### H5 — `reports` يجلب 500 وثيقة لحساب أفضل العملاء
**الموقع:** `src/app/api/reports/route.ts:73` (`findMany({take:500})`)
**الإصلاح:** `groupBy(['clientId'])` في SQL بدل الجلب والحساب في JS.

### H6 — DocumentPreview بلا React.memo (إعادة رسم كل ضغطة)
**الموقع:** `src/components/editor/DocumentPreview.tsx:30` · يُستدعى في `editor/page.tsx:752`
**الإصلاح:**
```typescript
export const DocumentPreview = React.memo(function DocumentPreview({...}: Props) {...});
// + غلّف results بـ useMemo في الأب (موجود جزئياً)
```

### H7 — DashboardLayout يطلب `/api/auth/me` عند كل تنقل
**الموقع:** `src/app/dashboard/layout.tsx:11`
**الإصلاح:** تحقق من الجلسة في Server Component / middleware بدل fetch من العميل:
```typescript
// dashboard/layout.tsx → Server Component
import { getActiveSession } from '@/lib/auth';
export default async function Layout({children}) {
  const s = await getActiveSession();
  if (!s) redirect('/auth/login');
  return <>{children}</>;
}
```

### H8 — لا Cache-Control على أي API
**الموقع:** كل routes تُعيد `NextResponse.json()` خام.
**الإصلاح:** للبيانات القابلة للتخزين:
```typescript
return NextResponse.json(data, { headers: {
  'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }});
```

### H9 — Google Fonts بـ `@import` (render-blocking) + لا offline
**الموقع:** `src/app/landing.css:1`, `src/app/admin/admin.css:1`
**الإصلاح:** استخدم `next/font/google` (يستضيف محلياً + `display:swap` + preload):
```typescript
import { Sora, DM_Sans } from 'next/font/google';
const sora = Sora({ subsets:['latin'], weight:['400','700'], display:'swap' });
```

### H10 — مكتبتا أيقونات معاً (~1.1MB)
**الموقع:** `lucide-react` (33 ملف) + `@tabler/icons-react` (19 ملف)
**الإصلاح:** وحّد على مكتبة واحدة (lucide-react) واحذف tabler:
```bash
# استبدل كل tabler imports بـ lucide، ثم:
npm uninstall @tabler/icons-react
```

### H11 — لا PWA / Service Worker (شاشة بيضاء offline)
**الموقع:** لا `manifest.webmanifest` ولا SW في `public/`
**الإصلاح:** أضف `@ducanh2912/next-pwa` أو SW يدوياً يخزّن الـ shell + API الأساسية.

### H12 — البنية offline موجودة لكن غير مربوطة بالويب
**الموقع:** `syncStore`, `useNetwork`, `OfflineBanner` مربوطة بـ `MobileShell` فقط.
**الإصلاح:** اربط `useEditorActions.saveDoc` بـ `syncStore.enqueue` عند فشل الشبكة، وأضف `<OfflineBanner>` في `dashboard/layout`.

### H13 — رسائل التحقق (validation) فرنسية مشفّرة للعربي
**الموقع:** `src/lib/validation.ts:24-93`
**الإصلاح:** أعد مفاتيح i18n بدل النصوص:
```typescript
errors.nif = 'validation.nifInvalid';  // المفتاح
// والعميل/الـ API يترجمه عبر t()
```

### H14 — API catch بلا return (spinner لا ينتهي)
**الموقع:** `documents/route.ts:108,324`, `clients/route.ts:64` — بعضها `throw` بلا response مفهوم.
**الإصلاح:** أعد رسالة موحّدة:
```typescript
} catch (error) {
  logger.error('...', { error: String(error) });
  return NextResponse.json({ error: 'api.internalError' }, { status: 500 });
}
```

### H15 — Rate limiter غير موزّع + sliding window معيب
**الموقع:** `src/lib/rateLimit.ts:78` (`entry.resetAt = now + windowMs` يمدد النافذة)
**الإصلاح:** fixed window + Upstash:
```typescript
// لا تُحدّث resetAt عند كل طلب — ثبّت النافذة
if (!entry || now > entry.resetAt) { rateMap.set(key,{count:1,resetAt:now+windowMs}); ... }
else { entry.count++; }  // بدون تحديث resetAt
```

### H16 — `doc.date` بلا هروب في PDF (XSS)
**الموقع:** `src/lib/generateDocumentHTML.ts:431,438`
**الإصلاح:** `${e(doc.date)}` بدل `${doc.date}`.

### H17 — لا Content-Security-Policy
**الموقع:** `next.config.ts:headers()`
**الإصلاح:**
```typescript
{ key: 'Content-Security-Policy', value:
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'" }
```

### H18 — تباين ألوان gold/teal يرسب WCAG AA
**الموقع:** `globals.css:50,53` (`--gold #C77D11` ~3.3:1، `--teal #0EA5E9` ~2.9:1)
**الإصلاح:** غمّق للنصوص:
```css
--gold: #A8650B;   /* ~4.6:1 على أبيض */
--teal-text: #0C7AAD; /* للنصوص؛ أبقِ الأصلي للزخارف */
```

### H19 — تضارب أبعاد A4 في PDF (صفحة فارغة)
**الموقع:** `generateDocumentHTML.ts:555,628,694,759` (`width:190mm` بلا `@page`)
**الإصلاح:** وحّد كل القوالب:
```css
@page { size: A4; margin: 0 }
.page { width: 210mm; min-height: 297mm; padding: 12mm; }
```

### H20 — `stampDuty` كود ميّت
**الموقع:** `documents/route.ts:169,205` يمرّره، `calculations.ts` يتجاهله.
**الإصلاح:** إمّا استخدمه فعلياً في الحساب (مع C8) أو احذفه كلياً من المدخلات والـ `_editorMeta`.

---

## 🟡 متوسط (Medium)

### M1 — تكرار 60 سطر `_editorMeta` في ملفين
**الموقع:** `documents/route.ts:POST` + `documents/[id]/route.ts:PUT`
**الإصلاح:** استخرج `buildEditorMeta(doc)` في `src/lib/editorMeta.ts` واستدعِه في الموضعين.

### M2 — `LineItem` model معرّف لكن غير مستخدم
**الموقع:** `prisma/schema.prisma` (LineItem) — البنود تُخزَّن كـ `JSON.stringify`.
**الإصلاح:** إمّا فعّل العلاقة واكتب البنود كصفوف، أو احذف الموديل لإزالة الالتباس.

### M3 — `total` كـ string locale في API response
**الموقع:** `documents/route.ts:97` (`toLocaleString`)
**الإصلاح:** أرسل الرقم الخام؛ نسّق في العميل:
```typescript
total: d.totalTTC,  // raw number — العميل يُنسّقه
```

### M4 — لا focus trap في Modal + لوحة مفاتيح المحرر
**الموقع:** `src/components/ui/modal.tsx`, rail المحرر بـ `<div onClick>`
**الإصلاح:** استخدم `<button>` للعناصر التفاعلية + focus trap (موجود جزئياً في modal.tsx:23).

### M5 — نقص ARIA (aria-live/expanded/describedby)
**الموقع:** عام عبر المكونات.
**الإصلاح:** أضف `aria-live="polite"` لحالات التحميل، `aria-describedby` لرسائل الأخطاء، `aria-expanded` للقوائم.

### M6 — خط `DM Sans` لا يدعم العربية في الواجهة
**الموقع:** `globals.css:147`
**الإصلاح:** أضف خطاً عربياً عند `lang="ar"`:
```css
:root[lang="ar"] body { font-family: 'Cairo','DM Sans',sans-serif; }
```

### M7 — RTL يستخدم margins مطلقة (ml/mr) لا منطقية
**الموقع:** مكونات متعددة.
**الإصلاح:** استبدل `ml-`/`mr-` بـ `ms-`/`me-` (logical properties).

### M8 — نصوص فرنسية مشفّرة (57 موضعاً، 20 ملفاً)
**الموقع:** `admin/*`, `ErrorFallback.tsx`, `TrialGate.tsx`, إلخ.
**الإصلاح:** مرّرها عبر `t()` وأضف مفاتيحها للـ messages.

### M9 — CSV Formula Injection في التصدير
**الموقع:** `src/app/api/export/route.ts`
**الإصلاح:** حيّد القيم البادئة بـ `= + - @`:
```typescript
const safe = (v: string) => /^[=+\-@]/.test(v) ? `'${v}` : v;
```

### M10 — أخطاء إملائية في التفقيط الفرنسي
**الموقع:** `src/lib/dgi.ts:336-353` (quatre-vingts/cents بلا 's')
**الإصلاح:** أضف قواعد جمع "vingt"/"cent" النهائية.

### M11 — صفر اختبارات للمحرك المالي
**الموقع:** لا `*.test.ts` تختبر TVA/timbre.
**الإصلاح:** أضف `calculations.test.ts` يغطّي: timbre حسب نوع/مبلغ/دفع، TVA 9/19، الخصم، التقريب.

### M12 — صفحات ثابتة تُعالج ديناميكياً
**الموقع:** `/legal/*`, `/pricing`, `/help/faq` (كلها ƒ).
**الإصلاح:** `export const revalidate = 3600;` أو `dynamic = 'force-static'`.

### M13 — Backup endpoint وهمي
**الموقع:** `src/app/api/admin/system/backup/route.ts`
**الإصلاح:** نفّذ نسخاً فعلياً (pg_dump عبر job) أو أزل الزر لتجنّب الإيهام.

### M14 — Logo Base64 (685KB) في كل response
**الموقع:** `Company.logo`, `dashboard/route.ts:41` (companyInfo)
**الإصلاح:** خزّن الصور في Blob storage (Vercel Blob) واحفظ URL فقط؛ لا تُرسل Base64 في dashboard.

### M15 — 5 round-trips متسلسلة في POST /documents
**الموقع:** `documents/route.ts:POST`
**الإصلاح:** اجمع العمليات في `prisma.$transaction([...])`.

### M16 — JWT يحمل subscriptionStatus (stale)
**الموقع:** `src/lib/auth.ts:46`
**الإصلاح:** اقرأ الحالة من DB في نقاط القرار الحرجة بدل الاعتماد على JWT.

### M17 — Team documents غير مرئية في /api/documents
**الموقع:** `documents/route.ts:GET` (where userId فقط)
**الإصلاح:** أضف `OR` لوثائق الـ teams التي ينتمي إليها المستخدم.

---

## 🟢 منخفض (Low)

- **L1** — 125 مفتاح FR=EN متطابق (Email/Total) — مقبول لكن راجع المقصود.
- **L2** — `logout` لا يُبطل JWT (لا blacklist) — يتطلب token store؛ مؤجّل.
- **L3** — Token fallback في query string (`?token=`) — أزل الـ fallback، أبقِ `#token` فقط (`reset-password/page.tsx:20`).
- **L4** — Drag handles بلا دعم لوحة مفاتيح.
- **L5** — لا `next/image` (لا WebP/lazy).
- **L6** — لا API versioning (`/api/v1/`).
- **L7** — Scrollbar غير accessible.
- **L8** — لا data-retention/anonymization policy (GDPR).
- **L9** — `framer-motion` كـ shared chunk ثقيل — حمّله ديناميكياً حيث يلزم.
- **L10** — ذكر إلزامي ناقص في الفاتورة (رقم/تاريخ صريح) — راجع نموذج DGI.

---

## ملخص العدّ

| الأولوية | العدد | الطبيعة |
|---------|------|---------|
| 🔴 حرج | 13 | أمان + امتثال + بيانات معطوبة |
| 🟠 عالي | 20 | أداء + UX + أمان متوسط |
| 🟡 متوسط | 17 | تقنية + تنسيق + i18n |
| 🟢 منخفض | 10 | لمسات مستقبلية |
| **الإجمالي** | **~60 مجمّعة** (135 ملاحظة مفصّلة) | |

## ترتيب التنفيذ المقترح
1. **اليوم:** C1 (تدوير الأسرار) — لا يحتمل التأجيل.
2. **الأسبوع 1:** C5–C7, C12 (أمان) + C2–C4 (PDF عربي).
3. **الأسبوع 2:** C8–C11, C13 (امتثال + بيانات) + H1–H5 (DB).
4. **الأسبوع 3:** H6–H12 (أداء + offline).
5. **لاحقاً:** Medium + Low.
