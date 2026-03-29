'use client';

import { useEffect, useState } from 'react';
import { getPendingSyncCount } from '@/lib/db/sync';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'online' | 'offline' | 'syncing';

interface StatusConfig {
  dotClass: string;
  textClass: string;
  label: string;
}

function getStatusConfig(status: ConnectionStatus, pendingCount: number): StatusConfig {
  if (status === 'offline') {
    return {
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-600',
      label: 'Offline',
    };
  }
  if (pendingCount > 0) {
    return {
      dotClass: 'bg-primary animate-pulse',
      textClass: 'text-muted-foreground',
      label: 'Sincronizando...',
    };
  }
  return {
    dotClass: 'bg-emerald-500',
    textClass: 'text-muted-foreground',
    label: 'Sincronizado',
  };
}

export function SyncIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online'
  );
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    function handleOnline() {
      setStatus('online');
    }
    function handleOffline() {
      setStatus('offline');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    async function checkPending() {
      try {
        const count = await getPendingSyncCount();
        setPendingCount(count);
      } catch {
        // Ignore — IndexedDB may not be available during SSR
      }
    }

    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  const config = getStatusConfig(status, pendingCount);

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      <span className={cn('text-xs', config.textClass)}>
        {config.label}
      </span>
    </div>
  );
}
