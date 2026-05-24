import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { listTeacherAssignedClasses } from "@/server/materials/list-teacher-classes";

export async function GET(request: Request) {
  try {
    const { userId } = await requireTeacher(request);
    const classes = await listTeacherAssignedClasses(userId);
    return Response.json({ classes });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof TeacherProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    console.error("[teachers/me/classes GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível listar as turmas. Tente novamente."
    );
  }
}
