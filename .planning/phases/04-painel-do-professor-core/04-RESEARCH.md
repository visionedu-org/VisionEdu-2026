# Phase 4 Research: Painel do Professor (Core)

**Researched:** 2026-05-21
**Confidence:** HIGH

## Objective

Como entregar painel professor responsivo, relatório BNCC, CRUD mock de conteúdos/diagnósticos e compartilhamento link/QR reutilizando padrões da Fase 3?

## Key Findings

### 1. Rotas propostas

| Rota | Uso |
|------|-----|
| `/teacher/dashboard` | Overview + atalhos |
| `/teacher/turmas` | Lista turmas do professor |
| `/teacher/turmas/[classId]` | Dashboard turma TEACH-01 |
| `/teacher/turmas/[classId]/bncc` | Relatório TEACH-02 |
| `/teacher/conteudos/novo` | Criar material TEACH-03 |
| `/teacher/diagnosticos/novo` | Builder MCQ TEACH-04 |
| `/teacher/compartilhar/[activityId]` | Link + QR TEACH-05 |

`classId` = `${grade}-${class_identifier}` slug ou UUID estável do seed — usar slug `2-A` derivado de teacher_classes para URLs legíveis.

### 2. Layout responsivo

- Wrapper: `flex min-h-screen` — sidebar `hidden md:flex w-56` + main `flex-1`
- Mobile: `TeacherMobileNav` com Sheet/overlay — links iguais à sidebar
- Conteúdo: `p-4 md:p-6`, grids `grid-cols-1 lg:grid-cols-2` no dashboard

### 3. MSW endpoints (contratos futuros)

| Método | Rota |
|--------|------|
| GET | `/api/v1/teachers/me/classes` |
| GET | `/api/v1/teachers/classes/:classId/dashboard` |
| GET | `/api/v1/teachers/classes/:classId/bncc-gaps` |
| POST | `/api/v1/teachers/contents` |
| POST | `/api/v1/teachers/activities` |
| GET | `/api/v1/teachers/activities/:id` |

Store em memória `teacher-content-memory.ts` para conteúdos/atividades criados na sessão + merge com fixtures.

### 4. QR Code

```bash
npm install qrcode
npm install -D @types/qrcode
```

Gerar Data URL no client com `QRCode.toDataURL(shareUrl, { width: 256, margin: 2 })` — exibir em `<img alt="QR Code da atividade">`.

### 5. BNCC fixture

`src/mocks/data/bncc-competencies.ts`:
- Lista master de competências EM13*
- Por classId, domínio % e dificuldade variados

### 6. Integração aluno (Fase 3)

Share URL: `${window.location.origin}/student/atividade/${activityId}`  
Alternativa: `/student/entrar?code=${activityId}`

Ao POST diagnostic, registrar activity em `demoActivities` map (extend handler students GET) ou memória compartilhada exportada de `teacher-memory.ts`.

### 7. Validação

- `contentFormSchema`, `diagnosticFormSchema` com Zod
- BNCC tag obrigatória por questão
- Testes Vitest MSW feliz path

## Validation Architecture

| TEACH-ID | Verification |
|----------|--------------|
| TEACH-01 | Dashboard class retorna averages + topErrors[3] |
| TEACH-02 | BNCC endpoint ≥6 rows com código EM13 |
| TEACH-03 | POST content 201 |
| TEACH-04 | POST activity com questions[].bnccCode |
| TEACH-05 | Share page renders QR img + copy |
| TEACH-06 | Tailwind md: breakpoints; manual 360px checklist |

## RESEARCH COMPLETE
