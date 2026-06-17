'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { HelpLang } from '@/lib/helpTranslations';
import { hT } from '@/lib/helpTranslations';
import { HelpFAQ } from '@/components/help/HelpFAQ';
import { HelpLangSwitcher } from '@/components/help/HelpLangSwitcher';

export default function FAQPage() {
  const [lang, setLang] = useState<HelpLang>('fr');
  const t = (key: string) => hT(lang, key);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Lang switcher */}
      <div className="flex justify-end mb-4">
        <HelpLangSwitcher current={lang} onChange={setLang} />
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-[#999] mb-6">
        <Link href="/help" className="hover:text-[#0B3D2E] transition">{t('helpCenter')}</Link>
        <span>/</span>
        <span className="text-[#161616] font-semibold">{t('faqTitle')}</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-[20px]" style={{ background: '#0B3D2E10' }}>
          ❓
        </div>
        <h1 className="text-xl font-black tracking-tight mb-2" style={{ color: '#0B3D2E' }}>{t('faqTitle')}</h1>
        <p className="text-[12px] text-[#999]">{t('faqSubtitle')}</p>
      </div>

      {/* FAQ */}
      <HelpFAQ lang={lang} />

      {/* Contact */}
      <div className="mt-10 text-center bg-white border border-[#E4E0D8] rounded-xl p-6">
        <p className="text-[12px] text-[#666] mb-3">{t('faqNoAnswer')}</p>
        <a
          href="mailto:support@clouddevis.com"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold text-white transition hover:opacity-90"
          style={{ background: '#0B3D2E' }}
        >
          {t('contactSupport')}
        </a>
      </div>
    </div>
  );
}
