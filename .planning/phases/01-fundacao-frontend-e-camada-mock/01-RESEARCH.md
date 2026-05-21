# Phase 1 Research: Fundação Frontend e Camada Mock

**Researched:** 2026-05-20
**Confidence:** HIGH

## Objective

Responder: *o que precisamos saber para executar o scaffold Next.js + MSW + tipos PDR sem backend?*

## Key Findings

### 1. create-next-app na raiz

Executar na raiz VisionEdu com `--src-dir` gera `src/app` alinhado a D-05/D-07. Usar nome de pacote `visionedu-web` no `package.json`.

### 2. shadcn/ui mínimo (híbrido)

Instalar apenas: `button`, `input`, `label`, `dialog`, `form` — evita puxar metade do registry. Custom `Card`, `Badge`, `Spinner` em Tailwind puro.

### 3. next-themes + Roboto

`ThemeProvider` em `src/components/providers/theme-provider.tsx` (client). Roboto em `src/app/layout.tsx` com variável CSS `--font-roboto`.

### 4. MSW v2 + App Router

- Browser: `instrumentation.ts` ou dynamic import em `MswProvider` — padrão recomendado 2025: client provider que chama `worker.start({ onUnhandledRequest: 'bypass' })` apenas quando `NEXT_PUBLIC_USE_MOCK=true`
- Node: `setupServer` em `src/mocks/node.ts` importado em `vitest.setup.ts`

### 5. Paleta institucional (tokens)

Sugestão Tailwind extend:
- `primary`: azul `#1e40af` / `#2563eb`
- `secondary`: verde `#15803d`
- Verificar contraste 4.5:1 em texto body sobre `background`

### 6. Tipos PDR

Mapear `role: 'student' | 'teacher' | 'admin'`, `questions_data: Json` em Activity, `identified_gaps: Json` em DiagnosticResult — usar `type` aliases + Zod schemas opcionais em `src/types/schemas.ts` para validação de fixtures.

### 7. Bundle analyzer

`next.config.ts`:
```ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' })
```
Script: `"analyze": "ANALYZE=true npm run build"`

### 8. AuthService stub

Fase 1 só precisa assinatura:
```ts
login(email, password): Promise<AuthResponse>
register(payload): Promise<AuthResponse>
```
Implementação chama `apiClient.post('/auth/login', ...)`.

## Handlers mínimos Fase 1

| Method | Path | Response |
|--------|------|----------|
| GET | `/api/v1/health` | `{ status: 'ok', mock: true }` |
| POST | `/api/v1/auth/login` | JWT mock + user from seed |
| POST | `/api/v1/auth/register` | 201 + token |
| GET | `/api/v1/schools` | CETI + classes |

## Risks

| Risk | Mitigation |
|------|------------|
| shadcn infla bundle | Instalar ≤5 componentes; lazy não necessário em Fase 1 |
| MSW não inicia em SSR | Provider só em `'use client'`; worker start após mount |
| Roboto + dark toggle FOUC | `suppressHydrationWarning` no `<html>` com next-themes |

## Validation Architecture

Fase 1 validável por:
- `npm run lint` / `npm run build`
- `npm run test` (Vitest) — AuthService.login com MSW node
- `curl` ou fetch manual `/api/v1/health` com dev server
- `npm run analyze` documentado

## Sources

- `.planning/research/STACK.md`, `ARCHITECTURE.md`
- MSW v2 docs (browser + Node integration)
- Next.js 15 App Router project structure
- `doc/PDR_VisionEdu.md` §7, §9, §11
