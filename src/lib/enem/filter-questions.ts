import { KNOWLEDGE_AREA_DISCIPLINES } from "@/lib/enem/constants";
import { questionMatchesDisciplineFilter } from "@/lib/enem/discipline-index-ranges";
import { questionKeyFromQuestion } from "@/lib/enem/question-key";
import { getEnemProgress } from "@/lib/enem/storage";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";

function matchesSearch(question: EnemQuestion, q: string): boolean {
  const term = q.trim().toLowerCase();
  if (!term) return true;

  const parts = [
    question.title,
    question.context,
    question.alternativesIntroduction,
    ...question.alternatives.map((a) => a.text),
    ...question.skills,
  ];

  return parts.some((p) => p?.toLowerCase().includes(term));
}

export function applyClientQuestionFilters(
  questions: EnemQuestion[],
  filters: EnemQuestionFilters
): EnemQuestion[] {
  const progress = typeof window !== "undefined" ? getEnemProgress() : null;
  const answerKeys = progress ? new Set(Object.keys(progress.answers)) : new Set<string>();
  const favoriteKeys = progress ? new Set(progress.favorites) : new Set<string>();
  const reviewKeys = progress ? new Set(progress.review) : new Set<string>();

  return questions.filter((question) => {
    if (
      filters.discipline &&
      !questionMatchesDisciplineFilter(question, filters.discipline)
    ) {
      return false;
    }

    if (filters.knowledgeArea) {
      const allowed = KNOWLEDGE_AREA_DISCIPLINES[filters.knowledgeArea];
      if (question.discipline && !allowed.includes(question.discipline)) {
        return false;
      }
    }

    if (filters.difficulty && question.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.institution && question.institution !== filters.institution) {
      return false;
    }

    if (filters.hasImage && question.files.length === 0) {
      const hasAltImage = question.alternatives.some((a) => a.file);
      if (!hasAltImage) return false;
    }

    const key = questionKeyFromQuestion(question);
    const answered = answerKeys.has(key);

    if (filters.answered === "answered" && !answered) return false;
    if (filters.answered === "unanswered" && answered) return false;
    if (filters.answered === "favorites" && !favoriteKeys.has(key)) return false;

    if (filters.favorites && !favoriteKeys.has(key)) return false;
    if (filters.review && !reviewKeys.has(key)) return false;

    if (filters.q && !matchesSearch(question, filters.q)) return false;

    return true;
  });
}
