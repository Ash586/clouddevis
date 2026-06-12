'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/hooks/useUser';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const FLAGS: Record<string, string> = { fr: '🇫🇷', ar: '🇩🇿', en: '🇬🇧' };
const LANGS = ['fr', 'ar', 'en'] as const;

export function Navbar() {
  const t = useTranslations('navbar');
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { user, loading, refresh } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    refresh();
    router.push('/');
  }

  const links = loading ? null : user ? (
    <>
      <Button variant="outline" size="sm" className="bg-[rgba(245,237,214,0.06)] border-[rgba(245,237,214,0.1)] text-[var(--sand)] hover:bg-[rgba(245,237,214,0.1)]" onClick={() => { router.push('/dashboard'); setMobileOpen(false); }}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        {t('dashboard')}
      </Button>
      <div className="flex flex-col md:flex-row items-center gap-3">
        <span className="text-[11px] text-[var(--sand-muted)] font-medium">{user.name}</span>
        <button onClick={handleLogout} className="text-[11px] text-red-400 font-semibold hover:text-red-300 bg-red-400/10 px-3 py-1.5 rounded-lg w-full md:w-auto text-center transition-all">
          {t('logout')}
        </button>
      </div>
    </>
  ) : (
    <>
      <a href="/auth/login" onClick={() => setMobileOpen(false)} className="block md:inline text-[13px] text-[var(--sand-muted)] hover:text-[var(--sand)] font-medium text-center md:text-left transition-colors">{t('login')}</a>
      <Button size="sm" variant="primary" onClick={() => { router.push('/auth/register'); setMobileOpen(false); }}>{t('signup')}</Button>
    </>
  );

  return (
    <nav className="sticky top-0 z-[100] bg-[var(--navy)]/85 backdrop-blur-xl border-b border-[rgba(245,237,214,0.08)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--green)] to-[var(--teal)] flex items-center justify-center font-sora font-extrabold text-white text-sm">C</div>
          <span className="text-xl font-sora font-extrabold text-[var(--sand)] tracking-tight">CloudDevis</span>
        </a>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            {links}
          </div>

          <div className="flex items-center gap-2 pl-6 border-l border-[rgba(245,237,214,0.1)]">
            {LANGS.map(l => (
              <button key={l}
                onClick={() => setLang(l)}
                className={`text-sm leading-none px-2 py-1.5 rounded-lg transition-all ${
                  lang === l ? 'bg-[var(--navy-3)] text-[var(--sand)] ring-1 ring-[rgba(245,237,214,0.2)]' : 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[rgba(245,237,214,0.05)]'
                }`}
                title={l === 'fr' ? t('langFr') : l === 'ar' ? t('langAr') : t('langEn')}>
                {FLAGS[l]}
              </button>
            ))}
            
            {user && <NotificationBell />}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[var(--sand-muted)] hover:text-[var(--sand)] -mr-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(245,237,214,0.08)] bg-[var(--navy-2)] px-6 py-6 space-y-4 shadow-2xl animate-in">
          {links}
        </div>
      )}
    </nav>
  );
}
