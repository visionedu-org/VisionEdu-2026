# Resolução ENEM com IA — n8n + Groq

Guia para configurar o fluxo no **n8n** que recebe a questão do VisionEdu, chama a **Groq** e devolve a explicação.

**Não usa variáveis de ambiente no n8n.** A chave da Groq fica só na **credencial Groq** do n8n (como você já configurou).

---

## O que você vai montar

```text
Webhook
   → Code (monta o prompt)
   → HTTP Request (Groq — credencial Groq)
   → Code (pega o texto da resposta)
   → Respond to Webhook
```

O VisionEdu chama o webhook; o n8n responde com `{ "explanation": "..." }`.

---

## 1. Pré-requisitos

- [Conta Groq](https://console.groq.com/) com API key (já salva na credencial do n8n)
- VisionEdu: `npm run dev`
- n8n rodando em **http://localhost:5678**

### Subir o n8n

```bash
npx n8n
```

Na primeira vez, crie o usuário local e abra o editor.

### Credencial Groq (se ainda não tiver)

1. No n8n: **Credentials** (canto superior direito) → **Add credential**
2. Busque **Groq**
3. Cole sua API key (`gsk_...`) → **Save**
4. Anote o nome (ex.: `Groq account`)

Você vai selecionar essa credencial no nó **HTTP Request**.

---

## 2. Configurar o VisionEdu

No `.env` na raiz do projeto:

```env
N8N_ENEM_AI_RESOLUTION_WEBHOOK_URL=http://localhost:5678/webhook/enem-ai-resolution
```

Opcional (pode deixar vazio em desenvolvimento):

```env
N8N_WEBHOOK_SECRET=
N8N_WEBHOOK_TIMEOUT_MS=90000
```

Reinicie o Next.js depois de salvar.

> Use a URL **`/webhook/enem-ai-resolution`** (não `/webhook-test/...`). O workflow precisa estar **Active** (toggle verde).

---

## 3. Criar o workflow

Nome sugerido: **ENEM AI Resolution**.

Adicione **5 nós** nesta ordem e conecte como indicado.

---

### Nó 1 — Webhook

| Campo | Valor |
|-------|--------|
| HTTP Method | `POST` |
| Path | `enem-ai-resolution` |
| Authentication | None |
| Respond | **Using 'Respond to Webhook' Node** |

URL usada pelo VisionEdu:

`http://localhost:5678/webhook/enem-ai-resolution`

---

### Nó 2 — Code — Montar prompt

Renomeie o nó para: **Montar prompt** (facilita o passo 4).

| Campo | Valor |
|-------|--------|
| Mode | **Run Once for All Items** |
| Language | **JavaScript** |

Cole o código:

```javascript
const item = $input.first().json;
const body = item.body ?? item;

const alternativesText = (body.alternatives ?? [])
  .map((alt) => `${alt.letter}) ${alt.text ?? "(sem texto)"}`)
  .join("\n");

const contextBlock = [
  body.title ? `Título: ${body.title}` : null,
  body.context ? `Enunciado:\n${body.context}` : null,
  body.alternativesIntroduction
    ? `Introdução das alternativas:\n${body.alternativesIntroduction}`
    : null,
  `Alternativas:\n${alternativesText}`,
  `Alternativa correta: ${body.correctLetter}`,
  `Alternativa marcada pelo aluno: ${body.selectedLetter}`,
]
  .filter(Boolean)
  .join("\n\n");

const systemPrompt = `Você é um professor de ENEM que explica questões de forma extremamente clara e didática.
Regras:
- Explique em português do Brasil.
- Use linguagem simples e direta, como para quem tem pouca base — mas NÃO use linguagem infantil nem tom de bebê.
- Mostre por que a alternativa correta está certa e por que a que o aluno marcou está errada.
- Cite as letras (A, B, C, D, E) ao comparar.
- Seja objetivo: 3 a 6 parágrafos curtos.
- Não invente informações fora do enunciado e das alternativas.`;

const userPrompt = `Analise a questão e gere uma explicação didática.

${contextBlock}`;

const groqRequestBody = {
  model: "llama-3.3-70b-versatile",
  temperature: 0.4,
  max_tokens: 1200,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
};

return [
  {
    json: {
      groqRequestBody,
      questionKey: body.questionKey,
    },
  },
];
```

**Saída deste nó:** um item com `groqRequestBody` pronto para a Groq.

---

### Nó 3 — HTTP Request — Chamar Groq

| Campo | Valor |
|-------|--------|
| Method | `POST` |
| URL | `https://api.groq.com/openai/v1/chat/completions` |
| Authentication | **Predefined Credential Type** |
| Credential Type | **Groq** |
| Groq API | Sua credencial Groq (ex.: `Groq account`) |

**Importante:** com a credencial Groq selecionada, **não** adicione header `Authorization` manual — o n8n envia a chave por você.

**Body:**

| Campo | Valor |
|-------|--------|
| Send Body | **On** |
| Body Content Type | **JSON** |
| Specify Body | **Using Parameter Mode** |

| Parameter Name | Value (fx) |
|---|---|
| `model` | `={{ $json.groqRequestBody.model }}` |
| `temperature` | `={{ $json.groqRequestBody.temperature }}` |
| `max_tokens` | `={{ $json.groqRequestBody.max_tokens }}` |
| `messages` | `={{ $json.groqRequestBody.messages }}` |

