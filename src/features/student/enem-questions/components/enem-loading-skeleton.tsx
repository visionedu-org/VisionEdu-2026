import { Skeleton } from "@/components/ui/skeleton";

export function EnemLoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}
