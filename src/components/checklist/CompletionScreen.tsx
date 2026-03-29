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
} from 'lucide-react';

interface CompletionScreenProps {
  onNewChecklist: () => void;
  backLabel?: string;
}

export function CompletionScreen({ onNewChecklist, backLabel }: CompletionScreenProps) {
  const { storeName, shoppingName, serviceResult } = useChecklistStore();

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

        {/* Sync status card */}
        <div className="mt-6 w-full max-w-sm">
          <div className={cn(
            'flex items-center gap-3 rounded-lg px-4 py-3',
            isOnline ? 'bg-emerald-50' : 'bg-amber-50'
          )}>
            {isOnline ? (
              <>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <CloudUpload className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-emerald-800">Dados sincronizados</p>
                  <p className="text-xs text-emerald-600/70">Relatório será gerado automaticamente</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <WifiOff className="h-4 w-4 text-amber-600" />
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
        <div className="mt-4 w-full max-w-sm space-y-2">
          <h3 className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Relatório e notificações
          </h3>

          {/* PDF Report */}
          <button
            type="button"
            onClick={() => {/* TODO: open PDF or call generation API */}}
            disabled={!isOnline}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-left transition-colors hover:bg-muted/30 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <FileText className="h-4 w-4 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Relatório PDF</p>
              <p className="truncate text-xs text-muted-foreground">Relatório completo do serviço</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
          </button>

          {/* Email to Manager */}
          <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
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
          <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
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
