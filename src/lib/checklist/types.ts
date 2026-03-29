export interface Photo {
  id: string;
  checklistId: string;
  itemId: string;
  blob: Blob;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  responseType: 'options' | 'numeric' | 'text';
  options?: string[];
  value: string | number | null;
  photos: Photo[];
  observation?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export type ServiceType = 'preventive' | 'corrective' | 'installation';
export type ChecklistStatus = 'draft' | 'in_progress' | 'completed';
export type ServiceResult = 'ok' | 'pending_issue' | 'return_needed';

export interface Checklist {
  id: string;
  status: ChecklistStatus;
  serviceResult: ServiceResult | null;
  createdAt: Date;
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
  photos: Photo[];
  observations: string;
  returnJustification?: string;
  signature?: string;
}

export interface ChecklistItemTemplate {
  id: string;
  label: string;
  required: boolean;
  responseType: 'options' | 'numeric' | 'text';
  options?: string[];
}

export interface ChecklistSectionTemplate {
  id: string;
  title: string;
  items: ChecklistItemTemplate[];
}
