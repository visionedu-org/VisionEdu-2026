"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  diagnosticFormSchema,
  type DiagnosticFormValues,
} from "@/lib/validations/teacher";
import { masterCompetencies } from "@/mocks/data/bncc-competencies";
import { teacherService } from "@/services/teacher.service";
import { ApiError } from "@/lib/api-client";
import { useCetiOptions } from "@/hooks/use-ceti-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyQuestion = (): DiagnosticFormValues["questions"][number] => ({
  prompt: "",
  options: ["", "", "", ""],
  bnccCode: "EM13MAT302",
  correctOptionIndex: 0,
});

export function DiagnosticBuilder() {
  const router = useRouter();
  const { schools, grades, getClasses, defaultSchoolId } = useCetiOptions();
  const [rootError, setRootError] = useState<string | null>(null);

  const form = useForm<DiagnosticFormValues>({
    resolver: zodResolver(diagnosticFormSchema),
    defaultValues: {
      title: "",
      description: "",
      grade: "2",
      class_identifier: "A",
      questions: [emptyQuestion()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const grade = form.watch("grade");
  const classes = getClasses(defaultSchoolId, grade);

  async function onSubmit(values: DiagnosticFormValues) {
    setRootError(null);
    try {
      const { id } = await teacherService.createActivity({
        title: values.title,
        description: values.description,
        grade: values.grade,
        class_identifier: values.class_identifier,
        questions: values.questions.map((q) => ({
          prompt: q.prompt,
          options: q.options,
          bnccCode: q.bnccCode,
          correctOptionIndex: q.correctOptionIndex,
        })),
      });
      router.push(`/teacher/compartilhar/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setRootError(err.message);
      } else {
        setRootError("Não foi possível criar o diagnóstico.");
      }
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-2xl space-y-6"
      noValidate
    >
      {rootError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {rootError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="diag-title">Título do diagnóstico</Label>
        <Input
          id="diag-title"
          className="min-h-11"
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="diag-description">Descrição (opcional)</Label>
        <textarea
          id="diag-description"
          rows={2}
          className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          {...form.register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diag-school">Escola</Label>
        <select
          id="diag-school"
          className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          disabled
          value={defaultSchoolId}
        >
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="diag-grade">Série</Label>
          <select
            id="diag-grade"
            className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
            {...form.register("grade")}
          >
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}º ano
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="diag-class">Turma</Label>
          <select
            id="diag-class"
            className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
            {...form.register("class_identifier")}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.class_identifier}>
                Turma {c.class_identifier}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Questões</h2>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={fields.length >= 10}
            onClick={() => append(emptyQuestion())}
          >
            Adicionar questão
          </Button>
        </div>

        {form.formState.errors.questions?.message && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.questions.message}
          </p>
        )}

        {fields.map((field, index) => (
          <section
            key={field.id}
            className="space-y-3 rounded-xl border border-border bg-card p-4"
            aria-labelledby={`question-heading-${index}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                id={`question-heading-${index}`}
                className="font-medium"
              >
                Questão {index + 1}
              </h3>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
              >
                Remover
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`q-${index}-prompt`}>Enunciado</Label>
              <textarea
                id={`q-${index}-prompt`}
                rows={2}
                className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...form.register(`questions.${index}.prompt`)}
              />
              {form.formState.errors.questions?.[index]?.prompt && (
                <p className="text-sm text-destructive">
                  {
                    form.formState.errors.questions[index]?.prompt
                      ?.message
                  }
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`q-${index}-bncc`}>Habilidade BNCC</Label>
              <select
                id={`q-${index}-bncc`}
                className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                {...form.register(`questions.${index}.bnccCode`)}
              >
                {masterCompetencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.description.slice(0, 48)}…
                  </option>
                ))}
              </select>
              {form.formState.errors.questions?.[index]?.bnccCode && (
                <p role="alert" className="text-sm text-destructive">
                  {
                    form.formState.errors.questions[index]?.bnccCode
                      ?.message
                  }
                </p>
              )}
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Alternativas</legend>
              {([0, 1, 2, 3] as const).map((optIndex) => (
                <div key={optIndex} className="space-y-1">
                  <Label htmlFor={`q-${index}-opt-${optIndex}`}>
                    Alternativa {String.fromCharCode(65 + optIndex)}
                  </Label>
                  <Input
                    id={`q-${index}-opt-${optIndex}`}
                    className="min-h-11"
                    {...form.register(
                      `questions.${index}.options.${optIndex}`
                    )}
                  />
                </div>
              ))}
              {form.formState.errors.questions?.[index]?.options && (
                <p role="alert" className="text-sm text-destructive">
                  Preencha as quatro alternativas
                </p>
              )}
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor={`q-${index}-correct`}>Resposta correta</Label>
              <select
                id={`q-${index}-correct`}
                className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                {...form.register(`questions.${index}.correctOptionIndex`, {
                  valueAsNumber: true,
                })}
              >
                <option value={0}>Alternativa A</option>
                <option value={1}>Alternativa B</option>
                <option value={2}>Alternativa C</option>
                <option value={3}>Alternativa D</option>
              </select>
            </div>
          </section>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full min-h-11"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting
          ? "Criando diagnóstico…"
          : "Criar e compartilhar"}
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
