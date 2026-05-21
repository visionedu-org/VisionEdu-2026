"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { studentService } from "@/services/student.service";
import type { LearningPathModule, StudentDashboardData } from "@/types/domain";
import { LearningPathTimeline } from "./learning-path-timeline";
import { cetiSchool } from "@/mocks/data/ceti-seed";

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const [dashboard, setDashboard] = useState<StudentDashboardData | null>(null);
  const [modules, setModules] = useState<LearningPathModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [dash, path] = await Promise.all([
          studentService.getDashboard(),
          studentService.getLearningPath(),
        ]);
        if (!cancelled) {
          setDashboard(dash);
          setModules(path.modules);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const firstName = user?.name?.split(" ")[0] ?? "estudante";
  const schoolLine = dashboard
    ? `${dashboard.schoolName} · ${dashboard.grade}º ano · Turma ${dashboard.classIdentifier}`
    : `${cetiSchool.name} · ${user?.grade ?? "—"}º ano · Turma ${user?.class_identifier ?? "—"}`;

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 p-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 overflow-x-hidden p-4">
      {toast && (
        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-sm text-foreground">{toast}</p>
          <span role="status" aria-live="polite" className="sr-only">
            {toast}
          </span>
        </div>
      )}

      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Olá, {firstName}</h1>
        <p className="text-sm text-muted-foreground">{schoolLine}</p>
      </header>

      <div className="grid gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Escola e turma</h2>
          <p className="mt-1 font-semibold">{dashboard?.schoolName ?? cetiSchool.name}</p>
          <p className="text-sm text-muted-foreground">
            {dashboard?.grade ?? user?.grade}º ano · Turma{" "}
            {dashboard?.classIdentifier ?? user?.class_identifier}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Score médio</h2>
          <p className="mt-1 text-3xl font-bold text-primary">
            {dashboard?.averageScore.toFixed(1) ?? "—"}
            <span className="text-base font-normal text-muted-foreground"> / 10</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">Atividades</h2>
          <p className="mt-1 text-2xl font-bold">
            {dashboard?.activitiesCompleted ?? 0}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / {dashboard?.activitiesTotal ?? 0} concluídas
            </span>
          </p>
          {dashboard?.pendingActivities[0] && (
            <Link
              href={`/student/atividade/${dashboard.pendingActivities[0].id}`}
              className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Continuar: {dashboard.pendingActivities[0].title}
            </Link>
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sua trilha</h2>
        <LearningPathTimeline
          modules={modules}
          onLockedPress={() =>
            setToast("Complete o módulo anterior para desbloquear.")
          }
        />
      </section>
    </div>
  );
}
