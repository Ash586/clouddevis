'use client';

// ============================================================
// Rakmana Mobile — ActionSheet
// iOS-style bottom sheet for long press on documents
// ============================================================

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Copy, Share2, Download, Printer, Trash2, X, BadgeCheck, ArrowRightLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Document } from '@/mobile/types';

// ── Action definitions ───────────────────────────────────────

interface Action {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  destructive?: boolean;
}

const DOCUMENT_ACTIONS: Action[] = [
  { id: 'edit', label: 'Modifier', icon: Pencil, color: '#2563EB' },
  { id: 'duplicate', label: 'Dupliquer', icon: Copy, color: '#059669' },
  { id: 'convertToFacture', label: 'Convertir en Facture', icon: ArrowRightLeft, color: '#0891B2' },
  { id: 'markPaid', label: 'Marquer payé', icon: BadgeCheck, color: '#10B981' },
  { id: 'share', label: 'Partager', icon: Share2, color: '#7C3AED' },
  { id: 'download', label: 'Télécharger PDF', icon: Download, color: '#D97706' },
  { id: 'print', label: 'Imprimer', icon: Printer, color: '#6B7280' },
  { id: 'delete', label: 'Supprimer', icon: Trash2, color: '#EF4444', destructive: true },
];

// ── Props ────────────────────────────────────────────────────

interface ActionSheetProps {
  open: boolean;
  actionDoc: Document | null;
  onClose: () => void;
  onAction: (actionId: string, doc: Document) => void;
}

// ── Component ────────────────────────────────────────────────

export function ActionSheet({ open, actionDoc, onClose, onAction }: ActionSheetProps) {
  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      const body = document.body;
      body.style.overflow = 'hidden';
      return () => {
        body.style.overflow = '';
      };
    }
  }, [open]);

  const handleAction = useCallback(
    (actionId: string) => {
      if (actionDoc) {
        onAction(actionId, actionDoc);
      }
      onClose();
    },
    [actionDoc, onAction, onClose]
  );

  if (!actionDoc) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ──────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ── Sheet ─────────────────────────────────────────── */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[70] max-w-lg mx-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <div className="bg-[var(--navy-2)] rounded-t-3xl overflow-hidden border-t border-[var(--border)]">
              {/* ── Handle bar ─────────────────────────────────── */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-[var(--navy-4)]" />
              </div>

              {/* ── Document info header ───────────────────────── */}
              <div className="px-5 pb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--sand)]">
                    {actionDoc.client?.name || 'Document'}
                  </p>
                  <p className="text-xs text-[var(--sand-muted)] font-mono mt-0.5">
                    {actionDoc.number}
                  </p>
                </div>
                <button type="button"                   onClick={onClose}
                  className="w-10 h-10 rounded-full bg-[var(--navy-3)] flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Fermer"
                >
                  <X size={16} className="text-[var(--sand-muted)]" />
                </button>
              </div>

              {/* ── Actions ────────────────────────────────────── */}
              <div className="px-3 pb-2">
                {DOCUMENT_ACTIONS.filter((a) => {
                  if (a.id === 'markPaid' && actionDoc?.status === 'PAID') return false;
                  if (a.id === 'convertToFacture' && actionDoc?.type !== 'DEVIS') return false;
                  return true;
                }).map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl',
                        'transition-colors duration-150',
                        'active:bg-[var(--navy-3)]',
                        action.destructive && 'active:bg-red-500/10',
                      )}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${action.color}15` }}
                      >
                        <Icon size={18} strokeWidth={1.8} style={{ color: action.color }} />
                      </div>
                      <span
                        className={cn(
                          'text-[15px] font-medium text-left',
                          action.destructive ? 'text-red-400' : 'text-[var(--sand)]',
                        )}
                      >
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* ── Cancel button ──────────────────────────────── */}
              <div className="px-3 pb-2 pt-1">
                <button type="button"                   onClick={onClose}
                  className={cn(
                    'w-full py-3.5 rounded-xl text-[15px] font-semibold',
                    'bg-[var(--navy-3)] text-[var(--sand-muted)]',
                    'active:bg-[var(--navy-2)] transition-colors',
                  )}
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
