# Vobi Checklist — Redesign V4: Ajustes Finais de UX

> **IMPORTANTE — Antes de começar:**
> ```bash
> find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"
> npm run typecheck 2>&1 | head -5
> ```
> Se algum arquivo estiver truncado (último caractere cortado), verificar com `wc -l` e restaurar do git se necessário.

---

## Prompt V4-1 — Tab "Atrasadas" + Reportar Impedimento + Logo da Loja

```
Você é um senior frontend developer com expertise em UX mobile-first para apps B2B de campo.

## Contexto
O Vobi Checklist é um PWA para técnicos de HVAC. A tela de Ordens de Serviço precisa de 3 melhorias:

1. Nova tab "Atrasadas" para separar OS que deveriam ter sido feitas mas não foram
2. Mecanismo para o técnico reportar impedimentos que o impeçam de realizar um serviço
3. Um avatar/logo da loja ao lado do nome no card para facilitar identificação visual

## Arquivos a modificar

### 1. `src/components/service-orders/ServiceOrderList.tsx`

**A) Adicionar tab "Atrasadas":**

Alterar o tipo e array de filtros:

```typescript
type FilterKey = 'pending' | 'overdue' | 'completed' | 'all';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'pending', label: 'Pendentes' },
  { key: 'overdue', label: 'Atrasadas' },
  { key: 'completed', label: 'Concluídas' },
  { key: 'all', label: 'Todas' },
];
```

Alterar a função `filterOrders`:

```typescript
function filterOrders(orders: ServiceOrderRecord[], filter: FilterKey): ServiceOrderRecord[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'pending':
      // Pendentes: status pending/in_progress E data >= hoje (não atrasadas)
      return orders.filter((o) => {
        if (o.status === 'completed') return false;
        const dateStart = new Date(new Date(o.scheduledDate).getFullYear(), new Date(o.scheduledDate).getMonth(), new Date(o.scheduledDate).getDate());
        return dateStart.getTime() >= todayStart.getTime();
      });
    case 'overdue':
      // Atrasadas: status pending/in_progress E data < hoje
      return orders.filter((o) => {
        if (o.status === 'completed') return false;
        const dateStart = new Date(new Date(o.scheduledDate).getFullYear(), new Date(o.scheduledDate).getMonth(), new Date(o.scheduledDate).getDate());
        return dateStart.getTime() < todayStart.getTime();
      });
    case 'completed':
      return orders.filter((o) => o.status === 'completed');
    case 'all':
    default:
      return orders;
  }
}
```

**B) Estilizar a tab "Atrasadas" com destaque vermelho quando tem itens:**

Na renderização dos filter pills, a tab "Atrasadas" deve ter estilo especial quando ativa E quando tem count > 0:

```tsx
<button
  key={f.key}
  onClick={() => setActiveFilter(f.key)}
  className={cn(
    'flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors',
    activeFilter === f.key
      ? f.key === 'overdue'
        ? 'bg-red-500 text-white'      // Tab atrasadas ativa = vermelho
        : 'bg-primary text-white'       // Outras tabs ativas = azul
      : 'bg-muted text-muted-foreground hover:bg-muted/80'
  )}
>
  {f.label}
  {f.count > 0 && (
    <span className={cn(
      'inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold',
      activeFilter === f.key
        ? 'bg-white/20 text-white'
        : f.key === 'overdue'
          ? 'bg-red-100 text-red-600'  // Badge vermelho quando inativa mas tem atrasadas
          : 'bg-muted-foreground/10 text-muted-foreground'
    )}>
      {f.count}
    </span>
  )}
</button>
```

Calcular counts para cada filtro:
```typescript
const overdueCount = orders.filter(o => {
  if (o.status === 'completed') return false;
  const dateStart = new Date(new Date(o.scheduledDate).getFullYear(), new Date(o.scheduledDate).getMonth(), new Date(o.scheduledDate).getDate());
  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  return dateStart.getTime() < todayStart.getTime();
}).length;

