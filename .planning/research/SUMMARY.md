# Research Summary

**Project:** VisionEdu Frontend MVP (mock-first)
**Synthesized:** 2026-05-20

## Executive Summary

O MVP frontend deve entregar **toda a jornada pedagógica visível** (aluno mobile + professor desktop/mobile) usando **Next.js 15 App Router**, **MSW** para simular a API PDR e **IndexedDB** para resiliência offline. A troca para NestJS posteriormente exige apenas alternar o cliente HTTP e desativar mocks — tipos e rotas já alinhados ao PDR.

## Stack (decisão)

- **Next.js 15 + TypeScript + Tailwind 4 + React 19**
- **MSW 2** para REST e SSE mock
- **Zustand + TanStack Query + Zod**
- **idb-keyval** para rascunhos offline
- **Recharts** para trilha e dashboard

## Table Stakes para v1

Autenticação por papel, painéis aluno/professor, criador de conteúdo e diagnóstico BNCC, player de questões, ping de foco + dashboard tempo real, tutor socrático (mock), trilha adaptativa visual, gamificação básica, conformidade Lei 15.100 na UX.

## Architecture Highlights

- Rotas agrupadas `(student)` e `(teacher)` com middleware JWT mock
- Camada `Service` com interfaces estáveis para API futura
- Ping 15s → store mock → SSE para professor

## Watch Out For

1. Bundle ≤ 300KB gzip — monitorar desde fase 1
2. Tutor nunca revela gabarito — testes em fixtures
3. Ping deve usar `visibilityState` real
4. Progresso de questões em IndexedDB
5. Mobile 360px não é opcional

## Implications for Roadmap

| Phase focus | Research support |
|-------------|------------------|
| Fundação + mocks | STACK, ARCHITECTURE §Integration |
| Auth | FEATURES Auth, PITFALLS cadastro |
| Aluno core | FEATURES Student, PITFALLS offline |
| Professor core | FEATURES Teacher |
| Realtime | ARCHITECTURE ping flow, PITFALLS §3, §8 |
| IA UI | FEATURES AI, PITFALLS tutor |
| Polish | STACK bundle tools, PITFALLS a11y |

## Open Questions (defer to discuss-phase)

- Design system: shadcn/ui vs componentes custom leves (impacto bundle)
- Escola piloto: dados seed fixos CETI ou seletor genérico
- Storybook obrigatório em todas as fases ou só fase 7

## Files

- `.planning/research/STACK.md`
- `.planning/research/FEATURES.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/PITFALLS.md`
