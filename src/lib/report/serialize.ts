import type { ChecklistSection } from '@/lib/checklist/types';
import type { ReportData, ReportSection } from './types';

interface ChecklistStateForReport {
  id: string;
  storeName: string;
  shoppingName: string;
  equipmentModel: string;
  equipmentCapacity: string;
  serviceType: 'preventive' | 'corrective' | 'installation';
  technicianName: string;
  serviceResult: 'ok' | 'pending_issue' | 'return_needed';
  createdAt: Date;
  completedAt: Date;
  observations: string;
  returnJustification?: string;
  sections: ChecklistSection[];
}

export function serializeForReport(state: ChecklistStateForReport): ReportData {
  const sections: ReportSection[] = state.sections.map((section) => ({
    title: section.title,
    items: section.items.map((item) => ({
      label: item.label,
      required: item.required,
      value: item.value,
      observation: item.observation,
    })),
  }));

  return {
    id: state.id,
    storeName: state.storeName,
    shoppingName: state.shoppingName,
    equipmentModel: state.equipmentModel,
    equipmentCapacity: state.equipmentCapacity,
    serviceType: state.serviceType,
    technicianName: state.technicianName,
    serviceResult: state.serviceResult,
    createdAt: state.createdAt.toISOString(),
    completedAt: state.completedAt.toISOString(),
    observations: state.observations,
    returnJustification: state.returnJustification,
    sections,
  };
}
