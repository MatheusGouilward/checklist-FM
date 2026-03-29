# Vobi Checklist — Prompts de Redesign Completo da Interface

> **Objetivo:** Refazer totalmente a interface do app seguindo princípios de design clean/minimal inspirados em Linear, Apple e apps premium 2025/2026 — mantendo a paleta Vobi e respeitando as necessidades do técnico de campo.
>
> **Como usar:** Execute cada prompt abaixo no Claude Code CLI (Cursor terminal) na ordem indicada. Cada prompt é auto-contido e referencia os arquivos corretos. Comece pelo Prompt 0 (Design System) e siga em ordem.

---

## Diagnóstico do estado atual

### Problemas identificados na interface atual:

1. **Excesso visual no Login** — Decorações geométricas (shapes, dots), gradients pesados com noise overlay, visual "barulhento" que distrai
2. **Cards de OS sobrecarregados** — Muita informação competindo por atenção: badges, tags, ícones, notas, datas, tudo junto
3. **Header auth pesado** — Gradient mesh + noise no header fixo cria peso visual desnecessário no topo
4. **ChecklistItem complexo demais** — Bordas coloridas + backgrounds + indicators + badges PMOC + fotos + observations tudo em um card denso
5. **Falta de breathing room** — Pouco espaço em branco entre elementos, sensação de "apertado"
6. **StatusSelector genérico** — Grid de botões sem personalidade, cores de status aplicadas de forma uniforme sem hierarquia
7. **ProgressBar sem sofisticação** — Barra simples sem feedback visual rico sobre progresso parcial por seção
8. **CompletionScreen exagerada** — Confetti e particles são divertidos mas não passam profissionalismo para um app B2B de campo
9. **Glass surface overuse** — Uso excessivo de backdrop-blur que pode causar performance issues em devices low-end de técnicos
10. **Tipografia sem hierarquia clara** — DM Sans + Plus Jakarta Sans é bom, mas a aplicação não explora os pesos de forma estratégica

---

## Prompt 0 — Design System Foundation (globals.css + tokens)

```
Você é um senior UI designer especializado em design systems para apps mobile-first B2B.

## Contexto
Estou redesignando o app Vobi Checklist — um PWA mobile-first para técnicos de HVAC preencherem checklists de manutenção em campo (shopping centers). O app precisa funcionar em condições adversas: mãos sujas, áreas barulhentas, luz forte, devices mid-range Android.

## Tarefa
Refazer completamente o arquivo `src/app/globals.css` seguindo estes princípios:

### Design Philosophy: "Calm Utility"
Inspiração: Linear App + Stripe Dashboard + Apple Health — clean, minimal, funcional. Zero decoração desnecessária. Cada pixel serve a um propósito.

### Paleta Vobi (manter)
- Primary: #0158C2 (Vobi Blue)
- Dark: #003D8F
- Light: #0078E8
- Usar como accent, NUNCA como cor dominante. O fundo deve ser branco/off-white/light gray. O azul aparece em CTAs, links, indicadores ativos — nunca em backgrounds grandes.

### Regras do novo Design System

1. **Backgrounds:** Branco puro (#FFFFFF) para cards. Off-white sutil (oklch 0.985) para page background. ZERO gradients em backgrounds de conteúdo. Gradients APENAS em CTAs de alta hierarquia (botão Finalizar) e de forma sutil.

2. **Tipografia — Hierarquia Rigorosa:**
   - Display/Page titles: DM Sans 700, -0.03em tracking, text-foreground
   - Section titles: DM Sans 600, -0.02em, text-foreground
   - Body/Labels: Plus Jakarta Sans 500, normal tracking, text-foreground
   - Captions/Meta: Plus Jakarta Sans 400, text-muted-foreground
   - NUNCA usar font-extrabold (800). Max é 700 (bold).

3. **Spacing — 8px Grid rigoroso (estilo Linear):**
   - Padding interno de cards: 16px (p-4)
   - Gap entre cards: 12px (gap-3)
   - Padding de página: 20px horizontal (px-5)
   - Seções: 32px de separação (my-8)
   - Touch targets: min 48px height

4. **Borders & Shadows:**
   - Cards: border 1px solid border-color (oklch 0.92). Sem shadow por padrão.
   - Cards hover/active: shadow-sm sutil. NUNCA shadow-lg.
   - Border-radius: 12px para cards (rounded-xl), 8px para botões/inputs (rounded-lg), 20px para containers de página (rounded-2xl)

5. **Cores de Status (mantendo semântica, refinando tons):**
   - OK: emerald-500 como accent, emerald-50 como bg. Sem border pesado.
   - Warning: amber-500 / amber-50
   - Critical: red-500 / red-50
   - Neutral/Empty: gray-200 para borders, gray-50 para bg

6. **Animações — Menos é mais:**
   - REMOVER: confetti, bounceIn, pulse-ring, noise-overlay
   - MANTER: fadeInUp (reduzir para 0.3s e 8px de travel), fadeIn (0.2s)
   - ADICIONAR: transition suave para mudança de estado em cards (150ms ease)
   - Stagger: manter mas reduzir delays (0.03s entre items, max 0.15s)

7. **Glass Surface — Remover:**
   - Substituir glass-surface por bg-white/95 com border-bottom sutil. Sem backdrop-blur (performance em Android mid-range).

8. **Dark Mode:**
   - Manter tokens dark mas simplificar. Fundo: oklch(0.13). Cards: oklch(0.18). Sem gradients no dark mode.

### Arquivo a editar
`src/app/globals.css` — reescrever completamente seguindo as regras acima. Manter as @imports, @custom-variant, @theme inline e os tokens CSS custom properties. Simplificar drasticamente as utilities e animações.

### Não alterar
- As @imports no topo
- A estrutura de CSS custom properties (--primary, --background, etc.)
- O suporte a safe-area e reduced-motion
- As media queries de touch optimization
```

