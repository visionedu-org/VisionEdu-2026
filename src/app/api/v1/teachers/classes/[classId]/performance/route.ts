import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherClassForbiddenError } from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { getClassPerformance } from "@/server/teacher/get-class-performance";
import {
  TeacherClassAmbiguousError,
  TeacherClassNotFoundError,
  resolveTeacherClassParam,
} from "@/server/teacher/resolve-class-param";
import { z } from "zod";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
  discipline: z.string().optional(),
});

type RouteContext = {
  params: Promise<{ classId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireTeacher(request);
    const { classId: param } = await context.params;
    const classId = await resolveTeacherClassParam(userId, param);

    const url = new URL(request.url);
    const query = querySchema.safeParse(Object.fromEntries(url.searchParams));
    const days = query.success ? query.data.days : undefined;
    const discipline = query.success ? query.data.discipline : undefined;

    const data = await getClassPerformance(userId, classId, days, discipline);
    return Response.json(data);
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
    console.error("[teachers/classes/:classId/performance GET]", err);
    return jsonError(500, "internal_error", "Não foi possível carregar o desempenho da turma.");
  }
}
