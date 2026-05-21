"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import type { TeacherClassAssignment } from "@/types/domain";

function classSlug(c: TeacherClassAssignment): string {
  return `${c.grade}-${c.class_identifier}`;
}

function classLabel(c: TeacherClassAssignment): string {
  return `${c.grade}º Turma ${c.class_identifier}`;
}

export default function TeacherDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const classes = user?.teacher_classes ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Painel do professor</h1>
        <p className="text-sm text-muted-foreground">
          {user?.name} — visão geral das turmas vinculadas
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Acesso rápido às turmas</h2>
        {classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma turma vinculada. Cadastre turmas no seu perfil.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {classes.map((c) => {
              const slug = classSlug(c);
              return (
                <li key={slug}>
                  <Link
                    href={`/teacher/turmas/${slug}`}
                    className="flex min-h-11 flex-col justify-center rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <span className="font-semibold">{classLabel(c)}</span>
                    <span className="text-sm text-muted-foreground">
                      Média, erros frequentes e BNCC
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/teacher/turmas">
          <Button variant="outline" className="min-h-11">
            Ver todas as turmas
          </Button>
        </Link>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 min-h-[120px]">
          <h2 className="font-semibold">Tempo real</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Disponível na Fase 5 — acompanhamento ao vivo da turma na sala de aula.
          </p>
        </div>
      </div>
    </div>
  );
}
