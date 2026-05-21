"use client";

import Link from "next/link";
import { cetiSchool } from "@/mocks/data/ceti-seed";
import { useAuthStore } from "@/stores/auth-store";
import type { TeacherClassAssignment } from "@/types/domain";

function classSlug(c: TeacherClassAssignment): string {
  return `${c.grade}-${c.class_identifier}`;
}

function classLabel(c: TeacherClassAssignment): string {
  return `${c.grade}º Turma ${c.class_identifier}`;
}

export default function TeacherTurmasPage() {
  const classes = useAuthStore((s) => s.user?.teacher_classes ?? []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Turmas</h1>
        <p className="text-sm text-muted-foreground">
          Turmas vinculadas ao seu cadastro na escola CETI
        </p>
      </header>

      {classes.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center"
          role="status"
        >
          <p className="font-medium">Nenhuma turma vinculada</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize seu cadastro para associar séries e turmas.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {classes.map((c) => {
            const slug = classSlug(c);
            return (
              <li key={slug}>
                <Link
                  href={`/teacher/turmas/${slug}`}
                  className="flex min-h-11 flex-col justify-center rounded-xl border border-border bg-background p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <span className="font-semibold">{classLabel(c)}</span>
                  <span className="text-sm text-muted-foreground">
                    {cetiSchool.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
