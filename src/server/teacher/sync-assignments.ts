import { prisma } from "@/lib/prisma";
import { filterCompatibleMaterias } from "@/lib/materias-catalog";
import type { TeacherSchoolsPayload } from "@/lib/validations/teacher-assignments";
import { findOrCreateClassGroup } from "@/server/auth/class-group";
import { hasDuplicateTeacherClasses } from "@/lib/teacher-class-key";
import { AuthRegisterError } from "@/server/auth/register-student";

export class TeacherAssignmentsInvalidError extends Error {
  constructor(
    message: string,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "TeacherAssignmentsInvalidError";
  }
}

interface ResolvedClassAssignment {
  schoolId: string;
  classId: string;
  grade: string;
  classIdentifier: string;
  materias: string[];
}

async function resolveClassAssignments(
  schools: TeacherSchoolsPayload
): Promise<ResolvedClassAssignment[]> {
  const resolved: ResolvedClassAssignment[] = [];

  for (const schoolBlock of schools) {
    if (hasDuplicateTeacherClasses(schoolBlock.classes)) {
      throw new TeacherAssignmentsInvalidError("Turmas duplicadas", {
        schools:
          "Cada combinação de série e turma deve ser selecionada apenas uma vez por escola",
      });
    }

    for (const classEntry of schoolBlock.classes) {
      const classGroup = await findOrCreateClassGroup({
        schoolId: schoolBlock.school_id,
        grade: classEntry.grade,
        classIdentifier: classEntry.class_identifier,
      });

      const materias = filterCompatibleMaterias(
        schoolBlock.school_id,
        classEntry.grade,
        classEntry.materias
      );

      if (materias.length === 0) {
        throw new TeacherAssignmentsInvalidError("Matérias inválidas", {
          schools: "Selecione matérias compatíveis com a escola e a série",
        });
      }

      resolved.push({
        schoolId: schoolBlock.school_id,
        classId: classGroup.id,
        grade: classEntry.grade,
        classIdentifier: classEntry.class_identifier,
        materias,
      });
    }
  }

  return resolved;
}

export async function syncTeacherAssignments(
  teacherId: string,
  schools: TeacherSchoolsPayload
): Promise<void> {
  const assignments = await resolveClassAssignments(schools);

  if (assignments.length === 0) {
    throw new TeacherAssignmentsInvalidError("Dados incompletos", {
      schools: "Informe escolas, turmas e matérias",
    });
  }

  const schoolIds = [...new Set(assignments.map((entry) => entry.schoolId))];
  const classIds = [...new Set(assignments.map((entry) => entry.classId))];

  await prisma.$transaction(async (tx) => {
    await tx.teacherClassMateria.deleteMany({ where: { teacherId } });
    await tx.teacherClassAssignment.deleteMany({ where: { teacherId } });
    await tx.teacherSchoolAssignment.deleteMany({ where: { teacherId } });

    await tx.teacherSchoolAssignment.createMany({
      data: schoolIds.map((schoolId) => ({ teacherId, schoolId })),
    });

    await tx.teacherClassAssignment.createMany({
      data: classIds.map((classId) => ({ teacherId, classId })),
    });

    await tx.teacherClassMateria.createMany({
      data: assignments.flatMap((entry) =>
        entry.materias.map((materia) => ({
          teacherId,
          classId: entry.classId,
          schoolId: entry.schoolId,
          materia,
        }))
      ),
    });
  });
}

export async function createTeacherAssignmentsFromRegistration(
  schools: TeacherSchoolsPayload
): Promise<{
  schoolIds: string[];
  classIds: string[];
  materiaRows: Array<{
    classId: string;
    schoolId: string;
    materia: string;
  }>;
}> {
  const assignments = await resolveClassAssignments(schools);
  const schoolIds = [...new Set(assignments.map((entry) => entry.schoolId))];
  const classIds = [...new Set(assignments.map((entry) => entry.classId))];
  const materiaRows = assignments.flatMap((entry) =>
    entry.materias.map((materia) => ({
      classId: entry.classId,
      schoolId: entry.schoolId,
      materia,
    }))
  );

  return { schoolIds, classIds, materiaRows };
}

/** @deprecated Use TeacherAssignmentsInvalidError in profile updates. */
export { AuthRegisterError };
