---
phase: 04-painel-do-professor-core
plan: "01"
subsystem: ui
tags: [nextjs, teacher, responsive, navigation, tailwind]

requires:
  - phase: 02-autentica-o-e-onboarding
    provides: AuthHeader, teacher auth, teacher_classes on user
  - phase: 03-experi-ncia-do-aluno-core
    provides: Student nav patterns for mobile touch targets
provides:
  - Responsive teacher shell (sidebar md+, mobile dialog menu)
  - /teacher/turmas list from registration data
affects:
  - 04-02 (class dashboard and BNCC routes)
  - 04-03 (content and diagnostic forms)
  - 04-04 (share page)

tech-stack:
  added: []
  patterns:
    - "Shared TEACHER_NAV_LINKS with isTeacherNavActive for aria-current"
    - "Dialog as left drawer for mobile nav (no Sheet dependency)"

key-files:
  created:
    - src/features/teacher/components/teacher-nav-links.ts
    - src/features/teacher/components/teacher-sidebar.tsx
    - src/features/teacher/components/teacher-mobile-nav.tsx
    - src/app/teacher/turmas/page.tsx
  modified:
    - src/app/teacher/layout.tsx

key-decisions:
  - "Extracted teacher-nav-links.ts to keep desktop and mobile nav in sync"
  - "Mobile menu uses shadcn Dialog styled as left drawer instead of adding Sheet"

patterns-established:
  - "Teacher layout: AuthHeader + flex row (sidebar | main max-w-5xl)"
  - "Class slug URLs: {grade}-{class_identifier} e.g. 2-A"

requirements-completed: [TEACH-06]

duration: 25min
completed: 2026-05-21
---

# Phase 4 Plan 01: Teacher Shell Summary

**Responsive professor shell with shared desktop sidebar and mobile drawer navigation, plus turmas list from `teacher_classes`.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-05-21T12:00:00Z
- **Completed:** 2026-05-21T12:25:00Z
- **Tasks:** 3/3
- **Files modified:** 5

## Accomplishments

- Desktop sidebar (`md+`) and mobile menu dialog with identical nav links and `aria-current`
- Teacher layout composes `AuthHeader`, nav, and `max-w-5xl` main content
- `/teacher/turmas` lists registration classes as clickable cards with CETI school label

## Task Commits

Each task was committed atomically:

1. **Task 1: TeacherSidebar + TeacherMobileNav** - `5e41e47` (feat)
2. **Task 2: Layout teacher** - `fc7ba50` (feat)
3. **Task 3: Página lista turmas** - `a5ad76e` (feat)

**Plan metadata:** `301eaf9` (docs)

## Files Created/Modified

- `src/features/teacher/components/teacher-nav-links.ts` - Shared nav items and active-route helper
- `src/features/teacher/components/teacher-sidebar.tsx` - Fixed aside `w-56` for desktop
- `src/features/teacher/components/teacher-mobile-nav.tsx` - Menu button + dialog drawer
- `src/app/teacher/layout.tsx` - Flex shell with sidebar and centered main
- `src/app/teacher/turmas/page.tsx` - Turmas grid from auth store

## Decisions Made

- Shared nav config module avoids drift between sidebar and mobile menu
- Dialog left-aligned panel mimics Sheet without new dependency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None

## Known Stubs

| Location | Description | Resolved in |
|----------|-------------|-------------|
| `/teacher/turmas/[classId]` | Links from turmas list; detail page not yet implemented | 04-02 |
| `/teacher/conteudos/novo`, `/teacher/diagnosticos/novo` | Nav targets; routes planned in 04-03 | 04-03 |

## Self-Check: PASSED

- FOUND: src/features/teacher/components/teacher-sidebar.tsx
- FOUND: src/features/teacher/components/teacher-mobile-nav.tsx
- FOUND: src/app/teacher/layout.tsx
- FOUND: src/app/teacher/turmas/page.tsx
- FOUND: 5e41e47, fc7ba50, a5ad76e
