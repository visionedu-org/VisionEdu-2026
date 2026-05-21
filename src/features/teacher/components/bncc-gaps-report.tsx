"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { teacherService } from "@/services/teacher.service";
import type { BnccDifficulty, BnccGapRow } from "@/types/domain";

interface BnccGapsReportProps {
  classId: string;
}

const difficultyLabels: Record<BnccDifficulty, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const difficultyStyles: Record<BnccDifficulty, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-amber-500/15 text-amber-950 border-amber-600/40 dark:text-amber-100",
  low: "bg-secondary/15 text-secondary border-secondary/40",
};

export function BnccGapsReport({ classId }: BnccGapsReportProps) {
  const [gaps, setGaps] = useState<BnccGapRow[]>([]);
  const [classLabel, setClassLabel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dashboard, bncc] = await Promise.all([
          teacherService.getClassDashboard(classId),
          teacherService.getBnccGaps(classId),
        ]);
        if (!cancelled) {
          setClassLabel(dashboard.classLabel);
          setGaps(bncc.gaps);
        }
      } catch {
        if (!cancelled) setError("Não foi possível carregar o relatório BNCC.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
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
        <Link href={`/teacher/turmas/${classId}`}>
          <Button variant="outline" className="mt-4 min-h-11">
            Voltar ao dashboard da turma
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Lacunas BNCC</h1>
        <p className="text-sm text-muted-foreground">
          {classLabel} — ordenado por menor domínio (prioridade de intervenção)
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">
            Competências BNCC com percentual de domínio e dificuldade pedagógica
          </caption>
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Código
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Competência
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Domínio
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Dificuldade
              </th>
            </tr>
          </thead>
          <tbody>
            {gaps.map((row) => (
              <tr key={row.code} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{row.code}</td>
                <td className="px-4 py-3 max-w-xs">{row.description}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={cn(
                      "font-semibold",
                      row.masteryPercent < 40 ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {row.masteryPercent}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex min-h-8 items-center rounded-full border px-2.5 text-xs font-medium",
                      difficultyStyles[row.difficulty]
                    )}
                  >
                    {difficultyLabels[row.difficulty]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href={`/teacher/turmas/${classId}`}>
        <Button variant="outline" className="min-h-11">
          Voltar ao dashboard da turma
        </Button>
      </Link>
    </div>
  );
}
