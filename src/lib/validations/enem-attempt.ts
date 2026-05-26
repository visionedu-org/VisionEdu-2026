import { z } from "zod";

const letterSchema = z.enum(["A", "B", "C", "D", "E"]);

export const enemAttemptRequestSchema = z.object({
  year: z.number().int().min(2009).max(2100),
  index: z.number().int().min(1),
  language: z.string().nullable().optional(),
  selectedLetter: letterSchema,
});

export const learningPathStepSubmitSchema = z.object({
  selectedLetter: letterSchema,
});
