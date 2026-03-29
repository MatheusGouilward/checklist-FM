import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChecklistSection } from './ChecklistSection';
import type { ChecklistSection as ChecklistSectionType } from '@/lib/checklist/types';

function createSection(
  overrides: Partial<ChecklistSectionType> = {}
): ChecklistSectionType {
  return {
    id: 'test-section',
    title: 'Filtros e Qualidade do Ar',
    items: [
      {
        id: 'item-1',
        label: 'Estado dos filtros de ar',
        required: true,
        responseType: 'options',
        options: ['OK', 'Necessita Troca'],
        value: null,
        photos: [],
      },
      {
        id: 'item-2',
        label: 'Limpeza das bandejas',
        required: true,
        responseType: 'options',
        options: ['OK', 'Necessita Limpeza'],
        value: 'OK',
        photos: [],
      },
    ],
    ...overrides,
  };
}

describe('ChecklistSection', () => {
  it('renders all items in the section', () => {
    render(
      <ChecklistSection
        section={createSection()}
        sectionIndex={0}
        totalSections={5}
        checklistId="test-checklist"
        onItemValueChange={() => {}}
        onItemObservationChange={() => {}}
        onItemPhotoAdded={() => {}}
        onItemPhotoRemoved={() => {}}
      />
    );

    expect(screen.getByText('Estado dos filtros de ar')).toBeInTheDocument();
    expect(screen.getByText('Limpeza das bandejas')).toBeInTheDocument();
  });

  it('renders correct number of checklist items', () => {
    render(
      <ChecklistSection
        section={createSection()}
        sectionIndex={0}
        totalSections={5}
        checklistId="test-checklist"
        onItemValueChange={() => {}}
        onItemObservationChange={() => {}}
        onItemPhotoAdded={() => {}}
        onItemPhotoRemoved={() => {}}
      />
    );

    // Each item shows a PMOC badge for required items
    const pmocBadges = screen.getAllByText('PMOC');
    expect(pmocBadges).toHaveLength(2);
  });

  it('renders section items with correct labels', () => {
    const section = createSection({
      items: [
        {
          id: 'item-1',
          label: 'Item 1',
          required: true,
          responseType: 'options',
          options: ['OK'],
          value: 'OK',
          photos: [],
        },
        {
          id: 'item-2',
          label: 'Item 2',
          required: true,
          responseType: 'options',
          options: ['OK'],
          value: 'OK',
          photos: [],
        },
      ],
    });

    render(
      <ChecklistSection
        section={section}
        sectionIndex={0}
        totalSections={5}
        checklistId="test-checklist"
        onItemValueChange={() => {}}
        onItemObservationChange={() => {}}
        onItemPhotoAdded={() => {}}
        onItemPhotoRemoved={() => {}}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
