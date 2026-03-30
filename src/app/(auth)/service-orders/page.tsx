'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useChecklistStore } from '@/stores/checklist-store';
import { ServiceOrderList } from '@/components/service-orders/ServiceOrderList';
import { ChecklistForm } from '@/components/checklist/ChecklistForm';
import { ReportSummary } from '@/components/report/ReportSummary';
import { CompletionScreen } from '@/components/checklist/CompletionScreen';
import type { ServiceOrderRecord } from '@/lib/db/schema';
import { db } from '@/lib/db/schema';

type Screen = 'list' | 'checklist' | 'summary' | 'completed';

export default function ServiceOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const {
    startNewChecklist,
    loadChecklist,
    completeChecklist,
    reset,
    setActiveSectionIndex,
    sections,
  } = useChecklistStore();

  const [screen, setScreen] = useState<Screen>('list');
  const [refreshCounter, setRefreshCounter] = useState(0);

  async function handleSelectOrder(order: ServiceOrderRecord) {
    if (order.checklistId) {
      await loadChecklist(order.checklistId);
      setScreen('checklist');
    } else {
      await startNewChecklist({
        storeName: order.storeName,
        shoppingName: order.shoppingName,
        equipmentModel: order.equipmentModel,
        equipmentCapacity: order.equipmentCapacity,
        serviceType: order.serviceType,
        technicianId: user!.id,
        technicianName: user!.fullName,
        serviceOrderId: order.id,
      });
      setScreen('checklist');
    }
  }

  function handleGoToSummary() {
    setScreen('summary');
  }

  function handleBackToChecklist() {
    setActiveSectionIndex(sections.length - 1);
    setScreen('checklist');
  }

  async function handleComplete() {
    const checklistId = useChecklistStore.getState().id;
    const serviceOrderId = useChecklistStore.getState().serviceOrderId;

    await completeChecklist();

    if (serviceOrderId) {
      try {
        await db.serviceOrders.update(serviceOrderId, {
          status: 'completed' as const,
          checklistId: checklistId ?? undefined,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        // Silently fail — sync will resolve
      }
    }

    setScreen('completed');
  }

  function handleBackToList() {
    reset();
    setRefreshCounter((c) => c + 1);
    setScreen('list');
  }

  if (screen === 'checklist') {
    return (
      <ChecklistForm
        onGoToSummary={handleGoToSummary}
        onBack={handleBackToList}
      />
    );
  }

  if (screen === 'summary') {
    return (
      <ReportSummary
        onBack={handleBackToChecklist}
        onComplete={handleComplete}
      />
    );
  }

  if (screen === 'completed') {
    return (
      <CompletionScreen
        onNewChecklist={handleBackToList}
        backLabel="Voltar para Ordens de Serviço"
      />
    );
  }

  return (
    <ServiceOrderList key={refreshCounter} onSelectOrder={handleSelectOrder} />
  );
}
