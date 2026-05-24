import { prisma } from "@/lib/prisma";
import type {
  CreateMaterialInput,
  LegacyCreateContentInput,
} from "@/lib/validations/materials";
import { MaterialClassesInvalidError } from "@/server/materials/create-material";

export async function mapLegacyContentToCreateMaterial(
  payload: LegacyCreateContentInput
): Promise<CreateMaterialInput> {
  const classGroup = await prisma.classGroup.findFirst({
    where: {
      grade: payload.grade,
      classIdentifier: payload.class_identifier,
    },
    select: { id: true },
  });

  if (!classGroup) {
    throw new MaterialClassesInvalidError(
      "Turma não encontrada para o envio do material."
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
