# Vobi Checklist — Redesign V5: Logos Reais no Avatar das Lojas

> **IMPORTANTE — Antes de começar:**
> ```bash
> find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"
> npm run typecheck 2>&1 | head -5
> ```
> Verificar se os arquivos `ServiceOrderCard.tsx` e `mock-data.ts` não estão truncados.
> Se estiverem, restaurar a parte faltante antes de prosseguir.

---

## Prompt V5-1 — Logos Reais das Lojas nos Cards de OS

```
Você é um senior frontend developer com expertise em UX mobile-first.

## Contexto
O Vobi Checklist é um PWA para técnicos de HVAC. Os cards de Ordem de Serviço atualmente usam avatares com iniciais (letras) e cores geradas por hash. Precisamos substituir por logos reais das marcas.

Os logos já foram baixados e estão em `public/logos/`:
- `renner.png` (128x128, quadrado)
- `starbucks.png` (128x128, quadrado)
- `americanas.png` (128x20, retangular/wide — precisa de tratamento especial)
- `natura.png` (128x128, quadrado)
- `cea.png` (128x128, quadrado)

## Arquivos a modificar

### 1. `src/lib/demo/mock-data.ts`

**IMPORTANTE:** Este arquivo pode estar truncado (cortado no meio do 3º ou 4º objeto). Verifique com `wc -l` e restaure se necessário. O arquivo COMPLETO deve ter 5 ordens de serviço.

O arquivo deve conter exatamente este conteúdo completo:

```typescript
import type { AuthUser } from '@/stores/auth-store';
import type { ServiceOrderRecord } from '@/lib/db/schema';

/**
 * Mock user for demo mode — bypasses Supabase Auth entirely.
 */
export const DEMO_USER: AuthUser = {
  id: '11111111-1111-1111-1111-111111111111',
  fullName: 'Carlos Silva',
  companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  role: 'technician',
};

/**
 * Store logo mapping — maps store names to their logo paths in /public/logos/.
 * Used by ServiceOrderCard to show real brand logos instead of initials.
 * In production, this would come from the service_orders or stores table.
 */
export const STORE_LOGOS: Record<string, string> = {
  'Loja Renner': '/logos/renner.png',
  'Starbucks': '/logos/starbucks.png',
  'Lojas Americanas': '/logos/americanas.png',
  'Natura': '/logos/natura.png',
  'C&A': '/logos/cea.png',
};

/**
 * Mock service orders — pre-filled by the "gestor", ready for the technician.
 */
export const DEMO_SERVICE_ORDERS: ServiceOrderRecord[] = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    scheduledDate: new Date().toISOString().split('T')[0],
    storeName: 'Loja Renner',
    storeContact: 'gerente@renner.com.br',
    shoppingName: 'Shopping Center Norte',
    equipmentModel: 'Split Inverter Samsung AR24',
    equipmentCapacity: '36.000 BTU',
    equipmentLocation: 'Teto da loja, acesso pela escada do corredor de serviço',
    serviceCategory: 'hvac',
    serviceType: 'preventive',
    notes: 'Revisão semestral PMOC. Filtros foram trocados na última visita (setembro).',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    storeName: 'Starbucks',
    shoppingName: 'Shopping Iguatemi',
    equipmentModel: 'Multi-Split LG Multi V 5',
    equipmentCapacity: '48.000 BTU',
    equipmentLocation: 'Casa de máquinas no 3º subsolo, box 12',
    serviceCategory: 'hvac',
    serviceType: 'corrective',
    notes: 'Lojista relatou que ar não está gelando. Última manutenção há 4 meses.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    storeName: 'Lojas Americanas',
    storeContact: 'manutencao@americanas.com',
    shoppingName: 'Shopping Morumbi',
    equipmentModel: 'Cassete Daikin FXFQ60P',
    equipmentCapacity: '60.000 BTU',
    equipmentLocation: 'Forro da área de vendas, 4 unidades evaporadoras',
    serviceCategory: 'hvac',
    serviceType: 'preventive',
    notes: 'Primeira revisão após instalação. Verificar todos os pontos do PMOC.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    storeName: 'Natura',
    storeContact: 'loja.natura@shopping.com.br',
    shoppingName: 'Shopping Center Norte',
    equipmentModel: 'Split Piso-Teto Carrier 40MBC',
    equipmentCapacity: '48.000 BTU',
    serviceCategory: 'hvac',
    serviceType: 'preventive',
    checklistId: 'cccccccc-cccc-cccc-cccc-cccccccccc01',
    notes: 'Manutenção preventiva semestral concluída.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb05',
    companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    technicianId: '11111111-1111-1111-1111-111111111111',
    status: 'pending',
    scheduledDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    storeName: 'C&A',
    storeContact: 'manutencao@cea.com.br',
    shoppingName: 'Shopping Iguatemi',
    equipmentModel: 'VRF Midea V8 Series',
    equipmentCapacity: '80.000 BTU',
    equipmentLocation: 'Rooftop, acesso pela escada de emergência',
    serviceCategory: 'hvac',
    serviceType: 'corrective',
    notes: 'URGENTE: Sistema desligou sozinho 2x na última semana. Verificar placa eletrônica.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];
