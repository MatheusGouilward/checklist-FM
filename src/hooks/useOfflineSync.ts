'use client';

import { useEffect } from 'react';
import { useSyncStore } from '@/stores/sync-store';

export function useOfflineSync() {
  const { status, pendingCount, sync, refreshPendingCount } = useSyncStore();

  useEffect(() => {
    // Initial count
    refreshPendingCount();

    // Auto-sync when coming back online
    const handleOnline = () => {
      sync();
    };

    window.addEventListener('online', handleOnline);

    // Try syncing on mount if online
    if (navigator.onLine) {
      sync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [sync, refreshPendingCount]);

  return { status, pendingCount };
}
