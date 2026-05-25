import { applyClientQuestionFilters } from "@/lib/enem/filter-questions";
import { parseQuestionKey } from "@/lib/enem/parse-question-key";
import { enemQuestionsService } from "@/services/enem-questions.service";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";

const FETCH_CONCURRENCY = 5;

async function fetchInBatches<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(chunk.map(mapper));
    results.push(...chunkResults);
  }
  return results;
}

/** Carrega questões favoritas pela chave persistida em localStorage. */
export async function loadFavoriteQuestions(
  favoriteKeys: string[],
  filters?: Pick<
    EnemQuestionFilters,
    "discipline" | "difficulty" | "answered"
  >
): Promise<EnemQuestion[]> {
  const parsed = favoriteKeys
    .map((key) => ({ key, parsed: parseQuestionKey(key) }))
    .filter((entry): entry is { key: string; parsed: NonNullable<typeof entry.parsed> } =>
      Boolean(entry.parsed)
    );

  if (parsed.length === 0) return [];

  const loaded = await fetchInBatches(
    parsed,
    async ({ parsed: p }) =>
      enemQuestionsService.getQuestion(p.year, p.index, p.language),
    FETCH_CONCURRENCY
  );

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