const pendingCount = orders.filter(o => {
  if (o.status === 'completed') return false;
  const dateStart = new Date(new Date(o.scheduledDate).getFullYear(), new Date(o.scheduledDate).getMonth(), new Date(o.scheduledDate).getDate());
  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  return dateStart.getTime() >= todayStart.getTime();
}).length;

const completedCount = orders.filter(o => o.status === 'completed').length;

const filterCounts: Record<FilterKey, number> = {
  pending: pendingCount,
  overdue: overdueCount,
  completed: completedCount,
  all: orders.length,
};
```

**C) Para o empty state de "Atrasadas" quando não há nenhuma:**
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Check className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />
  <p className="mt-4 text-sm font-medium text-emerald-600">Tudo em dia!</p>
  <p className="mt-1 text-xs text-muted-foreground">Nenhuma OS atrasada</p>
</div>
```

### 2. `src/components/service-orders/ServiceOrderCard.tsx`

**A) Adicionar avatar/logo da loja:**

Usar a primeira letra do nome da loja como avatar (fallback sem imagem real — no MVP não temos logos). Usar um background com cor gerada a partir do nome para diferenciação visual:

```typescript
// Gera uma cor de background consistente baseada no nome da loja
function getStoreColor(name: string): string {
  const colors = [
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getStoreInitials(name: string): string {
  // Remove prefixos comuns
  const cleaned = name.replace(/^(Loja|Lojas)\s+/i, '');
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}
```

No JSX do card, adicionar o avatar na Row 1, antes do nome:

```tsx
{/* Row 1: Avatar + Store name + Service type badge */}
<div className="flex items-center gap-3">
  {/* Store avatar */}
  <div className={cn(
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
    getStoreColor(order.storeName)
  )}>
    {getStoreInitials(order.storeName)}
  </div>

  <div className="min-w-0 flex-1">
    <div className="flex items-center justify-between gap-2">
      <h3 className="min-w-0 truncate text-[15px] font-semibold text-foreground">
        {order.storeName}
      </h3>
      <span className={cn(
        'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold',
        SERVICE_TYPE_STYLES[order.serviceType]
      )}>
        {SERVICE_TYPE_LABELS[order.serviceType]}
      </span>
    </div>

    {/* Row 2: Shopping · Date */}
    <p className="mt-0.5 text-[13px] text-muted-foreground">
      {order.shoppingName}
      <span className="mx-1">·</span>
      <span className={overdue ? 'font-medium text-red-500' : ''}>
        {formatRelativeDate(order.scheduledDate)}
      </span>
    </p>
  </div>
</div>
```

O restante do card (equipment, status row, action button) continua abaixo sem avatar.

**B) Adicionar botão "Reportar Impedimento" nos cards de OS atrasadas:**

Quando a OS está atrasada (overdue), mostrar um botão secundário abaixo do botão principal:

```tsx
{/* Action row */}
<div className="mt-3 flex items-center justify-between">
  {/* Status */}
  <span className={cn('inline-flex items-center gap-1 text-xs font-medium', statusCfg.text)}>
    <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
    {statusCfg.label}
  </span>

  {/* Actions */}
  <div className="flex items-center gap-2">
    {/* Report impediment — apenas para OS não concluídas e atrasadas */}
    {!isCompleted && overdue && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReportIssue?.(order);
        }}
        className="flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-100"
        aria-label="Reportar impedimento"
      >
        <AlertTriangle className="h-3 w-3" />
        Impedimento
      </button>
    )}

    {/* Main action */}
    {!isCompleted ? (
      <span className={cn(...)}>
        {hasChecklist ? 'Continuar' : 'Iniciar'}
      </span>
    ) : (
      <span className="...">
        <Check className="h-3 w-3" /> Concluído
      </span>
    )}
  </div>
</div>
```

Adicionar `onReportIssue` como prop opcional:

```typescript
interface ServiceOrderCardProps {
  order: ServiceOrderRecord;
  onStart: (order: ServiceOrderRecord) => void;
  onReportIssue?: (order: ServiceOrderRecord) => void;
}
```

Import: `AlertTriangle` de lucide-react.

