export function EnemLoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-xl border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}
