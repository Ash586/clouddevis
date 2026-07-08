'use client';

import { useState, useEffect, useCallback } from 'react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '.tour-step-1',
    title: 'مرحباً بك في Rakmana',
    content: 'سوق أول فاتورة خلال دقائق. اضغط هنا للبدء.',
    position: 'bottom',
  },
  {
    target: '.tour-step-2',
    title: 'الوثائق الأخيرة',
    content: 'ستجد كل المستندات هنا، مرتبة حسب التاريخ.',
    position: 'right',
  },
  {
    target: '.tour-step-3',
    title: 'حدًا أقصى للخطة المجانية',
    content: 'لديك 5 مستندات شهريًا. ارتقِ للـ Pro للوثائق غير المحدودة.',
    position: 'top',
  },
];

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const completed = localStorage.getItem('onboardingCompleted');
    if (!completed) setVisible(true);
  }, []);

  const finish = useCallback(() => {
    localStorage.setItem('onboardingCompleted', 'true');
    setVisible(false);
  }, []);

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) setStep(s => s + 1);
    else finish();
  }, [step, finish]);

  const prev = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  if (!mounted || !visible) return null;

  const current = TOUR_STEPS[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-backdrop" onClick={finish} />
      <TourTooltip step={current} onNext={next} onPrev={prev} stepNum={step} totalSteps={TOUR_STEPS.length} finish={finish} />
    </div>
  );
}

function TourTooltip({ step, onNext, onPrev, stepNum, totalSteps, finish }: {
  step: TourStep;
  onNext: () => void;
  onPrev: () => void;
  stepNum: number;
  totalSteps: number;
  finish: () => void;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const targetEl = document.querySelector(step.target);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX,
      });
    }
  }, [step.target]);

  return (
    <div className="onboarding-tooltip" style={{ position: 'absolute', top: position.top, left: position.left }}>
      <h4>{step.title}</h4>
      <p>{step.content}</p>
      <div className="onboarding-actions">
        <button type="button" onClick={onPrev} disabled={stepNum === 0}>السابق</button>
        <button type="button" onClick={onNext}>{stepNum === totalSteps - 1 ? 'انتهى' : 'التالي'}</button>
      </div>
    </div>
  );
}