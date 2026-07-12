'use client';

// ============================================================
// Rakmana Mobile — Documents List Screen
// Filters: All | DEVIS | FACTURE | Payé | En attente | Ce mois
// Swipe-to-action on each row
// Long press opens ActionSheet
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FilePlus, Files, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { Loader2 } from 'lucide-react';
import { DocumentRow } from '@/mobile/components/DocumentRow';
import { refreshAllData } from '@/mobile/lib/useApiSync';
import { updateDocumentStatus } from '@/mobile/lib/api';
import { usePullToRefresh } from '@/mobile/lib/usePullToRefresh';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { ConfirmSheet } from '@/mobile/components/ConfirmSheet';
import { generatePDFBase64FromDoc, printDocument } from '@/mobile/lib/pdf';
import { shareDocument } from '@/mobile/lib/whatsapp';
import { notify } from '@/mobile/lib/toast';
import type { Document } from '@/mobile/types';

// ── Filter definitions ───────────────────────────────────────

type FilterId = 'all' | 'devis' | 'facture' | 'paid' | 'pending' | 'thisMonth';

interface Filter {
  id: FilterId;
  label: string;
}

const FILTERS: Filter[] = [
  { id: 'all', label: 'Tout' },
  { id: 'devis', label: 'Devis' },
  { id: 'facture', label: 'Facture' },
  { id: 'paid', label: 'Payé' },
  { id: 'pending', label: 'En attente' },
  { id: 'thisMonth', label: 'Ce mois' },
];

// ── Helpers ──────────────────────────────────────────────────

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  );
}

function filterDocuments(docs: Document[], filter: FilterId): Document[] {
  switch (filter) {
    case 'devis':
      return docs.filter((d) => d.type === 'DEVIS');
    case 'facture':
      return docs.filter((d) => d.type === 'FACTURE');
    case 'paid':
      return docs.filter((d) => d.status === 'PAID');
    case 'pending':
      return docs.filter((d) => d.status === 'SENT');
    case 'thisMonth':
      return docs.filter((d) => isThisMonth(d.date));
    default:
      return docs;
  }
}

// ── Props ────────────────────────────────────────────────────

interface DocumentsListScreenProps {
  onNewDocument?: () => void;
  onEditDocument?: (doc: Document) => void;
  /** Prefill the creator with a copy of this doc (new number/date). */
  onDuplicateDocument?: (doc: Document) => void;
}

// ── Component ────────────────────────────────────────────────

