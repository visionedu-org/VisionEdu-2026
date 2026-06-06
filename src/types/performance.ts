export type AttemptSource = "practice" | "learning_path" | "material";

export interface DailyAccuracy {
  date: string;
  correct: number;
  total: number;
  accuracyPercent: number;
}

export interface DisciplineBreakdown {
  discipline: string;
  label: string;
  answered: number;
  correct: number;
  accuracyPercent: number;
}

export interface SourceBreakdown {
  source: AttemptSource;
  answered: number;
  correct: number;
  accuracyPercent: number;
}

export interface ClassPerformanceData {
  classLabel: string;
  studentCount: number;
  totalAnswered: number;
  averageAccuracy: number;
  dailyAccuracy: DailyAccuracy[];
  disciplineBreakdown: DisciplineBreakdown[];
  disciplines: string[];
}

export interface StudentPerformanceData {
  studentId: string;
  studentName: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracyPercent: number;
  dailyAccuracy: DailyAccuracy[];
  disciplineBreakdown: DisciplineBreakdown[];
  sourceBreakdown: SourceBreakdown[];
  recentAttempts: RecentAttempt[];
}

export interface RecentAttempt {
  questionKey: string;
  year: number;
  index: number;
  discipline: string | null;
  isCorrect: boolean;
  selectedLetter: string;
  correctLetter: string;
  source: AttemptSource;
  answeredAt: string;
}
