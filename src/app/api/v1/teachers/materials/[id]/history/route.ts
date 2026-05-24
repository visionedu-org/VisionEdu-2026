import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";
import { getMaterialHistory } from "@/server/materials/get-material-history";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireTeacher(request);
    const { id } = await context.params;
    const history = await getMaterialHistory(userId, id);
    return Response.json(history);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof TeacherProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    if (err instanceof MaterialNotFoundError) {
      return jsonError(404, "not_found", err.message);
    }

    console.error("[teachers/materials/:id/history GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar o histórico. Tente novamente."
    );
  }
}
