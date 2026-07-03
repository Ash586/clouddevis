// ============================================================
// CloudDevis — App download page (/download)
// Server component: renders a direct Android APK button and a
// scan-to-download QR (generated server-side, zero client JS).
// Drop the built APK at public/clouddevis.apk to serve it.
// ============================================================

import Link from 'next/link';
import QRCode from 'qrcode';

export const metadata = {
  title: 'Télécharger CloudDevis — Application Android',
  description: 'Téléchargez l’application mobile CloudDevis pour créer vos devis, factures et bons de livraison depuis votre téléphone.',
};

// Direct-download link to the hosted APK on Google Drive.
// (Share link → direct download: drive.google.com/uc?export=download&id=<fileId>)
const APK_URL = 'https://drive.google.com/uc?export=download&id=1y9WWMJIaZzns6bRm6wHeWOZE43yB2sc-';

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
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--green-2)', color: '#fff', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>CD</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--sand)' }}>CloudDevis</span>
        </Link>

        <div style={{ background: 'var(--navy-2)', border: '1px solid rgba(15,39,71,0.08)', borderRadius: 20, padding: '32px 24px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--sand)', margin: 0 }}>
            Télécharger l’application
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sand-muted)', marginTop: 8, marginBottom: 24, lineHeight: 1.6 }}>
            Devis, factures et bons de livraison depuis votre téléphone — même hors ligne.
          </p>

          {/* QR — scan to download */}
          <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 16, lineHeight: 0, boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}
               dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <p style={{ fontSize: 12, color: 'var(--sand-muted)', marginTop: 12, marginBottom: 24 }}>
            Scannez ce code avec votre téléphone
          </p>

          {/* Direct button */}
          <a
            href={APK_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-plausible="App Download"
            data-event-location="download_page"
            data-event-label="Android APK"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', minHeight: 52, borderRadius: 14, background: 'var(--green-2)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Télécharger pour Android
          </a>

          {/* Install steps */}
          <div style={{ textAlign: 'left', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(15,39,71,0.08)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sand-muted)', marginBottom: 10 }}>
              Installation
            </p>
            <ol style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, color: 'var(--sand)', lineHeight: 1.9 }}>
              <li>Téléchargez le fichier <code style={{ color: 'var(--green-3)' }}>.apk</code></li>
              <li>Ouvrez-le et autorisez l’installation depuis cette source</li>
              <li>Ouvrez CloudDevis et connectez-vous</li>
            </ol>
          </div>

          <p style={{ fontSize: 11, color: 'var(--sand-muted)', marginTop: 18 }}>
            Android 8.0+ · Version iOS bientôt disponible
          </p>
        </div>

        <Link href="/" style={{ display: 'inline-block', marginTop: 20, fontSize: 13, color: 'var(--sand-muted)', textDecoration: 'underline' }}>
          ← Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
