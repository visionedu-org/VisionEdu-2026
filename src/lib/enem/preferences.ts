import {
  clampQuestionsPageSize,
  DEFAULT_QUESTIONS_PAGE_SIZE,
} from "@/lib/enem/constants";

const PREFERENCES_KEY = "visionedu:enem-preferences";

export interface EnemUserPreferences {
  pageSize: number;
  shuffle: boolean;
  version: 1;
}

const DEFAULT_PREFERENCES: EnemUserPreferences = {
  version: 1,
  pageSize: DEFAULT_QUESTIONS_PAGE_SIZE,
  shuffle: true,
};

export function getEnemPreferences(): EnemUserPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as EnemUserPreferences;
    if (parsed.version !== 1) return { ...DEFAULT_PREFERENCES };
    return {
      version: 1,
      pageSize: clampQuestionsPageSize(
        parsed.pageSize ?? DEFAULT_PREFERENCES.pageSize
      ),
      shuffle: parsed.shuffle !== undefined ? Boolean(parsed.shuffle) : true,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function saveEnemPreferences(
  patch: Partial<Pick<EnemUserPreferences, "pageSize" | "shuffle">>
): EnemUserPreferences {
  const next = { ...getEnemPreferences(), ...patch };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    } catch {
      /* quota */
    }
  }
  return next;
}
