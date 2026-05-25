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
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1">
        {(
          [
            { id: "student" as const, label: "Aluno" },
            { id: "teacher" as const, label: "Professor" },
          ] as const
        ).map((option) => (
          <label
            key={option.id}
            className={cn(
              "flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold fluent-transition",
              value === option.id
                ? "bg-card text-primary shadow-fluent-sm"
                : "text-muted-foreground hover:text-foreground"
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
