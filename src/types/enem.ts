export type EnemDiscipline =
  | "ciencias-humanas"
  | "ciencias-natureza"
  | "linguagens"
  | "matematica";

export type EnemKnowledgeArea =
  | "linguagens-codigos"
  | "ciencias-humanas"
  | "ciencias-natureza"
  | "matematica";

export type EnemDifficulty = "facil" | "media" | "dificil";

export type EnemInstitution = "enem";

export type EnemAlternativeLetter = "A" | "B" | "C" | "D" | "E";

export interface EnemLabelValue {
  label: string;
  value: string;
}

export interface EnemExam {
  title: string;
  year: number;
  disciplines: EnemLabelValue[];
  languages: EnemLabelValue[];
}

export interface EnemAlternative {
  letter: EnemAlternativeLetter;
  text: string | null;
  file: string | null;
  isCorrect: boolean;
}

export interface EnemQuestion {
  title: string;
  index: number;
  discipline: EnemDiscipline | null;
  language: string | null;
  year: number;
  context: string | null;
  files: string[];
  correctAlternative: EnemAlternativeLetter;
  alternativesIntroduction: string | null;
  alternatives: EnemAlternative[];
  /** Metadados derivados localmente quando a API não fornece */
  difficulty: EnemDifficulty;
  knowledgeArea: EnemKnowledgeArea | null;
  skills: string[];
  institution: EnemInstitution;
}

export interface EnemQuestionsMetadata {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface EnemQuestionsResponse {
  metadata: EnemQuestionsMetadata;
  questions: EnemQuestion[];
}

export interface EnemQuestionFilters {
  /** Número do ano da prova ou `"all"` para todas as provas disponíveis. */
  year: number | "all";
  discipline?: EnemDiscipline | "";
  knowledgeArea?: EnemKnowledgeArea | "";
  difficulty?: EnemDifficulty | "";
  institution?: EnemInstitution | "";
  language?: string;
  hasImage?: boolean;
  answered?: "all" | "answered" | "unanswered" | "favorites";
  favorites?: boolean;
  review?: boolean;
  q?: string;
  /** Embaralha a lista após aplicar filtros (ordem estável até novo apply). */
  shuffle?: boolean;
}

export interface EnemQuestionsQuery {
  year: number;
  limit?: number;
  offset?: number;
  language?: string;
}

export interface EnemQuestionAnswerRecord {
  questionKey: string;
  year: number;
  index: number;
  selectedLetter: EnemAlternativeLetter;
  correctLetter: EnemAlternativeLetter;
  isCorrect: boolean;
  discipline: EnemDiscipline | null;
  answeredAt: string;
}

export interface EnemProgressStats {
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracyPercent: number;
  byDiscipline: Record<
    string,
    { answered: number; correct: number; accuracyPercent: number }
  >;
  recentAnswers: EnemQuestionAnswerRecord[];
  /** Últimos 14 dias: data ISO (yyyy-mm-dd) → acertos no dia */
  dailyCorrect: { date: string; correct: number; total: number }[];
}

export interface EnemLocalProgress {
  answers: Record<string, EnemQuestionAnswerRecord>;
  favorites: string[];
  review: string[];
  version: 1;
}
