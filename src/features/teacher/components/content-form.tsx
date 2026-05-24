"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  contentFormSchema,
  TEACHER_DISCIPLINES,
  type ContentFormValues,
} from "@/lib/validations/teacher";
import type { ClassStudentOption } from "@/types/materials";
import type { ClassGroup } from "@/types/domain";
import { teacherService } from "@/services/teacher.service";
import { getMaterialFormErrorMessage } from "@/lib/api-error-messages";
import { ApiError } from "@/lib/api-client";
import {
  formatUploadMaxSizeMb,
  isAllowedMaterialFile,
  mapMaterialUploadError,
  MATERIAL_FILE_ACCEPT,
  MAX_MATERIAL_ATTACHMENTS,
  UPLOAD_MAX_BYTES_CLIENT,
} from "@/lib/materials-upload";
import { useCetiOptions } from "@/hooks/use-ceti-options";
import { useTeacherClassOptions } from "@/hooks/use-teacher-class-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function buildDefaultFormValues(
  assignedClasses: ClassGroup[],
  initialClassId?: string
): ContentFormValues {
  const preferredClass =
    (initialClassId
      ? assignedClasses.find((c) => c.id === initialClassId)
      : undefined) ?? assignedClasses[0];

  return {
    title: "",
    description: "",
    subject: "Matemática",
    grade: (preferredClass?.grade ?? "2") as ContentFormValues["grade"],
    classId: preferredClass?.id ?? "",
    recipientMode: "class",
    studentId: undefined,
    contentType: "text",
    bodyText: "",
    videoUrl: "",
  };
}

type SelectedFile = {
  clientId: string;
  file: File;
  progress: number;
  status: "ready" | "uploading" | "uploaded" | "error";
  uploadId?: string;
  error?: string;
};

interface ContentFormProps {
  initialClassId?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

export function ContentForm({ initialClassId }: ContentFormProps) {
  const fileInputId = useId();
  const successBannerRef = useRef<HTMLDivElement>(null);
  const { schools, defaultSchoolId } = useCetiOptions();
  const { assignedClasses, grades: teacherGrades, loading: classesLoading, error: classesError } =
    useTeacherClassOptions();
  const defaultFormValues = useMemo(
    () => buildDefaultFormValues(assignedClasses, initialClassId),
    [assignedClasses, initialClassId]
  );
  const [rootError, setRootError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lastContentId, setLastContentId] = useState<string | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudentOption[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: defaultFormValues,
  });

  const schoolId = defaultSchoolId;
  const [grade, contentType, classId, recipientMode] = useWatch({
    control: form.control,
    name: ["grade", "contentType", "classId", "recipientMode"],
  });
  const resolvedGrade = grade ?? defaultFormValues.grade;
  const resolvedContentType = contentType ?? "text";
  const resolvedClassId = classId ?? defaultFormValues.classId;
  const resolvedRecipientMode = recipientMode ?? "class";
  const classes = useMemo(
    () => assignedClasses.filter((c) => c.grade === resolvedGrade),
    [assignedClasses, resolvedGrade]
  );

  const isBusy = form.formState.isSubmitting || isUploading;

  useEffect(() => {
    if (!submitSuccess) return;
    successBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const t = setTimeout(() => setSubmitSuccess(false), 6000);
    return () => clearTimeout(t);
  }, [submitSuccess]);

  useEffect(() => {
    if (classesLoading || assignedClasses.length === 0) return;
    const currentClassId = form.getValues("classId");
    const gradeClasses = assignedClasses.filter((c) => c.grade === resolvedGrade);
    if (!gradeClasses.some((c) => c.id === currentClassId) && gradeClasses[0]) {
      form.setValue("classId", gradeClasses[0].id, { shouldValidate: true });
    }
  }, [resolvedGrade, assignedClasses, classesLoading, form]);

  useEffect(() => {
    if (classesLoading || assignedClasses.length === 0) return;
    const currentClassId = form.getValues("classId");
    if (assignedClasses.some((c) => c.id === currentClassId)) return;
    const next = buildDefaultFormValues(assignedClasses, initialClassId);
    form.reset({
      ...form.getValues(),
      grade: next.grade,
      classId: next.classId,
    });
  }, [classesLoading, assignedClasses, initialClassId, form]);

