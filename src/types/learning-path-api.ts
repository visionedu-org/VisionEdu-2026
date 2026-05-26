import type { LearningPathModuleStatus } from "@/types/domain";
import type { EnemQuestion } from "@/types/enem";
import type { LearningPathStepSubmitResult } from "@/types/learning-path";

export interface LearningPathStepSummary {
  id: string;
  pathId: string;
  pathTitle: string;
  orderIndex: number;
  title: string;
  description: string | null;
  status: LearningPathModuleStatus;
  skill: string | null;
  discipline: string | null;
}

export interface LearningPathStepDetailResponse {
  step: LearningPathStepSummary;
  question: EnemQuestion;
}

export type { LearningPathStepSubmitResult };
