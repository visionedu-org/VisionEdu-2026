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
    next.favorites = patch.answered === "favorites" ? true : undefined;
  }

  if ("shuffle" in patch) {
    next.shuffle = patch.shuffle;
  }

  return next;
}

export function isAllYearsMode(filters: EnemQuestionFilters): boolean {
  return filters.year === "all";
}

export function hasActiveClientFilters(filters: EnemQuestionFilters): boolean {
  return Boolean(
    filters.discipline ||
      filters.difficulty ||
      filters.favorites ||
      (filters.answered &&
        filters.answered !== "all" &&
        filters.answered !== "favorites")
  );
}

export function isFavoritesOnlyMode(filters: EnemQuestionFilters): boolean {
  return filters.favorites === true || filters.answered === "favorites";
}

/** Valor do select Ano/Prova (`""` = Todas). */
export function getYearFilterSelectValue(filters: EnemQuestionFilters): string {
  return filters.year === "all" ? "" : String(filters.year);
}

export function parseYearFilterSelectValue(value: string): number | "all" {
  if (value === "") return "all";
  const year = Number(value);
  return Number.isFinite(year) ? year : "all";
}

export function resolveExamYear(
  filters: EnemQuestionFilters,
  exams: EnemExam[],
  fallbackYear: number
): number | "all" {
  if (filters.year === "all") return "all";
  if (typeof filters.year === "number" && exams.some((e) => e.year === filters.year)) {
    return filters.year;
  }
  return exams[0]?.year ?? fallbackYear;
}
