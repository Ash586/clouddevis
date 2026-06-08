'use client';
import { useState, useMemo, useEffect } from 'react';
import type { DocumentState, LineItem, UserMode, WizardStep } from '@/types';
import { DEFAULT_SECTION_ORDER } from '@/types';
import { calculateDocument, generateDocumentNumber, formatDateISO } from '@/lib/calculations';

export const LS_KEY = 'clouddevis-draft';

export function loadDraft(mode: UserMode): DocumentState {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<DocumentState>;
      const savedMode = parsed.mode ?? mode;
      const defaults = createEmptyDoc(savedMode);
      const merged: DocumentState = {
        ...defaults,
        ...parsed,
        clientInfo: { ...defaults.clientInfo, ...(parsed.clientInfo ?? {}) },
        sectionOrder: parsed.sectionOrder ?? [...DEFAULT_SECTION_ORDER],
        hiddenBlocks: ['signature', ...(parsed.hiddenBlocks ?? []).filter((b: string) => b !== 'signature')],
      };
      if (parsed.companyInfo && defaults.companyInfo) {
        merged.companyInfo = { ...defaults.companyInfo, ...parsed.companyInfo };
        if (parsed.companyInfo.taxIds) {
          merged.companyInfo.taxIds = { ...defaults.companyInfo.taxIds, ...parsed.companyInfo.taxIds };
        }
      }
      if (parsed.stampDuty) merged.stampDuty = { ...defaults.stampDuty, ...parsed.stampDuty };
      if (parsed.paymentDetails) merged.paymentDetails = { ...defaults.paymentDetails, ...parsed.paymentDetails };
      if (parsed.discount) merged.discount = { ...defaults.discount, ...parsed.discount };
      if (parsed.customFields) merged.customFields = { ...parsed.customFields };
      return merged;
    }
  } catch {}
  return createEmptyDoc(mode);
}

export function createEmptyDoc(mode: UserMode): DocumentState {
  return {
    mode,
    clientInfo: { name: '', address: '', phone: '', email: '' },
    artisanInfo: mode === 'artisan' ? { name: '', address: '', phone: '' } : undefined,
    companyInfo: mode === 'entreprise'
      ? { name: '', address: '', taxIds: { nif: '', rc: '', nis: '', ai: '' }, capital: '' }
      : undefined,
    items: [],
    tvaRate: mode === 'artisan' ? 0 : 19,
    paymentMode: 'cheque',
    documentType: 'devis',
    documentNumber: generateDocumentNumber('devis', mode),
    date: formatDateISO(new Date()),
    discount: { type: 'percentage', value: 0, reason: '' },
    stampDuty: { rate: 1, minAmount: 5, maxAmount: 2500 },
    paymentDetails: { terms: '100% à la réception', iban: '' },
    hiddenBlocks: ['signature'],
    chantierAddress: '',
    chantierType: 'Appartement',
    chantierSurface: 0,
    chantierEtat: 'Neuf',
    chantierProtection: 'À charge du prestataire',
    materiauxMarque: '',
    materiauxType: 'Peinture acrylique mat',
    materiauxCouleur: '',
    materiauxQte: 0,
    garantieMO: '1 an',
    garantieMateriaux: '2 ans',
    garantieNotes: '',
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    customFields: {},
    logoPosition: 'right',
  };
}

export function useEditorState(initialMode?: UserMode, initialDocId?: string) {
  const [draftRestored, setDraftRestored] = useState<string | null>(() => {
    if (initialDocId) return null;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DocumentState>;
        if (parsed.items?.length || parsed.clientInfo?.name) return 'unsaved_draft';
      }
    } catch {}
    return null;
  });
  const [doc, setDoc] = useState<DocumentState>(() => loadDraft(initialMode ?? 'artisan'));
  const [step, setStep] = useState<WizardStep>(1);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<LineItem>({ id: '', designation: '', quantity: 1, unit: 'u', unitPrice: 0, category: '' });
  const [mode, setMode] = useState<UserMode>(initialMode ?? 'artisan');
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState<string | null>(initialDocId ?? null);

  const results = useMemo(() => calculateDocument(doc), [doc]);

  // Load document from API by ID
  useEffect(() => {
    if (!initialDocId) return;
    fetch(`/api/documents/${initialDocId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.document) {
          const d = data.document;
          const items = (() => { try { return JSON.parse(d.items); } catch { return []; } })();
          const customFields = (() => { try { return typeof d.customFields === 'string' ? JSON.parse(d.customFields) : (d.customFields || {}); } catch { return {}; } })();
          setDoc(prev => ({
            ...prev,
            items,
            customFields,
            documentType: (d.type || 'DEVIS').toLowerCase(),
            documentNumber: d.number || '',
            date: d.date?.split('T')[0] || prev.date,
            tvaRate: d.subTotalHT > 0 ? Math.round(d.tvaAmount / d.subTotalHT * 100) : 0,
            paymentMode: d.paymentMode || prev.paymentMode,
            mode: d.mode?.toLowerCase?.() === 'entreprise' ? 'entreprise' : 'artisan',
            notes: d.notes || '',
          }));
        }
      })
      .catch(() => {});
  }, [initialDocId]);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(doc)); } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [doc]);

  return {
    doc, setDoc,
    step, setStep,
    mode, setMode,
    addingItem, setAddingItem,
    newItem, setNewItem,
    saving, setSaving,
    docId, setDocId,
    results,
    draftRestored, setDraftRestored,
  };
}
