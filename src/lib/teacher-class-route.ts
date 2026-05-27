import type { TeacherClassAssignment } from "@/types/domain";

/** Slug legado `série-turma` (ex.: `2-A`). Não é único entre escolas. */
export function teacherClassSlug(
  grade: string,
  classIdentifier: string
): string {
  return `${grade}-${classIdentifier}`;
}

/** Identificador estável para rotas — preferir UUID da turma no banco. */
export function teacherClassRouteId(
  assignment: TeacherClassAssignment
): string {
  return assignment.class_id ?? teacherClassSlug(assignment.grade, assignment.class_identifier);
}

export function parseTeacherClassSlug(slug: string): {
  grade: string;
  classIdentifier: string;
} | null {
  const trimmed = slug.trim();
  const dashIndex = trimmed.indexOf("-");
  if (dashIndex <= 0 || dashIndex === trimmed.length - 1) {
    return null;
  }
  return {
    grade: trimmed.slice(0, dashIndex),
    classIdentifier: trimmed.slice(dashIndex + 1),
  };
}
