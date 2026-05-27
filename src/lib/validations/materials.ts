import { z } from "zod";
import { buildQuestionKey } from "@/lib/enem/question-key";
import { TEACHER_DISCIPLINES } from "@/lib/validations/teacher";
import type { MaterialContentType, MaterialListFilters } from "@/types/materials";

const materialContentTypeSchema = z.enum([
  "text",
  "video_link",
  "file",
  "questions",
]);

const materialEnemQuestionSchema = z.object({
  year: z.number().int().min(2009).max(2100),
  index: z.number().int().min(1).max(200),
  language: z.string().trim().optional().nullable(),
});

const MAX_MATERIAL_ENEM_QUESTIONS = 50;

const MAX_SEARCH_LENGTH = 200;

const materialClassRecipientSchema = z.object({
  targetType: z.literal("class"),
  classId: z.string().uuid("Informe um identificador de turma válido"),
});

const materialStudentRecipientSchema = z.object({
  targetType: z.literal("student"),
  classId: z.string().uuid("Informe um identificador de turma válido"),
  studentId: z.string().uuid("Informe um identificador de aluno válido"),
});

const materialRecipientSchema = z.discriminatedUnion("targetType", [
  materialClassRecipientSchema,
  materialStudentRecipientSchema,
]);

export const createMaterialSchema = z
  .object({
    title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
    description: z.string().min(1, "Descrição é obrigatória"),
    discipline: z.enum(TEACHER_DISCIPLINES),
    contentType: materialContentTypeSchema,
    bodyText: z.string().optional().nullable(),
    videoUrl: z.string().optional().nullable(),
    recipients: z
      .array(materialRecipientSchema)
      .min(1, "Selecione ao menos um destinatário"),
    attachmentIds: z
      .array(z.string().uuid("Identificador de anexo inválido"))
      .optional(),
    enemQuestions: z.array(materialEnemQuestionSchema).optional(),
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

    if (data.contentType === "file") {
      const ids = data.attachmentIds ?? [];
      if (ids.length < 1) {
        ctx.addIssue({
          code: "custom",
          message: "Envie ao menos um arquivo antes de publicar o material",
          path: ["attachmentIds"],
        });
        return;
      }
      const unique = new Set(ids);
      if (unique.size !== ids.length) {
        ctx.addIssue({
          code: "custom",
          message: "Lista de anexos contém identificadores duplicados",
          path: ["attachmentIds"],
        });
      }
    }

    if (data.contentType !== "file" && (data.attachmentIds?.length ?? 0) > 0) {
      ctx.addIssue({
        code: "custom",
        message: "Anexos só são permitidos para materiais do tipo arquivo",
        path: ["attachmentIds"],
      });
    }

    if (data.contentType === "questions") {
      const questions = data.enemQuestions ?? [];
      if (questions.length < 1) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione ao menos uma questão ENEM",
          path: ["enemQuestions"],
        });
        return;
      }
      if (questions.length > MAX_MATERIAL_ENEM_QUESTIONS) {
        ctx.addIssue({
          code: "custom",
          message: `Selecione no máximo ${MAX_MATERIAL_ENEM_QUESTIONS} questões`,
          path: ["enemQuestions"],
        });
        return;
      }
      const keys = new Set<string>();
      for (const question of questions) {
        const key = buildQuestionKey(
          question.year,
          question.index,
          question.language
        );
        if (keys.has(key)) {
          ctx.addIssue({
            code: "custom",
            message: "A lista de questões contém itens duplicados",
            path: ["enemQuestions"],
          });
          return;
        }
        keys.add(key);
      }
    }

    if (
      data.contentType !== "questions" &&
      (data.enemQuestions?.length ?? 0) > 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Questões ENEM só são permitidas para materiais do tipo questões",
        path: ["enemQuestions"],
      });
    }
  });

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;

function parseOptionalDate(value: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) return undefined;
  return value.trim();
}

/** Query params compartilhados entre listagens de professor e aluno. */
export function parseMaterialsListFilters(
  searchParams: URLSearchParams
): MaterialListFilters {
  const filters: MaterialListFilters = {};

  const classId = searchParams.get("classId")?.trim();
  if (classId && z.string().uuid().safeParse(classId).success) {
    filters.classId = classId;
  }

  const discipline = searchParams.get("discipline")?.trim();
  if (
    discipline &&
    (TEACHER_DISCIPLINES as readonly string[]).includes(discipline)
  ) {
    filters.discipline = discipline;
  }

  const contentType = searchParams.get("contentType")?.trim();
  const parsedType = materialContentTypeSchema.safeParse(contentType);
  if (parsedType.success) {
    filters.contentType = parsedType.data as MaterialContentType;
  }

  const dateFrom = parseOptionalDate(searchParams.get("dateFrom"));
  if (dateFrom) filters.dateFrom = dateFrom;

  const dateTo = parseOptionalDate(searchParams.get("dateTo"));
  if (dateTo) filters.dateTo = dateTo;

  const q = searchParams.get("q")?.trim();
  if (q) {
    filters.q = q.slice(0, MAX_SEARCH_LENGTH);
  }

  return filters;
}

/** Payload legado `POST /teachers/contents` (RF-B13). */
export const legacyCreateContentSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(1, "Descrição é obrigatória"),
  discipline: z.enum(TEACHER_DISCIPLINES),
  grade: z.enum(["1", "2", "3"]),
  class_identifier: z.string().min(1, "Informe a turma"),
  type: z.enum(["text", "video_link", "pdf_upload"]),
});

export type LegacyCreateContentInput = z.infer<typeof legacyCreateContentSchema>;
