import { prisma } from "@/lib/prisma";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";
import { getStorageAdapter } from "@/server/storage";
import { materialNotDeletedWhere } from "@/server/materials/material-active-filter";
import { buildStudentMaterialAccessWhere } from "@/server/materials/student-material-access";

const DOWNLOAD_URL_EXPIRES_SECONDS = 3600;

export interface AttachmentDownloadTarget {
  id: string;
  materialId: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
}

async function findBoundAttachment(
  materialId: string,
  attachmentId: string
): Promise<AttachmentDownloadTarget | null> {
  const attachment = await prisma.materialAttachment.findFirst({
    where: {
      id: attachmentId,
      materialId,
    },
    select: {
      id: true,
      materialId: true,
      storageKey: true,
      fileName: true,
      mimeType: true,
    },
  });

  if (!attachment?.materialId) {
    return null;
  }

  return {
    id: attachment.id,
    materialId: attachment.materialId,
    storageKey: attachment.storageKey,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
  };
}

export async function getAttachmentForTeacherDownload(
  teacherUserId: string,
  materialId: string,
  attachmentId: string
): Promise<AttachmentDownloadTarget> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  const material = await prisma.educationalMaterial.findFirst({
    where: { id: materialId, ...materialNotDeletedWhere },
    select: { teacherId: true },
  });

  if (!material || material.teacherId !== teacher.id) {
    throw new MaterialNotFoundError();
  }

  const attachment = await findBoundAttachment(materialId, attachmentId);
  if (!attachment) {
    throw new MaterialNotFoundError();
  }

  return attachment;
}

export async function getAttachmentForStudentDownload(
  studentUserId: string,
  materialId: string,
  attachmentId: string
): Promise<AttachmentDownloadTarget> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: { id: true, classId: true },
  });

  if (!student) {
    throw new StudentProfileNotFoundError();
  }

  const material = await prisma.educationalMaterial.findFirst({
    where: {
      id: materialId,
      ...buildStudentMaterialAccessWhere(student.id, student.classId),
    },
    select: { id: true },
  });

  if (!material) {
    throw new MaterialNotFoundError();
  }

  const attachment = await findBoundAttachment(materialId, attachmentId);
  if (!attachment) {
    throw new MaterialNotFoundError();
  }

  return attachment;
}

export async function recordAttachmentDownload(
  actorUserId: string,
  materialId: string,
  attachmentId: string
): Promise<void> {
  await prisma.materialDeliveryLog.create({
    data: {
      materialId,
      actorUserId,
      action: "downloaded",
      metadata: { attachmentId },
    },
  });
}

export async function createAttachmentDownloadResponse(
  attachment: AttachmentDownloadTarget
): Promise<Response> {
  const storage = getStorageAdapter();
  const signedUrl = await storage.getSignedUrl(
    attachment.storageKey,
    DOWNLOAD_URL_EXPIRES_SECONDS,
    { downloadFileName: attachment.fileName }
  );

  return Response.redirect(signedUrl, 302);
}
