import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import {
  createAttachmentDownloadResponse,
  getAttachmentForTeacherDownload,
  recordAttachmentDownload,
} from "@/server/materials/download-attachment";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";

type RouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { userId } = await requireTeacher(request);
    const { id: materialId, attachmentId } = await context.params;

    const attachment = await getAttachmentForTeacherDownload(
      userId,
      materialId,
      attachmentId
    );

    await recordAttachmentDownload(userId, materialId, attachment.id);
    return createAttachmentDownloadResponse(attachment);
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

    console.error(
      "[teachers/materials/:id/attachments/:attachmentId/download GET]",
      err
    );
    return jsonError(
      500,
      "internal_error",
      "Não foi possível baixar o anexo. Tente novamente."
    );
  }
}