---

## Prompt 1 — Login Page (Redesign Total)

```
Você é um senior frontend developer com expertise em UI minimal/clean para apps B2B mobile-first.

## Contexto
App Vobi Checklist — PWA para técnicos de campo. A tela de login atual é visualmente pesada: gradient mesh com shapes decorativas, noise overlay, múltiplas animações. Precisa ser limpa, profissional e rápida.

## Persona
Técnico de HVAC, ~30-45 anos, pragmático. Quer abrir o app e logar rápido. Não precisa de "wow factor" no login — precisa de velocidade e clareza.

## Referências de design
- Linear App login: fundo branco, logo centralizado, form centralizado, zero decoração
- Stripe login: tipografia limpa, espaço branco generoso, um único CTA azul
- Notion login: simplicidade, um fluxo, sem distrações

## Tarefa
Reescrever completamente `src/app/login/page.tsx` seguindo:

### Layout
1. Fundo branco puro, sem gradient, sem shapes, sem noise
2. Container centralizado vertical e horizontalmente (flexbox center)
3. Max-width: 400px (mobile full-width com px-6)

### Estrutura (top to bottom)
1. **Logo:** Apenas o texto "vobi" em DM Sans 700, text-2xl, cor primary (#0158C2). Sem ícone, sem círculo. Subtítulo: "Checklist de Serviço" em text-sm text-muted-foreground, Plus Jakarta Sans 400.
2. **Espaçamento:** 48px entre logo e form (mt-12)
3. **Form:**
   - Labels discretos acima dos inputs (text-sm font-medium text-foreground/70)
   - Inputs: h-12, rounded-lg, border border-border, bg-white, focus:ring-2 focus:ring-primary/20 focus:border-primary. Font 16px (evitar zoom iOS).
   - Password: toggle de visibilidade com ícone Eye/EyeOff em muted-foreground
   - Gap entre inputs: 16px
4. **Botão Login:**
   - bg-primary text-white, h-12, rounded-lg, font-semibold
   - Hover: bg-primary/90
   - Active: scale-[0.98] transition-transform duration-100
   - Loading: spinner simples + "Entrando..."
   - Sem shadow. Sem gradient.
5. **Erro:** Texto simples em text-red-500 text-sm acima do botão. Sem alert box pesado.
6. **Demo mode:** Se ativado, separador "ou" discreto (linha + texto + linha) e botão outline: "Entrar como Carlos Silva (Demo)" em border-border text-foreground hover:bg-muted
7. **Footer:** Nada. Sem texto, sem links, sem versão.

### Animação
- Apenas um fadeIn suave (0.3s) no container inteiro ao montar. Nada mais.

### Código
- Manter toda a lógica de auth existente (Supabase login, demo mode, error handling)
- Apenas refazer o JSX/Tailwind completamente
- Remover: todas as shapes decorativas, gradient-mesh, noise-overlay, múltiplos animate-*
- Arquivo: `src/app/login/page.tsx`
```

