import { MAX_QUESTIONS_PAGE_SIZE } from "@/lib/enem/constants";
import { enrichQuestion } from "@/lib/enem/question-metadata";
import { jsonError } from "@/server/auth/api-error";
import {
  AuthRequiredError,
  requireStudentOrTeacher,
} from "@/server/auth/require-auth";
import { EnemApiError, fetchEnemApi } from "@/server/enem/fetch-enem";
import type { EnemQuestionsResponse } from "@/types/enem";

interface RawQuestionsPayload {
  metadata: EnemQuestionsResponse["metadata"];
  questions: Parameters<typeof enrichQuestion>[0][];
}

function parseYearParam(raw: string): number | null {
  const year = Number.parseInt(raw, 10);
  if (!Number.isFinite(year) || year < 2009 || year > 2100) return null;
  return year;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ year: string }> }
) {
  try {
    await requireStudentOrTeacher(request);
    const { year: yearParam } = await context.params;
    const year = parseYearParam(yearParam);
    if (!year) {
      return jsonError(400, "bad_request", "Ano da prova inválido.");
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(Number.parseInt(searchParams.get("limit") ?? "10", 10) || 10, 1),
      MAX_QUESTIONS_PAGE_SIZE
    );
    const offset = Math.max(
      Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0,
      0
    );
    const language = searchParams.get("language")?.trim();

    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (language) query.set("language", language);

    const raw = await fetchEnemApi<RawQuestionsPayload>(
      `/exams/${year}/questions?${query.toString()}`,
      { revalidate: 3600 }
    );

    const payload: EnemQuestionsResponse = {
      metadata: raw.metadata,
      questions: (raw.questions ?? []).map((q) =>
        enrichQuestion({ ...q, year })
      ),
    };

    return Response.json(payload);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof EnemApiError) {
      const code =
        err.status === 429 ? "rate_limit" : "enem_api_error";
      return jsonError(
        err.status === 404 ? 404 : err.status,
        code,
        err.message
      );
    }
    console.error("[students/enem/exams/year/questions GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar as questões."
    );
  }
}
