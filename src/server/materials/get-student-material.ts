import { prisma } from "@/lib/prisma";
import type { MaterialContentType, StudentMaterialDetail } from "@/types/materials";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";
import { buildStudentMaterialAccessWhere } from "@/server/materials/student-material-access";

export async function getStudentMaterial(
  studentUserId: string,
  materialId: string
): Promise<StudentMaterialDetail> {
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
    select: {
      id: true,
      title: true,
      description: true,
      discipline: true,
      contentType: true,
      bodyText: true,
      videoUrl: true,
      sentAt: true,
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

  if (!material) {
    throw new MaterialNotFoundError();
  }

  return {
    id: material.id,
    title: material.title,
    description: material.description,
    discipline: material.discipline,
    contentType: material.contentType as MaterialContentType,
    bodyText: material.bodyText,
    videoUrl: material.videoUrl,
    sentAt: material.sentAt.toISOString(),
    attachments: material.attachments.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: Number(attachment.sizeBytes),
    })),
  };
}
