"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { teacherService } from "@/services/teacher.service";
import type { ClassStudentOption } from "@/types/materials";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassStudentsListProps {
  /** UUID da turma (`ClassGroup.id`). */
  classId: string;
}

export function ClassStudentsList({ classId }: ClassStudentsListProps) {
  const [students, setStudents] = useState<ClassStudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { students: list } = await teacherService.listClassStudents(classId);
        if (!cancelled) setStudents(list);
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar os alunos desta turma.");
          setStudents([]);
        }
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
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alunos da turma</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users className="size-5" aria-hidden />
        </span>
        <div>
          <CardTitle>Alunos da turma</CardTitle>
          <CardDescription>
            {students.length === 0
              ? "Nenhum aluno vinculado a esta turma"
              : `${students.length} aluno${students.length === 1 ? "" : "s"} vinculado${students.length === 1 ? "" : "s"}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="rounded-xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
            Quando alunos forem cadastrados nesta turma, eles aparecerão aqui.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border/60">
            {students.map((student, index) => (
              <li
                key={student.id}
                className="flex min-h-11 items-center gap-3 px-4 py-3 fluent-transition hover:bg-muted/30"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                  aria-hidden
                >
                  {student.name.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium">{student.name}</span>
                <span className="sr-only">
                  , posição {index + 1} de {students.length}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
