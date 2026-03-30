import Dexie, { type EntityTable } from 'dexie';

export interface ChecklistRecord {
  id: string;
  serviceOrderId?: string;
  status: 'draft' | 'in_progress' | 'completed';
  serviceResult: 'ok' | 'pending_issue' | 'return_needed' | null;
  createdAt: Date;
  completedAt: Date | null;
  syncedAt: Date | null;
  storeName: string;
  shoppingName: string;
  equipmentModel: string;
  equipmentCapacity: string;
  serviceType: 'preventive' | 'corrective' | 'installation';
  technicianId: string;
  technicianName: string;
  sections: string; // JSON stringified ChecklistSection[]
  observations: string;
  returnJustification?: string;
  signature?: string;
}

export interface ServiceOrderRecord {
  id: string;
  companyId: string;
  technicianId: string;
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate: string;
  storeName: string;
  storeContact?: string;
  shoppingName: string;
  equipmentModel: string;
  equipmentCapacity: string;
  equipmentLocation?: string;
  serviceCategory: string;
  serviceType: 'preventive' | 'corrective' | 'installation';
  notes?: string;
  checklistId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoRecord {
  id: string;
  checklistId: string;
  itemId: string;
  blob: Blob;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
}

export interface SyncQueueRecord {
  id?: number;
  table: 'checklists' | 'photos';
  recordId: string;
  action: 'create' | 'update' | 'delete';
  payload: string; // JSON stringified
  createdAt: Date;
}

export class VobiDatabase extends Dexie {
  checklists!: EntityTable<ChecklistRecord, 'id'>;
  photos!: EntityTable<PhotoRecord, 'id'>;
  syncQueue!: EntityTable<SyncQueueRecord, 'id'>;
  serviceOrders!: EntityTable<ServiceOrderRecord, 'id'>;

  constructor() {
    super('vobi-checklist');

    this.version(2).stores({
      checklists: 'id, status, technicianId, syncedAt',
      photos: 'id, checklistId, itemId',
      syncQueue: '++id, table, recordId, createdAt',
      serviceOrders: 'id, technicianId, status, scheduledDate',
    });
  }
}

export const db = new VobiDatabase();
