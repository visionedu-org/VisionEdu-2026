import { applyClientQuestionFilters } from "@/lib/enem/filter-questions";
import { fetchEnemQuestion } from "@/lib/enem/enem-question-api";
import { parseQuestionKey } from "@/lib/enem/parse-question-key";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";

/** Carrega questões favoritas pela chave persistida em localStorage (fila serial). */
export async function loadFavoriteQuestions(
  favoriteKeys: string[],
  filters?: Pick<
    EnemQuestionFilters,
    "discipline" | "difficulty" | "answered"
  >
): Promise<EnemQuestion[]> {
  const parsed = favoriteKeys
    .map((key) => ({ key, parsed: parseQuestionKey(key) }))
    .filter(
      (
        entry
      ): entry is {
        key: string;
        parsed: NonNullable<typeof entry.parsed>;
      } => Boolean(entry.parsed)
    );

  if (parsed.length === 0) return [];

  const loaded: EnemQuestion[] = [];
  for (const { parsed: p } of parsed) {
    const question = await fetchEnemQuestion(p.year, p.index, p.language);
    loaded.push(question);
  }

  if (!filters) return loaded;

  const filterPayload: EnemQuestionFilters = {
    year: loaded[0]?.year ?? new Date().getFullYear(),
    discipline: filters.discipline,
    difficulty: filters.difficulty,
    answered: filters.answered,
    favorites: true,
  };

  return applyClientQuestionFilters(loaded, filterPayload);
}
