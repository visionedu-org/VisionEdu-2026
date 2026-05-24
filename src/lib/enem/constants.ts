import type {
  EnemDiscipline,
  EnemDifficulty,
  EnemKnowledgeArea,
} from "@/types/enem";

export const ENEM_API_INSTITUTION = "enem" as const;

export const ENEM_DISCIPLINE_LABELS: Record<EnemDiscipline, string> = {
  "ciencias-humanas": "Ciências Humanas",
  "ciencias-natureza": "Ciências da Natureza",
  linguagens: "Linguagens",
  matematica: "Matemática",
};

export const ENEM_KNOWLEDGE_AREA_LABELS: Record<EnemKnowledgeArea, string> = {
  "linguagens-codigos": "Linguagens, Códigos e suas Tecnologias",
  "ciencias-humanas": "Ciências Humanas e suas Tecnologias",
  "ciencias-natureza": "Ciências da Natureza e suas Tecnologias",
  matematica: "Matemática e suas Tecnologias",
};

export const ENEM_DIFFICULTY_LABELS: Record<EnemDifficulty, string> = {
  facil: "Fácil",
  media: "Média",
  dificil: "Difícil",
};

export const ENEM_INSTITUTION_LABELS = {
  enem: "ENEM",
} as const;

export const DISCIPLINE_TO_KNOWLEDGE_AREA: Record<
  EnemDiscipline,
  EnemKnowledgeArea
> = {
  linguagens: "linguagens-codigos",
  "ciencias-humanas": "ciencias-humanas",
  "ciencias-natureza": "ciencias-natureza",
  matematica: "matematica",
};

export const KNOWLEDGE_AREA_DISCIPLINES: Record<
  EnemKnowledgeArea,
  EnemDiscipline[]
> = {
  "linguagens-codigos": ["linguagens"],
  "ciencias-humanas": ["ciencias-humanas"],
  "ciencias-natureza": ["ciencias-natureza"],
  matematica: ["matematica"],
};

export const DEFAULT_QUESTIONS_PAGE_SIZE = 10;

export const SEARCH_DEBOUNCE_MS = 300;
