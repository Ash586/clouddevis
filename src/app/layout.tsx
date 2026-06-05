import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './rtl.css';
import { I18nClientProvider } from '@/contexts/I18nClientProvider';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'CloudDevis — Devis & Factures conformes',
    template: '%s | CloudDevis',
  },
  description: 'Générez vos devis et factures conformes à la réglementation algérienne. NIF, RC, NIS, AI, TVA 9/19% et Timbre fiscal automatique.',
  keywords: ['devis', 'facture', 'algérie', 'artisan', 'PME', 'TVA', 'timbre fiscal', 'NIF', 'RC', 'NIS'],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'CloudDevis — Devis & Factures conformes',
    description: 'Générez vos devis et factures conformes à la réglementation algérienne.',
    url: 'https://clouddevis.vercel.app',
    siteName: 'CloudDevis',
    locale: 'fr_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CloudDevis — Devis & Factures conformes',
    description: 'Générez vos devis et factures conformes à la réglementation algérienne.',
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'fr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col">
        <I18nClientProvider initialLocale={locale}>{children}</I18nClientProvider>
      </body>
    </html>
  );
}
