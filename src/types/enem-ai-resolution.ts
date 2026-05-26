import type { EnemAlternativeLetter } from "@/types/enem";

/** Payload enviado ao webhook n8n. */
export interface EnemAiResolutionN8nPayload {
  questionKey: string;
  year: number;
  index: number;
  title: string;
  discipline: string | null;
  context: string | null;
  alternativesIntroduction: string | null;
  alternatives: {
    letter: EnemAlternativeLetter;
    text: string | null;
    isCorrect: boolean;
  }[];
  correctLetter: EnemAlternativeLetter;
  selectedLetter: EnemAlternativeLetter;
  language: string | null;
}

/** Resposta esperada do webhook n8n. */
export interface EnemAiResolutionResponse {
  explanation: string;
}

export interface EnemAiResolutionRequestBody {
  year: number;
  index: number;
  language?: string | null;
  selectedLetter: EnemAlternativeLetter;
}
