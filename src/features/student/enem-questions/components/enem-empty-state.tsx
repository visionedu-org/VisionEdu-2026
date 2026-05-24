import { FileQuestion } from "lucide-react";

interface EnemEmptyStateProps {
  title?: string;
  description?: string;
}

export function EnemEmptyState({
  title = "Nenhuma questão encontrada",
  description = "Ajuste os filtros ou carregue mais questões da prova selecionada.",
}: EnemEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <FileQuestion className="size-10 text-muted-foreground" aria-hidden />
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
