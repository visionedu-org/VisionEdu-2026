import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import { getStudentContext } from "@/server/student/get-student-context";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";

const syncSchema = z.object({
  attempts: z
    .array(
      z.object({
        questionKey: z.string().min(1),
        year: z.number().int(),
        index: z.number().int(),
        language: z.string().nullable().optional(),
        discipline: z.string().nullable().optional(),
        selectedLetter: z.enum(["A", "B", "C", "D", "E"]),
        correctLetter: z.enum(["A", "B", "C", "D", "E"]),
        isCorrect: z.boolean(),
        answeredAt: z.string().optional(),
      })
    )
    .max(500),
});

export async function POST(request: Request) {
  try {
    const { userId } = await requireStudent(request);
    const { studentId } = await getStudentContext(userId);

    const body: unknown = await request.json().catch(() => null);
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, "bad_request", "Dados de sincronização inválidos.");
    }

    for (const attempt of parsed.data.attempts) {
      await prisma.enemQuestionAttempt.upsert({
        where: {
          studentId_questionKey: {
            studentId,
            questionKey: attempt.questionKey,
          },
        },
        create: {
          studentId,
          questionKey: attempt.questionKey,
          year: attempt.year,
          index: attempt.index,
          language: attempt.language ?? null,
          discipline: attempt.discipline ?? null,
          primarySkill: null,
          selectedLetter: attempt.selectedLetter,
          correctLetter: attempt.correctLetter,
          isCorrect: attempt.isCorrect,
          answeredAt: attempt.answeredAt
            ? new Date(attempt.answeredAt)
            : new Date(),
        },
        update: {
          selectedLetter: attempt.selectedLetter,
          correctLetter: attempt.correctLetter,
          isCorrect: attempt.isCorrect,
          answeredAt: attempt.answeredAt
            ? new Date(attempt.answeredAt)
            : new Date(),
        },
      });
    }

    return Response.json({ synced: parsed.data.attempts.length });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    console.error("[students/enem/attempts/sync POST]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível sincronizar suas respostas."
    );
  }
}
