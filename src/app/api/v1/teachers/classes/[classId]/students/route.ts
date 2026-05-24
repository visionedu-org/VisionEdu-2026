import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherClassForbiddenError } from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { listClassStudents } from "@/server/materials/list-class-students";

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireTeacher(request);
    const { classId } = await context.params;
    const students = await listClassStudents(userId, classId);
    return Response.json({ students });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof TeacherProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    if (err instanceof TeacherClassForbiddenError) {
      return jsonError(403, "forbidden", err.message);
    }

    console.error("[teachers/classes/:classId/students GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível listar os alunos. Tente novamente."
    );
  }
}
