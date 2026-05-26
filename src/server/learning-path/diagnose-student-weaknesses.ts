import { prisma } from "@/lib/prisma";
import type { EnemDiscipline } from "@/types/enem";
import type { StudentWeaknessArea } from "@/types/learning-path";

const DEFAULT_WEAKNESSES: StudentWeaknessArea[] = [
  {
    discipline: "matematica",
    skill: "Geometria",
    incorrectCount: 0,
    answeredCount: 0,
    accuracyPercent: 0,
  },
  {
    discipline: "linguagens",
    skill: "Interpretação de texto",
    incorrectCount: 0,
    answeredCount: 0,
    accuracyPercent: 0,
  },
];

function isEnemDiscipline(value: string | null): value is EnemDiscipline {
  return (
    value === "ciencias-humanas" ||
    value === "ciencias-natureza" ||
    value === "linguagens" ||
    value === "matematica"
  );
}

export async function diagnoseStudentWeaknesses(
  studentId: string
): Promise<StudentWeaknessArea[]> {
  const attempts = await prisma.enemQuestionAttempt.findMany({
    where: { studentId },
    orderBy: { answeredAt: "desc" },
    take: 500,
  });

  if (attempts.length === 0) {
    return DEFAULT_WEAKNESSES;
  }

  const groups = new Map<
    string,
    { discipline: EnemDiscipline | null; skill: string; correct: number; total: number }
  >();

  for (const attempt of attempts) {
    const skill = attempt.primarySkill?.trim() || "Competência geral ENEM";
    const discipline = isEnemDiscipline(attempt.discipline)
      ? attempt.discipline
      : null;
    const key = `${discipline ?? "geral"}::${skill}`;
    const entry = groups.get(key) ?? {
      discipline,
      skill,
      correct: 0,
      total: 0,
    };
    entry.total += 1;
    if (attempt.isCorrect) entry.correct += 1;
    groups.set(key, entry);
  }

  const weaknesses: StudentWeaknessArea[] = [];

  for (const entry of groups.values()) {
    const incorrectCount = entry.total - entry.correct;
    if (incorrectCount === 0) continue;

    const accuracyPercent =
      entry.total > 0
        ? Math.round((entry.correct / entry.total) * 100)
        : 0;

    weaknesses.push({
      discipline: entry.discipline,
      skill: entry.skill,
      incorrectCount,
      answeredCount: entry.total,
      accuracyPercent,
    });
  }

  weaknesses.sort((a, b) => {
    if (a.accuracyPercent !== b.accuracyPercent) {
      return a.accuracyPercent - b.accuracyPercent;
    }
    return b.incorrectCount - a.incorrectCount;
  });

  if (weaknesses.length === 0) {
    return DEFAULT_WEAKNESSES;
  }

  return weaknesses.slice(0, 6);
}
