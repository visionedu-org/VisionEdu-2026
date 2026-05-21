"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contentFormSchema,
  TEACHER_DISCIPLINES,
  type ContentFormValues,
} from "@/lib/validations/teacher";
import { teacherService } from "@/services/teacher.service";
import { ApiError } from "@/lib/api-client";
import { useCetiOptions } from "@/hooks/use-ceti-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContentForm() {
  const { schools, grades, getClasses, defaultSchoolId } = useCetiOptions();
  const [rootError, setRootError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [lastContentId, setLastContentId] = useState<string | null>(null);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "Matemática",
      grade: "2",
      class_identifier: "A",
      contentType: "text",
      videoUrl: "",
    },
  });

  const schoolId = defaultSchoolId;
  const grade = form.watch("grade");
  const contentType = form.watch("contentType");
  const classes = getClasses(schoolId, grade);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function onSubmit(values: ContentFormValues) {
    setRootError(null);
    setLastContentId(null);
    try {
      const { id } = await teacherService.createContent({
        title: values.title,
        description: values.description,
        discipline: values.subject,
        grade: values.grade,
        class_identifier: values.class_identifier,
        type: values.contentType,
      });
      setLastContentId(id);
      setToast("Material criado com sucesso.");
      form.reset({
        title: "",
        description: "",
        subject: values.subject,
        grade: values.grade,
        class_identifier: values.class_identifier,
        contentType: values.contentType,
        videoUrl: "",
      });
      setPdfFileName(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setRootError(err.message);
      } else {
        setRootError("Não foi possível salvar o material.");
      }
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full max-w-2xl space-y-4"
      noValidate
    >
      {toast && (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
          {toast}
        </p>
      )}

      {rootError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {rootError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="content-title">Título</Label>
        <Input
          id="content-title"
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
        <Label htmlFor="content-description">Descrição</Label>
        <textarea
          id="content-description"
          rows={3}
          className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-subject">Disciplina</Label>
        <select
          id="content-subject"
          className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          {...form.register("subject")}
        >
          {TEACHER_DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {form.formState.errors.subject && (
          <p className="text-sm text-destructive">
            {form.formState.errors.subject.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-school">Escola</Label>
        <select
          id="content-school"
          className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          disabled
          value={schoolId}
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
          <Label htmlFor="content-grade">Série</Label>
          <select
            id="content-grade"
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
          <Label htmlFor="content-class">Turma</Label>
          <select
            id="content-class"
            className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
            {...form.register("class_identifier")}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.class_identifier}>
                Turma {c.class_identifier}
              </option>
            ))}
          </select>
          {form.formState.errors.class_identifier && (
            <p className="text-sm text-destructive">
              {form.formState.errors.class_identifier.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-type">Tipo de conteúdo</Label>
        <select
          id="content-type"
          className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          {...form.register("contentType")}
        >
          <option value="text">Texto</option>
          <option value="video_link">Link de vídeo</option>
          <option value="pdf_upload">Upload de PDF (somente UI)</option>
        </select>
      </div>

      {contentType === "video_link" && (
        <div className="space-y-2">
          <Label htmlFor="content-video-url">Link do vídeo</Label>
          <Input
            id="content-video-url"
            type="url"
            placeholder="https://..."
            className="min-h-11"
            {...form.register("videoUrl")}
          />
          {form.formState.errors.videoUrl && (
            <p className="text-sm text-destructive">
              {form.formState.errors.videoUrl.message}
            </p>
          )}
        </div>
      )}

      {contentType === "pdf_upload" && (
        <div className="space-y-2">
          <Label htmlFor="content-pdf">Arquivo PDF</Label>
          <Input
            id="content-pdf"
            type="file"
            accept="application/pdf"
            className="min-h-11"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPdfFileName(file?.name ?? null);
            }}
          />
          {pdfFileName && (
            <p className="text-sm text-muted-foreground">
              Arquivo selecionado: {pdfFileName} (não enviado — mock)
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full min-h-11"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Salvando…" : "Criar material"}
      </Button>

      {lastContentId && (
        <p className="text-center text-sm text-muted-foreground">
          ID do material:{" "}
          <span className="font-mono text-foreground">{lastContentId}</span>
        </p>
      )}

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
