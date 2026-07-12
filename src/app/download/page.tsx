// ============================================================
// رقمنة — App download page (/download)
// Server component: renders a direct Android APK button and a
// scan-to-download QR (generated server-side, zero client JS).
// Drop the built APK at public/rakmana.apk to serve it, or set
// NEXT_PUBLIC_APK_URL in Vercel to point to your CDN.
// ============================================================

import Link from 'next/link';
import QRCode from 'qrcode';

export const metadata = {
  title: 'تحميل رقمنة — تطبيق Android',
  description: 'حمّل تطبيق رقمنة لإنشاء فواتيرك وعروض أسعارك من هاتفك — حتى بدون إنترنت.',
};

// Direct APK download — set NEXT_PUBLIC_APK_URL in Vercel env vars to point to your CDN/storage.
// Falls back to serving the APK from /public/rakmana.apk (place the built file there).
const APK_URL = process.env.NEXT_PUBLIC_APK_URL ?? '/rakmana.apk';

export default async function DownloadPage() {
  const qrSvg = await QRCode.toString(APK_URL, {
    type: 'svg', margin: 1, width: 190,
    color: { dark: '#0F2747', light: '#FFFFFF' },
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 28 }}>
          {/* Icon: ر letter in green rounded square */}
          <span style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #1a6b3c 0%, #22c55e 100%)',
            color: '#fff', fontWeight: 800, fontSize: 22,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'serif', letterSpacing: '-0.02em',
          }}>ر</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--sand)', fontFamily: 'serif' }}>رقمنة</span>
        </Link>

        <div style={{ background: 'var(--navy-2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '32px 24px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--sand)', margin: 0 }}>
            تحميل التطبيق
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sand-muted)', marginTop: 8, marginBottom: 24, lineHeight: 1.6 }}>
            فواتير، عروض أسعار وسندات التسليم — من هاتفك، حتى بدون إنترنت.
          </p>

          {/* QR — scan to download */}
          <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 16, lineHeight: 0, boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}
               dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p style={{ fontSize: 12, color: 'var(--sand-muted)', marginTop: 12, marginBottom: 24 }}>
            امسح هذا الرمز بهاتفك
          </p>

          {/* Direct button */}
          <a
            href={APK_URL}
            download="rakmana.apk"
            data-plausible="App Download"
            data-event-location="download_page"
            data-event-label="Android APK"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', minHeight: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #1a6b3c 0%, #22c55e 100%)',
              color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            تحميل للأندرويد
          </a>

          {/* Install steps */}
          <div style={{ textAlign: 'right', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sand-muted)', marginBottom: 10 }}>
              طريقة التثبيت
            </p>
            <ol style={{ margin: 0, paddingInlineEnd: 18, fontSize: 13, color: 'var(--sand)', lineHeight: 1.9, direction: 'rtl' }}>
              <li>حمّل الملف <code style={{ color: '#4ade80' }}>.apk</code></li>
              <li>افتحه وأجِز التثبيت من هذا المصدر</li>
              <li>افتح رقمنة وسجّل الدخول</li>
            </ol>
          </div>

          <p style={{ fontSize: 11, color: 'var(--sand-muted)', marginTop: 18 }}>
            Android 8.0+ · متوافق مع DGI الجزائر
          </p>
        </div>

        <Link href="/" style={{ display: 'inline-block', marginTop: 20, fontSize: 13, color: 'var(--sand-muted)', textDecoration: 'underline' }}>
          → العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
