import { applyClientQuestionFilters } from "@/lib/enem/filter-questions";
import { MAX_QUESTIONS_PAGE_SIZE } from "@/lib/enem/constants";
import { enemQuestionsService } from "@/services/enem-questions.service";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";

function questionDedupKey(question: EnemQuestion): string {
  return `${question.year}:${question.index}:${question.language ?? "default"}`;
}

export interface CollectQuestionsBatchState {
  offsets: Record<number, number>;
  hasMoreByYear: Record<number, boolean>;
  seenKeys: Set<string>;
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
  };
}

/**
 * Coleta exatamente até `batchSize` questões (após filtros client-side),
 * percorrendo os anos em rodízio até atingir o limite ou esgotar as provas.
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
  let rotationsWithoutProgress = 0;

  while (batch.length < batchSize && rotationsWithoutProgress < years.length) {
    let progressed = false;

    for (const year of years) {
      if (batch.length >= batchSize) break;
      if (state.hasMoreByYear[year] === false) continue;

      const remaining = batchSize - batch.length;
      const offset = state.offsets[year] ?? 0;

      const response = await enemQuestionsService.listQuestions({
        year,
        limit: Math.min(remaining, MAX_QUESTIONS_PAGE_SIZE),
        offset,
        language: clientFilters.language || undefined,
      });

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
        progressed = true;
        if (batch.length >= batchSize) break;
      }

      if (response.questions.length === 0 && !response.metadata.hasMore) {
        state.hasMoreByYear[year] = false;
      }
    }

    if (!progressed) break;
    rotationsWithoutProgress += 1;
  }

  const hasMore = years.some((year) => state.hasMoreByYear[year] !== false);

  return { questions: batch, hasMore };
}
