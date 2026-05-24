"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { studentService } from "@/services/student.service";
import type { StudentDashboardData } from "@/types/domain";

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
      <div className="mx-auto max-w-lg space-y-4 p-4 animate-pulse">
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="h-20 rounded-xl bg-muted" />
      </div>
    );
  }

  const pending = data?.pendingActivities ?? [];

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 overflow-x-hidden p-4">
      <h1 className="text-2xl font-bold">Suas atividades</h1>

      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma atividade pendente.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((item) => (
            <li key={item.id}>
              <Link
                href={`/student/atividade/${item.id}`}
                className="flex min-h-11 flex-col justify-center rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
              >
                <span className="font-semibold">{item.title}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {item.status === "in_progress" ? "Em progresso" : "Não iniciada"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
