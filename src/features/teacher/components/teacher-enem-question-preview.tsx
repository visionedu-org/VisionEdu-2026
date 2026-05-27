"use client";

import { ArrowLeft } from "lucide-react";
import {
  ENEM_DIFFICULTY_LABELS,
  ENEM_DISCIPLINE_LABELS,
} from "@/lib/enem/constants";
import type { EnemQuestion } from "@/types/enem";
import { EnemQuestionAlternatives } from "@/features/student/enem-questions/components/enem-question-alternatives";
import { EnemQuestionContext } from "@/features/student/enem-questions/components/enem-question-context";
import { Button } from "@/components/ui/button";

interface TeacherEnemQuestionPreviewProps {
  question: EnemQuestion;
  onBack: () => void;
}

export function TeacherEnemQuestionPreview({
  question,
  onBack,
}: TeacherEnemQuestionPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-50 px-4 py-4 dark:bg-slate-950 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-5" aria-hidden />
        Voltar à seleção de questões
      </button>

      <header className="shrink-0 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Visualização do professor
        </p>
        <h1 className="text-lg font-bold leading-tight">{question.title}</h1>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <MetaTag>ENEM {question.year}</MetaTag>
          {question.discipline && (
            <MetaTag>{ENEM_DISCIPLINE_LABELS[question.discipline]}</MetaTag>
          )}
          <MetaTag>{ENEM_DIFFICULTY_LABELS[question.difficulty]}</MetaTag>
        </div>
        <div
          className="rounded-lg border border-emerald-600/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
          role="status"
        >
          <p className="font-semibold">
            Gabarito oficial: alternativa {question.correctAlternative}
          </p>
          <p className="mt-1 text-emerald-800 dark:text-emerald-200">
            A alternativa correta está destacada em verde abaixo. Os alunos
            responderão esta questão sem ver o gabarito antecipadamente.
          </p>
        </div>
      </header>

      <article className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        <EnemQuestionContext
          context={question.context}
          files={question.files}
          introduction={question.alternativesIntroduction}
        />

        <EnemQuestionAlternatives
          alternatives={question.alternatives}
          selected={question.correctAlternative}
          disabled
          reveal
          onSelect={() => undefined}
        />
      </article>

      <footer className="shrink-0 border-t border-border pt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Button type="button" className="min-h-11 w-full" onClick={onBack}>
          Voltar à seleção de questões
        </Button>
      </footer>
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
