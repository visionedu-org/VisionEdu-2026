---
phase: 04-painel-do-professor-core
verified: 2026-05-21T05:32:00Z
status: human_needed
score: 22/22
overrides_applied: 0
human_verification:
  - test: "Login como regina.demo@escola.pi.gov.br e navegue Turmas → dashboard 2-A → lacunas BNCC em viewport ~360px (Chrome DevTools ou celular)."
    expected: "Menu mobile abre via botão Menu; cards e tabela BNCC legíveis com scroll horizontal na tabela; botões com área de toque confortável (min-h-11)."
    why_human: "Classes responsivas não provam legibilidade e usabilidade touch em dispositivo real."
  - test: "Repita o fluxo em viewport ~1024px: sidebar visível, conteúdo centralizado max-w-5xl, criar diagnóstico (2 questões + BNCC) → tela compartilhar."
    expected: "Sidebar fixa à esquerda; formulário e painel de compartilhamento sem overflow quebrado; QR Code renderizado; copiar link exibe feedback."
    why_human: "Layout desktop e fluxo end-to-end exigem confirmação visual."
  - test: "Copie o link da atividade compartilhada, faça logout, login como thiago.demo e abra a URL /student/atividade/{id}."
    expected: "Player de atividade carrega questões do diagnóstico criado pelo professor."
    why_human: "Integração professor→aluno depende de MSW em runtime com sessão autenticada."
---

# Phase 4: Painel do Professor (Core) Verification Report

**Phase Goal:** Jornada da Professora Regina: métricas de turma, relatório BNCC, criar materiais/diagnósticos e compartilhar.
**Verified:** 2026-05-21T05:32:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

**MVP note:** ROADMAP marca `mode: mvp`, mas o goal não está no formato user story (`As a …, I want …, so that …`). A cobertura abaixo deriva o fluxo da jornada Regina a partir do goal e dos success criteria; recomenda-se `/gsd mvp-phase 4` se o projeto exigir goal formal em user story.

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Professor vê dashboard turma com médias e top erros mock | ✓ VERIFIED | `ClassDashboard` busca `teacherService.getClassDashboard`; fixture `2-A`/`2-B` com `averageScore` e 3 `topErrors` em `teacher-fixtures.ts`; página `turmas/[classId]/page.tsx` renderiza componente |
| 2 | Relatório BNCC lista competências com domínio/dificuldade | ✓ VERIFIED | `BnccGapsReport` tabela com código, domínio %, badge dificuldade; `bncc-competencies.ts` 8 competências EM13*; handler ordena asc `masteryPercent` |
| 3 | Professor cria material e avaliação MCQ com tag BNCC por questão | ✓ VERIFIED | `ContentForm` + `contentFormSchema` (disciplina, série, turma, tipo); `DiagnosticBuilder` FieldArray 1–10 questões, select BNCC por questão, `diagnosticFormSchema` rejeita sem `bnccCode` (teste Vitest) |
| 4 | Tela de compartilhamento exibe link copiável e QR Code legível | ✓ VERIFIED | `ShareActivityPanel`: `navigator.clipboard`, `role="status" aria-live`, `QRCode.toDataURL` 240×240, alt descritivo; dep `qrcode` em `package.json` |
| 5 | Mesmas telas usáveis em viewport mobile e desktop | ✓ VERIFIED (estrutura) | `layout.tsx` sidebar `hidden md:flex`, `TeacherMobileNav` `md:hidden`, `max-w-5xl`, grids `sm:grid-cols-2`, `min-h-11`, BNCC `overflow-x-auto` — **usabilidade visual pendente humano** |

**Score (ROADMAP):** 5/5 truths verified programmatically

### PLAN Must-Haves (D-01 … D-22)

