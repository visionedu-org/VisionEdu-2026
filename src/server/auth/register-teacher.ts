import { Cargo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthResponse } from "@/types/domain";
import type { RegisterTeacherApiPayload } from "@/lib/validations/auth";
import { hashPassword } from "./password";
import { signAccessToken } from "./jwt";
import { mapUserToDomain, userInclude } from "./user-mapper";
import { AuthRegisterError } from "./register-student";
import { findOrCreateClassGroup } from "./class-group";

export async function registerTeacher(
  values: RegisterTeacherApiPayload
): Promise<AuthResponse> {
  const email = values.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthRegisterError("E-mail já cadastrado", 422, {
      email: "Este e-mail já está em uso",
    });
  }

  const schoolIds: string[] = [];
  const classIds: string[] = [];

  for (const schoolBlock of values.schools) {
    if (!schoolIds.includes(schoolBlock.school_id)) {
      schoolIds.push(schoolBlock.school_id);
    }

    for (const classEntry of schoolBlock.classes) {
      const classGroup = await findOrCreateClassGroup({
        schoolId: schoolBlock.school_id,
        grade: classEntry.grade,
        classIdentifier: classEntry.class_identifier,
      });

      if (!classIds.includes(classGroup.id)) {
        classIds.push(classGroup.id);
      }
    }
  }

  if (schoolIds.length === 0 || classIds.length === 0) {
    throw new AuthRegisterError("Dados incompletos", 422, {
      schools: "Informe escolas e turmas",
    });
  }

  const passwordHash = await hashPassword(values.password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: values.name.trim(),
      city: values.city,
      cargo: Cargo.professor,
      teacherProfile: {
        create: {
          schools: {
            create: schoolIds.map((schoolId) => ({ schoolId })),
          },
          assignments: {
            create: classIds.map((classId) => ({ classId })),
          },
        },
      },
    },
    include: userInclude,
  });

  const { token, expiresIn } = await signAccessToken({
    userId: user.id,
    role: "teacher",
    email: user.email,
  });

  return {
    access_token: token,
    expires_in: expiresIn,
    user: mapUserToDomain(user),
  };
}
