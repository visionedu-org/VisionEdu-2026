import { enrichQuestion } from "@/lib/enem/question-metadata";
import { jsonError } from "@/server/auth/api-error";
import { AuthRequiredError, requireStudent } from "@/server/auth/require-auth";
import {
  LearningPathStepLockedError,
  LearningPathStepNotFoundError,
} from "@/server/learning-path/submit-learning-path-step";
import { StudentProfileNotFoundError } from "@/server/materials/list-student-materials";
import { getStudentContext } from "@/server/student/get-student-context";
import { fetchEnemApi } from "@/server/enem/fetch-enem";
import { EnemApiError } from "@/server/enem/fetch-enem";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ stepId: string }> }
) {
  try {
    const { userId } = await requireStudent(request);
    const { studentId } = await getStudentContext(userId);
    const { stepId } = await context.params;

    const step = await prisma.learningPathStep.findFirst({
      where: {
        id: stepId,
        path: { studentId, isActive: true },
      },
      include: {
        path: { select: { id: true, title: true } },
      },
    });

    if (!step) {
      throw new LearningPathStepNotFoundError();
    }

    if (step.status === "locked") {
      throw new LearningPathStepLockedError();
    }

    const query = step.questionLanguage
      ? `?language=${encodeURIComponent(step.questionLanguage)}`
      : "";

    const raw = await fetchEnemApi<Parameters<typeof enrichQuestion>[0]>(
      `/exams/${step.questionYear}/questions/${step.questionIndex}${query}`,
      { revalidate: 3600 }
    );
    const question = enrichQuestion({ ...raw, year: step.questionYear });

    return Response.json({
      step: {
        id: step.id,
        pathId: step.pathId,
        pathTitle: step.path.title,
        orderIndex: step.orderIndex,
        title: step.title,
        description: step.description,
        status: step.status,
        skill: step.skill,
        discipline: step.discipline,
        videoUrl: step.videoUrl,
      },
      question,
    });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return jsonError(err.status, err.code, err.message);
    }
    if (err instanceof StudentProfileNotFoundError) {
      return jsonError(403, "forbidden", err.message);
    }
    if (err instanceof LearningPathStepNotFoundError) {
      return jsonError(404, "not_found", err.message);
    }
    if (err instanceof LearningPathStepLockedError) {
      return jsonError(403, "forbidden", err.message);
    }
    if (err instanceof EnemApiError) {
      return jsonError(
        err.status === 404 ? 404 : err.status,
        "enem_api_error",
        err.message
      );
    }
    console.error("[students/me/learning-path/steps/stepId GET]", err);
    return jsonError(
      500,
      "internal_error",
      "Não foi possível carregar a etapa da trilha."
    );
  }
}