---

## Prompt 2 — Auth Layout + Header

```
Você é um senior frontend developer com expertise em design systems minimal para apps mobile B2B.

## Contexto
O layout autenticado do Vobi Checklist tem um header fixo com gradient-mesh pesado, noise overlay e muita informação. Precisa ser simplificado drasticamente.

## Tarefa
Reescrever `src/app/(auth)/layout.tsx` seguindo:

### Header — Estilo Linear App (clean, flat, funcional)
1. **Background:** bg-white com border-b border-border. ZERO gradient. ZERO noise.
2. **Height:** h-14 (56px) fixo.
3. **Layout:** flex items-center justify-between px-5
4. **Esquerda:**
   - Logo "vobi" em text-lg font-bold text-primary (DM Sans)
   - Separador: div w-px h-5 bg-border mx-3
   - Nome do usuário em text-sm font-medium text-foreground truncate max-w-[150px]
5. **Direita:**
   - SyncIndicator (simplificado — apenas dot colorido 8px + texto discreto)
   - Botão logout: ícone LogOut em text-muted-foreground hover:text-foreground, 40x40px touch target, rounded-lg hover:bg-muted transition-colors
6. **Sticky:** sticky top-0 z-40
7. **Safe area:** pt-[env(safe-area-inset-top)] quando suportado

### Body
- Background: bg-background (off-white)
- Padding: pt-4 pb-20 (espaço para bottom nav se necessário no futuro)
- min-h-screen

### SyncIndicator (simplificar `src/components/sync/SyncIndicator.tsx`)
- Online + synced: dot verde 6px + "Sincronizado" text-xs text-muted-foreground (ou esconder completamente)
- Offline: dot amber 6px + "Offline" text-xs text-amber-600
- Syncing: dot azul 6px com pulse animation + "Sincronizando..." text-xs
- REMOVER: todos os estilos pesados, gradients, shadows do componente atual
```

---

## Prompt 3 — Service Orders Page + Cards

