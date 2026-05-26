"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import {
  ENEM_DIFFICULTY_LABELS,
  ENEM_DISCIPLINE_LABELS,
} from "@/lib/enem/constants";
import { buildQuestionKey } from "@/lib/enem/question-key";
import { studentService } from "@/services/student.service";
import type { LearningPathStepDetailResponse } from "@/types/learning-path-api";
import type {
  EnemAlternativeLetter,
  EnemQuestionAnswerRecord,
} from "@/types/enem";
import { Button } from "@/components/ui/button";
import { EnemAiResolutionDialog } from "@/features/student/enem-questions/components/enem-ai-resolution-dialog";
import { EnemQuestionAlternatives } from "@/features/student/enem-questions/components/enem-question-alternatives";
import { EnemQuestionContext } from "@/features/student/enem-questions/components/enem-question-context";
import { EnemQuestionFeedback } from "@/features/student/enem-questions/components/enem-question-feedback";

interface LearningPathStepPlayerProps {
  initial: LearningPathStepDetailResponse;
}

export function LearningPathStepPlayer({ initial }: LearningPathStepPlayerProps) {
  const router = useRouter();
  const stepData = initial;
  const [selected, setSelected] = useState<EnemAlternativeLetter | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answerRecord, setAnswerRecord] =
    useState<EnemQuestionAnswerRecord | null>(null);
  const [aiResolutionOpen, setAiResolutionOpen] = useState(false);

  const { step, question } = stepData;
  const isCompleted = step.status === "completed";
  const showAiResolution = Boolean(answerRecord && !answerRecord.isCorrect);

  async function handleConfirm() {
    if (!selected || revealed || isCompleted || submitting) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const outcome = await studentService.submitLearningPathStep(
        step.id,
        selected
      );
      setRevealed(true);
      setAnswerRecord({
        questionKey: buildQuestionKey(
          question.year,
          question.index,
          question.language
        ),
        year: question.year,
        index: question.index,
        selectedLetter: selected,
        correctLetter: question.correctAlternative,
        isCorrect: outcome.isCorrect,
        discipline: question.discipline,
        answeredAt: new Date().toISOString(),
      });

      if (outcome.isCorrect) {
        setFeedback(
          outcome.nextStepUnlocked
            ? "Parabéns! Você desbloqueou a próxima etapa da trilha."
            : "Parabéns! Você concluiu esta etapa da trilha."
        );
      } else {
        setFeedback(
          "Resposta incorreta. Revise o conteúdo e tente novamente para avançar na trilha."
        );
      }
    } catch {
      setFeedback("Não foi possível enviar sua resposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    router.push("/student/dashboard");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-5" aria-hidden />
        Voltar à trilha
      </button>

      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {step.pathTitle} · Etapa {step.orderIndex + 1}
        </p>
        <h1 className="text-2xl font-bold">{step.title}</h1>
        {step.description && (
          <p className="text-sm text-muted-foreground">{step.description}</p>
        )}
      </header>

      <div className="flex flex-wrap gap-1.5 text-xs">
        <MetaTag>ENEM {question.year}</MetaTag>
        {question.discipline && (
          <MetaTag>{ENEM_DISCIPLINE_LABELS[question.discipline]}</MetaTag>
        )}
        <MetaTag>{ENEM_DIFFICULTY_LABELS[question.difficulty]}</MetaTag>
        {step.skill && <MetaTag>{step.skill}</MetaTag>}
      </div>

      <article className="space-y-4 rounded-xl border border-border bg-card p-4">
        <EnemQuestionContext
          context={question.context}
          files={question.files}
          introduction={question.alternativesIntroduction}
        />

        <EnemQuestionAlternatives
          alternatives={question.alternatives}
          selected={selected}
          disabled={revealed || isCompleted}
          reveal={revealed || isCompleted}
          onSelect={setSelected}
        />

        {revealed && answerRecord && (
          <EnemQuestionFeedback question={question} record={answerRecord} />
        )}
      </article>

      {answerRecord && (
        <EnemAiResolutionDialog
          open={aiResolutionOpen}
          onOpenChange={setAiResolutionOpen}
          question={question}
          record={answerRecord}
        />
      )}

      {feedback && (
        <p
          className={
            answerRecord?.isCorrect
              ? "rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
              : "rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          }
          role="status"
          aria-live="polite"
        >
          {feedback}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!isCompleted && !revealed && (
          <Button
            type="button"
            className="min-h-11 flex-1"
            disabled={!selected || submitting}
            onClick={() => void handleConfirm()}
          >
            {submitting ? "Enviando…" : "Confirmar resposta"}
          </Button>
        )}

        {revealed && (
          <Button
            type="button"
            className="min-h-11"
            variant="outline"
            onClick={() => {
              setSelected(null);
              setRevealed(false);
              setFeedback(null);
              setAnswerRecord(null);
              setAiResolutionOpen(false);
            }}
          >
            Tentar novamente
          </Button>
        )}

        {showAiResolution && (
          <Button
            type="button"
            className="min-h-11"
            variant="default"
            onClick={() => setAiResolutionOpen(true)}
          >
            <Sparkles className="size-4" aria-hidden />
            Explicar com IA
          </Button>
        )}

        <Button type="button" className="min-h-11" variant="outline" onClick={handleBack}>
          Ver trilha
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
