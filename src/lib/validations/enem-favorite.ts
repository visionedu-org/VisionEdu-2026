import { z } from "zod";

export const enemFavoriteToggleSchema = z.object({
  year: z.number().int().min(2009).max(2100),
  index: z.number().int().min(1),
  language: z.string().nullable().optional(),
});

export const enemFavoritesSyncSchema = z.object({
  questionKeys: z.array(z.string().min(1)).max(500),
});
