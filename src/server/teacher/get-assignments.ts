import { prisma } from "@/lib/prisma";
import type { TeacherSchoolsPayload } from "@/lib/validations/teacher-assignments";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";

export async function getTeacherAssignmentsPayload(
  teacherUserId: string
): Promise<TeacherSchoolsPayload> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: {
      schools: {
        select: { schoolId: true },
        orderBy: { schoolId: "asc" },
      },
      assignments: {
        select: {
          classId: true,
          class: {
            select: {
              schoolId: true,
              grade: true,
              classIdentifier: true,
            },
          },
        },
        orderBy: [
          { class: { grade: "asc" } },
          { class: { classIdentifier: "asc" } },
        ],
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

  const materiasByClass = new Map<string, string[]>();
  for (const row of teacher.classMaterias) {
    const current = materiasByClass.get(row.classId) ?? [];
    current.push(row.materia);
    materiasByClass.set(row.classId, current);
  }

  const classesBySchool = new Map<
    string,
    TeacherSchoolsPayload[number]["classes"]
  >();

  for (const assignment of teacher.assignments) {
    const schoolId = assignment.class.schoolId;
    const classes = classesBySchool.get(schoolId) ?? [];
    classes.push({
      grade: assignment.class.grade as "1" | "2" | "3",
      class_identifier: assignment.class.classIdentifier,
      materias: (materiasByClass.get(assignment.classId) ?? []) as TeacherSchoolsPayload[number]["classes"][number]["materias"],
    });
    classesBySchool.set(schoolId, classes);
  }

  const schoolIds =
    teacher.schools.length > 0
      ? teacher.schools.map((entry) => entry.schoolId)
      : [...classesBySchool.keys()];

  return schoolIds.map((schoolId) => ({
    school_id: schoolId,
    classes: classesBySchool.get(schoolId) ?? [],
  }));
}
