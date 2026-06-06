import { prisma } from "@/lib/prisma";
import { ENEM_DISCIPLINE_LABELS } from "@/lib/enem/constants";
import type { StudentPerformanceData, DailyAccuracy, DisciplineBreakdown, SourceBreakdown, RecentAttempt, AttemptSource } from "@/types/performance";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { assertTeacherOwnsClass } from "@/server/materials/assert-teacher-class";

function buildDateRange(days?: number): Date | undefined {
  if (!days) return undefined;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildDailyMap(days: number): Map<string, { correct: number; total: number }> {
  const map = new Map<string, { correct: number; total: number }>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { correct: 0, total: 0 });
  }
  return map;
}

export class StudentNotInClassError extends Error {
  constructor() {
    super("Aluno não encontrado nesta turma.");
    this.name = "StudentNotInClassError";
  }
}

export async function getStudentPerformance(
  teacherUserId: string,
  classId: string,
  studentId: string,
  source?: AttemptSource,
  days?: number
): Promise<StudentPerformanceData> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) throw new TeacherProfileNotFoundError();

  await assertTeacherOwnsClass(teacher.id, classId);

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { id: true, classId: true, user: { select: { name: true } } },
  });

  if (!studentProfile || studentProfile.classId !== classId) {
    throw new StudentNotInClassError();
  }

  const answeredAfter = buildDateRange(days);
  const effectiveDays = days ?? 30;

  const attempts = await prisma.enemQuestionAttempt.findMany({
    where: {
      studentId,
      ...(source ? { source } : {}),
      ...(answeredAfter ? { answeredAt: { gte: answeredAfter } } : {}),
    },
    orderBy: { answeredAt: "desc" },
    select: {
      questionKey: true,
      year: true,
      index: true,
      discipline: true,
      isCorrect: true,
      selectedLetter: true,
      correctLetter: true,
      source: true,
      answeredAt: true,
    },
  });

  const totalAnswered = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const accuracyPercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const dailyMap = buildDailyMap(effectiveDays);
  for (const a of attempts) {
    const day = a.answeredAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(day);
    if (entry) {
      entry.total += 1;
      if (a.isCorrect) entry.correct += 1;
    }
  }

  const dailyAccuracy: DailyAccuracy[] = [];
  for (const [date, v] of dailyMap) {
    dailyAccuracy.push({
      date,
      correct: v.correct,
      total: v.total,
      accuracyPercent: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0,
    });
  }

  const discMap = new Map<string, { answered: number; correct: number }>();
  const srcMap = new Map<AttemptSource, { answered: number; correct: number }>();
  for (const a of attempts) {
    const discKey = a.discipline ?? "geral";
    const discEntry = discMap.get(discKey);
    if (discEntry) {
      discEntry.answered += 1;
      if (a.isCorrect) discEntry.correct += 1;
    } else {
      discMap.set(discKey, { answered: 1, correct: a.isCorrect ? 1 : 0 });
    }

    const srcKey = a.source as AttemptSource;
    const srcEntry = srcMap.get(srcKey);
    if (srcEntry) {
      srcEntry.answered += 1;
      if (a.isCorrect) srcEntry.correct += 1;
    } else {
      srcMap.set(srcKey, { answered: 1, correct: a.isCorrect ? 1 : 0 });
    }
  }

  const disciplineBreakdown: DisciplineBreakdown[] = [];
  for (const [disc, v] of discMap) {
    disciplineBreakdown.push({
      discipline: disc,
      label: ENEM_DISCIPLINE_LABELS[disc as keyof typeof ENEM_DISCIPLINE_LABELS] ?? disc,
      answered: v.answered,
      correct: v.correct,
      accuracyPercent: v.answered > 0 ? Math.round((v.correct / v.answered) * 100) : 0,
    });
  }

  const sourceBreakdown: SourceBreakdown[] = [];
  for (const [srcKey, v] of srcMap) {
    sourceBreakdown.push({
      source: srcKey,
      answered: v.answered,
      correct: v.correct,
      accuracyPercent: v.answered > 0 ? Math.round((v.correct / v.answered) * 100) : 0,
    });
  }

  const recentAttempts: RecentAttempt[] = attempts.map((a) => ({
    questionKey: a.questionKey,
    year: a.year,
    index: a.index,
    discipline: a.discipline,
    isCorrect: a.isCorrect,
    selectedLetter: a.selectedLetter,
    correctLetter: a.correctLetter,
    source: a.source as AttemptSource,
    answeredAt: a.answeredAt.toISOString(),
  }));

  return {
    studentId: studentProfile.id,
    studentName: studentProfile.user.name,
    totalAnswered,
    totalCorrect,
    accuracyPercent,
    dailyAccuracy,
    disciplineBreakdown,
    sourceBreakdown,
    recentAttempts,
  };
}
