# Vobi Checklist — Redesign V3: Refinamentos Finais

> **IMPORTANTE — Antes de começar qualquer prompt:**
> Todos os arquivos .ts e .tsx do projeto contêm null bytes (\x00) no final que corrompem o TypeScript.
> ANTES de executar qualquer prompt, rode este comando:
> ```bash
> find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"
> ```
> Depois verifique se o `ServiceOrderList.tsx` não está truncado (deve ter ~200 linhas).
> Se estiver truncado, verifique o git diff e restaure o trecho faltante.

---

## Prompt V3-0 — Correção de arquivos corrompidos

```
ANTES DE QUALQUER OUTRA COISA, execute:

1. Limpar null bytes de todos os arquivos TypeScript:
   find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"

2. Verificar se ServiceOrderList.tsx está completo:
   - Deve ter as filter pills (Pendentes, Concluídas, Todas)
   - Deve ter as funções filterOrders, fetchAndCacheOrders, loadFromDexie
   - Deve ter contagem de pendingCount e completedCount para os badges dos filtros
   - Deve ter a renderização da lista filtrada com os cards
   - Se o arquivo estiver truncado (termina abruptamente), restaure-o baseado no contexto existente

3. Rodar `npm run typecheck` e corrigir qualquer erro (exceto os pré-existentes em .test.ts)

4. Só depois de tudo limpo, prossiga para os prompts V3-1 a V3-5.
```

---

## Prompt V3-1 — Separação por data na lista de OS

```
Você é um senior frontend developer com expertise em listas mobile-first.

## Contexto
A lista de Ordens de Serviço do Vobi Checklist precisa agrupar os cards por data com separadores visuais. O técnico abre o app de manhã e quer ver: "O que eu faço HOJE?" de forma imediata.

## Tarefa
Modificar `src/components/service-orders/ServiceOrderList.tsx`:

### Agrupar OS por data relativa
Após filtrar as OS, agrupá-las por cluster de data:

```typescript
interface DateGroup {
  label: string;       // "Hoje", "Amanhã", "30 Mar", "Concluídas recentes"
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

  return Array.from(groups, ([label, orders]) => ({ label, orders }));
}
```

### UI do separador de data
```tsx
{dateGroups.map((group) => (
  <div key={group.label}>
    {/* Date separator */}
    <div className="flex items-center gap-3 py-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
        {group.label}
      </span>
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs tabular-nums text-muted-foreground/40">
        {group.orders.length}
      </span>
    </div>

    {/* Cards */}
    <div className="space-y-3">
      {group.orders.map((order) => (
        <ServiceOrderCard key={order.id} order={order} onStart={onSelectOrder} />
      ))}
    </div>
  </div>
))}
```

### Detalhe para "Hoje"
Quando o grupo é "Hoje", destacar sutilmente:
```tsx
<span className={cn(
  'text-xs font-semibold uppercase tracking-wider',
  group.label === 'Hoje' ? 'text-primary' : 'text-muted-foreground/60'
)}>
  {group.label}
</span>
```

### Manter os filter pills
Os filtros (Pendentes / Concluídas / Todas) continuam acima. O agrupamento por data se aplica DENTRO do filtro ativo.

### Se "Concluídas" ativo
Agrupar por data da conclusão (ou da scheduledDate). O separador pode ser "Ontem", "Semana passada", etc.

### Se "Todas" ativo
Mostrar pendentes primeiro (agrupados por data), depois separador "Concluídas" com as OS concluídas abaixo.
```

---

## Prompt V3-2 — Checklist Items: Select Dropdown + Botão Foto Expandido + Stepper Melhor

```
Você é um senior frontend developer com expertise em UX de formulários mobile para técnicos de campo.

## Contexto
O checklist HVAC do Vobi tem itens com opções como "OK", "Necessita Troca", "Substituído". Atualmente usa grid de botões, mas:
- Textos longos ("Necessita Limpeza", "Vazamento Detectado", "Recarga Realizada") quebram feio em grid-cols-3
- Com 3 opções em grid-cols-3 cada botão fica muito estreito
- Com 2 opções o grid-cols-2 funciona mas é genérico

## Decisão de design
Trocar de grid de botões para um SELECT NATIVO estilizado quando as opções tiverem texto longo, e manter botões quando as opções são curtas e binárias.

## Regra para decidir automaticamente:
- Se tem 2 opções E ambas têm ≤ 5 caracteres → Botões lado a lado (ex: "OK" / "Falha")
- Se tem 2 opções E pelo menos uma > 5 chars → Botões lado a lado mas full-width cada
- Se tem 3+ opções → Select dropdown SEMPRE

## Tarefa

### 1. Modificar `src/components/checklist/StatusSelector.tsx`

Redesign completo com 2 modos: botões ou select.

```tsx
'use client';

