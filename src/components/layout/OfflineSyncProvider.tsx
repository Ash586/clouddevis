'use client';

// ============================================================
// CloudDevis — Offline Sync Provider (Web Dashboard)
// Mounts network detection + sync-queue replay for the web.
// The mobile app has its own MobileShell wiring; this is the
// web-dashboard equivalent.
// ============================================================

import { useCallback } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';
import { useSyncStore } from '@/stores/syncStore';
import { processWebSyncItem } from '@/lib/webSync';

// ── Provider ─────────────────────────────────────────────────

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const processQueue = useSyncStore((s) => s.processQueue);
  const queue = useSyncStore((s) => s.queue);
  const status = useSyncStore((s) => s.status);

  const handleReconnect = useCallback(() => {
    void processQueue(processWebSyncItem);
  }, [processQueue]);

  const { isOnline, isSyncing } = useNetwork({ onReconnect: handleReconnect });

  const pendingCount = queue.filter((i) => i.retryCount < 3).length;

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-600"
        >
          <WifiOff size={13} strokeWidth={2} />
          <span>Hors ligne — les modifications seront synchronisées à la reconnexion</span>
          {pendingCount > 0 && (
            <span className="ms-1 rounded-full bg-white/20 px-2 py-0.5">
              {pendingCount}
            </span>
          )}
        </div>
      )}

      {isOnline && (status === 'syncing' || isSyncing) && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600"
        >
          <RefreshCw size={13} strokeWidth={2} className="animate-spin" />
          <span>Synchronisation en cours…</span>
        </div>
      )}

      {children}
    </>
  );
}
