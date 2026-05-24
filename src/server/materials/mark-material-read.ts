import { prisma } from "@/lib/prisma";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";
import { materialNotDeletedWhere } from "@/server/materials/material-active-filter";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";
import { buildStudentMaterialAccessWhere } from "@/server/materials/student-material-access";
import type { MarkMaterialReadResult } from "@/types/materials";

export async function markMaterialRead(
  studentUserId: string,
  materialId: string
): Promise<MarkMaterialReadResult> {
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
      ...materialNotDeletedWhere,
      ...buildStudentMaterialAccessWhere(student.id, student.classId),
    },
    select: { id: true },
  });

  if (!material) {
    throw new MaterialNotFoundError();
  }

  const read = await prisma.materialRead.upsert({
    where: {
      studentId_materialId: {
        studentId: student.id,
        materialId,
      },
    },
    create: {
      studentId: student.id,
      materialId,
    },
    update: {},
    select: { readAt: true },
  });

  return {
    materialId,
    readAt: read.readAt.toISOString(),
  };
}
