import { buildQuestionKey } from "@/lib/enem/question-key";
import { computeEnemStatsFromAnswers } from "@/lib/enem/compute-stats";
import type {
  EnemLocalProgress,
  EnemProgressStats,
  EnemQuestion,
  EnemQuestionAnswerRecord,
} from "@/types/enem";
import type { EnemAlternativeLetter } from "@/types/enem";

const LEGACY_STORAGE_KEY = "visionedu:enem-progress";
const MIGRATION_FLAG_KEY = "visionedu:enem-progress-migrated";

const EMPTY_PROGRESS: EnemLocalProgress = {
  version: 1,
  answers: {},
  favorites: [],
  review: [],
};

let progressCache: EnemLocalProgress | null = null;
let hydrated = false;

function readLegacyProgress(): EnemLocalProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EnemLocalProgress;
    if (parsed.version !== 1) return null;
    return {
      version: 1,
      answers: parsed.answers ?? {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      review: Array.isArray(parsed.review) ? parsed.review : [],
    };
  } catch {
    return null;
  }
}

function persistReviewOnly(review: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const legacy = readLegacyProgress();
    const next = {
      version: 1 as const,
      answers: {},
      favorites: [],
      review,
    };
    window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next));
    if (legacy?.answers && Object.keys(legacy.answers).length > 0) {
      /* answers/favorites removidos após migração; review permanece local */
    }
  } catch {
    /* quota */
  }
}

export function isEnemProgressHydrated(): boolean {
  return hydrated;
}

export function hydrateEnemProgress(data: EnemLocalProgress): void {
  const legacy = readLegacyProgress();
  progressCache = {
    version: 1,
    answers: data.answers,
    favorites: data.favorites,
    review: legacy?.review?.length ? legacy.review : data.review,
  };
  hydrated = true;
  if (legacy?.review?.length) {
    persistReviewOnly(legacy.review);
  }
}

export function clearEnemProgressHydration(): void {
  progressCache = null;
  hydrated = false;
}

function getCache(): EnemLocalProgress {
  if (progressCache) return progressCache;
  const legacy = readLegacyProgress();
  if (legacy) {
    return {
      version: 1,
      answers: legacy.answers,
      favorites: legacy.favorites,
      review: legacy.review,
    };
  }
  return { ...EMPTY_PROGRESS };
}

function writeCache(data: EnemLocalProgress): void {
  progressCache = data;
  if (data.review.length > 0) {
    persistReviewOnly(data.review);
  }
}

export function getEnemProgress(): EnemLocalProgress {
  return getCache();
}

export function hasLegacyEnemProgress(): boolean {
  if (typeof window === "undefined") return false;
  if (window.localStorage.getItem(MIGRATION_FLAG_KEY) === "1") return false;
  const legacy = readLegacyProgress();
  if (!legacy) return false;
  return (
    Object.keys(legacy.answers).length > 0 || legacy.favorites.length > 0
  );
}

export function markEnemProgressMigrated(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MIGRATION_FLAG_KEY, "1");
    const review = getCache().review;
    persistReviewOnly(review);
  } catch {
    /* ignore */
  }
}

export function recordEnemAnswer(
  question: EnemQuestion,
  selectedLetter: EnemAlternativeLetter
): EnemQuestionAnswerRecord {
  const key = buildQuestionKey(question.year, question.index, question.language);
  const record: EnemQuestionAnswerRecord = {
    questionKey: key,
    year: question.year,
    index: question.index,
    selectedLetter,
    correctLetter: question.correctAlternative,
    isCorrect: selectedLetter === question.correctAlternative,
    discipline: question.discipline,
    answeredAt: new Date().toISOString(),
  };

  const progress = getCache();
  progress.answers[key] = record;
  writeCache(progress);
  return record;
}

export function applyEnemAnswerRecord(record: EnemQuestionAnswerRecord): void {
  const progress = getCache();
  progress.answers[record.questionKey] = record;
  writeCache(progress);
}

export function setEnemFavorite(questionKey: string, isFavorite: boolean): void {
  const progress = getCache();
  const set = new Set(progress.favorites);
  if (isFavorite) {
    set.add(questionKey);
  } else {
    set.delete(questionKey);
  }
  progress.favorites = [...set];
  writeCache(progress);
}

export function toggleEnemFavorite(questionKey: string): boolean {
  const progress = getCache();
  const set = new Set(progress.favorites);
  if (set.has(questionKey)) {
    set.delete(questionKey);
  } else {
    set.add(questionKey);
  }
  progress.favorites = [...set];
  writeCache(progress);
  return set.has(questionKey);
}

export function toggleEnemReview(questionKey: string): boolean {
  const progress = getCache();
  const set = new Set(progress.review);
  if (set.has(questionKey)) {
    set.delete(questionKey);
  } else {
    set.add(questionKey);
  }
  progress.review = [...set];
  writeCache(progress);
  return set.has(questionKey);
}

export function isEnemFavorite(questionKey: string): boolean {
  return getCache().favorites.includes(questionKey);
}

export function isEnemReview(questionKey: string): boolean {
  return getCache().review.includes(questionKey);
}

export function getEnemAnswer(
  questionKey: string
): EnemQuestionAnswerRecord | undefined {
  return getCache().answers[questionKey];
}

export function computeEnemStats(): EnemProgressStats {
  const { answers } = getCache();
  return computeEnemStatsFromAnswers(Object.values(answers));
}

export function subscribeEnemProgress(
  _listener: () => void
): () => void {
  if (typeof window === "undefined") return () => undefined;
  return () => undefined;
}

export function notifyEnemProgressChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("visionedu:enem-progress"));
}

export function subscribeEnemProgressLocal(
  listener: () => void
): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => listener();
  window.addEventListener("visionedu:enem-progress", handler);
  return () => window.removeEventListener("visionedu:enem-progress", handler);
}
