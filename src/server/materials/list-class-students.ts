import { prisma } from "@/lib/prisma";
import { assertTeacherOwnsClass } from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";

export interface ClassStudentSummary {
  id: string;
  name: string;
}

export async function listClassStudents(
  teacherUserId: string,
  classId: string
): Promise<ClassStudentSummary[]> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  await assertTeacherOwnsClass(teacher.id, classId);

  const students = await prisma.studentProfile.findMany({
    where: { classId },
    select: {
      id: true,
      user: { select: { name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return students.map((student) => ({
    id: student.id,
    name: student.user.name,
  }));
}
