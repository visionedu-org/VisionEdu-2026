import type { ApiError } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error-messages";

/** Máximo de anexos por material (alinhado ao escopo da fase 13). */
export const MAX_MATERIAL_ATTACHMENTS = 5;

/** Tamanho máximo por arquivo (10 MB), alinhado ao padrão do servidor. */
export const UPLOAD_MAX_BYTES_CLIENT = 10_485_760;

export const MATERIAL_FILE_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp";

export function formatUploadMaxSizeMb(): string {
  return String(Math.round(UPLOAD_MAX_BYTES_CLIENT / 1_048_576));
}

export function mapMaterialUploadError(err: ApiError): string {
  if (err.status === 413) {
    return `O arquivo é muito grande. O tamanho máximo é ${formatUploadMaxSizeMb()} MB por arquivo.`;
  }
  if (err.status === 415) {
    return (
      err.message ||
      "Tipo de arquivo não permitido. Use PDF ou imagem (JPEG, PNG ou WebP)."
    );
  }
  if (err.status === 403) {
    return "Você não tem permissão para enviar arquivos.";
  }
  return getApiErrorMessage(undefined, err.status, err.message);
}

export function isAllowedMaterialFile(file: File): boolean {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  return allowed.includes(file.type);
}