```
Você é um senior frontend developer com expertise em listas mobile-first clean e performáticas.

## Contexto
A lista de Ordens de Serviço (OS) é a primeira tela após login. Atual tem cards sobrecarregados com muita informação, badges, ícones e cores competindo. Precisa ser limpa e scannable.

## Personas e contexto de uso
O técnico abre o app de manhã e precisa ver rapidamente: "qual é minha próxima OS?". Informação mais importante: nome da loja + horário/data. Detalhes do equipamento são secundários.

## Referências
- Apple Reminders: listas limpas com hierarquia tipográfica clara
- Linear issues list: density controlada, informação essencial apenas
- Notion database mobile: cards compactos, cores de status como accent minimal

## Tarefa
Reescrever 3 arquivos:

### 1. `src/app/(auth)/service-orders/page.tsx`
- Header simples: "Ordens de Serviço" em text-xl font-bold (DM Sans), sem ícone decorativo, sem subtítulo
- Filtro discreto (se existir): pills ou tabs horizontais (Hoje / Esta semana / Todas)
- Lista com gap-3 entre cards
- Empty state: ícone ClipboardList em text-muted-foreground/30, 48px. Texto "Nenhuma OS pendente" em text-muted-foreground text-sm. Sem animação.
- Loading: 3 skeletons simples (h-24 rounded-xl bg-muted animate-pulse). Sem shimmer customizado.

### 2. `src/components/service-orders/ServiceOrderCard.tsx`
Redesign total seguindo hierarquia de informação:

**Card container:**
- bg-white rounded-xl border border-border p-4
- hover:shadow-sm transition-shadow duration-150
- active:scale-[0.99] transition-transform duration-100
- SEM ícone de categoria na esquerda (remover o círculo colorido)

**Layout interno — Stack vertical simples:**
1. **Linha 1 — Principal:**
   - Store name: text-base font-semibold text-foreground (truncate)
   - À direita: Badge de status compacto
     - pending: bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-md "Pendente"
     - in_progress: bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-md "Em andamento"
     - completed: bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded-md "Concluído"

2. **Linha 2 — Contexto:**
   - Shopping name + data agendada em text-sm text-muted-foreground
   - Formato: "Shopping Iguatemi · Hoje, 14:00" (ou "Amanhã" ou "30 Mar")
   - Se overdue: data em text-red-500

3. **Linha 3 — Meta (opcional, só se tiver):**
   - Equipamento em text-xs text-muted-foreground/70 truncate
   - "Split 60.000 BTUs · Preventiva"

4. **Ação — Bottom right (ou full-width no mobile):**
   - Botão "Iniciar" ou "Continuar":
     - Iniciar: bg-primary text-white text-sm font-medium h-9 px-4 rounded-lg
     - Continuar: bg-primary/10 text-primary text-sm font-medium h-9 px-4 rounded-lg
   - Alinhado à direita no card, ou full-width se o card for estreito

**REMOVER do card atual:**
- Ícone circular de categoria à esquerda
- Badge de service type separado (integrar no meta)
- Badge de categoria separado
- Notes preview (remover do card, mostrar em detalhe se necessário)
- Cores diferentes por categoria (simplificar — tudo com a mesma estética)
- Sombra pesada no hover

### 3. `src/components/service-orders/ServiceOrderList.tsx`
- Simplificar lógica de renderização
- Manter agrupamento por status se existir
- Loading/Empty states conforme descrito acima
```

---

## Prompt 4 — Checklist Form (Container + Navigation)

```
Você é um senior frontend developer expert em UX de formulários mobile-first para condições de campo.

## Contexto
O ChecklistForm é o coração do app — onde o técnico preenche os itens de manutenção. A estrutura atual tem 3 seções sticky (header, content, footer) com glass-surface e muita complexidade visual. Precisa ser simplificado mantendo funcionalidade.

## Princípio: "One thing at a time"
O técnico vê UMA seção por vez. Navegação é linear (Anterior/Próximo). Progress é sempre visível mas discreto.

## Tarefa
Reescrever `src/components/checklist/ChecklistForm.tsx`:

### Top Bar (sticky, limpa)
1. **Background:** bg-white border-b border-border (ZERO glass, ZERO blur)
2. **Linha 1 — Context:**
   - Botão voltar: ícone ChevronLeft, 40x40, rounded-lg, hover:bg-muted
   - Texto: "Loja [nome]" em text-sm font-medium text-foreground truncate
   - À direita: "3/5" (seção atual/total) em text-sm text-muted-foreground
3. **Linha 2 — Progress Bar:**
   - Barra fina: h-1 rounded-full bg-muted
   - Fill: h-1 rounded-full bg-primary transition-all duration-300
   - Percentual baseado em itens preenchidos/total
   - SEM texto de percentual. Apenas a barra visual.
4. **Section Navigation (optional, below progress):**
   - Dots pequenos (6px) representando cada seção:
     - Ativa: bg-primary scale-125
     - Completa: bg-emerald-500
     - Parcial: bg-amber-400
     - Vazia: bg-muted-foreground/20
   - Espaçamento: gap-2, centralizado, py-2
   - Se tiver muitas seções (>6), usar scrollable horizontal

### Content Area
- px-5 py-4
- Título da seção ativa: text-lg font-semibold text-foreground mb-1 (DM Sans)
- Subtítulo (se houver): text-sm text-muted-foreground mb-6
- Items com gap-4 entre eles
- Transição entre seções: fadeIn 0.2s (sutil)

### Bottom Navigation (sticky)
- bg-white border-t border-border px-5 py-3 safe-bottom
- Dois botões lado a lado com gap-3:
  - "Anterior": h-12 flex-1 rounded-lg border border-border text-foreground font-medium hover:bg-muted. Disabled: opacity-40
  - "Próximo": h-12 flex-1 rounded-lg bg-primary text-white font-medium hover:bg-primary/90. Active: scale-[0.98]
- Na última seção: "Próximo" vira "Revisar" com ícone CheckCircle à esquerda, bg-emerald-600
- SEM shadow nos botões
```

