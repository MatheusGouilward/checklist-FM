# Vobi Checklist — Redesign V2: Correções de Heurísticas e UX

> **Contexto:** O redesign v1 limpou o visual pesado (removeu gradients, noise, glass, confetti). Agora precisamos corrigir problemas de heurísticas de usabilidade e refinar componentes específicos.
>
> **Como usar:** Rodar os 4 prompts abaixo no Claude Code CLI, em ordem.

---

## Diagnóstico de Heurísticas (Nielsen)

| # | Heurística | Problema encontrado | Severidade |
|---|-----------|---------------------|------------|
| 1 | **Visibilidade do status** | Lista de OS só mostra pendentes/em andamento. Não há OS concluídas para dar senso de progresso ao técnico. | Alta |
| 2 | **Controle e liberdade do usuário** | StatusSelector não permite desseleção — o técnico não consegue "limpar" uma resposta após selecionar. Erro irrecuperável. | Alta |
| 3 | **Consistência e padrões** | Botões de Foto e Nota no ChecklistItem são idênticos visualmente (mesma cor, mesmo tamanho, mesma opacidade). Não se diferenciam entre si nem indicam estado de forma clara. | Média |
| 4 | **Reconhecimento > Memória** | Não há filtros/ordenação na tela de OS. Com muitas OS, o técnico precisa fazer scroll e lembrar qual é a próxima — deveria poder filtrar por "Hoje", "Esta semana", ou ordenar por data/status. | Alta |
| 5 | **Design minimalista** | Badge PMOC é tão discreto (text-[10px] primary/60) que o técnico pode não perceber quais itens são obrigatórios. Muito discreto. | Média |
| 6 | **Flexibilidade** | Falta um card de OS concluído para o técnico ver o histórico recente e ter contexto de "o que eu já fiz hoje". | Média |
| 7 | **Prevenção de erros** | Nenhuma confirmação visual forte quando um item é preenchido. O border muda de cor, mas o feedback é sutil demais para campo (luz forte, pressa). | Média |
| 8 | **Estética** | Alinhamentos: badge de status no ServiceOrderCard não alinha verticalmente com o nome da loja. Botão "Iniciar" solto no canto inferior direito sem relação visual com o conteúdo. | Baixa |

---

## Prompt V2-1 — Tela de Ordens de Serviço (Filtros + OS Concluída + Layout)

