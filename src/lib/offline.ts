// ============================================================
// Rakmana — Offline Storage Layer
// Uses localStorage for preferences and sessionStorage for PDF cache.
// All reads/writes are local-first
// ============================================================

// ── Preference Keys ──────────────────────────────────────────

export const PREF_KEYS = {
  COMPANY: 'clouddevis_company',
  CLIENTS: 'clouddevis_clients',
  SETTINGS: 'clouddevis_settings',
  SYNC_QUEUE: 'clouddevis_sync_queue',
  LAST_SYNC: 'clouddevis_last_sync',
} as const;

// ── Types ────────────────────────────────────────────────────

export interface AppSettings {
  language: 'FR' | 'AR' | 'EN';
  defaultTvaRate: 9 | 19;
  currency: string;
  autoSync: boolean;
  theme: 'light' | 'dark' | 'system';
  biometricEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'FR',
  defaultTvaRate: 19,
  currency: 'DA',
  autoSync: true,
  theme: 'light',
  biometricEnabled: false,
};

// ── Preferences API (localStorage) ───────────────────────────

function getPref<T>(key: string): T | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }
  } catch {
    // ignore
  }
  return null;
}

function setPref<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // ignore
  }
}

function removePref(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

// ── Company ──────────────────────────────────────────────────

export async function getCompany<T>(): Promise<T | null> {
  return getPref<T>(PREF_KEYS.COMPANY);
}

export async function setCompany<T>(company: T): Promise<void> {
  setPref(PREF_KEYS.COMPANY, company);
}

export async function clearCompany(): Promise<void> {
  removePref(PREF_KEYS.COMPANY);
}

// ── Clients ──────────────────────────────────────────────────

export async function getClients<T>(): Promise<T[]> {
  const result = getPref<T[]>(PREF_KEYS.CLIENTS);
  return result ?? [];
}

export async function setClients<T>(clients: T[]): Promise<void> {
  setPref(PREF_KEYS.CLIENTS, clients);
}

export async function addClient<T extends { id: string }>(client: T): Promise<void> {
  const clients = await getClients<T>();
  const index = clients.findIndex((c) => c.id === client.id);
  if (index >= 0) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  setPref(PREF_KEYS.CLIENTS, clients);
}

export async function removeClient(id: string): Promise<void> {
  const clients = await getClients<{ id: string }>();
  setPref(
    PREF_KEYS.CLIENTS,
    clients.filter((c) => c.id !== id)
  );
}

// ── Settings ─────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const result = getPref<AppSettings>(PREF_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...result };
}

export async function setSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  setPref(PREF_KEYS.SETTINGS, { ...current, ...settings });
}

// ── PDF Cache (sessionStorage) ───────────────────────────────

/**
 * Save a PDF (base64) to the local cache.
 * Returns the storage key for later retrieval.
 */
export async function savePDFToCache(
  docId: string,
  base64Data: string
): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const key = `pdf_cache_${docId}`;
      window.sessionStorage.setItem(key, base64Data);
      return key;
    }
  } catch {
    // ignore
  }
  return '';
}

/**
 * Read a cached PDF by document ID.
 * Returns base64 data or null if not found.
 */
export async function getPDFFromCache(docId: string): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(`pdf_cache_${docId}`);
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Delete a cached PDF by document ID.
 */
export async function deletePDFFromCache(docId: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(`pdf_cache_${docId}`);
    }
  } catch {
    // ignore
  }
}

/**
 * Clear all cached PDFs.
 */
export async function clearPDFCache(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const keys = Object.keys(window.sessionStorage);
      for (const key of keys) {
        if (key.startsWith('pdf_cache_')) {
          window.sessionStorage.removeItem(key);
        }
      }
    }
  } catch {
    // ignore
  }
}

// ── Last Sync Timestamp ──────────────────────────────────────

export async function getLastSyncTime(): Promise<number | null> {
  return getPref<number>(PREF_KEYS.LAST_SYNC);
}

export async function setLastSyncTime(timestamp: number): Promise<void> {
  setPref(PREF_KEYS.LAST_SYNC, timestamp);
}

// ── Clear All Offline Data ───────────────────────────────────

export async function clearAllOfflineData(): Promise<void> {
  await Promise.all([
    removePref(PREF_KEYS.COMPANY),
    removePref(PREF_KEYS.CLIENTS),
    removePref(PREF_KEYS.SETTINGS),
    removePref(PREF_KEYS.SYNC_QUEUE),
    removePref(PREF_KEYS.LAST_SYNC),
    clearPDFCache(),
  ]);
}
