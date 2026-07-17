'use client';

// ============================================================
// Rakmana Mobile — FlashFacture v2: Form-first tabbed editor
// No live paper on the main screen. Three tabs (Articles,
// Client, Détails) get the full viewport. Running total in
// the top bar. Preview is a separate full-screen overlay.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Save, MessageCircle, Share2, Mail, Download, Printer, Eye,
  Building2, CheckCircle2, Plus, Package, UserRound, Settings2,
} from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { useCompanyStore } from '@/stores/companyStore';
import { useSyncStore } from '@/stores/syncStore';
import {
  fetchDocumentDetail, createApiDocument, updateApiDocument, updateDocumentStatus,
  type ApiDocumentDetail,
} from '@/mobile/lib/api';
import { hapticSuccess, hapticError, hapticLight } from '@/mobile/lib/haptics';
import { useMobileKeyboard } from '@/mobile/lib/useMobileKeyboard';
import { ConfirmSheet } from '@/mobile/components/ConfirmSheet';
import { generatePDFBase64, printDocument, downloadDocument } from '@/mobile/lib/pdf';
import { shareDocument, openWhatsApp } from '@/mobile/lib/whatsapp';
import { notify } from '@/mobile/lib/toast';
import { generateDocNumber, numberToFrenchWords, numberToArabicWords, formatDateAlgerian } from '@/lib/dgi';
import { CreateDock, type DockMode, type CatalogItem } from '@/mobile/components/create/CreateDock';
import { DocumentPreview } from '@/mobile/components/create/DocumentPreview';
import { DOCUMENT_TYPE_LABELS, UNIT_LABELS } from '@/mobile/types';
import type { DocumentType, Client, LineItem, PaymentMode } from '@/mobile/types';

type TabId = 'items' | 'client' | 'details';

const PAYMENT_LABEL: Record<string, string> = {
  especes: 'Espèces', cheque: 'Chèque', virement: 'Virement', cb: 'Carte bancaire',
};

