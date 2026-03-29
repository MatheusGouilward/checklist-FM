'use client';

import { create } from 'zustand';
import {
  startBackgroundSync,
  getPendingSyncCount,
  type SyncStatus,
} from '@/lib/db/sync';

interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  companyId: string | null;
  setCompanyId: (companyId: string) => void;
  sync: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()((set, get) => ({
  status: 'idle',
  pendingCount: 0,
  companyId: null,

  setCompanyId: (companyId) => {
    set({ companyId });
  },

  sync: async () => {
    const { companyId } = get();
    if (!companyId) return;

    await startBackgroundSync(companyId, (status) => {
      set({ status });
    });

    await get().refreshPendingCount();
  },

  refreshPendingCount: async () => {
    const count = await getPendingSyncCount();
    set({ pendingCount: count });
  },
}));
