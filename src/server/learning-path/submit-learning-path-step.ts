import { prisma } from "@/lib/prisma";
import { buildQuestionKey } from "@/lib/enem/question-key";
import { enrichQuestion } from "@/lib/enem/question-metadata";
import { mapLearningPathToModules } from "@/server/learning-path/map-learning-path-modules";
import { getStudentContext } from "@/server/student/get-student-context";
import { fetchEnemApi } from "@/server/enem/fetch-enem";
import type { LearningPathModule } from "@/types/domain";
import type { EnemAlternativeLetter } from "@/types/enem";
import type { LearningPathStepSubmitResult } from "@/types/learning-path";

export class LearningPathStepNotFoundError extends Error {
  constructor() {
    super("Etapa da trilha não encontrada.");
    this.name = "LearningPathStepNotFoundError";
  }
}

export class LearningPathStepLockedError extends Error {
  constructor() {
    super("Esta etapa ainda está bloqueada. Complete a etapa anterior.");
    this.name = "LearningPathStepLockedError";
  }
}

export async function submitLearningPathStepAnswer(
  studentUserId: string,
  stepId: string,
  selectedLetter: EnemAlternativeLetter
): Promise<{
  result: LearningPathStepSubmitResult;
  modules: LearningPathModule[];
  pathId: string;
}> {
  const { studentId } = await getStudentContext(studentUserId);

  const step = await prisma.learningPathStep.findFirst({
    where: {
      id: stepId,
      path: { studentId, isActive: true },
    },
    include: { path: { include: { steps: true } } },
  });

  if (!step) {
    throw new LearningPathStepNotFoundError();
  }

  if (step.status === "locked") {
    throw new LearningPathStepLockedError();
  }

  if (step.status === "completed") {
    return {
      result: {
        isCorrect: true,
        status: "completed",
        nextStepUnlocked: false,
      },
      modules: mapLearningPathToModules(step.path),
      pathId: step.pathId,
    };
  }

  const query = step.questionLanguage
    ? `?language=${encodeURIComponent(step.questionLanguage)}`
    : "";

  const raw = await fetchEnemApi<Parameters<typeof enrichQuestion>[0]>(
    `/exams/${step.questionYear}/questions/${step.questionIndex}${query}`,
    { revalidate: 3600 }
  );
  const question = enrichQuestion({ ...raw, year: step.questionYear });
  const isCorrect = selectedLetter === question.correctAlternative;
  const questionKey = buildQuestionKey(
    step.questionYear,
    step.questionIndex,
    step.questionLanguage
  );

  await prisma.enemQuestionAttempt.upsert({
    where: {
      studentId_questionKey: { studentId, questionKey },
    },
    create: {
      studentId,
      questionKey,
      year: step.questionYear,
      index: step.questionIndex,
      language: step.questionLanguage,
      discipline: question.discipline,
      primarySkill: question.skills[0] ?? null,
      selectedLetter,
      correctLetter: question.correctAlternative,
      isCorrect,
      source: "learning_path",
      answeredAt: new Date(),
    },
    update: {
      selectedLetter,
      correctLetter: question.correctAlternative,
      isCorrect,
      discipline: question.discipline,
      primarySkill: question.skills[0] ?? null,
      source: "learning_path",
      answeredAt: new Date(),
    },
  });

  if (!isCorrect) {
    return {
      result: {
        isCorrect: false,
        status: "in_progress",
        nextStepUnlocked: false,
      },
      modules: mapLearningPathToModules(step.path),
      pathId: step.pathId,
    };
  }

  const updatedPath = await prisma.$transaction(async (tx) => {
    await tx.learningPathStep.update({
      where: { id: step.id },
      data: { status: "completed", completedAt: new Date() },
    });

    const nextStep = step.path.steps.find(
      (s) => s.orderIndex === step.orderIndex + 1
    );
    if (nextStep) {
      await tx.learningPathStep.update({
        where: { id: nextStep.id },
        data: { status: "in_progress" },
      });
    }

    return tx.studentLearningPath.findUniqueOrThrow({
      where: { id: step.pathId },
      include: { steps: { orderBy: { orderIndex: "asc" } } },
    });
  });

  return {
    result: {
      isCorrect: true,
      status: "completed",
      nextStepUnlocked: step.orderIndex < step.path.steps.length - 1,
    },
    modules: mapLearningPathToModules(updatedPath),
    pathId: step.pathId,
  };
}
