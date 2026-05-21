# Phase 2: Autenticação e Onboarding - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 2-Autenticação e Onboarding
**Areas discussed:** Rotas e fluxo de entrada, Formulário do professor (escolas e turmas), Persistência da sessão mock JWT, LGPD e copy no cadastro (MVP), Destino após login/cadastro

---

## Rotas e fluxo de entrada

| Option | Description | Selected |
|--------|-------------|----------|
| Rotas dedicadas | `/login`, `/register/student`, `/register/teacher` | ✓ |
| Hub único `/auth` | Abas aluno/professor | |
| Híbrido | Login compartilhado + registers separados | |
| Dois CTAs home | Sou aluno / Sou professor | ✓ |
| Um CTA Entrar | Login genérico | |
| Login primeiro | CTA → login; Criar conta secundário | ✓ |
| Uma `/login` com seletor | Sem query na URL | ✓ |
| Duas páginas login | `/login/student` e `/login/teacher` | |

**User's choice:** Rotas dedicadas; dois CTAs; login primeiro; uma página login com seletor de papel no formulário.

---

## Formulário do professor (escolas e turmas)

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdowns CETI | escola → série → turma do seed | ✓ |
| Multi-turma | Adicionar outra turma, lista removível | ✓ |
| Aluno igual CETI | Uma turma só | ✓ |
| Formulário único | Uma página scrollável | ✓ |
| Wizard | 2+ passos | |

**User's choice:** Seed CETI encadeado; professor multi-turma; aluno uma turma; sem wizard.

---

## Persistência da sessão mock JWT

| Option | Description | Selected |
|--------|-------------|----------|
| Zustand + localStorage + cookie | Cookie para middleware | ✓ |
| session_expires_at | Checagem 8h aluno no boot | ✓ |
| Middleware route groups | (student)/(teacher)/(auth) | ✓ |
| 403 Sem permissão | Mensagem acessível | ✓ |
| Redirect área correta | Silencioso | |

**User's choice:** Zustand persist + cookie espelhado; expiração por timestamp; middleware por route group; 403 para papel errado.

---

## LGPD e copy no cadastro (MVP)

| Option | Description | Selected |
|--------|-------------|----------|
| Checkbox único termos+privacidade | Obrigatório | ✓ |
| Parágrafo menor aluno | + mesmo checkbox | ✓ |
| Lei 15.100 no cadastro aluno | Bloco curto + Saiba mais | ✓ |
| Tom institucional | Secretaria/Escola | ✓ |

**User's choice:** Checkbox único; copy menor no aluno; Lei 15.100 resumida no cadastro aluno; tom institucional em todos os fluxos auth.

---

## Destino após login/cadastro

| Option | Description | Selected |
|--------|-------------|----------|
| Dashboard direto | Por papel | ✓ |
| Esqueleto aluno Fase 3 | Cards Trilha/Atividades/Score vazios | ✓ |
| Esqueleto professor Fase 4 | Turmas/Médias/Lacunas/Tempo real vazios | ✓ |
| Logout header + erros inline | role=alert | ✓ |

**User's choice:** Redirect direto; esqueletos de dashboard; logout no header; erros inline acessíveis.

---

## Claude's Discretion

- Regras de senha Zod (mín. 8 chars sugerido)
- Paths exatos de dashboard e nome do cookie
- TTL professor mock se não crítico
- Páginas estáticas Termos/Privacidade

## Deferred Ideas

- OAuth, LGPD responsáveis v2, dados completos dashboards, modal Lei 15.100 Fase 5, nav inferior aluno Fase 3
