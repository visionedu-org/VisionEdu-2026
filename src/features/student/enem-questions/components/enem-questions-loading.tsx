import { Loader2 } from "lucide-react";
import { EnemLoadingSkeleton } from "./enem-loading-skeleton";

export function EnemQuestionsLoading() {
  return (
    <div
      className="space-y-4 rounded-xl border border-border bg-card p-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3">
        <Loader2
          className="size-5 shrink-0 animate-spin text-primary"
          aria-hidden
        />
        <p className="text-sm font-medium">Carregando questões...</p>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        aria-hidden
      >
        <div className="h-full w-full animate-pulse rounded-full bg-primary/70" />
      </div>

      <EnemLoadingSkeleton rows={4} />
    </div>
  );
}
