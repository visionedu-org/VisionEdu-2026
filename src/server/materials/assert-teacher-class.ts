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
