import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportSummary } from './ReportSummary';
import { useChecklistStore } from '@/stores/checklist-store';
import { db } from '@/lib/db/schema';
import { CHECKLIST_TEMPLATE } from '@/lib/checklist/template';

async function setupChecklist(fillAll = false) {
  const id = await useChecklistStore.getState().startNewChecklist({
    storeName: 'Loja Fashion',
    shoppingName: 'Shopping Iguatemi',
    equipmentModel: 'Split Inverter',
    equipmentCapacity: '36000 BTU',
    serviceType: 'preventive',
    technicianId: 'tech-1',
    technicianName: 'João Silva',
  });

  if (fillAll) {
    for (const section of CHECKLIST_TEMPLATE) {
      for (const item of section.items) {
        const value = item.responseType === 'numeric' ? 22 : 'OK';
        await useChecklistStore.getState().setItemValue(section.id, item.id, value);
      }
    }
    await useChecklistStore.getState().setServiceResult('ok');
  }

  return id;
}

describe('ReportSummary', () => {
  const onBack = vi.fn();
  const onComplete = vi.fn();

  beforeEach(async () => {
    useChecklistStore.getState().reset();
    await db.delete();
    await db.open();
    onBack.mockClear();
    onComplete.mockClear();
  });

  it('renders summary title', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    // Title is now "Revisão"
    expect(screen.getByText('Revisão')).toBeInTheDocument();
  });

  it('shows service context info', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    expect(screen.getByText('Loja Fashion')).toBeInTheDocument();
    expect(screen.getByText('Shopping Iguatemi')).toBeInTheDocument();
    expect(screen.getByText('Split Inverter')).toBeInTheDocument();
    expect(screen.getByText('36000 BTU')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('shows progress count', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    // Progress shown as "0 de 13 itens preenchidos"
    expect(screen.getByText('0 de 13 itens preenchidos')).toBeInTheDocument();
  });

  it('shows all section titles', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    expect(screen.getByText('Filtros e Qualidade do Ar')).toBeInTheDocument();
    expect(screen.getByText('Componentes Mecânicos')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Refrigeração')).toBeInTheDocument();
    expect(screen.getByText('Componentes Elétricos')).toBeInTheDocument();
    expect(screen.getByText('Estrutura e Geral')).toBeInTheDocument();
  });

  it('shows service result selector with 3 options', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    expect(screen.getByText('Serviço OK')).toBeInTheDocument();
    expect(screen.getByText('Pendência Identificada')).toBeInTheDocument();
    expect(screen.getByText('Retorno Necessário')).toBeInTheDocument();
  });

  it('disables Finalizar when validation fails (no items filled)', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    // Button text is "Finalizar Checklist"
    expect(screen.getByText('Finalizar Checklist')).toBeDisabled();
  });

  it('enables Finalizar when all required items are filled and serviceResult set', async () => {
    await setupChecklist(true);
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    expect(screen.getByText('Finalizar Checklist')).not.toBeDisabled();
  });

  it('calls onComplete when clicking Finalizar', async () => {
    await setupChecklist(true);
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Finalizar Checklist'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when clicking Voltar', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Voltar'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows return justification field when return_needed is selected', async () => {
    await setupChecklist(true);
    await useChecklistStore.getState().setServiceResult('return_needed');

    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    expect(screen.getByLabelText('Justificativa do retorno')).toBeInTheDocument();
  });

  it('disables Finalizar when return_needed but no justification', async () => {
    await setupChecklist(true);
    await useChecklistStore.getState().setServiceResult('return_needed');

    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    expect(screen.getByText('Finalizar Checklist')).toBeDisabled();
  });

  it('shows validation error message when items are incomplete', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    // Validation bar shows number of remaining required items
    expect(screen.getByText(/itens obrigatórios restantes/)).toBeInTheDocument();
  });

  it('shows issues section when items have non-OK values', async () => {
    await setupChecklist(true);
    await useChecklistStore
      .getState()
      .setItemValue('filters-air-quality', 'filter-condition', 'Necessita Troca');

    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    // Issues panel is shown with "Atenção" heading
    expect(screen.getByText('Atenção')).toBeInTheDocument();
    // The item with non-OK value should appear in the issues list
    expect(screen.getByText('Necessita Troca')).toBeInTheDocument();
  });

  it('shows item values with color coding when section is expanded', async () => {
    await setupChecklist(true);
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);

    // Expand the first section to see item values
    const firstSectionButton = screen.getByText('Filtros e Qualidade do Ar').closest('button');
    fireEvent.click(firstSectionButton!);

    // All items are "OK", so emerald color styling should be applied
    const okValues = screen.getAllByText('OK');
    expect(okValues.length).toBeGreaterThan(0);
    for (const el of okValues) {
      expect(el.className).toContain('emerald');
    }
  });

  it('shows temperature value with °C suffix when section is expanded', async () => {
    await setupChecklist(true);
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);

    // Expand the last section "Estrutura e Geral" to see the temperature value
    const lastSectionButton = screen.getByText('Estrutura e Geral').closest('button');
    fireEvent.click(lastSectionButton!);

    expect(screen.getByText('22°C')).toBeInTheDocument();
  });

  it('navigation buttons have h-12 touch targets', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    const voltarBtn = screen.getByText('Voltar');
    const finalizarBtn = screen.getByText('Finalizar Checklist');
    expect(voltarBtn.className).toContain('h-12');
    expect(finalizarBtn.className).toContain('h-12');
  });

  it('service result buttons have h-14 touch targets', async () => {
    await setupChecklist();
    render(<ReportSummary onBack={onBack} onComplete={onComplete} />);
    const okBtn = screen.getByText('Serviço OK').closest('button');
    expect(okBtn?.className).toContain('h-14');
  });
});