---

## Prompt 5 — ChecklistItem (Redesign do componente core)

```
Você é um senior frontend developer com expertise em form components acessíveis para uso em campo.

## Contexto
O ChecklistItem é o componente mais usado do app — cada checklist tem 15-25+ items. O design atual é pesado: borda colorida + bg colorido + indicator circle + badge PMOC + fotos inline + observation toggle, tudo empilhado. Precisa ser dramáticamente simplificado.

## Princípio: "Quiet until interacted"
O item começa discreto. Cor e feedback aparecem APENAS quando o técnico interage. Antes de preencher: neutro, limpo. Depois de preencher: feedback de status sutil.

## Tarefa
Reescrever `src/components/checklist/ChecklistItem.tsx`:

### Card Container
- **Não preenchido:** bg-white rounded-xl border border-border p-4. Limpo, neutro.
- **Preenchido OK:** bg-white rounded-xl border border-emerald-200 p-4. Apenas o border muda para emerald.
- **Preenchido Warning:** bg-white rounded-xl border border-amber-200 p-4
- **Preenchido Critical:** bg-white rounded-xl border border-red-200 p-4
- Transição: transition-colors duration-150
- SEM background colorido. O bg é SEMPRE branco. Cor só no border.

### Header
1. **Label:** text-sm font-medium text-foreground. Direto, sem indicator circle.
2. **PMOC Badge (se required):** Inline com o label. Apenas texto "PMOC" em text-[10px] font-bold uppercase text-primary/60 tracking-wider ml-2. Sem background, sem border. Ultra discreto.
3. **Status indicator (preenchido):** Ao lado direito do label.
   - Preenchido: ícone Check 14px na cor do status (emerald/amber/red)
   - Não preenchido: nada (sem indicator vazio)

### Response Area (abaixo do header, mt-3)

**Options (StatusSelector):**
- Grid de botões: gap-2
- 2 opções: grid-cols-2. 3 opções: grid-cols-3. 4+: grid-cols-2
- Botão não selecionado: h-11 rounded-lg border border-border text-sm font-medium text-foreground/70 bg-muted/30 hover:bg-muted/50
- Botão selecionado:
  - OK: bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold
  - Warning: bg-amber-50 text-amber-700 border-amber-300 font-semibold
  - Critical: bg-red-50 text-red-700 border-red-300 font-semibold
- Press: scale-[0.97] transition-transform duration-75
- Haptic: navigator.vibrate(10) on select

**Numeric:**
- Input h-11 rounded-lg border-border bg-white text-foreground pr-10
- Unit label (°C) em absolute right-3 text-muted-foreground text-sm
- Focus: ring-2 ring-primary/20 border-primary

**Text:**
- Textarea min-h-[80px] rounded-lg border-border resize-none
- Focus: mesmos estilos do numeric

### Actions Row (abaixo do response, mt-3)
Layout horizontal com gap-2:

1. **Foto:** Botão compacto: h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted flex items-center gap-1.5
   - Ícone Camera 14px + "Foto" (ou "2 fotos" se já tiver)
   - Se tiver fotos: mostrar thumbnails 32x32 rounded-md inline à direita do botão
   - Remover foto: ícone X 12px no corner do thumbnail

2. **Observação:** Botão compacto similar: ícone MessageSquare 14px + "Nota"
   - Se tiver observação: ícone muda para MessageSquare preenchido (fill) em text-foreground
   - Ao clicar: expand textarea + VoiceInput abaixo do card (com fadeIn 0.2s)

### REMOVER
- Circle indicator de preenchido/não preenchido (à esquerda)
- Background colorido nos cards
- Badge PMOC pesado (com bg e border)
- Scroll horizontal de fotos (simplificar para thumbnails inline)
- Toggle "Adicionar observação" (usar botão compacto integrado na actions row)
```

