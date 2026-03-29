import { describe, it, expect } from 'vitest';
import { buildSummaryPrompt } from './prompt';
import type { ReportData } from '@/lib/report/types';

const baseData: ReportData = {
  id: 'cl-001',
  storeName: 'Loja Alfa',
  shoppingName: 'Shopping Centro',
  equipmentModel: 'Split Inverter',
  equipmentCapacity: '24000 BTU',
  serviceType: 'preventive',
  technicianName: 'João Silva',
  serviceResult: 'ok',
  createdAt: '2026-03-28T10:00:00.000Z',
  completedAt: '2026-03-28T14:30:00.000Z',
  observations: 'Equipamento em bom estado.',
  sections: [
    {
      title: 'Filtros e Qualidade do Ar',
      items: [
        { label: 'Estado dos filtros', required: true, value: 'OK' },
        {
          label: 'Limpeza dos filtros',
          required: true,
          value: 'Realizada',
          observation: 'Filtros lavados',
        },
      ],
    },
  ],
};

describe('buildSummaryPrompt', () => {
  it('includes store and shopping name', () => {
    const prompt = buildSummaryPrompt(baseData);
    expect(prompt).toContain('Loja Alfa');
    expect(prompt).toContain('Shopping Centro');
  });

  it('includes technician name', () => {
    const prompt = buildSummaryPrompt(baseData);
    expect(prompt).toContain('João Silva');
  });

  it('includes service type in Portuguese', () => {
    const prompt = buildSummaryPrompt(baseData);
    expect(prompt).toContain('manutenção preventiva');
  });

  it('includes service result in Portuguese', () => {
    const prompt = buildSummaryPrompt(baseData);
    expect(prompt).toContain('Serviço concluído com sucesso');
  });

  it('includes checklist items', () => {
    const prompt = buildSummaryPrompt(baseData);
    expect(prompt).toContain('Estado dos filtros: OK');
    expect(prompt).toContain('Limpeza dos filtros: Realizada');
  });

  it('includes item observations', () => {
    const prompt = buildSummaryPrompt(baseData);
    expect(prompt).toContain('Filtros lavados');
  });

  it('includes observations', () => {
    const prompt = buildSummaryPrompt(baseData);
    expect(prompt).toContain('Equipamento em bom estado.');
  });

  it('includes return justification when present', () => {
    const prompt = buildSummaryPrompt({
      ...baseData,
      serviceResult: 'return_needed',
      returnJustification: 'Compressor com ruído anormal',
    });
    expect(prompt).toContain('Compressor com ruído anormal');
    expect(prompt).toContain('Retorno necessário');
  });

  it('handles corrective service type', () => {
    const prompt = buildSummaryPrompt({
      ...baseData,
      serviceType: 'corrective',
    });
    expect(prompt).toContain('manutenção corretiva');
  });

  it('handles items with null value', () => {
    const prompt = buildSummaryPrompt({
      ...baseData,
      sections: [
        {
          title: 'Seção',
          items: [{ label: 'Item teste', required: false, value: null }],
        },
      ],
    });
    expect(prompt).toContain('Item teste: Não preenchido');
  });

  it('contains instructions for the AI', () => {
    const prompt = buildSummaryPrompt(baseData);
    expect(prompt).toContain('linguagem simples');
    expect(prompt).toContain('lojista');
    expect(prompt).toContain('sem jargões');
  });
});
