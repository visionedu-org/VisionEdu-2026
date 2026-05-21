import type { ActivityDraft } from "@/types/domain";

const PREFIX = "visionedu:activity:";

function storageKey(activityId: string) {
  return `${PREFIX}${activityId}`;
}

export function saveDraft(activityId: string, data: ActivityDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(activityId), JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

export function loadDraft(activityId: string): ActivityDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(activityId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActivityDraft;
    if (
      !Array.isArray(parsed.answers) ||
      typeof parsed.currentIndex !== "number" ||
      typeof parsed.updatedAt !== "string"
    ) {
      clearDraft(activityId);
      return null;
    }
    return parsed;
  } catch {
    clearDraft(activityId);
    return null;
  }
}

export function clearDraft(activityId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(activityId));
}
