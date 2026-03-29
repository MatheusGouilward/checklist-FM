# Vobi — Checklist de Execução de Serviço (MVP)

MVP de checklist pós-visita técnica para manutenção de lojas em shopping centers.
Módulo da plataforma Vobi para registro digital de serviços de HVAC/ar-condicionado,
substituindo processos manuais (papel, WhatsApp, planilhas).

@docs/PRD - Checklist de Execução de Serviço - Vobi.pdf
@docs/discovery-vobi-vertical-shopping.html

## Contexto de Negócio

- **Produto:** Vobi (SaaS de gestão de obras, 70k+ usuários no Brasil)
- **Vertical nova:** Manutenção em lojas de shopping centers
- **Caso de uso do MVP:** Técnico faz login → vê suas ordens de serviço → seleciona a OS → preenche checklist no celular → gestor e lojista recebem relatório
- **Regulamentação:** Checklist deve cobrir itens obrigatórios do PMOC (ANVISA, Portaria 3.523/1998)
- **3 personas:** Técnico de campo (usuário primário), Gestor da empresa (cliente Vobi), Lojista (cliente final)
- **Escopo FM:** Manutenção de AC/HVAC é apenas UM tipo de serviço de Facilities Management. A arquitetura deve suportar futuros tipos de serviço (elétrica, hidráulica, etc.) mesmo que o MVP implemente apenas HVAC.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) — SSR para portal web, mas foco é no PWA mobile
- **Linguagem:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3 — utility-first, responsivo, mobile-first
- **Componentes UI:** shadcn/ui — componentes acessíveis, customizáveis, sem lock-in
- **State Management:** Zustand — leve, simples, funciona com persistência offline
- **Offline & Sync:** Dexie.js (IndexedDB wrapper) — armazenamento local offline-first
- **Formulários:** React Hook Form + Zod — validação tipada, performático
- **PDF Generation:** @react-pdf/renderer — geração client-side do relatório
- **Speech-to-text:** Web Speech API (nativa do browser) — sem dependência externa
- **IA (resumo):** Vercel AI SDK + Anthropic Claude — geração de resumo para lojista
- **Database:** Supabase (PostgreSQL + Auth + Realtime) — backend completo, rápido de configurar
- **Email:** Resend — API moderna de email transacional
- **Deploy:** Vercel — zero-config para Next.js, edge functions
- **Testes:** Vitest + Testing Library — rápido, TypeScript nativo

### Por que essa stack

O case pede um MVP funcional que pode ser construído com Loveable/Replit/similar. A stack acima
é produção-ready mas rápida de implementar. Next.js + Supabase dá backend completo sem criar API
manual. PWA com Dexie.js resolve o requisito offline-first sem precisar de React Native.
Zustand + Dexie persistem estado local automaticamente — técnico preenche offline, synca depois.

## Development

### Setup
```bash
npx create-next-app@latest vobi-checklist --typescript --tailwind --app --src-dir
cd vobi-checklist
npm install zustand dexie dexie-react-hooks react-hook-form @hookform/resolvers zod
npm install @react-pdf/renderer ai @ai-sdk/anthropic resend
npm install -D vitest @testing-library/react @testing-library/jest-dom happy-dom
npx shadcn@latest init
```

### Common Commands
```bash
npm run dev           # Dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm test              # Vitest (run all)
npm test -- --run     # Vitest (run once, no watch)
```

### Verification (RODAR SEMPRE após mudanças)
```bash
npm run typecheck && npm run lint && npm test -- --run && npm run build
```
Preferir rodar teste individual (`npm test -- src/lib/__tests__/checklist.test.ts`) antes do suite completo.

## Arquitetura

