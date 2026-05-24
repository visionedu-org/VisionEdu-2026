import { apiClient } from "@/lib/api-client";
import type {
  EnemExam,
  EnemQuestion,
  EnemQuestionsQuery,
  EnemQuestionsResponse,
} from "@/types/enem";

function buildQuestionsQuery(
  params: Pick<EnemQuestionsQuery, "limit" | "offset" | "language">
): string {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  if (params.language) search.set("language", params.language);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const enemQuestionsService = {
  listExams(): Promise<EnemExam[]> {
    return apiClient.get<EnemExam[]>("/api/v1/students/enem/exams");
  },

  listQuestions(params: EnemQuestionsQuery): Promise<EnemQuestionsResponse> {
    const { year, limit, offset, language } = params;
    return apiClient.get<EnemQuestionsResponse>(
      `/api/v1/students/enem/exams/${year}/questions${buildQuestionsQuery({
        limit,
        offset,
        language,
      })}`
    );
  },

  getQuestion(
    year: number,
    index: number,
    language?: string
  ): Promise<EnemQuestion> {
    const qs = language
      ? `?language=${encodeURIComponent(language)}`
      : "";
    return apiClient.get<EnemQuestion>(
      `/api/v1/students/enem/exams/${year}/questions/${index}${qs}`
    );
  },
};
