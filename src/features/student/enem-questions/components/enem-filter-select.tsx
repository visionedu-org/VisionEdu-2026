"use client";

import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface EnemFilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SELECT_CLASS =
  "flex min-h-11 w-full cursor-pointer appearance-none rounded-lg border border-input bg-background py-2 pl-3 pr-10 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export function EnemFilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
}: EnemFilterSelectProps) {
  const hasEmptyOption = options.some((o) => o.value === "");
  const safeValue = options.some((o) => o.value === value)
    ? value
    : (options[0]?.value ?? "");

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <select
          id={id}
          className={SELECT_CLASS}
          value={safeValue}
          disabled={disabled || options.length === 0}
          onChange={(e) => onChange(e.target.value)}
        >
          {!hasEmptyOption && placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value || "__all__"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground",
            disabled && "opacity-50"
          )}
          aria-hidden
        />
      </div>
    </div>
  );
}
