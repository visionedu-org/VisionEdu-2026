import { z } from "zod";
import { BNCC_COMPETENCY_CODES } from "@/mocks/data/bncc-competencies";

export const TEACHER_DISCIPLINES = [
  "Matemática",
  "Português",
  "História",
  "Geografia",
] as const;

const teacherContentTypeSchema = z.enum([
  "text",
  "video_link",
  "pdf_upload",
]);

export const contentFormSchema = z
  .object({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
    description: z.string().min(1, "Descrição é obrigatória"),
    subject: z.enum(TEACHER_DISCIPLINES),
    grade: z.enum(["1", "2", "3"]),
    class_identifier: z.string().min(1, "Selecione a turma"),
    contentType: teacherContentTypeSchema,
    videoUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contentType === "video_link") {
      const url = data.videoUrl?.trim() ?? "";
      if (!url) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o link do vídeo",
          path: ["videoUrl"],
        });
        return;
      }
      try {
        z.string().url().parse(url);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "Informe um link válido",
          path: ["videoUrl"],
        });
      }
    }
  });

const diagnosticQuestionSchema = z.object({
  prompt: z.string().min(3, "Enunciado é obrigatório"),
  options: z
    .tuple([
      z.string().min(1, "Alternativa obrigatória"),
      z.string().min(1, "Alternativa obrigatória"),
      z.string().min(1, "Alternativa obrigatória"),
      z.string().min(1, "Alternativa obrigatória"),
    ])
    .refine(
      (opts) => opts.every((o) => o.trim().length > 0),
      { message: "Preencha as quatro alternativas" }
    ),
  bnccCode: z.enum(BNCC_COMPETENCY_CODES, {
    message: "Selecione uma habilidade BNCC",
  }),
  correctOptionIndex: z.number().int().min(0).max(3),
});

export const diagnosticFormSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  grade: z.enum(["1", "2", "3"]),
  class_identifier: z.string().min(1, "Selecione a turma"),
  questions: z
    .array(diagnosticQuestionSchema)
    .min(1, "Adicione pelo menos uma questão")
    .max(10, "Máximo de 10 questões"),
});

export type ContentFormValues = z.infer<typeof contentFormSchema>;
export type DiagnosticFormValues = z.infer<typeof diagnosticFormSchema>;
