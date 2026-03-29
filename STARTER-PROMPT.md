# Starter Prompt — Colar no Claude Code CLI

Copie o bloco abaixo e cole como primeiro prompt ao abrir o Claude Code na pasta do projeto.

---

```
Você é o desenvolvedor principal do MVP "Checklist de Execução de Serviço" da Vobi — uma plataforma SaaS de gestão de obras (70k+ usuários) que está expandindo para a vertical de manutenção em lojas de shopping centers.

Antes de começar qualquer coisa, leia o CLAUDE.md na raiz do projeto e os rules files em .claude/rules/. Eles contêm a arquitetura completa, modelo de dados, regras de negócio críticas, padrões de UX e convenções de código.

## O que você vai construir

Um PWA mobile-first para técnicos de HVAC preencherem um checklist pós-visita de revisão de ar-condicionado em lojas de shopping. O app é offline-first (técnico pode estar em subsolo sem sinal) e gera automaticamente um relatório para o gestor e o lojista.

## Stack definida (não mudar)

Next.js 14+ (App Router) · TypeScript strict · Tailwind CSS · shadcn/ui · Zustand · Dexie.js (IndexedDB) · React Hook Form + Zod · Supabase · Resend · Vitest

## Ordem de implementação

Siga esta sequência. Cada passo deve ter testes e funcionar standalone antes de avançar:

1. **Setup do projeto** — Next.js + TypeScript + Tailwind + shadcn/ui. Configurar tsconfig com paths @/. Adicionar script "typecheck" no package.json.

2. **Types e template do checklist** — Criar src/lib/checklist/types.ts com as interfaces (Checklist, ChecklistSection, ChecklistItem, Photo). Criar src/lib/checklist/template.ts com os 13 itens HVAC/PMOC agrupados em 5 seções (exatamente como descrito no rules file checklist-template.md). Criar src/lib/checklist/validation.ts com Zod schemas. Escrever testes.

3. **Dexie + Zustand (offline-first)** — Criar src/lib/db/schema.ts com schema do Dexie. Criar src/stores/checklist-store.ts com Zustand + persist middleware usando Dexie como storage. Auto-save a cada campo. Seguir o rules file offline-sync.md.

4. **UI do checklist (mobile-first)** — Criar os componentes em src/components/checklist/: ChecklistForm, ChecklistSection, ChecklistItem, StatusSelector, ProgressBar. Seguir o rules file mobile-ux.md (touch targets 48px+, thumb-zone, cores de status, uma seção por vez). Usar shadcn/ui como base.

5. **Captura de fotos** — PhotoCapture.tsx usando <input type="file" accept="image/*" capture="environment">. Fotos com timestamp automático. Salvar como Blob no Dexie.

6. **Input por voz** — VoiceInput.tsx com Web Speech API. Fallback para textarea. Verificar suporte do browser.

7. **Tela de resumo** — ReportSummary.tsx com todos os dados, fotos e status. Compartilhável como link.

8. **Geração de PDF** — Route handler em src/app/api/report/route.ts. Gerar server-side (não no dispositivo do técnico).

9. **Supabase** — Schema PostgreSQL, auth, RLS policies (técnico vê só seus checklists, gestor vê todos da empresa). Sync queue do Dexie → Supabase.

10. **Notificações** — Email via Resend para gestor (automático) e lojista (configurável). Route handler em src/app/api/notify/route.ts.

11. **Resumo por IA** — Vercel AI SDK + Claude para gerar resumo em linguagem natural para o lojista a partir dos dados do checklist.

## Regras inegociáveis

- Rodar `npm run typecheck && npm run lint && npm test -- --run` após cada mudança significativa
- Zero perda de dados: auto-save a cada campo no IndexedDB
- Itens PMOC obrigatórios não podem ser pulados
- Status "Retorno Necessário" exige justificativa
- Touch targets mínimo 44x44px
- Funcionar 100% offline

Comece pelo passo 1. Ao terminar cada passo, me mostre o que foi criado e pergunte se posso validar antes de avançar.
```
