"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { normalizeEnemFilterPatch } from "@/lib/enem/filter-state";
import { clampQuestionsPageSize } from "@/lib/enem/constants";
import { defaultEnemDisciplineForTeacherSubject } from "@/lib/enem/teacher-discipline-map";
import { MAX_CONTENT_FORM_ENEM_QUESTIONS } from "@/lib/validations/teacher";
import type { TeacherDiscipline } from "@/lib/validations/teacher";
import type { EnemQuestion, EnemQuestionFilters } from "@/types/enem";
import { useEnemExams } from "@/features/student/enem-questions/hooks/use-enem-exams";
import { useEnemQuestions } from "@/features/student/enem-questions/hooks/use-enem-questions";
import { EnemQuestionFiltersPanel } from "@/features/student/enem-questions/components/enem-question-filters";
import { EnemErrorState } from "@/features/student/enem-questions/components/enem-error-state";
import { EnemLoadingSkeleton } from "@/features/student/enem-questions/components/enem-loading-skeleton";
import { EnemQuestionsLoading } from "@/features/student/enem-questions/components/enem-questions-loading";
import { EnemEmptyState } from "@/features/student/enem-questions/components/enem-empty-state";
import { TeacherEnemQuestionPreview } from "@/features/teacher/components/teacher-enem-question-preview";
import { Button } from "@/components/ui/button";
import {
  isQuestionInSelection,
  TeacherEnemQuestionSelectCard,
  toggleQuestionInSelection,
} from "./teacher-enem-question-select-card";

interface TeacherQuestionPickerOverlayProps {
  open: boolean;
  teacherSubject: TeacherDiscipline;
  selected: EnemQuestion[];
  onSelectedChange: (questions: EnemQuestion[]) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function createDefaultFilters(
  discipline: EnemQuestionFilters["discipline"]
): EnemQuestionFilters {
  return {
    year: "all",
    answered: "all",
    shuffle: false,
    discipline,
  };
}

export function TeacherQuestionPickerOverlay({
  open,
  teacherSubject,
  selected,
  onSelectedChange,
  onConfirm,
  onClose,
}: TeacherQuestionPickerOverlayProps) {
  const defaultDiscipline = defaultEnemDisciplineForTeacherSubject(teacherSubject);
  const [pageSize, setPageSize] = useState(() => clampQuestionsPageSize(10));
  const [draftFilters, setDraftFilters] = useState<EnemQuestionFilters>(() =>
    createDefaultFilters(defaultDiscipline)
  );
  const [previewQuestion, setPreviewQuestion] = useState<EnemQuestion | null>(
    null
  );

  const { exams, loading: examsLoading, error: examsError, retry: retryExams } =
    useEnemExams();

  const defaultYear = exams[0]?.year ?? 2023;
  const examYears = useMemo(() => exams.map((exam) => exam.year), [exams]);

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

  useEffect(() => {
    if (!open) {
      setPreviewQuestion(null);
      return;
    }
    setDraftFilters(createDefaultFilters(defaultDiscipline));
  }, [open, defaultDiscipline, teacherSubject]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function patchDraftFilters(patch: Partial<EnemQuestionFilters>) {
    setDraftFilters((prev) => normalizeEnemFilterPatch(prev, patch));
  }

  const handleApplyFilters = useCallback(
    (committedPageSize?: number) => {
      if (committedPageSize !== undefined) {
        setPageSize(clampQuestionsPageSize(committedPageSize));
      }

      const year =
        draftFilters.year === "all"
          ? "all"
          : typeof draftFilters.year === "number"
            ? draftFilters.year
            : defaultYear;

      const filtersToApply: EnemQuestionFilters = {
        year,
        answered: "all",
        discipline: draftFilters.discipline,
        difficulty: draftFilters.difficulty,
        shuffle: draftFilters.shuffle,
        favorites: false,
      };

      void apply(filtersToApply, {
        pageSize: committedPageSize ?? pageSize,
      });
    },
    [apply, draftFilters, defaultYear, pageSize]
  );

  if (!open) return null;
  if (previewQuestion) {
    return (
      <TeacherEnemQuestionPreview
        question={previewQuestion}
        onBack={() => setPreviewQuestion(null)}
      />
    );
  }

  const atSelectionLimit = selected.length >= MAX_CONTENT_FORM_ENEM_QUESTIONS;
  const showListLoading = loading;
  const showListError = hasApplied && !loading && Boolean(error);
  const showQuestionList = !showListLoading && !showListError;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-question-picker-title"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <div className="space-y-1">
          <h2 id="teacher-question-picker-title" className="text-lg font-bold">
            Selecionar questões ENEM
          </h2>
          <p className="text-sm text-muted-foreground">
            Filtre por disciplina e escolha as questões que os alunos deverão
            resolver. Matéria do material: {teacherSubject}.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          onClick={onClose}
          aria-label="Fechar seleção de questões"
        >
          <X className="size-5" aria-hidden />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6">
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:items-stretch lg:gap-6">
          <aside className="shrink-0">
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
                onFiltersChange={(patch) => patchDraftFilters(patch)}
                onPageSizeChange={setPageSize}
                onApply={handleApplyFilters}
                isApplying={loading}
                applyDisabled={exams.length === 0 || loading}
                hideAnsweredFilter
              />
            )}
          </aside>

