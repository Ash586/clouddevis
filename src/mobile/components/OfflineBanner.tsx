'use client';

// ============================================================
// CloudDevis — Offline Banner
// Amber banner at top: "Hors ligne · X modifications en attente"
// Transitions to "Synchronisé ✓" when synced
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconWifiOff,
  IconWifi,
  IconRefresh,
  IconCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useSyncStore } from '@/stores/syncStore';

interface OfflineBannerProps {
  /** Whether the device is online (from useNetwork) */
  isOnline: boolean;
  /** Callback when user taps retry */
  onRetry?: () => void;
}

export function OfflineBanner({ isOnline, onRetry }: OfflineBannerProps) {
  const queue = useSyncStore((s) => s.queue);
  const syncStatus = useSyncStore((s) => s.status);
  const [showSynced, setShowSynced] = useState(false);
  const [prevOnline, setPrevOnline] = useState(isOnline);

  const pendingCount = queue.length;

  // ── Detect transition from offline → online ──────────────
  useEffect(() => {
    if (!prevOnline && isOnline) {
      // Just came back online — show "Synced" briefly
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevOnline(isOnline);
  }, [isOnline, prevOnline]);

  // ── Don't render if online and not showing synced toast ───
  if (isOnline && !showSynced) return null;

  return (
    <AnimatePresence mode="wait">
      {isOnline && showSynced ? (
        /* ── Synced toast (green) ────────────────────────────── */
        <motion.div
          key="synced"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 px-4',
              'bg-emerald-500/15 border-b border-emerald-500/20',
            )}
          >
            <IconCheck size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">
              Synchronisé ✓
            </span>
          </div>
        </motion.div>
      ) : !isOnline ? (
        /* ── Offline banner (amber) ──────────────────────────── */
        <motion.div
          key="offline"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'flex items-center justify-between py-2.5 px-4',
              'bg-amber-400/10 border-b border-amber-400/20',
            )}
          >
            <div className="flex items-center gap-2">
              <IconWifiOff size={14} className="text-amber-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-amber-400">
                Hors ligne
                {pendingCount > 0 && (
                  <> · {pendingCount} modification{pendingCount !== 1 ? 's' : ''} en attente</>
                )}
              </span>
            </div>

            {onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg',
                  'bg-amber-400/10 active:bg-amber-400/20 transition-colors',
                )}
              >
                <IconRefresh size={12} className="text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-400">Réessayer</span>
              </button>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
