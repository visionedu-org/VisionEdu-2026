import { prisma } from "@/lib/prisma";
import {
  assertTeacherOwnsClass,
  TeacherClassForbiddenError,
} from "@/server/materials/assert-teacher-class";

/**
 * RN-03: aluno deve estar matriculado na turma vinculada ao professor.
 */
export async function assertStudentInTeacherClass(
  teacherId: string,
  studentId: string,
  classId: string
): Promise<void> {
  await assertTeacherOwnsClass(teacherId, classId);

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { classId: true },
  });

  if (!student || student.classId !== classId) {
    throw new TeacherClassForbiddenError(
      "Aluno não pertence à turma selecionada ou turma não vinculada ao professor"
    );
  }
}