          <section
            className="flex min-h-0 min-h-[min(50vh,28rem)] flex-1 flex-col overflow-hidden lg:min-h-0"
            aria-label="Resultados da busca de questões"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch]">
              <div className="space-y-3 pb-2">
                {showListLoading && <EnemQuestionsLoading />}

                {showListError && (
                  <EnemErrorState
                    message={error ?? "Erro ao carregar questões."}
                    onRetry={retry}
                  />
                )}

                {showQuestionList && !hasApplied && (
                  <EnemEmptyState
                    title="Buscar questões"
                    description="Ajuste os filtros e clique em Aplicar filtros para listar questões do ENEM."
                  />
                )}

                {showQuestionList && hasApplied && questions.length === 0 && (
                  <EnemEmptyState
                    title="Nenhuma questão encontrada"
                    description="Altere os filtros e aplique novamente."
                  />
                )}

                {showQuestionList && hasApplied && questions.length > 0 && (
                  <>
                    <p
                      className="sticky top-0 z-10 bg-background/95 py-1 text-sm text-muted-foreground backdrop-blur-sm supports-[backdrop-filter]:bg-background/80"
                      aria-live="polite"
                    >
                      {questions.length}{" "}
                      {questions.length === 1
                        ? "questão exibida"
                        : "questões exibidas"}
                      {atSelectionLimit && " · limite de seleção atingido"}
                    </p>
                    <ul className="space-y-3" aria-label="Questões disponíveis">
                      {questions.map((question) => {
                        const isSelected = isQuestionInSelection(
                          question,
                          selected
                        );
                        return (
                          <li
                            key={`${question.year}-${question.index}-${question.language ?? ""}`}
                          >
                            <TeacherEnemQuestionSelectCard
                              question={question}
                              selected={isSelected}
                              onOpen={() => setPreviewQuestion(question)}
                              onToggle={() => {
                                if (!isSelected && atSelectionLimit) return;
                                onSelectedChange(
                                  toggleQuestionInSelection(question, selected)
                                );
                              }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                    {hasMoreFromApi && (
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11 w-full"
                        disabled={loadingMore}
                        onClick={loadMore}
                      >
                        {loadingMore ? "Carregando…" : "Carregar mais questões"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="flex shrink-0 flex-col gap-3 border-t border-border bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground">
            {selected.length}
          </span>{" "}
          de {MAX_CONTENT_FORM_ENEM_QUESTIONS} questões selecionadas
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="min-h-11"
            disabled={selected.length === 0}
            onClick={onConfirm}
          >
            Confirmar seleção
          </Button>
        </div>
      </footer>
    </div>
  );
}