**Conferência:** execute o nó **Montar prompt** e veja se `groqRequestBody` é um objeto com `model`, `messages`, etc.

---

### Nó 4 — Code — Extrair explicação

Renomeie para: **Extrair explicação**.

| Campo | Valor |
|-------|--------|
| Mode | **Run Once for All Items** |
| Language | **JavaScript** |

```javascript
const groq = $input.first().json;

const explanation =
  groq.choices?.[0]?.message?.content?.trim() ?? "";

if (!explanation) {
  throw new Error(
    "A Groq não retornou texto. Abra a execução e confira a saída do HTTP Request."
  );
}

return [
  {
    json: {
      explanation,
      questionKey: $("Montar prompt").first().json.questionKey,
    },
  },
];
```

Se você renomeou o nó 2, troque `"Montar prompt"` pelo nome exato dele.

---

### Nó 5 — Respond to Webhook

| Campo | Valor |
|-------|--------|
| Respond With | **JSON** |
| Response Body | Modo expressão (`fx`): |

```
={{ { "explanation": $json.explanation } }}
```

---

## 4. Conectar e ativar

```text
Webhook → Montar prompt → HTTP Request → Extrair explicação → Respond to Webhook
```

1. Salve o workflow (**Ctrl+S**).
2. Ative o toggle **Active** (canto superior direito).
3. Confirme que a URL de produção é `http://localhost:5678/webhook/enem-ai-resolution`.

---

## 5. Testar

### Teste rápido no n8n

1. Abra o nó **Webhook** → **Listen for test event** (ou execute o workflow em modo teste).
2. Envie um POST de teste (Postman, Insomnia ou PowerShell abaixo).
3. Veja em **Executions** se todos os nós ficaram verdes.

### Teste no PowerShell

```powershell
$body = @{
  questionKey = "2023-5"
  year = 2023
  index = 5
  title = "Questão exemplo"
  discipline = "matematica"
  context = "Um terreno retangular tem área 120 m². Qual o lado se a largura é 10 m?"
  alternativesIntroduction = $null
  alternatives = @(
    @{ letter = "A"; text = "10 m"; isCorrect = $false },
    @{ letter = "B"; text = "12 m"; isCorrect = $true },
    @{ letter = "C"; text = "15 m"; isCorrect = $false }
  )
  correctLetter = "B"
  selectedLetter = "A"
  language = $null
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:5678/webhook/enem-ai-resolution" `
  -ContentType "application/json; charset=utf-8" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

Resposta esperada:

```json
{
  "explanation": "Texto da explicação..."
}
```

### Teste no VisionEdu

1. Login como aluno.
2. Abra uma questão ENEM e responda **errado** (ou reabra uma já errada).
3. Ícone **Sparkles** → **Gerar resolução com IA**.

---

## 6. Problemas comuns

| O que aparece | O que fazer |
|---------------|-------------|
| Groq: *unexpected end of JSON input* / 400 | HTTP Request precisa usar **Using Parameter Mode** (não "Using JSON") — veja seção do nó 3 |
| `=[object Object]` no preview do body | Ignore o preview; o importante é usar **Parameter Mode** com expressões individuais |
| `access to env vars denied` | Não use `$env` no Code; use só este guia (credencial Groq no HTTP Request) |
| `502` no VisionEdu | Fluxo falhou no n8n → abra **Executions** e veja o nó vermelho |
| `503 n8n_not_configured` | Falta `N8N_ENEM_AI_RESOLUTION_WEBHOOK_URL` no `.env` do VisionEdu |
| `404` no webhook | Workflow não está **Active** ou o path não é `enem-ai-resolution` |
| `401` / Unauthorized na Groq | Credencial Groq inválida ou expirada — recrie em **Credentials** |
| Resposta sem `explanation` | Confira o nó **Extrair explicação** e a saída JSON do HTTP Request |

---

## 7. Contrato de dados

### O VisionEdu envia ao webhook

```json
{
  "questionKey": "2023-42",
  "year": 2023,
  "index": 42,
  "title": "...",
  "discipline": "matematica",
  "context": "...",
  "alternativesIntroduction": "...",
  "alternatives": [
    { "letter": "A", "text": "...", "isCorrect": false }
  ],
  "correctLetter": "C",
  "selectedLetter": "A",
  "language": null
}
```

### O n8n deve responder

```json
{
  "explanation": "texto da explicação gerada"
}
```

---

## 8. Checklist final

- [ ] Credencial **Groq** criada no n8n
- [ ] 5 nós conectados na ordem certa
- [ ] HTTP Request: credencial **Groq** + **Using Parameter Mode** com parâmetros (`model`, `temperature`, `max_tokens`, `messages`)
- [ ] Workflow **Active**
- [ ] `.env` do VisionEdu com `N8N_ENEM_AI_RESOLUTION_WEBHOOK_URL`
- [ ] Teste no PowerShell retorna `explanation`
- [ ] Teste no app (questão errada → Sparkles → Gerar)

---

## 9. Produção (quando for publicar)

- Hospede o n8n com URL HTTPS pública.
- Atualize `N8N_ENEM_AI_RESOLUTION_WEBHOOK_URL` no servidor do VisionEdu.
- Mantenha a API key **apenas** na credencial Groq do n8n — nunca no frontend nem no repositório.
