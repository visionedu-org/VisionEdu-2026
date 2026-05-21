---
phase: 02
slug: autentica-o-e-onboarding
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-21
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest  + MSW node |
| **Config file** | `vitest.config.ts`, `vitest.setup.ts` |
| **Quick run command** | `npm run test` |
| **Full suite command** | `npm run test && npm run lint && npm run build` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test`
- **After every plan wave:** Run `npm run lint && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 02-01-T1 | 01 | 1 | AUTH-01/02 | unit | `npx tsc --noEmit` | ⬜ pending |
| 02-01-T2 | 01 | 1 | AUTH-01/02 | manual | dev: register forms render 360px | ⬜ pending |
| 02-02-T1 | 02 | 2 | AUTH-03/04/05 | integration | `npm run test` auth-store | ⬜ pending |
| 02-02-T2 | 02 | 2 | AUTH-05 | manual | wrong role → /unauthorized | ⬜ pending |
| 02-03-T1 | 03 | 3 | AUTH-03 | integration | `npm run test` MSW auth | ⬜ pending |
| 02-03-T2 | 03 | 3 | AUTH-04 | integration | test session persist mock | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `src/lib/validations/auth.test.ts` — Zod schema rejects
- [ ] `src/features/auth/__tests__/auth-flow.test.ts` — MSW login/register

*Wave 0 partially covered by plan 02-03 Task 1.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sessão persiste após refresh browser | AUTH-04 | Browser reload | Login aluno demo → F5 → ainda em dashboard |
| Lei 15.100 copy visível cadastro aluno | CONTEXT D-15 | Copy review | Abrir /register/student, ver bloco legal |
| Contraste WCAG forms | A11Y | Visual | DevTools contrast em labels/erros |

---

## Validation Sign-Off

- [x] All tasks have verify commands in PLAN.md
- [x] Sampling continuity maintained
- [ ] Wave 0 stubs created during 02-03 if missing
- [x] No watch-mode flags
- [ ] Approval: pending execution
