# VisionEdu

Plataforma web de recomposição de aprendizagem e acompanhamento pedagógico para o Ensino Médio público. O sistema conecta alunos e professores em um ambiente único: trilhas de aprendizagem personalizadas (com apoio de IA via n8n), banco de questões do ENEM, materiais educacionais com anexos, diagnósticos e gestão de turmas — com autenticação, perfis e dados persistidos em PostgreSQL.

## Equipe

- Luizmário Leal Eremita
- Eduardo Herluz de Sousa
- Gustavo Rocha
- Luís Fernando
- Kemmy Araújo Lima

## Pilha de tecnologias

| Camada | Tecnologias |
|--------|-------------|
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router), [React](https://react.dev/) 19 |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **Estilo** | [Tailwind CSS](https://tailwindcss.com/) 4, [shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/), [Lucide](https://lucide.dev/) |
| **Banco de dados** | [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/) ORM |
| **Autenticação** | JWT ([jose](https://github.com/panva/jose)), cookies de sessão, [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Formulários e validação** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Estado (cliente)** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Armazenamento de arquivos** | Disco local (`uploads/`) ou [AWS S3](https://aws.amazon.com/s3/) (compatível com R2/MinIO) |
| **Integrações** | Webhooks [n8n](https://n8n.io/) (resolução de questões ENEM com IA e geração de trilhas) |
| **Outros** | [next-themes](https://github.com/pacocoursey/next-themes), [QRCode](https://www.npmjs.com/package/qrcode), ESLint |

## Estrutura de pastas

```
VisionEdu-2026/
├── docs/                       # Documentação de integrações (fluxos n8n)
├── prisma/
│   ├── migrations/             # Migrações do banco
│   ├── schema.prisma           # Modelo de dados
│   └── seed.ts                 # Dados iniciais e contas demo
├── public/                     # Assets estáticos
├── scripts/                    # Scripts utilitários de validação
├── src/
│   ├── app/                    # Rotas e layouts (App Router)
│   │   ├── (auth)/             # Login, cadastro, termos e privacidade
│   │   ├── api/v1/             # Route Handlers REST (auth, alunos, professores)
│   │   ├── student/            # Área do aluno (dashboard, trilha, ENEM, materiais)
│   │   └── teacher/            # Área do professor (turmas, materiais, diagnósticos)
│   ├── components/             # UI compartilhada (layout, shadcn, providers)
│   ├── features/               # Módulos por domínio (auth, student, teacher)
│   ├── hooks/                  # Hooks React reutilizáveis
│   ├── lib/                    # Utilitários, validações Zod, cliente Prisma, ENEM
│   ├── mocks/data/             # Dados estáticos do piloto CETI (BNCC, fixtures)
│   ├── server/                 # Lógica de servidor (auth, materiais, ENEM, n8n, storage)
│   ├── services/               # Clientes HTTP no browser
│   ├── stores/                 # Stores Zustand (ex.: autenticação)
│   ├── types/                  # Tipos TypeScript de domínio
│   └── middleware.ts           # Proteção de rotas por sessão JWT
├── uploads/                    # Anexos locais (gitignored; dev)
├── .env.example                # Variáveis de ambiente de referência
└── package.json
```

---

## Começando

### Pré-requisitos

- Node.js 18+ instalado
- npm instalado
- PostgreSQL (para autenticação e dados reais)

### Instalação

```bash
npm install
cp .env.example .env
# Ajuste DATABASE_URL, JWT_SECRET e webhooks n8n no .env
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
| Aluno | Questões ENEM | `/student/questoes` |
| Aluno | Materiais | `/student/materiais` |
| Aluno | Atividade MCQ | `/student/atividade/550e8400-e29b-41d4-a716-446655440000` |
| Professor | Turmas | `/teacher/turmas` |
| Professor | Materiais | `/teacher/materiais` |
| Professor | Novo diagnóstico | `/teacher/diagnosticos/novo` |
| Professor | Compartilhar atividade | `/teacher/compartilhar/[activityId]` |

O progresso parcial de atividades é salvo em `localStorage` (rascunho) entre recarregamentos da página.