import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

interface StatusSelectorProps {
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;  // null = desselecionou
}

// Decide se usa botões ou select baseado nas opções
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
                onChange(isSelected ? null : option);  // toggle: desseleção
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

  // Select mode para 3+ opções
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
          'h-12 w-full appearance-none rounded-lg border px-4 pr-10 text-sm font-medium',
          'transition-all duration-100',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          value && selectedStyles
            ? selectedStyles.selected
            : 'border-border bg-white text-muted-foreground'
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
          'absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full',
          selectedStyles.dot
        )} />
      )}
    </div>
  );
}
```

NOTA: Quando o select tem valor, o `pl-8` é necessário para dar espaço ao status dot. Ajustar:
- Sem valor selecionado: `px-4`
- Com valor selecionado: `pl-8 pr-10`

### 2. Modificar `src/components/checklist/ChecklistItem.tsx` — Botão Foto expandido

O botão de foto atual é pequeno e discreto. Para o técnico de campo, tirar foto é uma ação importante (evidência). O botão deve ser full-width dentro do item.

Trocar a actions row atual por:

```tsx
{/* Action buttons — stacked full-width */}
<div className="mt-3 space-y-2">
  {/* Photo button — FULL WIDTH, destaque visual */}
  <PhotoCapture
    checklistId={checklistId}
    itemId={item.id}
    photos={item.photos}
    onPhotoAdded={onPhotoAdded}
    onPhotoRemoved={onPhotoRemoved}
  />

  {/* Note button — secondary, inline */}
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
```

### 3. Modificar `src/components/checklist/PhotoCapture.tsx` — Layout full-width

```tsx
return (
  <div className="space-y-2">
    {/* Trigger button — FULL WIDTH */}
    <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="sr-only" aria-label="Capturar foto" />

    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm transition-colors',
        photos.length > 0
          ? 'border-sky-200 bg-sky-50 font-medium text-sky-700 hover:bg-sky-100'
          : 'border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-muted/30'
      )}
    >
      <Camera className="h-4 w-4" />
      {photos.length === 0
        ? 'Tirar foto'
        : `${photos.length} foto${photos.length > 1 ? 's' : ''} · Adicionar mais`
      }
    </button>

    {/* Thumbnails row */}
    {photos.length > 0 && (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative shrink-0">
            <PhotoThumbnail photo={photo} />
            <button
              type="button"
              onClick={() => handleRemove(photo.id)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-80 transition-opacity hover:opacity-100"
              aria-label="Remover foto"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);
```

Ajustar o `PhotoThumbnail` para ser maior:
```tsx
<img ... className="h-14 w-14 rounded-lg border border-border object-cover" />
```

### 4. Melhorar o Stepper (section dots) no `src/components/checklist/ChecklistForm.tsx`

Os dots atuais são muito pequenos (1.5x1.5) e não comunicam progresso. Trocar por um stepper mais informativo:

```tsx
{/* Section stepper — substituir os dots por labels compactos */}
<div className="mt-2.5 flex gap-1 overflow-x-auto px-1 pb-1">
  {sections.map((section, index) => {
    const sectionFilled = section.items.filter(i => i.value !== null && i.value !== '').length;
    const sectionTotal = section.items.length;
    const sectionComplete = sectionFilled === sectionTotal;
    const isActive = index === activeSectionIndex;
    const hasProgress = sectionFilled > 0 && !sectionComplete;

    return (
      <button
        key={section.id}
        type="button"
        onClick={() => setActiveSectionIndex(index)}
        aria-label={`${section.title}: ${sectionFilled} de ${sectionTotal} itens`}
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
          isActive
            ? 'bg-primary text-white shadow-sm'
            : sectionComplete
              ? 'bg-emerald-50 text-emerald-700'
              : hasProgress
                ? 'bg-amber-50 text-amber-700'
                : 'bg-muted text-muted-foreground'
        )}
      >
        {/* Status indicator */}
        {sectionComplete ? (
          <Check className="h-3 w-3" />
        ) : (
          <span className="text-[10px] tabular-nums">
            {sectionFilled}/{sectionTotal}
          </span>
        )}
        {/* Short section name — truncar para caber */}
        <span className="max-w-[80px] truncate">
          {getSectionShortName(section.title)}
        </span>
      </button>
    );
  })}