```
src/
├── app/                    # Next.js App Router
│   ├── login/              # Tela de login (Supabase Auth)
│   │   └── page.tsx
│   ├── (auth)/             # Rotas autenticadas (layout com auth guard)
│   │   ├── service-orders/ # Lista de Ordens de Serviço do técnico
│   │   │   └── page.tsx    # Tela principal pós-login
│   │   ├── checklist/      # Fluxo principal do checklist
│   │   │   ├── [id]/       # Checklist específico (vinculado a uma OS)
│   │   │   └── new/        # Criar novo checklist
│   │   ├── dashboard/      # Lista de checklists (gestor)
│   │   └── layout.tsx      # Auth guard + user context provider
│   ├── share/[token]/      # Visualização pública do relatório (lojista)
│   ├── api/                # Route handlers
│   │   ├── checklist/      # CRUD checklist
│   │   ├── report/         # Geração PDF
│   │   ├── notify/         # Envio de email
│   │   └── ai/summary/    # Resumo por IA
│   ├── layout.tsx
│   └── page.tsx            # Redirect → /login ou /service-orders
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Componentes de autenticação
│   │   └── LoginForm.tsx
│   ├── service-orders/     # Componentes de OS
│   │   ├── ServiceOrderList.tsx
│   │   └── ServiceOrderCard.tsx
│   ├── checklist/          # Componentes do checklist
│   │   ├── ChecklistForm.tsx
│   │   ├── ChecklistItem.tsx
│   │   ├── ChecklistSection.tsx
│   │   ├── PhotoCapture.tsx
│   │   ├── VoiceInput.tsx
│   │   ├── ProgressBar.tsx
│   │   └── StatusSelector.tsx
│   └── report/             # Componentes do relatório
│       ├── ReportSummary.tsx
│       └── ReportPDF.tsx
├── lib/
│   ├── db/                 # Dexie (IndexedDB) — offline storage
│   │   ├── schema.ts       # Schema do banco local (inclui service_orders)
│   │   └── sync.ts         # Lógica de sincronização com Supabase
│   ├── supabase/           # Supabase client & types
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── types.ts        # Database types (inclui service_orders, service_categories)
│   │   └── middleware.ts   # Helper functions para o auth middleware
│   ├── checklist/
│   │   ├── template.ts     # Template do checklist HVAC/PMOC
│   │   ├── types.ts        # Types do checklist
│   │   └── validation.ts   # Zod schemas
│   ├── ai/                 # Geração de resumo por IA
│   └── email/              # Templates e envio de email
├── stores/                 # Zustand stores
│   ├── auth-store.ts       # Sessão do usuário logado (id, name, companyId, role)
│   ├── checklist-store.ts  # Estado do checklist em andamento
│   └── sync-store.ts       # Estado de sincronização
├── hooks/                  # Custom hooks
│   ├── useChecklist.ts
│   ├── useOfflineSync.ts
│   ├── useVoiceInput.ts
│   └── useCamera.ts
└── types/                  # Types globais
    └── index.ts
```

### Fluxo de dados (offline-first)

1. Técnico faz login (Supabase Auth) → sessão salva localmente
2. App carrega Ordens de Serviço atribuídas ao técnico → salva no IndexedDB
3. Técnico seleciona OS → dados do contexto (loja, shopping, equipamento) vêm pré-preenchidos
4. Técnico preenche checklist → dados salvos em IndexedDB (Dexie) imediatamente
5. Auto-save a cada campo via Zustand persist + Dexie
6. Quando online → sync queue envia para Supabase
7. Supabase trigger → chama API de notificação (email gestor + lojista)
8. Relatório PDF gerado on-demand (server-side)

### Modelo de dados principal

```typescript
// === NOVA: Categoria de Serviço (expansível para outros tipos de FM) ===
interface ServiceCategory {
  id: string;                    // ex: 'hvac', 'electrical', 'plumbing'
  name: string;                  // ex: 'HVAC / Ar-Condicionado'
  templateId: string;            // ID do template de checklist associado
  active: boolean;
}

// === NOVA: Ordem de Serviço (contexto pré-preenchido pelo gestor) ===
interface ServiceOrder {
  id: string;                    // UUID
  companyId: string;
  technicianId: string;          // Técnico atribuído
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate: Date;
  // Dados do local (pré-preenchidos pelo gestor)
  storeName: string;
  storeContact?: string;         // Telefone/email do lojista
  shoppingName: string;
  // Dados do equipamento
  equipmentModel: string;
  equipmentCapacity: string;
  equipmentLocation?: string;    // Ex: "Teto da loja, acesso pela escada lateral"
  // Tipo de serviço
  serviceCategory: string;       // FK para service_categories.id (ex: 'hvac')
  serviceType: 'preventive' | 'corrective' | 'installation';
  // Metadados
  notes?: string;                // Observações do gestor para o técnico
  createdAt: Date;
  checklistId?: string;          // Preenchido quando o técnico iniciar o checklist
}

// === Checklist (agora vinculado a uma OS) ===
interface Checklist {
  id: string;                    // UUID
  serviceOrderId: string;        // FK para a Ordem de Serviço
  status: 'draft' | 'in_progress' | 'completed';
  serviceResult: 'ok' | 'pending_issue' | 'return_needed' | null;
  createdAt: Date;
  completedAt: Date | null;
  syncedAt: Date | null;         // null = não sincronizado ainda
  // Contexto (copiado da OS no momento da criação — imutável)
  storeName: string;
  shoppingName: string;
  equipmentModel: string;
  equipmentCapacity: string;
  serviceType: 'preventive' | 'corrective' | 'installation';
  technicianId: string;
  technicianName: string;
  // Itens
  sections: ChecklistSection[];
  // Extras
  photos: Photo[];
  observations: string;
  returnJustification?: string;
  signature?: string;            // Base64 da assinatura (Could Have)
}

interface ChecklistSection {
  id: string;
  title: string;                 // ex: "Filtros e Qualidade do Ar"
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  label: string;                 // ex: "Estado dos filtros de ar"
  required: boolean;             // PMOC obrigatório
  responseType: 'options' | 'numeric' | 'text';
  options?: string[];            // ex: ["OK", "Necessita Troca", "Substituído"]
  value: string | number | null;
  photos: Photo[];
  observation?: string;
}
```

