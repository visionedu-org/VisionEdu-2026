import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherClassForbiddenError } from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { getClassDashboard } from "@/server/teacher/get-class-dashboard";
import {
  TeacherClassAmbiguousError,
  TeacherClassNotFoundError,
  resolveTeacherClassParam,
} from "@/server/teacher/resolve-class-param";

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireTeacher(request);
    const { classId: param } = await context.params;
    const classId = await resolveTeacherClassParam(userId, param);
    const dashboard = await getClassDashboard(userId, classId);
    return Response.json(dashboard);
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

    if (err instanceof TeacherClassNotFoundError) {
      return jsonError(404, "not_found", err.message);
    }

    if (err instanceof TeacherClassAmbiguousError) {
      return jsonError(409, "ambiguous_class", err.message);
    }

    console.error("[teachers/classes/:classId/dashboard GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar o painel da turma. Tente novamente."
    );
  }
}
