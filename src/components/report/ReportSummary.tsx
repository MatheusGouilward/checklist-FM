'use client';

import { useState } from 'react';
import { VoiceInput } from '@/components/checklist/VoiceInput';
import { useChecklistStore } from '@/stores/checklist-store';
import { checklistSchema } from '@/lib/checklist/validation';
import { cn } from '@/lib/utils';
import type { ChecklistItem, ChecklistSection } from '@/lib/checklist/types';
import {
  RotateCcw, Check, AlertCircle, ChevronDown,
} from 'lucide-react';

function getServiceResultLabel(result: string | null): string {
  switch (result) {
    case 'ok': return 'Serviço OK';
    case 'pending_issue': return 'Pendência Identificada';
    case 'return_needed': return 'Retorno Necessário';
    default: return 'Não definido';
  }
}

function ServiceResultIcon({ result, className }: { result: string; className?: string }) {
  switch (result) {
    case 'ok': return <Check className={className} />;
    case 'pending_issue': return <AlertCircle className={className} />;
    case 'return_needed': return <RotateCcw className={className} />;
    default: return null;
  }
}

function getItemValueStyle(item: ChecklistItem): string {
  if (item.value === null || item.value === '') return 'text-muted-foreground/40';
  const val = String(item.value).toLowerCase();
  if (val === 'ok' || val === 'substituído' || val === 'limpo' || val === 'recarga realizada') return 'text-emerald-600';
  if (val.includes('necessita') || val === 'baixo' || val === 'descalibrado' || val === 'folga' || val === 'desgaste' || val === 'obstruído' || val === 'ruído anormal' || val === 'dano visível') return 'text-amber-600';
  if (val === 'detectado' || val === 'danificado' || val === 'não funciona' || val === 'vazamento' || val === 'vazamento detectado' || val === 'falha') return 'text-red-600';
  return 'text-foreground';
}

function getSectionIssues(section: ChecklistSection): ChecklistItem[] {
  return section.items.filter((item) => {
    if (item.value === null || item.value === '') return false;
    const val = String(item.value).toLowerCase();
    return val !== 'ok' && item.responseType === 'options';
  });
}

function getValidationErrors(state: ReturnType<typeof useChecklistStore.getState>): string[] {
  const result = checklistSchema.safeParse({
    id: state.id ?? '',
    status: 'completed',
    serviceResult: state.serviceResult,
    createdAt: state.createdAt ?? new Date(),
    completedAt: new Date(),
    syncedAt: state.syncedAt,
    storeName: state.storeName,
    shoppingName: state.shoppingName,
    equipmentModel: state.equipmentModel,
    equipmentCapacity: state.equipmentCapacity,
    serviceType: state.serviceType,
    technicianId: state.technicianId,
    technicianName: state.technicianName,
    sections: state.sections,
    photos: [],
    observations: state.observations,
    returnJustification: state.returnJustification || undefined,
    signature: state.signature,
  });
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}

const SERVICE_RESULT_STYLES = {
  ok: {
    selected: 'border-2 border-emerald-300 bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  pending_issue: {
    selected: 'border-2 border-amber-300 bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
  },
  return_needed: {
    selected: 'border-2 border-red-300 bg-red-50',
    icon: 'bg-red-100 text-red-600',
  },
} as const;

interface ReportSummaryProps {
  onBack: () => void;
  onComplete: () => void;
}

