# Phase 1: Fundação Frontend e Camada Mock - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning
**Note:** Discuss-phase parcial — Área 1 confirmada pelo usuário; áreas 2–4 com defaults da pesquisa (recomendações do /gsd-discuss-phase).

<domain>
## Phase Boundary

Repositório executável com Next.js 15 App Router, TypeScript, Tailwind, design tokens, tema light/dark, estrutura de pastas para features/mocks/types, tipos alinhados ao PDR §9, seed CETI, cliente HTTP abstrato e MSW respondendo rotas base `/api/v1/*`. **Sem** telas de auth, dashboard ou IA — isso é Fase 2+.

</domain>

<decisions>
## Implementation Decisions

### Design system (confirmado pelo usuário)
- **D-01:** Híbrido — shadcn/ui apenas para formulários e dialogs; demais UI com primitives Tailwind custom em `src/components/ui`
- **D-02:** Paleta institucional educação pública (azul/verde), contraste WCAG 2.1 AA desde tokens CSS
- **D-03:** Tipografia **Roboto** única via `next/font/google` (subset `latin`, `display: swap`)
- **D-04:** Light + dark com **toggle explícito** no layout (usar `next-themes`; não só `prefers-color-scheme`)

### Organização do repositório (default pesquisa — não discutido)
- **D-05:** App Next.js na **raiz** do repo VisionEdu (um `package.json`, sem `apps/web`)
- **D-06:** Estrutura: `src/app`, `src/components/ui`, `src/lib`, `src/services`, `src/features`, `src/mocks`, `src/types`
- **D-07:** Route groups vazios na Fase 1: `(auth)`, `(student)`, `(teacher)` com `layout.tsx` placeholder
- **D-08:** Alias TypeScript `@/*` → `src/*`

### Seed piloto CETI (default pesquisa)
- **D-09:** Fixtures **hardcoded** do CETI Luiz Ubiraci (GRE 16ª, Vila Nova do Piauí) em `src/mocks/data/ceti-seed.ts` — turmas 1º–3º A/B, usuários demo documentados no README
- **D-10:** IDs UUID estáveis nos seeds para reprodutibilidade de testes

### MSW e ambiente (default pesquisa)
- **D-11:** MSW ativo em **dev (browser)** via `MswProvider` client-only no root layout; handlers em `src/mocks/handlers/`
- **D-12:** MSW também em **Vitest** via `src/mocks/node.ts` para testes de `AuthService`
- **D-13:** Fase 1: handlers **happy path** + helper `withLatency(ms)` opcional; cenários de erro na Fase 2
- **D-14:** `NEXT_PUBLIC_USE_MOCK=true` default em `.env.example`; cliente HTTP em `src/lib/api-client.ts` aponta para `/api/v1`

### Serviços e tipos
- **D-15:** Interfaces em `src/services/*.ts` (`AuthService`, stub mínimo); implementação mock delega ao `apiClient`
- **D-16:** Tipos de domínio em `src/types/domain.ts` espelhando PDR §9 (`User`, `Student`, `Teacher`, `School`, `Class`, `Activity`, `StudentActivity`, `DiagnosticResult`)

### Performance / tooling (PROJECT constraints)
- **D-17:** `@next/bundle-analyzer` configurado; script `npm run analyze`; README documenta meta ≤300KB gzip
- **D-18:** ESLint + Prettier alinhados às regras em `.cursor/rules/`

### Claude's Discretion
- Versões exatas de pacotes (patch) dentro de Next 15 / React 19 / Tailwind 4
- Quais componentes shadcn instalar na Fase 1 (mínimo: Button, Input, Label, Dialog, Form)
- Copy da landing Fase 1 (placeholder institucional)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Produto e requisitos
- `doc/PDR_VisionEdu.md` — Stack §7.1, schema §9, endpoints §11, RNF-001/002
- `.planning/PROJECT.md` — Escopo frontend-only, mocks, core value
- `.planning/REQUIREMENTS.md` — INFR-01 a INFR-04
- `.planning/ROADMAP.md` — Phase 1 goal e success criteria

### Pesquisa
- `.planning/research/STACK.md` — MSW, Zustand, bundle analyzer
- `.planning/research/ARCHITECTURE.md` — Camadas e rotas propostas
- `.planning/research/PITFALLS.md` — Bundle 300KB, contratos mock

### Qualidade do projeto
- `.cursor/rules/code-architecture.mdc`
- `.cursor/rules/validation-build.mdc`
- `.cursor/rules/performance.mdc`
- `.cursor/rules/accessibility.mdc`
- `.cursor/rules/responsive-mobile.mdc`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum — greenfield (apenas `.planning/`, `doc/`, `.cursor/rules/`)

### Established Patterns
- GSD roadmap já define 3 planos: 01-01 scaffold, 01-02 tipos+client, 01-03 MSW

### Integration Points
- Fase 2 conectará auth UI aos handlers MSW criados nesta fase
- Fase 5 reutilizará padrão SSE iniciado em handlers mock

</code_context>

<specifics>
## Specific Ideas

- Logo/nome **VisionEdu** na home placeholder
- README com credenciais demo (aluno/professor) apontando para seed CETI
- Toggle tema visível no header do layout root

</specifics>

<deferred>
## Deferred Ideas

- Storybook completo — Fase 7 ou backlog
- Service Worker / PWA — pós-MVP
- Monorepo `apps/web` — só se backend repo separado no futuro

### Discuss incompleto
- Áreas 2–4 do discuss-phase podem ser refinadas em `/gsd-discuss-phase 1` antes de executar; defaults acima são válidos para planejar.

</deferred>

---

*Phase: 01-fundacao-frontend-e-camada-mock*
*Context gathered: 2026-05-20*
