import { Cargo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthResponse } from "@/types/domain";
import type { RegisterStudentFormValues } from "@/lib/validations/auth";
import { hashPassword } from "./password";
import { signAccessToken } from "./jwt";
import { mapUserToDomain, userInclude } from "./user-mapper";
import { findOrCreateClassGroup } from "./class-group";

export class AuthRegisterError extends Error {
  constructor(
    message: string,
    public status: number,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "AuthRegisterError";
  }
}

export async function registerStudent(
  values: Omit<RegisterStudentFormValues, "termsAccepted">
): Promise<AuthResponse> {
  const email = values.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthRegisterError("E-mail já cadastrado", 422, {
      email: "Este e-mail já está em uso",
    });
  }

  const classGroup = await findOrCreateClassGroup({
    schoolId: values.school_id,
    grade: values.grade,
    classIdentifier: values.class_identifier,
  });

  const passwordHash = await hashPassword(values.password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: values.name.trim(),
      city: values.city,
      cargo: Cargo.estudante,
      studentProfile: {
        create: {
          schoolId: values.school_id,
          classId: classGroup.id,
        },
      },
    },
    include: userInclude,
  });

  const { token, expiresIn } = await signAccessToken({
    userId: user.id,
    role: "student",
    email: user.email,
  });

  return {
    access_token: token,
    expires_in: expiresIn,
    user: mapUserToDomain(user),
  };
}