```
Você é um senior frontend developer com expertise em listas mobile-first para apps B2B de campo.

## Contexto
A tela de Ordens de Serviço do Vobi Checklist precisa de 3 melhorias:
1. Filtros/ordenação para o técnico encontrar rapidamente a OS certa
2. Pelo menos 1 OS concluída visível (senso de progresso + histórico)
3. Ajustes de alinhamento e layout nos cards

## Arquivos a modificar

### 1. `src/lib/demo/mock-data.ts`
Adicionar uma OS com `status: 'completed'` e `checklistId` preenchido:
```typescript
{
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
  companyId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  technicianId: '11111111-1111-1111-1111-111111111111',
  status: 'completed',
  scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // ontem
  storeName: 'Natura',
  storeContact: 'loja.natura@shopping.com',
  shoppingName: 'Shopping Center Norte',
  equipmentModel: 'Split Carrier XPower',
  equipmentCapacity: '24.000 BTU',
  equipmentLocation: 'Forro da área de atendimento',
  serviceCategory: 'hvac',
  serviceType: 'preventive',
  notes: 'Revisão trimestral concluída.',
  checklistId: 'cccccccc-cccc-cccc-cccc-cccccccccc01',
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
}
```

### 2. `src/components/service-orders/ServiceOrderList.tsx`
Modificar para:

**Buscar TODAS as OS (incluir completed):**
- Na query Supabase: remover o filtro `.in('status', ['pending', 'in_progress'])` — buscar todas (ou adicionar 'completed')
- Na query Dexie: remover o `.and()` que filtra status
- No demo mode: já vai ter a OS completed do mock

**Adicionar prop de filtro ou state interno:**
- Filter pills no topo do componente (DENTRO do ServiceOrderList, não na page)
- 3 filtros horizontais:
  - "Pendentes" (default, ativo) — mostra pending + in_progress
  - "Concluídas" — mostra completed
  - "Todas" — sem filtro

**UI dos filter pills:**
```
<div className="mb-4 flex gap-2">
  {filters.map(f => (
    <button
      key={f.key}
      onClick={() => setActiveFilter(f.key)}
      className={cn(
        'h-8 rounded-full px-3.5 text-xs font-medium transition-colors',
        activeFilter === f.key
          ? 'bg-primary text-white'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
    >
      {f.label}
      {f.count > 0 && (
        <span className={cn(
          'ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[10px] font-bold',
          activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-muted-foreground/10 text-muted-foreground'
        )}>
          {f.count}
        </span>
      )}
    </button>
  ))}
</div>
```

**Separador visual entre seções:**
Se o filtro é "Todas", agrupar por status com um label separator:
```
<p className="mt-4 mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
  Concluídas
</p>
```

### 3. `src/components/service-orders/ServiceOrderCard.tsx`
Ajustes de layout e alinhamento:

**A) Layout do card — Revisar estrutura:**

Trocar a estrutura interna para um layout mais limpo:

```tsx
<div className="rounded-xl border border-border bg-white p-4 transition-shadow duration-150 hover:shadow-sm">
  <button type="button" onClick={() => onStart(order)} className="w-full text-left">
    {/* Row 1: Store name + Service type badge (não status) */}
    <div className="flex items-center justify-between gap-3">
      <h3 className="min-w-0 truncate text-[15px] font-semibold text-foreground">
        {order.storeName}
      </h3>
      <span className={cn(
        'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold',
        serviceTypeBadgeStyle
      )}>
        {SERVICE_TYPE_LABELS[order.serviceType]}
      </span>
    </div>

    {/* Row 2: Shopping · Date */}
    <p className="mt-1 text-[13px] text-muted-foreground">
      {order.shoppingName}
      <span className="mx-1">·</span>
      <span className={overdue ? 'font-medium text-red-500' : ''}>
        {formatRelativeDate(order.scheduledDate)}
      </span>
    </p>

    {/* Row 3: Equipment (só se tiver info real) */}
    {hasEquipmentInfo && (
      <p className="mt-1 truncate text-xs text-muted-foreground/60">
        {order.equipmentModel} · {order.equipmentCapacity}
      </p>
    )}

    {/* Row 4: Action row — status badge + botão */}
    <div className="mt-3 flex items-center justify-between">
      {/* Status badge (à esquerda, discreto) */}
      <span className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        statusTextStyle
      )}>
        <span className={cn('h-1.5 w-1.5 rounded-full', statusDotStyle)} />
        {statusLabel}
      </span>

      {/* Action button (à direita) */}
      {order.status !== 'completed' ? (
        <span className={cn(
          'inline-flex h-8 items-center rounded-lg px-3.5 text-[13px] font-semibold',
          hasChecklist ? 'bg-primary/8 text-primary' : 'bg-primary text-white'
        )}>
          {hasChecklist ? 'Continuar' : 'Iniciar'}
        </span>
      ) : (
        <span className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-50 px-3 text-[13px] font-medium text-emerald-600">
          <Check className="h-3 w-3" />
          Concluído
        </span>
      )}
    </div>
  </button>
</div>
```

**B) Cores dos badges por service type:**
- Preventiva: `bg-blue-50 text-blue-600 border-0`
- Corretiva: `bg-amber-50 text-amber-600 border-0`
- Instalação: `bg-emerald-50 text-emerald-600 border-0`

**C) Status como dot + texto (não badge pesado):**
- Pendente: dot gray-300 + text-muted-foreground "Pendente"
- Em andamento: dot primary + text-primary "Em andamento"
- Concluído: dot emerald-500 + text-emerald-600 "Concluído"

**D) Card de OS concluída:**
- Mesmo layout, mas com `opacity-75` no conteúdo (ou `bg-muted/30` no card)
- Botão "Iniciar" vira badge estático "Concluído" com ícone Check
- Não é clicável (ou se clicável, abre o relatório readonly)

**E) Desabilitar active:scale no card concluído** — sem feedback de tap se não há ação.
```

---

## Prompt V2-2 — ChecklistItem: StatusSelector com Desseleção + Feedback Visual Melhor

