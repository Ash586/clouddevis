'use client';
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type Lang = 'fr' | 'ar' | 'en';

interface LangCtx {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (l: Lang) => void;
}

const Ctx = createContext<LangCtx>({ lang: 'fr', dir: 'ltr', setLang: () => {} });

function getCookieLang(): Lang | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  if (match && ['fr', 'ar', 'en'].includes(match[1])) return match[1] as Lang;
  return null;
}

function getStorageLang(): Lang | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('clouddevis-lang') as Lang | null;
  if (saved && ['fr', 'ar', 'en'].includes(saved)) return saved;
  return null;
}

function getInitialLang(): Lang {
  return getCookieLang() ?? getStorageLang() ?? 'fr';
}

function setLangCookie(l: Lang) {
  document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=${365*24*60*60}`;
}

export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? getInitialLang());

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setLangCookie(l);
    localStorage.setItem('clouddevis-lang', l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    const cookieLang = getCookieLang();
    if (cookieLang && cookieLang !== lang) {
      setLangState(cookieLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return <Ctx.Provider value={{ lang, dir, setLang }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  return useContext(Ctx);
}
