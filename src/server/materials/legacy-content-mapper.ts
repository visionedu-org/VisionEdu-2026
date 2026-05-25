import { prisma } from "@/lib/prisma";
import type {
  CreateMaterialInput,
  LegacyCreateContentInput,
} from "@/lib/validations/materials";
import {
  MaterialClassesInvalidError,
  TeacherProfileNotFoundError,
} from "@/server/materials/create-material";

export async function mapLegacyContentToCreateMaterial(
  teacherUserId: string,
  payload: LegacyCreateContentInput
): Promise<CreateMaterialInput> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  const classGroup = await prisma.classGroup.findFirst({
    where: {
      grade: payload.grade,
      classIdentifier: payload.class_identifier,
      teacherAssignments: {
        some: { teacherId: teacher.id },
      },
    },
    select: { id: true },
  });

  if (!classGroup) {
    throw new MaterialClassesInvalidError(
      "Turma não encontrada ou não vinculada ao seu perfil."
    );
  }

  const contentType = payload.type === "pdf_upload" ? "file" : payload.type;

  return {
    title: payload.title,
    description: payload.description,
    discipline: payload.discipline,
    contentType,
    bodyText: contentType === "text" ? payload.description : null,
    videoUrl: null,
    recipients: [{ targetType: "class", classId: classGroup.id }],
  };
}
