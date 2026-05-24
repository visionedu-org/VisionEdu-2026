import {
  createMaterialSchema,
  parseMaterialsListFilters,
} from "@/lib/validations/materials";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherClassForbiddenError } from "@/server/materials/assert-teacher-class";
import {
  createMaterial,
  MaterialAttachmentsInvalidError,
  MaterialClassesInvalidError,
  TeacherProfileNotFoundError,
} from "@/server/materials/create-material";
import {
  listMaterials,
  parseMaterialsPagination,
} from "@/server/materials/list-materials";

export async function GET(request: Request) {
  try {
    const { userId } = await requireTeacher(request);
    const { searchParams } = new URL(request.url);
    const pagination = parseMaterialsPagination(searchParams);
    const filters = parseMaterialsListFilters(searchParams);
    const result = await listMaterials(userId, pagination, filters);
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

    console.error("[teachers/materials GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível listar os materiais. Tente novamente."
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await requireTeacher(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "invalid_json", "Corpo da requisição inválido");
    }

    const parsed = createMaterialSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "validation_error", "Dados inválidos", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await createMaterial(userId, parsed.data);
    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof TeacherClassForbiddenError) {
      return jsonError(403, "forbidden", err.message);
    }

    if (err instanceof TeacherProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    if (err instanceof MaterialClassesInvalidError) {
      return jsonError(400, "validation_error", err.message);
    }

    if (err instanceof MaterialAttachmentsInvalidError) {
      return jsonError(400, "validation_error", err.message);
    }

    console.error("[teachers/materials POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível criar o material. Tente novamente."
    );
  }
}
