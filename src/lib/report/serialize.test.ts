import { describe, it, expect } from 'vitest';
import { serializeForReport } from './serialize';
import { CHECKLIST_TEMPLATE } from '@/lib/checklist/template';
import type { ChecklistSection } from '@/lib/checklist/types';

function createFilledSections(): ChecklistSection[] {
  return CHECKLIST_TEMPLATE.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => ({
      id: item.id,
      label: item.label,
      required: item.required,
      responseType: item.responseType,
      options: item.options,
      value: item.responseType === 'numeric' ? 22 : 'OK',
      photos: [],
      observation: undefined,
    })),
  }));
}

describe('serializeForReport', () => {
  it('converts checklist state to ReportData', () => {
    const result = serializeForReport({
      id: 'test-1',
      storeName: 'Loja Fashion',
      shoppingName: 'Shopping Iguatemi',
      equipmentModel: 'Split Inverter',
      equipmentCapacity: '36000 BTU',
      serviceType: 'preventive',
      technicianName: 'João Silva',
      serviceResult: 'ok',
      createdAt: new Date('2026-01-15T10:00:00Z'),
      completedAt: new Date('2026-01-15T11:30:00Z'),
      observations: 'Tudo em ordem',
      sections: createFilledSections(),
    });

    expect(result.id).toBe('test-1');
    expect(result.storeName).toBe('Loja Fashion');
    expect(result.serviceResult).toBe('ok');
    expect(result.createdAt).toBe('2026-01-15T10:00:00.000Z');
    expect(result.completedAt).toBe('2026-01-15T11:30:00.000Z');
    expect(result.sections).toHaveLength(5);
  });

  it('preserves section titles and item values', () => {
    const result = serializeForReport({
      id: 'test-1',
      storeName: 'A',
      shoppingName: 'B',
      equipmentModel: 'C',
      equipmentCapacity: 'D',
      serviceType: 'corrective',
      technicianName: 'E',
      serviceResult: 'pending_issue',
      createdAt: new Date(),
      completedAt: new Date(),
      observations: '',
      sections: createFilledSections(),
    });

    expect(result.sections[0].title).toBe('Filtros e Qualidade do Ar');
    expect(result.sections[0].items[0].label).toBe('Estado dos filtros de ar');
    expect(result.sections[0].items[0].value).toBe('OK');
    expect(result.sections[0].items[0].required).toBe(true);
  });

  it('includes numeric values', () => {
    const result = serializeForReport({
      id: 'test-1',
      storeName: 'A',
      shoppingName: 'B',
      equipmentModel: 'C',
      equipmentCapacity: 'D',
      serviceType: 'preventive',
      technicianName: 'E',
      serviceResult: 'ok',
      createdAt: new Date(),
      completedAt: new Date(),
      observations: '',
      sections: createFilledSections(),
    });

    const tempItem = result.sections[4].items[1];
    expect(tempItem.label).toContain('Temperatura');
    expect(tempItem.value).toBe(22);
  });

  it('includes return justification when present', () => {
    const result = serializeForReport({
      id: 'test-1',
      storeName: 'A',
      shoppingName: 'B',
      equipmentModel: 'C',
      equipmentCapacity: 'D',
      serviceType: 'preventive',
      technicianName: 'E',
      serviceResult: 'return_needed',
      createdAt: new Date(),
      completedAt: new Date(),
      observations: '',
      returnJustification: 'Peça faltando',
      sections: [],
    });

    expect(result.returnJustification).toBe('Peça faltando');
  });

  it('includes item observations when present', () => {
    const sections = createFilledSections();
    sections[0].items[0].observation = 'Muito sujo';

    const result = serializeForReport({
      id: 'test-1',
      storeName: 'A',
      shoppingName: 'B',
      equipmentModel: 'C',
      equipmentCapacity: 'D',
      serviceType: 'preventive',
      technicianName: 'E',
      serviceResult: 'ok',
      createdAt: new Date(),
      completedAt: new Date(),
      observations: '',
      sections,
    });

    expect(result.sections[0].items[0].observation).toBe('Muito sujo');
  });
});
