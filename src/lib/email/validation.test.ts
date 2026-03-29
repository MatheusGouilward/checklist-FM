import { describe, it, expect } from 'vitest';
import { notifyRequestSchema } from './validation';

const validRequest = {
  payload: {
    checklistId: 'cl-001',
    storeName: 'Loja Alfa',
    shoppingName: 'Shopping Center Norte',
    technicianName: 'João Silva',
    serviceType: 'preventive',
    serviceResult: 'ok',
    completedAt: '2026-03-28T14:30:00.000Z',
    observations: 'Tudo OK',
  },
  recipients: [
    { type: 'manager', email: 'gestor@empresa.com', name: 'Maria' },
  ],
};

describe('notifyRequestSchema', () => {
  it('accepts valid request', () => {
    const result = notifyRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('accepts request with multiple recipients', () => {
    const result = notifyRequestSchema.safeParse({
      ...validRequest,
      recipients: [
        { type: 'manager', email: 'gestor@empresa.com', name: 'Maria' },
        { type: 'tenant', email: 'lojista@loja.com', name: 'Carlos' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts request with optional fields', () => {
    const result = notifyRequestSchema.safeParse({
      ...validRequest,
      payload: {
        ...validRequest.payload,
        returnJustification: 'Compressor com defeito',
        reportUrl: 'https://vobi.com.br/share/abc123',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty recipients array', () => {
    const result = notifyRequestSchema.safeParse({
      ...validRequest,
      recipients: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = notifyRequestSchema.safeParse({
      ...validRequest,
      recipients: [{ type: 'manager', email: 'not-an-email', name: 'Maria' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid service type', () => {
    const result = notifyRequestSchema.safeParse({
      ...validRequest,
      payload: { ...validRequest.payload, serviceType: 'unknown' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid service result', () => {
    const result = notifyRequestSchema.safeParse({
      ...validRequest,
      payload: { ...validRequest.payload, serviceResult: 'invalid' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid recipient type', () => {
    const result = notifyRequestSchema.safeParse({
      ...validRequest,
      recipients: [{ type: 'admin', email: 'a@b.com', name: 'A' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required payload fields', () => {
    const result = notifyRequestSchema.safeParse({
      payload: { checklistId: 'cl-001' },
      recipients: validRequest.recipients,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid reportUrl', () => {
    const result = notifyRequestSchema.safeParse({
      ...validRequest,
      payload: { ...validRequest.payload, reportUrl: 'not-a-url' },
    });
    expect(result.success).toBe(false);
  });
});
