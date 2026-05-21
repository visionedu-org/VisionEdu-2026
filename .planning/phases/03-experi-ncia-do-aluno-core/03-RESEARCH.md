# Phase 3 Research: Experiência do Aluno (Core)

**Researched:** 2026-05-21
**Confidence:** HIGH

## Objective

Responder: *como entregar dashboard, trilha horizontal, player MCQ com localStorage e deep link mock no Next.js 16 App Router, reutilizando auth da Fase 2?*

## Prerequisites

- Fase 2 completa: `middleware.ts`, `auth-store`, rotas `/student/dashboard`, MSW auth.
- Fase 1: `apiClient`, `ceti-seed`, MSW bootstrap.

## Key Findings

### 1. Rotas aluno (App Router)

| Rota | Arquivo | Notas |
|------|---------|-------|
| `/student/dashboard` | `src/app/student/dashboard/page.tsx` | Já existe (esqueleto) |
| `/student/atividades` | `src/app/student/atividades/page.tsx` | Lista mock |
| `/student/perfil` | `src/app/student/perfil/page.tsx` | Esqueleto Fase 7 |
| `/student/atividade/[id]` | `src/app/student/atividade/[id]/page.tsx` | Player; sem bottom nav |

`middleware` matcher já cobre `/student/:path*`. Adicionar suporte opcional `?next=` no redirect login para deep links.

### 2. Timeline horizontal sem Recharts

- Container `overflow-x-auto` + `flex` + `snap-x snap-mandatory` para scroll tátil em 360px.
- Cada módulo: círculo 48px (≥44 touch), linha conectora, título truncado.
- Estados: classes Tailwind + `lucide-react` (`Lock`, `Circle`, `CheckCircle2`).
- Evita dependência Recharts (~30–50KB gzip) — alinhado a RNF-001.

### 3. localStorage draft helper

```ts
// src/lib/activity-draft.ts
const prefix = "visionedu:activity:";
export function saveDraft(activityId: string, data: ActivityDraft): void
export function loadDraft(activityId: string): ActivityDraft | null
export function clearDraft(activityId: string): void
```

- `typeof window === "undefined"` guard em SSR.
- JSON.parse em try/catch; corrupt → clear + null.
- Testes Vitest com `vi.stubGlobal("localStorage", ...)`.

### 4. Player MCQ (client component)

- `ActivityPlayer` em `src/features/student/components/activity-player.tsx`.
- Estado: `currentIndex`, `answers` Map; sync draft on each radio `onChange`.
- `ResumeBanner` no mount se `loadDraft` retorna dados.
- Bottom bar: `Button` shadcn min-h-11 (44px).

### 5. MSW endpoints (contratos futuros API)

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/api/v1/students/me/dashboard` | Cards + resumo trilha |
| GET | `/api/v1/students/me/learning-path` | Módulos timeline |
| GET | `/api/v1/activities/:id` | Questões MCQ |
| POST | `/api/v1/students/activities/:id/submit` | Mock envio (200 + score) |

Handlers em `src/mocks/handlers/students.ts` + seed `src/mocks/data/student-fixtures.ts`.

### 6. Bottom navigation

- Componente `StudentBottomNav` em layout `student/layout.tsx`.
- Condicional: `usePathname()` — hide se `pathname.includes('/atividade/')`.
- `nav` com `role="navigation"` e `aria-label="Navegação principal do aluno"`.

### 7. Deep link / QR mock

- README: URL exemplo `http://localhost:3000/student/atividade/550e8400-e29b-41d4-a716-446655440000`.
- Opcional: página `src/app/student/entrar/page.tsx` que lê `?code=` e redireciona (Fase 3 plan 03-04).

### 8. Performance e a11y

- Player e timeline como **dynamic import** opcional se bundle student route > budget — medir com `npm run analyze`.
- Imagens: nenhuma obrigatória nesta fase.
- WCAG: foco visível nos nós da timeline (`tabIndex=0` só se módulo clicável), contraste tokens existentes.

## Validation Architecture

| STUD-ID | Verification approach |
|---------|----------------------|
| STUD-01 | MSW dashboard retorna score + counts; UI renderiza 3 cards |
| STUD-02 | Timeline renderiza ≥3 nós com classes distintas por status |
| STUD-03 | Player navega MCQ; submit mock 200 |
| STUD-04 | Vitest draft save/load; manual reload mostra banner |
| STUD-05 | CSS `max-w` + `min-h-11` nos controles; teste viewport 360 no checklist UAT |

## Risks

| Risk | Mitigation |
|------|------------|
| localStorage quota | Uma atividade por vez; payload pequeno |
| Timeline horizontal overflow | `snap` + padding lateral 16px |
| Rotas duplicadas `(student)` vs `student/` | Manter `src/app/student/` como canônico (já em uso) |

## RESEARCH COMPLETE
