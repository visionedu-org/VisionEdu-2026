import { learningPathStepSubmitSchema } from "@/lib/validations/enem-attempt";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import {
  LearningPathStepLockedError,
  LearningPathStepNotFoundError,
  submitLearningPathStepAnswer,
} from "@/server/learning-path/submit-learning-path-step";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";
import { EnemApiError } from "@/server/enem/fetch-enem";

export async function POST(
  request: Request,
  context: { params: Promise<{ stepId: string }> }
) {
  try {
    const { userId } = await requireStudent(request);
    const { stepId } = await context.params;

    const body: unknown = await request.json().catch(() => null);
    const parsed = learningPathStepSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "bad_request", "Resposta inválida.");
    }

    const outcome = await submitLearningPathStepAnswer(
      userId,
      stepId,
      parsed.data.selectedLetter
    );

    return Response.json({
      ...outcome.result,
      modules: outcome.modules,
      pathId: outcome.pathId,
    });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    if (err instanceof LearningPathStepNotFoundError) {
      return jsonError(404, "not_found", err.message);
    }
    if (err instanceof LearningPathStepLockedError) {
      return jsonError(403, "forbidden", err.message);
    }
    if (err instanceof EnemApiError) {
      return jsonError(
        err.status === 404 ? 404 : err.status,
        "enem_api_error",
        err.message
      );
    }
    console.error("[students/me/learning-path/steps/stepId/submit POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível registrar sua resposta."
    );
  }
}
