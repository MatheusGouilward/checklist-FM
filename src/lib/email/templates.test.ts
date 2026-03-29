import { describe, it, expect } from 'vitest';
import {
  buildManagerEmail,
  buildTenantEmail,
  buildEmail,
  formatDate,
} from './templates';
import type { NotificationPayload } from './types';

const basePayload: NotificationPayload = {
  checklistId: 'cl-001',
  storeName: 'Loja Alfa',
  shoppingName: 'Shopping Center Norte',
  technicianName: 'João Silva',
  serviceType: 'preventive',
  serviceResult: 'ok',
  completedAt: '2026-03-28T14:30:00.000Z',
  observations: 'Tudo em ordem.',
};

describe('formatDate', () => {
  it('formats ISO string to pt-BR date', () => {
    const result = formatDate('2026-03-28T14:30:00.000Z');
    expect(result).toContain('28');
    expect(result).toContain('03');
    expect(result).toContain('2026');
  });
});

describe('buildManagerEmail', () => {
  it('returns subject and html', () => {
    const { subject, html } = buildManagerEmail(basePayload);
    expect(subject).toContain('Loja Alfa');
    expect(subject).toContain('Shopping Center Norte');
    expect(html).toContain('João Silva');
    expect(html).toContain('Loja Alfa');
  });

  it('includes status badge with correct color for ok', () => {
    const { html } = buildManagerEmail(basePayload);
    expect(html).toContain('#16a34a');
    expect(html).toContain('OK');
  });

  it('includes status badge with red for return_needed', () => {
    const { html } = buildManagerEmail({
      ...basePayload,
      serviceResult: 'return_needed',
      returnJustification: 'Compressor com defeito',
    });
    expect(html).toContain('#dc2626');
    expect(html).toContain('Retorno necessário');
    expect(html).toContain('Compressor com defeito');
  });

  it('includes report link when provided', () => {
    const { html } = buildManagerEmail({
      ...basePayload,
      reportUrl: 'https://vobi.com.br/share/abc123',
    });
    expect(html).toContain('https://vobi.com.br/share/abc123');
    expect(html).toContain('Ver relatório completo');
  });

  it('omits report link when not provided', () => {
    const { html } = buildManagerEmail(basePayload);
    expect(html).not.toContain('Ver relatório completo');
  });

  it('includes observations', () => {
    const { html } = buildManagerEmail(basePayload);
    expect(html).toContain('Tudo em ordem.');
  });
});

describe('buildTenantEmail', () => {
  it('returns subject and html', () => {
    const { subject, html } = buildTenantEmail(basePayload);
    expect(subject).toContain('Loja Alfa');
    expect(subject).toContain('manutenção');
    expect(html).toContain('Loja Alfa');
  });

  it('includes result label in body', () => {
    const { html } = buildTenantEmail(basePayload);
    expect(html).toContain('OK — Serviço concluído');
  });

  it('includes contact note for tenants', () => {
    const { html } = buildTenantEmail(basePayload);
    expect(html).toContain('entre em contato');
  });

  it('includes pending issue badge', () => {
    const { html } = buildTenantEmail({
      ...basePayload,
      serviceResult: 'pending_issue',
    });
    expect(html).toContain('#ca8a04');
    expect(html).toContain('Pendência identificada');
  });
});

describe('buildEmail', () => {
  it('delegates to manager template for manager type', () => {
    const managerResult = buildEmail('manager', basePayload);
    const directResult = buildManagerEmail(basePayload);
    expect(managerResult.subject).toBe(directResult.subject);
    expect(managerResult.html).toBe(directResult.html);
  });

  it('delegates to tenant template for tenant type', () => {
    const tenantResult = buildEmail('tenant', basePayload);
    const directResult = buildTenantEmail(basePayload);
    expect(tenantResult.subject).toBe(directResult.subject);
    expect(tenantResult.html).toBe(directResult.html);
  });
});
