# Architecture Research

**Domain:** Frontend VisionEdu (mock-first)
**Researched:** 2026-05-20
**Confidence:** HIGH

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│  Presentation (Next.js App Router)                          │
│  ├─ (public)/login, register                                │
│  ├─ (student)/mobile layout — dashboard, path, activity     │
│  └─ (teacher)/responsive — classes, content, realtime       │
├─────────────────────────────────────────────────────────────┤
│  Application Layer (hooks + Zustand)                        │
│  authStore | activitySession | pingScheduler | tutorChat    │
├─────────────────────────────────────────────────────────────┤
│  Service Layer (interfaces)                                 │
│  AuthService | StudentService | TeacherService | AIService  │
├─────────────────────────────────────────────────────────────┤
│  Data Access                                                │
│  MockHttpClient (MSW) | LocalDraftStore (IndexedDB)       │
└─────────────────────────────────────────────────────────────┘
         │ (futuro) HTTPS + JWT
         ▼
    NestJS API (fora do escopo atual)
```

## Component Boundaries

| Component | Responsibility | Talks To |
|-----------|----------------|----------|
| Route layouts `(student)` / `(teacher)` | Shell, nav, role guard | authStore |
| `api/client.ts` | fetch wrapper, JWT header | MSW ou API real |
| `mocks/handlers/*` | REST + SSE fixtures | MSW worker |
| `features/auth` | Cadastro adaptativo, login | AuthService |
| `features/student` | Dashboard, trilha, player | StudentService |
| `features/teacher` | Turmas, conteúdo, diagnóstico | TeacherService |
| `features/realtime` | Ping 15s, SSE consumer | PingService, EventSource |
| `features/tutor` | Chat socrático UI | AIService (mock) |
| `features/gamification` | XP, badges | StudentService |
| `lib/offline` | Rascunho questões | IndexedDB |

## Data Flow

### Autenticação (mock)

```text
Form → Zod validate → AuthService.register/login
  → MSW returns { access_token, user, profile }
  → Zustand persist (localStorage) → middleware redirect by role
```

### Ping de atividade (mock)

```text
ActivityPage mount → startInterval(15s)
  → POST /api/v1/students/ping { is_tab_focused: document.visibility }
  → MSW updates in-memory store
  → Teacher SSE stream emits updated student list
```

### Tutor socrático (mock)

```text
Aluno pede dica → AIService.chat(questionContext, wrongAnswer)
  → Mock engine: rule-based OR fixture JSON (nunca gabarito)
  → UI chat bubble com pergunta final instigante
```

## Suggested Build Order

1. Scaffold Next.js + Tailwind tokens + layouts vazios
2. MSW + tipos PDR (`User`, `Student`, `Activity`, etc.)
3. Auth flows + guards
4. Student vertical slice (dashboard → activity)
5. Teacher vertical slice (dashboard → create content)
6. Realtime ping + SSE dashboard
7. AI UI (diagnostic results → path → tutor)
8. Gamification + performance pass

## Route Structure (proposta)

```text
app/
  (auth)/login, register/student, register/teacher
  (student)/dashboard, trilha, atividade/[id], perfil
  (teacher)/turmas, turmas/[classId], conteudos/novo,
              avaliacoes/nova, turmas/[classId]/tempo-real
  api/ (opcional BFF futuro)
```

## Integration Points (futuro backend)

| Mock endpoint | Real endpoint PDR | Swap effort |
|---------------|-------------------|-------------|
| POST /api/v1/auth/register | Igual | Baixo — mesma interface |
| POST /api/v1/auth/login | Igual | Baixo |
| POST /api/v1/students/ping | Igual | Baixo |
| GET /api/v1/teachers/classes/:id/realtime | SSE | Médio — testar EventSource real |
| POST /api/v1/ai/tutor/chat | Igual | Baixo — só trocar body parser |

## Security (frontend)

- JWT mock apenas em memória/localStorage; nunca logar senha
- Rotas professor/aluno isoladas por middleware Next.js
- Sanitizar HTML em materiais postados (DOMPurify se rich text)
