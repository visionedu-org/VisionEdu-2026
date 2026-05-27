import { enemFavoriteToggleSchema } from "@/lib/validations/enem-favorite";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { toggleEnemFavorite } from "@/server/enem/toggle-enem-favorite";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";

export async function POST(request: Request) {
  try {
    const { userId } = await requireStudent(request);
    const body: unknown = await request.json().catch(() => null);
    const parsed = enemFavoriteToggleSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "bad_request", "Dados inválidos para favoritar.");
    }

    const result = await toggleEnemFavorite(userId, parsed.data);
    return Response.json(result);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    console.error("[students/enem/favorites POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível atualizar o favorito."
    );
  }
}
