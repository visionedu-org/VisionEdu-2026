---
phase: 7
slug: gamifica-o-e-polimento
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run lint` + `npm run build`
- **Before `/gsd-verify-work`:** Full suite green; bundle gzip + Lighthouse documented
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | GAME-01 | — | Profile API student-scoped | unit | `npx vitest run src/features/student/__tests__/gamification.test.ts -t profile` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | GAME-02 | — | Badge unlock server-side mock | unit | `npx vitest run src/features/student/__tests__/gamification.test.ts -t submit` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | GAME-03 | T-07-01 | Achievement text only, no innerHTML | unit | `npx vitest run src/features/student/__tests__/achievement-toast.test.tsx` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 2 | PERF-01 | — | N/A | manual | `npm run build && node scripts/measure-student-bundle.mjs` | ❌ W0 | ⬜ pending |
| 07-02-02 | 02 | 2 | PERF-02 | — | N/A | CI/manual | `npm run perf:student` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 3 | A11Y-01 | — | Keyboard navigable | manual | `07-A11Y-CHECKLIST.md` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 3 | A11Y-02 | — | Icons decorative | review | grep `aria-hidden` in new components | partial ✓ | ⬜ pending |
| 07-03-03 | 03 | 3 | A11Y-03 | — | Contrast AA | manual | axe / checklist | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/mocks/gamification-memory.ts` — mutable XP/badge state
- [ ] `src/mocks/data/student-gamification.ts` — badge catalog + defaults
- [ ] `src/features/student/__tests__/gamification.test.ts` — GAME-01, GAME-02
- [ ] `src/features/student/__tests__/achievement-toast.test.tsx` — GAME-03
- [ ] `.lighthouserc.cjs` + `npm run perf:student` — PERF-02
- [ ] `07-A11Y-CHECKLIST.md` — A11Y manual gate

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bundle ≤300KB gzip | PERF-01 | Build artifact measurement | `npm run analyze`; record student dashboard gzip in VERIFICATION |
| Lighthouse ≥90 | PERF-02 | Needs auth session or scripted login | `npm run perf:student` or manual Lighthouse logged-in on `/student/dashboard` |
| WCAG keyboard/contrast | A11Y-01/03 | Screen reader + contrast tools | Complete `07-A11Y-CHECKLIST.md` per route |
| Tutor / realtime flows | A11Y (defer) | Routes not built (Phases 5/6) | Mark N/A in checklist with dependency note |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
