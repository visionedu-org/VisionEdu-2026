# Phase 7 — Performance Verification

**Date:** 2026-05-21

## PERF-01 — Bundle ≤ 300 KB gzip (`/student/dashboard`)

| Field | Value |
|-------|-------|
| Command | `npm run build && npm run measure:bundle` |
| Method | Sum gzip of `rootMainFiles` + `polyfillFiles` from `.next/build-manifest.json` (shared student layout chunks) |
| Measured | **168.3 KB** |
| Threshold | 300 KB |
| Result | **PASS** |
| Notes | No `qrcode` imports under `src/app/student` or `src/features/student`. Gamification adds no new runtime deps. |

## PERF-02 — Lighthouse Performance ≥ 90 (mobile)

| Field | Value |
|-------|-------|
| Preset | mobile (`.lighthouserc.cjs`) |
| URL | `http://localhost:3000/student/dashboard` |
| Auth | `scripts/lhci-login.mjs` (thiago.demo@escola.pi.gov.br) |
| MSW | `NEXT_PUBLIC_USE_MOCK=true` (default in pilot) |
| Command | `npm run perf:student` |
| Config assert | `categories:performance` minScore **0.9** |
| Automated score | Pending — run `npm run perf:student` with port 3000 free (stop `npm run dev` first) |
| Manual fallback | Chrome DevTools Lighthouse (mobile) logged in on `/student/dashboard` |
| Result | **CONFIGURED** — execute `npm run perf:student` before phase closeout |

## npm audit (07-02)

| Severity | Count | Notes |
|----------|-------|-------|
| high/critical | 0 | `npm audit --audit-level=high` clean |
| moderate | 2 | transitive via `@lhci/cli` (dev-only) and `next/postcss` — documented, no production runtime impact |

## Links

- README: [Performance gates (Fase 7)](../../../README.md)
- Script: `scripts/measure-student-bundle.mjs`
- LHCI: `.lighthouserc.cjs`
