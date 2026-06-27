'use client';

// ============================================================
// CloudDevis Mobile — Foreground Push Notification Toast
// Shown when a push arrives while the app is in the foreground.
// Auto-dismisses after 4 s; tap to navigate to the document.
// ============================================================

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PushToastData {
  id: string;
  title: string;
  body: string;
  documentId?: string;
}

interface PushToastProps {
  toast: PushToastData | null;
  onDismiss: () => void;
  onTap?: (documentId: string) => void;
}

export function PushToast({ toast, onDismiss, onTap }: PushToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;
    timerRef.current = setTimeout(onDismiss, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: -80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className={cn(
            'fixed top-0 left-0 right-0 z-[200]',
            'mx-3 mt-3',
            'rounded-2xl overflow-hidden',
            'shadow-2xl',
          )}
          style={{
            marginTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          }}
          onClick={() => {
            onDismiss();
            if (toast.documentId) onTap?.(toast.documentId);
          }}
        >
          {/* Glass card */}
          <div
            className="flex items-start gap-3 px-4 py-3.5"
            style={{
              background: 'rgba(11, 28, 51, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-xl bg-[var(--green-2)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell size={14} className="text-white" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">
                {toast.title}
              </p>
              <p className="text-xs text-[rgba(255,255,255,0.65)] mt-0.5 leading-snug line-clamp-2">
                {toast.body}
              </p>
            </div>

            {/* Dismiss */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDismiss(); }}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 flex-shrink-0 mt-0.5"
              aria-label="Fermer"
            >
              <X size={12} className="text-white/60" />
            </button>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4, ease: 'linear' }}
            className="h-0.5 bg-[var(--green-2)] origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
