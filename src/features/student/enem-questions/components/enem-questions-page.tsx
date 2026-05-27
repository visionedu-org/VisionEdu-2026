"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Bookmark, List } from "lucide-react";
import { normalizeEnemFilterPatch } from "@/lib/enem/filter-state";
import { clampQuestionsPageSize } from "@/lib/enem/constants";
import {
  getEnemPreferences,
  saveEnemPreferences,
} from "@/lib/enem/preferences";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";
import { useEnemExams } from "../hooks/use-enem-exams";
import { useEnemQuestions } from "../hooks/use-enem-questions";
import { useEnemFavorites } from "../hooks/use-enem-favorites";
import { useEnemProgress } from "../hooks/use-enem-progress";
import { EnemQuestionFiltersPanel } from "./enem-question-filters";
import { EnemQuestionList } from "./enem-question-list";
import { EnemQuestionPlayer } from "./enem-question-player";
import { EnemStatsPanel } from "./enem-stats-panel";
import { EnemErrorState } from "./enem-error-state";
import { EnemLoadingSkeleton } from "./enem-loading-skeleton";
import { EnemQuestionsLoading } from "./enem-questions-loading";
import { EnemEmptyState } from "./enem-empty-state";
import { AppPage } from "@/components/layout/app-page";

type TabId = "list" | "favorites" | "stats";
type ViewMode = "tab" | "practice";

function createDefaultFilters(shuffle: boolean): EnemQuestionFilters {
  return { year: "all", answered: "all", shuffle };
}