</div>
```

Adicionar helper para nomes curtos:
```typescript
function getSectionShortName(title: string): string {
  const map: Record<string, string> = {
    'Filtros e Qualidade do Ar': 'Filtros',
    'Componentes Mecânicos': 'Mecânica',
    'Sistema de Refrigeração': 'Refrigeração',
    'Componentes Elétricos': 'Elétrica',
    'Estrutura e Geral': 'Geral',
  };
  return map[title] ?? title.split(' ').slice(0, 2).join(' ');
}
```

Importar `Check` de lucide-react se ainda não estiver importado.

### 5. Sobre o item "Temperatura de saída do ar"

Analisei o discovery e o template PMOC. A "Temperatura de saída do ar" é um item de **medição** válido e importante no checklist HVAC — é como o técnico verifica se o AC está gelando corretamente. Ele mede com termômetro e registra o valor. A temperatura varia conforme o equipamento e ambiente, então o campo numérico é correto.

**Manter o item como está** (`responseType: 'numeric'`, `required: false`). É um dado de referência, não um "ajuste" — o técnico mede e registra. O valor fica no relatório para comparação entre visitas.

Nenhuma alteração necessária no template.
```

---

## Prompt V3-3 — CompletionScreen: Sync + Ações de Relatório/Notificação

```
Você é um senior frontend developer com expertise em telas de confirmação e ações pós-conclusão.

## Contexto
A CompletionScreen do Vobi Checklist tem 2 problemas:
1. O indicador de sync é um ponto verde perdido sem contexto
2. Não há como o técnico ver ou acessar o relatório/PDF/email/WhatsApp enviado

## Tarefa

### 1. Modificar `src/components/checklist/CompletionScreen.tsx`

**A) Substituir o ponto verde de sync por um card informativo:**

Trocar:
```tsx
<div className="mt-4 flex items-center gap-1.5">
  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
  <span className="text-xs text-muted-foreground">...</span>
</div>
```

Por um card de status de sync com ícone:
```tsx
import { Wifi, WifiOff, CloudUpload, Check } from 'lucide-react';

// Dentro do componente, usar o SyncIndicator ou fazer inline:
// Props: adicionar syncStatus: 'synced' | 'pending' | 'offline'
// Ou calcular baseado no navigator.onLine + sync store

<div className="mt-6 w-full max-w-sm">
  {/* Sync status card */}
  <div className={cn(
    'flex items-center gap-3 rounded-lg px-4 py-3',
    isOnline ? 'bg-emerald-50' : 'bg-amber-50'
  )}>
    {isOnline ? (
      <>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <CloudUpload className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-800">Dados sincronizados</p>
          <p className="text-xs text-emerald-600/70">Relatório será gerado automaticamente</p>
        </div>
      </>
    ) : (
      <>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
          <WifiOff className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">Sem conexão</p>
          <p className="text-xs text-amber-600/70">Dados serão enviados quando voltar online</p>
        </div>
      </>
    )}
  </div>
</div>
```

**B) Adicionar seção de "Relatório e Notificações" abaixo do sync:**

Esta é uma seção que mostra ao técnico o que foi/será enviado. No MVP, os itens podem ser placeholders que indicam o status futuro. Quando a integração estiver pronta, eles ficam clicáveis.

```tsx
{/* Report & Notifications */}
<div className="mt-4 w-full max-w-sm space-y-2">
  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
    Relatório e notificações
  </h3>

  {/* PDF Report */}
  <button
    type="button"
    onClick={() => {/* TODO: abrir PDF ou chamar API de geração */}}
    disabled={!isOnline}
    className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-left transition-colors hover:bg-muted/30 disabled:opacity-50 disabled:pointer-events-none"
  >
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
      <FileText className="h-4 w-4 text-red-500" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-foreground">Relatório PDF</p>
      <p className="truncate text-xs text-muted-foreground">Relatório completo do serviço</p>
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
  </button>

  {/* Email to Manager */}
  <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
      <Mail className="h-4 w-4 text-blue-500" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-foreground">E-mail para gestor</p>
      <p className="truncate text-xs text-muted-foreground">
        {isOnline ? 'Enviado automaticamente' : 'Será enviado ao reconectar'}
      </p>
    </div>
    {isOnline ? (
      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
    ) : (
      <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-amber-300" />
    )}
  </div>

  {/* Email/WhatsApp to Store */}
  <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
      <Send className="h-4 w-4 text-emerald-500" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-foreground">Notificação para lojista</p>
      <p className="truncate text-xs text-muted-foreground">
        {isOnline ? 'Enviado automaticamente' : 'Será enviado ao reconectar'}
      </p>
    </div>
    {isOnline ? (
      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
    ) : (
      <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-amber-300" />
    )}
  </div>
