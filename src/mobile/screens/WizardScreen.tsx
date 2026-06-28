'use client';

// ============================================================
// CloudDevis Mobile — Wizard Screen
// 4-step document creation/editing with slide transitions.
// When editingDocId is provided, the wizard loads the full
// document from the API and switches to update (PUT) mode.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { fetchDocumentDetail, type ApiDocumentDetail } from '@/mobile/lib/api';
import { WizardProgress } from '../components/wizard/WizardProgress';
import { StepTypeSelection } from '../components/wizard/StepTypeSelection';
import { StepClientSelection } from '../components/wizard/StepClientSelection';
import { StepLineItems } from '../components/wizard/StepLineItems';
import { StepReviewExport } from '../components/wizard/StepReviewExport';
import type { DocumentType, Client, LineItem, PaymentMode, Language } from '@/mobile/types';

// ── Slide animation variants ──────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ── Map raw API detail to wizard store fields ─────────────────

function loadApiDocIntoStore(
  raw: ApiDocumentDetail,
  setType: (t: DocumentType) => void,
  setClient: (c: Partial<Client>) => void,
  setLanguage: (l: Language) => void,
  setPaymentMode: (m: PaymentMode) => void,
  setAcompte: (a: number) => void,
  setNotes: (n: string) => void,
  clearItems: () => void,
  addItemRaw: (item: Omit<LineItem, 'id' | 'totalHT'>) => void,
) {
  // Parse items from JSON string
  let parsedItems: Array<Record<string, unknown>> = [];
  try {
    parsedItems = JSON.parse(raw.items) as Array<Record<string, unknown>>;
  } catch {
    parsedItems = [];
  }

  const validTypes = new Set(['DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR']);
  const type: DocumentType = validTypes.has(raw.type) ? (raw.type as DocumentType) : 'DEVIS';
  const paymentMode = (raw.paymentMode || 'cheque') as PaymentMode;

  setType(type);

  if (raw.client) {
    setClient({
      id: raw.client.id,
      name: raw.client.name,
      phone: raw.client.phone ?? '',
      email: raw.client.email ?? undefined,
      address: raw.client.address ?? undefined,
      nif: raw.client.nif ?? undefined,
      rc: raw.client.rc ?? undefined,
      nis: raw.client.nis ?? undefined,
    });
  }

  setPaymentMode(paymentMode);
  setAcompte(raw.acompte ?? 0);
  setNotes(raw.notes ?? '');

  // Load line items
  clearItems();
  for (const i of parsedItems) {
    addItemRaw({
      label: String(i.designation || i.label || ''),
      quantity: Number(i.quantity) || 1,
      unit: (String(i.unit || 'u')) as LineItem['unit'],
      unitPrice: Number(i.unitPrice) || 0,
      tvaRate: (Number(i.tvaRate) || 19) as 0 | 9 | 19,
    });
  }
}

// ── Component ─────────────────────────────────────────────────

interface WizardScreenProps {
  /** When provided: edit mode — loads doc from API, saves via PUT */
  editingDocId?: string;
  /** Called when user taps back on step 1 (exit wizard) */
  onExit?: () => void;
}

export function WizardScreen({ editingDocId, onExit }: WizardScreenProps) {
  const step = useDocumentStore((s) => s.step);
  const currentDoc = useDocumentStore((s) => s.currentDoc);
  const setType = useDocumentStore((s) => s.setType);
  const setClient = useDocumentStore((s) => s.setClient);
  const setPaymentMode = useDocumentStore((s) => s.setPaymentMode);
  const setAcompte = useDocumentStore((s) => s.setAcompte);
  const setNotes = useDocumentStore((s) => s.setNotes);
  const setLanguage = useDocumentStore((s) => s.setLanguage);
  const clearItems = useDocumentStore((s) => s.clearItems);
  const addItem = useDocumentStore((s) => s.addItem);
  const nextStep = useDocumentStore((s) => s.nextStep);
  const prevStep = useDocumentStore((s) => s.prevStep);
  const resetDocument = useDocumentStore((s) => s.resetDocument);
  const goToStep = useDocumentStore((s) => s.goToStep);

  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  // ── Track slide direction (1 = forward, -1 = back) ────────
  const prevStepRef = useRef(step);
  const direction = step >= prevStepRef.current ? 1 : -1;
  useEffect(() => { prevStepRef.current = step; }, [step]);

  // ── Load full document when in edit mode ──────────────────
  useEffect(() => {
    if (!editingDocId) {
      resetDocument();
      return;
    }
    setLoadingDoc(true);
    setLoadError('');
    fetchDocumentDetail(editingDocId)
      .then((raw) => {
        loadApiDocIntoStore(
          raw,
          setType,
          setClient,
          setLanguage,
          setPaymentMode,
          setAcompte,
          setNotes,
          clearItems,
          addItem,
        );
        // Jump to Aperçu so user sees the full doc and can save immediately
        goToStep(4);
      })
      .catch(() => setLoadError('Impossible de charger le document.'))
      .finally(() => setLoadingDoc(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDocId, retryToken]);

  // ── Navigation ───────────────────────────────────────────
  const handleTypeSelect = useCallback(
    (type: DocumentType) => { setType(type); nextStep(); },
    [setType, nextStep],
  );

  const handleClientSelect = useCallback(
    (client: Client) => { setClient(client); nextStep(); },
    [setClient, nextStep],
  );

  const handleClientClear = useCallback(() => setClient({}), [setClient]);

  const handleBack = useCallback(() => {
    if (step === 1) {
      resetDocument();
      onExit?.();
    } else {
      prevStep();
    }
  }, [step, resetDocument, onExit, prevStep]);

  const STEP_LABELS: Record<number, string> = {
    1: 'Type',
    2: 'Client',
    3: 'Articles',
    4: 'Aperçu',
  };

  // ── Loading state ─────────────────────────────────────────
  if (loadingDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-[var(--green-2)]" />
          <p className="text-sm text-[var(--sand-muted)]">Chargement du document…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy)] px-6">
        <div className="text-center">
          <p className="text-sm text-red-400 mb-4">{loadError}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onExit?.()}
              className="px-5 py-2.5 rounded-xl bg-[var(--navy-3)] text-sm text-[var(--sand)]"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={() => setRetryToken((t) => t + 1)}
              className="px-5 py-2.5 rounded-xl bg-[var(--green-2)] text-sm font-semibold text-white"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <button
          type="button"
          onClick={handleBack}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'bg-[var(--navy-3)] text-[var(--sand-muted)]',
            'active:scale-95 transition-transform',
          )}
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex-1">
          <p className="text-xs text-[var(--sand-muted)]">
            {editingDocId ? 'Modifier' : 'Nouveau'} · Étape {step}/4
          </p>
          <p className="text-sm font-semibold text-[var(--sand)]">
            {STEP_LABELS[step]}
          </p>
        </div>

        {editingDocId && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[var(--navy-3)] text-[var(--sand-muted)]">
            ÉDITION
          </span>
        )}
      </div>

      {/* ── Progress dots ── */}
      <WizardProgress currentStep={step} />

      {/* ── Step content ── */}
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

            {step === 4 && (
              <StepReviewExport
                onBack={prevStep}
                editingDocId={editingDocId}
                onSaved={onExit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
