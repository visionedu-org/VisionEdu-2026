import type { EnemDiscipline } from "@/types/enem";
import type { TeacherDiscipline } from "@/lib/validations/teacher";

/** Disciplinas ENEM sugeridas ao professor conforme a matéria da turma. */
const TEACHER_TO_ENEM_DISCIPLINES: Record<
  TeacherDiscipline,
  readonly EnemDiscipline[]
> = {
  Matemática: ["matematica"],
  Português: ["linguagens"],
  História: ["ciencias-humanas"],
  Geografia: ["ciencias-humanas"],
};

export function enemDisciplinesForTeacherSubject(
  subject: TeacherDiscipline
): readonly EnemDiscipline[] {
  return TEACHER_TO_ENEM_DISCIPLINES[subject];
}

export function defaultEnemDisciplineForTeacherSubject(
  subject: TeacherDiscipline
): EnemDiscipline | "" {
  return enemDisciplinesForTeacherSubject(subject)[0] ?? "";
}
