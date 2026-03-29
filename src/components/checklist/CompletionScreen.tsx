'use client';

import { useChecklistStore } from '@/stores/checklist-store';
import { Check, AlertTriangle, RotateCcw } from 'lucide-react';

interface CompletionScreenProps {
  onNewChecklist: () => void;
  backLabel?: string;
}

export function CompletionScreen({ onNewChecklist, backLabel }: CompletionScreenProps) {
  const { storeName, shoppingName, serviceResult } = useChecklistStore();

  const resultConfig = {
    ok: {
      icon: Check,
      title: 'Checklist finalizado',
      subtitle: 'Serviço concluído com sucesso',
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      resultBadge: 'bg-emerald-50 text-emerald-700',
    },
    pending_issue: {
      icon: AlertTriangle,
      title: 'Checklist finalizado',
      subtitle: 'Existem pendências a resolver',
      color: 'text-amber-600',
      iconBg: 'bg-amber-50',
      resultBadge: 'bg-amber-50 text-amber-700',
    },
    return_needed: {
      icon: RotateCcw,
      title: 'Checklist finalizado',
      subtitle: 'Retorno necessário',
      color: 'text-red-600',
      iconBg: 'bg-red-50',
      resultBadge: 'bg-red-50 text-red-700',
    },
  };

  const config = serviceResult
    ? resultConfig[serviceResult]
    : resultConfig.ok;

  const Icon = config.icon;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Main content */}
      <div className="flex flex-1 flex-col items-center px-6 pt-12 text-center">
        {/* Status icon */}
        <div className={`animate-scaleIn rounded-full p-4 ${config.iconBg}`}>
          <Icon className={`h-8 w-8 ${config.color}`} strokeWidth={2} />
        </div>

        {/* Text */}
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
          {config.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {config.subtitle}
        </p>

        {/* Summary card */}
        <div className="mt-6 w-full max-w-sm rounded-xl bg-muted/30 p-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Loja</dt>
              <dd className="font-medium text-foreground">{storeName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shopping</dt>
              <dd className="font-medium text-foreground">{shoppingName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Resultado</dt>
              <dd className={`rounded-md px-2 py-0.5 text-xs font-medium ${config.resultBadge}`}>
                {config.subtitle}
              </dd>
            </div>
          </dl>
        </div>

        {/* Sync status */}
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">
            Dados sincronizados automaticamente quando houver conexão
          </span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-6 pt-4 safe-bottom">
        <button
          type="button"
          onClick={onNewChecklist}
          className="h-12 w-full rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.98] active:transition-transform active:duration-100"
        >
          {backLabel ?? 'Novo Checklist'}
        </button>
      </div>
    </div>
  );
}
