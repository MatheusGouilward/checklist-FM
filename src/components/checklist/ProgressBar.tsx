'use client';

interface ProgressBarProps {
  filledCount: number;
  totalCount: number;
}

export function ProgressBar({ filledCount, totalCount }: ProgressBarProps) {
  const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;
  const isComplete = percentage === 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground">
        <span className="font-semibold text-foreground">{filledCount}</span>
        {' '}de {totalCount}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete ? 'bg-emerald-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
