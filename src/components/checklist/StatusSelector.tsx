'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StatusSelectorProps {
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}

function getOptionStyle(option: string, isSelected: boolean): string {
  if (!isSelected) {
    return 'bg-muted/30 text-foreground/70 border-border hover:bg-muted/50';
  }

  const lower = option.toLowerCase();

  if (
    lower === 'ok' ||
    lower === 'substituído' ||
    lower === 'limpo' ||
    lower === 'recarga realizada'
  ) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold ring-1 ring-emerald-200';
  }

  if (
    lower.includes('necessita') ||
    lower === 'baixo' ||
    lower === 'descalibrado' ||
    lower === 'folga' ||
    lower === 'desgaste' ||
    lower === 'obstruído' ||
    lower === 'ruído anormal' ||
    lower === 'dano visível'
  ) {
    return 'bg-amber-50 text-amber-700 border-amber-300 font-semibold ring-1 ring-amber-200';
  }

  if (
    lower === 'detectado' ||
    lower === 'danificado' ||
    lower === 'não funciona' ||
    lower === 'vazamento' ||
    lower === 'vazamento detectado' ||
    lower === 'falha'
  ) {
    return 'bg-red-50 text-red-700 border-red-300 font-semibold ring-1 ring-red-200';
  }

  return 'bg-primary/10 text-primary border-primary/30 font-semibold ring-1 ring-primary/20';
}

function hapticTap() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

export function StatusSelector({ options, value, onChange }: StatusSelectorProps) {
  const hasLongOption = options.some((o) => o.length > 15);
  const cols =
    options.length <= 2
      ? 'grid-cols-2'
      : options.length === 3 && !hasLongOption
        ? 'grid-cols-3'
        : 'grid-cols-2';

  return (
    <div className={cn('grid gap-2', cols)} role="radiogroup">
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => {
              hapticTap();
              onChange(isSelected ? null : option);
            }}
            className={cn(
              'h-11 rounded-lg border px-3 text-center text-sm font-medium',
              'transition-transform duration-75',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'active:scale-[0.97]',
              getOptionStyle(option, isSelected)
            )}
          >
            <span className="inline-flex items-center justify-center gap-1">
              {isSelected && <Check className="h-2.5 w-2.5 shrink-0" />}
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}
