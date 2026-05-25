"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { studentService } from "@/services/student.service";
import type { LearningPathModule, StudentDashboardData } from "@/types/domain";
import { LearningPathTimeline } from "./learning-path-timeline";
import { cetiSchool } from "@/mocks/data/ceti-seed";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppPage } from "@/components/layout/app-page";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

const dashboardStatCardHeaderClass =
  "flex-row items-center gap-2 space-y-0 px-4 py-3 pb-0";
const dashboardStatCardContentClass = "px-4 py-3 pt-2";

function DashboardMetricRow({
  done,
  total,
  label,
  href,
  linkLabel,
}: {
  done: number;
  total: number;
  label: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none">
          {done}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            / {total}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

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
      } catch {
        if (!cancelled) {
          setDashboard(null);
          setModules([]);
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
      <AppPage>
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage className="overflow-x-hidden">
      {toast && (
        <div
          className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      <PageHeader
        title={`Olá, ${firstName} 👋`}
        description={schoolLine}
        action={
          dashboard?.pendingActivities[0] ? (
            <Button
              nativeButton={false}
              render={
                <Link
                  href={`/student/atividade/${dashboard.pendingActivities[0].id}`}
                />
              }
              size="sm"
            >
              Continuar atividade
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
              <GraduationCap className="size-5" aria-hidden />
            </span>
            <div>
              <CardTitle>Escola e turma</CardTitle>
              <CardDescription>Seu contexto pedagógico</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {dashboard?.schoolName ?? cetiSchool.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {dashboard?.grade ?? user?.grade}º ano · Turma{" "}
              {dashboard?.classIdentifier ?? user?.class_identifier}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={dashboardStatCardHeaderClass}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-green/15 text-emerald-700 dark:text-brand-green">
              <Target className="size-4" aria-hidden />
            </span>
            <CardDescription>Atividades</CardDescription>
          </CardHeader>
          <CardContent className={dashboardStatCardContentClass}>
            <DashboardMetricRow
              done={dashboard?.activitiesCompleted ?? 0}
              total={dashboard?.activitiesTotal ?? 0}
              label="Feitos"
              href="/student/atividades"
              linkLabel="Resolver Atividades"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={dashboardStatCardHeaderClass}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-yellow/20 text-amber-800 dark:text-brand-yellow">
              <BookOpen className="size-4" aria-hidden />
            </span>
            <CardDescription>Materiais</CardDescription>
          </CardHeader>
          <CardContent className={dashboardStatCardContentClass}>
            <DashboardMetricRow
              done={dashboard?.materialsViewed ?? 0}
              total={dashboard?.materialsTotal ?? 0}
              label="Visualizados"
              href="/student/materiais"
              linkLabel="Vizualizar Material"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={dashboardStatCardHeaderClass}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <CardDescription>Questões ENEM</CardDescription>
          </CardHeader>
          <CardContent className={dashboardStatCardContentClass}>
            <div className="flex items-center justify-end">
              <Link
                href="/student/questoes"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Praticar agora →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Sua trilha de aprendizagem</h2>
        <LearningPathTimeline
          modules={modules}
          onLockedPress={() =>
            setToast("Complete o módulo anterior para desbloquear.")
          }
        />
      </section>
    </AppPage>
  );
}
