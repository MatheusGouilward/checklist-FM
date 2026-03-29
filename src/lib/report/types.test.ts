import { describe, it, expect } from 'vitest';
import type { ReportData, ReportSection, ReportItem } from './types';

describe('Report types', () => {
  it('creates a valid ReportData object', () => {
    const data: ReportData = {
      id: 'test-1',
      storeName: 'Loja Fashion',
      shoppingName: 'Shopping Iguatemi',
      equipmentModel: 'Split Inverter',
      equipmentCapacity: '36000 BTU',
      serviceType: 'preventive',
      technicianName: 'João Silva',
      serviceResult: 'ok',
      createdAt: '2026-01-15T10:00:00',
      completedAt: '2026-01-15T11:30:00',
      observations: 'Tudo em ordem',
      sections: [
        {
          title: 'Filtros e Qualidade do Ar',
          items: [
            {
              label: 'Estado dos filtros de ar',
              required: true,
              value: 'OK',
            },
          ],
        },
      ],
    };

    expect(data.id).toBe('test-1');
    expect(data.sections).toHaveLength(1);
    expect(data.sections[0].items[0].value).toBe('OK');
  });

  it('supports return_needed with justification', () => {
    const data: ReportData = {
      id: 'test-2',
      storeName: 'Loja A',
      shoppingName: 'Shopping B',
      equipmentModel: 'Cassete',
      equipmentCapacity: '48000 BTU',
      serviceType: 'corrective',
      technicianName: 'Maria',
      serviceResult: 'return_needed',
      createdAt: '2026-01-15T10:00:00',
      completedAt: '2026-01-15T11:30:00',
      observations: '',
      returnJustification: 'Peça indisponível',
      sections: [],
    };

    expect(data.serviceResult).toBe('return_needed');
    expect(data.returnJustification).toBe('Peça indisponível');
  });

  it('supports numeric values for temperature items', () => {
    const item: ReportItem = {
      label: 'Temperatura de saída do ar (°C)',
      required: false,
      value: 22.5,
    };

    expect(typeof item.value).toBe('number');
  });

  it('supports null values for unfilled items', () => {
    const item: ReportItem = {
      label: 'Estado dos filtros',
      required: true,
      value: null,
    };

    expect(item.value).toBeNull();
  });

  it('supports items with observations', () => {
    const item: ReportItem = {
      label: 'Verificação de drenos',
      required: true,
      value: 'Obstruído',
      observation: 'Dreno principal bloqueado com sujeira',
    };

    expect(item.observation).toBe('Dreno principal bloqueado com sujeira');
  });

  it('creates a section with multiple items', () => {
    const section: ReportSection = {
      title: 'Componentes Mecânicos',
      items: [
        { label: 'Serpentinas', required: true, value: 'OK' },
        { label: 'Ventiladores', required: true, value: 'Ruído Anormal' },
        { label: 'Drenos', required: true, value: 'OK' },
      ],
    };

    expect(section.items).toHaveLength(3);
    expect(section.items[1].value).toBe('Ruído Anormal');
  });
});
