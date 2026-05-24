import { DISCIPLINE_TO_KNOWLEDGE_AREA } from "@/lib/enem/constants";
import type {
  EnemAlternativeLetter,
  EnemDifficulty,
  EnemDiscipline,
  EnemKnowledgeArea,
  EnemQuestion,
} from "@/types/enem";

const SKILL_BY_DISCIPLINE: Record<EnemDiscipline, string[]> = {
  linguagens: [
    "Interpretação de texto",
    "Literatura",
    "Gramática e linguagem",
    "Produção textual",
  ],
  "ciencias-humanas": [
    "História",
    "Geografia",
    "Filosofia e sociologia",
    "Atualidades",
  ],
  "ciencias-natureza": [
    "Biologia",
    "Física",
    "Química",
    "Ciências da natureza",
  ],
  matematica: [
    "Álgebra",
    "Geometria",
    "Estatística e probabilidade",
    "Raciocínio lógico",
  ],
};

/** Heurística estável — a API não expõe dificuldade. */
export function deriveDifficulty(
  index: number,
  discipline: EnemDiscipline | null
): EnemDifficulty {
  const base = index % 3;
  if (discipline === "matematica" && index > 120) {
    return base === 0 ? "media" : "dificil";
  }
  if (base === 0) return "facil";
  if (base === 1) return "media";
  return "dificil";
}

export function deriveSkills(
  discipline: EnemDiscipline | null,
  index: number
): string[] {
  if (!discipline) return ["Competência geral ENEM"];
  const pool = SKILL_BY_DISCIPLINE[discipline];
  const primary = pool[index % pool.length];
  const secondary = pool[(index + 1) % pool.length];
  return primary === secondary ? [primary] : [primary, secondary];
}

export function deriveKnowledgeArea(
  discipline: EnemDiscipline | null
): EnemKnowledgeArea | null {
  if (!discipline) return null;
  return DISCIPLINE_TO_KNOWLEDGE_AREA[discipline];
}

interface RawEnemQuestion {
  title: string;
  index: number;
  discipline: string | null;
  language: string | null;
  year: number;
  context: string | null;
  files?: string[] | null;
  correctAlternative: EnemAlternativeLetter;
  alternativesIntroduction: string | null;
  alternatives: Array<{
    letter: EnemAlternativeLetter;
    text: string | null;
    file: string | null;
    isCorrect: boolean;
  }>;
}

export function enrichQuestion(raw: RawEnemQuestion): EnemQuestion {
  const discipline = isEnemDiscipline(raw.discipline)
    ? raw.discipline
    : null;

  return {
    title: raw.title ?? `Questão ${raw.index}`,
    index: raw.index,
    discipline,
    language: raw.language ?? null,
    year: raw.year,
    context: raw.context ?? null,
    files: Array.isArray(raw.files) ? raw.files.filter(Boolean) : [],
    correctAlternative: raw.correctAlternative,
    alternativesIntroduction: raw.alternativesIntroduction ?? null,
    alternatives: (raw.alternatives ?? []).map((alt) => ({
      letter: alt.letter,
      text: alt.text ?? null,
      file: alt.file ?? null,
      isCorrect: Boolean(alt.isCorrect),
    })),
    difficulty: deriveDifficulty(raw.index, discipline),
    knowledgeArea: deriveKnowledgeArea(discipline),
    skills: deriveSkills(discipline, raw.index),
    institution: "enem",
  };
}

function isEnemDiscipline(value: string | null): value is EnemDiscipline {
  return (
    value === "ciencias-humanas" ||
    value === "ciencias-natureza" ||
    value === "linguagens" ||
    value === "matematica"
  );
}
