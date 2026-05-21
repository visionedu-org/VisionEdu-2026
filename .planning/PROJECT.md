# VisionEdu

## What This Is

**VisionEdu** é uma plataforma web de recomposição de aprendizagem e acompanhamento pedagógico auxiliado por IA, voltada a estudantes e professores do Ensino Médio público (contexto inicial: CETI Luiz Ubiraci de Carvalho, Piauí). O MVP transforma o celular do aluno em ferramenta pedagógica supervisionada em sala e estende o estudo fora dela, com diagnóstico de lacunas, trilhas adaptativas e tutor socrático.

**Escopo deste milestone:** desenvolvimento **exclusivo do frontend** (Next.js + TypeScript + React + Tailwind), com **dados mockados e serviços simulados** até a API NestJS oficial estar disponível. O backend, PostgreSQL, Redis, LangChain e N8N ficam fora do escopo de implementação neste ciclo.

## Core Value

O aluno com lacunas de base consegue **identificar o que não domina, seguir uma trilha que recompõe conceitos pré-requisitos e receber ajuda socrática sem vergonha nem resposta pronta** — enquanto o professor **vê em tempo real quem está focado na atividade pedagógica** e economiza tempo com relatórios de lacunas BNCC.

## Requirements

### Validated

(Nenhum ainda — validar ao concluir cada fase do roadmap frontend.)

### Active

- [ ] Interface mobile-first utilizável a partir de 360px (aluno)
- [ ] Cadastro e login diferenciados Aluno/Professor (UI + mock JWT)
- [ ] Painel do aluno com trilha ativa e histórico de desempenho
- [ ] Painel do professor com dashboard de turma e relatório de lacunas BNCC
- [ ] Criador de materiais e avaliações diagnósticas com tags BNCC
- [ ] Compartilhamento de atividades via link/QR Code
- [ ] Resolução de questões com progresso resiliente a queda de rede (cache local)
- [ ] Ping de atividade e dashboard de foco em tempo real (simulado)
- [ ] Chat do tutor socrático embutido na questão (mock com regras do PDR)
- [ ] Visualização de trilha personalizada pós-diagnóstico (mock IA)
- [ ] Gamificação: XP, nível e badges
- [ ] Conformidade UX com Lei 15.100/2025 (uso pedagógico supervisionado)
- [ ] Performance: bundle inicial ≤ 300KB gzip; Lighthouse Performance > 90

### Out of Scope

- **Backend NestJS, PostgreSQL, Redis** — API real será integrada em milestone posterior; contratos definidos no PDR servem como referência para mocks.
- **LangChain, N8N, chamadas LLM reais** — respostas do tutor e diagnóstico adaptativo simulados com fixtures e regras do prompt socrático.
- **Painel SEDUC / gestão estadual agregada** — persona D existe no PDR; dashboards institucionais ficam para v2.
- **OAuth, 2FA, magic link** — MVP usa e-mail/senha conforme RF-002.
- **App nativo iOS/Android** — web responsiva apenas.
- **Autorização de responsáveis LGPD (fluxo legal completo)** — copy e checkbox no cadastro; integração jurídica real adiada.

## Context

- **Origem:** escolas públicas do PI com salas de ~30 alunos, lacunas do Fundamental no Médio, professor sobrecarregado.
- **Personas:** Thiago (16, mobile, gamificação, vergonha de perguntar); Professora Regina (desktop + mobile em aula, diagnósticos e foco); gestores SEDUC (fora do MVP UI).
- **Fonte de verdade:** `doc/PDR_VisionEdu.md` v1.1 — requisitos funcionais RF-001 a RF-012, RNFs, stack, modelo de dados e endpoints REST.
- **Legal:** Lei Federal 15.100/2025 — celular só com uso pedagógico, supervisão do professor e ping de atividade comprovando foco na aba VisionEdu.
- **Estado do repositório:** greenfield (apenas PDR e regras Cursor); sem app Next.js ainda.

## Constraints

- **Stack (PDR §7.1):** Next.js, TypeScript, React, Tailwind CSS — obrigatório.
- **Frontend-only:** toda persistência temporária via mock API (MSW) + localStorage/IndexedDB onde RNF-001 exige cache offline.
- **Performance (RNF-001):** bundle JS inicial ≤ 300KB gzip; otimizar code-splitting e imagens WebP/AVIF.
- **Mobile-first (RNF-002):** aluno em smartphone de entrada; professor também usa mobile em aula.
- **Acessibilidade:** WCAG 2.1 AA — navegação por teclado, contraste, semântica HTML (regras do projeto em `.cursor/rules/`).
- **Contratos API:** mocks devem espelhar `POST /api/v1/auth/*`, `POST /api/v1/students/ping`, `GET /api/v1/teachers/classes/{id}/realtime` (SSE) do PDR para troca futura sem refatoração massiva da UI.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Frontend-first com camada de serviços mockada | API NestJS ainda indisponível; permite validar UX, fluxos e conformidade legal antes do backend | — Pending |
| MSW + interfaces TypeScript alinhadas ao schema PDR | Troca transparente para API real; tipos compartilháveis depois | — Pending |
| App Router (Next.js 15+) | SSR/SSG, rotas por persona, code splitting nativo para RNF-001 | — Pending |
| MVP em fatias verticais (modo MVP GSD) | Cada fase entrega capacidade ponta-a-ponta testável pelo usuário | — Pending |
| SSE simulado para dashboard professor | PDR prevê SSE; EventSource mockável sem WebSocket no MVP frontend | — Pending |

## Evolution

Este documento evolui em transições de fase e marcos.

**Após cada transição de fase (`/gsd-transition`):**
1. Requisitos invalidados → mover para Out of Scope com motivo
2. Requisitos validados → mover para Validated com referência da fase
3. Novos requisitos → adicionar em Active
4. Decisões → registrar em Key Decisions
5. Revisar se "What This Is" ainda reflete o produto

**Após cada milestone (`/gsd-complete-milestone`):**
1. Revisão completa de todas as seções
2. Core Value ainda é a prioridade correta?
3. Auditar Out of Scope — motivos ainda válidos?
4. Atualizar Context com estado atual (integração API, piloto escola)

---
*Last updated: 2026-05-20 after initialization*
