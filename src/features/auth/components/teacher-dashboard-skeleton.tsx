"use client";

import { useAuthStore } from "@/stores/auth-store";

const cards = [
  "Turmas",
  "Médias",
  "Lacunas BNCC",
  "Tempo real",
];

export function TeacherDashboardSkeleton() {
  const user = useAuthStore((s) => s.user);
  const classes = user?.teacher_classes ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          Painel do professor
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.name} — turmas vinculadas no cadastro
        </p>
        <ul className="flex flex-wrap gap-2">
          {classes.map((c) => (
            <li
              key={`${c.grade}-${c.class_identifier}`}
              className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1"
            >
              {c.grade}º {c.class_identifier}
            </li>
          ))}
        </ul>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((title) => (
          <div
            key={title}
            className="rounded-xl border border-dashed border-border bg-muted/20 p-4 min-h-[120px]"
          >
            <h2 className="font-semibold">{title}</h2>
            <p className="text-xs text-primary mt-4">Em breve — Fase 4/5</p>
          </div>
        ))}
      </div>
    </div>
  );
}
