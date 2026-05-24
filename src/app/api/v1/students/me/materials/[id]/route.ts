import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";
import { getStudentMaterial } from "@/server/materials/get-student-material";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireStudent(request);
    const { id } = await context.params;
    const material = await getStudentMaterial(userId, id);
    return Response.json(material);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    if (err instanceof MaterialNotFoundError) {
      return jsonError(404, "not_found", err.message);
    }

    console.error("[students/me/materials/:id GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar o material. Tente novamente."
    );
  }
}
