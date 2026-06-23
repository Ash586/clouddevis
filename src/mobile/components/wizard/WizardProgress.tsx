'use client';

// ============================================================
// CloudDevis Mobile — Wizard Progress Indicator
// 4 dots: active = wide pill, done = filled circle
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  totalSteps?: number;
}

export function WizardProgress({ currentStep, totalSteps = 4 }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = (i + 1) as 1 | 2 | 3 | 4;
        const isActive = step === currentStep;
        const isDone = step < currentStep;

        return (
          <motion.div
            key={step}
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className={cn(
              'h-2 rounded-full transition-colors duration-300',
              isActive
                ? 'w-8 bg-[var(--green-2)]'
                : isDone
                  ? 'w-2 bg-[var(--green-2)]'
                  : 'w-2 bg-[var(--navy-3)]',
            )}
          />
        );
      })}
    </div>
  );
}
