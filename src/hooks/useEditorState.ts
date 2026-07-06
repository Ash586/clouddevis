'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import type { DocumentState, LineItem, UserMode, WizardStep, DocumentType } from '@/types';
import { DEFAULT_SECTION_ORDER } from '@/types';
import { calculateDocument, generateDocumentNumber, formatDateISO, generateId } from '@/lib/calculations';
import { parseEditorMeta } from '@/lib/editorMeta';

export const LS_KEY = 'clouddevis-draft';

export function loadDraft(mode: UserMode, initialType?: DocumentType): DocumentState {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<DocumentState>;
      // Don't restore a draft of a different document type — start fresh instead
      if (initialType && parsed.documentType && parsed.documentType !== initialType) {
        return createEmptyDoc(mode, initialType);
      }
      const savedMode = parsed.mode ?? mode;
      const defaults = createEmptyDoc(savedMode, initialType);
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
        if (initialType) merged.documentType = initialType;
        // Fix corrupted document numbers: regenerate if prefix doesn't match the doc type
        const prefixMap: Record<string, string> = {
          devis: 'DEV', facture: 'FAC', proforma: 'PRO',
          bc: 'BC', br: 'BR', bl: 'BL', intervention: 'INT', attachement: 'ATT',
        };
        const expectedPrefix = prefixMap[merged.documentType];
        if (expectedPrefix && merged.documentNumber && !merged.documentNumber.startsWith(expectedPrefix + '-')) {
          merged.documentNumber = generateDocumentNumber(merged.documentType, merged.mode);
        }
        return merged;
    }
  } catch {}
  return createEmptyDoc(mode, initialType);
}

export function createEmptyDoc(mode: UserMode, initialType?: DocumentType): DocumentState {
  const docType: DocumentType = initialType ?? 'devis';
  const base: DocumentState = {
    mode,
    clientInfo: { name: '', address: '', phone: '', email: '', ai: '' },
    artisanInfo: mode === 'artisan' ? { name: '', address: '', phone: '' } : undefined,
    companyInfo: mode === 'entreprise'
      ? { name: '', address: '', taxIds: { nif: '', rc: '', nis: '', ai: '' }, capital: '' }
      : undefined,
    items: [],
    tvaRate: mode === 'artisan' ? 0 : 19,
    paymentMode: 'cheque',
    documentType: docType,
    documentNumber: generateDocumentNumber(docType, mode),
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
    logoSize: 'md',
    companyTagline: '',
    companyCapital: '',
    rcNumber: '',
    nisNumber: '',
    aiNumber: '',
    rib: '',
    bankName: '',
    bankAgency: '',
    ccpNumber: '',
    validityDays: 30,
    reference: '',
    showWatermark: false,
    previewTemplate: 'haussmann',
  };

  if (docType === 'attachement') {
    base.items = [
      { id: generateId(), designation: 'Tuyau cuivre Ø28mm', quantity: 4.5, unit: 'm2', unitPrice: 3200, category: 'materiaux' },
      { id: generateId(), designation: 'Tuyau cuivre Ø22mm', quantity: 4.5, unit: 'm2', unitPrice: 2600, category: 'materiaux' },
      { id: generateId(), designation: 'Tuyau cuivre Ø12mm', quantity: 16.5, unit: 'm2', unitPrice: 1400, category: 'materiaux' },
      { id: generateId(), designation: 'Raccord à sertir Ø12mm', quantity: 10, unit: 'u', unitPrice: 450, category: 'materiaux' },
      { id: generateId(), designation: 'Tuyau PPR Ø25mm', quantity: 4.0, unit: 'm2', unitPrice: 800, category: 'materiaux' },
      { id: generateId(), designation: 'Tuyau PPR Ø20mm', quantity: 3.0, unit: 'm2', unitPrice: 600, category: 'materiaux' },
      { id: generateId(), designation: 'Colle PPR Ø25mm', quantity: 2, unit: 'u', unitPrice: 350, category: 'materiaux' },
      { id: generateId(), designation: 'Colle PPR Ø20mm', quantity: 2, unit: 'u', unitPrice: 280, category: 'materiaux' },
      { id: generateId(), designation: 'Raccord à souder Ø28mm', quantity: 1, unit: 'u', unitPrice: 1200, category: 'materiaux' },
      { id: generateId(), designation: 'Raccord à souder Ø22mm', quantity: 1, unit: 'u', unitPrice: 900, category: 'materiaux' },
      { id: generateId(), designation: 'Té à souder Ø28mm', quantity: 2, unit: 'u', unitPrice: 1800, category: 'materiaux' },
      { id: generateId(), designation: 'Coudé à souder 90° Ø28mm', quantity: 3, unit: 'u', unitPrice: 1500, category: 'materiaux' },
      { id: generateId(), designation: 'Main-d\'œuvre plomberie', quantity: 8, unit: 'j', unitPrice: 5000, category: 'main_oeuvre' },
      { id: generateId(), designation: 'Transport matériaux', quantity: 1, unit: 'forfait', unitPrice: 8000, category: 'transport' },
    ];
    base.chantierAddress = 'Résidence Les Oliviers, Bloc 3, 2e étage, Alger';
    base.chantierType = 'Appartement';
    base.chantierSurface = 120;
    base.notes = 'Travaux conformes au devis initial. Réception effectuée sans réserves.';
  }

  return base;
}

