import type { EnemDiscipline } from "@/types/enem";

/** Faixas típicas de número de questão por área no ENEM (prova padrão ~180 itens). */
export const ENEM_DISCIPLINE_INDEX_RANGES: Record<
  EnemDiscipline,
  { minIndex: number; maxIndex: number }
> = {
  linguagens: { minIndex: 1, maxIndex: 45 },
  "ciencias-humanas": { minIndex: 46, maxIndex: 90 },
  "ciencias-natureza": { minIndex: 91, maxIndex: 135 },
  matematica: { minIndex: 136, maxIndex: 180 },
};

/** Offset da listagem da API ENEM para começar perto da primeira questão da área. */
export function listOffsetForDiscipline(discipline: EnemDiscipline): number {
  const { minIndex } = ENEM_DISCIPLINE_INDEX_RANGES[discipline];
  return Math.max(0, minIndex - 1);
}

export function inferDisciplineFromIndex(
  index: number
): EnemDiscipline | null {
  for (const [discipline, range] of Object.entries(
    ENEM_DISCIPLINE_INDEX_RANGES
  ) as [EnemDiscipline, { minIndex: number; maxIndex: number }][]) {
    if (index >= range.minIndex && index <= range.maxIndex) {
      return discipline;
    }
  }
  return null;
}

export function resolveQuestionDiscipline(question: {
  index: number;
  discipline: EnemDiscipline | null;
}): EnemDiscipline | null {
  return question.discipline ?? inferDisciplineFromIndex(question.index);
}

export function questionMatchesDisciplineFilter(
  question: { index: number; discipline: EnemDiscipline | null },
  filterDiscipline: EnemDiscipline
): boolean {
  return resolveQuestionDiscipline(question) === filterDiscipline;
}
