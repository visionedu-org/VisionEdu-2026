import { z } from "zod";
import { ACTIVITY_CITIES } from "@/lib/constants/activity-cities";

const activityCityValues = ACTIVITY_CITIES.map((c) => c.value) as [
  (typeof ACTIVITY_CITIES)[number]["value"],
  ...(typeof ACTIVITY_CITIES)[number]["value"][],
];

export const activityCitySchema = z.enum(activityCityValues, {
  message: "Selecione uma cidade de atuação",
});

export const userRoleSchema = z.enum(["student", "teacher"]);

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  role: userRoleSchema,
});

export const classAssignmentSchema = z.object({
  school_id: z.string().uuid(),
  grade: z.enum(["1", "2", "3"]),
  class_identifier: z.string().min(1, "Selecione a turma"),
});

export const teacherClassInSchoolSchema = z.object({
  grade: z.enum(["1", "2", "3"]),
  class_identifier: z.string().min(1, "Selecione a turma"),
});

export const teacherSchoolBlockSchema = z.object({
  school_id: z.string().uuid("Selecione uma escola"),
  classes: z
    .array(teacherClassInSchoolSchema)
    .min(1, "Adicione ao menos uma turma nesta escola"),
});

const termsAcceptedSchema = z
  .boolean()
  .refine((v) => v === true, {
    message: "Você precisa aceitar os termos para continuar",
  });

/** Campos de cadastro de aluno (sem termos — usado na API). */
export const registerStudentBaseSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  city: activityCitySchema,
  school_id: z.string().uuid(),
  grade: z.enum(["1", "2", "3"]),
  class_identifier: z.string().min(1),
});

export const registerStudentSchema = registerStudentBaseSchema.extend({
  termsAccepted: termsAcceptedSchema,
});

export const registerStudentApiSchema = registerStudentBaseSchema;

function uniqueTeacherSchools(data: { schools: { school_id: string }[] }) {
  const ids = data.schools.map((s) => s.school_id);
  return new Set(ids).size === ids.length;
}

/** Campos de cadastro de professor (sem termos — usado na API). */
export const registerTeacherBaseSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  city: activityCitySchema,
  schools: z
    .array(teacherSchoolBlockSchema)
    .min(1, "Selecione ao menos uma escola")
    .max(10),
});

export const registerTeacherApiSchema = registerTeacherBaseSchema.refine(
  uniqueTeacherSchools,
  {
    message: "Cada escola deve ser selecionada apenas uma vez",
    path: ["schools"],
  }
);

export const registerTeacherSchema = registerTeacherBaseSchema
  .extend({
    termsAccepted: termsAcceptedSchema,
  })
  .refine(uniqueTeacherSchools, {
    message: "Cada escola deve ser selecionada apenas uma vez",
    path: ["schools"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>;
export type RegisterTeacherFormValues = z.infer<typeof registerTeacherSchema>;
export type RegisterStudentApiPayload = z.infer<typeof registerStudentApiSchema>;
export type RegisterTeacherApiPayload = z.infer<typeof registerTeacherApiSchema>;
