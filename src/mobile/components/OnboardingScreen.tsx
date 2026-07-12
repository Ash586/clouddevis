'use client';

// ============================================================
// Rakmana Mobile — First-Run Onboarding
// 3-screen tour shown once after first login.
// Persisted to localStorage: 'rakmana_onboarded'
// ============================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Screens ───────────────────────────────────────────────────

interface Slide {
  icon: string;
  title: string;
  body: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    icon: '🧾',
    title: 'مرحباً بك في رقمنة',
    body: 'أنشئ فواتيرك وعروض الأسعار\nوفق معايير المديرية العامة للضرائب',
    accent: 'from-[#0d3d24] to-[#0f5132]',
  },
  {
    icon: '⚡',
    title: 'إنشاء فوري',
    body: 'فاتورة، عرض سعر، وصل تسليم...\nكل ذلك في أقل من دقيقة',
    accent: 'from-[#1e3a5f] to-[#1D4ED8]',
  },
  {
    icon: '📡',
    title: 'يعمل بدون إنترنت',
    body: 'بياناتك محفوظة محلياً\nوتتزامن تلقائياً عند الاتصال',
    accent: 'from-[#4c1d95] to-[#7C3AED]',
  },
];

// ── Props ─────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onDone: () => void;
}

// ── Component ─────────────────────────────────────────────────

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [current, setCurrent] = useState(0);
  const isLast = current === SLIDES.length - 1;

  const markDone = useCallback(() => {
    try { localStorage.setItem('rakmana_onboarded', '1'); } catch { /* private mode */ }
    onDone();
  }, [onDone]);

  const next = useCallback(() => {
    if (isLast) { markDone(); return; }
    setCurrent((c) => c + 1);
  }, [isLast, markDone]);

  const slide = SLIDES[current];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-[var(--navy)]"
      style={{ paddingTop: 'env(safe-area-inset-top, 16px)', paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
    >
      {/* Skip button */}
      <div className="w-full flex justify-start px-6 pt-3">
        {!isLast && (
          <button
            type="button"
            onClick={markDone}
            className="text-sm text-[var(--sand-muted)] active:opacity-60 transition-opacity py-2 px-1"
          >
            تخطي
          </button>
        )}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Icon blob */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.35, type: 'spring', stiffness: 260, damping: 20 }}
              className={cn(
                'w-28 h-28 rounded-[32px] flex items-center justify-center mb-8',
                'bg-gradient-to-br shadow-2xl',
                slide.accent,
              )}
            >
              <span className="text-5xl">{slide.icon}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.28 }}
              className="text-2xl font-bold text-[var(--sand)] mb-4 leading-snug"
            >
              {slide.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.28 }}
              className="text-base text-[var(--sand-muted)] leading-relaxed whitespace-pre-line"
            >
              {slide.body}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + CTA */}
      <div className="w-full px-6 pb-4 flex flex-col items-center gap-6">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className="transition-all duration-300"
              aria-label={`الشريحة ${i + 1}`}
            >
              <span
                className={cn(
                  'block rounded-full transition-all duration-300',
                  i === current
                    ? 'w-6 h-2 bg-[var(--green-2)]'
                    : 'w-2 h-2 bg-[var(--sand-muted)] opacity-40',
                )}
              />
            </button>
          ))}
        </div>

        {/* Next / Start */}
        <motion.button
          type="button"
          onClick={next}
          whileTap={{ scale: 0.96 }}
          className={cn(
            'w-full py-4 rounded-2xl text-base font-bold text-white',
            'transition-colors active:opacity-90',
            'bg-[var(--green-2)]',
          )}
        >
          {isLast ? 'ابدأ الآن 🚀' : 'التالي'}
        </motion.button>
      </div>
    </div>
  );
}
