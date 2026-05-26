import { enemAttemptRequestSchema } from "@/lib/validations/enem-attempt";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { recordEnemAttempt } from "@/server/enem/record-enem-attempt";
import { EnemApiError } from "@/server/enem/fetch-enem";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";

export async function POST(request: Request) {
  try {
    const { userId } = await requireStudent(request);
    const body: unknown = await request.json().catch(() => null);
    const parsed = enemAttemptRequestSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "bad_request", "Dados inválidos para registrar resposta.");
    }

    const result = await recordEnemAttempt(userId, parsed.data);
    return Response.json(result);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    if (err instanceof EnemApiError) {
      return jsonError(
        err.status === 404 ? 404 : err.status,
        "enem_api_error",
        err.message
      );
    }
    console.error("[students/enem/attempts POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível salvar sua resposta."
    );
  }
}
