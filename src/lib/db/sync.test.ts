import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from './schema';
import { processQueue, getPendingSyncCount, getRetryDelay } from './sync';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
      }),
    },
  }),
}));

describe('sync', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  describe('getRetryDelay', () => {
    it('uses exponential backoff', () => {
      expect(getRetryDelay(0)).toBe(1000);
      expect(getRetryDelay(1)).toBe(2000);
      expect(getRetryDelay(2)).toBe(4000);
      expect(getRetryDelay(3)).toBe(8000);
    });

    it('caps at 30 seconds', () => {
      expect(getRetryDelay(10)).toBe(30000);
      expect(getRetryDelay(20)).toBe(30000);
    });
  });

  describe('getPendingSyncCount', () => {
    it('returns 0 when queue is empty', async () => {
      const count = await getPendingSyncCount();
      expect(count).toBe(0);
    });

    it('returns correct count', async () => {
      await db.syncQueue.bulkAdd([
        {
          table: 'checklists',
          recordId: 'c1',
          action: 'create',
          payload: '{}',
          createdAt: new Date(),
        },
        {
          table: 'checklists',
          recordId: 'c2',
          action: 'update',
          payload: '{}',
          createdAt: new Date(),
        },
      ]);

      const count = await getPendingSyncCount();
      expect(count).toBe(2);
    });
  });

  describe('processQueue', () => {
    it('returns success with 0 synced when queue is empty', async () => {
      const result = await processQueue('company-1');
      expect(result.success).toBe(true);
      expect(result.synced).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('processes checklist entries and removes from queue', async () => {
      // Add a checklist to local DB
      await db.checklists.add({
        id: 'c1',
        status: 'completed',
        serviceResult: 'ok',
        createdAt: new Date(),
        completedAt: new Date(),
        syncedAt: null,
        storeName: 'Loja A',
        shoppingName: 'Shopping X',
        equipmentModel: 'Split',
        equipmentCapacity: '24000 BTU',
        serviceType: 'preventive',
        technicianId: 'tech-1',
        technicianName: 'João',
        sections: '[]',
        observations: '',
      });

      // Add sync queue entry
      await db.syncQueue.add({
        table: 'checklists',
        recordId: 'c1',
        action: 'create',
        payload: '{"id":"c1"}',
        createdAt: new Date(),
      });

      const result = await processQueue('company-1');
      expect(result.success).toBe(true);
      expect(result.synced).toBe(1);

      // Queue should be empty
      const remaining = await db.syncQueue.count();
      expect(remaining).toBe(0);

      // Checklist should be marked as synced
      const checklist = await db.checklists.get('c1');
      expect(checklist!.syncedAt).toBeDefined();
    });

    it('skips entries where local record is missing', async () => {
      await db.syncQueue.add({
        table: 'checklists',
        recordId: 'nonexistent',
        action: 'update',
        payload: '{}',
        createdAt: new Date(),
      });

      const result = await processQueue('company-1');
      expect(result.success).toBe(true);
      expect(result.synced).toBe(1);
    });

    it('processes multiple entries in order', async () => {
      for (const id of ['c1', 'c2', 'c3']) {
        await db.checklists.add({
          id,
          status: 'in_progress',
          serviceResult: null,
          createdAt: new Date(),
          completedAt: null,
          syncedAt: null,
          storeName: 'Loja',
          shoppingName: 'Shopping',
          equipmentModel: 'Split',
          equipmentCapacity: '24000',
          serviceType: 'preventive',
          technicianId: 'tech-1',
          technicianName: 'João',
          sections: '[]',
          observations: '',
        });

        await db.syncQueue.add({
          table: 'checklists',
          recordId: id,
          action: 'create',
          payload: `{"id":"${id}"}`,
          createdAt: new Date(),
        });
      }

      const result = await processQueue('company-1');
      expect(result.synced).toBe(3);
      expect(result.failed).toBe(0);
    });
  });
});
