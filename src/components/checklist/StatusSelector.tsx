'use client';

import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

interface StatusSelectorProps {
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}

function shouldUseButtons(options: string[]): boolean {
  return options.length === 2;
}

function getOptionStatusType(option: string): 'ok' | 'warning' | 'critical' | 'neutral' {
  const lower = option.toLowerCase();
  if (lower === 'ok' || lower === 'substituído' || lower === 'limpo' || lower === 'recarga realizada') return 'ok';
  if (lower.includes('necessita') || lower === 'baixo' || lower === 'descalibrado' || lower === 'folga' || lower === 'desgaste' || lower === 'obstruído' || lower === 'ruído anormal' || lower === 'dano visível') return 'warning';
  if (lower === 'detectado' || lower === 'danificado' || lower === 'não funciona' || lower === 'vazamento' || lower === 'vazamento detectado' || lower === 'falha') return 'critical';
  return 'neutral';
}

const STATUS_STYLES = {
  ok: {
    selected: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  warning: {
    selected: 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
  },
  critical: {
    selected: 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-200',
    dot: 'bg-red-500',
  },
  neutral: {
    selected: 'bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20',
    dot: 'bg-primary',
  },
};

function hapticTap() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

export function StatusSelector({ options, value, onChange }: StatusSelectorProps) {
  const useButtons = shouldUseButtons(options);

  if (useButtons) {
    return (
      <div className="grid grid-cols-2 gap-2" role="radiogroup">
        {options.map((option) => {
          const isSelected = value === option;
          const statusType = getOptionStatusType(option);
          const styles = STATUS_STYLES[statusType];
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
                'flex h-11 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-medium',
                'transition-all duration-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'active:scale-[0.97]',
                isSelected ? styles.selected : 'bg-muted/30 text-foreground/70 border-border hover:bg-muted/50'
              )}
            >
              {isSelected && <Check className="h-3 w-3 shrink-0" />}
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  // Select mode for 3+ options
  const selectedStatusType = value ? getOptionStatusType(value) : null;
  const selectedStyles = selectedStatusType ? STATUS_STYLES[selectedStatusType] : null;

  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => {
          hapticTap();
          const val = e.target.value;
          onChange(val === '' ? null : val);
        }}
        className={cn(
          'h-12 w-full appearance-none rounded-lg border text-sm font-medium',
          'transition-all duration-100',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          value && selectedStyles
            ? cn(selectedStyles.selected, 'pl-8 pr-10')
            : 'border-border bg-white text-muted-foreground px-4 pr-10'
        )}
        aria-label="Selecione uma opção"
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {/* Custom chevron */}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      {/* Status dot indicator when selected */}
      {value && selectedStyles && (
        <span className={cn(
          'pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full',
          selectedStyles.dot
        )} />
      )}
    </div>
  );
}