### 3. Modal/Sheet de Reportar Impedimento

Criar um componente simples de modal ou inline expandable. Para o MVP, um bottom sheet simplificado:

Criar `src/components/service-orders/ReportIssueSheet.tsx`:

```tsx
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
    {/* Overlay */}
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      {/* Sheet */}
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
```

Adicionar animação `slideUp` no globals.css:
```css
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slideUp { animation: slideUp 0.3s ease-out both; }
```

### 4. Integrar no `ServiceOrderList.tsx`

Adicionar state para o sheet:

```typescript
const [reportingOrder, setReportingOrder] = useState<ServiceOrderRecord | null>(null);
```

Passar `onReportIssue` para o card:

```tsx
<ServiceOrderCard
  key={order.id}
  order={order}
  onStart={onSelectOrder}
  onReportIssue={(o) => setReportingOrder(o)}
/>
```

Renderizar o sheet:

```tsx
{reportingOrder && (
  <ReportIssueSheet
    order={reportingOrder}
    onClose={() => setReportingOrder(null)}
    onSubmit={(order, reason, details) => {
      // TODO: salvar no Dexie e sync queue para enviar ao Supabase
      console.log('Issue reported:', { orderId: order.id, reason, details });
      setReportingOrder(null);
    }}
  />
)}
```

### 5. Mock data: adicionar OS atrasada no `src/lib/demo/mock-data.ts`

Adicionar (se não existir) uma OS com data anterior a hoje e status 'pending':

```typescript
{
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
  companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  technicianId: '11111111-1111-1111-1111-111111111111',
  status: 'pending',
  scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 dias atrás
  storeName: 'C&A',
  storeContact: 'manutencao@cea.com.br',
  shoppingName: 'Shopping Aricanduva',
  equipmentModel: 'VRF Midea V6',
  equipmentCapacity: '72.000 BTU',
  equipmentLocation: 'Cobertura, acesso pela escada de serviço',
  serviceCategory: 'hvac',
  serviceType: 'corrective',
  notes: 'Urgente: reclamação do lojista sobre temperatura. Deveria ter sido feito anteontem.',
  createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
},
```
```

---

## Prompt V4-2 — Stepper Real no Checklist (Substituir Pills por Stepper Linear)

```
Você é um senior frontend developer com expertise em steppers e progress indicators mobile.

## Problema
O stepper atual no ChecklistForm parece tabs horizontais (pills scrolláveis com nomes). Isso confunde o técnico porque sugere navegação livre ao invés de um fluxo sequencial. Precisa ser um stepper linear verdadeiro que mostra:
- Onde o técnico está agora
- Quais passos já fez (completos/parciais)
- Quais passos faltam
- A direção do progresso (esquerda → direita)

## Referência visual
Pense no stepper do checkout de e-commerce: bolinhas numeradas conectadas por linhas, onde a bolinha ativa é maior/colorida e as completas têm check.

## Tarefa
Reescrever a seção do stepper no `src/components/checklist/ChecklistForm.tsx`:

### Substituir as pills pelo stepper linear:

```tsx
{/* Stepper — linear, horizontal, scrollable */}
<div className="mt-3 mb-1 overflow-x-auto">
  <div className="flex items-center px-2" style={{ minWidth: 'max-content' }}>
    {sections.map((section, index) => {
      const sectionFilled = section.items.filter(i => i.value !== null && i.value !== '').length;
      const sectionTotal = section.items.length;
      const sectionComplete = sectionFilled === sectionTotal;
      const isActive = index === activeSectionIndex;
      const hasProgress = sectionFilled > 0 && !sectionComplete;
      const isPast = index < activeSectionIndex;

      return (
        <div key={section.id} className="flex items-center">
          {/* Step node */}
          <button
            type="button"
            onClick={() => setActiveSectionIndex(index)}
            aria-label={`${section.title}: ${sectionFilled} de ${sectionTotal}`}
            className="flex flex-col items-center gap-1"
          >
            {/* Circle */}
            <div className={cn(
              'flex items-center justify-center rounded-full transition-all duration-200',
              isActive
                ? 'h-9 w-9 bg-primary text-white shadow-sm shadow-primary/25'
                : sectionComplete
                  ? 'h-7 w-7 bg-emerald-500 text-white'
                  : hasProgress
                    ? 'h-7 w-7 border-2 border-amber-400 bg-amber-50 text-amber-700'
                    : 'h-7 w-7 border-2 border-muted-foreground/20 bg-white text-muted-foreground'
            )}>
              {sectionComplete ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <span className={cn(
                  'font-semibold',
                  isActive ? 'text-xs' : 'text-[10px]'
                )}>
                  {index + 1}
                </span>
              )}
            </div>

            {/* Label below — short name */}
            <span className={cn(
              'max-w-[56px] truncate text-center text-[10px] leading-tight',
              isActive
                ? 'font-semibold text-primary'
                : sectionComplete
                  ? 'font-medium text-emerald-600'
                  : 'text-muted-foreground'
            )}>
              {getSectionShortName(section.title)}
            </span>
          </button>

          {/* Connector line — between steps, not after last */}
          {index < sections.length - 1 && (
            <div className={cn(
              'mx-1 h-0.5 w-6 rounded-full transition-colors duration-300',
              // Se o próximo step está completo ou ativo, a linha é colorida
              index < activeSectionIndex
                ? sectionComplete ? 'bg-emerald-400' : 'bg-amber-300'
                : 'bg-muted-foreground/15'
            )} />
          )}
        </div>
      );
    })}
  </div>
</div>
```

### Detalhes visuais:
- **Step ativo:** Círculo maior (36px), bg-primary, text-white, com shadow sutil — claramente o "atual"
- **Step completo:** Círculo menor (28px), bg-emerald-500, ícone Check branco
- **Step parcial:** Círculo menor (28px), border-2 amber, número dentro
- **Step futuro:** Círculo menor (28px), border-2 muted, número cinza
- **Conector:** Linha horizontal 24px (w-6) entre cada step. Cor muda baseado no progresso
- **Labels:** Abaixo de cada círculo, nome curto da seção, max-w-[56px] truncado
- **Label ativo:** text-primary font-semibold. Completo: text-emerald-600. Futuro: text-muted-foreground

### ScrollX:
Se tiver mais de 5 seções, o stepper faz scroll horizontal automaticamente. Adicionar:
```tsx
<div className="mt-3 mb-1 overflow-x-auto scrollbar-none">
```
E no CSS (globals.css), se não existir:
```css
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
```

### Remover:
- As pills antigas (rounded-full com nome + contagem)
- O texto "N itens nesta seção" abaixo do título (a contagem já está no stepper)
```

---

## Prompt V4-3 — Footer/Navbar Fixo na Parte Inferior (100% preso ao bottom)

```
Você é um senior frontend developer com expertise em layout mobile CSS.

## Problema
O footer de navegação do checklist (botões "Anterior" / "Próximo") usa `sticky bottom-0` mas em certos devices ou com teclado virtual, ele não fica 100% preso ao bottom. Precisa ser `fixed` com safe area.

## O mesmo se aplica à bottom navigation do ReportSummary.

## Tarefa
Modificar os seguintes arquivos:

### 1. `src/components/checklist/ChecklistForm.tsx`

Trocar o footer de `sticky bottom-0` para `fixed bottom-0 left-0 right-0`:

```tsx
{/* Bottom navigation — FIXED ao bottom */}
<div className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-border bg-white px-5 py-3 safe-bottom">
  <button ... >Anterior</button>
  <button ... >Próximo</button>
</div>
```

E adicionar padding-bottom no content area para compensar a altura do footer fixo:

```tsx
{/* Active section content */}
<div className="animate-fadeIn flex-1 px-5 py-4 pb-24" key={activeSectionIndex}>
```

O `pb-24` (96px) garante que o conteúdo não fica escondido atrás do footer. O footer tem ~60px de altura + safe area.

### 2. `src/components/report/ReportSummary.tsx`

Mesma mudança:

