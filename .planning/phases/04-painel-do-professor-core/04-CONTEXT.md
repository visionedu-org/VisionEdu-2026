# Phase 4: Painel do Professor (Core) - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning
**Source:** ROADMAP + Fase 2/3 defaults (discuss-phase não executado — defaults válidos para planejar)

<domain>
## Phase Boundary

Jornada da **Professora Regina**: dashboard de turma com médias e top erros mock, **relatório de lacunas BNCC** por competência, **criação de materiais** e **avaliações diagnósticas MCQ** (tag BNCC por questão), **compartilhamento** via link copiável e QR Code. Layout professor **responsivo** (desktop na sala dos professores + mobile em aula). MSW teacher CRUD alinhado ao PDR §11.

**Fora desta fase:** tempo real SSE/ping (Fase 5), tutor IA (Fase 6), painel SEDUC, upload real de PDF para storage, correção dissertativa.

</domain>

<decisions>
## Implementation Decisions

### Layout e navegação professor
- **D-01:** Rotas em `src/app/teacher/*` (padrão Fase 3 aluno)
- **D-02:** **Desktop (md+):** sidebar fixa com links Turmas, Criar material, Criar diagnóstico, Dashboard
- **D-03:** **Mobile:** mesma nav em drawer/Sheet acionado por botão menu no header (shadcn `sheet` se disponível, senão painel colapsável)
- **D-04:** `max-w-5xl` conteúdo centralizado; grids `sm:grid-cols-2` nos cards
- **D-05:** Header `AuthHeader` + logout mantidos (Fase 2 D-20)

### Turmas e dashboard (TEACH-01, TEACH-06)
- **D-06:** Lista de turmas do `user.teacher_classes` em `/teacher/turmas` e seletor no dashboard
- **D-07:** Dashboard turma `/teacher/turmas/[classId]` — cards: média da turma, total alunos mock, **top 3 conceitos com maior taxa de erro**
- **D-08:** Link “Ver lacunas BNCC” → `/teacher/turmas/[classId]/bncc`
- **D-09:** Substituir placeholders “Em breve — Fase 4/5” nos cards principais

### Relatório BNCC (TEACH-02)
- **D-10:** Tabela/lista: código competência (ex. EM13MAT302), descrição curta, **domínio %**, badge dificuldade (Alta/Média/Baixa)
- **D-11:** Ordenação padrão: menor domínio primeiro (lacunas prioritárias no topo)
- **D-12:** Fixture `bncc-competencies.ts` com ≥6 competências mock por turma

### Criador de conteúdo (TEACH-03)
- **D-13:** Rota `/teacher/conteudos/novo` — formulário único: título, descrição, disciplina (select), série, turma (CETI seed), tipo (`text` | `video_link` | `pdf_upload`)
- **D-14:** Upload PDF: apenas UI (input file + nome do arquivo exibido) — sem storage real
- **D-15:** POST mock `POST /api/v1/teachers/contents` → redirect para compartilhamento se for atividade, senão toast sucesso

### Builder diagnóstico MCQ (TEACH-04)
- **D-16:** Rota `/teacher/diagnosticos/novo` — adicionar/remover questões dinamicamente (mín 1, máx 10)
- **D-17:** Cada questão: enunciado, 4 alternativas, **select habilidade BNCC** (mesma fixture)
- **D-18:** POST mock `POST /api/v1/teachers/activities` retorna `{ id, shareUrl }` → redirect `/teacher/compartilhar/[id]`

### Compartilhamento (TEACH-05)
- **D-19:** Página `/teacher/compartilhar/[activityId]` — URL aluno `origin/student/atividade/{id}` + `/student/entrar?code={id}`
- **D-20:** Botão **Copiar link** com feedback acessível (`aria-live`)
- **D-21:** **QR Code** renderizado em canvas/SVG via lib `qrcode` (dependência leve)
- **D-22:** Integração com atividades demo Fase 3 (`DEMO_ACTIVITY_ID` em fixture compartilhada ou novo UUID no POST)

### Claude's Discretion
- `TeacherService` espelhando `StudentService`
- Handlers em `src/mocks/handlers/teachers.ts`
- Validação Zod em `src/lib/validations/teacher.ts`
- Tempo real card no dashboard: link desabilitado “Disponível na Fase 5”
- Vitest: criar conteúdo + share URL + BNCC list não vazia

</decisions>

<canonical_refs>
## Canonical References

### Produto
- `doc/PDR_VisionEdu.md` — RF-005 a RF-009, schema contents/activities
- `.planning/REQUIREMENTS.md` — TEACH-01 a TEACH-06
- `.planning/ROADMAP.md` — Phase 4 plans 04-01 a 04-04
- `.planning/PROJECT.md` — professor desktop + mobile

### Fases anteriores
- `.planning/phases/02-autentica-o-e-onboarding/02-CONTEXT.md` — D-19 dashboard professor esqueleto
- `.planning/phases/03-experi-ncia-do-aluno-core/03-CONTEXT.md` — deep link aluno D-12
- `.planning/phases/03-experi-ncia-do-aluno-core/03-RESEARCH.md` — padrão MSW/services

### Código
- `src/app/teacher/layout.tsx`, `src/app/teacher/dashboard/page.tsx`
- `src/features/auth/components/teacher-dashboard-skeleton.tsx`
- `src/mocks/data/ceti-seed.ts`, `src/mocks/data/student-fixtures.ts`
- `src/services/student.service.ts` — analogia

### Qualidade
- `.cursor/rules/responsive-mobile.mdc`
- `.cursor/rules/accessibility.mdc`
- `.cursor/rules/code-architecture.mdc`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable
- `TeacherDashboardSkeleton` — turmas como chips; evoluir para dashboard real
- `register-teacher-form` + `useCetiOptions` — séries/turmas CETI
- `student-fixtures` / `students.ts` — padrão handlers; atividades aluno já têm UUID demo
- shadcn: button, input, label, dialog

### Integration
- Registrar `teacherHandlers` em `src/mocks/handlers/index.ts`
- Novas rotas no middleware matcher já cobre `/teacher/*`
- Share URL aponta para rotas Fase 3 implementadas

</code_context>

<deferred>
## Deferred Ideas

- SSE tempo real turma (Fase 5)
- Upload PDF para S3/backend
- Editor rich text materiais
- BNCC export PDF/CSV (v2 ADMIN)

</deferred>

---

*Phase: 04-painel-do-professor-core*
*Context gathered: 2026-05-21*
