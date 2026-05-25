"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { studentService } from "@/services/student.service";
import type { StudentDashboardData } from "@/types/domain";
import { AppPage } from "@/components/layout/app-page";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentActivitiesList() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService
      .getDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppPage>
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </AppPage>
    );
  }

  const pending = data?.pendingActivities ?? [];

  return (
    <AppPage>
      <h1 className="text-2xl font-bold">Suas atividades</h1>

      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma atividade pendente.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pending.map((item) => (
            <li key={item.id}>
              <Link
                href={`/student/atividade/${item.id}`}
                className="flex min-h-11 h-full flex-col justify-center rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
              >
                <span className="font-semibold">{item.title}</span>
                <span className="mt-1 text-xs text-muted-foreground capitalize">
                  {item.status === "in_progress" ? "Em progresso" : "Não iniciada"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppPage>
  );
}
