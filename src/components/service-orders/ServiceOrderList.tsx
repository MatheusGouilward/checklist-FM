'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/schema';
import type { ServiceOrderRecord } from '@/lib/db/schema';
import { useAuthStore } from '@/stores/auth-store';
import { ServiceOrderCard } from './ServiceOrderCard';
import { Button } from '@/components/ui/button';
import { DEMO_MODE } from '@/lib/demo/config';
import { DEMO_SERVICE_ORDERS } from '@/lib/demo/mock-data';
import { cn } from '@/lib/utils';
import { ClipboardList, RefreshCw } from 'lucide-react';

interface ServiceOrderListProps {
  onSelectOrder: (order: ServiceOrderRecord) => void;
}

type FilterKey = 'pending' | 'completed' | 'all';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'pending', label: 'Pendentes' },
  { key: 'completed', label: 'Concluídas' },
  { key: 'all', label: 'Todas' },
];

function filterOrders(orders: ServiceOrderRecord[], filter: FilterKey): ServiceOrderRecord[] {
  if (filter === 'pending') return orders.filter((o) => o.status === 'pending' || o.status === 'in_progress');
  if (filter === 'completed') return orders.filter((o) => o.status === 'completed');
  return orders;
}

interface DateGroup {
  label: string;
  orders: ServiceOrderRecord[];
}

function groupByDate(orders: ServiceOrderRecord[]): DateGroup[] {
  const groups = new Map<string, ServiceOrderRecord[]>();

  for (const order of orders) {
    const date = new Date(order.scheduledDate);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((dateStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays === 0) label = 'Hoje';
    else if (diffDays === 1) label = 'Amanhã';
    else if (diffDays === -1) label = 'Ontem';
    else if (diffDays < -1) label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    else label = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(order);
  }

  return Array.from(groups, ([label, groupOrders]) => ({ label, orders: groupOrders }));
}

async function fetchAndCacheOrders(
  technicianId: string
): Promise<ServiceOrderRecord[]> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();

  const { data, error } = await supabase
    .from('service_orders')
    .select('*')
    .eq('technician_id', technicianId)
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const records: ServiceOrderRecord[] = data.map((row) => ({
    id: row.id,
    companyId: row.company_id,
    technicianId: row.technician_id,
    status: row.status,
    scheduledDate: row.scheduled_date,
    storeName: row.store_name,
    storeContact: row.store_contact ?? undefined,
    shoppingName: row.shopping_name,
    equipmentModel: row.equipment_model,
    equipmentCapacity: row.equipment_capacity,
    equipmentLocation: row.equipment_location ?? undefined,
    serviceCategory: row.service_category,
    serviceType: row.service_type,
    notes: row.notes ?? undefined,
    checklistId: row.checklist_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  await db.serviceOrders.bulkPut(records);

  return records;
}

async function loadFromDexie(
  technicianId: string
): Promise<ServiceOrderRecord[]> {
  return db.serviceOrders
    .where('technicianId')
    .equals(technicianId)
    .sortBy('scheduledDate');
}

function DateGroupedList({ orders, onSelectOrder }: { orders: ServiceOrderRecord[]; onSelectOrder: (o: ServiceOrderRecord) => void }) {
  const groups = groupByDate(orders);

  return (
    <div>
      {groups.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 py-3">
            <span className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              group.label === 'Hoje' ? 'text-primary' : 'text-muted-foreground/60'
            )}>
              {group.label}
            </span>
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs tabular-nums text-muted-foreground/40">
              {group.orders.length}
            </span>
          </div>
          <div className="space-y-3">
            {group.orders.map((order) => (
              <ServiceOrderCard key={order.id} order={order} onStart={onSelectOrder} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ServiceOrderList({ onSelectOrder }: ServiceOrderListProps) {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<ServiceOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('pending');

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        if (DEMO_MODE) {
          await new Promise((r) => setTimeout(r, 300));
          if (!cancelled) setOrders(DEMO_SERVICE_ORDERS);
          if (!cancelled) setIsLoading(false);
          return;
        }

        if (navigator.onLine) {
          const fetched = await fetchAndCacheOrders(user!.id);
          if (!cancelled) setOrders(fetched);
        } else {
          const cached = await loadFromDexie(user!.id);
          if (!cancelled) setOrders(cached);
        }
      } catch {
        try {
          const cached = await loadFromDexie(user!.id);
          if (!cancelled) setOrders(cached);
        } catch {
          if (!cancelled) setError('Erro ao carregar ordens de serviço.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, retryCount]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">{error}</p>
        <p className="mt-1 text-sm text-red-600/70">
          Verifique sua conexão e tente novamente.
        </p>
        <Button
          variant="outline"
          onClick={() => setRetryCount((c) => c + 1)}
          className="mt-4 w-full rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'in_progress').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const filtered = filterOrders(orders, activeFilter);

  const filterCounts: Record<FilterKey, number> = {
    pending: pendingCount,
    completed: completedCount,
    all: orders.length,
  };

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              'h-8 rounded-full px-3.5 text-xs font-medium transition-colors',
              activeFilter === f.key
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f.label}
            {filterCounts[f.key] > 0 && (
              <span className={cn(
                'ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold',
                activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-muted-foreground/10 text-muted-foreground'
              )}>
                {filterCounts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-muted-foreground">
            {activeFilter === 'completed' ? 'Nenhuma OS concluída' : 'Nenhuma OS pendente'}
          </p>
        </div>
      ) : activeFilter === 'all' ? (
        <div>
          {/* Pending grouped by date */}
          {pendingCount > 0 && (
            <DateGroupedList
              orders={orders.filter((o) => o.status === 'pending' || o.status === 'in_progress')}
              onSelectOrder={onSelectOrder}
            />
          )}
          {/* Completed section */}
          {completedCount > 0 && (
            <>
              <div className="flex items-center gap-3 py-3 mt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Concluídas
                </span>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs tabular-nums text-muted-foreground/40">{completedCount}</span>
              </div>
              <div className="space-y-3">
                {orders
                  .filter((o) => o.status === 'completed')
                  .map((order) => (
                    <ServiceOrderCard key={order.id} order={order} onStart={onSelectOrder} />
                  ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <DateGroupedList orders={filtered} onSelectOrder={onSelectOrder} />
      )}
    </div>
  );
}
