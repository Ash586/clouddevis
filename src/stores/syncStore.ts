// ============================================================
// CloudDevis — Sync Queue Store
// Manages offline operations that need to be synced when online
// Uses Zustand + persist middleware
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────

export type SyncAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncEntity = 'document' | 'client' | 'company';
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';

export interface SyncQueueItem {
  id: string;
  action: SyncAction;
  entity: SyncEntity;
  entityId: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export interface SyncState {
  /** Queue of pending operations */
  queue: SyncQueueItem[];
  /** Global sync status */
  status: SyncStatus;
  /** Last successful sync timestamp */
  lastSyncAt: number | null;
  /** Number of failed sync attempts */
  failedCount: number;
}

export interface SyncStore extends SyncState {
  /** Add an operation to the sync queue */
  enqueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => void;

  /** Process the queue (called when online) */
  processQueue: (processor: (item: SyncQueueItem) => Promise<boolean>) => Promise<void>;

  /** Mark the queue as syncing */
  setSyncing: () => void;

  /** Mark the queue as synced */
  setSynced: () => void;

  /** Mark a specific item as failed */
  markFailed: (id: string, error: string) => void;

  /** Remove a specific item from the queue */
  remove: (id: string) => void;

  /** Clear the entire queue */
  clearQueue: () => void;

  /** Get the number of pending items */
  getPendingCount: () => number;
}

// ── Store ────────────────────────────────────────────────────

let idCounter = 0;

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      // ── State ──
      queue: [],
      status: 'synced',
      lastSyncAt: null,
      failedCount: 0,

      // ── Actions ──

      enqueue: (item) => {
        const newItem: SyncQueueItem = {
          ...item,
          id: `sync_${Date.now()}_${++idCounter}`,
          timestamp: Date.now(),
          retryCount: 0,
        };

        set((state) => ({
          queue: [...state.queue, newItem],
          status: 'pending',
        }));
      },

      processQueue: async (processor) => {
        const state = get();
        if (state.queue.length === 0 || state.status === 'syncing') return;

        set({ status: 'syncing' });

        const remaining: SyncQueueItem[] = [];
        let failedCount = 0;

        for (const item of state.queue) {
          try {
            const success = await processor(item);
            if (!success) {
              failedCount++;
              remaining.push({
                ...item,
                retryCount: item.retryCount + 1,
                lastError: 'Processor returned false',
              });
            }
          } catch (err) {
            failedCount++;
            remaining.push({
              ...item,
              retryCount: item.retryCount + 1,
              lastError: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }

        set({
          queue: remaining,
          status: remaining.length > 0 ? 'error' : 'synced',
          lastSyncAt: failedCount === 0 ? Date.now() : get().lastSyncAt,
          failedCount,
        });
      },

      setSyncing: () => set({ status: 'syncing' }),

      setSynced: () =>
        set({
          queue: [],
          status: 'synced',
          lastSyncAt: Date.now(),
          failedCount: 0,
        }),

      markFailed: (id, error) =>
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? { ...item, retryCount: item.retryCount + 1, lastError: error }
              : item
          ),
          status: 'error',
        })),

      remove: (id) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        })),

      clearQueue: () => set({ queue: [], status: 'synced', failedCount: 0 }),

      getPendingCount: () => get().queue.length,
    }),
    {
      name: 'clouddevis-sync-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        queue: state.queue,
        lastSyncAt: state.lastSyncAt,
        failedCount: state.failedCount,
      }),
    }
  )
);
