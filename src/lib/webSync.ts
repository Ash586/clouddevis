// ============================================================
// Rakmana — Web Sync Processor
// Replays queued mutations against the REST API when back online.
// Entity → endpoint mapping must stay in sync with API routes.
// ============================================================

import type { SyncQueueItem } from '@/stores/syncStore';

const ENTITY_PATHS: Record<string, string> = {
  document: '/api/documents',
  client:   '/api/clients',
  // company uses a profile-based endpoint (always PUT, no per-id path)
};

/**
 * Process a single queued mutation against the web API.
 * Returns true on success (2xx), false on server error (4xx/5xx).
 * Throws on network failure so syncStore can retry.
 */
export async function processWebSyncItem(item: SyncQueueItem): Promise<boolean> {
  // Company profile uses a dedicated endpoint — always PUT to /api/user/profile
  if (item.entity === 'company') {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyInfo: item.payload }),
    });
    if (res.status === 409) return true;
    return res.ok;
  }

  const basePath = ENTITY_PATHS[item.entity];
  if (!basePath) return true; // unknown entity — drop silently

  const isDelete = item.action === 'DELETE';
  const isCreate = item.action === 'CREATE';
  const url = !isCreate ? `${basePath}/${item.entityId}` : basePath;
  const method = isCreate ? 'POST' : isDelete ? 'DELETE' : 'PUT';

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: isDelete ? undefined : { 'Content-Type': 'application/json' },
    body: isDelete ? undefined : JSON.stringify(item.payload),
  });

  if (res.status === 409) {
    // Conflict — server has a newer version, drop this item
    return true;
  }

  return res.ok;
}
