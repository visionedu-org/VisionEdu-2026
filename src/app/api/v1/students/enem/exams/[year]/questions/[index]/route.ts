import { enrichQuestion } from "@/lib/enem/question-metadata";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { EnemApiError, fetchEnemApi } from "@/server/enem/fetch-enem";
import type { EnemQuestion } from "@/types/enem";

function parseYearParam(raw: string): number | null {
  const year = Number.parseInt(raw, 10);
  if (!Number.isFinite(year) || year < 2009 || year > 2100) return null;
  return year;
}

function parseIndexParam(raw: string): number | null {
  const index = Number.parseInt(raw, 10);
  if (!Number.isFinite(index) || index < 1) return null;
  return index;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ year: string; index: string }> }
) {
  try {
    await requireStudent(request);
    const { year: yearParam, index: indexParam } = await context.params;
    const year = parseYearParam(yearParam);
    const index = parseIndexParam(indexParam);

    if (!year || !index) {
      return jsonError(400, "bad_request", "Parâmetros inválidos.");
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language")?.trim();
    const query = language ? `?language=${encodeURIComponent(language)}` : "";

    const raw = await fetchEnemApi<Parameters<typeof enrichQuestion>[0]>(
      `/exams/${year}/questions/${index}${query}`,
      { revalidate: 3600 }
    );

    const question: EnemQuestion = enrichQuestion({ ...raw, year });
    return Response.json(question);
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
    console.error("[students/enem/exams/year/questions/index GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar a questão."
    );
  }
}
