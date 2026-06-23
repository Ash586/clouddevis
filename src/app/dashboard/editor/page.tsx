'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { TrialGate } from '@/components/layout/TrialGate';
import { Button } from '@/components/ui/button';
import { DocumentPreview } from '@/components/editor/DocumentPreview';
import { CollapsibleSection } from '@/components/editor/CollapsibleSection';
import { ClientCombobox } from '@/components/editor/ClientCombobox';
import { SectionCreatorForm } from '@/components/editor/SectionCreatorForm';
import { useEditor } from '@/hooks/useEditor';
import { useEditorUndo } from '@/hooks/useEditorUndo';
import { useToast } from '@/components/ui/toast';
import { formatCurrency, generateDocumentNumber } from '@/lib/calculations';
import { generateDocumentHTML, generateAttachementHTML, generateDevisHTML } from '@/lib/generateDocumentHTML';
import { generateBonCommandeHTML } from '@/lib/generateBonCommandeHTML';
import { generateInterventionHTML } from '@/lib/generateInterventionHTML';
import { getDesign } from '@/lib/documentDesign';
import { validateNIF, validateRC, validateNIS, validateAI, validateLineItem } from '@/lib/validation';
import { UNIT_OPTIONS, DEFAULT_SECTION_ORDER, SECTION_FIELDS, DOC_TYPE_DEFAULT_FIELDS, DOC_TYPE_SECTIONS, ALL_CATEGORY_OPTIONS, getCategoryOptions, categoryLabelKey } from '@/types';
import type { UserMode, BlockId, SectionId, LineItem, CustomSectionDef, UnitMeasure, PaymentMode, DocumentType } from '@/types';
import type { PreviewFocus } from '@/components/editor/DocumentPreview';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';
import {
  ChevronRight, Settings, Undo2, Redo2, Save, Download, Loader2, Check,
  AlertTriangle, ListOrdered, User, FileText, Palette, CreditCard,
  MapPin, Package, Percent, Shield, StickyNote, Maximize, Eye,
  Grid3X3, Trash2, Plus, MoreHorizontal,
  ChevronDown, MonitorCheck,
  Building2, Receipt, BadgeCheck, CircleDollarSign, ScrollText, Briefcase, ClipboardList, FileStack, Wrench, Pen,
} from 'lucide-react';