---

## Prompt 6 — StatusSelector + ProgressBar

```
Você é um senior frontend developer.

## Tarefa 1: Reescrever `src/components/checklist/StatusSelector.tsx`

O StatusSelector é o grid de botões de resposta. Simplificar seguindo as specs do Prompt 5 (section "Options"):

- Props: options (string[]), value (string | null), onChange, statusColorMap (mapping option → 'ok' | 'warning' | 'critical')
- Grid responsivo: auto-cols baseado em qtd de opções
- Estados: unselected, selected (com cor de status), pressed
- Animação: apenas scale-[0.97] no press, 75ms
- Haptic feedback: navigator.vibrate?.(10)
- Acessibilidade: role="radiogroup", aria-checked, focus-visible ring

## Tarefa 2: Reescrever `src/components/checklist/ProgressBar.tsx`

Design minimal:

- Layout: flex items-center gap-3
- Texto esquerda: "5 de 13" em text-xs font-medium text-muted-foreground. Número preenchido em text-foreground font-semibold.
- Barra: flex-1 h-1.5 rounded-full bg-muted overflow-hidden
- Fill: h-full rounded-full bg-primary transition-all duration-500 ease-out
- Se 100%: fill muda para bg-emerald-500
- SEM texto de percentual
- SEM gradient na barra
- SEM indicator/separator animado
```

---

## Prompt 7 — PhotoCapture + VoiceInput (Minimal)

```
Você é um senior frontend developer com expertise em componentes de captura mobile.

## Tarefa 1: Reescrever `src/components/checklist/PhotoCapture.tsx`

### Design
- Botão trigger: compacto (h-9), ícone Camera + texto "Foto" / "N fotos"
- Thumbnails: inline, 36x36 rounded-md, com overlay X no hover/touch
- Input file hidden com capture="environment"
- SEM borda dashed grande
- SEM texto "Tirar foto" grande

### Comportamento
- Click → abre câmera nativa
- Preview: thumbnails pequenos em flex gap-1.5 inline
- Remover: ícone X (16px) com bg-black/50 text-white, absolute top-0.5 right-0.5 do thumbnail
- Manter toda lógica existente de compressão/timestamp/geolocation

## Tarefa 2: Reescrever `src/components/checklist/VoiceInput.tsx`

### Design
- Layout: textarea flex-1 + botão mic
- Textarea: min-h-[72px] rounded-lg border-border text-sm, focus states normais
- Botão mic: h-10 w-10 rounded-lg flex-shrink-0 ml-2 self-end
  - Inativo: border border-border text-muted-foreground hover:bg-muted
  - Gravando: bg-red-500 text-white (sem pulse-ring animation pesada, apenas transition-colors)
- Indicador de gravação: dot vermelho 6px inline + "Ouvindo..." em text-xs text-red-500 abaixo da textarea
- Manter fallback para browsers sem suporte
- Placeholder textarea: "Observação..." (simples)
```

---

## Prompt 8 — StartScreen + CompletionScreen

