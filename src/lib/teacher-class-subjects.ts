import {
  TEACHER_DISCIPLINES,
  type TeacherDiscipline,
} from "@/lib/validations/teacher";
import type { ClassGroup } from "@/types/domain";

/** Disciplinas que o professor ministra na turma (ordem estável do catálogo). */
export function getTeacherSubjectsForClass(
  classGroup: ClassGroup | undefined
): TeacherDiscipline[] {
  const assigned = classGroup?.materias ?? [];
  if (assigned.length === 0) return [];
  const assignedSet = new Set(assigned);
  return TEACHER_DISCIPLINES.filter((discipline) => assignedSet.has(discipline));
}

export function teacherTeachesSubjectInClass(
  classGroup: ClassGroup | undefined,
  subject: string
): boolean {
  return getTeacherSubjectsForClass(classGroup).includes(
    subject as TeacherDiscipline
  );
}
