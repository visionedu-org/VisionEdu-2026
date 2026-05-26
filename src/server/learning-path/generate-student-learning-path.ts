import { prisma } from "@/lib/prisma";
import { buildQuestionKey } from "@/lib/enem/question-key";
import { collectCandidateQuestionsForWeaknesses } from "@/server/learning-path/collect-candidate-questions";
import { diagnoseStudentWeaknesses } from "@/server/learning-path/diagnose-student-weaknesses";
import { mapLearningPathToModules } from "@/server/learning-path/map-learning-path-modules";
import { requestLearningPathGeneration } from "@/server/n8n/request-learning-path-generation";
import { N8nRequestError } from "@/server/n8n/n8n-errors";
import type { LearningPathModule } from "@/types/domain";
import type { LearningPathCandidateQuestion } from "@/types/learning-path";

function buildPathTitleHint(
  weaknesses: Awaited<ReturnType<typeof diagnoseStudentWeaknesses>>
): string {
  const labels = weaknesses
    .slice(0, 3)
    .map((w) => w.skill)
    .join(", ");
  return labels ? `Trilha personalizada: ${labels}` : "Trilha personalizada ENEM";
}

function fallbackPathFromCandidates(
  candidates: LearningPathCandidateQuestion[],
  weaknesses: Awaited<ReturnType<typeof diagnoseStudentWeaknesses>>
) {
  const usedKeys = new Set<string>();
  const steps: {
    title: string;
    description: string;
    questionKey: string;
    discipline: string | null;
    skill: string | null;
  }[] = [];

  for (const weakness of weaknesses) {
    const match = candidates.find(
      (c) =>
        !usedKeys.has(c.questionKey) &&
        c.skills.some((s) =>
          s.toLowerCase().includes(weakness.skill.toLowerCase())
        ) &&
        (!weakness.discipline || c.discipline === weakness.discipline)
    );
    if (!match) continue;
    usedKeys.add(match.questionKey);
    steps.push({
      title: weakness.skill,
      description: `Pratique ${weakness.skill} com uma questão selecionada para você.`,
      questionKey: match.questionKey,
      discipline: match.discipline,
      skill: weakness.skill,
    });
    if (steps.length >= 6) break;
  }

  for (const candidate of candidates) {
    if (steps.length >= 6) break;
    if (usedKeys.has(candidate.questionKey)) continue;
    usedKeys.add(candidate.questionKey);
    steps.push({
      title: candidate.skills[0] ?? "Revisão ENEM",
      description: "Etapa de reforço com questão do ENEM.",
      questionKey: candidate.questionKey,
      discipline: candidate.discipline,
      skill: candidate.skills[0] ?? null,
    });
  }

  return {
    pathTitle: buildPathTitleHint(weaknesses),
    summary: "Trilha gerada automaticamente com base no seu desempenho.",
    steps,
  };
}

function parseQuestionKey(questionKey: string): {
  year: number;
  index: number;
  language: string | null;
} | null {
  const parts = questionKey.split(":");
  if (parts.length < 2) return null;
  const year = Number.parseInt(parts[0] ?? "", 10);
  const index = Number.parseInt(parts[1] ?? "", 10);
  if (!Number.isFinite(year) || !Number.isFinite(index)) return null;
  const languagePart = parts[2];
  const language =
    languagePart && languagePart !== "default" ? languagePart : null;
  return { year, index, language };
}

export async function generateStudentLearningPath(studentId: string): Promise<{
  pathId: string;
  pathTitle: string;
  pathSummary: string | null;
  modules: LearningPathModule[];
}> {
  const weaknesses = await diagnoseStudentWeaknesses(studentId);

  const priorAttempts = await prisma.enemQuestionAttempt.findMany({
    where: { studentId, isCorrect: true },
    select: { questionKey: true },
  });
  const excludeKeys = new Set(priorAttempts.map((a) => a.questionKey));

  const candidates = await collectCandidateQuestionsForWeaknesses(
    weaknesses,
    excludeKeys
  );

  if (candidates.length === 0) {
    throw new N8nRequestError(
      "Não encontramos questões compatíveis com seu diagnóstico. Tente praticar mais questões ENEM primeiro."
    );
  }

  const candidateMap = new Map(
    candidates.map((c) => [c.questionKey, c] as const)
  );

  let aiResult;
  try {
    aiResult = await requestLearningPathGeneration({
      studentId,
      pathTitleHint: buildPathTitleHint(weaknesses),
      weaknesses,
      candidates,
    });
  } catch {
    aiResult = fallbackPathFromCandidates(candidates, weaknesses);
  }

  const validatedSteps = aiResult.steps
    .map((step) => {
      const candidate = candidateMap.get(step.questionKey);
      if (!candidate) return null;
      return { step, candidate };
    })
    .filter(
      (
        entry
      ): entry is {
        step: (typeof aiResult.steps)[number];
        candidate: LearningPathCandidateQuestion;
      } => entry !== null
    );

  const stepsToPersist =
    validatedSteps.length > 0
      ? validatedSteps
      : candidates.slice(0, 5).map((candidate, index) => ({
          step: {
            title: candidate.skills[0] ?? `Etapa ${index + 1}`,
            description: "Questão selecionada para reforço.",
            questionKey: candidate.questionKey,
            discipline: candidate.discipline,
            skill: candidate.skills[0] ?? null,
          },
          candidate,
        }));

  if (stepsToPersist.length === 0) {
    throw new N8nRequestError(
      "Não foi possível montar etapas válidas para a trilha."
    );
  }

  const path = await prisma.$transaction(async (tx) => {
    await tx.studentLearningPath.updateMany({
      where: { studentId, isActive: true },
      data: { isActive: false },
    });

    const createdPath = await tx.studentLearningPath.create({
      data: {
        studentId,
        title: aiResult.pathTitle,
        summary: aiResult.summary ?? null,
        isActive: true,
        steps: {
          create: stepsToPersist.map(({ step, candidate }, index) => ({
            orderIndex: index,
            title: step.title,
            description: step.description ?? null,
            discipline: step.discipline ?? candidate.discipline,
            skill: step.skill ?? candidate.skills[0] ?? null,
            questionKey: candidate.questionKey,
            questionYear: candidate.year,
            questionIndex: candidate.index,
            questionLanguage: candidate.language,
            status: index === 0 ? "in_progress" : "locked",
          })),
        },
      },
      include: { steps: true },
    });

    return createdPath;
  });

  return {
    pathId: path.id,
    pathTitle: path.title,
    pathSummary: path.summary,
    modules: mapLearningPathToModules(path),
  };
}

export function questionKeyFromStep(step: {
  questionYear: number;
  questionIndex: number;
  questionLanguage: string | null;
}): string {
  return buildQuestionKey(
    step.questionYear,
    step.questionIndex,
    step.questionLanguage
  );
}

export { parseQuestionKey };