```

### 2. `src/components/service-orders/ServiceOrderCard.tsx`

**IMPORTANTE:** Este arquivo pode estar truncado. Verifique e restaure completamente antes de modificar.

**A) Importar o mapa de logos e o componente Image:**

No topo do arquivo, adicionar:

```typescript
import Image from 'next/image';
import { STORE_LOGOS } from '@/lib/demo/mock-data';
```

**B) Manter as funções `getStoreColor` e `getStoreInitials` como fallback.**

Se elas já existem (do V4), manter. Se não existem, adicionar:

```typescript
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
  const cleaned = name.replace(/^(Loja|Lojas)\s+/i, '');
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}
```

**C) Substituir o avatar de iniciais por um avatar com logo real + fallback:**

O avatar no card deve primeiro tentar renderizar o logo real da loja. Se não houver logo mapeado, usar as iniciais como fallback.

Na Row 1 do card (onde fica o avatar), usar esta lógica:

```tsx
{/* Store avatar with real logo or initials fallback */}
{(() => {
  const logoUrl = STORE_LOGOS[order.storeName];
  if (logoUrl) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white border border-border">
        <Image
          src={logoUrl}
          alt={order.storeName}
          width={32}
          height={32}
          className="object-contain"
          unoptimized
        />
      </div>
    );
  }
  // Fallback: initials with colored background
  return (
    <div className={cn(
      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
      getStoreColor(order.storeName)
    )}>
      {getStoreInitials(order.storeName)}
    </div>
  );
})()}
```

**Notas importantes sobre o avatar:**
- O container é `h-10 w-10` (40x40px) com `rounded-lg` e `overflow-hidden`
- O logo usa `object-contain` para caber sem distorcer — crítico para o logo da Americanas que é retangular (128x20)
- Background branco (`bg-white`) com borda sutil (`border border-border`) para logos que não são quadrados
- `unoptimized` no Image porque são arquivos locais estáticos pequenos
- O fallback com iniciais mantém a experiência funcional para lojas sem logo mapeado

**D) Arquivo completo esperado:**

O `ServiceOrderCard.tsx` final deve ter esta estrutura (assegurar que TODAS as rows e o footer existem):

```tsx
'use client';

import type { ServiceOrderRecord } from '@/lib/db/schema';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { STORE_LOGOS } from '@/lib/demo/mock-data';

// ... SERVICE_TYPE_LABELS, SERVICE_TYPE_STYLES, formatRelativeDate, isOverdue, STATUS_CONFIG ...
// ... getStoreColor, getStoreInitials ...

export function ServiceOrderCard({ order, onStart }: ServiceOrderCardProps) {
  // ... existing logic ...

  return (
    <div className={cn('rounded-xl border border-border bg-white p-4 ...', ...)}>
      <button type="button" onClick={() => onStart(order)} className="w-full text-left" disabled={isCompleted}>

        {/* Row 1: Avatar + Store name + Service type badge */}
        <div className="flex items-center gap-3">
          {/* Logo avatar — see section C above */}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="min-w-0 truncate text-[15px] font-semibold text-foreground">
                {order.storeName}
              </h3>
              <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold', SERVICE_TYPE_STYLES[order.serviceType])}>
                {SERVICE_TYPE_LABELS[order.serviceType]}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Shopping · Date */}
        <p className="mt-1.5 pl-[52px] text-[13px] text-muted-foreground">
          {order.shoppingName}
          <span className="mx-1">·</span>
          <span className={overdue ? 'font-medium text-red-500' : ''}>
            {formatRelativeDate(order.scheduledDate)}
          </span>
        </p>

        {/* Row 3: Equipment */}
        {hasEquipmentInfo && (
          <p className="mt-0.5 pl-[52px] truncate text-xs text-muted-foreground/60">
            {order.equipmentModel}
            {order.equipmentCapacity && order.equipmentCapacity !== 'Não informado' && (
              <> · {order.equipmentCapacity}</>
            )}
          </p>
        )}

        {/* Row 4: Status + Action */}
        <div className="mt-3 flex items-center justify-between pl-[52px]">
          <div className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', statusCfg.dot)} />
            <span className={cn('text-xs font-medium', statusCfg.text)}>
              {statusCfg.label}
            </span>
          </div>
          {!isCompleted && (
            <span className="text-xs font-medium text-primary">
              {hasChecklist ? 'Continuar' : 'Iniciar'} →
            </span>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1 text-emerald-600">
              <Check className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Concluído</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
```

**Observe o `pl-[52px]`** nas rows 2, 3 e 4 — isso alinha o texto abaixo do nome da loja (40px avatar + 12px gap = 52px), mantendo a indentação visual consistente com o avatar.

## Verificação final

```bash
find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"
npm run typecheck 2>&1
npm run lint 2>&1
npm run build 2>&1 | tail -20
```

Verificar que:
1. ✅ Os 5 cards aparecem na lista de OS (Renner, Starbucks, Americanas, Natura, C&A)
2. ✅ Cada card mostra o logo real da marca (não iniciais)
3. ✅ O logo da Americanas (retangular) aparece sem distorção
4. ✅ Natura aparece como "Concluído" e C&A como "Atrasada" (data no passado)
5. ✅ Se adicionar uma loja sem logo mapeado, o fallback de iniciais coloridas funciona
```
