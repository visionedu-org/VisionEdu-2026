import { buildQuestionKey } from "@/lib/enem/question-key";
import type { EnemAiResolutionN8nPayload } from "@/types/enem-ai-resolution";
import type {
  EnemAlternativeLetter,
  EnemQuestion,
} from "@/types/enem";

export function buildEnemAiResolutionPayload(
  question: EnemQuestion,
  selectedLetter: EnemAlternativeLetter
): EnemAiResolutionN8nPayload {
  return {
    questionKey: buildQuestionKey(
      question.year,
      question.index,
      question.language
    ),
    year: question.year,
    index: question.index,
    title: question.title,
    discipline: question.discipline,
    context: question.context,
    alternativesIntroduction: question.alternativesIntroduction,
    alternatives: question.alternatives.map((alt) => ({
      letter: alt.letter,
      text: alt.text,
      isCorrect: alt.isCorrect,
    })),
    correctLetter: question.correctAlternative,
    selectedLetter,
    language: question.language,
  };
}
