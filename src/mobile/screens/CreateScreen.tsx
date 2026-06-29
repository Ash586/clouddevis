'use client';

// ============================================================
// CloudDevis Mobile — FlashFacture: the single-canvas creator
// Replaces the 4-step wizard. One living invoice (LivePaper) +
// a persistent dock (CreateDock) + an action bar. Tapping a zone
// on the paper morphs the dock — no screen transitions.
// Edit mode (editingDocId) pre-loads the document into the same
// canvas. Maps 1:1 onto the document store.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Save, MessageCircle, Share2, Mail, Download, Printer, Eye,
} from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { useCompanyStore } from '@/stores/companyStore';
import {
  fetchDocumentDetail, createApiDocument, updateApiDocument, type ApiDocumentDetail,
} from '@/mobile/lib/api';
import { generatePDFBase64, printDocument, downloadDocument } from '@/mobile/lib/pdf';
import { shareDocument, openWhatsApp } from '@/mobile/lib/whatsapp';
import { notify } from '@/mobile/lib/toast';
import { generateDocNumber, numberToFrenchWords, formatDateAlgerian } from '@/lib/dgi';
import { LivePaper } from '@/mobile/components/create/LivePaper';
import { CreateDock, type DockMode, type CatalogItem } from '@/mobile/components/create/CreateDock';
import { DocumentPreview } from '@/mobile/components/create/DocumentPreview';
import { DOCUMENT_TYPE_LABELS } from '@/mobile/types';
import type { DocumentType, Client, LineItem, PaymentMode } from '@/mobile/types';

const PAYMENT_LABEL: Record<string, string> = {
  especes: 'Espèces', cheque: 'Chèque', virement: 'Virement', cb: 'Carte bancaire',
};

interface CreateScreenProps {
  editingDocId?: string;
  onExit?: () => void;
}

