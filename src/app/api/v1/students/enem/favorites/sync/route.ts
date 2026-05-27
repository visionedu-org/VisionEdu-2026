import { enemFavoritesSyncSchema } from "@/lib/validations/enem-favorite";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { syncEnemFavorites } from "@/server/enem/toggle-enem-favorite";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";

export async function POST(request: Request) {
  try {
    const { userId } = await requireStudent(request);
    const body: unknown = await request.json().catch(() => null);
    const parsed = enemFavoritesSyncSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "bad_request", "Dados de sincronização inválidos.");
    }

    const result = await syncEnemFavorites(userId, parsed.data.questionKeys);
    return Response.json(result);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    console.error("[students/enem/favorites/sync POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível sincronizar favoritos."
    );
  }
}
