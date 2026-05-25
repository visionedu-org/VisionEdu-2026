import { z } from "zod";
import { ACTIVITY_CITIES } from "@/lib/constants/activity-cities";
import { teacherSchoolsPayloadSchema } from "@/lib/validations/teacher-assignments";

const activityCityValues = ACTIVITY_CITIES.map((c) => c.value) as [
  (typeof ACTIVITY_CITIES)[number]["value"],
  ...(typeof ACTIVITY_CITIES)[number]["value"][],
];

const activityCitySchema = z.enum(activityCityValues, {
  message: "Selecione uma cidade de atuação",
});

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

const termsAcceptedSchema = z
  .boolean()
  .refine((v) => v === true, {
    message: "Você precisa aceitar os termos para continuar",
  });

const registerStudentBaseSchema = z.object({
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

const registerTeacherBaseSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  city: activityCitySchema,
  schools: teacherSchoolsPayloadSchema,
});

export const registerTeacherApiSchema = registerTeacherBaseSchema;

export const registerTeacherSchema = registerTeacherBaseSchema.extend({
  termsAccepted: termsAcceptedSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>;
export type RegisterTeacherFormValues = z.infer<typeof registerTeacherSchema>;
export type RegisterTeacherApiPayload = z.infer<typeof registerTeacherApiSchema>;
