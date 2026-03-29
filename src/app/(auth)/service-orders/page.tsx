'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useChecklistStore } from '@/stores/checklist-store';
import { ServiceOrderList } from '@/components/service-orders/ServiceOrderList';
import { ChecklistForm } from '@/components/checklist/ChecklistForm';
import { ReportSummary } from '@/components/report/ReportSummary';
import { CompletionScreen } from '@/components/checklist/CompletionScreen';
import type { ServiceOrderRecord } from '@/lib/db/schema';

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
    await completeChecklist();
    setScreen('completed');
  }

  function handleBackToList() {
    reset();
    setScreen('list');
  }

  if (screen === 'checklist') {
    return <ChecklistForm onGoToSummary={handleGoToSummary} onBack={handleBackToList} />;
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
    <div className="px-5 py-5">
      <h2 className="mb-5 font-heading text-xl font-bold text-foreground">
        Ordens de Serviço
      </h2>
      <ServiceOrderList onSelectOrder={handleSelectOrder} />
    </div>
  );
}
