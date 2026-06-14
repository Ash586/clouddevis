// ============================================================
// CloudDevis Mobile — Client Store
// Local client cache with search, NIF lookup, and offline CRUD
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '@/lib/calculations';
import type { Client } from '@/mobile/types';

// ── Store Interface ───────────────────────────────────────────

export interface ClientStore {
  /** All cached clients */
  clients: Client[];

  /** Add a new client */
  addClient: (data: Omit<Client, 'id'>) => Client;

  /** Update an existing client by ID */
  updateClient: (id: string, updates: Partial<Omit<Client, 'id'>>) => void;

  /** Delete a client by ID */
  deleteClient: (id: string) => void;

  /**
   * Search clients by query string.
   * Matches against name, phone, email, NIF, RC, NIS.
   * Case-insensitive, partial match.
   */
  searchClients: (query: string) => Client[];

  /**
   * Find a client by NIF (exact match).
   * Useful for auto-fill when creating documents.
   */
  getByNIF: (nif: string) => Client | undefined;

  /**
   * Find a client by ID.
   */
  getById: (id: string) => Client | undefined;

  /**
   * Get the most recently used clients (by last document date).
   * Returns top N clients sorted by recency.
   */
  getRecentClients: (limit?: number) => Client[];

  /**
   * Replace all clients (for sync from server).
   */
  replaceAll: (clients: Client[]) => void;

  /**
   * Clear all clients (logout, etc.).
   */
  clearAll: () => void;
}

// ── Store ─────────────────────────────────────────────────────

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      // ── State ──
      clients: [],

      // ── Actions ──

      addClient: (data) => {
        const newClient: Client = {
          id: generateId(),
          ...data,
        };

        set((state) => ({
          clients: [...state.clients, newClient],
        }));

        return newClient;
      },

      updateClient: (id, updates) =>
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...updates } : client
          ),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        })),

      searchClients: (query) => {
        if (!query || query.trim().length === 0) return get().clients;

        const q = query.toLowerCase().trim();

        return get().clients.filter((client) => {
          const searchable = [
            client.name,
            client.phone,
            client.email,
            client.nif,
            client.rc,
            client.nis,
            client.address,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return searchable.includes(q);
        });
      },

      getByNIF: (nif) => {
        if (!nif) return undefined;
        const cleaned = nif.trim();
        return get().clients.find((client) => client.nif === cleaned);
      },

      getById: (id) => {
        return get().clients.find((client) => client.id === id);
      },

      getRecentClients: (limit = 10) => {
        // Return clients sorted by most recent (last in array = most recent)
        const clients = [...get().clients];
        return clients.slice(-limit).reverse();
      },

      replaceAll: (clients) => set({ clients }),

      clearAll: () => set({ clients: [] }),
    }),
    {
      name: 'clouddevis-client-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
