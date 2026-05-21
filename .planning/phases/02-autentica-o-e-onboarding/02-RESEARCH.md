# Phase 2 Research: Autenticação e Onboarding

**Researched:** 2026-05-21
**Confidence:** HIGH

## Objective

Responder: *como implementar cadastro/login mock, sessão 8h, guards por papel e dashboards esqueleto no Next.js App Router com o que já existe no repo?*

## Prerequisites (Fase 1)

Fase 2 **depende** dos planos 01-02 (tipos, seed CETI, `apiClient`, `AuthService`) e 01-03 (MSW handlers auth/schools). Se MSW ainda não estiver ativo, executar Fase 1 antes de 02-03.

## Key Findings

### 1. Dependências a instalar

```bash
npm install zustand zod react-hook-form @hookform/resolvers
```

`zustand` middleware `persist` para localStorage. `@hookform/resolvers/zod` integra shadcn Form.

### 2. Next.js Middleware + cookie espelhado

- Arquivo `src/middleware.ts` na raiz do projeto (ou `middleware.ts` ao lado de `src/` conforme Next 16).
- Ler cookie `visionedu_session` (JSON ou token+role+exp) — **não** depender de localStorage no middleware (server não acessa).
- No login/register success (client): `document.cookie` com `path=/`, `max-age` alinhado a `session_expires_at`, `SameSite=Lax`.
- Matcher: `['/((?!_next|api|favicon|.*\\..*).*)']` ou lista explícita `(student)`, `(teacher)`, `(auth)`.

### 3. Zustand auth store

```ts
// src/stores/auth-store.ts (ou src/features/auth/store.ts)
interface AuthState {
  accessToken: string | null
  user: UserProfile | null
  role: UserRole | null
  expiresAt: number | null
  setSession: (payload) => void
  clearSession: () => void
  isExpired: () => boolean
}
```

`persist` name: `visionedu-auth`. No `setSession`, sincronizar cookie via helper `syncSessionCookie()`.

### 4. Formulários (react-hook-form + Zod + shadcn)

- `Form`, `FormField`, `FormMessage` do shadcn (add `form`, `checkbox`, `select` se faltando).
- Schemas em `src/lib/validations/auth.ts`:
  - `loginSchema`: email, password, role enum
  - `registerStudentSchema`: name, email, password (min 8), school_id, grade, class_identifier, termsAccepted
  - `registerTeacherSchema`: + `classes: { school_id, grade, class_identifier }[]` min 1
- Dropdowns CETI: hook `useCetiOptions()` lendo `ceti-seed.ts` + GET `/api/v1/schools` quando MSW ativo.

### 5. Rotas App Router (decisões CONTEXT)

| Rota | Arquivo |
|------|---------|
| `/login` | `src/app/(auth)/login/page.tsx` |
| `/register/student` | `src/app/(auth)/register/student/page.tsx` |
| `/register/teacher` | `src/app/(auth)/register/teacher/page.tsx` |
| `/unauthorized` | `src/app/unauthorized/page.tsx` |
| Dashboard aluno | `src/app/(student)/dashboard/page.tsx` |
| Dashboard professor | `src/app/(teacher)/dashboard/page.tsx` |
| Termos | `src/app/(auth)/termos/page.tsx` |
| Privacidade | `src/app/(auth)/privacidade/page.tsx` |

Home `page.tsx`: links `<Link href="/login">` com `onClick` ou state para pré-selecionar role no login (sessionStorage key `visionedu_login_role`).

### 6. MSW auth (estender 01-03)

- POST register: validar body Zod-like; 422 com `{ errors: { field: message } }` para erros inline.
- POST login: 401 credencial inválida; 200 com `{ access_token, expires_in: 28800, user }` para student.
- Professor `expires_in`: 86400 (24h) — discrição CONTEXT.
- Persistir novos users em memória (Map) + seed para demo emails fixos no README.

### 7. Página 403

`src/app/unauthorized/page.tsx` — heading, explicação institucional, link "Voltar ao meu painel" usando role do store.

### 8. Dashboards esqueleto

- Componentes `StudentDashboardSkeleton`, `TeacherDashboardSkeleton` em `src/features/auth/components/`.
- Cards com `aria-disabled` ou badge "Em breve"; dados reais só nome, escola, turma(s) do `user` no store.

### 9. Acessibilidade erros (AUTH-03)

- `FormMessage` por campo.
- Resumo: `<div role="alert" aria-live="assertive">` quando `form.formState.errors.root` ou erro API 401/422 mapeado para `setError('root', ...)`.

### 10. Vitest (02-03)

- `src/features/auth/__tests__/auth-flow.test.ts` — MSW node:
  - login student demo → token
  - login wrong password → throw/401
  - register student → 201
  - register teacher multi-class
- Opcional: RTL smoke em login form (role radio, submit disabled sem terms).

## Anti-patterns

| Avoid | Use instead |
|-------|-------------|
| JWT decode no browser para exp | `session_expires_at` number |
| Middleware lendo localStorage | Cookie espelhado |
| Redirect silencioso papel errado | `/unauthorized` 403 UX |
| Hub `/auth` com abas | Rotas dedicadas (CONTEXT) |

## Validation Architecture

| Layer | What to validate |
|-------|------------------|
| Unit | Zod schemas reject invalid email, short password, missing terms |
| Integration | MSW node — login/register happy + 401/422 |
| E2E manual | Home → login → dashboard; refresh persiste 8h; student não acessa `/teacher/dashboard` → 403 |
| a11y | axe ou checklist: role="alert", labels, focus order nos forms |
| Build | `npm run lint`, `npm run build`, `npm run test` |

## Handlers / API contract

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/auth/login` | Body: email, password; optional role check server-side |
| POST | `/api/v1/auth/register` | Body PDR §11.1 + teacher `classes[]` |
| GET | `/api/v1/schools` | Schools + nested classes for dropdowns |

## Risks

| Risk | Mitigation |
|------|------------|
| Fase 1 incompleta | Gate: verify `ceti-seed.ts` e MSW handlers exist before 02-01 |
| Cookie/httpOnly confusion | MVP usa cookie legível + documentar troca futura API real |
| Hydration mismatch auth | Store rehydrate + middleware redirect only on server cookie |

## RESEARCH COMPLETE
