"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EnemFilterToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function EnemFilterToggle({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: EnemFilterToggleProps) {
  return (
    <div className="flex min-h-11 items-start gap-3 rounded-lg border border-input bg-background px-3 py-2.5">
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="space-y-0.5">
        <Label htmlFor={id} className="cursor-pointer font-medium">
          {label}
        </Label>
        {description && (
          <p className={cn("text-xs text-muted-foreground")}>{description}</p>
        )}
      </div>
    </div>
  );
}