## Code Style & Convenções

- **Naming:** PascalCase para componentes, camelCase para funções/variáveis, kebab-case para arquivos
- **Componentes:** Functional components only. Props com interface (não type). Exportar como named export.
- **Imports:** Absolute imports via `@/` (configurado no tsconfig). Ordem: react → next → libs externas → @/ internos
- **Idioma do código:** Inglês para código (variáveis, funções, types). Português para strings de UI e labels.
- **Checklist template:** Itens do checklist HVAC/PMOC definidos em `src/lib/checklist/template.ts` como constante. Nunca hardcoded nos componentes.
- **Offline-first:** Todo state que o técnico preenche DEVE persistir em IndexedDB. Nunca depender apenas de React state em memória.
- **Touch targets:** Botões de ação mínimo 44x44px (idealmente 48-56px). Usar `min-h-12 min-w-12` no Tailwind.
- **Mobile-first:** Breakpoints: mobile default → `md:` para tablet → `lg:` para desktop. O design mobile é o principal.

## Regras de negócio críticas

1. **Zero perda de dados:** Auto-save a cada campo. Se o app fechar, dados DEVEM persistir no IndexedDB.
2. **Offline 100%:** Checklist funciona sem internet. Fotos salvas localmente. Sync quando voltar online.
3. **PMOC:** Itens marcados como `required: true` no template não podem ser pulados. Validar antes de finalizar.
4. **Status "Retorno Necessário":** Exige campo `returnJustification` preenchido (não pode ser vazio).
5. **Fotos:** Timestamp automático (date/hora) + geolocalização quando disponível. Captura direto da câmera, sem galeria.
6. **Notificação:** Email para gestor em até 30s após sync. Email para lojista configurável (automático ou com aprovação).
7. **Login = identidade do técnico:** O login via Supabase Auth identifica automaticamente o técnico (nome, ID, companyId). Elimina campo manual de nome.
8. **OS como fonte de dados:** Os dados de contexto (loja, shopping, equipamento, tipo) vêm da Ordem de Serviço criada pelo gestor. O técnico NÃO digita esses dados — apenas seleciona a OS.
9. **Template por categoria de serviço:** O template de checklist é determinado pela serviceCategory da OS. MVP implementa apenas HVAC, mas a arquitetura deve suportar outras categorias (usar templateId na service_categories).

## Common Gotchas

- **Web Speech API:** Não funciona em todos os browsers. Sempre ter fallback para input de texto. Verificar `window.SpeechRecognition || window.webkitSpeechRecognition`.
- **Camera API:** Usar `<input type="file" accept="image/*" capture="environment">` para acesso direto à câmera em mobile. Não usar getUserMedia (mais complexo, menos suporte).
- **IndexedDB + SSR:** Dexie só funciona no client. Usar `'use client'` nos componentes que acessam o banco. Verificar `typeof window !== 'undefined'` antes de acessar.
- **PWA Service Worker:** Configurar com `next-pwa` ou `@serwist/next`. O service worker deve cachear o shell do app + assets estáticos. Dados ficam no IndexedDB, não no cache.
- **Supabase RLS:** Configurar Row Level Security para que técnicos só vejam seus próprios checklists/OS e gestores vejam todos da empresa.
- **PDF no mobile:** `@react-pdf/renderer` é pesado. Gerar PDF server-side (route handler) e enviar link. Não gerar no dispositivo do técnico.
- **Supabase Auth + Middleware:** O refresh de sessão deve ser feito via middleware do Next.js (src/middleware.ts). Sem isso, a sessão expira e o técnico perde acesso silenciosamente.
- **Login offline:** Se o técnico já logou antes e a sessão está no cookie, o app deve funcionar offline. Se nunca logou, precisa de conexão para o primeiro login.
- **OS cacheadas no IndexedDB:** Ao fazer login (ou ao voltar online), buscar as OS pendentes do Supabase e cachear no Dexie. O técnico navega nas OS offline.

## Git & Workflow

- **Branch naming:** `feature/nome-curto`, `fix/descricao`, `chore/descricao`
- **Commits:** Conventional Commits em português: `feat: adiciona captura de fotos no checklist`
- **PR:** Sempre com descrição do que muda e screenshot se for UI

## Context Management

Ao compactar, preservar: lista de arquivos modificados, status dos testes, task ativa,
e o estado atual do template de checklist PMOC (`src/lib/checklist/template.ts`).

<!-- Este é um documento vivo. Quando descobrir algo não-óbvio sobre este projeto,
adicione aqui. Quando algo estiver desatualizado, remova. Trate como código — revise regularmente. -->
