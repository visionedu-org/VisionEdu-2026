import { z } from "zod";
import { pilotClasses } from "@/mocks/data/ceti-seed";

const uuidSchema = z.string().uuid();

/** Resolve slug `grade-section` ou UUID de turma para `ClassGroup.id`. */
export function resolveClassIdParam(param: string): string | null {
  const trimmed = param.trim();
  if (!trimmed) return null;

  if (uuidSchema.safeParse(trimmed).success) {
    return trimmed;
  }

  const match = pilotClasses.find(
    (c) => `${c.grade}-${c.class_identifier}` === trimmed
  );
  return match?.id ?? null;
}
