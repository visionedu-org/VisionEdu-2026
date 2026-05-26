"use client";

import Link from "next/link";
import { ArrowRight, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="space-y-8">
      <PageHeader
        title="Painel do professor"
        description={`${user?.name ?? "Professor"} — visão geral das turmas vinculadas`}
        action={
          <Link href="/teacher/conteudos/novo">
            <Button>
              Novo conteúdo
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </Link>
        }
      />

      <div className="grid w-full grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" aria-hidden />
            </span>
            <div>
              <CardTitle>Turmas</CardTitle>
              <CardDescription>Vinculadas ao seu perfil</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{classes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-yellow/20 text-amber-800 dark:text-brand-yellow">
              <FileText className="size-5" aria-hidden />
            </span>
            <div>
              <CardTitle>Conteúdos</CardTitle>
              <CardDescription>Materiais e diagnósticos</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/teacher/conteudos">
              <Button variant="outline" size="sm">
                Gerenciar conteúdos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Acesso rápido às turmas</h2>
        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma turma vinculada.{" "}
                <Link
                  href="/teacher/perfil"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Configure seu perfil
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {classes.map((c) => {
              const slug = classSlug(c);
              return (
                <li key={slug}>
                  <Link href={`/teacher/turmas/${slug}`}>
                    <Card className="h-full hover:border-primary/30">
                      <CardHeader>
                        <CardTitle>{classLabel(c)}</CardTitle>
                        <CardDescription>
                          {c.materias && c.materias.length > 0
                            ? c.materias.join(", ")
                            : "Média, erros frequentes e BNCC"}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/teacher/turmas">
          <Button variant="outline">Ver todas as turmas</Button>
        </Link>
      </section>

      <Card className="border-dashed bg-muted/30">
        <CardHeader>
          <CardTitle>Tempo real</CardTitle>
          <CardDescription>Fase 5 — em breve</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Acompanhamento ao vivo da turma na sala de aula estará disponível na
            próxima fase do piloto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
