import type { ActivityAnswer, ActivitySubmitResult, BadgeId, StudentProfile } from "@/types/domain";
import { BADGE_CATALOG } from "@/mocks/data/student-gamification";
import { demoLearningPathModules } from "@/mocks/data/student-fixtures";

const ALL_BADGE_IDS = Object.keys(BADGE_CATALOG) as BadgeId[];

let totalXp = 120;
let hasSubmittedActivity = false;
const unlockedBadgeIds = new Set<BadgeId>();

function computeLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

function xpToNextLevel(xp: number, level: number): number {
  return level * 100 - xp;
}

function buildProfile(): StudentProfile {
  const level = computeLevel(totalXp);
  return {
    xp: totalXp,
    level,
    xpToNextLevel: xpToNextLevel(totalXp, level),
    badges: ALL_BADGE_IDS.map((id) => ({
      id,
      unlockedAt: unlockedBadgeIds.has(id) ? new Date().toISOString() : null,
    })),
  };
}

function evaluateBadges(activityId: string, score: number): BadgeId[] {
  const newlyUnlocked: BadgeId[] = [];

  if (!hasSubmittedActivity) {
    hasSubmittedActivity = true;
    if (!unlockedBadgeIds.has("first_activity")) {
      unlockedBadgeIds.add("first_activity");
      newlyUnlocked.push("first_activity");
    }
  }

  if (score >= 9 && !unlockedBadgeIds.has("high_score")) {
    unlockedBadgeIds.add("high_score");
    newlyUnlocked.push("high_score");
  }

  const inProgressModule = demoLearningPathModules.find(
    (m) => m.status === "in_progress" && m.activityId === activityId
  );
  if (inProgressModule && !unlockedBadgeIds.has("path_starter")) {
    unlockedBadgeIds.add("path_starter");
    newlyUnlocked.push("path_starter");
  }

  return newlyUnlocked;
}

function computeScore(answers: ActivityAnswer[]): number {
  if (answers.length === 0) return 8.5;
  return Math.min(10, 6 + answers.length * 0.8);
}

export function getProfile(): StudentProfile {
  return buildProfile();
}

export function applyActivityCompletion(
  activityId: string,
  answers: ActivityAnswer[]
): ActivitySubmitResult {
  const score = computeScore(answers);
  const xpEarned = Math.round(score * 10);
  const previousLevel = computeLevel(totalXp);
  totalXp += xpEarned;
  const level = computeLevel(totalXp);
  const badgesUnlocked = evaluateBadges(activityId, score);

  return {
    score,
    status: "completed",
    xpEarned,
    totalXp,
    level,
    levelUp: level > previousLevel,
    badgesUnlocked,
  };
}

export function resetGamificationMemory(): void {
  totalXp = 120;
  hasSubmittedActivity = false;
  unlockedBadgeIds.clear();
}

/** Test helper: pre-unlock badges without submit */
export function seedUnlockedBadge(id: BadgeId): void {
  unlockedBadgeIds.add(id);
}
