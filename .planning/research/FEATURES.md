# Features Research

**Domain:** EdTech — recomposição de aprendizagem + IA socrática + supervisão em sala
**Researched:** 2026-05-20
**Confidence:** HIGH (derivado do PDR MVP)

## Table Stakes (usuário espera — v1 frontend)

| Feature | Complexity | Dependencies | PDR Ref |
|---------|------------|--------------|---------|
| Login e cadastro por papel (aluno/professor) | Medium | Mock auth | RF-001, RF-002 |
| Sessão persistente (JWT mock, 8h aluno) | Low | Auth | RF-002 |
| Painel aluno com dados escolares e desempenho | Medium | Auth | RF-003 |
| Trilha de estudo visual | High | Diagnóstico mock | RF-004 |
| Dashboard turma (médias, erros frequentes) | Medium | Auth professor | RF-005 |
| Relatório lacunas BNCC | Medium | Dados diagnóstico mock | RF-006 |
| Publicar materiais (texto, vídeo, PDF UI) | Medium | Auth professor | RF-07 |
| Criar avaliação diagnóstica MCQ + BNCC | High | Content | RF-08 |
| Compartilhar atividade (link/QR) | Low | Activities | RF-09 |
| Resolver questões com progresso salvo | Medium | Cache local | RNF-001 |
| Ping de foco na aba (15s) | Medium | Activity context | Lei 15.100, §11.2 |
| Dashboard foco tempo real professor | High | Ping mock + SSE | RF-006, realtime |
| Chat tutor socrático (sem gabarito) | High | Questão ativa | RF-012 |
| Diagnóstico adaptativo UI + lacunas | High | Avaliação | RF-010 |
| Trilha personalizada pós-diagnóstico | High | Gaps mock | RF-011 |
| Gamificação XP/nível/badges | Medium | Student profile | Fase 4 PDR roadmap |
| Mobile-first 360px+ | Medium | Tailwind | RNF-002 |
| Copy conformidade Lei 15.100 | Low | Teacher dashboard | §4 PDR |

## Differentiators (competitivo — v1 UI preparada, lógica mock)

| Feature | Complexity | Notes |
|---------|------------|-------|
| Tutor socrático com prompt restritivo | High | Mock respeita 5 regras §10.1 |
| Ping legal de presença pedagógica | Medium | Diferencial regulatório Brasil |
| Recomposição de base antes do conteúdo da turma | High | Visualização trilha ramificada |
| Relatório BNCC automatizado para professor | Medium | Competências EM13MAT* etc. |

## Anti-Features (não construir no frontend MVP)

| Anti-Feature | Reason |
|--------------|--------|
| Revelar gabarito no chat tutor | Viola pedagogia socrática RF-012 |
| Feed social entre alunos | Fora do PDR; distrai foco pedagógico |
| Notificações push nativas | Sem app nativo |
| Editor WYSIWYG pesado | Bundle; usar markdown/simple rich text |
| Vídeo hosting próprio | Links externos YouTube/Drive |
| Dashboard SEDUC estadual | Persona D fora MVP |

## Feature Dependencies (build order)

```text
Auth UI → Student/Teacher shells → Content/Diagnostic UI → Activity player
    → Ping + Realtime dashboard → AI Tutor + Path → Gamification → Perf/A11y polish
```

## Category Summary

| Category | Table Stakes | v1 Frontend | v2 |
|----------|--------------|-------------|-----|
| Auth | 4 | 4 | OAuth |
| Student | 5 | 5 | — |
| Teacher | 6 | 6 | SEDUC |
| Content | 4 | 4 | — |
| Realtime | 2 | 2 | WebSocket real |
| AI (UI) | 3 | 3 | LLM real |
| Gamification | 3 | 3 | Leaderboard turma |
| Compliance UX | 2 | 2 | Fluxo LGPD completo |
