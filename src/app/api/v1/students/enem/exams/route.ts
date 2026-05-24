import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { EnemApiError, fetchEnemApi } from "@/server/enem/fetch-enem";
import type { EnemExam } from "@/types/enem";

export async function GET(request: Request) {
  try {
    await requireStudent(request);
    const exams = await fetchEnemApi<EnemExam[]>("/exams", {
      revalidate: 86_400,
    });
    return Response.json(exams);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof EnemApiError) {
      const code =
        err.status === 429 ? "rate_limit" : "enem_api_error";
      return jsonError(err.status, code, err.message);
    }
    console.error("[students/enem/exams GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar as provas do ENEM."
    );
  }
}
