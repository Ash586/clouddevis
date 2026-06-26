'use client';

// ============================================================
// CloudDevis Mobile — Document Row with Swipe-to-Action
// Swipe left reveals: Edit | Duplicate | Delete
// Long press opens ActionSheet
// ============================================================

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  FileText,
  Receipt,
  ReceiptText,
  ClipboardList,
  PartyPopper,
  Pencil,
  Copy,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Document, DocumentType, DocumentStatus } from '@/mobile/types';

// ── Constants ────────────────────────────────────────────────

const SWIPE_THRESHOLD = -80;
const ACTION_WIDTH = 76;

const DOC_ICONS: Record<DocumentType, LucideIcon> = {
  DEVIS: FileText,
  FACTURE: Receipt,
  PROFORMA: ReceiptText,
  BC: ClipboardList,
  BR: PartyPopper,
};

const DOC_COLORS: Record<DocumentType, string> = {
  DEVIS: '#1D4ED8',
  FACTURE: '#2563EB',
  PROFORMA: '#7C3AED',
  BC: '#D97706',
  BR: '#059669',
};

type BadgeVariant = 'success' | 'warning' | 'default' | 'danger';

const STATUS_MAP: Record<DocumentStatus, { label: string; variant: BadgeVariant }> = {
  PAID: { label: 'Payé', variant: 'success' },
  SENT: { label: 'En attente', variant: 'warning' },
  DRAFT: { label: 'Brouillon', variant: 'default' },
  CANCELLED: { label: 'Annulé', variant: 'danger' },
};

// ── Helpers ──────────────────────────────────────────────────

function formatAmount(amount: number): string {
  return (
    amount.toLocaleString('fr-DZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' DA'
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
}

// ── Props ────────────────────────────────────────────────────

interface DocumentRowProps {
  document: Document;
  onEdit?: (doc: Document) => void;
  onDuplicate?: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  onLongPress?: (doc: Document) => void;
  index?: number;
}

// ── Component ────────────────────────────────────────────────

export function DocumentRow({
  document: doc,
  onEdit,
  onDuplicate,
  onDelete,
  onLongPress,
  index = 0,
}: DocumentRowProps) {
  const [swiped, setSwiped] = useState(false);
  const x = useMotionValue(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transform x for action button opacity
  const editOpacity = useTransform(x, [-150, -80, -40], [1, 1, 0]);
  const dupOpacity = useTransform(x, [-200, -120, -80], [1, 1, 0]);
  const delOpacity = useTransform(x, [-240, -160, -120], [1, 1, 0]);

  const Icon = DOC_ICONS[doc.type];
  const iconColor = DOC_COLORS[doc.type];
  const statusInfo = STATUS_MAP[doc.status];

  // ── Swipe end handler ────────────────────────────────────
  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX < SWIPE_THRESHOLD) {
      animate(x, -ACTION_WIDTH * 3, {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      });
      setSwiped(true);
    } else {
      animate(x, 0, {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      });
      setSwiped(false);
    }
  };

  // ── Close swipe ──────────────────────────────────────────
  const closeSwipe = () => {
    animate(x, 0, {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    });
    setSwiped(false);
  };

  // ── Long press handlers ──────────────────────────────────
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      onLongPress?.(doc);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // ── Action handlers ──────────────────────────────────────
  const handleEdit = () => {
    closeSwipe();
    onEdit?.(doc);
  };

  const handleDuplicate = () => {
    closeSwipe();
    onDuplicate?.(doc);
  };

  const handleDelete = () => {
    closeSwipe();
    onDelete?.(doc);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* ── Action buttons (behind the row) ─────────────────── */}
      <div
        className="absolute inset-0 flex items-center"
        style={{ justifyContent: 'flex-end' }}
      >
        <motion.button
          onClick={handleEdit}
          style={{ opacity: editOpacity }}
          className="h-full flex flex-col items-center justify-center bg-blue-500 text-white"
          whileTap={{ scale: 0.95 }}
        >
          <Pencil size={20} strokeWidth={2} />
          <span className="text-[10px] font-semibold mt-1">Modifier</span>
        </motion.button>
        <motion.button
          onClick={handleDuplicate}
          style={{ opacity: dupOpacity }}
          className="h-full flex flex-col items-center justify-center bg-emerald-500 text-white"
          whileTap={{ scale: 0.95 }}
        >
          <Copy size={20} strokeWidth={2} />
          <span className="text-[10px] font-semibold mt-1">Dupliquer</span>
        </motion.button>
        <motion.button
          onClick={handleDelete}
          style={{ opacity: delOpacity }}
          className="h-full flex flex-col items-center justify-center bg-red-500 text-white"
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={20} strokeWidth={2} />
          <span className="text-[10px] font-semibold mt-1">Supprimer</span>
        </motion.button>
      </div>

      {/* ── Draggable row ───────────────────────────────────── */}
      <motion.div
        ref={rowRef}
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH * 3, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className={cn(
          'relative flex items-center gap-3 p-3 rounded-2xl',
          'bg-[var(--navy-2)] border border-[rgba(15,39,71,0.06)]',
          'active:cursor-grabbing select-none touch-pan-y',
        )}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.25 }}
        whileTap={{ scale: swiped ? 1 : 0.98 }}
      >
        {/* ── Type icon ──────────────────────────────────────── */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon size={20} strokeWidth={1.8} style={{ color: iconColor }} />
        </div>

        {/* ── Info ────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--sand)] truncate">
              {doc.client?.name || 'Client inconnu'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[var(--sand-muted)] font-mono">
              {doc.number}
            </span>
            <span className="text-[10px] text-[var(--sand-muted)]">·</span>
            <span className="text-[10px] text-[var(--sand-muted)]">
              {formatDate(doc.date)}
            </span>
          </div>
        </div>

        {/* ── Right side: badge + amount ──────────────────────── */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <span className="text-sm font-bold text-[var(--sand)] tabular-nums">
            {formatAmount(doc.totalTTC)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
