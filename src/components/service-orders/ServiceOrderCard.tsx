'use client';

import type { ServiceOrderRecord } from '@/lib/db/schema';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Check, AlertTriangle } from 'lucide-react';
import { STORE_LOGOS } from '@/lib/demo/mock-data';

interface ServiceOrderCardProps {
  order: ServiceOrderRecord;
  onStart: (order: ServiceOrderRecord) => void;
  onReportIssue?: (order: ServiceOrderRecord) => void;
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

function getStoreColor(name: string): string {
  const colors = [
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getStoreInitials(name: string): string {
  const cleaned = name.replace(/^(Loja|Lojas)\s+/i, '');
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

const STATUS_CONFIG = {
  pending: { dot: 'bg-muted-foreground/40', text: 'text-muted-foreground', label: 'Pendente' },
  in_progress: { dot: 'bg-primary', text: 'text-primary', label: 'Em andamento' },
  completed: { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'Concluído' },
} as const;

export function ServiceOrderCard({ order, onStart, onReportIssue }: ServiceOrderCardProps) {
  const hasChecklist = !!order.checklistId;
  const overdue = order.status !== 'completed' && isOverdue(order.scheduledDate);
  const isCompleted = order.status === 'completed';
  const statusCfg = STATUS_CONFIG[order.status];
  const hasEquipmentInfo = order.equipmentModel && order.equipmentModel !== 'Não informado';
  const logoUrl = STORE_LOGOS[order.storeName];

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
        {/* Row 1: Avatar + Store name + Service type badge */}
        <div className="flex items-center gap-3">
          {/* Store avatar: real logo or initials fallback */}
          {logoUrl ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
              <Image
                src={logoUrl}
                alt={order.storeName}
                width={32}
                height={32}
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
              getStoreColor(order.storeName)
            )}>
              {getStoreInitials(order.storeName)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
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
          </div>
        </div>

        {/* Row 2: Shopping · Date */}
        <p className="mt-1.5 pl-[52px] text-[13px] text-muted-foreground">
          {order.shoppingName}
          <span className="mx-1">·</span>
          <span className={overdue ? 'font-medium text-red-500' : ''}>
            {formatRelativeDate(order.scheduledDate)}
          </span>
        </p>

        {/* Row 3: Equipment */}
        {hasEquipmentInfo && (
          <p className="mt-0.5 truncate pl-[52px] text-xs text-muted-foreground/60">
            {order.equipmentModel}
            {order.equipmentCapacity && order.equipmentCapacity !== 'Não informado' && (
              <> · {order.equipmentCapacity}</>
            )}
          </p>
        )}

        {/* Row 4: Status + Action */}
        <div className="mt-3 flex items-center justify-between pl-[52px]">
          <div className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', statusCfg.dot)} />
            <span className={cn('text-xs font-medium', statusCfg.text)}>
              {overdue ? 'Atrasada' : statusCfg.label}
            </span>
          </div>

          {!isCompleted && (
            <span className="text-xs font-medium text-primary">
              {hasChecklist ? 'Continuar' : 'Iniciar'} →
            </span>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1 text-emerald-600">
              <Check className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Concluído</span>
            </div>
          )}
        </div>
      </button>

      {/* Report issue button for overdue orders */}
      {overdue && onReportIssue && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReportIssue(order);
          }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Reportar impedimento
        </button>
      )}
    </div>
  );
}
