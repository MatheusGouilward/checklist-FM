'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  ChecklistSection,
  ChecklistStatus,
  Photo,
  ServiceResult,
  ServiceType,
} from '@/lib/checklist/types';
import { CHECKLIST_TEMPLATE } from '@/lib/checklist/template';
import { db } from '@/lib/db/schema';
import type { ChecklistRecord, PhotoRecord } from '@/lib/db/schema';

function createEmptySections(): ChecklistSection[] {
  return CHECKLIST_TEMPLATE.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => ({
      id: item.id,
      label: item.label,
      required: item.required,
      responseType: item.responseType,
      options: item.options,
      value: null,
      photos: [],
      observation: undefined,
    })),
  }));
}

interface ChecklistState {
  // Current checklist data
  id: string | null;
  serviceOrderId: string | null;
  status: ChecklistStatus;
  serviceResult: ServiceResult | null;
  createdAt: Date | null;
  completedAt: Date | null;
  syncedAt: Date | null;
  storeName: string;
  shoppingName: string;
  equipmentModel: string;
  equipmentCapacity: string;
  serviceType: ServiceType;
  technicianId: string;
  technicianName: string;
  sections: ChecklistSection[];
  observations: string;
  returnJustification: string;
  signature?: string;

  // UI state
  activeSectionIndex: number;
  isSaving: boolean;

  // Actions
  startNewChecklist: (context: {
    storeName: string;
    shoppingName: string;
    equipmentModel: string;
    equipmentCapacity: string;
    serviceType: ServiceType;
    technicianId: string;
    technicianName: string;
    serviceOrderId?: string;
  }) => Promise<string>;
  loadChecklist: (id: string) => Promise<void>;
  setItemValue: (
    sectionId: string,
    itemId: string,
    value: string | number | null
  ) => Promise<void>;
  setItemObservation: (
    sectionId: string,
    itemId: string,
    observation: string
  ) => Promise<void>;
  setObservations: (observations: string) => Promise<void>;
  setServiceResult: (result: ServiceResult) => Promise<void>;
  setReturnJustification: (justification: string) => Promise<void>;
  addItemPhoto: (sectionId: string, itemId: string, photo: Photo) => void;
  removeItemPhoto: (sectionId: string, itemId: string, photoId: string) => void;
  setActiveSectionIndex: (index: number) => void;
  completeChecklist: () => Promise<void>;
  reset: () => void;
}

async function persistToDexie(state: ChecklistState): Promise<void> {
  if (!state.id) return;

  const record: ChecklistRecord = {
    id: state.id,
    serviceOrderId: state.serviceOrderId ?? undefined,
    status: state.status,
    serviceResult: state.serviceResult,
    createdAt: state.createdAt ?? new Date(),
    completedAt: state.completedAt,
    syncedAt: state.syncedAt,
    storeName: state.storeName,
    shoppingName: state.shoppingName,
    equipmentModel: state.equipmentModel,
    equipmentCapacity: state.equipmentCapacity,
    serviceType: state.serviceType,
    technicianId: state.technicianId,
    technicianName: state.technicianName,
    sections: JSON.stringify(state.sections),
    observations: state.observations,
    returnJustification: state.returnJustification || undefined,
    signature: state.signature,
  };

  await db.checklists.put(record);
  await addToSyncQueue(state.id, 'update');
}

async function addToSyncQueue(
  recordId: string,
  action: 'create' | 'update' | 'delete'
): Promise<void> {
  await db.syncQueue.add({
    table: 'checklists',
    recordId,
    action,
    payload: JSON.stringify({ id: recordId }),
    createdAt: new Date(),
  });
}

