'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { TrialGate } from '@/components/layout/TrialGate';
import { Button } from '@/components/ui/button';
import { DocumentPreview } from '@/components/editor/DocumentPreview';
import { CollapsibleSection } from '@/components/editor/CollapsibleSection';
import { getSection, SectionProvider } from '@/components/editor/sections/SectionProps';
import '@/components/editor/sections';
import { useEditor } from '@/hooks/useEditor';
import { useEditorUndo } from '@/hooks/useEditorUndo';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/components/ui/toast';
import { formatCurrency, generateDocumentNumber } from '@/lib/calculations';
import { getDesign } from '@/lib/documentDesign';
import { DEFAULT_SECTION_ORDER, SECTION_FIELDS, DOC_TYPE_DEFAULT_FIELDS, DOC_TYPE_SECTIONS, ALL_CATEGORY_OPTIONS, getCategoryOptions } from '@/types';
import type { UserMode, BlockId, SectionId, LineItem, CustomSectionDef } from '@/types';
import type { PreviewFocus } from '@/components/editor/DocumentPreview';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';
import {
  ChevronRight, Settings, Undo2, Redo2, Save, Download, Loader2, Check,
  AlertTriangle, ListOrdered, User, FileText, Palette, CreditCard,
  MapPin, Package, Percent, Shield, ShieldCheck, ShieldAlert, StickyNote, Maximize, Eye,
  Grid3X3, MoreHorizontal,
  ChevronDown, MonitorCheck,
  Receipt, ClipboardList, FileStack, Wrench,
} from 'lucide-react';
import { DOC_TYPE_EDITOR_LABELS, DOC_TYPE_PREVIEW_LABELS, normalizeDocTypeParam, sectionFocusMap, previewFocusToSectionId } from '@/components/editor/EditorConstants';
import { ENABLED_DOC_TYPES } from '@/lib/config';
import { CustomSectionRenderer } from '@/components/editor/sections/CustomSectionRenderer';
import { CustomizationModal } from '@/components/editor/CustomizationModal';
import { Modal } from '@/components/ui/modal';
import { auditDocument, type ComplianceIssue } from '@/lib/complianceAudit';

