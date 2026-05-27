"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { resolveClassIdParam } from "@/lib/class-id-param";
import { teacherService } from "@/services/teacher.service";
import { useAuthStore } from "@/stores/auth-store";
import type { ClassDashboardData } from "@/types/domain";
import { ClassStudentsList } from "./class-students-list";

interface ClassDashboardProps {
  classId: string;
}

export function ClassDashboard({ classId }: ClassDashboardProps) {
  const teacherClasses = useAuthStore((s) => s.user?.teacher_classes);
  const resolvedClassId = resolveClassIdParam(classId, teacherClasses);
  const routeClassId = resolvedClassId ?? classId;

  const [data, setData] = useState<ClassDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const dashboard = await teacherService.getClassDashboard(routeClassId);
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
  }, [routeClassId]);

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
          Visão geral e alunos vinculados
        </p>
      </header>

      <ClassStudentsList classId={routeClassId} />
      <div className="flex flex-wrap gap-3">
        {resolvedClassId && (
          <Link
            href={`/teacher/conteudos/novo?classId=${encodeURIComponent(resolvedClassId)}`}
          >
            <Button className="min-h-11">Enviar material</Button>
          </Link>
        )}
        <Link href={`/teacher/turmas/${routeClassId}/bncc`}>
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
