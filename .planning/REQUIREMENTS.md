# Requirements: VisionEdu Frontend MVP

**Defined:** 2026-05-20
**Core Value:** Aluno recompõe lacunas com trilha e tutor socrático sem vergonha; professor vê foco em tempo real e lacunas BNCC — tudo validável na UI com mocks antes da API real.

## v1 Requirements

### Infrastructure & Mock Layer

- [ ] **INFR-01**: Projeto Next.js 15 App Router com TypeScript, Tailwind e estrutura `src/` conforme arquitetura pesquisada
- [ ] **INFR-02**: MSW intercepta rotas ` /api/v1/*` do PDR com fixtures tipadas
- [ ] **INFR-03**: Camada `Service` com interfaces permitindo trocar mock por API real via variável de ambiente
- [ ] **INFR-04**: Tipos de domínio (`User`, `Student`, `Teacher`, `Activity`, `DiagnosticResult`, etc.) alinhados ao schema PDR §9

### Authentication & Session

- [ ] **AUTH-01**: Aluno pode cadastrar-se com nome, e-mail, senha, escola, série (1º–3º) e turma (ex.: A, B)
- [ ] **AUTH-02**: Professor pode cadastrar-se com nome, e-mail, senha, escolas vinculadas e turmas lecionadas
- [ ] **AUTH-03**: Usuário pode fazer login com e-mail e senha e receber sessão mock JWT
- [ ] **AUTH-04**: Sessão do aluno persiste até 8 horas (mock) sem desconexão no período escolar
- [ ] **AUTH-05**: Rotas e layouts redirecionam por papel (`student` | `teacher`); área cruzada bloqueada

### Student Experience

- [ ] **STUD-01**: Aluno vê painel com dados escolares, atividades concluídas e score médio
- [ ] **STUD-02**: Aluno visualiza trilha ativa de estudo (grafo ou steps) com módulos bloqueado/atual/concluído
- [ ] **STUD-03**: Aluno abre atividade compartilhada (link ou QR) e resolve questões de múltipla escolha
- [ ] **STUD-04**: Progresso parcial da atividade persiste localmente se a conexão cair (RNF-001)
- [ ] **STUD-05**: Interface aluno é utilizável em viewport 360px com alvos de toque adequados (RNF-002)

### Teacher Experience

- [x] **TEACH-01**: Professor vê dashboard da turma com médias e conceitos com maior taxa de erro (dados mock)
- [x] **TEACH-02**: Professor acessa relatório de lacunas BNCC por competência (ex.: EM13MAT302) mockado
- [x] **TEACH-03**: Professor cria material com título, descrição, disciplina, série e turma (texto, link vídeo, upload PDF UI)
- [x] **TEACH-04**: Professor cria avaliação diagnóstica MCQ associando cada questão a habilidade BNCC
- [x] **TEACH-05**: Professor gera link curto e QR Code para compartilhar atividade na aula
- [x] **TEACH-06**: Layout professor funciona em desktop (sala dos professores) e mobile (acompanhamento em aula)

### Realtime & Compliance

- [ ] **REAL-01**: Durante atividade, cliente envia ping mock a cada 15s com `is_tab_focused` baseado em visibilidade da aba
- [ ] **REAL-02**: Professor vê lista de alunos com status `active` | `idle` | `offline` via stream SSE simulado
- [ ] **REAL-03**: UI exibe copy e fluxo alinhados à Lei 15.100/2025 (uso pedagógico supervisionado)
- [ ] **REAL-04**: Professor confirma início de "aula supervisionada" antes de exibir painel tempo real

### AI & Adaptive Learning (UI + Mock)

- [ ] **AI-01**: Após diagnóstico mock, aluno vê lacunas identificadas (ex.: "Equação 1º grau") vinculadas a erros
- [ ] **AI-02**: Aluno vê trilha reorganizada com módulos de recomposição antes do conteúdo da turma
- [ ] **AI-03**: Na tela de questão, aluno abre chat tutor e recebe dicas mock sem gabarito, em PT-BR coloquial, ≤3 parágrafos, terminando com pergunta socrática (regras §10.1 PDR)
- [ ] **AI-04**: Respostas mock do tutor passam validação automática que bloqueia vazamento de resposta correta

