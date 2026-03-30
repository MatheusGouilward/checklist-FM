'use client';

import { useState } from 'react';
import { StatusSelector } from './StatusSelector';
import { PhotoCapture } from './PhotoCapture';
import { VoiceInput } from './VoiceInput';
import type { ChecklistItem as ChecklistItemType, Photo } from '@/lib/checklist/types';
import { cn } from '@/lib/utils';
import { Check, MessageSquare } from 'lucide-react';

interface ChecklistItemProps {
  checklistId: string;
  item: ChecklistItemType;
  onValueChange: (value: string | number | null) => void;
  onObservationChange: (observation: string) => void;
  onPhotoAdded: (photo: Photo) => void;
  onPhotoRemoved: (photoId: string) => void;
}

type StatusType = 'ok' | 'warning' | 'critical' | 'neutral';

function getStatusType(value: string | number | null): StatusType {
  if (value === null || value === '') return 'neutral';
  const val = String(value).toLowerCase();
  if (['ok', 'substituído', 'limpo', 'recarga realizada'].includes(val)) return 'ok';
  if (val.includes('necessita') || ['baixo', 'descalibrado', 'folga', 'desgaste', 'obstruído', 'ruído anormal', 'dano visível'].includes(val)) return 'warning';
  if (['detectado', 'danificado', 'não funciona', 'vazamento', 'vazamento detectado', 'falha'].includes(val)) return 'critical';
  return 'ok';
}

const STATUS_COLORS = {
  ok: { border: 'border-emerald-200', bg: 'bg-emerald-100', icon: 'text-emerald-600' },
  warning: { border: 'border-amber-200', bg: 'bg-amber-100', icon: 'text-amber-600' },
  critical: { border: 'border-red-200', bg: 'bg-red-100', icon: 'text-red-600' },
  neutral: { border: 'border-border', bg: '', icon: '' },
};

export function ChecklistItem({
  checklistId,
  item,
  onValueChange,
  onObservationChange,
  onPhotoAdded,
  onPhotoRemoved,
}: ChecklistItemProps) {
  const [showObservation, setShowObservation] = useState(
    !!item.observation && item.observation.length > 0
  );
  const isFilled = item.value !== null && item.value !== '';
  const hasObservation = !!item.observation && item.observation.length > 0;
  const statusType = getStatusType(item.value);
  const colors = STATUS_COLORS[statusType];

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 transition-colors duration-150',
        isFilled ? colors.border : 'border-[#e4e4e4]'
      )}
    >
      {/* Header: indicator + label + PMOC */}
      <div className="flex items-start gap-2.5">
        {/* Status indicator circle */}
        <div className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-200',
          isFilled
            ? colors.bg
            : 'border-2 border-muted-foreground/20'
        )}>
          {isFilled && (
            <Check className={cn('h-3 w-3', colors.icon)} />
          )}
        </div>

        {/* Label + PMOC */}
        <div className="flex min-w-0 flex-1 items-start gap-1">
          <span className="text-sm font-medium text-foreground">
            {item.label}
          </span>
          {item.required && (
            <span className="ml-1 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-primary">
              PMOC
            </span>
          )}
        </div>
      </div>

      {/* Response input */}
      <div className="mt-3">
        {item.responseType === 'options' && item.options && (
          <StatusSelector
            options={item.options}
            value={typeof item.value === 'string' ? item.value : null}
            onChange={onValueChange}
          />
        )}

        {item.responseType === 'numeric' && (
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={item.value !== null ? item.value : ''}
              onChange={(e) => {
                const val = e.target.value;
                onValueChange(val === '' ? null : parseFloat(val));
              }}
              placeholder="0.0"
              className="h-11 w-full rounded-lg border border-border bg-white px-4 pr-10 text-base font-medium tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={item.label}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              °C
            </span>
          </div>
        )}

        {item.responseType === 'text' && (
          <textarea
            value={typeof item.value === 'string' ? item.value : ''}
            onChange={(e) => onValueChange(e.target.value || null)}
            placeholder="Descreva..."
            className="min-h-[80px] w-full resize-none rounded-lg border border-border bg-white px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        )}
      </div>

      {/* Action row: photo + note side by side */}
      <div className="mt-3 flex gap-2">
        {/* Photo */}
        <div className="flex-1">
          <PhotoCapture
            checklistId={checklistId}
            itemId={item.id}
            photos={item.photos}
            onPhotoAdded={onPhotoAdded}
            onPhotoRemoved={onPhotoRemoved}
          />
        </div>

        {/* Note toggle */}
        <button
          type="button"
          onClick={() => setShowObservation(!showObservation)}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors',
            hasObservation
              ? 'border-violet-200 bg-violet-50 text-violet-700'
              : 'border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-muted/30'
          )}
          aria-label={hasObservation ? 'Editar observação' : 'Adicionar observação'}
        >
          <MessageSquare className={cn('h-4 w-4', hasObservation && 'fill-current')} />
        </button>
      </div>

      {/* Observation expanded */}
      {showObservation && (
        <div className="mt-3 animate-fadeIn">
          <VoiceInput
            value={item.observation ?? ''}
            onChange={(obs) => onObservationChange(obs)}
            label={`Observação para ${item.label}`}
          />
        </div>
      )}
    </div>
  );}
