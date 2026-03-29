import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendNotification, sendNotifications } from './send';
import type { NotificationPayload, NotifyRecipient } from './types';

const mockSend = vi.fn();

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

const basePayload: NotificationPayload = {
  checklistId: 'cl-001',
  storeName: 'Loja Alfa',
  shoppingName: 'Shopping Centro',
  technicianName: 'João Silva',
  serviceType: 'preventive',
  serviceResult: 'ok',
  completedAt: '2026-03-28T14:30:00.000Z',
  observations: 'OK',
};

const managerRecipient: NotifyRecipient = {
  type: 'manager',
  email: 'gestor@empresa.com',
  name: 'Maria',
};

const tenantRecipient: NotifyRecipient = {
  type: 'tenant',
  email: 'lojista@loja.com',
  name: 'Carlos',
};

describe('sendNotification', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 'test-api-key');
    mockSend.mockReset();
  });

  it('sends email successfully and returns result without error', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    const result = await sendNotification(managerRecipient, basePayload);
    expect(result.type).toBe('manager');
    expect(result.email).toBe('gestor@empresa.com');
    expect(result.error).toBeUndefined();
  });

  it('returns error when resend returns error', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' },
    });

    const result = await sendNotification(managerRecipient, basePayload);
    expect(result.error).toBe('Rate limit exceeded');
  });

  it('returns error when send throws', async () => {
    mockSend.mockRejectedValue(new Error('Network error'));

    const result = await sendNotification(managerRecipient, basePayload);
    expect(result.error).toBe('Network error');
  });

  it('calls resend with correct parameters', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    await sendNotification(managerRecipient, basePayload);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'gestor@empresa.com',
        subject: expect.stringContaining('Loja Alfa'),
        html: expect.stringContaining('João Silva'),
      })
    );
  });
});

describe('sendNotifications', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 'test-api-key');
    mockSend.mockReset();
  });

  it('sends to multiple recipients', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    const result = await sendNotifications(
      [managerRecipient, tenantRecipient],
      basePayload
    );
    expect(result.sent).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
  });

  it('separates sent and failed', async () => {
    mockSend
      .mockResolvedValueOnce({ data: { id: 'email-1' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Failed' } });

    const result = await sendNotifications(
      [managerRecipient, tenantRecipient],
      basePayload
    );
    expect(result.sent).toHaveLength(1);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].error).toBe('Failed');
  });

  it('handles all failures', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Error' } });

    const result = await sendNotifications(
      [managerRecipient, tenantRecipient],
      basePayload
    );
    expect(result.sent).toHaveLength(0);
    expect(result.failed).toHaveLength(2);
  });
});
