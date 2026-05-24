"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, List } from "lucide-react";
import {
  normalizeEnemFilterPatch,
  resolveExamYear,
} from "@/lib/enem/filter-state";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";
import { useEnemExams } from "../hooks/use-enem-exams";
import { useEnemQuestions } from "../hooks/use-enem-questions";
import { useEnemProgress } from "../hooks/use-enem-progress";
import { EnemQuestionFiltersPanel } from "./enem-question-filters";
import { EnemQuestionList } from "./enem-question-list";
import { EnemQuestionPlayer } from "./enem-question-player";
import { EnemStatsPanel } from "./enem-stats-panel";
import { EnemErrorState } from "./enem-error-state";
import { EnemLoadingSkeleton } from "./enem-loading-skeleton";
import { EnemQuestionsLoading } from "./enem-questions-loading";

type ViewMode = "list" | "practice" | "stats";

const DEFAULT_YEAR = 2023;

function createDefaultFilters(year: number): EnemQuestionFilters {
  return { year, answered: "all" };
}

export function EnemQuestionsPage() {
  const { exams, loading: examsLoading, error: examsError, retry: retryExams } =
    useEnemExams();

  const defaultYear = exams[0]?.year ?? DEFAULT_YEAR;

  const [draftFilters, setDraftFilters] = useState<EnemQuestionFilters>(() =>
    createDefaultFilters(DEFAULT_YEAR)
  );

  const [view, setView] = useState<ViewMode>("list");
  const [practiceIndex, setPracticeIndex] = useState(0);

  const {
    questions,
    loading,
    loadingMore,
    error,
    hasApplied,
    hasMoreFromApi,
    apply,
    loadMore,
    retry,
  } = useEnemQuestions();

  const { stats } = useEnemProgress();

  const draftDisplayYear = useMemo(
    () => resolveExamYear(draftFilters, exams, defaultYear),
    [draftFilters, exams, defaultYear]
  );

  useEffect(() => {
    if (exams.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza ano padrão ao carregar provas
    setDraftFilters((prev) =>
      normalizeEnemFilterPatch(prev, {
        year: resolveExamYear(prev, exams, defaultYear),
      })
    );
  }, [exams, defaultYear]);

  function patchDraftFilters(patch: Partial<EnemQuestionFilters>) {
    setDraftFilters((prev) => normalizeEnemFilterPatch(prev, patch));
  }

  const handleApplyFilters = useCallback(() => {
    const year = resolveExamYear(draftFilters, exams, defaultYear);
    const filtersToApply: EnemQuestionFilters = {
      year,
      answered: draftFilters.answered ?? "all",
      discipline: draftFilters.discipline,
      difficulty: draftFilters.difficulty,
    };
    void apply(filtersToApply);
  }, [apply, draftFilters, exams, defaultYear]);

  function openQuestion(question: EnemQuestion, indexInList: number) {
    setPracticeIndex(indexInList);
    setView("practice");
  }

  if (view === "practice" && questions.length > 0) {
    return (
      <EnemQuestionPlayer
        questions={questions}
        initialIndex={practiceIndex}
        simulationMode={false}
        onClose={() => setView("list")}
      />
    );
  }

  const showLoading = loading;
  const showError = hasApplied && !loading && Boolean(error);
  const showQuestionList = !showLoading && !showError;

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-4 pb-6">
      <header>
        <h1 className="text-xl font-bold">Questões ENEM</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pratique com questões reais, filtre por matéria e acompanhe seu
          desempenho.
        </p>
      </header>

      <div
        className="flex rounded-lg border border-border bg-muted/30 p-1"
        role="tablist"
        aria-label="Modo de visualização"
      >
        <TabButton
          active={view === "list"}
          onClick={() => setView("list")}
          icon={List}
          label="Questões"
        />
        <TabButton
          active={view === "stats"}
          onClick={() => setView("stats")}
          icon={BarChart3}
          label="Desempenho"
        />
      </div>

      {view === "stats" ? (
        <EnemStatsPanel stats={stats} />
      ) : (
        <>
          {examsLoading ? (
            <EnemLoadingSkeleton rows={2} />
          ) : examsError ? (
            <EnemErrorState message={examsError} onRetry={retryExams} />
          ) : (
            <EnemQuestionFiltersPanel
              exams={exams}
              filters={draftFilters}
              displayYear={draftDisplayYear}
              disabled={exams.length === 0}
              onFiltersChange={patchDraftFilters}
              onApply={handleApplyFilters}
              isApplying={loading}
              applyDisabled={exams.length === 0 || loading}
            />
          )}

          {showLoading && <EnemQuestionsLoading />}

          {showError && (
            <EnemErrorState
              message={error ?? "Erro ao carregar questões."}
              onRetry={retry}
            />
          )}

          {showQuestionList && (
            <EnemQuestionList
              questions={hasApplied ? questions : []}
              hasApplied={hasApplied}
              loadingMore={loadingMore}
              hasMore={hasMoreFromApi}
              onOpen={openQuestion}
              onLoadMore={loadMore}
            />
          )}
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </button>
  );
}
