// ============================================================
// Rakmana Mobile — User Store
// Holds the account persona (artisan | entreprise) so mobile
// screens can adapt what they show. Server is the source of
// truth: useAuthGuard writes the mode on every session check.
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserMode } from '@/mobile/types';

export type MobileLocale = 'fr' | 'ar' | 'en';

interface UserStore {
  mode: UserMode;
  /** Mask financial figures on Home (show the app to a client safely). */
  privacyMode: boolean;
  /** Active UI locale — drives translations and RTL direction. */
  locale: MobileLocale;
  setMode: (mode: UserMode) => void;
  togglePrivacy: () => void;
  setLocale: (locale: MobileLocale) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      mode: 'artisan',
      privacyMode: false,
      locale: 'fr',
      setMode: (mode) => set({ mode }),
      togglePrivacy: () => set((s) => ({ privacyMode: !s.privacyMode })),
      setLocale: (locale) => set({ locale }),
      reset: () => set({ mode: 'artisan', privacyMode: false, locale: 'fr' }),
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
