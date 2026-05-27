import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherClassForbiddenError } from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { getBnccGapsForTeacherClass } from "@/server/teacher/get-bncc-gaps";
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
    const result = await getBnccGapsForTeacherClass(userId, classId);
    return Response.json(result);
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

    console.error("[teachers/classes/:classId/bncc-gaps GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar as lacunas BNCC. Tente novamente."
    );
  }
}
