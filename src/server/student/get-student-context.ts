import { prisma } from "@/lib/prisma";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";

export interface StudentContext {
  studentId: string;
  schoolName: string;
  grade: string;
  classIdentifier: string;
  xp: number;
  level: number;
}

export async function getStudentContext(
  studentUserId: string
): Promise<StudentContext> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: {
      id: true,
      xp: true,
      level: true,
      school: { select: { name: true } },
      class: { select: { grade: true, classIdentifier: true } },
    },
  });

  if (!student) {
    throw new StudentProfileNotFoundError();
  }

  return {
    studentId: student.id,
    schoolName: student.school.name,
    grade: student.class.grade,
    classIdentifier: student.class.classIdentifier,
    xp: student.xp,
    level: student.level,
  };
}
