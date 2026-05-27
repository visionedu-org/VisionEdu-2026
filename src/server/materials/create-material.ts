import type { MaterialContentType } from "@prisma/client";
import { buildQuestionKey } from "@/lib/enem/question-key";
import { prisma } from "@/lib/prisma";
import type { CreateMaterialInput } from "@/lib/validations/materials";
import { assertTeacherOwnsClass, assertTeacherOwnsDiscipline, assertTeacherOwnsSchool } from "@/server/materials/assert-teacher-class";
import { assertStudentInTeacherClass } from "@/server/materials/assert-student-in-class";

export class TeacherProfileNotFoundError extends Error {
  constructor() {
    super("Perfil de professor não encontrado");
    this.name = "TeacherProfileNotFoundError";
  }
}

export class MaterialClassesInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaterialClassesInvalidError";
  }
}

export class MaterialAttachmentsInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaterialAttachmentsInvalidError";
  }
}

export interface CreateMaterialResult {
  id: string;
  sentAt: string;
}

function recipientClassId(
  recipient: CreateMaterialInput["recipients"][number]
): string {
  return recipient.classId;
}

export async function createMaterial(
  teacherUserId: string,
  payload: CreateMaterialInput
): Promise<CreateMaterialResult> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true, user: { select: { name: true } } },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  const teacherName = teacher.user.name.trim();

  const classIds = [
    ...new Set(payload.recipients.map((recipient) => recipientClassId(recipient))),
  ];

  for (const classId of classIds) {
    await assertTeacherOwnsClass(teacher.id, classId);
    await assertTeacherOwnsDiscipline(
      teacher.id,
      classId,
      payload.discipline
    );
  }

  for (const recipient of payload.recipients) {
    if (recipient.targetType === "student") {
      await assertStudentInTeacherClass(
        teacher.id,
        recipient.studentId,
        recipient.classId
      );
    }
  }

  const classes = await prisma.classGroup.findMany({
    where: { id: { in: classIds } },
    select: { id: true, schoolId: true },
  });

  if (classes.length !== classIds.length) {
    throw new MaterialClassesInvalidError("Uma ou mais turmas não foram encontradas");
  }

  const schoolIds = new Set(classes.map((c) => c.schoolId));
  if (schoolIds.size > 1) {
    throw new MaterialClassesInvalidError(
      "Todas as turmas destinatárias devem pertencer à mesma escola"
    );
  }

  const schoolId = classes[0]!.schoolId;
  await assertTeacherOwnsSchool(teacher.id, schoolId);

  const sentAt = new Date();
  const bodyText =
    payload.contentType === "text" ? (payload.bodyText?.trim() ?? null) : null;
  const videoUrl =
    payload.contentType === "video_link"
      ? (payload.videoUrl?.trim() ?? null)
      : null;

  const attachmentIds =
    payload.contentType === "file"
      ? [...new Set(payload.attachmentIds ?? [])]
      : [];

  const enemQuestions =
    payload.contentType === "questions"
      ? (payload.enemQuestions ?? []).map((question, sortOrder) => ({
          questionKey: buildQuestionKey(
            question.year,
            question.index,
            question.language
          ),
          year: question.year,
          index: question.index,
          language: question.language?.trim() || null,
          sortOrder,
        }))
      : [];

  if (payload.contentType === "file" && attachmentIds.length > 0) {
    const pending = await prisma.materialAttachment.findMany({
      where: {
        id: { in: attachmentIds },
        teacherId: teacher.id,
        materialId: null,
      },
      select: { id: true },
    });

    if (pending.length !== attachmentIds.length) {
      throw new MaterialAttachmentsInvalidError(
        "Um ou mais anexos são inválidos, já foram vinculados ou não pertencem a você"
      );
    }
  }

  const material = await prisma.$transaction(async (tx) => {
    const created = await tx.educationalMaterial.create({
      data: {
        teacherId: teacher.id,
        teacherName,
        schoolId,
        title: payload.title.trim(),
        description: payload.description.trim(),
        discipline: payload.discipline,
        contentType: payload.contentType as MaterialContentType,
        bodyText,
        videoUrl,
        sentAt,
        recipients: {
          create: payload.recipients.map((recipient) => {
            if (recipient.targetType === "class") {
              return {
                targetType: "class",
                classId: recipient.classId,
              };
            }
            return {
              targetType: "student",
              classId: recipient.classId,
              studentId: recipient.studentId,
            };
          }),
        },
        deliveryLogs: {
          create: {
            actorUserId: teacherUserId,
            action: "created",
            metadata: {
              contentType: payload.contentType,
              recipientCount: payload.recipients.length,
              attachmentCount: attachmentIds.length,
              questionCount: enemQuestions.length,
            },
          },
        },
      },
      select: { id: true, sentAt: true },
    });

    if (enemQuestions.length > 0) {
      await tx.materialEnemQuestion.createMany({
        data: enemQuestions.map((question) => ({
          materialId: created.id,
          ...question,
        })),
      });
    }

    if (attachmentIds.length > 0) {
      const updated = await tx.materialAttachment.updateMany({
        where: {
          id: { in: attachmentIds },
          teacherId: teacher.id,
          materialId: null,
        },
        data: { materialId: created.id },
      });

      if (updated.count !== attachmentIds.length) {
        throw new MaterialAttachmentsInvalidError(
          "Não foi possível vincular todos os anexos ao material"
        );
      }
    }

    return created;
  });

  return {
    id: material.id,
    sentAt: material.sentAt.toISOString(),
  };
}
