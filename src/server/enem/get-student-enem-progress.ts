import { prisma } from "@/lib/prisma";
import { getStudentContext } from "@/server/student/get-student-context";
import type { EnemLocalProgress, EnemProgressStats } from "@/types/enem";
import {
  attemptRowToAnswerRecord,
  computeEnemStatsFromAnswers,
} from "./compute-enem-stats";

export interface StudentEnemProgressPayload {
  progress: EnemLocalProgress;
  stats: EnemProgressStats;
}

export async function getStudentEnemProgress(
  studentUserId: string
): Promise<StudentEnemProgressPayload> {
  const { studentId } = await getStudentContext(studentUserId);

  const [attempts, favorites] = await Promise.all([
    prisma.enemQuestionAttempt.findMany({
      where: { studentId },
      orderBy: { answeredAt: "desc" },
    }),
    prisma.enemQuestionFavorite.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      select: { questionKey: true },
    }),
  ]);

  const answers: EnemLocalProgress["answers"] = {};
  const answerRecords = attempts.map((row) => {
    const record = attemptRowToAnswerRecord(row);
    answers[record.questionKey] = record;
    return record;
  });

  const progress: EnemLocalProgress = {
    version: 1,
    answers,
    favorites: favorites.map((f) => f.questionKey),
    review: [],
  };

  return {
    progress,
    stats: computeEnemStatsFromAnswers(answerRecords),
  };
}
