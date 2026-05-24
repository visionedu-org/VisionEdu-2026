import { buildQuestionKey } from "@/lib/enem/question-key";
import type {
  EnemLocalProgress,
  EnemProgressStats,
  EnemQuestion,
  EnemQuestionAnswerRecord,
} from "@/types/enem";
import type { EnemAlternativeLetter } from "@/types/enem";

const STORAGE_KEY = "visionedu:enem-progress";

const EMPTY_PROGRESS: EnemLocalProgress = {
  version: 1,
  answers: {},
  favorites: [],
  review: [],
};

function readProgress(): EnemLocalProgress {
  if (typeof window === "undefined") return { ...EMPTY_PROGRESS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROGRESS };
    const parsed = JSON.parse(raw) as EnemLocalProgress;
    if (parsed.version !== 1) return { ...EMPTY_PROGRESS };
    return {
      version: 1,
      answers: parsed.answers ?? {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      review: Array.isArray(parsed.review) ? parsed.review : [],
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

function writeProgress(data: EnemLocalProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function getEnemProgress(): EnemLocalProgress {
  return readProgress();
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

  const progress = readProgress();
  progress.answers[key] = record;
  writeProgress(progress);
  return record;
}

export function toggleEnemFavorite(questionKey: string): boolean {
  const progress = readProgress();
  const set = new Set(progress.favorites);
  if (set.has(questionKey)) {
    set.delete(questionKey);
  } else {
    set.add(questionKey);
  }
  progress.favorites = [...set];
  writeProgress(progress);
  return set.has(questionKey);
}

export function toggleEnemReview(questionKey: string): boolean {
  const progress = readProgress();
  const set = new Set(progress.review);
  if (set.has(questionKey)) {
    set.delete(questionKey);
  } else {
    set.add(questionKey);
  }
  progress.review = [...set];
  writeProgress(progress);
  return set.has(questionKey);
}

export function isEnemFavorite(questionKey: string): boolean {
  return readProgress().favorites.includes(questionKey);
}

export function isEnemReview(questionKey: string): boolean {
  return readProgress().review.includes(questionKey);
}

export function getEnemAnswer(
  questionKey: string
): EnemQuestionAnswerRecord | undefined {
  return readProgress().answers[questionKey];
}

export function computeEnemStats(): EnemProgressStats {
  const { answers } = readProgress();
  const records = Object.values(answers);
  const totalAnswered = records.length;
  const totalCorrect = records.filter((r) => r.isCorrect).length;
  const totalIncorrect = totalAnswered - totalCorrect;
  const accuracyPercent =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const byDiscipline: EnemProgressStats["byDiscipline"] = {};
  for (const record of records) {
    const key = record.discipline ?? "geral";
    if (!byDiscipline[key]) {
      byDiscipline[key] = { answered: 0, correct: 0, accuracyPercent: 0 };
    }
    byDiscipline[key].answered += 1;
    if (record.isCorrect) byDiscipline[key].correct += 1;
  }
  for (const stat of Object.values(byDiscipline)) {
    stat.accuracyPercent =
      stat.answered > 0
        ? Math.round((stat.correct / stat.answered) * 100)
        : 0;
  }

  const recentAnswers = [...records]
    .sort(
      (a, b) =>
        new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime()
    )
    .slice(0, 20);

  const dailyMap = new Map<string, { correct: number; total: number }>();
  const now = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { correct: 0, total: 0 });
  }
  for (const record of records) {
    const day = record.answeredAt.slice(0, 10);
    if (!dailyMap.has(day)) continue;
    const entry = dailyMap.get(day)!;
    entry.total += 1;
    if (record.isCorrect) entry.correct += 1;
  }

  const dailyCorrect = [...dailyMap.entries()].map(([date, v]) => ({
    date,
    correct: v.correct,
    total: v.total,
  }));

  return {
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    accuracyPercent,
    byDiscipline,
    recentAnswers,
    dailyCorrect,
  };
}

export function subscribeEnemProgress(
  listener: () => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

/** Notifica listeners na mesma aba após mutação. */
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
  const storageUnsub = subscribeEnemProgress(handler);
  return () => {
    window.removeEventListener("visionedu:enem-progress", handler);
    storageUnsub();
  };
}
