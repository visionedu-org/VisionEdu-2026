import { z } from "zod";
import { BNCC_COMPETENCY_CODES } from "@/mocks/data/bncc-competencies";

export const TEACHER_DISCIPLINES = [
  "Matemática",
  "Português",
  "História",
  "Geografia",
] as const;

export type TeacherDiscipline = (typeof TEACHER_DISCIPLINES)[number];

const teacherContentTypeSchema = z.enum(["text", "video_link", "file"]);

const optionalStudentIdSchema = z
  .union([
    z.string().uuid("Selecione um aluno válido"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

export const contentFormSchema = z
  .object({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
    description: z.string().min(1, "Descrição é obrigatória"),
    subject: z.enum(TEACHER_DISCIPLINES),
    schoolId: z.string().uuid("Selecione uma escola vinculada"),
    grade: z.enum(["1", "2", "3"]),
    classId: z.string().uuid("Selecione uma turma válida"),
    recipientMode: z.enum(["class", "student"]),
    studentId: optionalStudentIdSchema,
    contentType: teacherContentTypeSchema,
    bodyText: z.string().optional(),
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
        return;
      }
      if (!url.startsWith("https://")) {
        ctx.addIssue({
          code: "custom",
          message: "O link deve começar com https://",
          path: ["videoUrl"],
        });
      }
    }

    if (data.contentType === "text") {
      const body = data.bodyText?.trim() ?? "";
      if (body.length < 1) {
        ctx.addIssue({
          code: "custom",
          message: "Informe o conteúdo do material",
          path: ["bodyText"],
        });
      }
    }

    if (data.recipientMode === "student") {
      const studentId = data.studentId?.trim() ?? "";
      if (!studentId) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione o aluno destinatário",
          path: ["studentId"],
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
