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

function getItemBorderClass(item: ChecklistItemType): string {
  if (item.value === null || item.value === '') {
    return 'border-border';
  }

  const val = String(item.value).toLowerCase();
  if (val === 'ok' || val === 'substituído' || val === 'limpo' || val === 'recarga realizada') {
    return 'border-emerald-200';
  }
  if (val.includes('necessita') || val === 'baixo' || val === 'descalibrado' || val === 'folga' || val === 'desgaste' || val === 'obstruído' || val === 'ruído anormal' || val === 'dano visível') {
    return 'border-amber-200';
  }
  if (val === 'detectado' || val === 'danificado' || val === 'não funciona' || val === 'vazamento' || val === 'vazamento detectado' || val === 'falha') {
    return 'border-red-200';
  }
  return 'border-primary/20';
}

function getStatusBgClass(item: ChecklistItemType): string {
  const val = String(item.value).toLowerCase();
  if (['ok', 'substituído', 'limpo', 'recarga realizada'].includes(val)) return 'bg-emerald-100';
  if (val.includes('necessita') || ['baixo', 'descalibrado', 'folga', 'desgaste', 'obstruído', 'ruído anormal', 'dano visível'].includes(val)) return 'bg-amber-100';
  if (['detectado', 'danificado', 'não funciona', 'vazamento', 'vazamento detectado', 'falha'].includes(val)) return 'bg-red-100';
  return 'bg-primary/10';
}

function getStatusIconColor(item: ChecklistItemType): string {
  const val = String(item.value).toLowerCase();
  if (['ok', 'substituído', 'limpo', 'recarga realizada'].includes(val)) return 'text-emerald-600';
  if (val.includes('necessita') || ['baixo', 'descalibrado', 'folga', 'desgaste', 'obstruído', 'ruído anormal', 'dano visível'].includes(val)) return 'text-amber-600';
  if (['detectado', 'danificado', 'não funciona', 'vazamento', 'vazamento detectado', 'falha'].includes(val)) return 'text-red-600';
  return 'text-primary';
}

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

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4 transition-colors duration-150',
        getItemBorderClass(item)
      )}
    >
      {/* Header: indicator + label + PMOC */}
      <div className="flex items-start gap-2.5">
        {/* Status indicator circle */}
        <div className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-200',
          isFilled
            ? getStatusBgClass(item)
            : 'border-2 border-muted-foreground/20'
        )}>
          {isFilled && (
            <Check className={cn('h-3 w-3', getStatusIconColor(item))} />
          )}
        </div>

        {/* Label + PMOC */}
        <div className="flex items-start gap-1 min-w-0 flex-1">
          <span className="text-sm font-medium text-foreground">
            {item.label}
          </span>
          {item.required && (
            <span className="ml-1.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-primary">
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

      {/* Action buttons — stacked full-width */}
      <div className="mt-3 space-y-2">
        {/* Photo button — FULL WIDTH */}
        <PhotoCapture
          checklistId={checklistId}
          itemId={item.id}
          photos={item.photos}
          onPhotoAdded={onPhotoAdded}
          onPhotoRemoved={onPhotoRemoved}
        />

        {/* Note button — secondary, full-width */}
        <button
          type="button"
          onClick={() => setShowObservation(!showObservation)}
          className={cn(
            'flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-sm transition-colors',
            hasObservation
              ? 'border-violet-200 bg-violet-50 font-medium text-violet-700'
              : 'border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-muted/30'
          )}
        >
          <MessageSquare className={cn('h-4 w-4', hasObservation && 'fill-current')} />
          {hasObservation ? 'Editar observação' : 'Adicionar observação'}
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
  );
}
