import { MAX_QUESTIONS_PAGE_SIZE } from "@/lib/enem/constants";
import { buildQuestionKey } from "@/lib/enem/question-key";
import { enrichQuestion } from "@/lib/enem/question-metadata";
import { fetchEnemApi } from "@/server/enem/fetch-enem";
import type { EnemDiscipline, EnemExam, EnemQuestion } from "@/types/enem";
import type {
  LearningPathCandidateQuestion,
  StudentWeaknessArea,
} from "@/types/learning-path";

interface RawQuestionsPayload {
  metadata: { hasMore: boolean };
  questions: Parameters<typeof enrichQuestion>[0][];
}

const CANDIDATES_PER_WEAKNESS = 8;
const MAX_TOTAL_CANDIDATES = 40;

function questionMatchesWeakness(
  question: EnemQuestion,
  weakness: StudentWeaknessArea
): boolean {
  if (weakness.discipline && question.discipline !== weakness.discipline) {
    return false;
  }

  const skillLower = weakness.skill.toLowerCase();
  return question.skills.some((s) => s.toLowerCase().includes(skillLower));
}

async function fetchRecentExamYears(): Promise<number[]> {
  const exams = await fetchEnemApi<EnemExam[]>("/exams", {
    revalidate: 86_400,
  });
  return [...exams]
    .map((e) => e.year)
    .sort((a, b) => b - a)
    .slice(0, 3);
}

async function fetchQuestionsPage(
  year: number,
  offset: number
): Promise<EnemQuestion[]> {
  const raw = await fetchEnemApi<RawQuestionsPayload>(
    `/exams/${year}/questions?limit=${MAX_QUESTIONS_PAGE_SIZE}&offset=${offset}`,
    { revalidate: 3600 }
  );

  return (raw.questions ?? []).map((q) => enrichQuestion({ ...q, year }));
}

function toCandidate(question: EnemQuestion): LearningPathCandidateQuestion {
  return {
    questionKey: buildQuestionKey(
      question.year,
      question.index,
      question.language
    ),
    year: question.year,
    index: question.index,
    language: question.language,
    discipline: question.discipline,
    skills: question.skills,
    title: question.title,
    context: question.context,
  };
}

export async function collectCandidateQuestionsForWeaknesses(
  weaknesses: StudentWeaknessArea[],
  excludeQuestionKeys: Set<string>
): Promise<LearningPathCandidateQuestion[]> {
  const years = await fetchRecentExamYears();
  if (years.length === 0) return [];

  const candidates: LearningPathCandidateQuestion[] = [];
  const seen = new Set<string>(excludeQuestionKeys);

  for (const weakness of weaknesses) {
    let collectedForWeakness = 0;

    for (const year of years) {
      if (collectedForWeakness >= CANDIDATES_PER_WEAKNESS) break;
      if (candidates.length >= MAX_TOTAL_CANDIDATES) break;

      let offset = 0;
      let hasMore = true;

      while (
        hasMore &&
        collectedForWeakness < CANDIDATES_PER_WEAKNESS &&
        candidates.length < MAX_TOTAL_CANDIDATES
      ) {
        const questions = await fetchQuestionsPage(year, offset);
        if (questions.length === 0) {
          hasMore = false;
          break;
        }

        for (const question of questions) {
          if (!questionMatchesWeakness(question, weakness)) continue;

          const key = buildQuestionKey(
            question.year,
            question.index,
            question.language
          );
          if (seen.has(key)) continue;

          seen.add(key);
          candidates.push(toCandidate(question));
          collectedForWeakness += 1;

          if (
            collectedForWeakness >= CANDIDATES_PER_WEAKNESS ||
            candidates.length >= MAX_TOTAL_CANDIDATES
          ) {
            break;
          }
        }

        offset += questions.length;
        hasMore = questions.length >= MAX_QUESTIONS_PAGE_SIZE;
      }
    }
  }

  return candidates;
}
