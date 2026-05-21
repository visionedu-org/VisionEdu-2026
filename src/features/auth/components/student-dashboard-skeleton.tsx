"use client";

import { useAuthStore } from "@/stores/auth-store";
import { cetiSchool } from "@/mocks/data/ceti-seed";

const cards = [
  { title: "Trilha", description: "Caminho de aprendizagem adaptativo" },
  { title: "Atividades", description: "Tarefas e diagnósticos da turma" },
  { title: "Score", description: "Desempenho médio nas atividades" },
];

export function StudentDashboardSkeleton() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">
          Olá, {user?.name?.split(" ")[0] ?? "estudante"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {cetiSchool.name} · {user?.grade}º ano · Turma {user?.class_identifier}
        </p>
      </header>

      <div className="grid gap-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-dashed border-border bg-muted/20 p-4"
          >
            <h2 className="font-semibold text-foreground">{card.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
            <span className="inline-block mt-3 text-xs font-medium text-primary">
              Em breve — Fase 3
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
