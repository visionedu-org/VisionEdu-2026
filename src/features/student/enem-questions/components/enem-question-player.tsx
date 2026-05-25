"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react";
import {
  ENEM_DIFFICULTY_LABELS,
  ENEM_DISCIPLINE_LABELS,
} from "@/lib/enem/constants";
import { buildQuestionKey } from "@/lib/enem/question-key";
import type { EnemAlternativeLetter, EnemQuestion } from "@/types/enem";
import { Button } from "@/components/ui/button";
import { EnemQuestionAlternatives } from "./enem-question-alternatives";
import { EnemQuestionContext } from "./enem-question-context";
import { EnemQuestionFeedback } from "./enem-question-feedback";
import { useEnemProgress } from "../hooks/use-enem-progress";

interface EnemQuestionPlayerProps {
  questions: EnemQuestion[];
  initialIndex: number;
  onClose: () => void;
}

export function EnemQuestionPlayer({
  questions,
  initialIndex,
  onClose,
}: EnemQuestionPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const safeIndex = Math.min(
    Math.max(0, currentIndex),
    Math.max(0, questions.length - 1)
  );
  const question = questions[safeIndex];
  const total = questions.length;

  if (!question) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Nenhuma questão disponível.</p>
        <Button type="button" className="mt-4 min-h-11" onClick={onClose}>
          Voltar
        </Button>
      </div>
    );
  }

  const questionKey = buildQuestionKey(
    question.year,
    question.index,
    question.language
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <EnemQuestionPlayerBody
        key={questionKey}
        question={question}
        currentIndex={safeIndex}
        total={total}
        onClose={onClose}
        onNavigate={setCurrentIndex}
      />
    </div>
  );
}

interface EnemQuestionPlayerBodyProps {
  question: EnemQuestion;
  currentIndex: number;
  total: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function EnemQuestionPlayerBody({
  question,
  currentIndex,
  total,
  onClose,
  onNavigate,
}: EnemQuestionPlayerBodyProps) {
  const {
    answerQuestion,
    getAnswer,
    toggleFavorite,
    toggleReview,
    checkFavorite,
    checkReview,
  } = useEnemProgress();

  const existing = getAnswer(question);
  const [selected, setSelected] = useState<EnemAlternativeLetter | null>(
    existing?.selectedLetter ?? null
  );
  const [revealed, setRevealed] = useState(Boolean(existing));
  const [favorite, setFavorite] = useState(() => checkFavorite(question));
  const [forReview, setForReview] = useState(() => checkReview(question));

  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const record = revealed ? getAnswer(question) : undefined;

  function handleConfirm() {
    if (!selected || revealed) return;
    answerQuestion(question, selected);
    setRevealed(true);
  }

  function goTo(index: number) {
    onNavigate(Math.max(0, Math.min(index, total - 1)));
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <button
        type="button"
        onClick={onClose}
        className="mb-4 inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-5" aria-hidden />
        Voltar à lista
      </button>

      <div className="flex shrink-0 items-center justify-between gap-2">
        <h1 className="text-lg font-bold line-clamp-2">{question.title}</h1>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
            aria-pressed={favorite}
            onClick={() => setFavorite(toggleFavorite(question))}
          >
            <Bookmark
              className={`size-5 ${favorite ? "fill-primary text-primary" : ""}`}
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={forReview ? "Remover da revisão" : "Marcar para revisão"}
            aria-pressed={forReview}
            onClick={() => setForReview(toggleReview(question))}
          >
            <Flag
              className={`size-5 ${forReview ? "fill-amber-500 text-amber-500" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="mt-2 flex shrink-0 flex-wrap gap-1.5 text-xs">
        <MetaTag>ENEM {question.year}</MetaTag>
        {question.discipline && (
          <MetaTag>
            {ENEM_DISCIPLINE_LABELS[question.discipline]}
          </MetaTag>
        )}
        <MetaTag>{ENEM_DIFFICULTY_LABELS[question.difficulty]}</MetaTag>
        {question.skills.slice(0, 2).map((skill) => (
          <MetaTag key={skill}>{skill}</MetaTag>
        ))}
      </div>

      <div
        className="mt-4 h-2 shrink-0 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso na lista filtrada"
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 shrink-0 text-xs text-muted-foreground">
        Questão {currentIndex + 1} de {total} (lista filtrada)
      </p>

      <article className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        <EnemQuestionContext
          context={question.context}
          files={question.files}
          introduction={question.alternativesIntroduction}
        />

        <EnemQuestionAlternatives
          alternatives={question.alternatives}
          selected={selected}
          disabled={revealed}
          reveal={revealed}
          onSelect={setSelected}
        />

        {record && <EnemQuestionFeedback question={question} record={record} />}
      </article>

      <div className="flex shrink-0 gap-2 border-t border-border bg-slate-50 pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:bg-slate-950">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 shrink-0 px-3"
          disabled={currentIndex === 0}
          onClick={() => goTo(currentIndex - 1)}
          aria-label="Questão anterior"
        >
          <ChevronLeft className="size-5" />
        </Button>

        {!revealed ? (
          <Button
            type="button"
            className="min-h-11 flex-1"
            disabled={!selected}
            onClick={handleConfirm}
          >
            Confirmar resposta
          </Button>
        ) : (
          <Button
            type="button"
            className="min-h-11 flex-1"
            disabled={currentIndex >= total - 1}
            onClick={() => goTo(currentIndex + 1)}
          >
            Próxima questão
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          className="min-h-11 shrink-0 px-3"
          disabled={currentIndex >= total - 1}
          onClick={() => goTo(currentIndex + 1)}
          aria-label="Próxima questão"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}

function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
      {children}
    </span>
  );
}
