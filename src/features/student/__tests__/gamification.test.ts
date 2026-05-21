import { describe, expect, it } from "vitest";
import { studentService } from "@/services/student.service";
import { DEMO_ACTIVITY_ID } from "@/mocks/data/student-fixtures";

describe("gamification MSW", () => {
  it("profile returns xp, level and at least 3 badges", async () => {
    const profile = await studentService.getProfile();
    expect(profile.xp).toBeGreaterThanOrEqual(120);
    expect(profile.level).toBeGreaterThanOrEqual(2);
    expect(profile.badges.length).toBeGreaterThanOrEqual(3);
  });

  it("submit returns xp fields and unlocks first_activity", async () => {
    const result = await studentService.submitActivity(DEMO_ACTIVITY_ID, []);
    expect(result.xpEarned).toBeGreaterThan(0);
    expect(result.totalXp).toBeGreaterThan(120);
    expect(result.level).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(result.badgesUnlocked)).toBe(true);
    expect(result.badgesUnlocked).toContain("first_activity");
    expect(result.badgesUnlocked).toContain("path_starter");
  });

  it("submit with all answers unlocks high_score", async () => {
    const activity = await studentService.getActivity(DEMO_ACTIVITY_ID);
    const answers = activity.questions.map((q) => ({
      questionId: q.id,
      optionId: q.options[0].id,
    }));
    const result = await studentService.submitActivity(DEMO_ACTIVITY_ID, answers);
    expect(result.score).toBeGreaterThanOrEqual(9);
    expect(result.badgesUnlocked).toContain("high_score");
  });
});
