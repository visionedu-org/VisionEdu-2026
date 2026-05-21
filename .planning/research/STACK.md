# Stack Research

**Domain:** EdTech frontend — plataforma pedagógica mobile-first com IA simulada
**Researched:** 2026-05-20
**Confidence:** HIGH (alinhado ao PDR v1.1)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (App Router) | Framework full-stack React, SSR/SSG, rotas | PDR oficial; code splitting e `next/image` para RNF-001 |
| React | 19.x | UI componentes | Ecossistema maduro; Server/Client Components |
| TypeScript | 5.x | Tipagem estática | Reduz erros de integração futura com NestJS |
| Tailwind CSS | 4.x | Design system utilitário | RNF-002 mobile 360px+; tokens rápidos |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MSW (Mock Service Worker) | 2.x | Mock REST + SSE em dev e Storybook | Todo o MVP até API real |
| Zustand | 5.x | Estado cliente (auth, sessão mock JWT) | Sessão 8h aluno, perfil ativo |
| TanStack Query | 5.x | Cache servidor mock, retry offline | Dashboards, listas de turma |
| Zod | 3.x | Validação formulários cadastro/login | RF-001 campos por role |
| next-intl ou i18n mínimo | — | PT-BR copy pedagógico | Tutor e mensagens legais |
| qrcode.react | — | QR Code compartilhamento atividade | RF-09 |
| idb-keyval ou Dexie | — | Cache progresso questão offline | RNF-001 queda de rede |
| Recharts ou visx | — | Trilha visual, gráficos turma | RF-004, RF-005 |
| EventSource polyfill | — | SSE mock professor | RF realtime PDR |
| clsx + tailwind-merge | — | Classes condicionais | Padrão shadcn-like |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + Prettier | Lint/format | Regras do projeto VisionEdu |
| Storybook | Componentes isolados | Painéis aluno/professor |
| Vitest + Testing Library | Testes UI críticos | Fluxos auth e ping |
| Lighthouse CI | Performance > 90 | Gate RNF-001 |
| @next/bundle-analyzer | Bundle ≤ 300KB gzip | Monitorar por rota |

## Installation

```bash
npx create-next-app@latest visionedu-web --typescript --tailwind --eslint --app --src-dir
npm install zustand @tanstack/react-query zod msw idb-keyval qrcode.react recharts clsx tailwind-merge
npm install -D @next/bundle-analyzer vitest @testing-library/react @testing-library/jest-dom
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| MSW | JSON Server | MSW melhor para SSE, delays e cenários de erro |
| Zustand | Redux Toolkit | RTK se time já padronizado em Redux |
| TanStack Query | SWR | Query melhor para invalidação de cache mock |
| Recharts | Chart.js | Recharts integra bem com React e acessibilidade configurável |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Sem SSR, bundle maior | Next.js |
| CSS-in-JS pesado (styled-components runtime) | Aumenta bundle | Tailwind |
| Socket.io no frontend-only MVP | Backend realtime ausente | SSE mock + EventSource |
| Chamadas diretas OpenAI/DeepSeek no browser | Segredo de API, fora do escopo | Fixtures mock tutor |
| Material UI completo | Bundle grande vs 300KB meta | Tailwind + componentes próprios leves |

## Stack Patterns by Variant

**Se conexão instável (aluno):**
- Service Worker opcional em fase posterior; MVP usa IndexedDB para rascunho de respostas
- Rotas leves: lazy load painel professor desktop

**Se integração API real (futuro):**
- Trocar `baseUrl` em `api/client.ts`; manter mesmas interfaces Zod
- Desligar MSW via env `NEXT_PUBLIC_USE_MOCK=false`

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@15 | react@19 | Verificar release notes App Router |
| msw@2 | next@15 | Handlers em `src/mocks/handlers.ts` |
| tailwind@4 | postcss | Config em `tailwind.config.ts` |

## Sources

- PDR VisionEdu §7.1 Frontend
- Next.js docs (App Router, performance)
- MSW v2 documentation