export function useEditorState(initialMode?: UserMode, initialDocId?: string, initialType?: DocumentType) {
  const [draftRestored, setDraftRestored] = useState<string | null>(() => {
    if (initialDocId) return null;
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DocumentState>;
        // Don't show restoration toast if saved draft is a different type
        if (initialType && parsed.documentType && parsed.documentType !== initialType) return null;
        if (parsed.items?.length || parsed.clientInfo?.name) return 'unsaved_draft';
      }
    } catch {}
    return null;
  });
  const [doc, setDoc] = useState<DocumentState>(() => loadDraft(initialMode ?? 'artisan', initialType));
  const [step, setStep] = useState<WizardStep>(1);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<LineItem>({ id: '', designation: '', quantity: 1, unit: 'u', unitPrice: 0, category: '' });
  const [mode, setModeState] = useState<UserMode>(initialMode ?? 'artisan');
  const setMode = useCallback((newMode: UserMode) => {
    setModeState(newMode);
    setDoc(prev => {
      if (prev.mode === newMode) return prev;
      return {
        ...prev,
        mode: newMode,
        companyInfo: newMode === 'entreprise'
          ? prev.companyInfo ?? { name: '', address: '', taxIds: { nif: '', rc: '', nis: '', ai: '' }, capital: '' }
          : undefined,
        artisanInfo: newMode === 'artisan'
          ? prev.artisanInfo ?? { name: '', address: '', phone: '' }
          : undefined,
      };
    });
  }, [setDoc]);
  const [saving, setSaving] = useState(false);
  const [docId, setDocId] = useState<string | null>(initialDocId ?? null);
  const [docLoading, setDocLoading] = useState(!!initialDocId);

  const results = useMemo(() => calculateDocument(doc), [doc]);

  // Load document from API by ID
  useEffect(() => {
    if (!initialDocId) return;
    setDocLoading(true);
    fetch(`/api/documents/${initialDocId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.document) {
          const d = data.document;
          const items = (() => { try { return JSON.parse(d.items); } catch { return []; } })();
          const customFields = (() => { try { return typeof d.customFields === 'string' ? JSON.parse(d.customFields) : (d.customFields || {}); } catch { return {}; } })();
          const companyInfo = (() => { 
        try { 
          const parsed = typeof d.companyInfo === 'string' ? JSON.parse(d.companyInfo) : d.companyInfo;
          if (parsed && typeof parsed === 'object') {
            return { 
              name: '', 
              address: '', 
              taxIds: { nif: '', rc: '', nis: '', ai: '' }, 
              capital: '',
              ...parsed 
            }; 
          }
        } catch {} 
        return null; 
      })();
          setDoc(prev => {
            const editorMeta = parseEditorMeta(customFields._editorMeta);

            return {
              ...prev,
              items,
              customFields,
              documentType: (d.type || 'DEVIS').toLowerCase(),
              documentNumber: d.number || '',
              date: d.date?.split('T')[0] || prev.date,
              tvaRate: (editorMeta.tvaRate as number | undefined) ?? (d.subTotalHT > 0 ? Math.round(d.tvaAmount / d.subTotalHT * 100) : 0),
              acompte: d.acompte ?? prev.acompte,
              paymentMode: d.paymentMode || prev.paymentMode,
              mode: d.mode?.toLowerCase?.() === 'entreprise' ? 'entreprise' : 'artisan',
              notes: d.notes || '',
              companyInfo: companyInfo || prev.companyInfo,
              logoPosition: d.logoPosition || prev.logoPosition || 'right',
              logoSize: ((editorMeta.logoSize as 'sm' | 'md' | 'lg' | undefined) || prev.logoSize || 'md') as 'sm' | 'md' | 'lg',
              sectionOrder: Array.isArray(customFields.sectionOrder) && customFields.sectionOrder.length > 0
                ? customFields.sectionOrder as string[]
                : prev.sectionOrder,
              hiddenBlocks: Array.isArray(customFields.hiddenBlocks)
                ? ['signature', ...customFields.hiddenBlocks.filter((b: string) => b !== 'signature')]
                : prev.hiddenBlocks,
              validUntil: d.validUntil ? String(d.validUntil).split('T')[0] : (editorMeta.validUntil as string) || prev.validUntil,
              bcRef: d.bcRef || (editorMeta.bcRef as string) || prev.bcRef,
              brRef: d.brRef || (editorMeta.brRef as string) || prev.brRef,
              // Restore clientInfo from _editorMeta (tax fields snapshot)
              clientInfo: {
                ...prev.clientInfo,
                ...(editorMeta.clientInfo as Record<string, unknown> || {}),
              } as DocumentState['clientInfo'],
              // Restore artisanInfo
              artisanInfo: (editorMeta.artisanInfo as DocumentState['artisanInfo']) || prev.artisanInfo,
              // Restore discount
              discount: (editorMeta.discount as DocumentState['discount']) || prev.discount,
              // Restore stampDuty
              stampDuty: (editorMeta.stampDuty as DocumentState['stampDuty']) || prev.stampDuty,
              // Restore paymentDetails
              paymentDetails: (editorMeta.paymentDetails as DocumentState['paymentDetails']) || prev.paymentDetails,
              // Restore chantier
              chantierAddress: (editorMeta.chantierAddress as string) || prev.chantierAddress,
              chantierType: (editorMeta.chantierType as string) || prev.chantierType,
              chantierSurface: (editorMeta.chantierSurface as number) ?? prev.chantierSurface,
              chantierEtat: (editorMeta.chantierEtat as string) || prev.chantierEtat,
              chantierProtection: (editorMeta.chantierProtection as string) || prev.chantierProtection,
              // Restore materiaux
              materiauxMarque: (editorMeta.materiauxMarque as string) || prev.materiauxMarque,
              materiauxType: (editorMeta.materiauxType as string) || prev.materiauxType,
              materiauxCouleur: (editorMeta.materiauxCouleur as string) || prev.materiauxCouleur,
              materiauxQte: (editorMeta.materiauxQte as number) ?? prev.materiauxQte,
              // Restore garanties
              garantieMO: (editorMeta.garantieMO as string) || prev.garantieMO,
              garantieMateriaux: (editorMeta.garantieMateriaux as string) || prev.garantieMateriaux,
              garantieNotes: (editorMeta.garantieNotes as string) || prev.garantieNotes,
              // Restore devis-specific fields
              companyTagline: (editorMeta.companyTagline as string) || prev.companyTagline,
              companyCapital: (editorMeta.companyCapital as string) || prev.companyCapital,
              rcNumber: (editorMeta.rcNumber as string) || prev.rcNumber,
              nisNumber: (editorMeta.nisNumber as string) || prev.nisNumber,
              aiNumber: (editorMeta.aiNumber as string) || prev.aiNumber,
              rib: (editorMeta.rib as string) || prev.rib,
              bankName: (editorMeta.bankName as string) || prev.bankName,
              bankAgency: (editorMeta.bankAgency as string) || prev.bankAgency,
              ccpNumber: (editorMeta.ccpNumber as string) || prev.ccpNumber,
              validityDays: (editorMeta.validityDays as number) ?? prev.validityDays,
              reference: (editorMeta.reference as string) || prev.reference,
              showWatermark: (editorMeta.showWatermark as boolean) ?? prev.showWatermark,
              previewTemplate: (editorMeta.previewTemplate as 'haussmann' | 'nordic' | 'velours' | 'industrielle' | undefined) ?? prev.previewTemplate,
              objet: (editorMeta.objet as string) || prev.objet,
              docCity: (editorMeta.docCity as string) || prev.docCity,
              // Restore signature fields
              companyPhone: (editorMeta.companyPhone as string) || prev.companyPhone,
              sigClientSubtitle: (editorMeta.sigClientSubtitle as string) || prev.sigClientSubtitle,
              sigClientNameFr: (editorMeta.sigClientNameFr as string) || prev.sigClientNameFr,
              sigClientRole: (editorMeta.sigClientRole as string) || prev.sigClientRole,
              sigClientRoleFr: (editorMeta.sigClientRoleFr as string) || prev.sigClientRoleFr,
              sigClientNameAr: (editorMeta.sigClientNameAr as string) || prev.sigClientNameAr,
              sigCompanyNameFr: (editorMeta.sigCompanyNameFr as string) || prev.sigCompanyNameFr,
              sigDirectionNameFr: (editorMeta.sigDirectionNameFr as string) || prev.sigDirectionNameFr,
              sigDirectionRole: (editorMeta.sigDirectionRole as string) || prev.sigDirectionRole,
              sigDirectionNameAr: (editorMeta.sigDirectionNameAr as string) || prev.sigDirectionNameAr,
            };
          });
        }
      })
      .catch(() => {})
      .finally(() => setDocLoading(false));
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
    docLoading,
    results,
    draftRestored, setDraftRestored,
  };
}
