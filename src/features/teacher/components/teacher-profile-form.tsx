"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { teacherSchoolsPayloadSchema } from "@/lib/validations/teacher-assignments";
import { teacherService } from "@/services/teacher.service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { TeacherSchoolsField, type TeacherAssignmentsFormValues } from "@/features/auth/components/teacher-schools-field";
import { Button } from "@/components/ui/button";

const teacherProfileFormSchema = z.object({
  schools: teacherSchoolsPayloadSchema,
}) satisfies z.ZodType<TeacherAssignmentsFormValues>;

type TeacherProfileFormValues = TeacherAssignmentsFormValues;

export function TeacherProfileForm() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [rootError, setRootError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<TeacherProfileFormValues>({
    resolver: zodResolver(teacherProfileFormSchema),
    defaultValues: { schools: [] },
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setInitialLoading(true);
      setRootError(null);
      try {
        const { schools } = await teacherService.getMyAssignments();
        if (!cancelled) {
          form.reset({ schools });
        }
      } catch (err) {
        if (!cancelled) {
          setRootError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar seus vínculos."
          );
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form]);

  async function onSubmit(values: TeacherProfileFormValues) {
    setRootError(null);
    setSuccessMessage(null);

    try {
      const result = await teacherService.updateMyAssignments(values.schools);
      updateUser(result.user);
      form.reset({ schools: result.schools });
      setSuccessMessage("Vínculos atualizados com sucesso.");
    } catch (err) {
      if (err instanceof ApiError) {
        setRootError(err.message);
        if (err.fieldErrors?.schools) {
          form.setError("schools", { message: err.fieldErrors.schools });
        }
      } else {
        setRootError("Não foi possível salvar as alterações.");
      }
    }
  }

  if (initialLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando vínculos…
      </p>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-2xl space-y-4"
      noValidate
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Meu perfil</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie escolas, turmas, séries e matérias vinculadas ao seu cadastro.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
        >
          {successMessage}
        </div>
      )}

      {rootError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {rootError}
        </div>
      )}

      <TeacherSchoolsField
        control={form.control}
        register={form.register}
        setValue={form.setValue}
        errors={form.formState.errors.schools}
      />

      <Button
        type="submit"
        className="w-full min-h-11"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Salvando…" : "Salvar alterações"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/teacher/dashboard"
          className="text-primary font-medium underline-offset-2 hover:underline"
        >
          Voltar ao painel
        </Link>
      </p>
    </form>
  );
}
