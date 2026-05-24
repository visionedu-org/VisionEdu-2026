import { ApiError, apiClient } from "@/lib/api-client";

function parseContentDispositionFileName(header: string | null): string | null {
  if (!header) return null;
  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] ?? null;
}

/**
 * Baixa anexo autenticado (segue redirect 302 para URL assinada).
 */
export async function downloadMaterialAttachment(
  url: string,
  fallbackFileName: string
): Promise<void> {
  const response = await apiClient.fetchRaw(url, { method: "GET" });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: string }).message)
        : "Não foi possível baixar o arquivo.";
    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const fileName =
    parseContentDispositionFileName(
      response.headers.get("Content-Disposition")
    ) ?? fallbackFileName;

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function getTeacherAttachmentDownloadPath(
  materialId: string,
  attachmentId: string
): string {
  return `/api/v1/teachers/materials/${encodeURIComponent(materialId)}/attachments/${encodeURIComponent(attachmentId)}/download`;
}

export function getStudentAttachmentDownloadPath(
  materialId: string,
  attachmentId: string
): string {
  return `/api/v1/students/me/materials/${encodeURIComponent(materialId)}/attachments/${encodeURIComponent(attachmentId)}/download`;
}
