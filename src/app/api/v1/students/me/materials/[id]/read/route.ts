import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";
import { markMaterialRead } from "@/server/materials/mark-material-read";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireStudent(request);
    const { id } = await context.params;
    const result = await markMaterialRead(userId, id);
    return Response.json(result);
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

    console.error("[students/me/materials/:id/read PATCH]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível registrar a leitura. Tente novamente."
    );
  }
}
