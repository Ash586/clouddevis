// ============================================================
// CloudDevis Mobile — Company Store
// Company profile management with offline persistence
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { validateCompanyTaxIds } from '@/lib/dgi';
import { useSyncStore } from './syncStore';
import type { Company } from '@/mobile/types';

// ── Store Interface ───────────────────────────────────────────

export interface CompanyStore {
  /** The user's company profile (null if not set up yet) */
  company: Company | null;

  /** Whether the company profile has been completed at least once */
  isSetup: boolean;

  /** Last time the company profile was updated */
  lastUpdatedAt: string | null;

  /**
   * Set the full company profile.
   * Validates tax IDs before saving.
   * Returns validation errors if invalid, null on success.
   */
  setCompany: (company: Company) => { valid: boolean; errors: Record<string, string> } | null;

  /**
   * Partially update the company profile.
   * Merges with existing data.
   * Validates tax IDs if any tax field is updated.
   */
  updateCompany: (updates: Partial<Omit<Company, 'id'>>) => { valid: boolean; errors: Record<string, string> } | null;

  /**
   * Update just the logo (base64 data URL or file path).
   */
  setLogo: (logo: string | undefined) => void;

  /**
   * Update just the signature image.
   */
  setSignature: (signature: string | undefined) => void;

  /**
   * Validate the current company profile.
   */
  validate: () => { valid: boolean; errors: Record<string, string> };

  /**
   * Clear the company profile (logout, etc.).
   */
  clearCompany: () => void;
}

// ── Store ─────────────────────────────────────────────────────

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      // ── State ──
      company: null,
      isSetup: false,
      lastUpdatedAt: null,

      // ── Actions ──

      setCompany: (company) => {
        // Validate tax IDs
        const validation = validateCompanyTaxIds({
          nif: company.nif,
          rc: company.rc,
          nis: company.nis,
          ai: company.ai,
        });

        if (!validation.valid) {
          return { valid: false, errors: validation.errors };
        }

        set({
          company,
          isSetup: true,
          lastUpdatedAt: new Date().toISOString(),
        });

        // Enqueue company profile sync
        useSyncStore.getState().enqueue({
          action: 'UPDATE',
          entity: 'company',
          entityId: company.id,
          payload: company,
        });

        return null; // null = success
      },

      updateCompany: (updates) => {
        const current = get().company;
        if (!current) {
          // If no company exists, we can't update
          return { valid: false, errors: { general: 'Aucune entreprise configurée' } };
        }

        const updated = { ...current, ...updates };

        // Validate tax IDs if any tax field is being updated
        if (updates.nif || updates.rc || updates.nis || updates.ai) {
          const validation = validateCompanyTaxIds({
            nif: updated.nif,
            rc: updated.rc,
            nis: updated.nis,
            ai: updated.ai,
          });

          if (!validation.valid) {
            return { valid: false, errors: validation.errors };
          }
        }

        set({
          company: updated,
          lastUpdatedAt: new Date().toISOString(),
        });

        return null; // null = success
      },

      setLogo: (logo) => {
        const current = get().company;
        if (!current) return;

        set({
          company: { ...current, logo },
          lastUpdatedAt: new Date().toISOString(),
        });
      },

      setSignature: (signature) => {
        const current = get().company;
        if (!current) return;

        set({
          company: { ...current, signature },
          lastUpdatedAt: new Date().toISOString(),
        });
      },

      validate: () => {
        const { company } = get();
        if (!company) {
          return { valid: false, errors: { general: 'Aucune entreprise configurée' } };
        }

        return validateCompanyTaxIds({
          nif: company.nif,
          rc: company.rc,
          nis: company.nis,
          ai: company.ai,
        });
      },

      clearCompany: () =>
        set({
          company: null,
          isSetup: false,
          lastUpdatedAt: null,
        }),
    }),
    {
      name: 'clouddevis-company-store',
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
