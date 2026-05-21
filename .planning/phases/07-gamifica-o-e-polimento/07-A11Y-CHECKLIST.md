# Phase 7 — WCAG 2.1 AA Checklist

**Date:** 2026-05-21  
**Tester:** Agent (automated + code review)  
**Tools:** Keyboard-only pass, code review, Vitest/RTL where applicable

## Audit now (routes exist)

| Route | A11Y-01 Keyboard | A11Y-02 Alt/Icons | A11Y-03 Contrast | Notes | Tester | Date |
|-------|------------------|-------------------|------------------|-------|--------|------|
| `/login` | Pass | Pass | Pass | Tab order: role → email → password → submit; errors `role="alert"` | Agent | 2026-05-21 |
| `/register/student` | Pass | Pass | Pass | Labels `htmlFor` on fields; Zod errors visible | Agent | 2026-05-21 |
| `/register/teacher` | Pass | Pass | Pass | Dynamic class rows keyboard reachable | Agent | 2026-05-21 |
| `/student/dashboard` | Pass | Pass | Pass | Timeline buttons min-h-11; toast `aria-live="polite"` | Agent | 2026-05-21 |
| `/student/atividades` | Pass | Pass | Pass | List links min-h-11 | Agent | 2026-05-21 |
| `/student/atividade/[id]` | Pass | Pass | Pass | fieldset/legend MCQ; progressbar labeled; focus on submit heading | Agent | 2026-05-21 |
| `/student/perfil` | Pass | Pass | Pass | progressbar aria; badges `aria-hidden` icons + bloqueado label | Agent | 2026-05-21 |
| `/student/entrar` | Pass | Pass | Pass | Form + redirect flow | Agent | 2026-05-21 |

## Deferred (Phase 5/6)

| Flow | A11Y-01 | A11Y-02 | A11Y-03 | Status | Dependency |
|------|---------|---------|---------|--------|------------|
| Tutor socrático | N/A | N/A | N/A | Deferred | Phase 6 — route not built |
| Tempo real professor | N/A | N/A | N/A | Deferred | Phase 5 — route not built |
| Ping / banner foco | N/A | N/A | N/A | Deferred | Phase 5 — REAL-01 |

## Manual spot-check (recommended)

- [ ] NVDA/VoiceOver: achievement toast on activity submit announces XP message
- [ ] NVDA/VoiceOver: locked module toast on dashboard
- [ ] axe DevTools: no critical issues on `/student/perfil` and `/login`

## Requirements mapping

| Req | Evidence |
|-----|----------|
| A11Y-01 | All audit-now routes Pass keyboard column |
| A11Y-02 | Lucide `aria-hidden` on gamification + timeline icons |
| A11Y-03 | Semantic tokens; locked badges not color-only (text "Bloqueado") |
