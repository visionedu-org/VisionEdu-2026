---
phase: 04-painel-do-professor-core
plan: "04"
subsystem: ui
tags: [nextjs, teacher, qrcode, msw, vitest, share]

requires:
  - phase: 04-painel-do-professor-core
    plan: "03"
    provides: Teacher activity POST, redirect to share route, student GET merge
provides:
  - ShareActivityPanel with copy link, aria-live, and QR Code
  - /teacher/compartilhar/[activityId] route with UUID and activity validation
  - GET /api/v1/teachers/activities/:id MSW handler
  - teacher-flow Vitest suite and README Demo professor Fase 4
affects:
  - Phase 5 (real-time can link from share flows)

tech-stack:
  added: [qrcode, @types/qrcode]
  patterns:
    - "shareUrl points to /student/atividade/{id} and /student/entrar?code={id}"
    - "Server pages resolve activities from demo fixtures + teacher memory store"

key-files:
  created:
    - src/features/teacher/components/share-activity-panel.tsx
    - src/app/teacher/compartilhar/[activityId]/page.tsx
    - src/features/teacher/__tests__/teacher-flow.test.ts
  modified:
    - package.json
    - src/mocks/handlers/teachers.ts
    - src/services/teacher.service.ts
    - src/app/student/atividade/[id]/page.tsx
    - README.md

key-decisions:
  - "Server share page resolves activity via memory + demo fixtures (no server-side MSW)"
  - "Visible copy feedback duplicates aria-live status for sighted users"

patterns-established:
  - "QRCode.toDataURL in client useEffect after origin is known"
  - "teacherService.getActivity mirrors student resolveActivity sources"

requirements-completed: [TEACH-05, TEACH-06]

duration: 25min
completed: 2026-05-21
---

# Phase 4 Plan 04: Share Link and QR Summary

**Teacher share screen with clipboard copy, accessible feedback, QR Code via qrcode, and student deep-link integration for professor-created diagnostics.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-05-21T15:05:00Z
- **Completed:** 2026-05-21T15:30:00Z
- **Tasks:** 3/3
- **Files modified:** 8

## Accomplishments

- Installed `qrcode` for classroom QR projection
- `ShareActivityPanel` with student activity URL, code entry URL, copy button, and PT-BR instructions
- `/teacher/compartilhar/[activityId]` validates UUID and resolves demo or teacher-created activities
- `teacher-flow.test.ts` covers dashboard, BNCC gaps (≥6), and create/get activity roundtrip
- README **Demo professor — Fase 4** documents regina → diagnostic → share → student flow

## Task Commits

Each task was committed atomically:

1. **Task 1: Instalar qrcode** - `968d7b2` (chore)
2. **Task 2: ShareActivityPanel** - `ad96c59` (feat)
3. **Task 3: README + teacher-flow tests** - `a7588f7` (feat)

## Files Created/Modified

- `src/features/teacher/components/share-activity-panel.tsx` - Link copy, QR, aria-live status
- `src/app/teacher/compartilhar/[activityId]/page.tsx` - Server validation and panel render
- `src/mocks/handlers/teachers.ts` - GET teachers/activities/:id
- `src/services/teacher.service.ts` - getActivity method
- `src/app/student/atividade/[id]/page.tsx` - Accepts teacher-created activity IDs
- `src/features/teacher/__tests__/teacher-flow.test.ts` - MSW integration tests
- `README.md` - Demo professor section with `/teacher/compartilhar/`

## Decisions Made

- Server-side activity lookup uses the same in-memory resolver as MSW (demo + teacher store) because MSW does not run in RSC fetch context
- Copy feedback uses both `sr-only` aria-live and visible text for WCAG without hiding success from sighted teachers

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Student activity route accepts teacher-created IDs**
- **Found during:** Task 2 (ShareActivityPanel)
- **Issue:** `/student/atividade/[id]` only allowed `demoActivities` keys — shared teacher diagnostics would 404
- **Fix:** `resolveActivity` checks `getActivityById` from teacher memory store (D-22)
- **Files modified:** `src/app/student/atividade/[id]/page.tsx`
- **Verification:** `npm run build` succeeded
- **Committed in:** `ad96c59` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2)
**Impact on plan:** Required for TEACH-05 share → student flow; no scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 4 teacher core complete (all four plans)
- Ready for Phase 5 real-time ping/SSE on top of existing teacher/student routes
- Share URLs tested via Vitest; manual UAT: login regina → create diagnostic → open link as aluno

## Self-Check: PASSED

- FOUND: src/features/teacher/components/share-activity-panel.tsx
- FOUND: src/app/teacher/compartilhar/[activityId]/page.tsx
- FOUND: src/features/teacher/__tests__/teacher-flow.test.ts
- FOUND: 968d7b2
- FOUND: ad96c59
- FOUND: a7588f7

---
*Phase: 04-painel-do-professor-core*
*Completed: 2026-05-21*
