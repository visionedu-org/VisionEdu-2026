import {
  ENEM_DIFFICULTY_LABELS,
  ENEM_DISCIPLINE_LABELS,
} from "@/lib/enem/constants";
import { questionKeyFromQuestion } from "@/lib/enem/question-key";
import { getEnemAnswer, isEnemFavorite } from "@/lib/enem/storage";
import type { EnemQuestion } from "@/types/enem";
import { Bookmark, ImageIcon } from "lucide-react";

interface EnemQuestionCardProps {
  question: EnemQuestion;
  onOpen: () => void;
}

export function EnemQuestionCard({ question, onOpen }: EnemQuestionCardProps) {
  const key = questionKeyFromQuestion(question);
  const answered = getEnemAnswer(key);
  const favorite = isEnemFavorite(key);
  const hasImage =
    question.files.length > 0 ||
    question.alternatives.some((a) => a.file);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold line-clamp-1">{question.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ENEM {question.year}
            {question.discipline &&
              ` · ${ENEM_DISCIPLINE_LABELS[question.discipline]}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-1 text-muted-foreground">
          {hasImage && <ImageIcon className="size-4" aria-label="Com imagem" />}
          {favorite && (
            <Bookmark className="size-4 fill-primary text-primary" aria-hidden />
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge>{ENEM_DIFFICULTY_LABELS[question.difficulty]}</Badge>
        {answered && (
          <Badge variant={answered.isCorrect ? "success" : "error"}>
            {answered.isCorrect ? "Acertou" : "Errou"}
          </Badge>
        )}
        {!answered && <Badge variant="muted">Não respondida</Badge>}
      </div>

      {question.context && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {stripMarkdown(question.context)}
        </p>
      )}
    </button>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "muted";
}) {
  const styles = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    error: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\n/g, " ").trim();
}
