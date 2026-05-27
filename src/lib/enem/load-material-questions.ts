import { fetchEnemQuestion } from "@/lib/enem/enem-question-api";
import type { MaterialEnemQuestionRef } from "@/types/materials";
import type { EnemQuestion } from "@/types/enem";

/** Carrega questões ENEM completas a partir das referências salvas no material. */
export async function loadMaterialEnemQuestions(
  refs: MaterialEnemQuestionRef[]
): Promise<EnemQuestion[]> {
  const sorted = [...refs].sort((a, b) => a.sortOrder - b.sortOrder);
  const loaded: EnemQuestion[] = [];

  for (const ref of sorted) {
    const question = await fetchEnemQuestion(
      ref.year,
      ref.index,
      ref.language ?? undefined
    );
    loaded.push(question);
  }

  return loaded;
}
