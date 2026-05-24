import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/server/auth/api-error";
import {
  buildAttachmentContentDisposition,
  verifyLocalDownloadSignature,
} from "@/server/storage";
import { resolveLocalStorageAbsolutePath } from "@/server/storage/local-adapter";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const expiresRaw = searchParams.get("expires");
    const signature = searchParams.get("sig");

    if (!key || !expiresRaw || !signature) {
      return jsonError(400, "validation_error", "Parâmetros de download inválidos");
    }

    const expiresAtMs = Number.parseInt(expiresRaw, 10);
    if (!Number.isFinite(expiresAtMs)) {
      return jsonError(400, "validation_error", "Parâmetros de download inválidos");
    }

    if (!verifyLocalDownloadSignature(key, expiresAtMs, signature)) {
      return jsonError(403, "forbidden", "Link de download inválido ou expirado");
    }

    let filePath: string;
    try {
      filePath = resolveLocalStorageAbsolutePath(key);
    } catch {
      return jsonError(400, "validation_error", "Chave de arquivo inválida");
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return jsonError(404, "not_found", "Arquivo não encontrado");
      }
      throw err;
    }

    const attachment = await prisma.materialAttachment.findFirst({
      where: { storageKey: key },
      select: { fileName: true, mimeType: true },
    });

    const fileName = attachment?.fileName ?? path.basename(key);
    const mimeType = attachment?.mimeType ?? "application/octet-stream";

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": buildAttachmentContentDisposition(fileName),
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[storage/local GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível baixar o arquivo. Tente novamente."
    );
  }
}
