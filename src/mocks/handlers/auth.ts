import { http, HttpResponse } from "msw";
import type { User, UserRole } from "@/types/domain";
import { addUser, getUserByEmail, resetAuthMemory } from "@/mocks/auth-store-memory";
import { CETI_SCHOOL_ID } from "@/mocks/data/ceti-seed";

function createToken(role: UserRole) {
  return `mock.jwt.${role}.${Date.now()}`;
}

function expiresForRole(role: UserRole) {
  return role === "student" ? 28800 : 86400;
}

export const authHandlers = [
  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      role?: UserRole;
    };

    const record = getUserByEmail(body.email);
    if (!record || record.password !== body.password) {
      return HttpResponse.json(
        { message: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    if (body.role && record.role !== body.role) {
      return HttpResponse.json(
        { message: "Perfil não corresponde ao tipo de acesso selecionado" },
        { status: 401 }
      );
    }

    const { password: _password, ...user } = record;
    void _password;
    return HttpResponse.json({
      access_token: createToken(user.role),
      expires_in: expiresForRole(user.role),
      user,
    });
  }),

  http.post("/api/v1/auth/register", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const role = body.role as UserRole;

    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json(
        { message: "Dados incompletos", errors: { root: "Preencha todos os campos" } },
        { status: 422 }
      );
    }

    const email = String(body.email).toLowerCase();
    if (getUserByEmail(email)) {
      return HttpResponse.json(
        { message: "E-mail já cadastrado", errors: { email: "Este e-mail já está em uso" } },
        { status: 422 }
      );
    }

    const id = crypto.randomUUID();
    let user: User;

    if (role === "student") {
      user = {
        id,
        name: String(body.name),
        email,
        role: "student",
        school_id: String(body.school_id ?? CETI_SCHOOL_ID),
        grade: String(body.grade),
        class_identifier: String(body.class_identifier),
      };
    } else {
      const classes = (body.classes as User["teacher_classes"]) ?? [];
      user = {
        id,
        name: String(body.name),
        email,
        role: "teacher",
        teacher_classes: classes,
      };
    }

    addUser(user, String(body.password));

    return HttpResponse.json(
      {
        access_token: createToken(user.role),
        expires_in: expiresForRole(user.role),
        user,
      },
      { status: 201 }
    );
  }),
];

export function resetAuthHandlers() {
  resetAuthMemory();
}
