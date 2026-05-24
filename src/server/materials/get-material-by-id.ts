import { prisma } from "@/lib/prisma";
import type {
  EducationalMaterialDetail,
  MaterialContentType,
} from "@/types/materials";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { materialNotDeletedWhere } from "@/server/materials/material-active-filter";

export class MaterialNotFoundError extends Error {
  constructor() {
    super("Material não encontrado");
    this.name = "MaterialNotFoundError";
  }
}

export async function getMaterialById(
  teacherUserId: string,
  materialId: string
): Promise<EducationalMaterialDetail> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  const material = await prisma.educationalMaterial.findFirst({
    where: { id: materialId, ...materialNotDeletedWhere },
    include: {
      recipients: {
        include: {
          class: {
            select: {
              grade: true,
              classIdentifier: true,
              label: true,
            },
          },
          student: {
            select: {
              id: true,
              user: { select: { name: true } },
            },
          },
        },
      },
      attachments: {
        where: { materialId: { not: null } },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          sizeBytes: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!material || material.teacherId !== teacher.id) {
    throw new MaterialNotFoundError();
  }

  return {
    id: material.id,
    teacherId: material.teacherId,
    schoolId: material.schoolId,
    title: material.title,
    description: material.description,
    discipline: material.discipline,
    contentType: material.contentType as MaterialContentType,
    bodyText: material.bodyText,
    videoUrl: material.videoUrl,
    sentAt: material.sentAt.toISOString(),
    createdAt: material.createdAt.toISOString(),
    updatedAt: material.updatedAt.toISOString(),
    recipients: material.recipients.map((recipient) => ({
      id: recipient.id,
      targetType: recipient.targetType,
      classId: recipient.classId,
      studentId: recipient.studentId,
      studentName: recipient.student?.user.name ?? null,
      class: {
        grade: recipient.class.grade,
        classIdentifier: recipient.class.classIdentifier,
        label: recipient.class.label,
      },
    })),
    attachments: material.attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: Number(attachment.sizeBytes),
    })),
  };
}
