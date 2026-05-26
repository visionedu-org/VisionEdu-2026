import { buildEnemAiResolutionPayload } from "@/lib/enem/build-ai-resolution-payload";
import { enrichQuestion } from "@/lib/enem/question-metadata";
import { enemAiResolutionRequestSchema } from "@/lib/validations/enem-ai-resolution";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { EnemApiError, fetchEnemApi } from "@/server/enem/fetch-enem";
import {
  N8nConfigError,
  N8nRequestError,
  requestEnemAiResolution,
} from "@/server/n8n/request-enem-ai-resolution";
import type { EnemQuestion } from "@/types/enem";

export async function POST(request: Request) {
  try {
    await requireStudent(request);

    const body: unknown = await request.json().catch(() => null);
    const parsed = enemAiResolutionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "bad_request", "Dados inválidos para resolução com IA.");
    }

    const { year, index, language, selectedLetter } = parsed.data;
    const query = language
      ? `?language=${encodeURIComponent(language)}`
      : "";

    const raw = await fetchEnemApi<Parameters<typeof enrichQuestion>[0]>(
      `/exams/${year}/questions/${index}${query}`,
      { revalidate: 3600 }
    );
    const question: EnemQuestion = enrichQuestion({ ...raw, year });

    if (selectedLetter === question.correctAlternative) {
      return jsonError(
        400,
        "bad_request",
        "A resolução com IA está disponível apenas para questões respondidas incorretamente."
      );
    }

    const payload = buildEnemAiResolutionPayload(question, selectedLetter);
    const result = await requestEnemAiResolution(payload);

    return Response.json(result);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof EnemApiError) {
      const code = err.status === 429 ? "rate_limit" : "enem_api_error";
      return jsonError(
        err.status === 404 ? 404 : err.status,
        code,
        err.message
      );
    }
    if (err instanceof N8nConfigError) {
      return jsonError(503, "n8n_not_configured", err.message);
    }
    if (err instanceof N8nRequestError) {
      return jsonError(
        err.status && err.status >= 400 && err.status < 600
          ? err.status
          : 502,
        "n8n_error",
        err.message
      );
    }
    console.error("[students/enem/ai-resolution POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível gerar a resolução com IA."
    );
  }
}
