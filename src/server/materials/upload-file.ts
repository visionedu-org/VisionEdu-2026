import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { validateUploadedFile } from "@/server/materials/validate-file";
import { getStorageAdapter } from "@/server/storage";
import { buildPendingUploadStorageKey } from "@/server/storage/storage-key";

export interface UploadMaterialFileResult {
  uploadId: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\- ()áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]/gi, "");
  const trimmed = base.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 255) : "arquivo";
}

export async function uploadMaterialFile(
  teacherUserId: string,
  file: File
): Promise<UploadMaterialFileResult> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { mimeType } = validateUploadedFile(
    buffer,
    file.type || "application/octet-stream"
  );

  const uploadId = randomUUID();
  const fileName = sanitizeFileName(file.name || "arquivo");
  const storageKey = buildPendingUploadStorageKey(uploadId, fileName);
  const checksum = createHash("sha256").update(buffer).digest("hex");
  const storage = getStorageAdapter();

  try {
    await storage.putObject({
      key: storageKey,
      body: buffer,
      contentType: mimeType,
    });
  } catch (err) {
    console.error("[uploadMaterialFile] storage.putObject", err);
    throw err;
  }

  try {
    const attachment = await prisma.materialAttachment.create({
      data: {
        id: uploadId,
        materialId: null,
        teacherId: teacher.id,
        fileName,
        mimeType,
        sizeBytes: BigInt(buffer.length),
        storageKey,
        checksum,
      },
      select: {
        id: true,
        storageKey: true,
        fileName: true,
        mimeType: true,
        sizeBytes: true,
      },
    });

    return {
      uploadId: attachment.id,
      storageKey: attachment.storageKey,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: Number(attachment.sizeBytes),
    };
  } catch (err) {
    await storage.deleteObject(storageKey).catch(() => undefined);
    throw err;
  }
}
