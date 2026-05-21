# Roadmap: VisionEdu Frontend MVP

## Overview

Entrega incremental do **frontend VisionEdu** em 7 fases verticais (modo MVP), cada uma produzindo fluxos testáveis com **dados mockados**. A jornada começa pela fundação Next.js + MSW, passa por autenticação e painéis das personas, adiciona tempo real pedagógico (Lei 15.100), IA socrática simulada e encerra com gamificação e gates de performance/acessibilidade do PDR.

**Fonte de verdade:** `doc/PDR_VisionEdu.md` v1.1  
**Fora de escopo:** backend NestJS, PostgreSQL, Redis, LLM real.

## Phases

- [ ] **Phase 1: Fundação Frontend e Camada Mock** — Scaffold, design tokens, MSW e tipos PDR
- [ ] **Phase 2: Autenticação e Onboarding** — Cadastro aluno/professor, login, guards por papel
- [ ] **Phase 3: Experiência do Aluno (Core)** — Dashboard, trilha, player de atividades, offline
- [x] **Phase 4: Painel do Professor (Core)** — Turmas, BNCC, conteúdo, diagnóstico, QR/link
- [ ] **Phase 5: Tempo Real e Conformidade Legal** — Ping 15s, SSE foco, Lei 15.100 UX
- [ ] **Phase 6: IA Pedagógica (UI + Mock)** — Diagnóstico, trilha adaptativa, tutor socrático
- [x] **Phase 7: Gamificação e Polimento** — XP/badges, bundle, Lighthouse, WCAG

## Phase Details

### Phase 1: Fundação Frontend e Camada Mock

**Goal:** Repositório executável com Next.js, Tailwind, estrutura de pastas, MSW e tipos alinhados ao PDR — pronto para features sem backend.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**UI hint:** no
**Requirements:** INFR-01, INFR-02, INFR-03, INFR-04
**Success Criteria** (what must be TRUE):

  1. `npm run dev` sobe app Next.js com página inicial e layout base
  2. MSW responde pelo menos `GET /api/v1/health` e fixtures de usuário/turma
  3. `AuthService` (mock) pode ser chamado de um componente de teste sem erro de tipo
  4. Bundle analyzer configurado e documentado no README de como medir gzip

**Plans:** 3 plans

Plans:

- [ ] 01-01: Scaffold Next.js 15 + Tailwind + ESLint/Prettier + estrutura `src/features`, `src/mocks`, `src/types`
- [ ] 01-02: Tipos de domínio PDR + seed data CETI piloto + cliente HTTP abstrato
- [ ] 01-03: MSW handlers base (auth, turmas, health) + toggle `NEXT_PUBLIC_USE_MOCK`

### Phase 2: Autenticação e Onboarding

**Goal:** Aluno e professor cadastram-se, fazem login e acessam apenas suas áreas — sessão mock JWT persistente.
**Mode:** mvp
**Depends on:** Phase 1
**UI hint:** yes
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):

  1. Aluno completa cadastro multi-campo e chega ao dashboard mock
  2. Professor completa cadastro com escolas/turmas e chega ao painel mock
  3. Login inválido exibe erro acessível; login válido persiste após refresh (8h aluno)
  4. Usuário `student` não acessa rotas `(teacher)` e vice-versa

**Plans:** 3 plans

Plans:
**Wave 1**

- [ ] 02-01: Páginas register student/teacher com Zod + formulários acessíveis

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 02-02: Login, Zustand auth store, middleware Next.js por role

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 02-03: MSW auth register/login + testes Vitest fluxos feliz/erro

### Phase 3: Experiência do Aluno (Core)

**Goal:** Jornada mobile-first do Thiago: painel, trilha visual e resolução de atividade com autosave offline.
**Mode:** mvp
**Depends on:** Phase 2
**UI hint:** yes
**Requirements:** STUD-01, STUD-02, STUD-03, STUD-04, STUD-05
**Success Criteria** (what must be TRUE):

  1. Aluno vê dashboard com escola, turma, score médio e atividades mock
  2. Trilha mostra pelo menos 3 estados (bloqueado, em progresso, concluído)
  3. Aluno responde MCQ, navega entre questões e vê progresso salvo após reload simulando queda de rede
  4. Layout 360px sem scroll horizontal; controles tocáveis ≥ 44px

**Plans:** 4 plans

Plans:

**Wave 1**

- [ ] 03-01: Layout `(student)` mobile + navegação inferior

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 03-02: Dashboard e trilha horizontal (timeline no dashboard)
- [ ] 03-03: Player atividade `/student/atividade/[id]` + localStorage autosave

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 03-04: MSW student endpoints + entrada via link/QR mock

### Phase 4: Painel do Professor (Core)

