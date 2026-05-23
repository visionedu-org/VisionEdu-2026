# VisionEdu - Frontend MVP

Plataforma de recomposição de aprendizagem e acompanhamento pedagógico auxiliado por IA, voltada para o Ensino Médio público.

## Começando

### Pré-requisitos
- Node.js 18+ instalado
- npm instalado
- PostgreSQL (para autenticação e dados reais)

### Instalação
```bash
npm install
cp .env.example .env
# Ajuste DATABASE_URL e JWT_SECRET no .env
npm run db:migrate
npm run db:seed
```

### Rodar em Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Build de Produção
```bash
npm run build
npm run start
```

---

## Estrutura de Pastas

O projeto utiliza a seguinte estrutura dentro do diretório `src/`:
- `app/`: Rotas e layouts do Next.js (App Router), incluindo Route Handlers em `app/api/`.
- `components/`: Componentes genéricos e de UI (ex.: shadcn).
- `features/`: Lógica e componentes organizados por funcionalidade.
- `mocks/data/`: Dados estáticos do piloto CETI (escolas, atividades demo, BNCC) usados na UI até integração completa com a API.
- `services/`: Clientes HTTP para a API (`apiClient`).
- `types/`: Tipos de domínio.
- `lib/`: Utilitários, validações e Prisma.

---

## Análise de Bundle (opcional)

Para inspecionar o tamanho do bundle de produção:

```bash
npm run analyze
```

---

## Contas demo (banco de dados)

Após `npm run db:seed`, use as credenciais criadas no seed do Prisma (`prisma/seed.ts`):

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Aluno | `thiago.demo@escola.pi.gov.br` | `senhaDemo123` |
| Professor | `regina.demo@escola.pi.gov.br` | `senhaDemo123` |

**Fluxo sugerido:** Home → Sou aluno/professor → Login → dashboard.

### Rotas principais

| Perfil | Recurso | URL |
|--------|---------|-----|
| Aluno | Painel + trilha | `/student/dashboard` |
| Aluno | Atividades | `/student/atividades` |
| Aluno | Atividade MCQ | `/student/atividade/550e8400-e29b-41d4-a716-446655440000` |
| Professor | Turmas | `/teacher/turmas` |
| Professor | Novo diagnóstico | `/teacher/diagnosticos/novo` |
| Professor | Compartilhar atividade | `/teacher/compartilhar/[activityId]` |

O progresso parcial de atividades é salvo em `localStorage` (rascunho) entre recarregamentos da página.
