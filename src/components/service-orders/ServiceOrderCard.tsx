'use client';

import type { ServiceOrderRecord } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ServiceOrderCardProps {
  order: ServiceOrderRecord;
  onStart: (order: ServiceOrderRecord) => void;
}

const SERVICE_TYPE_LABELS = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  installation: 'Instalação',
} as const;

const SERVICE_TYPE_STYLES = {
  preventive: 'bg-blue-50 text-blue-600',
  corrective: 'bg-amber-50 text-amber-600',
  installation: 'bg-emerald-50 text-emerald-600',
} as const;

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Hoje, ${time}`;
  if (diffDays === 1) return `Amanhã, ${time}`;
  if (diffDays === -1) return 'Ontem';
  if (diffDays < -1) return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function isOverdue(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return dateStart.getTime() < todayStart.getTime();
}

const STATUS_CONFIG = {
  pending: { dot: 'bg-muted-foreground/40', text: 'text-muted-foreground', label: 'Pendente' },
  in_progress: { dot: 'bg-primary', text: 'text-primary', label: 'Em andamento' },
  completed: { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'Concluído' },
} as const;

export function ServiceOrderCard({ order, onStart }: ServiceOrderCardProps) {
  const hasChecklist = !!order.checklistId;
  const overdue = order.status !== 'completed' && isOverdue(order.scheduledDate);
  const isCompleted = order.status === 'completed';
  const statusCfg = STATUS_CONFIG[order.status];
  const hasEquipmentInfo = order.equipmentModel && order.equipmentModel !== 'Não informado';

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-white p-4 transition-shadow duration-150',
        isCompleted ? 'opacity-75' : 'hover:shadow-sm active:scale-[0.99] active:transition-transform active:duration-100'
      )}
    >
      <button
        type="button"
        onClick={() => onStart(order)}
        className="w-full text-left"
        disabled={isCompleted}
      >
        {/* Row 1: Store name + Service type badge */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-[15px] font-semibold text-foreground">
            {order.storeName}
          </h3>
          <span className={cn(
            'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold',
            SERVICE_TYPE_STYLES[order.serviceType]
          )}>
            {SERVICE_TYPE_LABELS[order.serviceType]}
          </span>
        </div>

        {/* Row 2: Shopping · Date */}
        <p className="mt-1 text-[13px] text-muted-foreground">
          {order.shoppingName}
          <span className="mx-1">·</span>
          <span className={overdue ? 'font-medium text-red-500' : ''}>
            {formatRelativeDate(order.scheduledDate)}
          </span>
        </p>

        {/* Row 3: Equipment */}
        {hasEquipmentInfo && (
          <p className="mt-1 truncate text-xs text-muted-foreground/60">
            {order.equipmentModel}
            {order.equipmentCapacity && order.equipmentCapacity !== 'Não informado' && (
              <> · {order.equipmentCapacity}</>
            )}
          </p>
        )}

        {/* Row 4: Status + Action */}
        <div className="mt-3 flex items-center justify-between">
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', statusCfg.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
            {statusCfg.label}
          </span>

          {isCompleted ? (
            <span className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-50 px-3 text-[13px] font-medium text-emerald-600">
              <Check className="h-3 w-3" />
              Concluído
            </span>
          ) : (
            <span className={cn(
              'inline-flex h-8 items-center rounded-lg px-3.5 text-[13px] font-semibold',
              hasChecklist ? 'bg-primary/8 text-primary' : 'bg-primary text-white'
            )}>
              {hasChecklist ? 'Continuar' : 'Iniciar'}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

export { formatRelativeDate };