</div>
```

Imports adicionais: `FileText, Mail, Send, ChevronRight, CloudUpload, WifiOff` de lucide-react.

Para detectar online/offline:
```typescript
const [isOnline, setIsOnline] = useState(
  typeof navigator !== 'undefined' ? navigator.onLine : true
);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

**C) O CTA "Voltar para Ordens de Serviço" continua no bottom.**
```

---

## Prompt V3-4 — Reflexo do checklist concluído na tela de OS

```
Você é um senior frontend developer.

## Contexto
Quando o técnico conclui um checklist e volta para a tela de OS, a OS precisa refletir a conclusão imediatamente — sem precisar recarregar do servidor.

## Tarefa

### 1. Modificar `src/app/(auth)/service-orders/page.tsx`

Quando `handleComplete()` é chamado, antes de ir para CompletionScreen, atualizar a OS no estado local e no Dexie:

```typescript
async function handleComplete() {
  const checklistId = useChecklistStore.getState().id;
  const serviceOrderId = useChecklistStore.getState().serviceOrderId; // precisa existir no store

  await completeChecklist();

  // Atualizar a OS localmente no Dexie para refletir conclusão
  if (serviceOrderId) {
    try {
      await db.serviceOrders.update(serviceOrderId, {
        status: 'completed',
        checklistId: checklistId,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Silently fail — sync resolverá
    }
  }

  setScreen('completed');
}
```

### 2. Verificar se o checklist-store tem `serviceOrderId`

Ler `src/stores/checklist-store.ts` e verificar:
- Se `serviceOrderId` é salvo no state quando `startNewChecklist` é chamado
- Se não existir, adicioná-lo ao state e ao método `startNewChecklist`

### 3. Forçar re-fetch ao voltar para lista

Quando `handleBackToList()` é chamado (volta da CompletionScreen), forçar recarregamento:

```typescript
function handleBackToList() {
  reset();
  // Incrementar um counter para forçar re-fetch no ServiceOrderList
  setRefreshCounter((c) => c + 1);
  setScreen('list');
}

// Passar refreshCounter como prop ou key do ServiceOrderList
<ServiceOrderList key={refreshCounter} onSelectOrder={handleSelectOrder} />
```

Usar `key` é a forma mais simples: quando o key muda, o React recria o componente, disparando o useEffect de load novamente.

### 4. No ServiceOrderList, ao voltar do Dexie, a OS agora terá status='completed' e aparecerá no filtro "Concluídas"

Se o filtro ativo é "Pendentes", a OS concluída some da lista (correto). Se o técnico muda para "Concluídas", ela aparece.

Nenhuma mudança necessária no ServiceOrderList — o Dexie já foi atualizado no passo 1.
```

---

## Prompt V3-5 — Verificação Final V3

```
Você é um senior frontend developer fazendo QA.

## Tarefa
Após aplicar V3-0 a V3-4, verificar:

### Funcional
1. Limpar null bytes: find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"
2. OS List: separadores de data aparecem ("Hoje", "Amanhã", datas futuras)
3. OS List: "Hoje" tem destaque em text-primary
4. OS List: contagem de OS no separador está correta
5. StatusSelector: itens com 2 opções usam BOTÕES, 3+ opções usam SELECT
6. StatusSelector: botões permitem desseleção (toggle)
7. StatusSelector: select tem placeholder "Selecione..." e permite voltar para vazio
8. StatusSelector: status dot colorido aparece dentro do select quando selecionado
9. ChecklistItem: botão de foto é full-width com border-dashed (vazio) ou bg-sky-50 (com fotos)
10. ChecklistItem: botão de nota é full-width com border-dashed (vazio) ou bg-violet-50 (com nota)
11. ChecklistItem: thumbnails de foto são 56px (h-14 w-14) abaixo do botão
12. Stepper: pills com nomes curtos das seções + contagem "2/3" ou check quando completo
13. Stepper: pill ativa tem bg-primary text-white
14. CompletionScreen: card de sync com ícone CloudUpload ou WifiOff
15. CompletionScreen: seção "Relatório e notificações" com 3 items (PDF, Email gestor, Notificação lojista)
16. Após concluir checklist: OS atualizada no Dexie com status='completed'
17. Ao voltar para lista: OS concluída some do filtro "Pendentes" e aparece em "Concluídas"

