'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { HelpLang } from '@/lib/helpTranslations';
import { hT, HELP_T } from '@/lib/helpTranslations';
import { HelpSearch } from './HelpSearch';
import { HelpCategories } from './HelpCategories';
import { HelpPopular } from './HelpPopular';
import { HelpContact } from './HelpContact';
import { HelpLangSwitcher } from './HelpLangSwitcher';

export function HelpHome() {
  const [lang, setLang] = useState<HelpLang>('fr');
  const t = (key: string) => hT(lang, key);

  const CATS = ['getting-started', 'documents', 'billing', 'legal', 'troubleshooting', 'account'] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Lang switcher */}
      <div className="flex justify-end mb-4">
        <HelpLangSwitcher current={lang} onChange={setLang} />
      </div>

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3" style={{ color: '#1E40AF' }}>
          {t('title')}
        </h1>
        <p className="text-[13px] text-[#666] max-w-lg mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Search */}
      <HelpSearch lang={lang} />

      {/* Categories */}
      <section className="mt-10">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#999] mb-4">{t('exploreByCategory')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATS.map((cat) => (
            <Link
              key={cat}
              href={`/help/${cat}`}
              className="group flex items-start gap-3 p-4 rounded-xl border border-[#E4E0D8] hover:border-[#C4A35A] hover:shadow-sm transition bg-white"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg, #1E40AF10, #1E40AF08)' }}>
                {HELP_T[lang].categories[cat].icon}
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-[#161616] group-hover:text-[#1E40AF] transition">
                  {HELP_T[lang].categories[cat].title}
                </div>
                <div className="text-[11px] text-[#999] mt-0.5">
                  {HELP_T[lang].categories[cat].desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular articles */}
      <section className="mt-12">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#999] mb-4">{t('popularArticles')}</h2>
        <HelpPopular lang={lang} />
      </section>

      {/* Contact */}
      <section className="mt-12">
        <HelpContact lang={lang} />
      </section>
    </div>
  );
}
