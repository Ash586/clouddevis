'use client';

// ============================================================
// CloudDevis Mobile — Recent Documents List
// Last 5 documents with staggered animation
// ============================================================

import {
  IconFileText,
  IconReceipt,
  IconClipboardList,
  IconFileInvoice,
  IconConfetti,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Document, DocumentType } from '@/mobile/types';

// ── Document type → icon mapping ──────────────────────────────

const DOC_ICONS: Record<DocumentType, typeof IconFileText> = {
  DEVIS: IconFileText,
  FACTURE: IconReceipt,
  PROFORMA: IconFileInvoice,
  BC: IconClipboardList,
  BR: IconConfetti,
};

// ── Status → badge variant mapping ────────────────────────────

type BadgeVariant = 'success' | 'warning' | 'default' | 'danger';

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  PAID: { label: 'Payé', variant: 'success' },
  SENT: { label: 'En attente', variant: 'warning' },
  DRAFT: { label: 'Brouillon', variant: 'default' },
  CANCELLED: { label: 'Annulé', variant: 'danger' },
};

// ── Format currency ───────────────────────────────────────────

function formatAmount(amount: number): string {
  return amount.toLocaleString('fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' DA';
}

// ── Component ─────────────────────────────────────────────────

interface RecentDocumentsProps {
  documents: Document[];
  onDocumentTap?: (doc: Document) => void;
  onSeeAll?: () => void;
}

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08, // 80ms stagger
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function RecentDocuments({ documents, onDocumentTap, onSeeAll }: RecentDocumentsProps) {
  const recentDocs = documents.slice(-5).reverse(); // Last 5, newest first

  if (recentDocs.length === 0) {
    return (
      <div className="px-5">
        <h3
          className="text-base font-bold text-[var(--sand)] mb-3"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Récents
        </h3>
        <div
          className={cn(
            'rounded-2xl p-8 text-center',
            'bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)]',
          )}
        >
          <IconFileText size={32} stroke={1.5} className="text-[var(--sand-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--sand-muted)]">
            Aucun document récent
          </p>
          <p className="text-xs text-[var(--sand-muted)] mt-1 opacity-60">
            Créez votre premier devis pour commencer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-base font-bold text-[var(--sand)]"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Récents
        </h3>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs font-semibold text-[var(--green-3)] active:opacity-60 transition-opacity"
          >
            Voir tout
          </button>
        )}
      </div>

      {/* Document list */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2.5"
      >
        {recentDocs.map((doc) => {
          const Icon = DOC_ICONS[doc.type] || IconFileText;
          const status = STATUS_MAP[doc.status] || STATUS_MAP.DRAFT;

          return (
            <motion.button
              key={doc.id}
              variants={itemVariants}
              onClick={() => onDocumentTap?.(doc)}
              className={cn(
                'flex items-center gap-3 w-full p-3.5 rounded-2xl',
                'bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)]',
                'active:scale-[0.98] active:bg-[var(--navy-3)] transition-all',
                'min-h-[56px] text-left',
              )}
            >
              {/* Document type icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[rgba(37,99,235,0.12)]">
                <Icon size={18} stroke={1.8} className="text-[var(--green-3)]" />
              </div>

              {/* Client name + doc number */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--sand)] truncate">
                  {doc.client?.name || 'Client inconnu'}
                </p>
                <p className="text-[11px] text-[var(--sand-muted)] mt-0.5">
                  {doc.number}
                </p>
              </div>

              {/* Status badge + amount */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge variant={status.variant}>
                  {status.label}
                </Badge>
                <span className="text-xs font-semibold text-[var(--sand)] whitespace-nowrap">
                  {formatAmount(doc.totalTTC)}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
