import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { getStudentPerformance, StudentNotInClassError } from "@/server/teacher/get-student-performance";
import { z } from "zod";

const querySchema = z.object({
  classId: z.string().uuid(),
  source: z.enum(["practice", "learning_path", "material"]).optional(),
  days: z.coerce.number().int().min(1).max(365).optional(),
});

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireTeacher(request);
    const { studentId } = await context.params;

    const url = new URL(request.url);
    const query = querySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!query.success) {
      return jsonError(400, "bad_request", "Parâmetros inválidos. classId é obrigatório.");
    }

    const data = await getStudentPerformance(
      userId,
      query.data.classId,
      studentId,
      query.data.source,
      query.data.days
    );
    return Response.json(data);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof TeacherProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    if (err instanceof StudentNotInClassError) {
      return jsonError(404, "not_found", err.message);
    }
    console.error("[teachers/students/:studentId/performance GET]", err);
    return jsonError(500, "internal_error", "Não foi possível carregar o desempenho do aluno.");
  }
}
