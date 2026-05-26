import {
  enemApiRequestQueue,
  isEnemRateLimitError,
} from "@/lib/enem/api-request-queue";
import { getEnemApiErrorMessage } from "@/lib/enem/enem-api-errors";
import { enemQuestionsService } from "@/services/enem-questions.service";
import type { EnemQuestion, EnemQuestionsQuery } from "@/types/enem";

export { isEnemRateLimitError };

/**
 * Lista questões com fila serial, cache em memória e retry em 429.
 */
export async function fetchEnemQuestionsList(
  params: EnemQuestionsQuery
): Promise<Awaited<ReturnType<typeof enemQuestionsService.listQuestions>>> {
  const { year, limit = 10, offset = 0, language } = params;

  const cached = enemApiRequestQueue.getCachedList(
    year,
    limit,
    offset,
    language
  );
  if (cached) return cached;

  const response = await enemApiRequestQueue.enqueue(() =>
    enemQuestionsService.listQuestions(params)
  );

  enemApiRequestQueue.setCachedList(year, limit, offset, language, response);
  return response;
}

/** Busca uma questão individual com fila, cache e retry em 429. */
export async function fetchEnemQuestion(
  year: number,
  index: number,
  language?: string
): Promise<EnemQuestion> {
  const cached = enemApiRequestQueue.getCachedQuestion(year, index, language);
  if (cached) return cached;

  const question = await enemApiRequestQueue.enqueue(() =>
    enemQuestionsService.getQuestion(year, index, language)
  );

  enemApiRequestQueue.setCachedQuestion(year, index, language, question);
  return question;
}

export function resolveEnemFetchErrorMessage(error: unknown): string {
  if (isEnemRateLimitError(error)) {
    return getEnemApiErrorMessage(error);
  }
  return error instanceof Error
    ? error.message
    : "Não foi possível carregar as questões.";
}
