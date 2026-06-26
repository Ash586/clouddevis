'use client';
import { useCallback, useRef } from 'react';
import type { DocumentState, LineItem, BlockId, ClientInfo, CompanyInfo, ArtisanInfo, DiscountInfo, StampDutyConfig, PaymentDetails } from '@/types';
import { generateId } from '@/lib/calculations';
import { LS_KEY, createEmptyDoc } from './useEditorState';
import { track, DOC_EVENTS } from '@/lib/analytics';

interface EditorActionsDeps {
  doc: DocumentState;
  setDoc: React.Dispatch<React.SetStateAction<DocumentState>>;
  docId: string | null;
  setDocId: (id: string | null) => void;
  mode: string;
  newItem: LineItem;
  setNewItem: (item: LineItem) => void;
  setAddingItem: (v: boolean) => void;
  setSaving: (v: boolean) => void;
}

export function useEditorActions(deps: EditorActionsDeps) {
  const { setDoc, setDocId, mode, setNewItem, setAddingItem, setSaving } = deps;

  const docRef = useRef(deps.doc);
  docRef.current = deps.doc;

  const newItemRef = useRef(deps.newItem);
  newItemRef.current = deps.newItem;

  const docIdRef = useRef(deps.docId);
  docIdRef.current = deps.docId;

  const updateDoc = useCallback(<K extends keyof DocumentState>(key: K, value: DocumentState[K]) => {
    setDoc(prev => ({ ...prev, [key]: value }));
  }, [setDoc]);

  const updateClientInfo = useCallback((info: Partial<ClientInfo>) => {
    setDoc(prev => ({ ...prev, clientInfo: { ...prev.clientInfo, ...info } }));
  }, [setDoc]);

  const updateCompanyInfo = useCallback((info: Partial<CompanyInfo>) => {
    setDoc(prev => ({ 
      ...prev, 
      companyInfo: { 
        name: '', 
        address: '', 
        taxIds: { nif: '', rc: '', nis: '', ai: '' }, 
        ...(prev.companyInfo || {}), 
        ...info 
      } 
    }));
  }, [setDoc]);

  const updateTaxIds = useCallback((ids: Partial<CompanyInfo['taxIds']>) => {
    setDoc(prev => ({
      ...prev,
      companyInfo: prev.companyInfo ? { ...prev.companyInfo, taxIds: { ...prev.companyInfo.taxIds, ...ids } } : prev.companyInfo,
    }));
  }, [setDoc]);

  const updateArtisanInfo = useCallback((info: Partial<ArtisanInfo>) => {
    setDoc(prev => ({ ...prev, artisanInfo: prev.artisanInfo ? { ...prev.artisanInfo, ...info } : prev.artisanInfo }));
  }, [setDoc]);

  const updateCustomField = useCallback((sectionId: string, fieldId: string, value: unknown) => {
    setDoc(prev => {
      const sectionData = { ...(prev.customFields[sectionId] ?? {}) };
      sectionData[fieldId] = value;
      return { ...prev, customFields: { ...prev.customFields, [sectionId]: sectionData } };
    });
  }, [setDoc]);

  const updateDiscount = useCallback((info: Partial<DiscountInfo>) => {
    setDoc(prev => ({ ...prev, discount: { ...prev.discount, ...info } }));
  }, [setDoc]);

  const updateStampDuty = useCallback((info: Partial<StampDutyConfig>) => {
    setDoc(prev => ({ ...prev, stampDuty: { ...prev.stampDuty, ...info } }));
  }, [setDoc]);

  const updatePaymentDetails = useCallback((info: Partial<PaymentDetails>) => {
    setDoc(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, ...info } }));
  }, [setDoc]);

  const toggleBlock = useCallback((block: BlockId) => {
    setDoc(prev => ({
      ...prev,
      hiddenBlocks: prev.hiddenBlocks.includes(block)
        ? prev.hiddenBlocks.filter(b => b !== block)
        : [...prev.hiddenBlocks, block],
    }));
  }, [setDoc]);

  const isBlockVisible = useCallback((block: BlockId) => {
    return !docRef.current.hiddenBlocks.includes(block);
  }, []);

  const setChantierField = useCallback(<K extends 'chantierAddress' | 'chantierType' | 'chantierSurface' | 'chantierEtat' | 'chantierProtection'>(key: K, value: DocumentState[K]) => {
    setDoc(prev => ({ ...prev, [key]: value }));
  }, [setDoc]);

  const setMateriauxField = useCallback(<K extends 'materiauxMarque' | 'materiauxType' | 'materiauxCouleur' | 'materiauxQte'>(key: K, value: DocumentState[K]) => {
    setDoc(prev => ({ ...prev, [key]: value }));
  }, [setDoc]);

  const setGarantieField = useCallback(<K extends 'garantieMO' | 'garantieMateriaux' | 'garantieNotes'>(key: K, value: DocumentState[K]) => {
    setDoc(prev => ({ ...prev, [key]: value }));
  }, [setDoc]);

  const handleAddItem = useCallback(() => {
    const item = newItemRef.current;
    if (!item.designation || item.unitPrice <= 0) return;
    const newLineItem: LineItem = { ...item, id: generateId() };
    setDoc(prev => ({ ...prev, items: [...prev.items, newLineItem] }));
    setNewItem({ id: '', designation: '', quantity: 1, unit: 'u', unitPrice: 0, category: '' });
    setAddingItem(false);
  }, [setDoc, setNewItem, setAddingItem]);

  const handleRemoveItem = useCallback((id: string) => {
    setDoc(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  }, [setDoc]);

  const moveItem = useCallback((fromIdx: number, toIdx: number) => {
    setDoc(prev => {
      const items = [...prev.items];
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return { ...prev, items };
    });
  }, [setDoc]);

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
  }, [setDoc]);

  const startNewItem = useCallback(() => {
    setNewItem({ id: '', designation: '', quantity: 1, unit: 'u', unitPrice: 0, category: '' });
    setAddingItem(true);
  }, [setNewItem, setAddingItem]);

  const resetDoc = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setDocId(null);
    setDoc(createEmptyDoc(mode as 'artisan' | 'entreprise', docRef.current.documentType));
  }, [mode, setDocId, setDoc]);

  const saveDoc = useCallback(async () => {
    setSaving(true);
    try {
      const currentDoc = docRef.current;
      const currentDocId = docIdRef.current;
      const method = currentDocId ? 'PUT' : 'POST';
      const url = currentDocId ? `/api/documents/${currentDocId}` : '/api/documents';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentDoc) });
      if (!res.ok) { const body = await res.text(); throw new Error(`Save failed (${res.status}): ${body}`); }
      const data = await res.json();
      if (method === 'POST') {
        track(DOC_EVENTS.DOCUMENT_CREATED, { type: currentDoc.documentType, mode: currentDoc.mode });
        track(DOC_EVENTS.FIRST_INVOICE_CREATED, { type: currentDoc.documentType, mode: currentDoc.mode });
      }
      setDocId(data.id);
      localStorage.removeItem(LS_KEY);
      return data;
    } finally {
      setSaving(false);
    }
  }, [setDocId, setSaving]);

  return {
    updateDoc, updateClientInfo, updateCompanyInfo, updateTaxIds, updateArtisanInfo,
    updateDiscount, updateStampDuty, updatePaymentDetails,
    setChantierField, setMateriauxField, setGarantieField,
    toggleBlock, isBlockVisible,
    handleAddItem, handleRemoveItem, moveItem, moveSection, startNewItem, resetDoc, saveDoc,
    updateCustomField,
  };
}
