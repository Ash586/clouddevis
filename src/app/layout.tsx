import type { Metadata } from 'next';
import './globals.css';
import './rtl.css';
import { I18nClientProvider } from '@/contexts/I18nClientProvider';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'CloudDevis — Devis & Factures conformes',
  description: 'Générez vos devis et factures conformes à la réglementation algérienne.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'fr';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col">
        <I18nClientProvider initialLocale={locale}>{children}</I18nClientProvider>
      </body>
    </html>
  );
}
