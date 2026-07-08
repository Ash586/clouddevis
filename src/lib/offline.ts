// ============================================================
// Rakmana — Offline Storage Layer
// Capacitor Preferences for company/clients/settings
// Capacitor Filesystem for PDF cache
// All reads/writes are local-first
// ============================================================

import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

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
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'FR',
  defaultTvaRate: 19,
  currency: 'DA',
  autoSync: true,
  theme: 'light',
};

// ── Preferences API ──────────────────────────────────────────

/**
 * Generic get/set for Capacitor Preferences.
 * Falls back to localStorage when not on native platform.
 */
async function getPref<T>(key: string): Promise<T | null> {
  try {
    const result = await Preferences.get({ key });
    if (result.value) {
      return JSON.parse(result.value) as T;
    }
    return null;
  } catch {
    // Capacitor not available — try localStorage
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
}

async function setPref<T>(key: string, value: T): Promise<void> {
  const json = JSON.stringify(value);
  try {
    await Preferences.set({ key, value: json });
  } catch {
    // Capacitor not available — try localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, json);
      }
    } catch {
      // ignore
    }
  }
}

async function removePref(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  }
}

// ── Company ──────────────────────────────────────────────────

export async function getCompany<T>(): Promise<T | null> {
  return getPref<T>(PREF_KEYS.COMPANY);
}

export async function setCompany<T>(company: T): Promise<void> {
  await setPref(PREF_KEYS.COMPANY, company);
}

export async function clearCompany(): Promise<void> {
  await removePref(PREF_KEYS.COMPANY);
}

// ── Clients ──────────────────────────────────────────────────

export async function getClients<T>(): Promise<T[]> {
  const result = await getPref<T[]>(PREF_KEYS.CLIENTS);
  return result ?? [];
}

export async function setClients<T>(clients: T[]): Promise<void> {
  await setPref(PREF_KEYS.CLIENTS, clients);
}

export async function addClient<T extends { id: string }>(client: T): Promise<void> {
  const clients = await getClients<T>();
  const index = clients.findIndex((c) => c.id === client.id);
  if (index >= 0) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  await setPref(PREF_KEYS.CLIENTS, clients);
}

export async function removeClient(id: string): Promise<void> {
  const clients = await getClients<{ id: string }>();
  await setPref(
    PREF_KEYS.CLIENTS,
    clients.filter((c) => c.id !== id)
  );
}

// ── Settings ─────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const result = await getPref<AppSettings>(PREF_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...result };
}

export async function setSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await setPref(PREF_KEYS.SETTINGS, { ...current, ...settings });
}

// ── PDF Cache (Filesystem) ───────────────────────────────────

const PDF_CACHE_DIR = Directory.Cache;
const PDF_CACHE_PATH = 'pdf_cache';

/**
 * Save a PDF (base64) to the local cache.
 * Returns the file path for later retrieval.
 */
export async function savePDFToCache(
  docId: string,
  base64Data: string
): Promise<string> {
  const fileName = `${PDF_CACHE_PATH}/${docId}.pdf`;

  try {
    // Ensure directory exists
    try {
      await Filesystem.mkdir({
        path: PDF_CACHE_PATH,
        directory: PDF_CACHE_DIR,
        recursive: true,
      });
    } catch {
      // Directory may already exist
    }

    // Write the file
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: PDF_CACHE_DIR,
      encoding: Encoding.UTF8,
    });

    return fileName;
  } catch {
    // Filesystem not available — use data URL fallback
    // Store in sessionStorage (limited to ~5MB)
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
}

/**
 * Read a cached PDF by document ID.
 * Returns base64 data or null if not found.
 */
export async function getPDFFromCache(docId: string): Promise<string | null> {
  const fileName = `${PDF_CACHE_PATH}/${docId}.pdf`;

  try {
    const result = await Filesystem.readFile({
      path: fileName,
      directory: PDF_CACHE_DIR,
      encoding: Encoding.UTF8,
    });
    return result.data as string;
  } catch {
    // Try sessionStorage fallback
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(`pdf_cache_${docId}`);
      }
    } catch {
      // ignore
    }
    return null;
  }
}

/**
 * Delete a cached PDF by document ID.
 */
export async function deletePDFFromCache(docId: string): Promise<void> {
  const fileName = `${PDF_CACHE_PATH}/${docId}.pdf`;

  try {
    await Filesystem.deleteFile({
      path: fileName,
      directory: PDF_CACHE_DIR,
    });
  } catch {
    // Try sessionStorage cleanup
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(`pdf_cache_${docId}`);
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Clear all cached PDFs.
 */
export async function clearPDFCache(): Promise<void> {
  try {
    await Filesystem.rmdir({
      path: PDF_CACHE_PATH,
      directory: PDF_CACHE_DIR,
    });
  } catch {
    // Ignore — dir may not exist
  }
}

// ── Last Sync Timestamp ──────────────────────────────────────

export async function getLastSyncTime(): Promise<number | null> {
  return getPref<number>(PREF_KEYS.LAST_SYNC);
}

export async function setLastSyncTime(timestamp: number): Promise<void> {
  await setPref(PREF_KEYS.LAST_SYNC, timestamp);
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
