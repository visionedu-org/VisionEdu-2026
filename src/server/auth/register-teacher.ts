import { Cargo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AuthResponse } from "@/types/domain";
import type { RegisterTeacherApiPayload } from "@/lib/validations/auth";
import { hashPassword } from "./password";
import { signAccessToken } from "./jwt";
import { mapUserToDomain, userInclude } from "./user-mapper";
import { AuthRegisterError } from "./register-student";
import {
  createTeacherAssignmentsFromRegistration,
  TeacherAssignmentsInvalidError,
} from "@/server/teacher/sync-assignments";

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

  let assignmentData;
  try {
    assignmentData = await createTeacherAssignmentsFromRegistration(
      values.schools
    );
  } catch (err) {
    if (err instanceof TeacherAssignmentsInvalidError) {
      throw new AuthRegisterError(err.message, 422, err.fieldErrors);
    }
    throw err;
  }

  const { schoolIds, classIds, materiaRows } = assignmentData;

  if (schoolIds.length === 0 || classIds.length === 0 || materiaRows.length === 0) {
    throw new AuthRegisterError("Dados incompletos", 422, {
      schools: "Informe escolas, turmas e matérias",
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
          classMaterias: {
            create: materiaRows.map((row) => ({
              classId: row.classId,
              schoolId: row.schoolId,
              materia: row.materia,
            })),
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