function EditorContent() {
  const sp = useSearchParams();
  const modeParam = sp.get('mode') as UserMode | null;
  const docIdParam = sp.get('id');
  const rawTypeParam = sp.get('type');
  const URL_TYPE_MAP: Record<string, DocumentType> = { bon_commande: 'bc', bon_reception: 'br' };
  const typeParam = rawTypeParam ? (URL_TYPE_MAP[rawTypeParam] ?? rawTypeParam as DocumentType) : null;
  const { showToast } = useToast();
  const {
    doc, setDoc, mode, setMode,
    addingItem, setAddingItem, newItem, setNewItem,
    saving, results, draftRestored, setDraftRestored,
    updateDoc, updateClientInfo,
    updateCompanyInfo, updateTaxIds, updateArtisanInfo,
    updateDiscount, updateStampDuty, updatePaymentDetails,
    setChantierField, setMateriauxField, setGarantieField,
    toggleBlock, isBlockVisible,
    handleAddItem, handleRemoveItem, moveItem, moveSection, startNewItem, saveDoc,
    updateCustomField, docLoading,
  } = useEditor(modeParam ?? 'artisan', docIdParam ?? undefined, typeParam ?? undefined);

  const te = useTranslations('editor');
  const tu = useTranslations('preview.units');
  const tp = useTranslations('preview');
  const tc = useTranslations('common');

  const DOC_TYPE_EDITOR_LABELS: Record<string, string> = {
    devis: 'documentTypeQuote',
    facture: 'documentTypeInvoice',
    proforma: 'documentTypeProforma',
    bc: 'documentTypeBC',
    br: 'documentTypeBR',
    intervention: 'documentTypeIntervention',
    attachement: 'documentTypeAttachement',
  };
  const DOC_TYPE_PREVIEW_LABELS: Record<string, string> = {
    devis: 'docTypeQuote',
    facture: 'docTypeInvoice',
    proforma: 'docTypeProforma',
    bc: 'docTypeOrder',
    br: 'docTypeBR',
    intervention: 'docTypeIntervention',
    attachement: 'docTypeAttachement',
  };

  const [fieldPrefs, setFieldPrefs] = useState<Record<string, Record<string, string[]>> | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customSections, setCustomSections] = useState<CustomSectionDef[]>([]);
  const [showSectionCreator, setShowSectionCreator] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSectionDef | null>(null);
  const [itemErrors, setItemErrors] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('prestations');
  const [previewZoom, setPreviewZoom] = useState<'fit' | number>('fit');
  const [previewFocus, setPreviewFocus] = useState<PreviewFocus>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'totals'>('editor');
  const [showGrid, setShowGrid] = useState(false);
  const [showReadyChecks, setShowReadyChecks] = useState(false);
  const [showSectionNav, setShowSectionNav] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const { canUndo, canRedo, handleUndo, handleRedo } = useEditorUndo(doc, setDoc);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogItems, setCatalogItems] = useState<LineItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  // Left rail navigation config
  const relevantSections = DOC_TYPE_SECTIONS[doc.documentType] ?? DEFAULT_SECTION_ORDER;
  const ALL_SECTIONS: string[] = [...relevantSections, ...customSections.map(s => s.id).filter(id => !relevantSections.includes(id))];
  const sectionNavItems = useMemo(() => {
    const allItems = [
      { id: 'prestations' as SectionId, icon: ListOrdered, label: te('sections.prestations').replace(/^\d+\.\s*/, '') },
      { id: 'client' as SectionId, icon: User, label: te('sections.client').replace(/^\d+\.\s*/, '') },
      { id: 'general' as SectionId, icon: FileText, label: te('sections.general').replace(/^\d+\.\s*/, '') },
      ...(doc.documentType === 'devis' ? [{ id: 'devis' as SectionId, icon: FileText, label: 'Devis' }] : []),
      { id: 'design' as SectionId, icon: Palette, label: te('sections.design') },
      { id: 'paiement' as SectionId, icon: CreditCard, label: te('sections.paiement').replace(/^\d+\.\s*/, '') },
      { id: 'chantier' as SectionId, icon: MapPin, label: te('sections.chantier').replace(/^\d+\.\s*/, '') },
      { id: 'materiaux' as SectionId, icon: Package, label: te('sections.materiaux').replace(/^\d+\.\s*/, '') },
      { id: 'remise' as SectionId, icon: Percent, label: te('sections.remise').replace(/^\d+\.\s*/, '') },
      { id: 'garanties' as SectionId, icon: Shield, label: te('sections.garanties').replace(/^\d+\.\s*/, '') },
      { id: 'notes' as SectionId, icon: StickyNote, label: te('sections.notes') },
      ...customSections.map(cs => ({ id: cs.id as SectionId, icon: FileText, label: cs.label })),
    ];
    return allItems.filter(item => relevantSections.includes(item.id));
  }, [te, customSections, doc.documentType, relevantSections]);

  // Map section → preview focus area
  const sectionFocusMap: Record<string, PreviewFocus> = {
    prestations: 'items', client: 'client', general: 'header', design: 'header',
    paiement: 'payment', chantier: 'header', materiaux: 'header', remise: 'totals',
    garanties: 'payment', notes: null, mode: 'header', devis: 'header',
  };

  // Preview scale calculation via effect (refs can't be accessed during render)
  const [fitScale, setFitScale] = useState(0.55);
  useEffect(() => {
    if (previewZoom !== 'fit') return;
    const calc = () => {
      const container = document.getElementById('preview-scroll');
      if (container) {
        setFitScale(Math.min(1, (container.clientWidth - 48) / 794));
      }
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [previewZoom]);

  const computedScale = previewZoom === 'fit' ? fitScale : previewZoom;
  const previewReadyChecks = useMemo(() => [
    { label: tp('previewChecks.client') || 'Client', done: Boolean(doc.clientInfo.name?.trim()), section: 'client' as SectionId },
    { label: tp('previewChecks.items') || 'Articles', done: doc.items.length > 0, section: 'prestations' as SectionId },
    { label: tp('previewChecks.date') || 'Date', done: Boolean(doc.date), section: 'general' as SectionId },
  ], [doc.clientInfo.name, doc.items.length, doc.date, tp]);
  const completedPreviewChecks = previewReadyChecks.filter(check => check.done).length;

  useEffect(() => {
    if (docIdParam) return;
    fetch('/api/user/preferences')
      .then(r => r.ok ? r.json() : { fields: null })
      .then(data => {
        if (data.fields && typeof data.fields === 'object') {
          setFieldPrefs(data.fields as Record<string, Record<string, string[]>>);
        } else {
          setShowCustomizer(true);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch('/api/user/custom-sections')
      .then(r => r.ok ? r.json() : { sections: [] })
      .then(data => {
        if (Array.isArray(data.sections)) {
          setCustomSections(data.sections);
          const customIds = data.sections.map((s: CustomSectionDef) => s.id);
          setDoc(prev => ({
            ...prev,
            sectionOrder: [...prev.sectionOrder, ...customIds.filter((id: string) => !prev.sectionOrder.includes(id))]
          }));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // حقل preferences: FieldPrefs[documentType][section] = fieldId[]
  // عند عدم وجود تفضيلات محفوظة، نستخدم DOC_TYPE_DEFAULT_FIELDS
  const docType = doc.documentType as keyof typeof DOC_TYPE_DEFAULT_FIELDS;
  const defaultsForType = DOC_TYPE_DEFAULT_FIELDS[docType] ?? {};
  const userPrefsForType = fieldPrefs?.[doc.documentType] as Record<string, string[]> | undefined;

  const prefFields: Record<string, string[]> = {
    ...Object.fromEntries(DEFAULT_SECTION_ORDER.map(s => [s, userPrefsForType?.[s] ?? defaultsForType[s] ?? [...SECTION_FIELDS[s]]])),
    ...Object.fromEntries(customSections.map(cs => [cs.id, userPrefsForType?.[cs.id] ?? cs.fields.map(f => f.id)])),
  };
  const hiddenFields = new Set<string>();
  for (const section of ALL_SECTIONS) {
    const visible = prefFields[section] ?? [];
    const builtinFields = SECTION_FIELDS[section];
    if (builtinFields) {
      for (const field of builtinFields) {
        if (!visible.includes(field)) hiddenFields.add(field);
      }
    } else {
      const cs = customSections.find(c => c.id === section);
      if (cs) {
        for (const fieldDef of cs.fields) {
          if (!visible.includes(fieldDef.id)) hiddenFields.add(`custom_${section}_${fieldDef.id}`);
        }
      }
    }
  }

  async function savePreferences(fields: Record<string, string[]>) {
    // حفظ التفضيلات لكل نوع وثيقة على حدة
    const allPrefs = { ...(fieldPrefs || {}), [doc.documentType]: fields };
    setFieldPrefs(allPrefs);
    setShowCustomizer(false);
    await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: allPrefs }),
    });
  }

  const router = useRouter();

  const unitLabels: Record<string, string> = { u: tu('u'), h: tu('h'), j: tu('j'), m2: tu('m2'), m3: tu('m3'), ml: tu('ml'), kg: tu('kg'), forfait: tu('forfait') };

  const handleDownload = async () => {
    await saveDoc();
    track('Document Downloaded', { type: doc.documentType, mode: doc.mode });
    const isEnt = doc.mode === 'entreprise';
    const docTypeLabel = tp(DOC_TYPE_PREVIEW_LABELS[doc.documentType] ?? 'docTypeQuote');
    const vb = (block: string) => !doc.hiddenBlocks.includes(block as BlockId);
    const hf = new Set(hiddenFields);
    const sf = (fieldId: string) => !hf.has(fieldId);
    const bv = (...fieldIds: string[]) => fieldIds.some(f => sf(f));
    const catLabels: Record<string, string> = Object.fromEntries(
      ALL_CATEGORY_OPTIONS.filter(c => c.value).map(c => [c.value, tp(c.labelKey.replace(/^preview\./, ''))])
    );
    const paymentLabels: Record<string, string> = { cheque: te('paiement.check'), virement: te('paiement.transfer'), especes: te('paiement.cash'), cb: te('paiement.card') };

    const grouped: Record<string, typeof doc.items> = {};
    const uncategorized: typeof doc.items = [];
    for (const item of doc.items) {
      if (item.category) { if (!grouped[item.category]) grouped[item.category] = []; grouped[item.category].push(item); }
      else { uncategorized.push(item); }
    }
    const catOrder = ['preparation', 'peinture', 'finition', 'revetement', 'facade', 'enduit', 'main_oeuvre', 'materiaux', 'transport', 'divers'];

    const design = getDesign(doc.documentType);
    const html = doc.documentType === 'attachement'
      ? generateAttachementHTML({ doc, results, sf, bv, vb, tc: (k: string) => tc(k), tp: (k: string, vars?: Record<string, string | number>) => tp(k, vars as Record<string, string>), currency: tc('currency'), design })
      : doc.documentType === 'devis'
      ? generateDevisHTML({ doc, results, sf, bv, vb, tc: (k: string) => tc(k), tp: (k: string, vars?: Record<string, string | number>) => tp(k, vars as Record<string, string>), currency: tc('currency'), design })
      : doc.documentType === 'bc'
      ? generateBonCommandeHTML({ doc, results, sf, bv, vb, tc: (k: string) => tc(k), tp: (k: string, vars?: Record<string, string | number>) => tp(k, vars as Record<string, string>), currency: tc('currency'), design })
      : doc.documentType === 'intervention'
      ? generateInterventionHTML({ doc, results, sf, bv, vb, tc: (k: string) => tc(k), tp: (k: string, vars?: Record<string, string | number>) => tp(k, vars as Record<string, string>), currency: tc('currency'), design })
      : generateDocumentHTML({
        isEnt, docTypeLabel, design, vb, sf, bv, catLabels, paymentLabels, unitLabels,
        grouped, uncategorized, catOrder, doc, results,
        tc: (k: string) => tc(k),
        tp: (k: string, vars?: Record<string, unknown>) => tp(k, vars as Record<string, string>),
        te: (k: string) => te(k),
        tu: (k: string) => tu(k),
        customSections, currency: tc('currency'),
        companyTagline: doc.companyTagline,
        companyCapital: doc.companyCapital,
        rcNumber: doc.rcNumber,
        nisNumber: doc.nisNumber,
        aiNumber: doc.aiNumber,
        rib: doc.rib,
        bankName: doc.bankName,
        bankAgency: doc.bankAgency,
        ccpNumber: doc.ccpNumber,
        validityDays: doc.validityDays,
        reference: doc.reference,
      });

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) { window.print(); return; }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // Show draft restoration notification
  useEffect(() => {
    if (draftRestored === 'unsaved_draft' && doc.clientInfo.name && !docIdParam) {
      showToast(te('draftRestored' as unknown as string) || 'Brouillon restauré ✓', 'success');
    }
    if (draftRestored) setDraftRestored(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show save success notification (brief, non-obtrusive)
  const lastSaveRef = useRef(false);
  useEffect(() => {
    if (!saving && lastSaveRef.current) {
      // Document just finished saving successfully
      showToast(tc('saved') || 'Enregistré', 'success');
      lastSaveRef.current = false;
    }
    if (saving) {
      lastSaveRef.current = true;
    }
  }, [saving, showToast, tc]);


  // Keyboard shortcuts: Ctrl+S = save, Ctrl+P = print/download, Ctrl+Z = undo, Ctrl+Shift+Z = redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDoc();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleDownload();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveDoc, handleDownload, handleUndo, handleRedo]);

  // Autosave every 30 seconds — show error toast only on failure
  useEffect(() => {
    const interval = setInterval(() => {
      if (doc.items.length > 0 || doc.clientInfo.name) {
        saveDoc().catch(() => {
          showToast(te('saveError') || 'Erreur d\'enregistrement. Vérifiez votre connexion.', 'error');
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [doc.items.length, doc.clientInfo.name, saveDoc]);

  // Reset the pending new-item category when the document type changes if it's
  // no longer one of that type's categories.
  useEffect(() => {
    const valid = getCategoryOptions(doc.documentType).some(c => c.value === (newItem.category ?? ''));
    if (!valid) setNewItem(p => ({ ...p, category: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.documentType]);

  // Update preview focus when active section changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewFocus(sectionFocusMap[activeSection] ?? null);
    const timer = setTimeout(() => setPreviewFocus(null), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const renderSection = (id: SectionId): React.ReactNode => {
    const s = (blockId?: BlockId) => blockId ? { blockId, visible: isBlockVisible(blockId), onToggle: toggleBlock } : { visible: true, onToggle: () => {} };
    const dragProps = { sectionOrder: doc.sectionOrder, moveSection };

    switch (id) {
      case 'design':
        return <CollapsibleSection title={te('sections.design')} sectionId="design" {...dragProps} {...s()}>
          {mode === 'entreprise' && !hiddenFields.has('logo') && <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-[var(--navy-3)] rounded-xl border border-[rgba(15,39,71,0.08)]">
              <input type="file" accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 500 * 1024) { showToast('Logo max 500 Ko', 'error'); return; }
                  showToast('Encodage du logo…', 'info');
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const dataUrl = ev.target?.result as string;
                    updateCompanyInfo({ logo: dataUrl });
                    showToast('Logo ajouté avec succès', 'success');
                  };
                  reader.readAsDataURL(file);
                }}
                className="text-[10px] text-[var(--sand-muted)] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-[var(--green-glow)] file:text-[var(--green-3)] hover:file:bg-[var(--green-glow)] flex-1" />
              {doc.companyInfo?.logo && (
                <button onClick={() => updateCompanyInfo({ logo: '' })}
                  className="text-[10px] text-red-500 font-semibold hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-400/10 transition whitespace-nowrap">
                  {te('removeLogo') || '✕'}
                </button>
              )}
            </div>
            {!hiddenFields.has('logoPosition') && doc.companyInfo?.logo && (
              <div className="flex items-center gap-3 px-1">
                <span className="text-[10px] font-bold text-[var(--sand-muted)]">{te('logoPosition') || 'Position'}</span>
                <div className="flex bg-[var(--navy-4)] rounded-lg p-0.5 border border-[rgba(15,39,71,0.1)]">
                  <button onClick={() => updateDoc('logoPosition', 'left')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${doc.logoPosition === 'left' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]'}`}>
                    {te('logoLeft') || 'Gauche'}
                  </button>
                  <button onClick={() => updateDoc('logoPosition', 'right')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${doc.logoPosition === 'right' || !doc.logoPosition ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]'}`}>
                    {te('logoRight') || 'Droite'}
                  </button>
                </div>
              </div>
            )}
          </div>}
        </CollapsibleSection>;

      case 'general':
        return <CollapsibleSection title={te('sections.general')} sectionId="general" {...dragProps} {...s('header')}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('docNumber') && <input type="text" placeholder={te('general.docNumber')} className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.documentNumber} onChange={(e) => updateDoc('documentNumber', e.target.value)} />}
            {!hiddenFields.has('orderRef') && <input type="text" placeholder={te('general.orderRef')} className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.bcRef ?? ''} onChange={(e) => updateDoc('bcRef', e.target.value)} />}
            {!hiddenFields.has('issueDate') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('general.issueDate')}</label>
              <input type="date" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.date} onChange={(e) => updateDoc('date', e.target.value)} /></div>}
            {!hiddenFields.has('validUntil') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('general.validUntil')}</label>
              <input type="date" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.validUntil ?? ''} onChange={(e) => updateDoc('validUntil', e.target.value)} /></div>}
            {!hiddenFields.has('objet') && <div className="col-span-2">
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('fields.objet')}</label>
              <input type="text" placeholder={te('fields.objet') || 'Objet du devis'} className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.objet ?? ''} onChange={(e) => updateDoc('objet', e.target.value)} />
            </div>}
            {!hiddenFields.has('docCity') && <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('fields.docCity')}</label>
              <input type="text" placeholder={te('fields.docCity') || 'Ville'} className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.docCity ?? ''} onChange={(e) => updateDoc('docCity', e.target.value)} />
            </div>}
            {doc.documentType === 'bc' && <>
              <div className="col-span-2">
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Source de financement</label>
                <input type="text" placeholder="02 — 03 — 07" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.bc ?? {}).financementSource ?? '')} onChange={(e) => updateCustomField('bc', 'financementSource', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Code gestionnaire</label>
                <input type="text" placeholder="0699" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.bc ?? {}).codeGestionnaire ?? '')} onChange={(e) => updateCustomField('bc', 'codeGestionnaire', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Nature de prestation</label>
                <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.bc ?? {}).naturePrestation ?? '')} onChange={(e) => updateCustomField('bc', 'naturePrestation', e.target.value)}>
                  <option value="">—</option><option value="travaux">Travaux</option><option value="fournitures">Fournitures</option><option value="services">Services</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Type de dépense</label>
                <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.bc ?? {}).typeDepense ?? '')} onChange={(e) => updateCustomField('bc', 'typeDepense', e.target.value)}>
                  <option value="">—</option><option value="fonctionnement">Dépenses de fonctionnement</option><option value="equipement">Dépenses d&apos;équipement</option><option value="autre">Autre</option>
                </select>
              </div>
            </>}
          </div>
          {!hiddenFields.has('vatRate') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('general.vatRate')}</label>
            <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.tvaRate} onChange={(e) => updateDoc('tvaRate', Number(e.target.value))}>
              <option value="19">{te('general.vat19')}</option><option value="9">{te('general.vat9')}</option><option value="0">{te('general.vat0')}</option></select></div>}
          {!hiddenFields.has('stampRate') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('general.stampDuty')}</label>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampRate')}</label>
                <input type="number" step="0.1" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.rate} onChange={(e) => updateStampDuty({ rate: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampMin')}</label>
                <input type="number" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.minAmount} onChange={(e) => updateStampDuty({ minAmount: parseFloat(e.target.value) || 0 })} /></div>
              <div><label className="block text-[8px] text-[var(--sand-muted)]">{te('general.stampMax')}</label>
                <input type="number" className="w-full border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.stampDuty.maxAmount} onChange={(e) => updateStampDuty({ maxAmount: parseFloat(e.target.value) || 0 })} /></div>
            </div></div>}
        </CollapsibleSection>;

      case 'devis':
        return <CollapsibleSection title="Informations Devis" sectionId="devis" {...dragProps} {...s()} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Devise / Slogan</label>
              <input type="text" placeholder="Société de Services — Étude, Conseil & Réalisation" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyTagline ?? ''} onChange={(e) => updateDoc('companyTagline', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Capital Social</label>
              <input type="text" placeholder="100 000,00 DA" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyCapital ?? ''} onChange={(e) => updateDoc('companyCapital', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">R.C.</label>
              <input type="text" placeholder="12/B/0807586-00/09-BLIDA" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.rcNumber ?? ''} onChange={(e) => updateDoc('rcNumber', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">NIS</label>
              <input type="text" placeholder="001209250009852" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.nisNumber ?? ''} onChange={(e) => updateDoc('nisNumber', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">N° AI</label>
              <input type="text" placeholder="0925314021031" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.aiNumber ?? ''} onChange={(e) => updateDoc('aiNumber', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Référence</label>
              <input type="text" placeholder="76/2025" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.reference ?? ''} onChange={(e) => updateDoc('reference', e.target.value)} />
            </div>
          </div>
          <div className="border-t border-[rgba(15,39,71,0.08)] pt-2 mt-2 space-y-2">
            <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">Coordonnées Bancaires</h4>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">RIB</label>
              <input type="text" placeholder="021 00201 1130029324 83" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] font-mono outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.rib ?? ''} onChange={(e) => updateDoc('rib', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Banque</label>
                <input type="text" placeholder="SOCIÉTÉ GÉNÉRALE" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.bankName ?? ''} onChange={(e) => updateDoc('bankName', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Agence</label>
                <input type="text" placeholder="ALGÉRIE — AGENCE BLIDA" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.bankAgency ?? ''} onChange={(e) => updateDoc('bankAgency', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">CCP</label>
              <input type="text" placeholder="007 99999 0000391699 70" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] font-mono outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.ccpNumber ?? ''} onChange={(e) => updateDoc('ccpNumber', e.target.value)} />
            </div>
          </div>
          <div className="border-t border-[rgba(15,39,71,0.08)] pt-2 mt-2">
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Validité (jours)</label>
                <input type="number" min="1" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.validityDays ?? 30} onChange={(e) => updateDoc('validityDays', parseInt(e.target.value) || 30)} />
              </div>
              <label className="flex items-center gap-2 p-2 bg-[var(--navy-3)] rounded-xl border border-[rgba(15,39,71,0.08)] cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded text-[var(--green-3)]" checked={doc.showWatermark ?? false} onChange={(e) => updateDoc('showWatermark', e.target.checked)} />
                <span className="text-[10px] font-bold text-[var(--sand-muted)]">Filigrane DEVIS</span>
              </label>
            </div>
          </div>
        </CollapsibleSection>;

      case 'mode':
        return <CollapsibleSection title={te('sections.mode')} sectionId="mode" {...dragProps} {...s()}>
          {!hiddenFields.has('businessMode') && <label className="flex items-center gap-2 bg-[var(--green-glow)] p-2 rounded-lg border border-blue-100 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 rounded text-[var(--green-3)]" checked={mode === 'entreprise'} onChange={(e) => setMode(e.target.checked ? 'entreprise' : 'artisan')} />
            <span className="text-[10px] font-bold text-blue-800">{te('mode.enableBusiness')}</span></label>}
        </CollapsibleSection>;

      case 'client':
        return <CollapsibleSection title={te('sections.client')} sectionId="client" {...dragProps} {...s('client')}>
          {!hiddenFields.has('clientName') && <ClientCombobox value={doc.clientInfo.name} onSelect={(c) => updateClientInfo({ name: c.name, address: c.address ?? doc.clientInfo.address, phone: c.phone ?? doc.clientInfo.phone, email: c.email ?? doc.clientInfo.email, nif: c.nif ?? doc.clientInfo.nif, nis: c.nis ?? doc.clientInfo.nis, rc: c.rc ?? doc.clientInfo.rc, ai: c.ai ?? doc.clientInfo.ai })} placeholder={te('client.clientName')} />}
          {!hiddenFields.has('clientAddress') && <textarea placeholder={te('client.clientAddress')} className="w-full border p-2 rounded-lg text-[11px] h-12 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.address ?? ''} onChange={(e) => updateClientInfo({ address: e.target.value })} />}
          {!hiddenFields.has('clientPhone') && <input type="text" placeholder={te('client.clientPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.phone ?? ''} onChange={(e) => updateClientInfo({ phone: e.target.value })} />}
          <div className="border-t border-[rgba(15,39,71,0.08)] pt-2 space-y-2">
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[var(--green-3)]" />
              <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.taxIds') || 'Identifiants fiscaux'}</h4>
              <span className="text-[8px] text-red-400 font-bold">DGI *</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {!hiddenFields.has('clientNif') && <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('client.clientNif')} <span className="text-red-400">*</span></label>
                <input type="text" placeholder="00000000000" maxLength={11} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.clientInfo.nif && !validateNIF(doc.clientInfo.nif) ? 'border-red-400/40 focus:ring-red-400 bg-[rgba(232,84,46,0.08)]' : 'focus:ring-[var(--green-2)]'}`} value={doc.clientInfo.nif ?? ''} onChange={(e) => updateClientInfo({ nif: e.target.value })} />
                {doc.clientInfo.nif && !validateNIF(doc.clientInfo.nif) && <span className="text-[8px] text-red-500">11 chiffres requis</span>}
              </div>}
              {!hiddenFields.has('clientNis') && <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('client.clientNis') || 'NIS'} <span className="text-red-400">*</span></label>
                <input type="text" placeholder="0000000000" maxLength={10} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.clientInfo.nis && !validateNIS(doc.clientInfo.nis) ? 'border-red-400/40 focus:ring-red-400 bg-[rgba(232,84,46,0.08)]' : 'focus:ring-[var(--green-2)]'}`} value={doc.clientInfo.nis ?? ''} onChange={(e) => updateClientInfo({ nis: e.target.value })} />
                {doc.clientInfo.nis && !validateNIS(doc.clientInfo.nis) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
              </div>}
              {!hiddenFields.has('clientRc') && <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('client.clientRc') || 'RC'} <span className="text-red-400">*</span></label>
                <input type="text" placeholder="16/00-0000000" className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.clientInfo.rc && !validateRC(doc.clientInfo.rc) ? 'border-red-400/40 focus:ring-red-400 bg-[rgba(232,84,46,0.08)]' : 'focus:ring-[var(--green-2)]'}`} value={doc.clientInfo.rc ?? ''} onChange={(e) => updateClientInfo({ rc: e.target.value })} />
                {doc.clientInfo.rc && !validateRC(doc.clientInfo.rc) && <span className="text-[8px] text-red-500">Format RC invalide</span>}
              </div>}
              {!hiddenFields.has('clientAi') && <div>
                <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('client.clientAi') || 'AI'} <span className="text-red-400">*</span></label>
                <input type="text" placeholder="0000000000" maxLength={10} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.clientInfo.ai && !validateAI(doc.clientInfo.ai) ? 'border-red-400/40 focus:ring-red-400 bg-[rgba(232,84,46,0.08)]' : 'focus:ring-[var(--green-2)]'}`} value={doc.clientInfo.ai ?? ''} onChange={(e) => updateClientInfo({ ai: e.target.value })} />
                {doc.clientInfo.ai && !validateAI(doc.clientInfo.ai) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
              </div>}
            </div>
            {(!doc.clientInfo.nif || !doc.clientInfo.nis || !doc.clientInfo.rc || !doc.clientInfo.ai) && (
              <div className="flex items-center gap-1.5 bg-[rgba(212,168,67,0.08)] border border-[rgba(212,168,67,0.15)] rounded-lg px-2.5 py-1.5">
                <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                <span className="text-[9px] text-amber-300 font-medium">{te('client.taxIdsWarning') || 'NIF, NIS, RC et AI sont obligatoires pour la conformité DGI'}</span>
              </div>
            )}
          </div>
          {!hiddenFields.has('clientEmail') && <div className="flex items-center gap-2 pt-1">
            <input type="text" placeholder={te('client.companyEmail')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.email ?? ''} onChange={(e) => updateClientInfo({ email: e.target.value })} /></div>}
          {mode === 'artisan' && doc.artisanInfo && <div className="border-t border-[rgba(15,39,71,0.08)] pt-2 space-y-2">
            <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.yourInfo')}</h4>
            <input type="text" placeholder={te('client.yourName')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.name} onChange={(e) => updateArtisanInfo({ name: e.target.value })} />
            <input type="text" placeholder={te('client.yourAddress')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.address} onChange={(e) => updateArtisanInfo({ address: e.target.value })} />
            <input type="text" placeholder={te('client.yourPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.phone ?? ''} onChange={(e) => updateArtisanInfo({ phone: e.target.value })} />
          </div>}
          {mode === 'entreprise' && doc.companyInfo && <div className="border-t border-[rgba(15,39,71,0.08)] pt-2 space-y-2">
            <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.yourCompany')}</h4>
            <input type="text" placeholder={te('client.companyName')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyInfo.name} onChange={(e) => updateCompanyInfo({ name: e.target.value })} />
            <input type="text" placeholder={te('client.companyAddress')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyInfo.address} onChange={(e) => updateCompanyInfo({ address: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input type="text" placeholder={te('client.companyNif')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.nif && !validateNIF(doc.companyInfo.taxIds.nif) ? 'border-red-400/40 focus:ring-red-400 bg-[rgba(232,84,46,0.08)]' : 'focus:ring-[var(--green-2)]'}`} value={doc.companyInfo.taxIds.nif} onChange={(e) => updateTaxIds({ nif: e.target.value })} />
                {doc.companyInfo.taxIds.nif && !validateNIF(doc.companyInfo.taxIds.nif) && <span className="text-[8px] text-red-500">11 chiffres requis</span>}
              </div>
              <div>
                <input type="text" placeholder={te('client.companyRc')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.rc && !validateRC(doc.companyInfo.taxIds.rc) ? 'border-red-400/40 focus:ring-red-400 bg-[rgba(232,84,46,0.08)]' : 'focus:ring-[var(--green-2)]'}`} value={doc.companyInfo.taxIds.rc} onChange={(e) => updateTaxIds({ rc: e.target.value })} />
                {doc.companyInfo.taxIds.rc && !validateRC(doc.companyInfo.taxIds.rc) && <span className="text-[8px] text-red-500">Format RC invalide</span>}
              </div>
              <div>
                <input type="text" placeholder={te('client.companyNis')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.nis && !validateNIS(doc.companyInfo.taxIds.nis) ? 'border-red-400/40 focus:ring-red-400 bg-[rgba(232,84,46,0.08)]' : 'focus:ring-[var(--green-2)]'}`} value={doc.companyInfo.taxIds.nis} onChange={(e) => updateTaxIds({ nis: e.target.value })} />
                {doc.companyInfo.taxIds.nis && !validateNIS(doc.companyInfo.taxIds.nis) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
              </div>
              <div>
                <input type="text" placeholder={te('client.companyAi')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.ai && !validateAI(doc.companyInfo.taxIds.ai) ? 'border-red-400/40 focus:ring-red-400 bg-[rgba(232,84,46,0.08)]' : 'focus:ring-[var(--green-2)]'}`} value={doc.companyInfo.taxIds.ai} onChange={(e) => updateTaxIds({ ai: e.target.value })} />
                {doc.companyInfo.taxIds.ai && !validateAI(doc.companyInfo.taxIds.ai) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
              </div>
            </div></div>}
        </CollapsibleSection>;

      case 'chantier':
        return <CollapsibleSection title={te('sections.chantier')} sectionId="chantier" {...dragProps} {...s('chantier')} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('chantierAddress') && <div className="col-span-2"><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('chantier.address')}</label>
              <input type="text" placeholder={te('chantier.addressPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierAddress} onChange={(e) => setChantierField('chantierAddress', e.target.value)} /></div>}
            {!hiddenFields.has('chantierType') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('chantier.type')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierType} onChange={(e) => setChantierField('chantierType', e.target.value)}>
                <option value={te('chantier.options.apartment')}>{te('chantier.options.apartment')}</option><option value={te('chantier.options.house')}>{te('chantier.options.house')}</option><option value={te('chantier.options.commercial')}>{te('chantier.options.commercial')}</option><option value={te('chantier.options.office')}>{te('chantier.options.office')}</option><option value={te('chantier.options.facade')}>{te('chantier.options.facade')}</option><option value={te('chantier.options.other')}>{te('chantier.options.other')}</option></select></div>}
            {!hiddenFields.has('chantierCondition') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('chantier.condition')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierEtat} onChange={(e) => setChantierField('chantierEtat', e.target.value)}>
                <option value={te('chantier.conditionNew')}>{te('chantier.conditionNew')}</option><option value={te('chantier.conditionRenovation')}>{te('chantier.conditionRenovation')}</option></select></div>}
            {!hiddenFields.has('chantierSurface') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('chantier.surface')}</label>
              <input type="number" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierSurface || ''} onChange={(e) => setChantierField('chantierSurface', parseFloat(e.target.value) || 0)} /></div>}
            {!hiddenFields.has('chantierProtection') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('chantier.protection')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.chantierProtection} onChange={(e) => setChantierField('chantierProtection', e.target.value)}>
                <option value={te('chantier.protectionProvider')}>{te('chantier.protectionProvider')}</option><option value={te('chantier.protectionClient')}>{te('chantier.protectionClient')}</option><option value={te('chantier.protectionNone')}>{te('chantier.protectionNone')}</option></select></div>}
          </div>
        </CollapsibleSection>;

      case 'materiaux':
        return <CollapsibleSection title={te('sections.materiaux')} sectionId="materiaux" {...dragProps} {...s('materiaux')} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('materiauxBrand') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('materiaux.brand')}</label>
              <input type="text" placeholder={te('materiaux.brandPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.materiauxMarque} onChange={(e) => setMateriauxField('materiauxMarque', e.target.value)} /></div>}
            {!hiddenFields.has('materiauxType') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('materiaux.type')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.materiauxType} onChange={(e) => setMateriauxField('materiauxType', e.target.value)}>
                <option value={te('materiaux.options.acrylicMat')}>{te('materiaux.options.acrylicMat')}</option><option value={te('materiaux.options.acrylicSatin')}>{te('materiaux.options.acrylicSatin')}</option><option value={te('materiaux.options.glycéro')}>{te('materiaux.options.glycéro')}</option><option value={te('materiaux.options.floor')}>{te('materiaux.options.floor')}</option><option value={te('materiaux.options.decorative')}>{te('materiaux.options.decorative')}</option><option value={te('materiaux.options.other')}>{te('materiaux.options.other')}</option></select></div>}
            {!hiddenFields.has('materiauxColor') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('materiaux.color')}</label>
              <input type="text" placeholder={te('materiaux.colorPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.materiauxCouleur} onChange={(e) => setMateriauxField('materiauxCouleur', e.target.value)} /></div>}
            {!hiddenFields.has('materiauxQty') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('materiaux.quantity')}</label>
              <input type="number" placeholder={te('materiaux.quantityPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.materiauxQte || ''} onChange={(e) => setMateriauxField('materiauxQte', parseFloat(e.target.value) || 0)} /></div>}
          </div>
        </CollapsibleSection>;

      case 'prestations':
        return !hiddenFields.has('itemsTable') ? <CollapsibleSection title={te('sections.prestations')} sectionId="prestations" {...dragProps} {...s('table')}>
          {addingItem && <div className="bg-[var(--navy-3)] p-2 rounded-xl border space-y-1.5">
            <input type="text" placeholder={te('prestations.description')} className="w-full bg-[var(--navy-2)] border p-1.5 sm:p-2 rounded-lg text-[11px] font-medium outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={newItem.designation} onChange={(e) => setNewItem(p => ({ ...p, designation: e.target.value }))} />
            <input type="text" placeholder={te('prestations.subDescription') || 'Description (optionnel)'} className="w-full bg-[var(--navy-2)] border p-1.5 sm:p-2 rounded-lg text-[10px] italic text-gray-500 outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={newItem.description ?? ''} onChange={(e) => setNewItem(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] leading-relaxed">{te('prestations.qty')}</label>
                <input type="number" className="w-full border p-1.5 sm:p-2 rounded-lg text-[11px] bg-[var(--navy-2)] text-center outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: parseFloat(e.target.value) || 0 }))} /></div>
              <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] leading-relaxed">{te('prestations.unit')}</label>
                <select className="w-full border p-1.5 sm:p-2 rounded-lg text-[10px] bg-[var(--navy-2)] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={newItem.unit} onChange={(e) => setNewItem(p => ({ ...p, unit: e.target.value as UnitMeasure }))}>
                  {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{tu(u.labelKey)}</option>)}</select></div>
              <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] leading-relaxed">{te('prestations.unitPrice')}</label>
                <input type="number" className="w-full border p-1.5 sm:p-2 rounded-lg text-[11px] bg-[var(--navy-2)] text-right outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={newItem.unitPrice} onChange={(e) => setNewItem(p => ({ ...p, unitPrice: parseFloat(e.target.value) || 0 }))} /></div>
              <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] leading-relaxed">{te('prestations.category')}</label>
                <select className="w-full border p-1.5 sm:p-2 rounded-lg text-[10px] bg-[var(--navy-2)] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={newItem.category ?? ''} onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))}>
                  {getCategoryOptions(doc.documentType).map(c => <option key={c.value} value={c.value}>{tp(c.labelKey.replace(/^preview\./, ''))}</option>)}</select></div>
            </div>
            <div className="space-y-2">
              {!newItem.designation && (
                <div className="text-[10px] text-red-400 bg-[rgba(232,84,46,0.1)] px-3 py-1.5 rounded-lg border border-red-400/20">
                  {te('error.designationRequired') || '✕ Description requise'}
                </div>
              )}
              {newItem.designation && newItem.unitPrice <= 0 && (
                <div className="text-[10px] text-red-400 bg-[rgba(232,84,46,0.1)] px-3 py-1.5 rounded-lg border border-red-400/20">
                  {te('error.priceRequired') || '✕ Le prix doit être > 0'}
                </div>
              )}
              <div className="flex gap-1.5">
                <button onClick={() => { const v = validateLineItem(newItem); if (!v.valid) { setItemErrors(Object.values(v.errors)[0] ?? null); return; } setItemErrors(null); handleAddItem(); }} disabled={!newItem.designation || newItem.unitPrice <= 0} className="flex-1 sm:flex-none bg-[var(--green-3)] text-[var(--navy-2)] text-[11px] font-bold px-4 py-2 min-h-[44px] rounded-lg hover:bg-[var(--green-2)] disabled:opacity-50 disabled:bg-[var(--navy-3)] disabled:text-[var(--sand-muted)] disabled:cursor-not-allowed flex items-center justify-center gap-1 transition"><Plus size={14} /><span>Ajouter</span></button>
                <button onClick={() => { setAddingItem(false); setItemErrors(null); }} className="bg-[rgba(232,84,46,0.08)]0/20 text-red-400 text-[11px] font-bold px-4 py-2 min-h-[44px] rounded-lg hover:bg-[rgba(232,84,46,0.08)]0/30 flex items-center justify-center transition" title="Cancel"><Trash2 size={14} /></button>
              </div>
            </div>
            {newItem.designation && newItem.unitPrice > 0 && (
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[var(--green-glow)] rounded-lg ring-1 ring-[rgba(37,99,235,0.2)]">
                <span className="text-[10px] text-[var(--green-3)] font-medium">{te('prestations.lineTotal') || 'Total ligne'}</span>
                <span className="text-[13px] font-bold text-[var(--green-3)]">{(newItem.quantity * newItem.unitPrice).toLocaleString('fr-DZ')} {tc('currency')}</span>
              </div>
            )}
            {itemErrors && <div className="text-[10px] text-red-400 bg-[rgba(232,84,46,0.1)] px-3 py-1.5 rounded-lg border border-red-400/20">{itemErrors}</div>}
          </div>}
          {doc.items.map((item, idx) => (
            <div key={item.id} draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
              onDragEnter={(e) => e.preventDefault()}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={() => { if (dragIdx !== null && dragIdx !== idx) { moveItem(dragIdx, idx); } setDragIdx(null); setDragOverIdx(null); }}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              className={`bg-[var(--navy-3)] p-2 sm:p-3 rounded-xl border space-y-1.5 transition-all ${dragOverIdx === idx ? 'border-[var(--green-2)] shadow-md scale-[1.02]' : 'border-[rgba(15,39,71,0.1)]'} ${dragIdx === idx ? 'opacity-40' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[var(--sand-muted)] cursor-grab active:cursor-grabbing text-[14px] select-none px-0.5" title={te('dragToReorder') || 'Drag to reorder'} role="img" aria-label="Drag handle">⠿</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-medium text-[var(--sand-2)] truncate block">{item.designation}</span>
                    {item.category && <span className="text-[8px] text-[var(--sand-muted)] uppercase">{tp((categoryLabelKey(item.category) ?? 'preview.categories.none').replace(/^preview\./, ''))}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                  <button onClick={() => idx > 0 && moveItem(idx, idx - 1)} disabled={idx === 0} className="text-[var(--sand-muted)] hover:text-[var(--sand)] disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[rgba(15,39,71,0.08)] transition" title="Move up" aria-label="Move item up"><ChevronRight size={14} className="rotate-[270deg]" /></button>
                  <button onClick={() => idx < doc.items.length - 1 && moveItem(idx, idx + 1)} disabled={idx === doc.items.length - 1} className="text-[var(--sand-muted)] hover:text-[var(--sand)] disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[rgba(15,39,71,0.08)] transition" title="Move down" aria-label="Move item down"><ChevronRight size={14} className="rotate-90" /></button>
                  <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[rgba(232,84,46,0.08)]0/10 transition" title="Delete" aria-label="Delete item"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-[10px] text-[var(--sand-muted)]">
                <span>{te('prestations.qtyLabel')} <strong>{item.quantity}</strong></span>
                <span>{te('prestations.puLabel')} <strong>{item.unitPrice.toLocaleString('fr-DZ')}</strong></span>
                <span>{te('prestations.vatLabel')} <strong>{doc.tvaRate}%</strong></span>
                <span>{te('prestations.unitLabel')} <strong>{unitLabels[item.unit] ?? item.unit}</strong></span>
                <span className="text-right font-bold text-[var(--sand)]">{(item.quantity * item.unitPrice).toLocaleString('fr-DZ')} {tc('currency')}</span>
              </div>
            </div>
          ))}
          {!addingItem && <div className="flex gap-2">
            <button onClick={startNewItem} className="flex-1 py-3 sm:py-2.5 border-2 border-dashed border-[rgba(15,39,71,0.12)] rounded-xl text-[var(--sand-muted)] font-bold hover:bg-[var(--navy-4)] transition text-[11px] min-h-[44px]">{te('prestations.addLine')}</button>
            <button onClick={async () => {
              setCatalogLoading(true); setShowCatalog(true);
              try {
                const res = await fetch('/api/documents?limit=30');
                const data = await res.json();
                const seen = new Set<string>();
                const all: LineItem[] = [];
                for (const d of data.documents ?? []) {
                  const items: LineItem[] = typeof d.items === 'string' ? (JSON.parse(d.items) || []) : (d.items || []);
                  for (const item of items) {
                    if (item.designation && !seen.has(item.designation)) {
                      seen.add(item.designation);
                      all.push(item);
                    }
                  }
                }
                setCatalogItems(all);
              } catch { setCatalogItems([]); }
              setCatalogLoading(false);
            }} className="py-3 sm:py-2.5 px-3 border-2 border-dashed border-[rgba(37,99,235,0.25)] rounded-xl text-[var(--green-3)] font-bold hover:bg-[var(--green-glow)] transition text-[11px] min-h-[44px] flex items-center justify-center" title={te('catalog') || 'Catalogue'}><Package size={16} /></button>
          </div>}
          {/* Catalog Modal */}
          {showCatalog && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowCatalog(false)}>
              <div className="bg-[var(--navy-2)] w-full sm:max-w-md sm:mx-3 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-center pt-2 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-[var(--navy-4)]" /></div>
                <div className="px-4 py-3 border-b border-[rgba(15,39,71,0.08)] flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-[var(--sand)]">{te('catalog') || 'Catalogue articles'}</h3>
                  <button onClick={() => setShowCatalog(false)} className="text-[var(--sand-muted)] hover:text-[var(--sand)] p-1">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {catalogLoading ? (
                    <div className="text-center py-8 text-[var(--sand-muted)] text-[11px]">{tc('loading')}</div>
                  ) : catalogItems.length === 0 ? (
                    <div className="text-center py-8 text-[var(--sand-muted)] text-[11px]">{te('catalogEmpty') || 'Aucun article trouvé'}</div>
                  ) : catalogItems.map((item, i) => (
                    <button key={`${item.designation}-${i}`} onClick={() => {
                      setNewItem({ id: '', designation: item.designation, quantity: 1, unit: item.unit, unitPrice: item.unitPrice, category: item.category ?? '' });
                      setAddingItem(true);
                      setShowCatalog(false);
                    }} className="w-full text-left p-2.5 rounded-xl hover:bg-[var(--navy-4)] border border-transparent hover:border-[rgba(15,39,71,0.12)] transition flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-medium text-[var(--sand-2)] truncate">{item.designation}</div>
                        {item.category && <div className="text-[8px] text-[var(--sand-muted)] uppercase mt-0.5">{tp((categoryLabelKey(item.category) ?? 'preview.categories.none').replace(/^preview\./, ''))}</div>}
                      </div>
                      <div className="text-[11px] font-bold text-[var(--green-3)] whitespace-nowrap">{item.unitPrice.toLocaleString('fr-DZ')} {tc('currency')}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CollapsibleSection> : null;

      case 'remise':
        return <CollapsibleSection title={te('sections.remise')} sectionId="remise" {...dragProps} {...s('remise')} defaultOpen={false}>
          <div className="grid grid-cols-3 gap-2 items-end">
            {!hiddenFields.has('remiseType') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('remise.type')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.discount.type} onChange={(e) => updateDiscount({ type: e.target.value as 'percentage' | 'fixed' })}>
                <option value="percentage">{te('remise.pct')}</option><option value="fixed">{te('remise.amount')}</option></select></div>}
            {!hiddenFields.has('remiseValue') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{doc.discount.type === 'percentage' ? te('remise.valuePct') : te('remise.valueDA')}</label>
              <input type="number" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.discount.value} onChange={(e) => updateDiscount({ value: parseFloat(e.target.value) || 0 })} /></div>}
            {!hiddenFields.has('remiseReason') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('remise.reason')}</label>
              <input type="text" placeholder={te('remise.reasonPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.discount.reason} onChange={(e) => updateDiscount({ reason: e.target.value })} /></div>}
          </div>
          {doc.discount.value > 0 && <div className="text-[10px] text-[var(--green-3)] bg-[rgba(37,99,235,0.08)] p-2 rounded-lg font-medium">
            {te('remise.display')} {doc.discount.type === 'percentage' ? `${doc.discount.value}%` : `${formatCurrency(doc.discount.value, tc('currency'))}`}{doc.discount.reason ? ` (${doc.discount.reason})` : ''} : -{formatCurrency(results.discountAmount, tc('currency'))}</div>}
        </CollapsibleSection>;

      case 'garanties':
        return <CollapsibleSection title={te('sections.garanties')} sectionId="garanties" {...dragProps} {...s('garanties')} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('garantieLabor') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('garanties.labor')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.garantieMO} onChange={(e) => setGarantieField('garantieMO', e.target.value)}>
                <option value={te('garanties.year1')}>{te('garanties.year1')}</option><option value={te('garanties.year2')}>{te('garanties.year2')}</option><option value={te('garanties.year5')}>{te('garanties.year5')}</option><option value={te('garanties.year10')}>{te('garanties.year10')}</option><option value={te('garanties.none')}>{te('garanties.none')}</option></select></div>}
            {!hiddenFields.has('garantieMaterials') && <div><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('garanties.materials')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.garantieMateriaux} onChange={(e) => setGarantieField('garantieMateriaux', e.target.value)}>
                <option value={te('garanties.year1')}>{te('garanties.year1')}</option><option value={te('garanties.year2')}>{te('garanties.year2')}</option><option value={te('garanties.year5')}>{te('garanties.year5')}</option><option value={te('garanties.year10')}>{te('garanties.year10')}</option><option value={te('garanties.none')}>{te('garanties.none')}</option></select></div>}
            {!hiddenFields.has('garantieNotes') && <div className="col-span-2"><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{te('garanties.notes')}</label>
              <textarea placeholder={te('garanties.notesPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] h-14 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.garantieNotes} onChange={(e) => setGarantieField('garantieNotes', e.target.value)} /></div>}
          </div>
        </CollapsibleSection>;

      case 'paiement':
        return <CollapsibleSection title={te('sections.paiement')} sectionId="paiement" {...dragProps} {...s('payment')}>
          <div className="grid grid-cols-2 gap-2">
            {!hiddenFields.has('paymentMethod') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('paiement.method')}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.paymentMode} onChange={(e) => updateDoc('paymentMode', e.target.value as PaymentMode)}>
                <option value="cheque">{te('paiement.check')}</option><option value="virement">{te('paiement.transfer')}</option><option value="especes">{te('paiement.cash')}</option><option value="cb">{te('paiement.card')}</option></select></div>}
            {!hiddenFields.has('paymentDeposit') && <div><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('paiement.deposit')}</label>
              <input type="number" min="0" step="100" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.acompte ?? 0} onChange={(e) => updateDoc('acompte', parseFloat(e.target.value) || 0)} /></div>}
            {!hiddenFields.has('paymentConditions') && <div className="col-span-2"><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('paiement.conditions')}</label>
              <input type="text" placeholder={te('paiement.conditionsPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.paymentDetails.terms} onChange={(e) => updatePaymentDetails({ terms: e.target.value })} /></div>}
            {!hiddenFields.has('paymentIban') && <div className="col-span-2"><label className="block text-[10px] font-bold text-[var(--sand-muted)] mb-0.5">{te('paiement.iban')}</label>
              <input type="text" placeholder={te('paiement.ibanPlaceholder')} className="w-full border p-2 rounded-lg text-[11px] font-mono outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.paymentDetails.iban} onChange={(e) => updatePaymentDetails({ iban: e.target.value })} /></div>}
          </div>
          <div className="border-t border-[rgba(15,39,71,0.08)] pt-2 space-y-1">
            <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.totalHT')}</span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.subTotalHT, tc('currency'))}</span></div>
            {results.discountAmount > 0 && <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.remise')}</span><span className="font-semibold text-red-500">-{formatCurrency(results.discountAmount, tc('currency'))}</span></div>}
            {results.tvaRate > 0 && <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.vatLine', { rate: results.tvaRate })}</span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.tvaAmount, tc('currency'))}</span></div>}
            {results.timbreFiscal > 0 && <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.stampDuty')}</span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.timbreFiscal, tc('currency'))}</span></div>}
            {results.acompte > 0 && <div className="flex justify-between text-[10px] text-[var(--sand-muted)]"><span>{te('paiement.depositPaid')}</span><span className="font-semibold text-red-500">-{formatCurrency(results.acompte, tc('currency'))}</span></div>}
            <div className="flex justify-between text-[11px] font-bold text-[var(--sand)] border-t border-[rgba(15,39,71,0.1)] pt-1"><span>{te('paiement.netToPay')}</span><span className="text-[var(--green-3)]">{formatCurrency(results.netAPayer, tc('currency'))}</span></div>
          </div>
        </CollapsibleSection>;

      case 'notes':
        return <CollapsibleSection title={te('sections.notes')} sectionId="notes" {...dragProps} {...s()}>
          {!hiddenFields.has('notes') && <textarea placeholder={te('notes.placeholder')} className="w-full border p-2 rounded-lg text-[11px] h-16 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.notes ?? ''} onChange={(e) => updateDoc('notes', e.target.value)} />}
        </CollapsibleSection>;

      // Intervention sections
      case 'equipement':
        return <CollapsibleSection title={te('sections.equipement') || 'Équipement'} sectionId="equipement" {...dragProps} {...s()}>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Désignation</label>
              <input type="text" placeholder="Ex: Climatiseur Split..." className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.intervention ?? {}).equipementDesignation ?? '')} onChange={(e) => updateCustomField('intervention', 'equipementDesignation', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Type</label>
              <input type="text" placeholder="Ex: Marque — Modèle" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.intervention ?? {}).equipementType ?? '')} onChange={(e) => updateCustomField('intervention', 'equipementType', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">N° Série</label>
              <input type="text" placeholder="Numéro de série" className="w-full bg-[var(--navy-3)] border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.intervention ?? {}).equipementSerie ?? '')} onChange={(e) => updateCustomField('intervention', 'equipementSerie', e.target.value)} />
            </div>
          </div>
        </CollapsibleSection>;

      case 'visite':
        return <CollapsibleSection title={te('sections.visite') || 'Visite'} sectionId="visite" {...dragProps} {...s()}>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Type de visite</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.intervention ?? {}).typeVisite ?? '')} onChange={(e) => updateCustomField('intervention', 'typeVisite', e.target.value)}>
                <option value="">—</option>
                <option value="routine">Maintenance routière</option>
                <option value="depannage">Dépannage</option>
                <option value="installation">Installation</option>
                <option value="revision">Révision annuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Durée (heures)</label>
              <input type="number" step="0.5" min="0" placeholder="1.5" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={Number((doc.customFields.intervention ?? {}).duree ?? 0) || ''} onChange={(e) => updateCustomField('intervention', 'duree', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Intervenants (séparé par ,)</label>
              <input type="text" placeholder="Ex: Ahmed, Mohamed" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.intervention ?? {}).intervenants ?? '')} onChange={(e) => updateCustomField('intervention', 'intervenants', e.target.value)} />
            </div>
          </div>
        </CollapsibleSection>;

      case 'verifications':
        return <CollapsibleSection title={te('sections.verifications') || 'Vérifications'} sectionId="verifications" {...dragProps} {...s()}>
          <div className="text-[10px] text-[var(--sand-muted)] mb-2">Entrez une vérification par ligne</div>
          <textarea placeholder="Ex: Pression gaz&#10;Fonctionnement compresseur&#10;Vitesse ventilation" className="w-full border p-2 rounded-lg text-[11px] h-20 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={Array.isArray((doc.customFields.intervention ?? {}).verifications) ? ((doc.customFields.intervention ?? {}).verifications as string[]).join('\n') : ''} onChange={(e) => updateCustomField('intervention', 'verifications', e.target.value.split('\n').filter(l => l.trim()))} />
        </CollapsibleSection>;

      case 'travaux':
        return <CollapsibleSection title={te('sections.travaux') || 'Travaux effectués'} sectionId="travaux" {...dragProps} {...s()}>
          <div className="text-[10px] text-[var(--sand-muted)] mb-2">Entrez un travail par ligne</div>
          <textarea placeholder="Remplacement du filtre&#10;Nettoyage conduits&#10;Test de performance" className="w-full border p-2 rounded-lg text-[11px] h-20 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={Array.isArray((doc.customFields.intervention ?? {}).travaux) ? ((doc.customFields.intervention ?? {}).travaux as string[]).join('\n') : ''} onChange={(e) => updateCustomField('intervention', 'travaux', e.target.value.split('\n').filter(l => l.trim()))} />
        </CollapsibleSection>;

      case 'pieces':
        return <CollapsibleSection title={te('sections.pieces') || 'Pièces utilisées'} sectionId="pieces" {...dragProps} {...s()}>
          <div className="text-[10px] text-[var(--sand-muted)] mb-2">Entrez une pièce par ligne</div>
          <textarea placeholder="Filtre F7 - 1 unité (utilisée)&#10;Joint d'étanchéité (à commander)" className="w-full border p-2 rounded-lg text-[11px] h-20 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={Array.isArray((doc.customFields.intervention ?? {}).pieces) ? ((doc.customFields.intervention ?? {}).pieces as string[]).join('\n') : ''} onChange={(e) => updateCustomField('intervention', 'pieces', e.target.value.split('\n').filter(l => l.trim()))} />
        </CollapsibleSection>;

      case 'etat':
        return <CollapsibleSection title={te('sections.etat') || 'État appareil'} sectionId="etat" {...dragProps} {...s()}>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">État général</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.intervention ?? {}).etatAppareil ?? '')} onChange={(e) => updateCustomField('intervention', 'etatAppareil', e.target.value)}>
                <option value="">—</option>
                <option value="bon">Bon état — Fonctionnement normal</option>
                <option value="acceptable">État acceptable — Fonctionnement dégradé</option>
                <option value="mauvais">Mauvais état — Dépannage nécessaire</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">Défauts constatés</label>
              <textarea placeholder="Décrivez les défauts et dysfonctionnements..." className="w-full border p-2 rounded-lg text-[11px] h-16 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={String((doc.customFields.intervention ?? {}).defauts ?? '')} onChange={(e) => updateCustomField('intervention', 'defauts', e.target.value)} />
            </div>
          </div>
        </CollapsibleSection>;

      default: {
        const cs = customSections.find(c => c.id === id);
        if (cs) return renderCustomSection(cs, dragProps, s);
        return null;
      }
    }
  };

  function renderCustomSection(cs: CustomSectionDef, dragProps: { sectionOrder: string[]; moveSection: (id: string, dir: 'up' | 'down') => void }, s: (blockId?: BlockId) => { blockId?: BlockId; visible: boolean; onToggle: (b: BlockId) => void }): React.ReactNode {
    return (
      <CollapsibleSection title={cs.label} sectionId={cs.id} {...dragProps} {...s()} defaultOpen={true}>
        {cs.fields.map(field => {
          const hiddenKey = `custom_${cs.id}_${field.id}`;
          if (hiddenFields.has(hiddenKey)) return null;
          const val = String((doc.customFields[cs.id] ?? {})[field.id] ?? '');
          const onChange = (v: string | number) => updateCustomField(cs.id, field.id, v);
          switch (field.type) {
            case 'text':
            case 'number':
              return <div key={field.id}><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{field.label}</label><input type={field.type} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={val} onChange={(e) => onChange(field.type === 'number' ? (parseFloat(e.target.value) || '') : e.target.value)} /></div>;
            case 'date':
              return <div key={field.id}><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{field.label}</label><input type="date" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={val} onChange={(e) => onChange(e.target.value)} /></div>;
            case 'textarea':
              return <div key={field.id}><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{field.label}</label><textarea className="w-full border p-2 rounded-lg text-[11px] h-14 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={val} onChange={(e) => onChange(e.target.value)} /></div>;
            case 'select':
              return <div key={field.id}><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{field.label}</label><select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={val} onChange={(e) => onChange(e.target.value)}>{field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>;
          }
        })}
      </CollapsibleSection>
    );
  }

  return (
    <TrialGate>
      <div className="h-screen flex flex-col bg-[var(--navy)] text-[var(--sand)] font-sans print:bg-white overflow-hidden">

        {docLoading && (
          <div className="absolute inset-0 z-[200] flex items-center justify-center bg-[var(--navy)]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[var(--green-3)]" />
              <span className="text-sm text-[var(--sand-muted)]">Chargement du document…</span>
            </div>
          </div>
        )}

        {/* ═══════════════ COMMAND BAR ═══════════════ */}
        <div className="no-print h-14 flex items-center px-4 bg-[var(--navy-2)] border-b border-[rgba(15,39,71,0.08)] z-50 shrink-0 gap-3">
          {/* Left: Nav back + Doc type selector */}
          <button onClick={() => router.push('/dashboard')} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)] transition" title={tc('dashboard')}>
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div className="relative shrink-0">
            <button onClick={() => setShowTypeMenu(v => !v)}
              className="flex items-center gap-2 pl-3 pr-2.5 py-2 bg-[var(--green-glow)] text-[var(--green-3)] rounded-xl text-xs font-black uppercase tracking-wider transition hover:brightness-110 ring-1 ring-[rgba(37,99,235,0.2)]">
              {doc.documentType === 'devis' ? <FileText size={15} /> : doc.documentType === 'facture' ? <Receipt size={15} /> : doc.documentType === 'proforma' ? <ClipboardList size={15} /> : doc.documentType === 'bc' ? <FileStack size={15} /> : doc.documentType === 'br' ? <Package size={15} /> : doc.documentType === 'intervention' ? <Wrench size={15} /> : <FileText size={15} />}
              <span>{te(DOC_TYPE_EDITOR_LABELS[doc.documentType] ?? 'documentTypeQuote')}</span>
              <ChevronDown size={13} className={cn('transition-transform', showTypeMenu && 'rotate-180')} />
            </button>
            {showTypeMenu && (
              <div className="absolute top-full left-0 mt-1.5 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl p-1.5 z-[60] min-w-[190px]">
                {(['devis', 'facture', 'proforma', 'bc', 'br', 'intervention', 'attachement'] as const).map(t => (
                  <button key={t} onClick={() => { setDoc(prev => ({ ...prev, documentType: t, documentNumber: generateDocumentNumber(t, prev.mode) })); setShowTypeMenu(false); }}
                    className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition min-h-[38px]', doc.documentType === t ? 'bg-[var(--green-glow)] text-[var(--green-3)]' : 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)]')}>
                    {t === 'devis' ? <FileText size={15} /> : t === 'facture' ? <Receipt size={15} /> : t === 'proforma' ? <ClipboardList size={15} /> : t === 'bc' ? <FileStack size={15} /> : t === 'br' ? <Package size={15} /> : t === 'intervention' ? <Wrench size={15} /> : <FileText size={15} />}
                    {tp(DOC_TYPE_PREVIEW_LABELS[t] ?? 'docTypeQuote')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center: Document number + save status */}
          <div className="hidden md:flex items-center gap-2.5 min-w-0">
            {doc.documentNumber && (
              <span className="font-mono text-xs text-[var(--sand-muted)] truncate">{doc.documentNumber}</span>
            )}
            {saving ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--green-3)]"><Loader2 size={12} className="animate-spin" />{te('saving')}</span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-[var(--sand-muted)]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Enregistré</span>
            )}
          </div>

          {/* Right: Undo/Redo (always) + lg-only Settings/Save/PDF (mobile bottom bar covers these below lg) */}
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={handleUndo} disabled={!canUndo} className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)] transition disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
            <button onClick={handleRedo} disabled={!canRedo} className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)] transition disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Shift+Z)"><Redo2 size={16} /></button>
            <div className="hidden lg:flex items-center gap-1">
              {!docIdParam && (
                <button onClick={() => setShowCustomizer(true)} className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)] transition" title={te('customize')}>
                  <Settings size={16} />
                </button>
              )}
              <div className="w-px h-6 bg-[rgba(15,39,71,0.1)] mx-1.5" />
              <Button size="sm" variant="secondary" onClick={saveDoc} disabled={saving} className="h-9 text-xs gap-1.5 px-3.5">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{tc('save')}</span>
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={saving} className="h-9 text-xs gap-1.5 px-3.5">
                <Download size={14} />
                <span>{te('downloadPdf')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ═══════════════ MOBILE BOTTOM BAR ═══════════════ */}
        <div className="lg:hidden no-print shrink-0 border-t border-[rgba(15,39,71,0.08)] bg-[var(--navy-2)]" style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}>
          {/* Action row */}
          <div className="flex items-center gap-1.5 px-2 py-1">
            <button onClick={saveDoc} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] rounded-xl bg-[var(--green-2)] text-white text-[11px] font-bold transition active:scale-[0.97] disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{tc('save')}</span>
            </button>
             <button onClick={handleDownload} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] rounded-xl bg-[var(--navy-4)] text-[var(--sand)] text-[11px] font-bold border border-[rgba(15,39,71,0.1)] transition active:scale-[0.97] disabled:opacity-50">
               <Download size={14} />
               <span>{te('downloadPdf')}</span>
            </button>
            <button onClick={() => setShowCustomizer(true)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[var(--navy-4)] text-[var(--sand-muted)] border border-[rgba(15,39,71,0.1)] transition active:scale-[0.97]">
              <MoreHorizontal size={18} />
            </button>
          </div>
          {/* Tab row */}
          <div className="flex items-center gap-1 px-2 pb-2">
            {([
              { key: 'editor' as const, label: te('editorTabEdit') || 'Éditer', icon: FileText },
              { key: 'preview' as const, label: te('editorTabPreview') || 'Aperçu', icon: Eye },
              { key: 'totals' as const, label: te('editorTabTotals') || 'Totaux', icon: Grid3X3 },
            ]).map(tab => (
              <button key={tab.key} onClick={() => setMobileTab(tab.key)}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] text-[11px] font-bold rounded-xl transition', mobileTab === tab.key ? 'bg-[var(--green-2)] text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)] active:bg-[var(--navy-4)]')}>
                <tab.icon size={13} />{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════ MAIN AREA ═══════════════ */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* ──── LEFT RAIL (desktop, hidden by default) ──── */}
          {showSectionNav && (
            <nav className="hidden lg:flex flex-col items-center gap-1 py-2.5 px-1.5 bg-[var(--navy-2)] border-r border-[rgba(15,39,71,0.08)] w-[72px] shrink-0 overflow-y-auto">
            {sectionNavItems.map(item => {
              const active = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => { setActiveSection(item.id); setMobileTab('editor'); }}
                  className={cn('w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all border-2', active ? 'bg-[var(--green-glow)] text-[var(--green-3)] border-[var(--green-3)] shadow-[0_0_12px_rgba(37,99,235,0.25)]' : 'text-[var(--sand-muted)] border-transparent hover:text-[var(--sand)] hover:bg-[var(--navy-4)]')}>
                  <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-[9px] font-bold leading-tight text-center tracking-tight truncate w-full">{item.label}</span>
                </button>
              );
            })}
          </nav>)}
          {/* ──── EDITOR PANEL ──── */}
          <div className={cn('flex-1 lg:flex-none lg:w-[430px] xl:w-[470px] flex flex-col min-w-0 border-r border-[rgba(15,39,71,0.08)]', mobileTab !== 'editor' && mobileTab !== 'totals' && 'hidden lg:flex')}>
            {/* Validation errors banner */}
            {itemErrors && (
              <div className="no-print flex items-center gap-2 px-3 py-1 bg-red-900/20 border-b border-red-500/20 text-[10px] text-red-400 shrink-0">
                <AlertTriangle size={12} /><span>{itemErrors}</span>
                <button onClick={() => setItemErrors(null)} className="ml-auto text-red-500 hover:text-red-400">✕</button>
              </div>
            )}
            {/* Scrollable section area - shows all sections when nav hidden, one section when nav visible */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {showSectionNav ? renderSection(activeSection) : (
                <>
                  {relevantSections.filter(s => {
                    if (s === 'design' || s === 'signature') return true;
                    const sectionFields = SECTION_FIELDS[s];
                    if (!sectionFields) return customSections.some(cs => cs.id === s);
                    return sectionFields.some(f => !hiddenFields.has(f));
                  }).map(s => (
                    <div key={s} className="scroll-mt-16">{renderSection(s)}</div>
                  ))}
                  {customSections.map(cs => {
                    if (relevantSections.includes(cs.id)) {
                      const hasVisible = cs.fields.some(f => !hiddenFields.has(`custom_${cs.id}_${f.id}`));
                      if (!hasVisible) return null;
                      return <div key={cs.id} className="scroll-mt-16">{renderSection(cs.id)}</div>;
                    }
                    return null;
                  })}
                </>
              )}
            </div>
            {/* ──── BOTTOM TOTALS BAR (hidden on mobile non-editor tabs) ──── */}
            {mobileTab === 'editor' && (
            <div className="shrink-0 border-t border-[rgba(15,39,71,0.1)] bg-[var(--navy-2)] px-3 sm:px-4 py-2.5 flex items-center gap-3 overflow-x-auto">
              <div className="flex items-center gap-3 sm:gap-4 text-[11px] min-w-0 flex-1">
                <span className="shrink-0"><span className="text-[var(--sand-muted)]">HT </span><span className="font-bold text-[var(--sand)]">{formatCurrency(results.subTotalHT, tc('currency'))}</span></span>
                {results.tvaRate > 0 && <span className="shrink-0"><span className="text-[var(--sand-muted)]">TVA {results.tvaRate}% </span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.tvaAmount, tc('currency'))}</span></span>}
                {results.timbreFiscal > 0 && <span className="shrink-0"><span className="text-[var(--sand-muted)]">Timbre </span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.timbreFiscal, tc('currency'))}</span></span>}
              </div>
              {itemErrors && (
                <button onClick={() => setActiveSection('prestations')} className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-400/10 px-2 py-1 rounded-lg transition shrink-0">
                  <AlertTriangle size={11} />{te('sections.prestations').replace(/^\d+\.\s*/, '')}
                </button>
              )}
              <div className="shrink-0 flex items-baseline gap-1.5 rounded-xl bg-[var(--green-glow)] px-3 py-1.5 ring-1 ring-[rgba(37,99,235,0.2)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--green-3)]/80">{te('paiement.netToPay') || 'Net'}</span>
                <span className="font-black text-[var(--green-3)] text-sm whitespace-nowrap">{formatCurrency(results.netAPayer, tc('currency'))}</span>
              </div>
            </div>
            )}
          </div>

          {/* ──── TOTALS VIEW (mobile only) ──── */}
          {mobileTab === 'totals' && (
            <div className="flex-1 lg:hidden p-4 space-y-3 overflow-y-auto">
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between"><span className="text-[var(--sand-muted)]">{te('paiement.totalHT')}</span><span className="font-bold text-[var(--sand)]">{formatCurrency(results.subTotalHT, tc('currency'))}</span></div>
                {results.discountAmount > 0 && <div className="flex justify-between"><span className="text-[var(--sand-muted)]">{te('remise.display') || 'Remise'}</span><span className="font-semibold text-red-400">-{formatCurrency(results.discountAmount, tc('currency'))}</span></div>}
                {results.tvaRate > 0 && <div className="flex justify-between"><span className="text-[var(--sand-muted)]">TVA {results.tvaRate}%</span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.tvaAmount, tc('currency'))}</span></div>}
                {results.timbreFiscal > 0 && <div className="flex justify-between"><span className="text-[var(--sand-muted)]">{te('paiement.stampDuty')}</span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.timbreFiscal, tc('currency'))}</span></div>}
                {results.acompte > 0 && <div className="flex justify-between"><span className="text-[var(--sand-muted)]">{te('paiement.depositPaid')}</span><span className="font-semibold text-red-400">-{formatCurrency(results.acompte, tc('currency'))}</span></div>}
                <div className="flex justify-between pt-2 border-t border-[rgba(15,39,71,0.1)]"><span className="font-bold text-[var(--sand)]">{te('paiement.netToPay')}</span><span className="font-black text-[var(--green-3)] text-[13px]">{formatCurrency(results.netAPayer, tc('currency'))}</span></div>
              </div>
              {/* Validation state */}
              <div className="border-t border-[rgba(15,39,71,0.08)] pt-3 space-y-2">
                <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('validationState') || 'État de validation'}</h4>
                <div className="space-y-1.5">
                  <div className={cn('flex items-center gap-2 text-[11px] p-2 rounded-lg', doc.clientInfo.name ? 'text-[var(--green-3)] bg-[var(--green-glow)]' : 'text-[var(--sand-muted)] bg-[var(--navy-3)]')}>
                    {doc.clientInfo.name ? <Check size={12} /> : <AlertTriangle size={12} />}
                    <span>{te('client.clientName')}: {doc.clientInfo.name || '—'}</span>
                  </div>
                  <div className={cn('flex items-center gap-2 text-[11px] p-2 rounded-lg', doc.items.length > 0 ? 'text-[var(--green-3)] bg-[var(--green-glow)]' : 'text-[var(--sand-muted)] bg-[var(--navy-3)]')}>
                    {doc.items.length > 0 ? <Check size={12} /> : <AlertTriangle size={12} />}
                    <span>{doc.items.length} {te('prestations.items') || 'articles'}</span>
                  </div>
                  <div className={cn('flex items-center gap-2 text-[11px] p-2 rounded-lg', doc.date ? 'text-[var(--green-3)] bg-[var(--green-glow)]' : 'text-[var(--sand-muted)] bg-[var(--navy-3)]')}>
                    {doc.date ? <Check size={12} /> : <AlertTriangle size={12} />}
                    <span>{te('general.issueDate')}: {doc.date || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──── PREVIEW PANEL ──── */}
          <div className={cn('lg:flex flex-1 min-w-0 flex-col bg-[#121826]', mobileTab === 'preview' ? 'flex' : 'hidden lg:flex')}>
            <div className="no-print shrink-0 flex items-center gap-3 border-b border-[rgba(15,39,71,0.08)] bg-[var(--navy-2)]/95 px-4 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--green-glow)] text-[var(--green-3)]">
                <MonitorCheck size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xs font-black uppercase tracking-wide text-[var(--sand)]">{te('previewTitle') || 'Aperçu'}</h2>
                  <span className="rounded-md bg-[var(--navy-4)] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--sand-muted)]">A4</span>
                  <div className="relative">
                    <button onClick={() => setShowReadyChecks(v => !v)} className={cn(
                      'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold cursor-pointer transition hover:brightness-110',
                      completedPreviewChecks === 3 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300',
                    )}>
                      {completedPreviewChecks === 3 ? <Check size={10} /> : <AlertTriangle size={10} />}
                      {completedPreviewChecks}/3 {te('ready') || 'prêt'}
                    </button>
                    {showReadyChecks && (
                      <>
                        <div className="fixed inset-0 z-[99]" onClick={() => setShowReadyChecks(false)} />
                        <div className="absolute top-full left-0 mt-1.5 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl p-2 z-[100] min-w-[200px]">
                          <div className="text-[9px] font-bold text-[var(--sand-muted)] uppercase tracking-wider px-2 pb-1.5 border-b border-[rgba(15,39,71,0.08)]">{te('validationState') || 'État de validation'}</div>
                          {previewReadyChecks.map((check, i) => (
                            <button key={i} onClick={() => { setActiveSection(check.section); setMobileTab('editor'); setShowReadyChecks(false); }}
                              className={cn('w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] font-medium transition text-left', check.done ? 'text-[var(--green-3)]' : 'text-amber-400 hover:bg-[var(--navy-4)]')}>
                              {check.done ? <Check size={12} className="shrink-0" /> : <AlertTriangle size={12} className="shrink-0" />}
                              <span className="flex-1">{check.label}</span>
                              {!check.done && <ChevronRight size={11} className="shrink-0 opacity-50" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <p className="truncate text-[11px] text-[var(--sand-muted)]">
                  {doc.items.length} ligne{doc.items.length !== 1 ? 's' : ''} · {formatCurrency(results.netAPayer, tc('currency'))}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="flex items-center gap-0.5 rounded-xl bg-[var(--navy-4)] p-1">
                  <button onClick={() => setPreviewZoom('fit')} className={cn('flex min-h-7 items-center gap-1 rounded-lg px-2.5 text-[10px] font-bold transition', previewZoom === 'fit' ? 'bg-[var(--green-2)] text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]')} title="Ajuster"><Maximize size={12} />Fit</button>
                  <button onClick={() => setPreviewZoom(0.75)} className={cn('min-h-7 rounded-lg px-2.5 text-[10px] font-bold transition', previewZoom === 0.75 ? 'bg-[var(--green-2)] text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]')} title="Zoom 75%">75%</button>
                  <button onClick={() => setPreviewZoom(1)} className={cn('min-h-7 rounded-lg px-2.5 text-[10px] font-bold transition', previewZoom === 1 ? 'bg-[var(--green-2)] text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]')} title="Zoom 100%">100%</button>
                </div>
                <button onClick={() => setShowGrid(g => !g)} className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition', showGrid ? 'bg-[var(--green-glow)] text-[var(--green-3)] ring-1 ring-[rgba(37,99,235,0.2)]' : 'text-[var(--sand-muted)] hover:bg-[var(--navy-4)] hover:text-[var(--sand)]')} title="Grille"><Grid3X3 size={15} /></button>
              </div>
            </div>
            {/* A4 scaled preview — mobile uses transform to fit width */}
            <div id="preview-scroll" className="preview-container flex-1 overflow-auto bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_34%),linear-gradient(180deg,#151c2c_0%,#0f1421_100%)] p-3 sm:p-6 print:bg-white print:p-0 print:overflow-visible">
              <div className="mx-auto flex w-max min-w-full justify-center">
                <div className="print-area-wrapper origin-top transition-transform duration-200"
                  style={{ transform: `scale(${mobileTab === 'preview' ? Math.min(computedScale, (typeof window !== 'undefined' ? window.innerWidth - 32 : 350) / 794) : computedScale})` }}>
                  <div className="rounded-[6px] bg-white/5 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/10 print:p-0 print:shadow-none print:ring-0">
                    <DocumentPreview doc={doc} results={results} customSections={customSections} hiddenFields={hiddenFields} previewFocus={previewFocus} showGrid={showGrid} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──── CUSTOMIZATION MODAL ──── */}
      {showCustomizer && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCustomizer(false)}>
          <div className="bg-[var(--navy-2)] w-full sm:max-w-2xl sm:mx-3 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[rgba(15,39,71,0.08)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-2 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-[rgba(15,39,71,0.1)]" /></div>
            <div className="px-5 py-4 border-b border-[rgba(15,39,71,0.08)] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--sand)] tracking-tight">
                  {te('customizeTitle')}
                  <span className="ml-2 text-[11px] font-semibold text-white bg-[var(--green-3)] px-2 py-0.5 rounded-md align-middle uppercase">
              {te(DOC_TYPE_EDITOR_LABELS[doc.documentType] ?? 'documentTypeQuote')}
                  </span>
                </h3>
                <p className="text-[11px] text-[var(--sand-muted)] mt-0.5">{te('customizeSubtitle') || 'Cliquez sur une catégorie pour voir les champs'}</p>
              </div>
              <button onClick={() => setShowCustomizer(false)} className="text-[var(--sand-muted)] hover:text-[var(--sand)] p-1 -mr-1">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[var(--navy-2)]">
              {showSectionCreator ? (
                <SectionCreatorForm
                  initialSection={editingSection}
                  onSave={async (section) => {
                    if (editingSection?.id) {
                      await fetch('/api/user/custom-sections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section }) });
                    } else {
                      await fetch('/api/user/custom-sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section }) });
                    }
                    const res = await fetch('/api/user/custom-sections');
                    const data = await res.json();
                    setCustomSections(data.sections ?? []);
                    setFieldPrefs(prev => { const b = prev ?? {} as Record<string, Record<string, string[]>>; const dt = doc.documentType; const curr: Record<string, string[]> = b[dt] ?? {}; curr[section.id] = section.fields.map(f => f.id); return { ...b, [dt]: curr }; });
                    setDoc(prev => ({ ...prev, sectionOrder: prev.sectionOrder.includes(section.id) ? prev.sectionOrder : [...prev.sectionOrder, section.id] }));
                    setShowSectionCreator(false);
                    setEditingSection(null);
                  }}
                  onCancel={() => { setShowSectionCreator(false); setEditingSection(null); }}
                  te={te}
                />
              ) : (
                <>
                  {([
                    {
                      id: 'docInfo',
                      icon: <FileText size={16} />,
                      label: 'Document',
                      color: 'bg-[var(--navy-3)] text-[var(--sand)] border-[rgba(15,39,71,0.08)]',
                      fields: ['docNumber', 'issueDate', 'validUntil', 'orderRef'],
                      section: 'general',
                    },
                    {
                      id: 'company',
                      icon: <Building2 size={16} />,
                      label: 'Entreprise',
                      color: 'bg-[var(--navy-3)] text-blue-400 border-blue-400/20',
                      fields: ['businessMode', 'logo', 'logoPosition'],
                      section: 'mode',
                    },
                    {
                      id: 'clientSection',
                      icon: <User size={16} />,
                      label: 'Client',
                      color: 'bg-[var(--navy-3)] text-[var(--green-3)] border-[var(--green-3)]/20',
                      fields: ['clientName', 'clientAddress', 'clientNif', 'clientNis', 'clientRc', 'clientAi', 'clientPhone', 'clientEmail', 'clientForme'],
                      section: 'client',
                    },
                    {
                      id: 'devisInfo',
                      icon: <FileText size={16} />,
                      label: 'Informations Devis',
                      color: 'bg-[var(--navy-3)] text-cyan-400 border-cyan-400/20',
                      fields: ['companyTagline', 'companyCapital', 'rcNumber', 'nisNumber', 'aiNumber', 'reference', 'rib', 'bankName', 'bankAgency', 'ccpNumber', 'validityDays', 'showWatermark'],
                      section: 'devis',
                      onlyFor: ['devis'] as DocumentType[],
                    },
                    {
                      id: 'chantier',
                      icon: <MapPin size={16} />,
                      label: 'Chantier',
                      color: 'bg-[var(--navy-3)] text-amber-400 border-amber-400/20',
                      fields: ['chantierAddress', 'chantierType', 'chantierCondition', 'chantierSurface', 'chantierProtection', 'chantierResponsable'],
                      section: 'chantier',
                    },
                    {
                      id: 'materiaux',
                      icon: <Package size={16} />,
                      label: 'Matériaux',
                      color: 'bg-[var(--navy-3)] text-orange-400 border-orange-400/20',
                      fields: ['materiauxBrand', 'materiauxType', 'materiauxColor', 'materiauxQty', 'materiauxUnite'],
                      section: 'materiaux',
                    },
                    {
                      id: 'prestations',
                      icon: <ClipboardList size={16} />,
                      label: 'Prestations',
                      color: 'bg-[var(--navy-3)] text-cyan-400 border-cyan-400/20',
                      fields: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
                      section: 'prestations',
                    },
                    {
                      id: 'remise',
                      icon: <Percent size={16} />,
                      label: 'Remise',
                      color: 'bg-[var(--navy-3)] text-pink-400 border-pink-400/20',
                      fields: ['remiseType', 'remiseValue', 'remiseReason'],
                      section: 'remise',
                    },
                    {
                      id: 'garanties',
                      icon: <BadgeCheck size={16} />,
                      label: 'Garanties',
                      color: 'bg-[var(--navy-3)] text-teal-400 border-teal-400/20',
                      fields: ['garantieLabor', 'garantieMaterials', 'garantieNotes', 'garantieDuree', 'garantieRetenue'],
                      section: 'garanties',
                    },
                    {
                      id: 'fiscalite',
                      icon: <Receipt size={16} />,
                      label: 'Fiscalité',
                      color: 'bg-[var(--navy-3)] text-red-400 border-red-400/20',
                      fields: ['vatRate', 'stampRate', 'stampMin', 'stampMax', 'retenueSource', 'tvaArticle'],
                      section: 'general',
                    },
                    {
                      id: 'paiement',
                      icon: <CircleDollarSign size={16} />,
                      label: 'Paiement',
                      color: 'bg-[var(--navy-3)] text-violet-400 border-violet-400/20',
                      fields: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban', 'paymentEcheance', 'paymentModeReglement'],
                      section: 'paiement',
                    },
                    {
                      id: 'notes',
                      icon: <ScrollText size={16} />,
                      label: 'Notes',
                      color: 'bg-[var(--navy-3)] text-[var(--sand-muted)] border-[rgba(15,39,71,0.08)]',
                      fields: ['notes', 'mentionsLegales', 'conditionsGenerales'],
                      section: 'notes',
                    },
                    {
                      id: 'signature',
                      icon: <Pen size={16} />,
                      label: te('sections.signature') || 'Signature',
                      color: 'bg-[var(--navy-3)] text-indigo-400 border-indigo-400/20',
                      fields: ['companyPhone', 'sigClientSubtitle', 'sigClientNameFr', 'sigClientRole', 'sigClientRoleFr', 'sigClientNameAr', 'sigCompanyNameFr', 'sigDirectionNameFr', 'sigDirectionRole', 'sigDirectionNameAr'],
                      section: 'signature',
                    },
                  ] as const).filter(group => {
                    const relevantSections = DOC_TYPE_SECTIONS[doc.documentType] ?? DEFAULT_SECTION_ORDER;
                    return relevantSections.includes(group.section);
                  }).map(group => {
                    const visibleCount = group.fields.filter(f => !hiddenFields.has(f)).length;
                    return (
                      <details key={group.id} className="group rounded-xl border border-[rgba(15,39,71,0.08)] overflow-hidden">
                        <summary className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none transition hover:bg-[var(--navy-3)] bg-[var(--navy-2)] ${group.color.split(' ').slice(0, 2).join(' ')}`}>
                          <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${group.color}`}>{group.icon}</span>
                          <span className="flex-1 text-[13px] font-semibold text-[var(--sand)]">{group.label}</span>
                          <span className="text-[10px] text-[var(--sand-muted)] font-medium">{visibleCount}/{group.fields.length}</span>
                          <ChevronDown size={14} className="text-[var(--sand-muted)] transition group-open:rotate-180" />
                        </summary>
                        <div className="px-3.5 pb-3 pt-1 space-y-1 bg-[var(--navy-3)]">
                          <div className="flex flex-wrap gap-1.5">
                            {group.fields.map(fieldId => {
                              const isHidden = hiddenFields.has(fieldId);
                              const label = te(`fields.${fieldId}`) || te(`general.${fieldId}`) || te(`client.${fieldId}`) || te(`prestations.${fieldId}`) || te(`paiement.${fieldId}`) || te(`chantier.${fieldId}`) || te(`materiaux.${fieldId}`) || te(`garanties.${fieldId}`) || te(`remise.${fieldId}`) || te(`mode.${fieldId}`) || fieldId;
                              return (
                                <label key={fieldId} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-[11px] ${isHidden ? 'bg-[var(--navy-2)] text-[var(--sand-muted)] border border-[rgba(15,39,71,0.08)] opacity-50' : 'bg-[var(--navy-2)] text-[var(--sand)] border border-[rgba(15,39,71,0.12)] font-medium shadow-sm'}`}>
                                  <input type="checkbox" checked={!isHidden} onChange={() => {
                                    setFieldPrefs(prev => {
                                      const current = { ...prev };
                                      const currentTypePrefs = { ...(current[doc.documentType] as Record<string, string[]> ?? {}) };
                                      for (const section of ALL_SECTIONS) {
                                        const sectionFields = SECTION_FIELDS[section] ?? customSections.find(c => c.id === section)?.fields.map(f => f.id) ?? [];
                                        if (sectionFields.includes(fieldId)) {
                                          const visible = [...(currentTypePrefs[section] ?? sectionFields)];
                                          if (isHidden) { if (!visible.includes(fieldId)) visible.push(fieldId); }
                                          else { const idx = visible.indexOf(fieldId); if (idx >= 0) visible.splice(idx, 1); }
                                          currentTypePrefs[section] = visible;
                                        }
                                      }
                                      current[doc.documentType] = currentTypePrefs;
                                      return current;
                                    });
                                  }} className="w-3.5 h-3.5 rounded text-[var(--green-3)]" />
                                  {label}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </details>
                    );
                  })}
                  {customSections.length > 0 && (
                    <details className="group rounded-xl border border-[rgba(15,39,71,0.08)] overflow-hidden">
                      <summary className="flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none transition hover:bg-[var(--navy-3)] bg-[var(--navy-2)]">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--navy-3)] text-amber-400"><Briefcase size={16} /></span>
                        <span className="flex-1 text-[13px] font-semibold text-[var(--sand)]">{te('customSections') || 'Mes sections'}</span>
                        <ChevronDown size={14} className="text-[var(--sand-muted)] transition group-open:rotate-180" />
                      </summary>
                      <div className="px-3.5 pb-3 pt-1 space-y-1 bg-[var(--navy-3)]">
                        <div className="flex flex-wrap gap-1.5">
                          {customSections.map(cs => (
                            <span key={cs.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--navy-2)] text-[11px] text-[var(--sand)] border border-amber-400/20 font-medium shadow-sm">
                              {cs.label}
                              <button onClick={async () => {
                                await fetch(`/api/user/custom-sections?id=${cs.id}`, { method: 'DELETE' });
                                setCustomSections(prev => prev.filter(c => c.id !== cs.id));
                                setFieldPrefs(prev => {
                                  if (!prev) return prev;
                                  const updated = { ...prev };
                                  for (const docType of Object.keys(updated)) {
                                    const typePrefs = updated[docType] as Record<string, string[]> | undefined;
                                    if (typePrefs && typePrefs[cs.id]) {
                                      const rest = { ...typePrefs };
                                      delete rest[cs.id];
                                      updated[docType] = rest;
                                    }
                                  }
                                  return updated;
                                });
                                setDoc(prev => ({ ...prev, sectionOrder: prev.sectionOrder.filter(s => s !== cs.id) }));
                              }} className="text-red-400 hover:text-red-300 ml-1">✕</button>
                              <button onClick={() => { setEditingSection(cs); setShowSectionCreator(true); }} className="text-blue-400 hover:text-blue-300 ml-0.5">✎</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </details>
                  )}
                  <button onClick={() => { setEditingSection({ id: '', label: '', fields: [] }); setShowSectionCreator(true); }}
                    className="w-full mt-2 py-3 border-2 border-dashed border-[rgba(15,39,71,0.12)] rounded-xl text-[var(--sand-muted)] font-bold hover:bg-[var(--navy-3)] transition text-[12px] flex items-center justify-center gap-2">
                    <Plus size={14} />
                    {te('addCustomSection') ?? '+ Ajouter ma propre section'}
                  </button>
                </>
              )}
            </div>
            <div className="px-5 py-3 border-t border-[rgba(15,39,71,0.08)] flex items-center justify-between bg-[var(--navy-2)]">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" checked={showSectionNav} onChange={() => setShowSectionNav(v => !v)} className="w-3.5 h-3.5 rounded text-[var(--green-3)]" />
                  <span className="text-[10px] font-medium text-[var(--sand-muted)]">{te('showSectionNav') || 'Navigateur sections'}</span>
                </label>
                <div className="w-px h-4 bg-[rgba(15,39,71,0.08)]" />
                <button onClick={() => {
                  const all = Object.fromEntries(ALL_SECTIONS.map(s => {
                    if (SECTION_FIELDS[s]) return [s, [...SECTION_FIELDS[s]]];
                    const cs = customSections.find(c => c.id === s);
                    if (cs) return [s, cs.fields.map(f => f.id)];
                    return [s, []];
                  }));
                  setFieldPrefs(prev => ({ ...(prev ?? {}), [doc.documentType]: all }));
                }} className="text-[11px] font-semibold text-[var(--green-3)] hover:text-[var(--green-2)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--green-glow)] transition">{te('selectAll')}</button>
                <button onClick={() => {
                  const none = Object.fromEntries(ALL_SECTIONS.map(s => [s, []]));
                  setFieldPrefs(prev => ({ ...(prev ?? {}), [doc.documentType]: none }));
                }} className="text-[11px] font-semibold text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-[rgba(232,84,46,0.08)]0/10 transition">{te('deselectAll')}</button>
              </div>
              <button onClick={() => savePreferences(fieldPrefs?.[doc.documentType] ?? Object.fromEntries(ALL_SECTIONS.map(s => {
                if (SECTION_FIELDS[s]) return [s, [...SECTION_FIELDS[s]]];
                const cs = customSections.find(c => c.id === s);
                if (cs) return [s, cs.fields.map(f => f.id)];
                return [s, []];
              })))}
                className="bg-[var(--green-3)] text-[var(--navy-2)] text-[12px] font-semibold px-6 py-2.5 rounded-xl hover:bg-[var(--green-2)] active:scale-[0.97] transition shadow-sm">{te('customizeSave')}</button>
            </div>
          </div>
        </div>
      )}
    </TrialGate>
  );

}



export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--navy)] flex items-center justify-center"><div className="animate-pulse space-y-4 text-center"><div className="w-8 h-8 bg-[var(--navy-3)] rounded-full mx-auto" /><p className="text-sm text-[var(--sand-muted)]">Chargement…</p></div></div>}>
      <EditorContent />
    </Suspense>
  );
}
