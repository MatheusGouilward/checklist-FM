export interface ReportData {
  id: string;
  storeName: string;
  shoppingName: string;
  equipmentModel: string;
  equipmentCapacity: string;
  serviceType: 'preventive' | 'corrective' | 'installation';
  technicianName: string;
  serviceResult: 'ok' | 'pending_issue' | 'return_needed';
  createdAt: string;
  completedAt: string;
  observations: string;
  returnJustification?: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  items: ReportItem[];
}

export interface ReportItem {
  label: string;
  required: boolean;
  value: string | number | null;
  observation?: string;
}
