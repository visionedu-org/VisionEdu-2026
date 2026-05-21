---
phase: 04-painel-do-professor-core
plan: "03"
subsystem: ui
tags: [nextjs, teacher, zod, msw, react-hook-form, bncc]

requires:
  - phase: 04-painel-do-professor-core
    plan: "02"
    provides: TeacherContent types, TeacherService, BNCC fixtures
provides:
  - Zod schemas for content and diagnostic forms
  - MSW POST teachers/contents and teachers/activities
  - ContentForm and DiagnosticBuilder with CETI selects
  - Teacher-created activities visible to student player
affects:
  - 04-04 (share page at /teacher/compartilhar/[id])

tech-stack:
  added: []
  patterns:
    - "teacher-content-memory merges into student GET /activities/:id"
    - "Material create shows toast; diagnostic redirects to share route"

key-files:
  created:
    - src/lib/validations/teacher.ts
    - src/lib/validations/teacher.test.ts
    - src/mocks/teacher-content-memory.ts
    - src/features/teacher/components/content-form.tsx
    - src/features/teacher/components/diagnostic-builder.tsx
    - src/app/teacher/conteudos/novo/page.tsx
    - src/app/teacher/diagnosticos/novo/page.tsx
  modified:
    - src/mocks/data/bncc-competencies.ts
    - src/mocks/handlers/teachers.ts
    - src/mocks/handlers/students.ts
    - src/services/teacher.service.ts

key-decisions:
  - "Content success uses aria-live toast only (no share redirect per D-15)"
  - "Diagnostic submit redirects to /teacher/compartilhar/[id] for plan 04-04"

patterns-established:
  - "BNCC codes exported from bncc-competencies for Zod enum validation"
  - "FieldArray MCQ builder with min 1 max 10 questions"

requirements-completed: [TEACH-03, TEACH-04]

duration: 28min
completed: 2026-05-21
---

# Phase 4 Plan 03: Content and Diagnostic Creator Summary

**Zod-validated teacher forms with MSW POST persistence so professors create materials (toast) or MCQ diagnostics (BNCC-tagged) that students can open in the activity player.**

## Performance

- **Duration:** 28 min
- **Started:** 2026-05-21T14:15:00Z
- **Completed:** 2026-05-21T14:43:00Z
- **Tasks:** 3/3
- **Files modified:** 11

## Accomplishments

- `contentFormSchema` and `diagnosticFormSchema` with BNCC code enum from fixtures
- In-memory store wiring teacher POST activities into student `GET /activities/:id`
- `ContentForm` with discipline, CETI grade/class, conditional video link and PDF UI-only upload
- `DiagnosticBuilder` with dynamic 1–10 questions, BNCC select per question, redirect on create

## Task Commits

Each task was committed atomically:

1. **Task 1: Zod schemas + memory store** - `1a8cfa0` (feat)
2. **Task 2: MSW POST contents + activities** - `8d15477` (feat)
3. **Task 3: ContentForm + DiagnosticBuilder pages** - `55560e2` (feat)

## Files Created/Modified

- `src/lib/validations/teacher.ts` - Content and diagnostic Zod schemas
- `src/lib/validations/teacher.test.ts` - Rejects missing BNCC on questions
- `src/mocks/teacher-content-memory.ts` - Runtime store for created contents/activities
- `src/mocks/handlers/teachers.ts` - POST contents and activities handlers
- `src/mocks/handlers/students.ts` - Resolves teacher-created activities
- `src/services/teacher.service.ts` - `createContent`, `createActivity`
- `src/features/teacher/components/content-form.tsx` - Material creator form
- `src/features/teacher/components/diagnostic-builder.tsx` - MCQ builder with BNCC tags
- `src/app/teacher/conteudos/novo/page.tsx` - New material route
- `src/app/teacher/diagnosticos/novo/page.tsx` - New diagnostic route

## Decisions Made

- Material creation shows success toast without share redirect (D-15)
- PDF upload is display-only; no file bytes sent to mock API (D-14)
- Diagnostic redirect targets `/teacher/compartilhar/[id]` implemented in plan 04-04

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

| Location | Reason | Resolved in |
|----------|--------|-------------|
| `/teacher/compartilhar/[id]` | Share page not in this plan; diagnostic redirects there after create | 04-04 |
| PDF file input in ContentForm | D-14 UI-only; filename shown, not uploaded | intentional |

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for 04-04: share link/QR page consuming activity IDs from POST
- Created activities already resolve in student player via MSW memory merge

## Self-Check: PASSED

- All 7 key source files FOUND
- Commits `1a8cfa0`, `8d15477`, `55560e2` FOUND in git log

---
*Phase: 04-painel-do-professor-core*
*Completed: 2026-05-21*