```
Você é um senior frontend developer.

## Tarefa 1: Reescrever `src/components/checklist/StartScreen.tsx`

A tela de início do checklist (antes de começar a preencher). Deve ser informativa e direta.

### Layout
1. Card com bg-white rounded-2xl border border-border p-6 mx-5 mt-6
2. **Header do card:**
   - Ícone ClipboardCheck em text-primary, 32px
   - "Iniciar Checklist" em text-xl font-bold mt-3
   - Tipo de serviço: badge compacto (Preventiva/Corretiva) em text-xs
3. **Info grid (2 colunas):**
   - Loja | Shopping | Equipamento | Capacidade
   - Label: text-xs text-muted-foreground uppercase tracking-wide
   - Value: text-sm font-medium text-foreground
   - Separator: border-b border-border/50 entre rows
4. **Botão CTA:** full-width, h-12, bg-primary text-white rounded-lg font-semibold mt-6
   - "Começar Checklist →"
5. SEM decorações, gradients, ou animações pesadas. Apenas fadeIn no mount.

## Tarefa 2: Reescrever `src/components/checklist/CompletionScreen.tsx`

A tela pós-finalização. Profissional e confiante, sem ser celebratória demais.

### Layout
1. Container centralizado: flex flex-col items-center text-center px-6 pt-12

2. **Ícone de status:**
   - OK: círculo bg-emerald-50 p-4, ícone Check em text-emerald-600, 32px
   - Pending: círculo bg-amber-50 p-4, ícone AlertTriangle em text-amber-600
   - Return: círculo bg-red-50 p-4, ícone RotateCcw em text-red-600
   - Animação: scaleIn 0.3s

3. **Texto:**
   - "Checklist finalizado" em text-xl font-bold text-foreground mt-4
   - Subtítulo contextual em text-sm text-muted-foreground mt-1
     - OK: "Serviço concluído com sucesso"
     - Pending: "Existem pendências a resolver"
     - Return: "Retorno necessário"

4. **Card de resumo:**
   - bg-muted/30 rounded-xl p-4 mt-6 w-full max-w-sm
   - Loja + Shopping + Data em text-sm
   - Resultado do serviço com cor de status

5. **Sync status:**
   - Dot colorido 6px + texto em text-xs text-muted-foreground mt-4

6. **CTA:** Botão full-width mt-8 h-12
   - "Voltar para Ordens de Serviço" bg-primary text-white rounded-lg font-semibold

7. **REMOVER:** confetti particles, bounceIn, decorative shapes, gradient header. A tela deve ser limpa e profissional.
```

---

## Prompt 9 — ReportSummary (Tela de Revisão)

```
Você é um senior frontend developer com expertise em telas de revisão/summary para apps B2B.

## Contexto
A tela de ReportSummary é onde o técnico revisa todos os itens antes de finalizar. Precisa ser scannable — o técnico quer ver rapidamente se esqueceu algo.

## Tarefa
Reescrever `src/components/report/ReportSummary.tsx`:

### Page Header
- "Revisão" em text-xl font-bold
- "Verifique os dados antes de finalizar" em text-sm text-muted-foreground

### Cards

**1. Info Card:**
- bg-white rounded-xl border border-border p-4
- Grid 2-col: Label (text-xs text-muted-foreground) + Value (text-sm font-medium)
- Items: Loja, Shopping, Tipo, Equipamento, Técnico
- Clean, sem ícones decorativos

**2. Progress Summary:**
- Barra de progresso com "X de Y itens preenchidos"
- Se incompleto: text-amber-600 "Faltam N itens obrigatórios"

**3. Issues Card (se houver itens não-OK):**
- border-l-4 border-amber-400 bg-amber-50/50 rounded-r-xl p-4
- Título: "Atenção" em font-semibold text-amber-800
- Lista de itens com valor/status, text-sm

**4. Section Cards (collapsible):**
- Header com nome da seção + badge "5/8" em text-xs bg-muted px-2 py-0.5 rounded-md
- Click para expandir/colapsar
- Items: label + value alinhado à direita
- Value colorido por status (emerald/amber/red/gray)
- Não preenchido: "—" em text-muted-foreground/40

**5. Service Result Selection:**
- "Resultado do Serviço" em text-base font-semibold mt-6
- 3 opções em stack vertical com gap-2:
  - Cada uma: h-14 rounded-xl border p-4 flex items-center gap-3
  - Ícone + texto
  - Selecionado: border-2 com cor do status + bg sutil
  - Não selecionado: border-border

**6. Return Justification (condicional):**
- Textarea normal com label "Justificativa do retorno *"
- Aparece com fadeIn se "Retorno necessário" selecionado

**7. Observações Gerais:**
- VoiceInput component
- Label: "Observações gerais (opcional)"

### Validation Alert
- Se houver erros: banner fixo no bottom, bg-red-50 text-red-700 text-sm p-3 rounded-t-xl
- Texto: "Preencha os N itens obrigatórios restantes"

### Footer Actions
- "Voltar": outline, h-12, flex-1
- "Finalizar Checklist": bg-emerald-600 text-white h-12 flex-1, disabled se incompleto
```

