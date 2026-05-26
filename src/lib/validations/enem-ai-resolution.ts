import { z } from "zod";

const enemLetterSchema = z.enum(["A", "B", "C", "D", "E"]);

export const enemAiResolutionRequestSchema = z.object({
  year: z.number().int().min(2009).max(2100),
  index: z.number().int().min(1),
  language: z.string().trim().min(1).nullish(),
  selectedLetter: enemLetterSchema,
});