function CollapsibleSection({ section }: { section: ChecklistSection }) {
  const [open, setOpen] = useState(false);
  const filled = section.items.filter((i) => i.value !== null && i.value !== '').length;

  return (
    <div className="rounded-xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{section.title}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums">
            {filled}/{section.items.length}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </div>
      </button>
      {open && (
        <ul className="border-t border-border px-4 animate-fadeIn">
          {section.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between border-b border-border/30 py-2.5 text-sm last:border-0">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={cn('font-medium', getItemValueStyle(item))}>
                {item.value !== null && item.value !== ''
                  ? item.responseType === 'numeric' ? `${item.value}°C` : String(item.value)
                  : '—'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ReportSummary({ onBack, onComplete }: ReportSummaryProps) {
  const state = useChecklistStore();
  const {
    storeName, shoppingName, equipmentModel, equipmentCapacity,
    serviceType, technicianName, serviceResult, sections,
    observations, returnJustification,
    setServiceResult, setReturnJustification, setObservations,
  } = state;

  const errors = getValidationErrors(state);
  const canComplete = errors.length === 0;

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const filledItems = sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.value !== null && i.value !== '').length,
    0
  );
  const requiredMissing = sections.reduce(
    (sum, s) => sum + s.items.filter((i) => i.required && (i.value === null || i.value === '')).length,
    0
  );

  const allIssues = sections.flatMap((s) => getSectionIssues(s));

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto overscroll-y-contain space-y-4 px-5 py-5">
        {/* Page header */}
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">Revisão</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Verifique os dados antes de finalizar
          </p>
        </div>

        {/* Info card */}
        <div className="rounded-xl border border-border bg-white p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[
              ['Loja', storeName],
              ['Shopping', shoppingName],
              ['Tipo', serviceType === 'preventive' ? 'Preventiva' : serviceType === 'corrective' ? 'Corretiva' : 'Instalação'],
              ['Equipamento', equipmentModel],
              ['Capacidade', equipmentCapacity],
              ['Técnico', technicianName],
            ].map(([label, val]) => (
              <div key={label}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 font-medium text-foreground">{val}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Progress summary */}
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold text-foreground">
              {filledItems} de {totalItems} itens preenchidos
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                filledItems === totalItems ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 0}%` }}
            />
          </div>
          {requiredMissing > 0 && (
            <p className="mt-2 text-sm text-amber-600">
              Faltam {requiredMissing} {requiredMissing === 1 ? 'item obrigatório' : 'itens obrigatórios'}
            </p>
          )}
        </div>

        {/* Issues card */}
        {allIssues.length > 0 && (
          <div className="rounded-r-xl border-l-4 border-amber-400 bg-amber-50/50 p-4">
            <h3 className="font-semibold text-amber-800">Atenção</h3>
            <ul className="mt-2 space-y-1.5">
              {allIssues.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-amber-900/70">{item.label}</span>
                  <span className={cn('font-medium', getItemValueStyle(item))}>
                    {String(item.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section cards (collapsible) */}
        <div className="space-y-3">
          {sections.map((section) => (
            <CollapsibleSection key={section.id} section={section} />
          ))}
        </div>

        {/* Service result selection */}
        <div className="mt-6">
          <h2 className="text-base font-semibold text-foreground">Resultado do Serviço</h2>
          <div className="mt-3 space-y-2">
            {(['ok', 'pending_issue', 'return_needed'] as const).map((result) => {
              const isSelected = serviceResult === result;
              const styles = SERVICE_RESULT_STYLES[result];
              return (
                <button
                  key={result}
                  type="button"
                  onClick={() => setServiceResult(result)}
                  className={cn(
                    'flex h-14 w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors',
                    isSelected ? styles.selected : 'border-border bg-white'
                  )}
                  aria-pressed={isSelected}
                >
                  <span className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    isSelected ? styles.icon : 'bg-muted text-muted-foreground'
                  )}>
                    <ServiceResultIcon result={result} className="h-3.5 w-3.5" />
                  </span>
                  {getServiceResultLabel(result)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Return justification */}
        {serviceResult === 'return_needed' && (
          <div className="animate-fadeIn space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Justificativa do retorno <span className="text-red-500">*</span>
            </label>
            <textarea
              value={returnJustification}
              onChange={(e) => setReturnJustification(e.target.value)}
              placeholder="Descreva o motivo do retorno..."
              className="min-h-[80px] w-full resize-none rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Justificativa do retorno"
            />
          </div>
        )}

        {/* General observations */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Observações gerais (opcional)
          </label>
          <VoiceInput
            value={observations}
            onChange={setObservations}
            placeholder="Observações adicionais sobre o serviço..."
            label="Observações gerais"
          />
        </div>
      </div>

      {/* Validation alert */}
      {errors.length > 0 && (
        <div className="bg-red-50 px-5 py-3 text-sm text-red-700">
          Preencha os {errors.length} {errors.length === 1 ? 'item obrigatório restante' : 'itens obrigatórios restantes'}
        </div>
      )}

      {/* Footer actions */}
      <div className="sticky bottom-0 z-10 flex gap-3 border-t border-border bg-white px-5 pt-3 pb-5">
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex-1 rounded-lg border border-border font-medium text-foreground transition-colors hover:bg-muted"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(15);
            onComplete();
          }}
          disabled={!canComplete}
          className="h-12 flex-1 rounded-lg bg-emerald-600 font-medium text-white transition-colors hover:bg-emerald-700 active:scale-[0.98] active:transition-transform active:duration-100 disabled:opacity-50 disabled:pointer-events-none"
        >
          Finalizar Checklist
        </button>
      </div>
    </div>
  );
}
