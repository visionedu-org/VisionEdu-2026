import { beforeEach, describe, expect, it, vi } from "vitest";
import { studentService } from "@/services/student.service";
import {
  DEMO_ACTIVITY_ID,
  demoLearningPathModules,
} from "@/mocks/data/student-fixtures";
import { saveDraft, loadDraft, clearDraft } from "@/lib/activity-draft";

describe("student MSW flows", () => {
  it("getDashboard returns score and activities", async () => {
    const dash = await studentService.getDashboard();
    expect(dash.schoolName).toContain("CETI");
    expect(dash.averageScore).toBeGreaterThan(0);
    expect(dash.activitiesTotal).toBeGreaterThanOrEqual(dash.activitiesCompleted);
  });

  it("getLearningPath has three distinct statuses", async () => {
    const { modules } = await studentService.getLearningPath();
    const statuses = new Set(modules.map((m) => m.status));
    expect(statuses.has("locked")).toBe(true);
    expect(statuses.has("in_progress")).toBe(true);
    expect(statuses.has("completed")).toBe(true);
    expect(modules.length).toBeGreaterThanOrEqual(3);
  });

  it("getActivity returns five questions for demo id", async () => {
    const activity = await studentService.getActivity(DEMO_ACTIVITY_ID);
    expect(activity.questions).toHaveLength(5);
    expect(activity.title.length).toBeGreaterThan(0);
  });

  it("submitActivity returns completed score and gamification fields", async () => {
    const result = await studentService.submitActivity(DEMO_ACTIVITY_ID, []);
    expect(result.status).toBe("completed");
    expect(result.score).toBeGreaterThan(0);
    expect(result.xpEarned).toBeGreaterThan(0);
    expect(result.badgesUnlocked).toBeDefined();
  });
});

describe("activity draft localStorage", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    });
  });

  it("roundtrips draft for demo activity", () => {
    const id = DEMO_ACTIVITY_ID;
    saveDraft(id, {
      answers: [{ questionId: "q1", optionId: "a" }],
      currentIndex: 2,
      updatedAt: new Date().toISOString(),
    });
    expect(loadDraft(id)?.currentIndex).toBe(2);
    clearDraft(id);
    expect(loadDraft(id)).toBeNull();
  });
});

// Ensure fixture has expected module count for timeline UAT
describe("demo fixtures", () => {
  it("learning path modules include in_progress module", () => {
    expect(
      demoLearningPathModules.some((m) => m.status === "in_progress")
    ).toBe(true);
  });
});
