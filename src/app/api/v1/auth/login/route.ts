import { loginSchema } from "@/lib/validations/auth";
import { loginUser, AuthLoginError } from "@/server/auth/login";
import { jsonWithSessionCookie } from "@/server/auth/auth-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Dados inválidos", errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const result = await loginUser(parsed.data);
    return jsonWithSessionCookie(result);
  } catch (err) {
    if (err instanceof AuthLoginError) {
      return Response.json({ message: err.message }, { status: err.status });
    }
    console.error("[auth/login]", err);
    return Response.json(
      { message: "Não foi possível entrar. Tente novamente." },
      { status: 500 }
    );
  }
}
