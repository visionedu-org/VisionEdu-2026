"use client";

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clampQuestionsPageSize,
  MAX_QUESTIONS_PAGE_SIZE,
  MIN_QUESTIONS_PAGE_SIZE,
} from "@/lib/enem/constants";

interface EnemFilterNumberInputProps {
  id: string;
  label: string;
  value: number;
  disabled?: boolean;
  hint?: string;
  onChange: (value: number) => void;
}

export type EnemFilterNumberInputHandle = {
  commit: () => number;
};

export const EnemFilterNumberInput = forwardRef<
  EnemFilterNumberInputHandle,
  EnemFilterNumberInputProps
>(function EnemFilterNumberInput(
  { id, label, value, disabled, hint, onChange },
  ref
) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = useCallback(
    (raw: string) => {
      const parsed = Number.parseInt(raw, 10);
      onChange(clampQuestionsPageSize(parsed));
    },
    [onChange]
  );

  useImperativeHandle(
    ref,
    () => ({
      commit: () => {
        const parsed = Number.parseInt(draft, 10);
        const clamped = clampQuestionsPageSize(parsed);
        onChange(clamped);
        setDraft(String(clamped));
        return clamped;
      },
    }),
    [draft, onChange]
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={MIN_QUESTIONS_PAGE_SIZE}
        max={MAX_QUESTIONS_PAGE_SIZE}
        step={1}
        className="min-h-11 text-sm"
        value={draft}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commitDraft(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitDraft(draft);
          }
        }}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
});
