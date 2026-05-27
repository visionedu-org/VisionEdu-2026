"use client";

import { useRef } from "react";
import {
  ENEM_DIFFICULTY_LABELS,
  ENEM_DISCIPLINE_LABELS,
  MAX_QUESTIONS_PAGE_SIZE,
  MIN_QUESTIONS_PAGE_SIZE,
} from "@/lib/enem/constants";
import {
  getYearFilterSelectValue,
  parseYearFilterSelectValue,
} from "@/lib/enem/filter-state";
import type { EnemExam, EnemQuestionFilters } from "@/types/enem";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnemFilterSelect } from "./enem-filter-select";
import { EnemFilterToggle } from "./enem-filter-toggle";
import {
  EnemFilterNumberInput,
  type EnemFilterNumberInputHandle,
} from "./enem-filter-number-input";

interface EnemQuestionFiltersProps {
  exams: EnemExam[];
  filters: EnemQuestionFilters;
  pageSize: number;
  disabled?: boolean;
  onFiltersChange: (patch: Partial<EnemQuestionFilters>) => void;
  onPageSizeChange: (pageSize: number) => void;
  onApply: (committedPageSize?: number) => void;
  isApplying?: boolean;
  applyDisabled?: boolean;
  /** Oculta situação, favoritos e page size (ex.: aba dedicada de favoritos). */
  hideAnsweredFilter?: boolean;
}

const ALL_OPTION = { value: "", label: "Todas" };

export function EnemQuestionFiltersPanel({
  exams,
  filters,
  pageSize,
  disabled,
  onFiltersChange,
  onPageSizeChange,
  onApply,
  isApplying,
  applyDisabled,
  hideAnsweredFilter,
}: EnemQuestionFiltersProps) {
  const filtersLocked = disabled || isApplying;
  const pageSizeInputRef = useRef<EnemFilterNumberInputHandle>(null);

  function handleApplyClick() {
    const committed = hideAnsweredFilter
      ? undefined
      : pageSizeInputRef.current?.commit();
    onApply(committed);
  }

  const yearOptions = [
    ALL_OPTION,
    ...exams.map((exam) => ({
      value: String(exam.year),
      label: exam.title,
    })),
  ];

  const disciplineOptions = [
    ALL_OPTION,
    ...Object.entries(ENEM_DISCIPLINE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const difficultyOptions = [
    ALL_OPTION,
    ...Object.entries(ENEM_DIFFICULTY_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const answeredOptions = [
    { value: "all", label: "Todas" },
    { value: "unanswered", label: "Não respondidas" },
    { value: "answered", label: "Respondidas" },
    { value: "favorites", label: "Favoritas" },
  ];

  return (
    <section
      aria-label="Filtros de questões"
      className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <EnemFilterSelect
          id="enem-year"
          label="Ano / prova"
          value={getYearFilterSelectValue(filters)}
          options={yearOptions}
          disabled={filtersLocked}
          onChange={(value) =>
            onFiltersChange({ year: parseYearFilterSelectValue(value) })
          }
        />

        <EnemFilterSelect
          id="enem-discipline"
          label="Matéria"
          value={filters.discipline ?? ""}
          options={disciplineOptions}
          disabled={filtersLocked}
          onChange={(value) =>
            onFiltersChange({
              discipline: value as EnemQuestionFilters["discipline"],
            })
          }
        />

        <EnemFilterSelect
          id="enem-difficulty"
          label="Dificuldade"
          value={filters.difficulty ?? ""}
          options={difficultyOptions}
          disabled={filtersLocked}
          onChange={(value) =>
            onFiltersChange({
              difficulty: value as EnemQuestionFilters["difficulty"],
            })
          }
        />

        {!hideAnsweredFilter && (
          <EnemFilterSelect
            id="enem-answered"
            label="Situação"
            value={filters.answered ?? "all"}
            options={answeredOptions}
            disabled={filtersLocked}
            onChange={(value) =>
              onFiltersChange({
                answered: value as EnemQuestionFilters["answered"],
              })
            }
          />
        )}

        {!hideAnsweredFilter && (
          <EnemFilterNumberInput
            ref={pageSizeInputRef}
            id="enem-page-size"
            label="Questões por página"
            value={pageSize}
            disabled={filtersLocked}
            hint={`Informe de ${MIN_QUESTIONS_PAGE_SIZE} a ${MAX_QUESTIONS_PAGE_SIZE} questões.`}
            onChange={onPageSizeChange}
          />
        )}
      </div>

      <EnemFilterToggle
        id="enem-shuffle"
        label="Ordenação aleatória"
        description={
          hideAnsweredFilter
            ? "Embaralha suas questões favoritas."
            : "Embaralha a lista após aplicar os filtros."
        }
        checked={filters.shuffle !== false}
        disabled={filtersLocked}
        onChange={(checked) => onFiltersChange({ shuffle: checked })}
      />

      <Button
        type="button"
        className="min-h-11 w-full gap-2"
        disabled={applyDisabled || filtersLocked}
        onClick={handleApplyClick}
        aria-busy={isApplying}
      >
        {isApplying ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Carregando questões...
          </>
        ) : (
          "Aplicar filtros"
        )}
      </Button>
    </section>
  );
}
