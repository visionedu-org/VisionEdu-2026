import { getUploadMaxBytes } from "@/server/storage";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export class FileValidationError extends Error {
  constructor(
    public readonly httpStatus: 413 | 415,
    public readonly code: "payload_too_large" | "unsupported_media_type",
    message: string
  ) {
    super(message);
    this.name = "FileValidationError";
  }
}

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

/** Detecta MIME a partir dos magic bytes do conteúdo. */
export function detectMimeFromMagicBytes(buffer: Buffer): AllowedMimeType | null {
  if (buffer.length < 12) return null;

  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function normalizeDeclaredMime(declaredMime: string): string {
  return declaredMime.split(";")[0]?.trim().toLowerCase() ?? "";
}

/**
 * Valida tamanho, MIME declarado e correspondência com magic bytes.
 * @throws {FileValidationError}
 */
export function validateUploadedFile(
  buffer: Buffer,
  declaredMime: string
): { mimeType: AllowedMimeType } {
  const maxBytes = getUploadMaxBytes();
  if (buffer.length > maxBytes) {
    throw new FileValidationError(
      413,
      "payload_too_large",
      `Arquivo excede o limite de ${Math.round(maxBytes / 1_048_576)} MB`
    );
  }

  if (buffer.length === 0) {
    throw new FileValidationError(
      415,
      "unsupported_media_type",
      "Arquivo vazio não é permitido"
    );
  }

  const normalizedDeclared = normalizeDeclaredMime(declaredMime);
  if (!isAllowedMimeType(normalizedDeclared)) {
    throw new FileValidationError(
      415,
      "unsupported_media_type",
      "Tipo de arquivo não permitido. Use PDF ou imagem (JPEG, PNG ou WebP)."
    );
  }

  const detected = detectMimeFromMagicBytes(buffer);
  if (!detected) {
    throw new FileValidationError(
      415,
      "unsupported_media_type",
      "Conteúdo do arquivo não corresponde a um formato permitido"
    );
  }

  if (detected !== normalizedDeclared) {
    throw new FileValidationError(
      415,
      "unsupported_media_type",
      "Tipo declarado não corresponde ao conteúdo do arquivo"
    );
  }

  return { mimeType: detected };
}
