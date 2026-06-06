import { prisma } from "@/lib/prisma";
import { ENEM_DISCIPLINE_LABELS } from "@/lib/enem/constants";
import { enemDisciplinesForTeacherSubject } from "@/lib/enem/teacher-discipline-map";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { assertTeacherOwnsClass } from "@/server/materials/assert-teacher-class";
import type { ClassPerformanceData, DailyAccuracy, DisciplineBreakdown } from "@/types/performance";

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

export async function getClassPerformance(
  teacherUserId: string,
  classId: string,
  days?: number,
  discipline?: string
): Promise<ClassPerformanceData> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });

  if (!teacher) throw new TeacherProfileNotFoundError();

  await assertTeacherOwnsClass(teacher.id, classId);

  const teacherMaterias = await prisma.teacherClassMateria.findMany({
    where: { teacherId: teacher.id, classId },
    select: { materia: true },
  });

  const enemDisciplineSet = new Set<string>();
  for (const m of teacherMaterias) {
    const mapped = enemDisciplinesForTeacherSubject(m.materia as Parameters<typeof enemDisciplinesForTeacherSubject>[0]);
    if (mapped) {
      mapped.forEach((d) => enemDisciplineSet.add(d));
    }
  }
  const disciplines = Array.from(enemDisciplineSet);

  const students = await prisma.studentProfile.findMany({
    where: { classId },
    select: { id: true },
  });

  const studentIds = students.map((s) => s.id);
  const studentCount = studentIds.length;

  if (studentCount === 0) {
    return {
      classLabel: "",
      studentCount: 0,
      totalAnswered: 0,
      averageAccuracy: 0,
      dailyAccuracy: [],
      disciplineBreakdown: [],
      disciplines,
    };
  }

  const answeredAfter = buildDateRange(days);
  const effectiveDays = days ?? 30;

  const whereDiscipline = discipline ? { equals: discipline } : undefined;

  const attempts = await prisma.enemQuestionAttempt.findMany({
    where: {
      studentId: { in: studentIds },
      ...(answeredAfter ? { answeredAt: { gte: answeredAfter } } : {}),
      ...(discipline ? { discipline: whereDiscipline } : {}),
    },
    select: {
      isCorrect: true,
      discipline: true,
      answeredAt: true,
    },
  });

  const totalAnswered = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const averageAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

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
  for (const a of attempts) {
    const key = a.discipline ?? "geral";
    const entry = discMap.get(key);
    if (entry) {
      entry.answered += 1;
      if (a.isCorrect) entry.correct += 1;
    } else {
      discMap.set(key, { answered: 1, correct: a.isCorrect ? 1 : 0 });
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

  const classGroup = await prisma.classGroup.findUnique({
    where: { id: classId },
    select: { label: true },
  });

  return {
    classLabel: classGroup?.label ?? "",
    studentCount,
    totalAnswered,
    averageAccuracy,
    dailyAccuracy,
    disciplineBreakdown,
    disciplines,
  };
}
