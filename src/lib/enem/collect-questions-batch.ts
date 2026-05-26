import { applyClientQuestionFilters } from "@/lib/enem/filter-questions";
import {
  ENEM_MAX_REQUESTS_PER_BATCH,
  MAX_QUESTIONS_PAGE_SIZE,
} from "@/lib/enem/constants";
import { fetchEnemQuestionsList } from "@/lib/enem/enem-question-api";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";

function questionDedupKey(question: EnemQuestion): string {
  return `${question.year}:${question.index}:${question.language ?? "default"}`;
}

export interface CollectQuestionsBatchState {
  offsets: Record<number, number>;
  hasMoreByYear: Record<number, boolean>;
  seenKeys: Set<string>;
  /** Índice de rodízio para distribuir requisições entre os anos. */
  yearCursor: number;
}

export function createCollectQuestionsBatchState(
  years: number[]
): CollectQuestionsBatchState {
  const hasMoreByYear: Record<number, boolean> = {};
  for (const year of years) {
    hasMoreByYear[year] = true;
  }
  return {
    offsets: {},
    hasMoreByYear,
    seenKeys: new Set(),
    yearCursor: 0,
  };
}

function yearsWithMoreData(
  years: number[],
  state: CollectQuestionsBatchState
): number[] {
  return years.filter((year) => state.hasMoreByYear[year] !== false);
}

/**
 * Coleta até `batchSize` questões (após filtros client-side), fazendo no máximo
 * {@link ENEM_MAX_REQUESTS_PER_BATCH} chamadas à API por invocação e percorrendo
 * os anos em rodízio (uma requisição por vez).
 */
export async function collectQuestionsBatch(
  years: number[],
  batchSize: number,
  clientFilters: EnemQuestionFilters,
  state: CollectQuestionsBatchState
): Promise<{ questions: EnemQuestion[]; hasMore: boolean }> {
  if (years.length === 0 || batchSize <= 0) {
    return { questions: [], hasMore: false };
  }

  const filterBase: EnemQuestionFilters = {
    year: years[0],
    discipline: clientFilters.discipline,
    difficulty: clientFilters.difficulty,
    answered: clientFilters.answered,
    favorites: clientFilters.favorites,
    language: clientFilters.language,
  };

  const batch: EnemQuestion[] = [];
  let apiCalls = 0;

  while (
    batch.length < batchSize &&
    apiCalls < ENEM_MAX_REQUESTS_PER_BATCH
  ) {
    const activeYears = yearsWithMoreData(years, state);
    if (activeYears.length === 0) break;

    const yearIndex = state.yearCursor % activeYears.length;
    const year = activeYears[yearIndex];
    state.yearCursor = (yearIndex + 1) % activeYears.length;

    const remaining = batchSize - batch.length;
    const offset = state.offsets[year] ?? 0;

    const response = await fetchEnemQuestionsList({
      year,
      limit: Math.min(remaining, MAX_QUESTIONS_PAGE_SIZE),
      offset,
      language: clientFilters.language || undefined,
    });

    apiCalls += 1;
    state.offsets[year] = offset + response.questions.length;
    state.hasMoreByYear[year] = response.metadata.hasMore;

    const filtered = applyClientQuestionFilters(
      response.questions,
      filterBase
    );

    for (const question of filtered) {
      const key = questionDedupKey(question);
      if (state.seenKeys.has(key)) continue;
      state.seenKeys.add(key);
      batch.push(question);
      if (batch.length >= batchSize) break;
    }

    if (response.questions.length === 0 && !response.metadata.hasMore) {
      state.hasMoreByYear[year] = false;
    }
  }

  const hasMore = years.some((y) => state.hasMoreByYear[y] !== false);

  return { questions: batch, hasMore };
}
