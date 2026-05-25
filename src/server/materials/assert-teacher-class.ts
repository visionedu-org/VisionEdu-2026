import { prisma } from "@/lib/prisma";

export class TeacherClassForbiddenError extends Error {
  constructor(message = "Turma não vinculada ao professor") {
    super(message);
    this.name = "TeacherClassForbiddenError";
  }
}

export async function assertTeacherOwnsClass(
  teacherId: string,
  classId: string
): Promise<void> {
  const assignment = await prisma.teacherClassAssignment.findUnique({
    where: {
      teacherId_classId: { teacherId, classId },
    },
    select: { classId: true },
  });

  if (!assignment) {
    throw new TeacherClassForbiddenError();
  }
}

export async function assertTeacherOwnsSchool(
  teacherId: string,
  schoolId: string
): Promise<void> {
  const assignment = await prisma.teacherSchoolAssignment.findUnique({
    where: {
      teacherId_schoolId: { teacherId, schoolId },
    },
    select: { schoolId: true },
  });

  if (!assignment) {
    throw new TeacherClassForbiddenError("Escola não vinculada ao professor");
  }
}

export async function assertTeacherOwnsDiscipline(
  teacherId: string,
  classId: string,
  discipline: string
): Promise<void> {
  const assignment = await prisma.teacherClassMateria.findUnique({
    where: {
      teacherId_classId_materia: {
        teacherId,
        classId,
        materia: discipline,
      },
    },
    select: { materia: true },
  });

  if (!assignment) {
    throw new TeacherClassForbiddenError(
      "Matéria não vinculada ao professor nesta turma"
    );
  }
}
