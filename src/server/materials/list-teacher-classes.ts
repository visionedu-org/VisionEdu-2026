import { prisma } from "@/lib/prisma";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import type { ClassGroup } from "@/types/domain";
import type { TeacherDiscipline } from "@/lib/validations/teacher";

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
      classMaterias: {
        select: {
          classId: true,
          materia: true,
        },
      },
    },
  });

  if (!teacher) {
    throw new TeacherProfileNotFoundError();
  }

  const materiasByClass = new Map<string, TeacherDiscipline[]>();
  for (const row of teacher.classMaterias) {
    const current = materiasByClass.get(row.classId) ?? [];
    current.push(row.materia as TeacherDiscipline);
    materiasByClass.set(row.classId, current);
  }

  return teacher.assignments.map(({ class: classGroup }) => ({
    id: classGroup.id,
    school_id: classGroup.schoolId,
    grade: classGroup.grade,
    class_identifier: classGroup.classIdentifier,
    label: classGroup.label,
    materias: materiasByClass.get(classGroup.id) ?? [],
  }));
}
