import { prisma } from "@/lib/prisma";
import { buildQuestionKey } from "@/lib/enem/question-key";
import { enrichQuestion } from "@/lib/enem/question-metadata";
import { getStudentContext } from "@/server/student/get-student-context";
import { fetchEnemApi } from "@/server/enem/fetch-enem";
import type { EnemAlternativeLetter } from "@/types/enem";

export async function recordEnemAttempt(
  studentUserId: string,
  params: {
    year: number;
    index: number;
    language?: string | null;
    selectedLetter: EnemAlternativeLetter;
  }
): Promise<{ isCorrect: boolean; questionKey: string }> {
  const { studentId } = await getStudentContext(studentUserId);
  const query = params.language
    ? `?language=${encodeURIComponent(params.language)}`
    : "";

  const raw = await fetchEnemApi<Parameters<typeof enrichQuestion>[0]>(
    `/exams/${params.year}/questions/${params.index}${query}`,
    { revalidate: 3600 }
  );
  const question = enrichQuestion({ ...raw, year: params.year });
  const questionKey = buildQuestionKey(
    params.year,
    params.index,
    params.language
  );
  const isCorrect = params.selectedLetter === question.correctAlternative;

  await prisma.enemQuestionAttempt.upsert({
    where: {
      studentId_questionKey: { studentId, questionKey },
    },
    create: {
      studentId,
      questionKey,
      year: params.year,
      index: params.index,
      language: params.language ?? null,
      discipline: question.discipline,
      primarySkill: question.skills[0] ?? null,
      selectedLetter: params.selectedLetter,
      correctLetter: question.correctAlternative,
      isCorrect,
      answeredAt: new Date(),
    },
    update: {
      selectedLetter: params.selectedLetter,
      correctLetter: question.correctAlternative,
      isCorrect,
      discipline: question.discipline,
      primarySkill: question.skills[0] ?? null,
      answeredAt: new Date(),
    },
  });

  return { isCorrect, questionKey };
}
