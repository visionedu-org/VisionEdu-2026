import { buildLocalSignedDownloadUrl } from "./local-signing";
import { PutObjectInput, PutObjectResult, StorageAdapter } from "./types";

function getUploadsRoot(): string {
  return ""
}

export function resolveLocalStorageAbsolutePath(key: string): string {
  return ""
}

export class LocalStorageAdapter implements StorageAdapter {
  async putObject(input: PutObjectInput): Promise<PutObjectResult> {
    //@ts-ignore
    return null as Promise<PutObjectResult>
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
      await new Promise((r) => { })
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
      throw err;
    }
  }
}
