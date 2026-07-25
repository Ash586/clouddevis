import type { Metadata } from 'next';
import { Inter, Montserrat, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import './rtl.css';
import './landing.css';
import { I18nClientProvider } from '@/contexts/I18nClientProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import { PageViewTracker } from '@/components/tracking/PageViewTracker';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { SentryActionRecorder } from '@/components/errors/SentryActionRecorder';
import { SentryUserContext } from '@/components/errors/SentryUserContext';
import { cookies } from 'next/headers';
import { PLAUSIBLE_DOMAIN } from '@/lib/analytics';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], display: 'swap', variable: '--font-montserrat', weight: ['400', '500', '600', '700', '800'] });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-playfair', style: ['normal', 'italic'], weight: ['400', '600', '700'] });
const cormorantGaramond = Cormorant_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-cormorant', style: ['normal', 'italic'], weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: {
    default: 'Rakmana — Devis & Factures conformes',
    template: '%s | Rakmana',
  },
  description: 'Générez vos devis et factures conformes à la réglementation algérienne. NIF, RC, NIS, AI, TVA 9/19% et Timbre fiscal automatique.',
  keywords: ['devis', 'facture', 'algérie', 'artisan', 'PME', 'TVA', 'timbre fiscal', 'NIF', 'RC', 'NIS'],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Rakmana — Devis & Factures conformes',
    description: 'Générez vos devis et factures conformes à la réglementation algérienne.',
    url: 'https://clouddevis.vercel.app',
    siteName: 'Rakmana',
    locale: 'fr_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rakmana — Devis & Factures conformes',
    description: 'Générez vos devis et factures conformes à la réglementation algérienne.',
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'fr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={locale} dir={dir} data-theme="light" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen antialiased flex flex-col">
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', background: '#0B0F1A', color: '#F5EDD6' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>JavaScript requis</h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
              Pour une expérience optimale, veuillez activer JavaScript dans votre navigateur.
              <br />Rakmana nécessite JavaScript pour le rendu en temps réel de vos documents.
            </p>
          </div>
        </noscript>
        <ThemeProvider initialTheme="light">
          <I18nClientProvider initialLocale={locale}>
            <AppErrorBoundary>
              <ToastProvider>
                {children}
              </ToastProvider>
              <SentryActionRecorder />
              <SentryUserContext />
            </AppErrorBoundary>
            <PageViewTracker />
          </I18nClientProvider>
        </ThemeProvider>
        <Script defer data-domain={PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); }`}
        </Script>
      </body>
    </html>
  );
}
