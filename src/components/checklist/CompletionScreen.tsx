'use client';

import { useEffect, useState } from 'react';
import { useChecklistStore } from '@/stores/checklist-store';
import { cn } from '@/lib/utils';
import {
  Check,
  AlertTriangle,
  RotateCcw,
  CloudUpload,
  WifiOff,
  FileText,
  Mail,
  Send,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

interface CompletionScreenProps {
  onNewChecklist: () => void;
  backLabel?: string;
}

export function CompletionScreen({ onNewChecklist, backLabel }: CompletionScreenProps) {
  const { storeName, shoppingName, serviceResult, serviceType, equipmentModel } = useChecklistStore();

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resultConfig = {
    ok: {
      icon: Check,
      title: 'Serviço concluído',
      subtitle: 'Tudo em ordem',
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      iconRing: 'ring-emerald-100',
      resultLabel: 'OK',
      resultBadge: 'bg-emerald-50 text-emerald-700',
    },
    pending_issue: {
      icon: AlertTriangle,
      title: 'Checklist finalizado',
      subtitle: 'Pendências identificadas',
      color: 'text-amber-600',
      iconBg: 'bg-amber-50',
      iconRing: 'ring-amber-100',
      resultLabel: 'Pendência',
      resultBadge: 'bg-amber-50 text-amber-700',
    },
    return_needed: {
      icon: RotateCcw,
      title: 'Checklist finalizado',
      subtitle: 'Retorno necessário',
      color: 'text-red-600',
      iconBg: 'bg-red-50',
      iconRing: 'ring-red-100',
      resultLabel: 'Retorno',
      resultBadge: 'bg-red-50 text-red-700',
    },
  };

  const config = serviceResult
    ? resultConfig[serviceResult]
    : resultConfig.ok;

  const Icon = config.icon;

  const serviceTypeLabel = serviceType === 'preventive' ? 'Preventiva' : serviceType === 'corrective' ? 'Corretiva' : 'Instalação';

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center px-5 pt-10 pb-6">
          {/* Status icon with ring */}
          <div className={cn('animate-scaleIn rounded-full p-4 ring-8', config.iconBg, config.iconRing)}>
            <Icon className={cn('h-8 w-8', config.color)} strokeWidth={2} />
          </div>

          {/* Title */}
          <h2 className="mt-5 font-heading text-xl font-bold text-foreground">
            {config.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {config.subtitle}
          </p>

          {/* Summary card */}
          <div className="mt-6 w-full max-w-sm rounded-xl border border-border bg-white p-4">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Loja</dt>
                <dd className="font-medium text-foreground">{storeName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shopping</dt>
                <dd className="font-medium text-foreground">{shoppingName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tipo</dt>
                <dd className="font-medium text-foreground">{serviceTypeLabel}</dd>
              </div>
              {equipmentModel && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Equipamento</dt>
                  <dd className="max-w-[180px] truncate font-medium text-foreground">{equipmentModel}</dd>
                </div>
              )}
              <div className="border-t border-border pt-2.5 flex justify-between">
                <dt className="text-muted-foreground">Resultado</dt>
                <dd className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', config.resultBadge)}>
                  {config.resultLabel}
                </dd>
              </div>
            </dl>
          </div>

          {/* Sync status */}
          <div className="mt-4 w-full max-w-sm">
            <div className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3',
              isOnline ? 'bg-emerald-50' : 'bg-amber-50'
            )}>
              {isOnline ? (
                <>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <CloudUpload className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-emerald-800">Dados sincronizados</p>
                    <p className="text-xs text-emerald-600/70">Relatório será gerado automaticamente</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <WifiOff className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-amber-800">Sem conexão</p>
                    <p className="text-xs text-amber-600/70">Dados serão enviados quando voltar online</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Report & Notifications */}
          <div className="mt-5 w-full max-w-sm space-y-2">
            <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Relatório e notificações
            </h3>

            {/* PDF Report */}
            <button
              type="button"
              onClick={() => {/* TODO: open PDF or call generation API */}}
              disabled={!isOnline}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 text-left transition-colors hover:bg-muted/30 disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <FileText className="h-4 w-4 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Relatório PDF</p>
                <p className="truncate text-xs text-muted-foreground">Relatório completo do serviço</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            </button>

            {/* Email to Manager */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">E-mail para gestor</p>
                <p className="truncate text-xs text-muted-foreground">
                  {isOnline ? 'Enviado automaticamente' : 'Será enviado ao reconectar'}
                </p>
              </div>
              {isOnline ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-amber-300" />
              )}
            </div>

            {/* Notification to Store */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                <Send className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Notificação para lojista</p>
                <p className="truncate text-xs text-muted-foreground">
                  {isOnline ? 'Enviado automaticamente' : 'Será enviado ao reconectar'}
                </p>
              </div>
              {isOnline ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-amber-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="shrink-0 border-t border-border bg-white px-5 pt-3 pb-5">
        <button
          type="button"
          onClick={onNewChecklist}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.98] active:transition-transform active:duration-100"
        >
          {backLabel ?? 'Novo Checklist'}
        </button>
      </div>
    </div>
  );
}