```tsx
{/* Footer actions — FIXED ao bottom */}
<div className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-border bg-white px-5 py-3 safe-bottom">
  <button ...>Voltar</button>
  <button ...>Finalizar Checklist</button>
</div>
```

E na div principal do conteúdo, adicionar `pb-24`:

```tsx
<div className="flex-1 space-y-4 px-5 py-5 pb-24">
```

### 3. `src/components/checklist/CompletionScreen.tsx`

O CTA "Voltar para Ordens de Serviço" também:

```tsx
{/* Bottom CTA — FIXED ao bottom */}
<div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-6 pt-4 safe-bottom bg-background">
  <button ...>Voltar para Ordens de Serviço</button>
</div>
```

E no content acima: `pb-24`.

### 4. Verificar o header também

O header do checklist já é `sticky top-0` o que é correto. Mas verificar que:
- `z-10` no header e `z-20` no footer (footer acima para garantir sobreposição)
- O content area tem `flex-1` e `overflow-y-auto` se necessário

### Layout final do ChecklistForm:
```
┌──────────────────────────────┐
│ HEADER (sticky top-0 z-10)   │  ← Fica no topo
├──────────────────────────────┤
│                              │
│  CONTENT (flex-1, pb-24)     │  ← Scrollable, padding bottom para footer
│                              │
│                              │
├──────────────────────────────┤
│ FOOTER (fixed bottom-0 z-20)│  ← 100% preso ao bottom
└──────────────────────────────┘
```

### Cuidado com o keyboard virtual:
Em mobile, quando o teclado virtual abre (textarea, input), o footer fixed pode subir junto. Para evitar isso, usar:
```css
/* No globals.css, na seção de touch optimizations */
@supports (height: 100dvh) {
  .fixed-bottom-safe {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
```
E adicionar `fixed-bottom-safe` como classe auxiliar.

PORÉM, o comportamento padrão do `position: fixed` em mobile moderno (iOS 15+, Android 12+) com `100dvh` já lida bem com isso. O importante é usar `dvh` no min-height do container e não `vh`.

O container já usa `min-h-[100dvh]` — verificar que está assim.
```

---

## Prompt V4-4 — Verificação Final V4

```
Você é um senior frontend developer fazendo QA.

## Antes de tudo
find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"

## Verificar

### Funcional
1. Tela de OS: 4 tabs visíveis (Pendentes, Atrasadas, Concluídas, Todas)
2. Tab "Atrasadas" mostra APENAS OS com data < hoje E status != completed
3. Tab "Atrasadas" tem badge vermelho com contagem quando inativa
4. Tab "Atrasadas" fica vermelha (bg-red-500) quando ativa
5. Card de OS: avatar com iniciais + cor baseada no nome aparece à esquerda
6. Card de OS atrasada: botão "Impedimento" vermelho aparece ao lado do "Iniciar"
7. Clicar "Impedimento" abre o sheet com motivos + textarea
8. Mock data: existe pelo menos 1 OS atrasada (scheduledDate < hoje)
9. Stepper no checklist: círculos numerados conectados por linhas (não pills/tabs)
10. Stepper: step ativo é maior (36px) e azul, completo é verde com check, parcial tem border amber
11. Stepper: labels abaixo dos círculos com nomes curtos
12. Footer do checklist: fixed bottom-0 (NÃO sticky), visível em qualquer tamanho de tela
13. Footer do ReportSummary: fixed bottom-0
14. Footer do CompletionScreen: fixed bottom-0
15. Content areas: pb-24 para não ficar escondido atrás do footer

### Visual
16. Avatar da loja: rounded-lg, h-10 w-10, cor consistente por nome
17. Stepper: connector lines entre steps (h-0.5 w-6)
18. Sheet de impedimento: rounded-t-2xl, animação slideUp, handle bar no topo

### Build
19. npm run typecheck — corrigir erros (exceto .test.ts pré-existentes)
20. Limpar null bytes: find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"
21. Verificar que nenhum arquivo está truncado

Corrija qualquer problema encontrado.
```
