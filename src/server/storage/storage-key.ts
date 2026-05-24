import { randomUUID } from "node:crypto";
import path from "node:path";

/** Chave opaca no storage: `materials/{materialId}/{fileId}.ext` */
export function buildMaterialStorageKey(
  materialId: string,
  originalFileName: string,
  fileId: string = randomUUID()
): string {
  const ext = path.extname(originalFileName).toLowerCase() || "";
  const safeExt = ext.replace(/[^.a-z0-9]/gi, "");
  return `materials/${materialId}/${fileId}${safeExt}`;
}

/** Chave para upload pendente (antes de vincular ao material). */
export function buildPendingUploadStorageKey(
  uploadId: string,
  originalFileName: string,
  fileId: string = randomUUID()
): string {
  const ext = path.extname(originalFileName).toLowerCase() || "";
  const safeExt = ext.replace(/[^.a-z0-9]/gi, "");
  return `materials/pending/${uploadId}/${fileId}${safeExt}`;
}
