import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PutObjectInput, PutObjectResult, StorageAdapter } from "./types";
import { buildLocalSignedDownloadUrl } from "./local-signing";

function getUploadsRoot(): string {
  const configured = process.env.STORAGE_LOCAL_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "uploads");
}

export function resolveLocalStorageAbsolutePath(key: string): string {
  const root = path.resolve(getUploadsRoot());
  const normalizedKey = key.replace(/\\/g, "/").replace(/^\/+/, "");
  const absolute = path.resolve(root, normalizedKey);
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Chave de storage inválida");
  }
  return absolute;
}

export class LocalStorageAdapter implements StorageAdapter {
  async putObject(input: PutObjectInput): Promise<PutObjectResult> {
    const filePath = resolveLocalStorageAbsolutePath(input.key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.body);
    return { key: input.key };
  }

  async getSignedUrl(
    key: string,
    expiresInSeconds: number = 3600
  ): Promise<string> {
    return buildLocalSignedDownloadUrl(key, expiresInSeconds);
  }

  async deleteObject(key: string): Promise<void> {
    const filePath = resolveLocalStorageAbsolutePath(key);
    try {
      await unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
      throw err;
    }
  }
}