export function CreateScreen({ editingDocId, onExit }: CreateScreenProps) {
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

  const [dockMode, setDockMode] = useState<DockMode>('add');
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const pdfRef = useRef<string | null>(null);

  // ── Real document number ──
  const docNumber = useMemo(() => {
    if (editingDocId) {
      const existing = savedDocuments.find((d) => d.id === editingDocId);
      if (existing?.number) return existing.number;
    }
    return generateDocNumber(currentDoc.type, savedDocuments.length + 1);
  }, [editingDocId, savedDocuments, currentDoc.type]);

  // ── Catalog: most-used items from saved documents ──
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

  // ── Load on mount: edit pre-loads doc; new resets ──
  useEffect(() => {
    if (!editingDocId) {
      resetDocument();
      pdfRef.current = null;
      return;
    }
    const loadIntoStore = (raw: ApiDocumentDetail) => {
      let parsed: Array<Record<string, unknown>> = [];
      try { parsed = JSON.parse(raw.items) as Array<Record<string, unknown>>; } catch { parsed = []; }
      const valid = new Set(['DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR']);
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
      .catch(() => setLoadError('Impossible de charger le document.'))
      .finally(() => setLoadingDoc(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDocId, retryToken]);

  // ── Zone taps morph the dock ──
  const tapType = useCallback(() => { setEditingLineId(null); setDockMode('details'); }, []);
  const tapDetails = useCallback(() => { setEditingLineId(null); setDockMode('details'); }, []);
  const tapClient = useCallback(() => { setEditingLineId(null); setDockMode('client'); }, []);
  const tapLine = useCallback((id: string) => { setEditingLineId(id); setDockMode('line'); }, []);

  const handleBack = useCallback(() => {
    if (!editingDocId) resetDocument();
    onExit?.();
  }, [editingDocId, onExit, resetDocument]);

  // ── PDF (cached until the doc changes) ──
  const buildPdf = useCallback(async (): Promise<string | null> => {
    if (pdfRef.current) return pdfRef.current;
    try {
      const base64 = await generatePDFBase64({
        docNumber,
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
        totalInWords: numberToFrenchWords(totals.netAPayer),
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

  // invalidate cached PDF whenever the document content changes
  useEffect(() => { pdfRef.current = null; }, [currentDoc, totals]);

  const guardReady = useCallback((): boolean => {
    if (!currentDoc.client?.name) { setDockMode('client'); void notify('Choisissez un client'); return false; }
    if (currentDoc.items.length === 0) { setDockMode('add'); void notify('Ajoutez au moins un article'); return false; }
    return true;
  }, [currentDoc]);

  // ── Save ──
  const handleSave = useCallback(async () => {
    if (!company) { void notify('Configurez votre société d’abord'); return; }
    if (!guardReady()) return;
    setSaving(true);
    try {
      if (editingDocId) {
        const temp = saveDocument(company);
        if (!temp) { void notify('Aucun article à enregistrer'); return; }
        await updateApiDocument(editingDocId, { ...temp, id: editingDocId });
        updateSavedDocument(editingDocId, {
          type: currentDoc.type, client: currentDoc.client as Client, items: currentDoc.items,
          notes: currentDoc.notes || undefined, paymentMode: currentDoc.paymentMode,
          acompte: currentDoc.acompte || undefined, totalHT: totals.subTotalHT,
          totalTVA: totals.totalTVA, totalTTC: totals.totalTTC,
          timbreFiscal: totals.timbreFiscal, timbreAmount: totals.timbreAmount,
        });
      } else {
        const doc = saveDocument(company);
        if (!doc) { void notify('Aucun article à enregistrer'); return; }
        await createApiDocument(doc);
      }
      void notify('Enregistré ✓');
      setTimeout(() => onExit?.(), 700);
    } catch {
      void notify('Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  }, [company, editingDocId, guardReady, saveDocument, updateSavedDocument, currentDoc, totals, onExit]);

  // ── Share actions (all web-aware) ──
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
      void openWhatsApp({ phone: currentDoc.client?.phone, message: `${DOCUMENT_TYPE_LABELS[currentDoc.type]} ${docNumber}` });
    }
  }, [guardReady, buildPdf, docNumber, currentDoc, totals]);

  const handleDownload = useCallback(async () => {
    setShareOpen(false);
    if (!guardReady()) return;
    setBusy(true);
    const pdf = await buildPdf();
    setBusy(false);
    if (pdf) { downloadDocument(pdf, `${docNumber}.pdf`); void notify('PDF téléchargé ✓'); }
  }, [guardReady, buildPdf, docNumber]);

  const handlePrint = useCallback(async () => {
    setShareOpen(false);
    if (!guardReady()) return;
    setBusy(true);
    const pdf = await buildPdf();
    setBusy(false);
    if (pdf) printDocument(pdf);
  }, [guardReady, buildPdf]);

  const handleEmail = useCallback(async () => {
    setShareOpen(false);
    if (!guardReady()) return;
    setBusy(true);
    const pdf = await buildPdf();
    setBusy(false);
    if (!pdf) return;
    // Prefer the native/web share sheet so the PDF actually attaches.
    const result = await shareDocument({
      pdfBase64: pdf, docNumber, clientName: currentDoc.client?.name || 'Client', total: totals.netAPayer,
    });
    if (result === 'downloaded') {
      // Desktop: PDF was downloaded — open the mail composer (mailto can't attach).
      const label = DOCUMENT_TYPE_LABELS[currentDoc.type];
      const subject = `${label} ${docNumber}`;
      const body =
        `Bonjour ${currentDoc.client?.name || ''},\n\n` +
        `Veuillez trouver ci-joint votre ${label.toLowerCase()} ${docNumber} d'un montant de ` +
        `${totals.netAPayer.toLocaleString('fr-DZ')} DA.\n\nCordialement,\n${company?.name || 'CloudDevis'}`;
      void notify('PDF téléchargé — joignez-le à l’email');
      window.open(`mailto:${currentDoc.client?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_system');
    }
  }, [guardReady, buildPdf, currentDoc, docNumber, totals, company]);

  const openPreview = useCallback(() => {
    if (currentDoc.items.length === 0) { setDockMode('add'); void notify('Ajoutez au moins un article'); return; }
    setPreviewOpen(true);
  }, [currentDoc.items.length]);

  // ── Loading / error states ──
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
            <button type="button" onClick={() => setRetryToken((t) => t + 1)}
              className="px-5 py-2.5 rounded-xl bg-[var(--green-2)] text-sm font-semibold text-white">Réessayer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex flex-col bg-[var(--navy)] overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-1">
        <button type="button" onClick={handleBack}
          className="w-11 h-11 -ml-1 rounded-full flex items-center justify-center bg-[var(--navy-3)] text-[var(--sand-muted)] active:scale-95 transition-transform"
          aria-label="Fermer">
          <ArrowLeft size={20} className="rtl:rotate-180" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-[var(--sand-muted)]">{editingDocId ? 'Modifier' : 'Nouveau'}</p>
          <p className="text-sm font-semibold text-[var(--sand)]">{DOCUMENT_TYPE_LABELS[currentDoc.type]}</p>
        </div>
      </div>

      {/* Living invoice */}
      <LivePaper
        type={currentDoc.type}
        docNumber={docNumber}
        dateLabel={formatDateAlgerian(new Date())}
        editing={!!editingDocId}
        client={currentDoc.client}
        items={currentDoc.items}
        totals={totals}
        activeZone={dockMode === 'add' ? null : dockMode}
        activeLineId={editingLineId}
        onTapType={tapType}
        onTapClient={tapClient}
        onTapDetails={tapDetails}
        onTapLine={tapLine}
      />

      {/* Dock */}
      <CreateDock
        mode={dockMode}
        editingLineId={editingLineId}
        catalog={catalog}
        onModeChange={(m) => { setDockMode(m); if (m !== 'line') setEditingLineId(null); }}
      />

      {/* Action bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--navy-2)] border-t border-[var(--border)]">
        <button type="button" onClick={openPreview}
          className="h-12 px-3 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold bg-[var(--navy-3)] text-[var(--sand)] active:scale-[0.98] transition-transform"
          aria-label="Aperçu du document">
          <Eye size={18} /> Aperçu
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white active:scale-[0.98] transition-all disabled:opacity-60"
          style={{ background: 'var(--green-2)' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Enregistrer
        </button>
        <button type="button" onClick={() => setShareOpen(true)} disabled={busy}
          className="h-12 px-3 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold bg-[var(--navy-3)] text-[var(--sand)] active:scale-[0.98] transition-transform disabled:opacity-60"
          aria-label="Envoyer">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={18} />}
          Envoyer
        </button>
      </div>

      {/* Full document preview (see before download) */}
      <DocumentPreview
        open={previewOpen}
        docNumber={docNumber}
        busy={busy}
        onClose={() => setPreviewOpen(false)}
        onDownload={handleDownload}
        onShare={handleWhatsApp}
      />

      {/* Share menu */}
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
              <p className="px-4 pb-2 text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide">Envoyer le document</p>
              {[
                { icon: MessageCircle, label: 'WhatsApp', tint: '#25D366', on: handleWhatsApp },
                { icon: Mail, label: 'Email', tint: 'var(--green-2)', on: handleEmail },
                { icon: Download, label: 'Télécharger le PDF', tint: 'var(--green-2)', on: handleDownload },
                { icon: Printer, label: 'Imprimer', tint: 'var(--gold)', on: handlePrint },
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
    </div>
  );
}
