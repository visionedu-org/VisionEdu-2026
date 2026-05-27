"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { studentService } from "@/services/student.service";
import type { Activity, ActivityAnswer } from "@/types/domain";
import { clearDraft, loadDraft, saveDraft } from "@/lib/activity-draft";
import { titleForBadge } from "@/mocks/data/student-gamification";
import { AchievementToast } from "./achievement-toast";
import { ResumeDraftBanner } from "./resume-draft-banner";
import { Button } from "@/components/ui/button";

interface ActivityPlayerProps {
  activityId: string;
}

export function ActivityPlayer({ activityId }: ActivityPlayerProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ActivityAnswer[]>([]);
  const [showResume, setShowResume] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<ReturnType<typeof loadDraft>>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitScore, setSubmitScore] = useState<number | null>(null);
  const [achievementMessage, setAchievementMessage] = useState<string | null>(null);
  const submittedHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await studentService.getActivity(activityId);
        if (!cancelled) {
          setActivity(data);
          const draft = loadDraft(activityId);
          if (draft && draft.answers.length > 0) {
            setPendingDraft(draft);
            setShowResume(true);
          }
        }
      } catch {
        if (!cancelled) setError("Não foi possível carregar a atividade.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activityId]);

  useEffect(() => {
    if (!achievementMessage) return;
    const timer = window.setTimeout(() => setAchievementMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [achievementMessage]);

  useEffect(() => {
    if (submitted) {
      submittedHeadingRef.current?.focus();
    }
  }, [submitted]);

  const persist = useCallback(
    (nextAnswers: ActivityAnswer[], index: number) => {
      saveDraft(activityId, {
        answers: nextAnswers,
        currentIndex: index,
        updatedAt: new Date().toISOString(),
      });
    },
    [activityId]
  );

  function applyDraft() {
    if (!pendingDraft) return;
    setAnswers(pendingDraft.answers);
    setCurrentIndex(
      Math.min(pendingDraft.currentIndex, (activity?.questions.length ?? 1) - 1)
    );
    setShowResume(false);
  }

  function restartDraft() {
    clearDraft(activityId);
    setAnswers([]);
    setCurrentIndex(0);
    setPendingDraft(null);
    setShowResume(false);
  }

  function selectOption(questionId: string, optionId: string) {
    const next = answers.filter((a) => a.questionId !== questionId);
    next.push({ questionId, optionId });
    setAnswers(next);
    persist(next, currentIndex);
  }

  async function handleSubmit() {
    if (!activity) return;
    try {
      const result = await studentService.submitActivity(activityId, answers);
      clearDraft(activityId);
      const parts = [`Você ganhou ${result.xpEarned} XP.`];
      if (result.levelUp) {
        parts.push(`Você subiu para o nível ${result.level}!`);
      }
      if (result.badgesUnlocked.length > 0) {
        parts.push(
          `Novas conquistas: ${result.badgesUnlocked.map(titleForBadge).join(", ")}.`
        );
      }
      setAchievementMessage(parts.join(" "));
      setSubmitted(true);
      setSubmitScore(result.score);
    } catch {
      setError("Erro ao enviar. Tente novamente.");
    }
  }

  if (loading) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="mt-6 h-40 rounded-xl bg-muted" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="w-full space-y-4">
        <p role="alert" className="text-destructive">
          {error ?? "Atividade não encontrada."}
        </p>
        <Link href="/student/dashboard" className="text-primary underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <AchievementToast message={achievementMessage} />
        <h1
          ref={submittedHeadingRef}
          tabIndex={-1}
          className="text-xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Atividade enviada!
        </h1>
        <p className="text-muted-foreground">
          Nota simulada: <strong>{submitScore?.toFixed(1)}</strong> / 10
        </p>
        <Link href="/student/dashboard">
          <Button className="min-h-11 w-full">Voltar ao painel</Button>
        </Link>
      </div>
    );
  }

  const question = activity.questions[currentIndex];
  const total = activity.questions.length;
  const progress = ((currentIndex + 1) / total) * 100;
  const selected = answers.find((a) => a.questionId === question.id)?.optionId;
  const isLast = currentIndex === total - 1;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-4xl flex-col">
      <Link
        href="/student/dashboard"
        className="mb-4 inline-flex min-h-11 min-w-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-5" aria-hidden />
        Voltar
      </Link>

      <h1 className="text-lg font-bold line-clamp-2">{activity.title}</h1>

      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da atividade"
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Questão {currentIndex + 1} de {total}
      </p>

      {showResume && pendingDraft && (
        <div className="mt-4">
          <ResumeDraftBanner onResume={applyDraft} onRestart={restartDraft} />
        </div>
      )}

      <fieldset className="mt-6 flex-1 space-y-3">
        <legend className="text-base font-semibold">{question.prompt}</legend>
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <input
              type="radio"
              name={`q-${question.id}`}
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => selectOption(question.id, opt.id)}
              className="size-4 shrink-0"
            />
            <span className="text-sm">{opt.text}</span>
          </label>
        ))}
      </fieldset>

      <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-border bg-background pt-4 pb-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 flex-1"
          disabled={currentIndex === 0}
          onClick={() => {
            const idx = currentIndex - 1;
            setCurrentIndex(idx);
            persist(answers, idx);
          }}
        >
          Anterior
        </Button>
        {isLast ? (
          <Button
            type="button"
            className="min-h-11 flex-1"
            onClick={() => void handleSubmit()}
          >
            Enviar
          </Button>
        ) : (
          <Button
            type="button"
            className="min-h-11 flex-1"
            onClick={() => {
              const idx = currentIndex + 1;
              setCurrentIndex(idx);
              persist(answers, idx);
            }}
          >
            Próxima
          </Button>
        )}
      </div>
    </div>
  );
}