```
Você é um senior frontend developer com expertise em UX de formulários para apps de campo.

## Problemas a resolver
1. O StatusSelector não permite desseleção — se o técnico toca "OK" por erro, não consegue voltar para "não preenchido"
2. O feedback visual ao preencher um item é muito sutil (apenas border muda de cor)
3. O badge PMOC é discreto demais — itens obrigatórios devem ter indicação mais clara

## Arquivos a modificar

### 1. `src/components/checklist/StatusSelector.tsx`

**Permitir desseleção (toggle):**
Mudar a prop `onChange` para aceitar `null`:
```typescript
interface StatusSelectorProps {
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;  // null = desselecionou
}
```

No onClick:
```typescript
onClick={() => {
  hapticTap();
  // Se já está selecionado, desseleciona (toggle)
  if (isSelected) {
    onChange(null);
  } else {
    onChange(option);
  }
}}
```

**Visual do botão selecionado — mais proeminente:**
Adicionar um ícone de check pequeno (10px) ao lado do texto quando selecionado:
```tsx
{isSelected && <Check className="h-2.5 w-2.5 mr-1 shrink-0" />}
{option}
```

E garantir que o botão selecionado tenha ring sutil:
- OK selecionado: `bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold ring-1 ring-emerald-200`
- Warning selecionado: `bg-amber-50 text-amber-700 border-amber-300 font-semibold ring-1 ring-amber-200`
- Critical selecionado: `bg-red-50 text-red-700 border-red-300 font-semibold ring-1 ring-red-200`

**Ajuste de grid para textos longos:**
Muitos options têm texto longo (ex: "Necessita Troca", "Vazamento Detectado", "Recarga Realizada"). O grid-cols-3 pode truncar. Lógica:
- Se TODAS as opções têm ≤ 10 caracteres: grid-cols-3 OK
- Se ALGUMA opção tem > 15 caracteres: grid-cols-2
- Se tem 2 opções: grid-cols-2
- Se tem 4+ opções: grid-cols-2
- Adicionar `text-center` nos botões para alinhar texto curto e longo

### 2. `src/components/checklist/ChecklistItem.tsx`

**Badge PMOC mais visível (mas não gritante):**
Trocar o texto "PMOC" ultra-discreto por um indicador mais perceptível:
```tsx
{item.required && (
  <span className="ml-1.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-primary">
    PMOC
  </span>
)}
```
A diferença: agora tem `bg-primary/10` e `px-1.5 py-0.5` — é um mini badge com background sutil ao invés de apenas texto solto. Ainda discreto, mas perceptível.

**Feedback visual mais forte ao preencher:**
Ao invés de SÓ mudar o border, adicionar um indicador de "preenchido" mais visível:

No header do card, à esquerda do label, adicionar um indicador:
```tsx
<div className="flex items-start gap-2.5">
  {/* Status indicator */}
  <div className={cn(
    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-200',
    isFilled
      ? getStatusBgClass(item)  // bg-emerald-100, bg-amber-100, bg-red-100 conforme status
      : 'border-2 border-muted-foreground/20'
  )}>
    {isFilled && (
      <Check className={cn('h-3 w-3', getStatusIconColor(item))} />
    )}
  </div>

  {/* Label + PMOC */}
  <div className="flex items-start gap-1 min-w-0 flex-1">
    <span className="text-sm font-medium text-foreground">{item.label}</span>
    {item.required && (
      <span className="ml-1.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-primary">
        PMOC
      </span>
    )}
  </div>
</div>
```

Adicionar helper `getStatusBgClass`:
```typescript
function getStatusBgClass(item: ChecklistItemType): string {
  const val = String(item.value).toLowerCase();
  if (['ok', 'substituído', 'limpo', 'recarga realizada'].includes(val)) return 'bg-emerald-100';
  if (val.includes('necessita') || ['baixo', 'descalibrado', 'folga', 'desgaste', 'obstruído', 'ruído anormal', 'dano visível'].includes(val)) return 'bg-amber-100';
  if (['detectado', 'danificado', 'não funciona', 'vazamento', 'vazamento detectado', 'falha'].includes(val)) return 'bg-red-100';
  return 'bg-primary/10';
}
```

Remover o ícone Check solto no canto direito (substituído pelo circle indicator à esquerda).

### 3. Verificar que a prop `onChange` no ChecklistItem aceita `null`:
No ChecklistItem e no ChecklistSection, o `onValueChange` já aceita `(value: string | number | null)`, então a desseleção (onChange(null)) deve funcionar sem mudanças no parent.
```

