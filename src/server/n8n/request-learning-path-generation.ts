import { requestN8nWebhook } from "@/server/n8n/request-n8n-webhook";
import { N8nRequestError } from "@/server/n8n/n8n-errors";
import type {
  LearningPathN8nPayload,
  LearningPathN8nResponse,
  LearningPathN8nStep,
} from "@/types/learning-path";

function parseStep(raw: unknown): LearningPathN8nStep | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const questionKey =
    typeof record.questionKey === "string" ? record.questionKey.trim() : "";
  if (!title || !questionKey) return null;

  return {
    title,
    description:
      typeof record.description === "string"
        ? record.description.trim()
        : undefined,
    questionKey,
    discipline:
      typeof record.discipline === "string" ? record.discipline : null,
    skill: typeof record.skill === "string" ? record.skill : null,
  };
}

function parseLearningPathResponse(data: unknown): LearningPathN8nResponse {
  if (typeof data !== "object" || data === null) {
    throw new N8nRequestError("Resposta inválida do fluxo n8n.");
  }

  const record = data as Record<string, unknown>;
  const pathTitle =
    typeof record.pathTitle === "string" ? record.pathTitle.trim() : "";
  const stepsRaw = Array.isArray(record.steps) ? record.steps : [];
  const steps = stepsRaw
    .map(parseStep)
    .filter((step): step is LearningPathN8nStep => step !== null);

  if (!pathTitle || steps.length === 0) {
    throw new N8nRequestError(
      "O fluxo n8n não retornou pathTitle ou steps válidos."
    );
  }

  return {
    pathTitle,
    summary:
      typeof record.summary === "string" ? record.summary.trim() : undefined,
    steps,
  };
}

export async function requestLearningPathGeneration(
  payload: LearningPathN8nPayload
): Promise<LearningPathN8nResponse> {
  return requestN8nWebhook(
    "N8N_LEARNING_PATH_WEBHOOK_URL",
    payload,
    parseLearningPathResponse
  );
}
