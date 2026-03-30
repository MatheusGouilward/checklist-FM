'use client';

import { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceOrderRecord } from '@/lib/db/schema';

interface ReportIssueSheetProps {
  order: ServiceOrderRecord;
  onClose: () => void;
  onSubmit: (order: ServiceOrderRecord, reason: string, details: string) => void;
}

const ISSUE_REASONS = [
  { id: 'no_access', label: 'Sem acesso ao local' },
  { id: 'equipment_unavailable', label: 'Equipamento inacessível' },
  { id: 'missing_parts', label: 'Peça/material em falta' },
  { id: 'store_closed', label: 'Loja fechada' },
  { id: 'safety_risk', label: 'Risco de segurança' },
  { id: 'other', label: 'Outro motivo' },
] as const;

export function ReportIssueSheet({ order, onClose, onSubmit }: ReportIssueSheetProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const canSubmit = selectedReason !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full rounded-t-2xl bg-white px-5 pb-6 pt-4 safe-bottom animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="text-base font-semibold text-foreground">Reportar Impedimento</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* OS context */}
        <p className="mt-2 text-sm text-muted-foreground">
          {order.storeName} · {order.shoppingName}
        </p>

        {/* Reason selection */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-foreground">Motivo</label>
          <div className="grid grid-cols-2 gap-2">
            {ISSUE_REASONS.map((reason) => (
              <button
                key={reason.id}
                type="button"
                onClick={() => setSelectedReason(reason.id)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                  selectedReason === reason.id
                    ? 'border-red-300 bg-red-50 font-medium text-red-700'
                    : 'border-border text-foreground hover:bg-muted/30'
                )}
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>

        {/* Details textarea */}
        <div className="mt-4">
          <label className="text-sm font-medium text-foreground">
            Detalhes (opcional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Descreva o que aconteceu..."
            className="mt-1.5 min-h-[80px] w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={() => { if (selectedReason) onSubmit(order, selectedReason, details); }}
          disabled={!canSubmit}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-500 font-semibold text-white transition-colors hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send className="h-4 w-4" />
          Enviar Relatório
        </button>
      </div>
    </div>
  );
}
