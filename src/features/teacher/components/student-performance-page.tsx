"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudentPerformanceData, AttemptSource } from "@/types/performance";
import { ENEM_DISCIPLINE_LABELS } from "@/lib/enem/constants";

interface StudentPerformancePageProps {
  classId: string;
  studentId: string;
}

type DaysFilter = 7 | 30 | null;
type SourceFilter = AttemptSource | null;

const SOURCE_LABELS: Record<string, string> = {
  practice: "Prática",
  learning_path: "Trilhas",
  material: "Materiais",
};

export function StudentPerformancePage({
  classId,
  studentId,
}: StudentPerformancePageProps) {
  const router = useRouter();
  const [data, setData] = useState<StudentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<SourceFilter>(null);
  const [days, setDays] = useState<DaysFilter>(null);
  const [attemptsPage, setAttemptsPage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await teacherService.getStudentPerformance(studentId, {
          classId,
          ...(source ? { source } : {}),
          ...(days ? { days } : {}),
        });
        if (!cancelled) {
          setData(result);
          setAttemptsPage(0);
        }
      } catch {
        if (!cancelled) setError("Não foi possível carregar o desempenho do aluno.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [studentId, classId, source, days]);

  function handleBack() {
    router.back();
  }

  const chartData = data?.dailyAccuracy
    ? data.dailyAccuracy
      .filter((d) => d.total > 0)
      .map((d) => ({
        date: d.date.slice(5),
        accuracy: d.accuracyPercent,
        answered: d.total,
      }))
    : [];

  const discChartData = data?.disciplineBreakdown
    ? data.disciplineBreakdown.map((d) => ({
      name: d.label,
      Acertos: d.accuracyPercent,
    }))
    : [];

  const srcChartData = data?.sourceBreakdown
    ? data.sourceBreakdown.map((d) => ({
      name: SOURCE_LABELS[d.source] ?? d.source,
      Acertos: d.accuracyPercent,
    }))
    : [];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center"
        role="alert"
      >
        <p className="font-medium">{error}</p>
        <Button variant="outline" className="mt-4 min-h-11" onClick={handleBack}>
          Voltar
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-5" aria-hidden />
        Voltar
      </button>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{data.studentName}</h1>
        <p className="text-sm text-muted-foreground">
          Desempenho individual com base nas questões respondidas
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-lg border border-border bg-muted/20 p-0.5">
          {(["practice", "learning_path", "material"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(source === s ? null : s)}
              className={`min-h-9 rounded-md px-3 text-sm font-medium fluent-transition ${source === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {SOURCE_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-border bg-muted/20 p-0.5">
          <button
            type="button"
            onClick={() => setDays(null)}
            className={`min-h-9 rounded-md px-3 text-sm font-medium fluent-transition ${days === null
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Tudo
          </button>
          <button
            type="button"
            onClick={() => setDays(30)}
            className={`min-h-9 rounded-md px-3 text-sm font-medium fluent-transition ${days === 30
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            30 dias
          </button>
          <button
            type="button"
            onClick={() => setDays(7)}
            className={`min-h-9 rounded-md px-3 text-sm font-medium fluent-transition ${days === 7
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            7 dias
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Questões respondidas"
          value={String(data.totalAnswered)}
        />
        <MetricCard
          label="Acertos"
          value={String(data.totalCorrect)}
        />
        <MetricCard
          label="Taxa de acerto"
          value={`${data.accuracyPercent}%`}
        />
      </div>

      {chartData.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/10 p-4">
          <h2 className="mb-3 text-sm font-medium">Evolução diária</h2>
          <ResponsiveContainer width="100%" height={240}>
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
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {discChartData.length > 0 && (
          <div className="rounded-xl border border-border bg-muted/10 p-4">
            <h2 className="mb-3 text-sm font-medium">
              Desempenho por disciplina
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={discChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "#000" }}
                  formatter={(value: unknown) => [`${value}%`, "Acertos"]}
                />
                <Bar dataKey="Acertos" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {srcChartData.length > 1 && source === null && (
          <div className="rounded-xl border border-border bg-muted/10 p-4">
            <h2 className="mb-3 text-sm font-medium">
              Desempenho por fonte
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={srcChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  itemStyle={{ color: "#000" }}
                  formatter={(value: unknown) => [`${value}%`, "Acertos"]}
                />
                <Bar dataKey="Acertos" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {data.recentAttempts.length > 0 && (
        <div className="rounded-xl border border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-medium">Últimas tentativas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Questão</th>
                  <th className="px-4 py-2 text-left font-medium">Disciplina</th>
                  <th className="px-4 py-2 text-left font-medium">Fonte</th>
                  <th className="px-4 py-2 text-left font-medium">Data</th>
                  <th className="px-4 py-2 text-center font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.recentAttempts
                  .slice(attemptsPage * 10, (attemptsPage + 1) * 10)
                  .map((a) => (
                    <tr key={a.questionKey} className="hover:bg-muted/20">
                      <td className="px-4 py-2">
                        ENEM {a.year} - Q{a.index}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {a.discipline
                          ? ENEM_DISCIPLINE_LABELS[a.discipline as keyof typeof ENEM_DISCIPLINE_LABELS] ?? a.discipline
                          : "—"}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {SOURCE_LABELS[a.source] ?? a.source}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(a.answeredAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {a.isCorrect ? (
                          <Check className="mx-auto size-5 text-green-600" aria-label="Correto" />
                        ) : (
                          <X className="mx-auto size-5 text-red-600" aria-label="Errado" />
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Página {attemptsPage + 1} de {Math.ceil(data.recentAttempts.length / 10)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={attemptsPage === 0}
                onClick={() => setAttemptsPage((p) => Math.max(0, p - 1))}
                className="min-h-9 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={attemptsPage >= Math.ceil(data.recentAttempts.length / 10) - 1}
                onClick={() => setAttemptsPage((p) => p + 1)}
                className="min-h-9 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}

      {data.totalAnswered === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma questão respondida com os filtros selecionados.
          </p>
        </div>
      )}
    </div>
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
