"use client";

import type { UserRole } from "@/types/domain";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">
        Tipo de acesso
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { id: "student" as const, label: "Aluno" },
            { id: "teacher" as const, label: "Professor" },
          ] as const
        ).map((option) => (
          <label
            key={option.id}
            className={cn(
              "flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
              value === option.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:bg-muted"
            )}
          >
            <input
              type="radio"
              name="role"
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
