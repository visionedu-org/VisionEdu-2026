"use client";

import {
  ENEM_DIFFICULTY_LABELS,
  ENEM_DISCIPLINE_LABELS,
} from "@/lib/enem/constants";
import type { EnemExam, EnemQuestionFilters } from "@/types/enem";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnemFilterSelect } from "./enem-filter-select";

interface EnemQuestionFiltersProps {
  exams: EnemExam[];
  filters: EnemQuestionFilters;
  displayYear: number;
  disabled?: boolean;
  onFiltersChange: (patch: Partial<EnemQuestionFilters>) => void;
  onApply: () => void;
  isApplying?: boolean;
  applyDisabled?: boolean;
}

const ALL_OPTION = { value: "", label: "Todas" };

export function EnemQuestionFiltersPanel({
  exams,
  filters,
  displayYear,
  disabled,
  onFiltersChange,
  onApply,
  isApplying,
  applyDisabled,
}: EnemQuestionFiltersProps) {
  const filtersLocked = disabled || isApplying;

  const yearOptions = exams.map((exam) => ({
    value: String(exam.year),
    label: exam.title,
  }));

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
          value={String(displayYear)}
          options={yearOptions}
          disabled={filtersLocked}
          onChange={(value) => onFiltersChange({ year: Number(value) })}
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
      </div>

      <Button
        type="button"
        className="min-h-11 w-full gap-2"
        disabled={applyDisabled || filtersLocked}
        onClick={onApply}
        aria-busy={isApplying}
      >
        {isApplying ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Carregando questões...
          </>
        ) : (
          "Aplicar Filtros"
        )}
      </Button>
    </section>
  );
}
