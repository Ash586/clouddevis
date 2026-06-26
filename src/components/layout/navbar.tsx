'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/hooks/useUser';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Menu, X, Home } from 'lucide-react';

const LANG_LABELS: Record<string, string> = { fr: 'FR', ar: 'AR', en: 'EN' };
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
      <Button variant="outline" size="sm" className="bg-[rgba(15,39,71,0.06)] border-[rgba(15,39,71,0.1)] text-[var(--sand)] hover:bg-[rgba(15,39,71,0.1)]" onClick={() => { router.push('/dashboard'); setMobileOpen(false); }}>
        <Home size={15} />
        {t('dashboard')}
      </Button>
      <div className="flex flex-col md:flex-row items-center gap-3">
        <span className="text-[11px] text-[var(--sand-muted)] font-medium">{user.name}</span>
        <button type="button" onClick={handleLogout} className="text-[11px] text-red-400 font-semibold hover:text-red-300 bg-red-400/10 px-3 py-1.5 rounded-lg w-full md:w-auto text-center transition-all min-h-[44px]">
          {t('logout')}
        </button>
      </div>
    </>
  ) : (
    <>
      <a href="/auth/login" onClick={() => setMobileOpen(false)} className="block md:inline text-[13px] text-[var(--sand-muted)] hover:text-[var(--sand)] font-medium text-center md:text-left transition-colors min-h-[44px] flex items-center justify-center md:min-h-0">{t('login')}</a>
      <Button size="sm" variant="primary" onClick={() => { router.push('/auth/register'); setMobileOpen(false); }}>{t('signup')}</Button>
    </>
  );

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-[var(--navy)]/85 backdrop-blur-xl border-b border-[rgba(15,39,71,0.08)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-2.5 no-underline shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--green)] to-[var(--teal)] flex items-center justify-center font-sora font-extrabold text-white text-sm">C</div>
            <span className="text-lg sm:text-xl font-sora font-extrabold text-[var(--sand)] tracking-tight hidden sm:inline">CloudDevis</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center gap-6">
              {links}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 sm:pl-6 sm:border-l border-[rgba(15,39,71,0.1)]">
              <button type="button"                 onClick={() => {
                  const next = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
                  setLang(next);
                }}
                className="text-[11px] font-bold uppercase tracking-wider leading-none px-2 py-1.5 rounded-lg transition-all bg-[var(--navy-3)] text-[var(--sand)] hover:bg-[var(--navy-4)] min-h-[36px]"
                title={lang === 'fr' ? t('langFr') : lang === 'ar' ? t('langAr') : t('langEn')}
              >
                {LANG_LABELS[lang]}
              </button>

              {user && <NotificationBell />}

              <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[var(--sand-muted)] hover:text-[var(--sand)] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Sheet */}
      {mobileOpen && (
        <div className="md:hidden mobile-bottom-sheet" onClick={() => setMobileOpen(false)}>
          <div className="sheet-overlay" />
          <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="p-5 space-y-3">
              {links}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