---

## Prompt V2-3 — Botões de Foto e Nota: Redesign para diferenciação e estado

```
Você é um senior frontend developer com expertise em componentes de ação compactos para mobile.

## Problema
Os botões "Foto" e "Nota" no ChecklistItem são visualmente idênticos — mesma cor, tamanho, borda. O técnico não distingue rápido entre eles, e não é claro quando um já tem conteúdo.

## Princípio
Cada botão deve ter:
1. Identidade visual própria (ícone diferenciado + cor de accent)
2. Estado vazio vs. preenchido claramente distinto
3. Contagem visível quando tem conteúdo

## Arquivos a modificar

### 1. `src/components/checklist/PhotoCapture.tsx`

Redesign do botão trigger:

**Estado vazio (sem fotos):**
```tsx
<button
  type="button"
  onClick={() => inputRef.current?.click()}
  className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 px-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/30"
>
  <Camera className="h-4 w-4" />
  <span>Foto</span>
</button>
```

**Estado com fotos:**
```tsx
<button
  type="button"
  onClick={() => inputRef.current?.click()}
  className="flex h-9 items-center gap-1.5 rounded-lg bg-sky-50 px-3 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
>
  <Camera className="h-4 w-4" />
  <span>{photos.length}</span>
  <span className="text-sky-500">·</span>
  <span className="text-xs text-sky-500">+ Adicionar</span>
</button>
```

**Thumbnails abaixo do botão (não inline ao lado):**
Quando tem fotos, mostrar thumbnails em uma row abaixo do botão de foto:
```tsx
{photos.length > 0 && (
  <div className="mt-2 flex gap-1.5 overflow-x-auto">
    {photos.map(photo => (
      <div key={photo.id} className="group relative shrink-0">
        <PhotoThumbnail photo={photo} />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleRemove(photo.id); }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          aria-label="Remover foto"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    ))}
  </div>
)}
```
Thumbnails: `h-12 w-12 rounded-lg` (maiores que os atuais 9x9 para serem mais úteis em campo).

Importante: o container do PhotoCapture precisa mudar de `flex items-center` para `flex flex-col items-start` para acomodar thumbnails abaixo.

### 2. Botão "Nota" no `src/components/checklist/ChecklistItem.tsx`

**Estado vazio:**
```tsx
<button
  type="button"
  onClick={() => setShowObservation(!showObservation)}
  className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 px-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/30"
>
  <MessageSquare className="h-4 w-4" />
  <span>Nota</span>
</button>
```

**Estado com observação escrita:**
```tsx
<button
  type="button"
  onClick={() => setShowObservation(!showObservation)}
  className="flex h-9 items-center gap-1.5 rounded-lg bg-violet-50 px-3 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100"
>
  <MessageSquare className="h-4 w-4 fill-current" />
  <span>Nota</span>
  <Check className="h-3 w-3 text-violet-400" />
</button>
```

**Diferenciação por cor:**
- Foto: sky (azul claro) — associação com câmera/visual
- Nota: violet (roxo suave) — associação com escrita/texto
- Ambos: border-dashed quando vazios (convida a preencher), bg sólido sutil quando preenchidos

### 3. Reorganizar a actions row no `ChecklistItem.tsx`

A actions row deve acomodar os thumbnails:
```tsx
{/* Actions */}
<div className="mt-3 space-y-2">
  {/* Buttons row */}
  <div className="flex items-center gap-2">
    <PhotoCapture ... />  {/* agora retorna botão + thumbnails abaixo */}
    {/* Nota button */}
    <button ...>Nota</button>
  </div>
</div>
```

Na verdade, como PhotoCapture agora tem layout vertical (botão + thumbnails), mover os thumbnails para FORA da actions row. Nova estrutura:

```tsx
{/* Actions row: botões lado a lado */}
<div className="mt-3 flex items-center gap-2">
  <PhotoCaptureButton ... />  {/* APENAS o botão */}
  <NoteButton ... />
</div>

{/* Photo thumbnails (abaixo da actions row, se tiver fotos) */}
{item.photos.length > 0 && (
  <PhotoThumbnails photos={item.photos} onRemove={...} />
)}

