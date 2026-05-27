import type { EnemQuestionAnswerRecord } from "@/types/enem";
import type { EnemDiscipline } from "@/types/enem";
import { computeEnemStatsFromAnswers } from "@/lib/enem/compute-stats";

export { computeEnemStatsFromAnswers };

export function attemptRowToAnswerRecord(row: {
  questionKey: string;
  year: number;
  index: number;
  selectedLetter: string;
  correctLetter: string;
  isCorrect: boolean;
  discipline: string | null;
  answeredAt: Date;
}): EnemQuestionAnswerRecord {
  return {
    questionKey: row.questionKey,
    year: row.year,
    index: row.index,
    selectedLetter: row.selectedLetter as EnemQuestionAnswerRecord["selectedLetter"],
    correctLetter: row.correctLetter as EnemQuestionAnswerRecord["correctLetter"],
    isCorrect: row.isCorrect,
    discipline: row.discipline as EnemDiscipline | null,
    answeredAt: row.answeredAt.toISOString(),
  };
}
