---
phase: 04-painel-do-professor-core
plan: "02"
subsystem: ui
tags: [nextjs, teacher, msw, bncc, dashboard]

requires:
  - phase: 04-painel-do-professor-core
    plan: "01"
    provides: Teacher shell, turmas list, class slug URLs
provides:
  - Class dashboard with mock averages and top 3 errors
  - BNCC gaps report sorted by mastery ascending
  - Teacher MSW handlers and TeacherService
affects:
  - 04-03 (content and diagnostic forms use TeacherContent types)
  - 04-04 (share page)

tech-stack:
  added: []
  patterns:
    - "teacherService mirrors studentService for class-scoped GETs"
    - "BNCC gaps sorted server-side in MSW handler"

key-files:
  created:
    - src/mocks/data/teacher-fixtures.ts
    - src/mocks/data/bncc-competencies.ts
    - src/mocks/handlers/teachers.ts
    - src/services/teacher.service.ts
    - src/features/teacher/components/class-dashboard.tsx
    - src/features/teacher/components/bncc-gaps-report.tsx
    - src/app/teacher/turmas/[classId]/page.tsx
    - src/app/teacher/turmas/[classId]/bncc/page.tsx
  modified:
    - src/types/domain.ts
    - src/mocks/handlers/index.ts
    - src/app/teacher/dashboard/page.tsx

key-decisions:
  - "BNCC mastery sorted in MSW handler so UI receives pre-ordered gaps"
  - "Teacher overview dashboard lists quick links; class detail on /turmas/[classId]"

patterns-established:
  - "Class slug 2-A / 2-B maps to dashboard and BNCC fixtures"
  - "Difficulty badges use semantic colors with AA contrast in light and dark"

requirements-completed: [TEACH-01, TEACH-02, TEACH-06]

duration: 35min
completed: 2026-05-21
---

# Phase 4 Plan 02: Class Dashboard and BNCC Report Summary

**Mock class dashboards with averages, top-3 error concepts, and EM13 BNCC gap tables wired through MSW and TeacherService.**

## Performance

- **Duration:** 35 min
- **Started:** 2026-05-21T13:00:00Z
- **Completed:** 2026-05-21T13:35:00Z
- **Tasks:** 3/3
- **Files modified:** 11

## Accomplishments

- `ClassDashboardData` and `BnccGapRow` types plus fixtures for turmas `2-A` and `2-B`
- MSW `GET` dashboard and bncc-gaps endpoints with ascending mastery sort
- `/teacher/turmas/[classId]` and `/bncc` pages with real metrics (no Fase 4 placeholders)
- Professor overview at `/teacher/dashboard` with quick class links and Fase 5 tempo real card

## Task Commits

Each task was committed atomically:

1. **Task 1: Tipos e fixtures professor/BNCC** - `e65ef45` (feat)
2. **Task 2: MSW teachers + TeacherService** - `c0d5ab2` (feat)
3. **Task 3: ClassDashboard e BNCC pages** - `37528b7` (feat)

**Plan metadata:** `e0398b9` (docs)

## Files Created/Modified

- `src/types/domain.ts` - ClassDashboardData, BnccGapRow, TeacherContent, TeacherActivityCreatePayload
- `src/mocks/data/teacher-fixtures.ts` - Per-class dashboard mock data
- `src/mocks/data/bncc-competencies.ts` - 8 EM13MAT competencies with per-class mastery
- `src/mocks/handlers/teachers.ts` - Dashboard and BNCC gap handlers
- `src/services/teacher.service.ts` - getClassDashboard, getBnccGaps
- `src/features/teacher/components/class-dashboard.tsx` - Metrics cards and BNCC link
- `src/features/teacher/components/bncc-gaps-report.tsx` - Responsive table with difficulty badges
- `src/app/teacher/turmas/[classId]/page.tsx` - Class dashboard route
- `src/app/teacher/turmas/[classId]/bncc/page.tsx` - BNCC report route
- `src/app/teacher/dashboard/page.tsx` - Overview with quick links (replaces skeleton)

## Decisions Made

- BNCC sorting done in handler to keep a single source of truth for D-11
- TeacherContent types added now for plan 04-03 without extra domain churn later

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None

## Known Stubs

| Location | Description | Resolved in |
|----------|-------------|-------------|
| `/teacher/dashboard` tempo real card | Copy only — SSE in Fase 5 | 05-02 |
| `teacher-dashboard-skeleton.tsx` | Unused by routes; kept for reference | — |

## Next Phase Readiness

- Ready for 04-03: content form and diagnostic MCQ builder can use TeacherContent types
- Share page (04-04) can link from POST activity responses

## Self-Check: PASSED

- FOUND: src/mocks/handlers/teachers.ts
- FOUND: src/features/teacher/components/class-dashboard.tsx
- FOUND: src/features/teacher/components/bncc-gaps-report.tsx
- FOUND: src/app/teacher/turmas/[classId]/page.tsx
- FOUND: src/app/teacher/turmas/[classId]/bncc/page.tsx
- FOUND: e65ef45, c0d5ab2, 37528b7

---
*Phase: 04-painel-do-professor-core*
*Completed: 2026-05-21*
