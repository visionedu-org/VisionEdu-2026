import type { LearningPathStep, StudentLearningPath } from "@prisma/client";
import type { LearningPathModule } from "@/types/domain";

type PathWithSteps = StudentLearningPath & { steps: LearningPathStep[] };

export function mapLearningPathToModules(path: PathWithSteps): LearningPathModule[] {
  return path.steps
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((step) => ({
      id: step.id,
      title: step.title,
      status: step.status,
      pathId: path.id,
      stepOrder: step.orderIndex,
      description: step.description ?? undefined,
      skill: step.skill ?? undefined,
      discipline: step.discipline ?? undefined,
      videoUrl: step.videoUrl ?? undefined,
    }));
}
