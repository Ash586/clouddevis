'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const HINT_TEXTS = {
  fr: 'Essayez le mode clair !',
  en: 'Try light mode!',
  ar: 'جرّب الوضع الفاتح!',
};

const HINT_SUBTEXTS = {
  fr: 'Cliquez ici pour changer de thème',
  en: 'Click here to switch theme',
  ar: 'انقر هنا لتغيير السمة',
};

const DISMISS_KEY = 'clouddevis-theme-hint-seen';

export function ThemeHint() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Don't show if user has already seen it or has a non-default theme preference
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(DISMISS_KEY);
    if (seen) return;

    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  if (!visible || dismissed) return null;

  const typedLang = (lang === 'fr' || lang === 'en' || lang === 'ar') ? lang : 'fr';

  return (
    <div className="fixed top-[72px] right-6 z-[110] theme-hint-tooltip">
      <div className="relative bg-[var(--navy-2)] border border-[rgba(196,163,90,0.3)] rounded-xl shadow-2xl p-4 max-w-[240px]"
        style={{ boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)' }}>
        {/* Arrow pointing to toggle button */}
        <div className="absolute -top-2 right-6 w-4 h-4 bg-[var(--navy-2)] border-t border-l border-[rgba(196,163,90,0.3)] transform rotate-45" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--gold-bg)] flex items-center justify-center">
              {theme === 'dark' ? <Sun size={14} className="text-[var(--gold)]" /> : <Moon size={14} className="text-[var(--gold)]" />}
            </div>
            <span className="text-[12px] font-bold text-[var(--sand)]">
              {HINT_TEXTS[typedLang]}
            </span>
          </div>
          <p className="text-[11px] text-[var(--sand-muted)] leading-relaxed mb-2">
            {HINT_SUBTEXTS[typedLang]}
          </p>
          <button
            onClick={handleDismiss}
            className="absolute -top-1 -right-1 p-1 text-[var(--sand-muted)] hover:text-[var(--sand)] rounded-md hover:bg-[var(--navy-3)] transition"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
