"use client";

import { useEffect, useState } from "react";
import { teacherService } from "@/services/teacher.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassPerformanceData } from "@/types/performance";
import { ENEM_DISCIPLINE_LABELS } from "@/lib/enem/constants";

interface ClassPerformanceChartProps {
  classId: string;
}

type DaysFilter = 7 | 30;

export function ClassPerformanceChart({ classId }: ClassPerformanceChartProps) {
  const [data, setData] = useState<ClassPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<DaysFilter>(30);
  const [discipline, setDiscipline] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await teacherService.getClassPerformance(classId, {
          days,
          ...(discipline ? { discipline } : {}),
        });
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setError("Não foi possível carregar o desempenho da turma.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [classId, days, discipline]);

  const chartData = data?.dailyAccuracy
    ? data.dailyAccuracy
      .filter((d) => d.total > 0)
      .map((d) => ({
        date: d.date.slice(5),
        accuracy: d.accuracyPercent,
        answered: d.total,
      }))
    : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Desempenho da turma</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex-1">
          <CardTitle>Desempenho da turma</CardTitle>
          <CardDescription>
            {data.totalAnswered > 0
              ? `${data.averageAccuracy}% de acertos — ${data.totalAnswered} questões respondidas`
              : "Nenhuma questão respondida ainda"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border border-border bg-muted/20 p-0.5">
            <button
              type="button"
              onClick={() => setDays(7)}
              className={`min-h-9 rounded-md px-3 text-sm font-medium fluent-transition ${days === 7
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Últimos 7 dias
            </button>
            <button
              type="button"
              onClick={() => setDays(30)}
              className={`min-h-9 rounded-md px-3 text-sm font-medium fluent-transition ${days === 30
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Últimos 30 dias
            </button>
          </div>

          {data.disciplines.length > 1 && (
            <select
              value={discipline ?? ""}
              onChange={(e) => setDiscipline(e.target.value || undefined)}
              className="min-h-9 rounded-lg border border-input bg-background px-3 text-sm"
              aria-label="Filtrar por disciplina"
            >
              <option value="">Todas as disciplinas</option>
              {data.disciplines.map((d) => (
                <option key={d} value={d}>
                  {ENEM_DISCIPLINE_LABELS[d as keyof typeof ENEM_DISCIPLINE_LABELS] ?? d}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Média de acertos"
            value={`${data.averageAccuracy}%`}
          />
          <MetricCard
            label="Questões respondidas"
            value={String(data.totalAnswered)}
          />
          <MetricCard
            label="Alunos na turma"
            value={String(data.studentCount)}
          />
        </div>

        {chartData.length > 0 ? (
          <div className="rounded-xl border border-border bg-muted/10 p-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "#000" }}
                  labelFormatter={(label: unknown) => `Data: ${String(label)}`}
                  formatter={(value: unknown) => [`${value}%`, "Acertos"]}
                />
                <Bar dataKey="accuracy" fill="#2563eb" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma questão respondida no período selecionado.
            </p>
          </div>
        )}

        {data.disciplineBreakdown.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Desempenho por disciplina</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.disciplineBreakdown.map((d) => (
                <div
                  key={d.discipline}
                  className="rounded-lg border border-border bg-muted/10 p-3"
                >
                  <p className="text-sm font-medium">{d.label}</p>
                  <p className="text-lg font-bold">{d.accuracyPercent}%</p>
                  <p className="text-xs text-muted-foreground">
                    {d.correct}/{d.answered} questões
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/10 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
