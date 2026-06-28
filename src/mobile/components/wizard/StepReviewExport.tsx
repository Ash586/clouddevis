'use client';

// ============================================================
// CloudDevis Mobile — Step 4: Review & Export
// Document preview + PDF generation + share options
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import { FileText, MessageCircle, Mail, Download, Printer, Check, Loader2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { useCompanyStore } from '@/stores/companyStore';
import { Badge } from '@/components/ui/badge';
import { generatePDFBase64, printDocument, downloadDocument } from '@/mobile/lib/pdf';
import { shareDocument } from '@/mobile/lib/whatsapp';
import { updateApiDocument, createApiDocument } from '@/mobile/lib/api';
import { numberToFrenchWords, formatDateAlgerian, generateDocNumber } from '@/lib/dgi';
import type { DocumentType } from '@/mobile/types';

// ── Helpers ───────────────────────────────────────────────────

function formatDA(n: number): string {
  return n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DA';
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  DEVIS: 'Devis',
  FACTURE: 'Facture',
  PROFORMA: 'Proforma',
  BC: 'Bon de Commande',
  BR: 'Bon de Réception',
};

// ── Component ─────────────────────────────────────────────────

interface StepReviewExportProps {
  onBack: () => void;
  /** When set: edit mode — saves via PUT instead of POST */
  editingDocId?: string;
  /** Called after a successful save (closes wizard) */
  onSaved?: () => void;
}

export function StepReviewExport({ onBack, editingDocId, onSaved }: StepReviewExportProps) {
  const currentDoc = useDocumentStore((s) => s.currentDoc);
  const totals = useDocumentStore((s) => s.totals);
  const saveDocument = useDocumentStore((s) => s.saveDocument);
  const updateSavedDocument = useDocumentStore((s) => s.updateSavedDocument);
  const savedDocuments = useDocumentStore((s) => s.savedDocuments);
  const company = useCompanyStore((s) => s.company);

  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Real document number ──
  // Edit mode: reuse the existing number. New doc: preview the number the
  // store will assign on save (savedDocuments.length + 1), matching buildDocument().
  const docNumber = useMemo(() => {
    if (editingDocId) {
      const existing = savedDocuments.find((d) => d.id === editingDocId);
      if (existing?.number) return existing.number;
    }
    return generateDocNumber(currentDoc.type, savedDocuments.length + 1);
  }, [editingDocId, savedDocuments, currentDoc.type]);

  // ── Generate PDF ──
  const handleGeneratePDF = useCallback(async () => {
    setGenerating(true);
    try {
      const base64 = await generatePDFBase64({
        docNumber,
        docType: currentDoc.type,
        clientName: currentDoc.client?.name || 'Client',
        clientAddress: currentDoc.client?.address,
        clientNif: currentDoc.client?.nif,
        items: currentDoc.items.map((item) => ({
          designation: item.label,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.totalHT,
        })),
        subTotalHT: totals.subTotalHT,
        tvaAmount: totals.totalTVA,
        timbreFiscal: totals.timbreAmount,
        totalTTC: totals.totalTTC,
        totalInWords: numberToFrenchWords(totals.netAPayer),
        companyName: company?.name,
        companyAddress: company?.address,
        companyNif: company?.nif,
        companyRc: company?.rc,
        companyNis: company?.nis,
        companyAi: company?.ai,
        date: new Date().toISOString().split('T')[0],
        notes: currentDoc.notes,
      });
      setPdfBase64(base64);
      setPdfGenerated(true);
    } catch (err) {
      logger.error('PDF generation failed:', { error: String(err) });
    } finally {
      setGenerating(false);
    }
  }, [currentDoc, totals, company, docNumber]);

  // ── Save document ──
  const handleSave = useCallback(async () => {
    if (!company) return;
    setSaving(true);
    setSaveError('');
    try {
      if (editingDocId) {
        // Build a temporary full document from wizard state to send to PUT
        const tempDoc = saveDocument(company);
        if (!tempDoc) { setSaveError('Aucun article à enregistrer.'); return; }
        // Override the ID so we PUT the right document
        const docToSend = { ...tempDoc, id: editingDocId };
        await updateApiDocument(editingDocId, docToSend);
        // Patch local store so the list reflects changes immediately
        updateSavedDocument(editingDocId, {
          type: currentDoc.type,
          client: currentDoc.client as never,
          items: currentDoc.items,
          notes: currentDoc.notes || undefined,
          paymentMode: currentDoc.paymentMode,
          acompte: currentDoc.acompte || undefined,
          totalHT: totals.subTotalHT,
          totalTVA: totals.totalTVA,
          totalTTC: totals.totalTTC,
          timbreFiscal: totals.timbreFiscal,
          timbreAmount: totals.timbreAmount,
        });
      } else {
        const doc = saveDocument(company);
        if (!doc) { setSaveError('Aucun article à enregistrer.'); return; }
        await createApiDocument(doc);
      }
      setSaved(true);
      setTimeout(() => onSaved?.(), 800);
    } catch {
      setSaveError('Erreur lors de l\'enregistrement. Réessayez.');
    } finally {
      setSaving(false);
    }
  }, [company, editingDocId, saveDocument, updateSavedDocument, currentDoc, totals, onSaved]);

  // ── Share handlers ──
  const handleWhatsApp = useCallback(() => {
    if (pdfBase64) {
      shareDocument({
        pdfBase64,
        docNumber,
        clientName: currentDoc.client?.name || 'Client',
        total: totals.netAPayer,
      });
    }
  }, [pdfBase64, currentDoc, totals, docNumber]);

  const handleEmail = useCallback(() => {
    const label = DOC_TYPE_LABELS[currentDoc.type] || 'Document';
    const subject = `${label} ${docNumber}`;
    const body =
      `Bonjour ${currentDoc.client?.name || ''},\n\n` +
      `Veuillez trouver votre ${label.toLowerCase()} ${docNumber} ` +
      `d'un montant de ${formatDA(totals.netAPayer)}.\n\n` +
      `Cordialement,\n${company?.name || 'CloudDevis'}`;
    const to = currentDoc.client?.email || '';
    window.open(
      `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_system',
    );
  }, [currentDoc, docNumber, totals, company]);

  const handleDownload = useCallback(() => {
    if (pdfBase64) {
      downloadDocument(pdfBase64, `${docNumber}.pdf`);
    }
  }, [pdfBase64, docNumber]);

  const handlePrint = useCallback(() => {
    if (pdfBase64) {
      printDocument(pdfBase64);
    }
  }, [pdfBase64]);

  return (
    <div className="flex flex-col gap-5 px-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="w-11 h-11 -ml-2 rounded-xl flex items-center justify-center text-[var(--sand-muted)] active:scale-95 transition-transform"
          aria-label="Modifier les articles"
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h2 className="heading text-lg text-[var(--sand)]">Aperçu</h2>
          <p className="text-sm text-[var(--sand-muted)] mt-0.5">
            Vérifiez et générez votre document
          </p>
        </div>
      </div>

      {/* Document preview card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl overflow-hidden',
          'bg-[var(--navy-2)] border border-[var(--border)]',
        )}
      >
        {/* Header bar */}
        <div
          className="flex items-center gap-3 p-4"
          style={{ background: 'var(--green-2)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              {DOC_TYPE_LABELS[currentDoc.type] || currentDoc.type}
            </p>
            <p className="text-[10px] text-white/70">
              {formatDateAlgerian(new Date())}
            </p>
          </div>
          <Badge variant="success">Brouillon</Badge>
        </div>

        {/* Client info */}
        <div className="p-4 border-b border-[var(--border)]">
          <p className="text-[10px] text-[var(--sand-muted)] uppercase tracking-wide mb-1">
            Client
          </p>
          <p className="text-sm font-semibold text-[var(--sand)]">
            {currentDoc.client?.name || '—'}
          </p>
          {currentDoc.client?.nif && (
            <p className="text-[11px] text-[var(--sand-muted)] mt-0.5">
              NIF: {currentDoc.client.nif}
            </p>
          )}
        </div>

        {/* Items */}
        <div className="p-4">
          <p className="text-[10px] text-[var(--sand-muted)] uppercase tracking-wide mb-2">
            Articles ({currentDoc.items.length})
          </p>
          <div className="flex flex-col gap-2">
            {currentDoc.items.slice(0, 4).map((item, i) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-[var(--sand)] truncate mr-2">
                  {i + 1}. {item.label}
                </span>
                <span className="text-[var(--sand-muted)] whitespace-nowrap">
                  {formatDA(item.totalHT)}
                </span>
              </div>
            ))}
            {currentDoc.items.length > 4 && (
              <p className="text-[10px] text-[var(--sand-muted)]">
                +{currentDoc.items.length - 4} autres articles
              </p>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="p-4 bg-[var(--navy-3)]">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-[var(--sand-muted)]">
              <span>HT</span>
              <span>{formatDA(totals.subTotalHT)}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--sand-muted)]">
              <span>TVA</span>
              <span>{formatDA(totals.totalTVA)}</span>
            </div>
            {totals.timbreFiscal && (
              <div className="flex justify-between text-xs text-amber-400">
                <span>Timbre</span>
                <span>{formatDA(totals.timbreAmount)}</span>
              </div>
            )}
            <div className="h-px bg-[var(--border)]" />
            <div className="flex justify-between text-sm font-bold text-[var(--sand)]">
              <span>TTC</span>
              <span>{formatDA(totals.totalTTC)}</span>
            </div>
          </div>

          {/* Total in words */}
          <p className="text-[10px] text-[var(--sand-muted)] mt-3 italic leading-relaxed">
            {numberToFrenchWords(totals.netAPayer)}
          </p>
        </div>
      </motion.div>

      {/* Quick save button in edit mode (before PDF) */}
      {editingDocId && !saved && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'h-12 rounded-xl text-sm font-semibold text-white',
            'active:scale-[0.97] transition-all flex items-center justify-center gap-2',
            'disabled:opacity-60',
          )}
          style={{ background: 'var(--green-2)', boxShadow: '0 4px 20px rgba(37,99,235, 0.35)' }}
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Enregistrer les modifications
        </button>
      )}
      {editingDocId && saved && (
        <div className="flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Check size={16} className="text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">Modifications enregistrées</span>
        </div>
      )}
      {saveError && !pdfGenerated && (
        <p className="text-xs text-red-400 text-center">{saveError}</p>
      )}

      {/* Generate PDF button */}
      {!pdfGenerated && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleGeneratePDF}
          disabled={generating || currentDoc.items.length === 0}
          className={cn(
            'h-12 rounded-xl text-sm font-semibold text-white',
            'active:scale-[0.97] transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          style={{
            background: 'var(--green-2)',
            boxShadow: '0 4px 20px rgba(37,99,235, 0.35)',
          }}
        >
          {generating ? 'Génération...' : 'Générer PDF'}
        </motion.button>
      )}

      {/* Share options (shown after PDF generation) */}
      <AnimatePresence>
        {pdfGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Success banner */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Check size={16} className="text-emerald-400" />
              <p className="text-xs text-emerald-400 font-semibold">PDF généré avec succès</p>
            </div>

            {/* Share grid */}
            <p className="text-xs text-[var(--sand-muted)] font-semibold uppercase tracking-wide">
              Partager
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp */}
              <button type="button"                 onClick={handleWhatsApp}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 rounded-2xl',
                  'bg-[var(--navy-2)] border border-[var(--border)]',
                  'active:scale-[0.97] transition-transform',
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 flex items-center justify-center">
                  <MessageCircle size={20} className="text-[#25D366]" />
                </div>
                <span className="text-xs font-semibold text-[var(--sand)]">WhatsApp</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={handleEmail}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 rounded-2xl',
                  'bg-[var(--navy-2)] border border-[var(--border)]',
                  'active:scale-[0.97] transition-transform',
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--blue-bg)] flex items-center justify-center">
                  <Mail size={20} className="text-[var(--green-2)]" />
                </div>
                <span className="text-xs font-semibold text-[var(--sand)]">Email</span>
              </button>

              {/* Download */}
              <button
                type="button"
                onClick={handleDownload}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 rounded-2xl',
                  'bg-[var(--navy-2)] border border-[var(--border)]',
                  'active:scale-[0.97] transition-transform',
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--sand)]/10 flex items-center justify-center">
                  <Download size={20} className="text-[var(--sand)]" />
                </div>
                <span className="text-xs font-semibold text-[var(--sand)]">Télécharger</span>
              </button>

              {/* Print */}
              <button type="button"                 onClick={handlePrint}
                className={cn(
                  'flex flex-col items-center gap-2 py-4 rounded-2xl',
                  'bg-[var(--navy-2)] border border-[var(--border)]',
                  'active:scale-[0.97] transition-transform',
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
                  <Printer size={20} className="text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-[var(--sand)]">Imprimer</span>
              </button>
            </div>

            {/* Save button */}
            {saveError && (
              <p className="text-xs text-red-400 text-center">{saveError}</p>
            )}
            {!saved ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'h-12 rounded-xl text-sm font-semibold text-white mt-1',
                  'active:scale-[0.97] transition-all flex items-center justify-center gap-2',
                  'disabled:opacity-60',
                )}
                style={{
                  background: 'var(--green-2)',
                  boxShadow: '0 2px 12px rgba(37,99,235, 0.3)',
                }}
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {editingDocId ? 'Enregistrer les modifications' : 'Enregistrer le document'}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Check size={16} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">
                  {editingDocId ? 'Modifications enregistrées' : 'Enregistré'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