  useEffect(() => {
    if (!initialClassId || assignedClasses.length === 0) return;
    const match = assignedClasses.find((c) => c.id === initialClassId);
    if (match) {
      form.setValue("grade", match.grade as ContentFormValues["grade"], {
        shouldValidate: true,
      });
      form.setValue("classId", match.id, { shouldValidate: true });
    }
  }, [initialClassId, assignedClasses, form]);

  const contentTypeField = form.register("contentType");
  const recipientModeField = form.register("recipientMode");

  useEffect(() => {
    if (resolvedRecipientMode !== "student" || !resolvedClassId) {
      return;
    }

    let cancelled = false;

    (async () => {
      setStudentsLoading(true);
      setStudentsError(null);
      try {
        const { students } = await teacherService.listClassStudents(
          resolvedClassId
        );
        if (cancelled) return;
        setClassStudents(students);
        const currentStudentId = form.getValues("studentId");
        if (
          currentStudentId &&
          !students.some((s) => s.id === currentStudentId)
        ) {
          form.setValue("studentId", students[0]?.id ?? "", {
            shouldValidate: true,
          });
        } else if (!currentStudentId && students[0]) {
          form.setValue("studentId", students[0].id, { shouldValidate: true });
        }
      } catch (err) {
        if (!cancelled) {
          setClassStudents([]);
          setStudentsError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar os alunos da turma."
          );
        }
      } finally {
        if (!cancelled) setStudentsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedRecipientMode, resolvedClassId, form]);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;
    setRootError(null);

    const incoming = Array.from(fileList);
    const slotsLeft = MAX_MATERIAL_ATTACHMENTS - selectedFiles.length;

    if (slotsLeft <= 0) {
      setRootError(`Você pode enviar no máximo ${MAX_MATERIAL_ATTACHMENTS} arquivos.`);
      return;
    }

    const toAdd: SelectedFile[] = [];
    const errors: string[] = [];

    for (const file of incoming.slice(0, slotsLeft)) {
      if (!isAllowedMaterialFile(file)) {
        errors.push(`"${file.name}": tipo não permitido.`);
        continue;
      }
      if (file.size > UPLOAD_MAX_BYTES_CLIENT) {
        errors.push(
          `"${file.name}": excede ${formatUploadMaxSizeMb()} MB.`
        );
        continue;
      }
      if (selectedFiles.some((f) => f.file.name === file.name && f.file.size === file.size)) {
        continue;
      }
      toAdd.push({
        clientId: crypto.randomUUID(),
        file,
        progress: 0,
        status: "ready",
      });
    }

    if (incoming.length > slotsLeft) {
      errors.push(`Apenas ${slotsLeft} arquivo(s) foram adicionados (limite de ${MAX_MATERIAL_ATTACHMENTS}).`);
    }

    if (toAdd.length > 0) {
      setSelectedFiles((prev) => [...prev, ...toAdd]);
    }
    if (errors.length > 0) {
      setRootError(errors.join(" "));
    }
  }

  function removeFile(clientId: string) {
    setSelectedFiles((prev) => prev.filter((f) => f.clientId !== clientId));
  }

  async function uploadSelectedFiles(): Promise<string[]> {
    const uploadIds: string[] = [];

    for (const entry of selectedFiles) {
      if (entry.status === "uploaded" && entry.uploadId) {
        uploadIds.push(entry.uploadId);
        continue;
      }

      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.clientId === entry.clientId
            ? { ...f, status: "uploading", progress: 0, error: undefined }
            : f
        )
      );

      try {
        const result = await teacherService.uploadMaterialFile(
          entry.file,
          (percent) => {
            setSelectedFiles((prev) =>
              prev.map((f) =>
                f.clientId === entry.clientId ? { ...f, progress: percent } : f
              )
            );
          }
        );

        uploadIds.push(result.uploadId);
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.clientId === entry.clientId
              ? {
                  ...f,
                  status: "uploaded",
                  progress: 100,
                  uploadId: result.uploadId,
                }
              : f
          )
        );
      } catch (err) {
        const message =
          err instanceof ApiError
            ? mapMaterialUploadError(err)
            : "Falha ao enviar o arquivo.";

        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.clientId === entry.clientId
              ? { ...f, status: "error", error: message }
              : f
          )
        );
        throw new Error(message);
      }
    }

    return uploadIds;
  }

  function onInvalid(errors: FieldErrors<ContentFormValues>) {
    const firstError = Object.values(errors).find(
      (entry) => entry && "message" in entry && entry.message
    );
    setRootError(
      typeof firstError?.message === "string"
        ? firstError.message
        : "Verifique os campos do formulário."
    );
  }

  async function onSubmit(values: ContentFormValues) {
    setRootError(null);
    setLastContentId(null);
    setSubmitSuccess(false);

    if (!assignedClasses.some((c) => c.id === values.classId)) {
      setRootError("Selecione uma turma vinculada ao seu perfil.");
      return;
    }

    if (values.contentType === "file" && selectedFiles.length === 0) {
      setRootError("Selecione ao menos um arquivo (PDF ou imagem).");
      return;
    }

    try {
      let attachmentIds: string[] | undefined;

      if (values.contentType === "file") {
        setIsUploading(true);
        attachmentIds = await uploadSelectedFiles();
        setIsUploading(false);
      }

      const { id } = await teacherService.createMaterial({
        title: values.title,
        description: values.description,
        discipline: values.subject,
        contentType: values.contentType,
        bodyText:
          values.contentType === "text" ? values.bodyText?.trim() ?? "" : null,
        videoUrl:
          values.contentType === "video_link"
            ? values.videoUrl?.trim() ?? ""
            : null,
        recipients:
          values.recipientMode === "student" && values.studentId
            ? [
                {
                  targetType: "student",
                  classId: values.classId,
                  studentId: values.studentId,
                },
              ]
            : [{ targetType: "class", classId: values.classId }],
        attachmentIds,
      });

      const resetValues = buildDefaultFormValues(assignedClasses, initialClassId);
      setLastContentId(id);
      setSubmitSuccess(true);
      form.reset(resetValues);
      setSelectedFiles([]);
      setClassStudents([]);
      setStudentsError(null);
    } catch (err) {
      setIsUploading(false);
      if (err instanceof ApiError) {
        setRootError(
          getMaterialFormErrorMessage(undefined, err.status, err.message)
        );
      } else if (err instanceof Error) {
        setRootError(err.message);
      } else {
        setRootError("Não foi possível enviar o material.");
      }
    }
  }

  if (classesLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando turmas vinculadas…
      </p>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="w-full max-w-2xl space-y-4"
      noValidate
    >
      {submitSuccess && (
        <div
          ref={successBannerRef}
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium">Material enviado com sucesso!</p>
            <p className="text-emerald-800 dark:text-emerald-200">
              O conteúdo foi publicado e os campos foram limpos para um novo envio.
            </p>
          </div>
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
            {teacherGrades.map((g) => (
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
            {...form.register("classId")}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Turma {c.class_identifier}
              </option>
            ))}
          </select>
          {form.formState.errors.classId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.classId.message}
            </p>
          )}
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Destinatários</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              value="class"
              className="size-4"
              {...recipientModeField}
              onChange={(event) => {
                void recipientModeField.onChange(event);
                form.setValue("studentId", undefined, { shouldValidate: true });
                form.clearErrors("studentId");
                setClassStudents([]);
                setStudentsError(null);
              }}
            />
            Turma inteira
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              value="student"
              className="size-4"
              {...recipientModeField}
              onChange={(event) => {
                void recipientModeField.onChange(event);
              }}
            />
            Aluno específico
          </label>
        </div>

        {resolvedRecipientMode === "student" && (
          <div className="space-y-2">
            <Label htmlFor="content-student">Aluno</Label>
            <select
              id="content-student"
              className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
              disabled={studentsLoading || classStudents.length === 0}
              {...form.register("studentId")}
            >
              {studentsLoading && (
                <option value="">Carregando alunos…</option>
              )}
              {!studentsLoading && classStudents.length === 0 && (
                <option value="">Nenhum aluno nesta turma</option>
              )}
              {classStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {form.formState.errors.studentId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.studentId.message}
              </p>
            )}
            {studentsError && (
              <p className="text-sm text-destructive" role="alert">
                {studentsError}
              </p>
            )}
          </div>
        )}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="content-type">Tipo de conteúdo</Label>
        <select
          id="content-type"
          className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          {...contentTypeField}
          onChange={(event) => {
            void contentTypeField.onChange(event);
            if (event.target.value !== "file") {
              setSelectedFiles([]);
            }
          }}
        >
          <option value="text">Texto</option>
          <option value="video_link">Link de vídeo</option>
          <option value="file">Arquivo (PDF ou imagem)</option>
        </select>
      </div>

      {resolvedContentType === "text" && (
        <div className="space-y-2">
          <Label htmlFor="content-body">Conteúdo do material</Label>
          <textarea
            id="content-body"
            rows={6}
            className="flex min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            {...form.register("bodyText")}
          />
          {form.formState.errors.bodyText && (
            <p className="text-sm text-destructive">
              {form.formState.errors.bodyText.message}
            </p>
          )}
        </div>
      )}

      {resolvedContentType === "video_link" && (
        <div className="space-y-2">
          <Label htmlFor="content-video-url">Link do vídeo (HTTPS)</Label>
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

      {resolvedContentType === "file" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={fileInputId}>Arquivos</Label>
            <Input
              id={fileInputId}
              type="file"
              accept={MATERIAL_FILE_ACCEPT}
              multiple
              className="min-h-11"
              disabled={isBusy || selectedFiles.length >= MAX_MATERIAL_ATTACHMENTS}
              onChange={(e) => {
                handleFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />
            <p className="text-sm text-muted-foreground">
              PDF ou imagens (JPEG, PNG, WebP). Até {MAX_MATERIAL_ATTACHMENTS}{" "}
              arquivos, {formatUploadMaxSizeMb()} MB cada.
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <ul className="space-y-3" aria-live="polite">
              {selectedFiles.map((entry) => (
                <li
                  key={entry.clientId}
                  className="rounded-lg border border-border bg-muted/20 p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {entry.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(entry.file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-11 shrink-0"
                      disabled={isBusy}
                      onClick={() => removeFile(entry.clientId)}
                    >
                      Remover
                    </Button>
                  </div>

                  {(entry.status === "uploading" || entry.progress > 0) && (
                    <div className="mt-2 space-y-1">
                      <div
                        className="h-2 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={entry.progress}
                        aria-label={`Progresso do envio de ${entry.file.name}`}
                      >
                        <div
                          className="h-full bg-primary transition-[width]"
                          style={{ width: `${entry.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.status === "uploaded"
                          ? "Enviado"
                          : `Enviando… ${entry.progress}%`}
                      </p>
                    </div>
                  )}

                  {entry.status === "error" && entry.error && (
                    <p className="mt-2 text-xs text-destructive" role="alert">
                      {entry.error}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button type="submit" className="w-full min-h-11" disabled={isBusy || assignedClasses.length === 0}>
        {isUploading
          ? "Enviando arquivos…"
          : form.formState.isSubmitting
            ? "Publicando material…"
            : "Enviar material"}
      </Button>

      {classesError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {classesError}
        </div>
      )}

      {assignedClasses.length === 0 && !classesError && (
        <p className="text-sm text-destructive" role="alert">
          Nenhuma turma vinculada ao seu perfil. Entre em contato com a coordenação.
        </p>
      )}

      {lastContentId && (
        <p className="text-center text-sm text-muted-foreground">
          Material publicado.{" "}
          <Link
            href="/teacher/materiais"
            className="text-primary font-medium underline-offset-2 hover:underline"
          >
            Ver na lista
          </Link>
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