| ID | Truth | Status | Evidence |
| --- | --- | --- | --- |
| D-01 | Rotas `src/app/teacher/*` | ✓ VERIFIED | 8 rotas: dashboard, turmas, turmas/[classId], bncc, conteudos/novo, diagnosticos/novo, compartilhar/[activityId] |
| D-02 | Sidebar desktop md+ | ✓ VERIFIED | `teacher-sidebar.tsx` `hidden … md:flex` |
| D-03 | Nav mobile sheet/drawer | ✓ VERIFIED | `teacher-mobile-nav.tsx` Dialog drawer esquerda |
| D-04 | max-w-5xl + grids sm:2 | ✓ VERIFIED | `layout.tsx` `max-w-5xl`; cards `sm:grid-cols-2` |
| D-05 | AuthHeader e logout | ✓ VERIFIED | `layout.tsx` importa `AuthHeader`; middleware protege `/teacher/*` |
| D-06 | Lista turmas | ✓ VERIFIED | `turmas/page.tsx` usa `user.teacher_classes`, Link slug `grade-class_identifier` |
| D-07 | Dashboard média + top 3 erros | ✓ VERIFIED | `class-dashboard.tsx` renderiza média e `topErrors.map` |
| D-08 | Link relatório BNCC | ✓ VERIFIED | Button Link `turmas/${classId}/bncc` |
| D-09 | Sem placeholder nos cards de dados | ✓ VERIFIED | `class-dashboard` sem "Em breve"; grep teacher sem match; skeleton auth órfão |
| D-10 | Tabela BNCC código/domínio/dificuldade | ✓ VERIFIED | `bncc-gaps-report.tsx` thead + tbody |
| D-11 | Ordenação menor domínio primeiro | ✓ VERIFIED | `sortBnccGaps` em `teachers.ts`; teste confirma ordem |
| D-12 | ≥6 competências mock | ✓ VERIFIED | 8 em `masterCompetencies`; teste `gaps.length >= 6` |
| D-13 | Form material campos obrigatórios | ✓ VERIFIED | `content-form.tsx` + schema |
| D-14 | PDF upload só UI | ✓ VERIFIED | `contentType === "pdf_upload"` file input, texto mock não enviado |
| D-15 | POST contents → toast (sem redirect share) | ✓ VERIFIED | `createContent` → `setToast` sem `router.push` |
| D-16 | Builder MCQ 1–10 | ✓ VERIFIED | `append` disabled `fields.length >= 10`, `remove` min 1 |
| D-17 | Tag BNCC obrigatória | ✓ VERIFIED | `bnccCode: z.enum(BNCC_COMPETENCY_CODES)` + `teacher.test.ts` |
| D-18 | POST diagnóstico → compartilhar | ✓ VERIFIED | `router.push(/teacher/compartilhar/${id})` |
| D-19 | URLs aluno atividade e entrar?code= | ✓ VERIFIED | `share-activity-panel.tsx` paths `/student/atividade/` e `/student/entrar?code=` |
| D-20 | Copiar link aria-live | ✓ VERIFIED | `span role="status" aria-live="polite"` |
| D-21 | QR via lib qrcode | ✓ VERIFIED | `import QRCode from "qrcode"` + `toDataURL` |
| D-22 | Atividades criadas no fluxo aluno | ✓ VERIFIED | `addActivity` + `students.ts`/`student/atividade/[id]/page.tsx` `resolveActivity` |

**Score (PLAN must-haves):** 22/22 verified

## User Flow Coverage (MVP journey — Regina)

| Step | Expected | Evidence | Status |
| --- | --- | --- | --- |
| Acessar painel professor | `/teacher/dashboard` após login teacher | `dashboard/page.tsx`, middleware role teacher | ✓ |
| Abrir turma e métricas | Média + top erros mock | `ClassDashboard` + fixtures `2-A`/`2-B` | ✓ |
| Ver lacunas BNCC | Tabela competências ordenadas | `bncc/page.tsx` → `BnccGapsReport` | ✓ |
| Criar material | Form completo, toast sucesso | `conteudos/novo` → `ContentForm` → POST MSW | ✓ |
| Criar diagnóstico MCQ | Questões + BNCC, redirect share | `diagnosticos/novo` → `DiagnosticBuilder` | ✓ |
| Compartilhar na aula | Link + QR copiável | `compartilhar/[activityId]` → `ShareActivityPanel` | ✓ |
| Aluno abre atividade | Player com questões criadas | `getActivityById` wired em student handlers + page | ✓ |

## Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/features/teacher/components/teacher-sidebar.tsx` | Nav desktop | ✓ VERIFIED | WIRED em `layout.tsx` |
| `src/app/teacher/turmas/page.tsx` | Lista turmas | ✓ VERIFIED | auth store `teacher_classes` |
| `src/mocks/handlers/teachers.ts` | API mock professor | ✓ VERIFIED | GET dashboard/bncc, POST contents/activities, GET activity |
| `src/features/teacher/components/bncc-gaps-report.tsx` | Relatório BNCC | ✓ VERIFIED | fetch + tabela |
| `src/lib/validations/teacher.ts` | Schemas Zod | ✓ VERIFIED | substantive, testado |
| `src/features/teacher/components/diagnostic-builder.tsx` | MCQ builder | ✓ VERIFIED | wired createActivity |
| `src/features/teacher/components/share-activity-panel.tsx` | Link + QR | ✓ VERIFIED | wired em compartilhar page |
| `src/features/teacher/__tests__/teacher-flow.test.ts` | Testes MSW | ✓ VERIFIED | 4 testes passam |

## Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `layout.tsx` | `TeacherSidebar` | composition | ✓ WIRED | import + render |
| `class-dashboard.tsx` | `teacher.service.ts` | `getClassDashboard` | ✓ WIRED | useEffect fetch |
| `bncc-gaps-report.tsx` | `teacher.service.ts` | `getBnccGaps` | ✓ WIRED | Promise.all |
| `diagnostic-builder.tsx` | `teachers.ts` | `createActivity` POST | ✓ WIRED | router push share |
| `share-activity-panel.tsx` | `/student/atividade/` | shareUrl string | ✓ WIRED | origin + activityId |
| `teachers.ts` POST activities | `teacher-content-memory` | `addActivity` | ✓ WIRED | students GET resolve |

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `ClassDashboard` | `data` | `getClassDashboardFixture(classId)` via MSW | Yes — média, topErrors por turma | ✓ FLOWING |
| `BnccGapsReport` | `gaps` | `getBnccGapsForClass` + sort | Yes — 8 rows com mastery variado | ✓ FLOWING |
| `ContentForm` | toast/id | POST `/teachers/contents` → memory | Yes — UUID persistido em Map | ✓ FLOWING |
| `DiagnosticBuilder` | activity id | POST `/teachers/activities` → memory + student resolve | Yes — roundtrip test | ✓ FLOWING |
| `ShareActivityPanel` | `qrDataUrl` | `QRCode.toDataURL(shareUrl)` | Yes — data URL gerado client-side | ✓ FLOWING |

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Teacher MSW dashboard | `npm run test -- src/features/teacher/__tests__/teacher-flow.test.ts` | 4 passed | ✓ PASS |
| Zod BNCC validation | `npm run test -- src/lib/validations/teacher.test.ts` | 2 passed | ✓ PASS |
| qrcode dependency | grep `package.json` | `"qrcode": "^1.5.4"` | ✓ PASS |

## Probe Execution

Step 7c: SKIPPED — no phase-declared probes or `scripts/*/tests/probe-*.sh` for this phase.

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| TEACH-01 | 04-02 | Dashboard turma médias/erros mock | ✓ SATISFIED | ClassDashboard + fixtures |
| TEACH-02 | 04-02 | Relatório lacunas BNCC | ✓ SATISFIED | BnccGapsReport + ≥6 competências |
| TEACH-03 | 04-03 | Criar material | ✓ SATISFIED | ContentForm + POST contents |
| TEACH-04 | 04-03 | Diagnóstico MCQ + BNCC/questão | ✓ SATISFIED | DiagnosticBuilder + schema |
| TEACH-05 | 04-04 | Link + QR compartilhar | ✓ SATISFIED | ShareActivityPanel |
| TEACH-06 | 04-01, 04-02, 04-04 | Layout desktop/mobile | ✓ SATISFIED | Sidebar + mobile nav + responsive utilities |

Orphaned requirements for Phase 4: none.

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `src/features/auth/components/teacher-dashboard-skeleton.tsx` | 44 | `Em breve — Fase 4/5` | ℹ️ Info | Componente órfão (não importado); não afeta cards de métricas da Fase 4 |
| `src/app/teacher/dashboard/page.tsx` | 66–67 | `Disponível na Fase 5` | ℹ️ Info | Card tempo real explicitamente deferido — não é stub de TEACH-01 |

No `TBD`/`FIXME`/`XXX` in phase-modified teacher files.

## Human Verification Required

### 1. Mobile viewport (~360px)

**Test:** Login Regina → turma 2-A → BNCC → novo diagnóstico → compartilhar em ~360px.
**Expected:** Menu mobile funcional; tabela BNCC scrollável; formulários e QR sem corte crítico.
**Why human:** Legibilidade e touch não verificáveis só por classes Tailwind.

### 2. Desktop viewport (~1024px)

**Test:** Mesmo fluxo com sidebar visível.
**Expected:** Navegação lateral + conteúdo centralizado; copiar link e QR operacionais.
**Why human:** Confirmação visual do layout sala de professores.

### 3. Integração professor → aluno

**Test:** Após criar diagnóstico, abrir link compartilhado como aluno demo.
**Expected:** `ActivityPlayer` exibe questões criadas.
**Why human:** Requer sessão MSW + navegador com duas contas.

## Gaps Summary

Nenhum gap bloqueador identificado no código. A implementação entrega o goal da Fase 4 com dados mock, formulários, compartilhamento e integração ao fluxo aluno. O status **human_needed** reflete apenas confirmação UX em viewports reais e walkthrough end-to-end — não falha de artefato ou wiring.

### Deferred Items

| # | Item | Addressed In | Evidence |
| --- | --- | --- | --- |
| 1 | Card "Tempo real" no painel professor | Phase 5 | ROADMAP Phase 5: ping 15s, SSE professor |
| 2 | Métricas ao vivo na sala | Phase 5 | REAL-01, REAL-02 |

---

_Verified: 2026-05-21T05:32:00Z_
_Verifier: Claude (gsd-verifier)_
