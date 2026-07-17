'use client';

// ============================================================
// Rakmana Mobile — API Bootstrap Hook
// Call once at app root (MobileShell) to:
//   1. Wire reconnect → flush sync queue
//   2. On first online, pull fresh data from server into stores
// ============================================================

import { useEffect, useRef } from 'react';
import { useClientStore } from '@/stores/clientStore';
import { useDocumentStore } from '@/stores/documentStore';
import { useSyncStore } from '@/stores/syncStore';
import { useSyncStatusStore } from '@/stores/syncStatusStore';
import { processWebSyncItem } from '@/lib/webSync';
import { onReconnect, checkNetworkStatus } from './network';
import { fetchAllClients, fetchDocuments, ApiError, type ApiDocumentListItem } from './api';
import type { Client, Document, DocumentType, DocumentStatus, PaymentMode, Language } from '@/mobile/types';

// ── Mappers ───────────────────────────────────────────────────

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
    ai: c.ai ?? undefined,
  };
}

// Valid DocumentType values from the mobile types
const VALID_DOC_TYPES = new Set(['DEVIS', 'FACTURE', 'PROFORMA', 'BC', 'BR', 'BL']);

function mapApiDocumentToStore(d: ApiDocumentListItem): Document {
  // The API returns INTERVENTION and ATTACHEMENT which aren't in the mobile DocumentType.
  // Map unknown types to DEVIS as a safe fallback.
  const type: DocumentType = VALID_DOC_TYPES.has(d.type)
    ? (d.type as DocumentType)
    : 'DEVIS';

  // status: API uses DRAFT/SENT/PAID/CANCELLED — map ACCEPTED/PROGRESS/DELIVERED → SENT
  const statusMap: Record<string, DocumentStatus> = {
    DRAFT: 'DRAFT', SENT: 'SENT', PAID: 'PAID', CANCELLED: 'CANCELLED',
    ACCEPTED: 'SENT', PROGRESS: 'SENT', DELIVERED: 'SENT',
  };
  const status: DocumentStatus = statusMap[d.status] ?? 'DRAFT';

  return {
    id: d.id,
    type,
    number: d.number,
    // dateISO is the raw ISO string; fall back to dateString parsing
    date: d.dateISO ? d.dateISO.split('T')[0] : d.date,
    company: {
      // Placeholder — only populated when document is opened for editing
      id: '',
      name: '',
      nif: '',
      rc: '',
      nis: '',
      ai: '',
      phone: '',
      address: '',
      tvaRate: 19,
    },
    client: {
      id: '',
      name: d.client,
      phone: '',
      nif: d.clientNif ?? undefined,
    },
    items: [],
    totalHT: 0,
    totalTVA: 0,
    timbreFiscal: d.timbreAmount > 0,
    timbreAmount: d.timbreAmount,
    totalTTC: d.total,
    status,
    language: 'FR' as Language,
    paymentMode: 'cheque' as PaymentMode,
    acompte: d.acompte || undefined,
  };
}

// ── Standalone refresh (used by pull-to-refresh) ──────────────

/**
 * Flush queued mutations then pull fresh clients + documents into the stores.
 * Safe to call from anywhere (uses store getState, no hook context).
 * Returns false if offline (nothing fetched).
 */
export async function refreshAllData(): Promise<boolean> {
  const online = await checkNetworkStatus();
  if (!online) return false;

  await useSyncStore.getState().processQueue(processWebSyncItem);

  const [apiClients, apiDocuments] = await Promise.all([
    fetchAllClients(),
    fetchDocuments(1, 100),
  ]);

  // Preserve local-only clients that are still in the sync queue
  const pendingIds = new Set(useSyncStore.getState().queue.filter(q => q.entity === 'client').map(q => q.entityId));
  const localOnly = useClientStore.getState().clients.filter(c => pendingIds.has(c.id));
  const serverClients = apiClients.map(mapApiClientToStore);

  // Merge: Server clients win, but local-only (unsynced) ones are appended
  useClientStore.getState().replaceAll([...serverClients, ...localOnly]);
  useDocumentStore.getState().replaceAll(apiDocuments.map(mapApiDocumentToStore));
  return true;
}

// ── Hook ──────────────────────────────────────────────────────

interface UseApiSyncOptions {
  /** Only run when authenticated */
  enabled: boolean;
  /** Called when any API request returns 401 */
  onUnauthorized: () => void;
}

export function useApiSync({ enabled, onUnauthorized }: UseApiSyncOptions): void {
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

    // Wire future reconnects → flush + refresh
    onReconnect(async () => {
      try {
        await refreshAllData();
      } catch (err) {
        handleApiError(err);
      }
    });

    // Bootstrap immediately — mark done regardless of outcome so skeleton clears
    refreshAllData()
      .catch(handleApiError)
      .finally(() => useSyncStatusStore.getState().markSyncDone());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
