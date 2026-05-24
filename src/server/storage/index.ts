/**
 * Armazenamento de anexos educacionais.
 *
 * Desenvolvimento: `STORAGE_PROVIDER=local` grava em `./uploads/` (gitignored).
 * Produção: `STORAGE_PROVIDER=s3` com bucket S3-compatible (AWS, R2, MinIO).
 *
 * Download local usa URL assinada em `/api/v1/storage/local` (handler na fase 12).
 */
import type { StorageAdapter, StorageProvider } from "./types";
import { LocalStorageAdapter } from "./local-adapter";
import { S3StorageAdapter } from "./s3-adapter";

export type {
  GetSignedUrlOptions,
  PutObjectInput,
  PutObjectResult,
  StorageAdapter,
  StorageProvider,
} from "./types";
export { buildAttachmentContentDisposition } from "./content-disposition";
export { buildMaterialStorageKey } from "./storage-key";
export {
  buildLocalSignedDownloadUrl,
  verifyLocalDownloadSignature,
} from "./local-signing";

const DEFAULT_UPLOAD_MAX_BYTES = 10_485_760;

export function getStorageProvider(): StorageProvider {
  const value = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
  if (value === "s3") return "s3";
  return "local";
}

export function getUploadMaxBytes(): number {
  const raw = process.env.UPLOAD_MAX_BYTES?.trim();
  if (!raw) return DEFAULT_UPLOAD_MAX_BYTES;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_UPLOAD_MAX_BYTES;
}

let adapterSingleton: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (adapterSingleton) return adapterSingleton;

  const provider = getStorageProvider();
  adapterSingleton =
    provider === "s3" ? new S3StorageAdapter() : new LocalStorageAdapter();

  return adapterSingleton;
}

/** Reinicia o singleton (útil em testes). */
export function resetStorageAdapterForTests(): void {
  adapterSingleton = null;
}
