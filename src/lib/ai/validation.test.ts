import { describe, it, expect } from 'vitest';
import { summaryRequestSchema } from './validation';

const validRequest = {
  checklist: {
    id: 'cl-001',
    storeName: 'Loja Alfa',
    shoppingName: 'Shopping Centro',
    equipmentModel: 'Split',
    equipmentCapacity: '24000 BTU',
    serviceType: 'preventive',
    technicianName: 'João',
    serviceResult: 'ok',
    createdAt: '2026-03-28T10:00:00.000Z',
    completedAt: '2026-03-28T14:30:00.000Z',
    observations: 'OK',
    sections: [
      {
        title: 'Filtros',
        items: [{ label: 'Estado', required: true, value: 'OK' }],
      },
    ],
  },
};

describe('summaryRequestSchema', () => {
  it('accepts valid request', () => {
    const result = summaryRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('accepts request with optional fields', () => {
    const result = summaryRequestSchema.safeParse({
      checklist: {
        ...validRequest.checklist,
        returnJustification: 'Compressor ruído',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts item with observation', () => {
    const result = summaryRequestSchema.safeParse({
      checklist: {
        ...validRequest.checklist,
        sections: [
          {
            title: 'Filtros',
            items: [
              {
                label: 'Estado',
                required: true,
                value: 'OK',
                observation: 'Nota',
              },
            ],
          },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts item with null value', () => {
    const result = summaryRequestSchema.safeParse({
      checklist: {
        ...validRequest.checklist,
        sections: [
          {
            title: 'Filtros',
            items: [{ label: 'Estado', required: false, value: null }],
          },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts numeric item value', () => {
    const result = summaryRequestSchema.safeParse({
      checklist: {
        ...validRequest.checklist,
        sections: [
          {
            title: 'Temperatura',
            items: [{ label: 'Temp saída', required: true, value: 12.5 }],
          },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing checklist', () => {
    const result = summaryRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty sections', () => {
    const result = summaryRequestSchema.safeParse({
      checklist: { ...validRequest.checklist, sections: [] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid service type', () => {
    const result = summaryRequestSchema.safeParse({
      checklist: { ...validRequest.checklist, serviceType: 'unknown' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid service result', () => {
    const result = summaryRequestSchema.safeParse({
      checklist: { ...validRequest.checklist, serviceResult: 'bad' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing store name', () => {
    const result = summaryRequestSchema.safeParse({
      checklist: { ...validRequest.checklist, storeName: '' },
    });
    expect(result.success).toBe(false);
  });
});
