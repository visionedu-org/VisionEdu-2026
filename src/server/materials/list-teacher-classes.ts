import { prisma } from "@/lib/prisma";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import type { ClassGroup } from "@/types/domain";

export async function listTeacherAssignedClasses(
  teacherUserId: string
): Promise<ClassGroup[]> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: {
      assignments: {
        select: {
          class: {
            select: {
              id: true,
              schoolId: true,
              grade: true,
              classIdentifier: true,
              label: true,
            },
          },
        },
        orderBy: [{ class: { grade: "asc" } }, { class: { classIdentifier: "asc" } }],
      },
    },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  return teacher.assignments.map(({ class: classGroup }) => ({
    id: classGroup.id,
    school_id: classGroup.schoolId,
    grade: classGroup.grade,
    class_identifier: classGroup.classIdentifier,
    label: classGroup.label,
  }));
}
