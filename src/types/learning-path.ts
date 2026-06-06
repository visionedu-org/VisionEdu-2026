import type { EnemAlternativeLetter, EnemDiscipline } from "@/types/enem";

export interface StudentWeaknessArea {
  discipline: EnemDiscipline | null;
  skill: string;
  incorrectCount: number;
  answeredCount: number;
  accuracyPercent: number;
}

export interface LearningPathCandidateQuestion {
  questionKey: string;
  year: number;
  index: number;
  language: string | null;
  discipline: EnemDiscipline | null;
  skills: string[];
  title: string;
  context: string | null;
}

/** Payload enviado ao webhook n8n para gerar a trilha. */
export interface LearningPathN8nPayload {
  studentId: string;
  pathTitleHint: string;
  weaknesses: StudentWeaknessArea[];
  candidates: LearningPathCandidateQuestion[];
}

export interface LearningPathN8nStep {
  title: string;
  description?: string;
  questionKey: string;
  discipline?: string | null;
  skill?: string | null;
  videoSearchQuery?: string;
}

/** Resposta esperada do webhook n8n. */
export interface LearningPathN8nResponse {
  pathTitle: string;
  summary?: string;
  steps: LearningPathN8nStep[];
  videoSearchQuery?: string;
}

export interface LearningPathStepSubmitBody {
  selectedLetter: EnemAlternativeLetter;
}

export interface LearningPathStepSubmitResult {
  isCorrect: boolean;
  status: "completed" | "in_progress";
  nextStepUnlocked: boolean;
}
