"use client";

import {
  ENEM_DIFFICULTY_LABELS,
  ENEM_DISCIPLINE_LABELS,
} from "@/lib/enem/constants";
import { questionKeyFromQuestion } from "@/lib/enem/question-key";
import type { EnemQuestion } from "@/types/enem";
import { Check, ImageIcon } from "lucide-react";

interface TeacherEnemQuestionSelectCardProps {
  question: EnemQuestion;
  selected: boolean;
  onOpen: () => void;
  onToggle: () => void;
}

export function TeacherEnemQuestionSelectCard({
  question,
  selected,
  onOpen,
  onToggle,
}: TeacherEnemQuestionSelectCardProps) {
  const hasImage =
    question.files.length > 0 ||
    question.alternatives.some((alternative) => alternative.file);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        const target = e.target as HTMLElement | null;
        const targetIsCheckbox =
          target?.tagName === "INPUT" &&
          (target as HTMLInputElement).type === "checkbox";
        if (targetIsCheckbox) return;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`flex gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border hover:border-primary/40 hover:bg-primary/5"
      } cursor-pointer`}
      aria-label={`Visualizar questão: ${question.title}`}
    >
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0 accent-primary"
        checked={selected}
        onChange={onToggle}
        onClick={(e) => {
          // Evita que clique no checkbox também abra a visualização.
          e.stopPropagation();
        }}
        aria-label={`Selecionar ${question.title}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold line-clamp-1">{question.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ENEM {question.year}
              {question.discipline &&
                ` · ${ENEM_DISCIPLINE_LABELS[question.discipline]}`}
            </p>
          </div>
          {hasImage && (
            <ImageIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-label="Com imagem"
            />
          )}
        </div>
        <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          {ENEM_DIFFICULTY_LABELS[question.difficulty]}
        </span>
        {question.context && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {stripMarkdown(question.context)}
          </p>
        )}
      </div>
      {selected && (
        <Check
          className="size-5 shrink-0 text-primary"
          aria-hidden
        />
      )}
    </div>
  );
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, "").replace(/\n/g, " ").trim();
}

export function isQuestionInSelection(
  question: EnemQuestion,
  selected: EnemQuestion[]
): boolean {
  const key = questionKeyFromQuestion(question);
  return selected.some((entry) => questionKeyFromQuestion(entry) === key);
}

export function toggleQuestionInSelection(
  question: EnemQuestion,
  selected: EnemQuestion[]
): EnemQuestion[] {
  const key = questionKeyFromQuestion(question);
  const exists = selected.some(
    (entry) => questionKeyFromQuestion(entry) === key
  );
  if (exists) {
    return selected.filter((entry) => questionKeyFromQuestion(entry) !== key);
  }
  return [...selected, question];
}