export function DocumentsListScreen({
  onNewDocument,
  onEditDocument,
  onDuplicateDocument,
}: DocumentsListScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [actionSheetDoc, setActionSheetDoc] = useState<Document | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const savedDocuments = useDocumentStore((s) => s.savedDocuments);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);
  const duplicateDocument = useDocumentStore((s) => s.duplicateDocument);

  // ── Pull-to-refresh ────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    try {
      const ok = await refreshAllData();
      void notify(ok ? 'Documents à jour ✓' : 'Hors ligne — impossible d’actualiser');
    } catch {
      void notify('Échec de l’actualisation');
    }
  }, []);
  const { pull, refreshing, handlers } = usePullToRefresh(handleRefresh);

  // ── Filter + search ────────────────────────────────────────
  const filteredDocs = useMemo(() => {
    let docs = filterDocuments(savedDocuments, activeFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.client?.name?.toLowerCase().includes(q) ||
          d.number.toLowerCase().includes(q) ||
          d.client?.nif?.includes(q)
      );
    }

    // Sort: newest first
    return [...docs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [savedDocuments, activeFilter, searchQuery]);

  // ── Count per filter for badges ────────────────────────────
  const counts = useMemo(
    () => ({
      all: savedDocuments.length,
      devis: savedDocuments.filter((d) => d.type === 'DEVIS').length,
      facture: savedDocuments.filter((d) => d.type === 'FACTURE').length,
      paid: savedDocuments.filter((d) => d.status === 'PAID').length,
      pending: savedDocuments.filter((d) => d.status === 'SENT').length,
      thisMonth: savedDocuments.filter((d) => isThisMonth(d.date)).length,
    }),
    [savedDocuments]
  );

  // ── Handlers ───────────────────────────────────────────────
  const handleEdit = useCallback(
    (doc: Document) => {
      onEditDocument?.(doc);
    },
    [onEditDocument]
  );

  const handleDuplicate = useCallback(
    (doc: Document) => {
      const newDoc = duplicateDocument(doc.id);
      if (newDoc) {
        void notify('Document dupliqué');
      }
    },
    [duplicateDocument]
  );

  const handleDelete = useCallback(
    (doc: Document) => {
      setActionSheetDoc(doc);
      setActionSheetOpen(true);
    },
    []
  );

  const handleLongPress = useCallback((doc: Document) => {
    setActionSheetDoc(doc);
    setActionSheetOpen(true);
  }, []);

  const handleActionSheet = useCallback(
    async (actionId: string, doc: Document) => {
      switch (actionId) {
        case 'edit':
          onEditDocument?.(doc);
          break;
        case 'duplicate':
          // Open the creator prefilled (new number/date) instead of
          // silently saving a hidden copy.
          if (onDuplicateDocument) onDuplicateDocument(doc);
          else if (duplicateDocument(doc.id)) void notify('Document dupliqué');
          break;
        case 'markPaid':
          useDocumentStore.getState().setDocumentStatus(doc.id, 'PAID');
          updateDocumentStatus(doc.id, 'PAID').catch(() => {});
          void notify('Marqué payé ✓');
          break;
        case 'convertToFacture': {
          if (onDuplicateDocument) onDuplicateDocument(doc);
          // After loading into wizard, override the type to FACTURE
          useDocumentStore.getState().setType('FACTURE');
          void notify('Converti en Facture');
          break;
        }
        case 'delete':
          setDocToDelete(doc);
          break;
        case 'share':
          try {
            const pdf = await generatePDFBase64FromDoc(doc);
            await shareDocument({
              pdfBase64: pdf,
              docNumber: doc.number,
              clientName: doc.client.name,
              total: doc.totalTTC + doc.timbreAmount - (doc.acompte || 0),
            });
          } catch {
            void notify('Partage impossible');
          }
          break;
        case 'download':
        case 'print':
          try {
            const pdf = await generatePDFBase64FromDoc(doc);
            printDocument(pdf);
          } catch {
            void notify('Génération du PDF impossible');
          }
          break;
      }
    },
    [onEditDocument, onDuplicateDocument, duplicateDocument]
  );

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--sand)]">Documents</h1>
            <p className="text-xs text-[var(--sand-muted)] mt-0.5">
              {savedDocuments.length} document{savedDocuments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button"               onClick={() => setShowSearch(!showSearch)}
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center transition-colors',
                showSearch
                  ? 'bg-[var(--green-2)] text-white'
                  : 'bg-[var(--navy-3)] text-[var(--sand-muted)]',
              )}
              aria-label={showSearch ? 'Fermer la recherche' : 'Rechercher'}
            >
              {showSearch ? <X size={18} /> : <Search size={18} />}
            </button>
            <button type="button"               onClick={onNewDocument}
              className="w-11 h-11 rounded-xl bg-[var(--green-2)] flex items-center justify-center text-white active:scale-95 transition-transform"
              aria-label="Nouveau document"
            >
              <FilePlus size={18} />
            </button>
          </div>
        </div>

        {/* ── Search bar ──────────────────────────────────────── */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative mb-3">
                <Search
                  size={16}
                  className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un client, NIF, numéro..."
                  className={cn(
                    'w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl text-sm',
                    'bg-[var(--navy-3)] text-[var(--sand)] placeholder:text-[var(--sand-muted)]',
                    'border border-[var(--border)]',
                    'focus:outline-none focus:border-[var(--green-2)]',
                  )}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters bar (horizontal scroll) ─────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            const count = counts[filter.id];
            return (
              <button type="button"                 key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                  'transition-all duration-200 border',
                  isActive
                    ? 'bg-[var(--green-2)] text-white border-[var(--green-2)]'
                    : 'bg-[var(--navy-3)] text-[var(--sand-muted)] border-[var(--border)] active:bg-[var(--navy-2)]',
                )}
              >
                {filter.label}
                {count > 0 && (
                  <span
                    className={cn(
                      'min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--border)] text-[var(--sand-muted)]',
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Document list ───────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-5 pb-24 relative"
        style={{ overscrollBehaviorY: 'contain' }}
        onTouchStart={handlers.onTouchStart}
        onTouchMove={handlers.onTouchMove}
        onTouchEnd={handlers.onTouchEnd}
      >
        {/* Pull-to-refresh spinner */}
        {(pull > 0 || refreshing) && (
          <div
            className="absolute left-0 right-0 top-0 flex items-center justify-center pointer-events-none z-10"
            style={{ height: pull || 40, opacity: refreshing ? 1 : Math.min(1, pull / 70) }}
          >
            <Loader2
              size={20}
              className={cn('text-[var(--green-2)]', refreshing && 'animate-spin')}
              style={{ transform: refreshing ? undefined : `rotate(${pull * 3}deg)` }}
            />
          </div>
        )}
        <div style={{ transform: `translateY(${pull}px)`, transition: pull === 0 ? 'transform 0.25s' : undefined }}>
        {filteredDocs.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--navy-3)] flex items-center justify-center mb-4">
              <Files size={28} className="text-[var(--sand-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--sand-muted)]">
              {searchQuery
                ? 'Aucun résultat'
                : activeFilter === 'all'
                  ? 'Aucun document'
                  : `Aucun document "${FILTERS.find((f) => f.id === activeFilter)?.label}"`}
            </p>
            <p className="text-xs text-[var(--sand-muted)] mt-1 text-center max-w-[200px]">
              {searchQuery
                ? 'Essayez un autre terme de recherche'
                : 'Créez votre premier document en appuyant sur le bouton +'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {filteredDocs.map((doc, i) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                index={i}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onLongPress={handleLongPress}
              />
            ))}
          </motion.div>
        )}
        </div>
      </div>

      {/* ── ActionSheet ──────────────────────────────────────── */}
      <ActionSheet
        open={actionSheetOpen}
        actionDoc={actionSheetDoc}
        onClose={() => {
          setActionSheetOpen(false);
          setActionSheetDoc(null);
        }}
        onAction={handleActionSheet}
      />

      {/* ── Delete confirmation ──────────────────────────────── */}
      <ConfirmSheet
        open={docToDelete !== null}
        title="Supprimer ce document ?"
        message={
          docToDelete
            ? `${docToDelete.number} — ${docToDelete.client?.name ?? ''}. Cette action est irréversible.`
            : 'Cette action est irréversible.'
        }
        onConfirm={() => {
          if (docToDelete) {
            deleteDocument(docToDelete.id);
            void notify('Document supprimé');
          }
        }}
        onClose={() => setDocToDelete(null)}
      />
    </div>
  );
}
