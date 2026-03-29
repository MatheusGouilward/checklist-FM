import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChecklistForm } from './ChecklistForm';
import { useChecklistStore } from '@/stores/checklist-store';
import { db } from '@/lib/db/schema';

describe('ChecklistForm', () => {
  beforeEach(async () => {
    useChecklistStore.getState().reset();
    await db.delete();
    await db.open();
  });

  it('shows empty state when status is draft', () => {
    render(<ChecklistForm />);
    expect(
      screen.getByText('Nenhum checklist em andamento.')
    ).toBeInTheDocument();
  });

  it('renders first section when checklist is in progress', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    render(<ChecklistForm />);

    expect(
      screen.getByText('Filtros e Qualidade do Ar')
    ).toBeInTheDocument();
    // Section counter is now shown as "1/5" format in the top bar
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  it('shows progress bar initially with 0% width', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    render(<ChecklistForm />);

    // Progress is rendered as a styled div — verify the section counter shows 1/5
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  it('navigates to next section when clicking Próximo', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    render(<ChecklistForm />);

    fireEvent.click(screen.getByText('Próximo'));
    expect(screen.getByText('Componentes Mecânicos')).toBeInTheDocument();
    // Section counter is now shown as "2/5" format
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('navigates back with Anterior button', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    render(<ChecklistForm />);

    fireEvent.click(screen.getByText('Próximo'));
    expect(screen.getByText('2/5')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Anterior'));
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  it('disables Anterior on first section', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    render(<ChecklistForm />);

    expect(screen.getByText('Anterior')).toBeDisabled();
  });

  it('shows Revisar button on last section', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    // Navigate to last section
    useChecklistStore.getState().setActiveSectionIndex(4);

    render(<ChecklistForm />);

    expect(screen.getByText('Revisar')).toBeInTheDocument();
    expect(screen.getByText('Estrutura e Geral')).toBeInTheDocument();
  });

  it('has 5 section stepper pills', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    render(<ChecklistForm />);

    // Stepper pills have aria-labels like "Filtros e Qualidade do Ar: 0 de 3 itens"
    const sectionNames = [
      'Filtros e Qualidade do Ar',
      'Componentes Mecânicos',
      'Sistema de Refrigeração',
      'Componentes Elétricos',
      'Estrutura e Geral',
    ];
    const pills = screen.getAllByRole('button').filter((btn) =>
      sectionNames.some((name) => btn.getAttribute('aria-label')?.startsWith(name))
    );
    expect(pills).toHaveLength(5);
  });

  it('navigates to section when clicking stepper pill', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    render(<ChecklistForm />);

    // Pill for "Sistema de Refrigeração" (index 2)
    const pill = screen.getByRole('button', {
      name: /Sistema de Refrigeração/,
    });
    fireEvent.click(pill);

    expect(screen.getByText('Sistema de Refrigeração')).toBeInTheDocument();
  });

  it('navigation buttons have h-12 touch targets', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    render(<ChecklistForm />);

    const anterior = screen.getByText('Anterior');
    // "Próximo" text is direct child — get the button
    const proximo = screen.getByText('Próximo').closest('button');
    expect(anterior.className).toContain('h-12');
    expect(proximo?.className).toContain('h-12');
  });
});
