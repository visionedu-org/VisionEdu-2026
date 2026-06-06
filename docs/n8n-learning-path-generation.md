# Trilha de aprendizagem com IA — n8n + Groq

Guia para configurar o fluxo no **n8n** que recebe o diagnóstico do estudante e o pool de questões ENEM, chama a **Groq** e devolve a trilha personalizada.

**Não usa variáveis de ambiente no n8n.** A chave da Groq fica só na **credencial Groq** do n8n.

---

## O que você vai montar

```text
Webhook
   → Code (monta o prompt)
   → HTTP Request (Groq — credencial Groq)
   → Code (extrai JSON da trilha)
   → Respond to Webhook
```

O VisionEdu envia o diagnóstico + candidatos; o n8n responde com `{ pathTitle, summary, steps }`. Cada step pode conter `videoSearchQuery` para busca de vídeo explicativo no YouTube.

---

## 1. Pré-requisitos

- Credencial **Groq** no n8n (mesma do fluxo de resolução ENEM)
- VisionEdu: `npm run dev`
- n8n em **http://localhost:5678**
- Estudante com respostas ENEM salvas (local ou sincronizadas no banco)

### Subir o n8n

```bash
npx n8n
```

---

## 2. Configurar o VisionEdu

No `.env` na raiz do projeto:

```env
N8N_LEARNING_PATH_WEBHOOK_URL=http://localhost:5678/webhook/learning-path-generation
```

Opcional (compartilhado com o outro fluxo):

```env
N8N_WEBHOOK_SECRET=
N8N_WEBHOOK_TIMEOUT_MS=120000
```

Reinicie o Next.js depois de salvar.

> Use a URL **`/webhook/learning-path-generation`** (não `/webhook-test/...`). O workflow precisa estar **Active**.

Se o n8n não estiver configurado, o VisionEdu ainda gera uma trilha **fallback** no servidor (sem títulos elaborados pela IA).

---

## 3. Criar o workflow

Nome sugerido: **Learning Path Generation**.

Adicione **5 nós** nesta ordem.

---

### Nó 1 — Webhook

| Campo | Valor |
|-------|--------|
| HTTP Method | `POST` |
| Path | `learning-path-generation` |
| Authentication | None |
| Respond | **Using 'Respond to Webhook' Node** |

URL usada pelo VisionEdu:

`http://localhost:5678/webhook/learning-path-generation`

---

### Nó 2 — Code — Montar prompt

Renomeie para: **Montar prompt**.

| Campo | Valor |
|-------|--------|
| Mode | **Run Once for All Items** |
| Language | **JavaScript** |

```javascript
const item = $input.first().json;
const body = item.body ?? item;

const weaknesses = (body.weaknesses ?? [])
  .map(
    (w) =>
      `- ${w.skill} (${w.discipline ?? "geral"}): ${w.incorrectCount} erros em ${w.answeredCount} questões, acerto ${w.accuracyPercent}%`
  )
  .join("\n");

const candidates = (body.candidates ?? [])
  .map(
    (c) =>
      `- ${c.questionKey}: ${c.title} | disciplina: ${c.discipline ?? "—"} | tópicos: ${(c.skills ?? []).join(", ")}${
        c.context ? `\n  Enunciado: "${c.context.slice(0, 500)}"` : ""
      }`
  )
  .join("\n");

const systemPrompt = `Você é um pedagogo especialista em ENEM que monta trilhas de estudo personalizadas.
Regras:
- Responda SOMENTE com JSON válido, sem markdown nem texto fora do JSON.
- Use apenas questionKey que existam na lista de candidatos fornecida.
- Cada etapa deve ter exatamente UMA questão (um questionKey).
- Ordene do conteúdo mais urgente (maior dificuldade) para consolidação.
- Se houver dificuldades em várias disciplinas, intercale etapas entre elas.
- Todas as questões de uma etapa devem corresponder ao tópico (skill) indicado na fraqueza.
- Entre 3 e 8 etapas.
- Títulos curtos (máx. 50 caracteres), descrições em 1 frase.
- Cada etapa deve incluir videoSearchQuery com termos precisos para busca no YouTube.
- ATENÇÃO: o campo "skill" das questões candidatas é uma aproximação automática baseada no índice da prova e PODE ESTAR INCORRETO. Para gerar videoSearchQuery, IGNORE o campo skill e use APENAS o enunciado da questão para identificar o tópico real.
- Português do Brasil.`;

const userPrompt = `Monte uma trilha de aprendizagem para o estudante.

