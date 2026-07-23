// Rakmana Mobile — Network Status & Offline Sync
// Detect online/offline and sync pending data

import { checkIsOnline, isNativePlatform } from '@/lib/native';
import { getUnsyncedDocuments, markSynced } from './sqlite';

let isOnline = true;
let syncCallback: (() => Promise<void>) | null = null;

/**
 * Initialize network listener
 */
export function initNetworkListener(onStatusChange?: (online: boolean) => void): void {
  // On native, poll periodically; on web, use events
  if (isNativePlatform()) {
    setInterval(() => {
      const nowOnline = checkIsOnline();
      if (nowOnline !== isOnline) {
        isOnline = nowOnline;
        onStatusChange?.(isOnline);
        if (isOnline && syncCallback) {
          syncCallback().catch(console.error);
        }
      }
    }, 3000);
  } else {
    const onOnline = () => {
      isOnline = true;
      onStatusChange?.(true);
      if (syncCallback) syncCallback().catch(console.error);
    };
    const onOffline = () => {
      isOnline = false;
      onStatusChange?.(false);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
  }
}

/**
 * Check current network status
 */
export async function checkNetworkStatus(): Promise<boolean> {
  isOnline = checkIsOnline();
  return isOnline;
}

/**
 * Get current online status (cached)
 */
export function getOnlineStatus(): boolean {
  return isOnline;
}

/**
 * Register sync callback for when network comes back
 */
export function onReconnect(callback: () => Promise<void>): void {
  syncCallback = callback;
}

/**
 * Sync pending documents to server
 */
export async function syncPendingDocuments(apiBaseUrl: string): Promise<{
  synced: number;
  failed: number;
}> {
  if (!isOnline) {
    return { synced: 0, failed: 0 };
  }

  const unsynced = await getUnsyncedDocuments();
  let synced = 0;
  let failed = 0;

  for (const doc of unsynced) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...JSON.parse(doc.data),
          id: doc.id,
          type: doc.type,
        }),
      });

      if (response.ok) {
        await markSynced(doc.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