export const useChecklistStore = create<ChecklistState>()((set, get) => ({
  // Initial state
  id: null,
  serviceOrderId: null,
  status: 'draft',
  serviceResult: null,
  createdAt: null,
  completedAt: null,
  syncedAt: null,
  storeName: '',
  shoppingName: '',
  equipmentModel: '',
  equipmentCapacity: '',
  serviceType: 'preventive',
  technicianId: '',
  technicianName: '',
  sections: createEmptySections(),
  observations: '',
  returnJustification: '',
  signature: undefined,
  activeSectionIndex: 0,
  isSaving: false,

  startNewChecklist: async (context) => {
    const id = uuidv4();
    const now = new Date();

    set({
      id,
      serviceOrderId: context.serviceOrderId ?? null,
      status: 'in_progress',
      serviceResult: null,
      createdAt: now,
      completedAt: null,
      syncedAt: null,
      storeName: context.storeName,
      shoppingName: context.shoppingName,
      equipmentModel: context.equipmentModel,
      equipmentCapacity: context.equipmentCapacity,
      serviceType: context.serviceType,
      technicianId: context.technicianId,
      technicianName: context.technicianName,
      sections: createEmptySections(),
      observations: '',
      returnJustification: '',
      signature: undefined,
      activeSectionIndex: 0,
    });

    const state = get();
    const record: ChecklistRecord = {
      id,
      serviceOrderId: context.serviceOrderId,
      status: 'in_progress',
      serviceResult: null,
      createdAt: now,
      completedAt: null,
      syncedAt: null,
      storeName: context.storeName,
      shoppingName: context.shoppingName,
      equipmentModel: context.equipmentModel,
      equipmentCapacity: context.equipmentCapacity,
      serviceType: context.serviceType,
      technicianId: context.technicianId,
      technicianName: context.technicianName,
      sections: JSON.stringify(state.sections),
      observations: '',
      returnJustification: undefined,
      signature: undefined,
    };

    await db.checklists.add(record);
    await addToSyncQueue(id, 'create');

    return id;
  },

  loadChecklist: async (id) => {
    const record = await db.checklists.get(id);
    if (!record) throw new Error(`Checklist ${id} not found`);

    const photos = await db.photos.where('checklistId').equals(id).toArray();

    const sections: ChecklistSection[] = JSON.parse(record.sections);

    // Attach photos to their respective items
    for (const section of sections) {
      for (const item of section.items) {
        item.photos = photos
          .filter((p: PhotoRecord) => p.itemId === item.id)
          .map((p: PhotoRecord) => ({
            id: p.id,
            checklistId: p.checklistId,
            itemId: p.itemId,
            blob: p.blob,
            timestamp: p.timestamp,
            latitude: p.latitude,
            longitude: p.longitude,
          }));
      }
    }

    set({
      id: record.id,
      serviceOrderId: record.serviceOrderId ?? null,
      status: record.status,
      serviceResult: record.serviceResult,
      createdAt: record.createdAt,
      completedAt: record.completedAt,
      syncedAt: record.syncedAt,
      storeName: record.storeName,
      shoppingName: record.shoppingName,
      equipmentModel: record.equipmentModel,
      equipmentCapacity: record.equipmentCapacity,
      serviceType: record.serviceType,
      technicianId: record.technicianId,
      technicianName: record.technicianName,
      sections,
      observations: record.observations,
      returnJustification: record.returnJustification ?? '',
      signature: record.signature,
      activeSectionIndex: 0,
    });
  },

  setItemValue: async (sectionId, itemId, value) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, value } : item
              ),
            }
          : section
      ),
    }));
    await persistToDexie(get());
  },

  setItemObservation: async (sectionId, itemId, observation) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, observation } : item
              ),
            }
          : section
      ),
    }));
    await persistToDexie(get());
  },

  setObservations: async (observations) => {
    set({ observations });
    await persistToDexie(get());
  },

  setServiceResult: async (result) => {
    set({ serviceResult: result });
    await persistToDexie(get());
  },

  setReturnJustification: async (justification) => {
    set({ returnJustification: justification });
    await persistToDexie(get());
  },

  addItemPhoto: (sectionId, itemId, photo) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId
                  ? { ...item, photos: [...item.photos, photo] }
                  : item
              ),
            }
          : section
      ),
    }));
  },

  removeItemPhoto: (sectionId, itemId, photoId) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      photos: item.photos.filter((p) => p.id !== photoId),
                    }
                  : item
              ),
            }
          : section
      ),
    }));
  },

  setActiveSectionIndex: (index) => {
    set({ activeSectionIndex: index });
  },

  completeChecklist: async () => {
    set({
      status: 'completed',
      completedAt: new Date(),
    });
    await persistToDexie(get());
  },

  reset: () => {
    set({
      id: null,
      serviceOrderId: null,
      status: 'draft',
      serviceResult: null,
      createdAt: null,
      completedAt: null,
      syncedAt: null,
      storeName: '',
      shoppingName: '',
      equipmentModel: '',
      equipmentCapacity: '',
      serviceType: 'preventive',
      technicianId: '',
      technicianName: '',
      sections: createEmptySections(),
      observations: '',
      returnJustification: '',
      signature: undefined,
      activeSectionIndex: 0,
    });
  },
}));
