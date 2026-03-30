'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/schema';
import type { ServiceOrderRecord } from '@/lib/db/schema';
import { useAuthStore } from '@/stores/auth-store';
import { ServiceOrderCard } from './ServiceOrderCard';
import { ReportIssueSheet } from './ReportIssueSheet';
import { DEMO_MODE } from '@/lib/demo/config';
import { DEMO_SERVICE_ORDERS } from '@/lib/demo/mock-data';
import { cn } from '@/lib/utils';
import { Check, ClipboardList, RefreshCw } from 'lucide-react';

interface ServiceOrderListProps {
  onSelectOrder: (order: ServiceOrderRecord) => void;
}

type FilterKey = 'pending' | 'overdue' | 'completed' | 'all';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'pending', label: 'Pendentes' },
  { key: 'overdue', label: 'Atrasadas' },
  { key: 'completed', label: 'Concluídas' },
  { key: 'all', label: 'Todas' },
];

function isDateBeforeToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return dateStart.getTime() < todayStart.getTime();
}

function filterOrders(orders: ServiceOrderRecord[], filter: FilterKey): ServiceOrderRecord[] {
  switch (filter) {
    case 'pending':
      return orders.filter((o) => {
        if (o.status === 'completed') return false;
        return !isDateBeforeToday(o.scheduledDate);
      });
    case 'overdue':
      return orders.filter((o) => {
        if (o.status === 'completed') return false;
        return isDateBeforeToday(o.scheduledDate);
      });
    case 'completed':
      return orders.filter((o) => o.status === 'completed');
    case 'all':
    default:
      return orders;
  }
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

function DateGroupedList({
  orders,
  onSelectOrder,
  onReportIssue,
}: {
  orders: ServiceOrderRecord[];
  onSelectOrder: (o: ServiceOrderRecord) => void;
  onReportIssue?: (o: ServiceOrderRecord) => void;
}) {
  const groups = groupByDate(orders);

  return (
    <div>
      {groups.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {group.orders.map((order) => (
              <ServiceOrderCard
                key={order.id}
                order={order}
                onStart={onSelectOrder}
                onReportIssue={onReportIssue}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ServiceOrderList({ onSelectOrder }: ServiceOrderListProps) {
  const [orders, setOrders] = useState<ServiceOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('pending');
  const [reportOrder, setReportOrder] = useState<ServiceOrderRecord | null>(null);
  const user = useAuthStore((s) => s.user);

  async function loadOrders() {
    if (!user) return;

    if (DEMO_MODE) {
      setOrders(DEMO_SERVICE_ORDERS);
      setLoading(false);
      return;
    }

    try {
      const cached = await loadFromDexie(user.id);
      if (cached.length > 0) {
        setOrders(cached);
        setLoading(false);
      }

      if (navigator.onLine) {
        const fresh = await fetchAndCacheOrders(user.id);
        if (fresh.length > 0) setOrders(fresh);
      }
    } catch {
      const cached = await loadFromDexie(user.id);
      if (cached.length > 0) setOrders(cached);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleRefresh() {
    if (!user || refreshing) return;
    setRefreshing(true);
    try {
      if (DEMO_MODE) {
        setOrders(DEMO_SERVICE_ORDERS);
      } else if (navigator.onLine) {
        const fresh = await fetchAndCacheOrders(user.id);
        if (fresh.length > 0) setOrders(fresh);
      }
    } finally {
      setRefreshing(false);
    }
  }

  function handleReportIssue(order: ServiceOrderRecord, reason: string, details: string) {
    // In a real app, this would send to the API
    console.log('Issue reported:', { orderId: order.id, reason, details });
    setReportOrder(null);
  }

  // Calculate filter counts
  const overdueCount = orders.filter((o) => {
    if (o.status === 'completed') return false;
    return isDateBeforeToday(o.scheduledDate);
  }).length;

  const pendingCount = orders.filter((o) => {
    if (o.status === 'completed') return false;
    return !isDateBeforeToday(o.scheduledDate);
  }).length;

  const completedCount = orders.filter((o) => o.status === 'completed').length;

  const filterCounts: Record<FilterKey, number> = {
    pending: pendingCount,
    overdue: overdueCount,
    completed: completedCount,
    all: orders.length,
  };

  const filtered = filterOrders(orders, activeFilter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">Carregando ordens de serviço...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Fixed header + tabs */}
      <div className="shrink-0 bg-background px-5 pt-5">
        {/* Header with refresh */}
        <div className="flex items-center justify-between px-1 pb-3">
          <h2 className="text-lg font-bold text-foreground">Ordens de Serviço</h2>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </button>
        </div>

        {/* Filter tabs — horizontally scrollable, bleeds past parent padding */}
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors',
                activeFilter === f.key
                  ? f.key === 'overdue'
                    ? 'bg-red-500 text-white'
                    : 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {f.label}
              {filterCounts[f.key] > 0 && (
                <span className={cn(
                  'inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold',
                  activeFilter === f.key
                    ? 'bg-white/20 text-white'
                    : f.key === 'overdue'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-muted-foreground/10 text-muted-foreground'
                )}>
                  {filterCounts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-5 pb-5" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Empty states */}
        {filtered.length === 0 && activeFilter === 'overdue' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Check className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium text-emerald-600">Tudo em dia!</p>
            <p className="mt-1 text-xs text-muted-foreground">Nenhuma OS atrasada</p>
          </div>
        )}

        {filtered.length === 0 && activeFilter === 'completed' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium text-muted-foreground">Nenhuma OS concluída</p>
            <p className="mt-1 text-xs text-muted-foreground">As OS finalizadas aparecerão aqui</p>
          </div>
        )}

        {filtered.length === 0 && activeFilter === 'pending' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Check className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium text-emerald-600">Nenhuma OS pendente</p>
            <p className="mt-1 text-xs text-muted-foreground">Você está com a agenda limpa</p>
          </div>
        )}

        {filtered.length === 0 && activeFilter === 'all' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="mt-4 text-sm font-medium text-muted-foreground">Nenhuma ordem de serviço</p>
            <p className="mt-1 text-xs text-muted-foreground">Suas OS aparecerão aqui quando forem atribuídas</p>
          </div>
        )}

        {/* Grouped list */}
        {filtered.length > 0 && (
          <DateGroupedList
            orders={filtered}
            onSelectOrder={onSelectOrder}
            onReportIssue={(o) => setReportOrder(o)}
          />
        )}
      </div>

      {/* Report Issue Sheet */}
      {reportOrder && (
        <ReportIssueSheet
          order={reportOrder}
          onClose={() => setReportOrder(null)}
          onSubmit={handleReportIssue}
        />
      )}
    </div>
  );
}
