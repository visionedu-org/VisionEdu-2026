import { prisma } from "@/lib/prisma";
import { buildQuestionKey } from "@/lib/enem/question-key";
import { parseQuestionKey } from "@/lib/enem/parse-question-key";
import { getStudentContext } from "@/server/student/get-student-context";

export async function toggleEnemFavorite(
  studentUserId: string,
  params: {
    year: number;
    index: number;
    language?: string | null;
  }
): Promise<{ questionKey: string; isFavorite: boolean }> {
  const { studentId } = await getStudentContext(studentUserId);
  const questionKey = buildQuestionKey(
    params.year,
    params.index,
    params.language
  );

  const existing = await prisma.enemQuestionFavorite.findUnique({
    where: {
      studentId_questionKey: { studentId, questionKey },
    },
  });

  if (existing) {
    await prisma.enemQuestionFavorite.delete({
      where: { id: existing.id },
    });
    return { questionKey, isFavorite: false };
  }

  await prisma.enemQuestionFavorite.create({
    data: {
      studentId,
      questionKey,
      year: params.year,
      index: params.index,
      language: params.language ?? null,
    },
  });

  return { questionKey, isFavorite: true };
}

export async function syncEnemFavorites(
  studentUserId: string,
  questionKeys: string[]
): Promise<{ synced: number }> {
  const { studentId } = await getStudentContext(studentUserId);
  const uniqueKeys = [...new Set(questionKeys.filter(Boolean))];
  let synced = 0;

  for (const questionKey of uniqueKeys) {
    const parsed = parseQuestionKey(questionKey);
    if (!parsed) continue;
    const { year, index, language } = parsed;

    await prisma.enemQuestionFavorite.upsert({
      where: {
        studentId_questionKey: { studentId, questionKey },
      },
      create: {
        studentId,
        questionKey,
        year,
        index,
        language,
      },
      update: {},
    });
    synced += 1;
  }

  return { synced };
}
