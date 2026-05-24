import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import {
  deleteMaterial,
} from "@/server/materials/delete-material";
import {
  getMaterialById,
  MaterialNotFoundError,
} from "@/server/materials/get-material-by-id";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireTeacher(request);
    const { id } = await context.params;
    const material = await getMaterialById(userId, id);
    return Response.json(material);
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

    console.error("[teachers/materials/:id GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar o material. Tente novamente."
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireTeacher(request);
    const { id } = await context.params;
    const result = await deleteMaterial(userId, id);
    return Response.json(result);
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

    console.error("[teachers/materials/:id DELETE]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível excluir o material. Tente novamente."
    );
  }
}
