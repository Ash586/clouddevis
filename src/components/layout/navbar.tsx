'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const FLAGS: Record<string, string> = { fr: '🇫🇷', ar: '🇩🇿', en: '🇬🇧' };
const LANGS = ['fr', 'ar', 'en'] as const;

export function Navbar() {
  const t = useTranslations('navbar');
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUser(data?.user ?? null); })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-lg font-black text-blue-600 tracking-tight">CloudDevis</a>

        <div className="flex items-center gap-2">
          {LANGS.map(l => (
            <button key={l}
              onClick={() => setLang(l)}
              className={`text-base leading-none px-1.5 py-1 rounded-md transition-opacity ${
                lang === l ? 'opacity-100 ring-1 ring-slate-300 bg-slate-100' : 'opacity-50 hover:opacity-80'
              }`}
              title={l === 'fr' ? t('langFr') : l === 'ar' ? t('langAr') : t('langEn')}>
              {FLAGS[l]}
            </button>
          ))}

          {loading ? null : user ? (
            <>
              <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 shadow-none" onClick={() => router.push('/dashboard')}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                {t('dashboard')}
              </Button>
              <Button size="sm" onClick={() => router.push('/dashboard/editor')}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {t('newDoc')}
              </Button>
              <span className="text-xs text-slate-400 font-medium">{user.name}</span>
              <button onClick={handleLogout} className="text-xs text-red-500 font-semibold hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <a href="/auth/login" className="text-sm text-slate-500 hover:text-slate-800 font-medium">{t('login')}</a>
              <Button size="sm" onClick={() => router.push('/auth/register')}>{t('signup')}</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
