import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseTeacherClassSlug } from "@/lib/teacher-class-route";
import {
  TeacherClassForbiddenError,
  assertTeacherOwnsClass,
} from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";

const uuidSchema = z.string().uuid();

export class TeacherClassNotFoundError extends Error {
  constructor(message = "Turma não encontrada") {
    super(message);
    this.name = "TeacherClassNotFoundError";
  }
}

export class TeacherClassAmbiguousError extends Error {
  constructor(
    message = "Identificador de turma ambíguo; use o ID da turma na URL."
  ) {
    super(message);
    this.name = "TeacherClassAmbiguousError";
  }
}

/**
 * Converte parâmetro de rota (UUID ou slug `grade-turma`) no `ClassGroup.id`,
 * garantindo vínculo professor ↔ turma ↔ escola no banco.
 */
export async function resolveTeacherClassParam(
  teacherUserId: string,
  param: string
): Promise<string> {
  const trimmed = param.trim();
  if (!trimmed) {
    throw new TeacherClassNotFoundError();
  }

  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  if (uuidSchema.safeParse(trimmed).success) {
    await assertTeacherOwnsClass(teacher.id, trimmed);
    return trimmed;
  }

  const parsed = parseTeacherClassSlug(trimmed);
  if (!parsed) {
    throw new TeacherClassNotFoundError();
  }

  const matches = await prisma.teacherClassAssignment.findMany({
    where: {
      teacherId: teacher.id,
      class: {
        grade: parsed.grade,
        classIdentifier: parsed.classIdentifier,
      },
    },
    select: { classId: true },
  });

  if (matches.length === 0) {
    throw new TeacherClassForbiddenError();
  }

  if (matches.length > 1) {
    throw new TeacherClassAmbiguousError();
  }

  return matches[0]!.classId;
}
