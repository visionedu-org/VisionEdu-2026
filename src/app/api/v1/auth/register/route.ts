import {
  registerStudentApiSchema,
  registerTeacherApiSchema,
} from "@/lib/validations/auth";
import { registerStudent, AuthRegisterError } from "@/server/auth/register-student";
import { registerTeacher } from "@/server/auth/register-teacher";
import { jsonWithSessionCookie } from "@/server/auth/auth-response";
import type { UserRole } from "@/types/domain";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const role = body.role as UserRole | undefined;

    if (!role || (role !== "student" && role !== "teacher")) {
      return Response.json(
        { message: "Perfil inválido", errors: { role: "Perfil obrigatório" } },
        { status: 422 }
      );
    }

    if (role === "student") {
      const parsed = registerStudentApiSchema.safeParse(body);
      if (!parsed.success) {
        return Response.json(
          {
            message: "Dados inválidos",
            errors: parsed.error.flatten().fieldErrors,
          },
          { status: 422 }
        );
      }
      const result = await registerStudent(parsed.data);
      return jsonWithSessionCookie(result, 201);
    }

    const parsed = registerTeacherApiSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          message: "Dados inválidos",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }
    const result = await registerTeacher(parsed.data);
    return jsonWithSessionCookie(result, 201);
  } catch (err) {
    if (err instanceof AuthRegisterError) {
      return Response.json(
        { message: err.message, errors: err.fieldErrors },
        { status: err.status }
      );
    }
    console.error("[auth/register]", err);
    return Response.json(
      { message: "Não foi possível concluir o cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
