import {
  legacyCreateContentSchema,
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
import { mapLegacyContentToCreateMaterial } from "@/server/materials/legacy-content-mapper";

const DEPRECATION_HEADERS = {
  Deprecation: "true",
  Link: '</api/v1/teachers/materials>; rel="successor-version"',
} as const;

/** Compatibilidade com `POST /api/v1/teachers/contents` (RF-B13). */
export async function POST(request: Request) {
  try {
    const { userId } = await requireTeacher(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "invalid_json", "Corpo da requisição inválido");
    }

    const parsed = legacyCreateContentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "validation_error", "Dados inválidos", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const createInput = await mapLegacyContentToCreateMaterial(userId, parsed.data);
    const result = await createMaterial(userId, createInput);

    return Response.json(
      { id: result.id, createdAt: result.sentAt },
      { status: 201, headers: DEPRECATION_HEADERS }
    );
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

    console.error("[teachers/contents POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível criar o conteúdo. Tente novamente."
    );
  }
}