Sugestão de título: ${body.pathTitleHint ?? "Trilha personalizada ENEM"}

Fraquezas diagnosticadas:
${weaknesses || "(sem histórico — use candidatos variados)"}

Questões candidatas (use APENAS estas chaves):
${candidates}

Formato de resposta (JSON):
{
  "pathTitle": "string",
  "summary": "string opcional",
  "steps": [
    {
      "title": "string",
      "description": "string",
      "questionKey": "YYYY:INDEX:default",
      "discipline": "matematica | linguagens | ...",
      "skill": "string",
      "videoSearchQuery": "termo de busca para YouTube baseado EXCLUSIVAMENTE no enunciado da questão. Identifique o tópico real pelo texto da questão e gere termos precisos (ex.: 'mediana grafico receita despesa ENEM estatistica')"
    }
  ]
}`;

const groqRequestBody = {
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  max_tokens: 2000,
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
};

return [{ json: { groqRequestBody } }];
```

---

### Nó 3 — HTTP Request — Chamar Groq

| Campo | Valor |
|-------|--------|
| Method | `POST` |
| URL | `https://api.groq.com/openai/v1/chat/completions` |
| Authentication | **Predefined Credential Type** → **Groq** |
| Send Body | **On** |
| Body Content Type | **JSON** |
| Specify Body | **Using Parameter Mode** |

| Parameter Name | Value (fx) |
|---|---|
| `model` | `={{ $json.groqRequestBody.model }}` |
| `temperature` | `={{ $json.groqRequestBody.temperature }}` |
| `max_tokens` | `={{ $json.groqRequestBody.max_tokens }}` |
| `response_format` | `={{ $json.groqRequestBody.response_format }}` |
| `messages` | `={{ $json.groqRequestBody.messages }}` |

---

### Nó 4 — Code — Extrair trilha

Renomeie para: **Extrair trilha**.

```javascript
const groq = $input.first().json;
const raw = groq.choices?.[0]?.message?.content?.trim() ?? "";

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  throw new Error("A Groq não retornou JSON válido. Conteúdo: " + raw.slice(0, 200));
}

const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
if (!parsed.pathTitle || steps.length === 0) {
  throw new Error("JSON sem pathTitle ou steps.");
}

return [
  {
    json: {
      pathTitle: String(parsed.pathTitle).trim(),
      summary: parsed.summary ? String(parsed.summary).trim() : undefined,
      steps: steps.map((s) => ({
        title: String(s.title ?? "").trim(),
        description: s.description ? String(s.description).trim() : undefined,
        questionKey: String(s.questionKey ?? "").trim(),
        discipline: s.discipline ?? null,
        skill: s.skill ?? null,
        videoSearchQuery: s.videoSearchQuery
          ? String(s.videoSearchQuery).trim()
          : undefined,
      })),
    },
  },
];
```

---

### Nó 5 — Respond to Webhook

| Campo | Valor |
|-------|--------|
| Respond With | **JSON** |
| Response Body (expressão `fx`) | `={{ $json }}` |

---

## 4. Conectar e ativar

```text
Webhook → Montar prompt → HTTP Request → Extrair trilha → Respond to Webhook
```

1. Salve o workflow.
2. Ative o toggle **Active**.
3. Confirme a URL de produção.

---

## 5. Testar

