import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { FileValidationError } from "@/server/materials/validate-file";
import { uploadMaterialFile } from "@/server/materials/upload-file";

export async function POST(request: Request) {
  try {
    const { userId } = await requireTeacher(request);

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return jsonError(400, "invalid_form", "Corpo multipart inválido");
    }

    const fileField = formData.get("file");
    if (!fileField || !(fileField instanceof File)) {
      return jsonError(
        400,
        "validation_error",
        'Campo "file" é obrigatório (multipart/form-data)'
      );
    }

    const result = await uploadMaterialFile(userId, fileField);
    return Response.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof TeacherProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    if (err instanceof FileValidationError) {
      return jsonError(err.httpStatus, err.code, err.message);
    }

    console.error("[teachers/materials/upload POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível enviar o arquivo. Tente novamente."
    );
  }
}
