"use client";

import {
  ENEM_DISCIPLINE_LABELS,
} from "@/lib/enem/constants";
import type { EnemProgressStats } from "@/types/enem";

interface EnemStatsPanelProps {
  stats: EnemProgressStats;
}

export function EnemStatsPanel({ stats }: EnemStatsPanelProps) {
  const disciplineEntries = Object.entries(stats.byDiscipline).sort(
    (a, b) => b[1].answered - a[1].answered
  );

  const maxDaily = Math.max(
    1,
    ...stats.dailyCorrect.map((d) => d.total)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Respondidas" value={stats.totalAnswered} />
        <StatCard label="Acertos" value={stats.totalCorrect} tone="success" />
        <StatCard label="Erros" value={stats.totalIncorrect} tone="error" />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Taxa de acerto geral</p>
        <p className="mt-1 text-3xl font-bold text-primary">
          {stats.accuracyPercent}%
        </p>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={stats.accuracyPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Percentual de acertos"
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${stats.accuracyPercent}%` }}
          />
        </div>
      </div>

      {disciplineEntries.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">Desempenho por matéria</h3>
          <ul className="mt-3 space-y-3">
            {disciplineEntries.map(([key, data]) => (
              <li key={key}>
                <div className="flex justify-between text-xs">
                  <span>
                    {ENEM_DISCIPLINE_LABELS[
                      key as keyof typeof ENEM_DISCIPLINE_LABELS
                    ] ?? key}
                  </span>
                  <span className="text-muted-foreground">
                    {data.correct}/{data.answered} ({data.accuracyPercent}%)
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary/80"
                    style={{ width: `${data.accuracyPercent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Evolução (14 dias)</h3>
        <div
          className="mt-4 flex h-24 items-end justify-between gap-1"
          aria-label="Gráfico de questões respondidas por dia"
        >
          {stats.dailyCorrect.map((day) => {
            const height = (day.total / maxDaily) * 100;
            const correctHeight =
              day.total > 0 ? (day.correct / day.total) * height : 0;
            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
                title={`${day.date}: ${day.correct}/${day.total} acertos`}
              >
                <div className="flex h-20 w-full items-end justify-center">
                  <div className="relative w-full max-w-4 rounded-t bg-muted">
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{ height: `${height}%`, minHeight: day.total ? 4 : 0 }}
                    />
                    {day.correct > 0 && (
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-emerald-500"
                        style={{
                          height: `${correctHeight}%`,
                          minHeight: 2,
                        }}
                      />
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {day.date.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "error";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600"
      : tone === "error"
        ? "text-destructive"
        : "text-foreground";

  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
