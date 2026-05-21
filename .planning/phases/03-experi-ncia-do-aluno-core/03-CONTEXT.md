# Phase 3: Experiência do Aluno (Core) - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning
**Note:** Discuss-phase parcial (áreas 1–2 confirmadas pelo usuário); áreas 3–6 com defaults alinhados ao ROADMAP e Fase 2.

<domain>
## Phase Boundary

Jornada **mobile-first** do aluno (Thiago): dashboard com dados escolares e desempenho, **trilha visual** com estados bloqueado/em progresso/concluído, **player MCQ** com autosave offline, layout utilizável em **360px** (alvos ≥ 44px) e **entrada por link/QR** mock. Inclui layout `(student)`, navegação inferior, componentes de trilha/dashboard, player `/student/atividade/[id]`, helpers `localStorage` e handlers MSW aluno.

**Fora desta fase:** ping 15s, SSE professor, tutor socrático, trilha adaptativa pós-IA, gamificação XP/badges real, painel professor completo.

</domain>

<decisions>
## Implementation Decisions

### Visual da trilha (confirmado)
- **D-01:** Timeline **horizontal** com scroll lateral entre módulos (sem Recharts no MVP)
- **D-02:** Estados por **cor + ícone** (bloqueado cinza, em progresso destaque, concluído verde ✓) + `aria-label` em cada nó
- **D-03:** Trilha **somente no dashboard** — seção abaixo dos cards (scroll vertical na home)
- **D-04:** Toque em módulo desbloqueado → `/student/atividade/[id]`; bloqueado → **toast** acessível (não navega)

### Armazenamento offline (confirmado)
- **D-05:** Persistência em **`localStorage`** (não IndexedDB nesta fase)
- **D-06:** Salvar **a cada resposta** ao selecionar alternativa MCQ
- **D-07:** Chave `visionedu:activity:{activityId}` · payload `{ answers: [{ questionId, optionId }], currentIndex, updatedAt }`
- **D-08:** Após reload com rascunho → **banner** “Continuar de onde parou” + botão secundário “Recomeçar” (limpa chave)

### Navegação inferior (default — área não concluída na discussão)
- **D-09:** Barra fixa inferior no layout `student` com 3 abas: **Início** (`/student/dashboard`), **Atividades** (`/student/atividades`), **Perfil** (`/student/perfil` esqueleto Fase 7)
- **D-10:** Ocultar bottom nav na rota `/student/atividade/[id]` (player em tela cheia)
- **D-11:** Itens da nav com ícone + rótulo; área de toque mínima **44×44px**; `aria-current="page"` na aba ativa

### Entrada link/QR (default)
- **D-12:** Rota canônica **`/student/atividade/[id]`** — deep link compartilhado pelo professor (Fase 4)
- **D-13:** Middleware exige sessão `student`; sem login → redirect `/login` com `?next=` preservado
- **D-14:** ID inválido ou atividade inexistente no mock → página de erro amigável em PT-BR (não 404 genérico)

### Player de MCQ (default)
- **D-15:** **Uma questão por tela**; barra inferior fixa: Anterior | indicador `3/10` | Próxima
- **D-16:** Alternativas em **radio group** acessível (`fieldset` + `legend`); seleção única
- **D-17:** Barra de progresso linear no topo do player (`aria-valuenow`)
- **D-18:** Última questão: botão **Enviar** (mock POST) em vez de Próxima; após envio limpar rascunho `localStorage`

### Dashboard com dados mock (default)
- **D-19:** Cards superiores: **Escola/Turma** (do auth store), **Score médio** (%), **Atividades** (concluídas/total)
- **D-20:** Lista resumida de atividades pendentes no card Atividades com link para player
- **D-21:** Substituir placeholders “Em breve — Fase 3” por dados MSW reais
- **D-22:** Saudação `Olá, {primeiro nome}` mantida do esqueleto Fase 2

### Claude's Discretion
- Tipos `Activity`, `LearningPathModule`, `StudentDashboard` em `src/types/domain.ts` alinhados ao PDR §9
- Serviço `StudentService` em `src/services/student.service.ts` delegando ao `apiClient`
- Toast: componente leve em `src/components/ui/` ou `sonner` se já no projeto — preferir sem nova dep pesada
- Página Perfil: esqueleto com XP/nível placeholder até Fase 7
- Fixtures: ≥3 módulos de trilha e ≥1 atividade MCQ com 5 questões no seed mock
- Testes Vitest: restore draft + navegação MCQ (mínimo feliz)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Produto e requisitos
- `doc/PDR_VisionEdu.md` — RF aluno, schema `activities`, `student_activities`, RNF-001/002
- `.planning/PROJECT.md` — mobile-first 360px, cache local
- `.planning/REQUIREMENTS.md` — STUD-01 a STUD-05
- `.planning/ROADMAP.md` — Phase 3 goal, planos 03-01 a 03-04

### Contexto fases anteriores
- `.planning/phases/02-autentica-o-e-onboarding/02-CONTEXT.md` — auth, middleware, dashboard esqueleto
- `.planning/phases/01-fundacao-frontend-e-camada-mock/01-CONTEXT.md` — MSW, apiClient, shadcn forms

### Qualidade
- `.cursor/rules/responsive-mobile.mdc`
- `.cursor/rules/accessibility.mdc`
- `.cursor/rules/performance.mdc`
- `.cursor/rules/code-architecture.mdc`
- `.cursor/rules/validation-build.mdc`

### Código existente
- `src/app/student/layout.tsx`, `src/app/student/dashboard/page.tsx`
- `src/features/auth/components/student-dashboard-skeleton.tsx`
- `src/middleware.ts`, `src/stores/auth-store.ts`, `src/lib/api-client.ts`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StudentDashboardSkeleton` — evoluir para dashboard real mantendo header/saudação
- `AuthHeader` + layout `student` — receberá `StudentBottomNav`
- `apiClient`, MSW handlers pattern de `auth.ts` / `schools.ts`
- `ceti-seed.ts`, `useAuthStore` para dados escolares no painel

### Established Patterns
- Rotas reais em `src/app/student/*` (não só route groups vazios)
- Zustand para sessão; formulários shadcn só em auth
- Middleware cookie `visionedu_session` por role

### Integration Points
- Registrar `studentHandlers` em `src/mocks/handlers/index.ts`
- Novas rotas no `middleware` matcher para `/student/atividade/*`
- Feature folder sugerida: `src/features/student/`

</code_context>

<specifics>
## Specific Ideas

- Timeline horizontal no dashboard evoca “caminho” sem peso de grafo
- Banner de rascunho prepara demo de “queda de rede” no UAT (reload)
- Link mock documentado no README: `/student/atividade/{uuid-demo}`

</specifics>

<deferred>
## Deferred Ideas

- IndexedDB / Service Worker — se `localStorage` limitar, migrar em polish
- Página dedicada `/student/trilha` — só se dashboard ficar longo demais
- Ping foco e Lei 15.100 banner em atividade (Fase 5)
- Tutor chat na questão (Fase 6)
- Gamificação real em Perfil (Fase 7)

### Discuss incompleto
- Áreas 3–6 podem ser refinadas com `/gsd-discuss-phase 3` → Atualizar; defaults D-09–D-22 são válidos para planejar.

</deferred>

---

*Phase: 03-experi-ncia-do-aluno-core*
*Context gathered: 2026-05-21*
