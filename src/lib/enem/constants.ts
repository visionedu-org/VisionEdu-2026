import type {
  EnemDiscipline,
  EnemDifficulty,
  EnemKnowledgeArea,
} from "@/types/enem";

export const ENEM_API_INSTITUTION = "enem" as const;

/** Limita imagens de enunciado/alternativas sem estourar o layout (mobile-first). */
export const ENEM_QUESTION_IMAGE_CLASSNAME =
  "mx-auto h-auto max-h-44 w-auto max-w-full object-contain sm:max-h-52 md:max-h-60";

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

export const MIN_QUESTIONS_PAGE_SIZE = 1;
export const MAX_QUESTIONS_PAGE_SIZE = 50;

/** Limita ao intervalo aceito pela API ENEM (1–50). */
export function clampQuestionsPageSize(size: number): number {
  const parsed = Number.isFinite(size) ? Math.round(size) : DEFAULT_QUESTIONS_PAGE_SIZE;
  return Math.min(
    MAX_QUESTIONS_PAGE_SIZE,
    Math.max(MIN_QUESTIONS_PAGE_SIZE, parsed)
  );
}

export const SEARCH_DEBOUNCE_MS = 300;

/** Intervalo mínimo entre requisições ENEM no cliente (fila serial). */
export const ENEM_API_MIN_REQUEST_INTERVAL_MS = 200;

/** TTL do cache em memória de listagens/questões ENEM. */
export const ENEM_API_CACHE_TTL_MS = 10 * 60 * 1000;

/** Tentativas após HTTP 429 antes de falhar. */
export const ENEM_API_429_MAX_RETRIES = 3;

/** Atraso base (ms) para backoff em 429. */
export const ENEM_API_429_BASE_DELAY_MS = 1000;

/** Máximo de chamadas à API por lote ao percorrer vários anos. */
export const ENEM_MAX_REQUESTS_PER_BATCH = 4;

/** Atraso entre páginas carregadas automaticamente com filtros ativos. */
export const ENEM_AUTO_LOAD_DELAY_MS = 500;

/** Páginas extras automáticas quando filtros reduzem o resultado. */
export const ENEM_MAX_AUTO_PAGES = 6;

/** Mínimo de questões filtradas antes de parar o carregamento automático. */
export const ENEM_MIN_FILTERED_RESULTS = 8;
