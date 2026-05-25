import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireTeacher } from "@/server/auth/require-auth";
import { mapUserToDomain, userInclude } from "@/server/auth/user-mapper";
import { TeacherProfileNotFoundError } from "@/server/materials/create-material";
import { getTeacherAssignmentsPayload } from "@/server/teacher/get-assignments";
import {
  syncTeacherAssignments,
  TeacherAssignmentsInvalidError,
} from "@/server/teacher/sync-assignments";
import { updateTeacherAssignmentsSchema } from "@/lib/validations/teacher-assignments";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await requireTeacher(request);
    const schools = await getTeacherAssignmentsPayload(userId);
    return Response.json({ schools });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof TeacherProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    console.error("[teachers/me/assignments GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar seus vínculos. Tente novamente."
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await requireTeacher(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "invalid_json", "Corpo da requisição inválido");
    }

    const parsed = updateTeacherAssignmentsSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(400, "validation_error", "Dados inválidos", {
        fieldErrors: parsed.error.flatten().fieldErrors,
      });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!teacher) {
      throw new TeacherProfileNotFoundError();
    }

    await syncTeacherAssignments(teacher.id, parsed.data.schools);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: userInclude,
    });

    return Response.json({
      schools: await getTeacherAssignmentsPayload(userId),
      user: mapUserToDomain(user),
    });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }

    if (err instanceof TeacherProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }

    if (err instanceof TeacherAssignmentsInvalidError) {
      return jsonError(422, "validation_error", err.message, {
        fieldErrors: err.fieldErrors,
      });
    }

    console.error("[teachers/me/assignments PATCH]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível atualizar seus vínculos. Tente novamente."
    );
  }
}
