# Pitfalls Research

**Domain:** EdTech frontend mobile Brasil
**Researched:** 2026-05-20
**Confidence:** HIGH

## Critical Pitfalls

### 1. Estourar bundle 300KB gzip (RNF-001)

**Warning signs:** Lighthouse Performance < 90; First Load JS > 300KB na rota `/`.

**Prevention:**
- App Router com `dynamic()` em gráficos e editor
- `next/image` + WebP; sem fontes variáveis completas
- Analisar bundle por rota antes de cada fase

**Phase:** 1 (fundação) e 7 (polimento)

### 2. Tutor vazar gabarito

**Warning signs:** Mock ou copy fixa menciona alternativa correta ou valor numérico final.

**Prevention:**
- Engine mock com deny-list de padrões ("resposta é", "alternativa C")
- Testes de snapshot nas respostas fixture
- UI sem campo "mostrar resposta"

**Phase:** 6 (IA UI)

### 3. Ping não refletir foco real da aba

**Warning signs:** Professor vê todos "active" com aluno em outra aba.

**Prevention:**
- `document.visibilityState` + `window.onblur` no intervalo 15s
- Banner aluno: "Mantenha esta aba aberta durante a aula"
- Mock SSE coerente com último ping

**Phase:** 5 (tempo real)

### 4. Perda de progresso em rede instável

**Warning signs:** Aluno perde respostas ao recarregar após queda 3G.

**Prevention:**
- Autosave rascunho por `activity_id` em IndexedDB a cada resposta
- Restaurar estado ao remount

**Phase:** 3 (atividade aluno)

### 5. UI desktop-only no fluxo do aluno

**Warning signs:** Botões < 44px; tabelas horizontais em 360px.

**Prevention:**
- Mobile-first CSS; testar viewport 360×640
- Touch targets e espaçamento entre links

**Phase:** 1–3

### 6. Mocks incompatíveis com contrato NestJS futuro

**Warning signs:** Campos divergentes do schema PDR (`role`, `identified_gaps` jsonb).

**Prevention:**
- Tipos únicos em `src/types/domain.ts` usados por MSW e componentes
- Fixtures copiadas dos exemplos §11 PDR

**Phase:** 1 (fundação)

### 7. Acessibilidade negligenciada em chat e gráficos

**Warning signs:** Chat só mouse; gráficos sem texto alternativo.

**Prevention:**
- `aria-live` no tutor; labels em inputs BNCC
- Contraste AA em badges e status ping

**Phase:** todas; auditoria fase 7

### 8. Conformidade Lei 15.100 só no rodapé

**Warning signs:** Professor inicia aula sem fluxo de "autorizar uso pedagógico".

**Prevention:**
- Modal/checklist professor ao abrir tempo real
- Indicador visual "Aula supervisionada ativa"

**Phase:** 5

## Medium Pitfalls

| Pitfall | Prevention | Phase |
|---------|------------|-------|
| QR Code inutilizável em sala escura | Alto contraste, tamanho mínimo 200px | 4 |
| Formulário cadastro aluno muito longo | Multi-step, defaults escola piloto | 2 |
| SSE mock não fecha conexão | Cleanup on unmount EventSource | 5 |
| Trilha confusa sem legenda | Nós com status: bloqueado, atual, concluído | 6 |

## Pitfall-to-Phase Map

| Phase | Pitfalls to address |
|-------|---------------------|
| 1 | Bundle, mock contracts |
| 2 | Cadastro longo |
| 3 | Offline progress, mobile |
| 4 | QR, BNCC form complexity |
| 5 | Ping focus, Lei 15.100 UX, SSE |
| 6 | Tutor gabarito, trilha UX |
| 7 | Bundle, a11y audit |
