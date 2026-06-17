'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { HelpLang } from '@/lib/helpTranslations';
import { hT, HELP_T } from '@/lib/helpTranslations';

const FAQ_KEYS = ['general', 'documents', 'fiscalite', 'compte', 'problemes'] as const;

const FAQ_LINKS: Record<string, string | undefined> = {
  'getting-started': '/help/getting-started/bienvenue',
  'documents': '/help/documents/creer-devis',
  'legal': '/help/legal/timbre-fiscal',
  'account': '/help/account/profil',
  'troubleshooting': '/help/troubleshooting/connexion',
};

interface Props {
  lang: HelpLang;
}

export function HelpFAQ({ lang }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const t = (key: string) => hT(lang, key);
  const faq = HELP_T[lang].faq;

  return (
    <div className="space-y-6">
      {FAQ_KEYS.map((groupKey) => {
        const group = faq[groupKey as keyof typeof faq];
        return (
          <div key={groupKey}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#999] mb-3">{group.title}</h2>
            <div className="bg-white border border-[#E4E0D8] rounded-xl overflow-hidden divide-y divide-[#F0EFEC]">
              {group.items.map((item, i) => {
                const key = `${groupKey}-${i}`;
                const isOpen = openKey === key;
                const categoryKey = Object.keys(HELP_T[lang].categories)[FAQ_KEYS.indexOf(groupKey)];
                return (
                  <div key={key}>
                    <button
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#F8F7F4] transition"
                    >
                      <span className="text-[12.5px] font-semibold text-[#161616] pr-4">{item.q}</span>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <p className="text-[12px] text-[#444] leading-[1.7]">{item.a}</p>
                        {FAQ_LINKS[categoryKey] && (
                          <Link href={FAQ_LINKS[categoryKey]!} className="inline-flex items-center gap-1 text-[11px] font-semibold mt-2 hover:underline" style={{ color: '#0B3D2E' }}>
                            {t('readMore')} →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
