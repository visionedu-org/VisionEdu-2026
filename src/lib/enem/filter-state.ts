import type { EnemExam, EnemQuestionFilters } from "@/types/enem";

function clearOptional<T extends string>(value: T | "" | undefined): T | undefined {
  return value === "" || value === undefined ? undefined : value;
}

/** Normaliza patch de filtros do painel simplificado. */
export function normalizeEnemFilterPatch(
  prev: EnemQuestionFilters,
  patch: Partial<EnemQuestionFilters>
): EnemQuestionFilters {
  const next: EnemQuestionFilters = { ...prev, ...patch };

  if ("discipline" in patch) {
    next.discipline = clearOptional(patch.discipline);
  }
  if ("difficulty" in patch) {
    next.difficulty = clearOptional(patch.difficulty);
  }
  if (patch.year !== undefined) {
    next.year = patch.year;
  }
  if (patch.answered !== undefined) {
    next.answered = patch.answered;
  }

  return next;
}

export function hasActiveClientFilters(filters: EnemQuestionFilters): boolean {
  return Boolean(
    filters.discipline ||
      filters.difficulty ||
      (filters.answered && filters.answered !== "all")
  );
}

export function resolveExamYear(
  filters: EnemQuestionFilters,
  exams: EnemExam[],
  fallbackYear: number
): number {
  if (exams.some((e) => e.year === filters.year)) return filters.year;
  return exams[0]?.year ?? fallbackYear;
}
