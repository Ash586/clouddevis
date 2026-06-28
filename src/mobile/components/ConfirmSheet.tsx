'use client';

// ============================================================
// CloudDevis Mobile — ConfirmSheet
// iOS-style bottom-sheet confirmation for destructive actions
// (delete client, delete document, …). Modeled on ActionSheet.
// ============================================================

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red styling on the confirm button (default true) */
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmSheetProps) {
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

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[90] max-w-lg mx-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="bg-[var(--navy-2)] rounded-t-3xl overflow-hidden border-t border-[var(--border)]">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-[var(--navy-4)]" />
              </div>

              <div className="px-5 pt-2 pb-4 flex flex-col items-center text-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center mb-3',
                    destructive ? 'bg-red-500/12' : 'bg-[var(--blue-bg)]',
                  )}
                >
                  <AlertTriangle
                    size={24}
                    className={destructive ? 'text-red-400' : 'text-[var(--green-2)]'}
                  />
                </div>
                <h2 className="text-base font-bold text-[var(--sand)]">{title}</h2>
                {message && (
                  <p className="text-sm text-[var(--sand-muted)] mt-1 leading-relaxed">
                    {message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="px-3 pb-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    'w-full min-h-[48px] py-3 rounded-xl text-[15px] font-semibold text-white',
                    'active:scale-[0.98] transition-transform',
                    destructive ? 'bg-red-500' : 'bg-[var(--green-2)]',
                  )}
                >
                  {confirmLabel}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'w-full min-h-[48px] py-3 rounded-xl text-[15px] font-semibold',
                    'bg-[var(--navy-3)] text-[var(--sand-muted)]',
                    'active:bg-[var(--navy-4)] transition-colors',
                  )}
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
