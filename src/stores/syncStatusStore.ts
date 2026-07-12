// Tracks whether the initial API bootstrap sync has completed.
// Set to true by useApiSync after the first refreshAllData() call.
// Read by screens to show skeleton loading states.

import { create } from 'zustand';

interface SyncStatusStore {
  initialSyncDone: boolean;
  markSyncDone: () => void;
}

export const useSyncStatusStore = create<SyncStatusStore>()((set) => ({
  initialSyncDone: false,
  markSyncDone: () => set({ initialSyncDone: true }),
}));
