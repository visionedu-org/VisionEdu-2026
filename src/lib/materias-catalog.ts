import {
  TEACHER_DISCIPLINES,
  type TeacherDiscipline,
} from "@/lib/validations/teacher";

/** Matérias ofertadas por escola e série (ano escolar). */
const PILOT_MATERIAS_BY_SCHOOL_GRADE: Record<
  string,
  Record<string, readonly TeacherDiscipline[]>
> = {
  "d3b07384-d113-4956-a5cc-9c6f2c3d526e": {
    "1": ["Português", "Matemática"],
    "2": ["Português", "Matemática", "História", "Geografia"],
    "3": ["Português", "Matemática", "História", "Geografia"],
  },
  "e4c18495-e224-5067-b6dd-0d7f3e4d637f": {
    "1": ["Português", "Matemática"],
    "2": ["Português", "Matemática", "História", "Geografia"],
    "3": ["Português", "Matemática", "História", "Geografia"],
  },
};

export function getAvailableMaterias(
  schoolId: string,
  grade: string
): readonly TeacherDiscipline[] {
  const byGrade = PILOT_MATERIAS_BY_SCHOOL_GRADE[schoolId];
  if (!byGrade) {
    return TEACHER_DISCIPLINES;
  }
  return byGrade[grade] ?? TEACHER_DISCIPLINES;
}

export function isMateriaAvailableForClass(
  schoolId: string,
  grade: string,
  materia: string
): materia is TeacherDiscipline {
  return getAvailableMaterias(schoolId, grade).includes(
    materia as TeacherDiscipline
  );
}

export function filterCompatibleMaterias(
  schoolId: string,
  grade: string,
  materias: string[]
): TeacherDiscipline[] {
  const allowed = new Set(getAvailableMaterias(schoolId, grade));
  return materias.filter((m): m is TeacherDiscipline =>
    allowed.has(m as TeacherDiscipline)
  );
}
