'use client';

import { type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageProvider, useLanguage } from './LanguageContext';

import fr from '../../messages/fr.json';
import ar from '../../messages/ar.json';
import en from '../../messages/en.json';

const MESSAGES: Record<string, Record<string, unknown>> = { fr, ar, en };

function I18nInner({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  return (
    <NextIntlClientProvider locale={lang} messages={MESSAGES[lang]}>
      {children}
    </NextIntlClientProvider>
  );
}

export function I18nClientProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: string }) {
  return (
    <LanguageProvider initialLang={(initialLocale as 'fr' | 'ar' | 'en') || 'fr'}>
      <I18nInner>{children}</I18nInner>
    </LanguageProvider>
  );
}
