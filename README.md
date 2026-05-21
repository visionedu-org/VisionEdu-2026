# VisionEdu - Frontend MVP

Plataforma de recomposição de aprendizagem e acompanhamento pedagógico auxiliado por IA, voltada para o Ensino Médio público.

## Começando

### Pré-requisitos
- Node.js 18+ instalado
- npm instalado

### Instalação
```bash
npm install
```

### Rodar em Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build de Produção
```bash
npm run build
```

---

## Estrutura de Pastas

O projeto utiliza a seguinte estrutura dentro do diretório `src/`:
- `app/`: Contém as rotas e layouts do Next.js (App Router).
- `components/`: Componentes genéricos e de UI (ex.: shadcn).
- `features/`: Lógica e componentes organizados por funcionalidade (Fase 2+).
- `mocks/`: Fixtures, sementes e handlers do MSW (Mock Service Worker).
- `services/`: Serviços e clientes de API (ex.: chamadas HTTP, localStorage).
- `types/`: Definições de tipos e interfaces de domínio baseados no PDR.
- `lib/`: Utilitários gerais e wrappers.

---

## Análise de Bundle e Performance

Para atingir a meta do requisito **RNF-001** (bundle inicial ≤ 300KB gzip), foi configurado o `@next/bundle-analyzer`.

Para analisar o tamanho do bundle, execute:
```bash
npm run analyze
```
Este comando criará os arquivos de build de produção e abrirá um relatório interativo no navegador mostrando o peso de cada dependência e chunk.

### Performance gates (Fase 7)

Medição automatizada do bundle da rota de entrada do aluno (`/student/dashboard`), meta **≤ 300 KB gzip** (PERF-01):

```bash
npm run build
npm run measure:bundle
```

Lighthouse Performance ≥ 90 na mesma rota (preset mobile, login automático via MSW):

```bash
npm run perf:student
```

Evidências documentadas em `.planning/phases/07-gamifica-o-e-polimento/07-VERIFICATION.md`.

---

## Configuração do Mock Service Worker (MSW)

Este projeto funciona opcionalmente com dados mockados integrados em tempo de execução via MSW (Mock Service Worker).

Você pode controlar este comportamento configurando a variável no arquivo `.env.local`:
- `NEXT_PUBLIC_USE_MOCK=true` (padrão): Intercepta chamadas de API com MSW e retorna dados estáticos.
- `NEXT_PUBLIC_USE_MOCK=false`: Desativa interceptação MSW e tenta fazer chamadas reais para a URL da API real.

---

## Contas demo (MSW)

Com `NEXT_PUBLIC_USE_MOCK=true` e `npm run dev`:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Aluno | `thiago.demo@escola.pi.gov.br` | `senhaDemo123` |
| Professor | `regina.demo@escola.pi.gov.br` | `senhaDemo123` |

**Fluxo sugerido:** Home → Sou aluno/professor → Login → dashboard. A sessão do aluno persiste 8h (mock) após refresh.

### Demo aluno — Fase 3

Após login como aluno:

| Recurso | URL |
|---------|-----|
| Painel + trilha | `/student/dashboard` |
| Lista de atividades | `/student/atividades` |
| Atividade MCQ (deep link) | `/student/atividade/550e8400-e29b-41d4-a716-446655440000` |
| Entrada por código | `/student/entrar?code=550e8400-e29b-41d4-a716-446655440000` |

O progresso da atividade é salvo em `localStorage` a cada resposta; após recarregar a página, use **Continuar de onde parou**.

### Demo professor — Fase 4

Após login como professor (`regina.demo@escola.pi.gov.br` / `senhaDemo123`):

1. **Criar diagnóstico:** `/teacher/diagnosticos/novo` — adicione questões MCQ com habilidade BNCC e envie.
2. **Compartilhar:** redirecionamento para `/teacher/compartilhar/[activityId]` — copie o link ou projete o QR Code na sala.
3. **Abrir como aluno:** faça logout, entre como aluno demo e abra o link `/student/atividade/{id}` (ou `/student/entrar?code={id}`).

Outros recursos do painel:

| Recurso | URL |
|---------|-----|
| Turmas e dashboard | `/teacher/turmas` → selecionar turma |
| Lacunas BNCC | `/teacher/turmas/2-A/bncc` |
| Novo material | `/teacher/conteudos/novo` |

**Testes automatizados:**
```bash
npm run test
```