function EditorContent() {
  const sp = useSearchParams();
  const modeParam = sp.get('mode') as UserMode | null;
  const docIdParam = sp.get('id');
  const typeParam = normalizeDocTypeParam(sp.get('type'));
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
  const locale = useLocale();

  // Persona default: with no explicit ?mode= and a NEW document, follow the
  // account's mode (JWT carries it lowercase). Existing docs keep their own
  // mode; a manual in-editor toggle is never overridden (applied once).
  const { user: sessionUser } = useUser();
  const sessionModeApplied = useRef(false);
  useEffect(() => {
    if (sessionModeApplied.current || modeParam || docIdParam || !sessionUser?.mode) return;
    sessionModeApplied.current = true;
    const m = sessionUser.mode.toLowerCase();
    if (m === 'entreprise' || m === 'artisan') setMode(m as UserMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionUser?.mode]);

  const [fieldPrefs, setFieldPrefs] = useState<Record<string, Record<string, string[]>> | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customSections, setCustomSections] = useState<CustomSectionDef[]>([]);
  const [itemErrors, setItemErrors] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('prestations');
  const [previewZoom, setPreviewZoom] = useState<'fit' | number>('fit');
  const [previewFocus, setPreviewFocus] = useState<PreviewFocus>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'totals'>('editor');
  const [showGrid, setShowGrid] = useState(false);
  const [showReadyChecks, setShowReadyChecks] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditIssues, setAuditIssues] = useState<ComplianceIssue[]>([]);
  const [showSectionNav, setShowSectionNav] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prefsFetched = useRef(false);
  const sectionsFetched = useRef(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const { canUndo, canRedo, handleUndo, handleRedo } = useEditorUndo(doc, setDoc);
  const [catalogItems, setCatalogItems] = useState<LineItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  // Section drag & drop state
  const dragSectionIdRef = useRef<string | null>(null);
  const orderedSectionsRef = useRef<string[]>([]);
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  // Left rail navigation config
  const relevantSections = DOC_TYPE_SECTIONS[doc.documentType] ?? DEFAULT_SECTION_ORDER;
  const ALL_SECTIONS: string[] = [...relevantSections, ...customSections.map(s => s.id).filter(id => !relevantSections.includes(id))];

  // Ordered sections: use doc.sectionOrder as source of truth, keeping prestations first
  const orderedSections = useMemo(() => {
    const fromOrder = doc.sectionOrder.filter(s => relevantSections.includes(s));
    const missing = relevantSections.filter(s => !fromOrder.includes(s));
    const merged = [...fromOrder, ...missing];
    return ['prestations', ...merged.filter(s => s !== 'prestations')]
      .filter(s => relevantSections.includes(s));
  }, [doc.sectionOrder, relevantSections]);
  orderedSectionsRef.current = orderedSections;
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

  // Map section → preview focus area (imported from EditorConstants)

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
    { label: te('previewChecks.client') || 'Client', done: Boolean(doc.clientInfo.name?.trim()), section: 'client' as SectionId },
    { label: te('previewChecks.items') || 'Articles', done: doc.items.length > 0, section: 'prestations' as SectionId },
    { label: te('previewChecks.date') || 'Date', done: Boolean(doc.date), section: 'general' as SectionId },
  ], [doc.clientInfo.name, doc.items.length, doc.date, te]);
  const completedPreviewChecks = previewReadyChecks.filter(check => check.done).length;

  useEffect(() => {
    if (docIdParam || prefsFetched.current) return;
    prefsFetched.current = true;
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
  }, [docIdParam]);

  useEffect(() => {
    if (sectionsFetched.current) return;
    sectionsFetched.current = true;
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
  }, []);

  // حقل preferences: FieldPrefs[documentType][section] = fieldId[]
  // عند عدم وجود تفضيلات محفوظة، نستخدم DOC_TYPE_DEFAULT_FIELDS
  const docType = doc.documentType as keyof typeof DOC_TYPE_DEFAULT_FIELDS;
  const defaultsForType = DOC_TYPE_DEFAULT_FIELDS[docType] ?? {};
  const userPrefsForType = fieldPrefs?.[doc.documentType] as Record<string, string[]> | undefined;

  // Real-document gating: for devis, extra fields (chantier, materiaux, garanties, remise, paiement)
  // are hidden by default. Artisans also hide company-bureaucracy fields.
  // BY DEFAULT only — saved user prefs always win, and everything stays
  // re-enableable from the customizer.
  const REAL_DOC_HIDDEN_DEFAULTS: Record<string, string[]> = {
    devis: ['companyCapital', 'rcNumber', 'nisNumber', 'aiNumber', 'rib', 'bankName', 'bankAgency', 'ccpNumber'],
    client: ['clientNis', 'clientRc', 'clientAi'],
    general: ['stampRate', 'stampMin', 'stampMax', 'retenueSource', 'tvaArticle'],
    paiement: ['paymentIban'],
  };
  const sectionDefaults = (s: string): string[] => {
    const base = defaultsForType[s as keyof typeof defaultsForType] ?? [...(SECTION_FIELDS[s] ?? [])];
    if (doc.documentType === 'devis' || doc.documentType === 'facture') {
      const hidden = REAL_DOC_HIDDEN_DEFAULTS[s];
      return hidden ? (base as string[]).filter(f => !hidden.includes(f)) : (base as string[]);
    }
    if (mode !== 'artisan') return base as string[];
    const hidden = REAL_DOC_HIDDEN_DEFAULTS[s];
    return hidden ? (base as string[]).filter(f => !hidden.includes(f)) : (base as string[]);
  };

  const prefFields: Record<string, string[]> = {
    ...Object.fromEntries(DEFAULT_SECTION_ORDER.map(s => [s, userPrefsForType?.[s] ?? sectionDefaults(s)])),
    ...Object.fromEntries(relevantSections.filter(s => !DEFAULT_SECTION_ORDER.includes(s)).map(s => [s, userPrefsForType?.[s] ?? sectionDefaults(s)])),
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

  const router = useRouter();

  const unitLabels: Record<string, string> = { u: tu('u'), h: tu('h'), j: tu('j'), m2: tu('m2'), m3: tu('m3'), ml: tu('ml'), kg: tu('kg'), forfait: tu('forfait') };

  const handleDownload = async () => {
    // Open window synchronously during click gesture — before any await — so popup blocker doesn't fire
    const printWindow = window.open('', '_blank');
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
    const commonArgs = { doc, results, sf, bv, vb, currency: tc('currency'), design, lang: locale,
      tc: (k: string) => tc(k),
      tp: (k: string, vars?: Record<string, string | number>) => tp(k, vars as Record<string, string>),
    };
    let html: string;
    if (doc.documentType === 'attachement') {
      const { generateAttachementHTML } = await import('@/lib/generateDocumentHTML');
      html = generateAttachementHTML(commonArgs);
    } else if (doc.documentType === 'devis') {
      const mod = await import('@/lib/generateDocumentHTML');
      const fn = doc.previewTemplate === 'nordic'   ? mod.generateNordicHTML
               : doc.previewTemplate === 'velours'  ? mod.generateVeloursHTML
               : doc.previewTemplate === 'industrielle' ? mod.generateIndustrielleHTML
               : mod.generateHaussmannHTML;
      html = fn(commonArgs);
    } else if (doc.documentType === 'bc') {
      const { generateBonCommandeHTML } = await import('@/lib/generateBonCommandeHTML');
      html = generateBonCommandeHTML(commonArgs);
    } else if (doc.documentType === 'facture') {
      const { generateFactureHTML } = await import('@/lib/generateDocumentHTML');
      html = generateFactureHTML({
        ...commonArgs,
        isEnt, docTypeLabel, catLabels, paymentLabels, unitLabels,
        grouped, uncategorized, catOrder,
        te: (k: string) => te(k),
        tu: (k: string) => tu(k),
        customSections,
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
        deliveryRef: doc.deliveryRef,
        tp: (k: string, vars?: Record<string, unknown>) => tp(k, vars as Record<string, string>),
      });
    } else if (doc.documentType === 'intervention') {
      const { generateInterventionHTML } = await import('@/lib/generateInterventionHTML');
      html = generateInterventionHTML(commonArgs);
    } else {
      const { generateDocumentHTML } = await import('@/lib/generateDocumentHTML');
      html = generateDocumentHTML({
        ...commonArgs,
        isEnt, docTypeLabel, catLabels, paymentLabels, unitLabels,
        grouped, uncategorized, catOrder,
        te: (k: string) => te(k),
        tu: (k: string) => tu(k),
        customSections,
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
        tp: (k: string, vars?: Record<string, unknown>) => tp(k, vars as Record<string, string>),
      });
    }

    if (!printWindow) { window.print(); return; }
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    printWindow.location.replace(url);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const jumpToSection = (section: SectionId) => {
    setShowAuditModal(false);
    setActiveSection(section);
    setMobileTab('editor');
    const el = scrollContainerRef.current?.querySelector(`[data-section-id="${section}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePreviewZoneClick = (focus: NonNullable<PreviewFocus>) => {
    const section = previewFocusToSectionId[focus];
    if (section) jumpToSection(section);
  };

  const runComplianceAudit = () => {
    const issues = auditDocument(doc, results);
    setAuditIssues(issues);
    setShowAuditModal(true);
    track('Compliance Audit Run', { type: doc.documentType, issueCount: issues.length });
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

  const saveDocRef = useRef<() => Promise<unknown>>(saveDoc);
  saveDocRef.current = saveDoc;

  const hasContentRef = useRef(false);
  useEffect(() => {
    hasContentRef.current = doc.items.length > 0 || Boolean(doc.clientInfo.name);
  });

  // Autosave every 30 seconds — show error toast only on failure
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasContentRef.current) {
        saveDocRef.current().catch(() => {
          showToast(te('saveError') || 'Erreur d\'enregistrement. Vérifiez votre connexion.', 'error');
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [showToast, te]);

  // Reset the pending new-item category when the document type changes if it's
  // no longer one of that type's categories.
  useEffect(() => {
    const valid = getCategoryOptions(doc.documentType).some(c => c.value === (newItem.category ?? ''));
    if (!valid) setNewItem(p => ({ ...p, category: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.documentType]);

  // Track which section is in view via IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    observerRef.current = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section-id');
            if (id) {
              setActiveSection(id as SectionId);
              setPreviewFocus(sectionFocusMap[id as SectionId] ?? null);
              clearTimeout(previewTimerRef.current);
              previewTimerRef.current = setTimeout(() => setPreviewFocus(null), 700);
            }
          }
        }
      },
      { root: container, rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );
    const nodes = container.querySelectorAll('[data-section-id]');
    nodes.forEach(n => observerRef.current!.observe(n));
    const mutationObserver = new MutationObserver(() => {
      const newNodes = container.querySelectorAll('[data-section-id]');
      newNodes.forEach(n => {
        if (!observerRef.current) return;
        try { observerRef.current.observe(n); } catch {}
      });
    });
    mutationObserver.observe(container, { childList: true, subtree: true });
    return () => {
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
      clearTimeout(previewTimerRef.current);
    };
  }, [scrollContainerRef]);

  function resetSectionDrag() {
    dragSectionIdRef.current = null;
    setDragSectionId(null);
    setDragOverSectionId(null);
  }

  const renderSection = (id: SectionId): React.ReactNode => {
    const s = (blockId?: BlockId) => blockId ? { blockId, visible: isBlockVisible(blockId), onToggle: toggleBlock } : { visible: true, onToggle: () => {} };
    const isFixed = id === 'prestations';
    const dragProps = {
      draggable: !isFixed,
      onDragStart: !isFixed ? (e: React.DragEvent) => {
        dragSectionIdRef.current = id;
        setDragSectionId(id);
        e.dataTransfer.effectAllowed = 'move';
      } : undefined,
      onDragOver: !isFixed ? (e: React.DragEvent) => {
        e.preventDefault();
        if (dragSectionIdRef.current && dragSectionIdRef.current !== id) setDragOverSectionId(id);
      } : undefined,
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const from = dragSectionIdRef.current;
        if (!from || from === id || isFixed) { resetSectionDrag(); return; }
        const current = [...orderedSectionsRef.current];
        const fi = current.indexOf(from);
        const ti = current.indexOf(id);
        if (fi !== -1 && ti !== -1) {
          current.splice(fi, 1);
          current.splice(ti, 0, from);
          setDoc(prev => ({ ...prev, sectionOrder: current }));
        }
        resetSectionDrag();
      },
      onDragEnd: () => resetSectionDrag(),
      isDragOver: dragOverSectionId === id && dragSectionId !== id,
      isDragging: dragSectionId === id,
    };
    const sectionProps = {
      doc, setDoc, mode, hiddenFields,
      customSections, sectionOrder: doc.sectionOrder, results,
      addingItem, setAddingItem, newItem, setNewItem,
      handleAddItem, handleRemoveItem, moveItem, startNewItem,
      itemErrors, setItemErrors, dragIdx, setDragIdx,
      dragOverIdx, setDragOverIdx,
      catalogItems, catalogLoading, setCatalogItems, setCatalogLoading,
      updateDoc, updateClientInfo, updateCompanyInfo,
      updateTaxIds, updateArtisanInfo, updateDiscount,
      updateStampDuty, updatePaymentDetails,
      setChantierField: setChantierField as (key: string, value: unknown) => void,
      setMateriauxField: setMateriauxField as (key: string, value: unknown) => void,
      setGarantieField: setGarantieField as (key: string, value: unknown) => void,
      updateCustomField, toggleBlock, isBlockVisible,
      moveSection, te, tp, tu, tc, showToast,
    };

    // Custom section (user-defined)
    const cs = customSections.find(c => c.id === id);
    if (cs) {
      const hasVisible = cs.fields.some(f => !hiddenFields.has(`custom_${cs.id}_${f.id}`));
      if (!hasVisible) return null;
      return (
        <CollapsibleSection title={cs.label} sectionId={cs.id} {...s()} {...dragProps} defaultOpen={false}>
          <SectionProvider {...sectionProps}>
            <CustomSectionRenderer />
          </SectionProvider>
        </CollapsibleSection>
      );
    }

    // Look up built-in section from registry
    const entry = getSection(id);
    if (!entry) return null;
    const { component: SectionComp, meta } = entry;

    // Prestations section skips entirely when itemsTable is hidden
    if (id === 'prestations' && hiddenFields.has('itemsTable')) return null;

    return (
      <CollapsibleSection
        title={te(meta.titleKey ?? `sections.${id}`)}
        sectionId={id}
        {...(meta.blockId ? s(meta.blockId as BlockId) : s())}
        {...dragProps}
        defaultOpen={meta.defaultOpen ?? false}
      >
        <SectionProvider {...sectionProps}>
          <SectionComp />
        </SectionProvider>
      </CollapsibleSection>
    );
  };

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
        <div className="no-print h-14 flex items-center px-4 bg-[var(--navy-2)] border-b border-[var(--border-2)] shadow-[var(--shadow-sm)] z-50 shrink-0 gap-3">
          {/* Left: Nav back + Doc type selector */}
          <button type="button" onClick={() => router.push('/dashboard')} className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)] transition" title={tc('dashboard')}>
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div className="relative shrink-0">
            <button type="button" onClick={() => setShowTypeMenu(v => !v)}
              className="flex items-center gap-2 pl-3 pr-2.5 py-2 bg-[var(--green-glow)] text-[var(--green-3)] rounded-xl text-xs font-black uppercase tracking-wider transition hover:brightness-110 ring-1 ring-[var(--accent-ring)]">
              {doc.documentType === 'devis' ? <FileText size={15} /> : doc.documentType === 'facture' ? <Receipt size={15} /> : doc.documentType === 'proforma' ? <ClipboardList size={15} /> : doc.documentType === 'bc' ? <FileStack size={15} /> : doc.documentType === 'br' ? <Package size={15} /> : doc.documentType === 'intervention' ? <Wrench size={15} /> : <FileText size={15} />}
              <span>{te(DOC_TYPE_EDITOR_LABELS[doc.documentType] ?? 'documentTypeQuote')}</span>
              <ChevronDown size={13} className={cn('transition-transform', showTypeMenu && 'rotate-180')} />
            </button>
            {showTypeMenu && (
              <div className="absolute top-full left-0 mt-1.5 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl p-1.5 z-[60] min-w-[190px]">
                {ENABLED_DOC_TYPES.map(t => (
                  <button type="button" key={t} onClick={() => { setDoc(prev => ({ ...prev, documentType: t, documentNumber: generateDocumentNumber(t, prev.mode) })); setShowTypeMenu(false); }}
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
              <span className="flex items-center gap-1.5 text-xs text-[var(--sand-muted)]"><span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--cd-success))]" />{tc('saved')}</span>
            )}
          </div>

          {/* Right: Undo/Redo (always) + lg-only Settings/Save/PDF (mobile bottom bar covers these below lg) */}
          <div className="flex items-center gap-1 ms-auto">
            <button type="button" onClick={handleUndo} disabled={!canUndo} className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)] transition disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
            <button type="button" onClick={handleRedo} disabled={!canRedo} className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)] transition disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Shift+Z)"><Redo2 size={16} /></button>
            <div className="hidden lg:flex items-center gap-1">
              {!docIdParam && (
                <button type="button" onClick={() => setShowCustomizer(true)} className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-4)] transition" title={te('customize')}>
                  <Settings size={16} />
                </button>
              )}
              <div className="w-px h-6 bg-[rgba(15,39,71,0.1)] mx-1.5" />
              <Button size="sm" variant="secondary" onClick={runComplianceAudit} className="h-9 text-xs gap-1.5 px-3.5" title="Vérifier la conformité DGI avant enregistrement">
                <ShieldCheck size={14} />
                <span>Auditer</span>
              </Button>
              <Button size="sm" variant="secondary" onClick={saveDoc} disabled={saving} className="h-9 text-xs gap-1.5 px-3.5">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{tc('save')}</span>
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={saving} className="h-9 text-xs gap-1.5 px-3.5">
                <Download size={14} />
                <span>{te('downloadPdf')}</span>
              </Button>
              {(['devis', 'facture', 'bl'] as string[]).includes(doc.documentType) && (
                <a href="/legal/reglementation" target="_blank" rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-[10px] font-semibold border border-green-200 hover:bg-green-100 transition whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Conforme D.E. 05-468
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════ MOBILE BOTTOM BAR ═══════════════ */}
        <div className="lg:hidden no-print shrink-0 border-t border-[var(--border-2)] shadow-[0_-1px_2px_rgba(15,39,71,0.06)] bg-[var(--navy-2)]" style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}>
          {/* Action row */}
          <div className="flex items-center gap-1.5 px-2 py-1">
            <button type="button" onClick={saveDoc} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] rounded-xl bg-[var(--green-2)] text-white text-[11px] font-bold transition active:scale-[0.97] disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{tc('save')}</span>
            </button>
             <button type="button" onClick={handleDownload} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] rounded-xl bg-[var(--navy-4)] text-[var(--sand)] text-[11px] font-bold border border-[rgba(15,39,71,0.1)] transition active:scale-[0.97] disabled:opacity-50">
               <Download size={14} />
               <span>{te('downloadPdf')}</span>
            </button>
            <button type="button" onClick={() => setShowCustomizer(true)} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[var(--navy-4)] text-[var(--sand-muted)] border border-[rgba(15,39,71,0.1)] transition active:scale-[0.97]">
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
              <button type="button" key={tab.key} onClick={() => setMobileTab(tab.key)}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[44px] text-[11px] font-bold rounded-xl transition', mobileTab === tab.key ? 'bg-[var(--green-2)] text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)] active:bg-[var(--navy-4)]')}>
                <tab.icon size={13} />{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════ MAIN AREA ═══════════════ */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* ──── LEFT RAIL (always visible on lg+) ──── */}
          <nav className="hidden lg:flex flex-col items-center gap-1 py-2.5 px-1.5 bg-[var(--navy-2)] border-r border-[var(--border-2)] w-[72px] shrink-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {sectionNavItems.map(item => {
              const active = activeSection === item.id;
              return (
                <button type="button" key={item.id} onClick={() => {
                  setActiveSection(item.id);
                  setMobileTab('editor');
                  const el = scrollContainerRef.current?.querySelector(`[data-section-id="${item.id}"]`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                  className={cn('w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all border-[1.5px]', active ? 'bg-[var(--green-glow)] text-[var(--green-3)] border-[rgba(37,99,235,0.3)] shadow-[0_0_14px_var(--accent-glow)]' : 'text-[var(--sand-muted)] border-transparent hover:text-[var(--sand)] hover:bg-[var(--navy-3)]')}>
                  <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-[9px] font-bold leading-tight text-center tracking-tight truncate w-full">{item.label}</span>
                </button>
              );
            })}
          </nav>
          {/* ──── EDITOR PANEL ──── */}
          <div className={cn('flex-1 lg:max-w-[430px] xl:max-w-[470px] flex flex-col min-w-0 border-r border-[var(--border-2)]', mobileTab !== 'editor' && mobileTab !== 'totals' && 'hidden lg:flex')}>
            {/* Validation errors banner */}
            {itemErrors && (
              <div className="no-print flex items-center gap-2 px-3 py-1 bg-red-900/20 border-b border-red-500/20 text-[10px] text-red-400 shrink-0">
                <AlertTriangle size={12} /><span>{itemErrors}</span>
                <button type="button" onClick={() => setItemErrors(null)} className="ms-auto text-red-500 hover:text-red-400">✕</button>
              </div>
            )}
            {/* Scrollable section area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {orderedSections.filter(s => {
                if (s === 'design' || s === 'signature') return true;
                const sectionFields = SECTION_FIELDS[s];
                if (!sectionFields) return customSections.some(cs => cs.id === s);
                return sectionFields.length === 0 || sectionFields.some(f => !hiddenFields.has(f));
              }).map(s => (
                <div key={s} data-section-id={s} className="scroll-mt-4">{renderSection(s)}</div>
              ))}
              {customSections.map(cs => {
                if (relevantSections.includes(cs.id)) {
                  const hasVisible = cs.fields.some(f => !hiddenFields.has(`custom_${cs.id}_${f.id}`));
                  if (!hasVisible) return null;
                  return <div key={cs.id} data-section-id={cs.id} className="scroll-mt-4">{renderSection(cs.id)}</div>;
                }
                return null;
              })}
            </div>
            {/* ──── BOTTOM TOTALS BAR (hidden on mobile non-editor tabs) ──── */}
            {mobileTab === 'editor' && (
            <div className="shrink-0 border-t border-[var(--border-2)] shadow-[0_-1px_2px_rgba(15,39,71,0.06)] bg-[var(--navy-2)] px-3 sm:px-4 py-2.5 flex items-center gap-3 overflow-x-auto">
              <div className="flex items-center gap-3 sm:gap-4 text-[11px] min-w-0 flex-1">
                <span className="shrink-0"><span className="text-[var(--sand-muted)]">HT </span><span className="font-bold text-[var(--sand)]">{formatCurrency(results.subTotalHT, tc('currency'))}</span></span>
                {results.tvaRate > 0 && <span className="shrink-0"><span className="text-[var(--sand-muted)]">TVA {results.tvaRate}% </span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.tvaAmount, tc('currency'))}</span></span>}
                {results.timbreFiscal > 0 && <span className="shrink-0"><span className="text-[var(--sand-muted)]">Timbre </span><span className="font-semibold text-[var(--sand-2)]">{formatCurrency(results.timbreFiscal, tc('currency'))}</span></span>}
              </div>
              {itemErrors && (
                <button type="button" onClick={() => setActiveSection('prestations')} className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-400/10 px-2 py-1 rounded-lg transition shrink-0">
                  <AlertTriangle size={11} />{te('sections.prestations').replace(/^\d+\.\s*/, '')}
                </button>
              )}
              <div className="shrink-0 flex items-baseline gap-1.5 rounded-xl bg-[var(--green-glow)] px-3 py-1.5 ring-1 ring-[var(--accent-ring)]">
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
          <div className={cn('lg:flex flex-1 min-w-0 flex-col bg-[var(--preview-stage)]', mobileTab === 'preview' ? 'flex' : 'hidden lg:flex')}>
            <div className="no-print shrink-0 flex items-center gap-3 border-b border-[var(--border-2)] bg-[var(--navy-2)]/95 px-4 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--green-glow)] text-[var(--green-3)]">
                <MonitorCheck size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xs font-black uppercase tracking-wide text-[var(--sand)]">{te('previewTitle') || 'Aperçu'}</h2>
                  <span className="rounded-md bg-[var(--navy-4)] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--sand-muted)]">A4</span>
                  <div className="relative">
                    <button type="button" onClick={() => setShowReadyChecks(v => !v)} className={cn(
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
                            <button type="button" key={i} onClick={() => { setActiveSection(check.section); setMobileTab('editor'); setShowReadyChecks(false); }}
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
                  <button type="button" onClick={() => setPreviewZoom('fit')} className={cn('flex min-h-7 items-center gap-1 rounded-lg px-2.5 text-[10px] font-bold transition', previewZoom === 'fit' ? 'bg-[var(--green-2)] text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]')} title="Ajuster"><Maximize size={12} />Fit</button>
                  <button type="button" onClick={() => setPreviewZoom(0.75)} className={cn('min-h-7 rounded-lg px-2.5 text-[10px] font-bold transition', previewZoom === 0.75 ? 'bg-[var(--green-2)] text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]')} title="Zoom 75%">75%</button>
                  <button type="button" onClick={() => setPreviewZoom(1)} className={cn('min-h-7 rounded-lg px-2.5 text-[10px] font-bold transition', previewZoom === 1 ? 'bg-[var(--green-2)] text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]')} title="Zoom 100%">100%</button>
                </div>
                <button type="button" onClick={() => setShowGrid(g => !g)} className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition', showGrid ? 'bg-[var(--green-glow)] text-[var(--green-3)] ring-1 ring-[var(--accent-ring)]' : 'text-[var(--sand-muted)] hover:bg-[var(--navy-4)] hover:text-[var(--sand)]')} title="Grille"><Grid3X3 size={15} /></button>
              </div>
            </div>
            {/* A4 scaled preview — mobile uses transform to fit width */}
            <div id="preview-scroll" className="preview-container flex-1 overflow-auto bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_34%),linear-gradient(180deg,#151c2c_0%,#0f1421_100%)] p-3 sm:p-6 print:bg-white print:p-0 print:overflow-visible">
              <div className="mx-auto flex w-max min-w-full justify-center">
                <div className="print-area-wrapper origin-top transition-transform duration-200"
                  style={{ transform: `scale(${mobileTab === 'preview' ? Math.min(computedScale, (typeof window !== 'undefined' ? window.innerWidth - 32 : 350) / 794) : computedScale})` }}>
                  <div className="rounded-[6px] bg-white/5 p-2 shadow-[0_30px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/10 print:p-0 print:shadow-none print:ring-0">
                    <DocumentPreview doc={doc} results={results} customSections={customSections} hiddenFields={hiddenFields} previewFocus={previewFocus} showGrid={showGrid} onZoneClick={handlePreviewZoneClick} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──── CUSTOMIZATION MODAL ──── */}
      <CustomizationModal
        open={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        doc={doc}
        setDoc={setDoc}
        hiddenFields={hiddenFields}
        fieldPrefs={fieldPrefs}
        setFieldPrefs={setFieldPrefs}
        customSections={customSections}
        setCustomSections={setCustomSections}
        showSectionNav={showSectionNav}
        setShowSectionNav={setShowSectionNav}
        te={te}
      />

      {/* ──── DGI COMPLIANCE AUDIT MODAL ──── */}
      <Modal open={showAuditModal} onClose={() => setShowAuditModal(false)} title="Audit de conformité DGI" size="md">
        {auditIssues.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <ShieldCheck size={32} className="text-green-600" />
            <p className="text-sm font-semibold text-[var(--sand)]">Aucun problème détecté</p>
            <p className="text-xs text-[var(--sand-muted)]">Le NIF client et le timbre fiscal sont conformes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {auditIssues.map(issue => (
              <div key={issue.id} className={cn(
                'flex items-start gap-2.5 rounded-xl border p-3',
                issue.severity === 'error' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'
              )}>
                <ShieldAlert size={18} className={issue.severity === 'error' ? 'text-red-600 shrink-0 mt-0.5' : 'text-amber-600 shrink-0 mt-0.5'} />
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    'inline-block text-[10px] font-bold uppercase tracking-wide mb-1 px-1.5 py-0.5 rounded',
                    issue.severity === 'error' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                  )}>
                    {issue.severity === 'error' ? 'Erreur' : 'Avertissement'}
                  </span>
                  <p className="text-xs text-[var(--navy)] leading-relaxed">{issue.message}</p>
                  <button type="button" onClick={() => jumpToSection(issue.section)}
                    className="mt-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2">
                    Corriger →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
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
