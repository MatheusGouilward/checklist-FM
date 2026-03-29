import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSyncStore } from './sync-store';
import { db } from '@/lib/db/schema';

// Mock sync module
vi.mock('@/lib/db/sync', () => ({
  startBackgroundSync: vi.fn(async (_companyId: string, onStatusChange?: (status: string) => void) => {
    onStatusChange?.('syncing');
    onStatusChange?.('idle');
  }),
  getPendingSyncCount: vi.fn(async () => {
    const count = await db.syncQueue.count();
    return count;
  }),
}));

describe('useSyncStore', () => {
  beforeEach(async () => {
    useSyncStore.setState({
      status: 'idle',
      pendingCount: 0,
      companyId: null,
    });
    await db.delete();
    await db.open();
  });

  it('has initial idle state', () => {
    const state = useSyncStore.getState();
    expect(state.status).toBe('idle');
    expect(state.pendingCount).toBe(0);
    expect(state.companyId).toBeNull();
  });

  it('sets company ID', () => {
    useSyncStore.getState().setCompanyId('comp-1');
    expect(useSyncStore.getState().companyId).toBe('comp-1');
  });

  it('refreshes pending count from Dexie', async () => {
    await db.syncQueue.bulkAdd([
      { table: 'checklists', recordId: 'c1', action: 'create', payload: '{}', createdAt: new Date() },
      { table: 'checklists', recordId: 'c2', action: 'update', payload: '{}', createdAt: new Date() },
    ]);

    await useSyncStore.getState().refreshPendingCount();
    expect(useSyncStore.getState().pendingCount).toBe(2);
  });

  it('does not sync without companyId', async () => {
    await useSyncStore.getState().sync();
    expect(useSyncStore.getState().status).toBe('idle');
  });

  it('syncs when companyId is set', async () => {
    useSyncStore.getState().setCompanyId('comp-1');
    await useSyncStore.getState().sync();
    expect(useSyncStore.getState().status).toBe('idle');
  });
});