### TypeCheck
18. Rodar `npm run typecheck` — corrigir erros (exceto .test.ts pré-existentes)
19. Verificar que não há arquivos truncados (todos os .tsx devem fechar corretamente)

### Cleanup
20. Limpar null bytes novamente no final: find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"

Corrija qualquer problema encontrado.
```

---

## Resumo Visual V3

```
TELA DE OS
─────────
┌─ Pendentes ─┬─ Concluídas ─┬─ Todas ─┐   ← filter pills

  HOJE                              2     ← separador com destaque
  ┌────────────────────────────────┐
  │ Loja Renner         Preventiva │
  │ Shopping Center Norte · Hoje   │
  │ ● Pendente          [ Iniciar ]│
  └────────────────────────────────┘
  ┌────────────────────────────────┐
  │ Starbucks            Corretiva │
  │ Shopping Iguatemi · Hoje       │
  │ ● Em andamento    [ Continuar ]│
  └────────────────────────────────┘

  AMANHÃ                            1     ← separador normal
  ┌────────────────────────────────┐
  │ Lojas Americanas    Preventiva │
  │ Shopping Morumbi · Amanhã      │
  │ ● Pendente          [ Iniciar ]│
  └────────────────────────────────┘


CHECKLIST ITEM (3+ opções → Select)
──────────────────────────────────
┌────────────────────────────────────┐
│ ○ Estado dos filtros de ar   PMOC  │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ ● Selecione...           ▼  │   │  ← select dropdown
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │  📷  Tirar foto              │   │  ← full-width, border-dashed
│ └──────────────────────────────┘   │
│ ┌──────────────────────────────┐   │
│ │  💬  Adicionar observação    │   │  ← full-width, border-dashed
│ └──────────────────────────────┘   │
└────────────────────────────────────┘

CHECKLIST ITEM (2 opções → Botões)
──────────────────────────────────
┌────────────────────────────────────┐
│ ✓ Verificação de vazamento   PMOC  │
│                                    │
│ ┌──────────┐  ┌──────────────────┐ │
│ │  ✓ OK    │  │ Vazam. Detectado │ │  ← botões toggle
│ └──────────┘  └──────────────────┘ │
│                                    │
│ ┌──────────────────────────────┐   │
│ │  📷  1 foto · Adicionar mais │   │  ← bg-sky-50
│ └──────────────────────────────┘   │
│ [thumb] [thumb]                    │  ← 56px thumbnails
│ ┌──────────────────────────────┐   │
│ │  💬  Editar observação    ✓  │   │  ← bg-violet-50
│ └──────────────────────────────┘   │
└────────────────────────────────────┘


STEPPER (topo do checklist)
───────────────────────────
┌─────────────────────────────────────────┐
│ ← Loja Renner                      2/5 │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░ │
│                                         │
│ [Filtros ✓] [Mecânica 1/3] [Refrig.]   │  ← pills scrollable
│ [Elétrica]  [Geral]                     │
└─────────────────────────────────────────┘


COMPLETION SCREEN
─────────────────
         ┌────┐
         │ ✓  │  ← ícone de status
         └────┘
    Checklist finalizado
  Serviço concluído com sucesso

  ┌──────────────────────────┐
  │ Loja         Loja Renner │
  │ Shopping     Center Norte│
  │ Resultado    OK          │
  └──────────────────────────┘

  ┌──────────────────────────┐
  │ ☁  Dados sincronizados   │  ← card com ícone
  │    Relatório será gerado │
  └──────────────────────────┘

  Relatório e notificações
  ┌──────────────────────────┐
  │ 📄 Relatório PDF       → │
  │ 📧 E-mail para gestor  ✓ │
  │ 📨 Notificação lojista ✓ │
  └──────────────────────────┘

  [ Voltar para Ordens de Serviço ]
```
