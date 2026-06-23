'use client';

import { useState } from 'react';
import type { HelpLang } from '@/lib/helpTranslations';

const LANGS: { code: HelpLang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇩🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

interface Props {
  current: HelpLang;
  onChange: (lang: HelpLang) => void;
}

export function HelpLangSwitcher({ current, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const active = LANGS.find((l) => l.code === current)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E4E0D8] hover:border-[#C4A35A] transition text-[11px] font-semibold text-[#444]"
      >
        <span>{active.flag}</span>
        <span>{active.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 bg-white border border-[#E4E0D8] rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px]">
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setOpen(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-[11.5px] font-medium transition hover:bg-[#F8F7F4] ${
                  lang.code === current ? 'bg-[#F0EFEC] text-[#1E40AF]' : 'text-[#444]'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === current && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