**Goal:** Jornada da Professora Regina: métricas de turma, relatório BNCC, criar materiais/diagnósticos e compartilhar.
**Mode:** mvp
**Depends on:** Phase 2
**UI hint:** yes
**Requirements:** TEACH-01, TEACH-02, TEACH-03, TEACH-04, TEACH-05, TEACH-06
**Success Criteria** (what must be TRUE):

  1. Professor vê dashboard turma com médias e top erros mock
  2. Relatório BNCC lista competências com domínio/dificuldade
  3. Professor cria material e avaliação MCQ com tag BNCC por questão
  4. Tela de compartilhamento exibe link copiável e QR Code legível
  5. Mesmas telas usáveis em viewport mobile e desktop

**Plans:** 4 plans

Plans:

**Wave 1**

- [x] 04-01: Layout `(teacher)` responsivo + lista turmas

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-02: Dashboard turma + relatório lacunas BNCC
- [x] 04-03: Form criador conteúdo + builder diagnóstico MCQ/BNCC

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04-04: Compartilhamento link/QR + MSW teacher CRUD

### Phase 5: Tempo Real e Conformidade Legal

**Goal:** Ping de foco do aluno e dashboard SSE do professor, com UX explícita de supervisão pedagógica (Lei 15.100).
**Mode:** mvp
**Depends on:** Phase 3, Phase 4
**UI hint:** yes
**Requirements:** REAL-01, REAL-02, REAL-03, REAL-04
**Success Criteria** (what must be TRUE):

  1. Aluno em atividade dispara ping mock a cada 15s; status muda ao trocar de aba
  2. Professor vê atualização de status alunos via SSE simulado em ≤ 20s
  3. Copy legal visível (uso pedagógico, supervisão) antes/durante aula
  4. Professor deve confirmar "aula supervisionada" para ativar painel tempo real

**Plans:** 3 plans

Plans:

- [ ] 05-01: Hook ping + banner aluno + MSW POST ping
- [ ] 05-02: Página tempo real turma + MSW SSE stream
- [ ] 05-03: Modal conformidade Lei 15.100 + checklist professor

### Phase 6: IA Pedagógica (UI + Mock)

**Goal:** Diagnóstico adaptativo, trilha reorganizada e chat tutor socrático — mocks respeitando regras anti-gabarito do PDR.
**Mode:** mvp
**Depends on:** Phase 3
**UI hint:** yes
**Requirements:** AI-01, AI-02, AI-03, AI-04
**Success Criteria** (what must be TRUE):

  1. Após completar diagnóstico mock, aluno vê lacunas (ex.: pré-requisito matemático)
  2. Trilha exibe módulos de recomposição inseridos antes do módulo da turma
  3. Chat tutor responde em PT-BR sem revelar alternativa correta; termina com pergunta
  4. Teste automatizado falha se resposta mock contiver padrões de gabarito proibidos

**Plans:** 3 plans

Plans:

- [ ] 06-01: Tela resultados diagnóstico + fixture `identified_gaps`
- [ ] 06-02: Visualização trilha adaptativa pós-diagnóstico
- [ ] 06-03: Chat tutor embutido + engine mock socrática + validação anti-gabarito

### Phase 7: Gamificação e Polimento

**Goal:** XP, nível, badges e gates de qualidade (bundle ≤300KB gzip, Lighthouse ≥90, WCAG AA).
**Mode:** mvp
**Depends on:** Phase 3, Phase 5, Phase 6
**UI hint:** yes
**Requirements:** GAME-01, GAME-02, GAME-03, PERF-01, PERF-02, A11Y-01, A11Y-02, A11Y-03
**Success Criteria** (what must be TRUE):

  1. Perfil aluno mostra XP, nível e pelo menos 2 badges desbloqueáveis mock
  2. Conquista exibe feedback textual acessível (aria-live)
  3. Rota entrada aluno ≤ 300KB gzip em build produção
  4. Lighthouse Performance ≥ 90 documentado em VERIFICATION
  5. Auditoria manual checklist WCAG nos fluxos auth, atividade, tutor, tempo real

**Plans:** 3 plans

Plans:

**Wave 1**

- [x] 07-01-PLAN.md — Gamificação UI + MSW profile/submit + achievement toast (GAME-01–03)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 07-02-PLAN.md — Bundle gzip gate ≤300KB + Lighthouse CI ≥90 (PERF-01–02)

**Wave 3** *(blocked on Wave 1 completion)*

- [x] 07-03-PLAN.md — WCAG checklist + keyboard/contrast/alt fixes (A11Y-01–03)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7  
(Phase 5 requer 3 e 4; Phase 7 requer 3, 5, 6)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação Frontend e Camada Mock | 0/3 | Not started | - |
| 2. Autenticação e Onboarding | 0/3 | Not started | - |
| 3. Experiência do Aluno (Core) | 0/4 | Not started | - |
| 4. Painel do Professor (Core) | 2/4 | In progress | 2026-05-21 |
| 5. Tempo Real e Conformidade Legal | 0/3 | Not started | - |
| 6. IA Pedagógica (UI + Mock) | 0/3 | Not started | - |
| 7. Gamificação e Polimento | 3/3 | Complete | 2026-05-21 |

**Totals:** 7 phases | 23 plans | 38 v1 requirements mapped ✓
