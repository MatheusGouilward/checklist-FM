import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { useChecklistStore } from './checklist-store';
import { db } from '@/lib/db/schema';
import { CHECKLIST_TEMPLATE, TOTAL_ITEMS } from '@/lib/checklist/template';

describe('useChecklistStore', () => {
  beforeEach(async () => {
    // Reset store
    useChecklistStore.getState().reset();
    // Clear DB
    await db.delete();
    await db.open();
  });

  it('has initial state with empty sections from template', () => {
    const state = useChecklistStore.getState();
    expect(state.id).toBeNull();
    expect(state.status).toBe('draft');
    expect(state.sections).toHaveLength(CHECKLIST_TEMPLATE.length);

    const totalItems = state.sections.reduce(
      (sum, s) => sum + s.items.length,
      0
    );
    expect(totalItems).toBe(TOTAL_ITEMS);
  });

  it('starts a new checklist and persists to Dexie', async () => {
    const id = await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja Teste',
      shoppingName: 'Shopping Norte',
      equipmentModel: 'Split Inverter',
      equipmentCapacity: '36000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João Silva',
    });

    expect(id).toBeTruthy();

    const state = useChecklistStore.getState();
    expect(state.id).toBe(id);
    expect(state.status).toBe('in_progress');
    expect(state.storeName).toBe('Loja Teste');

    // Verify persisted in Dexie
    const record = await db.checklists.get(id);
    expect(record).toBeDefined();
    expect(record!.storeName).toBe('Loja Teste');
    expect(record!.status).toBe('in_progress');

    // Verify sync queue entry
    const queue = await db.syncQueue.toArray();
    expect(queue.some((q) => q.recordId === id && q.action === 'create')).toBe(
      true
    );
  });

  it('sets item value and auto-saves to Dexie', async () => {
    const id = await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'corrective',
      technicianId: 'tech-2',
      technicianName: 'Maria',
    });

    await useChecklistStore
      .getState()
      .setItemValue('filters-air-quality', 'filter-condition', 'OK');

    // Verify in-memory state
    const state = useChecklistStore.getState();
    const section = state.sections.find((s) => s.id === 'filters-air-quality');
    const item = section!.items.find((i) => i.id === 'filter-condition');
    expect(item!.value).toBe('OK');

    // Verify persisted in Dexie
    const record = await db.checklists.get(id);
    const sections = JSON.parse(record!.sections);
    const persistedItem = sections[0].items[0];
    expect(persistedItem.value).toBe('OK');
  });

  it('sets item observation and auto-saves', async () => {
    await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    await useChecklistStore
      .getState()
      .setItemObservation(
        'filters-air-quality',
        'filter-condition',
        'Filtro muito sujo'
      );

    const state = useChecklistStore.getState();
    const section = state.sections.find((s) => s.id === 'filters-air-quality');
    const item = section!.items.find((i) => i.id === 'filter-condition');
    expect(item!.observation).toBe('Filtro muito sujo');
  });

  it('sets service result and auto-saves', async () => {
    const id = await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    await useChecklistStore.getState().setServiceResult('ok');

    expect(useChecklistStore.getState().serviceResult).toBe('ok');

    const record = await db.checklists.get(id);
    expect(record!.serviceResult).toBe('ok');
  });

  it('sets return justification and auto-saves', async () => {
    const id = await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    await useChecklistStore.getState().setServiceResult('return_needed');
    await useChecklistStore
      .getState()
      .setReturnJustification('Peça indisponível');

    const record = await db.checklists.get(id);
    expect(record!.returnJustification).toBe('Peça indisponível');
  });

  it('completes a checklist', async () => {
    const id = await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    await useChecklistStore.getState().completeChecklist();

    const state = useChecklistStore.getState();
    expect(state.status).toBe('completed');
    expect(state.completedAt).toBeInstanceOf(Date);

    const record = await db.checklists.get(id);
    expect(record!.status).toBe('completed');
  });

  it('loads a checklist from Dexie', async () => {
    const id = await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja Reload',
      shoppingName: 'Shopping Sul',
      equipmentModel: 'Cassete',
      equipmentCapacity: '48000 BTU',
      serviceType: 'installation',
      technicianId: 'tech-3',
      technicianName: 'Carlos',
    });

    await useChecklistStore
      .getState()
      .setItemValue('filters-air-quality', 'filter-condition', 'Substituído');

    // Reset in-memory state (simulates app restart)
    useChecklistStore.getState().reset();
    expect(useChecklistStore.getState().id).toBeNull();

    // Load from Dexie
    await useChecklistStore.getState().loadChecklist(id);

    const state = useChecklistStore.getState();
    expect(state.id).toBe(id);
    expect(state.storeName).toBe('Loja Reload');
    expect(state.serviceType).toBe('installation');

    const section = state.sections.find((s) => s.id === 'filters-air-quality');
    const item = section!.items.find((i) => i.id === 'filter-condition');
    expect(item!.value).toBe('Substituído');
  });

  it('sets general observations and auto-saves', async () => {
    const id = await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    await useChecklistStore
      .getState()
      .setObservations('Equipamento muito antigo');

    expect(useChecklistStore.getState().observations).toBe(
      'Equipamento muito antigo'
    );

    const record = await db.checklists.get(id);
    expect(record!.observations).toBe('Equipamento muito antigo');
  });

  it('manages active section index', () => {
    useChecklistStore.getState().setActiveSectionIndex(2);
    expect(useChecklistStore.getState().activeSectionIndex).toBe(2);
  });

  it('creates sync queue entries on updates', async () => {
    const id = await useChecklistStore.getState().startNewChecklist({
      storeName: 'Loja A',
      shoppingName: 'Shopping X',
      equipmentModel: 'Split',
      equipmentCapacity: '24000 BTU',
      serviceType: 'preventive',
      technicianId: 'tech-1',
      technicianName: 'João',
    });

    await useChecklistStore
      .getState()
      .setItemValue('filters-air-quality', 'filter-condition', 'OK');

    const queue = await db.syncQueue.toArray();
    // At least create + update
    const entries = queue.filter((q) => q.recordId === id);
    expect(entries.length).toBeGreaterThanOrEqual(2);
    expect(entries.some((q) => q.action === 'create')).toBe(true);
    expect(entries.some((q) => q.action === 'update')).toBe(true);
  });

  it('reset clears all state', () => {
    useChecklistStore.setState({
      id: 'some-id',
      storeName: 'Test',
      status: 'completed',
    });

    useChecklistStore.getState().reset();

    const state = useChecklistStore.getState();
    expect(state.id).toBeNull();
    expect(state.storeName).toBe('');
    expect(state.status).toBe('draft');
  });
});