---

## Prompt 10 — Verificação Final + Polish

```
Você é um senior frontend developer fazendo code review de design.

## Tarefa
Faça uma varredura em TODOS os componentes de UI do projeto e verifique consistência:

### Checklist de consistência:

1. **Sem gradients residuais:** Grep por "gradient", "vobi-gradient", "vobi-gradient-mesh" em todos os .tsx. Remover se encontrar (exceto globals.css se mantido como utility de emergência).

2. **Sem noise-overlay:** Grep por "noise-overlay" e remover todas as ocorrências em componentes.

3. **Sem glass-surface em componentes:** Grep por "glass-surface". Substituir por "bg-white border-b border-border" ou similar.

4. **Sem font-extrabold:** Grep por "font-extrabold". Substituir por "font-bold".

5. **Sem shadow-lg/shadow-xl em cards:** Grep por "shadow-lg", "shadow-xl" em componentes. Máximo permitido: shadow-sm.

6. **Sem animate-bounceIn, animate-pulse-ring, confetti:** Grep e remover.

7. **Border-radius consistente:** Cards = rounded-xl. Botões/Inputs = rounded-lg. Badges = rounded-md.

8. **Touch targets:** Todos os botões ≥ h-11 (44px) ou h-12 (48px). Verificar com grep por "h-8", "h-9" em botões (h-9 é aceitável para botões secundários/compactos inline, mas CTAs devem ser h-11+).

9. **Cores de status consistentes:**
   - emerald para OK/success
   - amber para warning/pending
   - red para critical/error
   - Verificar que não há "green-" ou "yellow-" (usar emerald/amber)

10. **Espaçamento:** Verificar que padding de página é px-5 (20px) consistente. Gap entre cards é gap-3 ou gap-4 consistente.

11. **Rodar:** `npm run typecheck && npm run lint && npm run build` para garantir que nada quebrou.

Corrija qualquer inconsistência encontrada.
```

---

## Ordem de Execução Recomendada

| # | Prompt | Arquivo(s) | Dependência |
|---|--------|-----------|-------------|
| 0 | Design System | globals.css | — |
| 1 | Login | login/page.tsx | Prompt 0 |
| 2 | Auth Layout | (auth)/layout.tsx, SyncIndicator | Prompt 0 |
| 3 | Service Orders | service-orders/*, ServiceOrderCard, ServiceOrderList | Prompt 0, 2 |
| 4 | Checklist Form | ChecklistForm.tsx | Prompt 0, 2 |
| 5 | Checklist Item | ChecklistItem.tsx | Prompt 0, 4 |
| 6 | StatusSelector + ProgressBar | StatusSelector.tsx, ProgressBar.tsx | Prompt 0, 5 |
| 7 | PhotoCapture + VoiceInput | PhotoCapture.tsx, VoiceInput.tsx | Prompt 0, 5 |
| 8 | StartScreen + CompletionScreen | StartScreen.tsx, CompletionScreen.tsx | Prompt 0 |
| 9 | ReportSummary | ReportSummary.tsx | Prompt 0, 5, 6 |
| 10 | Verificação Final | Todos | Todos anteriores |

---

## Princípios Gerais (Aplicar em TODOS os prompts)

1. **Menos é mais.** Na dúvida, remova.
2. **Branco é o novo gradient.** Espaço em branco > decoração.
3. **Cor como signal, não como decoration.** Azul Vobi = ação/active. Emerald/Amber/Red = status. Tudo mais é neutro.
4. **Tipografia faz o trabalho pesado.** Hierarquia vem de peso (400→700) e tamanho — não de cor ou decoração.
5. **Performance > Beleza.** Sem backdrop-blur, sem gradients complexos, sem animações pesadas. O técnico pode estar num Android de R$800.
6. **Consistência > Criatividade.** Mesmo border-radius, mesmo spacing, mesmas cores em todos os componentes.
