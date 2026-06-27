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

interface UseApiSyncOptions {
  /** Only run when authenticated */
  enabled: boolean;
  /** Called when any API request returns 401 */
  onUnauthorized: () => void;
}

export function useApiSync({ enabled, onUnauthorized }: UseApiSyncOptions): void {
  const replaceAll = useClientStore((s) => s.replaceAll);
  const processQueue = useSyncStore((s) => s.processQueue);
  const initialized = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (initialized.current) return;
    initialized.current = true;

    const handleApiError = (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      console.error('[useApiSync] error', err);
    };

    // Wire future reconnects → flush pending mutations then refresh clients
    onReconnect(async () => {
      try {
        await processQueue(processWebSyncItem);
        const apiClients = await fetchAllClients();
        replaceAll(apiClients.map(mapApiClientToStore));
      } catch (err) {
        handleApiError(err);
      }
    });

    // Bootstrap: flush queue + pull fresh client list
    checkNetworkStatus()
      .then(async (online) => {
        if (!online) return;
        await processQueue(processWebSyncItem);
        const apiClients = await fetchAllClients();
        replaceAll(apiClients.map(mapApiClientToStore));
      })
      .catch(handleApiError);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