{/* Observation expanded */}
{showObservation && ( ... )}
```

Isso pode significar refatorar PhotoCapture para exportar o botão e os thumbnails separadamente, ou manter tudo dentro e ajustar o layout CSS.

A abordagem mais simples: manter PhotoCapture como um componente que renderiza tudo (botão + thumbnails), mas trocar o container de `flex items-center` para `inline-flex flex-col items-start`. Porém, isso vai desalinhar com o botão Nota ao lado.

**Melhor abordagem: PhotoCapture renderiza tudo em coluna, e o botão Nota fica self-start na mesma row:**

```tsx
<div className="mt-3 flex items-start gap-2">
  <PhotoCapture ... />  {/* flex-col: botão no topo, thumbnails abaixo */}
  <button className="... self-start">Nota</button>  {/* alinha com o botão da foto */}
</div>
```
```

---

## Prompt V2-4 — Verificação Final V2

```
Você é um senior frontend developer fazendo QA de UI.

## Tarefa
Após aplicar os prompts V2-1, V2-2 e V2-3, verifique:

### Funcional
1. A tela de OS mostra os 3 filtros (Pendentes, Concluídas, Todas) e funciona com toggle
2. A OS concluída aparece com visual diferenciado (opacidade ou bg diferente)
3. O StatusSelector permite desseleção (clicar no item já selecionado retorna null)
4. Os botões Foto e Nota têm visual diferente entre si
5. Os botões Foto e Nota mudam de estilo quando têm conteúdo
6. Os thumbnails de foto aparecem abaixo da actions row, com tamanho 12x12 (48px)
7. O badge PMOC é visível mas discreto (bg-primary/10 com padding)
8. O circle indicator de status aparece à esquerda de cada label de item

### Visual / Heurísticas
9. Cards de OS: nome da loja alinha com o badge de tipo de serviço (items-center)
10. Cards de OS: status (dot + texto) alinha com o botão de ação (items-center no flex)
11. Filtros pills: o filtro ativo tem bg-primary text-white, inativos têm bg-muted
12. Grid do StatusSelector: options com texto longo (>15 chars) usam grid-cols-2
13. ChecklistItem: o circle indicator (20x20) alinha verticalmente com a primeira linha do label
14. Botão Foto vazio: border-dashed, muted. Com fotos: bg-sky-50, text-sky-700
15. Botão Nota vazio: border-dashed, muted. Com nota: bg-violet-50, text-violet-700

### Consistência
16. Todas as cores de status continuam emerald/amber/red (sem green/yellow/orange)
17. Touch targets: todos os botões >= h-8 (32px) para ações secundárias, >= h-11 (44px) para CTAs
18. Border-radius consistente: cards=rounded-xl, botões=rounded-lg, badges=rounded-md, pills=rounded-full

### Build
19. Rodar `npm run typecheck` e corrigir erros (ignorar erros em .test.ts pré-existentes)
20. Se houver erros de null bytes, limpar com: `find ./src -name "*.ts" -o -name "*.tsx" | xargs perl -pi -e "s/\x00//g"`

Corrija qualquer inconsistência encontrada.
```

---

## Resumo Visual das Mudanças V2

```
ANTES (V1)                          DEPOIS (V2)
────────────────                    ────────────────
OS List: só pending/in_progress  →  Filtros: Pendentes | Concluídas | Todas
                                    + 1 OS concluída com visual diferenciado

Card OS: badge status pesado     →  Status como dot + texto discreto
         botão solto no canto       Badge = tipo de serviço (Preventiva/Corretiva)
                                    Botão alinhado com status na mesma row

StatusSelector: sem desseleção   →  Toggle: clicar de novo limpa a seleção
                sem check visual    Check icon no botão selecionado
                                    Grid adaptativo para textos longos

ChecklistItem: sem indicator     →  Circle indicator 20px à esquerda do label
               PMOC invisível       PMOC com mini badge bg-primary/10
               feedback sutil       Circle muda de cor (emerald/amber/red) ao preencher

Foto/Nota: iguais visualmente   →  Foto: sky-blue accent, border-dashed vazio
                                    Nota: violet accent, border-dashed vazio
                                    Ambos: bg sólido quando preenchidos
                                    Thumbnails 48px abaixo da row (não inline)
```