### PowerShell

```powershell
$body = @{
  studentId = "demo-student"
  pathTitleHint = "Trilha: Geometria e Interpretação"
  weaknesses = @(
    @{
      discipline = "matematica"
      skill = "Geometria"
      incorrectCount = 5
      answeredCount = 8
      accuracyPercent = 38
    }
  )
  candidates = @(
    @{
      questionKey = "2023:42:default"
      year = 2023
      index = 42
      language = $null
      discipline = "matematica"
      skills = @("Geometria", "Álgebra")
      title = "Questão de geometria"
    }
  )
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method POST `
  -Uri "http://localhost:5678/webhook/learning-path-generation" `
  -ContentType "application/json; charset=utf-8" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

### VisionEdu

1. Login como aluno.
2. Responda algumas questões ENEM (certas e erradas).
3. No painel, em **Sua trilha de aprendizagem**, clique em **Gerar trilha com IA**.
4. Abra a etapa **em progresso** e responda corretamente para desbloquear a próxima.

---

## 6. Contrato de dados

### O VisionEdu envia

```json
{
  "studentId": "uuid",
  "pathTitleHint": "Trilha personalizada: Geometria, ...",
  "weaknesses": [
    {
      "discipline": "matematica",
      "skill": "Geometria",
      "incorrectCount": 5,
      "answeredCount": 8,
      "accuracyPercent": 38
    }
  ],
  "candidates": [
    {
      "questionKey": "2023:42:default",
      "year": 2023,
      "index": 42,
      "language": null,
      "discipline": "matematica",
      "skills": ["Geometria"],
      "title": "Questão ...",
      "context": "Um terreno retangular tem área 120 m²..."
    }
  ]
}
```

### O n8n deve responder

```json
{
  "pathTitle": "Reforço em Geometria e Texto",
  "summary": "Trilha focada nas suas maiores dificuldades recentes.",
  "steps": [
    {
      "title": "Geometria plana",
      "description": "Revise áreas e perímetros com esta questão.",
      "questionKey": "2023:42:default",
      "discipline": "matematica",
      "skill": "Geometria",
      "videoSearchQuery": "setor circular area ENEM formula exercicio resolvido"
    }
  ]
}
```

Cada `questionKey` **deve** existir em `candidates`. O servidor descarta etapas inválidas e usa fallback se necessário.

Cada `videoSearchQuery` é usado pelo servidor para buscar o vídeo mais relevante no YouTube. Se não houver API key ou a busca falhar, a etapa funciona sem vídeo (graceful).

---

## 7. Problemas comuns

| Sintoma | Solução |
|---------|---------|
| `503 n8n_not_configured` | Defina `N8N_LEARNING_PATH_WEBHOOK_URL` no `.env` |
| Trilha vazia / erro de candidatos | Estudante precisa de questões ENEM compatíveis com o diagnóstico; pratique mais ou amplie anos no servidor |
| Groq: *unexpected end of JSON input* / 400 | HTTP Request precisa usar **Using Parameter Mode** (não "Using JSON") — veja seção do nó 3 |
| Groq retorna texto fora de JSON | Ative `response_format: json_object` e revise o prompt |
| Etapas ignoradas | `questionKey` não estava em `candidates` — ajuste o prompt da Groq |
| Etapa bloqueada no app | Acerte a questão da etapa anterior (persistido no banco) |

---

## 8. Checklist

- [ ] Credencial Groq no n8n
- [ ] Path do webhook: `learning-path-generation`
- [ ] HTTP Request: **Using Parameter Mode** com 5 parâmetros (`model`, `temperature`, `max_tokens`, `response_format`, `messages`)
- [ ] Workflow **Active**
- [ ] `.env` com `N8N_LEARNING_PATH_WEBHOOK_URL` e `YOUTUBE_API_KEY`
- [ ] Teste no app: gerar trilha → resolver etapa → desbloquear próxima
