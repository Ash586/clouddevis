'use client';

import { useEffect, useState } from 'react';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { X, ChevronLeft, ChevronRight, Rocket } from 'lucide-react';

interface OnboardingScreenProps {
  onDone: () => void;
}

const STEPS = [
  { titleKey: 'onboarding.step1Title' as const, descKey: 'onboarding.step1Desc' as const, icon: 'ðŸ“' },
  { titleKey: 'onboarding.step2Title' as const, descKey: 'onboarding.step2Desc' as const, icon: 'ðŸ“„' },
  { titleKey: 'onboarding.step3Title' as const, descKey: 'onboarding.step3Desc' as const, icon: 'ðŸ“Š' },
];

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { t } = useMobileI18n();
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('rakmana_onboarded', '1');
    } catch {}
  }, []);

  const current = STEPS[step];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#2563EB] p-6">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-white' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl text-center">
          <div className="mb-5 text-5xl">{current.icon}</div>
          <h2 className="mb-2 text-xl font-extrabold text-[#2563EB]">
            {t(current.titleKey)}
          </h2>
          <p className="text-sm text-[#33425C] leading-relaxed">
            {t(current.descKey)}
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button onClick={onDone} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/70 transition-colors">
            <X size={14} /> {t('onboarding.skip')}
          </button>
          <button
            onClick={() => step < STEPS.length - 1 ? setStep((s) => s + 1) : onDone()}
            className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-[#2563EB] shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
          >
            {step < STEPS.length - 1 ? (
              <>{t('onboarding.next')} <ChevronLeft size={14} /></>
            ) : (
              t('onboarding.finish')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
