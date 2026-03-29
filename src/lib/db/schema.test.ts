import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { VobiDatabase } from './schema';
import type { ChecklistRecord, PhotoRecord, SyncQueueRecord } from './schema';

describe('VobiDatabase', () => {
  let db: VobiDatabase;

  beforeEach(async () => {
    db = new VobiDatabase();
    await db.delete();
    await db.open();
  });

  it('stores and retrieves a checklist record', async () => {
    const record: ChecklistRecord = {
      id: 'test-1',
      status: 'draft',
      serviceResult: null,
      createdAt: new Date('2026-01-01'),
      completedAt: null,
      syncedAt: null,
      storeName: 'Loja A',
      shoppingName: 'Shopping Norte',
      equipmentModel: 'Split',
      equipmentCapacity: '36000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
      sections: '[]',
      observations: '',
    };

    await db.checklists.add(record);
    const retrieved = await db.checklists.get('test-1');
    expect(retrieved).toBeDefined();
    expect(retrieved!.storeName).toBe('Loja A');
    expect(retrieved!.status).toBe('draft');
  });

  it('stores and retrieves photos by checklistId', async () => {
    const photo: PhotoRecord = {
      id: 'photo-1',
      checklistId: 'test-1',
      itemId: 'item-1',
      blob: new Blob(['test'], { type: 'image/jpeg' }),
      timestamp: new Date(),
    };

    await db.photos.add(photo);
    const photos = await db.photos
      .where('checklistId')
      .equals('test-1')
      .toArray();
    expect(photos).toHaveLength(1);
    expect(photos[0].itemId).toBe('item-1');
  });

  it('stores sync queue entries with auto-increment id', async () => {
    const entry: SyncQueueRecord = {
      table: 'checklists',
      recordId: 'test-1',
      action: 'create',
      payload: '{"id":"test-1"}',
      createdAt: new Date(),
    };

    const id = await db.syncQueue.add(entry);
    expect(id).toBeGreaterThan(0);

    const entries = await db.syncQueue.toArray();
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('create');
  });

  it('queries checklists by status', async () => {
    await db.checklists.bulkAdd([
      {
        id: 'c1',
        status: 'draft',
        serviceResult: null,
        createdAt: new Date(),
        completedAt: null,
        syncedAt: null,
        storeName: 'A',
        shoppingName: 'S',
        equipmentModel: 'M',
        equipmentCapacity: 'C',
        serviceType: 'preventive',
        technicianId: 't1',
        technicianName: 'T',
        sections: '[]',
        observations: '',
      },
      {
        id: 'c2',
        status: 'completed',
        serviceResult: 'ok',
        createdAt: new Date(),
        completedAt: new Date(),
        syncedAt: null,
        storeName: 'B',
        shoppingName: 'S',
        equipmentModel: 'M',
        equipmentCapacity: 'C',
        serviceType: 'corrective',
        technicianId: 't1',
        technicianName: 'T',
        sections: '[]',
        observations: '',
      },
    ]);

    const drafts = await db.checklists
      .where('status')
      .equals('draft')
      .toArray();
    expect(drafts).toHaveLength(1);
    expect(drafts[0].id).toBe('c1');
  });

  it('updates a checklist record', async () => {
    await db.checklists.add({
      id: 'c1',
      status: 'draft',
      serviceResult: null,
      createdAt: new Date(),
      completedAt: null,
      syncedAt: null,
      storeName: 'A',
      shoppingName: 'S',
      equipmentModel: 'M',
      equipmentCapacity: 'C',
      serviceType: 'preventive',
      technicianId: 't1',
      technicianName: 'T',
      sections: '[]',
      observations: '',
    });

    await db.checklists.update('c1', { status: 'in_progress' });
    const updated = await db.checklists.get('c1');
    expect(updated!.status).toBe('in_progress');
  });
});
