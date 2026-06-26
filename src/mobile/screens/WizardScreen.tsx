'use client';

// ============================================================
// CloudDevis Mobile — Wizard Screen
// 4-step document creation with slide transitions
// ============================================================

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { StepTypeSelection } from '../components/wizard/StepTypeSelection';
import { StepClientSelection } from '../components/wizard/StepClientSelection';
import { StepLineItems } from '../components/wizard/StepLineItems';
import { StepReviewExport } from '../components/wizard/StepReviewExport';
import type { DocumentType, Client } from '@/mobile/types';

// ── Slide animation variants ──────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ── Component ─────────────────────────────────────────────────

interface WizardScreenProps {
  /** Called when user taps back on step 1 (exit wizard) */
  onExit?: () => void;
}

export function WizardScreen({ onExit }: WizardScreenProps) {
  const step = useDocumentStore((s) => s.step);
  const currentDoc = useDocumentStore((s) => s.currentDoc);
  const setType = useDocumentStore((s) => s.setType);
  const setClient = useDocumentStore((s) => s.setClient);
  const nextStep = useDocumentStore((s) => s.nextStep);
  const prevStep = useDocumentStore((s) => s.prevStep);
  const resetDocument = useDocumentStore((s) => s.resetDocument);

  // ── Compute slide direction ──
  const direction = useMemo(() => 1, [step]); // Always slide right for forward

  // ── Step 1: Type selection ──
  const handleTypeSelect = useCallback(
    (type: DocumentType) => {
      setType(type);
      nextStep();
    },
    [setType, nextStep],
  );

  // ── Step 2: Client selection ──
  const handleClientSelect = useCallback(
    (client: Client) => {
      setClient(client);
      nextStep();
    },
    [setClient, nextStep],
  );

  const handleClientClear = useCallback(() => {
    setClient({});
  }, [setClient]);

  // ── Navigation ──
  const handleBack = useCallback(() => {
    if (step === 1) {
      resetDocument();
      onExit?.();
    } else {
      prevStep();
    }
  }, [step, resetDocument, onExit, prevStep]);

  // ── Step labels ──
  const STEP_LABELS: Record<number, string> = {
    1: 'Type',
    2: 'Client',
    3: 'Articles',
    4: 'Aperçu',
  };

  return (
    <div
      className="relative min-h-screen bg-[var(--navy)] overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-5 pt-2 pb-1">
        {/* Back button */}
        <button type="button"           onClick={handleBack}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'bg-[var(--navy-3)] text-[var(--sand-muted)]',
            'active:scale-95 transition-transform',
          )}
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Step title */}
        <div className="flex-1">
          <p className="text-xs text-[var(--sand-muted)]">
            Étape {step}/4
          </p>
          <p className="text-sm font-semibold text-[var(--sand)]">
            {STEP_LABELS[step]}
          </p>
        </div>
      </div>

      {/* ── Progress dots ── */}
      <WizardProgress currentStep={step} />

      {/* ── Step content with slide animation ── */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="pt-4 pb-8"
          >
            {step === 1 && (
              <StepTypeSelection
                selectedType={currentDoc.type}
                onSelect={handleTypeSelect}
              />
            )}

            {step === 2 && (
              <StepClientSelection
                selectedClient={currentDoc.client?.name ? currentDoc.client : null}
                onSelect={handleClientSelect}
                onClear={handleClientClear}
              />
            )}

            {step === 3 && (
              <StepLineItems documentType={currentDoc.type} />
            )}

            {step === 4 && <StepReviewExport onBack={prevStep} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
