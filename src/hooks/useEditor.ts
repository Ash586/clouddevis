'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { DocumentState, LineItem, UserMode, BlockId, ClientInfo, CompanyInfo, ArtisanInfo, DiscountInfo, StampDutyConfig, PaymentDetails, WizardStep } from '@/types';
import { DEFAULT_SECTION_ORDER } from '@/types';
import { calculateDocument, generateDocumentNumber, formatDateISO, generateId } from '@/lib/calculations';

const LS_KEY = 'clouddevis-draft';

function loadDraft(mode: UserMode): DocumentState {
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

function createEmptyDoc(mode: UserMode): DocumentState {
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
  };
}

export function useEditor(initialMode?: UserMode, initialDocId?: string) {
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

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(doc)); } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [doc]);

  const updateDoc = useCallback(<K extends keyof DocumentState>(key: K, value: DocumentState[K]) => {
    setDoc(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateClientInfo = useCallback((info: Partial<ClientInfo>) => {
    setDoc(prev => ({ ...prev, clientInfo: { ...prev.clientInfo, ...info } }));
  }, []);

  const updateCompanyInfo = useCallback((info: Partial<CompanyInfo>) => {
    setDoc(prev => ({ ...prev, companyInfo: prev.companyInfo ? { ...prev.companyInfo, ...info } : prev.companyInfo }));
  }, []);

  const updateTaxIds = useCallback((ids: Partial<CompanyInfo['taxIds']>) => {
    setDoc(prev => ({
      ...prev,
      companyInfo: prev.companyInfo ? { ...prev.companyInfo, taxIds: { ...prev.companyInfo.taxIds, ...ids } } : prev.companyInfo,
    }));
  }, []);

  const updateArtisanInfo = useCallback((info: Partial<ArtisanInfo>) => {
    setDoc(prev => ({ ...prev, artisanInfo: prev.artisanInfo ? { ...prev.artisanInfo, ...info } : prev.artisanInfo }));
  }, []);

  const updateCustomField = useCallback((sectionId: string, fieldId: string, value: any) => {
    setDoc(prev => {
      const sectionData = { ...(prev.customFields[sectionId] ?? {}) };
      sectionData[fieldId] = value;
      return { ...prev, customFields: { ...prev.customFields, [sectionId]: sectionData } };
    });
  }, []);

  const updateDiscount = useCallback((info: Partial<DiscountInfo>) => {
    setDoc(prev => ({ ...prev, discount: { ...prev.discount, ...info } }));
  }, []);

  const updateStampDuty = useCallback((info: Partial<StampDutyConfig>) => {
    setDoc(prev => ({ ...prev, stampDuty: { ...prev.stampDuty, ...info } }));
  }, []);

  const updatePaymentDetails = useCallback((info: Partial<PaymentDetails>) => {
    setDoc(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, ...info } }));
  }, []);

  const toggleBlock = useCallback((block: BlockId) => {
    setDoc(prev => ({
      ...prev,
      hiddenBlocks: prev.hiddenBlocks.includes(block)
        ? prev.hiddenBlocks.filter(b => b !== block)
        : [...prev.hiddenBlocks, block],
    }));
  }, []);

  const isBlockVisible = useCallback((block: BlockId) => {
    return !doc.hiddenBlocks.includes(block);
  }, [doc.hiddenBlocks]);

  const setChantierField = useCallback(<K extends 'chantierAddress' | 'chantierType' | 'chantierSurface' | 'chantierEtat' | 'chantierProtection'>(key: K, value: DocumentState[K]) => {
    setDoc(prev => ({ ...prev, [key]: value }));
  }, []);

  const setMateriauxField = useCallback(<K extends 'materiauxMarque' | 'materiauxType' | 'materiauxCouleur' | 'materiauxQte'>(key: K, value: DocumentState[K]) => {
    setDoc(prev => ({ ...prev, [key]: value }));
  }, []);

  const setGarantieField = useCallback(<K extends 'garantieMO' | 'garantieMateriaux' | 'garantieNotes'>(key: K, value: DocumentState[K]) => {
    setDoc(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleAddItem = useCallback(() => {
    if (!newItem.designation || newItem.unitPrice <= 0) return;
    const item: LineItem = { ...newItem, id: generateId() };
    setDoc(prev => ({ ...prev, items: [...prev.items, item] }));
    setNewItem({ id: '', designation: '', quantity: 1, unit: 'u', unitPrice: 0, category: '' });
    setAddingItem(false);
  }, [newItem]);

  const handleRemoveItem = useCallback((id: string) => {
    setDoc(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  }, []);

  const moveItem = useCallback((fromIdx: number, toIdx: number) => {
    setDoc(prev => {
      const items = [...prev.items];
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return { ...prev, items };
    });
  }, []);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setDoc(prev => {
      const order = [...prev.sectionOrder];
      const idx = order.indexOf(sectionId);
      if (idx === -1) return prev;
      const toIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (toIdx < 0 || toIdx >= order.length) return prev;
      [order[idx], order[toIdx]] = [order[toIdx], order[idx]];
      return { ...prev, sectionOrder: order };
    });
  }, []);

  const startNewItem = useCallback(() => {
    setNewItem({ id: '', designation: '', quantity: 1, unit: 'u', unitPrice: 0, category: '' });
    setAddingItem(true);
  }, []);

  const resetDoc = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setDocId(null);
    setDoc(createEmptyDoc(mode));
  }, [mode]);

  const saveDoc = useCallback(async () => {
    setSaving(true);
    try {
      const method = docId ? 'PUT' : 'POST';
      const url = docId ? `/api/documents/${docId}` : '/api/documents';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(doc) });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setDocId(data.id);
      localStorage.removeItem(LS_KEY);
      return data;
    } finally {
      setSaving(false);
    }
  }, [doc, docId]);

  return {
    doc, setDoc,
    step, setStep,
    mode, setMode,
    addingItem, setAddingItem,
    newItem, setNewItem,
    saving, setSaving,
    docId,
    results,
    updateDoc, updateClientInfo, updateCompanyInfo, updateTaxIds, updateArtisanInfo,
    updateDiscount, updateStampDuty, updatePaymentDetails,
    setChantierField, setMateriauxField, setGarantieField,
    toggleBlock, isBlockVisible,
    handleAddItem, handleRemoveItem, moveItem, moveSection, startNewItem, resetDoc, saveDoc,
    updateCustomField,
  };
}
