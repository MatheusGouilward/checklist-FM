import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReportData } from '@/lib/report/types';

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: '  A manutenção preventiva do ar-condicionado da sua loja foi concluída com sucesso.  ',
  }),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn().mockReturnValue('mock-model'),
}));

const baseData: ReportData = {
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
};

describe('generateSummary', () => {
  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
  });

  it('returns trimmed summary text', async () => {
    const { generateSummary } = await import('./summary');
    const result = await generateSummary(baseData);
    expect(result.summary).toBe(
      'A manutenção preventiva do ar-condicionado da sua loja foi concluída com sucesso.'
    );
  });

  it('returns model name', async () => {
    const { generateSummary } = await import('./summary');
    const result = await generateSummary(baseData);
    expect(result.model).toBeDefined();
    expect(typeof result.model).toBe('string');
  });

  it('calls generateText with correct parameters', async () => {
    const { generateText } = await import('ai');
    const { generateSummary } = await import('./summary');

    await generateSummary(baseData);

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'mock-model',
        prompt: expect.stringContaining('Loja Alfa'),
        maxOutputTokens: 500,
        temperature: 0.3,
      })
    );
  });

  it('calls anthropic with model name', async () => {
    const { anthropic } = await import('@ai-sdk/anthropic');
    const { generateSummary } = await import('./summary');

    await generateSummary(baseData);

    expect(anthropic).toHaveBeenCalledWith(expect.stringContaining('claude'));
  });

  it('propagates errors from generateText', async () => {
    const { generateText } = await import('ai');
    vi.mocked(generateText).mockRejectedValueOnce(new Error('API error'));
    const { generateSummary } = await import('./summary');

    await expect(generateSummary(baseData)).rejects.toThrow('API error');
  });
});
