import { describe, it, expect } from 'vitest';
import { checklistSchema } from './validation';
import { CHECKLIST_TEMPLATE } from './template';
import type { Checklist, ChecklistSection } from './types';

function createSectionsFromTemplate(
  fillValues: boolean
): ChecklistSection[] {
  return CHECKLIST_TEMPLATE.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.map((item) => ({
      id: item.id,
      label: item.label,
      required: item.required,
      responseType: item.responseType,
      options: item.options,
      value: fillValues ? (item.responseType === 'numeric' ? 22 : 'OK') : null,
      photos: [],
      observation: undefined,
    })),
  }));
}

function createMockChecklist(
  overrides: Partial<Checklist> = {}
): Checklist {
  return {
    id: 'test-checklist-1',
    status: 'draft',
    serviceResult: null,
    createdAt: new Date('2026-01-01'),
    completedAt: null,
    syncedAt: null,
    storeName: 'Loja ABC',
    shoppingName: 'Shopping Center Norte',
    equipmentModel: 'Split Inverter',
    equipmentCapacity: '36000 BTU',
    serviceType: 'preventive',
    technicianId: 'tech-1',
    technicianName: 'João Silva',
    sections: createSectionsFromTemplate(false),
    photos: [],
    observations: '',
    ...overrides,
  };
}

describe('checklistSchema', () => {
  it('accepts a valid draft checklist with empty values', () => {
    const checklist = createMockChecklist();
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(true);
  });

  it('accepts a valid completed checklist with all required items filled', () => {
    const checklist = createMockChecklist({
      status: 'completed',
      serviceResult: 'ok',
      completedAt: new Date('2026-01-01T10:00:00'),
      sections: createSectionsFromTemplate(true),
    });
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(true);
  });

  it('rejects completed checklist with empty required items', () => {
    const checklist = createMockChecklist({
      status: 'completed',
      serviceResult: 'ok',
      completedAt: new Date(),
    });
    // sections have null values (not filled)
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes('obrigatório'))).toBe(true);
    }
  });

  it('rejects completed checklist without serviceResult', () => {
    const checklist = createMockChecklist({
      status: 'completed',
      serviceResult: null,
      sections: createSectionsFromTemplate(true),
    });
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(
        messages.some((m) => m.includes('Resultado do serviço'))
      ).toBe(true);
    }
  });

  it('rejects return_needed without justification', () => {
    const checklist = createMockChecklist({
      status: 'in_progress',
      serviceResult: 'return_needed',
    });
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(
        messages.some((m) => m.includes('Justificativa de retorno'))
      ).toBe(true);
    }
  });

  it('accepts return_needed with justification', () => {
    const checklist = createMockChecklist({
      status: 'in_progress',
      serviceResult: 'return_needed',
      returnJustification: 'Peça de reposição indisponível',
    });
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(true);
  });

  it('rejects return_needed with empty justification', () => {
    const checklist = createMockChecklist({
      status: 'in_progress',
      serviceResult: 'return_needed',
      returnJustification: '   ',
    });
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(false);
  });

  it('rejects checklist with empty storeName', () => {
    const checklist = createMockChecklist({ storeName: '' });
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(false);
  });

  it('rejects invalid serviceType', () => {
    const checklist = createMockChecklist({
      serviceType: 'unknown' as 'preventive',
    });
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const checklist = createMockChecklist({
      status: 'cancelled' as 'draft',
    });
    const result = checklistSchema.safeParse(checklist);
    expect(result.success).toBe(false);
  });
});
