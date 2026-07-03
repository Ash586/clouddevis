// ============================================================
// CloudDevis Mobile — User Store
// Holds the account persona (artisan | entreprise) so mobile
// screens can adapt what they show. Server is the source of
// truth: useAuthGuard writes the mode on every session check.
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserMode } from '@/mobile/types';

interface UserStore {
  mode: UserMode;
  /** Mask financial figures on Home (show the app to a client safely). */
  privacyMode: boolean;
  setMode: (mode: UserMode) => void;
  togglePrivacy: () => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      mode: 'artisan',
      privacyMode: false,
      setMode: (mode) => set({ mode }),
      togglePrivacy: () => set((s) => ({ privacyMode: !s.privacyMode })),
      reset: () => set({ mode: 'artisan', privacyMode: false }),
    }),
    {
      name: 'clouddevis-user-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage;
        }
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
    }
  )
);
