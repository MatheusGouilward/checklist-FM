import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChecklistItem } from './ChecklistItem';
import type { ChecklistItem as ChecklistItemType } from '@/lib/checklist/types';

function createItem(overrides: Partial<ChecklistItemType> = {}): ChecklistItemType {
  return {
    id: 'test-item',
    label: 'Estado dos filtros de ar',
    required: true,
    responseType: 'options',
    options: ['OK', 'Necessita Troca', 'Substituído'],
    value: null,
    photos: [],
    observation: undefined,
    ...overrides,
  };
}

describe('ChecklistItem', () => {
  it('renders the item label', () => {
    render(
      <ChecklistItem
        item={createItem()}
        checklistId="test-checklist"
        onValueChange={() => {}}
        onObservationChange={() => {}}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    expect(screen.getByText('Estado dos filtros de ar')).toBeInTheDocument();
  });

  it('shows PMOC badge for required items', () => {
    render(
      <ChecklistItem
        item={createItem({ required: true })}
        checklistId="test-checklist"
        onValueChange={() => {}}
        onObservationChange={() => {}}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    expect(screen.getByText('PMOC')).toBeInTheDocument();
  });

  it('does not show PMOC badge for optional items', () => {
    render(
      <ChecklistItem
        item={createItem({ required: false })}
        checklistId="test-checklist"
        onValueChange={() => {}}
        onObservationChange={() => {}}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    expect(screen.queryByText('PMOC')).not.toBeInTheDocument();
  });

  it('renders select element for 3-option items', () => {
    render(
      <ChecklistItem
        item={createItem()}
        checklistId="test-checklist"
        onValueChange={() => {}}
        onObservationChange={() => {}}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    // 3 options → select element (combobox role)
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'OK' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Necessita Troca' })
    ).toBeInTheDocument();
  });

  it('calls onValueChange when option is selected via select', () => {
    const onValueChange = vi.fn();
    render(
      <ChecklistItem
        checklistId="test-checklist"
        item={createItem()}
        onValueChange={onValueChange}
        onObservationChange={() => {}}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'OK' },
    });
    expect(onValueChange).toHaveBeenCalledWith('OK');
  });

  it('renders numeric input for numeric type', () => {
    render(
      <ChecklistItem
        item={createItem({
          id: 'temp',
          label: 'Temperatura de saída do ar (°C)',
          responseType: 'numeric',
          options: undefined,
        })}
        checklistId="test-checklist"
        onValueChange={() => {}}
        onObservationChange={() => {}}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  it('shows observation textarea when clicking add observation', () => {
    render(
      <ChecklistItem
        item={createItem()}
        checklistId="test-checklist"
        onValueChange={() => {}}
        onObservationChange={() => {}}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Adicionar observação'));
    // VoiceInput uses its default placeholder "Observação..."
    expect(
      screen.getByPlaceholderText('Observação...')
    ).toBeInTheDocument();
  });

  it('shows observation textarea when item has existing observation', () => {
    render(
      <ChecklistItem
        item={createItem({ observation: 'Filtro danificado' })}
        checklistId="test-checklist"
        onValueChange={() => {}}
        onObservationChange={() => {}}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    const textarea = screen.getByDisplayValue('Filtro danificado');
    expect(textarea).toBeInTheDocument();
  });
});