export function EnemQuestionsPage() {
  const initialPrefs = useMemo(() => getEnemPreferences(), []);
  const [pageSize, setPageSize] = useState(() =>
    clampQuestionsPageSize(initialPrefs.pageSize)
  );

  const { exams, loading: examsLoading, error: examsError, retry: retryExams } =
    useEnemExams();

  const defaultYear = exams[0]?.year ?? 2023;
  const examYears = useMemo(() => exams.map((e) => e.year), [exams]);

  const [draftFilters, setDraftFilters] = useState<EnemQuestionFilters>(() =>
    createDefaultFilters(initialPrefs.shuffle)
  );

  const [activeTab, setActiveTab] = useState<TabId>("list");
  const [view, setView] = useState<ViewMode>("tab");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceQuestions, setPracticeQuestions] = useState<EnemQuestion[]>(
    []
  );

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
  } = useEnemQuestions({ pageSize, examYears });

  const favoritesShuffle = draftFilters.shuffle !== false;

  const {
    questions: favoriteQuestions,
    favoriteCount,
    loading: favoritesLoading,
    error: favoritesError,
    hasLoaded: favoritesLoaded,
    load: loadFavorites,
    retry: retryFavorites,
  } = useEnemFavorites({ shuffle: favoritesShuffle });

  const { stats, loading: progressLoading } = useEnemProgress();

  useEffect(() => {
    if (activeTab === "favorites") {
      void loadFavorites({
        discipline: draftFilters.discipline,
        difficulty: draftFilters.difficulty,
      });
    }
  }, [activeTab, loadFavorites, draftFilters.discipline, draftFilters.difficulty]);

  function patchDraftFilters(patch: Partial<EnemQuestionFilters>) {
    setDraftFilters((prev) => normalizeEnemFilterPatch(prev, patch));
  }

  function handlePageSizeChange(nextSize: number) {
    const clamped = clampQuestionsPageSize(nextSize);
    setPageSize(clamped);
    saveEnemPreferences({ pageSize: clamped });
  }

  function handleShufflePreference(checked: boolean) {
    saveEnemPreferences({ shuffle: checked });
    patchDraftFilters({ shuffle: checked });
  }

  const handleApplyFilters = useCallback(
    (committedPageSize?: number) => {
      if (committedPageSize !== undefined) {
        handlePageSizeChange(committedPageSize);
      }

      const answered = draftFilters.answered ?? "all";
      const year =
        draftFilters.year === "all"
          ? "all"
          : typeof draftFilters.year === "number"
            ? draftFilters.year
            : defaultYear;

      const filtersToApply: EnemQuestionFilters = {
        year,
        answered,
        discipline: draftFilters.discipline,
        difficulty: draftFilters.difficulty,
        shuffle: draftFilters.shuffle !== false,
        favorites: answered === "favorites",
      };

      void apply(filtersToApply, {
        pageSize: committedPageSize ?? pageSize,
      });
    },
    [apply, draftFilters, defaultYear, pageSize]
  );

  function openPractice(list: EnemQuestion[], indexInList: number) {
    setPracticeQuestions(list);
    setPracticeIndex(indexInList);
    setView("practice");
  }

  if (view === "practice" && practiceQuestions.length > 0) {
    return (
      <EnemQuestionPlayer
        questions={practiceQuestions}
        initialIndex={practiceIndex}
        onClose={() => setView("tab")}
      />
    );
  }

  const showListLoading = loading;
  const showListError = hasApplied && !loading && Boolean(error);
  const showQuestionList = !showListLoading && !showListError;

  return (
    <AppPage>
      <header>
        <h1 className="text-2xl font-bold">Questões ENEM</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pratique com questões reais, salve favoritos, filtre por matéria e
          acompanhe seu desempenho.
        </p>
      </header>

      <div
        className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/30 p-1"
        role="tablist"
        aria-label="Modo de visualização"
      >
        <TabButton
          active={activeTab === "list"}
          onClick={() => {
            setActiveTab("list");
            setView("tab");
          }}
          icon={List}
          label="Questões"
        />
        <TabButton
          active={activeTab === "favorites"}
          onClick={() => {
            setActiveTab("favorites");
            setView("tab");
          }}
          icon={Bookmark}
          label="Favoritos"
          badge={favoriteCount > 0 ? String(favoriteCount) : undefined}
        />
        <TabButton
          active={activeTab === "stats"}
          onClick={() => {
            setActiveTab("stats");
            setView("tab");
          }}
          icon={BarChart3}
          label="Desempenho"
        />
      </div>

      {activeTab === "stats" ? (
        progressLoading ? (
          <EnemQuestionsLoading />
        ) : (
          <EnemStatsPanel stats={stats} />
        )
      ) : activeTab === "favorites" ? (
        <div className="space-y-4 lg:grid lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start lg:gap-6">
          {examsLoading ? (
            <EnemLoadingSkeleton rows={2} />
          ) : (
            <EnemQuestionFiltersPanel
              exams={exams}
              filters={draftFilters}
              pageSize={pageSize}
              disabled={exams.length === 0}
              onFiltersChange={(patch) => {
                if ("shuffle" in patch) handleShufflePreference(Boolean(patch.shuffle));
                else patchDraftFilters(patch);
              }}
              onPageSizeChange={handlePageSizeChange}
              onApply={() =>
                void loadFavorites({
                  discipline: draftFilters.discipline,
                  difficulty: draftFilters.difficulty,
                })
              }
              isApplying={favoritesLoading}
              applyDisabled={exams.length === 0}
              hideAnsweredFilter
            />
          )}

          {favoritesLoading && <EnemQuestionsLoading />}

          {favoritesError && !favoritesLoading && (
            <EnemErrorState
              message={favoritesError}
              onRetry={retryFavorites}
            />
          )}

          {!favoritesLoading && !favoritesError && favoriteCount === 0 && (
            <EnemEmptyState
              title="Nenhum favorito ainda"
              description="Abra uma questão e toque no ícone de favorito para salvá-la aqui."
            />
          )}

          {!favoritesLoading &&
            !favoritesError &&
            favoritesLoaded &&
            favoriteCount > 0 &&
            favoriteQuestions.length === 0 && (
              <EnemEmptyState
                title="Nenhuma questão favorita nestes filtros"
                description="Ajuste matéria ou dificuldade e clique em Aplicar filtros."
              />
            )}

          {!favoritesLoading &&
            !favoritesError &&
            favoriteQuestions.length > 0 && (
              <EnemQuestionList
                questions={favoriteQuestions}
                hasApplied
                loadingMore={false}
                hasMore={false}
                onOpen={(q, i) => openPractice(favoriteQuestions, i)}
                onLoadMore={() => undefined}
              />
            )}
        </div>
      ) : (
        <div className="space-y-4 lg:grid lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start lg:gap-6">
          {examsLoading ? (
            <EnemLoadingSkeleton rows={2} />
          ) : examsError ? (
            <EnemErrorState message={examsError} onRetry={retryExams} />
          ) : (
            <EnemQuestionFiltersPanel
              exams={exams}
              filters={draftFilters}
              pageSize={pageSize}
              disabled={exams.length === 0}
              onFiltersChange={(patch) => {
                if ("shuffle" in patch) {
                  handleShufflePreference(Boolean(patch.shuffle));
                } else {
                  patchDraftFilters(patch);
                }
              }}
              onPageSizeChange={handlePageSizeChange}
              onApply={handleApplyFilters}
              isApplying={loading}
              applyDisabled={exams.length === 0 || loading}
            />
          )}

          {showListLoading && <EnemQuestionsLoading />}

          {showListError && (
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
              onOpen={(q, i) => openPractice(questions, i)}
              onLoadMore={loadMore}
            />
          )}
        </div>
      )}
    </AppPage>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors sm:text-sm ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
      {badge && (
        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {badge}
        </span>
      )}
    </button>
  );
}
