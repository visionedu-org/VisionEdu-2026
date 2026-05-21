import type { BnccGapRow } from "@/types/domain";

/** Master BNCC EM13 competencies — mastery varies per class slug */
export const masterCompetencies: Omit<BnccGapRow, "masteryPercent">[] = [
  {
    code: "EM13MAT302",
    description: "Construir modelos matemáticos para resolver problemas",
    difficulty: "high",
  },
  {
    code: "EM13MAT303",
    description: "Interpretar e analisar gráficos de funções",
    difficulty: "medium",
  },
  {
    code: "EM13MAT304",
    description: "Aplicar conceitos de estatística em dados reais",
    difficulty: "medium",
  },
  {
    code: "EM13MAT305",
    description: "Resolver sistemas lineares com duas variáveis",
    difficulty: "high",
  },
  {
    code: "EM13MAT306",
    description: "Utilizar progressões aritméticas e geométricas",
    difficulty: "low",
  },
  {
    code: "EM13MAT307",
    description: "Calcular áreas e volumes em contextos geométricos",
    difficulty: "medium",
  },
  {
    code: "EM13MAT308",
    description: "Relacionar grandezas por razão e proporção",
    difficulty: "low",
  },
  {
    code: "EM13MAT309",
    description: "Representar dados em tabelas e gráficos",
    difficulty: "low",
  },
];

export const BNCC_COMPETENCY_CODES = masterCompetencies.map((c) => c.code) as [
  string,
  ...string[],
];

/** Per-class mastery offsets so reports differ between turmas */
const masteryByClass: Record<string, number[]> = {
  "2-A": [28, 35, 52, 41, 68, 55, 72, 61],
  "2-B": [22, 48, 39, 33, 74, 46, 58, 67],
};

export function getBnccGapsForClass(classId: string): BnccGapRow[] {
  const offsets = masteryByClass[classId] ?? masteryByClass["2-A"];
  return masterCompetencies.map((row, i) => ({
    ...row,
    masteryPercent: offsets[i] ?? 50,
  }));
}
