import { z } from "zod";
import {
  parseTeacherClassSlug,
  teacherClassSlug,
} from "@/lib/teacher-class-route";
import type { TeacherClassAssignment } from "@/types/domain";

const uuidSchema = z.string().uuid();

/**
 * Resolve parâmetro de rota (UUID ou slug `grade-turma`) para `ClassGroup.id`.
 * Preferir `class_id` nas URLs; o slug permanece só para compatibilidade.
 */
export function resolveClassIdParam(
  param: string,
  teacherClasses?: TeacherClassAssignment[]
): string | null {
  const trimmed = param.trim();
  if (!trimmed) return null;

  if (uuidSchema.safeParse(trimmed).success) {
    return trimmed;
  }

  if (teacherClasses?.length) {
    const parsed = parseTeacherClassSlug(trimmed);
    if (parsed) {
      const matches = teacherClasses.filter(
        (entry) =>
          entry.grade === parsed.grade &&
          entry.class_identifier === parsed.classIdentifier
      );
      if (matches.length === 1 && matches[0]!.class_id) {
        return matches[0]!.class_id;
      }
    }

    const bySlug = teacherClasses.find(
      (entry) =>
        teacherClassSlug(entry.grade, entry.class_identifier) === trimmed
    );
    if (bySlug?.class_id) {
      return bySlug.class_id;
    }
  }

  return null;
}
