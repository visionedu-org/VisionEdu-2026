import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import {
  generateStudentLearningPath,
  StudentNoAttemptsError,
} from "@/server/learning-path/generate-student-learning-path";
import {
  N8nConfigError,
  N8nRequestError,
} from "@/server/n8n/request-enem-ai-resolution";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";
import { getStudentContext } from "@/server/student/get-student-context";

export async function POST(request: Request) {
  try {
    const { userId } = await requireStudent(request);
    const { studentId } = await getStudentContext(userId);
    const result = await generateStudentLearningPath(studentId);
    return Response.json(result);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    if (err instanceof StudentNoAttemptsError) {
      return jsonError(400, "no_enem_attempts", err.message);
    }
    if (err instanceof N8nConfigError) {
      return jsonError(503, "n8n_not_configured", err.message);
    }
    if (err instanceof N8nRequestError) {
      return jsonError(
        err.status && err.status >= 400 && err.status < 600
          ? err.status
          : 502,
        "learning_path_error",
        err.message
      );
    }
    console.error("[students/me/learning-path/generate POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível gerar a trilha. Tente novamente."
    );
  }
}
