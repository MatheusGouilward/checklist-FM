'use client';

import { db } from './schema';
import type { ChecklistRecord } from './schema';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type ChecklistInsert = Database['public']['Tables']['checklists']['Insert'];
type PhotoInsert = Database['public']['Tables']['photos']['Insert'];

const MAX_RETRY_DELAY = 30000;
const BASE_RETRY_DELAY = 1000;

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

export function getRetryDelay(attempt: number): number {
  return Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
}

async function syncChecklist(
  record: ChecklistRecord,
  companyId: string
): Promise<void> {
  const supabase = createClient();

  const row: ChecklistInsert = {
    id: record.id,
    company_id: companyId,
    technician_id: record.technicianId,
    technician_name: record.technicianName,
    service_order_id: record.serviceOrderId ?? null,
    status: record.status,
    service_result: record.serviceResult,
    store_name: record.storeName,
    shopping_name: record.shoppingName,
    equipment_model: record.equipmentModel,
    equipment_capacity: record.equipmentCapacity,
    service_type: record.serviceType,
    sections: JSON.parse(record.sections),
    observations: record.observations,
    return_justification: record.returnJustification ?? null,
    signature: record.signature ?? null,
    created_at: record.createdAt.toISOString(),
    completed_at: record.completedAt?.toISOString() ?? null,
    synced_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('checklists').upsert(row);

  if (error) throw new Error(`Sync checklist failed: ${error.message}`);

  // Mark as synced in local DB
  await db.checklists.update(record.id, { syncedAt: new Date() });
}

async function syncPhoto(
  photoId: string,
  companyId: string
): Promise<void> {
  const photo = await db.photos.get(photoId);
  if (!photo) return;

  const supabase = createClient();
  const storagePath = `${companyId}/${photo.checklistId}/${photo.id}.jpg`;

  // Upload blob to storage
  const { error: uploadError } = await supabase.storage
    .from('checklist-photos')
    .upload(storagePath, photo.blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

  // Insert metadata
  const photoRow: PhotoInsert = {
    id: photo.id,
    checklist_id: photo.checklistId,
    item_id: photo.itemId,
    storage_path: storagePath,
    timestamp: photo.timestamp.toISOString(),
    latitude: photo.latitude ?? null,
    longitude: photo.longitude ?? null,
  };

  const { error: insertError } = await supabase.from('photos').upsert(photoRow);

  if (insertError) throw new Error(`Photo metadata failed: ${insertError.message}`);
}

export async function processQueue(companyId: string): Promise<SyncResult> {
  const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

  const entries = await db.syncQueue.orderBy('createdAt').toArray();
  if (entries.length === 0) return result;

  for (const entry of entries) {
    try {
      if (entry.table === 'checklists') {
        const record = await db.checklists.get(entry.recordId);
        if (record) {
          await syncChecklist(record, companyId);
        }
      } else if (entry.table === 'photos') {
        await syncPhoto(entry.recordId, companyId);
      }

      // Remove processed entry
      await db.syncQueue.delete(entry.id!);
      result.synced++;
    } catch (error) {
      result.failed++;
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  return result;
}

export async function startBackgroundSync(
  companyId: string,
  onStatusChange?: (status: SyncStatus) => void
): Promise<void> {
  if (!navigator.onLine) {
    onStatusChange?.('offline');
    return;
  }

  onStatusChange?.('syncing');
  let attempt = 0;

  while (attempt < 5) {
    const result = await processQueue(companyId);

    if (result.success || result.failed === 0) {
      onStatusChange?.('idle');
      return;
    }

    attempt++;
    const delay = getRetryDelay(attempt);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  onStatusChange?.('error');
}

export function getPendingSyncCount(): Promise<number> {
  return db.syncQueue.count();
}
