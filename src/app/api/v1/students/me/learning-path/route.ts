import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";
import { getStudentLearningPath } from "@/server/student/get-student-learning-path";

export async function GET(request: Request) {
  try {
    const { userId } = await requireStudent(request);
    const learningPath = await getStudentLearningPath(userId);
    return Response.json(learningPath);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    console.error("[students/me/learning-path GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar a trilha. Tente novamente."
    );
  }
}
