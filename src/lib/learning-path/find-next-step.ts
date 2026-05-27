import type { LearningPathModule } from "@/types/domain";

/** Próxima etapa desbloqueada após a etapa atual na trilha. */
export function findNextLearningPathStepId(
  currentStepId: string,
  modules: LearningPathModule[]
): string | null {
  const sorted = [...modules].sort(
    (a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0)
  );
  const currentIndex = sorted.findIndex((module) => module.id === currentStepId);
  if (currentIndex === -1) return null;

  for (let i = currentIndex + 1; i < sorted.length; i++) {
    if (sorted[i].status !== "locked") {
      return sorted[i].id;
    }
  }

  return null;
}
