import {
  hasLegacyEnemProgress,
  markEnemProgressMigrated,
} from "@/lib/enem/storage";
import { enemQuestionsService } from "@/services/enem-questions.service";

/** Envia respostas e favoritos do localStorage legado para o servidor (uma vez por navegador). */
export async function migrateLegacyEnemProgressToServer(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!hasLegacyEnemProgress()) return;

  const raw = window.localStorage.getItem("visionedu:enem-progress");
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as {
      answers?: Record<string, unknown>;
      favorites?: string[];
    };
    const attempts = Object.values(parsed.answers ?? {});
    const favorites = parsed.favorites ?? [];

    await Promise.all([
      attempts.length > 0
        ? enemQuestionsService.syncAttempts(
            attempts as Parameters<
              typeof enemQuestionsService.syncAttempts
            >[0]
          )
        : Promise.resolve(),
      favorites.length > 0
        ? enemQuestionsService.syncFavorites(favorites)
        : Promise.resolve(),
    ]);

    markEnemProgressMigrated();
  } catch {
    /* migração opcional; falha silenciosa */
  }
}
