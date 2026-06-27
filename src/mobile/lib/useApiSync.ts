'use client';

// ============================================================
// CloudDevis Mobile — API Bootstrap Hook
// Call once at app root (MobileShell) to:
//   1. Wire reconnect → flush sync queue
//   2. On first online, pull fresh data from server into stores
// ============================================================

import { useEffect, useRef } from 'react';
import { useClientStore } from '@/stores/clientStore';
import { useSyncStore } from '@/stores/syncStore';
import { processWebSyncItem } from '@/lib/webSync';
import { onReconnect, checkNetworkStatus } from './network';
import { fetchAllClients, ApiError } from './api';
import type { Client } from '@/mobile/types';

function mapApiClientToStore(c: {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  nif: string | null;
  rc: string | null;
  nis: string | null;
  ai: string | null;
}): Client {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? '',
    email: c.email ?? undefined,
    address: c.address ?? undefined,
    nif: c.nif ?? undefined,
    rc: c.rc ?? undefined,
    nis: c.nis ?? undefined,
  };
}

export function useApiSync(): void {
  const replaceAll = useClientStore((s) => s.replaceAll);
  const processQueue = useSyncStore((s) => s.processQueue);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Wire future reconnects → flush pending mutations
    onReconnect(async () => {
      await processQueue(processWebSyncItem);
      // After flushing, refresh client list
      try {
        const apiClients = await fetchAllClients();
        replaceAll(apiClients.map(mapApiClientToStore));
      } catch {
        // Keep local cache on error
      }
    });

    // Bootstrap: check online now, flush + pull
    checkNetworkStatus()
      .then(async (online) => {
        if (!online) return;
        // Flush queued mutations first (handles offline-created items)
        await processQueue(processWebSyncItem);
        // Pull fresh client list
        const apiClients = await fetchAllClients();
        replaceAll(apiClients.map(mapApiClientToStore));
      })
      .catch((err: unknown) => {
        // 401 means not logged in — don't log as error
        if (err instanceof ApiError && err.status === 401) return;
        console.error('[useApiSync] bootstrap failed', err);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
