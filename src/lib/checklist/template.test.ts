import { describe, it, expect } from 'vitest';
import {
  CHECKLIST_TEMPLATE,
  TOTAL_ITEMS,
  REQUIRED_ITEMS,
} from './template';

describe('CHECKLIST_TEMPLATE', () => {
  it('has exactly 5 sections', () => {
    expect(CHECKLIST_TEMPLATE).toHaveLength(5);
  });

  it('has exactly 13 items total', () => {
    expect(TOTAL_ITEMS).toBe(13);
  });

  it('has 11 required items (PMOC)', () => {
    expect(REQUIRED_ITEMS).toBe(11);
  });

  it('has unique section ids', () => {
    const ids = CHECKLIST_TEMPLATE.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique item ids across all sections', () => {
    const ids = CHECKLIST_TEMPLATE.flatMap((s) => s.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('section 1: Filtros e Qualidade do Ar has 3 required items', () => {
    const section = CHECKLIST_TEMPLATE[0];
    expect(section.title).toBe('Filtros e Qualidade do Ar');
    expect(section.items).toHaveLength(3);
    expect(section.items.every((i) => i.required)).toBe(true);
  });

  it('section 2: Componentes Mecânicos has 3 required items', () => {
    const section = CHECKLIST_TEMPLATE[1];
    expect(section.title).toBe('Componentes Mecânicos');
    expect(section.items).toHaveLength(3);
    expect(section.items.every((i) => i.required)).toBe(true);
  });

  it('section 3: Sistema de Refrigeração has 2 required items', () => {
    const section = CHECKLIST_TEMPLATE[2];
    expect(section.title).toBe('Sistema de Refrigeração');
    expect(section.items).toHaveLength(2);
    expect(section.items.every((i) => i.required)).toBe(true);
  });

  it('section 4: Componentes Elétricos has 3 required items', () => {
    const section = CHECKLIST_TEMPLATE[3];
    expect(section.title).toBe('Componentes Elétricos');
    expect(section.items).toHaveLength(3);
    expect(section.items.every((i) => i.required)).toBe(true);
  });

  it('section 5: Estrutura e Geral has 2 optional items', () => {
    const section = CHECKLIST_TEMPLATE[4];
    expect(section.title).toBe('Estrutura e Geral');
    expect(section.items).toHaveLength(2);
    expect(section.items.every((i) => !i.required)).toBe(true);
  });

  it('temperature item is numeric type', () => {
    const tempItem = CHECKLIST_TEMPLATE[4].items.find(
      (i) => i.id === 'air-output-temperature'
    );
    expect(tempItem).toBeDefined();
    expect(tempItem!.responseType).toBe('numeric');
    expect(tempItem!.options).toBeUndefined();
  });

  it('all option-type items have at least 2 options', () => {
    const optionItems = CHECKLIST_TEMPLATE.flatMap((s) =>
      s.items.filter((i) => i.responseType === 'options')
    );
    for (const item of optionItems) {
      expect(item.options?.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each item has specific options (not generic OK/NOK)', () => {
    const section1 = CHECKLIST_TEMPLATE[0];
    expect(section1.items[0].options).toEqual([
      'OK',
      'Necessita Troca',
      'Substituído',
    ]);
    expect(section1.items[1].options).toEqual([
      'OK',
      'Necessita Limpeza',
      'Limpo',
    ]);
  });
});
