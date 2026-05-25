export interface ParsedQuestionKey {
  year: number;
  index: number;
  language?: string;
}

export function parseQuestionKey(key: string): ParsedQuestionKey | null {
  const parts = key.split(":");
  if (parts.length < 2) return null;

  const year = Number(parts[0]);
  const index = Number(parts[1]);
  if (!Number.isFinite(year) || !Number.isFinite(index)) return null;

  const langPart = parts[2];
  const language =
    langPart && langPart !== "default" ? langPart : undefined;

  return { year, index, language };
}