### Gamification

- [ ] **GAME-01**: Perfil aluno exibe XP e nível atuais (mock, defaults schema `students`)
- [ ] **GAME-02**: Aluno desbloqueia badge visual ao concluir marcos (mock triggers)
- [ ] **GAME-03**: Feedback de conquista é acessível (não só animação visual)

### Performance & Accessibility

- [ ] **PERF-01**: Bundle JS inicial da rota de entrada do aluno ≤ 300KB gzip (medido com bundle analyzer)
- [ ] **PERF-02**: Lighthouse Performance ≥ 90 na rota principal do aluno em build de produção
- [ ] **A11Y-01**: Fluxos críticos navegáveis por teclado com ordem de foco lógica
- [ ] **A11Y-02**: Imagens e ícones decorativos seguem `alt` descritivo ou `aria-hidden` conforme WCAG 2.1 AA
- [ ] **A11Y-03**: Contraste de texto e controles interativos atende WCAG 2.1 AA

## v2 Requirements

### Admin & Institutional

- **ADMIN-01**: Dashboard SEDUC com proficiência agregada por GRE/escola
- **ADMIN-02**: Exportação de relatórios BNCC em PDF/CSV

### Auth & Integrations

- **AUTH-06**: OAuth (Google) para login
- **AUTH-07**: Fluxo completo consentimento LGPD responsáveis

### Realtime & AI (production)

- **REAL-05**: Integração SSE/WebSocket real com Redis backend
- **AI-05**: Tutor conectado a LLM via backend (LangChain), não mock

### Gamification

- **GAME-04**: Ranking opt-in por turma

## Out of Scope

| Feature | Reason |
|---------|--------|
| API NestJS, PostgreSQL, Redis | Milestone backend separado; apenas mocks no frontend atual |
| LangChain / N8N / DeepSeek no browser | Segurança e escopo; simulação local |
| App nativo | Web responsiva suficiente para MVP |
| Painel gestor SEDUC | Persona D — v2 |
| Correção automática de provas dissertativas | MVP foca MCQ diagnóstico |
| Hospedagem de vídeo | Apenas links externos |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFR-01 | Phase 1 | Pending |
| INFR-02 | Phase 1 | Pending |
| INFR-03 | Phase 1 | Pending |
| INFR-04 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| STUD-01 | Phase 3 | Pending |
| STUD-02 | Phase 3 | Pending |
| STUD-03 | Phase 3 | Pending |
| STUD-04 | Phase 3 | Pending |
| STUD-05 | Phase 3 | Pending |
| TEACH-01 | Phase 4 | Complete |
| TEACH-02 | Phase 4 | Complete |
| TEACH-03 | Phase 4 | Complete |
| TEACH-04 | Phase 4 | Complete |
| TEACH-05 | Phase 4 | Complete |
| TEACH-06 | Phase 4 | Complete |
| REAL-01 | Phase 5 | Pending |
| REAL-02 | Phase 5 | Pending |
| REAL-03 | Phase 5 | Pending |
| REAL-04 | Phase 5 | Pending |
| AI-01 | Phase 6 | Pending |
| AI-02 | Phase 6 | Pending |
| AI-03 | Phase 6 | Pending |
| AI-04 | Phase 6 | Pending |
| GAME-01 | Phase 7 | Pending |
| GAME-02 | Phase 7 | Pending |
| GAME-03 | Phase 7 | Pending |
| PERF-01 | Phase 7 | Pending |
| PERF-02 | Phase 7 | Pending |
| A11Y-01 | Phase 7 | Pending |
| A11Y-02 | Phase 7 | Pending |
| A11Y-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-20*
*Last updated: 2026-05-20 after roadmap creation*
