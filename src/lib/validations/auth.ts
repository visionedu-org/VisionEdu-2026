import { z } from "zod";

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

export const registerStudentSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  school_id: z.string().uuid(),
  grade: z.enum(["1", "2", "3"]),
  class_identifier: z.string().min(1),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, {
      message: "Você precisa aceitar os termos para continuar",
    }),
});

export const registerTeacherSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  classes: z.array(classAssignmentSchema).min(1).max(6),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, {
      message: "Você precisa aceitar os termos para continuar",
    }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>;
export type RegisterTeacherFormValues = z.infer<typeof registerTeacherSchema>;
