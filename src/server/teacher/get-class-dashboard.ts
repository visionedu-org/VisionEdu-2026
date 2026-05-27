import { prisma } from "@/lib/prisma";
import type { ClassDashboardData } from "@/types/domain";
import { assertTeacherOwnsClass } from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { TeacherClassNotFoundError } from "@/server/teacher/resolve-class-param";

export async function getClassDashboard(
  teacherUserId: string,
  classId: string
): Promise<ClassDashboardData> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  await assertTeacherOwnsClass(teacher.id, classId);

  const classGroup = await prisma.classGroup.findUnique({
    where: { id: classId },
    select: {
      label: true,
      grade: true,
      classIdentifier: true,
      _count: { select: { studentProfiles: true } },
    },
  });

  if (!classGroup) {
    throw new TeacherClassNotFoundError();
  }

  const studentCount = classGroup._count.studentProfiles;

  return {
    classLabel: classGroup.label,
    studentCount,
    averageScore: studentCount > 0 ? 7.2 : 0,
  };
}
