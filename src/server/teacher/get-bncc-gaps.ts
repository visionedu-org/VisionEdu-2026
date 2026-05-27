import { prisma } from "@/lib/prisma";
import { getBnccGapsForClass } from "@/mocks/data/bncc-competencies";
import { teacherClassSlug } from "@/lib/teacher-class-route";
import type { BnccGapRow } from "@/types/domain";
import { assertTeacherOwnsClass } from "@/server/materials/assert-teacher-class";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { TeacherClassNotFoundError } from "@/server/teacher/resolve-class-param";

export async function getBnccGapsForTeacherClass(
  teacherUserId: string,
  classId: string
): Promise<{ gaps: BnccGapRow[] }> {
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
    select: { grade: true, classIdentifier: true },
  });

  if (!classGroup) {
    throw new TeacherClassNotFoundError();
  }

  const slugKey = teacherClassSlug(classGroup.grade, classGroup.classIdentifier);
  return { gaps: getBnccGapsForClass(slugKey) };
}
