import { prisma } from "@/lib/prisma";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { MaterialNotFoundError } from "@/server/materials/get-material-by-id";

export interface DeleteMaterialResult {
  id: string;
  deletedAt: string;
}

export async function deleteMaterial(
  teacherUserId: string,
  materialId: string
): Promise<DeleteMaterialResult> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  const material = await prisma.educationalMaterial.findUnique({
    where: { id: materialId },
    select: { id: true, teacherId: true, deletedAt: true },
  });

  if (!material || material.teacherId !== teacher.id) {
    throw new MaterialNotFoundError();
  }

  if (material.deletedAt) {
    return {
      id: material.id,
      deletedAt: material.deletedAt.toISOString(),
    };
  }

  const deletedAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.educationalMaterial.update({
      where: { id: materialId },
      data: { deletedAt },
    });

    await tx.materialDeliveryLog.create({
      data: {
        materialId,
        actorUserId: teacherUserId,
        action: "deleted",
        metadata: { softDelete: true },
      },
    });
  });

  return {
    id: materialId,
    deletedAt: deletedAt.toISOString(),
  };
}
