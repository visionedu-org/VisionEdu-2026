# Phase 2: Autenticação e Onboarding - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Aluno e professor **cadastram-se**, **fazem login** e acessam **apenas** a área do próprio papel — com sessão mock JWT persistente (8h aluno), guards por role e MSW para register/login. Inclui páginas de auth, Zustand auth store, middleware Next.js, handlers MSW e testes Vitest dos fluxos feliz/erro.

**Fora desta fase:** trilha, player de atividades, painel professor completo com dados, tempo real, IA, gamificação real — apenas **esqueletos** de dashboard conforme decisões abaixo.

</domain>

<decisions>
## Implementation Decisions

### Rotas e fluxo de entrada
- **D-01:** Rotas dedicadas: `/login`, `/register/student`, `/register/teacher` (route group `(auth)`)
- **D-02:** Home `/` com dois CTAs: **Sou aluno** / **Sou professor** — ambos levam primeiro a `/login`
- **D-03:** Login antes de cadastro; link secundário **Criar conta** aponta para register do papel correspondente
- **D-04:** Uma página `/login` **sem** `?role=` na URL; seletor **Aluno | Professor** no topo do formulário antes do submit (CTAs da home podem pré-selecionar via estado client-side)

### Formulários e vínculo escolar (CETI)
- **D-05:** Professor: dropdowns encadeados do seed CETI (escola → série → turma); **multi-turma** com botão **Adicionar outra turma** e lista removível
- **D-06:** Aluno: mesmos dropdowns CETI encadeados; **uma turma** no cadastro
- **D-07:** Cadastro aluno e professor: **formulário único** em uma página scrollável (Zod + shadcn Form); sem wizard
- **D-08:** Validação Zod alinhada ao body PDR `POST /api/v1/auth/register` (`role`, `school_id`, `grade`, `class_identifier`, turmas professor como array)

### Sessão mock JWT e guards
- **D-09:** Armazenamento: **Zustand persist** + `localStorage`; no login, **cookie espelhado** para o middleware Next ler
- **D-10:** Expiração: `session_expires_at` em localStorage (checagem no boot); **8 horas** para aluno (AUTH-04); professor pode usar TTL mock separado se necessário, sem decodificar JWT
- **D-11:** Middleware por route group: `(student)/*` exige `student`, `(teacher)/*` exige `teacher`, `(auth)/*` redireciona se já autenticado
- **D-12:** Papel errado na rota → página **403 Sem permissão** com mensagem acessível (não redirect silencioso)

### LGPD, Lei 15.100 e copy
- **D-13:** Checkbox **único obrigatório**: aceite Termos + Política de Privacidade (links para páginas/modais estáticas)
- **D-14:** Cadastro **aluno**: parágrafo curto sobre menor / autorização escola-responsável (matrícula CETI) **acima** do checkbox; mesmo checkbox geral de termos
- **D-15:** Cadastro **aluno**: bloco curto **Lei 15.100/2025** (uso pedagógico supervisionado) + link **Saiba mais**
- **D-16:** Tom **institucional claro** em todos os fluxos auth (Secretaria/Escola, “você”)

### Pós-login, dashboards e UX de erro
- **D-17:** Após login ou cadastro bem-sucedido → **redirect direto** ao dashboard mock do papel
- **D-18:** Dashboard aluno: **esqueleto Fase 3** — cards vazios Trilha / Atividades / Score + saudação e dados escolares do perfil
- **D-19:** Dashboard professor: **esqueleto Fase 4** — cards vazios Turmas / Médias / Lacunas BNCC / Tempo real + lista de turmas do perfil
- **D-20:** **Logout** no header dos layouts `(student)` e `(teacher)`
- **D-21:** Erros de login/cadastro: **inline** nos campos + resumo `role="alert"` no topo (AUTH-03 a11y)

