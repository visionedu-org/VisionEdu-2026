import type { EnemQuestion } from "@/types/enem";

export function buildQuestionKey(
  year: number,
  index: number,
  language?: string | null
): string {
  const lang = language?.trim() || "default";
  return `${year}:${index}:${lang}`;
}

export function questionKeyFromQuestion(question: EnemQuestion): string {
  return buildQuestionKey(question.year, question.index, question.language);
}
