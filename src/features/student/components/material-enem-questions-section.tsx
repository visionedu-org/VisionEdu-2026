"use client";

import { useEffect, useState } from "react";
import { loadMaterialEnemQuestions } from "@/lib/enem/load-material-questions";
import type { MaterialEnemQuestionRef } from "@/types/materials";
import type { EnemQuestion } from "@/types/enem";
import { EnemQuestionPlayer } from "@/features/student/enem-questions/components/enem-question-player";
import { EnemQuestionCard } from "@/features/student/enem-questions/components/enem-question-card";
import { EnemErrorState } from "@/features/student/enem-questions/components/enem-error-state";
import { Button } from "@/components/ui/button";

interface MaterialEnemQuestionsSectionProps {
  questionRefs: MaterialEnemQuestionRef[];
}

export function MaterialEnemQuestionsSection({
  questionRefs,
}: MaterialEnemQuestionsSectionProps) {
  const [questions, setQuestions] = useState<EnemQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceIndex, setPracticeIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const loaded = await loadMaterialEnemQuestions(questionRefs);
        if (!cancelled) setQuestions(loaded);
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar as questões deste material.");
          setQuestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [questionRefs]);

  if (practiceIndex !== null && questions.length > 0) {
    return (
      <EnemQuestionPlayer
        questions={questions}
        initialIndex={practiceIndex}
        context="material"
        onClose={() => setPracticeIndex(null)}
      />
    );
  }

  if (loading) {
    return (
      <section
        className="space-y-3"
        aria-labelledby="material-questions-heading"
        aria-busy="true"
      >
        <h2
          id="material-questions-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          Questões
        </h2>
        <div className="space-y-3">
          {[1, 2].map((key) => (
            <div
              key={key}
              className="h-24 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-3" aria-labelledby="material-questions-heading">
        <h2
          id="material-questions-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          Questões
        </h2>
        <EnemErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            setError(null);
            void loadMaterialEnemQuestions(questionRefs)
              .then(setQuestions)
              .catch(() =>
                setError("Não foi possível carregar as questões deste material.")
              )
              .finally(() => setLoading(false));
          }}
        />
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="space-y-2" aria-labelledby="material-questions-heading">
        <h2
          id="material-questions-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          Questões
        </h2>
        <p className="text-sm text-muted-foreground">
          Nenhuma questão disponível neste material.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-labelledby="material-questions-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="material-questions-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          Questões ({questions.length})
        </h2>
        <Button
          type="button"
          className="min-h-11 w-full sm:w-auto"
          onClick={() => setPracticeIndex(0)}
        >
          Resolver todas em sequência
        </Button>
      </div>
      <ul className="space-y-3" aria-label="Questões do material">
        {questions.map((question, index) => (
          <li
            key={`${question.year}-${question.index}-${question.language ?? ""}`}
          >
            <EnemQuestionCard
              question={question}
              onOpen={() => setPracticeIndex(index)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
