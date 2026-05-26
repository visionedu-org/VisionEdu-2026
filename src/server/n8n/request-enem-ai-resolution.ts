import { requestN8nWebhook } from "@/server/n8n/request-n8n-webhook";
import { N8nRequestError } from "@/server/n8n/n8n-errors";
import type {
  EnemAiResolutionN8nPayload,
  EnemAiResolutionResponse,
} from "@/types/enem-ai-resolution";

export { N8nConfigError, N8nRequestError } from "@/server/n8n/n8n-errors";

function parseN8nResponse(data: unknown): EnemAiResolutionResponse {
  if (typeof data !== "object" || data === null) {
    throw new N8nRequestError("Resposta inválida do fluxo n8n.");
  }

  const record = data as Record<string, unknown>;
  const explanation =
    typeof record.explanation === "string" ? record.explanation.trim() : "";

  if (!explanation) {
    throw new N8nRequestError(
      "O fluxo n8n não retornou o campo explanation."
    );
  }

  return { explanation };
}

export async function requestEnemAiResolution(
  payload: EnemAiResolutionN8nPayload
): Promise<EnemAiResolutionResponse> {
  return requestN8nWebhook(
    "N8N_ENEM_AI_RESOLUTION_WEBHOOK_URL",
    payload,
    parseN8nResponse
  );
}
