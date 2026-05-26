import { apiClient } from "@/lib/api-client";
import type {
  EnemAiResolutionRequestBody,
  EnemAiResolutionResponse,
} from "@/types/enem-ai-resolution";
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

  generateAiResolution(
    body: EnemAiResolutionRequestBody
  ): Promise<EnemAiResolutionResponse> {
    return apiClient.post<EnemAiResolutionResponse>(
      "/api/v1/students/enem/ai-resolution",
      body
    );
  },

  recordAttempt(body: {
    year: number;
    index: number;
    language?: string | null;
    selectedLetter: string;
  }): Promise<{ isCorrect: boolean; questionKey: string }> {
    return apiClient.post("/api/v1/students/enem/attempts", body);
  },

  syncAttempts(
    attempts: Array<{
      questionKey: string;
      year: number;
      index: number;
      language?: string | null;
      discipline?: string | null;
      selectedLetter: string;
      correctLetter: string;
      isCorrect: boolean;
      answeredAt?: string;
    }>
  ): Promise<{ synced: number }> {
    return apiClient.post("/api/v1/students/enem/attempts/sync", {
      attempts,
    });
  },
};
