import type { EnemQuestion } from "@/types/enem";
import { EnemQuestionCard } from "./enem-question-card";
import { EnemEmptyState } from "./enem-empty-state";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

interface EnemQuestionListProps {
  questions: EnemQuestion[];
  hasApplied: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onOpen: (question: EnemQuestion, indexInList: number) => void;
  onLoadMore: () => void;
}

export function EnemQuestionList({
  questions,
  hasApplied,
  loadingMore,
  hasMore,
  onOpen,
  onLoadMore,
}: EnemQuestionListProps) {
  if (!hasApplied) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
        <FileQuestion className="size-10 text-muted-foreground" aria-hidden />
        <h2 className="text-base font-semibold">Buscar questões</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ajuste os filtros acima e clique em{" "}
          <strong className="font-medium text-foreground">Aplicar filtros</strong>{" "}
          para carregar as questões do ENEM.
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <EnemEmptyState
        title="Nenhuma questão encontrada"
        description="Não há questões com os filtros aplicados. Tente alterar os critérios e aplicar novamente."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Exibindo {questions.length}{" "}
        {questions.length === 1 ? "questão" : "questões"}
      </p>
      <ul className="space-y-3" aria-label="Lista de questões">
        {questions.map((question, index) => (
          <li key={`${question.year}-${question.index}-${question.language ?? ""}`}>
            <EnemQuestionCard
              question={question}
              onOpen={() => onOpen(question, index)}
            />
          </li>
        ))}
      </ul>

      {hasMore && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full"
          disabled={loadingMore}
          onClick={onLoadMore}
        >
          {loadingMore ? "Carregando…" : "Carregar mais questões"}
        </Button>
      )}
    </div>
  );
}
