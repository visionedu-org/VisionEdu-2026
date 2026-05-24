"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { resolveClassIdParam } from "@/lib/class-id-param";
import { teacherService } from "@/services/teacher.service";
import type { ClassDashboardData } from "@/types/domain";

interface ClassDashboardProps {
  classId: string;
}

export function ClassDashboard({ classId }: ClassDashboardProps) {
  const [data, setData] = useState<ClassDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const dashboard = await teacherService.getClassDashboard(classId);
        if (!cancelled) setData(dashboard);
      } catch {
        if (!cancelled) setError("Não foi possível carregar os dados da turma.");
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
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  const classUuid = resolveClassIdParam(classId);

  if (error || !data) {
    return (
      <div
        className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center"
        role="alert"
      >
        <p className="font-medium">{error ?? "Turma não encontrada"}</p>
        <Link href="/teacher/turmas">
          <Button variant="outline" className="mt-4 min-h-11">
            Voltar às turmas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{data.classLabel}</h1>
        <p className="text-sm text-muted-foreground">
          {data.studentCount} alunos · dados simulados (mock)
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Média da turma</h2>
          <p className="mt-1 text-3xl font-bold text-primary">
            {data.averageScore.toFixed(1)}
            <span className="text-base font-normal text-muted-foreground"> / 10</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Total de alunos</h2>
          <p className="mt-1 text-3xl font-bold">{data.studentCount}</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Top 3 conceitos com maior taxa de erro</h2>
        <ol className="mt-4 space-y-3">
          {data.topErrors.map((item, index) => (
            <li
              key={item.concept}
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2"
            >
              <span className="font-medium">
                <span className="sr-only">Posição {index + 1}: </span>
                {item.concept}
              </span>
              <span className="shrink-0 text-sm font-semibold text-destructive">
                {item.errorRate}%
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        {classUuid && (
          <Link
            href={`/teacher/conteudos/novo?classId=${encodeURIComponent(classUuid)}`}
          >
            <Button className="min-h-11">Enviar material</Button>
          </Link>
        )}
        <Link href={`/teacher/turmas/${classId}/bncc`}>
          <Button variant="outline" className="min-h-11">
            Ver lacunas BNCC
          </Button>
        </Link>
        <Link href="/teacher/turmas">
          <Button variant="outline" className="min-h-11">
            Todas as turmas
          </Button>
        </Link>
      </div>
    </div>
  );
}