### Claude's Discretion
- Regras exatas de senha Zod (mínimo 8 caracteres sugerido; sem 2FA/OAuth)
- Rotas exatas dos dashboards (`/student/dashboard` vs `(student)/page.tsx`) desde que consistentes com route groups
- Implementação do cookie espelhado (`visionedu_session` ou similar) e nome das páginas estáticas Termos/Privacidade
- Contas demo no README apontando para seed CETI + credenciais MSW
- TTL mock do professor (ex.: 24h) se não especificado pelo usuário

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Produto e requisitos
- `doc/PDR_VisionEdu.md` — RF-001, RF-002, RNF-003; §11.1 auth register/login; schema §9
- `.planning/PROJECT.md` — MVP e-mail/senha; LGPD checkbox adiado completo; Lei 15.100
- `.planning/REQUIREMENTS.md` — AUTH-01 a AUTH-05
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, planos 02-01 a 02-03

### Contexto Fase 1 (herdado)
- `.planning/phases/01-fundacao-frontend-e-camada-mock/01-CONTEXT.md` — shadcn forms, CETI seed, route groups, MSW, estrutura `src/`

### Pesquisa e qualidade
- `.planning/research/ARCHITECTURE.md` — rotas e camadas
- `.planning/research/STACK.md` — Zustand, MSW, Next middleware
- `.cursor/rules/accessibility.mdc` — erros acessíveis, foco, contraste
- `.cursor/rules/responsive-mobile.mdc` — formulários em 360px
- `.cursor/rules/code-architecture.mdc`
- `.cursor/rules/validation-build.mdc`

### Código existente (integração)
- `src/app/(auth)/layout.tsx` — layout centrado auth
- `src/app/(student)/layout.tsx`, `src/app/(teacher)/layout.tsx` — receberão header + logout
- `src/services/auth.service.ts` — estender register + perfil
- `src/lib/api-client.ts` — cliente HTTP para MSW `/api/v1`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Route groups `(auth)`, `(student)`, `(teacher)` com layouts placeholder
- shadcn: `button`, `input`, `label`, `dialog` em `src/components/ui/`
- `AuthService.login` já chama `POST /api/v1/auth/login`
- `apiClient` em `src/lib/api-client.ts`
- Tema: `ThemeProvider`, `ThemeToggle` no root layout
- Home `src/app/page.tsx` — substituir CTA “Em breve: Login” pelos dois CTAs decididos

### Established Patterns
- Fase 1: shadcn só para formulários; paleta institucional; Roboto; light/dark
- MSW + `NEXT_PUBLIC_USE_MOCK` (a completar handlers auth na Fase 2)
- Seed CETI em `src/mocks/data/ceti-seed.ts` (previsto Fase 1) para dropdowns

### Integration Points
- Middleware `src/middleware.ts` (novo) lendo cookie de sessão
- Zustand store `src/features/auth/` ou `src/stores/auth-store.ts`
- Páginas: `src/app/(auth)/login/page.tsx`, `register/student`, `register/teacher`
- Dashboards: `src/app/(student)/dashboard/page.tsx`, `src/app/(teacher)/dashboard/page.tsx`
- MSW handlers: `src/mocks/handlers/auth.ts` — register, login, erros 401/422
- Página 403: `src/app/unauthorized/page.tsx` ou equivalente

</code_context>

<specifics>
## Specific Ideas

- Home mantém identidade VisionEdu / CETI; CTAs claros por persona
- Login: seletor de papel visível (segmented control ou radio group acessível)
- Professor vê turmas cadastradas listadas no dashboard esqueleto
- Copy Lei 15.100 no cadastro aluno prepara Fase 5 sem duplicar modal pesado ainda
- Credenciais demo documentadas no README para teste UAT auth

</specifics>

<deferred>
## Deferred Ideas

- OAuth / magic link (AUTH-06 v2)
- Fluxo LGPD completo com responsáveis (AUTH-07 v2)
- Dados mock completos em dashboards (Fases 3 e 4)
- Modal pesado Lei 15.100 + checklist professor (Fase 5)
- Menu hamburger / navegação inferior aluno (Fase 3)

</deferred>

---

*Phase: 02-autentica-o-e-onboarding*
*Context gathered: 2026-05-21*
