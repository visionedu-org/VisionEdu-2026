import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { getStudentEnemProgress } from "@/server/enem/get-student-enem-progress";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";

export async function GET(request: Request) {
  try {
    const { userId } = await requireStudent(request);
    const payload = await getStudentEnemProgress(userId);
    return Response.json(payload);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    console.error("[students/enem/progress GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar seu progresso."
    );
  }
}
