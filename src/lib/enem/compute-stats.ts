import type {
  EnemProgressStats,
  EnemQuestionAnswerRecord,
} from "@/types/enem";

export function computeEnemStatsFromAnswers(
  records: EnemQuestionAnswerRecord[]
): EnemProgressStats {
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