function formatDA(n: number): string {
  return n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface CreateScreenProps {
  editingDocId?: string;
  onExit?: () => void;
  onConfigureCompany?: () => void;
}

export function CreateScreen({ editingDocId, onExit, onConfigureCompany }: CreateScreenProps) {
  const currentDoc = useDocumentStore((s) => s.currentDoc);
  const totals = useDocumentStore((s) => s.totals);
  const savedDocuments = useDocumentStore((s) => s.savedDocuments);
  const setType = useDocumentStore((s) => s.setType);
  const setClient = useDocumentStore((s) => s.setClient);
  const setPaymentMode = useDocumentStore((s) => s.setPaymentMode);
  const setAcompte = useDocumentStore((s) => s.setAcompte);
  const setNotes = useDocumentStore((s) => s.setNotes);
  const clearItems = useDocumentStore((s) => s.clearItems);
  const addItem = useDocumentStore((s) => s.addItem);
  const resetDocument = useDocumentStore((s) => s.resetDocument);
  const saveDocument = useDocumentStore((s) => s.saveDocument);
  const updateSavedDocument = useDocumentStore((s) => s.updateSavedDocument);
  const company = useCompanyStore((s) => s.company);

  const keyboardOpen = useMobileKeyboard();
  const { t } = useMobileI18n();
  const [activeTab, setActiveTab] = useState<TabId>('items');
  const [dockMode, setDockMode] = useState<DockMode>('add');
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [savedSheet, setSavedSheet] = useState<{
    id: string; number: string; offline: boolean;
    clientName: string; clientPhone?: string; total: number; typeLabel: string;
  } | null>(null);
  const savedPdfRef = useRef<string | null>(null);
  const pdfRef = useRef<string | null>(null);
  const clientPromptShown = useRef(false);

  // ── Real document number ──
  const docNumber = useMemo(() => {
    if (editingDocId) {
      const existing = savedDocuments.find((d) => d.id === editingDocId);
      if (existing?.number) return existing.number;
    }
    return generateDocNumber(currentDoc.type, savedDocuments.length + 1);
  }, [editingDocId, savedDocuments, currentDoc.type]);

  // ── Catalog ──
  const catalog: CatalogItem[] = useMemo(() => {
    const map = new Map<string, { item: CatalogItem; count: number }>();
    for (const doc of savedDocuments) {
      for (const it of doc.items ?? []) {
        const key = it.label.trim().toLowerCase();
        if (!key) continue;
        const existing = map.get(key);
        if (existing) existing.count += 1;
        else map.set(key, { item: { label: it.label, unitPrice: it.unitPrice, unit: it.unit, tvaRate: it.tvaRate }, count: 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 8).map((e) => e.item);
  }, [savedDocuments]);

  // ── Load on mount ──
  useEffect(() => {
    if (!editingDocId) {
      const store = useDocumentStore.getState();
      const prefilled = store.consumePrefill();
      const hasDraft = store.currentDoc.items.length > 0 || !!store.currentDoc.client?.name;
      if (prefilled) {
        void notify('Document dupliqué — vérifiez et enregistrez');
        clientPromptShown.current = true;
      } else if (hasDraft) {
        void notify('Brouillon restauré ✓');
        clientPromptShown.current = true;
      } else {
        resetDocument();
        clientPromptShown.current = false;
      }
      pdfRef.current = null;
      return;
    }
    const loadIntoStore = (raw: ApiDocumentDetail) => {
      let parsed: Array<Record<string, unknown>> = [];
      try { parsed = JSON.parse(raw.items) as Array<Record<string, unknown>>; } catch { parsed = []; }
      const valid = new Set(['DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR', 'BL']);
      setType((valid.has(raw.type) ? raw.type : 'DEVIS') as DocumentType);
      if (raw.client) {
        setClient({
          id: raw.client.id, name: raw.client.name,
          phone: raw.client.phone ?? '', email: raw.client.email ?? undefined,
          address: raw.client.address ?? undefined, nif: raw.client.nif ?? undefined,
          rc: raw.client.rc ?? undefined, nis: raw.client.nis ?? undefined,
          ai: raw.client.ai ?? undefined,
        } as Partial<Client>);
      }
      setPaymentMode((raw.paymentMode || 'especes') as PaymentMode);
      setAcompte(raw.acompte ?? 0);
      setNotes(raw.notes ?? '');
      clearItems();
      for (const i of parsed) {
        addItem({
          code: i.code ? String(i.code) : undefined,
          label: String(i.designation || i.label || ''),
          quantity: Number(i.quantity) || 1,
          unit: (String(i.unit || 'u')) as LineItem['unit'],
          unitPrice: Number(i.unitPrice) || 0,
          tvaRate: (Number(i.tvaRate) || 19) as 0 | 9 | 19,
          remise: i.remise ? Number(i.remise) : undefined,
        });
      }
    };
    setLoadingDoc(true);
    setLoadError('');
    fetchDocumentDetail(editingDocId)
      .then(loadIntoStore)
      .catch(() => {
        const local = useDocumentStore.getState().savedDocuments.find((d) => d.id === editingDocId);
        if (local) {
          useDocumentStore.getState().loadDocumentIntoWizard(local.id);
          useDocumentStore.getState().consumePrefill();
        } else {
          setLoadError('Impossible de charger le document.');
        }
      })
      .finally(() => setLoadingDoc(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDocId, retryToken]);

  // ── Smart-morph: first item → ask client ──
  useEffect(() => {
    if (editingDocId) return;
    if (currentDoc.items.length === 0) { clientPromptShown.current = false; return; }
    if (clientPromptShown.current) return;
    if (!currentDoc.client?.name) {
      clientPromptShown.current = true;
      const timer = setTimeout(() => { setActiveTab('client'); setDockMode('client'); }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentDoc.items.length, currentDoc.client?.name, editingDocId]);

  // ── DGI timbre fiscal notification ──
  const prevTimbre = useRef(totals.timbreFiscal);
  useEffect(() => {
    if (totals.timbreFiscal && !prevTimbre.current) {
      void notify(`Timbre fiscal (${totals.timbreAmount.toLocaleString('fr-DZ')} DA) ajouté — Art. 220 CII`);
    }
    prevTimbre.current = totals.timbreFiscal;
  }, [totals.timbreFiscal, totals.timbreAmount]);

  const handleBack = useCallback(() => {
    const hasWork = !editingDocId && (currentDoc.items.length > 0 || !!currentDoc.client?.name);
    if (hasWork) { setExitConfirmOpen(true); return; }
    if (!editingDocId) resetDocument();
    onExit?.();
  }, [editingDocId, onExit, resetDocument, currentDoc]);

  // ── PDF ──
  const buildPdf = useCallback(async (overrideNumber?: string): Promise<string | null> => {
    if (!overrideNumber && pdfRef.current) return pdfRef.current;
    try {
      const base64 = await generatePDFBase64({
        docNumber: overrideNumber ?? docNumber,
        docType: currentDoc.type,
        clientName: currentDoc.client?.name || 'Client',
        clientAddress: currentDoc.client?.address,
        clientNif: currentDoc.client?.nif,
        clientRc: currentDoc.client?.rc,
        clientNis: currentDoc.client?.nis,
        clientAi: currentDoc.client?.ai,
        items: currentDoc.items.map((it) => ({
          designation: it.label, code: it.code, quantity: it.quantity, unit: it.unit,
          unitPrice: it.unitPrice, tvaRate: it.tvaRate, remise: it.remise, total: it.totalHT,
        })),
        subTotalHT: totals.subTotalHT,
        tvaAmount: totals.totalTVA,
        timbreFiscal: totals.timbreAmount,
        totalTTC: totals.totalTTC,
        netAPayer: totals.netAPayer,
        acompte: currentDoc.acompte || undefined,
        language: currentDoc.language,
        totalInWords: currentDoc.language === 'AR'
          ? numberToArabicWords(totals.netAPayer)
          : numberToFrenchWords(totals.netAPayer),
        companyName: company?.name,
        companyAddress: company?.address,
        companyNif: company?.nif,
        companyRc: company?.rc,
        companyNis: company?.nis,
        companyAi: company?.ai,
        companyActivity: company?.activity,
        companyCapital: company?.capital,
        companyPhone: company?.phone,
        companyFax: company?.fax,
        companyEmail: company?.email,
        companyRib: company?.rib,
        companyCcp: company?.ccp,
        companyBank: company?.bankName,
        companyLogo: company?.logo,
        companySignature: company?.signature,
        reference: currentDoc.reference || undefined,
        objet: currentDoc.objet || undefined,
        paymentMode: PAYMENT_LABEL[currentDoc.paymentMode] ?? currentDoc.paymentMode,
        date: new Date().toISOString().split('T')[0],
        notes: currentDoc.notes,
      });
      pdfRef.current = base64;
      return base64;
    } catch {
      void notify('Échec de la génération du PDF');
      return null;
    }
  }, [docNumber, currentDoc, totals, company]);

  useEffect(() => { pdfRef.current = null; }, [currentDoc, totals]);

  const guardReady = useCallback((): boolean => {
    if (!currentDoc.client?.name) { setActiveTab('client'); setDockMode('client'); void notify('Choisissez un client'); return false; }
    if (currentDoc.items.length === 0) { setActiveTab('items'); setDockMode('add'); void notify('Ajoutez au moins un article'); return false; }
    return true;
  }, [currentDoc]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    if (!company) { void notify('Configurez votre société d’abord'); return; }
    if (!guardReady()) { hapticError(); return; }
    setSaving(true);
    try {
      if (editingDocId) {
        const temp = useDocumentStore.getState().buildFromCurrent(company);
        if (!temp) { void notify('Aucun article à enregistrer'); return; }
        try {
          await updateApiDocument(editingDocId, { ...temp, id: editingDocId });
        } catch {
          useSyncStore.getState().enqueue({
            action: 'UPDATE', entity: 'document', entityId: editingDocId,
            payload: { ...temp, id: editingDocId },
          });
          void notify('Modifié hors ligne — synchronisation automatique ✓');
        }
        updateSavedDocument(editingDocId, {
          type: currentDoc.type, client: currentDoc.client as Client, items: currentDoc.items,
          notes: currentDoc.notes || undefined, paymentMode: currentDoc.paymentMode,
          acompte: currentDoc.acompte || undefined, totalHT: totals.subTotalHT,
          totalTVA: totals.totalTVA, totalTTC: totals.totalTTC,
          timbreFiscal: totals.timbreFiscal, timbreAmount: totals.timbreAmount,
        });
        hapticSuccess();
        void notify('Enregistré ✓');
        setTimeout(() => onExit?.(), 700);
      } else {
        const doc = saveDocument(company);
        if (!doc) { void notify('Aucun article à enregistrer'); return; }
        let finalId = doc.id;
        let finalNumber = doc.number;
        let offline = false;
        try {
          const res = await createApiDocument(doc);
          useDocumentStore.getState().confirmDocSynced(doc.id, res);
          finalId = res.id;
          finalNumber = res.number;
        } catch {
          offline = true;
        }
        savedPdfRef.current = await buildPdf(finalNumber);
        hapticSuccess();
        setSavedSheet({
          id: finalId, number: finalNumber, offline,
          clientName: currentDoc.client?.name || 'Client',
          clientPhone: currentDoc.client?.phone || undefined,
          total: totals.netAPayer,
          typeLabel: DOCUMENT_TYPE_LABELS[currentDoc.type],
        });
        resetDocument();
        clientPromptShown.current = false;
      }
    } finally {
      setSaving(false);
    }
  }, [company, editingDocId, guardReady, saveDocument, updateSavedDocument, resetDocument, currentDoc, totals, onExit, buildPdf]);

  // ── Post-save sheet actions ──
  const whatsappMessage = useCallback((s: NonNullable<typeof savedSheet>) =>
    `Bonjour ${s.clientName}, veuillez trouver ci-joint votre ${s.typeLabel.toLowerCase()} N°${s.number} ` +
    `d'un montant de ${s.total.toLocaleString('fr-DZ')} DA. Merci de votre confiance — ${company?.name || 'Rakmana'}.`,
  [company?.name]);

  const markSent = useCallback((s: NonNullable<typeof savedSheet>) => {
    useDocumentStore.getState().setDocumentStatus(s.id, 'SENT');
    if (!s.offline) updateDocumentStatus(s.id, 'SENT').catch(() => {});
  }, []);

  const handleSheetWhatsApp = useCallback(async () => {
    const s = savedSheet;
    if (!s || !savedPdfRef.current) return;
    const result = await shareDocument({
      pdfBase64: savedPdfRef.current, docNumber: s.number, clientName: s.clientName, total: s.total,
    });
    if (result === 'downloaded') {
      void notify('PDF téléchargé — joignez-le à votre message');
      void openWhatsApp({ phone: s.clientPhone, message: whatsappMessage(s) });
    }
    markSent(s);
    setSavedSheet(null);
    onExit?.();
  }, [savedSheet, whatsappMessage, markSent, onExit]);

  const handleSheetDownload = useCallback(async () => {
    const s = savedSheet;
    if (!s || !savedPdfRef.current) return;
    await downloadDocument(savedPdfRef.current, `${s.number}.pdf`);
    void notify('PDF téléchargé ✓');
  }, [savedSheet]);

  const handleSheetDone = useCallback(() => { setSavedSheet(null); onExit?.(); }, [onExit]);

  // ── Share actions ──
  const handleWhatsApp = useCallback(async () => {
    setShareOpen(false);
    if (!guardReady()) return;
    setBusy(true);
    const pdf = await buildPdf();
    setBusy(false);
    if (!pdf) return;
    const result = await shareDocument({
      pdfBase64: pdf, docNumber, clientName: currentDoc.client?.name || 'Client', total: totals.netAPayer,
    });
    if (result === 'downloaded') {
      void notify('PDF téléchargé — joignez-le à votre message');
      const label = DOCUMENT_TYPE_LABELS[currentDoc.type];
      void openWhatsApp({
        phone: currentDoc.client?.phone,
        message:
          `Bonjour ${currentDoc.client?.name || ''}, veuillez trouver ci-joint votre ${label.toLowerCase()} ` +
          `N°${docNumber} d'un montant de ${totals.netAPayer.toLocaleString('fr-DZ')} DA. ` +
          `Merci de votre confiance — ${company?.name || 'Rakmana'}.`,
      });
    }
  }, [guardReady, buildPdf, docNumber, currentDoc, totals, company?.name]);

  const handleDownload = useCallback(async () => {
    setShareOpen(false);
    if (!guardReady()) return;
    setBusy(true);
    const pdf = await buildPdf();
    setBusy(false);
    if (pdf) { await downloadDocument(pdf, `${docNumber}.pdf`); void notify('PDF téléchargé ✓'); }
  }, [guardReady, buildPdf, docNumber]);

  const handlePrint = useCallback(async () => {
    setShareOpen(false);
    if (!guardReady()) return;
    setBusy(true);
    const pdf = await buildPdf();
    setBusy(false);
    if (pdf) await printDocument(pdf);
  }, [guardReady, buildPdf]);

  const handleEmail = useCallback(async () => {
    setShareOpen(false);
    if (!guardReady()) return;
    setBusy(true);
    const pdf = await buildPdf();
    setBusy(false);
    if (!pdf) return;
    const result = await shareDocument({
      pdfBase64: pdf, docNumber, clientName: currentDoc.client?.name || 'Client', total: totals.netAPayer,
    });
    if (result === 'downloaded') {
      const label = DOCUMENT_TYPE_LABELS[currentDoc.type];
      const subject = `${label} ${docNumber}`;
      const body =
        `Bonjour ${currentDoc.client?.name || ''},\n\n` +
        `Veuillez trouver ci-joint votre ${label.toLowerCase()} ${docNumber} d'un montant de ` +
        `${totals.netAPayer.toLocaleString('fr-DZ')} DA.\n\nCordialement,\n${company?.name || 'Rakmana'}`;
      void notify('PDF téléchargé — joignez-le à l’email');
      window.open(`mailto:${currentDoc.client?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_system');
    }
  }, [guardReady, buildPdf, currentDoc, docNumber, totals, company]);

  const openPreview = useCallback(() => {
    if (currentDoc.items.length === 0) { setActiveTab('items'); void notify('Ajoutez au moins un article'); return; }
    setPreviewOpen(true);
  }, [currentDoc.items.length]);

  // ── Tab switch helper ──
  const switchTab = useCallback((tab: TabId) => {
    hapticLight();
    setActiveTab(tab);
    if (tab === 'client') setDockMode('client');
    else if (tab === 'details') setDockMode('details');
    else { setDockMode('add'); setEditingLineId(null); }
  }, []);

  // When dock morphs to line editing, stay on items tab
  const handleDockModeChange = useCallback((m: DockMode) => {
    setDockMode(m);
    if (m === 'client') setActiveTab('client');
    else if (m === 'details') setActiveTab('details');
    else { setActiveTab('items'); if (m !== 'line') setEditingLineId(null); }
  }, []);

  // ── Company guard ──
  if (!company && !savedSheet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy)] px-8">
        <div className="text-center max-w-[280px]">
          <span className="inline-flex w-16 h-16 rounded-2xl bg-[var(--blue-bg)] items-center justify-center mb-4">
            <Building2 size={28} className="text-[var(--green-2)]" />
          </span>
          <h2 className="text-lg font-bold text-[var(--sand)]">Configurez votre société</h2>
          <p className="text-sm text-[var(--sand-muted)] mt-2 mb-6">
            Vos documents ont besoin de l&apos;en-tête de votre activité (nom, NIF…) pour être valides.
          </p>
          <button type="button" onClick={() => (onConfigureCompany ?? onExit)?.()}
            className="w-full h-12 rounded-xl bg-[var(--green-2)] text-white text-sm font-semibold active:scale-[0.98] transition-transform">
            Configurer ma société
          </button>
          <button type="button" onClick={() => onExit?.()}
            className="mt-3 text-xs text-[var(--sand-muted)] underline">
            Plus tard
          </button>
        </div>
      </div>
    );
  }

  // ── Loading / error ──
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
            <button type="button" onClick={() => onExit?.()}
              className="px-5 py-2.5 rounded-xl bg-[var(--navy-3)] text-sm text-[var(--sand)]">Retour</button>
            <button type="button" onClick={() => setRetryToken((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-[var(--green-2)] text-sm font-semibold text-white">Réessayer</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Readiness indicators ──
  const hasClient = !!currentDoc.client?.name;
  const itemCount = currentDoc.items.length;

  return (
    <div
      className="relative min-h-screen flex flex-col bg-[var(--navy)] overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* ═══ TOP BAR ═══ */}
      <div className="shrink-0 px-4 pt-2 pb-2">
        {/* Row 1: back + type + total */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack}
            className="w-11 h-11 -ml-1 rounded-full flex items-center justify-center bg-[var(--navy-3)] text-[var(--sand-muted)] active:scale-95 transition-transform"
            aria-label={t('editor.close')}>
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </button>

          {/* Type pill + number */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--green-2)] text-white">
                {DOCUMENT_TYPE_LABELS[currentDoc.type]}
              </span>
              <span className="text-[11px] text-[var(--sand-muted)] truncate">
                {editingDocId ? docNumber : formatDateAlgerian(new Date())}
              </span>
            </div>
          </div>

          {/* Running total hero */}
          <div className="text-right shrink-0">
            <p className="text-[10px] text-[var(--sand-muted)] leading-none mb-0.5">Net à payer</p>
            <p className="text-lg font-bold text-[var(--green-2)] leading-none tabular-nums">
              {formatDA(totals.netAPayer)}
            </p>
          </div>
        </div>

        {/* Row 2: Summary chips */}
        <div className="flex items-center gap-2 mt-2">
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold',
            itemCount > 0
              ? 'bg-[var(--green-2)]/15 text-[var(--green-2)]'
              : 'bg-[var(--navy-3)] text-[var(--sand-muted)]',
          )}>
            <Package size={11} /> {itemCount} article{itemCount !== 1 ? 's' : ''}
          </span>
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold',
            hasClient
              ? 'bg-[var(--green-2)]/15 text-[var(--green-2)]'
              : 'bg-[var(--navy-3)] text-[var(--sand-muted)]',
          )}>
            <UserRound size={11} /> <span className="truncate max-w-[120px]">{hasClient ? currentDoc.client?.name : 'Aucun client'}</span>
          </span>
          {totals.timbreFiscal && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-[var(--gold)]">
              Timbre {formatDA(totals.timbreAmount)}
            </span>
          )}
        </div>
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div className="shrink-0 flex items-center gap-1 px-4 py-1.5">
        {([
          { id: 'items' as TabId, label: t('editor.preview') === 'Preview' ? 'Items' : 'Articles', icon: Plus, badge: itemCount || undefined },
          { id: 'client' as TabId, label: t('editor.client'), icon: UserRound, badge: hasClient ? '✓' : undefined },
          { id: 'details' as TabId, label: t('editor.editBtn') === 'Edit' ? 'Details' : 'Détails', icon: Settings2, badge: undefined as string | number | undefined },
        ] as const).map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => switchTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]',
              activeTab === id
                ? 'bg-[var(--green-2)] text-white shadow-lg shadow-emerald-900/30'
                : 'bg-[var(--navy-3)] text-[var(--sand-muted)]',
            )}
          >
            <Icon size={15} strokeWidth={2} />
            {label}
            {badge && (
              <span className={cn(
                'min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                activeTab === id ? 'bg-white/25 text-white' : 'bg-[var(--navy-4)] text-[var(--sand-muted)]',
              )}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Items tab: item list + dock */}
        {activeTab === 'items' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Item list */}
            {itemCount > 0 && (
              <div className="shrink-0 max-h-[35vh] overflow-y-auto px-4 py-2 flex flex-col gap-1.5">
                <AnimatePresence initial={false}>
                  {currentDoc.items.map((item, i) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      onClick={() => { setEditingLineId(item.id); setDockMode('line'); }}
                      className={cn(
                        'flex items-center gap-2.5 text-left rounded-xl px-3 py-2.5',
                        'bg-[var(--navy-2)] border border-[var(--border)] active:scale-[0.99] transition-transform',
                        editingLineId === item.id && dockMode === 'line' && 'border-[var(--green-2)] bg-[var(--green-2)]/5',
                      )}
                    >
                      <span className="w-6 h-6 rounded-lg bg-[var(--green-2)]/15 text-[var(--green-2)] flex items-center justify-center text-[11px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] font-medium text-[var(--sand)] truncate">{item.label}</span>
                        <span className="block text-[10px] text-[var(--sand-muted)]">
                          {item.quantity} {UNIT_LABELS[item.unit]} × {item.unitPrice.toLocaleString('fr-DZ')} · TVA {item.tvaRate}%
                        </span>
                      </span>
                      <span className="text-[13px] font-semibold text-[var(--sand)] whitespace-nowrap tabular-nums">
                        {formatDA(item.totalHT)}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Dock (add/edit form) */}
            <div className="flex-1 overflow-y-auto">
              <CreateDock
                mode={dockMode}
                editingLineId={editingLineId}
                catalog={catalog}
                onModeChange={handleDockModeChange}
              />
            </div>
          </div>
        )}

        {/* Client tab */}
        {activeTab === 'client' && (
          <div className="flex-1 overflow-y-auto">
            <CreateDock
              mode="client"
              editingLineId={null}
              catalog={catalog}
              onModeChange={handleDockModeChange}
            />
          </div>
        )}

        {/* Details tab */}
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto">
            <CreateDock
              mode="details"
              editingLineId={null}
              catalog={catalog}
              onModeChange={handleDockModeChange}
            />
          </div>
        )}
      </div>

      {/* ═══ BOTTOM ACTION BAR ═══ */}
      {!keyboardOpen && (
        <nav
          className="shrink-0 bg-[var(--navy-2)] border-t border-[var(--border)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center h-14 px-3 gap-2">
            <button type="button" onClick={openPreview}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--navy-3)] text-[var(--sand-muted)] active:scale-95 transition-transform">
              <Eye size={20} strokeWidth={2} />
            </button>

            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white active:scale-[0.97] transition-all disabled:opacity-40"
              style={{ background: 'var(--green-2)' }}>
              {saving
                ? <Loader2 size={18} className="animate-spin" />
                : <Save size={18} strokeWidth={2.5} />}
              {t('editor.save')}
            </button>

            <button type="button"
              onClick={() => setShareOpen(true)}
              disabled={busy || saving}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--navy-3)] text-[var(--sand-muted)] active:scale-95 transition-transform disabled:opacity-40">
              <Share2 size={20} strokeWidth={2} />
            </button>
          </div>
        </nav>
      )}

      {/* ═══ OVERLAYS ═══ */}

      {/* Document preview */}
      <DocumentPreview
        open={previewOpen}
        docNumber={docNumber}
        busy={busy}
        onClose={() => setPreviewOpen(false)}
        onDownload={handleDownload}
        onShare={handleWhatsApp}
      />

      {/* Share sheet */}
      <AnimatePresence>
        {shareOpen && (
          <>
            <motion.div className="fixed inset-0 z-[80] bg-black/50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShareOpen(false)} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[90] max-w-lg mx-auto bg-[var(--navy-2)] rounded-t-3xl border-t border-[var(--border)] p-3"
              style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}>
              <div className="flex justify-center pt-1 pb-3"><div className="w-10 h-1 rounded-full bg-[var(--navy-4)]" /></div>
              <p className="px-4 pb-2 text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide">{t('editor.send')}</p>
              {[
                { icon: MessageCircle, label: 'WhatsApp', tint: '#25D366', on: handleWhatsApp },
                { icon: Mail, label: 'Email', tint: 'var(--green-2)', on: handleEmail },
                { icon: Download, label: 'PDF', tint: 'var(--green-2)', on: handleDownload },
                { icon: Printer, label: t('editor.notes') === 'Notes & remarks' ? 'Print' : 'Imprimer', tint: 'var(--gold)', on: handlePrint },
              ].map(({ icon: Icon, label, tint, on }) => (
                <button key={label} type="button" onClick={on}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-[var(--navy-3)] transition-colors">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-bg)' }}>
                    <Icon size={18} style={{ color: tint }} />
                  </span>
                  <span className="text-[15px] font-medium text-[var(--sand)]">{label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Exit guard */}
      <ConfirmSheet
        open={exitConfirmOpen}
        title="Quitter la création ?"
        message="Votre brouillon sera conservé et restauré à la prochaine ouverture."
        confirmLabel="Quitter"
        cancelLabel="Continuer"
        destructive={false}
        onConfirm={() => { setExitConfirmOpen(false); onExit?.(); }}
        onClose={() => setExitConfirmOpen(false)}
      />

      {/* Post-save success sheet */}
      <AnimatePresence>
        {savedSheet && (
          <>
            <motion.div className="fixed inset-0 z-[80] bg-black/50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[90] max-w-lg mx-auto bg-[var(--navy-2)] rounded-t-3xl border-t border-[var(--border)] p-5"
              style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}>
              <div className="text-center mb-4">
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.05 }}
                  className="inline-flex w-14 h-14 rounded-full bg-emerald-500/15 items-center justify-center mb-2">
                  <CheckCircle2 size={30} className="text-emerald-400" />
                </motion.span>
                <p className="text-base font-bold text-[var(--sand)]">
                  {savedSheet.typeLabel} enregistré
                </p>
                <p className="mono text-sm text-[var(--green-2)] mt-0.5">{savedSheet.number}</p>
                {savedSheet.offline && (
                  <p className="text-[11px] text-[var(--gold)] mt-1.5">
                    Hors ligne — synchronisation automatique au retour du réseau ✓
                  </p>
                )}
              </div>
              <button type="button" onClick={handleSheetWhatsApp}
                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white active:scale-[0.98] transition-transform"
                style={{ background: '#25D366' }}>
                <MessageCircle size={18} /> Envoyer via WhatsApp
              </button>
              <button type="button" onClick={handleSheetDownload}
                className="w-full h-11 mt-2 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold bg-[var(--navy-3)] text-[var(--sand)] active:scale-[0.98] transition-transform">
                <Download size={17} /> Télécharger le PDF
              </button>
              <button type="button" onClick={handleSheetDone}
                className="w-full h-10 mt-1 text-sm font-medium text-[var(--sand-muted)]">
                Terminé
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
