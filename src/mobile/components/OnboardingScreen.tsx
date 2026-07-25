'use client';

import { useEffect, useState } from 'react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingScreenProps {
  onDone: () => void;
}

const STEPS = [
  { titleKey: 'onboarding.step1Title' as const, descKey: 'onboarding.step1Desc' as const, icon: '📝' },
  { titleKey: 'onboarding.step2Title' as const, descKey: 'onboarding.step2Desc' as const, icon: '📄' },
  { titleKey: 'onboarding.step3Title' as const, descKey: 'onboarding.step3Desc' as const, icon: '📉' },
];

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { t } = useMobileI18n();
  const [step, setStep] = useState(0);

  useEffect(() => {
    try { localStorage.setItem('rakmana_onboarded', '1'); } catch {}
  }, []);

  const current = STEPS[step];

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#0052CC] via-[#001A4D] to-[#0052CC] p-5"
      style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-white' : 'w-1 bg-white/25'
              }`}
            />
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-2xl text-center">
          <div className="mb-4 text-4xl">{current.icon}</div>
          <h2 className="mb-1.5 text-lg font-extrabold text-[#0052CC]">
            {t(current.titleKey)}
          </h2>
          <p className="text-xs text-[#4A5568] leading-relaxed">
            {t(current.descKey)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onDone}
            className="flex items-center gap-1 text-xs text-white/45 hover:text-white/70 transition-colors duration-150"
          >
            <X size={12} /> {t('onboarding.skip')}
          </button>
          <button
            onClick={() => step < STEPS.length - 1 ? setStep((s) => s + 1) : onDone()}
            className="flex items-center gap-1.5 rounded-lg bg-white px-5 py-2 text-xs font-bold text-[#0052CC] shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/50"
          >
            {step < STEPS.length - 1 ? (
              <>{t('onboarding.next')} <ChevronLeft size={12} /></>
            ) : (
              t('onboarding.finish')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
