import { parseMaterialsListFilters } from "@/lib/validations/materials";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { parseMaterialsPagination } from "@/server/materials/list-materials";
import {
  listStudentMaterials,
  StudentProfileNotFoundError,
} from "@/server/materials/list-student-materials";

export async function GET(request: Request) {
  try {
    const { userId } = await requireStudent(request);
    const { searchParams } = new URL(request.url);
    const pagination = parseMaterialsPagination(searchParams);
    const filters = parseMaterialsListFilters(searchParams);
    const result = await listStudentMaterials(userId, pagination, filters);
    return Response.json(result);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    console.error("[students/me/materials GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível listar os materiais. Tente novamente."
    );
  }
}
